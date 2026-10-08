import crypto from 'crypto';
import { put, list, del } from '@vercel/blob';
import { handleUpload } from '@vercel/blob/client';

/**
 * Vercel Serverless Function : /api/dataroom
 *
 * Stockage CLOUD partagé de la Data Room (Vercel Blob) :
 *  - Les fichiers (PDF, XLSX...) sont stockés dans le store Vercel Blob « enr-dataroom ».
 *  - La liste des documents (manifeste) est stockée dans ce même store sous forme de JSON versionné.
 *  => Tous les utilisateurs, quel que soit leur poste ou leur connexion, voient les mêmes documents.
 *
 * Seul l'administrateur (jeton signé HMAC obtenu avec ses identifiants) peut AJOUTER ou SUPPRIMER.
 *
 *  GET  /api/dataroom                      -> manifeste courant (lecture pour tous)
 *  POST /api/dataroom?action=auth          -> { email, password } => { token } (admin uniquement)
 *  POST /api/dataroom?action=upload        -> protocole d'upload client @vercel/blob (admin uniquement)
 *  POST /api/dataroom?action=save          -> { token, baseVersion, data } enregistre le manifeste (admin)
 *  POST /api/dataroom?action=delete-files  -> { token, urls } supprime des fichiers (admin)
 */

const ADMIN_EMAIL = 'y.barberis@enr-courtage.fr';
const ADMIN_PASSWORDS = [
  'Invest@enr!01', 'invest@enr!01',
  'Invest@enr01', 'invest@enr01',
  'Invest@enr!1', 'invest@enr!1',
  'Enr2026!admin', 'admin2026', 'HELIOS2026',
];
const MANIFEST_PREFIX = 'dataroom/_manifest/';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 jours
const MANIFEST_BACKUPS_TO_KEEP = 20; // historique conservé (sécurité anti-perte)

function getSecret() {
  return process.env.DATAROOM_ADMIN_SECRET || process.env.BLOB_READ_WRITE_TOKEN || 'enr-dataroom-fallback-secret';
}

