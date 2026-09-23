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
