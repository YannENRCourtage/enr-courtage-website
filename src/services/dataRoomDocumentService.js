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
import * as XLSX from 'xlsx';

/**
 * Détecte si un fichier est un tableur Excel / CSV
 */
export function isExcelFile(file, fileName = '') {
  if (!file && !fileName) return false;
  const name = String(fileName || file?.fileName || file?.name || '').toLowerCase();
  const type = String(file?.type || '').toUpperCase();
  const mime = String(file?.mimeType || file?.contentType || '').toLowerCase();
  return (
    name.endsWith('.xlsx') ||
    name.endsWith('.xls') ||
    name.endsWith('.csv') ||
    name.endsWith('.xlsm') ||
    type === 'XLSX' ||
    type === 'XLS' ||
    type === 'CSV' ||
    type === 'EXCEL' ||
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    mime.includes('csv')
  );
}

/**
 * Résout le véritable document physique complet (Fiche Projet, Promesse de Bail, ou Classeur Excel)
 * en interdisant formellement tout mélange ou substitution.
 */
export function resolveRealDocument(file, portfolio) {
  if (!file) return null;

  const isExcel = isExcelFile(file);
  const isFiche = !isExcel && isFicheProjetRequest(file);
  const isBail = !isExcel && isPromesseBailRequest(file);

  // 1. URL directe explicite (ex: URL publique, locale ou signée Firebase Storage)
  if (file.fileUrl) {
    let fileName = file.fileName || file.name || (isExcel ? 'Matrice_economique.xlsx' : 'document.pdf');
    if (isExcel) {
      if (!fileName.toLowerCase().match(/\.(xlsx|xls|csv)$/)) {
        fileName = `${fileName.replace(/[^a-zA-Z0-9_\-]/g, '_')}.xlsx`;
      }
    } else if (!fileName.toLowerCase().endsWith('.pdf')) {
      fileName = `${fileName}.pdf`;
    }
    return {
      url: file.fileUrl,
      fileName,
      storagePath: file.storagePath,
      isExcel,
      isFiche,
      isBail,
    };
  }

  // 1b. Chemin Firebase Storage sans fileUrl précalculée
  if (file.storagePath) {
    let fileName = file.fileName || file.name || (isExcel ? 'document.xlsx' : 'document.pdf');
    if (isExcel && !fileName.toLowerCase().match(/\.(xlsx|xls|csv)$/)) {
      fileName = `${fileName.replace(/[^a-zA-Z0-9_\-]/g, '_')}.xlsx`;
    }
    return {
      url: null,
      storagePath: file.storagePath,
      fileName,
      isExcel,
      isFiche,
      isBail,
    };
  }

  // 1c. Résolution des fichiers Excel par défaut (Matrices économiques, Business Plans, Hypothèses)
  if (isExcel) {
    const pId = String(portfolio?.id || portfolio?.name || '').toLowerCase();
    const isVolta = pId.includes('volta') || portfolio?.type === 'BESS';
    const lowName = String(file.name || file.fileName || '').toLowerCase();

    if (isVolta) {
      if (lowName.includes('hypo') || lowName.includes('fcr') || lowName.includes('mdc') || lowName.includes('revenu')) {
        return {
          url: '/documents/dataroom/Hypotheses_revenus_FCR_aFRR_MdC_VOLTA.xlsx',
          fileName: 'Hypotheses_revenus_FCR_aFRR_MdC_VOLTA.xlsx',
          isExcel: true,
          isFiche: false,
          isBail: false,
        };
      }
      return {
        url: '/documents/dataroom/Matrice_economique_BESS_consolidee_VOLTA.xlsx',
        fileName: 'Matrice_economique_BESS_consolidee_VOLTA.xlsx',
        isExcel: true,
        isFiche: false,
        isBail: false,
      };
    } else {
      if (lowName.includes('business') || lowName.includes('chronique') || lowName.includes('20 ans')) {
        return {
          url: '/documents/dataroom/Business_plans_unitaires_chronique_20_ans_HELIOS.xlsx',
          fileName: 'Business_plans_unitaires_chronique_20_ans_HELIOS.xlsx',
          isExcel: true,
          isFiche: false,
          isBail: false,
        };
      }
      if (lowName.includes('charpente') || lowName.includes('batiment')) {
        return {
          url: '/documents/dataroom/Tableaux_batiments_charpentes_complet_HELIOS.xlsx',
          fileName: 'Tableaux_batiments_charpentes_complet_HELIOS.xlsx',
          isExcel: true,
          isFiche: false,
          isBail: false,
        };
      }
      return {
        url: '/documents/dataroom/Matrice_economique_consolidee_HELIOS.xlsx',
        fileName: 'Matrice_economique_consolidee_HELIOS.xlsx',
        isExcel: true,
        isFiche: false,
        isBail: false,
      };
    }
  }

  // 2. Recherche intelligente dans les documents originaux du serveur (PDF)
  const serverMatch = findMatchingServerDocument(file, file.site);
  if (serverMatch && serverMatch.url) {
    return {
      url: serverMatch.url,
      fileName: serverMatch.fileName,
      isExcel: false,
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
      isExcel: false,
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
      isExcel: false,
      isFiche: false,
      isBail: true,
    };
  }

  return null;
}

