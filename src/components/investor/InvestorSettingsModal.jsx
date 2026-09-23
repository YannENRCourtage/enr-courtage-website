import React, { useState } from 'react';
import {
  X,
  Settings,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Upload,
  Check,
  FileSignature,
  ShieldCheck,
  Camera,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';

// Predefined avatar gallery matching CRM team & investor personas
const PREDEFINED_AVATARS = [
  {
    id: 'yann',
    name: 'Yann',
    role: 'Président / Dirigeant',
    bg: 'from-blue-600 to-indigo-800',
    initials: 'YB',
    iconColor: '#3b82f6',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
        <rect width="100" height="100" fill="#1e3a8a" />
        <circle cx="50" cy="38" r="20" fill="#fde047" opacity="0.9" />
        <path d="M50 20 C40 20 32 28 32 38 C32 40 48 34 68 38 C68 28 60 20 50 20 Z" fill="#451a03" />
        <circle cx="43" cy="36" r="2.5" fill="#1e293b" />
        <circle cx="57" cy="36" r="2.5" fill="#1e293b" />
        <path d="M46 46 Q50 50 54 46" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M20 95 C20 70 34 62 50 62 C66 62 80 70 80 95 Z" fill="#1e293b" />
        <polygon points="50,65 44,80 50,95 56,80" fill="#3b82f6" />
        <polygon points="50,65 47,72 53,72" fill="#ef4444" />
      </svg>
    ),
  },
  {
    id: 'vero',
    name: 'Véro',
    role: 'Direction des Opérations',
    bg: 'from-rose-500 to-pink-700',
    initials: 'VR',
    iconColor: '#ec4899',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
        <rect width="100" height="100" fill="#831843" />
        <circle cx="50" cy="40" r="19" fill="#fed7aa" />
        <path d="M28 42 C28 20 72 20 72 42 C72 55 68 62 65 65 C62 50 60 30 50 30 C40 30 38 50 35 65 C32 62 28 55 28 42 Z" fill="#7c2d12" />
        <circle cx="44" cy="40" r="2.5" fill="#1e293b" />
        <circle cx="56" cy="40" r="2.5" fill="#1e293b" />
        <path d="M45 49 Q50 54 55 49" stroke="#e11d48" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M22 95 C22 72 35 64 50 64 C65 64 78 72 78 95 Z" fill="#be185d" />
        <polygon points="50,66 40,95 60,95" fill="#fbcfe8" />
      </svg>
    ),
  },
  {
    id: 'laurent',
    name: 'Laurent',
    role: 'Expert Financement M&A',
    bg: 'from-amber-600 to-orange-800',
    initials: 'LT',
    iconColor: '#f59e0b',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
        <rect width="100" height="100" fill="#78350f" />
        <circle cx="50" cy="38" r="19" fill="#fde047" opacity="0.9" />
        <path d="M34 32 C34 22 66 22 66 32 C66 34 50 28 34 32 Z" fill="#475569" />
        <rect x="38" y="34" width="10" height="7" rx="2" fill="none" stroke="#0f172a" strokeWidth="1.5" />
        <rect x="52" y="34" width="10" height="7" rx="2" fill="none" stroke="#0f172a" strokeWidth="1.5" />
        <line x1="48" y1="37" x2="52" y2="37" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="43" cy="37" r="1.5" fill="#1e293b" />
        <circle cx="57" cy="37" r="1.5" fill="#1e293b" />
        <path d="M46 47 Q50 50 54 47" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M22 95 C22 72 35 63 50 63 C65 63 78 72 78 95 Z" fill="#0f172a" />
        <polygon points="50,64 45,78 50,95 55,78" fill="#d97706" />
      </svg>
    ),
  },
  {
    id: 'nicolas',
    name: 'Nicolas',
    role: 'Ingénieur Projets & Réseau',
    bg: 'from-cyan-600 to-teal-800',
    initials: 'NC',
    iconColor: '#06b6d4',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
        <rect width="100" height="100" fill="#134e4a" />
        <circle cx="50" cy="38" r="19" fill="#fde047" opacity="0.9" />
        <path d="M32 30 C32 20 68 20 68 30 C68 34 50 28 32 30 Z" fill="#1e293b" />
        <circle cx="43" cy="36" r="2" fill="#1e293b" />
        <circle cx="57" cy="36" r="2" fill="#1e293b" />
        <path d="M46 46 Q50 50 54 46" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M20 95 C20 72 34 63 50 63 C66 63 80 72 80 95 Z" fill="#042f2e" />
        <polygon points="50,64 42,95 58,95" fill="#f0fdfa" />
      </svg>
    ),
  },
  {
    id: 'alexandre',
    name: 'Alexandre',
    role: 'Fonds d\'Investissement',
    bg: 'from-indigo-600 to-purple-800',
    initials: 'AD',
    iconColor: '#6366f1',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
        <rect width="100" height="100" fill="#312e81" />
        <circle cx="50" cy="38" r="19" fill="#fed7aa" />
        <path d="M33 32 C33 22 67 22 67 32 C67 36 50 29 33 32 Z" fill="#334155" />
        <circle cx="43" cy="36" r="2" fill="#1e293b" />
        <circle cx="57" cy="36" r="2" fill="#1e293b" />
        <path d="M46 46 Q50 50 54 46" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M20 95 C20 70 34 63 50 63 C66 63 80 70 80 95 Z" fill="#1e1b4b" />
        <polygon points="50,64 46,78 50,95 54,78" fill="#a855f7" />
      </svg>
    ),
  },
  {
    id: 'sophie',
    name: 'Sophie',
    role: 'Direction Juridique M&A',
    bg: 'from-emerald-600 to-green-800',
    initials: 'SP',
    iconColor: '#10b981',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
        <rect width="100" height="100" fill="#064e3b" />
        <circle cx="50" cy="39" r="19" fill="#fed7aa" />
        <path d="M30 40 C30 20 70 20 70 40 C70 56 66 60 62 62 C58 50 56 32 50 32 C44 32 42 50 38 62 C34 60 30 56 30 40 Z" fill="#b45309" />
        <circle cx="44" cy="39" r="2" fill="#1e293b" />
        <circle cx="56" cy="39" r="2" fill="#1e293b" />
        <path d="M46 48 Q50 52 54 48" stroke="#be123c" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M22 95 C22 72 35 64 50 64 C65 64 78 72 78 95 Z" fill="#065f46" />
        <polygon points="50,65 42,95 58,95" fill="#ecfdf5" />
      </svg>
    ),
  },
];

