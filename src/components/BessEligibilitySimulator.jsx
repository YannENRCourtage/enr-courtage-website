import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Search,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Coins,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Camera,
  Send,
  Loader2,
  Sparkles,
  Share2,
  Phone,
  Mail,
  User,
  Building2,
  Layers,
  Zap,
  RotateCcw,
  Check,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mrblwazb';
const ENEDIS_DATAFAIR_BASE = 'https://opendata.enedis.fr/data-fair/api/v1/datasets';
const OPTIMAL_RADIUS_METERS = 40;

// Calcul exact de la distance en mètres entre 2 points GPS (formule de Haversine)
function calculateDistanceMeters(pointA, pointB) {
  if (!pointA || !pointB) return null;
  const R = 6371000;
  const dLat = ((pointB.lat - pointA.lat) * Math.PI) / 180;
  const dLng = ((pointB.lng - pointA.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pointA.lat * Math.PI) / 180) *
      Math.cos((pointB.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ============================================================================
// MOTEUR SIG ENEDIS & CADASTRE IGN (issu de NELSON bessProspectingGisService)
// ============================================================================

function toLocalXY(lng, lat, lat0) {
  const x = lng * 111320 * Math.cos((lat0 * Math.PI) / 180);
  const y = lat * 110540;
  return { x, y };
}

function fromLocalXY(x, y, lat0) {
  return {
    lat: y / 110540,
    lng: x / (111320 * Math.cos((lat0 * Math.PI) / 180)),
  };
}

function pointToSegmentDistMeters(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function minDistanceToEnedisLines(lng, lat, lineFeatures) {
  if (!lineFeatures || lineFeatures.length === 0) return Infinity;
  const { x: px, y: py } = toLocalXY(lng, lat, lat);
  let minD = Infinity;

  for (const feat of lineFeatures) {
    const geom = feat.geometry;
    if (!geom) continue;
    const lines =
      geom.type === 'LineString'
        ? [geom.coordinates]
        : geom.type === 'MultiLineString'
        ? geom.coordinates
        : [];

    for (const coords of lines) {
      for (let i = 0; i < coords.length - 1; i++) {
        const [lng1, lat1] = coords[i];
        const [lng2, lat2] = coords[i + 1];
        const p1 = toLocalXY(lng1, lat1, lat);
        const p2 = toLocalXY(lng2, lat2, lat);
        const d = pointToSegmentDistMeters(px, py, p1.x, p1.y, p2.x, p2.y);
        if (d < minD) minD = d;
      }
    }
  }
  return Math.round(minD * 10) / 10;
}

async function fetchEnedisDatasetBbox(dataset, bbox) {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const url = `${ENEDIS_DATAFAIR_BASE}/${dataset}/lines?size=1000&bbox=${minLng},${minLat},${maxLng},${maxLat}&select=geometry,_id,code_commune,nom_commune,code_departement`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur API Enedis (${dataset}): ${res.status}`);
  const data = await res.json();
  return (data.results || [])
    .map((item) => {
      let geom = item.geometry;
      if (typeof geom === 'string') {
        try {
          geom = JSON.parse(geom);
        } catch {
          return null;
        }
      }
      return { ...item, geometry: geom };
    })
    .filter((item) => item && item.geometry);
}

async function fetchCadastralParcelAtPoint(lat, lng) {
  try {
    const geom = encodeURIComponent(JSON.stringify({ type: 'Point', coordinates: [lng, lat] }));
    const res = await fetch(
      `https://apicarto.ign.fr/api/cadastre/parcelle?geom=${geom}&source_ign=PCI`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const feat = data.features?.[0];
    if (!feat) return null;
    return {
      section: feat.properties?.section || '',
      numero: feat.properties?.numero || '',
      commune: feat.properties?.nom_com || '',
      contenance: feat.properties?.contenance || null,
      geometry: feat.geometry || null,
    };
  } catch {
    return null;
  }
}

// Trouve le point le plus proche sur le contour de la parcelle par rapport à un transformateur
function closestPointOnParcelToTransformer(tLat, tLng, parcelGeometry, fallbackLat, fallbackLng) {
  const directDist = calculateDistanceMeters(
    { lat: tLat, lng: tLng },
    { lat: fallbackLat, lng: fallbackLng }
  );
  if (!parcelGeometry) {
    return {
      distToParcel: directDist ?? 9999,
      suggestedTerrainPoint: { lat: fallbackLat, lng: fallbackLng },
    };
  }

  // Si le point de l'adresse est déjà dans le rayon de 40m du transformateur, on garde directement le point de l'adresse
  if (directDist !== null && directDist <= OPTIMAL_RADIUS_METERS) {
    return {
      distToParcel: directDist,
      suggestedTerrainPoint: { lat: fallbackLat, lng: fallbackLng },
    };
  }

  const tXY = toLocalXY(tLng, tLat, tLat);
  const addrXY = toLocalXY(fallbackLng, fallbackLat, tLat);
  let bestDist = Infinity;
  let bestX = addrXY.x;
  let bestY = addrXY.y;

  const rings =
    parcelGeometry.type === 'MultiPolygon'
      ? parcelGeometry.coordinates.flat(1)
      : parcelGeometry.type === 'Polygon'
      ? parcelGeometry.coordinates
      : [];

  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const p1 = toLocalXY(ring[i][0], ring[i][1], tLat);
      const p2 = toLocalXY(ring[i + 1][0], ring[i + 1][1], tLat);
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const t =
        dx === 0 && dy === 0
          ? 0
          : Math.max(
              0,
              Math.min(1, ((tXY.x - p1.x) * dx + (tXY.y - p1.y) * dy) / (dx * dx + dy * dy))
            );
      const cx = p1.x + t * dx;
      const cy = p1.y + t * dy;
      const d = Math.hypot(tXY.x - cx, tXY.y - cy);
      if (d < bestDist) {
        bestDist = d;
        bestX = cx;
        bestY = cy;
      }
    }
  }

  // Si la bordure de la parcelle est proche du transfo (<= 40m), on place le curseur à l'intérieur de la parcelle près du transfo
  if (bestDist <= OPTIMAL_RADIUS_METERS) {
    const vx = addrXY.x - bestX;
    const vy = addrXY.y - bestY;
    const vLen = Math.hypot(vx, vy) || 1;
    const nudge = Math.min(8, vLen * 0.4);
    const bXY = {
      x: bestX + (vx / vLen) * nudge,
      y: bestY + (vy / vLen) * nudge,
    };
    return {
      distToParcel: Math.round(bestDist * 10) / 10,
      suggestedTerrainPoint: fromLocalXY(bXY.x, bXY.y, tLat),
    };
  }

  return {
    distToParcel: Math.round(bestDist * 10) / 10,
    suggestedTerrainPoint: { lat: fallbackLat, lng: fallbackLng },
  };
}

// Curseur déplaçable unique pour l'emplacement sur le terrain
const createTerrainCursorIcon = () =>
  new L.DivIcon({
    className: 'bess-marker-terrain',
    html: `
      <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:15px;cursor:grab;user-select:none;">
        <div style="width:10px;height:10px;border-radius:50%;background:#ffffff;"></div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

// Icône des postes HTA/BT Enedis (style NELSON : carré rouge avec éclair ⚡)
const createEnedisPosteIcon = (isGround) =>
  new L.DivIcon({
    className: 'enedis-poste-marker',
    html: `
      <div style="width:22px;height:22px;background:${
        isGround ? '#dc2626' : '#dc2626'
      };border:2px solid #ffffff;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;cursor:pointer;" title="${
      isGround ? 'Transformateur HTA/BT au Sol (Enedis)' : 'Poste HTA/BT (Enedis)'
    }">
        ⚡
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

// Composant dédié pour la Carte Satellite Leaflet
// - Cercles fixes de 40m autour de CHAQUE transformateur Enedis présent sur la carte
// - Aucun bouton/marqueur A déplaçable : les transformateurs Enedis sont fixes
// - Un seul curseur terrain déplaçable relié au transformateur Enedis le plus proche (ou sélectionné)
// - Aucune étiquette de distance sur la ligne de la carte (uniquement dans le cadre en bas à gauche)
function BessInteractiveMap({
  mapCenter,
  markerA,
  markerB,
  setMarkerA,
  setMarkerB,
  enedisNetwork,
  parcelData,
  onSelectEnedisTransformer,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerBRef = useRef(null);
  const lineRef = useRef(null);
  const enedisLayerGroupRef = useRef(null);
  const parcelLayerGroupRef = useRef(null);
  const satLayerRef = useRef(null);
  const osmLayerRef = useRef(null);
  const [mapMode, setMapMode] = useState('satellite');

  const enedisPostesRef = useRef([]);
  enedisPostesRef.current = enedisNetwork?.postes || [];

  const markerARef = useRef(markerA);
  markerARef.current = markerA;

  // Trouve le transformateur Enedis le plus proche d'une position donnée sur le terrain
  const findClosestEnedisPoste = useCallback((ptB) => {
    const postes = enedisPostesRef.current;
    if (!postes || postes.length === 0 || !ptB) return markerARef.current;
    let best = postes[0];
    let bestDist = calculateDistanceMeters(ptB, { lat: best.lat, lng: best.lng }) ?? Infinity;
    for (let i = 1; i < postes.length; i++) {
      const p = postes[i];
      const d = calculateDistanceMeters(ptB, { lat: p.lat, lng: p.lng }) ?? Infinity;
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    return { lat: best.lat, lng: best.lng, poste: best };
  }, []);

  // Mise à jour impérative de la ligne reliant le transformateur fixe et le curseur terrain
  const updateLineOverlay = useCallback((ptA, ptB) => {
    if (!lineRef.current || !ptA || !ptB) return;
    const dist = calculateDistanceMeters(ptA, ptB);
    const color =
      dist <= OPTIMAL_RADIUS_METERS ? '#10b981' : dist <= 60 ? '#f59e0b' : '#ef4444';

    lineRef.current.setLatLngs([
      [ptA.lat, ptA.lng],
      [ptB.lat, ptB.lng],
    ]);
    lineRef.current.setStyle({
      color,
      dashArray: dist <= OPTIMAL_RADIUS_METERS ? null : '6, 6',
    });
  }, []);

  // Initialisation de la carte au montage du composant
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, {
      center: [mapCenter.lat, mapCenter.lng],
      zoom: 19,
      maxZoom: 21,
      zoomControl: true,
    });

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxNativeZoom: 19,
      maxZoom: 21,
      attribution: '&copy; OpenStreetMap',
    });

    const satLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxNativeZoom: 20,
      maxZoom: 21,
      attribution: '&copy; Google Satellite / IGN / Enedis Open Data',
    });

    satLayer.on('tileerror', () => {
      if (map.hasLayer(satLayer) && !satLayer._esriFallbackApplied) {
        satLayer._esriFallbackApplied = true;
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maxNativeZoom: 19,
            maxZoom: 21,
          }
        ).addTo(map);
      }
    });

    satLayer.addTo(map);
    satLayerRef.current = satLayer;
    osmLayerRef.current = osmLayer;

    // Groupes de calques pour le cadastre et le réseau Enedis HTA/BT (avec cercles fixes de 40m)
    const parcelGroup = L.layerGroup().addTo(map);
    const enedisGroup = L.layerGroup().addTo(map);
    parcelLayerGroupRef.current = parcelGroup;
    enedisLayerGroupRef.current = enedisGroup;

    const initialA = markerA || mapCenter;
    const initialB = markerB || mapCenter;
    const initialDist = calculateDistanceMeters(initialA, initialB);
    const initialColor =
      initialDist <= OPTIMAL_RADIUS_METERS ? '#10b981' : initialDist <= 60 ? '#f59e0b' : '#ef4444';

    // Ligne entre le transformateur fixe et le curseur terrain (sans étiquette de distance sur la carte)
    const line = L.polyline(
      [
        [initialA.lat, initialA.lng],
        [initialB.lat, initialB.lng],
      ],
      {
        color: initialColor,
        weight: 3.5,
        dashArray: initialDist <= OPTIMAL_RADIUS_METERS ? null : '6, 6',
      }
    ).addTo(map);

    // Curseur déplaçable du terrain
    const mB = L.marker([initialB.lat, initialB.lng], {
      icon: createTerrainCursorIcon(),
      draggable: true,
      autoPan: true,
      zIndexOffset: 950,
    }).addTo(map);

    mB.on('drag', (e) => {
      const posB = e.target.getLatLng();
      const nextB = { lat: posB.lat, lng: posB.lng };
      const closestA = findClosestEnedisPoste(nextB) || markerARef.current;
      if (closestA) {
        updateLineOverlay({ lat: closestA.lat, lng: closestA.lng }, nextB);
        setMarkerA({ lat: closestA.lat, lng: closestA.lng });
      }
      setMarkerB(nextB);
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const nextB = { lat, lng };
      mB.setLatLng([lat, lng]);
      const closestA = findClosestEnedisPoste(nextB) || markerARef.current;
      if (closestA) {
        updateLineOverlay({ lat: closestA.lat, lng: closestA.lng }, nextB);
        setMarkerA({ lat: closestA.lat, lng: closestA.lng });
      }
      setMarkerB(nextB);
    });

    lineRef.current = line;
    markerBRef.current = mB;
    mapRef.current = map;

    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recentrage si mapCenter change
  useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.setView([mapCenter.lat, mapCenter.lng], 19);
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
    }
  }, [mapCenter]);

  // Synchronisation externe du curseur terrain et de la ligne sans interrompre un drag en cours
  useEffect(() => {
    const mB = markerBRef.current;
    if (!mB || !markerA || !markerB) return;

    const curB = mB.getLatLng();
    const diffB = Math.abs(curB.lat - markerB.lat) + Math.abs(curB.lng - markerB.lng);

    if (diffB > 1e-7) {
      mB.setLatLng([markerB.lat, markerB.lng]);
    }
    updateLineOverlay(markerA, markerB);
  }, [markerA, markerB, updateLineOverlay]);

  // Affichage de la parcelle cadastrale IGN
  useEffect(() => {
    const parcelGroup = parcelLayerGroupRef.current;
    if (!parcelGroup) return;
    parcelGroup.clearLayers();

    if (parcelData?.geometry) {
      L.geoJSON(parcelData.geometry, {
        style: {
          color: '#38bdf8',
          weight: 2.5,
          fillColor: '#0284c7',
          fillOpacity: 0.14,
          dashArray: '5, 5',
        },
        interactive: false,
      }).addTo(parcelGroup);
    }
  }, [parcelData]);

  // Affichage du réseau Enedis HTA & des cercles fixes de 40m autour de CHAQUE transformateur :
  // - Lignes HTA souterraines en pointillé jaune
  // - Lignes HTA aériennes en trait plein orangé
  // - Cercle fixe de 40m autour de chaque poste HTA/BT Enedis présent sur la carte
  // - Carré rouge ⚡ sur chaque poste HTA/BT Enedis
  useEffect(() => {
    const enedisGroup = enedisLayerGroupRef.current;
    if (!enedisGroup) return;
    enedisGroup.clearLayers();

    if (!enedisNetwork) return;

    // 1. Lignes HTA souterraines (en pointillé)
    for (const feat of enedisNetwork.souterrainLines || []) {
      if (!feat.geometry) continue;
      L.geoJSON(feat.geometry, {
        style: {
          color: '#facc15',
          weight: 3.5,
          opacity: 0.95,
          dashArray: '8, 8',
        },
        interactive: false,
      }).addTo(enedisGroup);
    }

    // 2. Lignes HTA aériennes (en trait plein)
    for (const feat of enedisNetwork.aerienLines || []) {
      if (!feat.geometry) continue;
      L.geoJSON(feat.geometry, {
        style: {
          color: '#f59e0b',
          weight: 3.5,
          opacity: 0.95,
        },
        interactive: false,
      }).addTo(enedisGroup);
    }

    // 3. Transformateurs HTA/BT Enedis + Cercle fixe de 40m autour de chaque transformateur
    for (const poste of enedisNetwork.postes || []) {
      // Cercle fixe de 40m centré exactement sur le transformateur Enedis
      L.circle([poste.lat, poste.lng], {
        radius: OPTIMAL_RADIUS_METERS,
        color: '#f59e0b',
        weight: 2.5,
        fillColor: '#f59e0b',
        fillOpacity: 0.16,
        interactive: false,
      }).addTo(enedisGroup);

      // Icône fixe du transformateur Enedis (carré rouge ⚡)
      const pMarker = L.marker([poste.lat, poste.lng], {
        icon: createEnedisPosteIcon(poste.isGround),
        zIndexOffset: 700,
      });

      pMarker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onSelectEnedisTransformer) {
          onSelectEnedisTransformer(poste);
        }
      });

      pMarker.addTo(enedisGroup);
    }
  }, [enedisNetwork, onSelectEnedisTransformer]);

  // Bascule Satellite / Plan
  const toggleMapMode = () => {
    const map = mapRef.current;
    if (!map) return;
    if (mapMode === 'satellite') {
      if (satLayerRef.current) map.removeLayer(satLayerRef.current);
      if (osmLayerRef.current) osmLayerRef.current.addTo(map);
      setMapMode('plan');
    } else {
      if (osmLayerRef.current) map.removeLayer(osmLayerRef.current);
      if (satLayerRef.current) satLayerRef.current.addTo(map);
      setMapMode('satellite');
    }
  };

  return (
    <div className="relative w-full h-[560px] sm:h-[660px] bg-slate-200">
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', minHeight: '560px' }}
        className="w-full h-full z-0"
      />

      {/* Légende Enedis HTA/BT & Cadastre */}
      <div className="absolute top-3 left-14 z-[400] bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-lg border border-white/15 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold pointer-events-none">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-red-600 border border-white flex items-center justify-center text-[10px]">
            ⚡
          </span>
          <span>Transfo HTA/BT (rayon 40m)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-6 h-0 border-t-[3px] border-dashed border-yellow-400 inline-block"
            aria-hidden="true"
          />
          <span>HTA souterraine</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-[3px] bg-amber-500 inline-block" aria-hidden="true" />
          <span>HTA aérienne</span>
        </span>
        {parcelData?.section && (
          <span className="flex items-center gap-1.5 text-sky-300">
            <span className="w-3.5 h-2.5 border border-dashed border-sky-400 bg-sky-500/20 inline-block" />
            <span>
              Parcelle {parcelData.section} {parcelData.numero}
            </span>
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={toggleMapMode}
        className="absolute top-3 right-3 z-[400] px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold shadow-lg border border-white/20 flex items-center gap-1.5 cursor-pointer"
      >
        <Layers className="w-4 h-4 text-emerald-400" />
        <span>{mapMode === 'satellite' ? 'Vue Plan' : 'Vue Satellite'}</span>
      </button>
    </div>
  );
}

export default function BessEligibilitySimulator({ isDirectMode = false, embeddedInHero = false }) {
  // Wizard step: 1 = Adresse, 2 = Carte, 3 = Résultat, 4 = Contact Lead
  const [step, setStep] = useState(1);

  // Étape 1 : Recherche d'adresse
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [addressError, setAddressError] = useState('');

  // Étape 2 : Coordonnées Carte, Réseau Enedis HTA/BT & Parcelle Cadastrale
  const [mapCenter, setMapCenter] = useState({ lat: 44.8378, lng: -0.5792 });
  const [markerA, setMarkerA] = useState(null); // Transformateur Enedis fixe le plus proche
  const [markerB, setMarkerB] = useState(null); // Emplacement sur le terrain
  const [enedisNetwork, setEnedisNetwork] = useState(null);
  const [parcelData, setParcelData] = useState(null);
  const [detectedPoste, setDetectedPoste] = useState(null);

  // Étape 4 : Formulaire de capture de lead
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [ownerProfile, setOwnerProfile] = useState('Propriété agricole');
  const [comments, setComments] = useState('');
  const [transformerPhoto, setTransformerPhoto] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  // Distance en temps réel entre le transformateur Enedis et le curseur terrain
  const distanceMeters = calculateDistanceMeters(markerA, markerB);

  // Statut d'éligibilité (rayon de 40m autour du transformateur)
  const eligibilityStatus = (() => {
    if (distanceMeters === null) return 'pending';
    if (distanceMeters <= OPTIMAL_RADIUS_METERS) return 'eligible';
    if (distanceMeters <= 60) return 'borderline';
    return 'too_far';
  })();

  // Autocomplétion API Adresse data.gouv.fr
  useEffect(() => {
    const q = addressQuery.trim();
    if (q.length < 3 || q === selectedAddress) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=6`
        );
        const data = await res.json();
        if (data && Array.isArray(data.features)) {
          setSuggestions(data.features);
        }
      } catch (err) {
        console.warn('Erreur API adresse:', err);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 260);

    return () => clearTimeout(timer);
  }, [addressQuery, selectedAddress]);

  // Analyse SIG Enedis Data-Fair + Cadastre IGN (comme dans NELSON)
  const analyzeLocationWithEnedisAndCadastre = useCallback(async (lat, lng) => {
    setMarkerA({ lat, lng });
    setMarkerB({ lat, lng });
    setMapCenter({ lat, lng });

    try {
      const delta = 0.008; // ~800m autour de l'adresse
      const bbox = [lng - delta, lat - delta, lng + delta, lat + delta];

      const [parcel, rawPostes, souterrainLines, aerienLines] = await Promise.all([
        fetchCadastralParcelAtPoint(lat, lng),
        fetchEnedisDatasetBbox('poste-electrique', bbox),
        fetchEnedisDatasetBbox('reseau-souterrain-hta', bbox),
        fetchEnedisDatasetBbox('reseau-hta', bbox),
      ]);

      setParcelData(parcel);

      // Qualification de chaque poste HTA/BT Enedis selon la règle NELSON
      const qualifiedPostes = [];
      for (const p of rawPostes) {
        const coords = p.geometry?.coordinates;
        if (!coords || coords.length < 2) continue;
        const [pLng, pLat] = coords;
        const distSouterrain = minDistanceToEnedisLines(pLng, pLat, souterrainLines);
        const distAerien = minDistanceToEnedisLines(pLng, pLat, aerienLines);
        const isGround =
          (distSouterrain <= 25 && distAerien > 15) ||
          (distSouterrain <= 35 && distSouterrain < distAerien);

        const { distToParcel, suggestedTerrainPoint } = closestPointOnParcelToTransformer(
          pLat,
          pLng,
          parcel?.geometry,
          lat,
          lng
        );

        qualifiedPostes.push({
          id: p._id,
          lat: pLat,
          lng: pLng,
          commune: p.nom_commune || '',
          distSouterrain,
          distAerien,
          isGround,
          distToParcel,
          suggestedTerrainPoint,
        });
      }

      // Tri par proximité immédiate à la parcelle/adresse
      qualifiedPostes.sort((a, b) => a.distToParcel - b.distToParcel);

      setEnedisNetwork({
        postes: qualifiedPostes,
        souterrainLines,
        aerienLines,
      });

      if (qualifiedPostes.length > 0) {
        const best = qualifiedPostes[0];
        const nextA = { lat: best.lat, lng: best.lng };
        const nextB = best.suggestedTerrainPoint || { lat, lng };

        setDetectedPoste(best);
        setMarkerA(nextA);
        setMarkerB(nextB);
        setMapCenter({
          lat: (nextA.lat + nextB.lat) / 2,
          lng: (nextA.lng + nextB.lng) / 2,
        });
      } else {
        setDetectedPoste(null);
      }
    } catch (err) {
      console.warn('Erreur chargement SIG Enedis / Cadastre:', err);
    }
  }, []);

  // Clic sur un transformateur Enedis affiché sur la carte
  const handleSelectEnedisTransformer = useCallback((poste) => {
    const nextA = { lat: poste.lat, lng: poste.lng };
    setDetectedPoste(poste);
    setMarkerA(nextA);
  }, []);

  // Sélection d'une adresse depuis l'autocomplétion
  const handleSelectAddressFeature = (feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const label = feature.properties.label;
    setSelectedAddress(label);
    setAddressQuery(label);
    setSuggestions([]);
    setAddressError('');
    setStep(2);
    analyzeLocationWithEnedisAndCadastre(lat, lng);
  };

  // Soumission manuelle du champ d'adresse
  const handleAddressFormSubmit = async (e) => {
    e.preventDefault();
    if (!addressQuery.trim()) {
      setAddressError('Veuillez saisir une adresse, un lieu-dit ou une commune.');
      return;
    }
    if (suggestions.length > 0) {
      handleSelectAddressFeature(suggestions[0]);
      return;
    }
    setIsSearchingAddress(true);
    setAddressError('');
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(addressQuery.trim())}&limit=1`
      );
      const data = await res.json();
      if (data?.features?.length > 0) {
        handleSelectAddressFeature(data.features[0]);
      } else {
        setAddressError('Adresse introuvable. Essayez avec le code postal et la commune.');
      }
    } catch {
      setAddressError('Erreur lors de la recherche. Veuillez réessayer.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Géolocalisation GPS directe
  const handleUseGpsLocation = () => {
    if (!navigator.geolocation) {
      setAddressError("La géolocalisation GPS n'est pas supportée par votre navigateur.");
      return;
    }
    setIsLocatingGps(true);
    setAddressError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let label = `Position GPS (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
        try {
          const res = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`);
          const data = await res.json();
          if (data?.features?.length > 0) {
            label = data.features[0].properties.label;
          }
        } catch {
          // Fallback coordonnées brutes
        }
        setSelectedAddress(label);
        setAddressQuery(label);
        setIsLocatingGps(false);
        setStep(2);
        analyzeLocationWithEnedisAndCadastre(lat, lng);
      },
      () => {
        setIsLocatingGps(false);
        setAddressError(
          "Impossible d'obtenir votre position GPS. Vérifiez les autorisations ou saisissez votre adresse."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Gestion de l'upload photo du transformateur
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTransformerPhoto(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Envoi du formulaire de contact (Étape 4) vers Formspree
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setSubmitError('Veuillez renseigner votre nom, votre téléphone et votre adresse email.');
      return;
    }

    setIsSubmittingLead(true);
    setSubmitError('');

    try {
      const gmapsTransfoUrl = markerA
        ? `https://www.google.com/maps?q=${markerA.lat.toFixed(6)},${markerA.lng.toFixed(6)}`
        : 'Non défini';
      const gmapsTerrainUrl = markerB
        ? `https://www.google.com/maps?q=${markerB.lat.toFixed(6)},${markerB.lng.toFixed(6)}`
        : 'Non défini';

      const payload = {
        _subject: `[SIMULATEUR BATTERIE] ${fullName} — ${distanceMeters ?? '?'}m (${
          eligibilityStatus === 'eligible' ? 'ÉLIGIBLE' : 'ÉTUDE'
        })`,
        source: 'Simulateur Éligibilité Batterie de Soutien Réseau (/batterie-soutien-reseau)',
        nomPrenom: fullName.trim(),
        telephone: phone.trim(),
        email: email.trim(),
        profilProprietaire: ownerProfile,
        adresseTerrain: selectedAddress || addressQuery,
        parcelleCadastrale: parcelData
          ? `Section ${parcelData.section} n°${parcelData.numero} (${parcelData.contenance || '?'} m²)`
          : 'Non renseignée',
        typeTransformateurEnedis: detectedPoste
          ? detectedPoste.isGround
            ? `Transfo Sol Enedis (HTA souterrain à ${detectedPoste.distSouterrain}m)`
            : `Poste HTA/BT Enedis (HTA aérien à ${detectedPoste.distAerien}m)`
          : 'Poste Enedis',
        distanceMesureeMetres: `${distanceMeters ?? 'Non mesurée'} m`,
        statutEligibilite:
          eligibilityStatus === 'eligible'
            ? 'ÉLIGIBLE'
            : eligibilityStatus === 'borderline'
            ? `CAS LIMITE DÉROGATOIRE (${distanceMeters} m)`
            : `ÉTUDE SPÉCIFIQUE (${distanceMeters} m)`,
        surfaceLouee: '20 m²',
        remunerationGarantie: '2 000 € / an pendant 20 ans (40 000 € cumulés)',
        coordonneesGpsTransformateurA: markerA
          ? `${markerA.lat.toFixed(6)}, ${markerA.lng.toFixed(6)}`
          : 'Non défini',
        lienGoogleMapsTransformateurA: gmapsTransfoUrl,
        coordonneesGpsTerrainB: markerB
          ? `${markerB.lat.toFixed(6)}, ${markerB.lng.toFixed(6)}`
          : 'Non défini',
        lienGoogleMapsTerrainB: gmapsTerrainUrl,
        commentaire: comments.trim() || 'Aucun commentaire',
        photoTransformateurNom: transformerPhoto ? transformerPhoto.name : 'Aucune photo jointe',
      };

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du formulaire");
      }

      setLeadSubmitted(true);
    } catch {
      setSubmitError(
        "Une erreur est survenue lors de l'envoi. Vous pouvez également nous appeler directement au 06 27 89 49 77."
      );
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Partage du lien du simulateur
  const handleCopyShareLink = () => {
    const shareUrl = 'https://www.enr-courtage.fr/batterie-soutien-reseau?mode=simulateur#simulateur-eligibilite';
    navigator.clipboard?.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  // Réinitialisation complète pour refaire une nouvelle simulation
  const handleResetSimulation = () => {
    setAddressQuery('');
    setSelectedAddress('');
    setSuggestions([]);
    setAddressError('');
    setLeadSubmitted(false);
    setSubmitError('');
    setStep(1);
  };

  return (
    <section
      id="simulateur-eligibilite"
      className={
        embeddedInHero
          ? 'pt-2 pb-14 text-white relative scroll-mt-24'
          : 'py-12 md:py-20 bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white relative overflow-hidden scroll-mt-16'
      }
      aria-labelledby="simulator-heading"
    >
      {/* Halo lumineux d'arrière-plan */}
      {!embeddedInHero && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className={embeddedInHero ? 'w-full relative z-10' : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'}>
        {/* Bandeau compact spécial mode Facebook / Direct */}
        {isDirectMode && (
          <div className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-2xl shadow-lg border border-emerald-400/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold">
              <Sparkles className="w-5 h-5 text-yellow-300 shrink-0" />
              <span>
                Testez l&apos;éligibilité de votre terrain en 30 secondes et découvrez le montant de votre rente
                annuelle garantie
              </span>
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider bg-black/25 px-3 py-1 rounded-full">
              0 € d&apos;investissement
            </span>
          </div>
        )}

        {/* En-tête du Simulateur */}
        <div className="text-center mb-8 md:mb-10">
          <h2
            id="simulator-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4"
          >
            Vérifiez l&apos;éligibilité de votre terrain en{' '}
            <span className="text-yellow-400">30 secondes</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-5xl mx-auto leading-relaxed">
            Localisez votre parcelle sur la carte satellite et découvrez immédiatement votre éligibilité
            <br className="hidden sm:inline" /> ainsi que le montant de votre rente annuelle garantie, 100 % financée et
            installée par ENR COURTAGE.
          </p>
        </div>

        {/* Barre de navigation interactive entre les étapes */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: '1. Adresse' },
              { num: 2, label: '2. Carte satellite' },
              { num: 3, label: '3. Votre Rente' },
              { num: 4, label: '4. Validation' },
            ].map((item) => {
              const isActive = step === item.num;
              const isDone = step > item.num;
              const canNavigate = item.num === 1 || Boolean(selectedAddress);
              return (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => {
                    if (canNavigate) {
                      setStep(item.num);
                    }
                  }}
                  disabled={!canNavigate}
                  className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/25 cursor-pointer'
                      : isDone
                      ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40 cursor-pointer'
                      : canNavigate
                      ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-600 cursor-pointer'
                      : 'bg-slate-800/50 text-slate-500 border-slate-700/60 cursor-not-allowed'
                  }`}
                >
                  {isDone && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteneur Principal du Wizard */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* =============================================================== */}
          {/* ÉTAPE 1 : RECHERCHE DE L'ADRESSE DU TERRAIN                     */}
          {/* =============================================================== */}
          {step === 1 && (
            <div className="p-6 sm:p-10 md:p-12">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Où se situe votre terrain ?
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Saisissez l&apos;adresse de votre propriété ou utilisez votre position GPS pour afficher la vue
                    satellite haute résolution et lancer la simulation.
                  </p>
                </div>

                <form onSubmit={handleAddressFormSubmit} className="space-y-4">
                  <div className="relative">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <MapPin className="w-5 h-5 text-blue-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={addressQuery}
                          onChange={(e) => setAddressQuery(e.target.value)}
                          placeholder="Ex : 48 Chemin d'Espeyran, 30800 Saint-Gilles..."
                          style={{
                            color: '#0f172a',
                            WebkitTextFillColor: '#0f172a',
                            backgroundColor: '#ffffff',
                            colorScheme: 'light',
                          }}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-base font-medium text-slate-900 placeholder-slate-400 outline-none transition"
                        />
                        {isSearchingAddress && (
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
                        )}
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <Search className="w-5 h-5" />
                        <span>Voir sur la carte</span>
                      </button>
                    </div>

                    {/* Liste d'autocomplétion API Adresse data.gouv.fr */}
                    {suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100">
                        {suggestions.map((feat) => (
                          <button
                            key={feat.properties.id}
                            type="button"
                            onClick={() => handleSelectAddressFeature(feat)}
                            className="w-full px-4 py-3.5 text-left hover:bg-blue-50 flex items-center gap-3 transition cursor-pointer"
                          >
                            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {feat.properties.label}
                              </div>
                              <div className="text-xs text-slate-500">
                                {feat.properties.context}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {addressError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{addressError}</span>
                    </div>
                  )}

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200" />
                    <span className="flex-shrink mx-4 text-xs font-bold uppercase text-slate-400">
                      ou sur le terrain
                    </span>
                    <div className="flex-grow border-t border-slate-200" />
                  </div>

                  <button
                    type="button"
                    onClick={handleUseGpsLocation}
                    disabled={isLocatingGps}
                    className="w-full py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition flex items-center justify-center gap-2 border border-slate-300 cursor-pointer"
                  >
                    {isLocatingGps ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Localisation GPS en cours...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 text-blue-600" />
                        <span>Utiliser ma position GPS actuelle</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ÉTAPE 2 : CARTE SATELLITE INTERACTIVE                           */}
          {/* =============================================================== */}
          {step === 2 && (
            <div className="p-5 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Positionnez l&apos;emplacement souhaité sur votre terrain
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-800">{selectedAddress}</span>
                    </p>
                    {detectedPoste && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          detectedPoste.isGround
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {detectedPoste.isGround ? 'Transfo Sol Enedis détecté' : 'Poste HTA/BT Enedis détecté'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Changer d&apos;adresse</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSimulation}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Nouvelle simulation</span>
                  </button>
                </div>
              </div>

              {/* Carte Satellite Interactive agrandie */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner">
                <BessInteractiveMap
                  mapCenter={mapCenter}
                  markerA={markerA}
                  markerB={markerB}
                  setMarkerA={setMarkerA}
                  setMarkerB={setMarkerB}
                  enedisNetwork={enedisNetwork}
                  parcelData={parcelData}
                  onSelectEnedisTransformer={handleSelectEnedisTransformer}
                />

                {/* Cadre unique en bas à gauche indiquant la distance et le commentaire */}
                <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[400] bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-white/15 flex items-center justify-between sm:justify-start gap-4">
                  <div className="text-xl sm:text-2xl font-black flex items-center gap-2">
                    <span>{distanceMeters !== null ? `${distanceMeters} m` : '—'}</span>
                    {distanceMeters !== null && distanceMeters <= OPTIMAL_RADIUS_METERS && (
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                        ✓ Zone optimale
                      </span>
                    )}
                    {distanceMeters !== null && distanceMeters > OPTIMAL_RADIUS_METERS && (
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                        Étude spécifique
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Boutons de navigation Étape 2 */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Étape précédente (Adresse)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base shadow-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Découvrir mon éligibilité & ma rente</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ÉTAPE 3 : RÉSULTAT DE LA SIMULATION & RÉVÉLATION DE LA RENTE    */}
          {/* =============================================================== */}
          {step === 3 && (
            <div className="p-6 sm:p-10 space-y-6">
              {/* Barre supérieure d'actions rapides Étape 3 */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour à la carte</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSimulation}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Nouvelle simulation</span>
                </button>
              </div>

              {/* Cas 1 : Éligible */}
              {eligibilityStatus === 'eligible' && (
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-emerald-950">
                    Félicitations, votre terrain est Éligible !
                  </h3>
                  <p className="text-slate-700 max-w-2xl mx-auto text-sm sm:text-base">
                    Votre emplacement de <strong>20 m²</strong> situé à <strong>{distanceMeters} m</strong> du
                    transformateur électrique vous permet de bénéficier d&apos;une rente garantie de{' '}
                    <strong>2 000 € / an pendant 20 ans</strong>.
                  </p>
                </div>
              )}

              {/* Cas 2 : Cas Limite / Étude */}
              {eligibilityStatus !== 'eligible' && (
                <div className="bg-amber-50 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-950">
                    Éligibilité sous réserve d&apos;étude technique
                  </h3>
                  <p className="text-slate-800 max-w-2xl mx-auto text-sm sm:text-base font-medium">
                    L&apos;emplacement sélectionné se situe à <strong>{distanceMeters} m</strong> du transformateur.
                    Déposez votre dossier pour qu&apos;un ingénieur ENR COURTAGE vérifie la faisabilité de raccordement
                    sur votre parcelle.
                  </p>
                </div>
              )}

              {/* Récapitulatif Financier Dynamique (Révélé uniquement après simulation) */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Coins className="w-6 h-6 text-amber-400" />
                    <h4 className="text-lg sm:text-xl font-black">
                      Résultat de votre simulation : Offre de Location Garantie
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <span className="text-xs text-slate-400 uppercase font-bold block">Surface mobilisée</span>
                    <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">20 m²</span>
                    <span className="text-[11px] text-emerald-400">Clôture rigide verte incluse</span>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <span className="text-xs text-slate-400 uppercase font-bold block">Rente annuelle</span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 block">2 000 € / an</span>
                    <span className="text-[11px] text-slate-300">Versée chaque année</span>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <span className="text-xs text-slate-400 uppercase font-bold block">Durée du contrat</span>
                    <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">20 ans</span>
                    <span className="text-[11px] text-slate-300">Bail emphytéotique / civil</span>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-4 shadow-lg border border-emerald-400/40">
                    <span className="text-xs text-emerald-100 uppercase font-bold block">Revenu total cumulé</span>
                    <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">40 000 €</span>
                    <span className="text-[11px] text-emerald-100 font-semibold">Nets d&apos;investissement</span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-300 bg-white/5 rounded-2xl p-4 border border-white/10 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Engagement clé en main ENR COURTAGE :</strong> Frais d&apos;étude, dalle béton, 4 armoires
                    batteries, clôture en grillage rigide vert, raccordement Enedis, assurance et maintenance sur 20 ans
                    sont <strong>100 % pris en charge par ENR COURTAGE</strong>.
                  </span>
                </div>
              </div>

              {/* Boutons d'action Étape 3 */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour à la carte</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSimulation}
                    className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Refaire une simulation</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-base shadow-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Recevoir mon étude & valider mon dossier</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ÉTAPE 4 : FORMULAIRE DE CONTACT & CAPTURE DU LEAD               */}
          {/* =============================================================== */}
          {step === 4 && (
            <div className="p-6 sm:p-10">
              {leadSubmitted ? (
                <div className="max-w-xl mx-auto text-center py-8 space-y-5">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900">
                    Votre dossier d&apos;éligibilité a bien été transmis !
                  </h3>
                  <p className="text-slate-600 text-base leading-relaxed">
                    Merci <strong>{fullName}</strong>. Nos ingénieurs réseau <strong>ENR COURTAGE</strong> analysent
                    les coordonnées GPS de votre parcelle ({selectedAddress}) et vous recontactent sous{' '}
                    <strong>24h ouvrées</strong> pour confirmer la mise en place de votre rente de{' '}
                    <strong>2 000 € / an pendant 20 ans</strong>.
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-1 text-left">
                    <div>
                      <strong>Adresse :</strong> {selectedAddress}
                    </div>
                    <div>
                      <strong>Rémunération :</strong> 2 000 € / an pendant 20 ans (40 000 € garantis pour 20 m²)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetSimulation}
                    className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm cursor-pointer"
                  >
                    Faire une nouvelle simulation
                  </button>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                      Où pouvons-nous vous envoyer votre proposition de bail ?
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour au résultat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>Retour à la carte</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetSimulation}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Nouvelle simulation</span>
                      </button>
                    </div>
                  </div>

                  {/* Rappel synthétique de la simulation */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                    <div>
                      <div className="font-bold text-emerald-950">{selectedAddress}</div>
                      <div className="text-emerald-800">
                        Surface : <strong>20 m²</strong>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black">
                      2 000 € / an × 20 ans (40 000 €)
                    </div>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                          Nom et Prénom *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Jean Dupont"
                            style={{
                              color: '#0f172a',
                              WebkitTextFillColor: '#0f172a',
                              backgroundColor: '#ffffff',
                              colorScheme: 'light',
                            }}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 text-sm font-medium text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                          Téléphone *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="06 12 34 56 78"
                            style={{
                              color: '#0f172a',
                              WebkitTextFillColor: '#0f172a',
                              backgroundColor: '#ffffff',
                              colorScheme: 'light',
                            }}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 text-sm font-medium text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                          Adresse Email *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jean.dupont@email.fr"
                            style={{
                              color: '#0f172a',
                              WebkitTextFillColor: '#0f172a',
                              backgroundColor: '#ffffff',
                              colorScheme: 'light',
                            }}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 text-sm font-medium text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                          Votre Profil *
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <select
                            value={ownerProfile}
                            onChange={(e) => setOwnerProfile(e.target.value)}
                            style={{
                              color: '#0f172a',
                              backgroundColor: '#ffffff',
                              colorScheme: 'light',
                            }}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 text-sm font-bold text-slate-900"
                          >
                            <option value="Propriété agricole">Propriété agricole</option>
                            <option value="Site industriel ou entreprise">Site industriel ou entreprise</option>
                            <option value="Propriétaire foncier particulier">Propriétaire foncier particulier</option>
                            <option value="Collectivité">Collectivité</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Upload photo du transformateur (optionnel) */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Photo du transformateur (optionnel — très utile sur mobile)
                      </label>
                      <label className="flex items-center justify-between p-3.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 cursor-pointer transition">
                        <div className="flex items-center gap-3">
                          <Camera className="w-5 h-5 text-blue-600 shrink-0" />
                          <span className="text-xs sm:text-sm text-slate-700 font-medium">
                            {transformerPhoto
                              ? `Photo sélectionnée : ${transformerPhoto.name}`
                              : 'Prendre ou joindre une photo du transformateur'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-blue-600 px-3 py-1 rounded-lg bg-blue-100">
                          Parcourir
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                      {photoPreviewUrl && (
                        <div className="mt-2 flex items-center gap-3">
                          <img
                            src={photoPreviewUrl}
                            alt="Aperçu du transformateur"
                            className="w-16 h-16 rounded-lg object-cover border border-slate-300"
                          />
                          <span className="text-xs text-emerald-700 font-semibold">
                            ✓ Photo prête à être jointe à votre dossier
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Commentaire ou précision (optionnel)
                      </label>
                      <textarea
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Précisions sur l'accès au terrain, le numéro de parcelle ou vos disponibilités..."
                        style={{
                          color: '#0f172a',
                          WebkitTextFillColor: '#0f172a',
                          backgroundColor: '#ffffff',
                          colorScheme: 'light',
                        }}
                        className="w-full p-3.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm text-slate-900"
                      />
                    </div>

                    {submitError && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
                        {submitError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingLead}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingLead ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Transmission de votre dossier en cours...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Valider ma demande de rente (2 000 € / an pendant 20 ans)</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-slate-500">
                      Étude 100 % gratuite et sans engagement • Vos coordonnées GPS sont jointes automatiquement pour
                      validation par un ingénieur ENR COURTAGE.
                    </p>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Barre de partage rapide Facebook / Lien direct */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span>Vous connaissez un propriétaire disposant d&apos;un terrain proche d&apos;un transformateur ?</span>
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{shareCopied ? 'Lien copié !' : 'Partager ce simulateur'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
