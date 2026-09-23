import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Sun,
  Battery,
  Coins,
  PlusCircle,
  Mail,
  LogOut,
  Users,
  ShieldAlert,
  FolderLock,
  X,
  Settings,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import EnrCourtageLogo from './EnrCourtageLogo';
import InvestorSettingsModal from './InvestorSettingsModal';

export default function InvestorSidebar({
  activePage = 'dashboard', // 'dashboard' | 'helios' | 'volta'
  adminActiveTab = null, // 'requests' | 'offers' | 'dataroom' | 'users' | null
  onSelectAdminTab = null,
  onSelectInvestorTab = null,
  onOpenCreateOffer = null,
  onOpenAdmin = null,
  onOpenNda = null,
  onOpenContact = null,
  isOpenMobile = false,
  onCloseMobile = () => {},
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentInvestor, logout, offers, investors } = useInvestorStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isAdmin = currentInvestor?.email?.trim().toLowerCase() === 'y.barberis@enr-courtage.fr';
  const pendingCount = investors.filter((i) => i.status === 'pending').length;

  const myOffers = offers.filter(
    (o) =>
      isAdmin ||
      o.investorEmail?.toLowerCase() === currentInvestor?.email?.toLowerCase() ||
      o.investorId === currentInvestor?.id ||
      o.investorCompany?.toLowerCase() === currentInvestor?.company?.toLowerCase()
  );

  const handleNavigate = (path, hash = '') => {
    onCloseMobile();
    if (location.pathname === path) {
      if (hash) {
        const el = document.getElementById(hash.replace('#', ''));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate(path + hash);
    }
  };

  const handleAdminSelect = (tabKey) => {
    onCloseMobile();
    if (onSelectAdminTab) {
      onSelectAdminTab(tabKey);
      if (location.pathname !== '/investisseurs/dashboard') {
        navigate(`/investisseurs/dashboard?adminTab=${tabKey}`);
      }
    } else {
      navigate(`/investisseurs/dashboard?adminTab=${tabKey}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/investisseurs');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0c1220] border-r border-gray-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } no-print`}
      >
        {/* Top: Official Brand Logo Header (Clickable -> Dashboard) */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between">
          <button
            onClick={() => handleNavigate('/investisseurs/dashboard')}
            className="flex items-center text-left hover:opacity-90 transition cursor-pointer"
            title="ENR COURTAGE — Retour au tableau de bord"
          >
            <EnrCourtageLogo className="h-8 w-auto" />
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Section: Tableau de bord */}
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-3 mb-2">
              Vue Principale
            </div>
            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab(null);
                handleNavigate('/investisseurs/dashboard');
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePage === 'dashboard' && !adminActiveTab
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <LayoutDashboard className="w-4 h-4 shrink-0 text-blue-400" />
                <span>Tableau de Bord</span>
              </div>
              {activePage === 'dashboard' && !adminActiveTab && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </button>
          </div>

          {/* Section: Administration & Supervision (Visible pour l'Administrateur) */}
          {isAdmin && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                  Supervision M&A (Admin)
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  Yann B.
                </span>
              </div>

              <div className="space-y-1">
                {/* 1. Demandes d'Accès & NDA */}
                <button
                  onClick={() => handleAdminSelect('requests')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                    adminActiveTab === 'requests'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Demandes Accès & NDA</span>
                  </div>
                  {pendingCount > 0 ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-gray-950 animate-pulse">
                      {pendingCount}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-mono">0</span>
                  )}
                </button>

                {/* 2. Synthèse des Offres */}
                <button
                  onClick={() => handleAdminSelect('offers')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                    adminActiveTab === 'offers'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Synthèse des Offres</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 font-mono">
                    {offers.length}
                  </span>
                </button>

                {/* 3. Documents Data Room */}
                <button
                  onClick={() => handleAdminSelect('dataroom')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                    adminActiveTab === 'dataroom'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <FolderLock className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Gestion Data Room</span>
                  </div>
                  <span className="text-[9px] text-cyan-400 font-mono">2 portef.</span>
                </button>

                {/* 4. Gestion Utilisateurs */}
                <button
                  onClick={() => handleAdminSelect('users')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                    adminActiveTab === 'users'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Users className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Supervision & Accès</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 font-mono">
                    {investors.length}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Section: Portefeuilles en Vente */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                Portefeuilles en Vente
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                2 actifs
              </span>
            </div>

            <div className="space-y-1.5">
              {/* Portefeuille HÉLIOS (PV) */}
              <button
                onClick={() => handleNavigate('/investisseurs/portefeuille/helios')}
                className={`w-full text-left p-2.5 rounded-xl transition border cursor-pointer ${
                  activePage === 'helios'
                    ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm ring-1 ring-amber-500/30'
                    : 'bg-gray-900/40 border-gray-800/80 text-gray-300 hover:bg-gray-800/60 hover:text-white hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Sun className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white">HÉLIOS (PV)</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    9,12 MWc
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 pl-8 mt-1 flex items-center justify-between">
                  <span>29 sites toitures</span>
                  <span className="text-amber-400 font-mono text-[9px]">Consulter →</span>
                </div>
              </button>

              {/* Portefeuille VOLTA (BESS) */}
              <button
                onClick={() => handleNavigate('/investisseurs/portefeuille/volta')}
                className={`w-full text-left p-2.5 rounded-xl transition border cursor-pointer ${
                  activePage === 'volta'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-sm ring-1 ring-cyan-500/30'
                    : 'bg-gray-900/40 border-gray-800/80 text-gray-300 hover:bg-gray-800/60 hover:text-white hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <Battery className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white">VOLTA (BESS)</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                    15,50 MW
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 pl-8 mt-1 flex items-center justify-between">
                  <span>31 sites 500 kW</span>
                  <span className="text-cyan-400 font-mono text-[9px]">Consulter →</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section: Propositions & Offres */}
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-3 mb-2">
              Propositions & Offres
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  onCloseMobile();
                  if (onSelectInvestorTab) {
                    onSelectInvestorTab('offers');
                  }
                  handleNavigate('/investisseurs/dashboard', '#mes-offres');
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:bg-gray-800/60 hover:text-white transition text-left cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Mes Offres Déposées</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    myOffers.length > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {myOffers.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons pinned at the bottom-left of the sidebar */}
        <div className="p-4 border-t border-gray-800/80 bg-[#0c1220] space-y-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onCloseMobile();
                if (onOpenContact) {
                  onOpenContact();
                } else {
                  handleNavigate('/investisseurs/dashboard', '#contact-ma');
                }
              }}
              className="flex items-center justify-center space-x-1.5 px-2.5 py-2.5 rounded-xl bg-gray-900/80 hover:bg-blue-600/20 text-gray-300 hover:text-white border border-gray-800 hover:border-blue-500/40 text-xs font-bold transition cursor-pointer"
              title="Contacter le pôle M&A"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Contact</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center space-x-1.5 px-2.5 py-2.5 rounded-xl bg-gray-900/80 hover:bg-blue-600/20 text-gray-300 hover:text-white border border-gray-800 hover:border-blue-500/40 text-xs font-bold transition cursor-pointer"
              title="Gérer mes paramètres"
            >
              <Settings className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Paramètres</span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-gray-900/60 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-gray-800 hover:border-red-500/30 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Settings Modal */}
      <InvestorSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenNda={onOpenNda}
      />
    </>
  );
}
