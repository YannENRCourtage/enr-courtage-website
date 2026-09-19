import React, { useState } from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Building, User, Mail, Phone, MapPin, AlertCircle, Send, FileSignature } from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { generateBilateralNdaText } from '@/data/investorData';

export default function RegisterNdaModal({ isOpen, onClose }) {
  const { registerRequest } = useInvestorStore();

  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [legalForm, setLegalForm] = useState('SAS');
  const [headOffice, setHeadOffice] = useState('');
  const [rcsNumber, setRcsNumber] = useState('');
  const [rcsCity, setRcsCity] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [representativeRole, setRepresentativeRole] = useState('Directeur des Investissements');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);

  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'preview'
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Live generated NDA text
  const currentNdaText = generateBilateralNdaText({
    companyName: companyName || '[Nom de votre Société]',
    legalForm: legalForm || '[Forme Juridique]',
    headOffice: headOffice || '[Adresse du siège social]',
    rcsNumber: rcsNumber || '[Numéro RCS]',
    rcsCity: rcsCity || '[Ville RCS]',
    representativeName: representativeName || '[Nom et Prénom du signataire]',
    representativeRole: representativeRole || '[Fonction]',
    dateStr: new Date().toLocaleDateString('fr-FR'),
    adminSigned: false,
    userSigned: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!hasAgreed) {
      setError('Vous devez accepter les termes de l\'accord de confidentialité pour poursuivre.');
      return;
    }

    if (!companyName.trim() || !headOffice.trim() || !representativeName.trim() || !email.trim()) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        companyName,
        legalForm,
        headOffice,
        rcsNumber: rcsNumber || 'En cours d\'immatriculation',
        rcsCity: rcsCity || 'Paris',
        representativeName,
        representativeRole,
        email,
        phone,
      };

      const result = registerRequest(formData);

      if (!result.success) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      // Notify admin via Formspree in background
      try {
        await fetch('https://formspree.io/f/mrblwazb', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            _subject: `[NOUVELLE DEMANDE ACCÈS INVESTISSEUR] ${companyName} - ${representativeName}`,
            societe: companyName,
            formeJuridique: legalForm,
            siegeSocial: headOffice,
            rcs: `${rcsNumber} (${rcsCity})`,
            representant: representativeName,
            fonction: representativeRole,
            email: email,
            telephone: phone,
            statutNda: 'Signé électroniquement par l\'investisseur - En attente de contre-signature admin',
            dateDemande: new Date().toLocaleString('fr-FR'),
          }),
        });
      } catch (err) {
        console.warn('Formspree notification notice:', err);
      }

      setIsSuccess(true);
    } catch (err) {
      setError('Une erreur est survenue lors de l\'enregistrement de votre demande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-slate-900">
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mb-2">
                Demande transmise avec succès
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Signature du NDA Enregistrée
              </h3>
              <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                Votre accord de confidentialité a été signé électroniquement et transmis à{' '}
                <strong className="text-slate-900">Monsieur Yann BARBERIS, Président d'ENR COURTAGE</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Société / Fonds :</span>
                <span className="text-slate-900 font-bold">{companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Signataire :</span>
                <span className="text-slate-800">{representativeName} ({representativeRole})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Identifiant de connexion :</span>
                <span className="text-amber-700 font-mono font-bold">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Statut :</span>
                <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">En attente de validation & contre-signature</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Dès validation et contre-signature du NDA par la présidence, vous recevrez par e-mail votre mot de passe temporaire pour vous connecter et accéder à l'intégralité des portefeuilles et de la Data Room.
            </p>

            <button
              onClick={handleResetAndClose}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Retour à l'écran de connexion
            </button>
          </div>
        ) : (
          /* Registration Form & NDA Viewer */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                <FileSignature className="w-4 h-4" />
                <span>Demande d'Accès & Accord de Confidentialité</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Inscription à l'Espace Investisseurs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Renseignez les informations légales de votre entité pour générer automatiquement le NDA bilatéral conforme.
              </p>
            </div>

            {/* Tab switch between Form and Live NDA text */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Renseignements juridiques
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>2. Prévisualiser le NDA ({companyName || 'Société'})</span>
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {activeTab === 'form' ? (
              <div className="space-y-4 text-xs">
                {/* Company info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Société / Fonds d'Investissement *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex : Meridiam, Omnes, Mirova..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Forme Juridique *
                    </label>
                    <input
                      type="text"
                      required
                      value={legalForm}
                      onChange={(e) => setLegalForm(e.target.value)}
                      placeholder="Ex : SAS, SARL, SA, Fonds..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
                    />
                  </div>
                </div>

                {/* Head Office */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Adresse du Siège Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={headOffice}
                    onChange={(e) => setHeadOffice(e.target.value)}
                    placeholder="Ex : 4 Place de l'Opéra, 75002 Paris"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
                  />
                </div>

                {/* RCS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Numéro RCS / SIREN *
                    </label>
                    <input
                      type="text"
                      required
                      value={rcsNumber}
                      onChange={(e) => setRcsNumber(e.target.value)}
                      placeholder="Ex : 812 345 678"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Ville du RCS *
                    </label>
                    <input
                      type="text"
                      required
                      value={rcsCity}
                      onChange={(e) => setRcsCity(e.target.value)}
                      placeholder="Ex : Paris, Bordeaux, Lyon..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
                    />
                  </div>
                </div>

                {/* Representative */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Nom & Prénom du Signataire *
                    </label>
                    <input
                      type="text"
                      required
                      value={representativeName}
                      onChange={(e) => setRepresentativeName(e.target.value)}
                      placeholder="Ex : Jean-Marc DUPONT"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Qualité / Fonction *
                    </label>
                    <input
                      type="text"
                      required
                      value={representativeRole}
                      onChange={(e) => setRepresentativeRole(e.target.value)}
                      placeholder="Ex : Directeur des Investissements, Président..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                      <span>E-mail professionnel (Identifiant) *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.email@societe.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Téléphone de contact
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 XX XX XX XX"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Live NDA Preview */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Texte généré automatiquement avec vos coordonnées :</span>
                  <span className="text-amber-800 font-mono font-semibold">Droit français • Tribunal de Commerce de Bordeaux</span>
                </div>
                <div className="h-64 overflow-y-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 font-sans space-y-3 leading-relaxed">
                  {currentNdaText.split('\n\n').map((para, idx) => (
                    <p key={idx} className="whitespace-pre-line">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Checkbox Agreement */}
            <label className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-slate-300 transition">
              <input
                type="checkbox"
                required
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                Je certifie avoir le pouvoir d'engager la société{' '}
                <strong className="text-slate-900">{companyName || "[Société]"}</strong>. J'ai pris connaissance de l'ensemble des clauses du présent accord de confidentialité bilatéral et je le signe électroniquement.
              </span>
            </label>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !hasAgreed}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Transmission...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Signer et transmettre la demande</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