export default function InvestorSettingsModal({
  isOpen = false,
  onClose = () => {},
  onOpenNda = () => {},
}) {
  const { currentInvestor, updateCurrentInvestorProfile } = useInvestorStore();

  const [email, setEmail] = useState(currentInvestor?.email || '');
  const [phone, setPhone] = useState(currentInvestor?.phone || '');
  const [address, setAddress] = useState(currentInvestor?.address || '');
  const [company, setCompany] = useState(currentInvestor?.company || '');
  const [name, setName] = useState(currentInvestor?.name || '');
  const [selectedAvatarId, setSelectedAvatarId] = useState(currentInvestor?.avatarId || 'yann');
  const [customLogoUrl, setCustomLogoUrl] = useState(currentInvestor?.logoUrl || null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  // Handle company logo file upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to Base64 data URL for local storage persistence
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomLogoUrl(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (updateCurrentInvestorProfile) {
      updateCurrentInvestorProfile({
        name,
        company,
        email,
        phone,
        address,
        avatarId: selectedAvatarId,
        logoUrl: customLogoUrl,
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
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
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
              <p className="text-xs text-slate-500 mt-0.5">
                Gérez vos informations de contact, votre avatar et votre accord de confidentialité
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NDA Quick Access Banner (Moved inside settings as requested) */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>Accord de Confidentialité (NDA) Bilatéral</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200 text-emerald-900">
                  Actif & Signé
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Contre-signé par Yann BARBERIS (Président ENR COURTAGE)
              </p>
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
          {/* 1. SÉLECTEUR D'AVATARS PRÉDÉFINIS (Style CRM) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                <span>Avatar du Profil (Galerie Personnalisée)</span>
              </label>
              <span className="text-[11px] text-slate-500">Sélectionnez votre visage</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {PREDEFINED_AVATARS.map((av) => {
                const isSelected = selectedAvatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatarId(av.id)}
                    className={`group relative p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center text-center cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-md scale-105'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm relative">
                      {av.svg}
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-900 mt-1.5">{av.name}</span>
                    <span className="text-[9px] text-slate-500 leading-tight truncate w-full mt-0.5">
                      {av.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. LOGO DE L'ENTREPRISE */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-purple-600" />
                <span>Logo de l'Entreprise Partenaire</span>
              </label>
              {customLogoUrl && (
                <button
                  type="button"
                  onClick={() => setCustomLogoUrl(null)}
                  className="text-[11px] text-red-600 hover:underline font-semibold"
                >
                  Supprimer le logo
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                {customLogoUrl ? (
                  <img src={customLogoUrl} alt="Logo Partenaire" className="w-full h-full object-contain p-1" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs transition cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-purple-600" />
                  <span>Téléverser un logo (PNG, JPG, SVG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format recommandé : PNG fond transparent, max 2 Mo
                </p>
              </div>
            </div>
          </div>

          {/* 3. COORDONNÉES PERSONNELLES & ENTREPRISE */}
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
              <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Adresse Postale du Siège Social</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex : 12 Avenue des Champs-Élysées, 75008 Paris"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
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
