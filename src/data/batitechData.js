/**
 * Data structures for the BatiTech multi-material dryer simulator.
 */

export const BATITECH_MODELS = [
  {
    id: '3.1.15',
    label: 'BatiTech 3.1.15',
    name: 'BatiTech 3.1.15',
    travees: 3,
    traveeWidth: 6,
    cells: 1,
    cellSize: '6×15m',
    cellArea: 90,
    kWc: 30.15,
    kwc: 30.15,
    panels: 90,
    panelConfig: '9 lignes × 10 colonnes',
    ventilators: 1,
    ventilatorPower: 18.5,
    totalVentPower: 18.5,
    dimensions: { width: 18, depth: 20.03, eaveHeight: 3.88 },
    investment: { barconniere: 217822, base: 77386, solairePC: 31845, total: 327053 }
  },
  {
    id: '6.2.15',
    label: 'BatiTech 6.2.15',
    name: 'BatiTech 6.2.15',
    travees: 6,
    traveeWidth: 6,
    cells: 2,
    cellSize: '6×15m',
    cellArea: 180,
    kWc: 63.3,
    kwc: 63.3,
    panels: 189,
    panelConfig: '9 lignes × 21 colonnes',
    ventilators: 2,
    ventilatorPower: 18.5,
    totalVentPower: 37,
    dimensions: { width: 36, depth: 20.03, eaveHeight: 3.88 },
    investment: { barconniere: 380751, base: 137296, solairePC: 46939, total: 564986 }
  },
  {
    id: '8.3.15',
    label: 'BatiTech 8.3.15',
    name: 'BatiTech 8.3.15',
    travees: 8,
    traveeWidth: 6,
    cells: 3,
    cellSize: '6×15m',
    cellArea: 270,
    kWc: 93.8,
    kwc: 93.8,
    panels: 280,
    panelConfig: '10 lignes × 28 colonnes',
    ventilators: 3,
    ventilatorPower: 18.5,
    totalVentPower: 55.5,
    dimensions: { width: 48, depth: 20.03, eaveHeight: 3.88 },
    investment: { barconniere: 514302, base: 194220, solairePC: 55979, total: 764501 }
  }
];

export const BATITECH_MODELS_MAP = {
  '3.1.15': BATITECH_MODELS[0],
  '6.2.15': BATITECH_MODELS[1],
  '8.3.15': BATITECH_MODELS[2],
  'batitech_3_1_15': BATITECH_MODELS[0],
  'batitech_6_2_15': BATITECH_MODELS[1],
  'batitech_8_3_15': BATITECH_MODELS[2]
};

export const CEE_PREMIUMS = {
  '3.1.15': {
    agricole: { H1: 16010, H2: 18185, H3: 20885 },
    forestiere: { H1: 38470, H2: 43770, H3: 50280 }
  },
  '6.2.15': {
    agricole: { H1: 33620, H2: 38190, H3: 43860 },
    forestiere: { H1: 80790, H2: 91815, H3: 105595 }
  },
  '8.3.15': {
    agricole: { H1: 49810, H2: 56575, H3: 64975 },
    forestiere: { H1: 119690, H2: 136020, H3: 156435 }
  },
  batitech_3_1_15: {
    agricole: { H1: 16010, H2: 18185, H3: 20885 },
    forestiere: { H1: 38470, H2: 43770, H3: 50280 }
  },
  batitech_6_2_15: {
    agricole: { H1: 33620, H2: 38190, H3: 43860 },
    forestiere: { H1: 80790, H2: 91815, H3: 105595 }
  },
  batitech_8_3_15: {
    agricole: { H1: 49810, H2: 56575, H3: 64975 },
    forestiere: { H1: 119690, H2: 136020, H3: 156435 }
  }
};

