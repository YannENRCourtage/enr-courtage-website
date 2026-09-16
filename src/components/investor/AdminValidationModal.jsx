import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Copy,
  Mail,
  FileText,
  Building,
  User,
  Phone,
  Calendar,
  AlertCircle,
  ExternalLink,
  Upload,
  Plus,
  Trash2,
  Download,
  FolderLock,
  Sun,
  Battery,
  Coins,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Check,
  FileCode,
  Tag,
  Edit3,
  RotateCcw,
  Users,
  Eye,
  EyeOff,
  Search,
  KeyRound,
  Lock,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { useInvestorStore, generateRandomPassword } from '@/stores/useInvestorStore';
import { investorService } from '@/services/investorService';
import ExclusiveMandateModal from './ExclusiveMandateModal';
import ErrorBoundary from './ErrorBoundary';

// Helper to guarantee safe string rendering in JSX
function safeText(val, fallback = '') {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return fallback;
}

export default function AdminValidationModal({
  isOpen = true,
  onClose,
  isEmbedded = false,
  initialTab = 'requests',
  onTabChange = null,
}) {
  const {
    investors,
    adminValidateInvestor,
    adminRejectInvestor,
    adminAddUser,
    adminUpdateUser,
    adminDeleteUser,
    adminResetPassword,
    offers,
    updateOfferStatus,
    deleteOffer,
    adminAcceptOffer,
    adminRejectOffer,
    adminCounterOffer,
    signMandate,
    customDataRoom,
    addDocumentToDataRoom,
    deleteDocumentFromDataRoom,
  } = useInvestorStore();

  const [selectedInvestorForNda, setSelectedInvestorForNda] = useState(null);
  const [validatedData, setValidatedData] = useState(null); // { investor, password, emailSubject, emailBody }
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab || 'requests'); // 'requests' | 'offers' | 'dataroom' | 'users'

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // User Management State (Tab: users)
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all'); // 'all' | 'active' | 'pending' | 'rejected'
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    role: 'Investisseur',
    phone: '',
    isAdmin: false,
    status: 'active',
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editingUserData, setEditingUserData] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedUserAccessId, setCopiedUserAccessId] = useState(null);
  const [copiedPassId, setCopiedPassId] = useState(null);
  const [userActionNotice, setUserActionNotice] = useState('');

  // Negotiation & Mandate State
  const [counteringOfferId, setCounteringOfferId] = useState(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterComments, setCounterComments] = useState('');
  const [counterMilestones, setCounterMilestones] = useState([]);
  const [mandateModalOffer, setMandateModalOffer] = useState(null);

  // Data Room Management State
  const [selectedDataRoomPortfolio, setSelectedDataRoomPortfolio] = useState('helios');
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('Juridique');
  const [docType, setDocType] = useState('PDF');
  const [docSize, setDocSize] = useState('1.5 Mo');
  const [docNotes, setDocNotes] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Offer Filter State
  const [offerPortfolioFilter, setOfferPortfolioFilter] = useState('all');

  const portfolios = useMemo(() => investorService.getPortfolios(), []);
  const currentPortfolioObj = portfolios.find((p) => p.id === selectedDataRoomPortfolio);

  if (!isOpen && !isEmbedded) return null;

  const safeInvestors = Array.isArray(investors) ? investors : [];
  const safeOffers = Array.isArray(offers) ? offers : [];

  const pendingInvestors = safeInvestors.filter((inv) => inv && inv.status === 'pending');
  const activeInvestors = safeInvestors.filter((inv) => inv && inv.status === 'active' && !inv.isAdmin);

  // Filtered Offers
  const filteredOffers = safeOffers.filter((off) => {
    if (!off) return false;
    if (offerPortfolioFilter === 'all') return true;
    return off.portfolioId === offerPortfolioFilter;
  });

  // Filtered Users (Tab: users)
  const filteredUsers = useMemo(() => {
    return safeInvestors.filter((inv) => {
      if (!inv || typeof inv !== 'object') return false;
      if (userStatusFilter !== 'all' && inv.status !== userStatusFilter) {
        return false;
      }
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase().trim();
      return (
        safeText(inv.name).toLowerCase().includes(q) ||
        safeText(inv.email).toLowerCase().includes(q) ||
        safeText(inv.company).toLowerCase().includes(q) ||
        safeText(inv.role).toLowerCase().includes(q)
      );
    });
  }, [safeInvestors, userSearch, userStatusFilter]);

  // Create User Handler
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserData.email || !newUserData.name) {
      alert('Veuillez renseigner au moins le nom et l\'adresse e-mail.');
      return;
    }
    const pass = newUserData.password.trim() || generateRandomPassword();
    const res = adminAddUser({
      ...newUserData,
      password: pass,
    });
    if (!res.success) {
      alert(res.error || 'Erreur lors de la création.');
      return;
    }
    setIsAddUserModalOpen(false);
    setUserActionNotice(`Compte créé avec succès pour ${newUserData.name} (${newUserData.email}) ! Mot de passe : ${pass}`);
    setVisiblePasswords((prev) => ({ ...prev, [res.user.id]: true }));
    setNewUserData({
      name: '',
      company: '',
      email: '',
      password: '',
      role: 'Investisseur',
      phone: '',
      isAdmin: false,
      status: 'active',
    });
    setTimeout(() => setUserActionNotice(''), 6000);
  };

  // Save Edit User Handler
  const handleSaveEditUser = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    adminUpdateUser(editingUser.id, editingUserData);
    setUserActionNotice(`Modifications enregistrées pour ${editingUserData.name || editingUser.name}.`);
    setEditingUser(null);
    setTimeout(() => setUserActionNotice(''), 4000);
  };

  // Delete User Handler
  const handleDeleteUser = (user) => {
    if (user.email === 'y.barberis@enr-courtage.fr') {
      alert('Impossible de supprimer le compte administrateur principal.');
      return;
    }
    if (window.confirm(`Êtes-vous certain de vouloir supprimer définitivement le compte de ${user.name} (${user.email}) ?`)) {
      adminDeleteUser(user.id);
      setUserActionNotice(`Utilisateur ${user.name} supprimé avec succès.`);
      setTimeout(() => setUserActionNotice(''), 4000);
    }
  };

  // Reset User Password Handler
  const handleResetUserPassword = (user) => {
    const customPass = window.prompt(
      `Saisissez un nouveau mot de passe pour ${user.name} (ou laissez vide pour en générer un automatiquement) :`
    );
    if (customPass === null) return;
    const res = adminResetPassword(user.id, customPass.trim() || undefined);
    setUserActionNotice(`Nouveau mot de passe pour ${user.name} : ${res.password}`);
    setVisiblePasswords((prev) => ({ ...prev, [user.id]: true }));
    setTimeout(() => setUserActionNotice(''), 6000);
  };

  // Copy User Access Email Template
  const handleCopyUserAccessEmail = (user) => {
    const emailBody = `Bonjour ${user.name || ''},

Voici vos identifiants d'accès à l'Espace Investisseurs d'ENR Courtage :
- Lien de connexion : https://www.enr-courtage.fr/investisseurs
- Identifiant (e-mail) : ${user.email}
- Mot de passe confidentiel : ${user.password}

Vous pouvez dès à présent vous connecter pour accéder aux Teasers complets et aux Data Rooms des portefeuilles :
- Portefeuille HÉLIOS (PV 8.01 MWc fermes / 25 sites sécurisés)
- Portefeuille VOLTA (BESS 15.50 MW / 31 sites standardisés)

Bien cordialement,
Yann BARBERIS — ENR COURTAGE
y.barberis@enr-courtage.fr | 05 35 54 85 99`;

    navigator.clipboard.writeText(emailBody);
    setCopiedUserAccessId(user.id);
    setUserActionNotice(`E-mail d'accès pour ${user.name} copié dans le presse-papier !`);
    setTimeout(() => {
      setCopiedUserAccessId(null);
      setUserActionNotice('');
    }, 3000);
  };

  // KPI Offers
  const totalOffersValue = offers.reduce((sum, off) => sum + (off.amountEur || 0), 0);

  // Validate Investor
  const handleValidate = (inv) => {
    const randomPass = generateRandomPassword();
    const result = adminValidateInvestor(inv.id, randomPass);
    if (result.success) {
      setValidatedData(result);
    }
  };

  // Reject Investor
  const handleReject = (inv) => {
    if (window.confirm(`Êtes-vous sûr de vouloir refuser la demande de ${inv.company} (${inv.name}) ?`)) {
      adminRejectInvestor(inv.id);
    }
  };

  // Copy email
  const handleCopyEmail = () => {
    if (!validatedData) return;
    navigator.clipboard.writeText(validatedData.emailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Admin Negotiation Actions
  const handleOpenCounter = (offer) => {
    setCounteringOfferId(offer.id);
    setCounterAmount(String(offer.amountEur || ''));
    setCounterComments('');
    const baseMilestones = (offer.milestones && offer.milestones.length > 0)
      ? offer.milestones
      : [
          { id: 1, label: 'Jalon 1 — Signature Promesse (Upfront)', percentage: 30, targetCondition: 'Closing signature promesse & mise sous séquestre', targetDate: 'T4 2026' },
          { id: 2, label: 'Jalon 2 — Purge Urbanisme', percentage: 30, targetCondition: 'Attestation non-recours délivrée', targetDate: 'T1 2027' },
          { id: 3, label: 'Jalon 3 — Accord Enedis PTF', percentage: 20, targetCondition: 'Acceptation PTF', targetDate: 'T3 2027' },
          { id: 4, label: 'Jalon 4 — Ready to Build (RTB)', percentage: 20, targetCondition: 'Closing définitif & OS travaux', targetDate: 'T1 2028' },
        ];
    setCounterMilestones(baseMilestones.map((m) => ({ ...m })));
  };

  const handleSubmitCounter = (offerId) => {
    const num = Number(String(counterAmount).replace(/\s/g, '').replace(',', '.'));
    if (isNaN(num) || num <= 0) {
      alert('Veuillez renseigner un montant valide en euros hors taxes.');
      return;
    }
    const totalP = counterMilestones.reduce((s, m) => s + (Number(m.percentage) || 0), 0);
    if (totalP !== 100) {
      alert(`La somme des pourcentages des jalonnements doit être égale à 100% (actuellement : ${totalP}%).`);
      return;
    }
    const milestonesWithAmounts = counterMilestones.map((m) => ({
      ...m,
      percentage: Number(m.percentage),
      amount: Math.round((num * Number(m.percentage)) / 100),
    }));

    adminCounterOffer(offerId, {
      counterAmountEur: num,
      counterMilestones: milestonesWithAmounts,
      counterComments: counterComments,
    });
    setCounteringOfferId(null);
  };

  const handleAdminAccept = (offerId) => {
    if (window.confirm("Confirmez-vous l'acceptation définitive de cette proposition ? Les deux parties pourront procéder immédiatement à la signature du Mandat de Négociation Exclusive.")) {
      adminAcceptOffer(offerId);
    }
  };

  const handleAdminReject = (offerId) => {
    const reason = window.prompt("Indiquez un motif de refus à communiquer à l'investisseur (optionnel) :");
    if (reason !== null) {
      adminRejectOffer(offerId, reason);
    }
  };

  // Handle File Input Selection
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocName(file.name.replace(/\.[^/.]+$/, ''));
      const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      setDocType(ext);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setDocSize(`${sizeMb} Mo`);
    }
  };

  // Handle Document Upload
  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!docName.trim()) return;

    addDocumentToDataRoom(selectedDataRoomPortfolio, docCategory, {
      name: docName.trim(),
      type: docType,
      size: docSize || '1.0 Mo',
      notes: docNotes,
    });

    setUploadSuccessMsg(`Document « ${docName} » ajouté avec succès à la Data Room !`);
    setDocName('');
    setDocNotes('');
    setTimeout(() => setUploadSuccessMsg(''), 4000);
  };

  // Export Offers to CSV
  const handleExportOffersCsv = () => {
    if (offers.length === 0) return;

    const headers = [
      'ID Offre',
      'Societe',
      'Contact',
      'Email',
      'Portefeuille',
      'Type Offre',
      'Nb Sites',
      'Montant EUR HT',
      'Jalonnements',
      'Statut',
      'Date',
    ];

    const rows = offers.map((off) => {
      const milestonesStr = (off.milestones || [])
        .map((m) => `${m.label}: ${m.percentage}% (${m.amount} €)`)
        .join(' | ');

      return [
        `"${off.id}"`,
        `"${off.investorCompany}"`,
        `"${off.investorName}"`,
        `"${off.investorEmail}"`,
        `"${off.portfolioName}"`,
        `"${off.offerType === 'total' ? 'Totalité' : 'Partiel'}"`,
        off.selectedSitesCount,
        off.amountEur,
        `"${milestonesStr}"`,
        `"${off.status}"`,
        `"${new Date(off.createdAt).toLocaleDateString('fr-FR')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ENR_Courtage_Offres_Synthese_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ErrorBoundary onReset={onClose}>
      <div className={isEmbedded ? "w-full space-y-6" : "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"}>
        <div className={isEmbedded ? "bg-gray-900 border border-gray-800 rounded-2xl w-full p-5 sm:p-8 shadow-2xl relative space-y-6" : "bg-gray-900 border border-gray-800 rounded-2xl max-w-5xl w-full p-5 sm:p-8 shadow-2xl relative my-6"}>
          {isEmbedded ? (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-xs text-amber-400 hover:text-white px-3 py-1.5 rounded-lg border border-amber-500/30 hover:bg-gray-800 transition flex items-center gap-1.5"
            >
              <span>← Retour au tableau de bord</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                Espace Administrateur — Yann BARBERIS
              </span>
              <h3 className="text-xl font-black text-white">
                Supervision M&A, Data Room & Offres Investisseurs
              </h3>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-800/90 p-1 rounded-xl text-xs">
            <button
              onClick={() => {
                setValidatedData(null);
                setActiveTab('requests');
                if (onTabChange) onTabChange('requests');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Demandes Accès & NDA ({pendingInvestors.length})</span>
            </button>

            <button
              onClick={() => {
                setValidatedData(null);
                setActiveTab('offers');
                if (onTabChange) onTabChange('offers');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'offers'
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Synthèse des Offres ({offers.length})</span>
            </button>

            <button
              onClick={() => {
                setValidatedData(null);
                setActiveTab('dataroom');
                if (onTabChange) onTabChange('dataroom');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'dataroom'
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Charger Documents Data Room</span>
            </button>

            <button
              onClick={() => {
                setValidatedData(null);
                setActiveTab('users');
                if (onTabChange) onTabChange('users');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Gestion Utilisateurs & Mots de passe ({investors.length})</span>
            </button>
          </div>
        </div>

        {/* Screen: Validated Email Result */}
        {validatedData ? (
          <div className="space-y-4 bg-gray-800/40 border border-emerald-500/40 rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  Accès Validé & NDA Contre-signé pour {validatedData.investor.company}
                </span>
              </div>
              <span className="text-xs font-mono text-gray-400">
                Mot de passe généré : <strong className="text-amber-400">{validatedData.password}</strong>
              </span>
            </div>

            <p className="text-xs text-gray-300">
              Le NDA bilatéral a été estampillé de votre contre-signature (Yann BARBERIS). Transmettez le mail type ci-dessous à l'investisseur pour lui donner ses accès :
            </p>

            {/* Email preview */}
            <div className="relative">
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 font-mono text-xs text-gray-200 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto">
                <div className="text-gray-500 font-bold border-b border-gray-800 pb-2 mb-2">
                  Destinataire : {validatedData.investor.email}<br />
                  Objet : {validatedData.emailSubject}
                </div>
                {validatedData.emailBody}
              </div>

              <button
                onClick={handleCopyEmail}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm border border-gray-700"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>{copied ? 'Copié !' : 'Copier l\'e-mail'}</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <a
                href={`mailto:${validatedData.investor.email}?subject=${encodeURIComponent(
                  validatedData.emailSubject
                )}&body=${encodeURIComponent(validatedData.emailBody)}`}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Mail className="w-4 h-4" />
                <span>Ouvrir dans mon logiciel de messagerie</span>
              </a>

              <button
                onClick={() => setValidatedData(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold"
              >
                Retour à la liste des demandes
              </button>
            </div>
          </div>
        ) : activeTab === 'requests' ? (
          /* =============================================================== */
          /* TAB 1: PENDING REQUESTS & NDA                                   */
          /* =============================================================== */
          <div className="space-y-4">
            {pendingInvestors.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs bg-gray-800/20 rounded-xl border border-gray-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                <span>Aucune demande en attente de validation. Toutes les inscriptions ont été traitées.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingInvestors.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/80 hover:border-amber-500/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{safeText(inv.company, 'Société Partenaire')}</span>
                        {safeText(inv.legalForm) && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                            {safeText(inv.legalForm)}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          NDA signé par l'investisseur
                        </span>
                      </div>

                      <div className="text-xs text-gray-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {safeText(inv.name, 'Sans nom')} ({safeText(inv.role, 'Investisseur')})
                        </span>
                        <span className="flex items-center gap-1 font-mono text-amber-400">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {safeText(inv.email)}
                        </span>
                        {safeText(inv.phone) && (
                          <span className="flex items-center gap-1 text-gray-400">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {safeText(inv.phone)}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-gray-500">
                        Siège : {safeText(inv.headOffice, 'Non renseigné')} • RCS : {safeText(inv.rcsNumber, 'Non renseigné')} ({safeText(inv.rcsCity, 'France')})
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => setSelectedInvestorForNda(inv)}
                        className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-600 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Lire le NDA</span>
                      </button>

                      <button
                        onClick={() => handleValidate(inv)}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Valider & Contre-signer</span>
                      </button>

                      <button
                        onClick={() => handleReject(inv)}
                        className="px-2.5 py-2 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-700 text-xs transition"
                        title="Refuser la demande"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'offers' ? (
          /* =============================================================== */
          /* TAB 2: SYNTHÈSE DES OFFRES FINANCIÈRES & JALONNEMENTS           */
          /* =============================================================== */
          <div className="space-y-5">
            {/* KPI Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-800/60 p-3.5 rounded-xl border border-gray-700">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Total Offres Indicatives</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  {new Intl.NumberFormat('fr-FR').format(totalOffersValue)} € HT
                </div>
                <span className="text-[10px] text-gray-500">{offers.length} proposition(s) reçue(s)</span>
              </div>

              <div className="bg-gray-800/60 p-3.5 rounded-xl border border-gray-700">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Périmètres sollicités</span>
                <div className="text-sm font-bold text-white mt-1">
                  PV (HÉLIOS), BESS (VOLTA) & Combiné
                </div>
                <span className="text-[10px] text-amber-400">Ventilation par jalons de closing</span>
              </div>

              <div className="bg-gray-800/60 p-3.5 rounded-xl border border-gray-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Export Données</span>
                  <div className="text-xs text-gray-300 mt-0.5">Format tableur CSV</div>
                </div>
                <button
                  onClick={handleExportOffersCsv}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Exporter CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between bg-gray-800/40 p-2 rounded-xl border border-gray-800 text-xs">
              <span className="text-gray-400 font-semibold px-2">Filtrer par portefeuille :</span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setOfferPortfolioFilter('all')}
                  className={`px-3 py-1 rounded-lg transition ${
                    offerPortfolioFilter === 'all'
                      ? 'bg-amber-500 text-gray-950 font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Tous ({offers.length})
                </button>
                <button
                  onClick={() => setOfferPortfolioFilter('helios')}
                  className={`px-3 py-1 rounded-lg transition ${
                    offerPortfolioFilter === 'helios'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ☀️ HÉLIOS
                </button>
                <button
                  onClick={() => setOfferPortfolioFilter('volta')}
                  className={`px-3 py-1 rounded-lg transition ${
                    offerPortfolioFilter === 'volta'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🔋 VOLTA
                </button>
                <button
                  onClick={() => setOfferPortfolioFilter('both')}
                  className={`px-3 py-1 rounded-lg transition ${
                    offerPortfolioFilter === 'both'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ⚡ Combiné
                </button>
              </div>
            </div>

            {/* Offers Cards */}
            {filteredOffers.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs bg-gray-800/20 rounded-xl border border-gray-800">
                Aucune offre correspondant au filtre sélectionné.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-5 rounded-2xl bg-gray-800/60 border border-gray-700 text-xs space-y-3.5 shadow-lg"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-700/80 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-black text-white">{offer.investorCompany}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                            {offer.portfolioName}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-gray-700 text-gray-300 font-mono text-[10px]">
                            {offer.offerType === 'total'
                              ? `Totalité (${offer.selectedSitesCount} sites)`
                              : `Achat Partiel (${offer.selectedSitesCount} sites)`}
                          </span>
                        </div>

                        <div className="text-gray-400 text-[11px] flex flex-wrap items-center gap-3">
                          <span>
                            Représentant : <strong className="text-gray-200">{offer.investorName}</strong>
                          </span>
                          <span>• Email : <strong className="text-amber-400 font-mono">{offer.investorEmail}</strong></span>
                          {offer.investorPhone && <span>• Tél : {offer.investorPhone}</span>}
                          <span>• Déposée le : {new Date(offer.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                      </div>

                      {/* Montant */}
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 uppercase font-bold">Montant Global Proposé</div>
                        <div className="text-2xl font-black font-mono text-emerald-400">
                          {new Intl.NumberFormat('fr-FR').format(offer.amountEur)} € HT
                        </div>
                        {offer.valuationPerMw && (
                          <div className="text-[10px] text-gray-400 font-mono">{offer.valuationPerMw}</div>
                        )}
                      </div>
                    </div>

                    {/* TABLE DES MODALITÉS & JALONNEMENTS */}
                    <div className="bg-gray-900/80 p-3.5 rounded-xl border border-gray-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Modalités & Échéancier de Jalonnement des Paiements
                        </span>
                        <span className="font-mono text-gray-400">
                          Répartition : {offer.upfrontPercent || 30}% Upfront / {offer.earnoutPercent || 70}% Échéancé
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] text-gray-300">
                          <thead className="bg-gray-800/80 text-[10px] uppercase text-gray-400">
                            <tr>
                              <th className="py-2 px-3">Jalon d'Exécution</th>
                              <th className="py-2 px-3">Modalité / Événement Déclencheur</th>
                              <th className="py-2 px-3">Échéance Estimée</th>
                              <th className="py-2 px-3 text-right">Quote-part (%)</th>
                              <th className="py-2 px-3 text-right">Montant Exigible (€ HT)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {(offer.milestones && offer.milestones.length > 0
                              ? offer.milestones
                              : [
                                  { id: 1, label: 'Jalon 1 — Signature Promesse', percentage: 30, amount: Math.round(offer.amountEur * 0.3), targetCondition: 'Closing promesse', targetDate: 'T4 2026' },
                                  { id: 2, label: 'Jalon 2 — Purge Urbanisme', percentage: 30, amount: Math.round(offer.amountEur * 0.3), targetCondition: 'Purge des recours tiers', targetDate: 'T1 2027' },
                                  { id: 3, label: 'Jalon 3 — Accord Enedis PTF', percentage: 20, amount: Math.round(offer.amountEur * 0.2), targetCondition: 'Acceptation PTF', targetDate: 'T3 2027' },
                                  { id: 4, label: 'Jalon 4 — RTB Closing final', percentage: 20, amount: Math.round(offer.amountEur * 0.2), targetCondition: 'Ready to Build', targetDate: 'T1 2028' },
                                ]
                            ).map((m, mIdx) => (
                              <tr key={mIdx} className="hover:bg-gray-800/40">
                                <td className="py-2 px-3 font-semibold text-white">{m.label}</td>
                                <td className="py-2 px-3 text-gray-300">{m.targetCondition || 'Selon calendrier contractuel'}</td>
                                <td className="py-2 px-3 text-gray-400 font-mono">{m.targetDate || 'À fixer au closing'}</td>
                                <td className="py-2 px-3 text-right font-mono text-amber-400 font-bold">{m.percentage}%</td>
                                <td className="py-2 px-3 text-right font-mono text-emerald-400 font-bold">
                                  {new Intl.NumberFormat('fr-FR').format(m.amount)} €
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Conditions & Remarques */}
                    {offer.comments && (
                      <div className="bg-gray-900/50 p-2.5 rounded-lg border border-gray-800 text-[11px] text-gray-300">
                        <span className="font-bold text-gray-400 block mb-0.5">Remarques & Conditions de l'investisseur :</span>
                        <span>"{offer.comments}"</span>
                      </div>
                    )}

                    {/* ========================================================= */}
                    {/* ZONE DE NÉGOCIATION INTERACTIVE BILATÉRALE (YANN BARBERIS) */}
                    {/* ========================================================= */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-950 p-4 rounded-xl border border-gray-700/80 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold text-gray-400">Statut de la Négociation :</span>
                          {offer.status === 'submitted' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/40 animate-pulse">
                              ⏳ Offre initiale reçue — En attente de votre décision
                            </span>
                          )}
                          {offer.status === 'counter_by_admin' && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/40">
                              ⚡ Contre-proposition transmise ({new Intl.NumberFormat('fr-FR').format(offer.counterOffer?.amountEur || offer.amountEur)} €) — En attente investisseur
                            </span>
                          )}
                          {offer.status === 'counter_by_investor' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/40 animate-pulse">
                              🔄 Contre-proposition reçue de l'investisseur — À vous de jouer
                            </span>
                          )}
                          {offer.status === 'agreement_reached' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                              🤝 Accord mutuel trouvé — Mandat d'exclusivité à régulariser
                            </span>
                          )}
                          {offer.status === 'mandate_signed' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-300 font-black text-[10px] border border-emerald-400">
                              🏆 Mandat d'Exclusivité Signé par les deux parties (60 jours)
                            </span>
                          )}
                          {offer.status === 'rejected' && (
                            <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-bold text-[10px] border border-red-500/40">
                              ✕ Offre déclinée / refusée
                            </span>
                          )}
                        </div>

                        {/* Direct Mandate Button if agreement reached or signed */}
                        {(offer.status === 'agreement_reached' || offer.status === 'mandate_signed') && (
                          <button
                            onClick={() => setMandateModalOffer(offer)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                          >
                            <FileCheck className="w-4 h-4" />
                            <span>
                              {offer.status === 'mandate_signed'
                                ? 'Consulter le Mandat Signé (PDF)'
                                : 'Consulter & Signer le Mandat d\'Exclusivité'}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Bilateral Action Buttons for Yann BARBERIS */}
                      {(offer.status === 'submitted' || offer.status === 'counter_by_investor' || offer.status === 'counter_by_admin') && (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <button
                              onClick={() => handleAdminAccept(offer.id)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Accepter l'offre</span>
                            </button>

                            <button
                              onClick={() => handleOpenCounter(offer)}
                              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Faire une contre-proposition</span>
                            </button>

                            <button
                              onClick={() => handleAdminReject(offer.id)}
                              className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-gray-700 hover:border-red-500/40 text-xs font-semibold transition flex items-center gap-1.5"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Refuser</span>
                            </button>
                          </div>

                          <div className="text-[11px] text-gray-400 italic">
                            Aller-retours illimités jusqu'à accord parfait.
                          </div>
                        </div>
                      )}

                      {/* INLINE COUNTER-PROPOSAL FORM */}
                      {counteringOfferId === offer.id && (
                        <div className="p-4 rounded-xl bg-gray-800/80 border border-amber-500/40 space-y-4 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Edit3 className="w-3.5 h-3.5" /> Rédiger une contre-proposition — Yann BARBERIS
                            </span>
                            <button
                              onClick={() => setCounteringOfferId(null)}
                              className="text-gray-400 hover:text-white text-xs font-medium"
                            >
                              Annuler
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                                Nouveau Montant Global Proposé (€ HT)
                              </label>
                              <input
                                type="text"
                                value={counterAmount}
                                onChange={(e) => setCounterAmount(e.target.value)}
                                placeholder="ex: 4 000 000"
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                                Commentaire / Justification de la contre-proposition
                              </label>
                              <input
                                type="text"
                                value={counterComments}
                                onChange={(e) => setCounterComments(e.target.value)}
                                placeholder="ex: Réajustement compte tenu du stade de purge urbanistique..."
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                              />
                            </div>
                          </div>

                          {/* Adjust Milestones % */}
                          <div className="space-y-2">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Répartition des versements par jalon (Total exigé = 100%)
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                              {counterMilestones.map((m, idx) => (
                                <div key={idx} className="bg-gray-900/90 p-2 rounded-lg border border-gray-700 text-xs space-y-1">
                                  <div className="text-[10px] font-semibold text-gray-300 truncate">{m.label}</div>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={m.percentage}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setCounterMilestones((prev) =>
                                          prev.map((item, i) => (i === idx ? { ...item, percentage: val } : item))
                                        );
                                      }}
                                      className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-center text-amber-400 font-mono font-bold"
                                    />
                                    <span className="text-gray-400">%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-700">
                            <button
                              onClick={() => setCounteringOfferId(null)}
                              className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => handleSubmitCounter(offer.id)}
                              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-black transition shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Transmettre la contre-proposition à l'investisseur</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Admin Internal Notes & Delete */}
                      <div className="pt-2 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-gray-500">Note interne Yann BARBERIS :</span>
                          <input
                            type="text"
                            defaultValue={offer.adminNotes || ''}
                            onBlur={(e) => updateOfferStatus(offer.id, offer.status, e.target.value)}
                            placeholder="Note confidentielle..."
                            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-200 placeholder-gray-500 w-64 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <button
                          onClick={() => {
                            if (window.confirm('Supprimer définitivement cette offre ?')) {
                              deleteOffer(offer.id);
                            }
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Supprimer l'offre"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'dataroom' ? (
          /* =============================================================== */
          /* TAB 3: GESTIONNAIRE DE DOCUMENTS DATA ROOM PAR PORTEFEUILLE     */
          /* =============================================================== */
          <div className="space-y-6">
            {/* Portfolio Selector */}
            <div className="flex items-center justify-between bg-gray-800/60 p-3 rounded-2xl border border-gray-700">
              <div className="text-xs">
                <span className="text-gray-400 font-semibold block">Portefeuille cible pour la mise à disposition :</span>
                <span className="text-sm font-bold text-white">
                  {selectedDataRoomPortfolio === 'helios' ? '☀️ Projet HÉLIOS (Photovoltaïque)' : '🔋 Projet VOLTA (Batteries BESS)'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedDataRoomPortfolio('helios')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedDataRoomPortfolio === 'helios'
                      ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                      : 'bg-gray-800 text-gray-300 hover:text-white border border-gray-700'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Portefeuille HÉLIOS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDataRoomPortfolio('volta')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedDataRoomPortfolio === 'volta'
                      ? 'bg-cyan-500 text-gray-950 shadow-md shadow-cyan-500/20'
                      : 'bg-gray-800 text-gray-300 hover:text-white border border-gray-700'
                  }`}
                >
                  <Battery className="w-4 h-4" />
                  <span>Portefeuille VOLTA</span>
                </button>
              </div>
            </div>

            {/* Upload Notification */}
            {uploadSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            {/* Upload Form */}
            <form onSubmit={handleAddDocument} className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-700/80 pb-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase text-white">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Verser un nouveau document dans la Data Room</span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono">Accessible instantanément sous NDA</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* File picker */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Sélectionner un fichier depuis votre ordinateur
                  </label>
                  <input
                    type="file"
                    onChange={handleFileInputChange}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-800 file:text-amber-400 hover:file:bg-gray-700 cursor-pointer bg-gray-900/60 p-2 rounded-xl border border-gray-700"
                  />
                </div>

                {/* Doc Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Intitulé du document *
                  </label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="Ex: Promesse de bail emphytéotique Condom 256 kWc"
                    className="w-full px-3.5 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Juridique">⚖️ Juridique & Baux</option>
                    <option value="Technique">🔧 Technique & Plans</option>
                    <option value="Financier">📊 Financier & Business Plan</option>
                    <option value="Urbanisme">🗺️ Urbanisme & Permis</option>
                    <option value="Réseau">⚡ Réseau & Raccordement Enedis</option>
                    <option value="Fournisseur">🏷️ Accord Fournisseur / Équipement</option>
                  </select>
                </div>

                {/* Type & Size */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Format</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="PDF">PDF</option>
                    <option value="XLSX">XLSX (Excel)</option>
                    <option value="DOCX">DOCX (Word)</option>
                    <option value="ZIP">ZIP (Archive)</option>
                    <option value="DWG">DWG (Plan DAO)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Taille affichée</label>
                  <input
                    type="text"
                    value={docSize}
                    onChange={(e) => setDocSize(e.target.value)}
                    placeholder="Ex: 2.4 Mo"
                    className="w-full px-3.5 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Note de confidentialité</label>
                  <input
                    type="text"
                    value={docNotes}
                    onChange={(e) => setDocNotes(e.target.value)}
                    placeholder="Ex: Pièce certifiée sous NDA"
                    className="w-full px-3.5 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publier dans la Data Room du portefeuille</span>
                </button>
              </div>
            </form>

            {/* Existing Documents in Data Room for this portfolio */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-emerald-400" />
                <span>Inventaire des documents en ligne — {currentPortfolioObj?.name}</span>
              </h4>

              <div className="space-y-3">
                {/* Default Categories */}
                {currentPortfolioObj?.dataRoom?.categories?.map((cat, cIdx) => (
                  <div key={cIdx} className="bg-gray-800/50 border border-gray-800 rounded-xl p-3.5 space-y-2">
                    <div className="text-xs font-bold text-white flex items-center justify-between border-b border-gray-700/60 pb-1.5">
                      <span>📁 Section {cat.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {cat.files.length + (customDataRoom?.[selectedDataRoomPortfolio]?.[cat.name]?.length || 0)} document(s)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Default files */}
                      {cat.files.map((file, fIdx) => (
                        <div
                          key={`def-${fIdx}`}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-900/60 border border-gray-800 text-[11px]"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-gray-800 text-gray-400">
                              {file.type}
                            </span>
                            <span className="truncate text-gray-200 font-medium">{file.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono shrink-0 ml-2">{file.size}</span>
                        </div>
                      ))}

                      {/* Custom uploaded files for this category */}
                      {(customDataRoom?.[selectedDataRoomPortfolio]?.[cat.name] || []).map((file, fIdx) => (
                        <div
                          key={`cust-${fIdx}`}
                          className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-[11px]"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-emerald-500/20 text-emerald-300 font-bold">
                              {file.type}
                            </span>
                            <span className="truncate text-emerald-200 font-medium">{file.name}</span>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 ml-2">
                            <span className="text-[10px] text-gray-400 font-mono">{file.size}</span>
                            <button
                              onClick={() => deleteDocumentFromDataRoom(selectedDataRoomPortfolio, cat.name, file.id)}
                              className="text-gray-500 hover:text-red-400 p-0.5 transition"
                              title="Retirer le document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* =============================================================== */
          /* TAB 4: GESTION DES UTILISATEURS, IDENTIFIANTS & MOTS DE PASSE   */
          /* =============================================================== */
          <div className="space-y-5">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-800/60 p-4 rounded-2xl border border-gray-700">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    Gestion des Accès & Mots de Passe ({investors.length})
                  </h3>
                </div>
                <p className="text-xs text-gray-400">
                  Modifiez les mots de passe, créez de nouveaux investisseurs ou révoquez des accès à la plateforme.
                </p>
              </div>

              <button
                onClick={() => {
                  setNewUserData({
                    name: '',
                    company: '',
                    email: '',
                    password: generateRandomPassword(),
                    role: 'Investisseur',
                    phone: '',
                    isAdmin: false,
                    status: 'active',
                  });
                  setIsAddUserModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-gray-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Ajouter un Utilisateur</span>
              </button>
            </div>

            {/* Notification alert */}
            {userActionNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{userActionNotice}</span>
                </div>
                <button
                  onClick={() => setUserActionNotice('')}
                  className="text-emerald-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Rechercher par nom, société, e-mail..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-800/80 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-gray-800/60 p-1 rounded-xl border border-gray-700 text-xs">
                <button
                  onClick={() => setUserStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    userStatusFilter === 'all'
                      ? 'bg-amber-500 text-gray-950'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Tous ({investors.length})
                </button>
                <button
                  onClick={() => setUserStatusFilter('active')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    userStatusFilter === 'active'
                      ? 'bg-emerald-500 text-gray-950'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Actifs ({investors.filter((i) => i.status === 'active').length})
                </button>
                <button
                  onClick={() => setUserStatusFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    userStatusFilter === 'pending'
                      ? 'bg-amber-500 text-gray-950'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  En attente ({investors.filter((i) => i.status === 'pending').length})
                </button>
              </div>
            </div>

            {/* Users Cards List */}
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs bg-gray-800/20 rounded-xl border border-gray-800">
                Aucun utilisateur correspondant à votre recherche.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredUsers.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-xl bg-gray-800/60 border border-gray-700 text-xs space-y-3.5 shadow-lg hover:border-gray-600 transition"
                  >
                    {/* User Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-700/60 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center font-black text-amber-400 text-sm shadow-inner">
                          {safeText(inv.name) ? safeText(inv.name).charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-bold text-white flex flex-wrap items-center gap-2 text-sm">
                            <span>{safeText(inv.name, 'Sans nom')}</span>
                            <span className="text-gray-400 font-medium">({safeText(inv.company, 'Société non renseignée')})</span>
                            {inv.isAdmin && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                                ⭐ Administrateur
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {safeText(inv.role, 'Investisseur')} {safeText(inv.phone) ? `• Tél : ${safeText(inv.phone)}` : ''}
                            <span> • Créé le : {new Date(inv.createdAt || Date.now()).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {inv.status === 'active' && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accès Actif (NDA OK)
                          </span>
                        )}
                        {inv.status === 'pending' && (
                          <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> En attente de validation
                          </span>
                        )}
                        {(inv.status === 'rejected' || inv.status === 'suspended') && (
                          <span className="px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[11px] font-bold flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" /> Accès Désactivé
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Credentials Box (Visible & Modifiable) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-900/90 p-3.5 rounded-xl border border-gray-800">
                      {/* Email / Identifiant */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-amber-400" /> Identifiant de connexion (E-mail)
                        </span>
                        <div className="flex items-center justify-between bg-gray-950 px-3 py-2 rounded-lg border border-gray-800">
                          <span className="font-mono text-white text-xs select-all truncate">{safeText(inv.email)}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(safeText(inv.email));
                              setUserActionNotice(`Identifiant (${safeText(inv.email)}) copié !`);
                              setTimeout(() => setUserActionNotice(''), 3000);
                            }}
                            className="text-gray-400 hover:text-amber-400 ml-2 p-1 transition"
                            title="Copier l'identifiant"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Mot de passe */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-amber-400" /> Mot de passe confidentiel
                        </span>
                        <div className="flex items-center justify-between bg-gray-950 px-3 py-2 rounded-lg border border-gray-800">
                          <span className="font-mono text-amber-400 font-bold text-xs select-all">
                            {visiblePasswords[inv.id] ? safeText(inv.password, '(vide)') : '••••••••••••'}
                          </span>
                          <div className="flex items-center space-x-1.5 ml-2">
                            <button
                              onClick={() =>
                                setVisiblePasswords((prev) => ({
                                  ...prev,
                                  [inv.id]: !prev[inv.id],
                                }))
                              }
                              className="text-gray-400 hover:text-white p-1 transition"
                              title={visiblePasswords[inv.id] ? 'Masquer' : 'Afficher le mot de passe'}
                            >
                              {visiblePasswords[inv.id] ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(inv.password || '');
                                setCopiedPassId(inv.id);
                                setTimeout(() => setCopiedPassId(null), 2500);
                              }}
                              className="text-gray-400 hover:text-amber-400 p-1 transition"
                              title="Copier le mot de passe"
                            >
                              {copiedPassId === inv.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleResetUserPassword(inv)}
                              className="text-gray-400 hover:text-cyan-400 p-1 transition"
                              title="Régénérer / Réinitialiser le mot de passe"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                      <button
                        onClick={() => handleCopyUserAccessEmail(inv)}
                        className="px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-700 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>{copiedUserAccessId === inv.id ? '✓ E-mail type copié !' : 'Copier e-mail d\'accès type'}</span>
                      </button>

                      <div className="flex items-center space-x-2">
                        {inv.ndaText && (
                          <button
                            onClick={() => setSelectedInvestorForNda(inv)}
                            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-gray-700 text-xs font-semibold transition flex items-center gap-1.5"
                            title="Consulter le NDA bilatéral"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>NDA</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingUser(inv);
                            setEditingUserData({
                              name: inv.name || '',
                              company: inv.company || '',
                              email: inv.email || '',
                              password: inv.password || '',
                              role: inv.role || 'Investisseur',
                              phone: inv.phone || '',
                              status: inv.status || 'active',
                              isAdmin: !!inv.isAdmin,
                            });
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Modifier</span>
                        </button>

                        {inv.email !== 'y.barberis@enr-courtage.fr' && (
                          <button
                            onClick={() => handleDeleteUser(inv)}
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-700 transition"
                            title="Supprimer définitivement l'utilisateur"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* SUB-MODAL : AJOUTER UN NOUVEL UTILISATEUR                          */}
        {/* ================================================================= */}
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                  <UserPlus className="w-4 h-4" />
                  <span>Créer un Nouvel Accès Investisseur</span>
                </div>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Nom et Prénom du représentant *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    placeholder="ex: Jean DUPONT"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Société / Entité juridique *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.company}
                    onChange={(e) => setNewUserData({ ...newUserData, company: e.target.value })}
                    placeholder="ex: SOLAR INVEST PARTNERS"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Adresse E-mail (Identifiant) *</label>
                    <input
                      type="email"
                      required
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                      placeholder="invest@fonds.com"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={newUserData.phone}
                      onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                      placeholder="06 12 34 56 78"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Mot de passe avec générateur */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-gray-400 font-semibold">Mot de passe d'accès *</label>
                    <button
                      type="button"
                      onClick={() => setNewUserData({ ...newUserData, password: generateRandomPassword() })}
                      className="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Générer automatiquement
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="Mot de passe"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Fonction / Rôle</label>
                    <input
                      type="text"
                      value={newUserData.role}
                      onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                      placeholder="ex: Directeur des Investissements"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Statut initial</label>
                    <select
                      value={newUserData.status}
                      onChange={(e) => setNewUserData({ ...newUserData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-semibold focus:outline-none focus:border-amber-400"
                    >
                      <option value="active">Actif (Accès débloqué)</option>
                      <option value="pending">En attente de validation</option>
                      <option value="rejected">Désactivé</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="newIsAdmin"
                    checked={newUserData.isAdmin}
                    onChange={(e) => setNewUserData({ ...newUserData, isAdmin: e.target.checked })}
                    className="rounded border-gray-700 text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="newIsAdmin" className="text-gray-300 font-semibold text-xs cursor-pointer">
                    Accorder les privilèges d'administrateur (gestion M&A)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold transition shadow-lg shadow-amber-500/20"
                  >
                    Créer & Activer le Compte
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SUB-MODAL : MODIFIER UN UTILISATEUR EXISTANT                      */}
        {/* ================================================================= */}
        {editingUser && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                  <Edit3 className="w-4 h-4" />
                  <span>Modifier les Accès de {editingUser.name}</span>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditUser} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Nom et Prénom *</label>
                  <input
                    type="text"
                    required
                    value={editingUserData.name || ''}
                    onChange={(e) => setEditingUserData({ ...editingUserData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Société *</label>
                  <input
                    type="text"
                    required
                    value={editingUserData.company || ''}
                    onChange={(e) => setEditingUserData({ ...editingUserData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Adresse E-mail (Identifiant) *</label>
                    <input
                      type="email"
                      required
                      value={editingUserData.email || ''}
                      onChange={(e) => setEditingUserData({ ...editingUserData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={editingUserData.phone || ''}
                      onChange={(e) => setEditingUserData({ ...editingUserData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Mot de passe modifiable avec bouton génération */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-gray-400 font-semibold">Mot de passe d'accès *</label>
                    <button
                      type="button"
                      onClick={() => setEditingUserData({ ...editingUserData, password: generateRandomPassword() })}
                      className="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Générer un nouveau mot de passe
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editingUserData.password || ''}
                    onChange={(e) => setEditingUserData({ ...editingUserData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Fonction / Rôle</label>
                    <input
                      type="text"
                      value={editingUserData.role || ''}
                      onChange={(e) => setEditingUserData({ ...editingUserData, role: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Statut du compte</label>
                    <select
                      value={editingUserData.status || 'active'}
                      onChange={(e) => setEditingUserData({ ...editingUserData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-semibold focus:outline-none focus:border-amber-400"
                    >
                      <option value="active">Actif (Accès autorisé)</option>
                      <option value="pending">En attente de validation</option>
                      <option value="rejected">Désactivé / Bloqué</option>
                    </select>
                  </div>
                </div>

                {editingUser.email !== 'y.barberis@enr-courtage.fr' && (
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="editIsAdmin"
                      checked={!!editingUserData.isAdmin}
                      onChange={(e) => setEditingUserData({ ...editingUserData, isAdmin: e.target.checked })}
                      className="rounded border-gray-700 text-amber-500 focus:ring-0"
                    />
                    <label htmlFor="editIsAdmin" className="text-gray-300 font-semibold text-xs cursor-pointer">
                      Privilèges Administrateur M&A
                    </label>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold transition shadow-lg shadow-amber-500/20"
                  >
                    Enregistrer les Modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* NDA Reader Sub-modal */}
        {selectedInvestorForNda && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h4 className="font-bold text-white text-sm">
                  Accord de Confidentialité — {selectedInvestorForNda.company}
                </h4>
                <button
                  onClick={() => setSelectedInvestorForNda(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="h-96 overflow-y-auto p-4 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-300 font-sans space-y-3 whitespace-pre-line leading-relaxed">
                {selectedInvestorForNda.ndaText}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedInvestorForNda(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exclusive Mandate Modal for Admin (Yann BARBERIS) */}
        {mandateModalOffer && (
          <ExclusiveMandateModal
            offer={mandateModalOffer}
            isOpen={!!mandateModalOffer}
            onClose={() => setMandateModalOffer(null)}
          />
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
}
