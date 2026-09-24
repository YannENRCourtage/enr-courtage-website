import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers } from 'lucide-react';

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

  // Update Markers on data change
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

    // BESS markers
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

    if (bounds.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [pvSites, bessSites, onSelectSite]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Map Header */}
      <div className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border ${
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
                <span>BESS 500 kW ({bessSites.length} site{bessSites.length > 1 ? 's' : ''})</span>
              </span>
            )}
            {pvSites.length > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>PV Toitures ({pvSites.length} site{pvSites.length > 1 ? 's' : ''})</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
