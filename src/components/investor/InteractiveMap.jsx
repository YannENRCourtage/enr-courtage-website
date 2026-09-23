import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, Layers, Sun, Battery, RotateCcw } from 'lucide-react';

export default function InteractiveMap({
  pvSites = [],
  bessSites = [],
  className = '',
  onSelectSite = null,
  darkTheme = false,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PV' | 'BESS'

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered on South-West France
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([44.75, 0.85], 7);

    // OpenStreetMap standard crisp tiles (No API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers on filter or data change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    const bounds = [];

    // Helper to create colored custom marker icon with number
    const createMarkerIcon = (site, color, isOrange = false) => {
      const bg = isOrange ? '#f97316' : color === 'amber' ? '#f59e0b' : '#06b6d4';
      const shadowColor = isOrange ? 'rgba(249, 115, 22, 0.6)' : color === 'amber' ? 'rgba(245, 158, 11, 0.6)' : 'rgba(6, 182, 212, 0.7)';
      const num = site.id || '';
      return L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background: ${bg};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 0 12px ${shadowColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 800;
            color: #0f172a;
            font-family: monospace;
            cursor: pointer;
            transition: transform 0.2s;
          " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
            ${num}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14],
      });
    };

    // PV markers
    if (activeFilter === 'ALL' || activeFilter === 'PV') {
      pvSites.forEach((site) => {
        if (!site.lat || !site.lng) return;

        const marker = L.marker([site.lat, site.lng], {
          icon: createMarkerIcon(site, 'amber', site.orange),
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px; min-width: 180px;">
            <div style="font-weight: 800; color: #b45309; font-size: 13px;">#${site.id} ${site.name || site.ville} (${site.dept})</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${site.address || ''}</div>
            <div style="margin-top: 6px; display: flex; justify-content: space-between; gap: 8px; font-size: 11px;">
              <span>Puissance : <strong style="color: #b45309;">${site.kwc} kWc</strong></span>
              <span style="color: #047857; font-weight: 700;">${site.statut || 'URBA OK'}</span>
            </div>
            <div style="font-size: 10px; color: #475569; margin-top: 4px;">
              Client : <strong>${site.client || '-'}</strong>
            </div>
          </div>
        `);

        if (onSelectSite) {
          marker.on('click', () => onSelectSite(site));
        }

        marker.addTo(markersLayer);
        bounds.push([site.lat, site.lng]);
      });
    }

    // BESS markers
    if (activeFilter === 'ALL' || activeFilter === 'BESS') {
      bessSites.forEach((site) => {
        if (!site.lat || !site.lng) return;

        const marker = L.marker([site.lat, site.lng], {
          icon: createMarkerIcon(site, 'cyan', false),
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px; min-width: 180px;">
            <div style="font-weight: 800; color: #0891b2; font-size: 13px;">#${site.id} ${site.name || site.ville} (${site.dept})</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Bailleur : <strong>${site.client || '-'}</strong></div>
            <div style="margin-top: 6px; display: flex; justify-content: space-between; gap: 8px; font-size: 11px;">
              <span>Puissance : <strong style="color: #0891b2;">${site.kw || 500} kW</strong></span>
              <span style="color: #047857; font-weight: 700;">URBA OK</span>
            </div>
            <div style="font-size: 10px; color: #475569; margin-top: 4px;">
              Architecture : 4 × 125 kW • PdB 20 ans
            </div>
          </div>
        `);

        if (onSelectSite) {
          marker.on('click', () => onSelectSite(site));
        }

        marker.addTo(markersLayer);
        bounds.push([site.lat, site.lng]);
      });
    }

    if (bounds.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [pvSites, bessSites, activeFilter, onSelectSite]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const all = [...pvSites, ...bessSites].filter((s) => s.lat && s.lng);
    if (all.length > 0) {
      const bounds = all.map((s) => [s.lat, s.lng]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    } else {
      mapInstanceRef.current.setView([44.75, 0.85], 7);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Map Header & Filter Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border ${
        darkTheme ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center space-x-2 text-xs">
          <Layers className="w-4 h-4 text-emerald-500" />
          <span className={`font-bold ${darkTheme ? 'text-white' : 'text-slate-900'}`}>
            Cartographie des Implantations
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Grand Sud-Ouest (Nouvelle-Aquitaine & Occitanie)</span>
        </div>

        {/* Action & Filter buttons */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeFilter === 'ALL'
                ? darkTheme
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                  : 'bg-slate-900 text-white shadow-xs'
                : darkTheme
                  ? 'bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            Tous les sites
          </button>
          {pvSites.length > 0 && (
            <button
              onClick={() => setActiveFilter('PV')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'PV'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : darkTheme
                    ? 'bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-white'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>PV ({pvSites.length})</span>
            </button>
          )}
          {bessSites.length > 0 && (
            <button
              onClick={() => setActiveFilter('BESS')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'BESS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : darkTheme
                    ? 'bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-white'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
              }`}
            >
              <Battery className="w-3.5 h-3.5" />
              <span>BESS ({bessSites.length})</span>
            </button>
          )}
          <button
            onClick={handleRecenter}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer text-xs font-bold ${
              darkTheme
                ? 'bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
            title="Recentrer la carte"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            <span>Recentrer</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className={`relative rounded-2xl overflow-hidden border shadow-sm h-[460px] ${
        darkTheme ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Map Informational Overlay Card (Bottom Left) */}
        <div className={`absolute bottom-4 left-4 z-10 max-w-sm backdrop-blur-md border rounded-2xl p-3.5 shadow-xl text-[11px] space-y-1.5 pointer-events-auto ${
          darkTheme
            ? 'bg-slate-950/90 border-slate-700/80 text-white'
            : 'bg-white/95 border-slate-200 text-slate-900'
        }`}>
          <div className="font-black text-blue-700 text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Grappe {bessSites.length > 0 ? 'BESS' : 'PV'} Grand Sud-Ouest
          </div>
          <p className={`${darkTheme ? 'text-slate-300' : 'text-slate-600'} text-[10px] leading-relaxed font-medium`}>
            Cliquez sur un marqueur pour afficher la fiche détaillée du site, ses coordonnées GPS et son dossier de raccordement.
          </p>
          <div className={`flex items-center gap-3 pt-1 border-t text-[10px] font-semibold ${
            darkTheme ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}>
            {bessSites.length > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span>
                <span>BESS 500 kW (31 sites)</span>
              </span>
            )}
            {pvSites.length > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>PV Toitures (29 sites)</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
