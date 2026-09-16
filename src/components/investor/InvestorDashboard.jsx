import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Battery,
  ShieldCheck,
  ShieldAlert,
  FileSpreadsheet,
  Layers,
  Coins,
  ArrowRight,
  FolderLock,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Check,
  X,
  Scale,
  FileCheck,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Building,
  User,
  ExternalLink,
  Edit3,
  RotateCcw,
  Handshake,
  ChevronRight,
  Send,
  Lock,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { investorService } from '@/services/investorService';
import InvestorHeader from './InvestorHeader';
import PortfolioCard from './PortfolioCard';
import ProcessTimeline from './ProcessTimeline';
import DataRoomSection from './DataRoomSection';
import AdminValidationModal from './AdminValidationModal';
import OfferModal from './OfferModal';
import ExclusiveMandateModal from './ExclusiveMandateModal';

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const {
    currentInvestor,
    excludeOrange,
    toggleExcludeOrange,
    investors,
    offers,
    investorAcceptCounter,
    investorRejectCounter,
  } = useInvestorStore();

  const portfolios = useMemo(() => investorService.getPortfolios(), []);
  const heliosPortfolio = portfolios.find((p) => p.id === 'helios');
  const voltaPortfolio = portfolios.find((p) => p.id === 'volta');

  const [dataRoomPortfolio, setDataRoomPortfolio] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Offer modal state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerModalPortfolio, setOfferModalPortfolio] = useState(null);
  const [offerModalMode, setOfferModalMode] = useState('create'); // 'create' | 'modify' | 'counter_proposal'
  const [selectedOfferForModal, setSelectedOfferForModal] = useState(null);

  // Exclusive mandate modal state
  const [selectedMandateOffer, setSelectedMandateOffer] = useState(null);

  const isAdmin = currentInvestor?.isAdmin || currentInvestor?.email === 'y.barberis@enr-courtage.fr';
  const pendingRequestsCount = investors.filter((i) => i.status === 'pending').length;

  // Investor's purchase offers
  const myOffers = useMemo(() => {
    if (isAdmin) return offers;
    return offers.filter(
      (o) =>
        o.investorEmail?.toLowerCase() === currentInvestor?.email?.toLowerCase() ||
        o.investorId === currentInvestor?.id ||
        o.investorCompany?.toLowerCase() === currentInvestor?.company?.toLowerCase()
    );
  }, [offers, currentInvestor, isAdmin]);

  // Actions on offers
  const handleOpenCreateOffer = (portfolio = null) => {
    setOfferModalPortfolio(portfolio);
    setSelectedOfferForModal(null);
    setOfferModalMode('create');
    setIsOfferModalOpen(true);
  };

  const handleOpenModifyOffer = (offer) => {
    setSelectedOfferForModal(offer);
    const targetP = portfolios.find((p) => p.id === offer.portfolioId) || heliosPortfolio;
    setOfferModalPortfolio(targetP);
    setOfferModalMode('modify');
    setIsOfferModalOpen(true);
  };

  const handleOpenCounterOffer = (offer) => {
    setSelectedOfferForModal(offer);
    const targetP = portfolios.find((p) => p.id === offer.portfolioId) || heliosPortfolio;
    setOfferModalPortfolio(targetP);
    setOfferModalMode('counter_proposal');
    setIsOfferModalOpen(true);
  };

  const handleAcceptCounter = (offerId) => {
    if (
      window.confirm(
        "Confirmez-vous l'acceptation de la contre-proposition de Yann BARBERIS ? Vous pourrez ensuite procéder immédiatement à la signature du Mandat de Négociation Exclusive."
      )
    ) {
      investorAcceptCounter(offerId);
    }
  };

  const handleRejectOffer = (offerId) => {
    const reason = window.prompt("Indiquez un motif de refus à transmettre à ENR COURTAGE (optionnel) :");
    if (reason !== null) {
      investorRejectCounter(offerId, reason);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col selection:bg-amber-500 selection:text-gray-950">
      {/* Header */}
      <InvestorHeader
        activeTab="dashboard"
        onOpenDataRoom={() => setDataRoomPortfolio(heliosPortfolio)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Admin Notification Banner */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-amber-950/60 to-gray-900 border border-amber-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
              <div className="text-xs text-gray-200">
                <span className="font-bold text-white">Espace Administrateur — Yann BARBERIS</span>
                <span className="text-gray-400 block sm:inline sm:ml-2">
                  {pendingRequestsCount > 0
                    ? `Vous avez ${pendingRequestsCount} nouvelle(s) demande(s) d'accès investisseur en attente de contre-signature NDA.`
                    : "Aucune demande en attente de validation."}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <span>Gérer les accès & NDA</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-gray-950 text-amber-300 text-[10px] font-black">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* TABLEAU DE BORD PERSONNEL INVESTISSEUR (HEADER DE BIENVENUE)     */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-[#0f172a] to-gray-900 border border-gray-800 p-6 sm:p-8 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <Building className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 font-bold">{currentInvestor?.company || 'Investisseur Partenaire'}</span>
                  <span>•</span>
                  <span>Espace Transactionnel M&A</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Bienvenue, {currentInvestor?.name || 'Investisseur'}
                </h1>
                <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Consultez les portefeuilles d'énergies renouvelables en cession, accédez à leurs Teasers et Data Rooms dédiés, et pilotez vos offres d'acquisition fermes ou partielles.
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex flex-col sm:items-end gap-2 text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>NDA Bilatéral Signé & Enregistré</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-semibold">
                  <FolderLock className="w-4 h-4 text-blue-400" />
                  <span>Accès Data Room Intégral Débloqué</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800">
                <div className="text-[11px] text-gray-400 uppercase font-medium">Portefeuilles Disponibles</div>
                <div className="text-2xl font-black text-amber-400 mt-1">2 Portefeuilles</div>
                <div className="text-[10px] text-gray-400 mt-0.5">HÉLIOS (PV) & VOLTA (BESS)</div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800">
                <div className="text-[11px] text-gray-400 uppercase font-medium">Mes Propositions Déposées</div>
                <div className="text-2xl font-black text-white mt-1">{myOffers.length} offre(s)</div>
                <div className="text-[10px] text-emerald-400 font-medium mt-0.5">Totales ou partielles</div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800">
                <div className="text-[11px] text-gray-400 uppercase font-medium">En Cours d'Étude</div>
                <div className="text-2xl font-black text-cyan-400 mt-1">
                  {myOffers.filter((o) => o.status === 'submitted' || o.status === 'counter_by_admin' || o.status === 'counter_by_investor').length}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Cycles de négociation actifs</div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800">
                <div className="text-[11px] text-gray-400 uppercase font-medium">Mandats d'Exclusivité</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {myOffers.filter((o) => o.status === 'agreement_reached' || o.status === 'mandate_signed').length}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium mt-0.5">Accords contractualisés</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 1 : PRINCIPE DE FONCTIONNEMENT DE LA PLATEFORME           */}
        {/* ================================================================= */}
        <section className="rounded-2xl bg-[#111827] border border-gray-800 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-gray-800 pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Modalités Transactionnelles
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Fonctionnement de la Plateforme d'Acquisition
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-3xl leading-relaxed">
              Une plateforme M&A agile permettant de calibrer précisément votre périmètre d'investissement et de structurer des offres adaptées à votre politique de risque.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pilier 1 */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-2 hover:border-gray-700 transition">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                1
              </div>
              <h3 className="text-sm font-bold text-white">Teasers Dédiés par Portefeuille</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Chaque portefeuille (<strong>HÉLIOS PV 8,01 MWc</strong> et <strong>VOLTA BESS 15,50 MW</strong>) dispose de son Teaser autonome avec cartographie interactive, inventaire unitaire et Data Room dédiée. Aucun teaser n'est mutualisé.
              </p>
            </div>

            {/* Pilier 2 */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-2 hover:border-gray-700 transition">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                2
              </div>
              <h3 className="text-sm font-bold text-white">Liberté Totale de Périmètre</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Vous avez la liberté de formuler une offre sur un <strong>portefeuille entier</strong>, sur un ou plusieurs <strong>projets ciblés</strong> d'un portefeuille, ou sur les <strong>deux portefeuilles combinés</strong>.
              </p>
            </div>

            {/* Pilier 3 */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-2 hover:border-gray-700 transition">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                3
              </div>
              <h3 className="text-sm font-bold text-white">Tarif & Jalonnements Sur-Mesure</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Proposez librement votre valorisation (€ HT) et sélectionnez vos versements parmi les <strong>4 jalons types</strong> de développement (Promesse, Urba purgé, PTF Enedis, RTB). <strong>Aucun jalon n'est imposé par défaut</strong>.
              </p>
            </div>

            {/* Pilier 4 */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-2 hover:border-gray-700 transition">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                4
              </div>
              <h3 className="text-sm font-bold text-white">Négociation & Mandat avec Avocat</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Aller-retours d'offres et contre-propositions avec Yann BARBERIS. Dès accord mutuel, signature du <strong>Mandat de Négociation Exclusive (60 jours)</strong> avec <strong>recours obligatoire légal à un avocat</strong> pour les actes définitifs.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 2 : MES PROPOSITIONS D'ACHAT & NÉGOCIATIONS EN COURS      */}
        {/* ================================================================= */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>Mes Propositions d'Achat & Négociations en cours ({myOffers.length})</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Suivez en temps réel l'étude de vos propositions, recevez les contre-propositions de Yann BARBERIS et régularisez vos Mandats d'Exclusivité.
              </p>
            </div>

            <button
              onClick={() => handleOpenCreateOffer(null)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-gray-950 font-bold text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Coins className="w-4 h-4" />
              <span>Déposer une nouvelle offre</span>
            </button>
          </div>

          {myOffers.length === 0 ? (
            <div className="p-8 rounded-2xl bg-gray-900/60 border border-gray-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <Coins className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Vous n'avez pas encore formulé d'offre d'achat</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Consultez les portefeuilles HÉLIOS et VOLTA ci-dessous, sélectionnez vos projets ou un portefeuille complet, et déposez votre offre avec votre propre échéancier par jalons.
                </p>
              </div>
              <button
                onClick={() => handleOpenCreateOffer(null)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition shadow-lg shadow-amber-500/20"
              >
                Formuler ma première proposition d'achat
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {myOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-2xl bg-[#111827] border border-gray-800 p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-black text-white">{offer.portfolioName}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                          {offer.offerType === 'total'
                            ? `Portefeuille complet (${offer.selectedSitesCount} sites)`
                            : `Sélection partielle (${offer.selectedSitesCount} sites)`}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-3">
                        <span>Référence : <strong className="text-gray-300 font-mono">{offer.id}</strong></span>
                        <span>• Déposée le : {new Date(offer.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 uppercase font-semibold">Montant Proposé</div>
                      <div className="text-2xl font-black font-mono text-emerald-400">
                        {new Intl.NumberFormat('fr-FR').format(offer.amountEur)} € HT
                      </div>
                    </div>
                  </div>

                  {/* TABLEAU DES JALONNEMENTS */}
                  <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Échéancier de Paiement Proposé par Jalonnements
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] text-gray-300">
                        <thead className="bg-gray-800/80 text-[10px] uppercase text-gray-400">
                          <tr>
                            <th className="py-2 px-3">Jalon d'Exécution</th>
                            <th className="py-2 px-3">Modalité / Événement Déclencheur</th>
                            <th className="py-2 px-3">Échéance Estimée</th>
                            <th className="py-2 px-3 text-right">Quote-part (%)</th>
                            <th className="py-2 px-3 text-right">Montant (€ HT)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {(offer.milestones || []).map((m, mIdx) => (
                            <tr key={mIdx} className="hover:bg-gray-800/40">
                              <td className="py-2 px-3 font-semibold text-white">{m.label}</td>
                              <td className="py-2 px-3 text-gray-300">{m.targetCondition}</td>
                              <td className="py-2 px-3 text-gray-400 font-mono">{m.targetDate}</td>
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

                  {/* Remarques */}
                  {offer.comments && (
                    <div className="bg-gray-900/50 p-2.5 rounded-lg border border-gray-800 text-[11px] text-gray-300">
                      <span className="font-bold text-gray-400 block mb-0.5">Vos Remarques & Conditions :</span>
                      <span>"{offer.comments}"</span>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* ZONE D'ÉTAT DE LA NÉGOCIATION & ALLER-RETOURS           */}
                  {/* ======================================================= */}

                  {/* STATUT 1 : EN COURS D'ÉTUDE */}
                  {(offer.status === 'submitted' || offer.status === 'counter_by_investor') && (
                    <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-2.5 text-xs text-amber-200">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <strong className="text-white">En cours d'étude par Yann BARBERIS (ENR COURTAGE)</strong>
                          <span className="text-gray-400 block sm:inline sm:ml-2">
                            {offer.status === 'counter_by_investor'
                              ? "Votre contre-proposition a été transmise à l'administrateur. Vous recevrez son retour prochainement."
                              : "Votre offre initiale est en cours d'analyse par le cédant. Vous serez notifié de son acceptation, refus ou contre-proposition."}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenModifyOffer(offer)}
                        className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 flex items-center gap-1.5 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modifier ma proposition</span>
                      </button>
                    </div>
                  )}

                  {/* STATUT 2 : CONTRE-PROPOSITION DE YANN BARBERIS */}
                  {offer.status === 'counter_by_admin' && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-gray-900 to-amber-950/40 border-2 border-amber-500/60 space-y-3 shadow-xl animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span>Contre-Proposition Reçue de Yann BARBERIS (ENR COURTAGE)</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">Décision requise</span>
                      </div>

                      <div className="bg-gray-950/80 p-3 rounded-lg border border-gray-800 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-gray-300">Montant révisé proposé par le cédant :</span>
                          <span className="text-xl font-black font-mono text-amber-400">
                            {new Intl.NumberFormat('fr-FR').format(offer.counterOffer?.amountEur || offer.amountEur)} € HT
                          </span>
                        </div>
                        {offer.counterOffer?.comments && (
                          <p className="text-xs text-gray-300 italic border-t border-gray-800 pt-1.5">
                            "{offer.counterOffer.comments}"
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                        <button
                          onClick={() => handleRejectOffer(offer.id)}
                          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-gray-700 text-xs font-semibold transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Refuser</span>
                        </button>

                        <button
                          onClick={() => handleOpenCounterOffer(offer)}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Faire une contre-proposition</span>
                        </button>

                        <button
                          onClick={() => handleAcceptCounter(offer.id)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accepter la proposition</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STATUT 3 : ACCORD TROUVÉ -> SIGNATURE DU MANDAT */}
                  {offer.status === 'agreement_reached' && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-gray-900 border border-emerald-500/50 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center space-x-2.5 text-emerald-300">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <div>
                            <strong className="text-white text-sm">Accord Mutuel Trouvé !</strong>
                            <p className="text-xs text-gray-300 mt-0.5">
                              Les conditions financières et le calendrier de jalonnement ont été validés entre vous et Yann BARBERIS.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedMandateOffer(offer)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/25 flex items-center gap-2"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>Consulter & Signer le Mandat de Négociation Exclusive</span>
                        </button>
                      </div>

                      {/* Rappel clause avocat obligatoire */}
                      <div className="p-2.5 rounded-lg bg-emerald-900/20 border border-emerald-500/30 flex items-center gap-2 text-[11px] text-emerald-200">
                        <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          <strong>Clause impérative :</strong> La formalisation des actes définitifs de cession fera obligatoirement l'objet d'un accompagnement par un avocat d'affaires conformément aux termes du Mandat.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* STATUT 4 : MANDAT SIGNÉ & EN VIGUEUR */}
                  {offer.status === 'mandate_signed' && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#0c1a14] to-gray-900 border-2 border-emerald-500/60 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center space-x-2 text-emerald-300">
                          <FileCheck className="w-5 h-5 text-emerald-400" />
                          <div>
                            <strong className="text-white text-sm">
                              Mandat de Négociation Exclusive Signé & Actif (60 jours)
                            </strong>
                            <p className="text-xs text-gray-400">
                              Accord d'exclusivité régularisé électroniquement par les deux parties. Rédaction des contrats définitifs en cours sous l'égide d'un avocat.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedMandateOffer(offer)}
                          className="px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Consulter / Télécharger le Mandat (PDF)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STATUT 5 : REFUSÉ */}
                  {offer.status === 'rejected' && (
                    <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700 text-xs text-gray-400 flex items-center justify-between">
                      <span>Cette proposition n'a pas été retenue ou a été déclinée.</span>
                      <button
                        onClick={() => handleOpenCreateOffer(null)}
                        className="text-amber-400 hover:underline font-semibold"
                      >
                        Formuler une nouvelle proposition
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* SECTION 3 : LES 2 PORTEFEUILLES ACTUELLEMENT EN VENTE             */}
        {/* ================================================================= */}
        <section className="space-y-4">
          <div className="border-b border-gray-800 pb-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Portefeuilles Actuellement en Vente (2 Portefeuilles)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Cliquez sur un portefeuille pour entrer dans son <strong>Teaser dédié</strong> : cartographie interactive unitaire, tableau détaillé des sites et Data Room correspondante.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {heliosPortfolio && (
              <div id="helios">
                <PortfolioCard
                  portfolio={heliosPortfolio}
                  onOpenDataRoom={(p) => setDataRoomPortfolio(p)}
                />
              </div>
            )}
            {voltaPortfolio && (
              <div id="volta">
                <PortfolioCard
                  portfolio={voltaPortfolio}
                  onOpenDataRoom={(p) => setDataRoomPortfolio(p)}
                />
              </div>
            )}
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 4 : PROPOSITION D'OFFRE MULTI-PORTEFEUILLES (CTA)          */}
        {/* ================================================================= */}
        <section
          id="offre"
          className="no-print rounded-2xl bg-gradient-to-r from-amber-950/40 via-gray-900 to-cyan-950/40 border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Espace Transactionnel & Propositions</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                Déposer une offre d'acquisition (Totale ou Partielle)
              </h3>
              <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                Vous pouvez formuler une offre ferme ou indicative sur le portefeuille <strong>HÉLIOS (PV)</strong>, sur le portefeuille <strong>VOLTA (BESS)</strong>, ou sur les <strong>deux combinés</strong>, avec votre propre proposition d'échéancier par jalonnements.
              </p>
            </div>

            <button
              onClick={() => handleOpenCreateOffer(null)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-gray-950 font-black text-xs uppercase tracking-wider transition transform hover:scale-[1.02] shadow-xl shadow-amber-500/25 flex items-center gap-2.5 shrink-0"
            >
              <Coins className="w-4 h-4" />
              <span>Soumettre une Proposition d'Achat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 5 : PROCESSUS STRUCTURÉ M&A (AVEC MANDAT D'EXCLUSIVITÉ)   */}
        {/* ================================================================= */}
        <section id="process">
          <ProcessTimeline />
        </section>

        {/* ================================================================= */}
        {/* SECTION 6 : CONTACT M&A ADVISORY                                  */}
        {/* ================================================================= */}
        <section
          id="contact-ma"
          className="no-print rounded-2xl bg-gradient-to-br from-gray-900 via-[#111827] to-gray-900 border border-gray-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-block">
              Interlocuteur M&A Dédié
            </span>
            <h4 className="text-lg font-bold text-white">
              Une question sur la structuration ou la Data Room ?
            </h4>
            <p className="text-xs text-gray-400 max-w-xl">
              Yann BARBERIS et l'équipe transactionnelle ENR COURTAGE se tiennent à votre disposition pour vous accompagner dans l'analyse des dossiers et convenir d'une session de Questions/Réponses.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:contact@enr-courtage.fr?subject=[M%26A%20INVESTISSEURS]%20Demande%20d%27information%20portefeuilles"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Mail className="w-4 h-4" />
              <span>Contacter le pôle M&A</span>
            </a>
            <a
              href="tel:+33535548599"
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs border border-gray-700 transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>05 35 54 85 99</span>
            </a>
          </div>
        </section>

        {/* ================================================================= */}
        {/* MODALS : DATA ROOM, ADMIN, OFFRE & MANDAT                         */}
        {/* ================================================================= */}

        {/* Data Room Modal */}
        {dataRoomPortfolio && (
          <div className="fixed top-20 inset-x-0 bottom-0 z-30 bg-black/85 backdrop-blur-md overflow-y-auto p-4 flex items-start justify-center pt-4">
            <div className="max-w-4xl w-full my-4 relative">
              <button
                onClick={() => setDataRoomPortfolio(null)}
                className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white px-3 py-1.5 bg-gray-800 rounded-lg text-xs font-semibold"
              >
                Fermer
              </button>
              <DataRoomSection
                portfolio={dataRoomPortfolio}
                investorName={currentInvestor?.name}
                investorCompany={currentInvestor?.company}
              />
            </div>
          </div>
        )}

        {/* Modal Validation Administrateur (Yann BARBERIS) */}
        <AdminValidationModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
        />

        {/* Modal Proposition d'Achat (Création / Modification / Contre-proposition) */}
        <OfferModal
          portfolio={offerModalPortfolio || heliosPortfolio}
          selectedSiteIds={[]}
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          existingOffer={selectedOfferForModal}
          mode={offerModalMode}
        />

        {/* Modal Mandat de Négociation Exclusive */}
        {selectedMandateOffer && (
          <ExclusiveMandateModal
            offer={selectedMandateOffer}
            isOpen={!!selectedMandateOffer}
            onClose={() => setSelectedMandateOffer(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-[#0c1220]/80 px-6 py-6 text-center text-xs text-gray-500 space-y-1">
        <p>&copy; {new Date().getFullYear()} ENR COURTAGE — Plateforme Transactionnelle M&A Confidentielle.</p>
        <p className="text-[10px] text-gray-600">
          Les informations communiquées sont strictement confidentielles et réservées aux investisseurs accrédités ayant régularisé un NDA bilatéral.
        </p>
      </footer>
    </div>
  );
}
