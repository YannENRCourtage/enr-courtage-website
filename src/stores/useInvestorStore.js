import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { INVESTORS } from '@/data/investorData';

export const useInvestorStore = create(
  persist(
    (set, get) => ({
      // Current logged in investor session
      currentInvestor: null,

      // List of all investors (persisted so admin edits or demo registrations work)
      investors: INVESTORS,

      // Filter: exclude 4 urban-risk projects (default true like in the reference teaser)
      excludeOrange: true,

      // List of offers submitted
      offers: [],

      // Toggle orange projects filter
      toggleExcludeOrange: () => set((state) => ({ excludeOrange: !state.excludeOrange })),

      // Authentication action
      login: (code, password) => {
        const cleanCode = (code || '').trim().toUpperCase();
        const cleanPass = (password || '').trim();

        const allInvestors = get().investors;
        const investor = allInvestors.find(
          (inv) => inv.code.toUpperCase() === cleanCode && inv.password === cleanPass
        );

        if (!investor) {
          return {
            success: false,
            error: 'Code investisseur ou mot de passe incorrect. Contactez l\'administrateur ENR Courtage.',
          };
        }

        if (investor.status === 'pending') {
          return {
            success: false,
            status: 'pending',
            error: 'Votre compte est en attente de validation par l\'administrateur ENR Courtage. Vous recevrez un e-mail dès validation.',
          };
        }

        set({ currentInvestor: investor });

        return {
          success: true,
          status: investor.status,
          ndaRequired: investor.status === 'nda_required' || !investor.ndaSignedAt,
        };
      },

      // NDA signature
      signNda: (signatureDetails) => {
        const current = get().currentInvestor;
        if (!current) return { success: false, error: 'Non authentifié' };

        const signedAt = new Date().toISOString();
        const updatedInvestor = {
          ...current,
          status: 'active',
          ndaSignedAt: signedAt,
          signatureDetails: {
            fullName: signatureDetails.fullName || current.name,
            company: signatureDetails.company || current.company,
            role: signatureDetails.role || '',
            signedAt,
          },
        };

        const updatedInvestors = get().investors.map((inv) =>
          inv.id === current.id ? updatedInvestor : inv
        );

        set({
          currentInvestor: updatedInvestor,
          investors: updatedInvestors,
        });

        return { success: true };
      },

      // Logout
      logout: () => {
        set({ currentInvestor: null });
      },

      // Submit an offer
      submitOffer: (offerData) => {
        const current = get().currentInvestor;
        const newOffer = {
          id: 'OFFER-' + Date.now(),
          investorId: current?.id || 'ANON',
          investorName: current?.name || 'Inconnu',
          investorCompany: current?.company || '',
          investorEmail: current?.email || '',
          portfolioId: offerData.portfolioId,
          portfolioName: offerData.portfolioName,
          offerType: offerData.offerType, // 'total' | 'partial'
          selectedSiteIds: offerData.selectedSiteIds || [],
          selectedSitesCount: offerData.selectedSitesCount || 0,
          amountEur: offerData.amountEur,
          upfrontPercent: offerData.upfrontPercent || 70,
          earnoutPercent: offerData.earnoutPercent || 30,
          comments: offerData.comments || '',
          status: 'submitted',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          offers: [newOffer, ...state.offers],
        }));

        return { success: true, offer: newOffer };
      },

      // Helper checks
      isAuthenticated: () => {
        return !!get().currentInvestor;
      },

      hasSignedNda: () => {
        const current = get().currentInvestor;
        return current && current.status === 'active' && !!current.ndaSignedAt;
      },
    }),
    {
      name: 'enr-investor-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
