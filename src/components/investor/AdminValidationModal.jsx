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
} from 'lucide-react';
import { useInvestorStore, generateRandomPassword } from '@/stores/useInvestorStore';
import { investorService } from '@/services/investorService';

export default function AdminValidationModal({ isOpen, onClose }) {
  const {
    investors,
    adminValidateInvestor,
    adminRejectInvestor,
    offers,
    updateOfferStatus,
    deleteOffer,
    customDataRoom,
    addDocumentToDataRoom,
    deleteDocumentFromDataRoom,
  } = useInvestorStore();

  const [selectedInvestorForNda, setSelectedInvestorForNda] = useState(null);
  const [validatedData, setValidatedData] = useState(null); // { investor, password, emailSubject, emailBody }
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'offers' | 'dataroom' | 'active'

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

  if (!isOpen) return null;

  const pendingInvestors = investors.filter((inv) => inv.status === 'pending');
  const activeInvestors = investors.filter((inv) => inv.status === 'active' && !inv.isAdmin);

  // Filtered Offers
  const filteredOffers = offers.filter((off) => {
    if (offerPortfolioFilter === 'all') return true;
    return off.portfolioId === offerPortfolioFilter;
  });

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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-5xl w-full p-5 sm:p-8 shadow-2xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

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
                setActiveTab('active');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'active'
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Investisseurs Validés ({activeInvestors.length})</span>
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
                        <span className="text-sm font-bold text-white">{inv.company}</span>
                        {inv.legalForm && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                            {inv.legalForm}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          NDA signé par l'investisseur
                        </span>
                      </div>

                      <div className="text-xs text-gray-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {inv.name} ({inv.role})
                        </span>
                        <span className="flex items-center gap-1 font-mono text-amber-400">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {inv.email}
                        </span>
                        {inv.phone && (
                          <span className="flex items-center gap-1 text-gray-400">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {inv.phone}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-gray-500">
                        Siège : {inv.headOffice} • RCS : {inv.rcsNumber} ({inv.rcsCity})
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

                    {/* Admin Status & Notes Form */}
                    <div className="bg-gray-900/70 p-3 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-gray-400">Statut de l'offre :</span>
                        <select
                          value={offer.status || 'submitted'}
                          onChange={(e) => updateOfferStatus(offer.id, e.target.value)}
                          className="px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
                        >
                          <option value="submitted">⏳ En cours d'examen</option>
                          <option value="shortlist">⭐ Retenue dans la Shortlist</option>
                          <option value="exclusive">🔒 En Négociation Exclusive</option>
                          <option value="accepted">✓ Offre Acceptée (Closing)</option>
                          <option value="rejected">✕ Non Retenue</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          defaultValue={offer.adminNotes || ''}
                          onBlur={(e) => updateOfferStatus(offer.id, offer.status, e.target.value)}
                          placeholder="Note interne Yann BARBERIS..."
                          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-200 placeholder-gray-500 w-64 focus:outline-none focus:border-amber-400"
                        />
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
          /* TAB 4: ACTIVE INVESTORS                                         */
          /* =============================================================== */
          <div className="space-y-3">
            {activeInvestors.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs bg-gray-800/20 rounded-xl border border-gray-800">
                Aucun investisseur actif.
              </div>
            ) : (
              activeInvestors.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 text-xs flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{inv.company}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                        ✓ Accès Validé & NDA Actif
                      </span>
                    </div>
                    <div className="text-gray-400 text-[11px]">
                      {inv.name} ({inv.role}) • {inv.email} • Mot de passe : <span className="font-mono text-amber-400 font-bold">{inv.password}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedInvestorForNda(inv)}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-gray-700 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Consulter NDA Bilatéral</span>
                  </button>
                </div>
              ))
            )}
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
      </div>
    </div>
  );
}