export const CLIMATE_ZONES_BY_DEPARTMENT = {
  // H1
  '01': 'H1', '02': 'H1', '03': 'H1', '05': 'H1', '08': 'H1', '10': 'H1', '14': 'H1', '15': 'H1',
  '19': 'H1', '21': 'H1', '23': 'H1', '25': 'H1', '27': 'H1', '28': 'H1', '36': 'H1', '38': 'H1',
  '39': 'H1', '42': 'H1', '43': 'H1', '45': 'H1', '51': 'H1', '52': 'H1', '54': 'H1', '55': 'H1',
  '57': 'H1', '58': 'H1', '59': 'H1', '60': 'H1', '61': 'H1', '62': 'H1', '63': 'H1', '67': 'H1',
  '68': 'H1', '69': 'H1', '70': 'H1', '71': 'H1', '73': 'H1', '74': 'H1', '75': 'H1', '76': 'H1',
  '77': 'H1', '78': 'H1', '80': 'H1', '87': 'H1', '88': 'H1', '89': 'H1', '90': 'H1', '91': 'H1',
  '92': 'H1', '93': 'H1', '94': 'H1', '95': 'H1', '975': 'H1',
  
  // H2
  '04': 'H2', '07': 'H2', '09': 'H2', '12': 'H2', '16': 'H2', '17': 'H2', '18': 'H2', '22': 'H2',
  '24': 'H2', '26': 'H2', '29': 'H2', '31': 'H2', '32': 'H2', '33': 'H2', '35': 'H2', '37': 'H2',
  '40': 'H2', '41': 'H2', '44': 'H2', '46': 'H2', '47': 'H2', '48': 'H2', '49': 'H2', '50': 'H2',
  '53': 'H2', '56': 'H2', '64': 'H2', '65': 'H2', '72': 'H2', '79': 'H2', '81': 'H2', '82': 'H2',
  '84': 'H2', '85': 'H2', '86': 'H2',

  // H3
  '06': 'H3', '11': 'H3', '13': 'H3', '20': 'H3', '2A': 'H3', '2B': 'H3', '30': 'H3', '34': 'H3',
  '66': 'H3', '83': 'H3', '971': 'H3', '972': 'H3', '973': 'H3', '974': 'H3', '976': 'H3'
};

export const DRYING_ZONES = {
  A: 'Highest ensoleillement (southern Mediterranean)',
  B: 'High ensoleillement',
  C: 'Medium ensoleillement',
  D: 'Lowest ensoleillement (northern)'
};

export const DRYING_CAPACITIES = {
  batitech_3_1_15: {
    fourrageVrac: {
      'HR 50-15': { A: 140, B: 230, C: 280, D: 410 },
      'HR 45-15': { A: 180, B: 300, C: 360, D: 520 },
      'HR 40-15': { A: 230, B: 390, C: 480, D: 690 }
    },
    bottesCarrees: {
      '50j HR 35-15': { A: 120, B: 140, C: 160, D: 190 },
      '81j HR 35-15': { A: 180, B: 210, C: 250, D: 300 }
    },
    cereales: {
      'Blé tendre 15j HR 15-12': { A: 260, B: 270, C: 280, D: 290 },
      'Maïs 37j HR 35-15': { A: 50, B: 60, C: 60, D: 70 }
    },
    plaquettes: {
      'HR 50-30': { A: 390, B: 410, C: 430, D: 460 },
      'HR 45-25': { A: 420, B: 450, C: 470, D: 500 },
      'HR 40-15': { A: 370, B: 390, C: 410, D: 440 }
    }
  },
  batitech_6_2_15: {
    fourrageVrac: {
      'HR 50-15': { A: 250, B: 500, C: 600, D: 890 },
      'HR 45-15': { A: 370, B: 640, C: 760, D: 1100 },
      'HR 40-15': { A: 490, B: 830, C: 1000, D: 1440 }
    },
    bottesCarrees: {
      '50j HR 35-15': { A: 250, B: 270, C: 340, D: 380 },
      '81j HR 35-15': { A: 370, B: 420, C: 510, D: 600 }
    },
    cereales: {
      'Blé tendre 15j': { A: 550, B: 540, C: 560, D: 580 },
      'Maïs 37j': { A: 100, B: 110, C: 110, D: 140 }
    },
    plaquettes: {
      'HR 50-30': { A: 780, B: 810, C: 860, D: 920 },
      'HR 45-25': { A: 820, B: 900, C: 950, D: 1010 },
      'HR 40-15': { A: 750, B: 790, C: 830, D: 880 }
    }
  },
  batitech_8_3_15: {
    fourrageVrac: {
      'HR 50-15': { A: 420, B: 730, C: 880, D: 1270 },
      'HR 45-15': { A: 550, B: 980, C: 1140, D: 1630 },
      'HR 40-15': { A: 720, B: 1220, C: 1490, D: 2130 }
    },
    bottesCarrees: {
      '50j HR 35-15': { A: 350, B: 410, C: 480, D: 580 },
      '81j HR 35-15': { A: 550, B: 640, C: 750, D: 910 }
    },
    cereales: {
      'Blé tendre 15j': { A: 790, B: 810, C: 840, D: 860 },
      'Maïs 37j': { A: 140, B: 160, C: 200, D: 210 }
    },
    plaquettes: {
      'HR 50-30': { A: 1150, B: 1220, C: 1290, D: 1370 },
      'HR 45-25': { A: 1260, B: 1340, C: 1400, D: 1510 },
      'HR 40-15': { A: 1120, B: 1170, C: 1240, D: 1310 }
    }
  }
};

