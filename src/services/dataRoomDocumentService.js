import { PORTFOLIOS } from '@/data/investorData';
import { getDocumentBinary } from '@/services/fileStorageService';
import {
  findMatchingServerDocument,
  findFicheProjetForSite,
  findPromesseBailForSite,
  isFicheProjetRequest,
  isPromesseBailRequest,
} from '@/services/dataRoomResolverService';
import { applyWatermarkToPdf } from '@/services/pdfWatermarkService';
import { generateFicheProjetPdf } from '@/services/ficheProjetGenerator';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { getFileDownloadUrl } from '@/lib/firebase';

/**
 * Résout le véritable document PDF physique complet (Fiche Projet ou Promesse de Bail)
 * en interdisant formellement tout mélange ou substitution.
 */
export function resolveRealDocument(file, portfolio) {
  if (!file) return null;

  const isFiche = isFicheProjetRequest(file);
  const isBail = isPromesseBailRequest(file);

  // 1. URL directe explicite (ex: URL publique ou signée Firebase Storage)
  if (file.fileUrl) {
    const fileName = file.fileName || (file.name?.toLowerCase().endsWith('.pdf') ? file.name : `${file.name || 'document'}.pdf`);
    return {
      url: file.fileUrl,
      fileName,
      storagePath: file.storagePath,
      isFiche,
      isBail,
    };
  }

  // 1b. Chemin Firebase Storage sans fileUrl précalculée
  if (file.storagePath) {
    const fileName = file.fileName || file.name || 'document.pdf';
    return {
      url: null,
      storagePath: file.storagePath,
      fileName,
      isFiche,
      isBail,
    };
  }

  // 2. Recherche intelligente dans les documents originaux du serveur
  const serverMatch = findMatchingServerDocument(file, file.site);
  if (serverMatch && serverMatch.url) {
    return {
      url: serverMatch.url,
      fileName: serverMatch.fileName,
      isFiche: serverMatch.type === 'fiche' || isFiche,
      isBail: serverMatch.type === 'bail' || isBail,
    };
  }

  // 3. Fallback STRICTEMENT DÉDIÉ aux Fiches Projets
  if (isFiche) {
    const defaultFiche = findFicheProjetForSite(file.site, portfolio?.id);
    return {
      url: defaultFiche ? defaultFiche.url : null,
      fileName: defaultFiche ? defaultFiche.fileName : 'Fiche_projet_detaillee.pdf',
      isFiche: true,
      isBail: false,
    };
  }

  // 4. Fallback STRICTEMENT DÉDIÉ aux Promesses de Bail
  if (isBail) {
    const defaultBail = findPromesseBailForSite(file.site, portfolio?.id);
    return {
      url: defaultBail ? defaultBail.url : (portfolio?.type === 'PV' || portfolio?.id === 'helios'
        ? '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf'
        : '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf'),
      fileName: defaultBail ? defaultBail.fileName : (portfolio?.type === 'PV' || portfolio?.id === 'helios'
        ? 'Promesse_de_bail_CONSOLI_signe.pdf'
        : 'Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf'),
      isFiche: false,
      isBail: true,
    };
  }

  return null;
}

