import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle2, Clock, Info, CheckSquare, Square, X, MapPin, Copy, Check } from 'lucide-react';

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
  const [copiedField, setCopiedField] = useState(null);

  const handleCopyText = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

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
              Tous ({sites.filter((s) => !excludeOrange || !s.orange).length})
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
          <thead className="bg-slate-100 text-[11px] uppercase tracking-wider text-slate-700 border-b border-slate-200 font-bold">
            <tr>
              {showSelection && <th className="py-3 px-3 w-10 text-center">#</th>}
              <th className="py-3 px-3 w-12 text-center text-slate-600">N°</th>
              <th className="py-3 px-4 text-slate-800">Commune / Adresse</th>
              <th className="py-3 px-3 text-center text-slate-700">Dép.</th>
              <th className="py-3 px-3 text-right text-slate-800">Puissance</th>
              <th className="py-3 px-3 text-slate-700">Typologie</th>
              <th className="py-3 px-3 text-slate-800">
                {type === 'PV' ? 'Chiffrage Bâtiment HT' : 'Foncier / Loyer'}
              </th>
              <th className="py-3 px-3 text-center text-slate-700">Statut Urba</th>
              <th className="py-3 px-3 text-center text-slate-600">Fiche</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredSites.map((site) => {
              const isSelected = selectedSiteIds.includes(site.id);
              const isOrange = site.orange;
              const powerText = type === 'PV' ? `${site.kwc} kWc` : `${site.kw || 500} kW`;
              const powerColor = type === 'PV' ? 'text-amber-700' : 'text-cyan-700';

              const costDisplay =
                type === 'PV'
                  ? site.cost > 0
                    ? `${new Intl.NumberFormat('fr-FR').format(site.cost)} €`
                    : 'Toiture existante'
                  : 'PdB 20 ans (3 k€/an)';

              return (
                <tr
                  key={site.id}
                  className={`hover:bg-slate-50 transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/80 font-medium'
                      : isOrange
                      ? 'bg-orange-50/50'
                      : 'bg-white'
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
                        className="rounded border-slate-300 text-amber-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                  )}

                  {/* ID */}
                  <td className="py-3 px-3 font-mono text-slate-500 font-bold text-center">{site.id}</td>

                  {/* Commune & Details */}
                  <td className="py-3 px-4">
                    <div className="font-black text-slate-950 flex items-center gap-1.5 text-[13px]">
                      {site.name || site.ville}
                      {site.cp && <span className="text-[11px] text-slate-500 font-semibold">({site.cp})</span>}
                    </div>
                    {site.address && (
                      <div className="text-[11px] text-slate-600 truncate max-w-xs font-medium">
                        {site.address} {site.client && `• ${site.client}`}
                      </div>
                    )}
                  </td>

                  {/* Dept */}
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold text-[10px] border border-slate-300">
                      {site.dept || (site.cp ? site.cp.substring(0, 2) : '-')}
                    </span>
                  </td>

                  {/* Power */}
                  <td className={`py-3 px-3 text-right font-black font-mono text-xs ${powerColor}`}>
                    {powerText}
                  </td>

                  {/* Typology */}
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        site.type === 'Construction'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : site.type === 'Toitures'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-cyan-50 text-cyan-800 border-cyan-300'
                      }`}
                    >
                      {site.type}
                    </span>
                  </td>

                  {/* Cost */}
                  <td className="py-3 px-3 font-mono text-slate-900 text-[11px] font-bold">{costDisplay}</td>

                  {/* Urban status */}
                  <td className="py-3 px-3 text-center">
                    {site.orange ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300 text-[10px] font-bold">
                        <Clock className="w-3 h-3 text-orange-700" /> En attente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" /> URBA OK
                      </span>
                    )}
                  </td>

                  {/* Info Action */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                      title="Voir la fiche détaillée"
                    >
                      <Info className="w-4 h-4 text-blue-600" />
                    </button>
                  </td>
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
      <div className="text-[11px] text-slate-500 flex items-center justify-between font-medium">
        <span>
          Affichage de <strong className="text-slate-900 font-bold">{filteredSites.length}</strong> projet(s){' '}
          {excludeOrange && type === 'PV' ? '(projets urba à risque exclus)' : ''}
        </span>
        <span className="text-emerald-700 font-bold">Données certifiées conformes aux extractions</span>
      </div>

      {/* Site Detail Modal */}
      {activeModalSite && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900">
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