DRYING_CAPACITIES['3.1.15'] = DRYING_CAPACITIES.batitech_3_1_15;
DRYING_CAPACITIES['6.2.15'] = DRYING_CAPACITIES.batitech_6_2_15;
DRYING_CAPACITIES['8.3.15'] = DRYING_CAPACITIES.batitech_8_3_15;

export const VENTILATOR_COSTS = {
  50: { hours: 600, kWh: 8880, cost: 1421 },
  80: { hours: 960, kWh: 14208, cost: 2273 },
  15: { hours: 180, kWh: 2664, cost: 426 },
  37: { hours: 444, kWh: 6571, cost: 1051 },
  324: { hours: 3888, kWh: 57542, cost: 9207 }
};
export const ELECTRICITY_RATE = 0.16;

export const ORIENTATION_COEFFICIENTS = {
  0:  { EST: 0.93, 'SUD-EST': 0.93, SUD: 0.93, 'SUD-OUEST': 0.93, OUEST: 0.93 },
  30: { EST: 0.90, 'SUD-EST': 0.96, SUD: 1.00, 'SUD-OUEST': 0.96, OUEST: 0.90 },
  60: { EST: 0.78, 'SUD-EST': 0.88, SUD: 0.91, 'SUD-OUEST': 0.88, OUEST: 0.78 },
  90: { EST: 0.55, 'SUD-EST': 0.66, SUD: 0.68, 'SUD-OUEST': 0.66, OUEST: 0.55 }
};

export const PRODUCTIBLE_BY_REGION = {
  '1200': ['04', '05', '06', '13', '83', '84', '20', '2A', '2B'],
  '1150': ['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81', '82', '07', '26', '01', '38', '42', '43', '63', '69', '73', '74', '03', '15', '16', '17', '19', '23', '24', '33', '40', '47', '64', '79', '86', '87'],
  '1100': ['22', '29', '35', '56', '44', '49', '53', '72', '85', '18', '28', '36', '37', '41', '45', '21', '25', '39', '58', '70', '71', '89', '90'],
  '1050': ['14', '27', '50', '61', '76', '75', '77', '78', '91', '92', '93', '94', '95', '08', '10', '51', '52', '54', '55', '57', '67', '68', '88', '02', '59', '60', '62', '80']
};

export const STORAGE_CAPACITIES = {
  foinVrac: { masseVolumique: 0.08, hauteurChargement: 2.0 },
  bleTendre: { masseVolumique: 0.77, hauteurChargement: 0.8 },
  mais: { masseVolumique: 0.72, hauteurChargement: 1.5 },
  plaquettes: { masseVolumique: 0.30, hauteurChargement: 2.5 },
  bottesCarrees: { dimensions: '2.4×1.2×0.9m', poids: 400 }
};

export const DRYING_PERIODS = {
  fourrage50j: { mai: 60, juin: 55, juillet: 30, aout: 0, septembre: 20 },
  fourrage81j: { avril: 40, mai: 10, juin: 70, juillet: 60, aout: 20, septembre: 50 },
  bleTendre15j: { aout: 50 },
  mais37j: { octobre: 50, novembre: 70 },
  plaquettes324j: { jan: 90, feb: 90, mar: 90, apr: 90, mai: 50, jun: 50, jul: 50, aug: 90, sep: 90, oct: 90, nov: 90, dec: 90 }
};