function signToken(expiresAt) {
  const sig = crypto.createHmac('sha256', getSecret()).update(`admin:${ADMIN_EMAIL}:${expiresAt}`).digest('hex');
  return `${expiresAt}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [expStr, sig] = token.split('.');
  const exp = Number(expStr);
  if (!exp || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = signToken(exp).split('.')[1];
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body); } catch { return {}; }
    }
    return req.body;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

/** Liste toutes les versions du manifeste, de la plus récente à la plus ancienne */
async function listManifestVersions() {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: MANIFEST_PREFIX, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return blobs
    .map((b) => {
      const m = b.pathname.match(/v(\d+)-/);
      return { ...b, version: m ? Number(m[1]) : 0 };
    })
    .sort((a, b) => b.version - a.version || new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

async function readCurrentManifest() {
  const versions = await listManifestVersions();
  if (versions.length === 0) return { manifest: null, versions };
  // URL unique par version => jamais de cache obsolète
  const resp = await fetch(`${versions[0].url}?v=${versions[0].version}`, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`Lecture manifeste impossible (${resp.status})`);
  const manifest = await resp.json();
  return { manifest, versions };
}

function sanitizeData(data = {}) {
  const stripBinary = (cats) => {
    const out = {};
    Object.entries(cats || {}).forEach(([cat, files]) => {
      out[cat] = (Array.isArray(files) ? files : []).map((f) => {
        // eslint-disable-next-line no-unused-vars
        const { fileData, rawFile, site, ...rest } = f || {};
        return rest;
      });
    });
    return out;
  };
  const customDataRoom = {};
  Object.entries(data.customDataRoom || {}).forEach(([pId, cats]) => {
    customDataRoom[pId] = stripBinary(cats);
  });
  return {
    customDataRoom,
    deletedDefaultDocs: data.deletedDefaultDocs || {},
    documentSiteAssignments: data.documentSiteAssignments || {},
  };
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'Stockage cloud Data Room non configuré (BLOB_READ_WRITE_TOKEN manquant).' });
  }

  const action = String(req.query?.action || '').toLowerCase();

  try {
    // ------------------------------------------------------------------ LECTURE (tous)
    if (req.method === 'GET') {
      const { manifest } = await readCurrentManifest();
      return res.status(200).json({ success: true, exists: !!manifest, manifest: manifest || null });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Méthode non autorisée.' });
    }

    const body = await readBody(req);

    // ------------------------------------------------------------------ AUTH ADMIN
    if (action === 'auth') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '').trim();
      if (email !== ADMIN_EMAIL || !ADMIN_PASSWORDS.includes(password)) {
        return res.status(401).json({ error: 'Identifiants administrateur invalides.' });
      }
      const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
      return res.status(200).json({ success: true, token: signToken(expiresAt), expiresAt });
    }

    // ------------------------------------------------------------------ UPLOAD CLIENT (admin)
    if (action === 'upload') {
      const jsonResponse = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          let payload = {};
          try { payload = JSON.parse(clientPayload || '{}'); } catch { payload = {}; }
          if (!verifyToken(payload.token)) {
            throw new Error('Action réservée à l\'administrateur.');
          }
          if (!pathname.startsWith('dataroom/') || pathname.startsWith(MANIFEST_PREFIX)) {
            throw new Error('Chemin de stockage invalide.');
          }
          return {
            addRandomSuffix: true,
            maximumSizeInBytes: 500 * 1024 * 1024,
            tokenPayload: JSON.stringify({ pathname }),
          };
        },
        onUploadCompleted: async () => {
          // Le manifeste est enregistré explicitement par l'administrateur (action=save)
        },
      });
      return res.status(200).json(jsonResponse);
    }

    // Toutes les actions suivantes nécessitent le jeton administrateur
    if (!verifyToken(body.token)) {
      return res.status(401).json({ error: 'Action réservée à l\'administrateur (jeton invalide ou expiré).', authRequired: true });
    }

    // ------------------------------------------------------------------ ENREGISTREMENT MANIFESTE (admin)
    if (action === 'save') {
      const { manifest, versions } = await readCurrentManifest();
      const currentVersion = manifest?.version || 0;
      const baseVersion = Number(body.baseVersion || 0);

      if (baseVersion !== currentVersion) {
        return res.status(409).json({
          error: 'La Data Room a été modifiée depuis un autre poste. Rechargement nécessaire.',
          conflict: true,
          manifest,
        });
      }

      const nextVersion = currentVersion + 1;
      const nextManifest = {
        version: nextVersion,
        updatedAt: new Date().toISOString(),
        updatedBy: ADMIN_EMAIL,
        ...sanitizeData(body.data || {}),
      };

      const padded = String(nextVersion).padStart(8, '0');
      await put(`${MANIFEST_PREFIX}v${padded}-${Date.now()}.json`, JSON.stringify(nextManifest), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: true,
        cacheControlMaxAge: 60,
      });

      // Nettoyage des anciennes versions (on conserve un historique de sécurité)
      const stale = versions.slice(MANIFEST_BACKUPS_TO_KEEP - 1).map((b) => b.url);
      if (stale.length > 0) {
        try { await del(stale); } catch (e) { console.warn('Nettoyage versions manifeste:', e); }
      }

      return res.status(200).json({ success: true, manifest: nextManifest });
    }

    // ------------------------------------------------------------------ SUPPRESSION FICHIERS (admin)
    if (action === 'delete-files') {
      const urls = (Array.isArray(body.urls) ? body.urls : [])
        .filter((u) => typeof u === 'string' && u.includes('.blob.vercel-storage.com/') && !u.includes(MANIFEST_PREFIX));
      if (urls.length > 0) await del(urls);
      return res.status(200).json({ success: true, deleted: urls.length });
    }

    return res.status(400).json({ error: 'Action inconnue.' });
  } catch (error) {
    console.error('Erreur API Data Room:', error);
    return res.status(500).json({ error: error?.message || 'Erreur interne Data Room.' });
  }
}
