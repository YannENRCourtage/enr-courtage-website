import React, { useState, useEffect, useMemo } from 'react';
import {
  Coins,
  X,
  CheckCircle2,
  Building,
  ShieldCheck,
  AlertCircle,
  Send,
  Layers,
  Calendar,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Search,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { PORTFOLIOS } from '@/data/investorData';
import { investorService } from '@/services/investorService';
import { formatThousands, parseThousands, autoBalanceMilestones } from '@/utils/mnaUtils';

// The 4 standard milestones from Image 2
const STANDARD_MILESTONES = [
  {
    key: 'promesse',
    id: 1,
    title: 'Signature de la promesse de cession (Upfront)',
    targetCondition: 'Signature de la promesse unilatérale ou synallagmatique et mise sous séquestre',
    targetDate: 'T4 2026',
    defaultPercent: 30,
  },
  {
    key: 'urba',
    id: 2,
    title: 'Purge du recours des tiers / Urbanisme purgé',
    targetCondition: 'Certificat de non-recours et non-retrait délivré par l\'autorité compétente',
    targetDate: 'T1 2027',
    defaultPercent: 30,
  },
  {
    key: 'ptf',
    id: 3,
    title: 'Obtention de la PTF / Accord Enedis',
    targetCondition: 'Proposition Technique et Financière acceptée par le gestionnaire de réseau',
    targetDate: 'T3 2027',
    defaultPercent: 20,
  },
  {
    key: 'rtb',
    id: 4,
    title: 'Ready to Build (RTB) & Closing définitif',
    targetCondition: 'Dossier prêt à construire, droits transférés et ordre de service travaux',
    targetDate: 'T1 2028',
    defaultPercent: 20,
  },
];

export default function OfferModal({
  portfolio = null,
  selectedSiteIds = [],
  isOpen,
  onClose,
  existingOffer = null,
  mode = 'create', // 'create' | 'modify' | 'counter_proposal'
}) {
  const {
    currentInvestor,
    submitOffer,
    modifyOffer,
    investorCounterOffer,
    soldSites = { helios: [], volta: [] },
    deletedSites = { helios: [], volta: [] },
  } = useInvestorStore();

  // Wizard Step: 1 = Périmètre & Projets, 2 = Tarif / Montant, 3 = Jalonnements
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [targetPortfolio, setTargetPortfolio] = useState(portfolio?.id || existingOffer?.portfolioId || 'helios');
  const [offerType, setOfferType] = useState(
    existingOffer ? existingOffer.offerType : (selectedSiteIds.length > 0 ? 'partial' : 'total')
  );
  const [localSelectedSiteIds, setLocalSelectedSiteIds] = useState(
    existingOffer?.selectedSiteIds || selectedSiteIds || []
  );
  const [siteSearchTerm, setSiteSearchTerm] = useState('');

  const rawInitAmt = existingOffer ? (existingOffer.counterAmountEur || existingOffer.amountEur || '') : '';
  const [amountEur, setAmountEur] = useState(rawInitAmt ? formatThousands(rawInitAmt) : '');

  // Step 3: Selected Milestones (NONE selected by default per user instruction)
  // Mapping: { [key]: { selected: boolean, percentage: number, label: string, targetCondition: string } }
  const [selectedMilestonesMap, setSelectedMilestonesMap] = useState({});
  const [customMilestones, setCustomMilestones] = useState([]);

  const [comments, setComments] = useState(existingOffer?.comments || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOffer, setSubmittedOffer] = useState(null);
  const [error, setError] = useState('');

  // Retrieve all raw sites
  const allPortfolios = PORTFOLIOS;
  const heliosSites = useMemo(() => allPortfolios.find((p) => p.id === 'helios')?.sites || [], [allPortfolios]);
  const voltaSites = useMemo(() => allPortfolios.find((p) => p.id === 'volta')?.sites || [], [allPortfolios]);

  // Compute available active sites for target portfolio
  const availableSites = useMemo(() => {
    let list = [];
    if (targetPortfolio === 'helios') {
      list = heliosSites.map((s) => ({ ...s, portfolioId: 'helios', portfolioName: 'HÉLIOS (PV)' }));
    } else if (targetPortfolio === 'volta') {
      list = voltaSites.map((s) => ({ ...s, portfolioId: 'volta', portfolioName: 'VOLTA (BESS)' }));
    } else {
      list = [
        ...heliosSites.map((s) => ({ ...s, portfolioId: 'helios', portfolioName: 'HÉLIOS (PV)' })),
        ...voltaSites.map((s) => ({ ...s, portfolioId: 'volta', portfolioName: 'VOLTA (BESS)' })),
      ];
    }

    return list.filter((site) => {
      const pKey = site.portfolioId === 'volta' ? 'volta' : 'helios';
      const isDeleted = deletedSites?.[pKey]?.includes(site.id);
      if (isDeleted) return false;
      return true;
    });
  }, [targetPortfolio, heliosSites, voltaSites, deletedSites]);

  // Filter sites for search inside modal
  const filteredModalSites = useMemo(() => {
    if (!siteSearchTerm.trim()) return availableSites;
    const q = siteSearchTerm.toLowerCase();
    return availableSites.filter((s) =>
      `${s.name || s.ville || ''} ${s.cp || ''} ${s.dept || ''} ${s.client || ''} ${s.address || ''}`.toLowerCase().includes(q)
    );
  }, [availableSites, siteSearchTerm]);

  // Initialize or reset when opening modal
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setError('');
      setSubmittedOffer(null);
      return;
    }

    if (existingOffer) {
      setTargetPortfolio(existingOffer.portfolioId || 'helios');
      setOfferType(existingOffer.offerType || 'total');
      setLocalSelectedSiteIds(existingOffer.selectedSiteIds || selectedSiteIds || []);
      const targetAmt = existingOffer.counterAmountEur || existingOffer.amountEur || '';
      setAmountEur(targetAmt ? formatThousands(targetAmt) : '');
      setComments(existingOffer.comments || '');

      // Load existing milestones
      const initialMap = {};
      (existingOffer.milestones || []).forEach((m) => {
        const matchedStd = STANDARD_MILESTONES.find((std) => m.label.includes(std.title));
        if (matchedStd) {
          initialMap[matchedStd.key] = {
            selected: true,
            percentage: m.percentage,
            label: m.label,
            targetCondition: m.targetCondition || matchedStd.targetCondition,
            targetDate: m.targetDate || matchedStd.targetDate,
          };
        } else {
          // Custom
          setCustomMilestones((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              label: m.label,
              percentage: m.percentage,
              targetCondition: m.targetCondition || '',
              targetDate: m.targetDate || '',
            },
          ]);
        }
      });
      setSelectedMilestonesMap(initialMap);
    } else {
      // NEW OFFER: Jalons NOT indicated by default!
      setSelectedMilestonesMap({});
      setCustomMilestones([]);
      setTargetPortfolio(portfolio?.id || 'helios');
      setOfferType(selectedSiteIds.length > 0 ? 'partial' : 'total');
      setLocalSelectedSiteIds(selectedSiteIds || []);
      setAmountEur('');
      setComments('');
    }
  }, [isOpen, existingOffer, portfolio, selectedSiteIds]);

  if (!isOpen) return null;

  const sitesToIncludeCount =
    offerType === 'total' ? availableSites.length : localSelectedSiteIds.length;

  const numericAmount = parseThousands(amountEur);

  // Toggle selection of a single site inside modal
  const handleToggleLocalSite = (siteId) => {
    setLocalSelectedSiteIds((prev) =>
      prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );
  };

  // Select all non-sold sites
  const handleSelectAllLocalSites = () => {
    const selectableIds = availableSites
      .filter((s) => {
        const pKey = s.portfolioId === 'volta' ? 'volta' : 'helios';
        return !soldSites?.[pKey]?.includes(s.id);
      })
      .map((s) => s.id);
    setLocalSelectedSiteIds(selectableIds);
  };

  // Clear all selected sites
  const handleClearAllLocalSites = () => {
    setLocalSelectedSiteIds([]);
  };

  // Toggle milestone selection
  const handleToggleMilestone = (std) => {
    setSelectedMilestonesMap((prev) => {
      const isCurrentlySelected = !!prev[std.key]?.selected;
      if (isCurrentlySelected) {
        const next = { ...prev };
        delete next[std.key];
        // Rebalance remaining to sum to 100%
        const remainingKeys = STANDARD_MILESTONES.map((s) => s.key).filter((k) => next[k]?.selected);
        if (remainingKeys.length > 0) {
          const equalShare = Math.floor(100 / remainingKeys.length);
          const remainder = 100 - (equalShare * remainingKeys.length);
          remainingKeys.forEach((k, idx) => {
            next[k] = {
              ...next[k],
              percentage: equalShare + (idx === 0 ? remainder : 0),
            };
          });
        }
        return next;
      } else {
        const next = {
          ...prev,
          [std.key]: {
            selected: true,
            percentage: 0,
            label: `Jalon — ${std.title}`,
            targetCondition: std.targetCondition,
            targetDate: std.targetDate,
          },
        };
        const selectedKeys = STANDARD_MILESTONES.map((s) => s.key).filter((k) => next[k]?.selected);
        if (selectedKeys.length > 0) {
          const equalShare = Math.floor(100 / selectedKeys.length);
          const remainder = 100 - (equalShare * selectedKeys.length);
          selectedKeys.forEach((k, idx) => {
            next[k] = {
              ...next[k],
              percentage: equalShare + (idx === 0 ? remainder : 0),
            };
          });
        }
        return next;
      }
    });
  };

  // Change percentage of selected milestone with auto-balance to 100%
  const handlePercentageChange = (key, newPercent) => {
    const requested = parseInt(newPercent, 10);
    const safeVal = isNaN(requested) ? 0 : requested;

    setSelectedMilestonesMap((prev) => {
      const selectedKeys = STANDARD_MILESTONES
        .map((s) => s.key)
        .filter((k) => prev[k]?.selected);

      if (selectedKeys.length <= 1) {
        return {
          ...prev,
          [key]: {
            ...prev[key],
            percentage: safeVal,
          },
        };
      }

      const changedIndex = selectedKeys.indexOf(key);
      if (changedIndex === -1) return prev;

      const currentMilestones = selectedKeys.map((k) => ({
        key: k,
        percentage: prev[k]?.percentage ?? 0,
      }));

      const balanced = autoBalanceMilestones(currentMilestones, changedIndex, safeVal);

      const next = { ...prev };
      balanced.forEach((item) => {
        if (next[item.key]) {
          next[item.key] = {
            ...next[item.key],
            percentage: item.percentage,
          };
        }
      });
      return next;
    });
  };

  // Build active milestones list
  const activeMilestones = [
    ...Object.entries(selectedMilestonesMap).map(([key, data], idx) => ({
      id: idx + 1,
      key,
      label: data.label,
      percentage: data.percentage || 0,
      amount: Math.round((numericAmount * (data.percentage || 0)) / 100),
      targetCondition: data.targetCondition,
      targetDate: data.targetDate,
    })),
    ...customMilestones.map((cm, idx) => ({
      ...cm,
      id: 10 + idx,
      amount: Math.round((numericAmount * (cm.percentage || 0)) / 100),
    })),
  ];

  const totalPercent = activeMilestones.reduce((sum, m) => sum + (m.percentage || 0), 0);

  // Validate Step 1
  const handleNextFromStep1 = () => {
    setError('');
    if (offerType === 'partial' && localSelectedSiteIds.length === 0) {
      setError('Veuillez sélectionner au moins un projet pour votre offre d\'achat partielle.');
      return;
    }
    setCurrentStep(2);
  };

  // Validate Step 2
  const handleNextFromStep2 = () => {
    setError('');
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Veuillez renseigner un montant valide en euros hors taxes.');
      return;
    }
    setCurrentStep(3);
  };

  // Final Submit
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Veuillez renseigner un montant valide en euros.');
      setCurrentStep(2);
      return;
    }

    if (offerType === 'partial' && localSelectedSiteIds.length === 0) {
      setError('Veuillez sélectionner au moins un projet pour votre offre partielle.');
      setCurrentStep(1);
      return;
    }

    if (activeMilestones.length === 0) {
      setError('Veuillez sélectionner au moins un jalon de paiement.');
      return;
    }

    if (totalPercent !== 100) {
      setError(`La somme des jalonnements de paiement doit être exactement égale à 100% (actuellement : ${totalPercent}%).`);
      return;
    }

    setIsSubmitting(true);

    try {
      const pName =
        targetPortfolio === 'both'
          ? 'Portefeuilles Combinés (HÉLIOS + VOLTA)'
          : targetPortfolio === 'volta'
          ? 'Portefeuille VOLTA (BESS)'
          : 'Portefeuille HÉLIOS (PV)';

      const offerData = {
        portfolioId: targetPortfolio,
        portfolioName: pName,
        offerType,
        selectedSiteIds: offerType === 'total' ? [] : localSelectedSiteIds,
        selectedSitesCount: sitesToIncludeCount,
        amountEur: numericAmount,
        milestones: activeMilestones,
        upfrontPercent: activeMilestones[0]?.percentage || 30,
        earnoutPercent: 100 - (activeMilestones[0]?.percentage || 30),
        comments,
      };

      if (mode === 'modify' && existingOffer) {
        modifyOffer(existingOffer.id, offerData);
        setSubmittedOffer({ ...existingOffer, ...offerData, status: 'submitted' });
      } else if (mode === 'counter_proposal' && existingOffer) {
        investorCounterOffer(existingOffer.id, {
          counterAmountEur: numericAmount,
          counterMilestones: activeMilestones,
          counterComments: comments,
        });
        setSubmittedOffer({ ...existingOffer, amountEur: numericAmount, milestones: activeMilestones, status: 'counter_by_investor' });
      } else {
        const result = submitOffer(offerData);
        await investorService.sendOfferNotification(result.offer);
        setSubmittedOffer(result.offer);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l\'enregistrement de votre offre.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedOffer(null);
    setAmountEur('');
    setComments('');
    setError('');
    setCurrentStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl relative my-6 text-slate-900">
        {/* Close button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedOffer ? (
          /* =============================================================== */
          /* ÉTAT : SUCCÈS SOUMISSION                                         */
          /* =============================================================== */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mb-2">
                {mode === 'counter_proposal' ? 'Contre-Proposition Transmise' : 'Proposition d\'Achat Enregistrée'}
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                {mode === 'counter_proposal'
                  ? 'Votre contre-proposition a été transmise !'
                  : 'Offre indicative en cours d\'étude !'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Votre proposition est désormais visible sous la référence{' '}
                <strong className="text-amber-600 font-mono">{submittedOffer.id}</strong> avec le statut{' '}
                <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">En cours d'étude</span>.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5 max-w-lg mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Périmètre ciblé :</span>
                <span className="text-slate-900 font-bold">{submittedOffer.portfolioName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Typologie :</span>
                <span className="text-slate-800">
                  {submittedOffer.offerType === 'total'
                    ? `Totalité (${submittedOffer.selectedSitesCount} sites)`
                    : `Partiel (${submittedOffer.selectedSitesCount} site(s))` }
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-600 font-bold">Montant proposé :</span>
                <span className="text-emerald-600 font-black font-mono text-base">
                  {new Intl.NumberFormat('fr-FR').format(submittedOffer.amountEur)} € HT
                </span>
              </div>

              {submittedOffer.milestones && submittedOffer.milestones.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Jalonnements de paiement arrêtés ({submittedOffer.milestones.length} jalons) :
                  </span>
                  {submittedOffer.milestones.map((m, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-slate-700">
                      <span>• {m.label}</span>
                      <span className="font-mono font-bold text-amber-600">
                        {m.percentage}% ({new Intl.NumberFormat('fr-FR').format(m.amount)} €)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Monsieur Yann BARBERIS (ENR COURTAGE) a été notifié. Il pourra soit accepter votre proposition, soit vous soumettre une contre-proposition directement sur votre tableau de bord.
            </p>

            <button
              onClick={handleResetAndClose}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Fermer et revenir au tableau de bord
            </button>
          </div>
        ) : (
          /* =============================================================== */
          /* FORMULAIRE EN 3 ÉTAPES                                          */
          /* =============================================================== */
          <div className="space-y-5">
            {/* Header with Title & Step Indicator */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                <Coins className="w-4 h-4" />
                <span>
                  {mode === 'modify'
                    ? 'Modification de votre offre'
                    : mode === 'counter_proposal'
                    ? 'Formuler une Contre-Proposition'
                    : 'Proposition d\'Acquisition & Jalonnements'}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {mode === 'modify'
                  ? 'Réviser les conditions de votre offre'
                  : mode === 'counter_proposal'
                  ? 'Ajuster le montant et les jalonnements'
                  : 'Faire une proposition d\'achat'}
              </h3>

              {/* 3 Step Progress Bar */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`text-left text-[11px] font-bold py-1.5 border-b-2 transition ${
                    currentStep === 1
                      ? 'border-amber-500 text-amber-600'
                      : currentStep > 1
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  1. Périmètre & Projets
                </button>
                <button
                  type="button"
                  onClick={() => numericAmount > 0 && setCurrentStep(2)}
                  className={`text-left text-[11px] font-bold py-1.5 border-b-2 transition ${
                    currentStep === 2
                      ? 'border-amber-500 text-amber-600'
                      : currentStep > 2
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  2. Tarif Proposé (€ HT)
                </button>
                <button
                  type="button"
                  onClick={() => numericAmount > 0 && setCurrentStep(3)}
                  className={`text-left text-[11px] font-bold py-1.5 border-b-2 transition ${
                    currentStep === 3
                      ? 'border-amber-500 text-amber-600'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  3. Sélection des Jalons
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* ============================================================= */}
            {/* ÉTAPE 1 : SÉLECTION DU PORTEFEUILLE ET PÉRIMÈTRE              */}
            {/* ============================================================= */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sélection du ou des Portefeuilles cibles
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setTargetPortfolio('helios')}
                      className={`p-3 rounded-2xl border text-center font-semibold transition cursor-pointer ${
                        targetPortfolio === 'helios'
                          ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="text-base mb-0.5">☀️</div>
                      <div className="font-bold">HÉLIOS (PV)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">9.12 MWc / 29 sites</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetPortfolio('volta')}
                      className={`p-3 rounded-2xl border text-center font-semibold transition cursor-pointer ${
                        targetPortfolio === 'volta'
                          ? 'bg-cyan-50 border-cyan-400 text-cyan-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="text-base mb-0.5">🔋</div>
                      <div className="font-bold">VOLTA (BESS)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">15.50 MW / {voltaSites.length} sites</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetPortfolio('both')}
                      className={`p-3 rounded-2xl border text-center font-semibold transition cursor-pointer ${
                        targetPortfolio === 'both'
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="text-base mb-0.5">⚡</div>
                      <div className="font-bold">Les Deux</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">23.51 MW / {heliosSites.length + voltaSites.length} sites</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Étendue du périmètre d'acquisition
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setOfferType('total')}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        offerType === 'total'
                          ? 'bg-amber-50/70 border-amber-400 text-slate-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-slate-900">Totalité du portefeuille</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        L'ensemble des sites sécurisés ({availableSites.length} sites)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOfferType('partial')}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        offerType === 'partial'
                          ? 'bg-amber-50/70 border-amber-400 text-slate-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-slate-900">Achat Partiel (Sélection)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {localSelectedSiteIds.length > 0
                          ? `${localSelectedSiteIds.length} site(s) sélectionné(s)`
                          : 'Sélection d\'un ou plusieurs sites unitaires'}
                      </div>
                    </button>
                  </div>
                </div>

                {/* SÉLECTION DES PROJETS UNITAIRES POUR ACHAT PARTIEL */}
                {offerType === 'partial' && (
                  <div className="p-4 bg-slate-50 border border-amber-300/80 rounded-2xl space-y-3 animate-fadeIn">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-amber-900 block">
                          Sélectionnez les projets visés par votre offre ({localSelectedSiteIds.length} / {availableSites.length} sélectionné(s))
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Cochez les projets souhaités. Les projets déjà vendus sont floutés et non sélectionnables.
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 text-xs">
                        <button
                          type="button"
                          onClick={handleSelectAllLocalSites}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                          <span>Tout cocher</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAllLocalSites}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-semibold transition cursor-pointer"
                        >
                          Tout décocher
                        </button>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={siteSearchTerm}
                        onChange={(e) => setSiteSearchTerm(e.target.value)}
                        placeholder="Filtrer les projets par commune, département, client..."
                        className="w-full pl-8 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                      {siteSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setSiteSearchTerm('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* List of sites */}
                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white pr-1">
                      {filteredModalSites.map((site) => {
                        const pKey = site.portfolioId === 'volta' ? 'volta' : 'helios';
                        const isSold = soldSites?.[pKey]?.includes(site.id);
                        const isChecked = localSelectedSiteIds.includes(site.id);
                        const powerText = site.kwc ? `${site.kwc} kWc` : `${site.kw || 500} kW`;

                        return (
                          <div
                            key={`${site.portfolioId}-${site.id}`}
                            onClick={() => !isSold && handleToggleLocalSite(site.id)}
                            className={`p-2.5 flex items-center justify-between text-xs transition ${
                              isSold
                                ? 'opacity-40 cursor-not-allowed bg-slate-50'
                                : isChecked
                                ? 'bg-amber-50/80 text-slate-900 cursor-pointer'
                                : 'hover:bg-slate-50 text-slate-700 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <input
                                type="checkbox"
                                disabled={isSold}
                                checked={isChecked && !isSold}
                                onChange={() => {}}
                                className="rounded border-slate-300 text-amber-500 focus:ring-0 shrink-0 cursor-pointer"
                              />
                              <div className="min-w-0 truncate">
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-slate-400 text-[10px] font-bold">#{site.id}</span>
                                  <span className={`font-bold text-slate-900 truncate text-xs ${isSold ? 'blur-[3px] select-none' : ''}`}>
                                    {site.name || site.ville}
                                  </span>
                                  <span className={`px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200 ${isSold ? 'blur-[3px] select-none' : ''}`}>
                                    Dép {site.dept || (site.cp ? site.cp.substring(0, 2) : '-')}
                                  </span>
                                  {targetPortfolio === 'both' && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                      {site.portfolioName}
                                    </span>
                                  )}
                                  {isSold && (
                                    <span className="px-2 py-0.2 rounded-full bg-red-600 text-white font-black text-[9px] uppercase tracking-wider shadow-xs">
                                      Vendu !
                                    </span>
                                  )}
                                </div>
                                {site.client && (
                                  <div className={`text-[10px] text-slate-400 truncate mt-0.5 ${isSold ? 'blur-[3px] select-none' : ''}`}>
                                    Client : {site.client} • Typologie : {site.type}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0 text-right ml-2">
                              <span className={`font-mono font-bold text-amber-700 text-xs ${isSold ? 'blur-[3px] select-none' : ''}`}>
                                {powerText}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {filteredModalSites.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-400">
                          Aucun projet ne correspond à votre recherche.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextFromStep1}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <span>Étape suivante : Tarif proposé</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* ÉTAPE 2 : MONTANT / TARIF GLOBAL PROPOSÉ                      */}
            {/* ============================================================= */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tarif global proposé pour le périmètre retenu (€ HT) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      required
                      value={amountEur}
                      onChange={(e) => setAmountEur(formatThousands(e.target.value))}
                      placeholder="Ex : 5 000 000"
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-base placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
                      EUR HT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Montant net vendeur hors frais d'actes et honoraires de conseils juridiques.
                  </p>
                </div>

                {/* Optional Comments */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Remarques ou conditions particulières (optionnel)
                  </label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Précisez ici vos conditions suspensives souhaitées, calendrier cible ou remarques..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextFromStep2}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <span>Étape suivante : Sélection des jalons</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* ÉTAPE 3 : SÉLECTION DES JALONS PARMI LES 4 JALONS STANDARDS    */}
            {/* ============================================================= */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Sélectionnez vos jalons de paiement et affectez leurs pourcentages
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Cochez les jalons souhaités parmi les 4 jalons types. Aucun jalon n'est coché par défaut.
                    </span>
                  </div>

                  <div className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
                    totalPercent === 100
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    Total : {totalPercent}% / 100%
                  </div>
                </div>

                {/* The 4 Selectable Milestones */}
                <div className="space-y-2.5">
                  {STANDARD_MILESTONES.map((std) => {
                    const isSelected = !!selectedMilestonesMap[std.key]?.selected;
                    const percentVal = selectedMilestonesMap[std.key]?.percentage || std.defaultPercent;
                    const computedEur = Math.round((numericAmount * percentVal) / 100);

                    return (
                      <div
                        key={std.key}
                        className={`p-4 rounded-2xl border transition ${
                          isSelected
                            ? 'bg-amber-50/40 border-amber-400 shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleMilestone(std)}
                            className="flex items-start space-x-3 text-left flex-grow cursor-pointer"
                          >
                            <div className="mt-0.5 text-amber-600">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-amber-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className={`text-xs font-bold ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                                Jalon {std.id} — {std.title}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {std.targetCondition}
                              </div>
                            </div>
                          </button>

                          {/* Percent & Amount input when selected */}
                          {isSelected && (
                            <div className="flex items-center space-x-2 shrink-0">
                              <div className="text-right">
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {formatThousands(computedEur)} €
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={percentVal}
                                  onChange={(e) => handlePercentageChange(std.key, e.target.value)}
                                  className="w-16 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-amber-700 font-bold font-mono text-right focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                />
                                <span className="text-xs text-slate-500 font-mono">%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recap Bar */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                  <div className="text-slate-700">
                    <span>Montant total : </span>
                    <strong className="text-emerald-700 font-bold font-mono">
                      {formatThousands(numericAmount)} € HT
                    </strong>
                    <span className="text-slate-500 ml-2">({activeMilestones.length} jalon(s) actif(s))</span>
                  </div>
                  <div className={`font-mono font-bold ${totalPercent === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {totalPercent === 100 ? '✓ Total 100% OK' : `Reste à affecter : ${100 - totalPercent}%`}
                  </div>
                </div>

                {/* Navigation & Submit Buttons */}
                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour au montant</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || totalPercent !== 100 || activeMilestones.length === 0}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Transmission en cours...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {mode === 'modify'
                            ? 'Enregistrer les modifications'
                            : mode === 'counter_proposal'
                            ? 'Transmettre la contre-proposition'
                            : 'Transmettre l\'offre avec jalonnements'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
