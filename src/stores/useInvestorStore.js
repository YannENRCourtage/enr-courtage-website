import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { INVESTORS, generateBilateralNdaText } from '@/data/investorData';

// Immediately purge any legacy test sessions from browser localStorage
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    window.localStorage.removeItem('enr-investor-storage');
    window.localStorage.removeItem('enr-investor-storage-v2');
  } catch (e) {
    // Ignore storage access errors in private mode
  }
}

// Helper to generate a random secure password
export function generateRandomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  let pass = 'Enr' + new Date().getFullYear() + '!';
  for (let i = 0; i < 4; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export const useInvestorStore = create(
  persist(
    (set, get) => ({
      // Current logged in session
      currentInvestor: null,

      // List of all investors (starts with default admin and demo accounts, then persisted)
      investors: INVESTORS,

      // Filter: exclude 4 urban-risk projects (default true like in the reference teaser)
      excludeOrange: true,

      // List of offers submitted
      offers: [
        {
          id: 'OFF-2026-001',
          investorId: 'INV-ENEE',
          investorName: 'Alexandre DUPRE',
          investorCompany: 'ENEE ENERGY PARTNERS',
          investorEmail: 'a.dupre@enee-energy.com',
          investorPhone: '06 12 34 56 78',
          portfolioId: 'both',
          portfolioName: 'Portefeuilles Combinés (HÉLIOS PV + VOLTA BESS)',
          offerType: 'total',
          selectedSiteIds: [],
          selectedSitesCount: 56,
          amountEur: 3850000,
          valuationPerMw: '163 760 €/MW',
          milestones: [
            {
              id: 1,
              label: 'Jalon 1 — Signature de la Promesse de Cession (Upfront)',
              percentage: 30,
              amount: 1155000,
              targetCondition: 'Closing signature promesse & mise sous séquestre',
              targetDate: 'T4 2026 (Octobre 2026)',
            },
            {
              id: 2,
              label: 'Jalon 2 — Purge définitive du recours des tiers (Urbanisme)',
              percentage: 30,
              amount: 1155000,
              targetCondition: 'Attestation de non-recours délivrée par les mairies',
              targetDate: 'T1 2027 (Mars 2027)',
            },
            {
              id: 3,
              label: 'Jalon 3 — Obtention de la PTF / Accord de Raccordement Enedis',
              percentage: 20,
              amount: 770000,
              targetCondition: 'Acceptation de la Proposition Technique et Financière',
              targetDate: 'T3 2027 (Septembre 2027)',
            },
            {
              id: 4,
              label: 'Jalon 4 — Ready to Build (RTB) & Cession Définitive',
              percentage: 20,
              amount: 770000,
              targetCondition: 'Démarrage des travaux / Ordre de service constructeur',
              targetDate: 'T1 2028 (Janvier 2028)',
            },
          ],
          upfrontPercent: 30,
          earnoutPercent: 70,
          comments: 'Offre indicative ferme sur le périmètre combiné PV + BESS sous réserve de confirmation des devis d\'exécution charpente et de l\'accord fournisseur batteries 35 k€ / 125 kW.',
          status: 'shortlist', // 'submitted' | 'shortlist' | 'exclusive' | 'accepted' | 'rejected'
          adminNotes: 'Dossier prioritaire. Proposition financière en haut de fourchette. Organiser session Q&A technique.',
          createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        },
      ],

      // Custom Data Room files uploaded by Admin
      customDataRoom: {},

      // Toggle orange projects filter
      toggleExcludeOrange: () => set((state) => ({ excludeOrange: !state.excludeOrange })),

      // Add document to Data Room
      addDocumentToDataRoom: (portfolioId, categoryName, fileObj) => {
        set((state) => {
          const currentPortfolioDocs = state.customDataRoom[portfolioId] || {};
          const currentCatFiles = currentPortfolioDocs[categoryName] || [];
          
          const newDoc = {
            id: 'DOC-' + Date.now(),
            name: fileObj.name,
            type: fileObj.type || 'PDF',
            size: fileObj.size || '1.0 Mo',
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'Yann BARBERIS',
            notes: fileObj.notes || '',
            fileUrl: fileObj.fileUrl || null,
            fileData: fileObj.fileData || null,
          };

          return {
            customDataRoom: {
              ...state.customDataRoom,
              [portfolioId]: {
                ...currentPortfolioDocs,
                [categoryName]: [...currentCatFiles, newDoc],
              },
            },
          };
        });
      },

      // Delete document from Data Room
      deleteDocumentFromDataRoom: (portfolioId, categoryName, docIdOrName) => {
        set((state) => {
          const currentPortfolioDocs = state.customDataRoom[portfolioId] || {};
          const currentCatFiles = currentPortfolioDocs[categoryName] || [];

          const filtered = currentCatFiles.filter(
            (f) => f.id !== docIdOrName && f.name !== docIdOrName
          );

          return {
            customDataRoom: {
              ...state.customDataRoom,
              [portfolioId]: {
                ...currentPortfolioDocs,
                [categoryName]: filtered,
              },
            },
          };
        });
      },

      // Update offer status & admin notes
      updateOfferStatus: (offerId, newStatus, adminNotes) => {
        set((state) => ({
          offers: state.offers.map((off) =>
            off.id === offerId
              ? {
                  ...off,
                  status: newStatus || off.status,
                  adminNotes: adminNotes !== undefined ? adminNotes : off.adminNotes,
                  updatedAt: new Date().toISOString(),
                }
              : off
          ),
        }));
      },

      // Delete an offer
      deleteOffer: (offerId) => {
        set((state) => ({
          offers: state.offers.filter((off) => off.id !== offerId),
        }));
      },

      // Authentication action with EMAIL
      login: (email, password) => {
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();

        // Block any legacy test accounts permanently
        const blockedKeywords = ['meridiam', 'omnes', 'demo', 'test', 'helios2026', 'volta2026', 'demo2026'];
        if (blockedKeywords.some((kw) => cleanEmail.includes(kw))) {
          return {
            success: false,
            error: 'Les comptes de test ont été définitivement supprimés. Veuillez soumettre une demande d\'inscription pour obtenir un accès.',
          };
        }

        // Check if admin hardcoded credentials match directly
        if (cleanEmail === 'y.barberis@enr-courtage.fr' && cleanPass === 'invest@enr!01') {
          const adminUser = {
            id: 'ADMIN-001',
            email: 'y.barberis@enr-courtage.fr',
            name: 'Yann BARBERIS',
            company: 'ENR COURTAGE',
            role: 'Président',
            isAdmin: true,
            status: 'active',
            ndaSignedAt: '2026-08-01T08:00:00Z',
            ndaSignedByAdmin: true,
            createdAt: '2026-08-01T08:00:00Z',
          };
          set({ currentInvestor: adminUser });
          return { success: true, isAdmin: true, status: 'active' };
        }

        const allInvestors = get().investors;
        const investor = allInvestors.find(
          (inv) => inv.email && inv.email.toLowerCase() === cleanEmail && inv.password === cleanPass
        );

        if (!investor) {
          return {
            success: false,
            error: 'Identifiant (e-mail) ou mot de passe incorrect.',
          };
        }

        if (investor.status === 'pending') {
          return {
            success: false,
            status: 'pending',
            error: 'Votre demande d\'inscription et accord NDA sont en cours de validation par l\'administrateur ENR Courtage. Vous recevrez vos accès dès validation.',
          };
        }

        if (investor.status === 'rejected') {
          return {
            success: false,
            status: 'rejected',
            error: 'Votre demande d\'accès n\'a pas été retenue par l\'administrateur. Pour toute question, contactez contact@enr-courtage.fr.',
          };
        }

        set({ currentInvestor: investor });

        return {
          success: true,
          isAdmin: !!investor.isAdmin,
          status: investor.status,
          ndaRequired: !investor.ndaSignedAt || !investor.ndaSignedByAdmin,
        };
      },

      // Register new investor with signed NDA details
      registerRequest: (formData) => {
        const cleanEmail = (formData.email || '').trim().toLowerCase();
        const allInvestors = get().investors;

        // Check if already registered
        const existing = allInvestors.find((inv) => inv.email && inv.email.toLowerCase() === cleanEmail);
        if (existing) {
          return {
            success: false,
            error: 'Cette adresse e-mail est déjà enregistrée. Veuillez vous connecter ou contacter l\'administrateur.',
          };
        }

        const dateStr = new Date().toLocaleDateString('fr-FR');
        const generatedNda = generateBilateralNdaText({
          companyName: formData.companyName,
          legalForm: formData.legalForm,
          headOffice: formData.headOffice,
          rcsNumber: formData.rcsNumber,
          rcsCity: formData.rcsCity,
          representativeName: formData.representativeName,
          representativeRole: formData.representativeRole,
          dateStr,
          adminSigned: false,
          userSigned: true,
        });

        const newInvestor = {
          id: 'INV-' + Date.now(),
          email: cleanEmail,
          password: '', // Assigned upon admin approval
          name: formData.representativeName,
          company: formData.companyName,
          legalForm: formData.legalForm,
          headOffice: formData.headOffice,
          rcsNumber: formData.rcsNumber,
          rcsCity: formData.rcsCity,
          role: formData.representativeRole,
          phone: formData.phone || '',
          isAdmin: false,
          status: 'pending', // Pending admin approval
          userNdaSignedAt: new Date().toISOString(),
          ndaSignedByAdmin: false,
          adminSignedAt: null,
          ndaText: generatedNda,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          investors: [newInvestor, ...state.investors],
        }));

        return { success: true, investor: newInvestor };
      },

      // Admin action: Validate & counter-sign NDA
      adminValidateInvestor: (investorId, generatedPassword) => {
        const pass = generatedPassword || generateRandomPassword();
        const signedAt = new Date().toISOString();
        const dateStr = new Date().toLocaleDateString('fr-FR');

        let validatedInvestor = null;

        const updatedInvestors = get().investors.map((inv) => {
          if (inv.id === investorId) {
            const countersignedNda = generateBilateralNdaText({
              companyName: inv.company,
              legalForm: inv.legalForm,
              headOffice: inv.headOffice,
              rcsNumber: inv.rcsNumber,
              rcsCity: inv.rcsCity,
              representativeName: inv.name,
              representativeRole: inv.role,
              dateStr,
              adminSigned: true,
              userSigned: true,
            });

            validatedInvestor = {
              ...inv,
              status: 'active',
              password: pass,
              ndaSignedAt: inv.userNdaSignedAt || signedAt,
              ndaSignedByAdmin: true,
              adminSignedAt: signedAt,
              ndaText: countersignedNda,
            };
            return validatedInvestor;
          }
          return inv;
        });

        set({ investors: updatedInvestors });

        // Generate email template
        const emailSubject = `Validation de votre accès Espace Investisseurs ENR Courtage & NDA contre-signé`;
        const emailBody = `Bonjour ${validatedInvestor?.name || ''},

Nous avons le plaisir de vous confirmer la validation de votre demande d'accès à la plateforme de cession de portefeuilles d'ENR Courtage, ainsi que la contre-signature de notre accord de confidentialité bilatéral (NDA).

Vos identifiants personnels de connexion sont les suivants :
- Lien d'accès : https://www.enr-courtage.fr/investisseurs
- Identifiant (e-mail) : ${validatedInvestor?.email}
- Mot de passe : ${pass}

Vous pouvez dès à présent vous connecter pour accéder à l'ensemble des éléments transactionnels :
- Portefeuille HÉLIOS (PV 8.01 MWc fermes / 25 sites sécurisés)
- Portefeuille VOLTA (BESS 15.50 MW / 31 sites standardisés 4x125 kW)
- Teasers d'investissement et matrices économiques détaillées
- Data Room virtuelle complète (fiches synoptiques, devis travaux, PdB, accord fournisseur BESS)
- Formulaire de proposition d'achat indicatif (global ou partiel selon jalonnements)

Nous restons à votre entière disposition pour tout échange complémentaire.

Bien cordialement,

Yann BARBERIS
Président — ENR COURTAGE
y.barberis@enr-courtage.fr | 05 35 54 85 99
7 rue Gutenberg, 33700 Mérignac`;

        return {
          success: true,
          investor: validatedInvestor,
          password: pass,
          emailSubject,
          emailBody,
        };
      },

      // Admin action: Invalidate / reject request
      adminRejectInvestor: (investorId) => {
        const updated = get().investors.map((inv) =>
          inv.id === investorId ? { ...inv, status: 'rejected' } : inv
        );
        set({ investors: updated });
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
          milestones: offerData.milestones || [],
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

      isAdmin: () => {
        const current = get().currentInvestor;
        return current && (current.isAdmin || current.email === 'y.barberis@enr-courtage.fr');
      },

      hasSignedNda: () => {
        const current = get().currentInvestor;
        if (!current) return false;
        if (current.isAdmin) return true;
        return current.status === 'active' && !!current.ndaSignedByAdmin;
      },
    }),
    {
      name: 'enr-investor-storage-v3',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Automatically disconnect any legacy test accounts
        const testEmails = [
          'investisseur.test@enr-courtage.fr',
          'jm.dupont@meridiam.com',
          's.laurent@omnescapital.com',
          'demo@enr-courtage.fr',
        ];
        if (state.currentInvestor && testEmails.includes(state.currentInvestor.email?.toLowerCase())) {
          state.currentInvestor = null;
        }
        if (state.investors) {
          state.investors = state.investors.filter(
            (inv) =>
              !testEmails.includes(inv.email?.toLowerCase()) &&
              inv.id !== 'INV-001' &&
              inv.id !== 'INV-002' &&
              inv.id !== 'INV-003'
          );
        }
      },
    }
  )
);
