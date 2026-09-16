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
// COMPTE ADMINISTRATEUR UNIQUE (AUCUN COMPTE DE TEST PRÉ-CONFIGURÉ)
// ============================================================================
export const INVESTORS = [
  {
    id: 'ADMIN-001',
    email: 'y.barberis@enr-courtage.fr',
    password: 'invest@enr!01',
    name: 'Yann BARBERIS',
    company: 'ENR COURTAGE',
    role: 'Président',
    isAdmin: true,
    status: 'active',
    ndaSignedAt: '2026-08-01T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-08-01T08:00:00Z',
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
    createdAt: '2026-09-16T08:00:00Z',
  },
  {
    id: 'INV-ENEE',
    email: 'a.dupre@enee-energy.com',
    password: 'Enr2026!Enee',
    name: 'Alexandre DUPRE',
    company: 'ENEE ENERGY PARTNERS',
    role: 'Directeur des Investissements',
    isAdmin: false,
    status: 'active',
    phone: '06 12 34 56 78',
    ndaSignedAt: '2026-09-10T08:00:00Z',
    ndaSignedByAdmin: true,
    createdAt: '2026-09-10T08:00:00Z',
  },
];

// ============================================================================
// PROJETS PV - Portefeuille HÉLIOS
// ============================================================================
const PV_SITES = [
  { id: 1, name: 'CONDOM', dept: '32', cp: '32100', address: '2910 Chemin de l\'osse', client: 'SAINT ARAILLES Henri', kwc: 256, type: 'Construction', cost: 466681, statut: 'URBA OK', lat: 43.985702, lng: 0.313649, orange: false },
  { id: 2, name: 'PORT DE LANNE', dept: '40', cp: '40300', address: '555 Rte des Barthes', client: 'PLANTE Jérôme', kwc: 209, type: 'Construction', cost: 147551, statut: 'EN ATTENTE', lat: 43.565451, lng: -1.189518, orange: true },
  { id: 3, name: 'PORT DE LANNE', dept: '40', cp: '40300', address: '555 Rte des Barthes', client: 'PLANTE Jérôme', kwc: 145, type: 'Construction', cost: 111358, statut: 'EN ATTENTE', lat: 43.565451, lng: -1.189518, orange: true },
  { id: 4, name: 'PRIGONRIEUX', dept: '24', cp: '24130', address: 'Rte du Grand Roc', client: 'CONSOLI Philippe', kwc: 488, type: 'Construction', cost: 208574, statut: 'URBA OK', lat: 44.872718, lng: 0.407989, orange: false },
  { id: 5, name: 'BRANTÔME EN PÉRIGORD', dept: '24', cp: '24310', address: 'Lieu Dit Puygauthier', client: 'LATOURNERIE Nicolas', kwc: 326, type: 'Construction', cost: 139152, statut: 'URBA OK', lat: 45.367098, lng: 0.584346, orange: false },
  { id: 6, name: 'BRANTÔME EN PÉRIGORD', dept: '24', cp: '24310', address: 'Lieu Dit Puygauthier', client: 'LATOURNERIE Nicolas', kwc: 680, type: 'Toitures', cost: 0, statut: 'URBA OK', lat: 45.367098, lng: 0.584346, orange: false },
  { id: 7, name: 'GARONS', dept: '30', cp: '30128', address: '164 Chemin des Canaux', client: 'RODIER-VARGAS Cécile', kwc: 460, type: 'Construction', cost: 189913, statut: 'URBA OK', lat: 43.766861, lng: 4.412497, orange: false },
  { id: 8, name: 'LÉCUSSAN', dept: '31', cp: '31580', address: '813 Rte de Tarbes', client: 'SOLLE Laurent', kwc: 290, type: 'Construction', cost: 130705, statut: 'URBA OK', lat: 43.187383, lng: 0.518683, orange: false },
  { id: 9, name: 'ORÈGUE', dept: '64', cp: '64120', address: 'Maison Bordaberria', client: 'LABEGUERIE Pantxika', kwc: 513, type: 'Construction', cost: 213969, statut: 'URBA OK', lat: 43.376822, lng: -1.134542, orange: false },
  { id: 10, name: 'VAL DE LIVENNE', dept: '33', cp: '33860', address: '1 Grand Champ', client: 'HERIT Dominique', kwc: 101, type: 'Construction', cost: 63605, statut: 'URBA OK', lat: 45.244304, lng: -0.567086, orange: false },
  { id: 11, name: 'LACQUY', dept: '40', cp: '40120', address: '374 Rte de Saint Justin', client: 'LECONTE Frédéric', kwc: 145, type: 'Construction', cost: 111358, statut: 'URBA OK', lat: 43.948286, lng: -0.264771, orange: false },
  { id: 12, name: 'PUYLAUSIC', dept: '32', cp: '32220', address: 'Lieu Dit En Barthe', client: 'CASSAGNE Christian', kwc: 157, type: 'Construction', cost: 122289, statut: 'URBA OK', lat: 43.468249, lng: 0.999615, orange: false },
  { id: 13, name: 'SAINT LAURENT DU PLAN', dept: '33', cp: '33190', address: '6 Bis Rte de Saint Laurent', client: 'LECONTE Frédéric', kwc: 386, type: 'Construction', cost: 161864, statut: 'URBA OK', lat: 44.623881, lng: -0.116668, orange: false },
  { id: 14, name: 'LECTOURE', dept: '32', cp: '32700', address: 'Lieu Dit Piche', client: 'RECKINGER Nicolas', kwc: 224, type: 'Construction', cost: 152866, statut: 'URBA OK', lat: 43.957242, lng: 0.584346, orange: false },
  { id: 15, name: 'LECTOURE', dept: '32', cp: '32700', address: 'Lieu Dit Piche', client: 'RECKINGER Nicolas', kwc: 565, type: 'Construction', cost: 247072, statut: 'URBA OK', lat: 43.957242, lng: 0.584346, orange: false },
  { id: 16, name: 'GORNAC', dept: '33', cp: '33540', address: 'Lieu Dit Le Bourg', client: 'JARRY Frédéric', kwc: 217, type: 'Construction', cost: 147551, statut: 'URBA OK', lat: 44.662283, lng: -0.180491, orange: false },
  { id: 17, name: 'GORNAC', dept: '33', cp: '33540', address: 'Lieu Dit Le Bourg', client: 'JARRY Frédéric', kwc: 411, type: 'Construction', cost: 168431, statut: 'URBA OK', lat: 44.662283, lng: -0.180491, orange: false },
  { id: 18, name: 'MIRAMBEAU', dept: '17', cp: '17150', address: '1 Chemin des Plantes', client: 'CHAUCHET Eric', kwc: 145, type: 'Construction', cost: 111358, statut: 'URBA OK', lat: 45.372551, lng: -0.573142, orange: false },
  { id: 19, name: 'SAINT SAUD LACOUSSIÈRE', dept: '24', cp: '24470', address: 'Lieu Dit Le Mas', client: 'MISSAULT Patrick', kwc: 217, type: 'Construction', cost: 147551, statut: 'URBA OK', lat: 45.541289, lng: 0.817342, orange: false },
  { id: 20, name: 'SAINT SAUD LACOUSSIÈRE', dept: '24', cp: '24470', address: 'Lieu Dit Le Mas', client: 'MISSAULT Patrick', kwc: 217, type: 'Construction', cost: 147551, statut: 'URBA OK', lat: 45.541289, lng: 0.817342, orange: false },
  { id: 21, name: 'SAINT SAUD LACOUSSIÈRE', dept: '24', cp: '24470', address: 'Lieu Dit Le Mas', client: 'MISSAULT Patrick', kwc: 380, type: 'Toitures', cost: 0, statut: 'URBA OK', lat: 45.541289, lng: 0.817342, orange: false },
  { id: 22, name: 'SAINT SAUD LACOUSSIÈRE', dept: '24', cp: '24470', address: 'Lieu Dit Le Mas', client: 'MISSAULT Patrick', kwc: 411, type: 'Toitures', cost: 0, statut: 'URBA OK', lat: 45.541289, lng: 0.817342, orange: false },
  { id: 23, name: 'AUMELAS', dept: '34', cp: '34230', address: 'Mas de Causse', client: 'MARTINEZ Jean-Pierre', kwc: 326, type: 'Construction', cost: 139152, statut: 'EN ATTENTE', lat: 43.601552, lng: 3.597541, orange: true },
  { id: 24, name: 'AUMELAS', dept: '34', cp: '34230', address: 'Mas de Causse', client: 'MARTINEZ Jean-Pierre', kwc: 430, type: 'Construction', cost: 187242, statut: 'EN ATTENTE', lat: 43.601552, lng: 3.597541, orange: true },
  { id: 25, name: 'SAINT-CASSIEN', dept: '24', cp: '24540', address: 'Lieu Dit Les Vergnes', client: 'DUPORT François', kwc: 513, type: 'Construction', cost: 213969, statut: 'URBA OK', lat: 44.685311, lng: 0.887219, orange: false },
  { id: 26, name: 'JUSSAS', dept: '17', cp: '17130', address: '1 Chez Giraud', client: 'DUHARD Christian', kwc: 181, type: 'Construction', cost: 136120, statut: 'URBA OK', lat: 45.286341, lng: -0.428912, orange: false },
  { id: 27, name: 'SAINT MARTIN DE FRESSENGEAS', dept: '24', cp: '24800', address: 'Lieu Dit La Borie', client: 'MISSAULT Patrick', kwc: 193, type: 'Construction', cost: 141201, statut: 'URBA OK', lat: 45.448512, lng: 0.846519, orange: false },
  { id: 28, name: 'SAINT MARTIN DE FRESSENGEAS', dept: '24', cp: '24800', address: 'Lieu Dit La Borie', client: 'MISSAULT Patrick', kwc: 193, type: 'Construction', cost: 141201, statut: 'URBA OK', lat: 45.448512, lng: 0.846519, orange: false },
  { id: 29, name: 'SAINT AVIT SAINT NAZAIRE', dept: '33', cp: '33220', address: '1 Lieu Dit Les Tuileries', client: 'MARTIN Eric', kwc: 337, type: 'Construction', cost: 149200, statut: 'URBA OK', lat: 44.851241, lng: 0.258914, orange: false },
];

