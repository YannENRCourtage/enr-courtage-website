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

      // Deleted default/demo Data Room documents per portfolio
      deletedDefaultDocs: {},

      // Tracking of document downloads by investor email
      userDownloads: {},

      // Centralized M&A messages between investors and Yann BARBERIS
      messages: [
        {
          id: 'msg-1',
          from: 'investor',
          authorName: 'Jean DUS',
          authorCompany: 'ENEE Energy Partners',
          investorEmail: 'yannbarberis@msn.com',
          text: 'Bonjour Yann, pouvez-vous nous confirmer que les 31 sites BESS bénéficient bien du tarif HTA1 Courte Utilisation sous CRE 2025-227 ?',
          createdAt: '2026-09-17T14:15:00Z',
        },
        {
          id: 'msg-2',
          from: 'admin',
          authorName: 'Yann BARBERIS',
          authorCompany: 'ENR COURTAGE',
          investorEmail: 'yannbarberis@msn.com',
          text: "Bonjour Jean. Absolument, la délibération 2025-227 neutralise la part variable sur l'électricité réinjectée. Seules les 12% de pertes de cycle sont soumises à la CS. Nous avons versé la note de calcul exacte en Data Room.",
          createdAt: '2026-09-17T14:28:00Z',
        },
      ],

      sendMessage: ({ text, from, authorName, authorCompany, investorEmail }) => {
        if (!text || !text.trim()) return;
        set((state) => ({
          messages: [
            ...(state.messages || []),
            {
              id: 'msg-' + Date.now(),
              from: from || 'investor',
              authorName: authorName || 'Investisseur',
              authorCompany: authorCompany || '',
              investorEmail: investorEmail || '',
              text: text.trim(),
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      // Sites marqués comme "Vendu !" par l'administrateur
      soldSites: { helios: [], volta: [] },

      // Sites supprimés du tableau par l'administrateur
      deletedSites: { helios: [], volta: [] },

      // Affectation des documents aux projets : { [docIdentifier]: [siteId1, siteId2] }
      documentSiteAssignments: {
        'Promesse de bail signée — Parcelle CONSOLI (PRIGONRIEUX)': [4],
        'Promesse_de_bail_CONSOLI_signe.pdf': [4],
        'Promesse de bail signée — Batterie BATIOT (MONGAUSY)': [2],
        'Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf': [2],
        'Promesse de bail signée — Batterie CASTEBRUNET (CAUSSADE)': [10, 20, 22, 31],
        'Promesse_de_bail_Castebrunet.pdf': [10, 20, 22, 31],
      },

      // Affecter un document à un ou plusieurs projets
      assignDocumentToSites: (docIdentifier, siteIds) => {
        if (!docIdentifier) return;
        const cleanIds = Array.isArray(siteIds) ? siteIds.map(Number).filter((n) => !isNaN(n)) : [Number(siteIds)].filter((n) => !isNaN(n));
        set((state) => {
          const nextAssignments = { ...state.documentSiteAssignments };
          if (Array.isArray(docIdentifier)) {
            docIdentifier.filter(Boolean).forEach((id) => {
              nextAssignments[id] = cleanIds;
            });
          } else {
            nextAssignments[docIdentifier] = cleanIds;
          }
          return { documentSiteAssignments: nextAssignments };
        });
      },

      // Retirer l'affectation d'un document pour un projet
      unassignDocumentFromSite: (docIdentifier, siteId) => {
        if (!docIdentifier) return;
        set((state) => {
          const current = state.documentSiteAssignments?.[docIdentifier] || [];
          return {
            documentSiteAssignments: {
              ...state.documentSiteAssignments,
              [docIdentifier]: current.filter((id) => id !== siteId),
            },
          };
        });
      },

      // Marquer / Démarquer un site comme Vendu !
      toggleSoldSite: (portfolioId, siteId) => {
        const pId = String(portfolioId || 'helios').toLowerCase().includes('volta') ? 'volta' : 'helios';
        set((state) => {
          const currentSold = state.soldSites?.[pId] || [];
          const isSold = currentSold.includes(siteId);
          const newSold = isSold ? currentSold.filter((id) => id !== siteId) : [...currentSold, siteId];
          return {
            soldSites: {
              ...state.soldSites,
              [pId]: newSold,
            },
          };
        });
      },

      // Supprimer un projet d'un portefeuille
      deleteSite: (portfolioId, siteId) => {
        const pId = String(portfolioId || 'helios').toLowerCase().includes('volta') ? 'volta' : 'helios';
        set((state) => {
          const currentDeleted = state.deletedSites?.[pId] || [];
          if (currentDeleted.includes(siteId)) return state;
          return {
            deletedSites: {
              ...state.deletedSites,
              [pId]: [...currentDeleted, siteId],
            },
          };
        });
      },

      // Restaurer un projet supprimé
      restoreSite: (portfolioId, siteId) => {
        const pId = String(portfolioId || 'helios').toLowerCase().includes('volta') ? 'volta' : 'helios';
        set((state) => {
          const currentDeleted = state.deletedSites?.[pId] || [];
          return {
            deletedSites: {
              ...state.deletedSites,
              [pId]: currentDeleted.filter((id) => id !== siteId),
            },
          };
        });
      },

      // Add document to Data Room
      addDocumentToDataRoom: (portfolioId, categoryName, fileObj) => {
        set((state) => {
          const currentPortfolioDocs = state.customDataRoom[portfolioId] || {};
          const currentCatFiles = currentPortfolioDocs[categoryName] || [];
          
          const newDoc = {
            id: fileObj.id || ('DOC-' + Date.now()),
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
                [categoryName]: [...currentCatFiles.filter((f) => f.name !== newDoc.name), newDoc],
              },
            },
          };
        });
      },

      // Add batch documents to Data Room with individual categories
      addBatchDocumentsToDataRoom: (portfolioId, filesList) => {
        set((state) => {
          const currentPortfolioDocs = { ...(state.customDataRoom[portfolioId] || {}) };

          filesList.forEach((fileObj, idx) => {
            const cat = fileObj.category || 'Juridique';
            const catFiles = currentPortfolioDocs[cat] ? [...currentPortfolioDocs[cat]] : [];

            const newDoc = {
              id: fileObj.id || ('DOC-' + Date.now() + '-' + idx),
              name: fileObj.name,
              type: fileObj.type || 'PDF',
              size: fileObj.size || '1.0 Mo',
              uploadedAt: new Date().toISOString(),
              uploadedBy: 'Yann BARBERIS',
              notes: fileObj.notes || '',
              fileUrl: fileObj.fileUrl || null,
              fileData: fileObj.fileData || null,
            };

            currentPortfolioDocs[cat] = [
              ...catFiles.filter((f) => f.name !== newDoc.name),
              newDoc,
            ];
          });

          return {
            customDataRoom: {
              ...state.customDataRoom,
              [portfolioId]: currentPortfolioDocs,
            },
          };
        });
      },

      // Delete custom document from Data Room
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

      // Delete default / demo document from Data Room
      deleteDefaultDoc: (portfolioId, docName) => {
        set((state) => {
          const prev = state.deletedDefaultDocs?.[portfolioId] || [];
          if (prev.includes(docName)) return state;
          return {
            deletedDefaultDocs: {
              ...(state.deletedDefaultDocs || {}),
              [portfolioId]: [...prev, docName],
            },
          };
        });
      },

      // Delete a custom category or empty folder
      deleteCategory: (portfolioId, categoryName) => {
        set((state) => {
          const portfolioCustom = { ...(state.customDataRoom?.[portfolioId] || {}) };
          delete portfolioCustom[categoryName];

          return {
            customDataRoom: {
              ...(state.customDataRoom || {}),
              [portfolioId]: portfolioCustom,
            },
          };
        });
      },

      // Move a document from one portfolio to another (supports custom or default documents)
      moveDocument: ({ sourcePortfolioId, targetPortfolioId, doc, sourceCategory, targetCategory }) => {
        set((state) => {
          const sourceCustom = state.customDataRoom?.[sourcePortfolioId] || {};
          const targetCustom = state.customDataRoom?.[targetPortfolioId] || {};

          const sourceCatFiles = sourceCustom[sourceCategory] || [];
          const existingIndex = sourceCatFiles.findIndex(
            (f) => f.id === doc.id || f.name === doc.name
          );

          let docToMove = doc;
          let newSourceCatFiles = sourceCatFiles;
          const updatedDeletedDefaults = { ...(state.deletedDefaultDocs || {}) };

          if (existingIndex !== -1) {
            docToMove = sourceCatFiles[existingIndex];
            newSourceCatFiles = sourceCatFiles.filter((_, idx) => idx !== existingIndex);
          } else {
            // It was a default file! Mark it as removed from source portfolio
            const currentDeleted = updatedDeletedDefaults[sourcePortfolioId] || [];
            if (!currentDeleted.includes(doc.name)) {
              updatedDeletedDefaults[sourcePortfolioId] = [...currentDeleted, doc.name];
            }
          }

          // Add to target customDataRoom under targetCategory
          const targetCatFiles = targetCustom[targetCategory] || [];
          const updatedTargetCatFiles = [
            ...targetCatFiles.filter((f) => f.name !== docToMove.name),
            {
              ...docToMove,
              id: docToMove.id || ('DOC-' + Date.now()),
              movedFrom: sourcePortfolioId,
              movedAt: new Date().toISOString(),
            },
          ];

          return {
            deletedDefaultDocs: updatedDeletedDefaults,
            customDataRoom: {
              ...(state.customDataRoom || {}),
              [sourcePortfolioId]: {
                ...sourceCustom,
                [sourceCategory]: newSourceCatFiles,
              },
              [targetPortfolioId]: {
                ...targetCustom,
                [targetCategory]: updatedTargetCatFiles,
              },
            },
          };
        });
      },

      // Record a document download by an investor
      recordDownload: ({ userEmail, userName, userCompany, portfolioId, portfolioName, fileName, fileSize, fileType }) => {
        if (!userEmail) return;
        const cleanEmail = userEmail.trim().toLowerCase();
        set((state) => {
          const prevMap = state.userDownloads || {};
          const prevList = prevMap[cleanEmail] || [];

          const newRecord = {
            id: 'DL-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            portfolioId: portfolioId || 'helios',
            portfolioName: portfolioName || (portfolioId === 'volta' ? 'PROJET VOLTA' : 'PROJET HÉLIOS'),
            fileName: fileName || 'Document',
            fileSize: fileSize || '',
            fileType: fileType || 'PDF',
            userName: userName || '',
            userCompany: userCompany || '',
            downloadedAt: new Date().toISOString(),
          };

          return {
            userDownloads: {
              ...prevMap,
              [cleanEmail]: [newRecord, ...prevList],
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
        const blockedKeywords = ['meridiam', 'omnes', 'demo', 'test@', 'helios2026', 'volta2026', 'demo2026'];
        if (blockedKeywords.some((kw) => cleanEmail.includes(kw))) {
          return {
            success: false,
            error: 'Ce compte de test a été supprimé. Veuillez utiliser vos identifiants personnels ou soumettre une demande.',
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

        let allInvestors = get().investors || [];
        let investor = allInvestors.find(
          (inv) => inv.email && inv.email.trim().toLowerCase() === cleanEmail && (inv.password?.trim() === cleanPass)
        );

        // Fallback to default INVESTORS array if not found in state (e.g. fresh device or cleared localStorage)
        if (!investor) {
          const defaultMatch = INVESTORS.find(
            (inv) => inv.email && inv.email.trim().toLowerCase() === cleanEmail && (inv.password?.trim() === cleanPass)
          );
          if (defaultMatch) {
            investor = defaultMatch;
            set((state) => ({
              investors: [defaultMatch, ...(state.investors || []).filter((i) => i.email?.toLowerCase() !== cleanEmail)],
            }));
          }
        }

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

        if (investor.status === 'rejected' || investor.status === 'suspended') {
          return {
            success: false,
            status: investor.status,
            error: 'Votre accès est actuellement désactivé. Pour toute question, contactez contact@enr-courtage.fr.',
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
- Portefeuille HÉLIOS (PV 9.12 MWc / 29 sites sécurisés)
- Portefeuille VOLTA (BESS 15.50 MW / 31 sites 4x125 kW)
- Teasers d'investissement et matrices économiques détaillées
- Data Room virtuelle complète (fiches synoptiques, devis travaux, PdB, accord fournisseur BESS)
- Formulaire de proposition d'achat indicatif (global ou partiel selon jalonnements)

Nous restons à votre entière disposition pour tout échange complémentaire.

Bien cordialement,

Yann BARBERIS
Président — ENR COURTAGE
y.barberis@enr-courtage.fr
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

      // Admin action: Add new user directly
      adminAddUser: ({
        name,
        company,
        email,
        password,
        role = 'Investisseur',
        phone = '',
        isAdmin = false,
        status = 'active',
        ndaFileName = '',
        ndaFileSize = 0,
        ndaDocumentId = '',
        ndaFileBase64 = '',
        hasUploadedSignedNda = false,
      }) => {
        const cleanEmail = (email || '').trim().toLowerCase();
        const pass = (password || '').trim() || generateRandomPassword();
        const existing = get().investors.find((i) => i.email && i.email.trim().toLowerCase() === cleanEmail);
        if (existing) {
          return { success: false, error: 'Un utilisateur avec cette adresse e-mail existe déjà.' };
        }

        const dateStr = new Date().toLocaleDateString('fr-FR');
        const ndaText = generateBilateralNdaText({
          companyName: (company || 'Investisseur').trim(),
          legalForm: 'Société commerciale',
          headOffice: 'Siège social',
          rcsNumber: 'RCS',
          rcsCity: 'France',
          representativeName: (name || 'Représentant').trim(),
          representativeRole: (role || 'Investisseur').trim(),
          dateStr,
          adminSigned: true,
          userSigned: true,
        });

        const newUser = {
          id: 'USR-' + Date.now(),
          name: (name || '').trim(),
          company: (company || '').trim(),
          email: cleanEmail,
          password: pass,
          role: (role || 'Investisseur').trim(),
          phone: (phone || '').trim(),
          isAdmin: !!isAdmin,
          status: status || 'active',
          ndaSignedAt: new Date().toISOString(),
          ndaSignedByAdmin: true,
          adminSignedAt: new Date().toISOString(),
          hasUploadedSignedNda: !!hasUploadedSignedNda || !!ndaFileName,
          ndaFileName: ndaFileName || '',
          ndaFileSize: ndaFileSize || 0,
          ndaDocumentId: ndaDocumentId || '',
          ndaFileBase64: ndaFileBase64 || '',
          ndaText: ndaFileName
            ? `Document NDA original signé téléversé : ${ndaFileName}`
            : ndaText,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          investors: [newUser, ...(state.investors || [])],
        }));

        return { success: true, user: newUser, password: pass };
      },

      // Admin action: Update existing user
      adminUpdateUser: (userId, updatedFields) => {
        set((state) => ({
          investors: state.investors.map((inv) => {
            if (inv.id !== userId) return inv;
            const updated = {
              ...inv,
              ...updatedFields,
              email: updatedFields.email ? updatedFields.email.trim().toLowerCase() : inv.email,
              password: updatedFields.password !== undefined ? updatedFields.password.trim() : inv.password,
              updatedAt: new Date().toISOString(),
            };
            // If current logged-in user is updated, keep currentInvestor in sync
            if (state.currentInvestor?.id === userId) {
              state.currentInvestor = updated;
            }
            return updated;
          }),
        }));
        return { success: true };
      },

      // Admin action: Delete user
      adminDeleteUser: (userId) => {
        set((state) => ({
          investors: state.investors.filter((inv) => inv.id !== userId),
        }));
        return { success: true };
      },

      // Admin action: Reset user password
      adminResetPassword: (userId, newPassword) => {
        const pass = (newPassword || '').trim() || generateRandomPassword();
        set((state) => ({
          investors: state.investors.map((inv) => {
            if (inv.id !== userId) return inv;
            return {
              ...inv,
              password: pass,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        return { success: true, password: pass };
      },

      // Logout
      logout: () => {
        set({ currentInvestor: null });
      },

      // Submit a new offer
      submitOffer: (offerData) => {
        const current = get().currentInvestor;
        const newOffer = {
          id: 'OFFER-' + Date.now(),
          investorId: current?.id || 'ANON',
          investorName: current?.name || 'Inconnu',
          investorCompany: current?.company || '',
          investorEmail: current?.email || '',
          investorPhone: current?.phone || '',
          portfolioId: offerData.portfolioId,
          portfolioName: offerData.portfolioName,
          offerType: offerData.offerType, // 'total' | 'partial'
          selectedSiteIds: offerData.selectedSiteIds || [],
          selectedSitesCount: offerData.selectedSitesCount || 0,
          amountEur: offerData.amountEur,
          milestones: offerData.milestones || [],
          upfrontPercent: offerData.upfrontPercent || 30,
          earnoutPercent: offerData.earnoutPercent || 70,
          comments: offerData.comments || '',
          status: 'submitted', // 'submitted' | 'counter_by_admin' | 'counter_by_investor' | 'agreement_reached' | 'mandate_signed' | 'rejected'
          history: [
            {
              type: 'submission',
              author: current?.name || 'Investisseur',
              authorRole: 'investor',
              amountEur: offerData.amountEur,
              milestones: offerData.milestones || [],
              comments: offerData.comments || '',
              date: new Date().toISOString(),
            },
          ],
          counterOffer: null,
          mandate: {
            investorSigned: false,
            investorSignedAt: null,
            adminSigned: false,
            adminSignedAt: null,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          offers: [newOffer, ...state.offers],
        }));

        return { success: true, offer: newOffer };
      },

      // Modify / Revise an offer by the investor (while in submitted state)
      modifyOffer: (offerId, updatedData) => {
        set((state) => ({
          offers: state.offers.map((off) => {
            if (off.id !== offerId) return off;
            const updated = {
              ...off,
              amountEur: updatedData.amountEur !== undefined ? updatedData.amountEur : off.amountEur,
              milestones: updatedData.milestones || off.milestones,
              comments: updatedData.comments !== undefined ? updatedData.comments : off.comments,
              portfolioId: updatedData.portfolioId || off.portfolioId,
              portfolioName: updatedData.portfolioName || off.portfolioName,
              offerType: updatedData.offerType || off.offerType,
              selectedSiteIds: updatedData.selectedSiteIds || off.selectedSiteIds,
              selectedSitesCount: updatedData.selectedSitesCount || off.selectedSitesCount,
              status: 'submitted',
              updatedAt: new Date().toISOString(),
              history: [
                ...(off.history || []),
                {
                  type: 'revision',
                  author: off.investorName,
                  authorRole: 'investor',
                  amountEur: updatedData.amountEur || off.amountEur,
                  milestones: updatedData.milestones || off.milestones,
                  comments: updatedData.comments || 'Offre révisée par l\'investisseur',
                  date: new Date().toISOString(),
                },
              ],
            };
            return updated;
          }),
        }));
      },

      // Admin Action: Accept investor offer directly
      adminAcceptOffer: (offerId) => {
        set((state) => ({
          offers: state.offers.map((off) => {
            if (off.id !== offerId) return off;
            return {
              ...off,
              status: 'agreement_reached',
              updatedAt: new Date().toISOString(),
              history: [
                ...(off.history || []),
                {
                  type: 'acceptance',
                  author: 'Yann BARBERIS (ENR COURTAGE)',
                  authorRole: 'admin',
                  amountEur: off.amountEur,
                  milestones: off.milestones,
                  comments: 'Offre acceptée par ENR COURTAGE. Passage à la signature du Mandat de Négociation Exclusive.',
                  date: new Date().toISOString(),
                },
              ],
            };
          }),
        }));
      },

      // Admin Action: Reject offer
      adminRejectOffer: (offerId, reason = '') => {
        set((state) => ({
          offers: state.offers.map((off) => {
            if (off.id !== offerId) return off;
            return {
              ...off,
              status: 'rejected',
              adminNotes: reason,
              updatedAt: new Date().toISOString(),
              history: [
                ...(off.history || []),
                {
                  type: 'rejection',
                  author: 'Yann BARBERIS (ENR COURTAGE)',
                  authorRole: 'admin',
                  comments: reason || 'Offre non retenue par le Cédant.',
                  date: new Date().toISOString(),
                },
              ],
            };
          }),
        }));
      },

      // Admin Action: Send Counter-Proposal
      adminCounterOffer: (offerId, { counterAmountEur, counterMilestones, counterComments }) => {
        set((state) => ({
          offers: state.offers.map((off) => {
            if (off.id !== offerId) return off;
            return {
              ...off,
              status: 'counter_by_admin',
              counterOffer: {
                author: 'Yann BARBERIS (ENR COURTAGE)',
                amountEur: counterAmountEur,
                milestones: counterMilestones,
                comments: counterComments,
                date: new Date().toISOString(),
              },
              updatedAt: new Date().toISOString(),
              history: [
                ...(off.history || []),
                {
                  type: 'counter_proposal_admin',
                  author: 'Yann BARBERIS (ENR COURTAGE)',
                  authorRole: 'admin',
                  amountEur: counterAmountEur,
                  milestones: counterMilestones,
                  comments: counterComments,
                  date: new Date().toISOString(),
                },
              ],
            };
          }),
        }));
      },

      // Investor Action: Accept Admin Counter-Proposal
      investorAcceptCounter: (offerId) => {
        set((state) => ({
          offers: state.offers.map((off) => {
            if (off.id !== offerId) return off;
            const counter = off.counterOffer;
            return {
              ...off,
              amountEur: counter?.amountEur || off.amountEur,
              milestones: counter?.milestones || off.milestones,
              status: 'agreement_reached',
              updatedAt: new Date().toISOString(),
              history: [
                ...(off.history || []),
                {
                  type: 'acceptance',
                  author: off.investorName,
                  authorRole: 'investor',
                  amountEur: counter?.amountEur || off.amountEur,
                  comments: 'Contre-proposition acceptée par l\'investisseur. Passage à la signature du Mandat de Négociation Exclusive.',
                  date: new Date().toISOString(),
                },
              ],
            };
          }),
        }));
      },

      // Investor Action: Reject Admin Counter-Proposal
      investorRejectCounter: (offerId, reason = '') => {
        set((state) => ({
          offers: state.offers.map((off) => {
            if (off.id !== offerId) return off;
            return {
              ...off,
              status: 'rejected',
              updatedAt: new Date().toISOString(),
              history: [
                ...(off.history || []),
                {
                  type: 'rejection',
                  author: off.investorName,
                  authorRole: 'investor',
                  comments: reason || 'Contre-proposition déclinée par l\'investisseur.',
                  date: new Date().toISOString(),
                },
              ],
            };
          }),
        }));
      },

      // Investor Action: Send Counter-Proposal back to Admin
      investorCounterOffer: (offerId, { counterAmountEur, counterMilestones, counterComments }) => {
        set((state) => ({
          offers: state.offers.map((off) => {
            if (off.id !== offerId) return off;
            return {
              ...off,
              status: 'counter_by_investor',
              counterOffer: {
                author: off.investorName,
                amountEur: counterAmountEur,
                milestones: counterMilestones,
                comments: counterComments,
                date: new Date().toISOString(),
              },
              updatedAt: new Date().toISOString(),
              history: [
                ...(off.history || []),
                {
                  type: 'counter_proposal_investor',
                  author: off.investorName,
                  authorRole: 'investor',
                  amountEur: counterAmountEur,
                  milestones: counterMilestones,
                  comments: counterComments,
                  date: new Date().toISOString(),
                },
              ],
            };
          }),
        }));
      },

      // Sign Mandat de Négociation Exclusive
      signMandate: (offerId, signatoryType) => {
        const now = new Date().toISOString();
        set((state) => ({
          offers: state.offers.map((off) => {
            if (off.id !== offerId) return off;
            const mandate = off.mandate || {
              investorSigned: false,
              investorSignedAt: null,
              adminSigned: false,
              adminSignedAt: null,
            };

            const updatedMandate = {
              ...mandate,
              investorSigned: signatoryType === 'investor' ? true : mandate.investorSigned,
              investorSignedAt: signatoryType === 'investor' ? now : mandate.investorSignedAt,
              adminSigned: signatoryType === 'admin' ? true : mandate.adminSigned,
              adminSignedAt: signatoryType === 'admin' ? now : mandate.adminSignedAt,
            };

            const bothSigned = updatedMandate.investorSigned && updatedMandate.adminSigned;

            return {
              ...off,
              mandate: updatedMandate,
              status: bothSigned ? 'mandate_signed' : off.status,
              updatedAt: now,
              history: [
                ...(off.history || []),
                {
                  type: 'mandate_signature',
                  author: signatoryType === 'admin' ? 'Yann BARBERIS (ENR COURTAGE)' : off.investorName,
                  authorRole: signatoryType,
                  comments: `Signature électronique du Mandat de Négociation Exclusive validée par ${signatoryType === 'admin' ? 'ENR COURTAGE' : off.investorCompany}.`,
                  date: now,
                },
              ],
            };
          }),
        }));
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

          // Synchronize default accounts (like yannbarberis@msn.com & admin)
          INVESTORS.forEach((defaultInv) => {
            const idx = state.investors.findIndex(
              (inv) => inv.email && inv.email.trim().toLowerCase() === defaultInv.email.toLowerCase()
            );
            if (idx === -1) {
              state.investors.push(defaultInv);
            } else {
              state.investors[idx] = {
                ...defaultInv,
                ...state.investors[idx],
                password: state.investors[idx].password || defaultInv.password,
                status: state.investors[idx].status || defaultInv.status,
              };
            }
          });

          // Sanitize every investor object to guarantee pure strings for all text fields
          state.investors = state.investors.map((inv) => ({
            ...inv,
            id: String(inv.id || 'INV-' + Math.random().toString(36).slice(2, 8)),
            name: typeof inv.name === 'string' ? inv.name : String(inv.name || ''),
            company: typeof inv.company === 'string' ? inv.company : String(inv.company || ''),
            email: typeof inv.email === 'string' ? inv.email : String(inv.email || ''),
            role: typeof inv.role === 'string' ? inv.role : String(inv.role || 'Investisseur'),
            phone: typeof inv.phone === 'string' ? inv.phone : String(inv.phone || ''),
            legalForm: typeof inv.legalForm === 'string' ? inv.legalForm : String(inv.legalForm || 'SAS'),
            headOffice: typeof inv.headOffice === 'string' ? inv.headOffice : String(inv.headOffice || ''),
            rcsNumber: typeof inv.rcsNumber === 'string' ? inv.rcsNumber : String(inv.rcsNumber || ''),
            rcsCity: typeof inv.rcsCity === 'string' ? inv.rcsCity : String(inv.rcsCity || ''),
            password: typeof inv.password === 'string' ? inv.password : String(inv.password || ''),
            ndaText: typeof inv.ndaText === 'string' ? inv.ndaText : String(inv.ndaText || ''),
            status: typeof inv.status === 'string' ? inv.status : 'active',
            isAdmin: !!inv.isAdmin,
          }));
        } else {
          state.investors = INVESTORS;
        }

        // Initialize Data Room state containers if needed
        state.deletedDefaultDocs = state.deletedDefaultDocs || {};
        state.customDataRoom = state.customDataRoom || {};

        if (!state.userDownloads || Object.keys(state.userDownloads).length === 0) {
          state.userDownloads = {
            'yannbarberis@msn.com': [
              {
                id: 'DL-SEED-01',
                portfolioId: 'helios',
                portfolioName: 'PROJET HÉLIOS',
                fileName: 'Promesses de Bail (PdB) — Sites fermes',
                fileType: 'PDF',
                fileSize: '12.5 Mo',
                downloadedAt: '2026-09-17T10:15:00.000Z',
              },
              {
                id: 'DL-SEED-02',
                portfolioId: 'volta',
                portfolioName: 'PROJET VOLTA',
                fileName: 'Fiches synoptiques — 31 sites BESS',
                fileType: 'PDF',
                fileSize: '22.4 Mo',
                downloadedAt: '2026-09-17T11:42:00.000Z',
              },
            ],
            'a.dupre@enee-energy.com': [
              {
                id: 'DL-SEED-03',
                portfolioId: 'helios',
                portfolioName: 'PROJET HÉLIOS',
                fileName: 'Matrice économique consolidée',
                fileType: 'XLSX',
                fileSize: '1.8 Mo',
                downloadedAt: '2026-09-16T16:20:00.000Z',
              },
              {
                id: 'DL-SEED-04',
                portfolioId: 'volta',
                portfolioName: 'PROJET VOLTA',
                fileName: 'Accord fournisseur batteries',
                fileType: 'PDF',
                fileSize: '3.2 Mo',
                downloadedAt: '2026-09-17T09:05:00.000Z',
              },
            ],
          };
        }
      },
    }
  )
);
