/**
 * Données de la Plateforme Investisseurs ENR Courtage
 * Portefeuilles PV & BESS - M&A Teaser
 * 
 * Ce fichier contient toutes les données statiques de la plateforme :
 * - Portefeuilles (Hélios PV, Volta BESS)
 * - Comptes investisseurs de démonstration
 * - Texte du NDA
 * - Étapes du processus M&A
 */

// ============================================================================
// COMPTES UTILISATEURS ET ADMINISTRATEUR OFFICIELS
// ============================================================================
export const INVESTORS = [
  {
    id: 'ADMIN-001',
    email: 'y.barberis@enr-courtage.fr',
    password: 'Invest@enr!01',
    name: 'Yann BARBERIS',
    company: 'ENR COURTAGE',
    role: 'Président',
    isAdmin: true,
    status: 'active',
    divers: 'HELIOS2026',
    ndaSignedAt: '2026-08-01T08:00:00Z',
    ndaSignedByAdmin: true,
    hasUploadedSignedNda: true,
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'INV-ENEE',
    email: 'contact@enr-courtage.fr',
    password: 'Enr2026!ovxF',
    name: 'Jean DUS',
    company: 'ENEE',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'Jean DUS (ENEE)',
    phone: '07 63 54 21 33',
    ndaSignedAt: '2026-09-10T08:00:00Z',
    ndaSignedByAdmin: true,
    hasUploadedSignedNda: true,
    createdAt: '2026-09-10T08:00:00Z',
  },
  {
    id: 'INV-YANN-MSN',
    email: 'yannbarberis@msn.com',
    password: 'Enr2026!dP2#',
    name: 'Yann BARBERIS (MOA)',
    company: 'MOA ENR',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    phone: '06 35 54 85 99',
    ndaSignedAt: '2026-09-16T08:00:00Z',
    ndaSignedByAdmin: true,
    hasUploadedSignedNda: true,
    createdAt: '2026-09-16T08:00:00Z',
  },
  {
    id: 'INV-GREENINVEST',
    email: 'laurent.guyon@barconniere.com',
    password: 'fdpmZnPcxpH3X18R',
    name: 'Laurent GUYON',
    company: 'GREEN INVEST',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'GREEN INVEST',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-BABEL',
    email: 'thibaut.levesque@babelenergie.com',
    password: 'dYPb2vkGr-JGpx702',
    name: 'Thibaut LEVESQUE',
    company: 'BABEL ENERGIE',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'BABEL ENERGIE',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-DEVENCO',
    email: 'j.hugues@devenco.fr',
    password: '7Uvn1kWEJ01t3rX',
    name: 'Julien HUGUES',
    company: 'DEVENCO',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'DEVENCO',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-DIGITALSUN',
    email: 'b.jourdan@digitalsun-enr.com',
    password: 'JxyInxfIzgN0zBCG',
    name: 'Benoît JOURDAN',
    company: 'DIGITALSUN ENR',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'DIGITALSUN ENR',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-ALTAREA',
    email: 'Lrusmann@altarea.com',
    password: 'vkyezL3y0rbHQ3Jn',
    name: 'Loïc RUSMANN',
    company: 'ALTAREA',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'ALTAREA',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-ALBIOMA',
    email: 'Quentin.TROLONGE@albioma.com',
    password: 'nV4aU$c$-8aud',
    name: 'Quentin TROLONGE',
    company: 'ALBIOMA',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'ALBIOMA',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-MCEL',
    email: 'hbouhamed@mcel.energy',
    password: 'uzOqCdq08LE6sB4P',
    name: 'Hamza BOUHAMED',
    company: 'MCEL ENERGY',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'MCEL ENERGY',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-CAAP',
    email: 'arnaud.hallope@caap-energies.fr',
    password: 'zubcELx1cVHLtxmT',
    name: 'Arnaud HALLOPE',
    company: 'CAAP ENERGIES',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'CAAP ENERGIES',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-GIRASOLE',
    email: 'dfenetre@girasole-energies.com',
    password: 'KVuNNx1Djux0TCNi',
    name: 'Damien FENETRE',
    company: 'GIRASOLE ENERGIES',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'GIRASOLE ENERGIES',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-ENOE',
    email: 'farid.moucer@enoe-energie.fr',
    password: '3LQaZjxzZvnts2Dz',
    name: 'Farid MOUCER',
    company: 'ENOE',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'ENOE',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-NASSWIND',
    email: 'nicolas.letiran@nass-et-wind.com',
    password: '4USDNqYIXlgE4dKz',
    name: 'Nicolas LE TIRAN',
    company: 'NASS&WIND',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'NASS&WIND',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-MELVAN',
    email: 'l.albuisson@melvan.eu',
    password: 'dgISbRw51B4HBnsN',
    name: 'Laurent ALBUISSON',
    company: 'MELVAN',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'MELVAN',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-INGELYO',
    email: 'bruno.bensa@ingelyo.com',
    password: '51y2GEMEYgHYMB4y',
    name: 'Bruno BENSA',
    company: 'INGELYO DEVELOPPEMENT',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'INGELYO DEVELOPPEMENT',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-NOEP',
    email: 'lnicoli02@gmail.com',
    password: 'GhFtBcxwXhj8N79W',
    name: 'Lélio NICOLI',
    company: 'NOEP',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'NOEP',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-PROSOLIA',
    email: 'miguel.cartaxo@prosolia.com',
    password: 'P95C0svVgt7rs8Iw',
    name: 'Miguel CARTAXO',
    company: 'PROSOLIA',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'PROSOLIA',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-STRATELYO',
    email: 'maxime.noel@stratelyo.fr',
    password: 'S6YGH2M9ivG3adXT',
    name: 'Maxime NOEL',
    company: 'STRATELYO',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'STRATELYO',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-SOLSTYCE',
    email: 'pgu@solstyce.fr',
    password: 'tmhI5DG51l95J629',
    name: 'Paul GUYON',
    company: 'SOLSTYCE',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'SOLSTYCE',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-SUNROCK',
    email: 'f.burguion@sunrock.com',
    password: 'dr5Enfi09w9PDfiV',
    name: 'Franck BURGUION',
    company: 'SUNROCK',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'SUNROCK',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-SUNVOLT',
    email: 'michel.dekerever@sunvolt.fr',
    password: '4apbopPcU7Rdzy0E',
    name: 'Michel DE KEREVER',
    company: 'SUNVOLT',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'SUNVOLT',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-SYNAPSTOR',
    email: 'mael.chouiter@synapstor.fr',
    password: '1p7Tj1Szca!KcJsV',
    name: 'Maël CHOUITER',
    company: 'SYNAPSTOR',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'SYNAPSTOR',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-VALOREM',
    email: 'Mariane.THARAUD@valorem-energie.com',
    password: 'Zh4vcAbb3RVkI5X5',
    name: 'Mariane THARAUD',
    company: 'VALOREM',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'VALOREM',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-ENERVIVO',
    email: 'manuel.vigier@gmail.com',
    password: 'sukKYeek1Qt2XZtt',
    name: 'Manuel VIGIER',
    company: 'ENERVIVO',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    divers: 'ENERVIVO',
    hasUploadedSignedNda: true,
    ndaSignedAt: '2026-09-20T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'INV-GIOVSOLAR',
    email: 'm.lagares@giov.fr',
    password: 'w1ucyJxxj282JpnX',
    name: 'Mathieu LAGARES',
    company: 'GIOV SOLAR',
    legalForm: 'SASU',
    headOffice: '6 Rue Baudrand, 69540 Irigny, France',
    rcsNumber: '99996924900013',
    rcsCity: 'Irigny',
    role: 'Président',
    phone: '0698341438',
    isAdmin: false,
    status: 'active',
    divers: 'GIOV SOLAR',
    hasUploadedSignedNda: true,
    userNdaSignedAt: '2026-10-07T06:40:00Z',
    ndaSignedAt: '2026-10-07T06:40:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-10-07T06:40:00Z',
  },
];

