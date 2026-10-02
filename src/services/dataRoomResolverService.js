/**
 * Service de résolution intelligente des documents de la Data Room
 * Fait correspondre n'importe quel document demandé (par son nom, mot-clé ou id)
 * au véritable fichier PDF original disponible sur le serveur.
 * 
 * SÉPARATION STRICTE :
 * - Une demande de Fiche Projet résout TOUJOURS vers la véritable fiche projet unitaire.
 * - Une demande de Promesse de Bail résout TOUJOURS vers la véritable promesse de bail notariée (20-25 pages).
 */

import { BUNDLED_FICHES_PROJETS } from './bundledFiches';

export { BUNDLED_FICHES_PROJETS };

export const BUNDLED_DATAROOM_FILES = [
  // --- BESS (VOLTA) ---
  {
    fileName: 'Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf',
    keys: ['batiot', 'mongausy', '32220'],
    pages: 24,
    size: '623 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batterie_CASTEBRUNET_82300_CAUSSADE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie_CASTEBRUNET_82300_CAUSSADE.pdf',
    keys: ['castebrunet', 'caussade', '82300'],
    pages: 25,
    size: '906 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_2_82300_CAUSSADE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_2_82300_CAUSSADE.pdf',
    keys: ['castebrunet_2', 'castebrunet 2'],
    pages: 25,
    size: '906 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_3_82300_MONTEILS.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_3_82300_MONTEILS.pdf',
    keys: ['castebrunet_3', 'monteils', 'castebrunet 3'],
    pages: 25,
    size: '906 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_4_82300_SAINT-CIRQ.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_4_82300_SAINT-CIRQ.pdf',
    keys: ['castebrunet_4', 'saint-cirq', 'castebrunet 4'],
    pages: 25,
    size: '906 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_Promesse_de_bail_batteries_COMBY_19210_SAINT_ELOY_LES_TUILLERIES.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batteries_COMBY_19210_SAINT_ELOY_LES_TUILLERIES.pdf',
    keys: ['comby', 'saint eloy', 'tuilleries', '19210'],
    pages: 24,
    size: '840 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_ARBOIN_47120_DURAS.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_ARBOIN_47120_DURAS.pdf',
    keys: ['arboin', 'duras', '47120'],
    pages: 25,
    size: '890 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_CUBERTAFON_19210_SAINT_JULIEN_LE_VENDOMOIS.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CUBERTAFON_19210_SAINT_JULIEN_LE_VENDOMOIS.pdf',
    keys: ['cubertafon', 'vendomois', '19210'],
    pages: 24,
    size: '850 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_Promesse_de_bail_batteries_DOMERGUES_87380_MEUZAC.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batteries_DOMERGUES_87380_MEUZAC.pdf',
    keys: ['domergues', 'meuzac', '87380'],
    pages: 24,
    size: '860 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_Promesse_de_bail_batteries_DOMERGUE_12420_ARGENCES_EN_AUBRAC.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batteries_DOMERGUE_12420_ARGENCES_EN_AUBRAC.pdf',
    keys: ['domergue', 'argences', 'aubrac', '12420'],
    pages: 24,
    size: '860 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_DOUMENS_33_BEYCHAC_ET_CAILLAU.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_DOUMENS_33_BEYCHAC_ET_CAILLAU.pdf',
    keys: ['doumens', 'beychac', 'caillau', '33750'],
    pages: 24,
    size: '840 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_FRECHEVILLE_47210_SAINT_EUTROPE_DE_BORN.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_FRECHEVILLE_47210_SAINT_EUTROPE_DE_BORN.pdf',
    keys: ['frecheville', 'saint eutrope', '47210'],
    pages: 24,
    size: '850 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_GIOT_23600_LEYRAT.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_GIOT_23600_LEYRAT.pdf',
    keys: ['giot', 'leyrat', '23600'],
    pages: 24,
    size: '840 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_Promesse_de_bail_batteries_HOUSSAIT_YOUNG_33930_VENDAYS_MONTALIVET.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batteries_HOUSSAIT_YOUNG_33930_VENDAYS_MONTALIVET.pdf',
    keys: ['houssait', 'young', 'vendays', 'montalivet', '33930'],
    pages: 24,
    size: '860 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_MISSAULT_24470_SAINT_SAUD_LACOUSSIERE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_MISSAULT_24470_SAINT_SAUD_LACOUSSIERE.pdf',
    keys: ['missault', 'saint saud', 'lacoussiere', '24470'],
    pages: 24,
    size: '850 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_MISSAULT_24800_SAINT_MARTIN_DE_FRESSENGEAS.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_MISSAULT_24800_SAINT_MARTIN_DE_FRESSENGEAS.pdf',
    keys: ['missault', 'saint martin', 'fressengeas', '24800'],
    pages: 24,
    size: '850 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_SOULIGNAC_33_VAL_DE_LIVENNE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_SOULIGNAC_33_VAL_DE_LIVENNE.pdf',
    keys: ['soulignac', 'val de livenne', '33860'],
    pages: 24,
    size: '840 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batterie_MEILLAT_2_23210_MOURIOUX_VIEILLEVILLE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie_MEILLAT_2_23210_MOURIOUX_VIEILLEVILLE.pdf',
    keys: ['meillat_2', 'meillat 2', '23210'],
    pages: 24,
    size: '850 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_MEILLAT_1_23210_MOURIOUX_VIEILLEVILLE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_MEILLAT_1_23210_MOURIOUX_VIEILLEVILLE.pdf',
    keys: ['meillat_1', 'meillat 1', 'mourioux'],
    pages: 24,
    size: '850 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batterie_PRAVIE_82170_GRISOLLES.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie_PRAVIE_82170_GRISOLLES.pdf',
    keys: ['pravie', 'grisolles', '82170'],
    pages: 24,
    size: '850 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_BERTRANDIE_24240_MONESTIER.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_BERTRANDIE_24240_MONESTIER.pdf',
    keys: ['bertrandie', 'monestier', '24240'],
    pages: 24,
    size: '850 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_DAVID_19350_CONCEZE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_DAVID_19350_CONCEZE.pdf',
    keys: ['david', 'conceze', '19350'],
    pages: 24,
    size: '850 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_LATOURNERIE_24310_BRANTOME_EN_PERIGORD-fromagerie-desterresvieilles_orange.fr.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_LATOURNERIE_24310_BRANTOME_EN_PERIGORD-fromagerie-desterresvieilles_orange.fr.pdf',
    keys: ['latournerie', 'brantome', '24310'],
    pages: 24,
    size: '860 Ko',
    type: 'bail',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batterie-brunogranger19_gmail.com.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie-brunogranger19_gmail.com.pdf',
    keys: ['granger', 'brunogranger'],
    pages: 24,
    size: '840 Ko',
    type: 'bail',
  },

  // --- PV (HÉLIOS) ---
  {
    fileName: 'Promesse_de_bail_CONSOLI_signe.pdf',
    url: '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf',
    keys: ['consoli', 'prigonrieux', '24130'],
    pages: 20,
    size: '865 Ko',
    type: 'bail',
  },
  {
    fileName: 'Promesse_de_bail_LABEGUERIE_signe.pdf',
    url: '/documents/dataroom/Promesse_de_bail_LABEGUERIE_signe.pdf',
    keys: ['labeguerie', 'oregue', '64120'],
    pages: 18,
    size: '4.8 Mo',
    type: 'bail',
  },
];

