import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

/**
 * Configuration officielle du projet Firebase de production : enr-courtage
 */
export const firebaseConfig = {
  apiKey:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_FIREBASE_API_KEY) ||
    'AIzaSyAo5pxvhtd8jpmxbu0s67Ja9Rsld--fuvE',
  authDomain:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) ||
    'enr-courtage.firebaseapp.com',
  projectId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_FIREBASE_PROJECT_ID) ||
    'enr-courtage',
  storageBucket:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) ||
    'enr-courtage.firebasestorage.app',
  messagingSenderId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) ||
    '255865539893',
  appId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_FIREBASE_APP_ID) ||
    '1:255865539893:web:1e7f05edf368a37477107c',
  measurementId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) ||
    'G-2T7WHF9HV4',
};

// Initialisation unique de l'application Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Instance principale Firebase Storage
export const storage = getStorage(app);

// Ré-export des méthodes clés du SDK Firebase Storage
export { ref, uploadBytesResumable, getDownloadURL, deleteObject };

/**
 * Normalise un nom de fichier pour le stockage distant (enlève les caractères accentués ou problématiques)
 */
export function sanitizeStorageFileName(name = 'document.pdf') {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');
}

/**
 * Normalise un nom de catégorie (ex: 'Juridique' -> 'juridique')
 */
export function sanitizeCategory(cat = 'general') {
  return cat
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '_');
}

/**
 * Téléversement direct et résumable d'un document confidentiel vers Firebase Storage.
 * Chemin cible dans le bucket : dataroom/{categorie}/{nom_fichier}
 *
 * @param {File|Blob} file - Le fichier natif sélectionné par l'utilisateur
 * @param {Object} options - Options de métadonnées et callbacks
 * @param {string} options.category - Catégorie Data Room (Juridique, Technique, Financier, Urbanisme, etc.)
 * @param {string} options.portfolioId - 'helios' | 'volta' | 'both'
 * @param {string} options.customFileName - Nom optionnel personnalisé pour le document
 * @param {Function} options.onProgress - Callback de progression temps réel : (percent, snapshot) => void
 * @returns {Promise<{ downloadUrl: string, storagePath: string, fullPath: string, fileName: string, fileSize: number, mimeType: string, uploadedAt: string }>}
 */
export function uploadDataRoomFileToFirebase(file, options = {}) {
  const {
    category = 'Juridique',
    portfolioId = 'helios',
    customFileName = '',
    onProgress = null,
  } = options;

  if (!file) {
    return Promise.reject(new Error('Aucun fichier fourni pour le téléversement.'));
  }

  return new Promise((resolve, reject) => {
    try {
      const catPath = sanitizeCategory(category);
      const rawName = customFileName || file.name || 'document.pdf';
      const cleanName = sanitizeStorageFileName(rawName);

      // Horodatage pour éviter toute collision si deux fichiers portent le même nom
      const timestamp = Date.now();
      const storagePath = `dataroom/${catPath}/${timestamp}_${cleanName}`;
      const storageRef = ref(storage, storagePath);

      const metadata = {
        contentType: file.type || 'application/pdf',
        customMetadata: {
          originalName: file.name || cleanName,
          category,
          portfolioId,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Yann BARBERIS (Admin)',
        },
      };

      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = snapshot.totalBytes > 0
            ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            : 0;
          if (typeof onProgress === 'function') {
            onProgress(progress, snapshot);
          }
        },
        (error) => {
          console.error('Erreur Firebase Storage upload:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              downloadUrl,
              storagePath,
              fullPath: uploadTask.snapshot.ref.fullPath,
              fileName: rawName,
              cleanFileName: cleanName,
              fileSize: file.size || uploadTask.snapshot.totalBytes || 0,
              mimeType: file.type || 'application/pdf',
              category,
              portfolioId,
              uploadedAt: new Date().toISOString(),
            });
          } catch (urlErr) {
            console.error('Erreur getDownloadURL:', urlErr);
            reject(urlErr);
          }
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Récupère l'URL de téléchargement direct depuis un chemin de stockage ou une référence.
 */
export async function getFileDownloadUrl(storagePathOrUrl) {
  if (!storagePathOrUrl) return '';
  if (
    typeof storagePathOrUrl === 'string' &&
    (storagePathOrUrl.startsWith('http://') ||
      storagePathOrUrl.startsWith('https://') ||
      storagePathOrUrl.startsWith('blob:') ||
      storagePathOrUrl.startsWith('data:'))
  ) {
    return storagePathOrUrl;
  }

  try {
    const storageRef = ref(storage, storagePathOrUrl);
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.warn(`Impossible de résoudre l'URL Firebase pour "${storagePathOrUrl}":`, err);
    return '';
  }
}

/**
 * Supprime un document distant de Firebase Storage.
 */
export async function deleteDataRoomFileFromFirebase(storagePath) {
  if (!storagePath) return false;
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    return true;
  } catch (err) {
    console.warn(`Erreur suppression Firebase Storage (${storagePath}):`, err);
    return false;
  }
}

export default {
  app,
  storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  uploadDataRoomFileToFirebase,
  getFileDownloadUrl,
  deleteDataRoomFileFromFirebase,
};
