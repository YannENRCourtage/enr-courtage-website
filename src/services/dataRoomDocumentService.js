import { PORTFOLIOS } from '@/data/investorData';
import { getDocumentBinary } from '@/services/fileStorageService';
import { findMatchingServerDocument } from '@/services/dataRoomResolverService';

/**
 * Résout le véritable document PDF physique complet (24-25 pages).
 */
export function resolveRealDocument(file, portfolio) {
  if (!file) return null;

  // 1. URL directe explicite
  if (file.fileUrl) {
    const fileName = file.fileName || (file.name.toLowerCase().endsWith('.pdf') ? file.name : `${file.name}.pdf`);
    return { url: file.fileUrl, fileName };
  }

  // 2. Recherche intelligente dans les documents originaux du serveur
  const serverMatch = findMatchingServerDocument(file);
  if (serverMatch && serverMatch.url) {
    return { url: serverMatch.url, fileName: serverMatch.fileName };
  }

  // 3. Règle de repli spécifique aux Promesses de Bail
  const rawName = file.name || file.fileName || '';
  if (/promesse.*bail|pdb/i.test(rawName)) {
    if (portfolio?.type === 'PV' || portfolio?.id === 'helios') {
      return {
        url: '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf',
        fileName: 'Promesse_de_bail_CONSOLI_signe.pdf',
      };
    }
    return {
      url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf',
      fileName: 'Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf',
    };
  }

  return null;
}

/**
 * Télécharge ou consulte un document de la Data Room.
 */
export async function downloadOrViewDoc(file, portfolio, action = 'download', trackAction = null) {
  if (trackAction) {
    trackAction(file, action);
  }

  const formatPdfFileName = (name) => {
    if (!name) return 'Document.pdf';
    return name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;
  };

  const realDoc = resolveRealDocument(file, portfolio);

  if (action === 'view') {
    // 1. URL réelle
    if (realDoc && realDoc.url) {
      window.open(realDoc.url, '_blank', 'noopener,noreferrer');
      return;
    }
    // 2. IndexedDB
    try {
      const stored = await getDocumentBinary(file.id || file.name);
      if (stored && stored.blob) {
        const blob = stored.blob instanceof Blob ? stored.blob : new Blob([stored.blob], { type: stored.mimeType || 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        return;
      }
    } catch (e) {
      console.warn('Erreur lecture IndexedDB:', e);
    }
    // 3. Fallback
    const fallbackUrl = (portfolio?.type === 'PV' || portfolio?.id === 'helios')
      ? '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf'
      : '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf';
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  // DOWNLOAD
  const targetFileName = formatPdfFileName(realDoc?.fileName || file.name);

  // 1. URL réelle avec blob fetch
  if (realDoc && realDoc.url) {
    try {
      const resp = await fetch(realDoc.url);
      if (resp.ok) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = targetFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        return;
      }
    } catch (err) {
      console.warn('Fetch fallback:', err);
    }
  }

  // 2. IndexedDB
  try {
    const stored = await getDocumentBinary(file.id || file.name);
    if (stored && stored.blob) {
      const blob = stored.blob instanceof Blob ? stored.blob : new Blob([stored.blob], { type: stored.mimeType || 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = targetFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return;
    }
  } catch (err) {
    console.warn('IndexedDB error:', err);
  }

  // 3. Fallback direct download
  const fallbackUrl = (portfolio?.type === 'PV' || portfolio?.id === 'helios')
    ? '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf'
    : '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf';
  const a = document.createElement('a');
  a.href = fallbackUrl;
  a.download = targetFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Récupère l'ensemble des documents associés à un site spécifique.
 */
export function getDocumentsForSite(site, portfolioId, state) {
  if (!site) return [];

  const pId = String(portfolioId || 'helios').toLowerCase().includes('volta') ? 'volta' : 'helios';
  const portfolioObj = PORTFOLIOS.find((p) => p.id === pId);
  if (!portfolioObj) return [];

  const customDocs = state?.customDataRoom?.[pId] || {};
  const deletedDocs = state?.deletedDefaultDocs?.[pId] || [];
  const assignments = state?.documentSiteAssignments || {};

  const allDocs = [];

  // 1. Documents par défaut du portefeuille
  (portfolioObj.dataRoom?.categories || []).forEach((cat) => {
    (cat.files || []).forEach((file) => {
      if (!deletedDocs.includes(file.name)) {
        allDocs.push({
          ...file,
          category: cat.name,
          portfolioId: pId,
        });
      }
    });
  });

  // 2. Documents personnalisés uploadés
  Object.entries(customDocs).forEach(([catName, files]) => {
    (files || []).forEach((file) => {
      if (!allDocs.some((d) => d.name === file.name || (d.id && d.id === file.id))) {
        allDocs.push({
          ...file,
          category: catName,
          portfolioId: pId,
        });
      }
    });
  });

  // 3. Filtrer les documents affectés à ce site
  const siteId = Number(site.id);
  const siteName = (site.name || site.ville || '').toLowerCase();
  const clientName = (site.client || '').toLowerCase();

  return allDocs.filter((doc) => {
    // Affectation explicite par ID ou Nom
    const explicitIds = [
      ...(doc.siteIds || []),
      ...(assignments[doc.id] || []),
      ...(assignments[doc.name] || []),
      ...(assignments[doc.fileName] || []),
    ].map(Number);

    if (explicitIds.includes(siteId)) {
      return true;
    }

    // Détection automatique intelligente par nom de client ou de commune
    const docLower = (doc.name || '').toLowerCase();
    if (clientName && clientName.length > 3 && docLower.includes(clientName)) {
      return true;
    }
    if (siteName && siteName.length > 3 && docLower.includes(siteName)) {
      return true;
    }

    return false;
  });
}