// ============================================================================
// DICTIONNAIRE COMPLET D'ALIAS DE MOTS DE PASSE (TOLÉRANCE TYPOS & ESPACES)
// ============================================================================
export const USER_PASSWORD_ALIASES = {
  'y.barberis@enr-courtage.fr': [
    'Invest@enr01',
    'invest@enr01',
    'Invest@enr!01',
    'invest@enr!01',
    'Enr2026!admin',
    'admin2026',
    'HELIOS2026',
  ],
  'contact@enr-courtage.fr': [
    'enr2026!ovxF',
    'Enr2026!ovxF',
    'enr2026!ovxf',
    'Enr2026!Enee',
    'invest@enr!01',
    'Invest@enr!01',
  ],
  'yannbarberis@msn.com': [
    'enr2026!deze',
    'Enr2026!deze',
    '2#b84rDPzo',
    'Enr2026!dP2#',
  ],
  'laurent.guyon@barconniere.com': [
    'fdpmZnPcxpH3X18R',
    'fdpmZnPcXpHSX18R',
    'fdpmZnPcxpHSX18R',
    'fdpmZnPcXpH3X18R',
    'fdpmznpcxph3x18r',
    'fdpmznpcxphsx18r',
    '@gvW4Lq4bcJqYFPb',
    '@gvW4 Lq4bc JqYF Pb',
    '@gvW4Lq4bcJqYIPb',
  ],
  'laurentguyon@barconniere.com': [
    'fdpmZnPcxpH3X18R',
    'fdpmZnPcXpHSX18R',
    'fdpmZnPcxpHSX18R',
    'fdpmZnPcXpH3X18R',
    '@gvW4Lq4bcJqYFPb',
  ],
  'thibaut.levesque@babelenergie.com': [
    'dYPb2vkGr-JGpx702',
    'dYPb2vkGr-JGgx702',
    'dYPb2vkGr-J2gx702',
    'dYP62vkGr-J2gx702',
    'dYP62vkGr-5Jgx702',
    'dYPb2vkGr-5Jgx702',
    'dYPb2vkGr-3Gpx702',
    'dYPb2vkGr-3Ggx702',
    'dypb2vkgr-jgpx702',
    'dypb2vkgr-j2gx702',
    'dyp62vkgr-j2gx702',
    'dVKDNX6FX1sxf1p',
  ],
  'thibautlevesque@babelenergie.com': [
    'dYPb2vkGr-JGpx702',
    'dYPb2vkGr-JGgx702',
    'dYPb2vkGr-J2gx702',
    'dYP62vkGr-J2gx702',
    'dYP62vkGr-5Jgx702',
    'dVKDNX6FX1sxf1p',
  ],
  'j.hugues@devenco.fr': [
    '7Uvn1kWEJ01t3rX',
    '7Uvn1kW3v0JlTrX',
    '7Uvm1kWEJ01t3rX',
    '7Uvm1kW3v0JlTrX',
    '7Uvn1kWEJ01t3rx',
    '7uvn1kwej01t3rx',
    '7uvn1kw3v0jltrx',
    'MX1H1HuNctoL14h',
    'MX1HlE8uNctoL14h',
  ],
  'jhugues@devenco.fr': [
    '7Uvn1kWEJ01t3rX',
    '7Uvn1kW3v0JlTrX',
    '7Uvm1kWEJ01t3rX',
    '7Uvm1kW3v0JlTrX',
    '7Uvn1kWEJ01t3rx',
    '7uvn1kwej01t3rx',
    '7uvn1kw3v0jltrx',
    'MX1H1HuNctoL14h',
  ],
  'b.jourdan@digitalsun-enr.com': [
    'JxyInxfIzgN0zBCG',
    'Jxy1nxf1zgN0zBCG',
    'JxyInxfIzgN0zBCB',
    'jxyinxfizgn0zbcg',
  ],
  'lrusmann@altarea.com': [
    'vkyezL3y0rbHQ3Jn',
    'vKyeZL3y0rbHQ3Jn',
    'VkyezL3y0rbHQ3Jn',
    'vkyezl3y0rbhq3jn',
  ],
  'quentin.trolonge@albioma.com': [
    'nV4aU$c$-8aud',
    'nV4aU$c$Fa#ud',
    'nv4au$c$-8aud',
    'nv4au$c$fa#ud',
    'nV4aU$c$-8aUd',
  ],
  'hbouhamed@mcel.energy': [
    'uzOqCdq08LE6sB4P',
    'uz0qCdq08LE6sB4P',
    'uzoqcdq08le6sb4p',
  ],
  'arnaud.hallope@caap-energies.fr': [
    'zubcELx1cVHLtxmT',
    'zubcelx1cvhltxmt',
    'zubcELx1cVHLtxmt',
  ],
  'dfenetre@girasole-energies.com': [
    'KVuNNx1Djux0TCNi',
    'KVuNNx1Djux0TCNI',
    'kvunnx1djux0tcni',
  ],
  'farid.moucer@enoe-energie.fr': [
    '3LQaZjxzZvnts2Dz',
    '3LQaZjxzZvnts2DZ',
    '3lqazjxzzvnts2dz',
  ],
  'nicolas.letiran@nass-et-wind.com': [
    '4USDNqYIXlgE4dKz',
    '4USDNqYIXlgE4dkz',
    '4usdnqyixlge4dkz',
  ],
  'l.albuisson@melvan.eu': [
    'dgISbRw51B4HBnsN',
    'dg1SbRw51B4HBnsN',
    'dgisbrw51b4hbnsn',
  ],
  'bruno.bensa@ingelyo.com': [
    '51y2GEMEYgHYMB4y',
    'S1y2GEMEYgHYMB4y',
    '51y2GEMEYgHYMB4Y',
    '51y2gemeyghymb4y',
  ],
  'lnicoli02@gmail.com': [
    'GhFtBcxwXhj8N79W',
    'GhFtBcxwXhj8N79w',
    'ghftbcxwxhj8n79w',
  ],
  'miguel.cartaxo@prosolia.com': [
    'P95C0svVgt7rs8Iw',
    'P95C0svVgt7rs8IW',
    'p95c0svvgt7rs8iw',
  ],
  'maxime.noel@stratelyo.fr': [
    'S6YGH2M9ivG3adXT',
    'S6YGH2M9ivG3adxt',
    's6ygh2m9ivg3adxt',
  ],
  'pgu@solstyce.fr': [
    'tmhI5DG51l95J629',
    'tmh15DG51l95J629',
    'tmhI5DG51195J629',
    'tmhi5dg51l95j629',
  ],
  'f.burguion@sunrock.com': [
    'dr5Enfi09w9PDfiV',
    'dr5Enfi09w9PDfiv',
    'dr5enfi09w9pdfiv',
    'ds%hs-N#h@00F!V',
  ],
  'michel.dekerever@sunvolt.fr': [
    '4upbopFoU7Rduy0E',
    '4apbopPcU7Rdzy0E',
    '4upbopFcU7Rduy0E',
    '4upbopfou7rduy0e',
    '4apboppcu7rdzy0e',
  ],
  'mael.chouiter@synapstor.fr': [
    '1p7Tj1Szca!KcJsV',
    '1p7Tj1Szca!KcjsV',
    '1p7Tj1Szzca!KcJsV',
    '1p7tj1szca!kcjsv',
  ],
  'mariane.tharaud@valorem-energie.com': [
    'Zh4vcAbb3RVkI5X5',
    'Zh4vcAbb3RVkI5x5',
    'zh4vcabb3rvki5x5',
    'Zh4vcAbb3rvkI5X5',
  ],
  'manuel.vigier@gmail.com': [
    'sukKYeek1Qt2XZtt',
    'sukKYeek1Qt2xztt',
    'sukyyeek1qt2xztt',
    'sukKYeek1Qt2XZtt ',
    ' sukKYeek1Qt2XZtt',
  ],
  'm.lagares@giov.fr': [
    'w1ucyJxxj282JpnX',
    'w1ucyJxxj282jpnx',
    'w1ucyjxxj282jpnx',
    'w1ucyJxxj282JpnX ',
    ' w1ucyJxxj282JpnX',
  ],
};

export function fuzzyNormalizePassword(str) {
  if (!str) return '';
  return str
    .replace(/[\s\u00A0\u200B\u200C\u200D\uFEFF]/g, '')
    .toLowerCase()
    .replace(/[o0]/g, '0')
    .replace(/[1lif|]/g, '1')
    .replace(/[uv]/g, 'u');
}

export function normalizeInvestorEmail(email) {
  if (!email) return '';
  const s = String(email).trim().toLowerCase();

  if (s.includes('manuel.vigier') || s.includes('vigier') || s.includes('enervivo')) return 'manuel.vigier@gmail.com';
  if (s.includes('lagares') || s.includes('giov')) return 'm.lagares@giov.fr';
  if (s.includes('rusmann') || s.includes('kusmann') || s === 'l.kusmann@aliaxis.com') return 'lrusmann@altarea.com';
  if (s.includes('moucer') || s.includes('mouser')) return 'farid.moucer@enoe-energie.fr';
  if (s.includes('nicoli')) return 'lnicoli02@gmail.com';
  if (s.includes('dekerever') || s.includes('dekerver') || s.includes('kerever')) return 'michel.dekerever@sunvolt.fr';
  if (s.includes('fenetre')) return 'dfenetre@girasole-energies.com';
  if (s.includes('letiran') || s.includes('letran')) return 'nicolas.letiran@nass-et-wind.com';
  if (s.includes('guyon@barconniere') || s.includes('guyon@baircom') || s.includes('barconniere')) return 'laurent.guyon@barconniere.com';
  if (s.includes('bouhamed')) return 'hbouhamed@mcel.energy';
  if (s.includes('hugues') || s.includes('devenco')) return 'j.hugues@devenco.fr';
  if (s.includes('jourdan') || s.includes('digitalsun')) return 'b.jourdan@digitalsun-enr.com';
  if (s.includes('levesque') || s.includes('babelenergie')) return 'thibaut.levesque@babelenergie.com';
  if (s.includes('chouiter') || s.includes('choutier') || s.includes('synapstor')) return 'mael.chouiter@synapstor.fr';
  if (s.includes('tharaud') || s.includes('valorem')) return 'mariane.tharaud@valorem-energie.com';
  if (s.includes('albuisson') || s.includes('melvan')) return 'l.albuisson@melvan.eu';
  if (s.includes('bensa') || s.includes('ingelyo')) return 'bruno.bensa@ingelyo.com';
  if (s.includes('cartaxo') || s.includes('prosolia')) return 'miguel.cartaxo@prosolia.com';
  if (s.includes('noel') || s.includes('stratelyo')) return 'maxime.noel@stratelyo.fr';
  if (s.includes('solstyce') || s.includes('pgu@')) return 'pgu@solstyce.fr';
  if (s.includes('burguion') || s.includes('sunrock')) return 'f.burguion@sunrock.com';
  if (s.includes('hallope') || s.includes('caap')) return 'arnaud.hallope@caap-energies.fr';
  if (s.includes('trolonge') || s.includes('albioma')) return 'quentin.trolonge@albioma.com';
  if (s.includes('barberis') && s.includes('msn')) return 'yannbarberis@msn.com';
  if (s.includes('barberis') && s.includes('enr-courtage')) return 'y.barberis@enr-courtage.fr';
  if (s.includes('contact@enr-courtage') || s.includes('dus') || s.includes('enee')) return 'contact@enr-courtage.fr';

  return s;
}

export function verifyInvestorPassword(investorEmail, inputPassword, storedPassword) {
  const normEmail = normalizeInvestorEmail(investorEmail);
  const cleanInput = (inputPassword || '').trim();
  const noSpaceInput = cleanInput.replace(/[\s\u00A0\u200B\u200C\u200D\uFEFF]/g, '');

  if (!cleanInput) return false;

  // 1. Direct match with stored password (exact or without spaces)
  if (storedPassword) {
    const cleanStored = storedPassword.trim();
    const noSpaceStored = cleanStored.replace(/[\s\u00A0\u200B\u200C\u200D\uFEFF]/g, '');
    if (cleanInput === cleanStored || noSpaceInput === noSpaceStored) return true;
    if (cleanInput.toLowerCase() === cleanStored.toLowerCase()) return true;
    if (noSpaceInput.toLowerCase() === noSpaceStored.toLowerCase()) return true;
    if (fuzzyNormalizePassword(cleanInput) === fuzzyNormalizePassword(cleanStored)) return true;
  }

  // 2. Check known aliases for candidate email keys
  const candidateKeys = [normEmail, (investorEmail || '').trim().toLowerCase()];
  for (const key of candidateKeys) {
    const aliases = USER_PASSWORD_ALIASES[key] || [];
    for (const alias of aliases) {
      const cleanAlias = alias.trim();
      const noSpaceAlias = cleanAlias.replace(/[\s\u00A0\u200B\u200C\u200D\uFEFF]/g, '');
      if (cleanInput === cleanAlias || noSpaceInput === noSpaceAlias) return true;
      if (cleanInput.toLowerCase() === cleanAlias.toLowerCase()) return true;
      if (noSpaceInput.toLowerCase() === noSpaceAlias.toLowerCase()) return true;
      if (fuzzyNormalizePassword(cleanInput) === fuzzyNormalizePassword(cleanAlias)) return true;
    }
  }

  return false;
}

