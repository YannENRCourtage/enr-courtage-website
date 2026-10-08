import { put, list, del } from '@vercel/blob';

/**
 * Vercel Serverless Function : /api/investisseurs/credentials
 *
 * Synchronisation CLOUD des mots de passe des investisseurs (Vercel Blob).
 * Permet à tout utilisateur de réinitialiser son mot de passe ou à l'administrateur
 * de modifier un mot de passe, et garantit que le mot de passe est immédiatement
 * effectif sur TOUS les supports (PC local, mobile, extérieur, production).
 *
 * GET  /api/investisseurs/credentials
 *      -> Retourne la table des mots de passe personnalisés { [email]: password }
 *
 * POST /api/investisseurs/credentials
 *      -> { action: 'reset-password' | 'update-password', email, newPassword, investorName, companyName, userAgent }
 *      -> Enregistre le nouveau mot de passe dans le Blob Cloud
 *      -> Notifie automatiquement l'administrateur via Formspree (email de contact)
 */

const CREDENTIALS_PREFIX = 'auth/_credentials/';
const BACKUPS_TO_KEEP = 15;
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mrblwazb';

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

async function listCredentialVersions() {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: CREDENTIALS_PREFIX, cursor, limit: 1000 });
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

async function readCurrentCredentials() {
  const versions = await listCredentialVersions();
  if (versions.length === 0) return { credentials: { passwords: {}, history: [] }, versions };
  const resp = await fetch(`${versions[0].url}?v=${versions[0].version}`, { cache: 'no-store' });
  if (!resp.ok) {
    return { credentials: { passwords: {}, history: [] }, versions };
  }
  const credentials = await resp.json();
  return { credentials, versions };
}

async function notifyAdminViaFormspree({ email, newPassword, investorName, companyName, clientIp, userAgent, action }) {
  try {
    const isReset = action === 'reset-password';
    await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: `[${isReset ? 'RÉINITIALISATION' : 'MODIFICATION'} MOT DE PASSE] ${investorName || email} (${companyName || 'Investisseur M&A'})`,
        type: isReset ? 'Réinitialisation autonome par l\'utilisateur' : 'Modification de mot de passe',
        investisseur: investorName || 'Investisseur',
        societe: companyName || 'Non spécifié',
        email: email,
        nouveauMotDePasse: newPassword,
        dateHeure: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) + ' (Paris)',
        adresseIp: clientIp || 'Non identifiée',
        appareilUserAgent: userAgent || 'Non communiqué',
      }),
    });
  } catch (err) {
    console.warn('Notification Formspree admin impossible:', err);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Fallback si Vercel Blob n'est pas configuré
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    if (req.method === 'GET') {
      return res.status(200).json({ success: true, passwords: {}, offline: true });
    }
  }

  try {
    // ------------------------------------------------------------------ LECTURE
    if (req.method === 'GET') {
      const { credentials } = await readCurrentCredentials();
      return res.status(200).json({
        success: true,
        passwords: credentials?.passwords || {},
        updatedAt: credentials?.updatedAt || null,
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Méthode non autorisée. Utilisez GET ou POST.' });
    }

    const body = await readBody(req);
    const action = String(body.action || 'reset-password').toLowerCase();
    const cleanEmail = String(body.email || '').trim().toLowerCase();
    const newPassword = String(body.newPassword || '').trim();
    const investorName = String(body.investorName || '').trim();
    const companyName = String(body.companyName || '').trim();
    const userAgent = String(body.userAgent || req.headers['user-agent'] || '');
    const clientIp = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '');

    if (!cleanEmail) {
      return res.status(400).json({ error: 'Adresse e-mail requise.' });
    }

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit comporter au moins 4 caractères.' });
    }

    let nextManifest = { passwords: { [cleanEmail]: newPassword } };

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { credentials, versions } = await readCurrentCredentials();
      const currentVersion = credentials?.version || 0;
      const nextVersion = currentVersion + 1;

      const currentPasswords = credentials?.passwords || {};
      const updatedPasswords = {
        ...currentPasswords,
        [cleanEmail]: newPassword,
      };

      const updatedHistory = [
        {
          email: cleanEmail,
          updatedAt: new Date().toISOString(),
          action,
          investorName,
          companyName,
          clientIp,
          userAgent,
        },
        ...(credentials?.history || []),
      ].slice(0, 100);

      nextManifest = {
        version: nextVersion,
        updatedAt: new Date().toISOString(),
        passwords: updatedPasswords,
        history: updatedHistory,
      };

      const padded = String(nextVersion).padStart(8, '0');
      await put(`${CREDENTIALS_PREFIX}v${padded}-${Date.now()}.json`, JSON.stringify(nextManifest), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: true,
        cacheControlMaxAge: 10,
      });

      // Nettoyer anciennes versions
      const stale = versions.slice(BACKUPS_TO_KEEP - 1).map((b) => b.url);
      if (stale.length > 0) {
        try { await del(stale); } catch (e) { console.warn('Nettoyage versions credentials:', e); }
      }
    }

    // Notification administrateur via Formspree
    await notifyAdminViaFormspree({
      email: cleanEmail,
      newPassword,
      investorName,
      companyName,
      clientIp,
      userAgent,
      action,
    });

    return res.status(200).json({
      success: true,
      email: cleanEmail,
      message: 'Mot de passe mis à jour avec succès et administrateur notifié.',
      passwords: nextManifest.passwords,
    });
  } catch (error) {
    console.error('Erreur API credentials:', error);
    return res.status(500).json({ error: error?.message || 'Erreur lors de la mise à jour des identifiants.' });
  }
}
