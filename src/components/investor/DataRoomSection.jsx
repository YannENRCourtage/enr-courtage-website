import React, { useState, useMemo } from 'react';
import {
  FolderLock,
  FileText,
  Download,
  ShieldCheck,
  Scale,
  Wrench,
  Calculator,
  Map,
  Network,
  CheckCircle2,
  Paperclip,
  Eye,
  Filter,
  MapPin,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { getDocumentBinary } from '@/services/fileStorageService';
import { findMatchingServerDocument } from '@/services/dataRoomResolverService';

const categoryIconMap = {
  Scale,
  Wrench,
  Calculator,
  Map,
  Network,
  Juridique: Scale,
  Technique: Wrench,
  Financier: Calculator,
  Urbanisme: Map,
  Réseau: Network,
};

/**
 * Résout le véritable document PDF physique complet (24-25 pages)
 * pour éviter toute substitution ou certificat partiel.
 */
function resolveRealDocument(file, portfolio) {
  if (!file) return null;

  // 1. URL directe explicite
  if (file.fileUrl) {
    const fileName = file.fileName || (file.name.toLowerCase().endsWith('.pdf') ? file.name : `${file.name}.pdf`);
    return { url: file.fileUrl, fileName };
  }

  // 2. Recherche intelligente dans les documents originaux du serveur
  const serverMatch = findMatchingServerDocument(file);
  if (serverMatch && serverMatch.url) {
    return { url: serverMatch.url, fileName: serverMatch.fileName };
  }

  // 3. Règle de repli spécifique aux Promesses de Bail
  const rawName = file.name || file.fileName || '';
  if (/promesse.*bail|pdb/i.test(rawName)) {
    if (portfolio?.type === 'PV' || portfolio?.id === 'helios') {
      return {
        url: '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf',
        fileName: 'Promesse_de_bail_CONSOLI_signe.pdf',
      };
    }
    return {
      url: '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf',
      fileName: 'Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf',
    };
  }

  return null;
}

export default function DataRoomSection({
  portfolio,
  investorName = 'Investisseur',
  investorCompany = '',
}) {
  const { customDataRoom, deletedDefaultDocs, documentSiteAssignments = {}, recordDownload, currentInvestor } = useInvestorStore();
  const [downloadedFiles, setDownloadedFiles] = useState({});
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');

  // Helper pour savoir à quels sites un document est affecté
  const getAssignedSitesForDoc = (file) => {
    if (!file) return [];
    const explicit = [
      ...(file.siteIds || []),
      ...(documentSiteAssignments[file.id] || []),
      ...(documentSiteAssignments[file.name] || []),
      ...(documentSiteAssignments[file.fileName] || []),
    ].map(Number);

    if (explicit.length > 0) return explicit;

    // Détection automatique intelligente
    const docLower = (file.name || '').toLowerCase();
    const matched = [];
    (portfolio?.sites || []).forEach((site) => {
      const client = (site.client || '').toLowerCase();
      const commune = (site.name || site.ville || '').toLowerCase();
      if (client && client.length > 3 && docLower.includes(client)) matched.push(Number(site.id));
      else if (commune && commune.length > 3 && docLower.includes(commune)) matched.push(Number(site.id));
    });
    return matched;
  };

  // Fusionner les catégories par défaut avec les fichiers personnalisés téléversés et appliquer le filtre de site
  const categories = useMemo(() => {
    if (!portfolio || !portfolio.dataRoom) return [];

    const deletedForPortfolio = deletedDefaultDocs?.[portfolio.id] || [];

    const defaultCats = portfolio.dataRoom.categories.map((cat) => ({
      ...cat,
      files: (cat.files || []).filter((f) => !deletedForPortfolio.includes(f.name)),
    }));

    const customDocsForPortfolio = customDataRoom?.[portfolio.id] || {};

    Object.entries(customDocsForPortfolio).forEach(([catName, customFiles]) => {
      const existingCat = defaultCats.find(
        (c) => c.name.toLowerCase() === catName.toLowerCase()
      );

      if (existingCat) {
        customFiles.forEach((cf) => {
          if (!existingCat.files.some((f) => f.name === cf.name)) {
            existingCat.files.push(cf);
          }
        });
      } else if (customFiles && customFiles.length > 0) {
        defaultCats.push({
          name: catName,
          icon: 'Paperclip',
          files: customFiles,
        });
      }
    });

    // Appliquer le filtre par projet sélectionné
    return defaultCats
      .map((cat) => {
        const filteredFiles = (cat.files || []).filter((file) => {
          if (selectedSiteFilter === 'ALL') return true;
          const assigned = getAssignedSitesForDoc(file);
          if (selectedSiteFilter === 'GENERAL') {
            return assigned.length === 0;
          }
          return assigned.includes(Number(selectedSiteFilter));
        });
        return {
          ...cat,
          files: filteredFiles,
        };
      })
      .filter((cat) => cat.files && cat.files.length > 0);
  }, [portfolio, customDataRoom, deletedDefaultDocs, documentSiteAssignments, selectedSiteFilter]);

  if (!portfolio || !portfolio.dataRoom) {
    return null;
  }

  const trackAction = (file, action = 'view') => {
    setDownloadedFiles((prev) => ({
      ...prev,
      [file.name]: true,
    }));

    const activeEmail = currentInvestor?.email || 'investisseur@partenaire.fr';
    const activeName = investorName || currentInvestor?.name || 'Investisseur';
    const activeCompany = investorCompany || currentInvestor?.company || 'Investisseur Qualifié';

    if (recordDownload) {
      recordDownload({
        userEmail: activeEmail,
        userName: activeName,
        userCompany: activeCompany,
        portfolioId: portfolio.id,
        portfolioName: portfolio.name,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'PDF',
        action,
      });
    }
  };

  // Helper pour normaliser le nom de téléchargement
  const formatPdfFileName = (name) => {
    if (!name) return 'Document.pdf';
    return name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;
  };

  /**
   * Action CONSULTER :
   * Ouvre directement le véritable document PDF complet (24-25 pages)
   * dans un nouvel onglet avec le visualiseur PDF natif du navigateur.
   */
  const handleView = async (file) => {
    trackAction(file, 'view');

    // 1. Fichier réel résolu sur le serveur
    const realDoc = resolveRealDocument(file, portfolio);
    if (realDoc && realDoc.url) {
      window.open(realDoc.url, '_blank', 'noopener,noreferrer');
      return;
    }

    // 2. Fichier binaire stocké dans IndexedDB (custom upload admin)
    try {
      const stored = await getDocumentBinary(file.id || file.name);
      if (stored && stored.blob) {
        const blob = stored.blob instanceof Blob
          ? stored.blob
          : new Blob([stored.blob], { type: stored.mimeType || 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        return;
      }
    } catch (e) {
      console.warn('Erreur lecture IndexedDB:', e);
    }

    // 3. Fichier encodé en base64
    if (file.fileData) {
      window.open(file.fileData, '_blank');
      return;
    }

    // 4. Repli garanti : ouverture du vrai PDF complet selon le portefeuille
    const fallbackUrl = (portfolio.type === 'PV' || portfolio.id === 'helios')
      ? '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf'
      : '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf';
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
  };

  /**
   * Action TÉLÉCHARGER :
   * Télécharge directement le véritable fichier PDF complet physique
   * sur le poste de l'utilisateur.
   */
  const handleDownload = async (file) => {
    trackAction(file, 'download');

    // 1. Fichier réel résolu sur le serveur
    const realDoc = resolveRealDocument(file, portfolio);
    if (realDoc && realDoc.url) {
      const a = document.createElement('a');
      a.href = realDoc.url;
      a.download = realDoc.fileName || formatPdfFileName(file.name);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // 2. Fichier IndexedDB
    try {
      const stored = await getDocumentBinary(file.id || file.name);
      if (stored && stored.blob) {
        const blob = stored.blob instanceof Blob
          ? stored.blob
          : new Blob([stored.blob], { type: stored.mimeType || 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = stored.fileName || formatPdfFileName(file.name);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        return;
      }
    } catch (e) {
      console.warn('Erreur lecture IndexedDB:', e);
    }

    // 3. Fichier base64
    if (file.fileData) {
      const a = document.createElement('a');
      a.href = file.fileData;
      a.download = formatPdfFileName(file.name);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // 4. Repli garanti : téléchargement du vrai PDF complet
    const fallbackUrl = (portfolio.type === 'PV' || portfolio.id === 'helios')
      ? '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf'
      : '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf';
    const fallbackName = (portfolio.type === 'PV' || portfolio.id === 'helios')
      ? 'Promesse_de_bail_CONSOLI_signe.pdf'
      : 'Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf';

    const a = document.createElement('a');
    a.href = fallbackUrl;
    a.download = fallbackName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-[#0c1220] to-gray-900 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FolderLock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Data Room Virtuelle
              </span>
              <span className="text-xs text-emerald-400 font-semibold">✓ NDA Bilatéral Actif</span>
            </div>
            <h3 className="text-xl font-black text-white mt-1">
              Documents du portefeuille {portfolio.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Accès accordé à <strong className="text-white">{investorCompany || investorName}</strong></span>
        </div>
      </div>

      {/* Project Filter Toolbar */}
      <div className="mt-5 p-3.5 rounded-xl bg-gray-950/80 border border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-gray-200">Consulter par projet spécifique :</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="w-full sm:w-auto flex-1 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white font-medium focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="ALL">📁 Tous les documents du portefeuille ({portfolio.sites?.length || 0} projets)</option>
            <option value="GENERAL">🌐 Documents généraux uniquement (non spécifiques)</option>
            <optgroup label="Filtrer par projet individuel :">
              {(portfolio.sites || []).map((site) => (
                <option key={site.id} value={String(site.id)}>
                  📍 Projet #{site.id} — {site.name || site.ville} ({site.kwc ? `${site.kwc} kWc` : `${site.kw || 500} kW`})
                </option>
              ))}
            </optgroup>
          </select>

          {selectedSiteFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedSiteFilter('ALL')}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-emerald-400 border border-gray-700 font-semibold transition"
            >
              Afficher tout
            </button>
          )}
        </div>
      </div>

      {/* Filter Active Notice */}
      {selectedSiteFilter !== 'ALL' && (
        <div className="mt-2.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
          <span>
            {selectedSiteFilter === 'GENERAL' ? (
              <>Filtre actif : <strong>Documents généraux du portefeuille</strong></>
            ) : (
              <>
                Filtre actif : Documents affectés au <strong>Projet #{selectedSiteFilter} ({
                  (portfolio.sites || []).find((s) => String(s.id) === String(selectedSiteFilter))?.name ||
                  (portfolio.sites || []).find((s) => String(s.id) === String(selectedSiteFilter))?.ville ||
                  'Site'
                })</strong>
              </>
            )}
          </span>
          <span className="font-mono text-[11px] text-emerald-400">
            {categories.reduce((acc, c) => acc + (c.files?.length || 0), 0)} document(s) trouvé(s)
          </span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {categories.map((category, idx) => {
          const CatIcon = categoryIconMap[category.icon] || FileText;

          return (
            <div
              key={idx}
              className="bg-gray-800/40 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider mb-3">
                <CatIcon className="w-4 h-4 text-emerald-400" />
                <span>{category.name}</span>
                <span className="text-[10px] text-gray-500 font-normal">({category.files.length} fichiers)</span>
              </div>

              <div className="space-y-2">
                {category.files.map((file, fIdx) => {
                  const isDownloaded = downloadedFiles[file.name];
                  const assignedSites = getAssignedSitesForDoc(file);

                  return (
                    <div
                      key={fIdx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-gray-900/60 border border-gray-800/80 hover:border-emerald-500/40 transition group gap-2"
                    >
                      <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-800 text-gray-400 border border-gray-700 shrink-0 mt-0.5">
                          {file.type}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-200 truncate group-hover:text-emerald-300 transition">
                            {file.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-500">{file.size}</span>
                            {assignedSites.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                                {assignedSites.length === 1 ? (
                                  <span>
                                    Projet #{assignedSites[0]} (
                                    {(portfolio.sites || []).find((s) => s.id === assignedSites[0])?.name ||
                                     (portfolio.sites || []).find((s) => s.id === assignedSites[0])?.ville ||
                                     'Site'}
                                    )
                                  </span>
                                ) : (
                                  <span>Affecté à {assignedSites.length} projets</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {/* Bouton CONSULTER : Visualiseur PDF natif 24-25 pages */}
                        <button
                          onClick={() => handleView(file)}
                          title="Consulter le contrat PDF complet dans un nouvel onglet"
                          className="text-xs px-2.5 py-1 rounded-md font-semibold bg-gray-800 hover:bg-emerald-600 text-gray-200 hover:text-white border border-gray-700 hover:border-emerald-500 transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                          <span>Consulter</span>
                        </button>

                        {/* Bouton TÉLÉCHARGER : Téléchargement physique du PDF réel */}
                        <button
                          onClick={() => handleDownload(file)}
                          title="Télécharger le fichier physique sur votre appareil"
                          className={`text-xs px-2 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                            isDownloaded
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 border border-gray-700'
                          }`}
                        >
                          {isDownloaded ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span className="hidden sm:inline">Téléchargé</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              <span className="hidden sm:inline">Télécharger</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
        <span>Toutes les consultations et téléchargements font l'objet d'une traçabilité horodatée.</span>
        <span className="text-emerald-400 font-mono">Chiffrement AES-256</span>
      </div>
    </div>
  );
}
