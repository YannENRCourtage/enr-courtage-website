import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  ArrowLeft,
  FileSignature,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Mail,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import RegisterNdaModal from './RegisterNdaModal';
import EnrCourtageLogo from './EnrCourtageLogo';

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
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (currentInvestor && currentInvestor.status === 'active') {
      navigate('/investisseurs/dashboard', { replace: true });
    }
  }, [currentInvestor, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const formEmail = (formData.get('email') || email || '').toString().trim();
    const formPassword = (formData.get('password') || password || '').toString();

    if (!formEmail) {
      setError('Veuillez saisir votre adresse e-mail professionnelle.');
      setIsLoading(false);
      return;
    }

    if (!formPassword) {
      setError('Veuillez saisir votre mot de passe.');
      setIsLoading(false);
      return;
    }

    const result = login(formEmail, formPassword);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe.');
      return;
    }

    navigate('/investisseurs/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Barre supérieure de navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs flex items-center justify-between">
        <EnrCourtageLogo onClick={() => navigate('/')} />

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Retour au site</span>
          </button>
        </div>
      </header>

      {/* Contenu principal : Cadre Espace de Connexion centré */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-16 flex items-center justify-center">
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-sm flex flex-col justify-between">
          <div>
            {/* En-tête formulaire */}
            <div className="mb-6 pb-4 border-b border-slate-100 text-center sm:text-left">
              <h2 className="text-2xl font-black text-[#0b192c]">Espace de Connexion</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Saisissez vos identifiants pour accéder à votre espace
              </p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 leading-relaxed shadow-2xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Message mot de passe oublié */}
            {forgotPasswordNotice && (
              <div className="mb-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start justify-between gap-2.5 leading-relaxed">
                <div className="flex items-start gap-2">
                  <KeyRound className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                  <span>
                    Pour réinitialiser votre mot de passe, contactez la direction M&amp;A à : <strong>contact@enr-courtage.fr</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setForgotPasswordNotice(false)}
                  className="text-blue-500 hover:text-blue-800 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Formulaire interactif */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="investor-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Adresse e-mail professionnelle
                </label>
                <div className="relative">
                  <input
                    id="investor-email"
                    name="email"
                    type="email"
                    autoComplete="username email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@societe.com"
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors shadow-inner"
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="investor-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordNotice(true)}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="investor-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors shadow-inner font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isLoading ? 'Connexion en cours...' : 'Se connecter à l\'espace transactionnel'}</span>
              </button>
            </form>

            {/* Demande d'accès pour nouvel investisseur */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-medium">
                Vous n'avez pas encore d'accréditation signée ?
              </span>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(true)}
                className="w-full mt-2.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
              >
                <FileSignature className="w-3.5 h-3.5 text-slate-600" />
                <span>Demander un accès Data Room (Signature NDA)</span>
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400 font-medium mt-6">
            Besoin d'assistance ? Contactez le bureau M&amp;A : <strong className="text-slate-600">contact@enr-courtage.fr</strong>
          </p>
        </div>
      </main>

      {/* Footer institutionnel */}
      <footer className="border-t border-slate-200 bg-white px-4 sm:px-8 py-3 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div>
          <strong>ENR COURTAGE SAS</strong> • 7 Rue Gutenberg, 33700 Mérignac • RCS Bordeaux 881 500 552
        </div>
        <div className="text-[11px] text-slate-400">
          Plateforme M&A Sécurisée • Conforme Délibération CRE 2025-227 & TURPE 7
        </div>
      </footer>

      {/* Modale d'enregistrement & signature de NDA */}
      <RegisterNdaModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
}