// ============================================================================
// PROJETS BESS - Portefeuille VOLTA
// ============================================================================
const BESS_SITES = [
  { id: 1, name: 'ROCHECHOUART', dept: '87', cp: '87600', client: 'PAILLOT', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.823612, lng: 0.821345 },
  { id: 2, name: 'MONGAUSY', dept: '32', cp: '32220', client: 'BATIOT', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 43.518741, lng: 0.803451 },
  { id: 3, name: 'MEUZAC', dept: '87', cp: '87380', client: 'DOMERGUE', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.551241, lng: 1.442158 },
  { id: 4, name: 'SAINT-JULIEN-LE-VENDÔMOIS', dept: '19', cp: '19210', client: 'CUBERTAFON', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.461241, lng: 1.321458 },
  { id: 5, name: 'PORT-DE-LANNE', dept: '40', cp: '40300', client: 'PLANTE', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 43.565451, lng: -1.189518 },
  { id: 6, name: 'GRISOLLES', dept: '82', cp: '82170', client: 'PRAVIE', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 43.815412, lng: 1.298412 },
  { id: 7, name: 'BRANTÔME EN PÉRIGORD', dept: '24', cp: '24310', client: 'LATOURNERIE', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.367098, lng: 0.584346 },
  { id: 8, name: 'CONCÈZE', dept: '19', cp: '19350', client: 'DAVID', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.354125, lng: 1.345214 },
  { id: 9, name: 'SAINT-ÉLOY-LES-TUILERIES', dept: '19', cp: '19210', client: 'GRANGER', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.445124, lng: 1.289541 },
  { id: 10, name: 'CAUSSADE', dept: '82', cp: '82300', client: 'CASTEBRUNET', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.161245, lng: 1.536541 },
  { id: 11, name: 'MONESTIER', dept: '24', cp: '24240', client: 'BERTRANDIE', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.774512, lng: 0.328954 },
  { id: 12, name: 'LEYRAT', dept: '23', cp: '23600', client: 'GIOT', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 46.361245, lng: 2.298741 },
  { id: 13, name: 'DURAS', dept: '47', cp: '47120', client: 'ARBOIN', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.678451, lng: 0.182415 },
  { id: 14, name: 'SAINT-SAUD-LACOUSSIÈRE', dept: '24', cp: '24470', client: 'MISSAULT', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.541289, lng: 0.817342 },
  { id: 15, name: 'MOURIOUX-VIEILLEVILLE', dept: '23', cp: '23210', client: 'MEILLAT', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 46.078451, lng: 1.645214 },
  { id: 16, name: 'VAL-DE-LIVENNE', dept: '33', cp: '33860', client: 'SOULIGNAC', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.244304, lng: -0.567086 },
  { id: 17, name: 'PAYZAC', dept: '24', cp: '24270', client: 'CHAUFFAILLE', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.401245, lng: 1.218745 },
  { id: 18, name: 'JUILLAC', dept: '33', cp: '33890', client: 'CIROLI', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.812451, lng: 0.041258 },
  { id: 19, name: 'MANSAN', dept: '65', cp: '65140', client: 'BOURDETTES', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 43.341258, lng: 0.189541 },
  { id: 20, name: 'CAUSSADE', dept: '82', cp: '82300', client: 'CASTEBRUNET', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.161245, lng: 1.536541 },
  { id: 21, name: 'SAINT EUTROPE DE BORN', dept: '47', cp: '47210', client: 'FRECHEVILLE', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.571245, lng: 0.698541 },
  { id: 22, name: 'MONTEILS', dept: '82', cp: '82300', client: 'CASTEBRUNET', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.174512, lng: 1.564512 },
  { id: 23, name: 'BEYCHAC-ET-CAILLAU', dept: '33', cp: '33750', client: 'DOUMENS', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.871245, lng: -0.378954 },
  { id: 24, name: 'VENDAYS-MONTALIVET', dept: '33', cp: '33930', client: 'HOUSSAIT-YOUNG', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.358745, lng: -1.064512 },
  { id: 25, name: 'SAINT-MARTIN-DE-FRESSENGEAS', dept: '24', cp: '24800', client: 'MISSAULT', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.448512, lng: 0.846519 },
  { id: 26, name: 'MAISONNISSES', dept: '23', cp: '23150', client: 'LARDY', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 46.061245, lng: 1.901245 },
  { id: 27, name: 'BEYSSENAC', dept: '19', cp: '19230', client: 'CELERIE', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.401245, lng: 1.341258 },
  { id: 28, name: 'MOURIOUX-VIEILLEVILLE', dept: '23', cp: '23210', client: 'MEILLAT', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 46.078451, lng: 1.645214 },
  { id: 29, name: 'ARGENCES EN AUBRAC', dept: '12', cp: '12420', client: 'DOMERGUE', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.771245, lng: 2.824512 },
  { id: 30, name: 'SAINT-ÉLOY-LES-TUILERIES', dept: '19', cp: '19210', client: 'COMBY', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.445124, lng: 1.289541 },
  { id: 31, name: 'SAINT-CIRQ', dept: '82', cp: '82300', client: 'CASTEBRUNET', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.145124, lng: 1.604512 },
];