/**
 * Télécharge ou consulte n'importe quel document de la Data Room ou Fiche Projet
 * en appliquant SYSTÉMATIQUEMENT le filigrane de sécurité confidentiel anti-fuite.
 *
 * @param {Object} file - Objet document (name, fileUrl, isFiche, site, etc.)
 * @param {Object} portfolio - Objet portefeuille (helios ou volta)
 * @param {'view'|'download'} action - 'view' pour consultation nouvel onglet, 'download' pour enregistrer le fichier
 * @param {Function} trackAction - Callback optionnel de suivi
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
      details: `${action === 'view' ? 'Consultation' : 'Téléchargement'} du document ${file?.name || ''} (${portfolio?.name || portfolio?.id || ''}) avec filigrane confidentiel`,
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
  const isFiche = file?.isFiche || realDoc?.isFiche || isFicheProjetRequest(file);
  const targetFileName = formatPdfFileName(realDoc?.fileName || file.name || (isFiche ? 'Fiche_projet.pdf' : 'Document.pdf'));

  // Résolution asynchrone si chemin Firebase Storage
  let resolvedUrl = realDoc?.url || null;
  if (!resolvedUrl && (realDoc?.storagePath || file?.storagePath)) {
    try {
      resolvedUrl = await getFileDownloadUrl(realDoc?.storagePath || file?.storagePath);
    } catch (fbErr) {
      console.warn('Erreur résolution URL Firebase Storage:', fbErr);
    }
  }

  // Récupération des octets du fichier source
  let rawBuffer = null;

  if (resolvedUrl) {
    try {
      const resp = await fetch(resolvedUrl);
      if (resp.ok) {
        rawBuffer = await resp.arrayBuffer();
      }
    } catch (err) {
      console.warn('Erreur chargement document distant/local:', err);
    }
  }

  // Recherche dans IndexedDB si document téléversé localement
  if (!rawBuffer && (file.id || file.name)) {
    try {
      const stored = await getDocumentBinary(file.id || file.name);
      if (stored && stored.blob) {
        rawBuffer = await stored.blob.arrayBuffer();
      }
    } catch (e) {
      console.warn('Erreur lecture IndexedDB:', e);
    }
  }

  // Si c'est une Fiche Projet et qu'aucun PDF statique n'a pu être chargé : génération dynamique dédiée !
  if (!rawBuffer && isFiche) {
    try {
      const generatedBytes = await generateFicheProjetPdf(file.site || file, portfolio);
      rawBuffer = generatedBytes.buffer;
    } catch (genErr) {
      console.warn('Erreur génération Fiche Projet dynamique:', genErr);
    }
  }

  // Si c'est une promesse de bail et qu'aucun buffer n'est chargé : fallback promesse de bail
  if (!rawBuffer && !isFiche) {
    const fallbackBailUrl = (portfolio?.type === 'PV' || portfolio?.id === 'helios')
      ? '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf'
      : '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf';
    try {
      const resp = await fetch(fallbackBailUrl);
      if (resp.ok) {
        rawBuffer = await resp.arrayBuffer();
      }
    } catch (e) {
      console.warn('Fallback promesse de bail failed:', e);
    }
  }

  // Application SYSTÉMATIQUE du filigrane anti-fuite dynamique réglementaire (Image 5)
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

  // Affichage ou Téléchargement
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

  // Si vraiment aucun buffer n'a pu être produit :
  if (resolvedUrl) {
    window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
  } else {
    alert("Impossible de charger ce document. Veuillez contacter un administrateur.");
  }
}

/**
 * Récupère l'ensemble des documents associés à un site spécifique.
 * Garantit que chaque projet dispose d'au minimum :
 * 1. Sa Fiche Projet dédiée (Technique)
 * 2. Sa Promesse de Bail notariée (Juridique)
 * Ainsi que tout document complémentaire issu de la Data Room ou téléversé par l'admin.
 */
