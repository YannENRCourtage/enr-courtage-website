import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ShieldCheck, Mail, AlertCircle, ArrowLeft, UserPlus, FileSignature, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import RegisterNdaModal from './RegisterNdaModal';

export default function InvestorAuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, currentInvestor } = useInvestorStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(location.state?.error || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (currentInvestor && (currentInvestor.isAdmin || (currentInvestor.status === 'active' && currentInvestor.ndaSignedByAdmin))) {
      navigate('/investisseurs/dashboard', { replace: true });
    }
  }, [currentInvestor, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = login(email, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    navigate('/investisseurs/dashboard');
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

      {/* Main Container */}
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
              Cession de droits de développement photovoltaïques (PV) et stockage par batteries (BESS).
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[#111827]/95 border border-gray-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Adresse e-mail (Identifiant)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@societe.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400 transition font-sans"
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-900/90 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 transition"
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </form>

            {/* S'INSCRIRE / DEMANDER UN ACCÈS */}
            <div className="pt-4 border-t border-gray-800 text-center space-y-3">
              <div className="text-xs text-gray-400">
                Vous n'avez pas encore d'identifiants d'accès ?
              </div>

              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-amber-400 hover:text-amber-300 font-bold text-xs border border-gray-700 hover:border-amber-500/40 transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>S'inscrire & Signer le NDA bilatéral</span>
              </button>
            </div>
          </div>

          {/* Contact notice */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>
              Besoin d'assistance ? Contactez le pôle M&A :{' '}
              <a href="mailto:contact@enr-courtage.fr" className="text-amber-400 hover:underline">
                contact@enr-courtage.fr
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Registration & NDA Modal */}
      <RegisterNdaModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-[#0c1220]/60 px-6 py-4 text-center text-[11px] text-gray-500">
        &copy; {new Date().getFullYear()} ENR Courtage — Plateforme Sécurisée de Cession d'Actifs ENR. Strictement Confidentiel.
      </footer>
    </div>
  );
}
