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

createHeliosConsolidatedMatrix();

