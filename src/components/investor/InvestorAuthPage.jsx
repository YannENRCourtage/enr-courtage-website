import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  FileSignature,
  Eye,
  EyeOff,
  AlertCircle,
  FileText,
  TrendingUp,
  KeyRound,
  Mail,
  CheckCircle2,
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

  // If already authenticated, redirect to appropriate space
  useEffect(() => {
    if (currentInvestor) {
      if (currentInvestor.email?.trim().toLowerCase() === 'y.barberis@enr-courtage.fr') {
        navigate('/investisseurs/dashboard', { replace: true });
      } else if (currentInvestor.status === 'active' && currentInvestor.ndaSignedByAdmin) {
        navigate('/investisseurs/dashboard', { replace: true });
      }
    }
  }, [currentInvestor, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = login(email.trim(), password);
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

      {/* Contenu principal : 2 Colonnes équilibrées */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* =============================================================== */}
          {/* COLONNE GAUCHE : ARGUMENTAIRE TRANSACTIONNEL & CRÉDIBILITÉ M&A  */}
          {/* =============================================================== */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-60 h-60 bg-cyan-100/40 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  Plateforme Transactionnelle M&A
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Confidentiel
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0b192c] tracking-tight leading-tight">
                  Cession de Portefeuilles PV & Batteries BESS
                </h1>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mt-3">
                  Accédez aux data rooms exclusives, étudiez les modélisations financières certifiées sous le nouveau cadre <strong>TURPE 7</strong> et déposez vos offres d'acquisition fermes ou indicatives.
                </p>
              </div>

              {/* Atouts Transactionnels */}
              <div className="space-y-3.5 pt-2">
                {/* Atout 1 */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Teasers & Data Rooms Sécurisées
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                      Baux notariés 20-30 ans, études Enedis Caparéseau, permis et DP purgées de tout recours.
                    </p>
                  </div>
                </div>

                {/* Atout 2 */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Offres d'Achat en Ligne
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                      Offre globale ou par sélection de sites, échelonnement des paiements aux jalons RTB et closing.
                    </p>
                  </div>
                </div>

                {/* Atout 3 */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Accès Strictement Contrôlé sous NDA
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                      Accréditation préalable obligatoire avec horodatage cryptographique des consultations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium flex justify-between items-center">
              <span>ENR COURTAGE SAS • Infrastructure M&A</span>
              <span className="text-blue-600 font-bold">Chiffrement AES-256</span>
            </div>
          </div>

          {/* =============================================================== */}
          {/* COLONNE DROITE : FORMULAIRE D'AUTHENTIFICATION ÉPURÉ           */}
          {/* =============================================================== */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-sm flex flex-col justify-between">
            <div>
              {/* En-tête formulaire sans toggle */}
              <div className="mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-black text-[#0b192c]">Espace de Connexion</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
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
                      Pour réinitialiser votre mot de passe, contactez la direction M&A à : <strong>contact@enr-courtage.fr</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordNotice(false)}
                    className="text-blue-500 hover:text-blue-800 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Formulaire interactif */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Adresse e-mail professionnelle
                  </label>
                  <div className="relative">
                    <input
                      type="email"
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
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordNotice(true)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors shadow-inner font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
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
              Besoin d'assistance ? Contactez le bureau M&A : <strong className="text-slate-600">contact@enr-courtage.fr</strong>
            </p>
          </div>

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