export const TARIF_RACHAT_EDF_OA = 0.085;

/**
 * Mapping of departments to drying/ensoleillement zones (A=best, D=least)
 * Based on the ensoleillement map from the BatiTech catalog.
 * Zone A: Mediterranean / PACA / Corsica (1200-1400 kWh/kWc)
 * Zone B: Southern France / Rhône-Alpes / Aquitaine (1100-1200 kWh/kWc)
 * Zone C: Central / Western France (1000-1100 kWh/kWc)
 * Zone D: Northern France (800-1000 kWh/kWc)
 */
export const DRYING_ZONE_BY_DEPARTMENT = {
  // Zone A - Mediterranean
  '04': 'A', '06': 'A', '13': 'A', '20': 'A', '2A': 'A', '2B': 'A',
  '30': 'A', '34': 'A', '66': 'A', '83': 'A', '84': 'A',
  // Zone B - Southern
  '01': 'B', '03': 'B', '05': 'B', '07': 'B', '09': 'B', '11': 'B', '12': 'B',
  '15': 'B', '16': 'B', '17': 'B', '19': 'B', '23': 'B', '24': 'B', '26': 'B',
  '31': 'B', '32': 'B', '33': 'B', '38': 'B', '40': 'B', '42': 'B', '43': 'B',
  '46': 'B', '47': 'B', '48': 'B', '63': 'B', '64': 'B', '65': 'B', '69': 'B',
  '73': 'B', '74': 'B', '79': 'B', '81': 'B', '82': 'B', '86': 'B', '87': 'B',
  // Zone C - Central / Western
  '18': 'C', '21': 'C', '22': 'C', '25': 'C', '28': 'C', '29': 'C', '35': 'C',
  '36': 'C', '37': 'C', '39': 'C', '41': 'C', '44': 'C', '45': 'C', '49': 'C',
  '53': 'C', '56': 'C', '58': 'C', '70': 'C', '71': 'C', '72': 'C', '85': 'C',
  '89': 'C', '90': 'C',
  // Zone D - Northern
  '02': 'D', '08': 'D', '10': 'D', '14': 'D', '27': 'D', '50': 'D', '51': 'D',
  '52': 'D', '54': 'D', '55': 'D', '57': 'D', '59': 'D', '60': 'D', '61': 'D',
  '62': 'D', '67': 'D', '68': 'D', '75': 'D', '76': 'D', '77': 'D', '78': 'D',
  '80': 'D', '88': 'D', '91': 'D', '92': 'D', '93': 'D', '94': 'D', '95': 'D'
};

/**
 * Get the productible (kWh/kWc/year) for a given postal code.
 * @param {string} postalCode - French postal code (5 digits)
 * @returns {number} kWh/kWc/year
 */
export function getProductibleByPostalCode(postalCode) {
  if (!postalCode || postalCode.length < 2) return 1100;
  const prefix = postalCode.substring(0, 2);
  // Handle Corsica
  if (prefix === '20' || prefix === '2A' || prefix === '2B') return 1200;
  for (const [ratio, depts] of Object.entries(PRODUCTIBLE_BY_REGION)) {
    if (depts.includes(prefix)) return parseInt(ratio, 10);
  }
  return 1100; // default
}

/**
 * Get the orientation coefficient for given inclination and orientation.
 * Interpolates for inclinations between defined values.
 * @param {number} inclination - Roof inclination in degrees
 * @param {string} orientation - Orientation (SUD, SUD-EST, etc.)
 * @returns {number} coefficient (0 to 1)
 */
export function getOrientationCoefficient(inclination, orientation) {
  const angles = [0, 30, 60, 90];
  const orient = orientation || 'SUD';
  
  // Exact match
  if (ORIENTATION_COEFFICIENTS[inclination]) {
    return ORIENTATION_COEFFICIENTS[inclination][orient] || 1.0;
  }
  
  // Interpolate
  let lower = 0, upper = 30;
  for (let i = 0; i < angles.length - 1; i++) {
    if (inclination >= angles[i] && inclination <= angles[i + 1]) {
      lower = angles[i];
      upper = angles[i + 1];
      break;
    }
  }
  
  const lowerCoeff = ORIENTATION_COEFFICIENTS[lower]?.[orient] || 1.0;
  const upperCoeff = ORIENTATION_COEFFICIENTS[upper]?.[orient] || 1.0;
  const ratio = (inclination - lower) / (upper - lower);
  return lowerCoeff + ratio * (upperCoeff - lowerCoeff);
}

