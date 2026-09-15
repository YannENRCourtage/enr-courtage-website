import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Printer, Lock, LogOut, User, ShieldAlert, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';

export default function InvestorHeader({
  activeTab = 'dashboard',
  onOpenDataRoom = null,
  onOpenAdmin = null,
  showBackToDashboard = false,
}) {
  const navigate = useNavigate();
  const { currentInvestor, logout, excludeOrange, toggleExcludeOrange, investors } = useInvestorStore();
  const pendingCount = investors.filter((i) => i.status === 'pending').length;
  const isAdmin = currentInvestor?.isAdmin || currentInvestor?.email === 'y.barberis@enr-courtage.fr';

  const handleLogout = () => {
    logout();
    navigate('/investisseurs');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c1220]/95 backdrop-blur-md border-b border-gray-800 transition-all duration-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand & Document Title */}
        <div className="flex items-center space-x-3">
          {showBackToDashboard ? (
            <button
              onClick={() => navigate('/investisseurs/dashboard')}
              className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition"
              title="Retour au tableau de bord général"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                M&A Teaser
              </span>
              <span className="text-[11px] text-gray-400 font-medium hidden sm:inline-block">
                Strictement Confidentiel
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>ENR COURTAGE</span>
              <span className="text-gray-500 font-light hidden md:inline">| Portefeuilles PV & BESS</span>
            </h1>
          </div>
        </div>

        {/* Actions & Investor Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Orange exclusion toggle */}
          <button
            onClick={toggleExcludeOrange}
            title="Activer/désactiver l'exclusion des 4 projets avec aléas urbanistiques"
            className="flex items-center space-x-2 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition"
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

          {/* Export / Print PDF */}
          <button
            onClick={handlePrint}
            title="Exporter en PDF ou Imprimer le dossier"
            className="flex items-center space-x-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Imprimer / PDF</span>
          </button>

          {/* Data room quick button */}
          {onOpenDataRoom && (
            <button
              onClick={onOpenDataRoom}
              className="flex items-center space-x-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Accès Data Room</span>
            </button>
          )}

          {/* Admin button for Yann BARBERIS */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-sm transition"
              title="Gérer les demandes et contre-signer les NDA"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Administration</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-gray-950 text-[10px] font-black flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Investor tag & Logout */}
          {currentInvestor && (
            <div className="flex items-center space-x-2 pl-2 border-l border-gray-800">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-bold text-white truncate max-w-[140px]">
                  {currentInvestor.name}
                </div>
                <div className="text-[10px] text-gray-400 truncate max-w-[140px]">
                  {currentInvestor.company}
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Déconnexion de l'espace investisseur"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-red-500/20 hover:text-red-400 border border-gray-700 text-gray-400 flex items-center justify-center transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Anchor Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 overflow-x-auto text-xs font-medium border-t border-gray-800/60 py-2.5 text-gray-400">
        {activeTab === 'dashboard' ? (
          <>
            <a href="#synthese" className="hover:text-amber-400 transition flex items-center space-x-1 whitespace-nowrap">
              <span>📊 Synthèse Exécutive</span>
            </a>
            <a href="#helios" className="hover:text-amber-400 transition flex items-center space-x-1 whitespace-nowrap">
              <span>☀️ Portefeuille HÉLIOS (PV)</span>
            </a>
            <a href="#volta" className="hover:text-cyan-400 transition flex items-center space-x-1 whitespace-nowrap">
              <span>🔋 Portefeuille VOLTA (BESS)</span>
            </a>
            <a href="#offre" className="hover:text-amber-300 font-semibold transition flex items-center space-x-1 whitespace-nowrap">
              <span>💼 Déposer une Offre</span>
            </a>
            <a href="#comparatif" className="hover:text-emerald-400 transition flex items-center space-x-1 whitespace-nowrap">
              <span>📈 Matrice Économique</span>
            </a>
            <a href="#process" className="hover:text-purple-400 transition flex items-center space-x-1 whitespace-nowrap">
              <span>🤝 Processus M&A</span>
            </a>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/investisseurs/dashboard')} className="hover:text-white transition flex items-center space-x-1 whitespace-nowrap text-gray-400">
              <span>← Tous les portefeuilles</span>
            </button>
            <a href="#carte" className="hover:text-emerald-400 transition flex items-center space-x-1 whitespace-nowrap">
              <span>🗺️ Carte Interactive</span>
            </a>
            <a href="#sites" className="hover:text-blue-400 transition flex items-center space-x-1 whitespace-nowrap">
              <span>📋 Table des Sites & Sélection</span>
            </a>
            <a href="#dataroom" className="hover:text-amber-400 transition flex items-center space-x-1 whitespace-nowrap">
              <span>📁 Data Room Dédiée</span>
            </a>
          </>
        )}
      </div>
    </header>
  );
}
