import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Info,
  CheckSquare,
  Square,
  X,
  MapPin,
  Copy,
  Check,
  Trash2,
  Tag,
  ShieldAlert,
  RotateCcw,
  AlertTriangle,
  FileText,
  Download,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { getDocumentsForSite, downloadOrViewDoc } from '@/services/dataRoomDocumentService';

export default function SiteTable({
  sites = [],
  type = 'PV', // 'PV' | 'BESS'
  portfolioId = null,
  selectedSiteIds = [],
  onToggleSiteSelect = null,
  onSelectAll = null,
  onClearSelection = null,
  onOpenSiteDetail = null,
  showSelection = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [activeModalSite, setActiveModalSite] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const {
    currentInvestor,
    soldSites = { helios: [], volta: [] },
    deletedSites = { helios: [], volta: [] },
    customDataRoom,
    deletedDefaultDocs,
    documentSiteAssignments,
    recordDownload,
    toggleSoldSite,
    deleteSite,
    restoreSite,
  } = useInvestorStore();

  const storeState = useMemo(() => ({
    customDataRoom,
    deletedDefaultDocs,
    documentSiteAssignments,
  }), [customDataRoom, deletedDefaultDocs, documentSiteAssignments]);

  const isAdmin = currentInvestor?.email?.trim().toLowerCase() === 'y.barberis@enr-courtage.fr';
  const portfolioKey = (type === 'BESS' || String(portfolioId || '').toLowerCase().includes('volta')) ? 'volta' : 'helios';
  const currentDeleted = deletedSites?.[portfolioKey] || [];
  const currentSold = soldSites?.[portfolioKey] || [];

  const handleCopyText = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Filter sites (excluding deleted ones)
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      // Exclude deleted sites
      if (currentDeleted.includes(site.id)) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'ALL') {
        if (typeFilter === 'CONSTRUCTION' && site.type !== 'Construction') return false;
        if (typeFilter === 'TOITURES' && site.type !== 'Toitures') return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const searchStr = `${site.name || ''} ${site.ville || ''} ${site.cp || ''} ${site.client || ''} ${site.address || ''} ${site.dept || ''}`.toLowerCase();
        return searchStr.includes(q);
      }

      return true;
    });
  }, [sites, type, typeFilter, searchTerm, currentDeleted]);

  const allFilteredSelected = filteredSites.length > 0 && filteredSites.every((s) => selectedSiteIds.includes(s.id));

  const handleRowClick = (site) => {
    if (onOpenSiteDetail) {
      onOpenSiteDetail(site);
    } else {
      setActiveModalSite(site);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une commune, un département, un client..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type Filter Buttons for PV */}
        {type === 'PV' && (
          <div className="flex items-center space-x-1.5 text-xs">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                typeFilter === 'ALL'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Tous ({sites.length})
            </button>
            <button
              onClick={() => setTypeFilter('CONSTRUCTION')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                typeFilter === 'CONSTRUCTION'
                  ? 'bg-blue-100 text-blue-900 border border-blue-300 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Neufs
            </button>
            <button
              onClick={() => setTypeFilter('TOITURES')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                typeFilter === 'TOITURES'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Rénovations
            </button>
          </div>
        )}

        {/* Selection helper */}
        {showSelection && (
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => {
                if (allFilteredSelected) {
                  onClearSelection && onClearSelection();
                } else {
                  onSelectAll && onSelectAll(filteredSites.map((s) => s.id));
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold transition flex items-center gap-1.5 shadow-2xs"
            >
              {allFilteredSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tout désélectionner</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tout sélectionner</span>
                </>
              )}
            </button>
            <span className="text-slate-600 font-medium">
              <strong className="text-amber-700 font-bold">{selectedSiteIds.length}</strong> sélectionné(s)
            </span>
          </div>
        )}
      </div>

      {/* Table (Clean White Background & Sharp Black Text) */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs text-slate-900">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-200 font-semibold">
            <tr>
              {showSelection && <th className="py-3 px-3 w-10 text-center">#</th>}
              <th className="py-3 px-3 w-12 text-center text-slate-500 font-mono">N°</th>
              <th className="py-3 px-4 text-slate-700">Commune / Localisation</th>
              <th className="py-3 px-3 text-center text-slate-600">Dép.</th>
              <th className="py-3 px-3 text-right text-slate-700">Puissance</th>
              <th className="py-3 px-3 text-slate-600">Typologie</th>
              <th className="py-3 px-3 text-slate-700">
                {type === 'PV' ? 'Chiffrage Bâtiment HT' : 'Foncier / Loyer'}
              </th>
              <th className="py-3 px-3 text-center text-slate-600">Statut</th>
              <th className="py-3 px-3 text-center text-slate-700">Data Room</th>
              <th className="py-3 px-3 text-center text-slate-500">Détail</th>
              {isAdmin && (
                <th className="py-3 px-3 text-center text-slate-700 bg-amber-50 font-semibold border-l border-amber-200">
                  Gestion Admin
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredSites.map((site) => {
              const isSelected = selectedSiteIds.includes(site.id);
              const isSold = currentSold.includes(site.id);
              const isOrange = site.orange;
              const powerText = type === 'PV' ? `${site.kwc} kWc` : `${site.kw || 500} kW`;
              const powerColor = type === 'PV' ? 'text-amber-700' : 'text-cyan-700';

              const costDisplay =
                type === 'PV'
                  ? site.cost > 0
                    ? `${new Intl.NumberFormat('fr-FR').format(site.cost)} €`
                    : 'Toiture existante'
                  : 'PdB 20 ans (3 k€/an)';

              const siteDocs = getDocumentsForSite(site, portfolioKey, storeState);

              return (
                <tr
                  key={site.id}
                  className={`transition relative ${
                    isSold
                      ? 'bg-slate-100/80 cursor-default'
                      : isSelected
                      ? 'bg-amber-50/80 font-medium cursor-pointer hover:bg-amber-100/60'
                      : isOrange
                      ? 'bg-orange-50/50 cursor-pointer hover:bg-orange-100/40'
                      : 'bg-white cursor-pointer hover:bg-slate-50'
                  }`}
                  onClick={() => !isSold && handleRowClick(site)}
                >
                  {/* Checkbox column */}
                  {showSelection && (
                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSold && onToggleSiteSelect) {
                          onToggleSiteSelect(site.id);
                        }
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
                          className="rounded border-slate-300 text-amber-600 focus:ring-0 cursor-pointer"
                        />
                      )}
                    </td>
                  )}

                  {/* ID */}
                  <td className={`py-3 px-3 font-mono text-slate-500 font-bold text-center ${isSold && !isAdmin ? 'blur-[6px] opacity-40 select-none pointer-events-none' : ''}`}>
                    {site.id}
                  </td>

                  {/* Commune & Details */}
                  <td className="py-3 px-4 relative">
                    <div className={`${isSold && !isAdmin ? 'blur-[6px] opacity-40 select-none pointer-events-none' : ''}`}>
                      <div className="font-black text-slate-950 flex items-center gap-1.5 text-[13px]">
                        {site.name || site.ville}
                        {site.cp && <span className="text-[11px] text-slate-500 font-semibold">({site.cp})</span>}
                      </div>
                      {site.address && (
                        <div className="text-[11px] text-slate-600 truncate max-w-xs font-medium">
                          {site.address} {site.client && `• ${site.client}`}
                        </div>
                      )}
                    </div>
                    {isSold && (
                      <div className="absolute inset-0 flex items-center justify-start pl-4 pointer-events-none">
                        <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-md border border-white">
                          🔒 Vendu !
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Dept */}
                  <td className={`py-3 px-3 text-center ${isSold && !isAdmin ? 'blur-[6px] opacity-40 select-none pointer-events-none' : ''}`}>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold text-[10px] border border-slate-300">
                      {site.dept || (site.cp ? site.cp.substring(0, 2) : '-')}
                    </span>
                  </td>

                  {/* Power */}
                  <td className={`py-3 px-3 text-right font-black font-mono text-xs ${powerColor} ${isSold && !isAdmin ? 'blur-[6px] opacity-40 select-none' : ''}`}>
                    {powerText}
                  </td>

                  {/* Typology */}
                  <td className={`py-3 px-3 ${isSold && !isAdmin ? 'blur-[6px] opacity-40 select-none' : ''}`}>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {site.type}
                    </span>
                  </td>

                  {/* Cost */}
                  <td className={`py-3 px-3 font-mono text-slate-800 text-[11px] font-semibold ${isSold && !isAdmin ? 'blur-[6px] opacity-40 select-none' : ''}`}>
                    {costDisplay}
                  </td>

                  {/* Urban status / Vendu Badge */}
                  <td className="py-3 px-3 text-center">
                    {isSold ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider">
                        Vendu
                      </span>
                    ) : site.orange ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>En cours</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sécurisé</span>
                      </span>
                    )}
                  </td>

                  {/* Documents Column */}
                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    {isSold ? (
                      <span className="text-[10px] text-slate-400 font-mono">-</span>
                    ) : siteDocs.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setActiveModalSite(site)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-[11px] font-medium transition cursor-pointer"
                        title={`${siteDocs.length} document(s) affecté(s) - Cliquer pour consulter`}
                      >
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span>{siteDocs.length} doc{siteDocs.length > 1 ? 's' : ''}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Général</span>
                    )}
                  </td>

                  {/* Info Action */}
                  <td className="py-3 px-3 text-center">
                    {!isSold ? (
                      <button
                        type="button"
                        className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                        title="Voir la fiche détaillée"
                      >
                        <Info className="w-4 h-4 text-blue-600" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">-</span>
                    )}
                  </td>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <td className="py-2.5 px-3 text-center bg-amber-50/40" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => toggleSoldSite(portfolioKey, site.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-2xs ${
                            isSold
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-300'
                          }`}
                          title={isSold ? 'Remettre en vente (retirer le statut Vendu)' : 'Marquer comme Vendu !'}
                        >
                          <Tag className="w-3 h-3" />
                          <span>{isSold ? 'Réactiver' : 'Vendu !'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Supprimer définitivement le projet #${site.id} (${site.name || site.ville}) de ce portefeuille ?`)) {
                              deleteSite(portfolioKey, site.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                          title="Supprimer ce projet du tableau"
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
        </table>

        {filteredSites.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs font-medium">
            Aucun projet ne correspond à vos critères de recherche.
          </div>
        )}
      </div>

      {/* Summary count */}
      <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 font-medium">
        <span>
          Affichage de <strong className="text-slate-900 font-bold">{filteredSites.length}</strong> projet(s)
          {currentSold.length > 0 ? ` • ${currentSold.length} projet(s) vendu(s)` : ''}
        </span>
        <span className="text-emerald-700 font-bold">Données certifiées conformes aux extractions</span>
      </div>

      {/* Admin restoration banner for deleted projects */}
      {isAdmin && currentDeleted.length > 0 && (
        <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-950 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>{currentDeleted.length}</strong> projet(s) supprimé(s) du tableau par l'administrateur.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {currentDeleted.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => restoreSite(portfolioKey, id)}
                className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                title={`Restaurer le projet #${id}`}
              >
                <RotateCcw className="w-3 h-3 text-amber-700" />
                <span>Restaurer #{id}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Site Detail Modal */}
      {activeModalSite && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-bold">
                  Site #{activeModalSite.id} • Dép {activeModalSite.dept}
                </span>
                <h4 className="text-lg font-black text-slate-950 mt-1">
                  {activeModalSite.name || activeModalSite.ville}
                </h4>
              </div>
              <button
                onClick={() => setActiveModalSite(null)}
                className="text-slate-400 hover:text-slate-800 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Puissance</span>
                <span className="text-base font-black text-amber-700 font-mono">
                  {type === 'PV' ? `${activeModalSite.kwc} kWc` : `${activeModalSite.kw || 500} kW`}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Typologie</span>
                <span className="text-base font-bold text-slate-900">{activeModalSite.type}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Statut Urbanistique</span>
                <span
                  className={`text-xs font-bold ${
                    activeModalSite.orange ? 'text-orange-700' : 'text-emerald-700'
                  }`}
                >
                  {activeModalSite.statut || 'URBA OK'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Chiffrage / Loyer</span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {type === 'PV'
                    ? activeModalSite.cost > 0
                      ? `${new Intl.NumberFormat('fr-FR').format(activeModalSite.cost)} € HT`
                      : 'Existant'
                    : '3 000 € / an'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {activeModalSite.client && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Propriétaire / Client :</span>
                  <span className="text-slate-900 font-bold">{activeModalSite.client}</span>
                </div>
              )}

              {activeModalSite.address && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium shrink-0">Adresse :</span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-slate-900 font-semibold text-right truncate">
                      {activeModalSite.address} {activeModalSite.cp ? `(${activeModalSite.cp} ${activeModalSite.ville || ''})` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(
                        `${activeModalSite.address}, ${activeModalSite.cp || ''} ${activeModalSite.ville || ''}`.trim(),
                        'address'
                      )}
                      className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 hover:text-amber-700 border border-slate-300 transition shrink-0"
                      title="Copier l'adresse"
                    >
                      {copiedField === 'address' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeModalSite.lat && activeModalSite.lng && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium shrink-0">Coordonnées GPS :</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-700 font-mono font-bold text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activeModalSite.lat.toFixed(6)}, {activeModalSite.lng.toFixed(6)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(`${activeModalSite.lat}, ${activeModalSite.lng}`, 'gps')}
                      className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-700 border border-slate-300 transition shrink-0"
                      title="Copier les coordonnées GPS"
                    >
                      {copiedField === 'gps' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Documents associés à ce projet */}
            {(() => {
              const modalSiteDocs = getDocumentsForSite(activeModalSite, portfolioKey, storeState);
              return (
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-bold text-slate-900">
                        Documents & Contrats associés ({modalSiteDocs.length})
                      </span>
                    </div>
                    {modalSiteDocs.length > 0 && (
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        Data Room
                      </span>
                    )}
                  </div>

                  {modalSiteDocs.length === 0 ? (
                    <div className="p-3 text-center bg-white rounded-lg border border-dashed border-slate-300 text-slate-500 text-xs">
                      <p className="font-medium">Aucun document spécifique affecté individuellement à ce projet.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Les documents généraux du portefeuille s'appliquent (consultables dans la section Data Room).
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {modalSiteDocs.map((doc, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 transition shadow-2xs"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                                {doc.type || 'PDF'}
                              </span>
                              <p className="text-xs font-bold text-slate-900 truncate" title={doc.name}>
                                {doc.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              <span className="font-semibold text-slate-600">{doc.category || 'Juridique'}</span>
                              <span>•</span>
                              <span>{doc.size || '1.5 Mo'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Consulter */}
                            <button
                              type="button"
                              onClick={() => downloadOrViewDoc(doc, { id: portfolioKey, type }, 'view', recordDownload)}
                              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white border border-slate-300 hover:border-emerald-600 text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="Consulter le document dans un nouvel onglet"
                            >
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Consulter</span>
                            </button>

                            {/* Télécharger */}
                            <button
                              type="button"
                              onClick={() => downloadOrViewDoc(doc, { id: portfolioKey, type }, 'download', recordDownload)}
                              className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-300 transition cursor-pointer"
                              title="Télécharger le fichier physique"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleCopyText(
                  `${activeModalSite.name || activeModalSite.ville} - ${activeModalSite.address || ''} (${activeModalSite.cp || ''}) | Coordonnées GPS : ${activeModalSite.lat}, ${activeModalSite.lng}`,
                  'both'
                )}
                className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                {copiedField === 'both' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Adresse & GPS Copiés !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier Adresse & GPS</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveModalSite(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
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
