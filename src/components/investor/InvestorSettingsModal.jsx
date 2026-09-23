import React, { useState } from 'react';
import {
  X,
  Settings,
  Mail,
  MapPin,
  Check,
  FileSignature,
  ShieldCheck,
  Save,
  Download,
  Info,
  Lock,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';

export default function InvestorSettingsModal({ isOpen, onClose, onOpenNda }) {
  const { currentInvestor, updateCurrentInvestorProfile } = useInvestorStore();

  const [name, setName] = useState(currentInvestor?.name || '');
  const [company, setCompany] = useState(currentInvestor?.company || '');
  const [email, setEmail] = useState(currentInvestor?.email || '');
  const [phone, setPhone] = useState(currentInvestor?.phone || '');
  const [address, setAddress] = useState(currentInvestor?.address || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();

    if (updateCurrentInvestorProfile) {
      updateCurrentInvestorProfile({
        name,
        company,
        email,
        phone,
        address,
      });
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  // Exportation des données personnelles conformément à l'article 20 du RGPD (Portabilité des données)
  const handleExportData = () => {
    const exportPayload = {
      dateExportUtc: new Date().toISOString(),
      reglementation: "Conformité RGPD (Règlement UE 2016/679) — Droit à la portabilité des données (Art. 20)",
      responsableTraitement: "ENR COURTAGE SAS — 7 Rue Gutenberg, 33700 Mérignac",
      contactDpo: "contact@enr-courtage.fr",
      finaliteTraitement: "Instruction des transactions M&A de cession d'actifs ENR et exécution de l'accord de confidentialité (NDA)",
      dureeConservation: "Durée de validité du NDA (24 mois) ou de la relation contractuelle",
      profilInvestisseur: {
        id: currentInvestor?.id || '',
        nom: currentInvestor?.name || name,
        email: currentInvestor?.email || email,
        entreprise: currentInvestor?.company || company,
        role: currentInvestor?.role || 'Investisseur',
        telephone: currentInvestor?.phone || phone,
        adresse: currentInvestor?.address || address,
        statutCompte: currentInvestor?.status || 'active',
        dateCreation: currentInvestor?.createdAt || '',
      },
      accordConfidentialiteNda: {
        ndaSigneParInvestisseur: !!(currentInvestor?.userNdaSignedAt || currentInvestor?.ndaSignedAt),
        dateSignatureInvestisseur: currentInvestor?.userNdaSignedAt || currentInvestor?.ndaSignedAt || null,
        ndaContresigneParAdmin: !!currentInvestor?.ndaSignedByAdmin,
        dateContresignatureAdmin: currentInvestor?.ndaSignedByAdminAt || currentInvestor?.ndaSignedAt || null,
      },
      offresMnaDeposees: (useInvestorStore.getState().offers || []).filter(
        (o) =>
          o.investorEmail?.toLowerCase() === (currentInvestor?.email || email).toLowerCase() ||
          o.investorId === currentInvestor?.id
      ),
      telechargementsDataRoomEnregistres:
        useInvestorStore.getState().userDownloads?.[(currentInvestor?.email || email).toLowerCase()] || [],
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `donnees_personnelles_enr_courtage_${(currentInvestor?.name || 'investisseur').replace(/[\s\W]+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Paramètres & Profil Investisseur
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NDA Quick Access Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-emerald-950 whitespace-nowrap">
              Accord de Confidentialité (NDA) Bilatéral
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenNda) onOpenNda();
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
          >
            <FileSignature className="w-4 h-4" />
            <span>Consulter le NDA Signé</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* COORDONNÉES PERSONNELLES & ENTREPRISE */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>Coordonnées & Informations Contractuelles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Nom du représentant */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Nom & Prénom du Signataire
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean DUPONT"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>

              {/* Entreprise */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Raison Sociale de l'Entreprise
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="ENEE ENERGY PARTNERS"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>

              {/* Email professionnel */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Email Professionnel (Identifiant)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@investisseur.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>

              {/* Téléphone direct */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Numéro de Téléphone Direct
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Adresse postale */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1 text-xs">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Adresse Postale du Siège Social</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex : 12 Avenue des Champs-Élysées, 75008 Paris"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-xs focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* CONFORMITÉ RGPD & PROTECTION DES DONNÉES */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Conformité RGPD & Protection des Données Personnelles
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Conformément au Règlement Général sur la Protection des Données (RGPD - UE 2016/679), vos données d'identification,
                    coordonnées et interactions sur la Data Room sont collectées exclusivement pour l'exécution de l'Accord de Confidentialité (NDA)
                    et l'instruction des offres d'acquisition M&amp;A.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-semibold text-slate-700">Responsable de Traitement :</span>
                <span className="text-slate-500">ENR COURTAGE SAS (Bordeaux n° 881 500 552)</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-semibold text-slate-700">Délégué à la Protection (DPO) :</span>
                <a href="mailto:contact@enr-courtage.fr" className="text-blue-600 hover:underline font-medium">
                  contact@enr-courtage.fr
                </a>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-semibold text-slate-700">Durée de conservation :</span>
                <span className="text-slate-500">24 mois à compter de la signature du NDA</span>
              </div>
            </div>

            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">
                Droit à la portabilité (Art. 20 RGPD) :
              </span>
              <button
                type="button"
                onClick={handleExportData}
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Exporter mes données personnelles (JSON)</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isSaved}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-md cursor-pointer ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Modifications enregistrées !</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les paramètres</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
