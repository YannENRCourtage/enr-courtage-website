import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sun,
  Battery,
  ArrowLeft,
  FolderLock,
  Coins,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Landmark,
  Tags,
  Zap,
  Lock,
  Layers,
  TableProperties,
  Printer,
  SlidersHorizontal,
  FileSignature,
  MapPin,
  TrendingUp,
  Repeat,
  FileText,
  RotateCcw,
  ChevronDown,
  Download,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { investorService } from '@/services/investorService';
import InvestorHeader from './InvestorHeader';
import InvestorSidebar from './InvestorSidebar';
import InteractiveMap from './InteractiveMap';
import TeaserSitesTable from './TeaserSitesTable';
import DataRoomSection from './DataRoomSection';
import OfferModal from './OfferModal';
import NdaDocumentModal from './NdaDocumentModal';
import InvestorContactModal from './InvestorContactModal';
import ErrorBoundary from './ErrorBoundary';

const pillarIconMap = {
  MapPin,
  TrendingUp,
  Zap,
  Repeat,
  ShieldCheck,
  FileCheck,
  Landmark,
  Lock,
  Tags,
};

/* ================================================================
   FORMATTEUR MONÉTAIRE
   ================================================================ */
const fmtEur = (v) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.', ',')} M€`;
  if (v >= 1_000) return `${Math.round(v / 1_000)} k€`;
  return `${v} €`;
};

/* ================================================================
   COMPOSANT PRINCIPAL
   ================================================================ */
