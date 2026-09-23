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
  const { currentInvestor } = useInvestorStore();

  const portfolio = useMemo(() => investorService.getPortfolioById(id), [id]);

  const [selectedSiteIds, setSelectedSiteIds] = useState([]);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isNdaModalOpen, setIsNdaModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <h2 className="text-2xl font-bold">Portefeuille introuvable</h2>
        <button
          onClick={() => navigate('/investisseurs/dashboard')}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-semibold"
        >
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  const isPv = portfolio.type === 'PV';
  const teaser = portfolio.teaserData || {};
  const displaySitesCount = portfolio.sites.length;
  const displayPower = portfolio.kpis.totalPower;

  const accent = isPv ? 'amber' : 'cyan';
  const accentColor = isPv ? '#f59e0b' : '#06b6d4';

  // Selection handlers
  const handleToggleSiteSelect = (siteId) => {
    setSelectedSiteIds((prev) =>
      prev.includes(siteId) ? prev.filter((i) => i !== siteId) : [...prev, siteId]
    );
  };
  const handleSelectAll = (ids) => setSelectedSiteIds(ids);
  const handleClearSelection = () => setSelectedSiteIds([]);

  // Prepare donut chart data
  const donutData = (teaser.revenueArchitecture?.sources || []).map((s) => ({
    name: s.name,
    value: parseFloat(s.value.replace(/[^\d]/g, '')),
    fill: s.color,
    displayValue: s.value,
    pct: s.pct,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white flex selection:bg-amber-500 selection:text-white">
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
        {/* Header */}
        <InvestorHeader
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
          showBackToDashboard={true}
          pageTitle={portfolio.name}
          pageTitleBadge={portfolio.typeBadge}
          onOpenNda={() => setIsNdaModalOpen(true)}
        />

        {/* ============================================================= */}
        {/* TOP BAR — Sticky Dark Banner                                   */}
        {/* ============================================================= */}
        <div className="bg-slate-900/80 border-b border-slate-800 px-4 sm:px-8 py-2 flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-400 uppercase tracking-widest">
            ENR COURTAGE M&A • PORTEFEUILLE CONSOLIDÉ {isPv ? 'PV' : 'BESS'} {displayPower}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">
              Date du teaser CRE 2026 — {new Date().toLocaleDateString('fr-FR')}
            </span>
            <button
              onClick={() => setIsNdaModalOpen(true)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold bg-${accent}-500/20 text-${accent}-300 border border-${accent}-500/30`}
            >
              ✓ NDA Bilatéral Actif
            </button>
            <button
              onClick={() => window.print()}
              className="text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-grow overflow-y-auto">

          {/* ============================================================= */}
          {/* SECTION 1 — HERO PORTEFEUILLE                                 */}
          {/* ============================================================= */}
          <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-12 py-12 sm:py-16">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-8">
              {/* Left: Title & Description */}
              <div className="space-y-4 max-w-2xl">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
                  PORTEFEUILLE{' '}
                  <span className={`text-${accent}-400`}>{isPv ? 'HÉLIOS' : 'VOLTA'}</span>
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {portfolio.description}
                  {portfolio.descriptionShort && (
                    <span className="block mt-1 text-slate-500 text-xs">{portfolio.descriptionShort}</span>
                  )}
                </p>
              </div>

              {/* Right: Volume Badge + CTAs */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 min-w-[260px] space-y-4">
                <div className="text-center">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Volume Consolidé</div>
                  <div className={`text-4xl font-black text-${accent}-400 mt-1`}>{displayPower}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{portfolio.kpis.totalPowerSub}</div>
                </div>
                <a
                  href="#sites"
                  className={`block w-full text-center py-2.5 rounded-xl bg-${accent}-500 hover:bg-${accent}-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition`}
                >
                  Consulter les {displaySitesCount} Sites
                </a>
                <a
                  href="#carte"
                  className="block w-full text-center py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition"
                >
                  Carte des Implantations
                </a>
              </div>
            </div>
          </section>

          {/* ============================================================= */}
          {/* SECTION 2 — KPIs FINANCIERS                                   */}
          {/* ============================================================= */}
          {teaser.financialKpis && (
            <section className="bg-slate-950 px-4 sm:px-12 py-10">
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">Métriques Financières Clés</div>
                    <h2 className="text-xl font-bold text-white mt-1">Rentabilité d'Actif Hors Norme & Bancabilité Immédiate</h2>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500">
                    <span>Données au : </span>
                    <span className="text-slate-400 font-mono">{new Date().toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {teaser.financialKpis.map((kpi, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1 hover:border-slate-600 transition"
                    >
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{kpi.label}</div>
                      <div className={`text-2xl font-black ${
                        kpi.color === 'cyan' ? 'text-cyan-400' :
                        kpi.color === 'amber' ? 'text-amber-400' :
                        kpi.color === 'emerald' ? 'text-emerald-400' :
                        'text-white'
                      }`}>
                        {kpi.value}
                      </div>
                      <div className="text-[10px] text-slate-500">{kpi.sub}</div>
                      <div className="text-[9px] text-slate-600">{kpi.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ============================================================= */}
          {/* SECTION 3 — 4 PILIERS FONDATEURS                              */}
          {/* ============================================================= */}
          {teaser.pillars && teaser.pillars.length > 0 && (
            <section className="bg-slate-950 px-4 sm:px-12 py-10">
              <div className="max-w-7xl mx-auto space-y-6">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">Thèse d'Investissement</div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    Les 4 Piliers Fondateurs de la Supériorité de {isPv ? 'HÉLIOS' : 'VOLTA'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {teaser.pillars.map((pillar, idx) => {
                    const PillarIcon = pillarIconMap[pillar.icon] || CheckCircle2;
                    return (
                      <div
                        key={idx}
                        className={`bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-${accent}-500/40 transition`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-${accent}-500/10 flex items-center justify-center`}>
                          <PillarIcon className={`w-5 h-5 text-${accent}-400`} />
                        </div>
                        <h3 className="font-bold text-white text-sm leading-snug">{pillar.title}</h3>
                        <ul className="space-y-1.5">
                          {pillar.items.map((item, i) => (
                            <li key={i} className="text-[11px] text-slate-400 leading-relaxed flex items-start gap-1.5">
                              <span className={`mt-1 w-1 h-1 rounded-full bg-${accent}-500 shrink-0`} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        {pillar.bottomStat && (
                          <div className={`text-[10px] text-${accent}-400 font-medium flex items-center gap-1 pt-1 border-t border-slate-800`}>
                            <CheckCircle2 className="w-3 h-3" />
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
          {teaser.revenueArchitecture && (
            <section className="bg-slate-900/50 px-4 sm:px-12 py-10">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Revenue Donut */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div>
                    <div className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">Architecture des Revenus</div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      Value Stacking à {!isPv ? '2 Cycles Quotidiens' : 'Tarif Garanti'} ({teaser.revenueArchitecture.total} / an)
                    </h3>
                    {teaser.revenueArchitecture.cycleLabel && (
                      <span className={`text-[10px] px-2 py-0.5 rounded bg-${accent}-500/10 text-${accent}-400 font-medium mt-1 inline-block`}>
                        {teaser.revenueArchitecture.cycleLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Donut Chart */}
                    <div className="w-48 h-48 relative">
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-[10px] text-slate-500 uppercase">CA Total / an</div>
                        <div className={`text-xl font-black text-${accent}-400`}>{teaser.revenueArchitecture.total}</div>
                      </div>
                    </div>

                    {/* Revenue Sources */}
                    <div className="flex-1 space-y-3">
                      {teaser.revenueArchitecture.sources.map((src, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: src.color }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-300 font-medium truncate">{src.name}</div>
                            <div className="text-[11px] text-slate-500">{src.pct} du CA</div>
                          </div>
                          <div className="text-xs font-bold text-white whitespace-nowrap">{src.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-600 italic">
                    {teaser.revenueArchitecture.totalLabel}
                  </div>
                </div>

                {/* Right: Station Specs */}
                {teaser.stationSpecs && (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">Ingénierie & Foncier</div>
                        <h3 className="text-lg font-bold text-white mt-1">
                          Spécifications de la {isPv ? 'Toiture' : 'Station'} Type
                        </h3>
                      </div>
                      <div className="flex gap-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold bg-${accent}-500/20 text-${accent}-300`}>
                          {isPv ? 'PV' : 'BESS'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                          {isPv ? '315 kWc' : '500 kW'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0 divide-y divide-slate-800">
                      {teaser.stationSpecs.map((spec, i) => (
                        <div key={i} className="flex items-start justify-between py-2.5 gap-4">
                          <span className="text-xs text-slate-500 shrink-0">{spec.label}</span>
                          <span className="text-xs text-white font-medium text-right">{spec.value}</span>
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
            <section className="bg-slate-950 px-4 sm:px-12 py-6">
              <div className="max-w-7xl mx-auto">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <div className="text-[11px] text-slate-500 uppercase tracking-widest font-medium mb-4">
                    Chronométrie du Double Cycle Quotidien
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {teaser.cycleTimeline.map((phase, i) => (
                      <div
                        key={i}
                        className={`rounded-xl p-3 border ${
                          phase.color === 'cyan'
                            ? 'bg-cyan-950/30 border-cyan-800/50'
                            : 'bg-amber-950/30 border-amber-800/50'
                        }`}
                      >
                        <div className={`text-xs font-bold ${
                          phase.color === 'cyan' ? 'text-cyan-400' : 'text-amber-400'
                        }`}>
                          {phase.label}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-1">{phase.time}</div>
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
          <section id="carte" className="bg-slate-900/50 px-4 sm:px-12 py-10">
            <div className="max-w-7xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-widest font-medium flex items-center gap-2">
                    <MapPin className={`w-3.5 h-3.5 text-${accent}-400`} />
                    Cartographie & Interactive des Implantations
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    Maillage Territorial des {displaySitesCount} {isPv ? 'Toitures PV' : 'Stations BESS'} (Nouvelle-Aquitaine & Occitanie)
                  </h2>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold bg-${accent}-500/20 text-${accent}-300 border border-${accent}-500/30`}>
                    ⊕ {displaySitesCount} {isPv ? 'Toitures' : 'Stations'} ({displayPower})
                  </span>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-800">
                <InteractiveMap
                  pvSites={isPv ? portfolio.sites : []}
                  bessSites={!isPv ? portfolio.sites : []}
                  darkTheme={true}
                />
              </div>
            </div>
          </section>

          {/* ============================================================= */}
          {/* SECTION 6 — TABLEAU DES SITES (Matching Image 3 Dark Theme)   */}
          {/* ============================================================= */}
          <section id="sites" className="bg-slate-950 px-4 sm:px-12 py-10">
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
          {/* SECTION 7 — COMPARATIF TURPE                                  */}
          {/* ============================================================= */}
          {teaser.turpeComparison && (
            <section className="bg-slate-950 px-4 sm:px-12 py-10">
              <div className="max-w-7xl mx-auto space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">
                        {isPv ? 'Cadre Réglementaire CRE' : 'Le Levier Réglementaire Clé du Développement'}
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {isPv
                          ? 'Régime Tarifaire S21 CRE — Obligation d\'Achat 20 Ans'
                          : 'Comparatif Analytique : Ancien Régime vs Régime TURPE 7 Délibéré CRE 2025-227'
                        }
                      </h3>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                      {teaser.turpeComparison.consolidatedGain}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-700">
                        <tr>
                          <th className="py-2.5 px-3 font-medium">Composante Tarifaire/Réseau</th>
                          <th className="py-2.5 px-3 font-medium">{isPv ? 'Ancien Guichet' : 'Ancien Régime (Double Réfactu.)'}</th>
                          <th className="py-2.5 px-3 font-medium text-emerald-400">
                            {isPv ? 'Régime S21 CRE Actuel' : 'Régime TURPE 7 (CRE 2025-227)'}
                          </th>
                          <th className="py-2.5 px-3 font-medium text-right">Gain Annuel Consolidé</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {teaser.turpeComparison.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-800/30 transition">
                            <td className="py-3 px-3 text-white font-medium">{row.component}</td>
                            <td className="py-3 px-3 text-slate-500">{row.oldRegime}</td>
                            <td className="py-3 px-3 text-emerald-300 font-medium">{row.newRegime}</td>
                            <td className="py-3 px-3 text-right text-emerald-400 font-bold whitespace-nowrap">{row.gain}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-slate-600">
                        <tr className={`bg-${accent}-500/5`}>
                          <td className="py-3 px-3 text-white font-bold">{teaser.turpeComparison.total.label}</td>
                          <td className="py-3 px-3 text-red-400 font-bold font-mono">{teaser.turpeComparison.total.oldTotal}</td>
                          <td className="py-3 px-3 text-emerald-300 font-bold font-mono">{teaser.turpeComparison.total.newTotal}</td>
                          <td className="py-3 px-3 text-right">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                              {teaser.turpeComparison.total.gain}
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
          {teaser.financialProjection && teaser.financialProjection.length > 0 && (
            <section className="bg-slate-900/50 px-4 sm:px-12 py-10">
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
                  <div>
                    <div className="text-[11px] text-emerald-400 uppercase tracking-widest font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Business Plan Audité
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      Trajectoire Financière Consolidée sur 15 Ans (2026 à 2040)
                    </h3>
                  </div>

                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={teaser.financialProjection} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                          dataKey="year"
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                        />
                        <YAxis
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                          axisLine={{ stroke: '#475569' }}
                          tickLine={{ stroke: '#475569' }}
                          tickFormatter={(v) => fmtEur(v)}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            color: '#e2e8f0',
                            fontSize: '12px',
                          }}
                          formatter={(value) => [fmtEur(value)]}
                          labelFormatter={(label) => `Année ${label}`}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                        />
                        <Bar
                          dataKey="ebitda"
                          name="EBITDA Net"
                          fill={isPv ? '#f59e0b' : '#2dd4bf'}
                          radius={[3, 3, 0, 0]}
                        />
                        <Bar
                          dataKey="cashflow"
                          name="Cash-Flow Libre"
                          fill="#a78bfa"
                          radius={[3, 3, 0, 0]}
                        />
                        <Line
                          type="monotone"
                          dataKey="ca"
                          name="Chiffre d'Affaires"
                          stroke={isPv ? '#f97316' : '#38bdf8'}
                          strokeWidth={3}
                          dot={{ fill: isPv ? '#f97316' : '#38bdf8', r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Cumulative KPIs */}
                {teaser.cumulativeKpis && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {teaser.cumulativeKpis.map((kpi, i) => (
                      <div
                        key={i}
                        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center space-y-1.5"
                      >
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{kpi.label}</div>
                        <div className={`text-3xl font-black ${
                          i === 0 ? (isPv ? 'text-amber-400' : 'text-cyan-400') :
                          i === 1 ? (isPv ? 'text-amber-300' : 'text-cyan-300') :
                          'text-emerald-400'
                        }`}>
                          {kpi.value}
                        </div>
                        <div className="text-[10px] text-slate-500">{kpi.sub}</div>
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
          <section className="bg-slate-900/50 px-4 sm:px-12 py-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Transaction Details */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div>
                  <div className="text-[11px] text-emerald-400 uppercase tracking-widest font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Data Room Ouverte • Non-Binding & Validé
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">
                    Modalités de Cession & Accès aux Livrables de Transaction
                  </h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Votre accord de confidentialité étant vérifié et validé, l'intégralité du dossier d'acquisition du portefeuille{' '}
                  <strong className="text-white">{isPv ? 'HÉLIOS' : 'VOLTA'}</strong> est accessible dès maintenant.
                  Vous pouvez télécharger les documents d'audit technique, les promesses de bail signées et les matrices économiques en accès direct.
                </p>

                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Fiches synoptiques & Bilans PV</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Conditions de Prix de Batteries CESC</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Dossiers de raccordement Enedis</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Modèle financier dynamique 15 ans</span>
                  </div>
                </div>
              </div>

              {/* Right: CTA Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 pb-3">
                  ENR COURTAGE Infrastructure
                  <br />
                  <span className="text-white text-sm">Département Stockage & Flexibilité Réseau</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                    <span className="text-slate-500">Statut du Processus :</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Ouvert aux offres
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                    <span className="text-slate-500">Format de Cession :</span>
                    <span className="text-white font-medium">100% Titres SPV ou Clé en Main</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                    <span className="text-slate-500">Calendrier Prévisionnel :</span>
                    <span className="text-white font-medium">Closing T4 2026 / T1 2027</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const dataRoomEl = document.getElementById('dataroom');
                    if (dataRoomEl) dataRoomEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full py-3 rounded-xl bg-${accent}-500 hover:bg-${accent}-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-${accent}-500/20`}
                >
                  <FolderLock className="w-4 h-4" />
                  Accéder à la Data Room complète
                </button>

                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 border border-slate-700"
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
          <section id="dataroom" className="bg-[#0b1325] px-4 sm:px-12 py-10 border-t border-slate-800">
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
          <footer className="bg-slate-950 border-t border-slate-800 px-6 py-8 text-center space-y-2">
            <p className="text-[11px] text-slate-400">
              Ce mémorandum d'information synthétique (Teaser) est établi par <strong className="text-white">ENR COURTAGE SAS</strong> à titre strictement confidentiel.
            </p>
            <p className="text-[10px] text-slate-500">
              {isPv
                ? 'Sources : Étude PV HÉLIOS 29 Sites • Régime Tarifaire S21 Délibération CRE • Spécifications standard Hangars & Toitures Solaire'
                : 'Sources : Étude BESS 31 Sites Septembre 2025 • Régime TURPE 7 Délibération CRE N° 2024-227 • Spécifications standard BESS LFP/NMC'}
            </p>
            <p className="text-[10px] text-slate-600 pt-1">
              Siège social : 1 Allée d'Étigny, 31200 Toulouse (Siret : 848 721 478 00029) • Capital : 10 000 € • <a href="mailto:contact@enr-courtage.fr" className="text-slate-400 hover:text-white transition">contact@enr-courtage.fr</a>
            </p>
            <p className="text-[10px] text-slate-700">
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
