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

  const {
    currentInvestor,
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

  const handleCopyText = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Filter sites based on search term
  const filteredSites = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return sites;
    return sites.filter((site) => {
      const matchName = (site.name || site.ville || '').toLowerCase().includes(term);
      const matchDept = (site.dept || '').toString().toLowerCase().includes(term);
      const matchCp = (site.cp || '').toString().toLowerCase().includes(term);
      const matchClient = (site.client || site.bailleur || '').toLowerCase().includes(term);
      const matchPoste = (site.posteSource || '').toLowerCase().includes(term);
      const matchType = (site.type || '').toLowerCase().includes(term);
      return matchName || matchDept || matchCp || matchClient || matchPoste || matchType;
    });
  }, [sites, searchTerm]);

  const allFilteredSelected =
    filteredSites.length > 0 &&
    filteredSites.every((s) => selectedSiteIds.includes(s.id));

  return (
    <div className="space-y-4">
      {/* Table Section Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-[11px] text-blue-700 uppercase tracking-widest font-black flex items-center gap-1.5">
            <span>RÉPERTOIRE FONCIER & RACCORDEMENT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0b192c] mt-1 tracking-tight">
            Liste Complète des {sites.length} Sites du Portefeuille {isPv ? 'HÉLIOS' : 'VOLTA'}
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Cliquez sur une ligne pour ouvrir la fiche détaillée et consulter les pièces justificatives associées.
          </p>
        </div>

        {/* Search input + Count badge */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedSiteIds.length > 0 && (
            <button
              onClick={() => onOpenOfferModal && onOpenOfferModal()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Proposer une offre ({selectedSiteIds.length})</span>
            </button>
          )}

          <div className="relative min-w-[240px]">
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
            {filteredSites.length} / {sites.length} Sites
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
                  onSelectAll && onSelectAll(filteredSites.map((s) => s.id));
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
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {filteredSites.map((site) => {
              const isSelected = selectedSiteIds.includes(site.id);
              const numStr = String(site.id).padStart(2, '0');
              const siteDocs = getDocumentsForSite(site, portfolioKey, storeState);

              // PV-specific values
              const pvCost = site.cost > 0
                ? `${new Intl.NumberFormat('fr-FR').format(site.cost)} €`
                : 'Toiture exist.';
              const pvSurface = `${Math.round(site.kwc * 5.8)} m²`;

              return (
                <tr
                  key={site.id}
                  onClick={() => setActiveModalSite(site)}
                  className={`transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 hover:bg-blue-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Checkbox column */}
                  <td
                    className="py-3 px-3 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleSiteSelect) onToggleSiteSelect(site.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </td>

                  {/* ID */}
                  <td className="py-3 px-3 font-mono text-slate-500 font-bold text-center text-[11px]">
                    {numStr}
                  </td>

                  {/* Projet & Commune */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-[12px] flex items-center gap-1.5">
                      <span>{site.name || site.ville}</span>
                      {site.cp && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          ({site.cp})
                        </span>
                      )}
                    </div>
                    {site.address && (
                      <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5 font-medium">
                        {site.address}
                      </div>
                    )}
                  </td>

                  {/* Dept */}
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[10px] border border-slate-200">
                      {site.dept || (site.cp ? site.cp.substring(0, 2) : '-')}
                    </span>
                  </td>

                  {/* Bailleur / Propriétaire */}
                  <td className="py-3 px-4 text-slate-700 text-[11px] font-medium">
                    {site.bailleur || site.client || '-'}
                  </td>

                  {/* Poste Source / Type */}
                  <td className="py-3 px-3">
                    <span className="text-slate-800 font-mono text-[11px] font-semibold">
                      {isPv ? site.type : (site.posteSource || 'Réseau HTA')}
                    </span>
                  </td>

                  {/* Dist HTA / Surface */}
                  <td className="py-3 px-3 text-right font-mono text-slate-600 text-[11px]">
                    {isPv ? pvSurface : (site.distHta || '5.2 km')}
                  </td>

                  {/* Quote-part / Coût */}
                  <td className="py-3 px-3 text-right font-mono text-slate-800 font-medium text-[11px]">
                    {isPv ? pvCost : (site.quotePart || '42,71 k€')}
                  </td>

                  {/* EBITDA / Puissance */}
                  <td className="py-3 px-3 text-right font-mono font-black text-[11px] text-emerald-700">
                    {isPv ? `${site.kwc} kWc` : (site.ebitda || '55 438 €')}
                  </td>

                  {/* Payback / Statut */}
                  <td className="py-3 px-3 text-center">
                    {isPv ? (
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
                  <td className="py-3 px-3 text-center" onClick={(e) => { e.stopPropagation(); setActiveModalSite(site); }}>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-800 border border-slate-200 transition cursor-pointer"
                      title="Consulter la fiche détaillée & documents"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
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
                TOTAL CONSOLIDÉ ({sites.length} SITES {isPv ? 'PV' : 'STANDARDISÉS'})
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
                {isPv ? '25 URBA OK' : '4,6 ans'}
              </td>
              <td className="py-3.5 px-3 text-center text-emerald-600 font-bold">✓</td>
            </tr>
          </tfoot>
        </table>
      </div>

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
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {activeModalSite.statut || 'URBA OK'}
                  </span>
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
                  {isPv ? `${activeModalSite.kwc} kWc` : `${activeModalSite.kw || 500} kW`}
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
                      onClick={() => handleCopyText(
                        `${activeModalSite.address}, ${activeModalSite.cp || ''} ${activeModalSite.name || ''}`.trim(),
                        'address'
                      )}
                      className="p-1 rounded-md bg-white hover:bg-slate-200 text-slate-600 transition shrink-0 border border-slate-200 cursor-pointer"
                      title="Copier l'adresse"
                    >
                      {copiedField === 'address' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}

              {activeModalSite.lat && activeModalSite.lng && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium shrink-0">Coordonnées GPS :</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-700 font-mono text-[11px] font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activeModalSite.lat.toFixed(6)}, {activeModalSite.lng.toFixed(6)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(`${activeModalSite.lat}, ${activeModalSite.lng}`, 'gps')}
                      className="p-1 rounded-md bg-white hover:bg-slate-200 text-slate-600 transition shrink-0 border border-slate-200 cursor-pointer"
                      title="Copier les coordonnées GPS"
                    >
                      {copiedField === 'gps' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Documents associés de la Data Room */}
            {(() => {
              const modalSiteDocs = getDocumentsForSite(activeModalSite, portfolioKey, storeState);
              return (
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-black text-[#0b192c]">
                        Documents & Pièces Data Room ({modalSiteDocs.length})
                      </span>
                    </div>
                    {modalSiteDocs.length > 0 && (
                      <span className="text-[10px] text-emerald-800 font-black bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        Certifiés originaux
                      </span>
                    )}
                  </div>

                  {modalSiteDocs.length === 0 ? (
                    <div className="p-3 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                      <p className="font-semibold text-slate-700">Les documents généraux du portefeuille s'appliquent à ce site.</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        Consultez la section Data Room complète ci-dessous pour les audits consolidés.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {modalSiteDocs.map((doc, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-2xs"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                                {doc.type || 'PDF'}
                              </span>
                              <p className="text-xs font-bold text-slate-900 truncate" title={doc.name}>
                                {doc.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                              <span>{doc.category || 'Juridique'}</span>
                              <span>•</span>
                              <span>{doc.size || '1.8 Mo'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Consulter */}
                            <button
                              type="button"
                              onClick={() => downloadOrViewDoc(doc, { id: portfolioKey, type: portfolio?.type }, 'view', recordDownload)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Consulter le document dans un nouvel onglet"
                            >
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Consulter</span>
                            </button>

                            {/* Télécharger */}
                            <button
                              type="button"
                              onClick={() => downloadOrViewDoc(doc, { id: portfolioKey, type: portfolio?.type }, 'download', recordDownload)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                              title="Télécharger"
                            >
                              <Download className="w-3 h-3" />
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
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (onToggleSiteSelect) onToggleSiteSelect(activeModalSite.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedSiteIds.includes(activeModalSite.id)
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                {selectedSiteIds.includes(activeModalSite.id) ? (
                  <span>Retirer de la sélection</span>
                ) : (
                  <span>Ajouter à mon offre indicative</span>
                )}
              </button>

              <button
                onClick={() => setActiveModalSite(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
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
