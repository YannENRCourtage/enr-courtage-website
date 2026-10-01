/**
 * Service de stockage binaire persistant des documents (PDF, etc.) dans IndexedDB
 * Permet de stocker de gros fichiers PDF dans le navigateur sans saturer localStorage (limité à 5 Mo).
 */

/**
 * Demander la persistance du stockage au navigateur et maximiser le quota
 * (Passe le quota de 5 Mo localStorage à plusieurs Gigaoctets sur IndexedDB)
 */
export async function ensurePersistentStorage() {
  if (typeof window === 'undefined' || !navigator?.storage) return null;
  try {
    if (navigator.storage.persist) {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        await navigator.storage.persist();
      }
    }
    if (navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return estimate;
    }
  } catch (err) {
    console.warn('Quota persistence request:', err);
  }
  return null;
}

// Auto-activer la persistance et l'extension du quota en environnement navigateur
if (typeof window !== 'undefined') {
  ensurePersistentStorage().catch(() => {});
}

const DB_NAME = 'enr_courtage_dataroom_db';
const STORE_NAME = 'documents';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('Impossible d\'ouvrir IndexedDB:', request.error);
      resolve(null);
    };
  });
}

// Cache mémoire en session pour accès instantané sans attendre les I/O IndexedDB
const memoryCache = typeof window !== 'undefined' ? (window.__ENR_BINARY_CACHE = window.__ENR_BINARY_CACHE || new Map()) : new Map();

/**
 * Enregistrer un fichier binaire (File ou Blob) avec son identifiant
 */
export async function storeDocumentBinary(id, fileOrBlob, fileName = '', mimeType = 'application/pdf') {
  if (!id || !fileOrBlob) return false;

  try {
    // 1. Détacher le Blob du pointeur input pour éviter la perte de référence à la fermeture du modal
    let safeBlob = fileOrBlob;
    if (fileOrBlob && typeof fileOrBlob.arrayBuffer === 'function') {
      try {
        const buffer = await fileOrBlob.arrayBuffer();
        safeBlob = new Blob([buffer], { type: mimeType || fileOrBlob.type || 'application/pdf' });
      } catch (errBuffer) {
        safeBlob = fileOrBlob;
      }
    }

    const resolvedName = fileName || fileOrBlob.name || 'document.pdf';
    const resolvedMime = mimeType || fileOrBlob.type || 'application/pdf';
    const resolvedSize = safeBlob.size || fileOrBlob.size || 0;

    const record = {
      id: String(id),
      blob: safeBlob,
      fileName: resolvedName,
      mimeType: resolvedMime,
      size: resolvedSize,
      savedAt: new Date().toISOString(),
    };

    // 2. Mémorisation instantanée en cache mémoire
    memoryCache.set(String(id), record);
    if (resolvedName) memoryCache.set(String(resolvedName), record);

    // 3. Persistance dans IndexedDB
    const db = await openDB();
    if (!db) return true; // Accessible en mémoire même si IndexedDB est restreint

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.warn('Erreur écriture IndexedDB:', req.error);
        resolve(true); // Toujours résolu car le cache mémoire est disponible
      };
    });
  } catch (err) {
    console.warn('Erreur storeDocumentBinary:', err);
    return false;
  }
}

/**
 * Récupérer un fichier binaire depuis IndexedDB ou le cache mémoire
 */
export async function getDocumentBinary(idOrName) {
  if (!idOrName) return null;
  const key = String(idOrName);

  // 1. Vérification prioritaire du cache mémoire (instantané)
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  try {
    const db = await openDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      // Essayer d'abord par clé ID
      const req = store.get(key);

      req.onsuccess = () => {
        if (req.result) {
          memoryCache.set(key, req.result);
          if (req.result.fileName) memoryCache.set(req.result.fileName, req.result);
          resolve(req.result);
          return;
        }

        // Sinon chercher par fileName avec normalisation tolérante
        const normalizeStr = (s) => String(s || '').toLowerCase().replace(/\.pdf$/i, '').replace(/[^a-z0-9]/g, '');
        const targetNorm = normalizeStr(idOrName);

        const cursorReq = store.openCursor();
        cursorReq.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            const rowFile = cursor.value.fileName || '';
            const rowNorm = normalizeStr(rowFile);
            if (
              rowFile === idOrName ||
              rowFile.includes(idOrName) ||
              (targetNorm && (rowNorm === targetNorm || rowNorm.includes(targetNorm) || targetNorm.includes(rowNorm)))
            ) {
              memoryCache.set(key, cursor.value);
              resolve(cursor.value);
              return;
            }
            cursor.continue();
          } else {
            resolve(null);
          }
        };
        cursorReq.onerror = () => resolve(null);
      };

      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Erreur getDocumentBinary:', err);
    return null;
  }
}

/**
 * Télécharger directement un document binaire dans le navigateur
 */
export async function downloadDocumentBinary(idOrName, preferredFileName = '') {
  try {
    const record = await getDocumentBinary(idOrName);
    if (!record || !record.blob) {
      return false;
    }

    const url = URL.createObjectURL(record.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = preferredFileName || record.fileName || 'document.pdf';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);

    return true;
  } catch (err) {
    console.error('Erreur téléchargement document:', err);
    return false;
  }
}

/**
 * Supprimer un fichier binaire d'IndexedDB et du cache mémoire
 */
export async function deleteDocumentBinary(id) {
  if (!id) return false;
  const key = String(id);
  memoryCache.delete(key);

  try {
    const db = await openDB();
    if (!db) return true;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}