// ============================================================================
// PROJETS PV - Portefeuille HÉLIOS (15 Centrales / 6.24 MWc)
// ============================================================================
const PV_SITES = [
  { id: 1, name: 'CONDOM', dept: '32', cp: '32100', address: '2910 Chemin de l\'osse', client: 'SAINT ARAILLES Henri', kwc: 256, cost: 164194, caAn1: 23347, ebitdaAn1: 20531, tri: '11.9%', payback: '8.0 ans', type: 'Hangars agricoles', statut: 'URBA OK', lat: 43.9583, lng: 0.3736, orange: false },
  { id: 2, name: 'BRANTÔME EN PÉRIGORD', dept: '24', cp: '24310', address: 'Lieu Dit Puygauthier', client: 'LATOURNERIE Nicolas', kwc: 1006, cost: 528619, caAn1: 92680, ebitdaAn1: 79364, tri: '14.3%', payback: '6.7 ans', type: 'Hangars agricoles & Toitures', statut: 'URBA OK', lat: 45.3644, lng: 0.6486, orange: false },
  { id: 3, name: 'GARONS', dept: '30', cp: '30128', address: '164 Chemin des Canaux', client: 'RODIER-VARGAS Cécile', kwc: 460, cost: 265154, caAn1: 41952, ebitdaAn1: 36892, tri: '13.2%', payback: '7.2 ans', type: 'Hangars agricoles', statut: 'URBA OK', lat: 43.7717, lng: 4.4233, orange: false },
  { id: 4, name: 'VAL-DE-LIVENNE', dept: '33', cp: '33860', address: '1 Grand Champ', client: 'HERIT Dominique', kwc: 120, cost: 96888, caAn1: 10944, ebitdaAn1: 9624, tri: '9.4%', payback: '10.3 ans', type: 'Hangars agricoles', statut: 'URBA OK', lat: 45.2443, lng: -0.5671, orange: false },
  { id: 5, name: 'LACQUY', dept: '40', cp: '40120', address: '374 Rte de Saint Justin', client: 'LECONTE Frédéric', kwc: 145, cost: 109261, caAn1: 13224, ebitdaAn1: 11628, tri: '10.1%', payback: '9.4 ans', type: 'Hangars agricoles', statut: 'URBA OK', lat: 43.9483, lng: -0.2648, orange: false },
  { id: 6, name: 'PUYLAUSIC', dept: '32', cp: '32220', address: 'Lieu Dit En Barthe', client: 'CASSAGNE Christian', kwc: 157, cost: 115199, caAn1: 14318, ebitdaAn1: 12590, tri: '10.4%', payback: '9.2 ans', type: 'Hangars agricoles', statut: 'URBA OK', lat: 43.4682, lng: 0.9996, orange: false },
  { id: 7, name: 'SAINT-LAURENT-DU-PLAN', dept: '33', cp: '33190', address: '6 Bis Rte de Saint Laurent', client: 'LECONTE Frédéric', kwc: 485, cost: 277527, caAn1: 44232, ebitdaAn1: 38896, tri: '13.3%', payback: '7.2 ans', type: 'Hangars agricoles', statut: 'URBA OK', lat: 44.6239, lng: -0.1167, orange: false },
  { id: 8, name: 'LECTOURE', dept: '32', cp: '32700', address: 'Lieu Dit Piche', client: 'RECKINGER Nicolas', kwc: 789, cost: 427976, caAn1: 71957, ebitdaAn1: 63277, tri: '14.0%', payback: '6.8 ans', type: 'Hangars agricoles', statut: 'URBA OK', lat: 43.9347, lng: 0.6225, orange: false },
  {
    id: 9,
    name: 'GORNAC (JARRY 1 & JARRY 2)',
    dept: '33',
    cp: '33540',
    address: 'Lieu Dit Le Bourg',
    client: 'JARRY Frédéric (JARRY 1 & 2)',
    bailleur: 'JARRY Frédéric (2 Hangars neufs)',
    kwc: 628,
    cost: 348297,
    caAn1: 57274,
    ebitdaAn1: 50366,
    tri: '13.7%',
    payback: '6.9 ans',
    type: '2 Hangars agricoles neufs',
    statut: 'URBA OK',
    lat: 44.6623,
    lng: -0.1805,
    orange: false,
    stationsCount: 2,
    subSites: [
      { id: '9-1', name: 'JARRY 1', ville: 'GORNAC', cp: '33540', dept: '33', kwc: 217, cost: 147551, caAn1: 19790, ebitdaAn1: 17400, type: 'Hangar agricole neuf', statut: 'URBA OK' },
      { id: '9-2', name: 'JARRY 2', ville: 'GORNAC', cp: '33540', dept: '33', kwc: 411, cost: 200746, caAn1: 37484, ebitdaAn1: 32966, type: 'Hangar agricole neuf', statut: 'URBA OK' },
    ],
  },
  { id: 10, name: 'CHALAIS', dept: '16', cp: '16210', address: 'Lieu Dit Chez Choloux', client: 'CHOLOUX Jean-Marc', kwc: 707.2, cost: 387493, caAn1: 64497, ebitdaAn1: 56718, tri: '13.9%', payback: '6.9 ans', type: 'Hangars agricoles', statut: 'URBA OK', lat: 45.2736, lng: 0.0408, orange: false },
  { id: 11, name: 'MIRAMBEAU', dept: '17', cp: '17150', address: '1 Chemin des Plantes', client: 'CHAUCHET Eric', kwc: 145, cost: 109261, caAn1: 13224, ebitdaAn1: 11628, tri: '10.1%', payback: '9.4 ans', type: 'Hangars agricoles', statut: 'URBA OK', lat: 45.3744, lng: -0.5708, orange: false },
  { id: 12, name: 'SAINT-SAUD-LACOUSSIÈRE', dept: '24', cp: '24470', address: 'Lieu Dit Le Mas', client: 'MISSAULT Patrick', kwc: 434, cost: 279787, caAn1: 39407, ebitdaAn1: 34633, tri: '11.8%', payback: '8.1 ans', type: 'Hangars agricoles', statut: 'URBA OK', lat: 45.5413, lng: 0.8173, orange: false },
  { id: 13, name: 'JUSSAS', dept: '17', cp: '17130', address: '1 Chez Giraud', client: 'DUHARD Christian', kwc: 181, cost: 127077, caAn1: 16507, ebitdaAn1: 14515, tri: '10.9%', payback: '8.8 ans', type: 'Hangars agricoles', statut: 'URBA OK', lat: 45.2863, lng: -0.4289, orange: false },
  { id: 14, name: 'SAINT-MARTIN-DE-FRESSENGEAS', dept: '24', cp: '24800', address: 'Lieu Dit La Borie', client: 'MISSAULT Patrick', kwc: 388, cost: 257021, caAn1: 35230, ebitdaAn1: 30962, tri: '11.4%', payback: '8.3 ans', type: 'Hangars agricoles', statut: 'URBA OK', lat: 45.4485, lng: 0.8465, orange: false },
  { id: 15, name: 'SAINT-AVIT-SAINT-NAZAIRE', dept: '33', cp: '33220', address: '1 Lieu Dit Les Tuileries', client: 'MARTIN Eric', kwc: 337, cost: 204281, caAn1: 30734, ebitdaAn1: 27026, tri: '12.6%', payback: '7.6 ans', type: 'Hangars agricoles', statut: 'URBA OK', lat: 44.8512, lng: 0.2589, orange: false },
];

