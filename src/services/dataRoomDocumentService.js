import { PORTFOLIOS } from '@/data/investorData';
import { getDocumentBinary } from '@/services/fileStorageService';
import { findMatchingServerDocument } from '@/services/dataRoomResolverService';
import { applyWatermarkToPdf } from '@/services/pdfWatermarkService';
import { useInvestorStore } from '@/stores/useInvestorStore';

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
 * Télécharge ou consulte un document de la Data Room avec filigrane dynamique anti-fuite.
 */
export async function downloadOrViewDoc(file, portfolio, action = 'download', trackAction = null) {
  const store = useInvestorStore.getState();
  const currentInvestor = store.currentInvestor;

  // 0. Sécurité stricte : Vérifier le NDA
  if (!currentInvestor) {
    alert("Authentification requise pour accéder aux pièces de la Data Room.");
    return;
  }

  const isApprovedAdmin = currentInvestor.email?.trim().toLowerCase() === 'y.barberis@enr-courtage.fr';
  if (!isApprovedAdmin && (!currentInvestor.ndaSignedAt || currentInvestor.status !== 'active')) {
    alert("Accès réservé : Votre accord de confidentialité (NDA) bilatéral doit être validé pour consulter ou télécharger cette pièce.");
    return;
  }

  // Enregistrement Audit Log
  if (store.logSecurityEvent) {
    store.logSecurityEvent({
      eventType: action === 'view' ? 'DATAROOM_VIEW' : 'DATAROOM_DOWNLOAD',
      targetResource: file?.name || 'DOCUMENT_DATAROOM',
      details: `${action === 'view' ? 'Consultation' : 'Téléchargement'} du document ${file?.name || ''} (${portfolio?.name || ''}) avec filigrane confidentiel`,
    });
  }

  if (trackAction) {
    trackAction(file, action);
  }

  const formatPdfFileName = (name) => {
    if (!name) return 'Document.pdf';
    return name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;
  };

  const realDoc = resolveRealDocument(file, portfolio);
  const targetFileName = formatPdfFileName(realDoc?.fileName || file.name);

  // Helper pour récupérer les octets du fichier (URL, IndexedDB ou Fallback)
  let rawBuffer = null;

  if (realDoc && realDoc.url) {
    try {
      const resp = await fetch(realDoc.url);
      if (resp.ok) {
        rawBuffer = await resp.arrayBuffer();
      }
    } catch (err) {
      console.warn('Fetch fallback:', err);
    }
  }

  if (!rawBuffer) {
    try {
      const stored = await getDocumentBinary(file.id || file.name);
      if (stored && stored.blob) {
        rawBuffer = await stored.blob.arrayBuffer();
      }
    } catch (e) {
      console.warn('Erreur lecture IndexedDB:', e);
    }
  }

  if (!rawBuffer) {
    const fallbackUrl = (portfolio?.type === 'PV' || portfolio?.id === 'helios')
      ? '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf'
      : '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf';
    try {
      const resp = await fetch(fallbackUrl);
      if (resp.ok) {
        rawBuffer = await resp.arrayBuffer();
      }
    } catch (e) {
      console.warn('Fallback fetch failed:', e);
    }
  }

  // Application du filigrane anti-fuite dynamique
  let finalBlob = null;
  if (rawBuffer && targetFileName.toLowerCase().endsWith('.pdf')) {
    try {
      const watermarkedBytes = await applyWatermarkToPdf(rawBuffer, {
        investorName: currentInvestor.name,
        investorEmail: currentInvestor.email,
        investorCompany: currentInvestor.company,
      });
      finalBlob = new Blob([watermarkedBytes], { type: 'application/pdf' });
    } catch (wErr) {
      console.warn('Erreur application filigrane:', wErr);
      finalBlob = new Blob([rawBuffer], { type: 'application/pdf' });
    }
  } else if (rawBuffer) {
    finalBlob = new Blob([rawBuffer]);
  }

  if (finalBlob) {
    const url = URL.createObjectURL(finalBlob);

    if (action === 'view') {
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return;
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = targetFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      return;
    }
  }

  // Repli ultime si aucun buffer n'a pu être chargé
  const directFallback = (portfolio?.type === 'PV' || portfolio?.id === 'helios')
    ? '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf'
    : '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf';
  window.open(directFallback, '_blank');
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
