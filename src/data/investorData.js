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
// INVESTISSEURS (comptes de démonstration)
// ============================================================================
export const INVESTORS = [
  {
    id: 'INV-001',
    code: 'HELIOS2026',
    password: 'invest@enr!01',
    name: 'Jean-Marc Dupont',
    company: 'Meridiam Infrastructure',
    email: 'jm.dupont@meridiam.com',
    status: 'active', // 'pending' | 'nda_required' | 'active'
    ndaSignedAt: '2026-09-01T10:00:00Z',
    createdAt: '2026-08-15T08:00:00Z',
  },
  {
    id: 'INV-002',
    code: 'VOLTA2026',
    password: 'invest@enr!02',
    name: 'Sophie Laurent',
    company: 'Omnes Capital',
    email: 's.laurent@omnescapital.com',
    status: 'nda_required',
    ndaSignedAt: null,
    createdAt: '2026-09-05T14:00:00Z',
  },
  {
    id: 'INV-003',
    code: 'DEMO2026',
    password: 'demo@enr!03',
    name: 'Investisseur Démo',
    company: 'ENR Courtage (Test)',
    email: 'demo@enr-courtage.fr',
    status: 'active',
    ndaSignedAt: '2026-09-10T09:00:00Z',
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
    description: 'Sélection du périmètre (Global ou par portefeuille).',
    color: 'amber',
    icon: 'Send',
  },
  {
    step: 2,
    label: '02',
    title: 'NDA Bilatéral',
    description: 'Signature de l\'accord de confidentialité mutuel.',
    color: 'blue',
    icon: 'FileSignature',
  },
  {
    step: 3,
    label: '03',
    title: 'Accès Data Room',
    description: 'Fiches projets, PdB, devis, accords BESS...',
    color: 'emerald',
    icon: 'FolderLock',
  },
  {
    step: 4,
    label: '04',
    title: 'Offre Indicative',
    description: 'Schéma Upfront + Earn-out (franchissement de jalons).',
    color: 'purple',
    icon: 'Coins',
  },
  {
    step: 5,
    label: '05',
    title: 'Closing & Cession',
    description: 'Transfert des droits de développement et suivi.',
    color: 'rose',
    icon: 'CheckCheck',
  },
];

// ============================================================================
// TEXTE NDA
// ============================================================================
export const NDA_TEXT = `
ACCORD DE CONFIDENTIALITÉ (NDA)

ENTRE LES SOUSSIGNÉS :

La société ENR COURTAGE, SAS au capital de [montant] €, dont le siège social est situé à [adresse], immatriculée au RCS de [ville] sous le numéro [RCS], représentée par son Président en exercice, ci-après dénommée « la Partie Divulguante »,

D'UNE PART,

ET

L'Investisseur dont l'identité est renseignée ci-dessous lors de la signature électronique, ci-après dénommé « la Partie Réceptrice »,

D'AUTRE PART,

Ci-après collectivement désignées « les Parties »,

IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :

ARTICLE 1 — OBJET
Le présent accord a pour objet de définir les conditions dans lesquelles la Partie Réceptrice s'engage à traiter de manière confidentielle les Informations Confidentielles qui lui seront communiquées par la Partie Divulguante dans le cadre de l'examen d'opportunités d'investissement portant sur des portefeuilles de projets d'énergies renouvelables (photovoltaïque et stockage par batteries).

ARTICLE 2 — DÉFINITION DES INFORMATIONS CONFIDENTIELLES
Sont considérées comme « Informations Confidentielles » toutes informations, données, documents, de quelque nature que ce soit (technique, financière, commerciale, juridique, stratégique), communiquées par la Partie Divulguante à la Partie Réceptrice, que ce soit par écrit, oralement, par voie électronique ou par tout autre moyen, notamment :
- Les teasers, mémorandums d'information et business plans ;
- Les données relatives aux sites, installations et projets ;
- Les conditions financières, prix, marges et valorisations ;
- Les contrats, accords et engagements avec des tiers ;
- Les informations relatives aux partenaires, fournisseurs et clients ;
- Les données contenues dans la Data Room virtuelle.

ARTICLE 3 — OBLIGATIONS DE CONFIDENTIALITÉ
La Partie Réceptrice s'engage à :
a) Traiter les Informations Confidentielles avec le même degré de précaution qu'elle appliquerait à ses propres informations confidentielles ;
b) Ne pas divulguer les Informations Confidentielles à des tiers sans l'accord préalable écrit de la Partie Divulguante ;
c) Limiter l'accès aux Informations Confidentielles aux seuls membres de son personnel ou conseillers ayant besoin d'en connaître ;
d) Ne pas utiliser les Informations Confidentielles à d'autres fins que l'évaluation de l'opportunité d'investissement ;
e) Ne pas reproduire ou copier les Informations Confidentielles sauf nécessité stricte.

ARTICLE 4 — DURÉE
Le présent accord prend effet à compter de sa signature et restera en vigueur pendant une durée de deux (2) ans à compter de cette date. Les obligations de confidentialité survivront à l'expiration ou à la résiliation du présent accord.

ARTICLE 5 — RESTITUTION DES INFORMATIONS
À première demande de la Partie Divulguante ou à l'issue du présent accord, la Partie Réceptrice s'engage à restituer ou détruire l'ensemble des Informations Confidentielles et de leurs copies.

ARTICLE 6 — LOI APPLICABLE ET JURIDICTION
Le présent accord est régi par le droit français. Tout litige sera soumis à la compétence exclusive des tribunaux de [ville].
`;

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
