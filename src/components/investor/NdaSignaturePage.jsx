import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSignature, ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2, Lock, Building, User, Briefcase } from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { NDA_TEXT } from '@/data/investorData';
import EnrCourtageLogo from './EnrCourtageLogo';

export default function NdaSignaturePage() {
  const navigate = useNavigate();
  const { currentInvestor, signNda, logout } = useInvestorStore();

  const [fullName, setFullName] = useState(currentInvestor?.name || '');
  const [company, setCompany] = useState(currentInvestor?.company || '');
  const [role, setRole] = useState('Directeur des Investissements');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!hasAgreed) {
      setError('Vous devez accepter les termes de l\'accord de confidentialité pour poursuivre.');
      return;
    }

    if (!fullName.trim() || !company.trim() || !role.trim()) {
      setError('Veuillez renseigner l\'ensemble des informations de signature.');
      return;
    }

    setIsSubmitting(true);

    const result = signNda({
      fullName,
      company,
      role,
    });

    setIsSubmitting(false);

    if (result.success) {
      navigate('/investisseurs/dashboard');
    } else {
      setError(result.error || 'Erreur lors de la signature.');
    }
  };

  const handleCancel = () => {
    logout();
    navigate('/investisseurs');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-6">
          <EnrCourtageLogo className="h-8" />
          <button
            onClick={handleCancel}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Annuler & Se déconnecter</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
          <Lock className="w-3.5 h-3.5 text-amber-600" />
          <span>Étape obligatoire : Signature NDA</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6 my-4">
        {/* Intro */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 mb-3 shadow-xs">
            <FileSignature className="w-6 h-6" />
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-amber-50 text-amber-800 border border-amber-200 inline-block">
            Étape 02 • Processus M&A
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Accord de Confidentialité Bilatéral (NDA)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
            L'accès aux données financières, techniques, foncières et à la Data Room des portefeuilles Hélios & Volta requiert la signature préalable de cet accord.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* NDA Text Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
            <span className="font-bold text-slate-900 uppercase tracking-wider">Texte de l'accord</span>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
              Droit français • Durée : 2 ans
            </span>
          </div>

          <div className="h-64 overflow-y-auto pr-3 text-xs text-slate-700 leading-relaxed font-sans space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
            {NDA_TEXT.trim()
              .split('\n\n')
              .map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
          </div>
        </div>

        {/* Signature Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
        >
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Engagement du Signataire</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Renseignez vos coordonnées certifiées pour valider la signature électronique.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Nom & Prénom *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Société / Fonds *
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Fonction / Qualité *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
              />
            </div>
          </div>

          {/* Checkbox agreement */}
          <label className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-slate-300 transition">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              Je certifie sur l'honneur avoir la pleine capacité et le pouvoir d'engager la société{' '}
              <strong className="text-slate-900">{company || '[Société]'}</strong>. J'ai lu, compris et j'accepte sans réserve les termes et conditions de l'accord de confidentialité bilatéral ci-dessus.
            </span>
          </label>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-500 font-mono">
              Horodatage certifié : {new Date().toLocaleDateString('fr-FR')}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !hasAgreed}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Signer et accéder à la Data Room</span>
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-[11px] text-slate-500">
        &copy; {new Date().getFullYear()} ENR COURTAGE — Confidentialité garantie par accord bilatéral.
      </footer>
    </div>
  );
}
