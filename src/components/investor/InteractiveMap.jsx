import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, Layers, Sun, Battery } from 'lucide-react';

export default function InteractiveMap({
  pvSites = [],
  bessSites = [],
  className = '',
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

    // Helper to create colored custom marker icon
    const createMarkerIcon = (color, isOrange = false) => {
      const bg = isOrange ? '#f97316' : color === 'amber' ? '#f59e0b' : '#06b6d4';
      return L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: ${bg};
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 0 10px ${bg};
          "></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -10],
      });
    };

    // PV markers
    if (activeFilter === 'ALL' || activeFilter === 'PV') {
      pvSites.forEach((site) => {
        if (!site.lat || !site.lng) return;

        const marker = L.marker([site.lat, site.lng], {
          icon: createMarkerIcon('amber', false),
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #111827; padding: 2px;">
            <div style="font-weight: bold; color: #b45309; font-size: 13px;">${site.name || site.ville} (${site.dept})</div>
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">${site.address || ''}</div>
            <div style="margin-top: 4px; display: flex; justify-content: space-between; gap: 8px;">
              <span>Puissance : <strong>${site.kwc} kWc</strong></span>
              <span style="color: #047857; font-weight: 600;">${site.statut || 'URBA OK'}</span>
            </div>
            <div style="font-size: 10px; color: #4b5563; margin-top: 4px;">
              Typologie : ${site.type}
            </div>
          </div>
        `);

        marker.addTo(markersLayer);
        bounds.push([site.lat, site.lng]);
      });
    }

    // BESS markers
    if (activeFilter === 'ALL' || activeFilter === 'BESS') {
      bessSites.forEach((site) => {
        if (!site.lat || !site.lng) return;

        const marker = L.marker([site.lat, site.lng], {
          icon: createMarkerIcon('cyan', false),
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #111827; padding: 2px;">
            <div style="font-weight: bold; color: #0e7490; font-size: 13px;">${site.name || site.ville} (${site.dept})</div>
            <div style="margin-top: 4px; display: flex; justify-content: space-between; gap: 8px;">
              <span>Puissance : <strong>${site.kw || 500} kW</strong></span>
              <span style="color: #047857; font-weight: 600;">URBA OK</span>
            </div>
            <div style="font-size: 10px; color: #4b5563; margin-top: 4px;">
              Architecture : 4 × 125 kW • PdB 20 ans
            </div>
          </div>
        `);

        marker.addTo(markersLayer);
        bounds.push([site.lat, site.lng]);
      });
    }

    if (bounds.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [pvSites, bessSites, activeFilter]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Map Header & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-slate-700">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-slate-900">Cartographie des Implantations</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">Grand Sud-Ouest (Nouvelle-Aquitaine & Occitanie)</span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            Tous les sites
          </button>
          <button
            onClick={() => setActiveFilter('PV')}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'PV'
                ? 'bg-amber-50 text-amber-800 border border-amber-300 font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>PV (HÉLIOS)</span>
          </button>
          <button
            onClick={() => setActiveFilter('BESS')}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'BESS'
                ? 'bg-cyan-50 text-cyan-800 border border-cyan-300 font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Battery className="w-3.5 h-3.5 text-cyan-600" />
            <span>BESS (VOLTA)</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md h-[420px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3.5 shadow-lg text-[11px] text-slate-700 space-y-1.5">
          <div className="font-bold text-slate-900 text-xs mb-1">Légende</div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white inline-block shadow-xs"></span>
            <span className="font-medium text-slate-800">Portefeuille PV HÉLIOS</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500 border-2 border-white inline-block shadow-xs"></span>
            <span className="font-medium text-slate-800">Stockage BESS VOLTA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
