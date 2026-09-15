import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ShieldCheck, KeyRound, AlertCircle, ArrowLeft, Building2, HelpCircle, Check } from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';

export default function InvestorAuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, currentInvestor } = useInvestorStore();

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(location.state?.error || '');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in and active, redirect to dashboard
  React.useEffect(() => {
    if (currentInvestor && currentInvestor.status === 'active' && currentInvestor.ndaSignedAt) {
      navigate('/investisseurs/dashboard', { replace: true });
    }
  }, [currentInvestor, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = login(code, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (result.ndaRequired) {
      navigate('/investisseurs/nda');
    } else {
      navigate('/investisseurs/dashboard');
    }
  };

  const handleQuickFill = (demoCode, demoPass) => {
    setCode(demoCode);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col justify-between selection:bg-amber-500 selection:text-gray-950">
      {/* Top Navbar */}
      <header className="border-b border-gray-800/80 bg-[#0c1220]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au site principal enr-courtage.fr</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-mono text-gray-400">Plateforme M&A Sécurisée</span>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 relative">
        {/* Glow ambient spots */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full relative z-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10 mb-4">
              <Lock className="w-7 h-7" />
            </div>

            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-block">
              Accès Restreint & Confidentiel
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Espace Investisseurs
            </h1>

            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              Cession de portefeuilles de droits de développement photovoltaïques (PV) et stockage par batteries (BESS).
            </p>
          </div>

          {/* Card */}
          <div className="bg-[#111827]/90 border border-gray-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Code Investisseur Personnel
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ex : HELIOS2026"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white font-mono text-sm uppercase placeholder-gray-600 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Mot de passe confidentiel
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Vérification des accréditations...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Accéder aux portefeuilles</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick test credentials box */}
            <div className="mt-6 pt-5 border-t border-gray-800">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Comptes de test pré-configurés :</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickFill('HELIOS2026', 'invest@enr!01')}
                  className="w-full text-left p-2 rounded-lg bg-gray-800/40 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition flex items-center justify-between"
                >
                  <span className="font-mono text-amber-400">HELIOS2026</span>
                  <span className="text-[10px] text-emerald-400">Actif (Accès direct)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('VOLTA2026', 'invest@enr!02')}
                  className="w-full text-left p-2 rounded-lg bg-gray-800/40 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition flex items-center justify-between"
                >
                  <span className="font-mono text-cyan-400">VOLTA2026</span>
                  <span className="text-[10px] text-amber-400">NDA Requis (À signer)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('DEMO2026', 'demo@enr!03')}
                  className="w-full text-left p-2 rounded-lg bg-gray-800/40 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition flex items-center justify-between"
                >
                  <span className="font-mono text-gray-300">DEMO2026</span>
                  <span className="text-[10px] text-emerald-400">Actif (Testeur)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contact notice */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Vous êtes investisseur et ne disposez pas d'identifiants ?</p>
            <p>
              Demandez un accès auprès de notre équipe M&A :{' '}
              <a href="mailto:contact@enr-courtage.fr" className="text-amber-400 hover:underline">
                contact@enr-courtage.fr
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-[#0c1220]/60 px-6 py-4 text-center text-[11px] text-gray-500">
        &copy; {new Date().getFullYear()} ENR Courtage — Plateforme Sécurisée de Cession d'Actifs ENR. Strictement Confidentiel.
      </footer>
    </div>
  );
}
