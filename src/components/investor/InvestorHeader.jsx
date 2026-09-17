import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, LogOut, ShieldAlert, ArrowLeft, ShieldCheck, Menu, FileSignature, User } from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';

export default function InvestorHeader({
  onToggleMobileMenu = null,
  onOpenAdmin = null,
  onOpenNda = null,
  showBackToDashboard = false,
  pageTitle = null,
  pageTitleBadge = 'M&A TEASER',
}) {
  const navigate = useNavigate();
  const { currentInvestor, logout, investors } = useInvestorStore();
  const pendingCount = investors.filter((i) => i.status === 'pending').length;
  const isAdmin = currentInvestor?.isAdmin || currentInvestor?.email === 'y.barberis@enr-courtage.fr';

  const handleLogout = () => {
    logout();
    navigate('/investisseurs');
  };

  const userInitials = currentInvestor?.name
    ? currentInvestor.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-200 no-print">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Mobile Menu Button & Breadcrumb / Page Title */}
        <div className="flex items-center space-x-3">
          {/* Mobile hamburger menu toggle */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              title="Ouvrir le menu de navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {showBackToDashboard && (
            <button
              onClick={() => navigate('/investisseurs/dashboard')}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 transition"
              title="Retour au tableau de bord général"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-mono">
                {pageTitleBadge}
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden md:inline-block">
                Strictement Confidentiel
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{pageTitle || 'Portefeuilles PV & BESS'}</span>
            </h1>
          </div>
        </div>

        {/* Right Side: Admin & Expanded Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Admin button for Yann BARBERIS */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400 shadow-sm transition"
              title="Gérer les demandes et contre-signer les NDA"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span className="hidden md:inline">Administration</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Expanded Connected User Info & Quick NDA Access */}
          {currentInvestor && (
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
              {/* Profile Card Container (Enlarged) */}
              <div className="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-1.5 transition">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                  {userInitials}
                </div>

                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 whitespace-nowrap">
                    {currentInvestor.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                    {currentInvestor.company}
                  </div>
                </div>

                {/* NDA Signed Badge / Link */}
                {onOpenNda && (
                  <button
                    onClick={onOpenNda}
                    className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-[11px] font-bold transition ml-1 shadow-2xs"
                    title="Consulter et imprimer le NDA bilatéral signé"
                  >
                    <FileSignature className="w-3.5 h-3.5 text-emerald-700" />
                    <span>NDA Signé</span>
                  </button>
                )}
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                title="Déconnexion de l'espace investisseur"
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
