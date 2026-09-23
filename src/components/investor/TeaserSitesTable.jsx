import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  FileText,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  Download,
  Copy,
  Check,
  Coins,
  CheckSquare,
  Square,
  ShieldCheck,
  Zap,
  Plus,
  Trash2,
  Tag,
  ShieldAlert,
  RotateCcw,
  Building,
  PlusCircle,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { getDocumentsForSite, downloadOrViewDoc } from '@/services/dataRoomDocumentService';

export default function TeaserSitesTable({
  sites = [],
  portfolio,
  selectedSiteIds = [],
  onToggleSiteSelect = null,
  onSelectAll = null,
  onClearSelection = null,
  onOpenOfferModal = null,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModalSite, setActiveModalSite] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);

  const {
    currentInvestor,
    soldSites = { helios: [], volta: [] },
    deletedSites = { helios: [], volta: [] },
    customSites = { helios: [], volta: [] },
    toggleSoldSite,
    deleteSite,
    deleteBatchSites,
    addCustomSite,
    customDataRoom,
    deletedDefaultDocs,
    documentSiteAssignments,
    recordDownload,
  } = useInvestorStore();

  const storeState = useMemo(() => ({
    customDataRoom,
    deletedDefaultDocs,
    documentSiteAssignments,
  }), [customDataRoom, deletedDefaultDocs, documentSiteAssignments]);

  const isPv = portfolio?.type === 'PV';
  const portfolioKey = isPv ? 'helios' : 'volta';
  const isAdmin = !!(currentInvestor?.isAdmin || currentInvestor?.email === 'y.barberis@enr-courtage.fr' || currentInvestor?.email?.includes('barberis'));

  const currentSold = soldSites?.[portfolioKey] || [];
  const currentDeleted = deletedSites?.[portfolioKey] || [];
  const currentCustom = customSites?.[portfolioKey] || [];

  // Form state for adding a new site (Admin)
  const [newSiteData, setNewSiteData] = useState({
    name: '',
    cp: '',
    dept: '',
    type: isPv ? 'Construction' : 'Poste Source HTA',
    kwc: isPv ? 315 : 0,
    kw: !isPv ? 500 : 0,
    cost: isPv ? 150000 : 0,
    client: '',
    bailleur: '',
    statut: 'URBA OK',
    posteSource: !isPv ? 'Poste HTA 20kV' : '',
    address: '',
  });

  const handleCopyText = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Combine default sites and admin custom sites, excluding deleted ones
  const allSitesCombined = useMemo(() => {
    const combined = [...sites, ...currentCustom];
    return combined.filter((s) => !currentDeleted.includes(s.id));
  }, [sites, currentCustom, currentDeleted]);

  // Filter sites based on search term
  const filteredSites = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return allSitesCombined;
    return allSitesCombined.filter((site) => {
      const matchName = (site.name || site.ville || '').toLowerCase().includes(term);
      const matchDept = (site.dept || '').toString().toLowerCase().includes(term);
      const matchCp = (site.cp || '').toString().toLowerCase().includes(term);
      const matchClient = (site.client || site.bailleur || '').toLowerCase().includes(term);
      const matchPoste = (site.posteSource || '').toLowerCase().includes(term);
      const matchType = (site.type || '').toLowerCase().includes(term);
      return matchName || matchDept || matchCp || matchClient || matchPoste || matchType;
    });
  }, [allSitesCombined, searchTerm]);

  const allFilteredSelected =
    filteredSites.length > 0 &&
    filteredSites.every((s) => selectedSiteIds.includes(s.id));

  // Handle Admin Add Site Submit
  const handleAddSiteSubmit = (e) => {
    e.preventDefault();
    if (!newSiteData.name.trim()) {
      alert('Veuillez renseigner le nom du projet / commune.');
      return;
    }

    const nextId = allSitesCombined.length > 0 ? Math.max(...allSitesCombined.map((s) => Number(s.id) || 0)) + 1 : 1;

    addCustomSite(portfolioKey, {
      ...newSiteData,
      id: nextId,
      kwc: Number(newSiteData.kwc) || 315,
      kw: Number(newSiteData.kw) || 500,
      cost: Number(newSiteData.cost) || 0,
      dept: newSiteData.dept || (newSiteData.cp ? newSiteData.cp.substring(0, 2) : '33'),
    });

    setIsAddSiteModalOpen(false);
    setNewSiteData({
      name: '',
      cp: '',
      dept: '',
      type: isPv ? 'Construction' : 'Poste Source HTA',
      kwc: isPv ? 315 : 0,
      kw: !isPv ? 500 : 0,
      cost: isPv ? 150000 : 0,
      client: '',
      bailleur: '',
      statut: 'URBA OK',
      posteSource: !isPv ? 'Poste HTA 20kV' : '',
      address: '',
    });
  };

  // Handle Batch Delete (Admin)
  const handleBatchDelete = () => {
    if (selectedSiteIds.length === 0) return;
    if (window.confirm(`Confirmez-vous la suppression de ${selectedSiteIds.length} projet(s) du portefeuille ${portfolioKey.toUpperCase()} ?`)) {
      deleteBatchSites(portfolioKey, selectedSiteIds);
      onClearSelection && onClearSelection();
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Section Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-[11px] text-blue-700 uppercase tracking-widest font-black flex items-center gap-1.5">
            <span>RÉPERTOIRE FONCIER & RACCORDEMENT</span>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold border border-purple-200">
                Mode Administrateur Actif
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0b192c] mt-1 tracking-tight">
            Liste Complète des {allSitesCombined.length} Sites du Portefeuille {isPv ? 'HÉLIOS' : 'VOLTA'}
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Cliquez sur une ligne pour ouvrir la fiche détaillée et consulter les pièces justificatives associées.
          </p>
        </div>

        {/* Search input + Admin Action + Count badge */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setIsAddSiteModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Ajouter un projet</span>
              </button>

              {selectedSiteIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer ({selectedSiteIds.length})</span>
                </button>
              )}
            </>
          )}

          {selectedSiteIds.length > 0 && !isAdmin && (
            <button
              onClick={() => onOpenOfferModal && onOpenOfferModal()}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Proposer une offre ({selectedSiteIds.length})</span>
            </button>
          )}

          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrer (nom, dép, poste)..."
              className="w-full pl-8 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-inner transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <span className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-mono text-xs font-bold whitespace-nowrap">
            {filteredSites.length} / {allSitesCombined.length} Sites
          </span>
        </div>
      </div>

      {/* Select All / Deselect Toolbar */}
      {onToggleSiteSelect && (
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (allFilteredSelected) {
                  onClearSelection && onClearSelection();
                } else {
                  onSelectAll && onSelectAll(filteredSites.filter((s) => !currentSold.includes(s.id)).map((s) => s.id));
                }
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {allFilteredSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tout désélectionner</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tout sélectionner</span>
                </>
              )}
            </button>
            {selectedSiteIds.length > 0 && (
              <span className="text-blue-700 font-bold text-xs">
                <strong>{selectedSiteIds.length}</strong> site(s) sélectionné(s) pour offre partielle
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Cliquez sur un projet pour afficher les détails et télécharger les documents Data Room
          </span>
        </div>
      )}

      {/* Table Container (Light Theme) */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          {/* Header Row */}
          <thead className="bg-slate-100/90 text-[10px] uppercase tracking-wider text-slate-700 border-b border-slate-200 font-black select-none">
            <tr>
              <th className="py-3 px-3 w-10 text-center">
                <span className="sr-only">Sélection</span>
                #
              </th>
              <th className="py-3 px-3 w-10 text-center font-mono text-slate-500">N°</th>
              <th className="py-3 px-4 text-slate-900">PROJET & COMMUNE</th>
              <th className="py-3 px-3 text-center text-slate-700">DÉP.</th>
              <th className="py-3 px-4 text-slate-900">
                {isPv ? 'PROPRIÉTAIRE / CLIENT' : 'BAILLEUR / PROPRIÉTAIRE'}
              </th>
              <th className="py-3 px-3 text-slate-900">
                {isPv ? 'TYPE DE BÂTIMENT' : 'POSTE SOURCE ENEDIS'}
              </th>
              <th className="py-3 px-3 text-right text-slate-700">
                {isPv ? 'SURFACE EST.' : 'DIST. HTA'}
              </th>
              <th className="py-3 px-3 text-right text-slate-700">
                {isPv ? 'COÛT TRAVAUX HT HORS PV' : 'QUOTE-PART S3RENR'}
              </th>
              <th className="py-3 px-3 text-right text-emerald-700">
                {isPv ? 'PUISSANCE' : 'EBITDA AN 1'}
              </th>
              <th className="py-3 px-3 text-center text-slate-700">
                {isPv ? 'STATUT URBA' : 'PAYBACK'}
              </th>
              <th className="py-3 px-3 text-center text-slate-700">FICHE</th>
              {isAdmin && (
                <th className="py-3 px-3 text-center text-purple-900 bg-purple-50 font-black border-l border-purple-200">
                  GESTION ADMIN
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {filteredSites.map((site) => {
              const isSelected = selectedSiteIds.includes(site.id);
              const isSold = currentSold.includes(site.id);
              const numStr = String(site.id).padStart(2, '0');
              const siteDocs = getDocumentsForSite(site, portfolioKey, storeState);

              // PV-specific values
              const pvCost = site.cost > 0
                ? `${new Intl.NumberFormat('fr-FR').format(site.cost)} €`
                : 'Toiture exist.';
              const pvSurface = `${Math.round((site.kwc || 315) * 5.8)} m²`;

              // High Blur effect when sold for regular investors
              const blurClass = isSold && !isAdmin ? 'filter blur-[6px] opacity-40 select-none pointer-events-none' : '';

              return (
                <tr
                  key={site.id}
                  onClick={() => {
                    if (isSold && !isAdmin) return;
                    setActiveModalSite(site);
                  }}
                  className={`transition ${
                    isSold
                      ? 'bg-slate-100/80 cursor-default'
                      : isSelected
                      ? 'bg-blue-50/80 hover:bg-blue-50 cursor-pointer'
                      : 'hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  {/* Checkbox column */}
                  <td
                    className="py-3 px-3 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSold && onToggleSiteSelect) onToggleSiteSelect(site.id);
                    }}
                  >
                    {isSold ? (
                      <span title="Projet Vendu (non sélectionnable)" className="inline-block">
                        <input
                          type="checkbox"
                          disabled
                          checked={false}
                          className="rounded border-slate-300 text-slate-300 opacity-30 cursor-not-allowed"
                        />
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    )}
                  </td>

                  {/* ID */}
                  <td className={`py-3 px-3 font-mono text-slate-500 font-bold text-center text-[11px] ${blurClass}`}>
                    {numStr}
                  </td>

                  {/* Projet & Commune */}
                  <td className="py-3 px-4 relative">
                    <div className={blurClass}>
                      <div className="font-bold text-slate-900 text-[12px] flex items-center gap-1.5">
                        <span>{site.name || site.ville}</span>
                        {site.cp && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            ({site.cp})
                          </span>
                        )}
                        {site.isCustom && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9px] font-bold">
                            Nouveau
                          </span>
                        )}
                      </div>
                      {site.address && (
                        <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5 font-medium">
                          {site.address}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Dept */}
                  <td className={`py-3 px-3 text-center ${blurClass}`}>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[10px] border border-slate-200">
                      {site.dept || (site.cp ? String(site.cp).substring(0, 2) : '-')}
                    </span>
                  </td>

                  {/* Bailleur / Propriétaire */}
                  <td className={`py-3 px-4 text-slate-700 text-[11px] font-medium ${blurClass}`}>
                    {site.bailleur || site.client || '-'}
                  </td>

                  {/* Poste Source / Type */}
                  <td className={`py-3 px-3 ${blurClass}`}>
                    <span className="text-slate-800 font-mono text-[11px] font-semibold">
                      {isPv ? site.type : (site.posteSource || 'Réseau HTA')}
                    </span>
                  </td>

                  {/* Dist HTA / Surface */}
                  <td className={`py-3 px-3 text-right font-mono text-slate-600 text-[11px] ${blurClass}`}>
                    {isPv ? pvSurface : (site.distHta || '5.2 km')}
                  </td>

                  {/* Quote-part / Coût */}
                  <td className={`py-3 px-3 text-right font-mono text-slate-800 font-medium text-[11px] ${blurClass}`}>
                    {isPv ? pvCost : (site.quotePart || '42,71 k€')}
                  </td>

                  {/* EBITDA / Puissance */}
                  <td className={`py-3 px-3 text-right font-mono font-black text-[11px] text-emerald-700 ${blurClass}`}>
                    {isPv ? `${site.kwc || 315} kWc` : (site.ebitda || '55 438 €')}
                  </td>

                  {/* Payback / Statut */}
                  <td className="py-3 px-3 text-center">
                    {isSold ? (
                      <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 border border-red-300 font-black text-[10px] uppercase tracking-wider whitespace-nowrap shadow-xs">
                        🔒 VENDU
                      </span>
                    ) : isPv ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        site.orange
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {site.statut || 'URBA OK'}
                      </span>
                    ) : (
                      <span className="font-mono text-slate-800 font-bold text-[11px]">
                        {site.payback || '4.6 ans'}
                      </span>
                    )}
                  </td>

                  {/* Fiche / Documents Icon */}
                  <td className="py-3 px-3 text-center" onClick={(e) => {
                    e.stopPropagation();
                    if (isSold && !isAdmin) return;
                    setActiveModalSite(site);
                  }}>
                    <button
                      type="button"
                      disabled={isSold && !isAdmin}
                      className={`p-1.5 rounded-lg border transition ${
                        isSold && !isAdmin
                          ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                          : 'bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-800 border-slate-200 cursor-pointer'
                      }`}
                      title={isSold ? 'Projet Vendu' : 'Consulter la fiche détaillée & documents'}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>

                  {/* Admin Actions Column */}
                  {isAdmin && (
                    <td
                      className="py-3 px-3 text-center bg-purple-50/50 border-l border-purple-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleSoldSite(portfolioKey, site.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                            isSold
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                          }`}
                          title={isSold ? 'Remettre ce projet en vente' : 'Indiquer ce projet comme vendu'}
                        >
                          {isSold ? 'Remettre en vente' : 'Marquer Vendu'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Supprimer définitivement le projet « ${site.name || site.ville} » (${site.id}) ?`)) {
                              deleteSite(portfolioKey, site.id);
                            }
                          }}
                          className="p-1 rounded-lg bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 transition cursor-pointer"
                          title="Supprimer ce projet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>

          {/* Footer Consolidated Totals */}
          <tfoot className="border-t-2 border-slate-300 bg-slate-100 font-bold text-xs text-slate-900">
            <tr>
              <td className="py-3.5 px-3 text-center font-mono text-slate-400">-</td>
              <td className="py-3.5 px-3 text-center font-mono text-slate-400">-</td>
              <td className="py-3.5 px-4 font-black uppercase tracking-wider text-slate-900">
                TOTAL CONSOLIDÉ ({allSitesCombined.length} SITES {isPv ? 'PV' : 'STANDARDISÉS'})
              </td>
              <td className="py-3.5 px-3 text-center text-slate-400">-</td>
              <td className="py-3.5 px-4 text-slate-600 font-medium">
                {isPv ? 'Exploitants contractualisés' : '31 Baux notariés signés'}
              </td>
              <td className="py-3.5 px-3 text-slate-800 font-mono">
                {isPv ? '26 Neufs / 3 Toitures' : '31 Postes HTA'}
              </td>
              <td className="py-3.5 px-3 text-right font-mono text-slate-800">
                {isPv ? '~52 000 m²' : '7,2 km moy.'}
              </td>
              <td className="py-3.5 px-3 text-right font-mono text-slate-800">
                {isPv ? '4,45 M€ HT' : '50,1 k€ moy.'}
              </td>
              <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-700 text-sm">
                {isPv ? '9,12 MWc' : '1 718 578 €'}
              </td>
              <td className="py-3.5 px-3 text-center font-mono text-slate-800">
                {isPv ? `${allSitesCombined.filter((s) => !currentSold.includes(s.id)).length} DISPONIBLES` : '4,6 ans'}
              </td>
              <td className="py-3.5 px-3 text-center text-emerald-600 font-bold">✓</td>
              {isAdmin && <td className="py-3.5 px-3 text-center text-purple-700 font-bold bg-purple-50/50">Admin</td>}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ============================================================= */}
      {/* MODAL ADMIN : AJOUTER UN NOUVEAU PROJET AU PORTEFEUILLE      */}
      {/* ============================================================= */}
      {isAddSiteModalOpen && (
        <div className="fixed inset-0 z-[1100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-black text-[#0b192c]">
                  Ajouter un projet — {isPv ? 'HÉLIOS (PV)' : 'VOLTA (BESS)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSiteModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSiteSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom / Commune *</label>
                  <input
                    type="text"
                    required
                    value={newSiteData.name}
                    onChange={(e) => setNewSiteData({ ...newSiteData, name: e.target.value })}
                    placeholder="ex: CONDOM ou SAINTE-LIVRADE"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code Postal</label>
                  <input
                    type="text"
                    value={newSiteData.cp}
                    onChange={(e) => setNewSiteData({
                      ...newSiteData,
                      cp: e.target.value,
                      dept: e.target.value ? e.target.value.substring(0, 2) : newSiteData.dept,
                    })}
                    placeholder="ex: 32100"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Département</label>
                  <input
                    type="text"
                    value={newSiteData.dept}
                    onChange={(e) => setNewSiteData({ ...newSiteData, dept: e.target.value })}
                    placeholder="ex: 32"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isPv ? 'Puissance (kWc)' : 'Puissance (kW)'} *
                  </label>
                  <input
                    type="number"
                    required
                    value={isPv ? newSiteData.kwc : newSiteData.kw}
                    onChange={(e) => setNewSiteData({
                      ...newSiteData,
                      kwc: Number(e.target.value),
                      kw: Number(e.target.value),
                    })}
                    placeholder={isPv ? '315' : '500'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isPv ? 'Typologie de bâtiment' : 'Poste Source Enedis'}
                  </label>
                  <input
                    type="text"
                    value={isPv ? newSiteData.type : newSiteData.posteSource}
                    onChange={(e) => setNewSiteData({
                      ...newSiteData,
                      type: e.target.value,
                      posteSource: e.target.value,
                    })}
                    placeholder={isPv ? 'Construction ou Rénovation' : 'HTA 20 kV'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isPv ? 'Coût travaux HT (€)' : 'Quote-part Enedis (€)'}
                  </label>
                  <input
                    type="number"
                    value={newSiteData.cost}
                    onChange={(e) => setNewSiteData({ ...newSiteData, cost: Number(e.target.value) })}
                    placeholder="150000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isPv ? 'Propriétaire / Client' : 'Bailleur Foncier'}
                  </label>
                  <input
                    type="text"
                    value={newSiteData.client}
                    onChange={(e) => setNewSiteData({
                      ...newSiteData,
                      client: e.target.value,
                      bailleur: e.target.value,
                    })}
                    placeholder="ex: EARL ou Exploitant agricole"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statut Foncier / Urba</label>
                  <select
                    value={newSiteData.statut}
                    onChange={(e) => setNewSiteData({ ...newSiteData, statut: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                  >
                    <option value="URBA OK">URBA OK (Permis purgé)</option>
                    <option value="EN COURS">Dépôt en cours</option>
                    <option value="EN ATTENTE">En attente instruction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adresse / Lieu-dit</label>
                <input
                  type="text"
                  value={newSiteData.address}
                  onChange={(e) => setNewSiteData({ ...newSiteData, address: e.target.value })}
                  placeholder="ex: Lieu Dit Le Bourg"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSiteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black transition shadow-sm cursor-pointer"
                >
                  Ajouter le projet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL : FICHE DÉTAILLÉE DU SITE & DOCUMENTS DATA ROOM         */}
      {/* ============================================================= */}
      {activeModalSite && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl text-slate-900 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Site #{String(activeModalSite.id).padStart(2, '0')} • Dép {activeModalSite.dept}
                  </span>
                  {currentSold.includes(activeModalSite.id) ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-200">
                      🔒 VENDU
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {activeModalSite.statut || 'URBA OK'}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-[#0b192c] mt-1.5 tracking-tight">
                  {activeModalSite.name || activeModalSite.ville}
                </h3>
                {activeModalSite.cp && (
                  <p className="text-xs text-slate-500 font-medium">Code postal : {activeModalSite.cp}</p>
                )}
              </div>
              <button
                onClick={() => setActiveModalSite(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-200">
                <span className="text-slate-500 block text-[9px] uppercase font-black">Puissance</span>
                <span className="text-base font-black text-blue-700 font-mono">
                  {isPv ? `${activeModalSite.kwc || 315} kWc` : `${activeModalSite.kw || 500} kW`}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block text-[9px] uppercase font-black">
                  {isPv ? 'Typologie' : 'Architecture'}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {isPv ? activeModalSite.type : '4 × 125 kW'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block text-[9px] uppercase font-black">
                  {isPv ? 'Chiffrage Travaux' : 'Poste Source'}
                </span>
                <span className="text-xs font-bold text-slate-800 font-mono">
                  {isPv
                    ? (activeModalSite.cost > 0 ? `${activeModalSite.cost.toLocaleString('fr-FR')} €` : 'Existant')
                    : (activeModalSite.posteSource || 'Réseau HTA')}
                </span>
              </div>
              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200">
                <span className="text-slate-500 block text-[9px] uppercase font-black">
                  {isPv ? 'Statut Urba' : 'EBITDA An 1'}
                </span>
                <span className="text-xs font-black text-emerald-700 font-mono">
                  {isPv ? (activeModalSite.statut || 'URBA OK') : (activeModalSite.ebitda || '55 438 €')}
                </span>
              </div>
            </div>

            {/* Site Contact & Land Details */}
            <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {(activeModalSite.bailleur || activeModalSite.client) && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Bailleur / Propriétaire :</span>
                  <span className="text-slate-900 font-bold">{activeModalSite.bailleur || activeModalSite.client}</span>
                </div>
              )}

              {activeModalSite.address && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium shrink-0">Adresse :</span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-slate-900 font-bold text-right truncate">
                      {activeModalSite.address} {activeModalSite.cp ? `(${activeModalSite.cp})` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(`${activeModalSite.address} ${activeModalSite.cp || ''}`, 'address')}
                      className="p-1 rounded bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition shrink-0"
                      title="Copier l'adresse"
                    >
                      {copiedField === 'address' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeModalSite.coords && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Coordonnées GPS :</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-900 font-bold">
                      {activeModalSite.coords.lat.toFixed(4)}, {activeModalSite.coords.lng.toFixed(4)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(`${activeModalSite.coords.lat}, ${activeModalSite.coords.lng}`, 'gps')}
                      className="p-1 rounded bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition shrink-0"
                      title="Copier les coordonnées GPS"
                    >
                      {copiedField === 'gps' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Bail emphytéotique :</span>
                <span className="text-slate-900 font-bold">
                  {isPv ? '20 ans (renouvelable)' : '20 ans signé (notarié)'}
                </span>
              </div>
            </div>

            {/* Documents associés dans la Data Room */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pièces & Justificatifs Data Room ({getDocumentsForSite(activeModalSite, portfolioKey, storeState).length})</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Téléchargement direct
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {getDocumentsForSite(activeModalSite, portfolioKey, storeState).map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-blue-50/50 transition gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                        {doc.type || 'PDF'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {doc.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {doc.category} • {doc.size || '1.2 Mo'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        recordDownload({
                          userEmail: currentInvestor?.email || 'visiteur@enr-courtage.fr',
                          userName: currentInvestor?.name || 'Visiteur',
                          userCompany: currentInvestor?.company || 'Non renseigné',
                          portfolioId: portfolioKey,
                          portfolioName: isPv ? 'PROJET HÉLIOS' : 'PROJET VOLTA',
                          fileName: doc.name,
                          fileSize: doc.size || '1.2 Mo',
                          fileType: doc.type || 'PDF',
                        });
                        downloadOrViewDoc(doc, portfolioKey);
                      }}
                      className="p-1.5 rounded-lg bg-white hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200 hover:border-blue-600 transition flex items-center gap-1 text-[11px] font-bold shadow-2xs shrink-0 cursor-pointer"
                      title="Télécharger ce document"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModalSite(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