// Helper de normalisation de chaîne pour les comparaisons insensibles
export function normalizeString(str = '') {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents
    .replace(/\.pdf$/i, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Détermine si la requête porte sur une fiche projet.
 */
export function isFicheProjetRequest(docOrName) {
  if (!docOrName) return false;
  if (typeof docOrName === 'object') {
    if (docOrName.isFiche === true || docOrName.type === 'fiche') return true;
    if (docOrName.category?.toLowerCase() === 'technique' && /fiche/i.test(docOrName.name || '')) return true;
  }
  const rawName = typeof docOrName === 'string' ? docOrName : (docOrName.name || docOrName.fileName || '');
  return /fiche/i.test(rawName);
}

/**
 * Détermine si la requête porte sur une promesse de bail.
 */
export function isPromesseBailRequest(docOrName) {
  if (!docOrName) return false;
  if (typeof docOrName === 'object') {
    if (docOrName.isBail === true || docOrName.type === 'bail') return true;
  }
  const rawName = typeof docOrName === 'string' ? docOrName : (docOrName.name || docOrName.fileName || '');
  return /promesse.*bail|pdb|bail.*notari/i.test(rawName);
}

/**
 * Recherche spécifique d'une fiche projet dans la liste BUNDLED_FICHES_PROJETS.
 */
export function findMatchingFicheProjet(docOrName, site = null) {
  if (!docOrName && !site) return null;
  const rawName = typeof docOrName === 'string' ? docOrName : (docOrName?.name || docOrName?.fileName || '');
  const targetNorm = normalizeString(rawName);

  // Recherche prioritaire par informations du site
  if (site) {
    const siteCommune = normalizeString(site.name || site.ville || '');
    const siteClient = normalizeString(site.client || site.bailleur || '');
    const siteCp = normalizeString(site.cp || '');

    // 1. Match client + commune
    if (siteClient && siteClient.length >= 3 && siteCommune && siteCommune.length >= 3) {
      for (const item of BUNDLED_FICHES_PROJETS) {
        const itemNorm = normalizeString(item.fileName);
        if (itemNorm.includes(siteClient) && itemNorm.includes(siteCommune)) {
          return item;
        }
      }
    }

    // 2. Match client
    if (siteClient && siteClient.length >= 4) {
      for (const item of BUNDLED_FICHES_PROJETS) {
        const itemNorm = normalizeString(item.fileName);
        if (itemNorm.includes(siteClient)) {
          return item;
        }
      }
    }

    // 3. Match commune + cp
    if (siteCommune && siteCommune.length >= 4) {
      for (const item of BUNDLED_FICHES_PROJETS) {
        const itemNorm = normalizeString(item.fileName);
        if (itemNorm.includes(siteCommune) && (!siteCp || itemNorm.includes(siteCp))) {
          return item;
        }
      }
      for (const item of BUNDLED_FICHES_PROJETS) {
        const itemNorm = normalizeString(item.fileName);
        if (itemNorm.includes(siteCommune)) {
          return item;
        }
      }
    }
  }

  // Recherche par texte/nom de document
  if (targetNorm) {
    for (const item of BUNDLED_FICHES_PROJETS) {
      const itemNorm = normalizeString(item.fileName);
      if (itemNorm === targetNorm || itemNorm.includes(targetNorm) || (targetNorm.length >= 6 && targetNorm.includes(itemNorm))) {
        return item;
      }
    }

    for (const item of BUNDLED_FICHES_PROJETS) {
      const hasKeyMatch = item.keys.some((k) => {
        const kNorm = normalizeString(k);
        return kNorm.length >= 4 && targetNorm.includes(kNorm);
      });
      if (hasKeyMatch) {
        return item;
      }
    }
  }

  return null;
}

/**
 * Recherche spécifique d'une promesse de bail dans la liste BUNDLED_DATAROOM_FILES.
 */
export function findMatchingPromesseBail(docOrName, site = null) {
  if (!docOrName && !site) return null;
  const rawName = typeof docOrName === 'string' ? docOrName : (docOrName?.name || docOrName?.fileName || '');
  const targetNorm = normalizeString(rawName);

  if (site) {
    const siteCommune = normalizeString(site.name || site.ville || '');
    const siteClient = normalizeString(site.client || site.bailleur || '');

    // 1. Match client
    if (siteClient && siteClient.length >= 3) {
      for (const item of BUNDLED_DATAROOM_FILES) {
        const itemNorm = normalizeString(item.fileName);
        if (itemNorm.includes(siteClient)) {
          return item;
        }
      }
    }

    // 2. Match commune
    if (siteCommune && siteCommune.length >= 4) {
      for (const item of BUNDLED_DATAROOM_FILES) {
        const itemNorm = normalizeString(item.fileName);
        if (itemNorm.includes(siteCommune)) {
          return item;
        }
      }
    }
  }

  if (targetNorm) {
    for (const item of BUNDLED_DATAROOM_FILES) {
      const itemNorm = normalizeString(item.fileName);
      if (itemNorm === targetNorm || itemNorm.includes(targetNorm) || (targetNorm.length >= 6 && targetNorm.includes(itemNorm))) {
        return item;
      }
    }

    for (const item of BUNDLED_DATAROOM_FILES) {
      const hasKeyMatch = item.keys.some((k) => {
        const kNorm = normalizeString(k);
        return kNorm.length >= 4 && targetNorm.includes(kNorm);
      });
      if (hasKeyMatch) {
        return item;
      }
    }
  }

  return null;
}

/**
 * Recherche principale : dirige vers les fiches ou vers les baux sans jamais les confondre.
 */
export function findMatchingServerDocument(docOrName, site = null) {
  if (!docOrName && !site) return null;

  // 1. Si c'est une fiche projet
  if (isFicheProjetRequest(docOrName)) {
    return findMatchingFicheProjet(docOrName, site);
  }

  // 2. Si c'est une promesse de bail
  if (isPromesseBailRequest(docOrName)) {
    return findMatchingPromesseBail(docOrName, site);
  }

  // 3. Recherche exacte globale sans présomption
  const rawName = typeof docOrName === 'string' ? docOrName : (docOrName?.name || docOrName?.fileName || '');
  const targetNorm = normalizeString(rawName);

  if (targetNorm) {
    for (const item of BUNDLED_DATAROOM_FILES) {
      if (normalizeString(item.fileName) === targetNorm) return item;
    }
    for (const item of BUNDLED_FICHES_PROJETS) {
      if (normalizeString(item.fileName) === targetNorm) return item;
    }
  }

  return null;
}

/**
 * Trouve ou assigne la fiche projet d'un site.
 */
export function findFicheProjetForSite(site, portfolioId) {
  if (!site) return null;
  const match = findMatchingFicheProjet(null, site);
  if (match) return match;

  const isPv = String(portfolioId || '').toLowerCase().includes('helios');
  if (isPv) {
    return BUNDLED_FICHES_PROJETS.find((f) => f.fileName.includes('CONSOLI')) || BUNDLED_FICHES_PROJETS[0];
  }
  return BUNDLED_FICHES_PROJETS.find((f) => f.fileName.includes('BATIOT')) || BUNDLED_FICHES_PROJETS[0];
}

/**
 * Trouve ou assigne la promesse de bail d'un site.
 */
export function findPromesseBailForSite(site, portfolioId) {
  if (!site) return null;
  const match = findMatchingPromesseBail(null, site);
  if (match) return match;

  const isPv = String(portfolioId || '').toLowerCase().includes('helios');
  if (isPv) {
    return BUNDLED_DATAROOM_FILES.find((f) => f.fileName.includes('CONSOLI')) || BUNDLED_DATAROOM_FILES[0];
  }
  return BUNDLED_DATAROOM_FILES.find((f) => f.fileName.includes('BATIOT')) || BUNDLED_DATAROOM_FILES[0];
}
