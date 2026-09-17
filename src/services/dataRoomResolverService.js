/**
 * Service de résolution intelligente des documents de la Data Room
 * Fait correspondre n'importe quel document demandé (par son nom ou id)
 * au véritable fichier PDF original disponible sur le serveur ou dans le stockage binaire.
 */

export const BUNDLED_DATAROOM_FILES = [
  {
    fileName: 'Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY-olivier.batiot_orange.fr.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY-olivier.batiot_orange.fr.pdf',
    keys: ['batiot', 'mongausy', '32220'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batterie_CASTEBRUNET_82300_CAUSSADE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie_CASTEBRUNET_82300_CAUSSADE.pdf',
    keys: ['castebrunet', 'caussade', '82300'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_ARBOIN_47120_DURAS.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_ARBOIN_47120_DURAS.pdf',
    keys: ['arboin', 'duras', '47120'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_2_82300_CAUSSADE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_2_82300_CAUSSADE.pdf',
    keys: ['castebrunet_2', 'castebrunet 2'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_3_82300_MONTEILS.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_3_82300_MONTEILS.pdf',
    keys: ['castebrunet_3', 'monteils', 'castebrunet 3'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_4_82300_SAINT-CIRQ.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CASTEBRUNET_4_82300_SAINT-CIRQ.pdf',
    keys: ['castebrunet_4', 'saint-cirq', 'castebrunet 4'],
  },
  {
    fileName: 'Nouvelle_Promesse_de_bail_batteries_COMBY_19210_SAINT_ELOY_LES_TUILLERIES-fabrice.comby_wanadoo.fr.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batteries_COMBY_19210_SAINT_ELOY_LES_TUILLERIES-fabrice.comby_wanadoo.fr.pdf',
    keys: ['comby', 'saint eloy', 'tuilleries', '19210'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_CUBERTAFON_19210_SAINT_JULIEN_LE_VENDOMOIS.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_CUBERTAFON_19210_SAINT_JULIEN_LE_VENDOMOIS.pdf',
    keys: ['cubertafon', 'vendomois', '19210'],
  },
  {
    fileName: 'Nouvelle_Promesse_de_bail_batteries_DOMERGUES_87380_MEUZAC-daviddomergue_orange.fr.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batteries_DOMERGUES_87380_MEUZAC-daviddomergue_orange.fr.pdf',
    keys: ['domergues', 'meuzac', '87380'],
  },
  {
    fileName: 'Nouvelle_Promesse_de_bail_batteries_DOMERGUE_12420_ARGENCES_EN_AUBRAC-daviddomergue_orange.fr.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batteries_DOMERGUE_12420_ARGENCES_EN_AUBRAC-daviddomergue_orange.fr.pdf',
    keys: ['domergue', 'argences', 'aubrac', '12420'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_DOUMENS_33_BEYCHAC_ET_CAILLAU-morgan.doumens_gmail.com.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_DOUMENS_33_BEYCHAC_ET_CAILLAU-morgan.doumens_gmail.com.pdf',
    keys: ['doumens', 'beychac', 'caillau'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_FRECHEVILLE_47210_SAINT_EUTROPE_DE_BORN-jlm.frecheville_orange.fr.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_FRECHEVILLE_47210_SAINT_EUTROPE_DE_BORN-jlm.frecheville_orange.fr.pdf',
    keys: ['frecheville', 'saint eutrope', '47210'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_GIOT_23600_LEYRAT-terrassementlmg_gmail.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_GIOT_23600_LEYRAT-terrassementlmg_gmail.pdf',
    keys: ['giot', 'leyrat', '23600'],
  },
  {
    fileName: 'Nouvelle_Promesse_de_bail_batteries_HOUSSAIT_YOUNG_33930_VENDAYS_MONTALIVET-medocpolo_gmail.com.pdf',
    url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batteries_HOUSSAIT_YOUNG_33930_VENDAYS_MONTALIVET-medocpolo_gmail.com.pdf',
    keys: ['houssait', 'young', 'vendays', 'montalivet', '33930'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_MISSAULT_24470_SAINT_SAUD_LACOUSSIERE-mapie7_hotmail.fr.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_MISSAULT_24470_SAINT_SAUD_LACOUSSIERE-mapie7_hotmail.fr.pdf',
    keys: ['missault', 'saint saud', 'lacoussiere', '24470'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batteries_SOULIGNAC_33_VAL_DE_LIVENNE-isabellesoulignac_orange.fr.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batteries_SOULIGNAC_33_VAL_DE_LIVENNE-isabellesoulignac_orange.fr.pdf',
    keys: ['soulignac', 'val de livenne', '33860'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batterie_MEILLAT_2_23210_MOURIOUX_VIEILLEVILLE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie_MEILLAT_2_23210_MOURIOUX_VIEILLEVILLE.pdf',
    keys: ['meillat_2', 'meillat 2', '23210'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batterie_PRAVIE_82170_GRISOLLES-clemence.pravie31_hotmail.com.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie_PRAVIE_82170_GRISOLLES-clemence.pravie31_hotmail.com.pdf',
    keys: ['pravie', 'grisolles', '82170'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_BERTRANDIE_24240_MONESTIER_V2-bertrandie.sebastien_orange.fr.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_BERTRANDIE_24240_MONESTIER_V2-bertrandie.sebastien_orange.fr.pdf',
    keys: ['bertrandie', 'monestier', '24240'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_DAVID_19350_CONCEZE-earldeslandesdavid_orange.fr.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_DAVID_19350_CONCEZE-earldeslandesdavid_orange.fr.pdf',
    keys: ['david', 'conceze', '19350'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_LATOURNERIE_24310_BRANTOME_EN_PERIGORD-fromagerie-desterresvieilles_orange.fr.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_LATOURNERIE_24310_BRANTOME_EN_PERIGORD-fromagerie-desterresvieilles_orange.fr.pdf',
    keys: ['latournerie', 'brantome', '24310'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_MEILLAT_1_23210_MOURIOUX_VIEILLEVILLE.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_MEILLAT_1_23210_MOURIOUX_VIEILLEVILLE.pdf',
    keys: ['meillat_1', 'meillat 1', 'mourioux'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_MISSAULT_24800_SAINT_MARTIN_DE_FRESSENGEAS-mapie7_hotmail.fr.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_MISSAULT_24800_SAINT_MARTIN_DE_FRESSENGEAS-mapie7_hotmail.fr.pdf',
    keys: ['missault', 'saint martin', 'fressengeas', '24800'],
  },
  {
    fileName: 'Nouvelle_promesse_de_bail_batterie-brunogranger19_gmail.com.pdf',
    url: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie-brunogranger19_gmail.com.pdf',
    keys: ['granger', 'brunogranger'],
  },
  {
    fileName: 'Promesse_de_bail_CONSOLI_signe.pdf',
    url: '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf',
    keys: ['consoli'],
  },
  {
    fileName: 'Promesse_de_bail_LABEGUERIE_signe.pdf',
    url: '/documents/dataroom/Promesse_de_bail_LABEGUERIE_signe.pdf',
    keys: ['labeguerie', 'oregue'],
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
 * Gère les noms sans extension, avec tirets/underscores, ou avec mot-clé (ex: "BATIOT", "CASTEBRUNET").
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
    if (targetNorm.length >= 6 && itemNorm.includes(targetNorm)) {
      return item;
    }
    if (itemNorm.length >= 6 && targetNorm.includes(itemNorm)) {
      return item;
    }
  }

  // 3. Correspondance par mots-clés distinctifs (ex: Batiot, Castebrunet, Consoli, Labeguerie)
  for (const item of BUNDLED_DATAROOM_FILES) {
    const hasKeyMatch = item.keys.some((k) => {
      const kNorm = normalizeString(k);
      return kNorm.length >= 4 && targetNorm.includes(kNorm);
    });
    if (hasKeyMatch) {
      return item;
    }
  }

  // 4. Mappage pour les fiches génériques de promesses de bail si demandées
  if (targetNorm.includes('promessedebail') || targetNorm.includes('pdb')) {
    if (targetNorm.includes('bess') || targetNorm.includes('batterie') || targetNorm.includes('volta')) {
      // Représentatif BESS : BATIOT
      return BUNDLED_DATAROOM_FILES[0];
    }
    if (targetNorm.includes('ferme') || targetNorm.includes('pv') || targetNorm.includes('helios')) {
      // Représentatif PV : CONSOLI ou LABEGUERIE
      return BUNDLED_DATAROOM_FILES.find((f) => f.fileName.includes('CONSOLI')) || BUNDLED_DATAROOM_FILES[0];
    }
  }

  return null;
}
