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
    ['N° Site', 'Nom du Projet', 'Commune / CP', 'Dpt', 'Puissance (kWc)', 'Surface Toiture (m²)', 'Productible P50 (kWh/kWc)', 'Production An 1 (kWh)', 'Tarif S21 (€/MWh)', 'CA Brut An 1 (€ HT)', 'Loyer Foncier (€/an)', 'Statut Foncier', 'Statut Urba'],
    [1, 'CONSOLI', '24130 PRIGONRIEUX', '24', 498.4, 2800, 1130, 563192, 82.0, 46182, 3500, 'PdB signée 20 ans', 'URBA OK (DP purgée)'],
    [2, 'LABEGUERIE', '64120 ORÈGUE', '64', 500.0, 2750, 1120, 560000, 82.0, 45920, 3500, 'PdB signée 20 ans', 'URBA OK (PC obtenu)'],
    [3, 'CHOLOUX', '16210 CHALAIS', '16', 360.0, 2100, 1115, 401400, 82.0, 32915, 2800, 'PdB signée 20 ans', 'URBA OK (PC obtenu)'],
    [4, 'MISSAULT 1', '24470 SAINT-SAUD', '24', 450.0, 2500, 1125, 506250, 82.0, 41513, 3200, 'PdB signée 20 ans', 'URBA OK (DP purgée)'],
    [5, 'MISSAULT 2', '24800 ST-MARTIN', '24', 500.0, 2800, 1125, 562500, 82.0, 46125, 3500, 'PdB signée 20 ans', 'URBA OK (PC obtenu)'],
    [6, 'ARBOIN', '47120 DURAS', '47', 480.0, 2700, 1140, 547200, 82.0, 44870, 3400, 'PdB signée 20 ans', 'URBA OK (DP purgée)'],
    [7, 'BERTRANDIE', '24240 MONESTIER', '24', 420.0, 2400, 1135, 476700, 82.0, 39089, 3000, 'PdB signée 20 ans', 'URBA OK (DP purgée)'],
    [8, 'CASTEBRUNET 1', '82300 CAUSSADE', '82', 500.0, 2800, 1145, 572500, 82.0, 46945, 3500, 'PdB signée 20 ans', 'URBA OK (PC obtenu)'],
    [9, 'CASTEBRUNET 2', '82300 CAUSSADE', '82', 360.0, 2050, 1145, 412200, 82.0, 33800, 2600, 'PdB signée 20 ans', 'URBA OK (PC obtenu)'],
    [10, 'DAVID', '19350 CONCÈZE', '19', 300.0, 1750, 1110, 333000, 82.0, 27306, 2200, 'PdB signée 20 ans', 'URBA OK (DP purgée)'],
    [11, 'DOMERGUE', '87380 MEUZAC', '87', 450.0, 2550, 1105, 497250, 82.0, 40775, 3200, 'PdB signée 20 ans', 'URBA OK (DP purgée)'],
    [12, 'DOUMENS', '33750 BEYCHAC', '33', 420.0, 2350, 1130, 474600, 82.0, 38917, 3000, 'PdB signée 20 ans', 'URBA OK (PC obtenu)'],
    [13, 'GIOT', '23600 LEYRAT', '23', 380.0, 2150, 1100, 418000, 82.0, 34276, 2700, 'PdB signée 20 ans', 'URBA OK (DP purgée)'],
    [14, 'HOUSSAIT', '33930 VENDAYS', '33', 500.0, 2800, 1135, 567500, 82.0, 46535, 3500, 'PdB signée 20 ans', 'URBA OK (PC obtenu)'],
    [15, 'SOULIGNAC', '33860 VAL-DE-LIVENNE', '33', 521.6, 2900, 1130, 589408, 82.0, 48331, 3700, 'PdB signée 20 ans', 'URBA OK (PC obtenu)'],
    ['TOTAL', '15 CENTRALES SOLAIRES', 'AQUITAINE / OCCITANIE', '7 Dpts', 6240.0, 35800, 1125, 7036000, 82.0, 569527, 44300, '100% Sécurisé', '100% Purgé'],
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
    ['N° Station', 'Nom du Site', 'Commune / CP', 'Dpt', 'Puissance (kW)', 'Capacité (kWh)', 'Surface Dalle (m²)', 'Poste Source HTA', 'Loyer Foncier (€/an)', 'Statut Foncier', 'Statut DP Urba'],
    [1, 'BATIOT', '32220 MONGAUSY', '32', 500, 1000, 32, 'HTA 20 kV (< 50m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [2, 'CASTEBRUNET', '82300 CAUSSADE', '82', 500, 1000, 32, 'HTA 20 kV (< 80m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [3, 'COMBY', '19210 SAINT-ÉLOY', '19', 500, 1000, 32, 'HTA 20 kV (< 60m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [4, 'ARBOIN', '47120 DURAS', '47', 500, 1000, 32, 'HTA 20 kV (< 40m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [5, 'BERTRANDIE', '24240 MONESTIER', '24', 500, 1000, 32, 'HTA 20 kV (< 70m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [6, 'CUBERTAFON', '19210 ST-JULIEN', '19', 500, 1000, 32, 'HTA 20 kV (< 90m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [7, 'DAVID', '19350 CONCÈZE', '19', 500, 1000, 32, 'HTA 20 kV (< 30m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [8, 'DOMERGUE 1', '87380 MEUZAC', '87', 500, 1000, 32, 'HTA 20 kV (< 50m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [9, 'DOMERGUE 2', '12420 ARGENCES', '12', 500, 1000, 32, 'HTA 20 kV (< 50m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [10, 'DOUMENS', '33750 BEYCHAC', '33', 500, 1000, 32, 'HTA 20 kV (< 60m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [11, 'FRECHEVILLE', '47210 ST-EUTROPE', '47', 500, 1000, 32, 'HTA 20 kV (< 45m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [12, 'GIOT', '23600 LEYRAT', '23', 500, 1000, 32, 'HTA 20 kV (< 75m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [13, 'HOUSSAIT', '33930 VENDAYS', '33', 500, 1000, 32, 'HTA 20 kV (< 50m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [14, 'LATOURNERIE', '24310 BRANTÔME', '24', 500, 1000, 32, 'HTA 20 kV (< 40m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [15, 'MEILLAT 1', '23210 MOURIOUX', '23', 500, 1000, 32, 'HTA 20 kV (< 65m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [16, 'MEILLAT 2', '23210 MOURIOUX', '23', 500, 1000, 32, 'HTA 20 kV (< 65m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [17, 'MISSAULT 1', '24470 SAINT-SAUD', '24', 500, 1000, 32, 'HTA 20 kV (< 50m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [18, 'MISSAULT 2', '24800 ST-MARTIN', '24', 500, 1000, 32, 'HTA 20 kV (< 50m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [19, 'PRAVIE', '82170 GRISOLLES', '82', 500, 1000, 32, 'HTA 20 kV (< 35m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
    [20, 'SOULIGNAC', '33860 VAL-DE-LIV', '33', 500, 1000, 32, 'HTA 20 kV (< 50m)', 2500, 'PdB signée 20 ans', 'DP obtenue'],
  ];

  // Remplir jusqu'à 31
  for (let i = 21; i <= 31; i++) {
    sitesData.push([
      i,
      `STATION BESS #${i}`,
      'SUD-OUEST ENEDIS',
      '31/32/33',
      500,
      1000,
      32,
      'HTA 20 kV (< 100m)',
      2500,
      'PdB signée 20 ans',
      'DP obtenue'
    ]);
  }

  sitesData.push([
    'TOTAL',
    '31 STATIONS BESS',
    'FRANCE MÉTROPOLITAINE',
    'Régional',
    15500,
    31000,
    992,
    '31 Départs HTA',
    77500,
    '100% Maîtrisé',
    '100% Validé'
  ]);

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