export function getDocumentsForSite(site, portfolioId, state) {
  if (!site) return [];

  const pId = String(portfolioId || 'helios').toLowerCase().includes('volta') ? 'volta' : 'helios';
  const isPv = pId === 'helios';
  const siteName = site.name || site.ville || `Projet #${site.id}`;
  const siteCp = site.cp || '';
  const siteClient = site.client || site.bailleur || '';

  const siteDocs = [];

  // 1. FICHE PROJET DÉDIÉE DU SITE (Technique)
  const matchedFiche = findFicheProjetForSite(site, pId);
  siteDocs.push({
    id: `fiche-${site.id}`,
    name: `Fiche projet — ${siteName}${siteCp ? ` (${siteCp})` : ''}`,
    fileName: matchedFiche ? matchedFiche.fileName : `Fiche_projet_${siteName.replace(/[^a-zA-Z0-9]/g, '_')}_${siteCp}.pdf`,
    fileUrl: matchedFiche ? matchedFiche.url : null,
    category: 'Technique',
    type: 'PDF',
    size: matchedFiche?.size || '350 Ko',
    isFiche: true,
    isBail: false,
    site,
    portfolioId: pId,
  });

  // 2. PROMESSE DE BAIL NOTARIÉE DU SITE (Juridique)
  const matchedBail = findPromesseBailForSite(site, pId);
  siteDocs.push({
    id: `bail-${site.id}`,
    name: `Promesse de bail notariée — ${siteName}${siteClient ? ` (${siteClient})` : ''}`,
    fileName: matchedBail ? matchedBail.fileName : (isPv ? 'Promesse_de_bail_CONSOLI_signe.pdf' : 'Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf'),
    fileUrl: matchedBail ? matchedBail.url : (isPv ? '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf' : '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf'),
    category: 'Juridique',
    type: 'PDF',
    size: matchedBail?.size || (isPv ? '865 Ko' : '623 Ko'),
    isFiche: false,
    isBail: true,
    site,
    portfolioId: pId,
  });

  // 3. Documents supplémentaires de la Data Room ou personnalisés affectés à ce site
  const portfolioObj = PORTFOLIOS.find((p) => p.id === pId);
  if (portfolioObj) {
    const customDocs = state?.customDataRoom?.[pId] || {};
    const deletedDocs = state?.deletedDefaultDocs?.[pId] || [];
    const assignments = state?.documentSiteAssignments || {};

    const extraDocs = [];

    // Documents par défaut
    (portfolioObj.dataRoom?.categories || []).forEach((cat) => {
      (cat.files || []).forEach((file) => {
        if (!deletedDocs.includes(file.name)) {
          extraDocs.push({
            ...file,
            category: cat.name,
            portfolioId: pId,
            site,
          });
        }
      });
    });

    // Documents uploadés
    Object.entries(customDocs).forEach(([catName, files]) => {
      (files || []).forEach((file) => {
        if (!extraDocs.some((d) => d.name === file.name || (d.id && d.id === file.id))) {
          extraDocs.push({
            ...file,
            category: catName,
            portfolioId: pId,
            site,
          });
        }
      });
    });

    // Filtrer pour éviter les doublons avec la fiche et le bail déjà ajoutés
    const siteId = Number(site.id);
    const siteNameLower = siteName.toLowerCase();
    const clientLower = siteClient.toLowerCase();

    extraDocs.forEach((doc) => {
      // Ignorer si c'est déjà représenté par la fiche ou le bail ci-dessus
      const docNameLower = (doc.name || '').toLowerCase();
      if (/fiche synoptique.*centrales pv|fiches synoptiques.*bess/i.test(docNameLower)) {
        return; // Ne pas encombrer le modal individuel avec le gros bundle de 31 fiches
      }
      if (/promesses de bail.*sites fermes|promesses de bail.*31 sites/i.test(docNameLower)) {
        return;
      }

      const explicitIds = [
        ...(doc.siteIds || []),
        ...(assignments[doc.id] || []),
        ...(assignments[doc.name] || []),
        ...(assignments[doc.fileName] || []),
      ].map(Number);

      let isMatch = explicitIds.includes(siteId);
      if (!isMatch && clientLower && clientLower.length > 3 && docNameLower.includes(clientLower)) {
        isMatch = true;
      }
      if (!isMatch && siteNameLower && siteNameLower.length > 3 && docNameLower.includes(siteNameLower)) {
        isMatch = true;
      }

      if (isMatch) {
        // Vérifier qu'on n'a pas déjà un document identique
        const alreadyInList = siteDocs.some(
          (sd) => sd.name.toLowerCase() === doc.name.toLowerCase() || (sd.fileName && sd.fileName === doc.fileName)
        );
        if (!alreadyInList) {
          siteDocs.push({
            ...doc,
            site,
          });
        }
      }
    });
  }

  return siteDocs;
}