export default function PortfolioDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentInvestor, soldSites, deletedSites, customSites } = useInvestorStore();

  const portfolio = useMemo(() => investorService.getPortfolioById(id), [id]);

  const [selectedSiteIds, setSelectedSiteIds] = useState([]);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isNdaModalOpen, setIsNdaModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isPv = portfolio?.type === 'PV';
  const portfolioKey = isPv ? 'helios' : 'volta';
  const teaser = portfolio?.teaserData || {};

  const currentSold = soldSites?.[portfolioKey] || [];
  const currentDeleted = deletedSites?.[portfolioKey] || [];
  const currentCustom = customSites?.[portfolioKey] || [];

  // All combined sites (excluding deleted ones)
  const allSitesCombined = useMemo(() => {
    if (!portfolio) return [];
    return [...(portfolio.sites || []), ...currentCustom].filter((s) => !currentDeleted.includes(s.id));
  }, [portfolio, currentCustom, currentDeleted]);

  // Active available sites (excluding sold ones)
  const activeAvailableSites = useMemo(() => {
    return allSitesCombined.filter((s) => !currentSold.includes(s.id));
  }, [allSitesCombined, currentSold]);

  const displaySitesCount = activeAvailableSites.length;

  // Total power and ratio
  const { displayPower, displayPowerSub, powerRatio } = useMemo(() => {
    if (isPv) {
      const basePowerKwc = 9120; // 9.12 MWc
      const activePowerKwc = activeAvailableSites.reduce((sum, s) => sum + (Number(s.kwc) || 315), 0);
      const ratio = basePowerKwc > 0 ? (activePowerKwc / basePowerKwc) : 1;
      const formatted = `${(activePowerKwc / 1000).toFixed(2).replace('.', ',')} MWc`;
      const sub = `(${activeAvailableSites.length} site${activeAvailableSites.length > 1 ? 's' : ''} au total)`;
      return { displayPower: formatted, displayPowerSub: sub, powerRatio: ratio };
    } else {
      const basePowerKw = 15500; // 15.50 MW
      const activePowerKw = activeAvailableSites.reduce((sum, s) => sum + (Number(s.kw) || 500), 0);
      const ratio = basePowerKw > 0 ? (activePowerKw / basePowerKw) : 1;
      const formatted = `${(activePowerKw / 1000).toFixed(2).replace('.', ',')} MW`;
      const sub = `${activeAvailableSites.length} site${activeAvailableSites.length > 1 ? 's' : ''} de 500 kW`;
      return { displayPower: formatted, displayPowerSub: sub, powerRatio: ratio };
    }
  }, [isPv, activeAvailableSites]);

  // Dynamic Financial KPIs
  const dynamicFinancialKpis = useMemo(() => {
    if (!teaser.financialKpis) return [];
    if (isPv) {
      return [
        { label: 'TRI PROJET', value: '12,8%', sub: 'Levier bancaire 80/20', detail: "Appel d'Offres Simplifié (AOS)", color: 'amber' },
        { label: 'PAYBACK', value: '7,2 ans', sub: 'Après service de dette', detail: 'Amortissement accéléré CAPEX', color: 'emerald' },
        { label: 'PRODUCTIBLE', value: '1 280 kWh/kWc', sub: 'Irradiation Sud-Ouest', detail: 'Données Météo France P50', color: 'white' },
        { label: 'CA ANNUEL', value: fmtEur(1142000 * powerRatio), sub: 'Tarif AOS ~0,082 €/kWh', detail: "Appel d'Offres Simplifié", color: 'white' },
        { label: 'MARGE NETTE', value: '>58%', sub: 'OPEX < 15 €/MWc/an', detail: 'Maintenance incluse forfait', color: 'emerald' },
        { label: 'VALEUR TOTALE', value: fmtEur(4820000 * powerRatio), sub: 'Valorisation du périmètre', detail: `Droits de développement ${displaySitesCount} sites`, color: 'amber' },
      ];
    } else {
      return [
        { label: 'TRI / EQUITY', value: '20,5%', sub: '>17% min de marché', detail: 'SRI Bancabilité élevée', color: 'cyan' },
        { label: 'PAYBACK NET', value: '4,6 ans', sub: 'Seuil < 5 ans', detail: 'Retour sur investissement court-moyen', color: 'emerald' },
        { label: 'EBITDA NET / AN', value: fmtEur(1720000 * powerRatio), sub: 'Marge net >61%', detail: 'Résultat après loyer & maintenance', color: 'white' },
        { label: 'BANCABILITÉ DSCR', value: '2,34x', sub: 'Classement favorable', detail: 'Ratio couverture dette > 1.5x requis', color: 'white' },
        { label: 'GAIN TURPE7', value: `+${fmtEur(439073 * powerRatio)}`, sub: 'Délibéré CRE 2025-227', detail: 'Facturation réseau réduit de ~50%', color: 'emerald' },
        { label: 'CASH CYCLE CLAIR', value: fmtEur(7230000 * powerRatio), sub: 'Estimation CA brut / an', detail: `Consolidé ${displaySitesCount} stations BESS`, color: 'cyan' },
      ];
    }
  }, [teaser.financialKpis, isPv, powerRatio, displaySitesCount]);

  // Dynamic Revenue Architecture
  const dynamicRevenueArchitecture = useMemo(() => {
    if (isPv) {
      const caVal = Math.round(1142000 * powerRatio);
      return {
        total: fmtEur(caVal),
        totalLabel: "CA annuel prévisionnel (Hypothèse AOS ~0,082 €/kWh)",
        sources: [
          {
            name: "Appels d'Offres Simplifiés (Hypothèse AOS ~0,082 €/kWh)",
            value: `${new Intl.NumberFormat('fr-FR').format(caVal)} €`,
            pct: '100%',
            color: '#f59e0b',
          },
        ],
      };
    } else {
      const totalCa = Math.round(2860000 * powerRatio);
      const fcrVal = Math.round(2076882 * powerRatio);
      const spotVal = Math.round(504780 * powerRatio);
      const mdcVal = Math.round(271253 * powerRatio);
      return {
        total: fmtEur(totalCa),
        totalLabel: 'CA annuel brut consolidé / an',
        cycleLabel: '2,85% de stockage net/cycle',
        sources: [
          { name: 'Réserve Primaire en Fréq (FCR) & PICASSO', value: `${new Intl.NumberFormat('fr-FR').format(fcrVal)} €`, pct: '72%', color: '#06b6d4' },
          { name: 'Arbitrage SPOT (Day-Ahead & Intraday)', value: `${new Intl.NumberFormat('fr-FR').format(spotVal)} €`, pct: '18%', color: '#22d3ee' },
          { name: 'Marché de Capacité 41% PP2 (14kw)', value: `${new Intl.NumberFormat('fr-FR').format(mdcVal)} €`, pct: '10%', color: '#67e8f9' },
        ],
      };
    }
  }, [isPv, powerRatio]);

  // Selection handlers
  const handleToggleSiteSelect = (siteId) => {
    setSelectedSiteIds((prev) =>
      prev.includes(siteId) ? prev.filter((i) => i !== siteId) : [...prev, siteId]
    );
  };
  const handleSelectAll = (ids) => setSelectedSiteIds(ids);
  const handleClearSelection = () => setSelectedSiteIds([]);

  // Prepare donut chart data
  const donutData = useMemo(() => {
    return (dynamicRevenueArchitecture?.sources || []).map((s) => ({
      name: s.name,
      value: parseFloat(s.value.replace(/[^\d]/g, '')) || 1,
      fill: s.color,
      displayValue: s.value,
      pct: s.pct,
    }));
  }, [dynamicRevenueArchitecture]);

  // Dynamic TURPE 7 Comparison (BESS)
  const dynamicTurpeComparison = useMemo(() => {
    if (isPv || !teaser.turpeComparison) return null;
    const gainConsol = Math.round(439073 * powerRatio);
    const oldTot = Math.round(697586 * powerRatio);
    const newTot = Math.round(257627 * powerRatio);
    return {
      rows: [
        { component: 'Composante Soutirage brut (CS)', oldRegime: "Même si sur 10,7% de l'énergie chargée", newRegime: 'Exonération totale sur 80% et spécial', gain: `+${new Intl.NumberFormat('fr-FR').format(Math.round(241986 * powerRatio))} € / an` },
        { component: 'Composante Prix de Puissance (CS Pss)', oldRegime: 'Tarification longue durée analogie', newRegime: 'HTN+Courrier du batteur (15,20 €/MWh)', gain: `+${new Intl.NumberFormat('fr-FR').format(Math.round(60219 * powerRatio))} € / an` },
        { component: 'Pertes Réseau Non Récupérables', oldRegime: 'Double taxation si même maille régional', newRegime: 'Strictement limitée au 1,5% des pertes', gain: `+${new Intl.NumberFormat('fr-FR').format(Math.round(89571 * powerRatio))} € / an` },
        { component: 'Composante Gestion & Comptage (CG/CC)', oldRegime: 'Forfaits conventionnels', newRegime: 'Comptage + quadrants inté-relevé directe (0,14 €/an)', gain: `+${new Intl.NumberFormat('fr-FR').format(Math.round(49297 * powerRatio))} € / an` },
      ],
      total: {
        label: 'TOTAL FACTURE ANNUELLE RÉSEAU',
        oldTotal: `${new Intl.NumberFormat('fr-FR').format(oldTot)} € / an`,
        newTotal: `${new Intl.NumberFormat('fr-FR').format(newTot)} € / an (-63%)`,
        gain: `+${new Intl.NumberFormat('fr-FR').format(gainConsol)} € / an`,
      },
      consolidatedGain: `Gain Consolidé : +${new Intl.NumberFormat('fr-FR').format(gainConsol)} € / an net`,
    };
  }, [isPv, teaser.turpeComparison, powerRatio]);

  // Dynamic Financial Projection (20 years)
  const dynamicFinancialProjection = useMemo(() => {
    return (teaser.financialProjection || []).map((row) => ({
      year: row.year,
      ca: Math.round(row.ca * powerRatio),
      ebitda: Math.round(row.ebitda * powerRatio),
      cashflow: Math.round(row.cashflow * powerRatio),
    }));
  }, [teaser.financialProjection, powerRatio]);

  // Dynamic Cumulative KPIs
  const dynamicCumulativeKpis = useMemo(() => {
    if (isPv) {
      return [
        { label: 'CA CUMULÉ 20 ANS', value: fmtEur(25800000 * powerRatio), sub: 'Hypothèse AOS = 0.082 €/kWh' },
        { label: 'EBITDA NET CUMULÉ 20 ANS', value: fmtEur(15430000 * powerRatio), sub: 'Marge opérationnelle > 58%' },
        { label: 'CASH-FLOW NET POST-DETTES 20 ANS', value: fmtEur(10380000 * powerRatio), sub: 'Après service de dette bancaire 80/20' },
      ];
    } else {
      return [
        { label: 'CA CUMULÉ 20 ANS', value: fmtEur(67040000 * powerRatio), sub: 'Croissance tendancielle à +3.0%' },
        { label: 'EBITDA NET CUMULÉ 20 ANS', value: fmtEur(40970000 * powerRatio), sub: 'Marge opérationnelle > 60% bottom line' },
        { label: 'CASH-FLOW NET POST-DETTES 20 ANS', value: fmtEur(27950000 * powerRatio), sub: 'En réinvestissement fict. D.Net sur horizon 2037+' },
      ];
    }
  }, [isPv, powerRatio]);

  // Differentiated borders and backgrounds for KPI cards
  const kpiCardStyles = [
    { bg: 'bg-blue-50/80', border: 'border-2 border-blue-200 border-l-4 border-l-blue-600', textVal: 'text-blue-900' },
    { bg: 'bg-emerald-50/80', border: 'border-2 border-emerald-200 border-l-4 border-l-emerald-600', textVal: 'text-emerald-900' },
    { bg: 'bg-amber-50/80', border: 'border-2 border-amber-200 border-l-4 border-l-amber-600', textVal: 'text-amber-900' },
    { bg: 'bg-indigo-50/80', border: 'border-2 border-indigo-200 border-l-4 border-l-indigo-600', textVal: 'text-indigo-900' },
    { bg: 'bg-teal-50/80', border: 'border-2 border-teal-200 border-l-4 border-l-teal-600', textVal: 'text-teal-900' },
    { bg: 'bg-purple-50/80', border: 'border-2 border-purple-200 border-l-4 border-l-purple-600', textVal: 'text-purple-900' },
  ];

  // Differentiated borders and icon styles for 4 Pillars
  const pillarStyles = [
    { border: 'border-2 border-blue-200 hover:border-blue-400', iconBg: 'bg-blue-100 text-blue-700', bullet: 'bg-blue-600', tag: 'text-blue-700 bg-blue-50 border-blue-200' },
    { border: 'border-2 border-emerald-200 hover:border-emerald-400', iconBg: 'bg-emerald-100 text-emerald-700', bullet: 'bg-emerald-600', tag: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { border: 'border-2 border-amber-200 hover:border-amber-400', iconBg: 'bg-amber-100 text-amber-700', bullet: 'bg-amber-600', tag: 'text-amber-700 bg-amber-50 border-amber-200' },
    { border: 'border-2 border-indigo-200 hover:border-indigo-400', iconBg: 'bg-indigo-100 text-indigo-700', bullet: 'bg-indigo-600', tag: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  ];

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 space-y-4">
        <h2 className="text-2xl font-black text-[#0b192c]">Portefeuille introuvable</h2>
        <button
          onClick={() => navigate('/investisseurs/dashboard')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex selection:bg-blue-600 selection:text-white">
      {/* Vertical Sidebar */}
      <InvestorSidebar
        activePage={id === 'volta' ? 'volta' : 'helios'}
        onOpenCreateOffer={() => setIsOfferModalOpen(true)}
        onOpenNda={() => setIsNdaModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Sticky Header with branding on left & user profile / notifs on right */}
        <InvestorHeader
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
          showBackToDashboard={true}
          pageTitle={`ENR COURTAGE M&A • PORTEFEUILLE CONSOLIDÉ ${isPv ? 'PV' : 'BESS'} ${displayPower}`}
          onOpenNda={() => setIsNdaModalOpen(true)}
        />

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-grow overflow-y-auto">

          {/* ============================================================= */}
          {/* SECTION 1 — HERO PORTEFEUILLE                                 */}
          {/* ============================================================= */}
          <section className="relative bg-white border-b border-slate-200 px-4 sm:px-12 py-10 sm:py-14">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-8">
              {/* Left: Title, Description & Action Button */}
              <div className="space-y-6 max-w-2xl flex flex-col justify-between">
                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-5xl font-black text-[#0b192c] tracking-tight">
                    PORTEFEUILLE{' '}
                    <span className={isPv ? 'text-amber-600' : 'text-blue-700'}>
                      {isPv ? 'HÉLIOS' : 'VOLTA'}
                    </span>
                  </h1>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {portfolio.description}
                    {portfolio.descriptionShort && (
                      <span className="block mt-2 text-slate-500 text-xs font-normal leading-relaxed">{portfolio.descriptionShort}</span>
                    )}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedSiteIds([]);
                      setIsOfferModalOpen(true);
                    }}
                    className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-md active:scale-95 text-white ${
                      isPv
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-600/20'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/20'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>+ Déposer une offre d'Acquisition</span>
                  </button>
                </div>
              </div>

              {/* Right: Volume Consolidé Gradient Card + CTAs + Print Button */}
              <div className="w-full lg:w-auto min-w-[280px]">
                <div className={`rounded-3xl p-6 sm:p-7 shadow-lg space-y-4 text-white ${
                  isPv
                    ? 'bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 shadow-amber-500/20'
                    : 'bg-gradient-to-br from-blue-700 via-indigo-700 to-cyan-700 shadow-blue-500/20'
                }`}>
                  <div className="text-center">
                    <div className="text-[11px] text-white/85 uppercase tracking-wider font-extrabold">
                      Volume Consolidé
                    </div>
                    <div className="text-4xl sm:text-5xl font-black text-white mt-1 tracking-tight">
                      {displayPower}
                    </div>
                    <div className="text-xs text-white/90 font-medium mt-1">
                      {displayPowerSub}
                    </div>
                  </div>

                  <a
                    href="#sites"
                    className="block w-full text-center py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-wider transition shadow-xs"
                  >
                    Consulter les {displaySitesCount} Sites
                  </a>
                  <a
                    href="#carte"
                    className="block w-full text-center py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition backdrop-blur-xs"
                  >
                    Carte des Implantations
                  </a>
                </div>

                {/* Print / PDF Button located immediately under Volume Consolidé */}
                <button
                  onClick={() => window.print()}
                  className="w-full mt-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  title="Générer un PDF complet de la page"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Imprimer / Télécharger en PDF</span>
                </button>
              </div>
            </div>
          </section>

          {/* ============================================================= */}
          {/* SECTION 2 — KPIs FINANCIERS                                   */}
          {/* ============================================================= */}
          {dynamicFinancialKpis && dynamicFinancialKpis.length > 0 && (
            <section className="bg-slate-50 px-4 sm:px-12 py-10 border-b border-slate-200">
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-blue-700 uppercase tracking-widest font-black">
                      MÉTRIQUES FINANCIÈRES CLÉS
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0b192c] mt-1 tracking-tight">
                      Rentabilité d'Actif Hors Norme & Bancabilité Immédiate
                    </h2>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span>Données au :</span>
                    <span className="text-slate-800 font-mono font-bold">{new Date().toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                  {dynamicFinancialKpis.map((kpi, idx) => {
                    const style = kpiCardStyles[idx % kpiCardStyles.length];
                    return (
                      <div
                        key={idx}
                        className={`${style.bg} ${style.border} rounded-2xl p-4 space-y-1 shadow-2xs hover:shadow-sm transition`}
                      >
                        <div className="text-[10px] text-slate-600 uppercase tracking-wider font-extrabold">
                          {kpi.label}
                        </div>
                        <div className={`text-2xl font-black ${style.textVal} tracking-tight`}>
                          {kpi.value}
                        </div>
                        <div className="text-[11px] text-slate-700 font-bold">{kpi.sub}</div>
                        <div className="text-[10px] text-slate-500 font-medium leading-tight">{kpi.detail}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ============================================================= */}
          {/* SECTION 3 — 4 PILIERS FONDATEURS                              */}
          {/* ============================================================= */}
          {teaser.pillars && teaser.pillars.length > 0 && (
            <section className="bg-white px-4 sm:px-12 py-10 border-b border-slate-200">
              <div className="max-w-7xl mx-auto space-y-6">
                <div>
                  <div className="text-[11px] text-blue-700 uppercase tracking-widest font-black">
                    THÈSE D'INVESTISSEMENT
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0b192c] mt-1 tracking-tight">
                    Les {teaser.pillars.length} Piliers Fondateurs de la Supériorité de {isPv ? 'HÉLIOS' : 'VOLTA'}
                  </h2>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${teaser.pillars.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
                  {teaser.pillars.map((pillar, idx) => {
                    const PillarIcon = pillarIconMap[pillar.icon] || CheckCircle2;
                    const style = pillarStyles[idx % pillarStyles.length];
                    return (
                      <div
                        key={idx}
                        className={`bg-white ${style.border} rounded-2xl p-5 space-y-3 shadow-2xs hover:shadow-md transition flex flex-col justify-between`}
                      >
                        <div className="space-y-3">
                          <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center font-bold`}>
                            <PillarIcon className="w-5 h-5" />
                          </div>
                          <h3 className="font-black text-slate-900 text-sm leading-snug">{pillar.title}</h3>
                          <ul className="space-y-1.5">
                            {pillar.items.map((item, i) => (
                              <li key={i} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2 font-medium">
                                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${style.bullet} shrink-0`} />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {pillar.bottomStat && (
                          <div className={`text-[10px] font-bold flex items-center gap-1.5 pt-2 border-t border-slate-100 ${style.tag}`}>
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{pillar.bottomStat.label}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ============================================================= */}
          {/* SECTION 4 — ARCHITECTURE DES REVENUS + STATION SPECS          */}
          {/* ============================================================= */}
          {dynamicRevenueArchitecture && (
            <section className="bg-slate-50 px-4 sm:px-12 py-10 border-b border-slate-200">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Revenue Donut */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
                  <div>
                    <div className="text-[11px] text-blue-700 uppercase tracking-widest font-black">
                      ARCHITECTURE DES REVENUS
                    </div>
                    <h3 className="text-lg font-black text-[#0b192c] mt-1">
                      {!isPv ? `Value Stacking à 2 Cycles Quotidiens (${dynamicRevenueArchitecture.total} / an)` : (<>Revenus Sécurisés par Appel d'Offres Simplifié<br /><span className="text-blue-700">({dynamicRevenueArchitecture.total} / an)</span></>)}
                    </h3>
                    {dynamicRevenueArchitecture.cycleLabel && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold mt-1.5 inline-block">
                        {dynamicRevenueArchitecture.cycleLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                    {/* Donut Chart */}
                    <div className="w-48 h-48 relative shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {donutData.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-[10px] text-slate-500 uppercase font-black">CA Total / an</div>
                        <div className="text-xl font-black text-blue-700">{dynamicRevenueArchitecture.total}</div>
                      </div>
                    </div>

                    {/* Revenue Sources */}
                    <div className="flex-1 space-y-4 w-full">
                      {dynamicRevenueArchitecture.sources.map((src, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="w-3 h-3 rounded-full shrink-0 mt-1 shadow-2xs" style={{ backgroundColor: src.color }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-black text-slate-900 mb-0.5">{src.value}</div>
                            <div className="text-xs text-slate-800 font-bold">{src.name}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{src.pct} du CA</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right: Station Specs */}
                {teaser.stationSpecs && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-blue-700 uppercase tracking-widest font-black">
                          INGÉNIERIE & FONCIER
                        </div>
                        <h3 className="text-lg font-black text-[#0b192c] mt-1">
                          Spécifications de la {isPv ? 'Toiture' : 'Station'} Type
                        </h3>
                    </div>
                    </div>

                    <div className="space-y-0 divide-y divide-slate-100 pt-1">
                      {teaser.stationSpecs.map((spec, i) => (
                        <div key={i} className="flex items-start justify-between py-2.5 gap-4">
                          <span className="text-xs text-slate-600 font-medium shrink-0">{spec.label}</span>
                          <span className="text-xs text-slate-900 font-bold text-right">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ============================================================= */}
          {/* SECTION 4b — CHRONOMÉTRIE DU DOUBLE CYCLE (BESS only)         */}
          {/* ============================================================= */}
          {!isPv && teaser.cycleTimeline && teaser.cycleTimeline.length > 0 && (
            <section className="bg-white px-4 sm:px-12 py-8 border-b border-slate-200">
              <div className="max-w-7xl mx-auto">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-2xs">
                  <div className="text-[11px] text-blue-700 uppercase tracking-widest font-black mb-4">
                    CHRONOMÉTRIE DU DOUBLE CYCLE QUOTIDIEN
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {teaser.cycleTimeline.map((phase, i) => (
                      <div
                        key={i}
                        className={`rounded-2xl p-4 border ${
                          phase.color === 'cyan'
                            ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                            : 'bg-amber-50/80 border-amber-200 text-amber-950'
                        }`}
                      >
                        <div className={`text-xs font-black ${
                          phase.color === 'cyan' ? 'text-blue-800' : 'text-amber-800'
                        }`}>
                          {phase.label}
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono font-bold mt-1.5">{phase.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ============================================================= */}
          {/* SECTION 5 — CARTE INTERACTIVE                                 */}
          {/* ============================================================= */}
          <section id="carte" className="bg-slate-50 px-4 sm:px-12 py-10 border-b border-slate-200">
            <div className="max-w-7xl mx-auto space-y-4">
              <div>
                <div className="text-[11px] text-blue-700 uppercase tracking-widest font-black flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  CARTOGRAPHIE & IMPLANTATIONS GÉORÉFÉRENCÉES
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0b192c] mt-1 tracking-tight">
                  Maillage Territorial des {displaySitesCount} {isPv ? 'Toitures PV' : 'Stations BESS'} (Nouvelle-Aquitaine & Occitanie)
                </h2>
              </div>

              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white p-2">
                <InteractiveMap
                  pvSites={isPv ? activeAvailableSites : []}
                  bessSites={!isPv ? activeAvailableSites : []}
                  darkTheme={false}
                />
              </div>
            </div>
          </section>

          {/* ============================================================= */}
          {/* SECTION 6 — TABLEAU DES SITES (Light Theme)                   */}
          {/* ============================================================= */}
          <section id="sites" className="bg-white px-4 sm:px-12 py-10 border-b border-slate-200">
            <div className="max-w-7xl mx-auto space-y-4">
              <TeaserSitesTable
                sites={portfolio.sites}
                portfolio={portfolio}
                selectedSiteIds={selectedSiteIds}
                onToggleSiteSelect={handleToggleSiteSelect}
                onSelectAll={handleSelectAll}
                onClearSelection={handleClearSelection}
                onOpenOfferModal={() => setIsOfferModalOpen(true)}
              />
            </div>
          </section>

          {/* ============================================================= */}
          {/* SECTION 7 — COMPARATIF TURPE (BESS ONLY)                     */}
          {/* ============================================================= */}
          {!isPv && dynamicTurpeComparison && (
            <section className="bg-slate-50 px-4 sm:px-12 py-10 border-b border-slate-200">
              <div className="max-w-7xl mx-auto space-y-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-[11px] text-blue-700 uppercase tracking-widest font-black">
                        LE LEVIER RÉGLEMENTAIRE CLÉ DU DÉVELOPPEMENT
                      </div>
                      <h3 className="text-lg font-black text-[#0b192c] mt-1">
                        Comparatif Analytique : Ancien Régime vs Régime TURPE 7 Délibéré CRE 2025-227
                      </h3>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black shadow-2xs">
                      {dynamicTurpeComparison.consolidatedGain}
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] uppercase tracking-wider text-slate-700 border-b border-slate-200 bg-slate-100/90 font-black">
                        <tr>
                          <th className="py-3 px-4">Composante Tarifaire/Réseau</th>
                          <th className="py-3 px-4">{isPv ? 'Ancien Guichet' : 'Ancien Régime (Double Réfactu.)'}</th>
                          <th className="py-3 px-4 text-emerald-800">
                            {isPv ? 'Régime S21 CRE Actuel' : 'Régime TURPE 7 (CRE 2025-227)'}
                          </th>
                          <th className="py-3 px-4 text-right">Gain Annuel Consolidé</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dynamicTurpeComparison.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 text-slate-900 font-bold">{row.component}</td>
                            <td className="py-3 px-4 text-slate-500 font-medium">{row.oldRegime}</td>
                            <td className="py-3 px-4 text-emerald-700 font-bold">{row.newRegime}</td>
                            <td className="py-3 px-4 text-right text-emerald-700 font-black whitespace-nowrap">{row.gain}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-900">
                        <tr>
                          <td className="py-3.5 px-4 font-black uppercase tracking-wider">{dynamicTurpeComparison.total.label}</td>
                          <td className="py-3.5 px-4 text-rose-700 font-mono font-bold">{dynamicTurpeComparison.total.oldTotal}</td>
                          <td className="py-3.5 px-4 text-emerald-800 font-mono font-bold">{dynamicTurpeComparison.total.newTotal}</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-200">
                              {dynamicTurpeComparison.total.gain}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ============================================================= */}
          {/* SECTION 8 — TRAJECTOIRE FINANCIÈRE 15 ANS                     */}
          {/* ============================================================= */}
          {dynamicFinancialProjection && dynamicFinancialProjection.length > 0 && (
            <section className="bg-white px-4 sm:px-12 py-10 border-b border-slate-200">
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                  <div>
                    <div className="text-[11px] text-emerald-700 uppercase tracking-widest font-black flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      BUSINESS PLAN AUDITÉ
                    </div>
                    <h3 className="text-lg font-black text-[#0b192c] mt-1">
                      Trajectoire Financière Consolidée sur 20 Ans (2026 à 2045)
                    </h3>
                  </div>

                  <div className="h-[350px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={dynamicFinancialProjection} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="year"
                          tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={{ stroke: '#cbd5e1' }}
                        />
                        <YAxis
                          tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={{ stroke: '#cbd5e1' }}
                          tickFormatter={(v) => fmtEur(v)}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '16px',
                            color: '#0f172a',
                            fontSize: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          }}
                          formatter={(value) => [fmtEur(value)]}
                          labelFormatter={(label) => `Année ${label}`}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}
                        />
                        <Bar
                          dataKey="ebitda"
                          name="EBITDA Net"
                          fill={isPv ? '#f59e0b' : '#0d9488'}
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="cashflow"
                          name="Cash-Flow Libre"
                          fill="#8b5cf6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Line
                          type="monotone"
                          dataKey="ca"
                          name="Chiffre d'Affaires"
                          stroke={isPv ? '#ea580c' : '#2563eb'}
                          strokeWidth={3}
                          dot={{ fill: isPv ? '#ea580c' : '#2563eb', r: 3 }}
                          activeDot={{ r: 6 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Cumulative KPIs */}
                {dynamicCumulativeKpis && dynamicCumulativeKpis.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {dynamicCumulativeKpis.map((kpi, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 border border-slate-200 rounded-3xl p-5 text-center space-y-1 shadow-2xs"
                      >
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">{kpi.label}</div>
                        <div className={`text-3xl font-black ${
                          i === 0 ? (isPv ? 'text-amber-700' : 'text-blue-700') :
                          i === 1 ? (isPv ? 'text-amber-800' : 'text-cyan-700') :
                          'text-emerald-700'
                        }`}>
                          {kpi.value}
                        </div>
                        <div className="text-xs text-slate-600 font-medium">{kpi.sub}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ============================================================= */}
          {/* SECTION 9 — MODALITÉS DE TRANSACTION & DATA ROOM              */}
          {/* ============================================================= */}
          <section className="bg-slate-50 px-4 sm:px-12 py-10 border-b border-slate-200">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Transaction Details */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
                <div>
                  <h3 className="text-xl font-black text-[#0b192c] tracking-tight">
                    Modalités de Cession & Accès aux Livrables de Transaction
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Votre accord de confidentialité étant vérifié et validé, l'intégralité du dossier d'acquisition du portefeuille{' '}
                  <strong className="text-slate-900 font-black">{isPv ? 'HÉLIOS' : 'VOLTA'}</strong> est accessible dès maintenant.
                  <br /><br />
                  Vous pouvez télécharger les documents d'audit technique, les promesses de bail signées et les matrices économiques en accès direct.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 font-semibold pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isPv ? 'Fiches synoptiques & Bilans PV' : 'Fiches synoptiques & Dimensionnements'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Modèle financier dynamique 20 ans</span>
                  </div>
                </div>
              </div>

              {/* Right: CTA Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Statut du Processus :</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Ouvert aux offres
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Format de Cession :</span>
                    <span className="text-slate-900 font-bold">{isPv ? 'Par projet ou portefeuille complet' : 'Portefeuille complet'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Calendrier Prévisionnel :</span>
                    <span className="text-slate-900 font-bold">Closing T4 2026 / T1 2027</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const dataRoomEl = document.getElementById('dataroom');
                    if (dataRoomEl) dataRoomEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <FolderLock className="w-4 h-4" />
                  Accéder à la Data Room complète
                </button>

                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 border border-slate-200 cursor-pointer shadow-2xs"
                >
                  <Coins className="w-4 h-4" />
                  Déposer une Offre Indicative
                </button>
              </div>
            </div>
          </section>

          {/* ============================================================= */}
          {/* SECTION 10 — DATA ROOM COMPLÈTE                               */}
          {/* ============================================================= */}
          <section id="dataroom" className="bg-white px-4 sm:px-12 py-10 border-b border-slate-200">
            <div className="max-w-7xl mx-auto space-y-4">
              <DataRoomSection
                portfolio={portfolio}
                investorName={currentInvestor?.name}
                investorCompany={currentInvestor?.company}
              />
            </div>
          </section>

          {/* ============================================================= */}
          {/* FOOTER                                                         */}
          {/* ============================================================= */}
          <footer className="bg-slate-100 border-t border-slate-200 px-6 py-8 text-center space-y-2">
            <p className="text-xs text-slate-600 font-medium">
              Ce mémorandum d'information synthétique (Teaser) est établi par <strong className="text-slate-900">ENR COURTAGE SAS</strong> à titre strictement confidentiel.
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              {isPv
                ? 'Sources : Étude PV HÉLIOS 29 Sites • Cadre Appel d\'Offres Simplifié (AOS) • Spécifications standard Hangars & Toitures Solaire'
                : 'Sources : Étude BESS 31 Sites Septembre 2025 • Régime TURPE 7 Délibération CRE N° 2024-227 • Spécifications standard BESS LFP/NMC'}
            </p>
            <p className="text-[10px] text-slate-500 pt-1 font-medium">
              7 Rue Gutenberg, 33700 Mérignac • RCS Bordeaux 881 500 552 • <a href="mailto:contact@enr-courtage.fr" className="text-blue-700 hover:underline">contact@enr-courtage.fr</a>
            </p>
            <p className="text-[10px] text-slate-400">
              &copy; {new Date().getFullYear()} ENR COURTAGE — Plateforme Transactionnelle M&A Confidentielle.
            </p>
          </footer>
        </main>

        {/* ============================================================= */}
        {/* MODALES                                                         */}
        {/* ============================================================= */}
        <OfferModal
          portfolio={portfolio}
          selectedSiteIds={selectedSiteIds}
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
        />

        <ErrorBoundary>
          <NdaDocumentModal
            isOpen={isNdaModalOpen}
            onClose={() => setIsNdaModalOpen(false)}
          />
        </ErrorBoundary>

        <InvestorContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          initialSubject={`Demande d'information M&A — Portefeuille ${portfolio.name}`}
        />
      </div>
    </div>
  );
}
