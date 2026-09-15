import React, { useState } from 'react';
import { Coins, X, CheckCircle2, Building, ShieldCheck, AlertCircle, Send } from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { investorService } from '@/services/investorService';

export default function OfferModal({
  portfolio,
  selectedSiteIds = [],
  isOpen,
  onClose,
}) {
  const { currentInvestor, submitOffer } = useInvestorStore();

  const [offerType, setOfferType] = useState(
    selectedSiteIds.length > 0 ? 'partial' : 'total'
  );
  const [amountEur, setAmountEur] = useState('');
  const [upfrontPercent, setUpfrontPercent] = useState(70);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOffer, setSubmittedOffer] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const totalSitesCount = portfolio?.sites?.length || 0;
  const sitesToIncludeCount =
    offerType === 'total' ? totalSitesCount : (selectedSiteIds.length || 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amountEur.replace(/\s/g, '').replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Veuillez renseigner un montant valide en euros.');
      return;
    }

    setIsSubmitting(true);

    try {
      const offerData = {
        portfolioId: portfolio.id,
        portfolioName: portfolio.name,
        offerType,
        selectedSiteIds: offerType === 'total' ? portfolio.sites.map((s) => s.id) : selectedSiteIds,
        selectedSitesCount: sitesToIncludeCount,
        amountEur: numericAmount,
        upfrontPercent,
        earnoutPercent: 100 - upfrontPercent,
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
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
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
              <h3 className="text-2xl font-black text-white">Offre Indicative Transmise !</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">
                Votre proposition d'acquisition a été enregistrée avec succès sous la référence{' '}
                <strong className="text-amber-400 font-mono">{submittedOffer.id}</strong>.
              </p>
            </div>

            <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-gray-400">Portefeuille :</span>
                <span className="text-white font-bold">{portfolio.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Périmètre :</span>
                <span className="text-white">
                  {submittedOffer.offerType === 'total'
                    ? `Totalité (${submittedOffer.selectedSitesCount} sites)`
                    : `Partiel (${submittedOffer.selectedSitesCount} site(s))`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Montant proposé :</span>
                <span className="text-amber-400 font-bold font-mono">
                  {new Intl.NumberFormat('fr-FR').format(submittedOffer.amountEur)} € HT
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Structure de paiement :</span>
                <span className="text-white">
                  {submittedOffer.upfrontPercent}% Upfront / {submittedOffer.earnoutPercent}% Earn-out
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              L'équipe M&A d'ENR Courtage va examiner votre offre et prendra contact avec vous sous 48h ouvrées.
            </p>

            <button
              onClick={handleResetAndClose}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-xs transition"
            >
              Retour au portefeuille
            </button>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                <Coins className="w-4 h-4" />
                <span>Proposition d'Acquisition</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Faire une offre sur {portfolio.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Proposez des conditions indicatives d'acquisition (ferme ou conditionnelle).
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Scope selection */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2">
                Périmètre de l'offre
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOfferType('total')}
                  className={`p-3 rounded-xl border text-left text-xs transition ${
                    offerType === 'total'
                      ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                      : 'bg-gray-800/50 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">Totalité du portefeuille</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Tous les {totalSitesCount} sites ({portfolio.kpis?.totalPower})
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOfferType('partial')}
                  className={`p-3 rounded-xl border text-left text-xs transition ${
                    offerType === 'partial'
                      ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                      : 'bg-gray-800/50 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">Achat Partiel</div>
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
                Montant total proposé (€ HT) *
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

            {/* Payment structure slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-300 mb-2">
                <span>Structure de paiement indicative</span>
                <span className="text-amber-400 font-mono">
                  {upfrontPercent}% Upfront / {100 - upfrontPercent}% Earn-out
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="5"
                value={upfrontPercent}
                onChange={(e) => setUpfrontPercent(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>30% à la signature</span>
                <span>100% comptant</span>
              </div>
            </div>

            {/* Comments / Conditions */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Conditions particulières / Remarques (optionnel)
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Précisez ici vos conditions de franchissement de jalons, calendrier souhaité, clauses suspensives éventuelles..."
                className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {/* Investor stamp */}
            <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Offre émise par <strong>{currentInvestor?.name}</strong> ({currentInvestor?.company})
                </span>
              </div>
              <span className="text-gray-500 font-mono">Confidentialité garantie</span>
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
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Transmission...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmettre l'offre indicative</span>
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
