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
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { investorService } from '@/services/investorService';
import InvestorHeader from './InvestorHeader';
import InvestorSidebar from './InvestorSidebar';
import InteractiveMap from './InteractiveMap';
import SiteTable from './SiteTable';
import DataRoomSection from './DataRoomSection';
import OfferModal from './OfferModal';
import NdaDocumentModal from './NdaDocumentModal';
import InvestorContactModal from './InvestorContactModal';

const iconMap = {
  Sun,
  Battery,
  ShieldCheck,
  FileCheck,
  Landmark,
  Tags,
  Zap,
  Lock,
  CheckCircle2,
};

export default function PortfolioDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentInvestor, excludeOrange, toggleExcludeOrange } = useInvestorStore();

  const portfolio = useMemo(() => investorService.getPortfolioById(id), [id]);

  const [selectedSiteIds, setSelectedSiteIds] = useState([]);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isNdaModalOpen, setIsNdaModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 space-y-4">
        <h2 className="text-2xl font-bold">Portefeuille introuvable</h2>
        <button
          onClick={() => navigate('/investisseurs/dashboard')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
        >
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  const isPv = portfolio.type === 'PV';
  const IconComponent = isPv ? Sun : Battery;

  // Dynamic calculations when excludeOrange is toggled for PV (HELIOS)
  const displaySitesCount = isPv && excludeOrange ? 25 : portfolio.sites.length;
  const displayPower = isPv && excludeOrange ? '8,01 MWc' : portfolio.kpis.totalPower;
  const displayPowerSub = isPv && excludeOrange ? '25 sites (4 projets urba exclus)' : portfolio.kpis.totalPowerSub;

  const accentStyles = isPv
    ? {
        border: 'border-amber-300',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        text: 'text-amber-600',
        gradient: 'from-amber-500 to-amber-600',
        btnGlow: 'shadow-amber-500/20',
      }
    : {
        border: 'border-cyan-300',
        badge: 'bg-cyan-100 text-cyan-800 border-cyan-300',
        text: 'text-cyan-600',
        gradient: 'from-cyan-500 to-cyan-600',
        btnGlow: 'shadow-cyan-500/20',
      };

  // Selection handlers
  const handleToggleSiteSelect = (siteId) => {
    setSelectedSiteIds((prev) =>
      prev.includes(siteId) ? prev.filter((i) => i !== siteId) : [...prev, siteId]
    );
  };

  const handleSelectAll = (ids) => {
    setSelectedSiteIds(ids);
  };

  const handleClearSelection = () => {
    setSelectedSiteIds([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex selection:bg-amber-500 selection:text-white">
      {/* Vertical Sidebar */}
      <InvestorSidebar
        activePage={id === 'volta' ? 'volta' : 'helios'}
        onOpenCreateOffer={() => setIsOfferModalOpen(true)}
        onOpenNda={() => setIsNdaModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (White / Slate-50 Background) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Header */}
        <InvestorHeader
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
          showBackToDashboard={true}
          pageTitle={portfolio.name}
          pageTitleBadge={portfolio.typeBadge}
          onOpenNda={() => setIsNdaModalOpen(true)}
        />

        {/* Main Container */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          {/* Navigation Breadcrumb */}
          <div className="no-print flex items-center justify-between">
            <button
              onClick={() => navigate('/investisseurs/dashboard')}
              className="flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au tableau de bord</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsNdaModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold transition"
              >
                <FileSignature className="w-3.5 h-3.5 text-emerald-600" />
                <span>NDA Bilatéral Signé</span>
              </button>
              <div className="hidden sm:flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-mono text-slate-500">Accès Data Room Vérifié</span>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* HERO SECTION DU PORTEFEUILLE (WHITE CARD)                        */}
          {/* ================================================================= */}
          <section
            className={`rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 shadow-lg relative overflow-hidden`}
          >
            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${accentStyles.badge}`}>
                      {portfolio.typeBadge}
                    </span>
                    <span className="text-xs text-slate-500">
                      Vendeur : <strong className="text-slate-900">{portfolio.seller}</strong>
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <span>{portfolio.name}</span>
                  </h1>
                  <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
                    {portfolio.description}
                  </p>
                </div>

                {/* Action Buttons: Imprimer / PDF + Accès Data Room + Faire proposition */}
                <div className="no-print flex flex-wrap items-center gap-3">
                  {/* Bouton Imprimer / PDF */}
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-2 border border-slate-300 shadow-sm"
                    title="Imprimer ou exporter le dossier en PDF"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>Imprimer / PDF</span>
                  </button>

                  {/* Bouton Accès Data Room */}
                  <a
                    href="#dataroom"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm"
                  >
                    <FolderLock className="w-4 h-4" />
                    <span>Accès Data Room</span>
                  </a>

                  {/* Bouton Faire une proposition */}
                  <button
                    onClick={() => setIsOfferModalOpen(true)}
                    className={`px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-md ${accentStyles.btnGlow}`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>Faire une proposition</span>
                  </button>
                </div>
              </div>

              {/* SPECIFIC HELIOS FILTER: EXCLURE 4 PROJETS URBA */}
              {isPv && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <SlidersHorizontal className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-950 block">
                        Filtre Urbanisme Portfolio HELIOS
                      </span>
                      <span className="text-[11px] text-amber-800">
                        {excludeOrange
                          ? '4 projets avec risques de délais urbanistiques sont actuellement exclus (puissance nette : 8,01 MWc sur 25 sites).'
                          : 'Tous les 29 projets sont inclus dans le périmètre (puissance totale : 9,12 MWc).'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={toggleExcludeOrange}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                      excludeOrange
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    <span>{excludeOrange ? '✓ 4 projets urba exclus (8,01 MWc)' : 'Exclure 4 projets urba (8,01 MWc)'}</span>
                  </button>
                </div>
              )}

              {/* Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 uppercase font-medium">{portfolio.kpis.totalPowerLabel}</div>
                  <div className={`text-2xl font-bold ${accentStyles.text}`}>{displayPower}</div>
                  {displayPowerSub && (
                    <div className="text-[10px] text-slate-500">{displayPowerSub}</div>
                  )}
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 uppercase font-medium">Nombre de sites</div>
                  <div className="text-2xl font-bold text-slate-900">{displaySitesCount} sites</div>
                  <div className="text-[10px] text-emerald-600 font-medium">Sécurisés foncièrement</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 uppercase font-medium">{portfolio.kpis.metric1.label}</div>
                  <div className="text-2xl font-bold text-slate-900">{portfolio.kpis.metric1.value}</div>
                  <div className="text-[10px] text-slate-500">{portfolio.kpis.metric1.sub}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 uppercase font-medium">{portfolio.kpis.metric2.label}</div>
                  <div className="text-2xl font-bold text-emerald-600">{portfolio.kpis.metric2.value}</div>
                  <div className="text-[10px] text-slate-500">{portfolio.kpis.metric2.sub}</div>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================= */}
          {/* POINTS CLÉS D'INVESTISSEMENT                                      */}
          {/* ================================================================= */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {portfolio.highlights.map((hl, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 hover:border-slate-300 shadow-sm transition"
              >
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{hl.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{hl.text}</p>
              </div>
            ))}
          </section>

          {/* ================================================================= */}
          {/* MATRICE ÉCONOMIQUE SPÉCIFIQUE                                     */}
          {/* ================================================================= */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Paramètres Économiques & Justificatifs Disponibles
              </h3>
              <span className="text-xs text-slate-500">Communicables sous NDA</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Paramètre Clé</th>
                    <th className="py-2.5 px-4">Valeur Portefeuille</th>
                    <th className="py-2.5 px-4">Statut / Document Justificatif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {portfolio.economicMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.param}</td>
                      <td className={`py-3 px-4 font-mono font-bold ${accentStyles.text}`}>{item.value}</td>
                      <td className="py-3 px-4 text-emerald-700 font-medium">{item.justification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ================================================================= */}
          {/* CARTE DES IMPLANTATIONS DU PORTEFEUILLE                           */}
          {/* ================================================================= */}
          <section id="carte" className="space-y-4">
            <InteractiveMap
              pvSites={isPv ? portfolio.sites : []}
              bessSites={!isPv ? portfolio.sites : []}
              excludeOrange={isPv ? excludeOrange : false}
            />
          </section>

          {/* ================================================================= */}
          {/* PIPELINE & TABLEAU DES SITES AVEC SÉLECTION                      */}
          {/* ================================================================= */}
          <section id="sites" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TableProperties className="w-5 h-5 text-blue-600" />
                  <span>Liste Complète des Sites ({displaySitesCount})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cochez des sites pour soumettre une offre d'achat partielle, ou cliquez sur une ligne pour afficher la fiche détaillée.
                </p>
              </div>

              {selectedSiteIds.length > 0 && (
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-sm"
                >
                  <Coins className="w-4 h-4" />
                  <span>Proposer une offre sur les {selectedSiteIds.length} site(s)</span>
                </button>
              )}
            </div>

            <SiteTable
              sites={portfolio.sites}
              type={portfolio.type}
              excludeOrange={isPv ? excludeOrange : false}
              showSelection={true}
              selectedSiteIds={selectedSiteIds}
              onToggleSiteSelect={handleToggleSiteSelect}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
            />
          </section>

          {/* ================================================================= */}
          {/* DATA ROOM DU PORTEFEUILLE                                         */}
          {/* ================================================================= */}
          <section id="dataroom" className="space-y-4">
            <DataRoomSection
              portfolio={portfolio}
              investorName={currentInvestor?.name}
              investorCompany={currentInvestor?.company}
            />
          </section>

          {/* Modal Proposition d'achat */}
          <OfferModal
            portfolio={portfolio}
            selectedSiteIds={selectedSiteIds}
            isOpen={isOfferModalOpen}
            onClose={() => setIsOfferModalOpen(false)}
          />

          {/* Modal Consultation & Impression NDA Bilatéral */}
          <NdaDocumentModal
            isOpen={isNdaModalOpen}
            onClose={() => setIsNdaModalOpen(false)}
          />

          {/* Modal Contact M&A */}
          <InvestorContactModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            initialSubject={`Demande d'information M&A — Portefeuille ${portfolio.name}`}
          />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} ENR COURTAGE — Plateforme Transactionnelle M&A Confidentielle.
        </footer>
      </div>
    </div>
  );
}
