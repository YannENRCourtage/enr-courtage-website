/**
 * Service de résolution intelligente des documents de la Data Room
 * Fait correspondre n'importe quel document demandé (par son nom, mot-clé ou id)
 * au véritable fichier PDF original de 24-25 pages disponible sur le serveur.
 */

export const BUNDLED_DATAROOM_FILES = [
  // --- BESS (VOLTA) ---
  {
    fileName: 'Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf',
    keys: ['batiot', 'mongausy', '32220'],
    pages: 24,
    size: '623 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batterie_CASTEBRUNET_82300_CAUSSADE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie_CASTEBRUNET_82300_CAUSSADE.pdf',
    keys: ['castebrunet', 'caussade', '82300'],
    pages: 25,
    size: '906 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_2_82300_CAUSSADE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_2_82300_CAUSSADE.pdf',
    keys: ['castebrunet_2', 'castebrunet 2'],
    pages: 25,
    size: '906 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_3_82300_MONTEILS.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_3_82300_MONTEILS.pdf',
    keys: ['castebrunet_3', 'monteils', 'castebrunet 3'],
    pages: 25,
    size: '906 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_4_82300_SAINT-CIRQ.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_4_82300_SAINT-CIRQ.pdf',
    keys: ['castebrunet_4', 'saint-cirq', 'castebrunet 4'],
    pages: 25,
    size: '906 Ko',
  },
  {
    fileName: 'Nouvelle_Promesse_de_bail_batteries_COMBY_19210_SAINT_ELOY_LES_TUILLERIES.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batteries_COMBY_19210_SAINT_ELOY_LES_TUILLERIES.pdf',
    keys: ['comby', 'saint eloy', 'tuilleries', '19210'],
    pages: 24,
    size: '840 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_ARBOIN_47120_DURAS.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_ARBOIN_47120_DURAS.pdf',
    keys: ['arboin', 'duras', '47120'],
    pages: 25,
    size: '890 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_CUBERTAFON_19210_SAINT_JULIEN_LE_VENDOMOIS.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CUBERTAFON_19210_SAINT_JULIEN_LE_VENDOMOIS.pdf',
    keys: ['cubertafon', 'vendomois', '19210'],
    pages: 24,
    size: '850 Ko',
  },
  {
    fileName: 'Nouvelle_Promesse_de_bail_batteries_DOMERGUES_87380_MEUZAC.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batteries_DOMERGUES_87380_MEUZAC.pdf',
    keys: ['domergues', 'meuzac', '87380'],
    pages: 24,
    size: '860 Ko',
  },
  {
    fileName: 'Nouvelle_Promesse_de_bail_batteries_DOMERGUE_12420_ARGENCES_EN_AUBRAC.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batteries_DOMERGUE_12420_ARGENCES_EN_AUBRAC.pdf',
    keys: ['domergue', 'argences', 'aubrac', '12420'],
    pages: 24,
    size: '860 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_DOUMENS_33_BEYCHAC_ET_CAILLAU.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_DOUMENS_33_BEYCHAC_ET_CAILLAU.pdf',
    keys: ['doumens', 'beychac', 'caillau', '33750'],
    pages: 24,
    size: '840 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_FRECHEVILLE_47210_SAINT_EUTROPE_DE_BORN.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_FRECHEVILLE_47210_SAINT_EUTROPE_DE_BORN.pdf',
    keys: ['frecheville', 'saint eutrope', '47210'],
    pages: 24,
    size: '850 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_GIOT_23600_LEYRAT.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_GIOT_23600_LEYRAT.pdf',
    keys: ['giot', 'leyrat', '23600'],
    pages: 24,
    size: '840 Ko',
  },
  {
    fileName: 'Nouvelle_Promesse_de_bail_batteries_HOUSSAIT_YOUNG_33930_VENDAYS_MONTALIVET.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batteries_HOUSSAIT_YOUNG_33930_VENDAYS_MONTALIVET.pdf',
    keys: ['houssait', 'young', 'vendays', 'montalivet', '33930'],
    pages: 24,
    size: '860 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_MISSAULT_24470_SAINT_SAUD_LACOUSSIERE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_MISSAULT_24470_SAINT_SAUD_LACOUSSIERE.pdf',
    keys: ['missault', 'saint saud', 'lacoussiere', '24470'],
    pages: 24,
    size: '850 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_MISSAULT_24800_SAINT_MARTIN_DE_FRESSENGEAS.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_MISSAULT_24800_SAINT_MARTIN_DE_FRESSENGEAS.pdf',
    keys: ['missault', 'saint martin', 'fressengeas', '24800'],
    pages: 24,
    size: '850 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_SOULIGNAC_33_VAL_DE_LIVENNE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_SOULIGNAC_33_VAL_DE_LIVENNE.pdf',
    keys: ['soulignac', 'val de livenne', '33860'],
    pages: 24,
    size: '840 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batterie_MEILLAT_2_23210_MOURIOUX_VIEILLEVILLE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie_MEILLAT_2_23210_MOURIOUX_VIEILLEVILLE.pdf',
    keys: ['meillat_2', 'meillat 2', '23210'],
    pages: 24,
    size: '850 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_MEILLAT_1_23210_MOURIOUX_VIEILLEVILLE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_MEILLAT_1_23210_MOURIOUX_VIEILLEVILLE.pdf',
    keys: ['meillat_1', 'meillat 1', 'mourioux'],
    pages: 24,
    size: '850 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batterie_PRAVIE_82170_GRISOLLES.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie_PRAVIE_82170_GRISOLLES.pdf',
    keys: ['pravie', 'grisolles', '82170'],
    pages: 24,
    size: '850 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_BERTRANDIE_24240_MONESTIER.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_BERTRANDIE_24240_MONESTIER.pdf',
    keys: ['bertrandie', 'monestier', '24240'],
    pages: 24,
    size: '850 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_DAVID_19350_CONCEZE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_DAVID_19350_CONCEZE.pdf',
    keys: ['david', 'conceze', '19350'],
    pages: 24,
    size: '850 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_LATOURNERIE_24310_BRANTOME_EN_PERIGORD-fromagerie-desterresvieilles_orange.fr.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_LATOURNERIE_24310_BRANTOME_EN_PERIGORD-fromagerie-desterresvieilles_orange.fr.pdf',
    keys: ['latournerie', 'brantome', '24310'],
    pages: 24,
    size: '860 Ko',
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batterie-brunogranger19_gmail.com.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie-brunogranger19_gmail.com.pdf',
    keys: ['granger', 'brunogranger'],
    pages: 24,
    size: '840 Ko',
  },

  // --- PV (HÉLIOS) ---
  {
    fileName: 'Promesse_de_bail_CONSOLI_signe.pdf',
    url: '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf',
    keys: ['consoli', 'prigonrieux', '24130'],
    pages: 20,
    size: '865 Ko',
  },
  {
    fileName: 'Promesse_de_bail_LABEGUERIE_signe.pdf',
    url: '/documents/dataroom/Promesse_de_bail_LABEGUERIE_signe.pdf',
    keys: ['labeguerie', 'oregue', '64120'],
    pages: 18,
    size: '4.8 Mo',
  },
];