/**
 * Get drying zone (A/B/C/D) from department code
 * @param {string} dept - Department code
 * @returns {string} Zone letter
 */
export function getDryingZone(dept) {
  return DRYING_ZONE_BY_DEPARTMENT[dept] || 'C';
}

/**
 * Get climate zone (H1/H2/H3) from department code
 * @param {string} dept - Department code
 * @returns {string} Climate zone
 */
export function getClimateZone(dept) {
  return CLIMATE_ZONES_BY_DEPARTMENT[dept] || 'H1';
}

/**
 * Valeurs moyennes par défaut de valorisation agricole et économies thermiques par tonne séchée
 * Basées sur les études agronomiques (INRAE, Chambre d'Agriculture, BASE Innovation) :
 * - Gain protéique (+2 à +4 pts MAT)
 * - Réduction des pertes mécaniques au champ (-15% à -20%)
 * - Économies d'achats d'aliments concentrés / tourteaux
 * - Économies de frais de séchage en organisme stockeur ou combustible fossile (gaz, fioul)
 */
export const AGRICULTURAL_VALUATION_DEFAULTS = {
  fourrage: {
    id: 'fourrage',
    label: 'Fourrage vrac (Séchage en grange)',
    defaultGainPerTon: 55, // € / tonne MS (gain qualité, digestibilité & économie concentrés)
    defaultEnergySavingsPerTon: 10, // € / tonne MS (économie fauchage/re-fauchage/énergie)
    minGain: 0,
    maxGain: 150,
    unit: '€/t MS',
    tooltip: 'Gain protéique (+2 à +4 pts MAT), réduction des pertes au champ (15-20%), économie d\'achats de tourteaux et concentrés.'
  },
  bottes: {
    id: 'bottes',
    label: 'Bottes carrées (Foin conditionné)',
    defaultGainPerTon: 50, // € / tonne MS
    defaultEnergySavingsPerTon: 10, // € / tonne MS
    minGain: 0,
    maxGain: 150,
    unit: '€/t MS',
    tooltip: 'Conservation intégrale des feuilles, valeur nutritive supérieure, sécurité sanitaire sans moisissures ni poussières.'
  },
  ble: {
    id: 'ble',
    label: 'Céréales - Blé tendre',
    defaultGainPerTon: 25, // € / tonne (barème OS & marge qualité)
    defaultEnergySavingsPerTon: 15, // € / tonne (substitution séchoir gaz/fioul)
    minGain: 0,
    maxGain: 100,
    unit: '€/t',
    tooltip: 'Économie des taxes et frais de séchage organisme stockeur (OS), valorisation directe du grain stocké à la ferme.'
  },
  mais: {
    id: 'mais',
    label: 'Céréales - Maïs grain',
    defaultGainPerTon: 35, // € / tonne (réduction forte humidité 30% -> 15%)
    defaultEnergySavingsPerTon: 25, // € / tonne (forte économie de propane/gaz fossile)
    minGain: 0,
    maxGain: 120,
    unit: '€/t',
    tooltip: 'Substitution massive de combustible propane sur maïs humide, récolte précoce sécurisée.'
  },
  plaquettes: {
    id: 'plaquettes',
    label: 'Plaquettes forestières (Bois énergie)',
    defaultGainPerTon: 30, // € / tonne (survaleur classe M20/M25 sèche)
    defaultEnergySavingsPerTon: 20, // € / tonne (économie sur combustible substitué)
    minGain: 0,
    maxGain: 100,
    unit: '€/t',
    tooltip: 'Valorisation du bois déchiqueté sec normé M20 (PCI doublé de 2 à 4 kWh/kg), surprix à la vente et meilleur rendement chaufferie.'
  }
};
