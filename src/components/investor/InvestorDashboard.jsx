import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sun,
  Battery,
  ShieldCheck,
  ShieldAlert,
  Coins,
  ArrowRight,
  FolderLock,
  Mail,
  CheckCircle2,
  Clock,
  Check,
  X,
  FileCheck,
  AlertCircle,
  Building,
  User,
  ExternalLink,
  Edit3,
  Send,
  Lock,
  FileSignature,
  Calendar,
  Layers,
  MessageSquare,
  Sparkles,
  Download,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { investorService } from '@/services/investorService';
import InvestorHeader from './InvestorHeader';
import OfferModal from './OfferModal';
import ExclusiveMandateModal from './ExclusiveMandateModal';
import NdaDocumentModal from './NdaDocumentModal';
import AdminConsoleView from './AdminConsoleView';
import ErrorBoundary from './ErrorBoundary';
import { formatThousands, parseThousands, autoBalanceMilestones } from '@/utils/mnaUtils';
import InvestorSidebar from './InvestorSidebar';
import InvestorContactModal from './InvestorContactModal';

export default function InvestorDashboard({ defaultToAdmin = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const adminParam = searchParams.get('admin');
  const tabParam = searchParams.get('tab');

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const {
    currentInvestor,
    offers,
    investorAcceptCounter,
    investorRejectCounter,
    investorCounterOffer,
    messages,
    sendMessage,
    userDownloads,
  } = useInvestorStore();

  const isAdmin = currentInvestor?.isAdmin || currentInvestor?.email === 'y.barberis@enr-courtage.fr';

  // Active view: 'investor' or 'admin'
  const [activeView, setActiveView] = useState(defaultToAdmin || adminParam === 'true' ? 'admin' : 'investor');
  // Investor sub-tab: 'portfolios' | 'offers' | 'dataroom' | 'messages'
  const [investorSubTab, setInvestorSubTab] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#mes-offres' || tabParam === 'offers') return 'offers';
      if (window.location.hash === '#contact-ma' || tabParam === 'messages') return 'messages';
    }
    return 'portfolios';
  });

  // Listen for hash changes to switch sub-tabs smoothly
  React.useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#mes-offres' || searchParams.get('tab') === 'offers') {
        setActiveView('investor');
        setInvestorSubTab('offers');
      } else if (window.location.hash === '#contact-ma' || searchParams.get('tab') === 'messages') {
        setActiveView('investor');
        setInvestorSubTab('messages');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [searchParams]);
  // Admin navigation state from notifications
  const [adminInitialTab, setAdminInitialTab] = useState('users');
  const [adminSelectedChatEmail, setAdminSelectedChatEmail] = useState('');

  // Modals
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerModalTargetPortfolio, setOfferModalTargetPortfolio] = useState('both');
  const [isNdaModalOpen, setIsNdaModalOpen] = useState(false);
  const [selectedMandateOffer, setSelectedMandateOffer] = useState(null);
  const [investorCounteringOfferId, setInvestorCounteringOfferId] = useState(null);
  const [counterAmount, setCounterAmount] = useState('5 500 000');
  const [counterComments, setCounterComments] = useState('');
  const [counterMilestones, setCounterMilestones] = useState([]);
  const [dashboardNotice, setDashboardNotice] = useState('');

  // Investor Chat State
  const [chatInputText, setChatInputText] = useState('');

  // Handle click on notification inside popover
  const handleNavigateNotif = (notif) => {
    if (!notif) return;
    if (isAdmin) {
      setActiveView('admin');
      const targetTab = notif.linkTab || (notif.type === 'registration_request' ? 'users' : notif.type === 'offer' || notif.type === 'counter_proposal' ? 'offers' : 'messages');
      setAdminInitialTab(targetTab);
      if (notif.investorEmail) {
        setAdminSelectedChatEmail(notif.investorEmail);
      }
    } else {
      setActiveView('investor');
      const targetSub = notif.linkTab || (notif.type === 'offer' || notif.type === 'counter_proposal' ? 'offers' : 'messages');
      setInvestorSubTab(targetSub);
    }
  };

  const portfolios = useMemo(() => investorService.getPortfolios(), []);
  const heliosPortfolio = portfolios.find((p) => p.id === 'helios');
  const voltaPortfolio = portfolios.find((p) => p.id === 'volta');

  // Filter offers for the current investor (or all if admin viewing)
  const myOffers = useMemo(() => {
    if (!currentInvestor) return [];
    if (isAdmin) return offers;
    const cleanEmail = currentInvestor.email?.trim().toLowerCase();
    return offers.filter(
      (o) =>
        (o.investorEmail && o.investorEmail.trim().toLowerCase() === cleanEmail) ||
        o.investorId === currentInvestor.id
    );
  }, [offers, currentInvestor, isAdmin]);

  const activeOffer = myOffers[0] || null;

  // KPIs
  const totalMyOffersAmount = myOffers.reduce((sum, o) => sum + (o.amountEur || 0), 0);
  const activeNegotiationCount = myOffers.filter(
    (o) => o.status === 'counter_by_admin' || o.status === 'counter_by_investor' || o.status === 'submitted'
  ).length;

  // Counter proposal handler
  const handleOpenInvestorCounter = (offer) => {
    setInvestorCounteringOfferId(offer.id);
    const counterOff = offer.counterOffer;
    const baseAmt = counterOff?.amountEur || offer.amountEur || 5000000;
    setCounterAmount(formatThousands(baseAmt));
    setCounterComments('Ajustement intermédiaire suite à analyse détaillée de la Data Room.');
    const initialMilestones =
      offer.milestones && offer.milestones.length > 0
        ? offer.milestones.map((m) => ({
            label: m.label,
            percentage: m.percentage,
            targetCondition: m.targetCondition,
            targetDate: m.targetDate,
          }))
        : [
            {
              label: 'Jalon 1 — Signature Promesse de Cession (Upfront)',
              percentage: 15,
              targetCondition: 'Closing signature promesse & séquestre notarié',
              targetDate: 'T4 2026',
            },
            {
              label: 'Jalon 2 — Obtention de la PTF / Accord Enedis',
              percentage: 85,
              targetCondition: 'Proposition Technique et Financière acceptée',
              targetDate: 'T3 2027',
            },
          ];
    setCounterMilestones(initialMilestones);
  };

  const handleSubmitInvestorCounter = (offerId) => {
    const num = parseThousands(counterAmount);
    if (isNaN(num) || num <= 0) {
      alert('Veuillez saisir un montant valide.');
      return;
    }
    const totalPct = counterMilestones.reduce((s, m) => s + (Number(m.percentage) || 0), 0);
    if (totalPct !== 100) {
      alert(`Le total des jalons doit faire exactement 100% (actuellement : ${totalPct}%).`);
      return;
    }

    const milestonesWithAmounts = counterMilestones.map((m) => ({
      ...m,
      percentage: Number(m.percentage),
      amount: Math.round((num * Number(m.percentage)) / 100),
    }));

    investorCounterOffer(offerId, {
      counterAmountEur: num,
      counterMilestones: milestonesWithAmounts,
      counterComments: counterComments,
    });
    setInvestorCounteringOfferId(null);
    setDashboardNotice(`Votre contre-proposition de ${formatThousands(num)} € a été transmise à Yann BARBERIS.`);
    setTimeout(() => setDashboardNotice(''), 5000);
  };

  // Chat message send handler
  const handleSendInvestorMessage = (e) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    sendMessage({
      from: 'investor',
      authorName: currentInvestor?.name || 'Investisseur',
      authorCompany: currentInvestor?.company || '',
      investorEmail: (currentInvestor?.email || '').trim().toLowerCase(),
      text: chatInputText.trim(),
    });

    setChatInputText('');
  };

  // Filter messages for current investor conversation
  const investorMessages = useMemo(() => {
    if (!currentInvestor) return [];
    const myEmail = (currentInvestor.email || '').trim().toLowerCase();
    return (messages || []).filter((m) => {
      if (isAdmin) return true;
      const msgEmail = (m.investorEmail || '').trim().toLowerCase();
      return msgEmail === myEmail;
    });
  }, [messages, currentInvestor, isAdmin]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex selection:bg-blue-600 selection:text-white">
      {/* Sidebar Latérale intégrée */}
      <InvestorSidebar
        activePage="dashboard"
        onSelectInvestorTab={(tab) => {
          setActiveView('investor');
          setInvestorSubTab(tab);
        }}
        onOpenCreateOffer={() => {
          setOfferModalTargetPortfolio('both');
          setIsOfferModalOpen(true);
        }}
        onOpenNda={() => setIsNdaModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Header Unifié avec Bascule des Espaces */}
        <InvestorHeader
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
          activeView={activeView}
          onSwitchView={(view) => setActiveView(view)}
          onOpenAdmin={() => setActiveView('admin')}
          onOpenNda={() => setIsNdaModalOpen(true)}
          onNavigateNotif={handleNavigateNotif}
        />

        {/* Main Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* ================================================================= */}
        {/* VUE 1 : CONSOLE D'ADMINISTRATION (SI ACTIVE ET ADMIN)            */}
        {/* ================================================================= */}
        {isAdmin && activeView === 'admin' ? (
          <AdminConsoleView
            initialTab={adminInitialTab}
            initialChatEmail={adminSelectedChatEmail}
            onBackToDashboard={() => setActiveView('investor')}
          />
        ) : (
          /* =============================================================== */
          /* VUE 2 : ESPACE INVESTISSEUR TRANSACTIONNEL                      */
          /* =============================================================== */
          <div className="space-y-6">
            
            {/* Notification Banner */}
            {dashboardNotice && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{dashboardNotice}</span>
                </div>
                <button onClick={() => setDashboardNotice('')} className="text-emerald-600 hover:text-emerald-900 font-bold">
                  ✕
                </button>
              </div>
            )}

            {/* BANDEAU D'ACCUEIL INVESTISSEUR */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0b192c] tracking-tight">
                  Bienvenue, {currentInvestor?.name || 'Investisseur'}{' '}
                  <span className="text-slate-400 font-normal text-lg sm:text-xl ml-1">
                    · {currentInvestor?.company || 'Partenaire M&A'}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                  Consultez les 2 portefeuilles disponibles en cession, examinez les justificatifs en Data Room et soumettez vos offres par jalons.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setOfferModalTargetPortfolio('both');
                    setIsOfferModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Coins className="w-4 h-4" />
                  <span>+ Déposer une Offre d'Acquisition</span>
                </button>

                <button
                  onClick={() => setInvestorSubTab('messages')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Messagerie M&A</span>
                </button>
              </div>
            </div>

            {/* LES 4 COMPTEURS CLÉS (STYLE ÉPURÉ FOND BLANC & BORDURES COLORÉES) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* KPI 1 : Portefeuilles Suivis */}
              <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-blue-700">
                  Portefeuilles Suivis
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-950 mt-1">2 Actifs</div>
                <div className="text-[11px] font-bold text-blue-600 mt-0.5">24.62 MW cumulés (PV + BESS)</div>
              </div>

              {/* KPI 2 : Offres Déposées */}
              <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-700">
                  Offres Déposées
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">
                  {myOffers.length} Offre{myOffers.length > 1 ? 's' : ''}
                </div>
                <div className="text-[11px] font-bold text-amber-700 mt-0.5">
                  {myOffers.length > 0 ? `${formatThousands(totalMyOffersAmount)} € HT proposée` : 'Aucune offre active'}
                </div>
              </div>

              {/* KPI 3 : Négociation Active */}
              <div className="bg-white border-2 border-purple-200 rounded-2xl p-4 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-purple-700">
                  Négociation Active
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-950 mt-1">
                  {activeNegotiationCount} En Cours
                </div>
                <div className="text-[11px] font-bold text-purple-600 mt-0.5">
                  {activeNegotiationCount > 0
                    ? (activeOffer?.status === 'counter_by_admin'
                        ? `Contre-proposition reçue (${formatThousands(activeOffer?.counterOffer?.amountEur || 0)} €)`
                        : 'Négociation en cours')
                    : 'Aucune négociation active'}
                </div>
              </div>

              {/* KPI 4 : Data Room Débloquée */}
              <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-700">
                  Data Room Débloquée
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">12 Fichiers</div>
                <div className="text-[11px] font-bold text-emerald-700 mt-0.5">Baux, devis, fiches techniques</div>
              </div>
            </div>

            {/* SOUS-NAVIGATION INVESTISSEUR */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setInvestorSubTab('portfolios')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  investorSubTab === 'portfolios'
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Portefeuilles en Cession (2)</span>
              </button>

              <button
                onClick={() => setInvestorSubTab('offers')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  investorSubTab === 'offers'
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Mes Offres & Négociations ({myOffers.length})</span>
              </button>

              <button
                onClick={() => setInvestorSubTab('messages')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  investorSubTab === 'messages'
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Messagerie Directe M&A</span>
              </button>
            </div>

            {/* ============================================================= */}
            {/* SOUS-VUE A : PORTEFEUILLES DISPONIBLES EN CESSION             */}
            {/* ============================================================= */}
            {investorSubTab === 'portfolios' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CARTE PORTEFEUILLE 1 : PROJET HÉLIOS (SOLAIRE PV 9,12 MWc) */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between hover:border-amber-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                        Solaire Toitures & Hangars
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Vendeur : <strong className="text-slate-800">GREEN INVEST</strong>
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-[#0b192c] tracking-tight">
                      Projet HÉLIOS — 9,12 MWc
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                      Grappe de 29 projets solaires toitures et hangars neufs/rénovations situés dans le Sud-Ouest (Gers, Dordogne, Gironde, Landes).
                    </p>

                    {/* Métriques Hélios */}
                    <div className="grid grid-cols-3 gap-2.5 my-5">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">
                          Sites Sécurisés
                        </span>
                        <span className="text-lg font-black text-[#0b192c]">29 sites</span>
                        <span className="text-[10px] font-bold text-slate-400 block">100% PdB signées</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">
                          Bâtiments Neufs
                        </span>
                        <span className="text-lg font-black text-amber-700">7,65 MWc</span>
                        <span className="text-[10px] font-bold text-slate-400 block">26 hangars</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">
                          Toitures Exist.
                        </span>
                        <span className="text-lg font-black text-blue-700">1,47 MWc</span>
                        <span className="text-[10px] font-bold text-slate-400 block">3 rénovations</span>
                      </div>
                    </div>

                    {/* Atouts */}
                    <ul className="text-xs space-y-2 text-slate-600 font-medium border-t border-slate-100 pt-4">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Maîtrise foncière totale (Baux notariés 30 ans avec loyers fermes)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Devis travaux charpente & couverture déjà négociés</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Autorisations d'urbanisme (DP/PC) prêtes au dépôt</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => navigate('/investisseurs/portefeuille/helios')}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Accès Portefeuille</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setOfferModalTargetPortfolio('helios');
                        setIsOfferModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Coins className="w-4 h-4" />
                      <span>Faire une offre sur Hélios</span>
                    </button>
                  </div>
                </div>

                {/* CARTE PORTEFEUILLE 2 : PROJET VOLTA (BATTERIES BESS 15,50 MW) */}
                <div className="bg-white border-2 border-cyan-200 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between hover:border-cyan-400 transition-all relative">
                  <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xs">
                    Optimisé Délibération CRE 2025-227
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
                        Stockage BESS Stand-Alone HTA
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Vendeur : <strong className="text-slate-800">ENR COURTAGE (100%)</strong>
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-[#0b192c] tracking-tight">
                      Projet VOLTA — 15,50 MW / 32,36 MWh
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                      Portefeuille homogène de 31 unités de 500 kW / 1 044 kWh (matériel CESC Mercury 261). Monétisation à 2 cycles/jour (FCR, aFRR PICASSO, Capacité RTE).
                    </p>

                    {/* Métriques Volta */}
                    <div className="grid grid-cols-3 gap-2.5 my-5">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">
                          Unités 500 kW
                        </span>
                        <span className="text-lg font-black text-[#0b192c]">31 sites</span>
                        <span className="text-[10px] font-bold text-cyan-700 block">&lt; 20 m² en DP</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">
                          EBITDA Net An 1
                        </span>
                        <span className="text-lg font-black text-emerald-700">1,50 M€</span>
                        <span className="text-[10px] font-bold text-slate-400 block">Marge ~39%</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">
                          Payback Projet
                        </span>
                        <span className="text-lg font-black text-blue-700">4,8 ans</span>
                        <span className="text-[10px] font-bold text-purple-700 block">Equity : 2,3 ans</span>
                      </div>
                    </div>

                    {/* Atouts */}
                    <ul className="text-xs space-y-2 text-slate-600 font-medium border-t border-slate-100 pt-4">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                        <span>Exonération TURPE 7 sur l'électricité réinjectée (+440 k€/an économisés)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                        <span>Raccordements HTA 20 kV Enedis qualifiés (postes sources ODRE répertoriés)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                        <span>Distance privée optimisée à 10 mètres (génie civil minimisé)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => navigate('/investisseurs/portefeuille/volta')}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Accès Portefeuille</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setOfferModalTargetPortfolio('volta');
                        setIsOfferModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Coins className="w-4 h-4" />
                      <span>Faire une offre sur Volta</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* SOUS-VUE B : MES OFFRES DÉPOSÉES & NÉGOCIATIONS               */}
            {/* ============================================================= */}
            {investorSubTab === 'offers' && (
              <div id="mes-offres" className="space-y-6">
                {activeOffer ? (
                  <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                            {activeOffer.portfolioName || 'Offre Combinée (HÉLIOS + VOLTA)'}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">Réf: {activeOffer.id}</span>
                          {activeOffer.status === 'counter_by_admin' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200 animate-pulse">
                              Contre-proposition reçue
                            </span>
                          )}
                          {activeOffer.status === 'submitted' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                              En cours d'étude
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-black text-[#0b192c] mt-1">
                          Négociation Transactionnelle Active
                        </h2>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 block">Votre offre initiale déposée</span>
                        <span className="text-2xl font-black text-slate-900">
                          {formatThousands(activeOffer.amountEur)} € HT
                        </span>
                      </div>
                    </div>

                    {/* Échéancier de paiement par jalons */}
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Échéancier de Paiement Proposé par Jalons d'Exécution</span>
                      </h4>
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/50">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-4">Jalon d'exécution</th>
                              <th className="py-2.5 px-4">Modalité / Déclencheur</th>
                              <th className="py-2.5 px-4">Échéance</th>
                              <th className="py-2.5 px-4 text-center">Quote-part</th>
                              <th className="py-2.5 px-4 text-right">Montant (€ HT)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                            {(activeOffer.milestones || []).map((m, idx) => (
                              <tr key={idx}>
                                <td className="py-2.5 px-4 font-bold text-blue-900">{m.label}</td>
                                <td className="py-2.5 px-4 text-slate-600">{m.targetCondition || '—'}</td>
                                <td className="py-2.5 px-4 text-slate-500 font-mono">{m.targetDate || '—'}</td>
                                <td className="py-2.5 px-4 text-center font-bold text-blue-700">{m.percentage}%</td>
                                <td className="py-2.5 px-4 text-right font-black text-slate-900">
                                  {formatThousands(m.amount)} €
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Encadré Contre-proposition reçue (UNIQUEMENT si l'admin a fait une contre-proposition) */}
                    {activeOffer.status === 'counter_by_admin' && activeOffer.counterOffer && (
                      <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                              Contre-proposition reçue de Yann BARBERIS (ENR COURTAGE)
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            Décision requise
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          {activeOffer.counterOffer?.comments ||
                            "Proposition financière ajustée suite à l'analyse de votre dossier."}
                        </p>

                        <div className="text-2xl font-black text-[#0b192c]">
                          {formatThousands(activeOffer.counterOffer?.amountEur)} € HT{' '}
                          <span className="text-xs font-medium text-slate-500">
                            (avec réajustement des quotes-parts d'échéance)
                          </span>
                        </div>

                        {/* Les 3 boutons d'action immédiate */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <button
                            onClick={() => {
                              if (window.confirm("Confirmez-vous l'acceptation de la contre-proposition de Yann BARBERIS ? Vous pourrez ensuite procéder immédiatement à la signature du Mandat de Négociation Exclusive.")) {
                                investorAcceptCounter(activeOffer.id);
                                setSelectedMandateOffer(activeOffer);
                                setDashboardNotice("Contre-proposition acceptée ! Vous pouvez signer le Mandat de Négociation Exclusive.");
                              }
                            }}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accepter la contre-proposition ({formatThousands(activeOffer.counterOffer?.amountEur)} €)</span>
                          </button>

                          <button
                            onClick={() => handleOpenInvestorCounter(activeOffer)}
                            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Faire une contre-proposition</span>
                          </button>

                          <button
                            onClick={() => {
                              const reason = window.prompt("Indiquez un motif pour votre refus (optionnel) :");
                              if (reason !== null) {
                                investorRejectCounter(activeOffer.id, reason);
                                setDashboardNotice("Vous avez décliné la contre-proposition.");
                              }
                            }}
                            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-colors cursor-pointer"
                          >
                            Refuser
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Statut : Offre déposée en cours d'étude */}
                    {activeOffer.status === 'submitted' && (
                      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Offre déposée avec succès. Votre proposition est en cours d'examen par Yann BARBERIS.</span>
                        </div>
                        <span className="font-bold text-[11px] bg-blue-100 px-2.5 py-1 rounded-md text-blue-800">
                          En attente de retour
                        </span>
                      </div>
                    )}

                    {/* Statut : Contre-proposition envoyée par l'investisseur */}
                    {activeOffer.status === 'counter_by_investor' && (
                      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            Votre contre-proposition de {formatThousands(activeOffer.counterOffer?.amountEur || activeOffer.amountEur)} € a été transmise à Yann BARBERIS.
                          </span>
                        </div>
                        <span className="font-bold text-[11px] bg-amber-100 px-2.5 py-1 rounded-md text-amber-800">
                          En cours d'arbitrage
                        </span>
                      </div>
                    )}

                    {/* Statut : Accord trouvé */}
                    {(activeOffer.status === 'agreement_reached' || activeOffer.status === 'mandate_signed') && (
                      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Accord transactionnel convenu à {formatThousands(activeOffer.amountEur)} € HT.
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedMandateOffer(activeOffer)}
                          className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl shadow-2xs transition cursor-pointer"
                        >
                          {activeOffer.status === 'mandate_signed' ? 'Consulter le Mandat Signé' : 'Signer le Mandat d\'Exclusivité'}
                        </button>
                      </div>
                    )}

                    {/* Statut : Rejeté */}
                    {activeOffer.status === 'rejected' && (
                      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs">
                        Cette proposition d'offre n'a pas été retenue ou a été déclinée. Vous pouvez formuler une nouvelle offre d'acquisition.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-16 px-6 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                      <Coins className="w-7 h-7" />
                    </div>
                    <div className="max-w-md mx-auto">
                      <h3 className="text-base font-black text-[#0b192c]">Aucune offre déposée pour le moment</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Vous n'avez pas encore formulé d'offre d'acquisition sur les portefeuilles HÉLIOS ou VOLTA. Vous pouvez déposer une offre globale ou partielle avec échéancier de paiement personnalisé.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setOfferModalTargetPortfolio('both');
                        setIsOfferModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Coins className="w-4 h-4" />
                      <span>+ Déposer une Offre d'Acquisition</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* SOUS-VUE C : MESSAGERIE DIRECTE M&A                          */}
            {/* ============================================================= */}
            {investorSubTab === 'messages' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm w-full max-w-7xl mx-auto flex flex-col h-[580px] overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                      YB
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#0b192c]">Yann BARBERIS</h3>
                      <span className="text-xs text-slate-500 font-medium">Associé M&A • ENR COURTAGE</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> En ligne
                  </span>
                </div>

                {/* Fil de discussion */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-3 pr-1">
                  {investorMessages.map((msg) => {
                    const isFromMe = msg.from === 'investor';

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[70%] ${
                          isFromMe ? 'ml-auto flex-row-reverse' : ''
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg font-bold text-[10px] flex items-center justify-center shrink-0 ${
                            isFromMe ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                          }`}
                        >
                          {isFromMe ? 'VOUS' : 'YB'}
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs font-medium break-words overflow-hidden ${
                            isFromMe
                              ? 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                              : 'bg-slate-100 text-slate-800 rounded-tl-none'
                          }`}
                        >
                          <div className="break-words whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                          <span
                            className={`text-[9px] block mt-1.5 font-bold ${
                              isFromMe ? 'text-blue-200' : 'text-slate-400'
                            }`}
                          >
                            {msg.authorName} • {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Saisie d'un nouveau message */}
                <form onSubmit={handleSendInvestorMessage} className="pt-3 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    required
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    placeholder="Écrire un message à Yann BARBERIS..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600 shadow-inner"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Envoyer</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer institutionnel */}
      <footer className="border-t border-slate-200 bg-white px-4 sm:px-8 py-3 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 mt-12">
        <div>
          <strong>ENR COURTAGE SAS</strong> • 7 Rue Gutenberg, 33700 Mérignac • RCS Bordeaux 881 500 552
        </div>
        <div className="text-[11px] text-slate-400">
          Plateforme M&A Sécurisée • Conforme Délibération CRE 2025-227 & TURPE 7
        </div>
      </footer>

      {/* =================================================================== */}
      {/* MODALES : OFFRE, CONTRE-OFFRE, NDA BILATÉRAL & MANDAT D'EXCLUSIVITÉ  */}
      {/* =================================================================== */}

      {/* Modale Dépôt d'Offre */}
      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        defaultPortfolioId={offerModalTargetPortfolio}
      />

      {/* Modale Consultation NDA Bilatéral */}
      <ErrorBoundary onReset={() => setIsNdaModalOpen(false)}>
        <NdaDocumentModal
          isOpen={isNdaModalOpen}
          onClose={() => setIsNdaModalOpen(false)}
          investor={currentInvestor}
        />
      </ErrorBoundary>

      {/* Modale Mandat Exclusif */}
      {selectedMandateOffer && (
        <ExclusiveMandateModal
          offer={selectedMandateOffer}
          isOpen={!!selectedMandateOffer}
          onClose={() => setSelectedMandateOffer(null)}
        />
      )}

      {/* Modale Contre-Proposition Investisseur */}
      {investorCounteringOfferId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-black text-[#0b192c]">Formuler une Contre-Proposition</h3>
              </div>
              <button
                onClick={() => setInvestorCounteringOfferId(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nouveau Montant Global Proposé (€ HT) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={counterAmount}
                    onChange={(e) => setCounterAmount(formatThousands(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-black text-sm text-slate-900"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">€ HT</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Commentaires / Justification de l'offre
                </label>
                <textarea
                  rows={2}
                  value={counterComments}
                  onChange={(e) => setCounterComments(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800"
                />
              </div>

              {/* Jalons inputs auto-équilibrés */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Répartition par jalons (Total requis = 100%)</span>
                  <span className="font-mono font-bold text-emerald-700">
                    Total : {counterMilestones.reduce((s, m) => s + (Number(m.percentage) || 0), 0)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {counterMilestones.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-800 text-[11px] truncate">{m.label}</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={m.percentage}
                          onChange={(e) =>
                            setCounterMilestones((prev) =>
                              autoBalanceMilestones(prev, idx, e.target.value)
                            )
                          }
                          className="w-16 px-2 py-1 rounded-lg bg-white border border-slate-300 text-center font-bold text-blue-700"
                        />
                        <span className="text-slate-500">%</span>
                        <span className="text-[11px] font-mono text-emerald-700 ml-auto font-bold">
                          {formatThousands(
                            Math.round((parseThousands(counterAmount) * (Number(m.percentage) || 0)) / 100)
                          )} €
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInvestorCounteringOfferId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitInvestorCounter(investorCounteringOfferId)}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-xs"
                >
                  Transmettre à Yann BARBERIS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale de contact M&A */}
      <InvestorContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        initialSubject="Demande d'information M&A — Espace Investisseur"
      />
      </div>
    </div>
  );
}
