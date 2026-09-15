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
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { investorService } from '@/services/investorService';
import InvestorHeader from './InvestorHeader';
import InteractiveMap from './InteractiveMap';
import SiteTable from './SiteTable';
import DataRoomSection from './DataRoomSection';
import OfferModal from './OfferModal';

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
  const { currentInvestor, excludeOrange } = useInvestorStore();

  const portfolio = useMemo(() => investorService.getPortfolioById(id), [id]);

  const [selectedSiteIds, setSelectedSiteIds] = useState([]);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <h2 className="text-2xl font-bold">Portefeuille introuvable</h2>
        <button
          onClick={() => navigate('/investisseurs/dashboard')}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-semibold"
        >
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  const isPv = portfolio.type === 'PV';
  const IconComponent = isPv ? Sun : Battery;

  const accentStyles = isPv
    ? {
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        text: 'text-amber-400',
        gradient: 'from-amber-500 to-amber-600',
        btnGlow: 'shadow-amber-500/20',
      }
    : {
        border: 'border-cyan-500/30',
        badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
        text: 'text-cyan-400',
        gradient: 'from-cyan-500 to-cyan-600',
        btnGlow: 'shadow-cyan-500/20',
      };

  // Selection handlers
  const handleToggleSiteSelect = (siteId) => {
    setSelectedSiteIds((prev) =>
      prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );
  };

  const handleSelectAll = (ids) => {
    setSelectedSiteIds(ids);
  };

  const handleClearSelection = () => {
    setSelectedSiteIds([]);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col selection:bg-amber-500 selection:text-gray-950">
      {/* Header */}
      <InvestorHeader
        activeTab="detail"
        showBackToDashboard={true}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/investisseurs/dashboard')}
            className="flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'ensemble des portefeuilles</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-mono text-gray-400">Accès Data Room Vérifié</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* HERO SECTION DU PORTEFEUILLE                                      */}
        {/* ================================================================= */}
        <section
          className={`rounded-2xl bg-gradient-to-b from-[#111827] to-[#0c1220] border p-6 sm:p-10 shadow-2xl relative overflow-hidden ${accentStyles.border}`}
        >
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-800 pb-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${accentStyles.badge}`}>
                    {portfolio.typeBadge}
                  </span>
                  <span className="text-xs text-gray-400">
                    Vendeur : <strong className="text-white">{portfolio.seller}</strong>
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                  <span>{portfolio.name}</span>
                </h1>
                <p className="text-gray-300 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
                  {portfolio.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#dataroom"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <FolderLock className="w-4 h-4" />
                  <span>Consulter Data Room</span>
                </a>

                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className={`px-5 py-2.5 rounded-xl bg-gradient-to-r ${accentStyles.gradient} text-gray-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg ${accentStyles.btnGlow}`}
                >
                  <Coins className="w-4 h-4" />
                  <span>Faire une proposition</span>
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-800">
                <div className="text-[11px] text-gray-400 uppercase font-medium">{portfolio.kpis.totalPowerLabel}</div>
                <div className={`text-2xl font-bold ${accentStyles.text}`}>{portfolio.kpis.totalPower}</div>
                {portfolio.kpis.totalPowerSub && (
                  <div className="text-[10px] text-gray-500">{portfolio.kpis.totalPowerSub}</div>
                )}
              </div>
              <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-800">
                <div className="text-[11px] text-gray-400 uppercase font-medium">Nombre de sites</div>
                <div className="text-2xl font-bold text-white">{portfolio.sites.length} sites</div>
                <div className="text-[10px] text-emerald-400 font-medium">Sécurisés foncièrement</div>
              </div>
              <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-800">
                <div className="text-[11px] text-gray-400 uppercase font-medium">{portfolio.kpis.metric1.label}</div>
                <div className="text-2xl font-bold text-white">{portfolio.kpis.metric1.value}</div>
                <div className="text-[10px] text-gray-400">{portfolio.kpis.metric1.sub}</div>
              </div>
              <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-800">
                <div className="text-[11px] text-gray-400 uppercase font-medium">{portfolio.kpis.metric2.label}</div>
                <div className="text-2xl font-bold text-emerald-400">{portfolio.kpis.metric2.value}</div>
                <div className="text-[10px] text-gray-400">{portfolio.kpis.metric2.sub}</div>
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
              className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-2 hover:border-gray-700 transition"
            >
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{hl.title}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{hl.text}</p>
            </div>
          ))}
        </section>

        {/* ================================================================= */}
        {/* MATRICE ÉCONOMIQUE SPÉCIFIQUE                                     */}
        {/* ================================================================= */}
        <section className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Paramètres Économiques & Justificatifs Disponibles
            </h3>
            <span className="text-xs text-gray-400">Communicables sous NDA</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-800/60 text-[11px] uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="py-2.5 px-4">Paramètre Clé</th>
                  <th className="py-2.5 px-4">Valeur Portefeuille</th>
                  <th className="py-2.5 px-4">Statut / Document Justificatif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {portfolio.economicMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-white">{item.param}</td>
                    <td className={`py-3 px-4 font-mono ${accentStyles.text}`}>{item.value}</td>
                    <td className="py-3 px-4 text-emerald-400">{item.justification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ================================================================= */}
        {/* CARTE DES IMPLANTATIONS DU PORTEFEUILLE                           */}
        {/* ================================================================= */}
        <section className="space-y-4">
          <InteractiveMap
            pvSites={isPv ? portfolio.sites : []}
            bessSites={!isPv ? portfolio.sites : []}
            excludeOrange={isPv ? excludeOrange : false}
          />
        </section>

        {/* ================================================================= */}
        {/* PIPELINE & TABLEAU DES SITES AVEC SÉLECTION                      */}
        {/* ================================================================= */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TableProperties className="w-5 h-5 text-blue-400" />
                <span>Liste Complète des Sites ({portfolio.sites.length})</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Cochez des sites pour soumettre une offre d'achat partielle, ou cliquez sur une ligne pour afficher la fiche détaillée.
              </p>
            </div>

            {selectedSiteIds.length > 0 && (
              <button
                onClick={() => setIsOfferModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
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
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-[#0c1220]/80 px-6 py-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} ENR COURTAGE — Plateforme Transactionnelle M&A Confidentielle.
      </footer>
    </div>
  );
}
