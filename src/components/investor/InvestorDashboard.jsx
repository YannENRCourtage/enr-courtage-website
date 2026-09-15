import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Battery,
  ShieldAlert,
  FileSpreadsheet,
  Layers,
  Coins,
  ArrowRight,
  FolderLock,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { investorService } from '@/services/investorService';
import InvestorHeader from './InvestorHeader';
import KpiCard from './KpiCard';
import PortfolioCard from './PortfolioCard';
import ProcessTimeline from './ProcessTimeline';
import DataRoomSection from './DataRoomSection';
import AdminValidationModal from './AdminValidationModal';
import OfferModal from './OfferModal';

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const { currentInvestor, excludeOrange, toggleExcludeOrange, investors } = useInvestorStore();

  const portfolios = useMemo(() => investorService.getPortfolios(), []);
  const kpis = useMemo(() => investorService.getGlobalKpis(excludeOrange), [excludeOrange]);

  const [dataRoomPortfolio, setDataRoomPortfolio] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const heliosPortfolio = portfolios.find((p) => p.id === 'helios');
  const voltaPortfolio = portfolios.find((p) => p.id === 'volta');

  const isAdmin = currentInvestor?.isAdmin || currentInvestor?.email === 'y.barberis@enr-courtage.fr';
  const pendingRequestsCount = investors.filter((i) => i.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col selection:bg-amber-500 selection:text-gray-950">
      {/* Header */}
      <InvestorHeader
        activeTab="dashboard"
        onOpenDataRoom={() => setDataRoomPortfolio(heliosPortfolio)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Admin Notification Banner */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-amber-950/60 to-gray-900 border border-amber-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
              <div className="text-xs text-gray-200">
                <span className="font-bold text-white">Espace Administrateur — Yann BARBERIS</span>
                <span className="text-gray-400 block sm:inline sm:ml-2">
                  {pendingRequestsCount > 0
                    ? `Vous avez ${pendingRequestsCount} nouvelle(s) demande(s) d'accès investisseur en attente de contre-signature NDA.`
                    : "Aucune demande en attente de validation."}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <span>Gérer les accès & NDA</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-gray-950 text-amber-300 text-[10px] font-black">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 1 : SYNTHÈSE EXÉCUTIVE & HERO                             */}
        {/* ================================================================= */}
        <section
          id="synthese"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-[#0f172a] to-gray-900 border border-gray-800 p-6 sm:p-10 shadow-2xl"
        >
          {/* Ambient Glow circles */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Headline and Total MW */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
              <div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                  <span>Grand Sud-Ouest, France</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">Cession Droits de Développement</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Plateforme Énergies Renouvelables & Flexibilité
                </h2>
                <p className="text-gray-300 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
                  Cession de droits de développement sur deux portefeuilles distincts et complémentaires à haut niveau de standardisation foncière, technique et d'approvisionnement en Nouvelle-Aquitaine et Occitanie.
                </p>
              </div>

              <div className="flex flex-col items-end text-right">
                <span className="text-xs text-gray-400 uppercase font-semibold">Capacité Totale Sécurisée</span>
                <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                  {kpis.totalMW}
                </span>
                <span className="text-xs text-gray-500 font-medium mt-0.5">
                  Dont {kpis.pvMWc} PV ferme + {kpis.bessMW} BESS
                </span>
              </div>
            </div>

            {/* 4 Key KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                title="Portefeuille PV"
                value={kpis.pvMWc}
                subtitle={`${kpis.pvSites} sites sécurisés`}
                badge="100% Urba OK"
                icon="Sun"
                variant="amber"
              />
              <KpiCard
                title="BESS Stand-Alone"
                value="15.50 MW"
                subtitle="31 sites standardisés"
                badge="4 × 125 kW"
                icon="Battery"
                variant="cyan"
              />
              <KpiCard
                title="Foncier & BESS PdB"
                value="20 Ans"
                subtitle="Loyer BESS fixe"
                badge="3 000 €/an/site"
                icon="FileText"
                variant="emerald"
              />
              <KpiCard
                title="Accord Fournisseur"
                value="35 k€ / 125kW"
                subtitle="140 k€ / site 500 kW"
                badge="Transfo ≥ 400 kVA"
                icon="Tags"
                variant="blue"
              />
            </div>

            {/* Orange Urba Filter Banner */}
            <div className="rounded-xl bg-amber-950/40 border border-amber-500/30 p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5 text-xs text-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Périmètre Ferme Sécurisé Actif :</strong>{' '}
                  {excludeOrange
                    ? "4 projets PV (1,11 MWc) avec aléas d'obtention urbanistique sont actuellement exclus du portefeuille ferme et placés en réserve conditionnelle."
                    : "L'ensemble des 29 projets PV (9,12 MWc bruts) est actuellement affiché (y compris les 4 projets à aléas urbanistiques)."}
                </span>
              </div>
              <button
                onClick={toggleExcludeOrange}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 underline whitespace-nowrap"
              >
                {excludeOrange ? 'Afficher le périmètre brut (29 PV)' : 'Réactiver le filtre ferme (25 PV)'}
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 2 : CARTES DES PORTEFEUILLES (HÉLIOS & VOLTA)             */}
        {/* ================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Portefeuilles en cours de cession</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Cliquez sur un portefeuille pour accéder à sa page dédiée : cartographie détaillée, inventaire unitaire des sites et Data Room dédiée.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {heliosPortfolio && (
              <div id="helios">
                <PortfolioCard
                  portfolio={heliosPortfolio}
                  onOpenDataRoom={(p) => setDataRoomPortfolio(p)}
                />
              </div>
            )}
            {voltaPortfolio && (
              <div id="volta">
                <PortfolioCard
                  portfolio={voltaPortfolio}
                  onOpenDataRoom={(p) => setDataRoomPortfolio(p)}
                />
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECTION 3 : PROPOSITION D'OFFRE GLOBALE OU PARTIELLE (CTA)        */}
        {/* ================================================================= */}
        <section
          id="offre"
          className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-gray-900 to-cyan-950/40 border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Espace Transactionnel & Propositions</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                Déposer une offre d'acquisition (Totale ou Partielle)
              </h3>
              <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                Vous pouvez formuler une offre ferme ou indicative sur le portefeuille <strong>HÉLIOS (PV)</strong>, sur le portefeuille <strong>VOLTA (BESS)</strong>, ou sur les <strong>deux combinés</strong>, avec votre propre proposition d'échéancier par jalonnements.
              </p>
            </div>

            <button
              onClick={() => setIsOfferModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-gray-950 font-black text-xs uppercase tracking-wider transition transform hover:scale-[1.02] shadow-xl shadow-amber-500/25 flex items-center gap-2.5 shrink-0"
            >
              <Coins className="w-4 h-4" />
              <span>Soumettre une Proposition d'Achat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 4 : MATRICE ÉCONOMIQUE & HYPOTHÈSES COMPARATIVES         */}
        {/* ================================================================= */}
        <section id="comparatif" className="rounded-2xl bg-[#111827] border border-gray-800 p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4" /> Comparatif Clé
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                Matrice Économique & Hypothèses d'Exécution
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Comparatif des paramètres techniques, fonciers et industriels des deux portefeuilles.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700">
              Devise : EUR HT
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-800/80 text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="py-3 px-4 w-1/4">Paramètre Clé</th>
                  <th className="py-3 px-4 w-1/4 text-amber-400">☀️ Projet HÉLIOS (PV)</th>
                  <th className="py-3 px-4 w-1/4 text-cyan-400">🔋 Projet VOLTA (BESS)</th>
                  <th className="py-3 px-4 w-1/4 text-gray-400">Statut / Justificatifs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Nombre de projets</td>
                  <td className="py-3.5 px-4 font-mono text-amber-400">
                    {excludeOrange ? '25 sites fermes (+4 conditionnels)' : '29 sites bruts recensés'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-400">31 sites standardisés</td>
                  <td className="py-3.5 px-4 text-gray-400">Tableaux synoptiques & fiches unitaires</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Puissance globale</td>
                  <td className="py-3.5 px-4 font-mono text-amber-400">
                    {excludeOrange ? '8,01 MWc fermes (9,12 MWc bruts)' : '9,12 MWc bruts'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-400">15,50 MW (500 kW / site)</td>
                  <td className="py-3.5 px-4 text-gray-400">Dimensionnements validés</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Sécurisation Foncière</td>
                  <td className="py-3.5 px-4">Promesses de Bail signées avec exploitants</td>
                  <td className="py-3.5 px-4">Promesses de Bail fermes sur 20 ans</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-medium">✓ PdB signées communicables sous NDA</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Coût Foncier / Loyer</td>
                  <td className="py-3.5 px-4">Selon baux emphytéotiques / toitures</td>
                  <td className="py-3.5 px-4 font-mono">750 € / 125 kW → 3 000 € HT / an / site</td>
                  <td className="py-3.5 px-4 text-gray-400">Loyer verrouillé contractuellement</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Chiffrage Travaux / Équipement</td>
                  <td className="py-3.5 px-4">Devis détaillés par bâtiment</td>
                  <td className="py-3.5 px-4 font-mono">35 k€ / 125 kW → 140 k€ HT / site</td>
                  <td className="py-3.5 px-4 text-gray-400">Devis émis & Accord fournisseur négocié</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Statut Raccordement / Réseau</td>
                  <td className="py-3.5 px-4">Demandes prêtes selon obtention urba</td>
                  <td className="py-3.5 px-4">Transfos sol ≥ 400 kVA identifiés</td>
                  <td className="py-3.5 px-4 text-gray-400">Dépôts libres pour l'acquéreur</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 5 : PROCESSUS STRUCTURÉ M&A                              */}
        {/* ================================================================= */}
        <section id="process">
          <ProcessTimeline />
        </section>

        {/* ================================================================= */}
        {/* SECTION 6 : DATA ROOM MODAL (SOUS LE HEADER)                     */}
        {/* ================================================================= */}
        {dataRoomPortfolio && (
          <div className="fixed top-20 inset-x-0 bottom-0 z-30 bg-black/85 backdrop-blur-md overflow-y-auto p-4 flex items-start justify-center pt-4">
            <div className="max-w-4xl w-full my-4 relative">
              <button
                onClick={() => setDataRoomPortfolio(null)}
                className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white px-3 py-1.5 bg-gray-800 rounded-lg text-xs font-semibold"
              >
                Fermer
              </button>
              <DataRoomSection
                portfolio={dataRoomPortfolio}
                investorName={currentInvestor?.name}
                investorCompany={currentInvestor?.company}
              />
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 7 : CONTACT M&A ADVISORY                                  */}
        {/* ================================================================= */}
        <section className="rounded-2xl bg-gradient-to-br from-gray-900 via-[#111827] to-gray-900 border border-gray-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-block">
              Interlocuteur M&A Dédié
            </span>
            <h4 className="text-lg font-bold text-white">
              Une question sur la structuration ou la Data Room ?
            </h4>
            <p className="text-xs text-gray-400 max-w-xl">
              Notre équipe M&A se tient à votre disposition pour vous accompagner dans l'analyse des portefeuilles et organiser une séance de Questions/Réponses.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:contact@enr-courtage.fr?subject=[M%26A%20TEASER]%20Demande%20d%27information%20portefeuilles"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Mail className="w-4 h-4" />
              <span>Contacter le pôle M&A</span>
            </a>
            <a
              href="tel:+33535548599"
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs border border-gray-700 transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>05 35 54 85 99</span>
            </a>
          </div>
        </section>

        {/* Modal Validation Administrateur (Yann BARBERIS) */}
        <AdminValidationModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
        />

        {/* Modal Proposition d'achat multi-portefeuilles */}
        <OfferModal
          portfolio={heliosPortfolio}
          selectedSiteIds={[]}
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-[#0c1220]/80 px-6 py-6 text-center text-xs text-gray-500 space-y-1">
        <p>&copy; {new Date().getFullYear()} ENR COURTAGE — Plateforme Transactionnelle M&A Confidentielle.</p>
        <p className="text-[10px] text-gray-600">
          Les informations communiquées sont strictement confidentielles et réservées aux investisseurs accrédités ayant régularisé un NDA bilatéral.
        </p>
      </footer>
    </div>
  );
}
