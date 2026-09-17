/**
 * Service de stockage binaire persistant des documents (PDF, etc.) dans IndexedDB
 * Permet de stocker de gros fichiers PDF dans le navigateur sans saturer localStorage (limité à 5 Mo).
 */

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

/**
 * Enregistrer un fichier binaire (File ou Blob) avec son identifiant
 */
export async function storeDocumentBinary(id, fileOrBlob, fileName = '', mimeType = 'application/pdf') {
  if (!id || !fileOrBlob) return false;

  try {
    const db = await openDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record = {
        id: String(id),
        blob: fileOrBlob,
        fileName: fileName || fileOrBlob.name || 'document.pdf',
        mimeType: mimeType || fileOrBlob.type || 'application/pdf',
        size: fileOrBlob.size || 0,
        savedAt: new Date().toISOString(),
      };

      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.warn('Erreur écriture IndexedDB:', req.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('Erreur storeDocumentBinary:', err);
    return false;
  }
}

/**
 * Récupérer un fichier binaire depuis IndexedDB par son identifiant ou son nom
 */
export async function getDocumentBinary(idOrName) {
  if (!idOrName) return null;

  try {
    const db = await openDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      // Essayer d'abord par clé ID
      const req = store.get(String(idOrName));

      req.onsuccess = () => {
        if (req.result) {
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
 * Supprimer un fichier binaire d'IndexedDB
 */
export async function deleteDocumentBinary(id) {
  if (!id) return false;

  try {
    const db = await openDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(String(id));
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}
