import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSignature, ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2, Lock, Building, User, Briefcase } from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { NDA_TEXT } from '@/data/investorData';

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
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col justify-between selection:bg-amber-500 selection:text-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800/80 bg-[#0c1220]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <button
          onClick={handleCancel}
          className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Annuler & Se déconnecter</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold">
          <Lock className="w-4 h-4" />
          <span>Étape obligatoire : Signature NDA</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Intro */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 mb-3">
            <FileSignature className="w-6 h-6" />
          </div>
          <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-block">
            Étape 02 • Processus M&A
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Accord de Confidentialité Bilatéral (NDA)
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto">
            L'accès aux données financières, techniques, foncières et à la Data Room des portefeuilles Hélios & Volta requiert la signature préalable de cet accord.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* NDA Text Box */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
            <span className="font-bold text-white uppercase tracking-wider">Texte de l'accord</span>
            <span className="text-[10px] font-mono">Droit français • Durée : 2 ans</span>
          </div>

          <div className="h-64 overflow-y-auto pr-3 text-xs text-gray-300 leading-relaxed font-sans space-y-3 bg-gray-900/60 p-4 rounded-xl border border-gray-800/80">
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
          className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5"
        >
          <div className="border-b border-gray-800 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Engagement du Signataire</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Renseignez vos coordonnées certifiées pour valider la signature électronique.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" /> Nom & Prénom *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-gray-400" /> Société / Fonds *
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-gray-400" /> Fonction / Qualité *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* Checkbox agreement */}
          <label className="flex items-start space-x-3 p-4 rounded-xl bg-gray-900/60 border border-gray-800 cursor-pointer hover:border-gray-700 transition">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-0.5 rounded border-gray-700 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs text-gray-300 leading-relaxed">
              Je certifie sur l'honneur avoir la pleine capacité et le pouvoir d'engager la société{' '}
              <strong className="text-white">{company || '[Société]'}</strong>. J'ai lu, compris et j'accepte sans réserve les termes et conditions de l'accord de confidentialité bilatéral ci-dessus.
            </span>
          </label>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-gray-500">
              Horodatage certifié : {new Date().toLocaleDateString('fr-FR')}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !hasAgreed}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-gray-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Signer et accéder à la Data Room</span>
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-[#0c1220]/60 px-6 py-4 text-center text-[11px] text-gray-500">
        &copy; {new Date().getFullYear()} ENR Courtage — Confidentialité garantie par accord bilatéral.
      </footer>
    </div>
  );
}
