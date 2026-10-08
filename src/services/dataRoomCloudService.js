/**
 * Service CLOUD de la Data Room (Vercel Blob via /api/dataroom).
 *
 * Remplace le stockage local (IndexedDB / localStorage) qui rendait les documents
 * visibles uniquement sur le poste de l'administrateur.
 * Désormais : fichiers + liste des documents sont partagés pour TOUS les utilisateurs.
 */
import { upload } from '@vercel/blob/client';

const API_URL = '/api/dataroom';
const TOKEN_KEY = 'enr_dataroom_admin_token';

// ----------------------------------------------------------------------------- Jeton administrateur
export function getAdminToken() {
  try {
    const raw = window.localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const { token, expiresAt } = JSON.parse(raw);
    if (!token || !expiresAt || expiresAt * 1000 < Date.now() + 60 * 1000) return null;
    return token;
  } catch {
    return null;
  }
}

export function clearAdminToken() {
  try { window.localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

/**
 * Retourne un jeton admin valide ; si absent, demande le mot de passe administrateur
 * via la fenêtre de confirmation globale (composant DataRoomCloudSync).
 */
export function ensureAdminToken() {
  const existing = getAdminToken();
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve, reject) => {
    const onDone = (e) => {
      window.removeEventListener('enr-dataroom-auth-done', onDone);
      const token = getAdminToken();
      if (e?.detail?.success && token) resolve(token);
      else reject(new Error('Confirmation administrateur annulée.'));
    };
    window.addEventListener('enr-dataroom-auth-done', onDone);
    window.dispatchEvent(new CustomEvent('enr-dataroom-auth-request'));
  });
}

export async function authenticateAdmin(email, password) {
  const resp = await fetch(`${API_URL}?action=auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok || !json.token) {
    throw new Error(json.error || 'Authentification administrateur refusée.');
  }
  try {
    window.localStorage.setItem(TOKEN_KEY, JSON.stringify({ token: json.token, expiresAt: json.expiresAt }));
  } catch { /* ignore */ }
  return json.token;
}

// ----------------------------------------------------------------------------- Manifeste partagé
export async function fetchCloudManifest() {
  const resp = await fetch(`${API_URL}?t=${Date.now()}`, { cache: 'no-store' });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(json.error || `Erreur chargement Data Room (${resp.status})`);
  return json.exists ? json.manifest : null;
}

export async function saveCloudManifest(data, baseVersion) {
  const token = getAdminToken();
  if (!token) {
    const err = new Error('Jeton administrateur requis.');
    err.authRequired = true;
    throw err;
  }
  const resp = await fetch(`${API_URL}?action=save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, baseVersion: baseVersion || 0, data }),
  });
  const json = await resp.json().catch(() => ({}));
  if (resp.status === 401) {
    clearAdminToken();
    const err = new Error(json.error || 'Jeton administrateur expiré.');
    err.authRequired = true;
    throw err;
  }
  if (resp.status === 409) {
    const err = new Error(json.error || 'Conflit de version.');
    err.conflict = true;
    err.manifest = json.manifest;
    throw err;
  }
  if (!resp.ok) throw new Error(json.error || 'Erreur enregistrement Data Room.');
  return json.manifest;
}

export async function deleteCloudFiles(urls = []) {
  const clean = urls.filter((u) => typeof u === 'string' && u.includes('.blob.vercel-storage.com/'));
  if (clean.length === 0) return true;
  const token = getAdminToken();
  if (!token) return false;
  try {
    const resp = await fetch(`${API_URL}?action=delete-files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, urls: clean }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------------- Upload fichiers
function sanitizeSegment(s = '') {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120) || 'document';
}

export function isCloudUrl(url) {
  return typeof url === 'string' && url.includes('.blob.vercel-storage.com/');
}

/**
 * Téléverse un fichier dans le stockage cloud Data Room (admin uniquement).
 * @returns {Promise<{ url: string, pathname: string, contentType: string }>}
 */
export async function uploadFileToCloud(fileOrBlob, { portfolioId = 'helios', category = 'General', fileName = '', onProgress = null } = {}) {
  const token = getAdminToken();
  if (!token) {
    const err = new Error('Jeton administrateur requis pour téléverser.');
    err.authRequired = true;
    throw err;
  }
  const name = sanitizeSegment(fileName || fileOrBlob?.name || 'document.pdf');
  const pathname = `dataroom/${sanitizeSegment(portfolioId)}/${sanitizeSegment(category)}/${name}`;
  const size = fileOrBlob?.size || 0;

  const result = await upload(pathname, fileOrBlob, {
    access: 'public',
    handleUploadUrl: `${API_URL}?action=upload`,
    clientPayload: JSON.stringify({ token }),
    contentType: fileOrBlob?.type || undefined,
    multipart: size > 8 * 1024 * 1024,
    onUploadProgress: typeof onProgress === 'function' ? (e) => onProgress(e.percentage) : undefined,
  });
  return result;
}
