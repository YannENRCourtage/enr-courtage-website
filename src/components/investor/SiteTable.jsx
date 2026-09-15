import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle2, Clock, Info, CheckSquare, Square, X, MapPin } from 'lucide-react';

export default function SiteTable({
  sites = [],
  type = 'PV', // 'PV' | 'BESS'
  excludeOrange = true,
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

  // Filter sites
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      // Orange exclusion for PV
      if (type === 'PV' && excludeOrange && site.orange) {
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
  }, [sites, type, excludeOrange, typeFilter, searchTerm]);

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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une commune, un département, un client..."
            className="w-full pl-9 pr-3 py-2 bg-gray-800/80 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
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
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                typeFilter === 'ALL'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Tous ({sites.filter((s) => !excludeOrange || !s.orange).length})
            </button>
            <button
              onClick={() => setTypeFilter('CONSTRUCTION')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                typeFilter === 'CONSTRUCTION'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Neufs
            </button>
            <button
              onClick={() => setTypeFilter('TOITURES')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                typeFilter === 'TOITURES'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
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
              className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition flex items-center gap-1.5"
            >
              {allFilteredSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tout désélectionner</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-gray-400" />
                  <span>Tout sélectionner</span>
                </>
              )}
            </button>
            <span className="text-gray-400">
              <strong className="text-amber-400">{selectedSiteIds.length}</strong> sélectionné(s)
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/40">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-gray-800/80 text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-700">
            <tr>
              {showSelection && <th className="py-3 px-3 w-10 text-center">#</th>}
              <th className="py-3 px-3 w-12 text-center">N°</th>
              <th className="py-3 px-4">Commune / Adresse</th>
              <th className="py-3 px-3 text-center">Dép.</th>
              <th className="py-3 px-3 text-right">Puissance</th>
              <th className="py-3 px-3">Typologie</th>
              <th className="py-3 px-3">
                {type === 'PV' ? 'Chiffrage Bâtiment HT' : 'Foncier / Loyer'}
              </th>
              <th className="py-3 px-3 text-center">Statut Urba</th>
              <th className="py-3 px-3 text-center">Fiche</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filteredSites.map((site) => {
              const isSelected = selectedSiteIds.includes(site.id);
              const isOrange = site.orange;
              const powerText = type === 'PV' ? `${site.kwc} kWc` : `${site.kw || 500} kW`;
              const powerColor = type === 'PV' ? 'text-amber-400' : 'text-cyan-400';

              const costDisplay =
                type === 'PV'
                  ? site.cost > 0
                    ? `${new Intl.NumberFormat('fr-FR').format(site.cost)} €`
                    : 'Toiture existante'
                  : 'PdB 20 ans (3 k€/an)';

              return (
                <tr
                  key={site.id}
                  className={`hover:bg-gray-800/60 transition cursor-pointer ${
                    isSelected ? 'bg-amber-500/10' : isOrange ? 'bg-amber-950/20' : ''
                  }`}
                  onClick={() => handleRowClick(site)}
                >
                  {/* Checkbox column */}
                  {showSelection && (
                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSiteSelect && onToggleSiteSelect(site.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-gray-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                    </td>
                  )}

                  {/* ID */}
                  <td className="py-3 px-3 font-mono text-gray-500 text-center">{site.id}</td>

                  {/* Commune & Details */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {site.name || site.ville}
                      {site.cp && <span className="text-[10px] text-gray-500 font-normal">({site.cp})</span>}
                    </div>
                    {site.address && (
                      <div className="text-[10px] text-gray-400 truncate max-w-xs">
                        {site.address} {site.client && `• ${site.client}`}
                      </div>
                    )}
                  </td>

                  {/* Dept */}
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono text-[10px] border border-gray-700">
                      {site.dept || (site.cp ? site.cp.substring(0, 2) : '-')}
                    </span>
                  </td>

                  {/* Power */}
                  <td className={`py-3 px-3 text-right font-bold font-mono ${powerColor}`}>
                    {powerText}
                  </td>

                  {/* Typology */}
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        site.type === 'Construction'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : site.type === 'Toitures'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {site.type}
                    </span>
                  </td>

                  {/* Cost */}
                  <td className="py-3 px-3 font-mono text-gray-300 text-[11px]">{costDisplay}</td>

                  {/* Urban status */}
                  <td className="py-3 px-3 text-center">
                    {site.orange ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-bold">
                        <Clock className="w-3 h-3" /> En attente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> URBA OK
                      </span>
                    )}
                  </td>

                  {/* Info Action */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      className="text-cyan-400 hover:text-cyan-300 transition"
                      title="Voir la fiche détaillée"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredSites.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-xs">
            Aucun projet ne correspond à vos critères de recherche.
          </div>
        )}
      </div>

      {/* Summary count */}
      <div className="text-[11px] text-gray-400 flex items-center justify-between">
        <span>
          Affichage de <strong>{filteredSites.length}</strong> projet(s){' '}
          {excludeOrange && type === 'PV' ? '(projets urba à risque exclus)' : ''}
        </span>
        <span className="text-emerald-400 font-medium">Données certifiées conformes aux extractions</span>
      </div>

      {/* Site Detail Modal */}
      {activeModalSite && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                  Site #{activeModalSite.id} • Dép {activeModalSite.dept}
                </span>
                <h4 className="text-lg font-bold text-white mt-1">
                  {activeModalSite.name || activeModalSite.ville}
                </h4>
              </div>
              <button
                onClick={() => setActiveModalSite(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-800">
                <span className="text-gray-400 block text-[10px] uppercase">Puissance</span>
                <span className="text-base font-bold text-amber-400 font-mono">
                  {type === 'PV' ? `${activeModalSite.kwc} kWc` : `${activeModalSite.kw || 500} kW`}
                </span>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-800">
                <span className="text-gray-400 block text-[10px] uppercase">Typologie</span>
                <span className="text-base font-bold text-white">{activeModalSite.type}</span>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-800">
                <span className="text-gray-400 block text-[10px] uppercase">Statut Urbanistique</span>
                <span
                  className={`text-xs font-bold ${
                    activeModalSite.orange ? 'text-orange-400' : 'text-emerald-400'
                  }`}
                >
                  {activeModalSite.statut || 'URBA OK'}
                </span>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-800">
                <span className="text-gray-400 block text-[10px] uppercase">Chiffrage / Loyer</span>
                <span className="text-xs font-bold text-gray-200 font-mono">
                  {type === 'PV'
                    ? activeModalSite.cost > 0
                      ? `${new Intl.NumberFormat('fr-FR').format(activeModalSite.cost)} € HT`
                      : 'Existant'
                    : '3 000 € / an'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-gray-800/30 p-3 rounded-lg border border-gray-800">
              {activeModalSite.client && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Propriétaire / Client :</span>
                  <span className="text-white font-medium">{activeModalSite.client}</span>
                </div>
              )}
              {activeModalSite.address && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Adresse :</span>
                  <span className="text-white font-medium text-right">{activeModalSite.address}</span>
                </div>
              )}
              {activeModalSite.lat && activeModalSite.lng && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Coordonnées GPS :</span>
                  <span className="text-cyan-400 font-mono text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {activeModalSite.lat.toFixed(4)}, {activeModalSite.lng.toFixed(4)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModalSite(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold"
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
