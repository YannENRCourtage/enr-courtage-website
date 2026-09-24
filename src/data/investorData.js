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
    id: 'INV-ENEE',
    email: 'contact@enr-courtage.fr',
    password: 'invest@enr!01',
    name: 'Jean DUS',
    company: 'ENEE',
    role: 'Investisseur',
    isAdmin: false,
    status: 'active',
    phone: '07 63 54 21 33',
    ndaSignedAt: '2026-09-10T08:00:00Z',
    ndaSignedByAdmin: true,
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
    createdAt: '2026-09-16T08:00:00Z',
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
  { id: 1, name: 'ROCHECHOUART', dept: '87', cp: '87600', client: 'PAILLOT', bailleur: 'PAILLOT Noël', posteSource: 'PLAUD', distHta: '0.6 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '4.3 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.823612, lng: 0.821345 },
  { id: 2, name: 'MONGAUSY', dept: '32', cp: '32220', client: 'BATIOT', bailleur: 'BATIOT Olivier', posteSource: 'SAMAZAN', distHta: '5.9 km', quotePart: '64,11 k€', ebitda: '55 438 €', payback: '5.1 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 43.518741, lng: 0.803451 },
  { id: 3, name: 'MEUZAC', dept: '87', cp: '87380', client: 'DOMERGUE', bailleur: 'DOMERGUE Daniel', posteSource: 'LE VIGEN', distHta: '8.6 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '4.8 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.551241, lng: 1.442158 },
  { id: 4, name: 'SAINT-JULIEN-LE-VENDÔMOIS', dept: '19', cp: '19210', client: 'CUBERTAFON', bailleur: 'CUBERTAFON René', posteSource: 'LUBERSAC', distHta: '8.3 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.1 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.461241, lng: 1.321458 },
  { id: 5, name: 'PORT-DE-LANNE', dept: '40', cp: '40300', client: 'PLANTE', bailleur: 'PLANTE Jean-Pierre', posteSource: 'GUICHE', distHta: '4.8 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.1 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 43.565451, lng: -1.189518 },
  { id: 6, name: 'GRISOLLES', dept: '82', cp: '82170', client: 'PRAVIE', bailleur: 'PRAVIE Clémence', posteSource: 'VERFEIL 2', distHta: '2.3 km', quotePart: '64,11 k€', ebitda: '55 438 €', payback: '4.4 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 43.815412, lng: 1.298412 },
  { id: 7, name: 'BRANTÔME EN PÉRIGORD', dept: '24', cp: '24310', client: 'LATOURNERIE', bailleur: 'LATOURNERIE Franck', posteSource: 'BRANTÔME', distHta: '2.8 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.0 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.367098, lng: 0.584346 },
  { id: 8, name: 'CONCÈZE', dept: '19', cp: '19350', client: 'DAVID', bailleur: 'DAVID Louis', posteSource: 'LUBERSAC', distHta: '10.8 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.1 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.354125, lng: 1.345214 },
  { id: 9, name: 'SAINT-ÉLOY-LES-TUILERIES', dept: '19', cp: '19210', client: 'GRANGER', bailleur: 'GRANGER Bruno', posteSource: 'LUBERSAC', distHta: '10.8 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.1 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.445124, lng: 1.289541 },
  { id: 10, name: 'CAUSSADE', dept: '82', cp: '82300', client: 'CASTEBRUNET', bailleur: 'CASTEBRUNET Jérémy', posteSource: 'LERS', distHta: '5.7 km', quotePart: '64,11 k€', ebitda: '55 438 €', payback: '5.1 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.161245, lng: 1.536541 },
  { id: 11, name: 'MONESTIER', dept: '24', cp: '24240', client: 'BERTRANDIE', bailleur: 'BERTRANDIE Sébastien', posteSource: 'STE-FOY-LA-GRANDE', distHta: '9.8 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.3 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.774512, lng: 0.328954 },
  { id: 12, name: 'LEYRAT', dept: '23', cp: '23600', client: 'GIOT', bailleur: 'GIOT Aurélien', posteSource: 'BOUSSAC', distHta: '5.9 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.5 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 46.361245, lng: 2.298741 },
  { id: 13, name: 'DURAS', dept: '47', cp: '47120', client: 'ARBOIN', bailleur: 'ARBOIN Régis', posteSource: 'LA SAUVETAT', distHta: '11.8 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.4 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.678451, lng: 0.182415 },
  { id: 14, name: 'SAINT-SAUD-LACOUSSIÈRE', dept: '24', cp: '24470', client: 'MISSAULT', bailleur: 'MISSAULT Cécile', posteSource: 'NONTRON', distHta: '15.7 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.6 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.541289, lng: 0.817342 },
  { id: 15, name: 'MOURIOUX-VIEILLEVILLE', dept: '23', cp: '23210', client: 'MEILLAT', bailleur: 'MEILLAT Patrick', posteSource: 'BÉNÉVENT', distHta: '6.4 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.2 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 46.078451, lng: 1.645214 },
  { id: 16, name: 'VAL-DE-LIVENNE', dept: '33', cp: '33860', client: 'SOULIGNAC', bailleur: 'SOULIGNAC Gérard', posteSource: 'BLAYE', distHta: '7.1 km', quotePart: '64,11 k€', ebitda: '55 438 €', payback: '4.9 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.244304, lng: -0.567086 },
  { id: 17, name: 'PAYZAC', dept: '24', cp: '24270', client: 'CHAUFFAILLE', bailleur: 'CHAUFFAILLE Alain', posteSource: 'ST-YRIEIX', distHta: '8.4 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.2 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.401245, lng: 1.218745 },
  { id: 18, name: 'JUILLAC', dept: '33', cp: '33890', client: 'CIROLI', bailleur: 'CIROLI Vincent', posteSource: 'CASTILLON', distHta: '4.5 km', quotePart: '64,11 k€', ebitda: '55 438 €', payback: '4.7 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.812451, lng: 0.041258 },
  { id: 19, name: 'MANSAN', dept: '65', cp: '65140', client: 'BOURDETTES', bailleur: 'BOURDETTES Pierre', posteSource: 'VIC-EN-BIGORRE', distHta: '3.9 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '4.5 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 43.341258, lng: 0.189541 },
  { id: 20, name: 'CAUSSADE', dept: '82', cp: '82300', client: 'CASTEBRUNET', bailleur: 'CASTEBRUNET Jérémy', posteSource: 'LERS', distHta: '5.8 km', quotePart: '64,11 k€', ebitda: '55 438 €', payback: '5.1 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.161245, lng: 1.536541 },
  { id: 21, name: 'SAINT EUTROPE DE BORN', dept: '47', cp: '47210', client: 'FRECHEVILLE', bailleur: 'FRECHEVILLE Mathieu', posteSource: 'VILLEREAL', distHta: '6.2 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.0 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.571245, lng: 0.698541 },
  { id: 22, name: 'MONTEILS', dept: '82', cp: '82300', client: 'CASTEBRUNET', bailleur: 'CASTEBRUNET Jérémy', posteSource: 'CAUSSADE', distHta: '4.1 km', quotePart: '64,11 k€', ebitda: '55 438 €', payback: '4.8 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.174512, lng: 1.564512 },
  { id: 23, name: 'BEYCHAC-ET-CAILLAU', dept: '33', cp: '33750', client: 'DOUMENS', bailleur: 'DOUMENS Jacques', posteSource: 'IZON', distHta: '5.3 km', quotePart: '64,11 k€', ebitda: '55 438 €', payback: '4.9 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.871245, lng: -0.378954 },
  { id: 24, name: 'VENDAYS-MONTALIVET', dept: '33', cp: '33930', client: 'HOUSSAIT-YOUNG', bailleur: 'HOUSSAIT-YOUNG Paul', posteSource: 'LESPARRE', distHta: '9.2 km', quotePart: '64,11 k€', ebitda: '55 438 €', payback: '5.3 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.358745, lng: -1.064512 },
  { id: 25, name: 'SAINT-MARTIN-DE-FRESSENGEAS', dept: '24', cp: '24800', client: 'MISSAULT', bailleur: 'MISSAULT Cécile', posteSource: 'THIVIERS', distHta: '7.8 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.1 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.448512, lng: 0.846519 },
  { id: 26, name: 'MAISONNISSES', dept: '23', cp: '23150', client: 'LARDY', bailleur: 'LARDY Christian', posteSource: 'AHUN', distHta: '6.9 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.2 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 46.061245, lng: 1.901245 },
  { id: 27, name: 'BEYSSENAC', dept: '19', cp: '19230', client: 'CELERIE', bailleur: 'CELERIE Guy', posteSource: 'POMPADOUR', distHta: '5.1 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '4.9 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.401245, lng: 1.341258 },
  { id: 28, name: 'MOURIOUX-VIEILLEVILLE', dept: '23', cp: '23210', client: 'MEILLAT', bailleur: 'MEILLAT Patrick', posteSource: 'BÉNÉVENT', distHta: '6.5 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.2 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 46.078451, lng: 1.645214 },
  { id: 29, name: 'ARGENCES EN AUBRAC', dept: '12', cp: '12420', client: 'DOMERGUE', bailleur: 'DOMERGUE Daniel', posteSource: 'STE-GENEVIÈVE', distHta: '8.0 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.3 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.771245, lng: 2.824512 },
  { id: 30, name: 'SAINT-ÉLOY-LES-TUILERIES', dept: '19', cp: '19210', client: 'COMBY', bailleur: 'COMBY Fabrice', posteSource: 'LUBERSAC', distHta: '10.5 km', quotePart: '42,71 k€', ebitda: '55 438 €', payback: '5.1 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 45.445124, lng: 1.289541 },
  { id: 31, name: 'SAINT-CIRQ', dept: '82', cp: '82300', client: 'CASTEBRUNET', bailleur: 'CASTEBRUNET Jérémy', posteSource: 'CAUSSADE', distHta: '5.2 km', quotePart: '64,11 k€', ebitda: '55 438 €', payback: '4.9 ans', kw: 500, type: 'Batterie SA 4×125kW', statut: 'URBA OK', lat: 44.145124, lng: 1.604512 },
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
      totalPower: '9.12 MWc',
      totalPowerLabel: 'Puissance Totale',
      totalPowerSub: '(29 sites au total)',
      sites: 29,
      sitesLabel: 'sites au total',
      sitesStatus: 'Sécurisés foncièrement',
      metric1: { label: 'Bâtiments Neufs', value: '7.65 MWc', sub: '26 projets neufs' },
      metric2: { label: 'Toitures Existantes', value: '1.47 MWc', sub: '3 rénovations' },
    },
    highlights: [
      {
        icon: 'ShieldCheck',
        title: 'Sécurisation Urbanistique & Foncière',
        text: 'Maîtrise foncière et autorisations d\'urbanisme complètes. Fiches projets unitaires détaillées et auditables en Data Room.',
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
      { param: 'Nombre de projets', value: '29 sites', justification: 'Tableaux synoptiques & fiches unitaires' },
      { param: 'Puissance globale', value: '9,12 MWc', justification: 'Dimensionnements validés' },
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
          { name: 'Promesse de Bail PV — CONSOLI (24130 PRIGONRIEUX) [20 pages]', type: 'PDF', size: '865 Ko', fileUrl: '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf' },
          { name: 'Promesse de Bail PV — LABEGUERIE (64120 ORÈGUE) [18 pages]', type: 'PDF', size: '4.8 Mo', fileUrl: '/documents/dataroom/Promesse_de_bail_LABEGUERIE_signe.pdf' },
          { name: 'Promesses de Bail (PdB) — Sites fermes', type: 'PDF', size: '12.5 Mo', fileUrl: '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf' },
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
    teaserData: {
      financialKpis: [
        { label: 'TRI PROJET', value: '12,8%', sub: 'Levier bancaire 80/20', detail: 'Appel d\'Offres Simplifié (AOS)', color: 'amber' },
        { label: 'PAYBACK', value: '7,2 ans', sub: 'Après service de dette', detail: 'Amortissement accéléré CAPEX', color: 'emerald' },
        { label: 'PRODUCTIBLE', value: '1 280 kWh/kWc', sub: 'Irradiation Sud-Ouest', detail: 'Données Météo France P50', color: 'white' },
        { label: 'CA ANNUEL', value: '1,14 M€', sub: 'Tarif AOS ~0,082 €/kWh', detail: 'Appel d\'Offres Simplifié', color: 'white' },
        { label: 'MARGE NETTE', value: '>58%', sub: 'OPEX < 15 €/MWc/an', detail: 'Maintenance incluse forfait', color: 'emerald' },
        { label: 'VALEUR TOTALE', value: '4,82 M€', sub: 'Valorisation du périmètre', detail: 'Droits de développement 29 sites', color: 'amber' },
      ],
      pillars: [
        {
          icon: 'ShieldCheck',
          title: 'Sécurisation Urbanistique & Foncière Complète',
          items: [
            'Permis de Construire purgés',
            'Promesses de Bail signées avec exploitants',
            'Maîtrise foncière contractualisée 20 ans',
            'Fiches projets unitaires détaillées en Data Room',
          ],
        },
        {
          icon: 'FileCheck',
          title: 'Devis d\'Exécution Finalisés & CAPEX Maîtrisé',
          items: [
            'Devis charpente métallique détaillés par bâtiment',
            'Fondations, couverture et raccordement chiffrés',
          ],
        },
        {
          icon: 'Zap',
          title: 'Bassins Solaires Stratégiques Sud-Ouest',
          items: [
            'Irradiation P50 > 1 280 kWh/kWc/an',
            'Implantations Gers, Dordogne, Gironde, Landes, Gard',
            'Orientation optimale toitures neuves',
            'Productible supérieur à la moyenne nationale',
          ],
        },
      ],
      revenueArchitecture: {
        total: '1,14 M€',
        totalLabel: 'CA annuel prévisionnel (AOS ~0,082 €/kWh)',
        sources: [
          { name: 'Appels d\'Offres Simplifiés (Hypothèse AOS ~0,082 €/kWh)', value: '1 142 000 €', pct: '100%', color: '#f59e0b' },
        ],
      },
      stationSpecs: [
        { label: 'Type de construction', value: 'Hangars agricoles neufs & toitures existantes' },
        { label: 'Puissance unitaire moyenne', value: '315 kWc (de 101 à 680 kWc)' },
        { label: 'Surface toiture moyenne', value: '~1 800 m² par bâtiment' },
        { label: 'Raccordement', value: 'BT/HTA selon puissance (< 250 kVA en BT)' },
        { label: 'Durée bail / foncier', value: 'Bail emphytéotique 20 ans renouvelable' },
      ],
      cycleTimeline: [],
      turpeComparison: null,
      financialProjection: [
        { year: 2026, ca: 380000, ebitda: 210000, cashflow: 140000 },
        { year: 2027, ca: 980000, ebitda: 568000, cashflow: 380000 },
        { year: 2028, ca: 1142000, ebitda: 662000, cashflow: 442000 },
        { year: 2029, ca: 1165000, ebitda: 680000, cashflow: 458000 },
        { year: 2030, ca: 1188000, ebitda: 697000, cashflow: 474000 },
        { year: 2031, ca: 1212000, ebitda: 714000, cashflow: 490000 },
        { year: 2032, ca: 1236000, ebitda: 732000, cashflow: 507000 },
        { year: 2033, ca: 1260000, ebitda: 749000, cashflow: 523000 },
        { year: 2034, ca: 1285000, ebitda: 767000, cashflow: 540000 },
        { year: 2035, ca: 1311000, ebitda: 785000, cashflow: 557000 },
        { year: 2036, ca: 1337000, ebitda: 803000, cashflow: 574000 },
        { year: 2037, ca: 1364000, ebitda: 821000, cashflow: 591000 },
        { year: 2038, ca: 1391000, ebitda: 840000, cashflow: 609000 },
        { year: 2039, ca: 1419000, ebitda: 859000, cashflow: 627000 },
        { year: 2040, ca: 1447000, ebitda: 878000, cashflow: 645000 },
        { year: 2041, ca: 1476000, ebitda: 896000, cashflow: 658000 },
        { year: 2042, ca: 1506000, ebitda: 914000, cashflow: 671000 },
        { year: 2043, ca: 1536000, ebitda: 932000, cashflow: 684000 },
        { year: 2044, ca: 1567000, ebitda: 951000, cashflow: 698000 },
        { year: 2045, ca: 1598000, ebitda: 970000, cashflow: 712000 },
      ],
      cumulativeKpis: [
        { label: 'CA CUMULÉ 20 ANS', value: '25,80 M€', sub: 'Hypothèse AOS = 0.082 €/kWh' },
        { label: 'EBITDA NET CUMULÉ 20 ANS', value: '15,43 M€', sub: 'Marge opérationnelle > 58%' },
        { label: 'CASH-FLOW NET POST-DETTES 20 ANS', value: '10,38 M€', sub: 'Après service de dette bancaire 80/20' },
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
          { name: 'Promesse de Bail BESS — BATIOT (32220 MONGAUSY) [24 pages]', type: 'PDF', size: '623 Ko', fileUrl: '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf' },
          { name: 'Promesse de Bail BESS — CASTEBRUNET (82300 CAUSSADE) [25 pages]', type: 'PDF', size: '906 Ko', fileUrl: '/documents/dataroom/Nouvelle_promesse_de_bail_batterie_CASTEBRUNET_82300_CAUSSADE.pdf' },
          { name: 'Promesse de Bail BESS — COMBY (19210 SAINT-ÉLOY) [24 pages]', type: 'PDF', size: '840 Ko', fileUrl: '/documents/dataroom/Nouvelle_Promesse_de_bail_batteries_COMBY_19210_SAINT_ELOY_LES_TUILLERIES.pdf' },
          { name: 'Promesses de Bail (PdB) — 31 sites BESS', type: 'PDF', size: '18.7 Mo', fileUrl: '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf' },
          { name: 'Accord fournisseur batteries CESC (35 k€ / 125 kW)', type: 'PDF', size: '3.2 Mo' },
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
    teaserData: {
      financialKpis: [
        { label: 'TRI / EQUITY', value: '20,5%', sub: '>17% min de marché', detail: 'SRI Bancabilité élevée', color: 'cyan' },
        { label: 'PAYBACK NET', value: '4,6 ans', sub: 'Seuil < 5 ans', detail: 'Retour sur investissement court-moyen', color: 'emerald' },
        { label: 'EBITDA NET / AN', value: '1,72 M€', sub: 'Marge net >61%', detail: 'Résultat après loyer & maintenance', color: 'white' },
        { label: 'BANCABILITÉ DSCR', value: '2,34x', sub: 'Classement favorable', detail: 'Ratio couverture dette > 1.5x requis', color: 'white' },
        { label: 'GAIN TURPE7', value: '+440 k€', sub: 'Délibéré CRE 2025-227', detail: 'Facturation réseau réduit de ~50%', color: 'emerald' },
        { label: 'CASH CYCLE CLAIR', value: '7,23 M€', sub: 'Estimation CA brut / an', detail: 'Consolidé 31 stations BESS', color: 'cyan' },
      ],
      pillars: [
        {
          icon: 'MapPin',
          title: 'Défrichage Foncier & Urbanisme Sans Appel',
          items: [
            '31 sites à 19 €/m² sur dalle béton ~20m²',
            'Déclarations Préalables (DP) déposées/obtenues',
            'Promesses de Bail 20 ans signées',
            'Dossiers de raccordement Enedis prêts au dépôt',
          ],
          bottomStat: { label: 'COS réputés < 40 m²ps', value: true },
        },
        {
          icon: 'TrendingUp',
          title: 'Le Pivot Réglementaire TURPE 7 (CRE 2025-227)',
          items: [
            'Suppression de la double taxation sur soutirage / injection',
            'Exonération de >80% des composantes TURPE pour le stockage',
            'Gain consolidé annuel de +440 k€ pour les 31 sites',
            'Cadre réglementaire stabilisé par la CRE sur la période tarifaire',
          ],
          bottomStat: { label: '+439 073 € de marge brute additionnelle', value: true },
        },
        {
          icon: 'Zap',
          title: 'Monétisation Multi-Marchés (2 Cycles/Jour)',
          items: [
            'Réserve de valeur optimal : FCR/aFRR',
            'Arbitrage SPOT Day-Ahead & Intraday',
            'Marché de Capacité (PP2 à 41.3%)',
          ],
          bottomStat: { label: 'Chiffre d\'affaires annuel > 7,23 M€', value: true },
        },
        {
          icon: 'Repeat',
          title: 'Standardisation Industrielle Réplicable',
          items: [
            'Équipement homogène : batterie NMC/LFP',
            'Dalle normalisée AFNOR/CE : 6.20×5.20m',
            'Contrat de maintenance centralisé à distance',
          ],
          bottomStat: { label: '100% approvisionnement fournitures clé en main', value: true },
        },
      ],
      revenueArchitecture: {
        total: '2,86 M€',
        totalLabel: 'CA annuel brut consolidé / an',
        cycleLabel: '2,85% de stockage net/cycle',
        sources: [
          { name: 'Réserve Primaire en Fréq (FCR) & PICASSO', value: '2 076 882 €', pct: '72%', color: '#06b6d4' },
          { name: 'Arbitrage SPOT (Day-Ahead & Intraday)', value: '504 780 €', pct: '18%', color: '#22d3ee' },
          { name: 'Marché de Capacité 41% PP2 (14kw)', value: '271 253 €', pct: '10%', color: '#67e8f9' },
        ],
      },
      stationSpecs: [
        { label: 'Technologie & Typologie', value: 'Batterie SA 4x125kW (LiFePO4 ou NMC)' },
        { label: 'Config Armoires Utilisées', value: '4 Armoires Préfabriquées (CS4 ou équiv.)' },
        { label: 'Empr. au sol & Génie Civil', value: '5x4m = 20 m² + dégagements' },
        { label: 'Dimensionnement dalle', value: '6,20m x 5,20m normalisée' },
        { label: 'Raccordement Réseau Enedis', value: 'P/HTA 20 kV (Distance primoraccord. 10m)' },
        { label: 'Statut foncier Variable', value: 'Promesses de bail 20 ans signées' },
      ],
      cycleTimeline: [
        { label: 'Charge Cycle 1', time: '01:00 → 05:00', color: 'cyan' },
        { label: 'Décharge Cycle 1', time: '06:00 → 10:00', color: 'amber' },
        { label: 'Charge Cycle 2', time: '12:00 → 16:00', color: 'cyan' },
        { label: 'Décharge Cycle 2', time: '17:00 → 21:00', color: 'amber' },
      ],
      turpeComparison: {
        rows: [
          { component: 'Composante Soutirage brut (CS)', oldRegime: 'Même si sur 10,7% de l\'énergie chargée', newRegime: 'Exonération totale sur 80% et spécial', gain: '+241 986 € / an' },
          { component: 'Composante Prix de Puissance (CS Pss)', oldRegime: 'Tarification longue durée analogie', newRegime: 'HTN+Courrier du batteur (15,20 €/MWh)', gain: '+60 219 € / an' },
          { component: 'Pertes Réseau Non Récupérables', oldRegime: 'Double taxation si même maille régional', newRegime: 'Strictement limitée au 1,5% des pertes', gain: '+89 571 € / an' },
          { component: 'Composante Gestion & Comptage (CG/CC)', oldRegime: 'Forfaits conventionnels', newRegime: 'Comptage + quadrants inté-relevé directe (0,14 €/an)', gain: '+49 297 € / an' },
        ],
        total: { label: 'TOTAL FACTURE ANNUELLE RÉSEAU', oldTotal: '697 586 € / an', newTotal: '257 627 € / an (-63%)', gain: '+439 073 € / an' },
        consolidatedGain: 'Gain Consolidé : +439 073 € / an net',
      },
      financialProjection: [
        { year: 2026, ca: 750000, ebitda: 420000, cashflow: 280000 },
        { year: 2027, ca: 1950000, ebitda: 1170000, cashflow: 780000 },
        { year: 2028, ca: 2860000, ebitda: 1720000, cashflow: 1150000 },
        { year: 2029, ca: 2920000, ebitda: 1780000, cashflow: 1200000 },
        { year: 2030, ca: 3010000, ebitda: 1850000, cashflow: 1260000 },
        { year: 2031, ca: 3100000, ebitda: 1920000, cashflow: 1320000 },
        { year: 2032, ca: 3180000, ebitda: 1980000, cashflow: 1370000 },
        { year: 2033, ca: 3260000, ebitda: 2040000, cashflow: 1420000 },
        { year: 2034, ca: 3340000, ebitda: 2100000, cashflow: 1470000 },
        { year: 2035, ca: 3420000, ebitda: 2160000, cashflow: 1520000 },
        { year: 2036, ca: 3500000, ebitda: 2220000, cashflow: 1570000 },
        { year: 2037, ca: 3570000, ebitda: 2270000, cashflow: 1610000 },
        { year: 2038, ca: 3640000, ebitda: 2320000, cashflow: 1650000 },
        { year: 2039, ca: 3710000, ebitda: 2370000, cashflow: 1690000 },
        { year: 2040, ca: 3780000, ebitda: 2420000, cashflow: 1730000 },
        { year: 2041, ca: 3850000, ebitda: 2470000, cashflow: 1770000 },
        { year: 2042, ca: 3930000, ebitda: 2530000, cashflow: 1820000 },
        { year: 2043, ca: 4010000, ebitda: 2580000, cashflow: 1860000 },
        { year: 2044, ca: 4090000, ebitda: 2640000, cashflow: 1900000 },
        { year: 2045, ca: 4170000, ebitda: 2690000, cashflow: 1940000 },
      ],
      cumulativeKpis: [
        { label: 'CA CUMULÉ 20 ANS', value: '67,04 M€', sub: 'Croissance tendancielle à +3.0%' },
        { label: 'EBITDA NET CUMULÉ 20 ANS', value: '40,97 M€', sub: 'Marge opérationnelle > 60% bottom line' },
        { label: 'CASH-FLOW NET POST-DETTES 20 ANS', value: '27,95 M€', sub: 'En réinvestissement fict. D.Net sur horizon 2037+' },
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
      const activeSites = p.sites;
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