// ============================================================================
// PROJETS BESS - Portefeuille VOLTA (29 Stations dans 26 Projets / 14.50 MW / 30.28 MWh)
// ============================================================================
const BESS_SITES = [
  { id: 1, name: 'BRANTÔME EN PÉRIGORD', dept: '24', cp: '24310', client: 'LATOURNERIE', bailleur: 'LATOURNERIE Franck', posteSource: 'BRANTOME', distHta: '3.5 km', quotePart: '42,71 k€', ebitda: '55 053 €', payback: '4.9 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.328888, lng: 0.651648 },
  { id: 2, name: 'ROCHECHOUART', dept: '87', cp: '87600', client: 'PAILLOT', bailleur: 'PAILLOT Noël', posteSource: 'PLAUD', distHta: '6.6 km', quotePart: '42,71 k€', ebitda: '57 271 €', payback: '5.0 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.847811, lng: 0.852996 },
  { id: 3, name: 'MONGAUSY', dept: '32', cp: '32220', client: 'BATIOT', bailleur: 'BATIOT Olivier', posteSource: 'SEMEZIES', distHta: '5.9 km', quotePart: '64,11 k€', ebitda: '57 271 €', payback: '5.0 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 43.495370, lng: 0.834241 },
  { id: 4, name: 'MEUZAC', dept: '87', cp: '87380', client: 'DOMERGUE', bailleur: 'DOMERGUE Daniel', posteSource: 'LE REPAIRE', distHta: '8.6 km', quotePart: '42,71 k€', ebitda: '56 215 €', payback: '5.1 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.566247, lng: 1.397687 },
  { id: 5, name: 'SAINT-JULIEN-LE-VENDÔMOIS', dept: '19', cp: '19210', client: 'CUBERTAFON', bailleur: 'CUBERTAFON René', posteSource: 'LUBERSAC', distHta: '8.3 km', quotePart: '42,71 k€', ebitda: '56 215 €', payback: '5.1 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.460274, lng: 1.298166 },
  { id: 6, name: 'PORT-DE-LANNE', dept: '40', cp: '40300', client: 'PLANTE', bailleur: 'PLANTE Jean-Pierre', posteSource: 'GUICHE', distHta: '4.9 km', quotePart: '42,71 k€', ebitda: '55 053 €', payback: '5.2 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 43.558940, lng: -1.199501 },
  { id: 7, name: 'GRISOLLES', dept: '82', cp: '82170', client: 'PRAVIE', bailleur: 'PRAVIE Clémence', posteSource: 'LESQUIVE 2', distHta: '2.3 km', quotePart: '64,11 k€', ebitda: '56 215 €', payback: '4.5 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 43.896232, lng: 1.295833 },
  { id: 8, name: 'CONCÈZE', dept: '19', cp: '19350', client: 'DAVID', bailleur: 'DAVID Louis', posteSource: 'LUBERSAC', distHta: '8.6 km', quotePart: '42,71 k€', ebitda: '56 215 €', payback: '5.1 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.351329, lng: 1.314195 },
  { id: 9, name: 'SAINT-ÉLOY-LES-TUILERIES', dept: '19', cp: '19210', client: 'GRANGER', bailleur: 'GRANGER Bruno', posteSource: 'LUBERSAC', distHta: '10.5 km', quotePart: '42,71 k€', ebitda: '56 215 €', payback: '5.1 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.442533, lng: 1.267710 },
  {
    id: 10,
    name: 'CASTEBRUNET (Cluster 4 stations BESS)',
    dept: '82',
    cp: '82300',
    ville: 'CAUSSADE • MONTEILS • SAINT-CIRQ',
    address: 'Caussade 1 & 2 • Monteils • Saint-Cirq (82300)',
    client: 'CASTEBRUNET',
    bailleur: 'CASTEBRUNET (1, 2, 3 & 4)',
    posteSource: 'LERE (HTA 20 kV)',
    distHta: '5.3 km moy.',
    quotePart: '64,11 k€',
    ebitda: '220 212 €',
    payback: '5.1 ans',
    kw: 2000,
    kwh: 4176,
    type: 'Batterie SA 16×125kW (4 stations)',
    statut: 'URBA OK',
    lat: 44.1325,
    lng: 1.5695,
    stationsCount: 4,
    subSites: [
      { id: '10-1', name: 'CASTEBRUNET 1', ville: 'CAUSSADE', cp: '82300', dept: '82', kw: 500, kwh: 1044, posteSource: 'LERE', distHta: '5.7 km', quotePart: '64,11 k€', ebitda: '55 053 €', bailleur: 'CASTEBRUNET 1', statut: 'URBA OK' },
      { id: '10-2', name: 'CASTEBRUNET 2', ville: 'CAUSSADE', cp: '82300', dept: '82', kw: 500, kwh: 1044, posteSource: 'LERE', distHta: '5.7 km', quotePart: '64,11 k€', ebitda: '55 053 €', bailleur: 'CASTEBRUNET 2', statut: 'URBA OK' },
      { id: '10-3', name: 'CASTEBRUNET 3', ville: 'MONTEILS', cp: '82300', dept: '82', kw: 500, kwh: 1044, posteSource: 'LERE', distHta: '3.6 km', quotePart: '64,11 k€', ebitda: '55 053 €', bailleur: 'CASTEBRUNET 3', statut: 'URBA OK' },
      { id: '10-4', name: 'CASTEBRUNET 4', ville: 'SAINT-CIRQ', cp: '82300', dept: '82', kw: 500, kwh: 1044, posteSource: 'LERE', distHta: '6.2 km', quotePart: '64,11 k€', ebitda: '55 053 €', bailleur: 'CASTEBRUNET 4', statut: 'URBA OK' },
    ],
  },
  { id: 11, name: 'MONESTIER', dept: '24', cp: '24240', client: 'BERTRANDIE', bailleur: 'BERTRANDIE Sébastien', posteSource: 'STE-FOY-LA-GRANDE', distHta: '9 km', quotePart: '42,71 k€', ebitda: '55 053 €', payback: '5.2 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.773569, lng: 0.300107 },
  { id: 12, name: 'LEYRAT', dept: '23', cp: '23600', client: 'GIOT', bailleur: 'GIOT Aurélien', posteSource: 'BOUSSAC', distHta: '5.9 km', quotePart: '42,71 k€', ebitda: '57 271 €', payback: '5.0 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 46.360561, lng: 2.308566 },
  { id: 13, name: 'DURAS', dept: '47', cp: '47120', client: 'ARBOIN', bailleur: 'ARBOIN Régis', posteSource: 'LA SAUVETAT', distHta: '11.8 km', quotePart: '42,71 k€', ebitda: '57 271 €', payback: '5.0 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.659495, lng: 0.222735 },
  { id: 14, name: 'SAINT-SAUD-LACOUSSIÈRE', dept: '24', cp: '24470', client: 'MISSAULT', bailleur: 'MISSAULT Cécile', posteSource: 'NONTRON', distHta: '13.7 km', quotePart: '42,71 k€', ebitda: '55 053 €', payback: '5.2 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.558769, lng: 0.904488 },
  { id: 15, name: 'MOURIOUX-VIEILLEVILLE', dept: '23', cp: '23210', client: 'MEILLAT 1', bailleur: 'MEILLAT Patrick', posteSource: 'CHATELUS 2', distHta: '5.4 km', quotePart: '42,71 k€', ebitda: '56 215 €', payback: '5.1 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 46.082964, lng: 1.638518 },
  { id: 16, name: 'VAL-DE-LIVENNE', dept: '33', cp: '33860', client: 'SOULIGNAC', bailleur: 'SOULIGNAC Gérard', posteSource: 'ETAULIERS', distHta: '7.7 km', quotePart: '64,11 k€', ebitda: '56 215 €', payback: '5.1 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.264357, lng: -0.550408 },
  { id: 17, name: 'PAYZAC', dept: '24', cp: '24270', client: 'CHAUFFAILLE', bailleur: 'CHAUFFAILLE Alain', posteSource: 'LUBERSAC', distHta: '6.9 km', quotePart: '42,71 k€', ebitda: '56 215 €', payback: '5.1 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.436230, lng: 1.288720 },
  { id: 18, name: 'JUILLAC', dept: '33', cp: '33890', client: 'CIROLI', bailleur: 'CIROLI Vincent', posteSource: 'AURIOLLES', distHta: '7.9 km', quotePart: '64,11 k€', ebitda: '55 053 €', payback: '5.2 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.809547, lng: -0.037304 },
  { id: 19, name: 'MANSAN', dept: '65', cp: '65140', client: 'BOURDETTES', bailleur: 'BOURDETTES Pierre', posteSource: 'VIC-EN-BIGORRE', distHta: '10.8 km', quotePart: '42,71 k€', ebitda: '55 053 €', payback: '5.2 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 43.345738, lng: 0.194628 },
  { id: 20, name: 'SAINT EUTROPE DE BORN', dept: '47', cp: '47210', client: 'FRECHEVILLE', bailleur: 'FRECHEVILLE Mathieu', posteSource: 'CANCON', distHta: '7.2 km', quotePart: '42,71 k€', ebitda: '57 271 €', payback: '5.0 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.588327, lng: 0.665431 },
  { id: 21, name: 'BEYCHAC-ET-CAILLAU', dept: '33', cp: '33750', client: 'DOUMENS', bailleur: 'DOUMENS Jacques', posteSource: 'POMPIGNAC', distHta: '4.0 km', quotePart: '64,11 k€', ebitda: '56 215 €', payback: '4.9 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.870054, lng: -0.397698 },
  { id: 22, name: 'VENDAYS-MONTALIVET', dept: '33', cp: '33930', client: 'HOUSSAIT-YOUNG', bailleur: 'HOUSSAIT-YOUNG Paul', posteSource: 'ST-VIVIEN', distHta: '9.9 km', quotePart: '64,11 k€', ebitda: '55 053 €', payback: '5.2 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.338321, lng: -1.071016 },
  { id: 23, name: 'SAINT-MARTIN-DE-FRESSENGEAS', dept: '24', cp: '24800', client: 'MISSAULT', bailleur: 'MISSAULT Cécile', posteSource: 'THIVIERS', distHta: '6.7 km', quotePart: '42,71 k€', ebitda: '57 271 €', payback: '5.0 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.438589, lng: 0.815692 },
  { id: 24, name: 'MOURIOUX-VIEILLEVILLE', dept: '23', cp: '23210', client: 'MEILLAT 2', bailleur: 'MEILLAT Patrick', posteSource: 'CHATELUS 2', distHta: '5.4 km', quotePart: '42,71 k€', ebitda: '56 215 €', payback: '5.1 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 46.081523, lng: 1.633909 },
  { id: 25, name: 'ARGENCES EN AUBRAC', dept: '12', cp: '12420', client: 'DOMERGUE', bailleur: 'DOMERGUE Daniel', posteSource: 'RUEYRES', distHta: '5.9 km', quotePart: '42,71 k€', ebitda: '57 271 €', payback: '5.0 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.807528, lng: 2.790446 },
  { id: 26, name: 'SAINT-ÉLOY-LES-TUILERIES', dept: '19', cp: '19210', client: 'COMBY', bailleur: 'COMBY Fabrice', posteSource: 'LUBERSAC', distHta: '8.3 km', quotePart: '42,71 k€', ebitda: '56 215 €', payback: '5.1 ans', kw: 500, kwh: 1044, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.452887, lng: 1.284563 },
];

// ============================================================================
// PORTEFEUILLES
// ============================================================================
export const PORTFOLIOS = [
  {
    id: 'helios',
    name: 'Portefeuille Multi-Projets Photovoltaïque HÉLIOS',
    type: 'PV',
    typeBadge: 'Solaire Toitures & Hangars',
    seller: 'GREEN INVEST',
    color: 'amber',
    icon: 'Sun',
    description: 'Portefeuille de 15 centrales photovoltaïques en toitures et hangars agricoles, situées dans des bassins solaires stratégiques du Grand Sud-Ouest (Gers, Dordogne, Gironde, Landes, Gard, Charente, Charente-Maritime).',
    descriptionShort: 'Audit certifié du 30 septembre 2026 : 15 centrales solaires pour 6.24 MWc, production consolidée 7 036 MWh/an (Productible P50 : 1 125 kWh/kWc/an).',
    kpis: {
      totalPower: '6.24 MWc',
      totalPowerLabel: 'Puissance Totale',
      totalPowerSub: '(15 centrales au total)',
      sites: 15,
      sitesLabel: 'centrales solaires',
      sitesStatus: 'Sécurisées foncièrement (100% PdB)',
      metric1: { label: 'Production Annuelle', value: '7 036 MWh/an', sub: 'P50 : 1 125 kWh/kWc/an' },
      metric2: { label: 'CAPEX Clé en main', value: '3,70 M€', sub: '~593 €/kWc raccordé' },
    },
    highlights: [
      {
        icon: 'ShieldCheck',
        title: 'Sécurisation Urbanistique & Foncière Complète',
        text: '15 centrales sécurisées par Promesses de Bail (PdB) signées sur 20 ans. Maîtrise foncière et autorisations d\'urbanisme (DP/PC) vérifiées et auditables en Data Room.',
      },
      {
        icon: 'FileCheck',
        title: 'Devis Travaux Détaillés & CAPEX Maîtrisé',
        text: 'Devis d\'exécution précis (charpente métallique, fondations, couverture et raccordement) finalisés pour 3 698 035 € HT clé en main (~593 €/kWc raccordé).',
      },
      {
        icon: 'Landmark',
        title: 'Tarif d\'Achat CRE S21 Sécurisé sur 20 Ans',
        text: 'Tarif S21 de base à 0.0820 €/kWh indexé à +0.6%/an, assurant un chiffre d\'affaires brut de 569 527 € et un EBITDA net de 498 650 € dès l\'An 1.',
      },
    ],
    advantages: [
      {
        icon: 'Lock',
        title: 'Foncier Sécurisé sur 20 Ans (100% PdB)',
        text: 'Promesses de Bail notariées signées sur 20 ans avec exploitants agricoles propriétaires.',
      },
      {
        icon: 'Zap',
        title: 'Productible P50 Supérieur Sud-Ouest',
        text: 'Irradiation moyenne P50 de 1 125 kWh/kWc/an garantissant 7 036 MWh/an d\'énergie verte réinjectée.',
      },
      {
        icon: 'Tags',
        title: 'Structure de Financement Bancable',
        text: 'Levier bancaire 90% (Dette senior 3 328 232 € sur 20 ans à 4.30% / Fonds propres 369 804 €), annuité de 251 445 €/an (DSCR 1.72x).',
      },
    ],
    economicMatrix: [
      { param: 'Nombre de projets', value: '15 centrales', justification: '15 centrales solaires en toitures et hangars agricoles' },
      { param: 'Puissance globale', value: '6,24 MWc (6 240 kWc)', justification: 'Dimensionnements audités certifiés' },
      { param: 'Production annuelle', value: '7 036 MWh/an', justification: 'Productible P50 : 1 125 kWh/kWc/an' },
      { param: 'Sécurisation Foncière', value: 'Promesses de Bail signées 20 ans (100%)', justification: '✓ PdB notariées communicables sous NDA' },
      { param: 'Chiffrage Travaux / CAPEX', value: '3 698 035 € HT clé en main (~593 €/kWc)', justification: 'Devis d\'exécution charpente & raccordement détaillés' },
      { param: 'Financement Senior', value: 'Levier bancaire 90% (Dette 3,33 M€ à 4.30% / FP 370 k€)', justification: 'Annuité dette 251 445 €/an sur 20 ans (DSCR 1.72x)' },
    ],
    sites: PV_SITES,
    footerNote: 'Fiches projets, devis et PdB disponibles sous NDA',
    dataRoom: {
      categories: [
        { name: 'Juridique', icon: 'Scale', files: [
          { name: 'Promesse de Bail PV — CONSOLI (24130 PRIGONRIEUX) [20 pages]', type: 'PDF', size: '865 Ko', fileUrl: '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf' },
          { name: 'Promesse de Bail PV — LABEGUERIE (64120 ORÈGUE) [18 pages]', type: 'PDF', size: '4.8 Mo', fileUrl: '/documents/dataroom/Promesse_de_bail_LABEGUERIE_signe.pdf' },
          { name: 'Promesses de Bail (PdB) — Sites fermes', type: 'PDF', size: '12.5 Mo', fileUrl: '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf' },
          { name: 'Statuts société GREEN INVEST', type: 'PDF', size: '2.1 Mo' },
        ]},
        { name: 'Technique', icon: 'Wrench', files: [
          { name: 'Fiches synoptiques — 15 centrales PV', type: 'PDF', size: '24.2 Mo' },
          { name: 'Devis travaux charpente détaillés', type: 'PDF', size: '18.7 Mo' },
          { name: 'Plans d\'implantation par site', type: 'PDF', size: '12.3 Mo' },
        ]},
        { name: 'Financier', icon: 'Calculator', files: [
          { name: 'Matrice économique consolidée (15 sites)', type: 'XLSX', size: '37 Ko', fileUrl: '/documents/dataroom/Matrice_economique_consolidee_HELIOS.xlsx' },
          { name: 'Business plans unitaires & chronique 20 ans', type: 'XLSX', size: '37 Ko', fileUrl: '/documents/dataroom/Business_plans_unitaires_chronique_20_ans_HELIOS.xlsx' },
        ]},
        { name: 'Urbanisme', icon: 'Map', files: [
          { name: 'Autorisations d\'urbanisme — Sites URBA OK', type: 'PDF', size: '22.1 Mo' },
          { name: 'Certificats d\'urbanisme opérationnels', type: 'PDF', size: '6.9 Mo' },
        ]},
      ],
    },
    teaserData: {
      financialKpis: [
        { label: 'TRI PROJET', value: '12,8%', sub: 'TRI Equity : 14,5%', detail: 'Levier bancaire 90/10 (Dette 4.30%)', color: 'amber' },
        { label: 'PAYBACK NET', value: '7,4 ans', sub: 'Sur Fonds Propres : 2,5 ans', detail: 'Amortissement accéléré CAPEX', color: 'emerald' },
        { label: 'PRODUCTIBLE P50', value: '1 125 kWh/kWc', sub: 'Production 7 036 MWh/an', detail: 'Irradiation certifiée Sud-Ouest', color: 'white' },
        { label: 'CA BRUT AN 1', value: '569 527 €', sub: 'Tarif S21 0,0820 €/kWh', detail: 'Indexation annuelle +0.6%/an', color: 'white' },
        { label: 'EBITDA NET AN 1', value: '498 650 €', sub: 'Marge opérationnelle ~88%', detail: 'OPEX An 1 : -70 977 € (DSCR 1.72x)', color: 'emerald' },
        { label: 'CAPEX TOTAL', value: '3,70 M€', sub: '3 698 035 € clé en main', detail: '~593 €/kWc raccordé (15 sites)', color: 'amber' },
      ],
      pillars: [
        {
          icon: 'ShieldCheck',
          title: 'Sécurisation Urbanistique & Foncière Complète',
          items: [
            '15 centrales sécurisées par Promesses de Bail signées 20 ans',
            'Permis de Construire et DP purgés de tout recours',
            'Maîtrise foncière contractualisée avec les exploitants',
            'Fiches projets unitaires détaillées et auditables en Data Room',
          ],
          bottomStat: { label: '100% des 15 centrales sécurisées foncièrement', value: true },
        },
        {
          icon: 'FileCheck',
          title: 'Devis d\'Exécution Finalisés & CAPEX Maîtrisé',
          items: [
            'CAPEX total clé en main : 3 698 035 € HT (~593 €/kWc raccordé)',
            'Devis charpente métallique, fondations et raccordement chiffrés',
            'Structure de financement : 90% Dette Senior / 10% Fonds Propres',
            'Dette 20 ans à 4.30% (Annuité 251 445 €/an, DSCR 1.72x)',
          ],
          bottomStat: { label: 'CAPEX consolidé : 3,70 M€ clé en main', value: true },
        },
        {
          icon: 'Landmark',
          title: 'Tarif d\'Achat Garanti CRE S21 sur 20 Ans',
          items: [
            'Tarif d\'achat de base à 0,0820 €/kWh indexé annuellement à +0.6%',
            'Production annuelle consolidée certifiée : 7 036 MWh/an',
            'CA An 1 garanti de 569 527 € pour un EBITDA net de 498 650 €',
            'Trésorerie nette cumulée à 20 ans : 3,35 M€ (3 349 801 €)',
          ],
          bottomStat: { label: 'Contrat EDF OA sécurisé contractuellement sur 20 ans', value: true },
        },
        {
          icon: 'Zap',
          title: 'Bassins Solaires Stratégiques Sud-Ouest',
          items: [
            'Productible P50 moyen certifié : 1 125 kWh/kWc/an',
            'Implantations Gers, Dordogne, Gironde, Landes, Gard, Charentes',
            'Orientation optimale toitures neuves et rénovations',
            'EBITDA net cumulé sur 20 ans : 9,47 M€',
          ],
          bottomStat: { label: 'Productible certifié P50 : 1 125 kWh/kWc/an', value: true },
        },
      ],
      revenueArchitecture: {
        total: '569 527 €',
        totalLabel: 'CA brut garanti An 1 (Tarif S21 CRE)',
        cycleLabel: 'Productible P50 : 1 125 kWh/kWc/an',
        sources: [
          { name: 'Obligation d\'Achat EDF OA (Tarif S21 de base 0,0820 €/kWh indexé +0.6%/an)', value: '569 527 €', pct: '100%', color: '#f59e0b' },
        ],
      },
      stationSpecs: [
        { label: 'Typologie des centrales', value: 'Hangars agricoles neufs & toitures PV' },
        { label: 'Nombre de centrales', value: '15 centrales solaires réparties' },
        { label: 'Puissance unitaire moyenne', value: '416 kWc (de 120 à 1 006 kWc)' },
        { label: 'Productible P50 garanti', value: '1 125 kWh/kWc/an (7 036 MWh/an)' },
        { label: 'CAPEX moyen raccordé', value: '~593 € / kWc clé en main' },
        { label: 'Raccordement Réseau Enedis', value: 'BT/HTA selon puissance unitaire' },
        { label: 'Durée du bail notarié', value: 'Promesse de bail 20 ans signée (100%)' },
        { label: 'Statut urbanisme', value: '15/15 URBA OK' },
      ],
      cycleTimeline: [],
      turpeComparison: null,
      financialProjection: [
        { year: 2026, ca: 569527, opex: 70977, ebitda: 498650, dette: 251445, cashflow: 179950, dscr: '1.72x' },
        { year: 2027, ca: 570366, opex: 72397, ebitda: 497969, dette: 251445, cashflow: 180582, dscr: '1.72x' },
        { year: 2028, ca: 571207, opex: 73845, ebitda: 497362, dette: 251445, cashflow: 181215, dscr: '1.73x' },
        { year: 2029, ca: 572050, opex: 75322, ebitda: 496728, dette: 251445, cashflow: 181848, dscr: '1.73x' },
        { year: 2030, ca: 572895, opex: 76828, ebitda: 496067, dette: 251445, cashflow: 182481, dscr: '1.73x' },
        { year: 2031, ca: 573742, opex: 78365, ebitda: 495377, dette: 251445, cashflow: 183114, dscr: '1.73x' },
        { year: 2032, ca: 574591, opex: 79932, ebitda: 494659, dette: 251445, cashflow: 183747, dscr: '1.74x' },
        { year: 2033, ca: 575442, opex: 81531, ebitda: 493911, dette: 251445, cashflow: 184380, dscr: '1.74x' },
        { year: 2034, ca: 576295, opex: 83162, ebitda: 493133, dette: 251445, cashflow: 185013, dscr: '1.74x' },
        { year: 2035, ca: 577122, opex: 84706, ebitda: 492416, dette: 251445, cashflow: 185646, dscr: '1.74x' },
        { year: 2036, ca: 577977, opex: 382976, ebitda: 195001, dette: 251445, cashflow: -56444, dscr: '0.78x' },
        { year: 2037, ca: 578834, opex: 88162, ebitda: 490672, dette: 251445, cashflow: 186912, dscr: '1.73x' },
        { year: 2038, ca: 579693, opex: 89925, ebitda: 489768, dette: 251445, cashflow: 187545, dscr: '1.73x' },
        { year: 2039, ca: 580554, opex: 91724, ebitda: 488830, dette: 251445, cashflow: 188178, dscr: '1.72x' },
        { year: 2040, ca: 581417, opex: 93558, ebitda: 487859, dette: 251445, cashflow: 188811, dscr: '1.72x' },
        { year: 2041, ca: 582282, opex: 95429, ebitda: 486853, dette: 251445, cashflow: 189444, dscr: '1.72x' },
        { year: 2042, ca: 583129, opex: 97338, ebitda: 485791, dette: 251445, cashflow: 190077, dscr: '1.71x' },
        { year: 2043, ca: 583978, opex: 99285, ebitda: 484693, dette: 251445, cashflow: 190710, dscr: '1.71x' },
        { year: 2044, ca: 584828, opex: 101271, ebitda: 483557, dette: 251445, cashflow: 191343, dscr: '1.70x' },
        { year: 2045, ca: 585679, opex: 103254, ebitda: 482425, dette: 251445, cashflow: 192406, dscr: '1.70x' },
      ],
      cumulativeKpis: [
        { label: 'EBITDA CUMULÉ 20 ANS', value: '9,47 M€', sub: 'Marge opérationnelle moyenne > 82%' },
        { label: 'TRÉSORERIE NETTE CUMULÉE', value: '3,35 M€', sub: '3 349 801 € après service dette et MRA' },
        { label: 'CA CUMULÉ 20 ANS', value: '11,55 M€', sub: 'Tarif S21 garanti indexé +0.6%/an' },
      ],
    },
  },
  {
    id: 'volta',
    name: 'Portefeuille Consolidé BESS VOLTA',
    type: 'BESS',
    typeBadge: 'Stockage Réseau BESS Stand-Alone',
    seller: 'ENR COURTAGE (100%)',
    color: 'cyan',
    icon: 'Battery',
    description: 'Portefeuille homogène de 26 projets (29 stations) de stockage par batteries (BESS) Stand-alone de 500 kW / 1 044 kWh (14.50 MW / 30.28 MWh), détenu en totalité par ENR COURTAGE.',
    descriptionShort: 'Audit certifié du 06 octobre 2026 : 29 stations raccordées HTA en Nouvelle-Aquitaine et Occitanie, optimisées 2 cycles/jour (FCR, SPOT, Capacité RTE) sous régime TURPE 7 CRE 2025-227.',
    kpis: {
      totalPower: '14.50 MW',
      totalPowerLabel: 'Volume Consolidé',
      totalPowerSub: '29 unités / 30.28 MWh',
      sites: 29,
      sitesLabel: 'stations standardisées (26 projets)',
      sitesStatus: '500 kW / 1 044 kWh',
      metric1: { label: 'Capacité Énergie', value: '30.28 MWh', sub: '29 stations de 1 044 kWh' },
      metric2: { label: 'CAPEX Clé en main', value: '8.40 M€', sub: '~290 k€ / site raccordé' },
    },
    highlights: [
      {
        icon: 'Lock',
        title: 'Foncier Sécurisé sur 20 Ans (PdB Notariées)',
        text: '29 Promesses de Bail (PdB) signées sur 20 ans avec un loyer annuel maîtrisé de 750 €/brique de 125 kW, soit 3 000 €/an par site de 500 kW.',
      },
      {
        icon: 'Tags',
        title: 'Accord Fournisseur Négocié à 35 k€ / 125 kW',
        text: 'Accord de fourniture exclusif permettant d\'équiper un site de 500 kW pour 140 000 € HT en batteries CESC Mercury. CAPEX clé en main total de 8.40 M€ (~290 k€/site).',
      },
      {
        icon: 'TrendingUp',
        title: 'Le Pivot Réglementaire TURPE 7 (CRE 2025-227)',
        text: 'Exonération de plus de 80% des composantes TURPE pour le stockage, générant un gain consolidé annuel audité de +411 307 €/an net pour les 29 stations.',
      },
    ],
    advantages: [],
    economicMatrix: [
      { param: 'Nombre de projets', value: '26 projets (29 stations)', justification: '29 unités de 500 kW / 1 044 kWh' },
      { param: 'Puissance / Capacité', value: '14,50 MW / 30,28 MWh', justification: 'Dimensionnements validés (2 cycles/jour)' },
      { param: 'Chiffre d\'Affaires An 1', value: '2,70 M€ (2 701 952 €/an)', justification: 'Value Stacking FCR + SPOT + Capacité' },
      { param: 'EBITDA Net An 1', value: '1,62 M€ / an', justification: 'Marge opérationnelle ~60% après OPEX et loyers' },
      { param: 'CAPEX Clé en main', value: '8,40 M€ (~290 k€ / site)', justification: 'Accord fabricant batteries 35 k€ / 125 kW' },
      { param: 'Financement Senior', value: 'Dette 12 ans à 4.30% (Annuité 910 519 €/an)', justification: 'DSCR moyen portefeuille : 1.91x' },
    ],
    sites: BESS_SITES,
    footerNote: 'Fiches projets, PdB, devis et analyses réseau sous NDA',
    dataRoom: {
      categories: [
        { name: 'Juridique', icon: 'Scale', files: [
          { name: 'Promesse de Bail BESS — BATIOT (32220 MONGAUSY) [24 pages]', type: 'PDF', size: '623 Ko', fileUrl: '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf' },
          { name: 'Promesse de Bail BESS — CASTEBRUNET (82300 CAUSSADE) [25 pages]', type: 'PDF', size: '906 Ko', fileUrl: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie_CASTEBRUNET_82300_CAUSSADE.pdf' },
          { name: 'Promesse de Bail BESS — COMBY (19210 SAINT-ÉLOY) [24 pages]', type: 'PDF', size: '840 Ko', fileUrl: '/documents/dataroom/Nouvelle_Promesse_de_bail_batteries_COMBY_19210_SAINT_ELOY_LES_TUILLERIES.pdf' },
          { name: 'Promesses de Bail (PdB) — 29 stations BESS', type: 'PDF', size: '18.7 Mo', fileUrl: '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf' },
          { name: 'Accord fournisseur batteries CESC (35 k€ / 125 kW)', type: 'PDF', size: '3.2 Mo' },
        ]},
        { name: 'Technique', icon: 'Wrench', files: [
          { name: 'Fiches synoptiques — 29 stations BESS', type: 'PDF', size: '22.4 Mo' },
          { name: 'Spécifications batteries 125 kW', type: 'PDF', size: '4.8 Mo' },
          { name: 'Plans dalle & implantation type', type: 'PDF', size: '6.1 Mo' },
        ]},
        { name: 'Financier', icon: 'Calculator', files: [
          { name: 'Matrice économique BESS consolidée (14.50 MW)', type: 'XLSX', size: '38 Ko', fileUrl: '/documents/dataroom/Matrice_economique_BESS_consolidee_VOLTA.xlsx' },
          { name: 'Hypothèses revenus FCR/aFRR/MdC', type: 'XLSX', size: '38 Ko', fileUrl: '/documents/dataroom/Hypotheses_revenus_FCR_aFRR_MdC_VOLTA.xlsx' },
        ]},
        { name: 'Réseau', icon: 'Network', files: [
          { name: 'Cartographie transformateurs sol identifiés', type: 'PDF', size: '14.5 Mo' },
          { name: 'Analyse capacités raccordement Enedis', type: 'PDF', size: '8.2 Mo' },
        ]},
      ],
    },
    teaserData: {
      financialKpis: [
        { label: 'TRI PROJET / EQUITY', value: '20,5% / 37,4%', sub: 'TRI Projet 20,5% • Equity 37,4%', detail: 'SRI Bancabilité élevée (DSCR 1.91x)', color: 'cyan' },
        { label: 'PAYBACK NET', value: '5,0 ans', sub: 'Sur Fonds Propres : 2,2 ans', detail: 'Retour rapide sur investissement', color: 'emerald' },
        { label: 'EBITDA NET AN 1', value: '1,62 M€', sub: 'Consolidé 29 stations', detail: '1 624 851 € après loyer & maintenance', color: 'white' },
        { label: 'CA BRUT AN 1', value: '2,70 M€', sub: '2 701 952 € sur 2 cycles/jour', detail: 'FCR + SPOT + Capacité RTE', color: 'cyan' },
        { label: 'GAIN TURPE 7', value: '+411 307 €', sub: 'Délibéré CRE 2025-227', detail: 'Exonération >80% soutirage/injection', color: 'emerald' },
        { label: 'CAPEX TOTAL', value: '8,40 M€', sub: '~290 k€ / site raccordé', detail: 'Clé en main 29 stations BESS', color: 'white' },
      ],
      pillars: [
        {
          icon: 'MapPin',
          title: 'Défrichage Foncier & Urbanisme Sans Appel',
          items: [
            '29 stations sécurisées sur dalle béton standardisée 19.84 m²',
            'Déclarations Préalables (DP < 20 m²) déposées / obtenues',
            'Promesses de Bail 20 ans notariées signées (3 000 € HT/an/site)',
            'Dossiers de raccordement Enedis prêts au dépôt',
          ],
          bottomStat: { label: 'Emprise au sol compacte < 20 m²', value: true },
        },
        {
          icon: 'TrendingUp',
          title: 'Le Pivot Réglementaire TURPE 7 (CRE 2025-227)',
          items: [
            'Suppression de la double taxation sur soutirage / injection',
            'Exonération de >80% des composantes TURPE pour le stockage',
            'Gain consolidé annuel audité de +411 307 € pour les 29 stations',
            'Cadre réglementaire stabilisé par la CRE sur la période tarifaire',
          ],
          bottomStat: { label: '+411 307 € de gain réseau annuel net', value: true },
        },
        {
          icon: 'Zap',
          title: 'Monétisation Multi-Marchés (2 Cycles/Jour)',
          items: [
            '1. Réserve Primaire 50 Hz (FCR) & PICASSO (aFRR) : 1 584 144 € / an (58.7%)',
            '2. Arbitrage Spot EPEX (Day-Ahead & Intraday) : 884 065 € / an (31.8%)',
            '3. Marché de Capacité RTE (Pointes Hiver PP2) : 253 750 € / an (9.5%)',
          ],
          bottomStat: { label: 'Chiffre d\'affaires annuel An 1 : 2,70 M€', value: true },
        },
        {
          icon: 'Repeat',
          title: 'Standardisation Industrielle Réplicable',
          items: [
            'Architecture modulaire éprouvée : 116 armoires CESC Mercury 261 (4 / site)',
            'Dalle normalisée 6.20 × 5.20m clé en main',
            'Accord fournisseur batteries négocié à 35 k€ / 125 kW',
            'Contrat d\'agrégation et maintenance centralisé à distance',
          ],
          bottomStat: { label: '100% approvisionnement fournitures clé en main', value: true },
        },
      ],
      revenueArchitecture: {
        total: '2,70 M€',
        totalLabel: 'CA brut annuel consolidé (2 701 952 €)',
        cycleLabel: '2 cycles quotidiens (FCR + SPOT + Capacité)',
        sources: [
          { name: '1. Réserve Primaire 50 Hz (FCR) & PICASSO (aFRR Réglage Secondaire)', value: '1 584 144 €', pct: '58.7%', color: '#06b6d4' },
          { name: '2. Arbitrage Spot EPEX (Day-Ahead & Intraday — 2 Cycles / Jour)', value: '884 065 €', pct: '31.8%', color: '#22d3ee' },
          { name: '3. Marché de Capacité RTE (Garantie de Puissance Pointes Hiver PP2)', value: '253 750 €', pct: '9.5%', color: '#67e8f9' },
        ],
      },
      stationSpecs: [
        { label: 'Configuration technique', value: '116 armoires extérieures réparties sur 29 sites (CESC Mercury 261)' },
        { label: 'Puissance nominale & Capacité', value: '14.50 MW / 30.28 MWh consolidés (29 unités de 500 kW / 1 044 kWh)' },
        { label: 'Emprise au sol & Génie Civil', value: '19.84 m² sur dalle béton (< 20 m² Déclaration Préalable DP)' },
        { label: 'Clôture & Sécurité', value: 'Grillage rigide thermo-laqué H 2.00m avec portillon sécurisé' },
        { label: 'Rendement Round-Trip (AC-AC)', value: '88.0% certifié en cycles nominaux' },
        { label: 'Refroidissement & Sécurité incendie', value: 'Liquide HVAC + Aérosol NFPA 855 asservi' },
        { label: 'Raccordement Réseau Enedis', value: 'HTA 20 000 V (Option HTA1 Courte Utilisation)' },
        { label: 'Sécurisation foncière', value: 'Promesses de bail 20 ans signées (3 000 € HT/an/site)' },
        { label: 'Bancabilité & Dette', value: 'Dette 12 ans @ 4.30% (Annuité 910 519 €/an • DSCR 1.91x)' },
        { label: 'Payback projet portefeuille', value: '5.0 ans (Fonds propres : 2.2 ans)' },
      ],
      cycleTimeline: [
        { label: 'Charge Cycle 1 (Creux Nuit)', time: '01:00 → 05:00', color: 'cyan' },
        { label: 'Décharge Cycle 1 (Pointe Matin)', time: '07:30 → 09:30', color: 'amber' },
        { label: 'Charge Cycle 2 (Creux Solaire)', time: '12:00 → 15:00', color: 'cyan' },
        { label: 'Décharge Cycle 2 (Pointe Soir)', time: '18:30 → 21:00', color: 'amber' },
      ],
      turpeComparison: {
        rows: [
          { component: 'Composante Soutirage brut (CS)', oldRegime: 'Même si sur 10,7% de l\'énergie chargée', newRegime: 'Exonération totale sur 80% et spécial', gain: '+226 776 € / an' },
          { component: 'Composante Prix de Puissance (CS Pss)', oldRegime: 'Tarification longue durée analogie', newRegime: 'HTN+Courrier du batteur (15,20 €/MWh)', gain: '+56 437 € / an' },
          { component: 'Pertes Réseau Non Récupérables', oldRegime: 'Double taxation si même maille régional', newRegime: 'Strictement limitée au 1,5% des pertes', gain: '+83 913 € / an' },
          { component: 'Composante Gestion & Comptage (CG/CC)', oldRegime: 'Forfaits conventionnels', newRegime: 'Comptage + quadrants inté-relevé directe (0,14 €/an)', gain: '+44 181 € / an' },
        ],
        total: { label: 'TOTAL FACTURE ANNUELLE RÉSEAU', oldTotal: '652 434 € / an', newTotal: '241 127 € / an (-63%)', gain: '+411 307 € / an' },
        consolidatedGain: 'Gain Consolidé : +411 307 € / an net',
      },
      financialProjection: [
        { year: 2026, ca: 2701952, opex: 1077101, ebitda: 1624851, dette: 910519, cashflow: 714332, cumul: 714332 },
        { year: 2027, ca: 2736163, opex: 1092247, ebitda: 1643916, dette: 910519, cashflow: 733397, cumul: 1447729 },
        { year: 2028, ca: 2771086, opex: 1107990, ebitda: 1663096, dette: 910519, cashflow: 752577, cumul: 2200306 },
        { year: 2029, ca: 2806737, opex: 1124336, ebitda: 1682401, dette: 910519, cashflow: 771882, cumul: 2972188 },
        { year: 2030, ca: 2843207, opex: 1141380, ebitda: 1701827, dette: 910519, cashflow: 791308, cumul: 3763496 },
        { year: 2031, ca: 2880427, opex: 1159023, ebitda: 1721404, dette: 910519, cashflow: 810885, cumul: 4574381 },
        { year: 2032, ca: 2918438, opex: 1177411, ebitda: 1741027, dette: 910519, cashflow: 830508, cumul: 5404889 },
        { year: 2033, ca: 2957257, opex: 1196551, ebitda: 1760706, dette: 910519, cashflow: 850187, cumul: 6255076 },
        { year: 2034, ca: 2996931, opex: 1216478, ebitda: 1780453, dette: 910519, cashflow: 869934, cumul: 7125010 },
        { year: 2035, ca: 3037504, opex: 1237215, ebitda: 1800289, dette: 910519, cashflow: 889770, cumul: 8014780 },
        { year: 2036, ca: 3078724, opex: 1243552, ebitda: 1835172, dette: 910519, cashflow: 924653, cumul: 8939433 },
        { year: 2037, ca: 3120930, opex: 1262171, ebitda: 1858759, dette: 910519, cashflow: 948240, cumul: 9887673 },
        { year: 2038, ca: 3164046, opex: 1281179, ebitda: 1882867, dette: 0, cashflow: 1882867, cumul: 11770540 },
        { year: 2039, ca: 3208092, opex: 1300575, ebitda: 1907517, dette: 0, cashflow: 1907517, cumul: 13678057 },
        { year: 2040, ca: 3253095, opex: 1320364, ebitda: 1932731, dette: 0, cashflow: 1932731, cumul: 15610788 },
      ],
      cumulativeKpis: [
        { label: 'CA CUMULÉ 15 ANS', value: '44,48 M€', sub: 'Hypothèse 2 cycles/jour indexés' },
        { label: 'EBITDA CUMULÉ 15 ANS', value: '26,67 M€', sub: 'Marge opérationnelle ~60%' },
        { label: 'TRÉSORERIE CUMULÉE 15 ANS', value: '15,61 M€', sub: 'Post-dette senior 12 ans (4.30%)' },
      ],
    },
  },
];

// ============================================================================
// PROCESSUS M&A
// ============================================================================
export const PROCESS_STEPS = [
  {
    step: 1,
    label: '01',
    title: 'Expression d\'Intérêt',
    description: 'Sélection du périmètre cible (Portefeuille entier ou projets spécifiques).',
    color: 'amber',
    icon: 'Send',
  },
  {
    step: 2,
    label: '02',
    title: 'NDA Bilatéral',
    description: 'Signature de l\'accord de confidentialité mutuel contre-signé par Yann BARBERIS.',
    color: 'blue',
    icon: 'FileSignature',
  },
  {
    step: 3,
    label: '03',
    title: 'Accès Data Room',
    description: 'Consultation des fiches projets, PdB, devis d\'exécution et accords fournisseurs.',
    color: 'emerald',
    icon: 'FolderLock',
  },
  {
    step: 4,
    label: '04',
    title: 'Offre & Négociation',
    description: 'Dépôt d\'offre indicative avec jalonnements personnalisés et cycle d\'échanges bilatéraux.',
    color: 'purple',
    icon: 'Coins',
  },
  {
    step: 5,
    label: '05',
    title: 'Mandat de Négociation Exclusive',
    description: 'Verrouillage de l\'accord négocié, période d\'exclusivité ferme et préparation des actes définitifs de cession.',
    color: 'amber',
    icon: 'FileCheck',
  },
  {
    step: 6,
    label: '06',
    title: 'Closing & Cession',
    description: 'Transfert effectif des droits de développement et suivi contractuel par jalons.',
    color: 'rose',
    icon: 'CheckCheck',
  },
];

// ============================================================================
// MODÈLE DU MANDAT DE NÉGOCIATION EXCLUSIVE (LOI & EXCLUSIVITY AGREEMENT)
// ============================================================================
export function generateExclusiveMandateText({
  companyName = '[Société Acquéreur]',
  legalForm = 'Société par actions simplifiée',
  headOffice = '[Adresse Siège Social]',
  rcsNumber = '[RCS]',
  rcsCity = '[Ville]',
  representativeName = '[Nom Représentant]',
  representativeRole = '[Fonction]',
  portfolioName = 'Portefeuille HÉLIOS & VOLTA',
  offerType = 'total',
  selectedSitesCount = 25,
  amountEur = 2500000,
  milestones = [],
  dateStr = new Date().toLocaleDateString('fr-FR'),
  exclusivityDays = 60,
  investorSigned = false,
  investorSignedAt = null,
  adminSigned = false,
  adminSignedAt = null,
} = {}) {
  const formattedAmount = new Intl.NumberFormat('fr-FR').format(amountEur);

  const milestonesListText = milestones && milestones.length > 0
    ? milestones.map((m, idx) => 
        `   • Jalon ${idx + 1} : ${m.label}\n     - Quote-part : ${m.percentage}%\n     - Montant exigible : ${new Intl.NumberFormat('fr-FR').format(m.amount)} € HT\n     - Condition d'exigibilité : ${m.targetCondition || 'Attestation formelle de conformité'}\n     - Échéance indicative : ${m.targetDate || 'Calendrier contractuel'}`
      ).join('\n\n')
    : '   • Jalon 1 : Signature de la promesse (30%)\n   • Jalon 2 : Purge du recours des tiers (30%)\n   • Jalon 3 : Accord Enedis PTF (20%)\n   • Jalon 4 : Ready to Build (RTB) (20%)';

  return `MANDAT D'ENTRÉE EN NÉGOCIATION EXCLUSIVE & ACCORD DE VALORISATION
(CONTRAT D'EXCLUSIVITÉ TRANSACTIONNELLE — CESSION DE DROITS DE DÉVELOPPEMENT)

ENTRE LES SOUSSIGNÉS :

1. ENR COURTAGE SAS
Société par actions simplifiée au capital social de 1 000 €, dont le siège social est situé 7 RUE GUTENBERG, 33700 MÉRIGNAC, immatriculée au RCS de Bordeaux sous le numéro 881 500 552, représentée par Monsieur Yann BARBERIS en sa qualité de Président,
(Ci-après désignée « LE CÉDANT / ENR COURTAGE »)

D'UNE PART,

ET :

2. ${companyName}
${legalForm}, dont le siège social est sis au ${headOffice}, immatriculée au RCS de ${rcsCity} sous le numéro ${rcsNumber}, représentée par ${representativeName}, en sa qualité de ${representativeRole},
(Ci-après désignée « L'ACQUÉREUR »)

D'AUTRE PART,
(Ci-après ensemble dénommées « Les Parties »).

PRÉAMBULE & CONTEXTE :
1. Les Parties sont entrées en pourparlers sous couvert d'un Accord de Confidentialité Bilatéral (NDA) régularisé et vérifié.
2. L'Acquéreur a eu accès à la Data Room technique et financière mise à disposition par ENR COURTAGE.
3. À l'issue des échanges et de la phase d'instruction, les Parties sont parvenues à un accord financier et structurel portant sur la cession des droits de développement décrits ci-après.
4. Le présent Mandat a pour objet d'organiser et de sécuriser la phase finale de rédaction contractuelle sous le bénéfice d'une exclusivité réciproque stricte.

IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :

ARTICLE 1 — PÉRIMÈTRE DE LA TRANSACTION
Le présent accord porte sur la cession ferme des droits de développement relatifs au périmètre suivant :
- Désignation : ${portfolioName}
- Typologie d'acquisition : ${offerType === 'total' ? `Totalité du portefeuille (${selectedSitesCount} sites sécurisés)` : `Achat partiel (${selectedSitesCount} site(s) spécifiquement désigné(s))`}
- Droits cédés : Droits de développement, maîtrise foncière (Promesses de bail emphytéotique), dossiers d'urbanisme purgés ou en cours de purge, accords techniques et dimensionnements.

ARTICLE 2 — VALORISATION ET CONDITIONS FINANCIÈRES FERMES
Le prix d'acquisition global convenu et arrêté entre les Parties est fixé à :
MONTANT GLOBAL FERME : ${formattedAmount} € HT (Euros Hors Taxes)

ARTICLE 3 — MODALITÉS D'ÉCHÉANCIER ET JALONNEMENTS CONTRACTUELS
Le règlement du prix sera échelonné selon le schéma de jalonnements négocié et validé par les deux Parties :

${milestonesListText}

Chaque versement sera conditionné à la constatation matérielle de la levée de la condition suspensive afférente et fera l'objet d'un séquestre notarié ou d'un compte CARPA.

ARTICLE 4 — ENGAGEMENT D'EXCLUSIVITÉ
En contrepartie de la fermeté de la proposition de l'Acquéreur et du temps mobilisé par ses équipes, ENR COURTAGE accorde à l'Acquéreur une EXCLUSIVITÉ STRICTE ET TOTALE de négociation pour une durée de :
DURÉE D'EXCLUSIVITÉ : ${exclusivityDays} JOURS OUVRÉS à compter de la date de signature des présentes.

Pendant cette période, ENR COURTAGE s'interdit formellement :
- De solliciter, encourager ou accepter toute offre concurrente d'un tiers sur le périmètre visé.
- D'accorder des accès Data Room ou d'engager des négociations parallèles.
- De transférer ou hypothéquer les droits de développement en cause.

ARTICLE 5 — CONCLUSION DES ACTES DÉFINITIFS DE CESSION
Les Parties conviennent que la rédaction, l'audit juridique et la conclusion des actes définitifs de cession (protocole d'accord de cession, promesse de cession de droits de développement, baux emphytéotiques, convention de séquestre et contrats d'accompagnement technique) interviendront au cours de la période d'exclusivité selon le calendrier convenu entre les Parties.

ARTICLE 6 — CONFIDENTIALITÉ ET LOI APPLICABLE
Le présent accord est soumis au droit français. Tout différend relatif à sa validité, son interprétation ou son exécution sera soumis à la juridiction exclusive du Tribunal de Commerce de Bordeaux.

Fait le ${dateStr}, en deux (2) exemplaires originaux revêtus de signatures électroniques certifiées.

POUR L'ACQUÉREUR : ${companyName}
Représentée par : ${representativeName} (${representativeRole})
Statut signature : ${investorSigned ? `✓ SIGNÉ ÉLECTRONIQUEMENT le ${new Date(investorSignedAt || Date.now()).toLocaleString('fr-FR')} (Bon pour accord et mandat d'exclusivité)` : '[En attente de signature par l\'Acquéreur]'}

POUR LE CÉDANT : ENR COURTAGE SAS
Représentée par : Monsieur Yann BARBERIS, Président
Statut signature : ${adminSigned ? `✓ SIGNÉ ÉLECTRONIQUEMENT le ${new Date(adminSignedAt || Date.now()).toLocaleString('fr-FR')} (Bon pour acceptation et octroi de l'exclusivité)` : '[En attente de signature par ENR COURTAGE]'}`;
}

// ============================================================================
// MODÈLE DU NDA BILATÉRAL (CONFORME WORD ACTE CONFIDENTIALITÉ ENR COURTAGE)
// ============================================================================
export function generateBilateralNdaText({
  companyName = '[Société]',
  legalForm = 'Société par actions simplifiée',
  headOffice = '[Adresse du siège social]',
  rcsNumber = '[Numéro RCS]',
  rcsCity = '[Ville RCS]',
  representativeName = '[Nom du signataire]',
  representativeRole = '[Fonction]',
  dateStr = new Date().toLocaleDateString('fr-FR'),
  adminSigned = false,
  userSigned = false,
} = {}) {
  return `ACCORD DE CONFIDENTIALITÉ (NDA)

ENTRE LES SOUSSIGNÉS :

1. ENR COURTAGE,
SAS, société par actions simplifiée, dont le siège social est situé au 7 RUE GUTENBERG 33700 MERIGNAC, France, immatriculée au Registre du Commerce et des Sociétés sous le numéro 881 500 552, représentée par Monsieur Yann BARBERIS, en sa qualité de Président.
(Ci-après désignée la "Partie Divulgatrice")

ET

2. ${companyName},
${legalForm}, dont le siège social est situé au ${headOffice}, immatriculée au Registre du Commerce et des Sociétés de ${rcsCity} sous le numéro ${rcsNumber}, représentée par ${representativeName}, en sa qualité de ${representativeRole}.
(Ci-après désignée la "Partie Réceptrice")

(Ci-après désignées collectivement les "Parties" et individuellement une "Partie")

PRÉAMBULE
Les Parties souhaitent entrer en discussions concernant l'acquisition potentielle par la Partie Réceptrice des droits de développement d'un ou plusieurs portefeuilles de projets photovoltaïques et de stockage d'énergie par batteries (BESS) développés par la Partie Divulgatrice (ci-après le "Projet").
Dans ce cadre, la Partie Divulgatrice sera amenée à communiquer à la Partie Réceptrice des informations strictement confidentielles et stratégiques.

ARTICLE 1 - DÉFINITION DES INFORMATIONS CONFIDENTIELLES
Sont considérées comme "Informations Confidentielles" toutes les informations, données, documents et savoir-faire, de quelque nature que ce soit (commerciale, technique, financière, juridique ou administrative), transmis par la Partie Divulgatrice à la Partie Réceptrice.
Cela inclut expressément, sans s'y limiter :
- Les listes de projets, fichiers Excel, coordonnées géographiques, parcelles cadastrales et documents d'urbanisme (Déclarations Préalables, Permis de Construire).
- Les accords fonciers, promesses de bail emphytéotique et conditions financières associées.
- Les accords de distribution, de partenariat, et les structures de coûts (CAPEX/OPEX) négociés avec des tiers (notamment les fournisseurs de batteries et constructeurs).
- L'existence même des discussions entre les Parties.

ARTICLE 2 - OBLIGATIONS DE LA PARTIE RÉCEPTRICE
La Partie Réceptrice s'engage strictement à :
- Garder les Informations Confidentielles rigoureusement secrètes et ne pas les divulguer à des tiers.
- N'utiliser ces Informations Confidentielles qu'aux seules fins de l'évaluation, de la négociation et de la réalisation du Projet.
- Ne communiquer ces Informations Confidentielles qu'à ses dirigeants, employés, ou conseils professionnels (avocats, auditeurs) ayant une stricte nécessité d'en connaître pour l'évaluation du Projet, et sous réserve que ces personnes soient soumises à des obligations de confidentialité au moins aussi strictes que celles du présent accord.

ARTICLE 3 - EXCLUSIONS
Les obligations de confidentialité ne s'appliquent pas aux informations pour lesquelles la Partie Réceptrice peut prouver :
- Qu'elles étaient dans le domaine public au moment de leur divulgation ou y sont tombées par la suite sans faute de sa part.
- Qu'elles étaient déjà valablement en sa possession avant la divulgation par la Partie Divulgatrice.
- Qu'elles ont été reçues de manière licite d'un tiers n'étant pas soumis à une obligation de confidentialité.

ARTICLE 4 - NON-CONTOURNEMENT ET NON-SOLLICITATION
Pendant la durée du présent accord, la Partie Réceptrice s'interdit formellement de :
- Contacter, solliciter ou tenter de contracter directement avec les propriétaires fonciers, apporteurs d'affaires, fournisseurs ou partenaires techniques dont l'identité aurait été révélée par les Informations Confidentielles, dans le but de contourner la Partie Divulgatrice.
- Débaucher, solliciter ou engager tout salarié ou collaborateur de la Partie Divulgatrice.

ARTICLE 5 - RESTITUTION ET DESTRUCTION
À la première demande écrite de la Partie Divulgatrice, ou en cas de cessation des discussions concernant le Projet, la Partie Réceptrice s'engage à restituer ou détruire (à la discrétion de la Partie Divulgatrice) l'intégralité des Informations Confidentielles en sa possession dans un délai de sept (7) jours, et à en certifier la destruction par écrit.

ARTICLE 6 - DURÉE
Le présent accord entre en vigueur à la date de sa signature par la dernière des Parties. Les obligations de confidentialité et de non-contournement survivront pour une durée de un (1) an à compter de cette date, y compris en cas de rupture des pourparlers.

ARTICLE 7 - LOI APPLICABLE ET JURIDICTION COMPÉTENTE
Le présent accord est régi et interprété conformément au droit français. Tout litige relatif à sa validité, son interprétation ou son exécution, à défaut d'accord amiable, sera soumis à la compétence exclusive du Tribunal de Commerce de Bordeaux.

Fait en deux (2) exemplaires originaux, le ${dateStr}

Pour ENR COURTAGE
Nom : Yann BARBERIS
Titre : Président
Signature : ${adminSigned ? '✓ Signé électroniquement par Yann BARBERIS' : '[En attente de validation administrative]'}

Pour ${companyName}
Nom : ${representativeName}
Titre : ${representativeRole}
Signature : ${userSigned ? `✓ Signé électroniquement par ${representativeName}` : '[En attente de signature]'}`;
}

export const NDA_TEXT = generateBilateralNdaText();

// ============================================================================
// CAPACITÉ TOTALE CALCULÉE
// ============================================================================
export function computeGlobalKpis(portfolios) {
  let totalPvKwc = 0;
  let pvSitesCount = 0;
  let bessMW = 0;
  let bessSitesCount = 0;

  portfolios.forEach((p) => {
    if (p.type === 'PV') {
      const activeSites = p.sites || [];
      totalPvKwc = activeSites.reduce((sum, s) => sum + (s.kwc || 0), 0);
      pvSitesCount = activeSites.length;
    } else if (p.type === 'BESS') {
      const activeSites = p.sites || [];
      bessMW = activeSites.reduce((sum, s) => sum + (s.kw || 0), 0) / 1000;
      bessSitesCount = activeSites.reduce((sum, s) => sum + (s.stationsCount || 1), 0);
    }
  });

  const pvMWc = (totalPvKwc / 1000).toFixed(2);
  const totalMW = (parseFloat(pvMWc) + bessMW).toFixed(2);

  return {
    totalMW: `${totalMW} MW`,
    pvMWc: `${pvMWc} MWc`,
    pvSites: pvSitesCount,
    bessMW: `${bessMW.toFixed(2)} MW`,
    bessSites: bessSitesCount,
    totalSites: pvSitesCount + bessSitesCount,
  };
}
