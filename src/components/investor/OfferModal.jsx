import React, { useState } from 'react';
import { Coins, X, CheckCircle2, Building, ShieldCheck, AlertCircle, Send, Layers, Calendar, Plus, Trash2 } from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { investorService } from '@/services/investorService';

export default function OfferModal({
  portfolio,
  selectedSiteIds = [],
  isOpen,
  onClose,
}) {
  const { currentInvestor, submitOffer } = useInvestorStore();

  const [targetPortfolio, setTargetPortfolio] = useState(portfolio?.id || 'helios');
  const [offerType, setOfferType] = useState(
    selectedSiteIds.length > 0 ? 'partial' : 'total'
  );
  const [amountEur, setAmountEur] = useState('');

  // Default Jalonnements / Milestones
  const [milestones, setMilestones] = useState([
    { id: 1, label: 'Jalon 1 — Signature de la promesse de cession (Upfront)', percentage: 30 },
    { id: 2, label: 'Jalon 2 — Purge du recours des tiers / Urbanisme purgé', percentage: 30 },
    { id: 3, label: 'Jalon 3 — Obtention de la PTF / Accord Enedis', percentage: 20 },
    { id: 4, label: 'Jalon 4 — Ready to Build (RTB) & Closing définitif', percentage: 20 },
  ]);

  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOffer, setSubmittedOffer] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const totalSitesCount = portfolio?.sites?.length || (targetPortfolio === 'both' ? 56 : 25);
  const sitesToIncludeCount =
    offerType === 'total' ? totalSitesCount : (selectedSiteIds.length || 1);

  const numericAmount = parseFloat((amountEur || '0').replace(/\s/g, '').replace(',', '.'));

  const handleMilestonePercentChange = (id, newPercent) => {
    const val = parseInt(newPercent) || 0;
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, percentage: val } : m))
    );
  };

  const handleMilestoneLabelChange = (id, newLabel) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, label: newLabel } : m))
    );
  };

  const totalPercent = milestones.reduce((sum, m) => sum + (m.percentage || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Veuillez renseigner un montant valide en euros.');
      return;
    }

    if (totalPercent !== 100) {
      setError(`La somme des jalonnements de paiement doit être égale à 100% (actuellement : ${totalPercent}%).`);
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

      const detailedMilestones = milestones.map((m) => ({
        ...m,
        amount: Math.round((numericAmount * m.percentage) / 100),
      }));

      const offerData = {
        portfolioId: targetPortfolio,
        portfolioName: pName,
        offerType,
        selectedSiteIds: offerType === 'total' ? [] : selectedSiteIds,
        selectedSitesCount: sitesToIncludeCount,
        amountEur: numericAmount,
        milestones: detailedMilestones,
        upfrontPercent: milestones[0]?.percentage || 30,
        earnoutPercent: 100 - (milestones[0]?.percentage || 30),
        comments,
      };

      const result = submitOffer(offerData);
      // Attempt email notification via Formspree in background
      await investorService.sendOfferNotification(result.offer);

      setSubmittedOffer(result.offer);
    } catch (err) {
      setError('Une erreur est survenue lors de la soumission de l\'offre.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedOffer(null);
    setAmountEur('');
    setComments('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Close button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedOffer ? (
          /* Success State */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-block mb-2">
                Offre Enregistrée
              </span>
              <h3 className="text-2xl font-black text-white">Offre Indicative Transmise !</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Votre proposition d'acquisition avec jalonnements a été enregistrée sous la référence{' '}
                <strong className="text-amber-400 font-mono">{submittedOffer.id}</strong>.
              </p>
            </div>

            <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700 text-left text-xs space-y-2.5 max-w-lg mx-auto">
              <div className="flex justify-between">
                <span className="text-gray-400">Périmètre :</span>
                <span className="text-white font-bold">{submittedOffer.portfolioName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Typologie d'acquisition :</span>
                <span className="text-white">
                  {submittedOffer.offerType === 'total'
                    ? `Totalité (${submittedOffer.selectedSitesCount} sites)`
                    : `Partiel (${submittedOffer.selectedSitesCount} site(s) sélectionnés)`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Montant total proposé :</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  {new Intl.NumberFormat('fr-FR').format(submittedOffer.amountEur)} € HT
                </span>
              </div>

              {submittedOffer.milestones && submittedOffer.milestones.length > 0 && (
                <div className="pt-2 border-t border-gray-700 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Jalonnements de paiement retenus :
                  </span>
                  {submittedOffer.milestones.map((m, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-gray-300">
                      <span>• {m.label}</span>
                      <span className="font-mono text-amber-400">
                        {m.percentage}% ({new Intl.NumberFormat('fr-FR').format(m.amount)} €)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Monsieur Yann BARBERIS et le pôle M&A d'ENR Courtage ont été notifiés et reviendront vers vous sous 48h ouvrées.
            </p>

            <button
              onClick={handleResetAndClose}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition"
            >
              Fermer et retourner au dossier
            </button>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                <Coins className="w-4 h-4" />
                <span>Proposition d'Acquisition & Jalonnements</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Faire une proposition d'achat
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Proposez vos conditions indicatives d'acquisition et définissez votre échéancier par jalons de développement.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Portfolio Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Sélection du ou des Portefeuilles cibles
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTargetPortfolio('helios')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition ${
                    targetPortfolio === 'helios'
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  ☀️ HÉLIOS (PV)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetPortfolio('volta')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition ${
                    targetPortfolio === 'volta'
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  🔋 VOLTA (BESS)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetPortfolio('both')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition ${
                    targetPortfolio === 'both'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  ⚡ Les Deux (23.5 MW)
                </button>
              </div>
            </div>

            {/* Scope selection */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Étendue du périmètre
              </label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setOfferType('total')}
                  className={`p-3 rounded-xl border text-left transition ${
                    offerType === 'total'
                      ? 'bg-amber-500/15 border-amber-500/50 text-white'
                      : 'bg-gray-800/50 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">Totalité du portefeuille</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Tous les sites du périmètre choisi
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOfferType('partial')}
                  className={`p-3 rounded-xl border text-left transition ${
                    offerType === 'partial'
                      ? 'bg-amber-500/15 border-amber-500/50 text-white'
                      : 'bg-gray-800/50 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">Achat Partiel (Sélection)</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {selectedSiteIds.length > 0
                      ? `${selectedSiteIds.length} site(s) sélectionné(s)`
                      : 'Sélectionnez des sites dans le tableau'}
                  </div>
                </button>
              </div>
            </div>

            {/* Price input */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Montant global proposé (€ HT) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={amountEur}
                  onChange={(e) => setAmountEur(e.target.value)}
                  placeholder="Ex : 2 500 000"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-amber-400 transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 font-mono">
                  EUR HT
                </span>
              </div>
            </div>

            {/* JALONNEMENTS / MILESTONES */}
            <div className="space-y-2.5 bg-gray-800/40 p-4 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Jalonnements d'échéancier indicatif</span>
                </span>
                <span className={`font-mono ${totalPercent === 100 ? 'text-emerald-400' : 'text-red-400'}`}>
                  Total : {totalPercent}% / 100%
                </span>
              </div>

              <div className="space-y-2">
                {milestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={m.label}
                      onChange={(e) => handleMilestoneLabelChange(m.id, e.target.value)}
                      className="flex-grow px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={m.percentage}
                        onChange={(e) => handleMilestonePercentChange(m.id, e.target.value)}
                        className="w-16 px-2 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-amber-400 font-mono text-right focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-xs text-gray-400 font-mono">%</span>
                    </div>
                  </div>
                ))}
              </div>

              {numericAmount > 0 && (
                <div className="pt-2 border-t border-gray-700/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-gray-400">
                  {milestones.map((m) => (
                    <div key={m.id} className="bg-gray-900/80 p-1.5 rounded border border-gray-800">
                      <span className="text-gray-500 block truncate">Jalon {m.id} ({m.percentage}%)</span>
                      <span className="font-mono text-white font-bold">
                        {new Intl.NumberFormat('fr-FR').format(Math.round((numericAmount * m.percentage) / 100))} €
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments / Conditions */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Conditions particulières / Remarques (optionnel)
              </label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Précisez ici vos éventuelles conditions suspensives ou calendrier souhaité..."
                className="w-full px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {/* Investor stamp */}
            <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Offre transmise par <strong>{currentInvestor?.name}</strong> ({currentInvestor?.company})
                </span>
              </div>
              <span className="text-gray-500 font-mono">Sous couvert du NDA bilatéral</span>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || totalPercent !== 100}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Transmission...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmettre l'offre avec jalonnements</span>
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
