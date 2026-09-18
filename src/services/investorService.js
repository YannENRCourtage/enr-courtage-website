import { PORTFOLIOS, INVESTORS, computeGlobalKpis, NDA_TEXT, PROCESS_STEPS } from '@/data/investorData';

/**
 * Investor Service
 * Abstraction layer for fetching portfolios, handling investor verification, and submitting offers.
 */
export const investorService = {
  // Get all portfolios
  getPortfolios: () => {
    return PORTFOLIOS;
  },
  getAllPortfolios: () => {
    return PORTFOLIOS;
  },

  // Get portfolio by ID
  getPortfolioById: (id) => {
    return PORTFOLIOS.find((p) => p.id === id) || null;
  },

  // Compute aggregated KPIs
  getGlobalKpis: (excludeOrange = true) => {
    return computeGlobalKpis(PORTFOLIOS, excludeOrange);
  },

  // Get M&A process steps
  getProcessSteps: () => {
    return PROCESS_STEPS;
  },

  // Get NDA text
  getNdaText: () => {
    return NDA_TEXT;
  },

  // Send purchase offer (can notify admin via Formspree)
  sendOfferNotification: async (offer) => {
    try {
      const response = await fetch('https://formspree.io/f/mrblwazb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject: `[OFFRE INVESTISSEUR] ${offer.portfolioName} - ${offer.investorCompany}`,
          investisseur: offer.investorName,
          societe: offer.investorCompany,
          email: offer.investorEmail,
          portefeuille: offer.portfolioName,
          typeOffre: offer.offerType === 'total' ? 'Achat Global' : 'Achat Partiel',
          nbSitesSelectionnes: offer.selectedSitesCount,
          montantPropose: `${new Intl.NumberFormat('fr-FR').format(offer.amountEur)} €`,
          schemaPaiement: `${offer.upfrontPercent}% Upfront / ${offer.earnoutPercent}% Earn-out`,
          commentaires: offer.comments || 'Aucun',
          dateSoumission: new Date(offer.createdAt).toLocaleString('fr-FR'),
        }),
      });

      return { success: response.ok };
    } catch (err) {
      console.warn('Formspree notification error (fallback to local state):', err);
      return { success: true, warning: 'Notification email non envoyée mais offre enregistrée.' };
    }
  },
};
