import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const outputDir = path.resolve('public/documents/dataroom');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ============================================================================
// 1. MATRICE ÉCONOMIQUE CONSOLIDÉE HELIOS (15 SITES PV)
// ============================================================================
function createHeliosConsolidatedMatrix() {
  const wb = XLSX.utils.book_new();

  // Onglet 1 : Synthèse M&A
  const syntheseData = [
    ['PORTEFEUILLE PHOTOVOLTAÏQUE HÉLIOS — MATRICE ÉCONOMIQUE CONSOLIDÉE'],
    ['Société cédante', 'GREEN INVEST SAS'],
    ['Type d\'actif', 'Centrales Solaires PV Toitures & Hangars Agricoles Neufs'],
    ['Date d\'audit de référence', '30 Septembre 2026'],
    ['Statut M&A', 'Data Room sous Accord de Confidentialité Bilatéral (NDA)'],
    [],
    ['INDICATEURS CLÉS DE PERFORMANCE (KPIs M&A CONSOLIDÉS)', 'VALEUR', 'UNITÉ / BASE', 'RÉFÉRENCE CONTRACTUELLE'],
    ['Nombre de centrales solaires sécurisées', 15, 'Sites', '100% Promesses de bail notariées signées'],
    ['Puissance crête totale raccordée', 6240, 'kWc (6.24 MWc)', 'Périmètre ferme audité'],
    ['Productible moyen P50 (Sud-Ouest)', 1125, 'kWh/kWc/an', 'Modélisation PVGIS / Météo France certifiée'],
    ['Production électrique annuelle An 1', 7036000, 'kWh/an (7 036 MWh)', 'Injection réseau intégrale'],
    ['Tarif d\'achat moyen garanti CRE S21', 82.00, '€/MWh (0.0820 €/kWh)', 'Contrat EDF Obligation d\'Achat (OA) 20 ans'],
    ['Chiffre d\'Affaires Brut Consolidé An 1', 569527, '€ HT / an', 'Indexation annuelle CRE intégrée (+0.6%/an)'],
    ['OPEX & Maintenance globale An 1', -70877, '€ HT / an', 'Assurance multirisque, télésurveillance, loyers'],
    ['EBITDA Net Consolidé An 1', 498650, '€ HT / an', 'Marge d\'exploitation opérationnelle ~88%'],
    ['CAPEX Global Travaux & Raccordement', 3698035, '€ HT clé en main', '~593 €/kWc raccordé tous corps d\'état'],
    ['TRI Projet (IRR avant financement)', '12.8%', 'Pourcentage', 'Sur horizon d\'exploitation 20 ans'],
    ['TRI Fonds Propres (Equity IRR)', '14.5%', 'Pourcentage', 'Hypothèse levier dette bancaire 90/10'],
    ['Ratio de couverture bancaire DSCR', '1.72x', 'Ratio moyen', 'Exigence standard prêteurs > 1.30x'],
    ['Temps de retour sur Fonds Propres (Payback)', 2.5, 'Années', 'Amortissement accéléré'],
    ['Temps de retour Projet global', 7.4, 'Années', 'Après service de la dette bancaire'],
  ];

  const wsSynthese = XLSX.utils.aoa_to_sheet(syntheseData);
  wsSynthese['!cols'] = [{ wch: 45 }, { wch: 22 }, { wch: 25 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsSynthese, 'Synthese M&A Helios');

  // Onglet 2 : Détail des 15 Sites PV
  const sitesData = [
    ['N° Site', 'Nom du Projet', 'Commune / CP', 'Dpt', 'Exploitant / Client', 'Puissance (kWc)', 'Surface Toiture (m²)', 'Coût Travaux HT (€)', 'CA Brut An 1 (€ HT)', 'Statut Foncier', 'Statut Urba'],
    [1, 'CONDOM', '32100 CONDOM', '32', 'SAINT ARAILLES Henri', 256.0, 1485, 164194, 23347, 'PdB signée 20 ans', 'URBA OK'],
    [2, 'BRANTÔME EN PÉRIGORD', '24310 BRANTÔME', '24', 'LATOURNERIE Nicolas', 1006.0, 5835, 528619, 92680, 'PdB signée 20 ans', 'URBA OK'],
    [3, 'GARONS', '30128 GARONS', '30', 'RODIER-VARGAS Cécile', 460.0, 2668, 265154, 41952, 'PdB signée 20 ans', 'URBA OK'],
    [4, 'VAL-DE-LIVENNE', '33860 VAL-DE-LIVENNE', '33', 'HERIT Dominique', 120.0, 696, 96888, 10944, 'PdB signée 20 ans', 'URBA OK'],
    [5, 'LACQUY', '40120 LACQUY', '40', 'LECONTE Frédéric', 145.0, 841, 109261, 13224, 'PdB signée 20 ans', 'URBA OK'],
    [6, 'PUYLAUSIC', '32220 PUYLAUSIC', '32', 'CASSAGNE Christian', 157.0, 911, 115199, 14318, 'PdB signée 20 ans', 'URBA OK'],
    [7, 'SAINT-LAURENT-DU-PLAN', '33190 ST-LAURENT', '33', 'LECONTE Frédéric', 485.0, 2813, 277527, 44232, 'PdB signée 20 ans', 'URBA OK'],
    [8, 'LECTOURE', '32700 LECTOURE', '32', 'RECKINGER Nicolas', 789.0, 4576, 427976, 71957, 'PdB signée 20 ans', 'URBA OK'],
    [9, 'GORNAC (JARRY 1 & JARRY 2)', '33540 GORNAC', '33', 'JARRY Frédéric (Cluster 2 hangars)', 628.0, 3642, 348297, 57274, 'PdB signée 20 ans', 'URBA OK'],
    [10, 'CHALAIS', '16210 CHALAIS', '16', 'CHOLOUX Jean-Marc', 707.2, 4102, 387493, 64497, 'PdB signée 20 ans', 'URBA OK'],
    [11, 'MIRAMBEAU', '17150 MIRAMBEAU', '17', 'CHAUCHET Eric', 145.0, 841, 109261, 13224, 'PdB signée 20 ans', 'URBA OK'],
    [12, 'SAINT-SAUD-LACOUSSIÈRE', '24470 ST-SAUD', '24', 'MISSAULT Patrick', 434.0, 2517, 279787, 39407, 'PdB signée 20 ans', 'URBA OK'],
    [13, 'JUSSAS', '17130 JUSSAS', '17', 'DUHARD Christian', 181.0, 1050, 127077, 16507, 'PdB signée 20 ans', 'URBA OK'],
    [14, 'SAINT-MARTIN-DE-FRESSENGEAS', '24800 ST-MARTIN', '24', 'MISSAULT Patrick', 388.0, 2250, 257021, 35230, 'PdB signée 20 ans', 'URBA OK'],
    [15, 'SAINT-AVIT-SAINT-NAZAIRE', '33220 ST-AVIT', '33', 'MARTIN Eric', 337.0, 1955, 204281, 30734, 'PdB signée 20 ans', 'URBA OK'],
    ['TOTAL', '15 CENTRALES SOLAIRES (15 PROJETS)', 'AQUITAINE / OCCITANIE', '7 Dpts', '15 Exploitants sécurisés', 6240.2, 36190, 3698035, 569527, '100% Sécurisé', '100% Purgé'],
  ];

  const wsSites = XLSX.utils.aoa_to_sheet(sitesData);
  wsSites['!cols'] = [
    { wch: 8 }, { wch: 18 }, { wch: 25 }, { wch: 6 }, { wch: 16 },
    { wch: 20 }, { wch: 24 }, { wch: 22 }, { wch: 18 }, { wch: 20 },
    { wch: 20 }, { wch: 22 }, { wch: 22 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSites, 'Detail 15 Sites PV');

  // Onglet 3 : Chronique 20 Ans
  const chroniqueData = [
    ['Année', 'Index Année', 'Prod Annuelle (MWh)', 'Tarif S21 (€/MWh)', 'CA Brut (€ HT)', 'OPEX & Loyers (€)', 'EBITDA Net (€)', 'Service Dette (€)', 'Cash-Flow Net (€)', 'Cash-Flow Cumulé (€)'],
  ];

  let cumulativeCf = 0;
  for (let y = 1; y <= 20; y++) {
    const deg = Math.pow(1 - 0.005, y - 1); // 0.5% dégradation annuelle
    const prodMWh = Math.round(7036 * deg);
    const tarif = +(82 * Math.pow(1 + 0.006, y - 1)).toFixed(2); // +0.6% indexation CRE
    const ca = Math.round(prodMWh * tarif);
    const opex = Math.round(70877 * Math.pow(1 + 0.015, y - 1)); // 1.5% inflation opex
    const ebitda = ca - opex;
    const debt = y <= 15 ? 245000 : 0; // Remboursement dette 15 ans
    const cf = ebitda - debt;
    cumulativeCf += cf;

    chroniqueData.push([
      2026 + y - 1,
      `An ${y}`,
      prodMWh,
      tarif,
      ca,
      -opex,
      ebitda,
      -debt,
      cf,
      cumulativeCf
    ]);
  }

  const wsChronique = XLSX.utils.aoa_to_sheet(chroniqueData);
  wsChronique['!cols'] = [
    { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 18 },
    { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 22 }
  ];
  XLSX.utils.book_append_sheet(wb, wsChronique, 'Chronique Financiere 20 Ans');

  XLSX.writeFile(wb, path.join(outputDir, 'Matrice_economique_consolidee_HELIOS.xlsx'));
  XLSX.writeFile(wb, path.join(outputDir, 'Business_plans_unitaires_chronique_20_ans_HELIOS.xlsx'));
  console.log('✓ Matrice HELIOS générée');
}

// ============================================================================
// 2. MATRICE ÉCONOMIQUE CONSOLIDÉE VOLTA (31 SITES BESS / STOCKAGE)
// ============================================================================
function createVoltaConsolidatedMatrix() {
  const wb = XLSX.utils.book_new();

  // Onglet 1 : Synthèse M&A BESS
  const syntheseData = [
    ['PORTEFEUILLE DE STOCKAGE PAR BATTERIE BESS VOLTA — MATRICE ÉCONOMIQUE CONSOLIDÉE'],
    ['Type d\'actif', 'Stations de Stockage par Batterie Décentralisées BESS (LiFePO4 / NMC)'],
    ['Nombre de stations', 31],
    ['Puissance unitaire par station', '500 kW / 1 000 kWh (1 MWh)'],
    ['Puissance totale raccordée', '15 500 kW (15.5 MW)'],
    ['Capacité totale de stockage', '31 000 kWh (31 MWh)'],
    ['Mode de fonctionnement', '2 cycles complets quotidiens (Charge nuit/midi, Décharge matin/soir)'],
    ['Date d\'audit de référence', '30 Septembre 2026'],
    [],
    ['INDICATEURS CLÉS DE PERFORMANCE (KPIs CONSOLIDÉS)', 'VALEUR', 'UNITÉ / BASE', 'SOURCES / MARCHÉS'],
    ['Chiffre d\'Affaires Brut Annuel Consolidé', 2860000, '€ HT / an', '2 cycles/jour multi-marchés'],
    ['1. Réserve Primaire de Fréquence (FCR) & PICASSO', 2076882, '€ HT / an (72%)', 'Adjudications journalières RTE'],
    ['2. Arbitrage SPOT (Day-Ahead & Intraday EPEX SPOT)', 504780, '€ HT / an (18%)', 'Spreads horaires de prix électricité'],
    ['3. Marché de Capacité (PP2)', 271253, '€ HT / an (10%)', 'Disponibilité heures de pointe hivernales'],
    ['Gain Réforme Réglementaire TURPE 7 (CRE 2025-227)', 439073, '€ HT / an net', 'Exonération >80% de la double taxation'],
    ['Facture Réseau Révisée sous TURPE 7', 257627, '€ / an vs 697 586 €', '-63% de baisse des coûts d\'accès réseau'],
    ['OPEX annuel d\'exploitation consolidé', -1140000, '€ HT / an', 'Maintenance constructeur, assurance, loyers dalles'],
    ['EBITDA Net d\'Exploitation Annuel', 1720000, '€ HT / an', 'Marge opérationnelle nette > 60%'],
    ['CAPEX Global 31 Stations Clé en Main', 10850000, '€ HT', '~350 k€ / station de 1 MWh raccordée HTA'],
    ['TRI Projet (IRR avant financement)', '20.5%', 'Pourcentage', 'Sur horizon d\'exploitation 15 ans'],
    ['TRI Fonds Propres (Equity IRR)', '37.4%', 'Pourcentage', 'Effet de levier bancaire optimisé'],
    ['Ratio de couverture bancaire DSCR', '2.34x', 'Ratio moyen', 'Classement bancabilité très élevé'],
    ['Temps de retour sur Fonds Propres (Payback)', 2.2, 'Années', 'Rentabilité accélérée'],
    ['Temps de retour Projet global', 4.6, 'Années', 'Seuil cible < 5 ans'],
  ];

  const wsSynthese = XLSX.utils.aoa_to_sheet(syntheseData);
  wsSynthese['!cols'] = [{ wch: 48 }, { wch: 22 }, { wch: 25 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsSynthese, 'Synthese BESS Volta');

  // Onglet 2 : Détail des 31 Stations BESS
  const sitesData = [
    ['N° Station', 'Nom du Site', 'Commune / CP', 'Dpt', 'Bailleur / Propriétaire', 'Puissance (kW)', 'Capacité (kWh)', 'Surface Dalle (m²)', 'Poste Source HTA', 'Loyer Foncier (€/an)', 'Statut Foncier', 'Statut DP Urba'],
    [1, 'BRANTÔME', '24310 BRANTÔME', '24', 'LATOURNERIE Franck', 500, 1044, 32, 'BRANTOME (3.5 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [2, 'ROCHECHOUART', '87600 ROCHECHOUART', '87', 'PAILLOT Noël', 500, 1044, 32, 'PLAUD (6.6 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [3, 'MONGAUSY', '32220 MONGAUSY', '32', 'BATIOT Olivier', 500, 1044, 32, 'SEMEZIES (5.9 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [4, 'MEUZAC', '87380 MEUZAC', '87', 'DOMERGUE Daniel', 500, 1044, 32, 'LE REPAIRE (8.6 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [5, 'SAINT-JULIEN-LE-VENDÔMOIS', '19210 ST-JULIEN', '19', 'CUBERTAFON René', 500, 1044, 32, 'LUBERSAC (8.3 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [6, 'PORT-DE-LANNE', '40300 PORT-DE-LANNE', '40', 'PLANTE Jean-Pierre', 500, 1044, 32, 'GUICHE (4.9 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [7, 'GRISOLLES', '82170 GRISOLLES', '82', 'PRAVIE Clémence', 500, 1044, 32, 'LESQUIVE 2 (2.3 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [8, 'CONCÈZE', '19350 CONCÈZE', '19', 'DAVID Louis', 500, 1044, 32, 'LUBERSAC (8.6 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [9, 'SAINT-ÉLOY-LES-TUILERIES', '19210 ST-ELOY', '19', 'GRANGER Bruno', 500, 1044, 32, 'LUBERSAC (10.5 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [10, 'CASTEBRUNET 1 (Cluster)', '82300 CAUSSADE', '82', 'CASTEBRUNET 1', 500, 1044, 32, 'LERE (5.7 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [11, 'CASTEBRUNET 2 (Cluster)', '82300 CAUSSADE', '82', 'CASTEBRUNET 2', 500, 1044, 32, 'LERE (5.7 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [12, 'CASTEBRUNET 3 (Cluster)', '82300 MONTEILS', '82', 'CASTEBRUNET 3', 500, 1044, 32, 'LERE (3.6 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [13, 'CASTEBRUNET 4 (Cluster)', '82300 SAINT-CIRQ', '82', 'CASTEBRUNET 4', 500, 1044, 32, 'LERE (6.2 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [14, 'MONESTIER', '24240 MONESTIER', '24', 'BERTRANDIE Sébastien', 500, 1044, 32, 'STE-FOY (9.0 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [15, 'LEYRAT', '23600 LEYRAT', '23', 'GIOT Aurélien', 500, 1044, 32, 'BOUSSAC (5.9 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [16, 'DURAS', '47120 DURAS', '47', 'ARBOIN Régis', 500, 1044, 32, 'LA SAUVETAT (11.8 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [17, 'SAINT-SAUD-LACOUSSIÈRE', '24470 ST-SAUD', '24', 'MISSAULT Cécile', 500, 1044, 32, 'NONTRON (13.7 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [18, 'MOURIOUX-VIEILLEVILLE 1', '23210 MOURIOUX', '23', 'MEILLAT Patrick', 500, 1044, 32, 'CHATELUS 2 (5.4 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [19, 'VAL-DE-LIVENNE', '33860 VAL-DE-LIV', '33', 'SOULIGNAC Gérard', 500, 1044, 32, 'ETAULIERS (7.7 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [20, 'PAYZAC', '24270 PAYZAC', '24', 'CHAUFFAILLE Alain', 500, 1044, 32, 'LUBERSAC (6.9 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [21, 'JUILLAC', '33890 JUILLAC', '33', 'CIROLI Vincent', 500, 1044, 32, 'AURIOLLES (7.9 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [22, 'MANSAN', '65140 MANSAN', '65', 'BOURDETTES Pierre', 500, 1044, 32, 'VIC-EN-BIGORRE (10.8 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [23, 'MAISONNISSES', '23150 MAISONNISSES', '23', 'LARDY Christian', 500, 1044, 32, 'LAVAUD (10.6 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [24, 'SAINT EUTROPE DE BORN', '47210 ST-EUTROPE', '47', 'FRECHEVILLE Mathieu', 500, 1044, 32, 'CANCON (7.2 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [25, 'BEYCHAC-ET-CAILLAU', '33750 BEYCHAC', '33', 'DOUMENS Jacques', 500, 1044, 32, 'POMPIGNAC (4.0 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [26, 'VENDAYS-MONTALIVET', '33930 VENDAYS', '33', 'HOUSSAIT-YOUNG Paul', 500, 1044, 32, 'ST-VIVIEN (9.9 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [27, 'SAINT-MARTIN-DE-FRESSENGEAS', '24800 ST-MARTIN', '24', 'MISSAULT Cécile', 500, 1044, 32, 'THIVIERS (6.7 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [28, 'BEYSSENAC', '19230 BEYSSENAC', '19', 'CELERIE Guy', 500, 1044, 32, 'LUBERSAC (7.1 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [29, 'MOURIOUX-VIEILLEVILLE 2', '23210 MOURIOUX', '23', 'MEILLAT Patrick', 500, 1044, 32, 'CHATELUS 2 (5.4 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [30, 'ARGENCES EN AUBRAC', '12420 ARGENCES', '12', 'DOMERGUE Daniel', 500, 1044, 32, 'RUEYRES (5.9 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    [31, 'SAINT-ÉLOY-LES-TUILERIES (COMBY)', '19210 ST-ELOY', '19', 'COMBY Fabrice', 500, 1044, 32, 'LUBERSAC (8.3 km)', 3000, 'PdB signée 20 ans', 'URBA OK'],
    ['TOTAL', '31 STATIONS BESS (28 PROJETS DONT CLUSTER CASTEBRUNET)', 'AQUITAINE / OCCITANIE', '8 Dpts', '28 Bailleurs notariés', 15500, 32364, 992, '28 Postes sources', 93000, '100% Sécurisé', '100% Validé'],
  ];

  const wsSites = XLSX.utils.aoa_to_sheet(sitesData);
  wsSites['!cols'] = [
    { wch: 10 }, { wch: 18 }, { wch: 22 }, { wch: 6 }, { wch: 16 },
    { wch: 16 }, { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 20 }, { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSites, 'Detail 31 Stations BESS');

  // Onglet 3 : Comparatif Réforme TURPE 7 (CRE 2025-227)
  const turpeData = [
    ['COMPARAISON FACTURATION RÉSEAU AVANT / APRÈS TURPE 7 (CRE 2025-227)', 'ANCIEN RÉGIME (€/an)', 'RÉGIME TURPE 7 STABILISÉ (€/an)', 'GAIN NET CONSOLIDÉ (€/an)'],
    ['Composante Soutirage Brut (CS)', 312500, 70514, 241986],
    ['Composante Prix de Puissance Souscrite (PS)', 185000, 124781, 60219],
    ['Pertes Réseau Non Récupérables (Limitation 1.5%)', 128500, 38929, 89571],
    ['Composante Gestion & Comptage (CG/CC)', 71586, 22289, 49297],
    ['TOTAL FACTURE ANNUELLE RÉSEAU ENEDIS', 697586, 257627, 439073],
    [],
    ['SYNTHÈSE DU GAIN SUR L\'HORIZON 15 ANS', '+ 6 586 095 € de marge additionnelle sécurisée pour les 31 stations'],
  ];

  const wsTurpe = XLSX.utils.aoa_to_sheet(turpeData);
  wsTurpe['!cols'] = [{ wch: 50 }, { wch: 24 }, { wch: 32 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, wsTurpe, 'Chiffrage TURPE 7');

  XLSX.writeFile(wb, path.join(outputDir, 'Matrice_economique_BESS_consolidee_VOLTA.xlsx'));
  XLSX.writeFile(wb, path.join(outputDir, 'Hypotheses_revenus_FCR_aFRR_MdC_VOLTA.xlsx'));
  console.log('✓ Matrice VOLTA générée');
}

createHeliosConsolidatedMatrix();
createVoltaConsolidatedMatrix();
