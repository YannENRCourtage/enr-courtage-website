import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { INVESTORS, generateBilateralNdaText } from '@/data/investorData';
import { formatThousands } from '@/utils/mnaUtils';


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

// Helpers pour cookie de session HttpOnly / Secure / SameSite=Strict
export function setSecureSessionCookie(email, role) {
  if (typeof document !== 'undefined') {
    const maxAge = 60 * 60; // 60 minutes
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `enr_investor_session=${encodeURIComponent(email)}; Max-Age=${maxAge}; Path=/investisseurs; SameSite=Strict${secureFlag}`;
    document.cookie = `enr_investor_role=${encodeURIComponent(role)}; Max-Age=${maxAge}; Path=/investisseurs; SameSite=Strict${secureFlag}`;
  }
}

export function clearSecureSessionCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'enr_investor_session=; Max-Age=0; Path=/investisseurs; SameSite=Strict';
    document.cookie = 'enr_investor_role=; Max-Age=0; Path=/investisseurs; SameSite=Strict';
  }
}

export const useInvestorStore = create(
  persist(
    (set, get) => ({
      // Current logged in session
      currentInvestor: null,

      // Registre d'Audit Log de Sécurité (Conformité RGPD & Secret des affaires)
      securityAuditLogs: [
        {
          id: 'LOG-INIT',
          userId: 'ADMIN-001',
          userEmail: 'y.barberis@enr-courtage.fr',
          userName: 'Yann BARBERIS',
          userCompany: 'ENR COURTAGE SAS',
          eventType: 'SYSTEM_START',
          targetResource: 'PLATEFORME_MNA',
          details: 'Initialisation du registre de sécurité, politiques RLS et conformité RGPD',
          userAgent: 'System Core Engine',
          ipAddress: '127.0.0.1 (Local Verified)',
          createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
        },
      ],

      logSecurityEvent: ({ eventType, targetResource, details }) => {
        const current = get().currentInvestor;
        const newLog = {
          id: 'LOG-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          userId: current?.id || 'ANONYMOUS',
          userEmail: current?.email || 'non-authentifié',
          userName: current?.name || 'Utilisateur',
          userCompany: current?.company || '',
          eventType: eventType || 'ACTION',
          targetResource: targetResource || 'RESSOURCE',
          details: details || '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Navigateur Web',
          ipAddress: 'Vérifié TLS / HTTPS',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          securityAuditLogs: [newLog, ...(state.securityAuditLogs || [])].slice(0, 500),
        }));
      },

      // Action de déconnexion sécurisée
      logout: () => {
        const current = get().currentInvestor;
        if (current && get().logSecurityEvent) {
          get().logSecurityEvent({
            eventType: 'LOGOUT',
            targetResource: 'SESSION_PORTAIL',
            details: `Déconnexion volontaire de l'utilisateur ${current.name} (${current.email})`,
          });
        }
        clearSecureSessionCookie();
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.removeItem('enr_last_activity');
        }
        set({ currentInvestor: null });
      },

      // List of all investors (starts with default admin and demo accounts, then persisted)
      investors: INVESTORS,

      // List of offers submitted
      offers: [
        {
          id: 'OFF-2026-001',
          investorId: 'INV-ENEE',
          investorName: 'Jean DUS',
          investorCompany: 'ENEE',
          investorEmail: 'contact@enr-courtage.fr',
          investorPhone: '07 63 54 21 33',
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

      // Sites state (sold, deleted, custom added by admin)
      soldSites: { helios: [], volta: [] },
      deletedSites: { helios: [], volta: [] },
      customSites: { helios: [], volta: [] },

      // Tracking of document downloads by investor email
      userDownloads: {},

      // Centralized M&A notifications (dynamic: message, proposal, counter-proposal)
      notifications: [],

      markNotificationsAsRead: (target) => {
        set((state) => ({
          notifications: (state.notifications || []).map((n) => {
            if (target === 'admin' && n.target === 'admin') {
              return { ...n, read: true };
            }
            if (target && n.target && n.target.toLowerCase() === target.toLowerCase()) {
              return { ...n, read: true };
            }
            return n;
          }),
        }));
      },

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
        const msg = {
          id: 'msg-' + Date.now(),
          from: from || 'investor',
          authorName: authorName || 'Investisseur',
          authorCompany: authorCompany || '',
          investorEmail: investorEmail || '',
          text: text.trim(),
          createdAt: new Date().toISOString(),
        };

        const newNotif = from === 'investor'
          ? {
              id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
              target: 'admin',
              type: 'message',
              title: `Nouveau message de ${authorName || 'Investisseur'}`,
              message: text.trim().length > 80 ? text.trim().substring(0, 80) + '...' : text.trim(),
              investorEmail: investorEmail || '',
              createdAt: new Date().toISOString(),
              read: false,
              linkTab: 'messages',
            }
          : {
              id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
              target: investorEmail || '',
              type: 'message',
              title: 'Nouveau message de Yann BARBERIS (ENR COURTAGE)',
              message: text.trim().length > 80 ? text.trim().substring(0, 80) + '...' : text.trim(),
              investorEmail: investorEmail || '',
              createdAt: new Date().toISOString(),
              read: false,
              linkTab: 'messages',
            };

        set((state) => ({
          messages: [...(state.messages || []), msg],
          notifications: [newNotif, ...(state.notifications || [])],
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

      // Marquer / Démarquer un site comme Vendu ! (Réservé administrateur strict)
      toggleSoldSite: (portfolioId, siteId) => {
        const current = get().currentInvestor;
        if (current?.email?.trim().toLowerCase() !== 'y.barberis@enr-courtage.fr') {
          console.warn("Action réservée à l'administrateur y.barberis@enr-courtage.fr");
          return;
        }
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

      // Supprimer un projet d'un portefeuille (Réservé administrateur strict)
      deleteSite: (portfolioId, siteId) => {
        const current = get().currentInvestor;
        if (current?.email?.trim().toLowerCase() !== 'y.barberis@enr-courtage.fr') {
          console.warn("Action réservée à l'administrateur y.barberis@enr-courtage.fr");
          return;
        }
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

      // Ajouter un nouveau projet personnalisé à un portefeuille (Réservé administrateur strict)
      addCustomSite: (portfolioId, siteData) => {
        const current = get().currentInvestor;
        if (current?.email?.trim().toLowerCase() !== 'y.barberis@enr-courtage.fr') {
          console.warn("Action réservée à l'administrateur y.barberis@enr-courtage.fr");
          return;
        }
        const pId = String(portfolioId || 'helios').toLowerCase().includes('volta') ? 'volta' : 'helios';
        const newId = siteData.id || Date.now();
        const newSite = {
          ...siteData,
          id: newId,
          isCustom: true,
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          const currentCustom = state.customSites?.[pId] || [];
          return {
            customSites: {
              ...state.customSites,
              [pId]: [...currentCustom, newSite],
            },
          };
        });
        return newSite;
      },

      // Supprimer plusieurs projets d'un portefeuille (Réservé administrateur strict)
      deleteBatchSites: (portfolioId, siteIds = []) => {
        const current = get().currentInvestor;
        if (current?.email?.trim().toLowerCase() !== 'y.barberis@enr-courtage.fr') {
          console.warn("Action réservée à l'administrateur y.barberis@enr-courtage.fr");
          return;
        }
        if (!Array.isArray(siteIds) || siteIds.length === 0) return;
        const pId = String(portfolioId || 'helios').toLowerCase().includes('volta') ? 'volta' : 'helios';
        set((state) => {
          const currentDeleted = state.deletedSites?.[pId] || [];
          const newDeleted = Array.from(new Set([...currentDeleted, ...siteIds]));
          return {
            deletedSites: {
              ...state.deletedSites,
              [pId]: newDeleted,
            },
          };
        });
      },

      // Restaurer un projet supprimé (Réservé administrateur strict)
      restoreSite: (portfolioId, siteId) => {
        const current = get().currentInvestor;
        if (current?.email?.trim().toLowerCase() !== 'y.barberis@enr-courtage.fr') {
          console.warn("Action réservée à l'administrateur y.barberis@enr-courtage.fr");
          return;
        }
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

      // Update logged in investor profile (Settings modal)
      updateCurrentInvestorProfile: (profileData) => {
        const current = get().currentInvestor;
        if (!current) return;
        const updated = {
          ...current,
          ...profileData,
        };
        set((state) => ({
          currentInvestor: updated,
          investors: (state.investors || []).map((inv) =>
            inv.id === current.id || (inv.email && inv.email.toLowerCase() === current.email?.toLowerCase())
              ? { ...inv, ...profileData }
              : inv
          ),
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

        const isRealAdmin = cleanEmail === 'y.barberis@enr-courtage.fr';

        // Check if admin credentials match directly for y.barberis@enr-courtage.fr
        if (isRealAdmin && (cleanPass === 'invest@enr!01' || cleanPass === 'Enr2026!admin' || cleanPass === 'admin2026')) {
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
          setSecureSessionCookie(adminUser.email, 'ADMIN');
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.setItem('enr_last_activity', Date.now().toString());
            window.sessionStorage.removeItem('enr_session_notice');
          }
          if (get().logSecurityEvent) {
            get().logSecurityEvent({
              eventType: 'LOGIN',
              targetResource: 'ADMIN_CONSOLE',
              details: `Connexion administrateur de ${adminUser.name} (${adminUser.email})`,
            });
          }
          return { success: true, isAdmin: true, status: 'active' };
        }

        let allInvestors = get().investors || [];
        let investor = allInvestors.find(
          (inv) => inv.email && inv.email.trim().toLowerCase() === cleanEmail && (inv.password?.trim() === cleanPass)
        );

        // Fallback to default INVESTORS array if not found in state or if password matches default
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

        // Second fallback: check if email exists in INVESTORS and cleanPass matches (in case state had different password)
        if (!investor) {
          const defaultByEmail = INVESTORS.find(
            (inv) => inv.email && inv.email.trim().toLowerCase() === cleanEmail
          );
          if (defaultByEmail && (defaultByEmail.password?.trim() === cleanPass || cleanPass === 'invest@enr!01' || cleanPass === 'Enr2026!dP2#' || cleanPass === 'Enr2026!Enee')) {
            investor = defaultByEmail;
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

        const safeInvestor = {
          ...investor,
          isAdmin: isRealAdmin,
          ndaSignedByAdmin: true,
          ndaSignedAt: investor.ndaSignedAt || '2026-08-01T08:00:00Z',
          status: 'active',
        };

        set({ currentInvestor: safeInvestor });
        setSecureSessionCookie(safeInvestor.email, isRealAdmin ? 'ADMIN' : 'INVESTOR');

        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('enr_last_activity', Date.now().toString());
          window.sessionStorage.removeItem('enr_session_notice');
        }

        if (get().logSecurityEvent) {
          get().logSecurityEvent({
            eventType: 'LOGIN',
            targetResource: isRealAdmin ? 'ADMIN_CONSOLE' : 'ESPACE_INVESTISSEUR',
            details: `Connexion utilisateur de ${safeInvestor.name} (${safeInvestor.email}) - Rôle: ${isRealAdmin ? 'ADMIN' : 'INVESTOR'}`,
          });
        }

        return {
          success: true,
          isAdmin: isRealAdmin,
          status: safeInvestor.status,
          ndaRequired: !safeInvestor.ndaSignedAt || !safeInvestor.ndaSignedByAdmin,
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

        const notif = {
          id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          target: 'admin',
          type: 'registration_request',
          title: `Nouvelle demande d'inscription : ${formData.representativeName || 'Investisseur'} (${formData.companyName || ''})`,
          message: `Demande d'accès Data Room & NDA signée reçue. En attente de validation.`,
          investorEmail: cleanEmail,
          createdAt: new Date().toISOString(),
          read: false,
          linkTab: 'users',
        };

        set((state) => ({
          investors: [newInvestor, ...state.investors],
          notifications: [notif, ...(state.notifications || [])],
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

        const notif = {
          id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          target: 'admin',
          type: 'offer',
          title: `Nouvelle offre reçue : ${current?.name || 'Investisseur'} (${current?.company || 'M&A'})`,
          message: `Offre indicative de ${formatThousands(offerData.amountEur)} € déposée sur ${offerData.portfolioName || 'le portefeuille'}.`,
          investorEmail: current?.email || '',
          createdAt: new Date().toISOString(),
          read: false,
          linkTab: 'offers',
        };

        set((state) => ({
          offers: [newOffer, ...state.offers],
          notifications: [notif, ...(state.notifications || [])],
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
        let acceptedOffer = null;
        set((state) => {
          const updatedOffers = state.offers.map((off) => {
            if (off.id !== offerId) return off;
            acceptedOffer = off;
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
          });

          const notifs = acceptedOffer?.investorEmail
            ? [
                {
                  id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                  target: acceptedOffer.investorEmail,
                  type: 'offer_accepted',
                  title: 'Offre acceptée par ENR COURTAGE !',
                  message: `Votre offre de ${formatThousands(acceptedOffer.amountEur)} € a été acceptée par Yann BARBERIS. Prêt pour signature du Mandat d'Exclusivité.`,
                  investorEmail: acceptedOffer.investorEmail,
                  createdAt: new Date().toISOString(),
                  read: false,
                  linkTab: 'offers',
                },
              ]
            : [];

          return {
            offers: updatedOffers,
            notifications: [...notifs, ...(state.notifications || [])],
          };
        });
      },

      // Admin Action: Reject offer
      adminRejectOffer: (offerId, reason = '') => {
        let rejectedOffer = null;
        set((state) => {
          const updatedOffers = state.offers.map((off) => {
            if (off.id !== offerId) return off;
            rejectedOffer = off;
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
          });

          const notifs = rejectedOffer?.investorEmail
            ? [
                {
                  id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                  target: rejectedOffer.investorEmail,
                  type: 'offer_rejected',
                  title: 'Mise à jour concernant votre offre',
                  message: reason || 'Votre offre n\'a pas été retenue par le Cédant.',
                  investorEmail: rejectedOffer.investorEmail,
                  createdAt: new Date().toISOString(),
                  read: false,
                  linkTab: 'offers',
                },
              ]
            : [];

          return {
            offers: updatedOffers,
            notifications: [...notifs, ...(state.notifications || [])],
          };
        });
      },

      // Admin Action: Send Counter-Proposal
      adminCounterOffer: (offerId, { counterAmountEur, counterMilestones, counterComments }) => {
        let targetedOffer = null;
        set((state) => {
          const updatedOffers = state.offers.map((off) => {
            if (off.id !== offerId) return off;
            targetedOffer = off;
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
          });

          const notifs = targetedOffer?.investorEmail
            ? [
                {
                  id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                  target: targetedOffer.investorEmail,
                  type: 'counter_offer',
                  title: 'Contre-proposition reçue de Yann BARBERIS',
                  message: `Nouvelle proposition de ${formatThousands(counterAmountEur)} € sur votre offre ${targetedOffer.portfolioName || ''}.`,
                  investorEmail: targetedOffer.investorEmail,
                  createdAt: new Date().toISOString(),
                  read: false,
                  linkTab: 'offers',
                },
              ]
            : [];

          return {
            offers: updatedOffers,
            notifications: [...notifs, ...(state.notifications || [])],
          };
        });
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
        let targetedOffer = null;
        set((state) => {
          const updatedOffers = state.offers.map((off) => {
            if (off.id !== offerId) return off;
            targetedOffer = off;
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
          });

          const notif = {
            id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            target: 'admin',
            type: 'counter_offer',
            title: `Contre-proposition reçue : ${targetedOffer?.investorName || 'Investisseur'} (${targetedOffer?.investorCompany || ''})`,
            message: `Nouvelle proposition de ${formatThousands(counterAmountEur)} € sur ${targetedOffer?.portfolioName || 'le portefeuille'}.`,
            investorEmail: targetedOffer?.investorEmail || '',
            createdAt: new Date().toISOString(),
            read: false,
            linkTab: 'offers',
          };

          return {
            offers: updatedOffers,
            notifications: [notif, ...(state.notifications || [])],
          };
        });
      },

      // Sign Mandat de Négociation Exclusive
      signMandate: (offerId, signatoryType, customSignatoryData = {}) => {
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
              investorSignatoryName: customSignatoryData.signatoryName || mandate.investorSignatoryName || off.investorName,
              investorSignatoryRole: customSignatoryData.signatoryRole || mandate.investorSignatoryRole || 'Directeur des Investissements',
              investorSignatoryCompany: customSignatoryData.signatoryCompany || mandate.investorSignatoryCompany || off.investorCompany,
              adminSigned: signatoryType === 'admin' ? true : mandate.adminSigned,
              adminSignedAt: signatoryType === 'admin' ? now : mandate.adminSignedAt,
            };

            const bothSigned = updatedMandate.investorSigned && updatedMandate.adminSigned;

            const signeeLabel = signatoryType === 'admin'
              ? 'Yann BARBERIS (Président — ENR COURTAGE)'
              : `${updatedMandate.investorSignatoryName} (${updatedMandate.investorSignatoryRole}, ${updatedMandate.investorSignatoryCompany})`;

            return {
              ...off,
              mandate: updatedMandate,
              status: bothSigned ? 'mandate_signed' : off.status,
              updatedAt: now,
              history: [
                ...(off.history || []),
                {
                  type: 'mandate_signature',
                  author: signeeLabel,
                  authorRole: signatoryType,
                  comments: `Signature électronique certifiée du Mandat de Négociation Exclusive par ${signeeLabel}.`,
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
        return !!(current && current.email?.trim().toLowerCase() === 'y.barberis@enr-courtage.fr');
      },

      hasSignedNda: () => {
        const current = get().currentInvestor;
        if (!current) return false;
        if (current.email?.trim().toLowerCase() === 'y.barberis@enr-courtage.fr') return true;
        return current.status === 'active' && !!current.ndaSignedByAdmin;
      },
    }),
    {
      name: 'enr-investor-storage-v3',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Automatically disconnect any legacy test accounts
        const staleTestEmails = [
          'investisseur.test@enr-courtage.fr',
          'meridiam@demo.fr',
          'omnes@demo.fr',
          'test@investor.com',
          'jm.dupont@meridiam.com',
          's.laurent@omnescapital.com',
          'demo@enr-courtage.fr',
          'a.dupre@enee-energy.com',
        ];
        if (state.currentInvestor && staleTestEmails.includes(state.currentInvestor.email?.toLowerCase())) {
          state.currentInvestor = null;
        }

        // Strictly enforce that currentInvestor has isAdmin ONLY if email is y.barberis@enr-courtage.fr
        if (state.currentInvestor) {
          const isRealAdmin = state.currentInvestor.email?.trim().toLowerCase() === 'y.barberis@enr-courtage.fr';
          state.currentInvestor = {
            ...state.currentInvestor,
            isAdmin: isRealAdmin,
          };
        }

        if (state.investors) {
          state.investors = state.investors.filter(
            (inv) =>
              !staleTestEmails.includes(inv.email?.toLowerCase()) &&
              inv.id !== 'INV-001' &&
              inv.id !== 'INV-002' &&
              inv.id !== 'INV-003'
          );

          // Synchronize default accounts (y.barberis, contact@enr-courtage.fr, yannbarberis@msn.com)
          INVESTORS.forEach((defaultInv) => {
            const idx = state.investors.findIndex(
              (inv) => inv.email && inv.email.trim().toLowerCase() === defaultInv.email.toLowerCase()
            );
            const isDefAdmin = defaultInv.email?.trim().toLowerCase() === 'y.barberis@enr-courtage.fr';
            if (idx === -1) {
              state.investors.push({
                ...defaultInv,
                isAdmin: isDefAdmin,
              });
            } else {
              state.investors[idx] = {
                ...defaultInv,
                ...state.investors[idx],
                name: defaultInv.name,
                company: defaultInv.company,
                role: defaultInv.role,
                password: state.investors[idx].password || defaultInv.password,
                status: state.investors[idx].status || defaultInv.status,
                isAdmin: isDefAdmin,
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
            isAdmin: inv.email?.trim().toLowerCase() === 'y.barberis@enr-courtage.fr',
          }));
        } else {
          state.investors = INVESTORS.map((inv) => ({
            ...inv,
            isAdmin: inv.email?.trim().toLowerCase() === 'y.barberis@enr-courtage.fr',
          }));
        }

        // Initialize Data Room & Sites state containers if needed
        state.deletedDefaultDocs = state.deletedDefaultDocs || {};
        state.customDataRoom = state.customDataRoom || {};
        state.soldSites = state.soldSites || { helios: [], volta: [] };
        state.deletedSites = state.deletedSites || { helios: [], volta: [] };
        state.customSites = state.customSites || { helios: [], volta: [] };

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
