import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sun,
  Battery,
  ShieldCheck,
  ShieldAlert,
  FileSpreadsheet,
  Layers,
  Coins,
  ArrowRight,
  ArrowLeft,
  FolderLock,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  Scale,
  FileCheck,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Building,
  User,
  Users,
  ExternalLink,
  Edit3,
  RotateCcw,
  Handshake,
  ChevronRight,
  Send,
  Lock,
  FileSignature,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { investorService } from '@/services/investorService';
import InvestorHeader from './InvestorHeader';
import InvestorSidebar from './InvestorSidebar';
import PortfolioCard from './PortfolioCard';
import ProcessTimeline from './ProcessTimeline';
import AdminValidationModal from './AdminValidationModal';
import OfferModal from './OfferModal';
import ExclusiveMandateModal from './ExclusiveMandateModal';
import NdaDocumentModal from './NdaDocumentModal';
import InvestorContactModal from './InvestorContactModal';
import ErrorBoundary from './ErrorBoundary';

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const adminTabParam = searchParams.get('adminTab');

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const {
    currentInvestor,
    excludeOrange,
    toggleExcludeOrange,
    investors,
    offers,
    investorAcceptCounter,
    investorRejectCounter,
    adminAcceptOffer,
    adminRejectOffer,
    adminCounterOffer,
  } = useInvestorStore();

  const portfolios = useMemo(() => investorService.getPortfolios(), []);
  const heliosPortfolio = portfolios.find((p) => p.id === 'helios');
  const voltaPortfolio = portfolios.find((p) => p.id === 'volta');

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState(adminTabParam || null);
  const [isNdaModalOpen, setIsNdaModalOpen] = useState(false);

  React.useEffect(() => {
    if (adminTabParam) {
      setAdminActiveTab(adminTabParam);
    }
  }, [adminTabParam]);

  const handleSelectAdminTab = (tab) => {
    setAdminActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab) {
        next.set('adminTab', tab);
      } else {
        next.delete('adminTab');
      }
      return next;
    });
  };

  // Offer modal state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerModalPortfolio, setOfferModalPortfolio] = useState(null);
  const [offerModalMode, setOfferModalMode] = useState('create'); // 'create' | 'modify' | 'counter_proposal'
  const [selectedOfferForModal, setSelectedOfferForModal] = useState(null);

  // Exclusive mandate modal state
  const [selectedMandateOffer, setSelectedMandateOffer] = useState(null);

  const isAdmin = currentInvestor?.isAdmin || currentInvestor?.email === 'y.barberis@enr-courtage.fr';
  const pendingRequestsCount = investors.filter((i) => i.status === 'pending').length;

  // Investor's purchase offers
  const myOffers = useMemo(() => {
    if (isAdmin) return offers;
    return offers.filter(
      (o) =>
        o.investorEmail?.toLowerCase() === currentInvestor?.email?.toLowerCase() ||
        o.investorId === currentInvestor?.id ||
        o.investorCompany?.toLowerCase() === currentInvestor?.company?.toLowerCase()
    );
  }, [offers, currentInvestor, isAdmin]);

  // Actions on offers
  const handleOpenCreateOffer = (portfolio = null) => {
    setOfferModalPortfolio(portfolio);
    setSelectedOfferForModal(null);
    setOfferModalMode('create');
    setIsOfferModalOpen(true);
  };

  const handleOpenModifyOffer = (offer) => {
    setSelectedOfferForModal(offer);
    const targetP = portfolios.find((p) => p.id === offer.portfolioId) || heliosPortfolio;
    setOfferModalPortfolio(targetP);
    setOfferModalMode('modify');
    setIsOfferModalOpen(true);
  };

  const handleOpenCounterOffer = (offer) => {
    setSelectedOfferForModal(offer);
    const targetP = portfolios.find((p) => p.id === offer.portfolioId) || heliosPortfolio;
    setOfferModalPortfolio(targetP);
    setOfferModalMode('counter_proposal');
    setIsOfferModalOpen(true);
  };

  const handleAcceptCounter = (offerId) => {
    if (
      window.confirm(
        "Confirmez-vous l'acceptation de la contre-proposition de Yann BARBERIS ? Vous pourrez ensuite procéder immédiatement à la signature du Mandat de Négociation Exclusive."
      )
    ) {
      investorAcceptCounter(offerId);
    }
  };

  const handleRejectOffer = (offerId) => {
    const reason = window.prompt("Indiquez un motif de refus à transmettre à ENR COURTAGE (optionnel) :");
    if (reason !== null) {
      investorRejectCounter(offerId, reason);
    }
  };

  // Actions d'arbitrage M&A pour Yann BARBERIS (Accepter / Contre-proposition / Refuser)
  const [counteringOfferId, setCounteringOfferId] = useState(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterComments, setCounterComments] = useState('');
  const [counterMilestones, setCounterMilestones] = useState([]);

  const handleOpenCounter = (offer) => {
    setCounteringOfferId(offer.id);
    setCounterAmount(String(offer.amountEur || ''));
    setCounterComments('');
    const baseMilestones = (offer.milestones && offer.milestones.length > 0)
      ? offer.milestones
      : [
          { id: 1, label: 'Jalon 1 — Signature Promesse (Upfront)', percentage: 30, targetCondition: 'Closing signature promesse & mise sous séquestre', targetDate: 'T4 2026' },
          { id: 2, label: 'Jalon 2 — Purge Urbanisme', percentage: 30, targetCondition: 'Attestation non-recours délivrée', targetDate: 'T1 2027' },
          { id: 3, label: 'Jalon 3 — Accord Enedis PTF', percentage: 20, targetCondition: 'Acceptation PTF', targetDate: 'T3 2027' },
          { id: 4, label: 'Jalon 4 — Ready to Build (RTB)', percentage: 20, targetCondition: 'Closing définitif & OS travaux', targetDate: 'T1 2028' },
        ];
    setCounterMilestones(baseMilestones.map((m) => ({ ...m })));
  };

  const handleSubmitCounter = (offerId) => {
    const num = Number(String(counterAmount).replace(/\s/g, '').replace(',', '.'));
    if (isNaN(num) || num <= 0) {
      alert('Veuillez renseigner un montant valide en euros hors taxes.');
      return;
    }
    const totalP = counterMilestones.reduce((s, m) => s + (Number(m.percentage) || 0), 0);
    if (totalP !== 100) {
      alert(`La somme des pourcentages des jalonnements doit être égale à 100% (actuellement : ${totalP}%).`);
      return;
    }
    const milestonesWithAmounts = counterMilestones.map((m) => ({
      ...m,
      percentage: Number(m.percentage),
      amount: Math.round((num * Number(m.percentage)) / 100),
    }));

    adminCounterOffer(offerId, {
      counterAmountEur: num,
      counterMilestones: milestonesWithAmounts,
      counterComments: counterComments,
    });
    setCounteringOfferId(null);
  };

  const handleAdminAccept = (offerId) => {
    if (
      window.confirm(
        "Confirmez-vous l'acceptation définitive de cette proposition ? Les deux parties pourront procéder immédiatement à la signature du Mandat de Négociation Exclusive."
      )
    ) {
      adminAcceptOffer(offerId);
    }
  };

  const handleAdminReject = (offerId) => {
    const reason = window.prompt("Indiquez un motif de refus à communiquer à l'investisseur (optionnel) :");
    if (reason !== null) {
      adminRejectOffer(offerId, reason);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex selection:bg-amber-500 selection:text-slate-950">
      {/* Vertical Sidebar (Dark Contrast on Left) */}
      <InvestorSidebar
        activePage="dashboard"
        adminActiveTab={adminActiveTab}
        onSelectAdminTab={handleSelectAdminTab}
        onOpenCreateOffer={() => handleOpenCreateOffer(null)}
        onOpenAdmin={() => handleSelectAdminTab('requests')}
        onOpenNda={() => setIsNdaModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (White / Bright Background on Right) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 bg-slate-50">
        {/* Header */}
        <InvestorHeader
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenAdmin={() => handleSelectAdminTab('requests')}
          onOpenNda={() => setIsNdaModalOpen(true)}
          pageTitle={
            adminActiveTab
              ? "Console d'Administration & Supervision M&A"
              : "Tableau de Bord des Portefeuilles PV & BESS"
          }
          pageTitleBadge={adminActiveTab ? "SUPERVISION ADMIN" : "M&A TRANSACTIONNEL"}
        />

        {/* Main Content */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Admin Notification Banner */}
        {isAdmin && !adminActiveTab && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              <div className="text-xs text-slate-800">
                <span className="font-bold text-slate-950">Espace Administrateur — Yann BARBERIS</span>
                <span className="text-slate-600 block sm:inline sm:ml-2">
                  {pendingRequestsCount > 0
                    ? `Vous avez ${pendingRequestsCount} nouvelle(s) demande(s) d'accès investisseur en attente de contre-signature NDA.`
                    : "Aucune demande en attente de validation."}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleSelectAdminTab('requests')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>Gérer les accès & NDA</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Embedded Admin Console OR Standard Dashboard */}
        {isAdmin && adminActiveTab ? (
          <div className="space-y-6">
            {/* Admin Header Navigation Bar */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-900/90 to-[#0f172a] border border-gray-800 rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleSelectAdminTab(null)}
                  className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold border border-gray-700 transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>← Revenir aux Portefeuilles</span>
                </button>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                      SUPERVISION M&A ENR COURTAGE
                    </span>
                    <span className="text-xs text-gray-400 font-medium">Yann BARBERIS</span>
                  </div>
                  <h2 className="text-base sm:text-xl font-black text-white tracking-tight mt-1">
                    {adminActiveTab === 'requests' && "Validation des Demandes d'Accès & Signatures NDA"}
                    {adminActiveTab === 'offers' && "Synthèse Exécutive des Offres d'Achat Investisseurs"}
                    {adminActiveTab === 'dataroom' && "Gestion & Téléversement des Documents Data Room"}
                    {adminActiveTab === 'users' && "Gestion des Utilisateurs & Mots de Passe"}
                  </h2>
                </div>
              </div>

              {/* Tab Selector Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 bg-gray-950/80 p-1.5 rounded-xl border border-gray-800 text-xs">
                <button
                  onClick={() => handleSelectAdminTab('requests')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    adminActiveTab === 'requests'
                      ? 'bg-amber-500 text-gray-950 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Demandes & NDA</span>
                  {pendingRequestsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleSelectAdminTab('offers')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    adminActiveTab === 'offers'
                      ? 'bg-amber-500 text-gray-950 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Offres ({offers.length})</span>
                </button>

                <button
                  onClick={() => handleSelectAdminTab('dataroom')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    adminActiveTab === 'dataroom'
                      ? 'bg-amber-500 text-gray-950 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FolderLock className="w-3.5 h-3.5" />
                  <span>Data Room</span>
                </button>

                <button
                  onClick={() => handleSelectAdminTab('users')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    adminActiveTab === 'users'
                      ? 'bg-amber-500 text-gray-950 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Utilisateurs ({investors.length})</span>
                </button>
              </div>
            </div>

            {/* Embedded Admin Interface */}
            <ErrorBoundary onReset={() => handleSelectAdminTab(null)}>
              <AdminValidationModal
                isOpen={true}
                isEmbedded={true}
                initialTab={adminActiveTab}
                onTabChange={(tab) => handleSelectAdminTab(tab)}
                onClose={() => handleSelectAdminTab(null)}
              />
            </ErrorBoundary>
          </div>
        ) : (
          <>
        {/* ================================================================= */}
        {/* TABLEAU DE BORD PERSONNEL INVESTISSEUR (HEADER DE BIENVENUE)     */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  <Building className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-800 font-bold">{currentInvestor?.company || 'Investisseur Partenaire'}</span>
                  <span>•</span>
                  <span>Espace Transactionnel M&A</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  Bienvenue, {currentInvestor?.name || 'Investisseur'}
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Consultez les portefeuilles d'énergies renouvelables en cession, accédez à leurs Teasers et Data Rooms dédiés, et pilotez vos offres d'acquisition fermes ou partielles.
                </p>
              </div>

              {/* Status Badges with Clickable NDA Modal */}
              <div className="flex flex-col sm:items-end gap-2 text-right">
                <button
                  onClick={() => setIsNdaModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition shadow-2xs group cursor-pointer"
                  title="Cliquer pour afficher, vérifier et imprimer votre NDA signé bilatéralement"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition" />
                  <span>NDA Bilatéral Signé & Enregistré</span>
                  <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-1.5 py-0.2 rounded font-mono font-bold ml-1">
                    Voir / Imprimer →
                  </span>
                </button>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
                  <FolderLock className="w-4 h-4 text-blue-600" />
                  <span>Accès Data Room Intégral Débloqué</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Portefeuilles Disponibles</div>
                <div className="text-2xl font-black text-amber-700 mt-1">2 Portefeuilles</div>
                <div className="text-[10px] text-slate-500 mt-0.5">HÉLIOS (PV) & VOLTA (BESS)</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Mes Propositions Déposées</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{myOffers.length} offre(s)</div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Totales ou partielles</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">En Cours d'Étude</div>
                <div className="text-2xl font-black text-cyan-700 mt-1">
                  {myOffers.filter((o) => o.status === 'submitted' || o.status === 'counter_by_admin' || o.status === 'counter_by_investor').length}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Cycles de négociation actifs</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Mandats d'Exclusivité</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {myOffers.filter((o) => o.status === 'agreement_reached' || o.status === 'mandate_signed').length}
                </div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Accords contractualisés</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 1 : PRINCIPE DE FONCTIONNEMENT DE LA PLATEFORME           */}
        {/* ================================================================= */}
        <section id="fonctionnement" className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" /> Modalités Transactionnelles
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
              Fonctionnement de la Plateforme d'Acquisition
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Une plateforme M&A agile permettant de calibrer précisément votre périmètre d'investissement et de structurer des offres adaptées à votre politique de risque.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pilier 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 hover:border-slate-300 transition">
              <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold text-xs">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">Teasers Dédiés par Portefeuille</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chaque portefeuille (<strong>HÉLIOS PV 8,01 MWc</strong> et <strong>VOLTA BESS 15,50 MW</strong>) dispose de son Teaser autonome avec cartographie interactive, inventaire unitaire et Data Room dédiée. Aucun teaser n'est mutualisé.
              </p>
            </div>

            {/* Pilier 2 */}
            <div className="bg-gray-50 border border-slate-200 rounded-xl p-4 space-y-2 hover:border-slate-300 transition">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-800 font-bold text-xs">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900">Liberté Totale de Périmètre</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vous avez la liberté de formuler une offre sur un <strong>portefeuille entier</strong>, sur un ou plusieurs <strong>projets ciblés</strong> d'un portefeuille, ou sur les <strong>deux portefeuilles combinés</strong>.
              </p>
            </div>

            {/* Pilier 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 hover:border-slate-300 transition">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-xs">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">Tarif & Jalonnements Sur-Mesure</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Proposez librement votre valorisation (€ HT) et sélectionnez vos versements parmi les <strong>4 jalons types</strong> de développement (Promesse, Urba purgé, PTF Enedis, RTB). <strong>Aucun jalon n'est imposé par défaut</strong>.
              </p>
            </div>

            {/* Pilier 4 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 hover:border-slate-300 transition">
              <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-800 font-bold text-xs">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-900">Négociation & Mandat</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aller-retours d'offres et contre-propositions avec Yann BARBERIS. Dès accord mutuel, signature du <strong>Mandat de Négociation Exclusive (60 jours)</strong> pour la finalisation des actes définitifs de cession.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 2 : MES PROPOSITIONS D'ACHAT & NÉGOCIATIONS EN COURS      */}
        {/* ================================================================= */}
        <section id="mes-offres" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600" />
                <span>Mes Propositions d'Achat & Négociations en cours ({myOffers.length})</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Suivez en temps réel l'étude de vos propositions, recevez les contre-propositions de Yann BARBERIS et régularisez vos Mandats d'Exclusivité.
              </p>
            </div>

            <button
              onClick={() => handleOpenCreateOffer(null)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <Coins className="w-4 h-4" />
              <span>Déposer une nouvelle offre</span>
            </button>
          </div>

          {myOffers.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mx-auto">
                <Coins className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Vous n'avez pas encore formulé d'offre d'achat</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Consultez les portefeuilles HÉLIOS et VOLTA ci-dessous, sélectionnez vos projets ou un portefeuille complet, et déposez votre offre avec votre propre échéancier par jalons.
                </p>
              </div>
              <button
                onClick={() => handleOpenCreateOffer(null)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm"
              >
                Formuler ma première proposition d'achat
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {myOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm relative overflow-hidden"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-black text-slate-950">{offer.portfolioName}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-bold border border-amber-300">
                          {offer.offerType === 'total'
                            ? `Portefeuille complet (${offer.selectedSitesCount} sites)`
                            : `Sélection partielle (${offer.selectedSitesCount} sites)`}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span>Référence : <strong className="text-slate-800 font-mono">{offer.id}</strong></span>
                        <span>• Déposée le : {new Date(offer.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Montant Proposé</div>
                      <div className="text-2xl font-black font-mono text-emerald-700">
                        {new Intl.NumberFormat('fr-FR').format(offer.amountEur)} € HT
                      </div>
                    </div>
                  </div>

                  {/* TABLEAU DES JALONNEMENTS */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-700" /> Échéancier de Paiement Proposé par Jalonnements
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] text-slate-700">
                        <thead className="bg-slate-100 text-[10px] uppercase text-slate-600">
                          <tr>
                            <th className="py-2 px-3">Jalon d'Exécution</th>
                            <th className="py-2 px-3">Modalité / Événement Déclencheur</th>
                            <th className="py-2 px-3">Échéance Estimée</th>
                            <th className="py-2 px-3 text-right">Quote-part (%)</th>
                            <th className="py-2 px-3 text-right">Montant (€ HT)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {(offer.milestones || []).map((m, mIdx) => (
                            <tr key={mIdx} className="hover:bg-slate-100/60">
                              <td className="py-2 px-3 font-semibold text-slate-900">{m.label}</td>
                              <td className="py-2 px-3 text-slate-600">{m.targetCondition}</td>
                              <td className="py-2 px-3 text-slate-500 font-mono">{m.targetDate}</td>
                              <td className="py-2 px-3 text-right font-mono text-amber-800 font-bold">{m.percentage}%</td>
                              <td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">
                                {new Intl.NumberFormat('fr-FR').format(m.amount)} €
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Remarques */}
                  {offer.comments && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                      <span className="font-bold text-slate-900 block mb-0.5">Vos Remarques & Conditions :</span>
                      <span>"{offer.comments}"</span>
                    </div>
                  )}

                  {/* STATUT 1 : EN COURS D'ÉTUDE */}
                  {(offer.status === 'submitted' || offer.status === 'counter_by_investor') && (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-300 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center space-x-2.5 text-xs text-amber-900">
                          <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                          <div>
                            <strong className="text-slate-900">En cours d'étude par Yann BARBERIS (ENR COURTAGE)</strong>
                            <span className="text-slate-600 block sm:inline sm:ml-2">
                              {offer.status === 'counter_by_investor'
                                ? "Votre contre-proposition a été transmise à l'administrateur. Vous recevrez son retour prochainement."
                                : "Votre offre initiale est en cours d'analyse par le cédant. Vous serez notifié de son acceptation, refus ou contre-proposition."}
                            </span>
                          </div>
                        </div>

                        {/* Les 3 boutons de négociation : Accepter l'offre, Faire une contre-proposition, Refuser */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleAdminAccept(offer.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                            title="Accepter définitivement cette offre"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accepter l'offre</span>
                          </button>

                          <button
                            onClick={() => handleOpenCounter(offer)}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                            title="Faire une contre-proposition financière ou sur les jalons"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Faire une contre-proposition</span>
                          </button>

                          <button
                            onClick={() => handleAdminReject(offer.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 hover:border-red-300 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                            title="Refuser cette offre"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Refuser</span>
                          </button>
                        </div>
                      </div>

                      {/* INLINE COUNTER-PROPOSAL FORM DIRECTLY ON DASHBOARD */}
                      {counteringOfferId === offer.id && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 border-2 border-amber-400 space-y-4 animate-in fade-in shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                              <Edit3 className="w-4 h-4 text-amber-700" /> Rédiger une contre-proposition — Yann BARBERIS (ENR COURTAGE)
                            </span>
                            <button
                              onClick={() => setCounteringOfferId(null)}
                              className="text-slate-500 hover:text-slate-800 text-xs font-medium"
                            >
                              Annuler
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Nouveau Montant Global Proposé (€ HT)
                              </label>
                              <input
                                type="text"
                                value={counterAmount}
                                onChange={(e) => setCounterAmount(e.target.value)}
                                placeholder="ex: 4 000 000"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Commentaire / Justification de la contre-proposition
                              </label>
                              <input
                                type="text"
                                value={counterComments}
                                onChange={(e) => setCounterComments(e.target.value)}
                                placeholder="ex: Réajustement compte tenu des coûts de raccordement..."
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                              />
                            </div>
                          </div>

                          {/* Adjust Milestones % */}
                          <div className="space-y-2">
                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                              Répartition des versements par jalon (Total exigé = 100%)
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                              {counterMilestones.map((m, idx) => (
                                <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1 shadow-2xs">
                                  <div className="text-[10px] font-semibold text-slate-700 truncate" title={m.label}>{m.label}</div>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={m.percentage}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setCounterMilestones((prev) =>
                                          prev.map((item, i) => (i === idx ? { ...item, percentage: val } : item))
                                        );
                                      }}
                                      className="w-16 px-2 py-1 bg-amber-50/50 border border-slate-300 rounded text-center text-amber-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                                    />
                                    <span className="text-slate-500">%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
                            <button
                              onClick={() => setCounteringOfferId(null)}
                              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => handleSubmitCounter(offer.id)}
                              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-sm flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Transmettre la contre-proposition à l'investisseur</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STATUT 2 : CONTRE-PROPOSITION DE YANN BARBERIS */}
                  {offer.status === 'counter_by_admin' && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-white to-amber-50 border-2 border-amber-400 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                          <AlertCircle className="w-4 h-4 text-amber-700" />
                          <span>Contre-Proposition Reçue de Yann BARBERIS (ENR COURTAGE)</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">Décision requise</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-slate-700">Montant révisé proposé par le cédant :</span>
                          <span className="text-xl font-black font-mono text-amber-800">
                            {new Intl.NumberFormat('fr-FR').format(offer.counterOffer?.amountEur || offer.amountEur)} € HT
                          </span>
                        </div>
                        {offer.counterOffer?.comments && (
                          <p className="text-xs text-slate-600 italic border-t border-slate-100 pt-1.5">
                            "{offer.counterOffer.comments}"
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                        <button
                          onClick={() => handleRejectOffer(offer.id)}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 text-xs font-semibold transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Refuser</span>
                        </button>

                        <button
                          onClick={() => handleOpenCounterOffer(offer)}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Faire une contre-proposition</span>
                        </button>

                        <button
                          onClick={() => handleAcceptCounter(offer.id)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accepter la proposition</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STATUT 3 : ACCORD TROUVÉ -> SIGNATURE DU MANDAT */}
                  {offer.status === 'agreement_reached' && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center space-x-2.5 text-emerald-900">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <div>
                            <strong className="text-slate-950 text-sm">Accord Mutuel Trouvé !</strong>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Les conditions financières et le calendrier de jalonnement ont été validés entre vous et Yann BARBERIS.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedMandateOffer(offer)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-2"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>Consulter & Signer le Mandat de Négociation Exclusive</span>
                        </button>
                      </div>

                      {/* Rappel clause mandat exclusif */}
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200 flex items-center gap-2 text-[11px] text-emerald-900">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong>Clause de sécurisation :</strong> La formalisation des actes définitifs de cession sera finalisée conformément aux termes du Mandat d'Exclusivité.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* STATUT 4 : MANDAT SIGNÉ & EN VIGUEUR */}
                  {offer.status === 'mandate_signed' && (
                    <div className="p-4 rounded-xl bg-emerald-50/70 border-2 border-emerald-400 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center space-x-2 text-emerald-900">
                          <FileCheck className="w-5 h-5 text-emerald-600" />
                          <div>
                            <strong className="text-slate-950 text-sm">
                              Mandat de Négociation Exclusive Signé & Actif (60 jours)
                            </strong>
                            <p className="text-xs text-slate-600">
                              Accord d'exclusivité régularisé électroniquement par les deux parties. Rédaction des contrats définitifs en cours.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedMandateOffer(offer)}
                          className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Consulter / Télécharger le Mandat (PDF)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STATUT 5 : REFUSÉ */}
                  {offer.status === 'rejected' && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                      <span>Cette proposition n'a pas été retenue ou a été déclinée.</span>
                      <button
                        onClick={() => handleOpenCreateOffer(null)}
                        className="text-amber-700 hover:underline font-bold"
                      >
                        Formuler une nouvelle proposition
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* SECTION 3 : LES 2 PORTEFEUILLES ACTUELLEMENT EN VENTE             */}
        {/* ================================================================= */}
        <section id="portefeuilles" className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <span>Portefeuilles Actuellement en Vente (2 Portefeuilles)</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Cliquez sur un portefeuille pour entrer dans son <strong>Teaser dédié</strong> : cartographie interactive unitaire, tableau détaillé des sites et Data Room correspondante.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {heliosPortfolio && (
              <div id="helios">
                <PortfolioCard portfolio={heliosPortfolio} />
              </div>
            )}
            {voltaPortfolio && (
              <div id="volta">
                <PortfolioCard portfolio={voltaPortfolio} />
              </div>
            )}
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 4 : PROPOSITION D'OFFRE MULTI-PORTEFEUILLES (CTA)          */}
        {/* ================================================================= */}
        <section
          id="offre"
          className="no-print rounded-2xl bg-gradient-to-r from-amber-50 via-white to-cyan-50 border border-amber-300 p-6 sm:p-8 shadow-sm relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider">
                <Coins className="w-4 h-4 text-amber-700" />
                <span>Espace Transactionnel & Propositions</span>
              </div>
              <h3 className="text-2xl font-black text-slate-950">
                Déposer une offre d'acquisition (Totale ou Partielle)
              </h3>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Vous pouvez formuler une offre ferme ou indicative sur le portefeuille <strong>HÉLIOS (PV)</strong>, sur le portefeuille <strong>VOLTA (BESS)</strong>, ou sur les <strong>deux combinés</strong>, avec votre propre proposition d'échéancier par jalonnements.
              </p>
            </div>

            <button
              onClick={() => handleOpenCreateOffer(null)}
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition transform hover:scale-[1.02] shadow-sm flex items-center gap-2.5 shrink-0"
            >
              <Coins className="w-4 h-4" />
              <span>Soumettre une Proposition d'Achat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 5 : PROCESSUS STRUCTURÉ M&A (AVEC MANDAT D'EXCLUSIVITÉ)   */}
        {/* ================================================================= */}
        <section id="process">
          <ProcessTimeline />
        </section>

        {/* ================================================================= */}
        {/* SECTION 6 : CONTACT M&A ADVISORY                                  */}
        {/* ================================================================= */}
        <section
          id="contact-ma"
          className="no-print rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 inline-block font-bold">
              Interlocuteur M&A Dédié
            </span>
            <h4 className="text-lg font-bold text-slate-900">
              Une question sur la structuration ou la Data Room ?
            </h4>
            <p className="text-xs text-slate-600 max-w-xl">
              Yann BARBERIS et l'équipe transactionnelle ENR COURTAGE se tiennent à votre disposition pour vous accompagner dans l'analyse des dossiers et convenir d'une session de Questions/Réponses.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-sm"
            >
              <Mail className="w-4 h-4" />
              <span>Contacter le pôle M&A</span>
            </button>
          </div>
        </section>
        </>
      )}

        {/* ================================================================= */}
        {/* MODALS : ADMIN, OFFRE, MANDAT, NDA BILATÉRAL & CONTACT M&A        */}
        {/* ================================================================= */}

        {/* Modal Validation Administrateur (Yann BARBERIS) */}
        <AdminValidationModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
        />

        {/* Modal Proposition d'Achat (Création / Modification / Contre-proposition) */}
        <OfferModal
          portfolio={offerModalPortfolio || heliosPortfolio}
          selectedSiteIds={[]}
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          existingOffer={selectedOfferForModal}
          mode={offerModalMode}
        />

        {/* Modal Mandat de Négociation Exclusive */}
        {selectedMandateOffer && (
          <ExclusiveMandateModal
            offer={selectedMandateOffer}
            isOpen={!!selectedMandateOffer}
            onClose={() => setSelectedMandateOffer(null)}
          />
        )}

        {/* Modal Consultation & Impression du NDA Bilatéral Signé */}
        <NdaDocumentModal
          isOpen={isNdaModalOpen}
          onClose={() => setIsNdaModalOpen(false)}
        />

        {/* Modal Formulaire de Contact M&A (Style Identique au Site) */}
        <InvestorContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>&copy; {new Date().getFullYear()} ENR COURTAGE — Plateforme Transactionnelle M&A Confidentielle.</p>
        <p className="text-[11px] text-slate-400">
          Les informations communiquées sont strictement confidentielles et réservées aux investisseurs accrédités ayant régularisé un NDA bilatéral.
        </p>
      </footer>
    </div>
  </div>
);
}
