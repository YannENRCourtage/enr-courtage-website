import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, LogOut, ShieldAlert, ArrowLeft, ShieldCheck, Menu } from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';

export default function InvestorHeader({
  onToggleMobileMenu = null,
  onOpenAdmin = null,
  showBackToDashboard = false,
  pageTitle = null,
  pageTitleBadge = 'M&A TEASER',
}) {
  const navigate = useNavigate();
  const { currentInvestor, logout, excludeOrange, toggleExcludeOrange, investors } = useInvestorStore();
  const pendingCount = investors.filter((i) => i.status === 'pending').length;
  const isAdmin = currentInvestor?.isAdmin || currentInvestor?.email === 'y.barberis@enr-courtage.fr';

  const handleLogout = () => {
    logout();
    navigate('/investisseurs');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0c1220]/95 backdrop-blur-md border-b border-gray-800 transition-all duration-200 no-print">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Mobile Menu Button & Breadcrumb / Page Title */}
        <div className="flex items-center space-x-3">
          {/* Mobile hamburger menu toggle */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition"
              title="Ouvrir le menu de navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {showBackToDashboard && (
            <button
              onClick={() => navigate('/investisseurs/dashboard')}
              className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition"
              title="Retour au tableau de bord général"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {pageTitleBadge}
              </span>
              <span className="text-[10px] text-gray-400 font-mono hidden md:inline-block">
                Strictement Confidentiel
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>{pageTitle || 'Portefeuilles PV & BESS'}</span>
            </h1>
          </div>
        </div>

        {/* Right Side: Filters, Admin & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Orange exclusion toggle */}
          <button
            onClick={toggleExcludeOrange}
            title="Activer/désactiver l'exclusion des 4 projets avec aléas urbanistiques"
            className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                excludeOrange ? 'bg-amber-400 animate-pulse' : 'bg-gray-500'
              }`}
            />
            <span className="hidden sm:inline">
              {excludeOrange ? 'Exclure 4 projets urba' : 'Périmètre brut (29 PV)'}
            </span>
            <span className="sm:hidden">Urba</span>
          </button>

          {/* Admin button for Yann BARBERIS */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-sm transition"
              title="Gérer les demandes et contre-signer les NDA"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Administration</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-gray-950 text-[10px] font-black">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Investor tag & Logout */}
          {currentInvestor && (
            <div className="flex items-center space-x-2 pl-2 border-l border-gray-800">
              <div className="hidden md:block text-right">
                <div className="text-xs font-bold text-white truncate max-w-[130px]">
                  {currentInvestor.name}
                </div>
                <div className="text-[10px] text-gray-400 truncate max-w-[130px]">
                  {currentInvestor.company}
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Déconnexion de l'espace investisseur"
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-red-500/20 hover:text-red-400 border border-gray-700 text-gray-400 flex items-center justify-center transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