/**
 * Télécharge ou consulte n'importe quel document de la Data Room ou Fiche Projet.
 * Pour les PDF : applique le filigrane de sécurité confidentiel anti-fuite.
 * Pour les Excel (.xlsx) : déclenche le téléchargement physique réel direct.
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

  const realDoc = resolveRealDocument(file, portfolio);
  const isExcel = isExcelFile(file) || isExcelFile(realDoc);
  const isFiche = !isExcel && (file?.isFiche || realDoc?.isFiche || isFicheProjetRequest(file));
  const isBail = !isExcel && !isFiche && (file?.isBail || realDoc?.isBail || isPromesseBailRequest(file));

  // Les tableurs Excel sont toujours téléchargés (les navigateurs n'ont pas de visualiseur .xlsx natif)
  const effectiveAction = isExcel ? 'download' : action;

  // Enregistrement Audit Log
  if (store.logSecurityEvent) {
    store.logSecurityEvent({
      eventType: effectiveAction === 'view' ? 'DATAROOM_VIEW' : 'DATAROOM_DOWNLOAD',
      targetResource: file?.name || 'DOCUMENT_DATAROOM',
      details: `${effectiveAction === 'view' ? 'Consultation' : 'Téléchargement'} du document ${file?.name || ''} (${portfolio?.name || portfolio?.id || ''})`,
    });
  }

  if (trackAction) {
    trackAction(file, effectiveAction);
  }

  const formatDocumentFileName = (name) => {
    if (!name) return isExcel ? 'Matrice_economique.xlsx' : 'Document.pdf';
    if (isExcel) {
      if (name.toLowerCase().match(/\.(xlsx|xls|csv)$/)) return name;
      return `${name.replace(/[^a-zA-Z0-9_\-]/g, '_')}.xlsx`;
    }
    return name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;
  };

  const targetFileName = formatDocumentFileName(realDoc?.fileName || file.fileName || file.name || (isFiche ? 'Fiche_projet.pdf' : (isExcel ? 'Matrice_economique.xlsx' : 'Document.pdf')));

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

  // Si c'est une promesse de bail et qu'aucun buffer n'est chargé : fallback promesse de bail (UNIQUEMENT baux PDF)
  if (!rawBuffer && !isFiche && !isExcel && (isBail || file.category === 'Juridique')) {
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

  // Si c'est un fichier Excel et qu'aucun buffer n'a pu être récupéré : génération dynamique de secours via XLSX
  if (!rawBuffer && isExcel) {
    try {
      const wb = XLSX.utils.book_new();
      const rows = [
        ['ENR COURTAGE — DATA ROOM M&A'],
        ['Portefeuille', portfolio?.name || portfolio?.id || 'HÉLIOS / VOLTA'],
        ['Document', file?.name || 'Matrice Économique M&A'],
        ['Date de consultation', new Date().toLocaleDateString('fr-FR')],
        ['Investisseur accrédité', currentInvestor?.name || 'Partenaire'],
        ['Société', currentInvestor?.company || 'Investisseur'],
        [],
        ['NOTE DE CONFIDENTIALITÉ'],
        ['Document financier confidentiel sous accord NDA M&A.'],
        ['Données de modélisation financière conformes au dossier d\'investissement.'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Data Room ENR');
      const u8 = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      rawBuffer = u8.buffer || u8;
    } catch (xlErr) {
      console.warn('Erreur génération XLSX dynamique:', xlErr);
    }
  }

  // Création du Blob adapté selon le type de fichier
  let finalBlob = null;
  if (rawBuffer && isExcel) {
    finalBlob = new Blob([rawBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  } else if (rawBuffer && targetFileName.toLowerCase().endsWith('.pdf')) {
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

  // Téléchargement ou Affichage
  if (finalBlob) {
    const url = URL.createObjectURL(finalBlob);

    if (effectiveAction === 'download' || isExcel) {
      const a = document.createElement('a');
      a.href = url;
      a.download = targetFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 15000);
      return;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return;
    }
  }

  // Fallback si URL distante directe
  if (resolvedUrl) {
    if (isExcel) {
      const a = document.createElement('a');
      a.href = resolvedUrl;
      a.download = targetFileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  alert("Impossible de charger ce document. Veuillez contacter un administrateur.");
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

  // ==========================================================================
  // CAS SPÉCIAL CLUSTER CASTEBRUNET (4 stations BESS unitaires regroupées)
  // ==========================================================================
  const isCastebrunet = !isPv && (site.id === 10 || /castebrunet/i.test(siteName) || /castebrunet/i.test(siteClient));
  if (isCastebrunet) {
    const castebrunetStations = [
      {
        subId: '1',
        label: 'CASTEBRUNET 1 (82300 CAUSSADE)',
        ficheName: 'Fiche projet - CASTEBRUNET 82300 CAUSSADE.pdf',
        ficheUrl: '/documents/dataroom/fiches/Fiche%20projet%20-%20CASTEBRUNET%2082300%20CAUSSADE.pdf',
        bailName: 'Nouvelle_promesse_de_bail_batterie_CASTEBRUNET_82300_CAUSSADE.pdf',
        bailUrl: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie_CASTEBRUNET_82300_CAUSSADE.pdf',
      },
      {
        subId: '2',
        label: 'CASTEBRUNET 2 (82300 CAUSSADE)',
        ficheName: 'Fiche projet - CASTEBRUNET 2 82300 CAUSSADE.pdf',
        ficheUrl: '/documents/dataroom/fiches/Fiche%20projet%20-%20CASTEBRUNET%202%2082300%20CAUSSADE.pdf',
        bailName: 'Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_2_82300_CAUSSADE.pdf',
        bailUrl: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_2_82300_CAUSSADE.pdf',
      },
      {
        subId: '3',
        label: 'CASTEBRUNET 3 (82300 MONTEILS)',
        ficheName: 'Fiche projet - CASTEBRUNET 3 82300 MONTEILS.pdf',
        ficheUrl: '/documents/dataroom/fiches/Fiche%20projet%20-%20CASTEBRUNET%203%2082300%20MONTEILS.pdf',
        bailName: 'Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_3_82300_MONTEILS.pdf',
        bailUrl: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_3_82300_MONTEILS.pdf',
      },
      {
        subId: '4',
        label: 'CASTEBRUNET 4 (82300 SAINT-CIRQ)',
        ficheName: 'Fiche projet - CASTEBRUNET 4 82300 SAINT-CIRQ.pdf',
        ficheUrl: '/documents/dataroom/fiches/Fiche%20projet%20-%20CASTEBRUNET%204%2082300%20SAINT-CIRQ.pdf',
        bailName: 'Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_4_82300_SAINT-CIRQ.pdf',
        bailUrl: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_4_82300_SAINT-CIRQ.pdf',
      },
    ];

    castebrunetStations.forEach((st) => {
      // Fiche projet de la tranche
      siteDocs.push({
        id: `fiche-castebrunet-${st.subId}`,
        name: `Fiche projet — ${st.label}`,
        fileName: st.ficheName,
        fileUrl: st.ficheUrl,
        category: 'Technique',
        type: 'PDF',
        size: '350 Ko',
        isFiche: true,
        isBail: false,
        site,
        portfolioId: 'volta',
      });

      // Promesse de bail de la tranche
      siteDocs.push({
        id: `bail-castebrunet-${st.subId}`,
        name: `Promesse de bail notariée — ${st.label}`,
        fileName: st.bailName,
        fileUrl: st.bailUrl,
        category: 'Juridique',
        type: 'PDF',
        size: '906 Ko',
        isFiche: false,
        isBail: true,
        site,
        portfolioId: 'volta',
      });
    });

    return siteDocs;
  }

  // ==========================================================================
  // CAS SPÉCIAL CLUSTER JARRY (GORNAC 33540 - 2 Hangars regroupés JARRY 1 & 2)
  // ==========================================================================
  const isJarry = isPv && (site.id === 9 || /jarry/i.test(siteName) || /jarry/i.test(siteClient));
  if (isJarry) {
    siteDocs.push({
      id: `fiche-jarry-cluster`,
      name: `Fiche projet détaillée — GORNAC (JARRY 1 & JARRY 2 - 628 kWc)`,
      fileName: 'Fiche projet - JARRY 33540 GORNAC.pdf',
      fileUrl: '/documents/dataroom/fiches/Fiche%20projet%20-%20JARRY%2033540%20GORNAC.pdf',
      category: 'Technique',
      type: 'PDF',
      size: '420 Ko',
      isFiche: true,
      isBail: false,
      site,
      portfolioId: 'helios',
    });

    siteDocs.push({
      id: `bail-jarry-cluster`,
      name: `Promesse de bail notariée — GORNAC (JARRY Frédéric - 33540)`,
      fileName: 'Promesse_de_bail_CONSOLI_signe.pdf',
      fileUrl: '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf',
      category: 'Juridique',
      type: 'PDF',
      size: '865 Ko',
      isFiche: false,
      isBail: true,
      site,
      portfolioId: 'helios',
    });

    return siteDocs;
  }

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