// Helper de normalisation de chaîne pour les comparaisons insensibles
function normalizeString(str = '') {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents
    .replace(/\.pdf$/i, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Recherche si un document de la Data Room correspond à un fichier réel hébergé sur le serveur.
 * Gère les noms sans extension, avec tirets/underscores, ou avec mot-clé (ex: "BATIOT", "CASTEBRUNET", "CONSOLI").
 */
export function findMatchingServerDocument(docOrName) {
  if (!docOrName) return null;

  const rawName = typeof docOrName === 'string' ? docOrName : (docOrName.name || docOrName.fileName || '');
  if (!rawName) return null;

  const targetNorm = normalizeString(rawName);

  // 1. Correspondance exacte ou forte sur le nom de fichier
  for (const item of BUNDLED_DATAROOM_FILES) {
    const itemNorm = normalizeString(item.fileName);
    if (itemNorm === targetNorm) {
      return item;
    }
  }

  // 2. Correspondance d'inclusion (l'un contient l'autre)
  for (const item of BUNDLED_DATAROOM_FILES) {
    const itemNorm = normalizeString(item.fileName);
    if (targetNorm.length >= 5 && itemNorm.includes(targetNorm)) {
      return item;
    }
    if (itemNorm.length >= 5 && targetNorm.includes(itemNorm)) {
      return item;
    }
  }

  // 3. Correspondance par mots-clés distinctifs (ex: Batiot, Castebrunet, Consoli, Labeguerie)
  for (const item of BUNDLED_DATAROOM_FILES) {
    const hasKeyMatch = item.keys.some((k) => {
      const kNorm = normalizeString(k);
      return kNorm.length >= 3 && targetNorm.includes(kNorm);
    });
    if (hasKeyMatch) {
      return item;
    }
  }

  // 4. Mappage pour les fiches génériques de promesses de bail si demandées
  if (
    targetNorm.includes('promessedebail') ||
    targetNorm.includes('promessesdebail') ||
    targetNorm.includes('pdb') ||
    targetNorm.includes('bail')
  ) {
    if (targetNorm.includes('bess') || targetNorm.includes('batterie') || targetNorm.includes('volta')) {
      // Représentatif BESS : BATIOT (24 pages complètes)
      return BUNDLED_DATAROOM_FILES.find((f) => f.fileName.includes('BATIOT')) || BUNDLED_DATAROOM_FILES[0];
    }
    if (targetNorm.includes('ferme') || targetNorm.includes('pv') || targetNorm.includes('helios')) {
      // Représentatif PV : CONSOLI (20 pages signées) ou LABEGUERIE
      return BUNDLED_DATAROOM_FILES.find((f) => f.fileName.includes('CONSOLI')) || BUNDLED_DATAROOM_FILES[0];
    }
    // Par défaut BATIOT (24 pages)
    return BUNDLED_DATAROOM_FILES.find((f) => f.fileName.includes('BATIOT')) || BUNDLED_DATAROOM_FILES[0];
  }

  return null;
}
