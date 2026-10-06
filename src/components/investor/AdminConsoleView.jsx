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
  FileUp,
  Sparkles,
  RotateCcw,
  X,
  Loader2,
  Scale,
  Wrench,
  Calculator,
  Network,
} from 'lucide-react';
import { useInvestorStore, generateRandomPassword } from '@/stores/useInvestorStore';
import { investorService } from '@/services/investorService';
import { storeDocumentBinary, getDocumentBinary, downloadDocumentBinary } from '@/services/fileStorageService';
import { findMatchingServerDocument } from '@/services/dataRoomResolverService';
import { formatThousands, parseThousands, autoBalanceMilestones } from '@/utils/mnaUtils';
import { uploadDataRoomFileToFirebase } from '@/lib/firebase';
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
    adminUploadSignedNda,
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

  // Modals & User State
  const [selectedInvestorForNda, setSelectedInvestorForNda] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingUserData, setEditingUserData] = useState({});
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [selectedUserDownloadsModal, setSelectedUserDownloadsModal] = useState(null);
  const [mandateModalOffer, setMandateModalOffer] = useState(null);
  const [userActionNotice, setUserActionNotice] = useState('');

  // Upload NDA Modal State
  const [uploadNdaModalUser, setUploadNdaModalUser] = useState(null);
  const [uploadNdaFile, setUploadNdaFile] = useState(null);
  const [uploadNdaSignedDate, setUploadNdaSignedDate] = useState(new Date().toISOString().slice(0, 10));
  const [isUploadingNda, setIsUploadingNda] = useState(false);
  const [editUserNdaFile, setEditUserNdaFile] = useState(null);

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
  const [dataRoomSubTab, setDataRoomSubTab] = useState('juridique');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Juridique');
  const [uploadTargetSite, setUploadTargetSite] = useState('ALL');
  const [uploadRawFile, setUploadRawFile] = useState(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [isUploadingToFirebase, setIsUploadingToFirebase] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');

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
    if (initialTab) {
      setActiveSection(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialChatEmail) {
      setSelectedChatEmail(initialChatEmail);
    }
  }, [initialChatEmail]);

  // Fermer les modales avec la touche Échap (Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (uploadNdaModalUser) {
          setUploadNdaModalUser(null);
          setUploadNdaFile(null);
        } else if (editingUser) {
          setEditingUser(null);
          setEditUserNdaFile(null);
        } else if (isAddUserModalOpen) {
          setIsAddUserModalOpen(false);
          setNewNdaFile(null);
        } else if (isUploadModalOpen && !isUploadingToFirebase) {
          setIsUploadModalOpen(false);
          setUploadRawFile(null);
        } else if (selectedInvestorForNda) {
          setSelectedInvestorForNda(null);
        } else if (selectedUserDownloadsModal) {
          setSelectedUserDownloadsModal(null);
        } else if (mandateModalOffer) {
          setMandateModalOffer(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    uploadNdaModalUser,
    editingUser,
    isAddUserModalOpen,
    isUploadModalOpen,
    selectedInvestorForNda,
    selectedUserDownloadsModal,
    mandateModalOffer,
  ]);

  const handleDownloadNdaFile = async (inv) => {
    if (!inv) return;
    const candidates = [
      inv.ndaDocumentId,
      'nda_user_' + inv.id,
      inv.email ? 'nda_email_' + inv.email.toLowerCase() : null,
      inv.ndaFileName,
    ].filter(Boolean);

    for (const key of candidates) {
      try {
        const ok = await downloadDocumentBinary(key, inv.ndaFileName || 'NDA_Signe.pdf');
        if (ok) return;
      } catch (err) {
        // Continue to next candidate
      }
    }

    // Si le binaire n'a pas pu être téléchargé directement, ouvrir la modale
    setSelectedInvestorForNda(inv);
  };

  const handleSaveUploadNda = async (e) => {
    e.preventDefault();
    if (!uploadNdaModalUser) return;
    if (!uploadNdaFile) {
      alert("Veuillez sélectionner un fichier PDF de NDA signé.");
      return;
    }
    setIsUploadingNda(true);
    try {
      const docId = 'nda_user_' + uploadNdaModalUser.id;
      // Enregistrement direct dans IndexedDB et cache mémoire
      await storeDocumentBinary(docId, uploadNdaFile, uploadNdaFile.name);
      await storeDocumentBinary(uploadNdaFile.name, uploadNdaFile, uploadNdaFile.name);
      if (uploadNdaModalUser.email) {
        await storeDocumentBinary('nda_email_' + uploadNdaModalUser.email.toLowerCase(), uploadNdaFile, uploadNdaFile.name);
      }

      adminUploadSignedNda(uploadNdaModalUser.id, {
        fileName: uploadNdaFile.name,
        fileSize: uploadNdaFile.size,
        documentId: docId,
        userEmail: uploadNdaModalUser.email,
        fileBase64: '', // Stocké dans IndexedDB pour ne jamais saturer localStorage
        signedAt: uploadNdaSignedDate ? new Date(uploadNdaSignedDate).toISOString() : new Date().toISOString(),
      });

      setUserActionNotice(`Document « ${uploadNdaFile.name} » (${(uploadNdaFile.size / 1024).toFixed(0)} Ko) enregistré et rattaché avec succès à ${uploadNdaModalUser.name} (${uploadNdaModalUser.company}) !`);
      setTimeout(() => setUserActionNotice(''), 6000);
      setUploadNdaModalUser(null);
      setUploadNdaFile(null);
    } catch (err) {
      console.error("Erreur lors du chargement du NDA:", err);
      alert("Une erreur est survenue lors du chargement du fichier NDA : " + (err?.message || err));
    } finally {
      setIsUploadingNda(false);
    }
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editingUserData.email || !editingUserData.name) {
      alert("Veuillez renseigner le nom et l'adresse e-mail.");
      return;
    }

    let updatedPayload = { ...editingUserData };
    if (editUserNdaFile) {
      try {
        const docId = 'nda_user_' + editingUser.id;
        await storeDocumentBinary(docId, editUserNdaFile, editUserNdaFile.name);
        await storeDocumentBinary(editUserNdaFile.name, editUserNdaFile, editUserNdaFile.name);
        updatedPayload = {
          ...updatedPayload,
          hasUploadedSignedNda: true,
          ndaFileName: editUserNdaFile.name,
          ndaFileSize: editUserNdaFile.size,
          ndaDocumentId: docId,
          ndaFileBase64: '',
          ndaSignedAt: new Date().toISOString(),
          ndaSignedByAdmin: true,
          status: 'active',
        };
      } catch (err) {
        console.warn("Erreur stockage NDA:", err);
      }
    }

    const res = adminUpdateUser(editingUser.id, updatedPayload);
    if (res && res.success) {
      setEditingUser(null);
      setEditUserNdaFile(null);
      setUserActionNotice(`Utilisateur « ${editingUserData.name} » mis à jour avec succès.`);
      setTimeout(() => setUserActionNotice(''), 4000);
    } else {
      alert(res?.error || "Erreur lors de la mise à jour de l'utilisateur.");
    }
  };

  const portfolios = useMemo(() => investorService.getPortfolios(), []);
  const currentPortfolioObj = portfolios.find((p) => p.id === selectedDataRoomPortfolio);

  const safeInvestors = Array.isArray(investors) ? investors : [];
  const safeOffers = Array.isArray(offers) ? offers : [];
  const pendingInvestorsCount = safeInvestors.filter((i) => i && i.status === 'pending').length;
  const rejectedInvestorsCount = safeInvestors.filter((i) => i && i.status === 'rejected').length;

  // Catégories Data Room consolidées avec fichiers filtrés pour le portefeuille actif
  const dataRoomCategoriesWithFiles = useMemo(() => {
    const deletedForPortfolio = deletedDefaultDocs?.[selectedDataRoomPortfolio] || [];
    const baseCats = currentPortfolioObj?.dataRoom?.categories || [];

    const result = baseCats.map((cat) => {
      const defaultFiles = (cat.files || []).filter((f) => !deletedForPortfolio.includes(f.name));
      const customFiles = customDataRoom?.[selectedDataRoomPortfolio]?.[cat.name] || [];
      return {
        name: cat.name,
        icon: cat.icon,
        files: [...defaultFiles, ...customFiles],
      };
    });

    const customCats = customDataRoom?.[selectedDataRoomPortfolio] || {};
    Object.entries(customCats).forEach(([catName, files]) => {
      if (!result.some((c) => c.name.toLowerCase() === catName.toLowerCase()) && Array.isArray(files) && files.length > 0) {
        result.push({
          name: catName,
          icon: 'Folder',
          files,
        });
      }
    });

    return result;
  }, [currentPortfolioObj, deletedDefaultDocs, customDataRoom, selectedDataRoomPortfolio]);

  // Catégories filtrées selon le sous-onglet sélectionné
  const displayedCategories = useMemo(() => {
    if (dataRoomSubTab === 'nda') return [];
    if (dataRoomSubTab === 'juridique') {
      return dataRoomCategoriesWithFiles.filter((c) => c.name.toLowerCase().includes('juridique'));
    }
    if (dataRoomSubTab === 'technique') {
      return dataRoomCategoriesWithFiles.filter((c) => c.name.toLowerCase().includes('technique'));
    }
    if (dataRoomSubTab === 'financier') {
      return dataRoomCategoriesWithFiles.filter((c) => c.name.toLowerCase().includes('financier'));
    }
    if (dataRoomSubTab === 'reseau') {
      return dataRoomCategoriesWithFiles.filter((c) => {
        const lower = c.name.toLowerCase();
        return lower.includes('reseau') || lower.includes('réseau') || lower.includes('urbanisme');
      });
    }
    return dataRoomCategoriesWithFiles;
  }, [dataRoomCategoriesWithFiles, dataRoomSubTab]);

  // Compteurs de fichiers par sous-onglet
  const subTabCounts = useMemo(() => {
    const getCount = (filterFn) =>
      dataRoomCategoriesWithFiles
        .filter(filterFn)
        .reduce((sum, c) => sum + (c.files?.length || 0), 0);

    const juridCount = getCount((c) => c.name.toLowerCase().includes('juridique'));
    const techCount = getCount((c) => c.name.toLowerCase().includes('technique'));
    const finCount = getCount((c) => c.name.toLowerCase().includes('financier'));
    const resCount = getCount((c) => {
      const lower = c.name.toLowerCase();
      return lower.includes('reseau') || lower.includes('réseau') || lower.includes('urbanisme');
    });
    const ndaFilesCount = safeInvestors.filter((u) => u && u.ndaFileName).length;

    return {
      juridique: juridCount,
      technique: techCount,
      financier: finCount,
      reseau: resCount,
      nda: ndaFilesCount,
    };
  }, [dataRoomCategoriesWithFiles, safeInvestors]);

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
    const docId = 'nda_user_' + Date.now();

    if (newNdaFile) {
      try {
        await storeDocumentBinary(docId, newNdaFile, newNdaFile.name);
        await storeDocumentBinary(newNdaFile.name, newNdaFile, newNdaFile.name);
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
      ndaFileBase64: '',
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
    const mimeType = uploadRawFile?.type || (ext === 'PDF' ? 'application/pdf' : 'application/octet-stream');
    const sizeFormatted = uploadRawFile
      ? uploadRawFile.size >= 1024 * 1024
        ? `${(uploadRawFile.size / (1024 * 1024)).toFixed(1)} Mo`
        : `${(uploadRawFile.size / 1024).toFixed(0)} Ko`
      : '1.2 Mo';

    let downloadUrl = null;
    let storagePath = null;
    let fullPath = null;

    if (uploadRawFile) {
      setIsUploadingToFirebase(true);
      setUploadProgress(0);
      setUploadStatusText('Connexion à Firebase Storage...');

      try {
        const uploadResult = await uploadDataRoomFileToFirebase(uploadRawFile, {
          category: uploadCategory,
          portfolioId: selectedDataRoomPortfolio,
          customFileName: finalName,
          onProgress: (pct) => {
            setUploadProgress(pct);
            setUploadStatusText(`Téléversement vers Firebase Storage : ${pct}%`);
          },
        });

        downloadUrl = uploadResult.downloadUrl;
        storagePath = uploadResult.storagePath;
        fullPath = uploadResult.fullPath;
        setUploadStatusText('Document envoyé vers Firebase Storage avec succès !');
      } catch (fbErr) {
        console.warn('Erreur Firebase Storage (continuation en local):', fbErr);
      }

      // Enregistrement miroir local IndexedDB
      try {
        await storeDocumentBinary(docId, uploadRawFile, uploadRawFile.name);
        await storeDocumentBinary(finalName, uploadRawFile, uploadRawFile.name);
      } catch (idbErr) {
        console.warn('Erreur stockage binaire local:', idbErr);
      }
    }

    const assignedSites = uploadTargetSite === 'ALL' ? [] : [Number(uploadTargetSite)];

    const docPayload = {
      id: docId,
      name: finalName,
      type: ext,
      mimeType,
      size: sizeFormatted,
      fileSize: uploadRawFile?.size || 0,
      fileUrl: downloadUrl,
      storagePath,
      fullPath,
      category: uploadCategory,
      portfolioId: selectedDataRoomPortfolio,
      siteIds: assignedSites,
      rawFile: uploadRawFile,
      uploadedAt: new Date().toISOString(),
    };

    // Association au portefeuille : HÉLIOS, VOLTA ou Global (les deux portefeuilles)
    if (selectedDataRoomPortfolio === 'both' || selectedDataRoomPortfolio === 'global') {
      addDocumentToDataRoom('helios', uploadCategory, { ...docPayload, portfolioId: 'helios' });
      addDocumentToDataRoom('volta', uploadCategory, { ...docPayload, portfolioId: 'volta' });
    } else {
      addDocumentToDataRoom(selectedDataRoomPortfolio, uploadCategory, docPayload);
    }

    if (assignedSites.length > 0) {
      assignDocumentToSites(docId, assignedSites);
      assignDocumentToSites(finalName, assignedSites);
    }

    setIsUploadingToFirebase(false);
    setUploadProgress(0);
    setUploadStatusText('');
    setIsUploadModalOpen(false);
    setUploadDocName('');
    setUploadRawFile(null);
    setUploadSuccessMsg(`Document « ${finalName} » (${sizeFormatted}) versé avec succès dans la Data Room.`);
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
      {/* =================================================================== */}
      {/* ONGLETS DE NAVIGATION LATÉRALE & CONTENU DE SUPERVISION             */}
      {/* =================================================================== */}
      <div className="flex flex-col lg:flex-row gap-4 xl:gap-5 items-start">
        {/* Navigation Panneau Latéral Admin (Largeur compactée pour libérer l'espace tableau) */}
        <div className="w-full lg:w-56 shrink-0 space-y-1 bg-white border border-slate-200 rounded-3xl p-2.5 shadow-sm h-fit text-xs font-bold">
          <button
            onClick={() => setActiveSection('users')}
            className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'users'
                ? 'bg-purple-50 text-purple-900 font-black border border-purple-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <Users className="w-4 h-4 text-purple-700 shrink-0" />
              <span className="truncate">Investisseurs & Accès</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-mono shrink-0 ml-1">
              {safeInvestors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('offers')}
            className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'offers'
                ? 'bg-purple-50 text-purple-900 font-black border border-purple-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <Coins className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">Offres & Négociations</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono shrink-0 ml-1">
              {safeOffers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('dataroom')}
            className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'dataroom'
                ? 'bg-purple-50 text-purple-900 font-black border border-purple-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <FolderLock className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">Gestion Data Room</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono shrink-0 ml-1">
              12 docs
            </span>
          </button>

          <button
            onClick={() => setActiveSection('messages')}
            className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'messages'
                ? 'bg-purple-50 text-purple-900 font-black border border-purple-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">Messagerie Centrale</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-mono shrink-0 ml-1">
              {(messages || []).length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('projects')}
            className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'projects'
                ? 'bg-purple-50 text-purple-900 font-black border border-purple-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <Layers className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">Gestion des Projets</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono shrink-0 ml-1">
              2 Portef.
            </span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* CONTENU PRINCIPAL DE LA CONSOLE                                   */}
        {/* ================================================================= */}
        <div className="flex-1 min-w-0 w-full">
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

                          {/* Actions */}
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Charger NDA signé */}
                              <button
                                onClick={() => {
                                  setUploadNdaModalUser(inv);
                                  setUploadNdaFile(null);
                                }}
                                className="p-1.5 rounded-lg hover:bg-purple-100 bg-purple-50 text-purple-700 transition cursor-pointer border border-purple-200"
                                title="Charger ou mettre à jour le PDF du NDA signé"
                              >
                                <FileUp className="w-3.5 h-3.5" />
                              </button>

                              {/* Voir NDA */}
                              <button
                                onClick={() => setSelectedInvestorForNda(inv)}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer border border-slate-200"
                                title="Consulter et imprimer le NDA bilatéral signé"
                              >
                                <FileSignature className="w-3 h-3 text-blue-600" />
                                <span>Voir NDA</span>
                              </button>

                              {/* Télécharger directement le PDF signé si présent */}
                              {inv.ndaFileName && (
                                <button
                                  onClick={() => handleDownloadNdaFile(inv)}
                                  className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title={`Télécharger le PDF : ${inv.ndaFileName}`}
                                >
                                  <Download className="w-3 h-3" />
                                  <span>PDF</span>
                                </button>
                              )}

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
                            <span className="text-2xl font-black text-slate-900 block">
                              {formatThousands(offer.amountEur)} € HT
                            </span>
                            {offer.valuationPerMw && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                {offer.valuationPerMw}
                              </span>
                            )}
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
                    onClick={() => {
                      if (dataRoomSubTab === 'technique') setUploadCategory('Technique');
                      else if (dataRoomSubTab === 'financier') setUploadCategory('Financier');
                      else if (dataRoomSubTab === 'reseau') setUploadCategory('Réseau');
                      else setUploadCategory('Juridique');
                      setIsUploadModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Ajouter un document</span>
                  </button>
                </div>
              </div>

              {/* SOUS-ONGLETS DE NAVIGATION DATA ROOM : JURIDIQUE, TECHNIQUE, FINANCIER, RESEAU, NDA */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                  {/* 1. JURIDIQUE */}
                  <button
                    type="button"
                    onClick={() => setDataRoomSubTab('juridique')}
                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      dataRoomSubTab === 'juridique'
                        ? 'bg-white text-slate-900 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5 text-blue-600" />
                    <span>JURIDIQUE</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      dataRoomSubTab === 'juridique' ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {subTabCounts.juridique}
                    </span>
                  </button>

                  {/* 2. TECHNIQUE */}
                  <button
                    type="button"
                    onClick={() => setDataRoomSubTab('technique')}
                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      dataRoomSubTab === 'technique'
                        ? 'bg-white text-slate-900 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>TECHNIQUE</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      dataRoomSubTab === 'technique' ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {subTabCounts.technique}
                    </span>
                  </button>

                  {/* 3. FINANCIER */}
                  <button
                    type="button"
                    onClick={() => setDataRoomSubTab('financier')}
                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      dataRoomSubTab === 'financier'
                        ? 'bg-white text-slate-900 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                    <span>FINANCIER</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      dataRoomSubTab === 'financier' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {subTabCounts.financier}
                    </span>
                  </button>

                  {/* 4. RESEAU */}
                  <button
                    type="button"
                    onClick={() => setDataRoomSubTab('reseau')}
                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      dataRoomSubTab === 'reseau'
                        ? 'bg-white text-slate-900 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Network className="w-3.5 h-3.5 text-cyan-600" />
                    <span>RESEAU</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      dataRoomSubTab === 'reseau' ? 'bg-cyan-100 text-cyan-800 font-bold' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {subTabCounts.reseau}
                    </span>
                  </button>

                  {/* 5. NDA (en dernier à droite) */}
                  <button
                    type="button"
                    onClick={() => setDataRoomSubTab('nda')}
                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      dataRoomSubTab === 'nda'
                        ? 'bg-purple-600 text-white shadow-xs font-black'
                        : 'text-purple-700 hover:text-purple-900 hover:bg-purple-100/70'
                    }`}
                  >
                    <FileSignature className="w-3.5 h-3.5" />
                    <span>NDA</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      dataRoomSubTab === 'nda' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}>
                      {subTabCounts.nda}
                    </span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  {dataRoomSubTab === 'nda' ? (
                    <span className="text-purple-700 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                      Accords de Confidentialité signés par les investisseurs
                    </span>
                  ) : (
                    <span>
                      Dossier actif : <strong className="text-slate-800 uppercase">{dataRoomSubTab}</strong> • {selectedDataRoomPortfolio === 'volta' ? 'VOLTA (BESS)' : 'HÉLIOS (PV)'}
                    </span>
                  )}
                </div>
              </div>

              {/* CONTENU DU SOUS-ONGLET NDA */}
              {dataRoomSubTab === 'nda' && (() => {
                const usersWithFiles = safeInvestors.filter((u) => u && u.ndaFileName);
                if (usersWithFiles.length === 0) {
                  return (
                    <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2 animate-fadeIn">
                      <FolderLock className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="text-xs font-bold text-slate-700">Aucun Accord de Confidentialité déposé</div>
                      <div className="text-[11px] text-slate-500">Les NDA signés et téléversés par les investisseurs accrédités apparaîtront ici.</div>
                    </div>
                  );
                }
                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-slate-50 to-purple-50 border border-purple-200 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs uppercase tracking-wider text-purple-950 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                        Accords de Confidentialité (NDA) Signés Déposés ({usersWithFiles.length} fichiers)
                      </span>
                      <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                        Documents légaux investisseurs
                      </span>
                    </div>

                    <div className="space-y-2">
                      {usersWithFiles.map((u) => (
                        <div
                          key={u.id || u.email}
                          className="p-3 bg-white border border-purple-100 hover:border-purple-300 rounded-xl shadow-2xs flex flex-wrap items-center justify-between gap-3 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-black text-xs">
                              PDF
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-xs text-slate-900 truncate">
                                {u.ndaFileName}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                Signataire : <strong>{u.name}</strong> ({u.company}) {u.ndaFileSize ? `• ${(u.ndaFileSize / 1024).toFixed(0)} Ko` : ''}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDownloadNdaFile(u)}
                              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                              title={`Télécharger : ${u.ndaFileName}`}
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Télécharger</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedInvestorForNda(u)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                              title="Consulter le document"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>Consulter</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* CONTENU DES SOUS-ONGLETS JURIDIQUE, TECHNIQUE, FINANCIER, RESEAU */}
              {dataRoomSubTab !== 'nda' && (
                <div className="space-y-4 animate-fadeIn">
                  {displayedCategories.map((cat) => (
                    <div key={cat.name} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                          {cat.name} ({cat.files.length} fichiers)
                        </span>
                      </div>

                      {cat.files.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl text-xs">
                          Aucun document disponible dans ce dossier pour {selectedDataRoomPortfolio === 'volta' ? 'VOLTA' : 'HÉLIOS'}.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cat.files.map((file, fIdx) => (
                            <div
                              key={fIdx}
                              className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-blue-300 transition"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`px-2 py-1 font-bold text-[10px] rounded shrink-0 ${
                                  (file.type || '').toUpperCase() === 'XLSX' || (file.type || '').toUpperCase() === 'XLS'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {file.type || 'PDF'}
                                </span>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 truncate">{file.name}</div>
                                  <div className="text-[10px] text-slate-400">
                                    {file.size || '1.2 Mo'} • {file.notes || 'Document probant vérifié'}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {file.fileUrl && (
                                  <a
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-slate-400 hover:text-blue-600 transition"
                                    title="Ouvrir le document"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  onClick={() => {
                                    deleteDefaultDoc(selectedDataRoomPortfolio, file.name);
                                    deleteDocumentFromDataRoom(selectedDataRoomPortfolio, cat.name, file.id);
                                    setUserActionNotice(`Document « ${file.name} » retiré de la Data Room.`);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                                  title="Supprimer de la Data Room"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {displayedCategories.length === 0 && (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                      <FolderLock className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="text-xs font-bold text-slate-700">Aucun dossier disponible dans cette section</div>
                      <div className="text-[11px] text-slate-500">Cliquez sur « + Ajouter un document » pour verser un fichier dans cette catégorie.</div>
                    </div>
                  )}
                </div>
              )}
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
                      Portefeuille HÉLIOS — Solaire Toitures & Hangars (PV 6.24 MWc)
                    </h3>
                  </div>
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
                      Portefeuille VOLTA — Stockage Réseau Stand-Alone (BESS 14,50 MW)
                    </h3>
                  </div>
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
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddUserModalOpen(false);
              setNewNdaFile(null);
            }
          }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-black text-[#0b192c]">Ajouter un Investisseur Qualifié</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddUserModalOpen(false);
                  setNewNdaFile(null);
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                title="Fermer (Échap)"
                aria-label="Fermer la fenêtre"
              >
                <X className="w-5 h-5" />
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
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isUploadingToFirebase) {
              setIsUploadModalOpen(false);
              setUploadRawFile(null);
            }
          }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-black text-[#0b192c]">Verser un document en Data Room</h3>
              </div>
              <button 
                type="button"
                disabled={isUploadingToFirebase}
                onClick={() => {
                  if (isUploadingToFirebase) return;
                  setIsUploadModalOpen(false);
                  setUploadRawFile(null);
                }} 
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer disabled:opacity-40"
                title="Fermer (Échap)"
                aria-label="Fermer la fenêtre"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Portefeuille de destination *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="p-3 rounded-xl border-2 border-slate-200 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50/50 cursor-pointer text-center">
                    <input
                      type="radio"
                      name="destPort"
                      disabled={isUploadingToFirebase}
                      checked={selectedDataRoomPortfolio === 'helios'}
                      onChange={() => setSelectedDataRoomPortfolio('helios')}
                      className="sr-only"
                    />
                    <span className="font-bold text-slate-900 block text-xs">Projet HÉLIOS</span>
                    <span className="text-[10px] text-slate-400">PV 6.24 MWc</span>
                  </label>
                  <label className="p-3 rounded-xl border-2 border-slate-200 has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50/50 cursor-pointer text-center">
                    <input
                      type="radio"
                      name="destPort"
                      disabled={isUploadingToFirebase}
                      checked={selectedDataRoomPortfolio === 'volta'}
                      onChange={() => setSelectedDataRoomPortfolio('volta')}
                      className="sr-only"
                    />
                    <span className="font-bold text-slate-900 block text-xs">Projet VOLTA</span>
                    <span className="text-[10px] text-slate-400">BESS 14,5 MW</span>
                  </label>
                  <label className="p-3 rounded-xl border-2 border-slate-200 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50/50 cursor-pointer text-center">
                    <input
                      type="radio"
                      name="destPort"
                      disabled={isUploadingToFirebase}
                      checked={selectedDataRoomPortfolio === 'both' || selectedDataRoomPortfolio === 'global'}
                      onChange={() => setSelectedDataRoomPortfolio('both')}
                      className="sr-only"
                    />
                    <span className="font-bold text-slate-900 block text-xs">Global</span>
                    <span className="text-[10px] text-slate-400">HÉLIOS & VOLTA</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catégorie du document *</label>
                <select
                  disabled={isUploadingToFirebase}
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800 disabled:opacity-60"
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
                  disabled={isUploadingToFirebase}
                  value={uploadDocName}
                  onChange={(e) => setUploadDocName(e.target.value)}
                  placeholder="ex: Promesse de bail notariée — Lot BESS 12"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Fichier confidentiel (PDF, XLSX, DOCX — Direct Cloud Storage)
                </label>
                <input
                  type="file"
                  disabled={isUploadingToFirebase}
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setUploadRawFile(f);
                    if (f && !uploadDocName) {
                      setUploadDocName(f.name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer disabled:opacity-60"
                />
                {uploadRawFile && (
                  <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 truncate">{uploadRawFile.name}</span>
                    <span className="text-slate-500 font-mono shrink-0 ml-2">
                      {uploadRawFile.size >= 1024 * 1024
                        ? `${(uploadRawFile.size / (1024 * 1024)).toFixed(1)} Mo`
                        : `${(uploadRawFile.size / 1024).toFixed(0)} Ko`}
                    </span>
                  </div>
                )}
              </div>

              {/* Barre de progression d'upload en temps réel vers Firebase Storage */}
              {isUploadingToFirebase && (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                      {uploadStatusText || 'Transfert sécurisé vers Firebase Storage...'}
                    </span>
                    <span className="font-mono font-bold text-blue-700">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200/60 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-blue-600 italic">
                    Flux direct client → enr-courtage.firebasestorage.app (sans restriction de taille Vercel)
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isUploadingToFirebase}
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadRawFile(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUploadingToFirebase}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isUploadingToFirebase ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Téléversement ({uploadProgress}%)...</span>
                    </>
                  ) : (
                    <span>Publier en Data Room</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODALE : MODIFIER UN INVESTISSEUR / ACCÈS                           */}
      {/* =================================================================== */}
      {editingUser && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingUser(null);
              setEditUserNdaFile(null);
            }
          }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-black text-[#0b192c]">
                  Modifier l'utilisateur : {editingUser.name || editingUser.company}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setEditUserNdaFile(null);
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                title="Fermer (Échap)"
                aria-label="Fermer la fenêtre"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={editingUserData.name || ''}
                    onChange={(e) => setEditingUserData({ ...editingUserData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Société / Fonds *</label>
                  <input
                    type="text"
                    required
                    value={editingUserData.company || ''}
                    onChange={(e) => setEditingUserData({ ...editingUserData, company: e.target.value })}
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
                    value={editingUserData.email || ''}
                    onChange={(e) => setEditingUserData({ ...editingUserData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={editingUserData.phone || ''}
                    onChange={(e) => setEditingUserData({ ...editingUserData, phone: e.target.value })}
                    placeholder="06 ..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Mot de passe avec générateur et show/hide */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Mot de passe de connexion</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newPass = generateRandomPassword();
                      setEditingUserData({ ...editingUserData, password: newPass });
                      setShowEditPassword(true);
                    }}
                    className="text-[10px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Générer un mot de passe sécurisé</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editingUserData.password || ''}
                    onChange={(e) => setEditingUserData({ ...editingUserData, password: e.target.value })}
                    placeholder="Laisser vide ou saisir un nouveau mot de passe"
                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-800 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                    title={showEditPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statut d'Accès</label>
                  <select
                    value={editingUserData.status || 'active'}
                    onChange={(e) => setEditingUserData({ ...editingUserData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-800"
                  >
                    <option value="active">Actif (Accès accordé)</option>
                    <option value="pending">En attente (Validation requise)</option>
                    <option value="rejected">Inactif / Refusé (Accès suspendu)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rôle / Titre</label>
                  <input
                    type="text"
                    value={editingUserData.role || 'Investisseur'}
                    onChange={(e) => setEditingUserData({ ...editingUserData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Accord de Confidentialité (NDA) signé */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-purple-900 block text-xs">
                    Accord de Confidentialité (NDA) signé :
                  </span>
                  {(editingUserData.hasUploadedSignedNda || editingUserData.ndaFileName) ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Fichier : {editingUserData.ndaFileName || 'NDA_Signé.pdf'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Aucun document chargé</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600">
                  Chargez ou remplacez le fichier PDF du NDA signé par cet investisseur.
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setEditUserNdaFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                />
                {editUserNdaFile && (
                  <div className="text-[11px] text-purple-800 font-bold flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                    <span>Nouveau fichier prêt : {editUserNdaFile.name} ({(editUserNdaFile.size / 1024).toFixed(0)} Ko)</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setEditUserNdaFile(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODALE DÉDIÉE : CHARGER UN NDA SIGNÉ POUR UN UTILISATEUR           */}
      {/* =================================================================== */}
      {uploadNdaModalUser && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setUploadNdaModalUser(null);
              setUploadNdaFile(null);
            }
          }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-black text-[#0b192c]">
                  Charger le NDA Signé
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUploadNdaModalUser(null);
                  setUploadNdaFile(null);
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                title="Fermer (Échap)"
                aria-label="Fermer la fenêtre"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Investisseur :</span>
                <span className="font-bold text-slate-900">{uploadNdaModalUser.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Société / Fonds :</span>
                <span className="font-bold text-slate-900">{uploadNdaModalUser.company}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Identifiant :</span>
                <span className="font-mono text-slate-700 text-[11px]">{uploadNdaModalUser.email}</span>
              </div>
            </div>

            <form onSubmit={handleSaveUploadNda} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sélectionner le document PDF signé *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf"
                  onChange={(e) => setUploadNdaFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                />
              </div>

              {uploadNdaFile && (
                <div className="p-3 rounded-xl bg-purple-50 text-purple-900 font-bold border border-purple-200 flex items-center justify-between">
                  <span className="truncate">{uploadNdaFile.name}</span>
                  <span className="text-[10px] text-purple-700 font-mono shrink-0 ml-2">
                    {(uploadNdaFile.size / 1024).toFixed(0)} Ko
                  </span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Date de signature bilatérale
                </label>
                <input
                  type="date"
                  value={uploadNdaSignedDate}
                  onChange={(e) => setUploadNdaSignedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadNdaModalUser(null);
                    setUploadNdaFile(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUploadingNda}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isUploadingNda ? 'Enregistrement en cours...' : 'Enregistrer le NDA signé'}
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
