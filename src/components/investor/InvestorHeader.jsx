import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  ShieldCheck,
  ArrowLeft,
  Menu,
  FileSignature,
  Bell,
  CheckCircle2,
  Lock,
  User,
  ExternalLink,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import EnrCourtageLogo from './EnrCourtageLogo';

export default function InvestorHeader({
  onToggleMobileMenu = null,
  onOpenAdmin = null,
  onOpenNda = null,
  showBackToDashboard = false,
  pageTitle = null,
  pageTitleBadge = 'M&A TRANSACTIONNEL',
  activeView = 'investor', // 'investor' | 'admin'
  onSwitchView = null,
}) {
  const navigate = useNavigate();
  const { currentInvestor, logout, investors, offers } = useInvestorStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const pendingCount = investors.filter((i) => i && i.status === 'pending').length;
  const isAdmin = currentInvestor?.isAdmin || currentInvestor?.email === 'y.barberis@enr-courtage.fr';

  const handleLogout = () => {
    logout();
    navigate('/investisseurs/login');
  };

  const userInitials = currentInvestor?.name
    ? currentInvestor.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'JD';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 shadow-xs transition-all duration-200 no-print">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Side: Official Logo & Security Badge */}
        <div className="flex items-center gap-4">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {showBackToDashboard && (
            <button
              onClick={() => navigate('/investisseurs/dashboard')}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 transition mr-1"
              title="Retour aux Portefeuilles"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <EnrCourtageLogo onClick={() => navigate('/investisseurs/dashboard')} />

          <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Espace Transactionnel Sécurisé
          </span>
        </div>

        {/* Center: Navigation Switcher (Inspired by Kimi prototype) */}
        <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-inner">
          <button
            onClick={() => {
              if (onSwitchView) onSwitchView('investor');
              else navigate('/investisseurs/dashboard');
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'investor'
                ? 'bg-white text-[#0b192c] shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Espace Investisseur</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                if (onSwitchView) onSwitchView('admin');
                else if (onOpenAdmin) onOpenAdmin();
                else navigate('/investisseurs/admin');
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-white text-purple-950 shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Console Administrateur</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Right Side: Profile Card, Notification Bell & Logout */}
        <div className="flex items-center gap-3">
          {currentInvestor && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                {userInitials}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <div className="text-xs font-bold text-slate-900 whitespace-nowrap">
                  {currentInvestor.name || 'Investisseur'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                  {currentInvestor.company || 'Partenaire M&A'}
                </div>
              </div>

              {onOpenNda && (
                <button
                  onClick={onOpenNda}
                  className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 transition cursor-pointer ml-1"
                  title="Consulter et imprimer le NDA signé"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>NDA Actif</span>
                </button>
              )}
            </div>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              title="Notifications M&A"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>

            {/* Floating Notification Popover */}
            {isNotifOpen && (
              <div className="absolute top-12 right-0 z-50 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                    Mises à jour M&A
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                    Plateforme Active
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                    <span className="font-bold block text-xs">Portefeuilles Disponibles</span>
                    <span className="text-slate-600 text-[11px]">
                      HÉLIOS (9,12 MWc PV) & VOLTA (15,50 MW BESS) sont ouverts aux offres d'acquisition.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                    <span className="font-bold block text-xs">Data Room Ouverte</span>
                    <span className="text-slate-600 text-[11px]">
                      12 documents complets (baux notariés, études techniques, modélisations) consultables sous NDA.
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-200 cursor-pointer"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