// ============================================================================
// PORTEFEUILLES
// ============================================================================
export const PORTFOLIOS = [
  {
    id: 'helios',
    name: 'PROJET HÉLIOS',
    type: 'PV',
    typeBadge: 'Solaire Toitures & Hangars',
    seller: 'GREEN INVEST',
    color: 'amber',
    icon: 'Sun',
    description: 'Portefeuille de projets photovoltaïques en toitures neuves et existantes, situés dans des bassins solaires stratégiques du Sud et Sud-Ouest de la France (Gers, Dordogne, Gironde, Landes, Gard, Haute-Garonne, Pyrénées-Atlantiques).',
    descriptionShort: 'Cession de droits de développement PV — toitures agricoles neuves et rénovations.',
    kpis: {
      totalPower: '8.01 MWc',
      totalPowerLabel: 'Puissance Ferme',
      totalPowerSub: '(9.12 MWc bruts)',
      sites: 25,
      sitesLabel: 'sites sécurisés',
      sitesStatus: '100% Urba OK',
      metric1: { label: 'Bâtiments Neufs', value: '6.54 MWc', sub: '22 projets neufs' },
      metric2: { label: 'Toitures Existantes', value: '1.47 MWc', sub: '3 rénovations' },
    },
    highlights: [
      {
        icon: 'ShieldCheck',
        title: 'Sécurisation Urbanistique Assainie',
        text: '25 projets au statut URBA OK purgé. Les 4 projets à risque urbanistique (Port-de-Lanne & Aumelas) sont temporairement exclus pour sécuriser le closing.',
      },
      {
        icon: 'FileCheck',
        title: 'Devis Travaux Détaillés',
        text: 'Devis d\'exécution précis (charpente métallique, fondations, couverture) déjà finalisés pour chaque bâtiment, garantissant une maîtrise immédiate du CAPEX de construction.',
      },
      {
        icon: 'Landmark',
        title: 'Foncier & Promesses de Bail',
        text: 'Maîtrise foncière contractualisée avec les exploitants propriétaires. Fiches projets individuelles complètes disponibles.',
      },
    ],
    advantages: [
      {
        icon: 'Lock',
        title: 'Foncier Sécurisé sur 20 Ans',
        text: 'Promesses de Bail (PdB) signées sur 20 ans avec un loyer annuel maîtrisé de 750 €/briqu de 125 kW, soit 3 000 €/an par site de 500 kW.',
      },
      {
        icon: 'Tags',
        title: 'Accord Fournisseur Négocié à 35 k€ / 125 kW',
        text: 'Accord de fourniture exclusif permettant d\'équiper un site de 500 kW pour 140 000 € HT en batteries. Mise en relation directe avec le fabricant à la demande.',
      },
      {
        icon: 'Zap',
        title: 'Liberté Totale Stratégie Réseau',
        text: 'Projets transmis avant dépôt des demandes de raccordement Enedis, offrant à l\'acquéreur la liberté de calibrer l\'injection/soutirage et la durée (1h, 2h ou 4h).',
      },
    ],
    economicMatrix: [
      { param: 'Nombre de projets', value: '25 sites fermes (+4 conditionnels)', justification: 'Tableaux synoptiques & fiches unitaires' },
      { param: 'Puissance globale', value: '8,01 MWc fermes (9,12 MWc bruts)', justification: 'Dimensionnements validés' },
      { param: 'Sécurisation Foncière', value: 'Promesses de Bail signées avec exploitants', justification: '✓ PdB signées communicables sous NDA' },
      { param: 'Coût Foncier / Loyer', value: 'Selon baux emphytéotiques / toitures', justification: 'Loyer verrouillé contractuellement' },
      { param: 'Chiffrage Travaux / Équipement', value: 'Devis détaillés par bâtiment', justification: 'Devis émis & Accord fournisseur négocié' },
      { param: 'Statut Raccordement / Réseau', value: 'Demandes prêtes selon obtention urba', justification: 'Dépôts libres pour l\'acquéreur' },
    ],
    sites: PV_SITES,
    footerNote: 'Fiches projets & devis disponibles sous NDA',
    dataRoom: {
      categories: [
        { name: 'Juridique', icon: 'Scale', files: [
          { name: 'Promesses de Bail (PdB) — Sites fermes', type: 'PDF', size: '12.5 Mo' },
          { name: 'Statuts société GREEN INVEST', type: 'PDF', size: '2.1 Mo' },
        ]},
        { name: 'Technique', icon: 'Wrench', files: [
          { name: 'Fiches synoptiques — 29 projets PV', type: 'PDF', size: '45.2 Mo' },
          { name: 'Devis travaux charpente détaillés', type: 'PDF', size: '28.7 Mo' },
          { name: 'Plans d\'implantation par site', type: 'PDF', size: '18.3 Mo' },
        ]},
        { name: 'Financier', icon: 'Calculator', files: [
          { name: 'Matrice économique consolidée', type: 'XLSX', size: '1.8 Mo' },
          { name: 'Business plans unitaires', type: 'XLSX', size: '5.4 Mo' },
        ]},
        { name: 'Urbanisme', icon: 'Map', files: [
          { name: 'Autorisations d\'urbanisme — Sites URBA OK', type: 'PDF', size: '32.1 Mo' },
          { name: 'Certificats d\'urbanisme opérationnels', type: 'PDF', size: '8.9 Mo' },
        ]},
      ],
    },
  },
  {
    id: 'volta',
    name: 'PROJET VOLTA',
    type: 'BESS',
    typeBadge: 'Stockage Réseau BESS Stand-Alone',
    seller: 'ENR COURTAGE (100%)',
    color: 'cyan',
    icon: 'Battery',
    description: 'Portefeuille homogène de 31 projets de stockage par batteries (BESS) Stand-alone détenu en totalité par ENR COURTAGE, conçu selon une architecture hautement standardisée.',
    descriptionShort: 'Implantations rigoureusement sélectionnées en Nouvelle-Aquitaine et Occitanie pour maximiser l\'arbitrage énergétique, la réserve primaire (FCR/aFRR) et le mécanisme de capacité.',
    kpis: {
      totalPower: '15.50 MW',
      totalPowerLabel: 'Volume Total',
      totalPowerSub: '31 sites de 500 kW',
      sites: 31,
      sitesLabel: 'sites standardisés',
      sitesStatus: '4 × 125 kW',
      metric1: { label: 'Architecture', value: '4 × 125 kW', sub: 'Dalle compacte ~20m²' },
      metric2: { label: 'Capacité Transfo', value: '≥ 400 kVA', sub: 'Transfos sol qualifiés' },
    },
    highlights: [
      {
        icon: 'Lock',
        title: 'Foncier Sécurisé sur 20 Ans',
        text: 'Promesses de Bail (PdB) signées sur 20 ans avec un loyer annuel maîtrisé de 750 €/brique de 125 kW, soit 3 000 €/an par site de 500 kW.',
      },
      {
        icon: 'Tags',
        title: 'Accord Fournisseur Négocié à 35 k€ / 125 kW',
        text: 'Accord de fourniture exclusif permettant d\'équiper un site de 500 kW pour 140 000 € HT en batteries. Mise en relation directe avec le fabricant à la demande.',
      },
      {
        icon: 'Zap',
        title: 'Liberté Totale Stratégie Réseau',
        text: 'Projets transmis avant dépôt des demandes de raccordement Enedis, offrant à l\'acquéreur la liberté de calibrer l\'injection/soutirage et la durée (1h, 2h ou 4h).',
      },
    ],
    advantages: [],
    economicMatrix: [
      { param: 'Nombre de projets', value: '31 sites standardisés', justification: 'Tableaux synoptiques & fiches unitaires' },
      { param: 'Puissance globale', value: '15,50 MW (500 kW / site)', justification: 'Dimensionnements validés' },
      { param: 'Sécurisation Foncière', value: 'Promesses de Bail sur 20 ans', justification: '✓ PdB signées communicables sous NDA' },
      { param: 'Coût Foncier / Loyer', value: '750 € / 125 kW → 3 000 € HT / an / site', justification: 'Loyer verrouillé contractuellement' },
      { param: 'Chiffrage Travaux / Équipement', value: '35 k€ / 125 kW → 140 k€ HT / site', justification: 'Devis émis & Accord fournisseur négocié' },
      { param: 'Statut Raccordement / Réseau', value: 'Transfos sol ≥ 400 kVA identifiés', justification: 'Dépôts libres pour l\'acquéreur' },
    ],
    sites: BESS_SITES,
    footerNote: 'Fiches projets, PdB, devis disponibles sous NDA',
    dataRoom: {
      categories: [
        { name: 'Juridique', icon: 'Scale', files: [
          { name: 'Promesses de Bail (PdB) — 31 sites BESS', type: 'PDF', size: '18.7 Mo' },
          { name: 'Accord fournisseur batteries', type: 'PDF', size: '3.2 Mo' },
        ]},
        { name: 'Technique', icon: 'Wrench', files: [
          { name: 'Fiches synoptiques — 31 sites BESS', type: 'PDF', size: '22.4 Mo' },
          { name: 'Spécifications batteries 125 kW', type: 'PDF', size: '4.8 Mo' },
          { name: 'Plans dalle & implantation type', type: 'PDF', size: '6.1 Mo' },
        ]},
        { name: 'Financier', icon: 'Calculator', files: [
          { name: 'Matrice économique BESS consolidée', type: 'XLSX', size: '2.3 Mo' },
          { name: 'Hypothèses revenus FCR/aFRR/MdC', type: 'XLSX', size: '1.1 Mo' },
        ]},
        { name: 'Réseau', icon: 'Network', files: [
          { name: 'Cartographie transformateurs sol identifiés', type: 'PDF', size: '14.5 Mo' },
          { name: 'Analyse capacités raccordement Enedis', type: 'PDF', size: '8.2 Mo' },
        ]},
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
    description: 'Verrouillage de l\'accord négocié, période d\'exclusivité ferme et recours obligatoire à un avocat pour les actes définitifs.',
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

ARTICLE 5 — OBLIGATION EXPRESSE DE RECOURS AUX SERVICES D'UN AVOCAT
« LES PARTIES RECONNAISSENT FORMELLEMENT ET CONVIENNENT EXPRESSÉMENT QUE LA RÉDACTION, L'AUDIT JURIDIQUE ET LA CONCLUSION DES ACTES DÉFINITIFS DE CESSION (PROTOCOLE D'ACCORD DE CESSION, PROMESSE SYNALLAGMATIQUE OU UNILATÉRALE DE CESSION DE DROITS DE DÉVELOPPEMENT, BAUX EMPHYTÉOTIQUES, CONVENTION DE SÉQUESTRE ET CONTRATS D'ACCOMPAGNEMENT TECHNIQUE) NÉCESSITENT OBLIGATOIREMENT LE RECOURS AUX SERVICES D'UN AVOCAT INSCRIT AU BARREAU OU D'UN CABINET JURIDIQUE SPÉCIALISÉ EN DROIT DE L'ÉNERGIE ET DROIT DES AFFAIRES.
Chaque Partie sera assistée de son propre Conseil juridique pour veiller à la parfaite sécurité juridique, réglementaire et fiscale du Closing. »

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
export function computeGlobalKpis(portfolios, excludeOrange = true) {
  let totalPvKwc = 0;
  let pvSitesCount = 0;
  let bessMW = 0;
  let bessSitesCount = 0;

  portfolios.forEach((p) => {
    if (p.type === 'PV') {
      const activeSites = excludeOrange ? p.sites.filter(s => !s.orange) : p.sites;
      totalPvKwc = activeSites.reduce((sum, s) => sum + (s.kwc || 0), 0);
      pvSitesCount = activeSites.length;
    } else if (p.type === 'BESS') {
      bessMW = p.sites.reduce((sum, s) => sum + (s.kw || 0), 0) / 1000;
      bessSitesCount = p.sites.length;
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
