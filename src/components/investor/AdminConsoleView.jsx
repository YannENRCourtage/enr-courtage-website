import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Mail,
  FileSignature,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Coins,
  Send,
  Upload,
  FolderPlus,
  FolderLock,
  Sun,
  Battery,
  FileText,
  Download,
  ArrowRightLeft,
  Calendar,
  Layers,
  MapPin,
  Check,
  FileSpreadsheet,
  KeyRound,
  Eye,
  EyeOff,
  Clock,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Building,
  User,
  Phone,
  FileCheck,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useInvestorStore, generateRandomPassword } from '@/stores/useInvestorStore';
import { investorService } from '@/services/investorService';
import { storeDocumentBinary } from '@/services/fileStorageService';
import { findMatchingServerDocument } from '@/services/dataRoomResolverService';
import { formatThousands, parseThousands, autoBalanceMilestones } from '@/utils/mnaUtils';
import NdaDocumentModal from './NdaDocumentModal';
import ExclusiveMandateModal from './ExclusiveMandateModal';
import TeaserSitesTable from './TeaserSitesTable';
import ErrorBoundary from './ErrorBoundary';

function safeText(val, fallback = '') {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return fallback;
}

export default function AdminConsoleView({ initialTab = 'users', initialChatEmail = '', onBackToDashboard }) {
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
    customDataRoom,
    addDocumentToDataRoom,
    addBatchDocumentsToDataRoom,
    deleteDocumentFromDataRoom,
    deleteDefaultDoc,
    deleteCategory,
    moveDocument,
    deletedDefaultDocs,
    documentSiteAssignments,
    assignDocumentToSites,
    userDownloads,
    messages,
    sendMessage,
  } = useInvestorStore();

  const [activeSection, setActiveSection] = useState(initialTab); // 'users' | 'offers' | 'dataroom' | 'messages'
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all'); // 'all' | 'active' | 'pending' | 'rejected'

  useEffect(() => {
    if (initialTab) {
      setActiveSection(initialTab);
    }
  }, [initialTab]);

  // Modals
  const [selectedInvestorForNda, setSelectedInvestorForNda] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingUserData, setEditingUserData] = useState({});
  const [selectedUserDownloadsModal, setSelectedUserDownloadsModal] = useState(null);
  const [mandateModalOffer, setMandateModalOffer] = useState(null);
  const [userActionNotice, setUserActionNotice] = useState('');

  // New user form state
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
  const [newNdaFile, setNewNdaFile] = useState(null);

  // Offers Negotiation State
  const [counteringOfferId, setCounteringOfferId] = useState(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterComments, setCounterComments] = useState('');
  const [counterMilestones, setCounterMilestones] = useState([]);
  const [offerPortfolioFilter, setOfferPortfolioFilter] = useState('all');

  // Data Room State
  const [selectedDataRoomPortfolio, setSelectedDataRoomPortfolio] = useState('helios');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Juridique');
  const [uploadTargetSite, setUploadTargetSite] = useState('ALL');
  const [uploadRawFile, setUploadRawFile] = useState(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Moving doc modal state
  const [movingDoc, setMovingDoc] = useState(null);
  const [targetMovePortfolio, setTargetMovePortfolio] = useState('volta');
  const [targetMoveCategory, setTargetMoveCategory] = useState('Juridique');

  // Assign doc modal state
  const [assigningDoc, setAssigningDoc] = useState(null);
  const [assigningSiteIds, setAssigningSiteIds] = useState([]);

  // Central Messaging State
  const [selectedChatEmail, setSelectedChatEmail] = useState(initialChatEmail || '');
  const [adminChatText, setAdminChatText] = useState('');

  useEffect(() => {
    if (initialChatEmail) {
      setSelectedChatEmail(initialChatEmail);
    }
  }, [initialChatEmail]);

  const portfolios = useMemo(() => investorService.getPortfolios(), []);
  const currentPortfolioObj = portfolios.find((p) => p.id === selectedDataRoomPortfolio);

  const safeInvestors = Array.isArray(investors) ? investors : [];
  const safeOffers = Array.isArray(offers) ? offers : [];
  const pendingInvestorsCount = safeInvestors.filter((i) => i && i.status === 'pending').length;
  const rejectedInvestorsCount = safeInvestors.filter((i) => i && i.status === 'rejected').length;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return safeInvestors.filter((inv) => {
      if (!inv || typeof inv !== 'object') return false;
      if (userStatusFilter !== 'all' && inv.status !== userStatusFilter) return false;
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase().trim();
      return (
        safeText(inv.name).toLowerCase().includes(q) ||
        safeText(inv.email).toLowerCase().includes(q) ||
        safeText(inv.company).toLowerCase().includes(q)
      );
    });
  }, [safeInvestors, userSearch, userStatusFilter]);

  // Filtered Offers
  const filteredOffers = useMemo(() => {
    return safeOffers.filter((off) => {
      if (!off) return false;
      if (offerPortfolioFilter === 'all') return true;
      return off.portfolioId === offerPortfolioFilter;
    });
  }, [safeOffers, offerPortfolioFilter]);

  // Handlers for user creation
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserData.email || !newUserData.name) {
      alert("Veuillez renseigner au moins le nom et l'adresse e-mail.");
      return;
    }
    const pass = newUserData.password.trim() || generateRandomPassword();
    let ndaDataUrl = '';
    const docId = 'nda_user_' + Date.now();

    if (newNdaFile) {
      try {
        await storeDocumentBinary(docId, newNdaFile, newNdaFile.name);
        if (newNdaFile.size <= 3.5 * 1024 * 1024) {
          ndaDataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(newNdaFile);
          });
        }
      } catch (err) {
        console.warn('Erreur stockage NDA:', err);
      }
    }

    const res = adminAddUser({
      ...newUserData,
      password: pass,
      ndaFileName: newNdaFile ? newNdaFile.name : '',
      ndaFileSize: newNdaFile ? newNdaFile.size : 0,
      ndaDocumentId: newNdaFile ? docId : '',
      ndaFileBase64: ndaDataUrl,
      hasUploadedSignedNda: !!newNdaFile,
      status: 'active',
    });

    if (res.success) {
      setIsAddUserModalOpen(false);
      setUserActionNotice(`Utilisateur ${newUserData.name} créé avec succès !`);
      setTimeout(() => setUserActionNotice(''), 4000);
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
      setNewNdaFile(null);
    } else {
      alert(res.error || 'Erreur lors de la création.');
    }
  };

  // Start counter-offer form
  const handleStartCounter = (offer) => {
    setCounteringOfferId(offer.id);
    setCounterAmount(formatThousands(offer.amountEur));
    setCounterComments(
      `Réajustement financier au vu du stade de sécurisation foncière des sites et du cadre d'optimisation TURPE 7.`
    );
    const initialMilestones =
      offer.milestones && offer.milestones.length > 0
        ? offer.milestones.map((m) => ({
            label: m.label,
            percentage: m.percentage,
            targetCondition: m.targetCondition,
            targetDate: m.targetDate,
          }))
        : [
            {
              label: 'Jalon 1 — Signature Promesse de Cession (Upfront)',
              percentage: 10,
              targetCondition: 'Closing signature promesse & séquestre notarié',
              targetDate: 'T4 2026',
            },
            {
              label: 'Jalon 2 — Obtention de la PTF / Accord Enedis',
              percentage: 90,
              targetCondition: 'Proposition Technique et Financière acceptée',
              targetDate: 'T3 2027',
            },
          ];
    setCounterMilestones(initialMilestones);
  };

  const handleSubmitCounter = (offerId) => {
    const num = parseThousands(counterAmount);
    if (isNaN(num) || num <= 0) {
      alert('Veuillez saisir un montant valide.');
      return;
    }
    const totalPct = counterMilestones.reduce((s, m) => s + (Number(m.percentage) || 0), 0);
    if (totalPct !== 100) {
      alert(`Le total des jalons doit faire exactement 100% (actuellement : ${totalPct}%).`);
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
    setUserActionNotice(`Contre-proposition de ${formatThousands(num)} € transmise avec succès.`);
    setTimeout(() => setUserActionNotice(''), 4000);
  };

  // Upload single doc to Data Room
  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!uploadDocName.trim()) {
      alert('Veuillez nommer le document.');
      return;
    }

    const docId = 'DOC-' + Date.now();
    const finalName = uploadDocName.trim();
    const ext = uploadRawFile ? uploadRawFile.name.split('.').pop()?.toUpperCase() || 'PDF' : 'PDF';
    const sizeMb = uploadRawFile ? (uploadRawFile.size / (1024 * 1024)).toFixed(1) : '1.2';

    if (uploadRawFile) {
      await storeDocumentBinary(docId, uploadRawFile, uploadRawFile.name);
      await storeDocumentBinary(finalName, uploadRawFile, uploadRawFile.name);
    }

    const assignedSites = uploadTargetSite === 'ALL' ? [] : [Number(uploadTargetSite)];

    addDocumentToDataRoom(selectedDataRoomPortfolio, uploadCategory, {
      id: docId,
      name: finalName,
      type: ext,
      size: `${Number(sizeMb) > 0 ? sizeMb : '0.1'} Mo`,
      siteIds: assignedSites,
      rawFile: uploadRawFile,
    });

    if (assignedSites.length > 0) {
      assignDocumentToSites(docId, assignedSites);
      assignDocumentToSites(finalName, assignedSites);
    }

    setIsUploadModalOpen(false);
    setUploadDocName('');
    setUploadRawFile(null);
    setUploadSuccessMsg(`Document « ${finalName} » ajouté avec succès à la Data Room.`);
    setTimeout(() => setUploadSuccessMsg(''), 4000);
  };

  // Conversation users & active chat
  const availableChatUsers = useMemo(() => {
    return safeInvestors.filter((u) => !u.isAdmin);
  }, [safeInvestors]);

  const activeChatEmail = selectedChatEmail || availableChatUsers[0]?.email || 'yannbarberis@msn.com';

  const activeChatUser = useMemo(() => {
    return safeInvestors.find((u) => (u.email || '').toLowerCase() === activeChatEmail.toLowerCase()) || null;
  }, [safeInvestors, activeChatEmail]);

  // Handle Admin Message Send
  const handleSendAdminMessage = (e) => {
    e.preventDefault();
    if (!adminChatText.trim()) return;

    sendMessage({
      from: 'admin',
      authorName: 'Yann BARBERIS',
      authorCompany: 'ENR COURTAGE',
      investorEmail: activeChatEmail,
      text: adminChatText.trim(),
    });

    setAdminChatText('');
  };

  const chatMessages = (messages || []).filter(
    (m) => !m.investorEmail || m.investorEmail.toLowerCase() === activeChatEmail.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* EN-TÊTE DE LA CONSOLE D'ADMINISTRATION M&A                           */}
      {/* =================================================================== */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
              Direction M&A • Espace d'Administration
            </span>
            <span className="text-xs text-slate-500 font-bold">Yann BARBERIS & Véro</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0b192c] tracking-tight">
            Console de Supervision des Cessions & Utilisateurs
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Pilotez les accréditations investisseurs, traitez les offres d'acquisition et alimentez les Data Rooms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ajouter un Investisseur</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer border border-slate-200"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Verser un document Data Room</span>
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {userActionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{userActionNotice}</span>
          </div>
          <button onClick={() => setUserActionNotice('')} className="text-emerald-600 hover:text-emerald-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {uploadSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-300 text-blue-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>{uploadSuccessMsg}</span>
          </div>
          <button onClick={() => setUploadSuccessMsg('')} className="text-blue-600 hover:text-blue-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* ONGLETS DE NAVIGATION LATÉRALE & CONTENU DE SUPERVISION             */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Panneau Latéral Admin */}
        <div className="lg:col-span-3 space-y-1.5 bg-white border border-slate-200 rounded-3xl p-3 shadow-sm h-fit text-xs font-bold">
          <button
            onClick={() => setActiveSection('users')}
            className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'users'
                ? 'bg-purple-50 text-purple-900 font-black border border-purple-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-700" />
              <span>Investisseurs & Accès</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-mono">
              {safeInvestors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('offers')}
            className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'offers'
                ? 'bg-purple-50 text-purple-900 font-black border border-purple-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Offres & Négociations</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono">
              {safeOffers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('dataroom')}
            className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'dataroom'
                ? 'bg-purple-50 text-purple-900 font-black border border-purple-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-blue-600" />
              <span>Gestion Data Room</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono">
              12 docs
            </span>
          </button>

          <button
            onClick={() => setActiveSection('messages')}
            className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'messages'
                ? 'bg-purple-50 text-purple-900 font-black border border-purple-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Messagerie Centrale</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-mono">
              {(messages || []).length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('projects')}
            className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'projects'
                ? 'bg-purple-50 text-purple-900 font-black border border-purple-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Gestion des Projets</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono">
              2 Portefeuilles
            </span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* CONTENU PRINCIPAL DE LA CONSOLE                                   */}
        {/* ================================================================= */}
        <div className="lg:col-span-9">
          {/* --------------------------------------------------------------- */}
          {/* SECTION 1 : GESTION DES UTILISATEURS & ACCÈS                    */}
          {/* --------------------------------------------------------------- */}
          {activeSection === 'users' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-[#0b192c] uppercase tracking-wider">
                    Investisseurs Accrédités & Droits d'Accès ({filteredUsers.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Consultez les NDA bilatéraux, gérez les identifiants et suivez les téléchargements Data Room.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Rechercher nom, société..."
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 w-56"
                    />
                  </div>

                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-700"
                  >
                    <option value="all">Tous statuts ({safeInvestors.length})</option>
                    <option value="active">Actifs uniquement</option>
                    <option value="pending">En attente ({pendingInvestorsCount})</option>
                    <option value="rejected">Refusés ({rejectedInvestorsCount})</option>
                  </select>
                </div>
              </div>

              {/* Table des utilisateurs (élargie & compacte) */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3.5 whitespace-nowrap">Investisseur</th>
                      <th className="py-2.5 px-3.5 whitespace-nowrap">Société & Contact</th>
                      <th className="py-2.5 px-3.5 whitespace-nowrap">E-mail</th>
                      <th className="py-2.5 px-3.5 text-center whitespace-nowrap">Statut Accès</th>
                      <th className="py-2.5 px-3.5 text-center whitespace-nowrap">NDA Bilatéral</th>
                      <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {filteredUsers.map((inv) => {
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Nom & Rôle */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                {safeText(inv.name) ? safeText(inv.name).charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="flex flex-col">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
                                  <span>{safeText(inv.name, 'Sans nom')}</span>
                                  {inv.isAdmin && (
                                    <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9px] font-bold">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 leading-tight">{safeText(inv.role, 'Investisseur')}</div>
                              </div>
                            </div>
                          </td>

                          {/* Société & Téléphone */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <div className="font-bold text-slate-900 leading-tight">{safeText(inv.company, '—')}</div>
                            {inv.phone && <div className="text-[10px] text-slate-400 font-mono leading-tight">{inv.phone}</div>}
                          </td>

                          {/* Email */}
                          <td className="py-2.5 px-3.5 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                            {safeText(inv.email)}
                          </td>

                          {/* Statut Accès */}
                          <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                            {inv.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Actif
                              </span>
                            ) : inv.status === 'pending' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                <Clock className="w-3 h-3" /> En attente
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <XCircle className="w-3 h-3 text-rose-600" /> Refusé
                              </span>
                            )}
                          </td>

                          {/* Statut NDA */}
                          <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                            {inv.ndaSignedAt || inv.hasUploadedSignedNda || inv.ndaFileName || inv.ndaSignedByAdmin ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600" /> Signé
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Non signé</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Voir NDA */}
                              <button
                                onClick={() => setSelectedInvestorForNda(inv)}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer border border-slate-200"
                                title="Consulter et imprimer le NDA bilatéral signé"
                              >
                                <FileSignature className="w-3 h-3 text-blue-600" />
                                <span>Voir NDA</span>
                              </button>

                              {/* Valider si en attente */}
                              {inv.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => {
                                      const pass = generateRandomPassword();
                                      adminValidateInvestor(inv.id, pass);
                                      setUserActionNotice(`Accès validé pour ${inv.company}. Mot de passe : ${pass}`);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                                    title="Valider la demande et contre-signer le NDA"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Valider</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      adminRejectInvestor(inv.id);
                                      setUserActionNotice(`Demande de ${inv.company} refusée (historique conservé).`);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition border border-rose-200 flex items-center gap-1 cursor-pointer"
                                    title="Refuser la demande sans supprimer le dossier"
                                  >
                                    <XCircle className="w-3 h-3 text-rose-600" />
                                    <span>Refuser</span>
                                  </button>
                                </>
                              )}

                              {/* Réactiver si refusé */}
                              {inv.status === 'rejected' && (
                                <button
                                  onClick={() => {
                                    const pass = generateRandomPassword();
                                    adminValidateInvestor(inv.id, pass);
                                    setUserActionNotice(`Accès validé et réactivé pour ${inv.company}. Mot de passe : ${pass}`);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                                  title="Réactiver et valider cet investisseur"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Réactiver</span>
                                </button>
                              )}

                              {/* Contacter par message */}
                              <button
                                onClick={() => {
                                  setSelectedChatEmail(inv.email);
                                  setActiveSection('messages');
                                }}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                                title="Ouvrir la conversation avec cet investisseur"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>

                              {/* Modifier */}
                              <button
                                onClick={() => {
                                  setEditingUser(inv);
                                  setEditingUserData({ ...inv });
                                }}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                                title="Modifier cet utilisateur"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Supprimer */}
                              {!inv.isAdmin && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Supprimer définitivement l'accès pour ${inv.name} (${inv.company}) ?`)) {
                                      adminDeleteUser(inv.id);
                                      setUserActionNotice(`Utilisateur ${inv.name} supprimé.`);
                                    }
                                  }}
                                  className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                                  title="Supprimer cet utilisateur"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* SECTION 2 : OFFRES REÇUES & DÉCISIONS                           */}
          {/* --------------------------------------------------------------- */}
          {activeSection === 'offers' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-[#0b192c] uppercase tracking-wider">
                    Offres d'Acquisition Reçues & Décisions ({filteredOffers.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Validez, refusez ou formulez une contre-proposition chiffrée avec ajustement des jalons.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setOfferPortfolioFilter('all')}
                    className={`px-3 py-1 rounded-lg transition ${
                      offerPortfolioFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Toutes
                  </button>
                  <button
                    onClick={() => setOfferPortfolioFilter('helios')}
                    className={`px-3 py-1 rounded-lg transition ${
                      offerPortfolioFilter === 'helios' ? 'bg-amber-100 text-amber-900 font-black' : 'text-slate-600'
                    }`}
                  >
                    HÉLIOS (PV)
                  </button>
                  <button
                    onClick={() => setOfferPortfolioFilter('volta')}
                    className={`px-3 py-1 rounded-lg transition ${
                      offerPortfolioFilter === 'volta' ? 'bg-cyan-100 text-cyan-900 font-black' : 'text-slate-600'
                    }`}
                  >
                    VOLTA (BESS)
                  </button>
                </div>
              </div>

              {filteredOffers.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  Aucune proposition reçue pour ce filtre.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOffers.map((offer) => {
                    const isCountering = counteringOfferId === offer.id;

                    return (
                      <div
                        key={offer.id}
                        className="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-amber-300 transition-all space-y-4 shadow-xs"
                      >
                        {/* Header de l'offre */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
                                {offer.status === 'agreement_reached'
                                  ? 'Accord Trouvé'
                                  : offer.status === 'counter_by_admin'
                                  ? 'Contre-proposition transmise'
                                  : offer.status === 'rejected'
                                  ? 'Refusée'
                                  : 'En attente de décision'}
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                Déposée par : <strong>{offer.investorName} ({offer.investorCompany})</strong>
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                • {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <h4 className="text-lg font-black text-[#0b192c] mt-1">
                              {offer.portfolioName}
                            </h4>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">
                              Montant Global Proposé
                            </span>
                            <span className="text-2xl font-black text-slate-900">
                              {formatThousands(offer.amountEur)} € HT
                            </span>
                          </div>
                        </div>

                        {/* Tableau des jalons */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/60">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                              <tr>
                                <th className="py-2 px-3">Jalon</th>
                                <th className="py-2 px-3">Condition déclenchante</th>
                                <th className="py-2 px-3">Échéance</th>
                                <th className="py-2 px-3 text-center">Part (%)</th>
                                <th className="py-2 px-3 text-right">Montant</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {(offer.milestones || []).map((m, idx) => (
                                <tr key={idx}>
                                  <td className="py-2 px-3 font-bold text-slate-900">{m.label}</td>
                                  <td className="py-2 px-3 text-slate-600 text-[11px]">{m.targetCondition || '—'}</td>
                                  <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{m.targetDate || '—'}</td>
                                  <td className="py-2 px-3 text-center font-bold text-blue-700">{m.percentage}%</td>
                                  <td className="py-2 px-3 text-right font-black text-slate-900">
                                    {formatThousands(m.amount)} €
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Formulaire de contre-proposition inline */}
                        {isCountering ? (
                          <div className="p-4 rounded-xl bg-amber-50/80 border-2 border-amber-300 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                                Formuler une contre-proposition chiffrée
                              </span>
                              <span className="text-xs font-mono font-bold text-emerald-700">
                                Total jalons : {counterMilestones.reduce((s, m) => s + (Number(m.percentage) || 0), 0)}%
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Nouveau Montant Global (€ HT)
                                </label>
                                <input
                                  type="text"
                                  value={counterAmount}
                                  onChange={(e) => setCounterAmount(formatThousands(e.target.value))}
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-black text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Commentaire / Justification
                                </label>
                                <input
                                  type="text"
                                  value={counterComments}
                                  onChange={(e) => setCounterComments(e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800"
                                />
                              </div>
                            </div>

                            {/* Jalons inputs auto-équilibrés */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                              {counterMilestones.map((m, idx) => (
                                <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                                  <div className="text-[10px] font-bold text-slate-700 truncate">{m.label}</div>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={m.percentage}
                                      onChange={(e) =>
                                        setCounterMilestones((prev) =>
                                          autoBalanceMilestones(prev, idx, e.target.value)
                                        )
                                      }
                                      className="w-16 px-2 py-1 rounded border border-slate-300 text-center font-bold text-blue-700"
                                    />
                                    <span className="text-slate-500">%</span>
                                    <span className="text-[10px] font-mono text-emerald-700 ml-auto font-bold">
                                      {formatThousands(
                                        Math.round((parseThousands(counterAmount) * (Number(m.percentage) || 0)) / 100)
                                      )} €
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                              <button
                                onClick={() => setCounteringOfferId(null)}
                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={() => handleSubmitCounter(offer.id)}
                                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm"
                              >
                                Transmettre la contre-proposition
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Boutons de décision */
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  if (window.confirm("Accepter définitivement cette offre ?")) {
                                    adminAcceptOffer(offer.id);
                                    setUserActionNotice(`Offre acceptée.`);
                                  }
                                }}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accepter</span>
                              </button>

                              <button
                                onClick={() => handleStartCounter(offer)}
                                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Contre-proposer</span>
                              </button>

                              <button
                                onClick={() => {
                                  const reason = window.prompt("Motif du refus (optionnel) :");
                                  if (reason !== null) {
                                    adminRejectOffer(offer.id, reason);
                                    setUserActionNotice(`Offre refusée.`);
                                  }
                                }}
                                className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 transition"
                              >
                                Refuser
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                if (window.confirm("Supprimer cette offre ?")) {
                                  deleteOffer(offer.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* SECTION 3 : GESTION DATA ROOM & DOCUMENTS                       */}
          {/* --------------------------------------------------------------- */}
          {activeSection === 'dataroom' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-[#0b192c] uppercase tracking-wider">
                    Documents Présents en Data Room
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Associez chaque fichier aux portefeuilles ou projets spécifiques et contrôlez la visibilité investisseurs.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setSelectedDataRoomPortfolio('helios')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        selectedDataRoomPortfolio === 'helios' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      ☀️ HÉLIOS (PV)
                    </button>
                    <button
                      onClick={() => setSelectedDataRoomPortfolio('volta')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        selectedDataRoomPortfolio === 'volta' ? 'bg-cyan-600 text-white font-black shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      🔋 VOLTA (BESS)
                    </button>
                  </div>

                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Ajouter un document</span>
                  </button>
                </div>
              </div>

              {/* Inventaire des catégories Data Room */}
              <div className="space-y-4">
                {(currentPortfolioObj?.dataRoom?.categories || []).map((cat) => {
                  const deletedForPortfolio = deletedDefaultDocs?.[selectedDataRoomPortfolio] || [];
                  const defaultFiles = (cat.files || []).filter((f) => !deletedForPortfolio.includes(f.name));
                  const customFiles = customDataRoom?.[selectedDataRoomPortfolio]?.[cat.name] || [];
                  const allFiles = [...defaultFiles, ...customFiles];

                  return (
                    <div key={cat.name} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                          {cat.name} ({allFiles.length} fichiers)
                        </span>
                      </div>

                      <div className="space-y-2">
                        {allFiles.map((file, fIdx) => (
                          <div
                            key={fIdx}
                            className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-blue-300 transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="px-2 py-1 bg-rose-50 text-rose-700 font-bold text-[10px] rounded">
                                {file.type || 'PDF'}
                              </span>
                              <div>
                                <div className="text-xs font-bold text-slate-900">{file.name}</div>
                                <div className="text-[10px] text-slate-400">
                                  {file.size || '1.2 Mo'} • {file.notes || 'Document probant vérifié'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  deleteDefaultDoc(selectedDataRoomPortfolio, file.name);
                                  deleteDocumentFromDataRoom(selectedDataRoomPortfolio, cat.name, file.id);
                                  setUserActionNotice(`Document « ${file.name} » retiré de la Data Room.`);
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 transition"
                                title="Supprimer de la Data Room"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* SECTION 4 : MESSAGERIE CENTRALE M&A                            */}
          {/* --------------------------------------------------------------- */}
          {activeSection === 'messages' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-[#0b192c] uppercase tracking-wider">
                    Messagerie Centrale M&A
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Échangez directement avec chaque investisseur en direct.
                  </p>
                </div>

                {/* Sélecteur de conversation investisseur */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Conversation avec :</span>
                  <select
                    value={activeChatEmail}
                    onChange={(e) => setSelectedChatEmail(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800"
                  >
                    {availableChatUsers.map((u) => (
                      <option key={u.id} value={u.email}>
                        {u.name} ({u.company})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bandeau d'information du contact actif */}
              {activeChatUser && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                      {safeText(activeChatUser.name).charAt(0).toUpperCase() || 'I'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        {safeText(activeChatUser.name)} • <span className="text-slate-600">{safeText(activeChatUser.company)}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {safeText(activeChatUser.email)} {activeChatUser.phone ? `• ${activeChatUser.phone}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                    Fil Direct Administrateur ↔ Investisseur
                  </span>
                </div>
              )}

              {/* Boîte de discussion */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col h-[420px]">
                <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-4 sm:pr-6">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Aucun message échangé pour l'instant avec cet investisseur.
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isAdminMsg = msg.from === 'admin';

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2.5 max-w-[78%] sm:max-w-[65%] ${
                            isAdminMsg ? 'ml-auto flex-row-reverse mr-2 sm:mr-3' : 'mr-auto'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg text-white font-bold text-[10px] flex items-center justify-center shrink-0 ${
                              isAdminMsg ? 'bg-purple-600' : 'bg-blue-600'
                            }`}
                          >
                            {isAdminMsg ? 'YB' : 'INV'}
                          </div>

                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isAdminMsg
                                ? 'bg-purple-600 text-white rounded-tr-none shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                            }`}
                          >
                            <div>{msg.text}</div>
                            <span
                              className={`text-[9px] block mt-1 ${
                                isAdminMsg ? 'text-purple-200' : 'text-slate-400'
                              }`}
                            >
                              {msg.authorName} • {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Saisie administrateur */}
                <form onSubmit={handleSendAdminMessage} className="pt-3 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    required
                    value={adminChatText}
                    onChange={(e) => setAdminChatText(e.target.value)}
                    placeholder={`Répondre en tant que Yann BARBERIS à ${activeChatEmail}...`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Envoyer</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* SECTION 5 : GESTION DES PROJETS & STATUTS DE VENTE              */}
          {/* --------------------------------------------------------------- */}
          {activeSection === 'projects' && (
            <div className="space-y-6">
              {/* Portefeuille HELIOS (PV) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <h3 className="text-base font-black text-[#0b192c]">
                      Portefeuille HÉLIOS — Solaire Toitures & Hangars (PV 9,12 MWc)
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Administration des projets unitaires
                  </span>
                </div>
                <TeaserSitesTable
                  sites={portfolios.find((p) => p.id === 'helios')?.sites || []}
                  portfolio={portfolios.find((p) => p.id === 'helios')}
                />
              </div>

              {/* Portefeuille VOLTA (BESS) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                    <h3 className="text-base font-black text-[#0b192c]">
                      Portefeuille VOLTA — Stockage Réseau Stand-Alone (BESS 15,50 MW)
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Administration des stations unitaires
                  </span>
                </div>
                <TeaserSitesTable
                  sites={portfolios.find((p) => p.id === 'volta')?.sites || []}
                  portfolio={portfolios.find((p) => p.id === 'volta')}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODALE : AJOUTER UN INVESTISSEUR (AVEC UPLOAD DE NDA SIGNÉ)         */}
      {/* =================================================================== */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-black text-[#0b192c]">Ajouter un Investisseur Qualifié</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    placeholder="ex: Jean DUS"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Société / Fonds *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.company}
                    onChange={(e) => setNewUserData({ ...newUserData, company: e.target.value })}
                    placeholder="ex: ENEE Energy Partners"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Adresse e-mail (Identifiant) *</label>
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="ex: j.dus@enee-energy.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mot de passe temporaire</label>
                  <input
                    type="text"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="Auto-généré si vide"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Upload NDA Signé */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                <span className="font-black text-purple-900 block">
                  Accord de Confidentialité (NDA) déjà signé :
                </span>
                <p className="text-[11px] text-slate-600">
                  Si l'investisseur a déjà régularisé un NDA papier ou scanné, vous pouvez charger le fichier PDF ici pour le rattacher directement à son compte.
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setNewNdaFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20"
                >
                  Créer le compte investisseur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODALE : VERSER UN DOCUMENT EN DATA ROOM                            */}
      {/* =================================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-black text-[#0b192c]">Verser un document en Data Room</h3>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Portefeuille de destination *</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="p-3 rounded-xl border-2 border-slate-200 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50/50 cursor-pointer text-center">
                    <input
                      type="radio"
                      name="destPort"
                      checked={selectedDataRoomPortfolio === 'helios'}
                      onChange={() => setSelectedDataRoomPortfolio('helios')}
                      className="sr-only"
                    />
                    <span className="font-bold text-slate-900 block">Projet HÉLIOS</span>
                    <span className="text-[10px] text-slate-400">Solaire PV 9,12 MWc</span>
                  </label>
                  <label className="p-3 rounded-xl border-2 border-slate-200 has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50/50 cursor-pointer text-center">
                    <input
                      type="radio"
                      name="destPort"
                      checked={selectedDataRoomPortfolio === 'volta'}
                      onChange={() => setSelectedDataRoomPortfolio('volta')}
                      className="sr-only"
                    />
                    <span className="font-bold text-slate-900 block">Projet VOLTA</span>
                    <span className="text-[10px] text-slate-400">Batteries 15,50 MW</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catégorie du document *</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                >
                  <option value="Juridique">Juridique (Baux notariés & statuts)</option>
                  <option value="Technique">Technique (Spécifications & études)</option>
                  <option value="Financier">Financier (Modélisations & BP)</option>
                  <option value="Urbanisme">Urbanisme (Autorisations & DP)</option>
                  <option value="Réseau">Réseau (Enedis & S3REnR)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre du document *</label>
                <input
                  type="text"
                  required
                  value={uploadDocName}
                  onChange={(e) => setUploadDocName(e.target.value)}
                  placeholder="ex: Promesse de bail notariée — Lot BESS 12"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fichier (PDF, XLSX, DOCX)</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setUploadRawFile(f);
                    if (f && !uploadDocName) {
                      setUploadDocName(f.name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  Publier en Data Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODALE CONSULTATION NDA PROTÉGÉE PAR ERROR BOUNDARY                */}
      {/* =================================================================== */}
      {selectedInvestorForNda && (
        <ErrorBoundary onReset={() => setSelectedInvestorForNda(null)}>
          <NdaDocumentModal
            isOpen={!!selectedInvestorForNda}
            investor={selectedInvestorForNda}
            onClose={() => setSelectedInvestorForNda(null)}
          />
        </ErrorBoundary>
      )}

      {/* Modale Mandat Exclusif */}
      {mandateModalOffer && (
        <ExclusiveMandateModal
          offer={mandateModalOffer}
          isOpen={!!mandateModalOffer}
          onClose={() => setMandateModalOffer(null)}
        />
      )}
    </div>
  );
}
