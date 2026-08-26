import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Search, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, 
  Sun, Zap, Leaf, Home, Award, ChevronRight, Info, ShieldCheck, Sparkles, FileText,
  RotateCcw, AlertCircle, BatteryCharging, Car, PhoneCall, Check, Lock, Send
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useToast } from './ui/use-toast';

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mrblwazb";

// Fix icône Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icône de poignée de coin avec zone tactile (36px)
const createHandleIcon = (label) => new L.DivIcon({
  className: 'custom-handle-icon',
  html: `<div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; cursor: grab;">
          <div style="background-color: #10b981; border: 3px solid #ffffff; width: 24px; height: 24px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            ${label || ''}
          </div>
         </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Calcul géodésique de la surface d'un quadrilatère (en m²)
function calculatePolygonArea(corners) {
  if (!corners || corners.length < 3) return 0;
  const R = 6378137;
  const avgLat = (corners.reduce((acc, c) => acc + c.lat, 0) / corners.length) * (Math.PI / 180);
  const cosLat = Math.cos(avgLat);

  const coordsMeters = corners.map(c => ({
    x: c.lng * (Math.PI / 180) * R * cosLat,
    y: c.lat * (Math.PI / 180) * R
  }));

  let area = 0;
  for (let i = 0; i < coordsMeters.length; i++) {
    const j = (i + 1) % coordsMeters.length;
    area += coordsMeters[i].x * coordsMeters[j].y;
    area -= coordsMeters[j].x * coordsMeters[i].y;
  }
  area = Math.abs(area) / 2;
  return Math.round(area);
}

// Calcul de l'orientation (trait rouge = faîtage / haut de pente)
function calculateOrientation(edgeCorners, allCorners) {
  if (!edgeCorners || edgeCorners.length < 2 || !allCorners || allCorners.length < 3) {
    return { text: "Sud-Ouest", code: "SO", azimuth: 225 };
  }
  
  const [p1, p2] = edgeCorners;
  const midLat = (p1.lat + p2.lat) / 2;
  const midLng = (p1.lng + p2.lng) / 2;

  const centerLat = allCorners.reduce((sum, c) => sum + c.lat, 0) / allCorners.length;
  const centerLng = allCorners.reduce((sum, c) => sum + c.lng, 0) / allCorners.length;

  const avgLat = centerLat * (Math.PI / 180);
  const dx = (centerLng - midLng) * Math.cos(avgLat);
  const dy = centerLat - midLat;
  
  let angle = Math.atan2(dx, dy) * (180 / Math.PI);
  if (angle < 0) angle += 360;

  if (angle >= 337.5 || angle < 22.5) return { text: "Nord", code: "N", azimuth: 0 };
  if (angle >= 22.5 && angle < 67.5) return { text: "Nord-Est", code: "NE", azimuth: 45 };
  if (angle >= 67.5 && angle < 112.5) return { text: "Est", code: "E", azimuth: 90 };
  if (angle >= 112.5 && angle < 157.5) return { text: "Sud-Est", code: "SE", azimuth: 135 };
  if (angle >= 157.5 && angle < 202.5) return { text: "Sud", code: "S", azimuth: 180 };
  if (angle >= 202.5 && angle < 247.5) return { text: "Sud-Ouest", code: "SO", azimuth: 225 };
  if (angle >= 247.5 && angle < 292.5) return { text: "Ouest", code: "O", azimuth: 270 };
  return { text: "Nord-Ouest", code: "NO", azimuth: 315 };
}

// Formatage de l'adresse sur 2 lignes à partir du code postal
function formatAddressForPdf(addressStr) {
  if (!addressStr) return { line1: 'Non renseignée', line2: '' };
  const match = addressStr.match(/\b(\d{5})\b/);
  if (match) {
    const cpIndex = addressStr.indexOf(match[1]);
    const line1 = addressStr.substring(0, cpIndex).trim().replace(/,$/, '');
    const line2 = addressStr.substring(cpIndex).trim();
    return { line1, line2 };
  }
  return { line1: addressStr, line2: '' };
}

// Charger jsPDF dynamiquement depuis CDN si pas encore chargé
function loadJsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jspdf) {
      resolve(window.jspdf);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

// ==========================================
// COMPOSANT CARTE LEAFLET AUTONOME
// ==========================================
function SatelliteMap({ step, centerCoords, setCenterCoords, roofCorners, setRoofCorners, selectedEdgeIndex, onSelectEdge, setSurfaceM2, onAddressUpdated }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layersGroupRef = useRef(null);
  const currentStepRef = useRef(step);
  currentStepRef.current = step;

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [centerCoords.lat, centerCoords.lng],
        zoom: 19,
        maxZoom: 22,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxNativeZoom: 19,
        maxZoom: 22
      }).addTo(map);

      layersGroupRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const lastCenterRef = useRef(centerCoords);
  useEffect(() => {
    if (mapRef.current && centerCoords) {
      const dist = Math.hypot(centerCoords.lat - lastCenterRef.current.lat, centerCoords.lng - lastCenterRef.current.lng);
      if (dist > 0.001) {
        mapRef.current.setView([centerCoords.lat, centerCoords.lng], mapRef.current.getZoom() || 19);
        lastCenterRef.current = centerCoords;
      }
    }
  }, [centerCoords]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMoveEnd = async () => {
      if (currentStepRef.current === 2) {
        const c = map.getCenter();
        lastCenterRef.current = { lat: c.lat, lng: c.lng };
        setCenterCoords({ lat: c.lat, lng: c.lng });

        try {
          const res = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${c.lng}&lat=${c.lat}`);
          const data = await res.json();
          if (data && data.features && data.features.length > 0) {
            const newLabel = data.features[0].properties.label;
            if (onAddressUpdated) onAddressUpdated(newLabel, { lat: c.lat, lng: c.lng });
          }
        } catch (err) {
          console.error("Erreur reverse geocoding:", err);
        }
      }
    };

    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [onAddressUpdated]);

  useEffect(() => {
    const map = mapRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (step === 2) {
      const centerMarkerIcon = new L.DivIcon({
        className: 'custom-center-marker',
        html: `<div style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; cursor: grab;">
                <div style="background-color: #10b981; border: 4px solid #ffffff; width: 28px; height: 28px; border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;">
                  <div style="background-color: #ffffff; width: 8px; height: 8px; border-radius: 50%;"></div>
                </div>
               </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });
      const centerMarker = L.marker([centerCoords.lat, centerCoords.lng], { icon: centerMarkerIcon, draggable: true }).addTo(group);

      centerMarker.on('dragend', async (e) => {
        const latlng = e.target.getLatLng();
        setCenterCoords({ lat: latlng.lat, lng: latlng.lng });
        try {
          const res = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${latlng.lng}&lat=${latlng.lat}`);
          const data = await res.json();
          if (data && data.features && data.features.length > 0) {
            const newLabel = data.features[0].properties.label;
            if (onAddressUpdated) onAddressUpdated(newLabel, { lat: latlng.lat, lng: latlng.lng });
          }
        } catch (err) {
          console.error("Erreur reverse geocoding:", err);
        }
      });
    }

    if (step === 3 && roofCorners && roofCorners.length === 4) {
      const polygon = L.polygon(roofCorners.map(c => [c.lat, c.lng]), {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.35,
        weight: 3
      }).addTo(group);

      const markers = [];

      roofCorners.forEach((corner, idx) => {
        const marker = L.marker([corner.lat, corner.lng], {
          draggable: true,
          autoPan: true,
          icon: createHandleIcon(idx + 1)
        }).addTo(group);

        markers.push(marker);

        marker.on('drag', () => {
          const newPositions = markers.map(m => m.getLatLng());
          polygon.setLatLngs(newPositions);
          const newCorners = newPositions.map(l => ({ lat: l.lat, lng: l.lng }));
          const area = calculatePolygonArea(newCorners);
          if (area > 0) setSurfaceM2(area);
        });

        marker.on('dragend', () => {
          const finalPositions = markers.map(m => m.getLatLng());
          const newCorners = finalPositions.map(l => ({ lat: l.lat, lng: l.lng }));
          setRoofCorners(newCorners);
          const area = calculatePolygonArea(newCorners);
          if (area > 0) setSurfaceM2(area);
        });
      });
    }

    if (step === 4 && roofCorners && roofCorners.length === 4) {
      L.polygon(roofCorners.map(c => [c.lat, c.lng]), {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(group);

      roofCorners.forEach((corner, i) => {
        const nextCorner = roofCorners[(i + 1) % roofCorners.length];
        const isSelected = selectedEdgeIndex === i;

        const line = L.polyline([[corner.lat, corner.lng], [nextCorner.lat, nextCorner.lng]], {
          color: isSelected ? '#ef4444' : '#10b981',
          weight: isSelected ? 8 : 4,
          opacity: 1
        }).addTo(group);

        line.on('click', () => {
          if (onSelectEdge) onSelectEdge(i);
        });
      });
    }
  }, [step, selectedEdgeIndex]);

  return (
    <div className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner mb-6 z-10">
      <div ref={containerRef} className="w-full h-full" />
      {step === 2 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none drop-shadow-lg">
          <div className="w-8 h-8 rounded-full bg-[#10b981] border-4 border-white shadow-xl flex items-center justify-center animate-bounce">
            <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// GRAPHIQUE BARRES ROI (1, 5, 10, 15, 20, 25, 30)
// ==========================================
function RoiBarChart({ activeMetrics, paybackYears }) {
  const years = Array.from({ length: 30 }, (_, i) => i + 1);
  const cost = activeMetrics.cost;
  const firstYearSavings = activeMetrics.firstYearSavings;

  const data = useMemo(() => {
    let currentSavings = firstYearSavings;
    let cumSavings = 0;
    return years.map(y => {
      cumSavings += currentSavings;
      currentSavings *= 1.035;
      const netBalance = Math.round(cumSavings - cost);
      return { year: y, netBalance };
    });
  }, [cost, firstYearSavings]);

  const maxVal = Math.max(...data.map(d => d.netBalance), 25000);
  const minVal = Math.min(...data.map(d => d.netBalance), -cost);

  const pbYearFloat = parseFloat(paybackYears) || 5.3;
  const roiLinePct = ((pbYearFloat - 0.5) / 30) * 100;

  const targetYears = [1, 5, 10, 15, 20, 25, 30];

  return (
    <div className="bg-[#162238] rounded-2xl p-6 text-white my-8 border border-slate-700 shadow-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <div>
          <h4 className="text-lg font-bold text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[#0f9b8e]" />
            <span>Économies cumulées & Passage à l'amortissement (ROI)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Projection sur 30 ans du solde net généré par votre installation photovoltaïque
          </p>
        </div>
        <div className="mt-2 sm:mt-0 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-bold">
          Amorti en {paybackYears} ans
        </div>
      </div>

      <div className="relative h-60 w-full pt-8 pb-0">
        <div 
          className="absolute top-8 bottom-2 z-20 flex flex-col items-center pointer-events-none"
          style={{ left: `${roiLinePct}%` }}
        >
          <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded shadow mt-1">
            ROI ({paybackYears} ans)
          </span>
          <div className="w-px h-full border-r-2 border-dashed border-blue-400"></div>
        </div>

        <div className="absolute left-6 right-2 top-[58%] h-px bg-slate-600 z-0"></div>

        <div className="flex items-end justify-between h-full pl-6 pr-2 relative z-10">
          {data.map((d) => {
            const isPositive = d.netBalance >= 0;
            const heightPct = isPositive 
              ? Math.min(100, Math.max(8, (d.netBalance / maxVal) * 55))
              : Math.min(40, Math.max(10, (Math.abs(d.netBalance) / Math.abs(minVal)) * 35));

            return (
              <div key={d.year} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2 rounded border border-slate-700 whitespace-nowrap z-30 pointer-events-none">
                  Année {d.year} : {d.netBalance > 0 ? `+${d.netBalance} €` : `${d.netBalance} €`}
                </div>

                <div 
                  className={`w-[75%] max-w-[14px] rounded-t-sm transition-all duration-300 ${
                    isPositive 
                      ? 'bg-[#10b981] group-hover:bg-[#34d399]' 
                      : 'bg-blue-500 group-hover:bg-blue-400'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full h-px bg-slate-600 mt-2 mb-2"></div>
      <div className="flex justify-between pl-6 pr-2 text-xs font-bold text-slate-300">
        {targetYears.map((yr) => (
          <div key={yr} className="text-center w-6">
            {yr}
          </div>
        ))}
      </div>

      <div className="flex justify-between text-[11px] text-slate-400 mt-4 px-2 border-t border-slate-700/60 pt-3">
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
          <span>Période d'amortissement</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-[#10b981] inline-block"></span>
          <span>Bénéfice net généré</span>
        </span>
      </div>
    </div>
  );
}

// ==========================================
// COMPOSANT PRINCIPAL SIMULATEUR SOLAIRE
// ==========================================
const SolarSimulator = ({ onCompleteLead }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  // Étape 1 : Adresse & Coordonnées
  const [addressInput, setAddressInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [coords, setCoords] = useState({ lat: 44.757, lng: -0.739 });

  // Étape 2 : Positionnement repère centre carte
  const [centerCoords, setCenterCoords] = useState({ lat: 44.757, lng: -0.739 });

  // Étape 3 : Quadrilatère toiture & calcul surface
  const [roofCorners, setRoofCorners] = useState([]);
  const [surfaceM2, setSurfaceM2] = useState(49);

  // Étape 4 : Orientation toiture
  const [selectedEdgeIndex, setSelectedEdgeIndex] = useState(0);
  const [orientation, setOrientation] = useState({ text: "Sud-Ouest", code: "SO" });

  // Étape 5 : Inclinaison toiture
  const [inclination, setInclination] = useState(30);

  // Étape 6 : Consommation & Véhicules électriques
  const [consumptionKwh, setConsumptionKwh] = useState('');
  const [consumptionEuros, setConsumptionEuros] = useState('');
  const [consumptionError, setConsumptionError] = useState('');
  const [electricVehicles, setElectricVehicles] = useState(0);

  // Étape 6.5 : Chargement
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Étape 7 : Onglet de puissance sélectionné (3, 6, 9)
  const [selectedPowerTab, setSelectedPowerTab] = useState(3);

  // Formulaire Lead & Options
  const [leadForm, setLeadForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    phone: '',
    optBatterie: false,
    optBorne: false,
    requestCallback: true,
    acceptTerms: true
  });
  const [leadFormError, setLeadFormError] = useState('');
  const [isSendingLead, setIsSendingLead] = useState(false);

  // Autocomplétion API BAN / Adresse Gouv
  useEffect(() => {
    if (addressInput.trim().length > 3 && addressInput !== selectedAddress) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(addressInput)}&limit=5`);
          const data = await res.json();
          if (data && data.features) {
            setSuggestions(data.features);
          }
        } catch (err) {
          console.error("Erreur autocomplétion adresse:", err);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [addressInput, selectedAddress]);

  const handleSelectSuggestion = (feature) => {
    const label = feature.properties.label;
    const [lng, lat] = feature.geometry.coordinates;
    setAddressInput(label);
    setSelectedAddress(label);
    setCoords({ lat, lng });
    setCenterCoords({ lat, lng });
    setSuggestions([]);
  };

  const handleAddressUpdatedFromMap = (newAddressLabel, newCoords) => {
    setSelectedAddress(newAddressLabel);
    setAddressInput(newAddressLabel);
  };

  const initRoofCorners = (lat, lng) => {
    const deltaLat = 0.00005;
    const deltaLng = 0.00007;
    const corners = [
      { lat: lat + deltaLat, lng: lng - deltaLng },
      { lat: lat + deltaLat, lng: lng + deltaLng },
      { lat: lat - deltaLat, lng: lng + deltaLng },
      { lat: lat - deltaLat, lng: lng - deltaLng }
    ];
    setRoofCorners(corners);
    setSurfaceM2(calculatePolygonArea(corners) || 49);
    return corners;
  };

  const handleStartFromStep1 = () => {
    if (!selectedAddress && addressInput) {
      setSelectedAddress(addressInput);
    }
    initRoofCorners(centerCoords.lat, centerCoords.lng);
    setStep(2);
  };

  const handleValidateStep2 = () => {
    initRoofCorners(centerCoords.lat, centerCoords.lng);
    setStep(3);
  };

  const handleResetRoofCorners = () => {
    initRoofCorners(centerCoords.lat, centerCoords.lng);
  };

  const handleValidateStep3 = () => {
    if (roofCorners.length === 4) {
      const p1 = roofCorners[0];
      const p2 = roofCorners[1];
      setOrientation(calculateOrientation([p1, p2], roofCorners));
    }
    setStep(4);
  };

  const handleSelectEdge = (index) => {
    setSelectedEdgeIndex(index);
    const p1 = roofCorners[index];
    const p2 = roofCorners[(index + 1) % roofCorners.length];
    const orient = calculateOrientation([p1, p2], roofCorners);
    setOrientation(orient);
  };

  const handleValidateStep4 = () => {
    setStep(5);
  };

  const handleValidateStep5 = () => {
    setStep(6);
  };

  const handleValidateStep6 = () => {
    const kwhNum = parseFloat(consumptionKwh);
    const eurNum = parseFloat(consumptionEuros);

    if ((!kwhNum || kwhNum <= 0) && (!eurNum || eurNum <= 0)) {
      setConsumptionError("La saisie de votre consommation est obligatoire.");
      return;
    }

    setConsumptionError('');
    setStep(6.5);
    setLoadingProgress(0);
  };

  useEffect(() => {
    if (step === 6.5) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep(7);
            return 100;
          }
          return prev + 15;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleKwhChange = (val) => {
    setConsumptionError('');
    if (val === '') {
      setConsumptionKwh('');
      setConsumptionEuros('');
      return;
    }
    const kwh = parseFloat(val) || 0;
    setConsumptionKwh(val);
    setConsumptionEuros(Math.round(kwh * 0.25).toString());
  };

  const handleEurosChange = (val) => {
    setConsumptionError('');
    if (val === '') {
      setConsumptionEuros('');
      setConsumptionKwh('');
      return;
    }
    const euros = parseFloat(val) || 0;
    setConsumptionEuros(val);
    setConsumptionKwh(Math.round(euros / 0.25).toString());
  };

  // CALCULS PHOTOVOLTAÏQUES ÉTAPE 7 & FILTRAGE DE SURFACE
  const simulationResults = useMemo(() => {
    const kwhVal = parseFloat(consumptionKwh) || 6000;
    const eurVal = parseFloat(consumptionEuros) || 1500;

    const exploitableSurface = surfaceM2;
    const installablePanels = Math.floor(exploitableSurface / 2);
    const installablePowerWatts = installablePanels * 480;

    // Détermination stricte des puissances admises par la surface de toiture
    // 3 kWc nécessite 15m² | 6 kWc nécessite 30m² | 9 kWc nécessite 45m²
    let maxAllowedKw = 3;
    if (exploitableSurface >= 45) maxAllowedKw = 9;
    else if (exploitableSurface >= 30) maxAllowedKw = 6;
    else maxAllowedKw = 3;

    let recommendedPower = 3;
    if (kwhVal > 7500 && maxAllowedKw >= 9) recommendedPower = 9;
    else if (kwhVal > 4000 && maxAllowedKw >= 6) recommendedPower = 6;
    else if (maxAllowedKw >= 6 && exploitableSurface >= 30) recommendedPower = Math.min(6, maxAllowedKw);
    else recommendedPower = 3;

    let orientFactor = 0.95;
    if (orientation.code === 'S') orientFactor = 1.0;
    else if (orientation.code === 'SO' || orientation.code === 'SE') orientFactor = 0.95;
    else if (orientation.code === 'O' || orientation.code === 'E') orientFactor = 0.85;
    else orientFactor = 0.75;

    let inclFactor = 1.0;
    if (inclination === 30) inclFactor = 1.0;
    else if (inclination === 15 || inclination === 45) inclFactor = 0.96;
    else inclFactor = 0.90;

    const baseProductionPerKwc = 1250 * orientFactor * inclFactor;

    const getMetricsForPower = (kWc) => {
      const annualProdKwh = Math.round(kWc * baseProductionPerKwc);

      let autoRate = 0.85;
      if (kWc === 6) autoRate = 0.65;
      if (kWc === 9) autoRate = 0.55;
      if (electricVehicles > 0) autoRate = Math.min(0.95, autoRate + electricVehicles * 0.08);

      const autoconsumedProdKwh = Math.round(annualProdKwh * autoRate);
      const firstYearSavings = Math.round(autoconsumedProdKwh * 0.26 + (annualProdKwh - autoconsumedProdKwh) * 0.011);

      let cum10 = 0, cum20 = 0, cum30 = 0;
      let currentYearSavings = firstYearSavings;
      for (let y = 1; y <= 30; y++) {
        if (y <= 10) cum10 += currentYearSavings;
        if (y <= 20) cum20 += currentYearSavings;
        if (y <= 30) cum30 += currentYearSavings;
        currentYearSavings *= 1.035;
      }

      const panelsCount = kWc === 3 ? "6 à 8" : kWc === 6 ? "12 à 16" : "18 à 24";
      const surfaceOccupied = kWc === 3 ? 15 : kWc === 6 ? 30 : 45;
      const costMap = { 3: 5999, 6: 8999, 9: 11499 };
      const cost = costMap[kWc];
      const paybackYears = (cost / firstYearSavings).toFixed(1);
      const billSavingsPct = Math.min(100, Math.round((firstYearSavings / (eurVal || 1500)) * 100));

      const co2AvoidedKg = Math.round(annualProdKwh * 0.5);
      const treesPlanted = Math.round(co2AvoidedKg / 350);
      const foyersEquiv = (annualProdKwh / 4500).toFixed(1);

      return {
        kWc,
        annualProdKwh,
        autoRatePct: Math.round(autoRate * 100),
        autoconsumedProdKwh,
        firstYearSavings,
        cum10: Math.round(cum10),
        cum20: Math.round(cum20),
        cum30: Math.round(cum30),
        panelsCount,
        surfaceOccupied,
        cost,
        paybackYears,
        billSavingsPct,
        co2AvoidedKg,
        treesPlanted,
        foyersEquiv
      };
    };

    return {
      exploitableSurface,
      installablePanels,
      installablePowerWatts,
      maxAllowedKw,
      recommendedPower,
      metrics: {
        3: getMetricsForPower(3),
        6: getMetricsForPower(6),
        9: getMetricsForPower(9)
      }
    };
  }, [surfaceM2, orientation, inclination, consumptionKwh, consumptionEuros, electricVehicles]);

  // Synchroniser l'onglet sélectionné avec la préconisation et la surface disponible dès l'arrivée à l'étape 7
  useEffect(() => {
    if (step === 7) {
      setSelectedPowerTab(simulationResults.recommendedPower);
    }
  }, [step, simulationResults.recommendedPower]);

  const activeMetrics = simulationResults.metrics[selectedPowerTab] || simulationResults.metrics[3];

  // GÉNÉRATION DU PDF SYNTHÉTIQUE PORTRAIT
  const generatePdfStudy = async () => {
    try {
      const { jsPDF } = await loadJsPDF();
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const primaryNavy = [15, 40, 71];
      const tealGreen = [15, 155, 142];

      // PAGE 1
      doc.setFillColor(...primaryNavy);
      doc.rect(0, 0, 210, 45, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('ENR COURTAGE', 15, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('ETUDE DE FAISABILITE SOLAIRE & AUTOCONSOMMATION', 15, 28);
      doc.text(`Editee le ${new Date().toLocaleDateString('fr-FR')}`, 15, 35);

      // Coordonnées Client & Adresse sur 2 Lignes
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, 52, 180, 46, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, 52, 180, 46, 3, 3, 'D');

      doc.setTextColor(...primaryNavy);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Informations Client & Localisation', 20, 61);

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text(`Nom & Prenom : ${leadForm.prenom} ${leadForm.nom}`, 20, 70);
      doc.text(`Email : ${leadForm.email}`, 20, 77);
      doc.text(`Telephone : ${leadForm.phone}`, 20, 84);

      const { line1, line2 } = formatAddressForPdf(selectedAddress || addressInput);
      doc.text('Adresse du projet :', 105, 70);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryNavy);
      doc.text(line1, 105, 77);
      if (line2) {
        doc.text(line2, 105, 84);
      }

      // Caractéristiques Toiture
      doc.setTextColor(...primaryNavy);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Caracteristiques de votre Toiture', 15, 108);

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');

      const toitureData = [
        ['Surface de toiture mesuree :', `${simulationResults.exploitableSurface} m2`],
        ['Orientation du pan de toit :', orientation.text],
        ['Inclinaison retenue :', `${inclination} degres`],
        ['Consommation annuelle declaree :', `${consumptionKwh || 6000} kWh/an (${consumptionEuros || 1500} EUR/an)`],
        ['Vehicules electriques du foyer :', `${electricVehicles} vehicule(s)`]
      ];

      let yPos = 116;
      toitureData.forEach(([label, val]) => {
        doc.setFillColor(241, 245, 249);
        doc.rect(15, yPos, 180, 10, 'F');
        doc.setTextColor(70, 70, 70);
        doc.text(label, 20, yPos + 6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryNavy);
        doc.text(val, 130, yPos + 6.5);
        doc.setFont('helvetica', 'normal');
        yPos += 12;
      });

      // Préconisation
      doc.setFillColor(...tealGreen);
      doc.roundedRect(15, 182, 180, 48, 4, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`Preconisation retenue : Installation ${selectedPowerTab} kWc`, 20, 194);

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`- Nombre de panneaux photovoltaiques : ${activeMetrics.panelsCount} panneaux`, 20, 204);
      doc.text(`- Surface d'occupation necessaire : ${activeMetrics.surfaceOccupied} m2`, 20, 211);
      doc.text(`- Cout estimatif moyen de l'installation : ${activeMetrics.cost} EUR TTC`, 20, 218);

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('(c) 2026 ENR COURTAGE - Tous droits d\'utilisation et de reproduction reserves. | Page 1 sur 2', 105, 287, { align: 'center' });

      // PAGE 2
      doc.addPage('a4', 'portrait');

      doc.setFillColor(...primaryNavy);
      doc.rect(0, 0, 210, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('ENR COURTAGE - RENDEMENT FINANCIER & IMPACT ECOLOGIQUE', 15, 16);

      doc.setTextColor(...primaryNavy);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Rentabilite Financiere & Economies Estimees', 15, 38);

      const finData = [
        ['Economies generees des la 1ere annee :', `${activeMetrics.firstYearSavings} EUR / an`],
        ['Production photovoltaique annuelle :', `${activeMetrics.annualProdKwh} kWh / an`],
        ['Taux d\'autoconsommation estime :', `${activeMetrics.autoRatePct} %`],
        ['Economies cumulees sur 10 ans :', `${activeMetrics.cum10} EUR`],
        ['Economies cumulees sur 20 ans :', `${activeMetrics.cum20} EUR`],
        ['Economies cumulees sur 30 ans :', `${activeMetrics.cum30} EUR`],
        ['Temps d\'amortissement de la centrale (ROI) :', `${activeMetrics.paybackYears} ans`]
      ];

      yPos = 46;
      finData.forEach(([label, val]) => {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, yPos, 180, 9, 'F');
        doc.setTextColor(70, 70, 70);
        doc.setFontSize(9);
        doc.text(label, 20, yPos + 6);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...tealGreen);
        doc.text(val, 135, yPos + 6);
        doc.setFont('helvetica', 'normal');
        yPos += 11;
      });

      doc.setTextColor(...primaryNavy);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Votre Bilan & Impact Environnemental', 15, 132);

      doc.setFillColor(236, 253, 245);
      doc.roundedRect(15, 140, 180, 32, 3, 3, 'F');
      doc.setTextColor(6, 95, 70);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`- CO2 evite par an : ${activeMetrics.co2AvoidedKg} kg de CO2`, 20, 150);
      doc.text(`- Equivalent en arbres plantes : ${activeMetrics.treesPlanted} arbres / an`, 20, 158);
      doc.text(`- Alimentation electrique equivalente : ${activeMetrics.foyersEquiv} foyer(s)`, 20, 166);

      doc.setTextColor(...primaryNavy);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Options Choisies & Demande d\'Accompagnement', 15, 187);

      doc.setFillColor(241, 245, 249);
      doc.roundedRect(15, 194, 180, 38, 3, 3, 'F');
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`- Option Batterie de Stockage : ${leadForm.optBatterie ? 'OUI' : 'NON'}`, 20, 205);
      doc.text(`- Option Borne de Recharge IRVE : ${leadForm.optBorne ? 'OUI' : 'NON'}`, 20, 213);
      doc.text(`- Demande de rappel sous 24h par un charge d'affaires : ${leadForm.requestCallback ? 'OUI' : 'NON'}`, 20, 221);

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('(c) 2026 ENR COURTAGE - Tous droits d\'utilisation et de reproduction reserves. | Page 2 sur 2', 105, 287, { align: 'center' });

      return doc;
    } catch (err) {
      console.error("Erreur génération PDF:", err);
      return null;
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.nom.trim() || !leadForm.prenom.trim() || !leadForm.email.trim() || !leadForm.phone.trim()) {
      setLeadFormError("Veuillez remplir tous les champs obligatoires (*).");
      return;
    }
    if (!leadForm.acceptTerms) {
      setLeadFormError("Veuillez accepter la politique de confidentialité.");
      return;
    }

    setLeadFormError('');
    setIsSendingLead(true);

    try {
      const pdfDoc = await generatePdfStudy();
      if (pdfDoc) {
        pdfDoc.save(`Etude_Solaire_${leadForm.nom}_${selectedPowerTab}kWc.pdf`);
      }

      const messageDetail = `
NOUVELLE DEMANDE D'ETUDE SOLAIRE COMPLETE ENR COURTAGE

CLIENT :
- Nom : ${leadForm.nom}
- Prénom : ${leadForm.prenom}
- Email : ${leadForm.email}
- Téléphone : ${leadForm.phone}
- Adresse du projet : ${selectedAddress || addressInput || 'Non renseignée'}

CARACTÉRISTIQUES TOITURE :
- Surface exploitable : ${simulationResults.exploitableSurface} m²
- Orientation : ${orientation.text}
- Inclinaison : ${inclination}°
- Consommation annuelle : ${consumptionKwh || 6000} kWh/an (${consumptionEuros || 1500} €/an)
- Véhicules électriques : ${electricVehicles}

PROPOSITION & RENDEMENT :
- Puissance retenue : ${selectedPowerTab} kWc
- Nombre de panneaux : ${activeMetrics.panelsCount}
- Surface occupée : ${activeMetrics.surfaceOccupied} m²
- Économies dès l'an 1 : ${activeMetrics.firstYearSavings} €/an
- Temps d'amortissement (ROI) : ${activeMetrics.paybackYears} ans
- Cumul sur 10 ans : ${activeMetrics.cum10} €
- Cumul sur 20 ans : ${activeMetrics.cum20} €
- Cumul sur 30 ans : ${activeMetrics.cum30} €
- CO2 évité : ${activeMetrics.co2AvoidedKg} kg/an

OPTIONS CHOISIES :
- Batterie de stockage : ${leadForm.optBatterie ? 'OUI' : 'NON'}
- Borne de recharge : ${leadForm.optBorne ? 'OUI' : 'NON'}
- Demande de rappel sous 24h par chargé d'affaires : ${leadForm.requestCallback ? 'OUI' : 'NON'}
`;

      const fd = new FormData();
      fd.append("nom", leadForm.nom);
      fd.append("prenom", leadForm.prenom);
      fd.append("email", leadForm.email);
      fd.append("phone", leadForm.phone);
      fd.append("adresse", selectedAddress || addressInput);
      fd.append("puissance_kWc", selectedPowerTab);
      fd.append("economies_an1", `${activeMetrics.firstYearSavings} €`);
      fd.append("amortissement", `${activeMetrics.paybackYears} ans`);
      fd.append("option_batterie", leadForm.optBatterie ? "Oui" : "Non");
      fd.append("option_borne", leadForm.optBorne ? "Oui" : "Non");
      fd.append("rappel_24h", leadForm.requestCallback ? "Oui" : "Non");
      fd.append("message", messageDetail);
      fd.append("_subject", `Nouvelle étude solaire personnalisée - ${leadForm.prenom} ${leadForm.nom} (${selectedPowerTab} kWc)`);

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" }
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'envoi du message. Veuillez réessayer.");
      }

      toast({
        title: "Étude solaire envoyée avec succès !",
        description: "Votre étude complète en PDF a été téléchargée et transmise à nos conseillers ENR COURTAGE.",
        className: "bg-white text-[#0f2847] border border-[#0f9b8e]"
      });

    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Envoi de la demande",
        description: err.message || "Veuillez réessayer plus tard.",
        className: "bg-white text-gray-900 border border-red-400"
      });
    } finally {
      setIsSendingLead(false);
    }
  };

  const roofPeakY = inclination === 0 ? 80 : inclination === 15 ? 55 : inclination === 30 ? 35 : 15;

  return (
    <div id="simulateur-solaire" className="w-full max-w-5xl mx-auto my-8 bg-white rounded-3xl shadow-[0_20px_60px_rgba(15,40,71,0.08)] border border-gray-100 overflow-hidden font-sans">
      
      {/* BARRE DE PROGRESSION EN TÊTE */}
      {step < 7 && (
        <div className="bg-gradient-to-r from-[#0f2847] to-[#163a5f] p-3 px-2 sm:p-6 text-white text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-1 xs:gap-2 sm:gap-4 md:gap-6 text-[10px] sm:text-xs md:text-sm font-medium">
            <div className={`flex items-center gap-1 sm:gap-2 ${step <= 5 ? 'opacity-100 font-bold text-[#d4a843]' : 'opacity-60'}`}>
              <span className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center border-2 text-[10px] sm:text-xs md:text-sm shrink-0 ${step <= 5 ? 'border-[#d4a843] bg-[#d4a843]/20' : 'border-white/40'}`}>1</span>
              <span className="whitespace-nowrap">Votre toiture</span>
            </div>
            <span className="text-white/30 shrink-0">―</span>
            <div className={`flex items-center gap-1 sm:gap-2 ${step === 6 ? 'opacity-100 font-bold text-[#d4a843]' : 'opacity-60'}`}>
              <span className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center border-2 text-[10px] sm:text-xs md:text-sm shrink-0 ${step === 6 ? 'border-[#d4a843] bg-[#d4a843]/20' : 'border-white/40'}`}>2</span>
              <span className="whitespace-nowrap">Votre consommation</span>
            </div>
            <span className="text-white/30 shrink-0">―</span>
            <div className={`flex items-center gap-1 sm:gap-2 ${step >= 6.5 ? 'opacity-100 font-bold text-[#d4a843]' : 'opacity-60'}`}>
              <span className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center border-2 text-[10px] sm:text-xs md:text-sm shrink-0 ${step >= 6.5 ? 'border-[#d4a843] bg-[#d4a843]/20' : 'border-white/40'}`}>3</span>
              <span className="whitespace-nowrap">Votre résultat</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 md:p-10">
        <AnimatePresence mode="wait">

          {/* ÉTAPE 1 */}
          {step === 1 && (
            <motion.div 
              key="step1" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="text-center max-w-2xl mx-auto py-6"
            >
              <div className="inline-flex items-center space-x-2 bg-amber-50 text-[#d4a843] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Simulateur Solaire Photovoltaïque</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-[#0f2847] mb-4">
                J'estime mes économies
              </h2>
              <p className="text-gray-500 text-base mb-8">
                Recevez votre étude solaire gratuite, personnalisée en quelques clics et sans engagement.
              </p>

              <div className="relative mb-6 text-left">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="Saisissez votre adresse postale..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-[#0f9b8e] focus:ring-2 focus:ring-[#0f9b8e]/20 outline-none text-[#0f2847] bg-white text-lg shadow-sm transition-all placeholder:text-gray-400"
                  />
                </div>

                {suggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex items-center space-x-3 transition-colors text-[#0f2847]"
                      >
                        <MapPin className="w-4 h-4 text-[#0f9b8e] flex-shrink-0" />
                        <span className="text-sm font-medium text-[#0f2847]">{item.properties.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleStartFromStep1}
                disabled={!addressInput.trim()}
                className="w-full sm:w-auto px-8 py-4 bg-[#0f9b8e] hover:bg-[#0c8277] text-white font-bold rounded-xl shadow-lg shadow-[#0f9b8e]/25 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
              >
                <span>Lancer le simulateur</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-xs text-gray-400 mt-4">
                En saisissant votre adresse postale, vous accédez directement à l'analyse satellite de votre toiture.
              </p>
            </motion.div>
          )}

          {/* ÉTAPE 2 */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="text-center">
              <h3 className="text-2xl font-bold text-[#0f2847] mb-2 flex items-center justify-center space-x-2">
                <span>Repérons votre toiture</span>
                <Info className="w-5 h-5 text-[#0f9b8e]" />
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Faites glisser la carte pour positionner votre toiture sous le curseur vert
              </p>

              <SatelliteMap
                step={2}
                centerCoords={centerCoords}
                setCenterCoords={setCenterCoords}
                roofCorners={roofCorners}
                setRoofCorners={setRoofCorners}
                setSurfaceM2={setSurfaceM2}
                onAddressUpdated={handleAddressUpdatedFromMap}
              />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleValidateStep2}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#0f9b8e] hover:bg-[#0c8277] text-white font-bold rounded-xl shadow-lg transition-all text-base"
                >
                  Valider mon emplacement
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center space-x-1 py-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Recommencer la simulation</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 3 */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="text-center">
              <h3 className="text-2xl font-bold text-[#0f2847] mb-2 flex items-center justify-center space-x-2">
                <span>Calculons la surface de votre toiture</span>
                <Info className="w-5 h-5 text-[#0f9b8e]" />
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Déplacez les 4 coins vert fluo (1, 2, 3, 4) du pan de votre toiture pouvant accueillir des panneaux photovoltaïques
              </p>

              <SatelliteMap
                step={3}
                centerCoords={centerCoords}
                setCenterCoords={setCenterCoords}
                roofCorners={roofCorners}
                setRoofCorners={setRoofCorners}
                setSurfaceM2={setSurfaceM2}
              />

              <div className="flex items-center justify-center space-x-4 mb-4">
                <button
                  onClick={handleResetRoofCorners}
                  className="text-xs text-gray-500 hover:text-gray-800 flex items-center space-x-1 bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser le rectangle</span>
                </button>
              </div>

              <div className="bg-cyan-50/60 border border-cyan-200 rounded-2xl p-4 mb-6 max-w-md mx-auto">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nous estimons la surface de toiture à :</p>
                <p className="text-3xl font-extrabold text-[#0f2847]">{surfaceM2} m²</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleValidateStep3}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#0f9b8e] hover:bg-[#0c8277] text-white font-bold rounded-xl shadow-lg transition-all text-base"
                >
                  Valider la surface de ma toiture
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center space-x-1 py-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Étape précédente</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 4 */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="text-center">
              <h3 className="text-2xl font-bold text-[#0f2847] mb-2 flex items-center justify-center space-x-2">
                <span>Déterminons l'orientation de votre toiture</span>
                <Info className="w-5 h-5 text-[#0f9b8e]" />
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Cliquez sur le côté le plus haut de votre toiture (le faîtage)
              </p>

              <SatelliteMap
                step={4}
                centerCoords={centerCoords}
                setCenterCoords={setCenterCoords}
                roofCorners={roofCorners}
                setRoofCorners={setRoofCorners}
                selectedEdgeIndex={selectedEdgeIndex}
                onSelectEdge={handleSelectEdge}
                setSurfaceM2={setSurfaceM2}
              />

              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-6 max-w-md mx-auto">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Votre toiture est exposée :</p>
                <p className="text-3xl font-extrabold text-[#0f2847]">{orientation.text}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleValidateStep4}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#0f9b8e] hover:bg-[#0c8277] text-white font-bold rounded-xl shadow-lg transition-all text-base"
                >
                  Valider l'orientation de ma toiture
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center space-x-1 py-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Étape précédente</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 5 */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="text-center max-w-xl mx-auto py-4">
              <h3 className="text-2xl font-bold text-[#0f2847] mb-6">
                Quelle est l'inclinaison de votre toiture ?
              </h3>

              <div className="w-full h-32 mb-8 flex items-center justify-center">
                <svg className="w-64 h-32 text-[#0f9b8e] transition-all duration-300" viewBox="0 0 200 100" fill="none" stroke="currentColor" strokeWidth="3">
                  {inclination === 0 ? (
                    <line x1="20" y1="80" x2="180" y2="80" stroke="#0f9b8e" strokeWidth="5" strokeLinecap="round" />
                  ) : (
                    <>
                      <path d={`M 20 80 L 100 ${roofPeakY} L 180 80`} strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300" />
                      <path d={`M 30 75 L 100 ${roofPeakY + 5} L 100 75 Z`} fill="#0f9b8e" fillOpacity="0.15" strokeDasharray="3 3" className="transition-all duration-300" />
                      <line x1="20" y1="80" x2="180" y2="80" stroke="#cbd5e1" strokeWidth="2" />
                    </>
                  )}
                </svg>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-8">
                {[0, 15, 30, 45].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setInclination(deg)}
                    className={`py-4 rounded-xl font-bold text-lg border-2 transition-all ${
                      inclination === deg
                        ? 'border-[#0f2847] bg-[#0f2847] text-white shadow-md scale-105'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500 mb-8 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                Si vous ne connaissez pas l'inclinaison exacte de votre toiture, choisissez 30°.<br />
                Il s'agit de la construction la plus courante en France.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleValidateStep5}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#0f9b8e] hover:bg-[#0c8277] text-white font-bold rounded-xl shadow-lg transition-all text-base"
                >
                  Valider l'inclinaison de ma toiture
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center space-x-1 py-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Étape précédente</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 6 */}
          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="text-center max-w-xl mx-auto py-4">
              <h3 className="text-2xl font-bold text-[#0f2847] mb-6">
                Quelle est votre consommation d'électricité ?
              </h3>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Je connais ma consommation en kWh :
                  </label>
                  <div className="flex items-center justify-center max-w-xs mx-auto border border-gray-300 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#0f9b8e]">
                    <input
                      type="number"
                      value={consumptionKwh}
                      onChange={(e) => handleKwhChange(e.target.value)}
                      placeholder="6000"
                      className="w-full px-4 py-3 text-center text-xl font-bold outline-none text-[#0f2847] bg-white placeholder-gray-300"
                    />
                    <span className="bg-[#0f9b8e] text-white font-bold px-4 py-3 text-sm">
                      kWh / an
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <div className="h-[1px] bg-gray-300 flex-1"></div>
                  <span className="text-xs font-bold text-gray-400 uppercase">ou</span>
                  <div className="h-[1px] bg-gray-300 flex-1"></div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Je connais le montant de ma facture annuelle :
                  </label>
                  <div className="flex items-center justify-center max-w-xs mx-auto border border-gray-300 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#0f9b8e]">
                    <input
                      type="number"
                      value={consumptionEuros}
                      onChange={(e) => handleEurosChange(e.target.value)}
                      placeholder="1500"
                      className="w-full px-4 py-3 text-center text-xl font-bold outline-none text-[#0f2847] bg-white placeholder-gray-300"
                    />
                    <span className="bg-[#0f9b8e] text-white font-bold px-4 py-3 text-sm">
                      € / an
                    </span>
                  </div>
                </div>
              </div>

              {consumptionError && (
                <div className="mb-6 flex items-center justify-center space-x-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{consumptionError}</span>
                </div>
              )}

              <div className="mb-8">
                <h4 className="text-base font-bold text-[#0f2847] mb-4">
                  Possédez-vous un ou plusieurs véhicules électriques ?
                </h4>
                <div className="flex justify-center space-x-4">
                  {[0, 1, 2, '3+'].map((ve, idx) => (
                    <button
                      key={idx}
                      onClick={() => setElectricVehicles(idx)}
                      className={`w-12 h-12 rounded-full font-bold text-base transition-all ${
                        electricVehicles === idx
                          ? 'bg-[#0f2847] text-white shadow-lg scale-110'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {ve}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleValidateStep6}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#0f9b8e] hover:bg-[#0c8277] text-white font-bold rounded-xl shadow-lg transition-all text-base"
                >
                  Valider ma consommation
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center space-x-1 py-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Étape précédente</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 6.5 */}
          {step === 6.5 && (
            <motion.div key="step6_5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
              <div className="w-16 h-16 border-4 border-[#0f9b8e]/20 border-t-[#0f9b8e] rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-2xl font-bold text-[#0f2847] mb-4">
                Ajustement des offres photovoltaïques...
              </h3>
              <div className="w-64 h-2 bg-gray-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-[#0f9b8e] transition-all duration-200 ease-out" style={{ width: `${loadingProgress}%` }}></div>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 7 : RÉSULTATS AVEC FILTRAGE DE SURFACE ET BOUTON DE NOUVELLE SIMULATION */}
          {step === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">

              <div className="text-center border-b border-gray-100 pb-6 relative">
                <h2 className="text-3xl font-extrabold text-[#0f2847] mb-2">Résultats de votre simulation</h2>
                {selectedAddress && (
                  <p className="text-sm text-gray-500 flex items-center justify-center space-x-1">
                    <MapPin className="w-4 h-4 text-[#0f9b8e]" />
                    <span>{selectedAddress}</span>
                  </p>
                )}

                {/* Bouton pour recommencer une simulation en haut de la page des résultats */}
                <button
                  onClick={() => setStep(1)}
                  className="mt-4 inline-flex items-center space-x-2 text-xs font-semibold text-[#0f9b8e] bg-[#0f9b8e]/10 hover:bg-[#0f9b8e]/20 px-4 py-2 rounded-full transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refaire une simulation</span>
                </button>
              </div>

              {/* Potentiel toiture */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
                <h3 className="text-center text-lg font-bold text-[#0f2847] mb-6">
                  Potentiel photovoltaïque de votre toiture
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-amber-100 text-[#d4a843] rounded-full flex items-center justify-center mx-auto mb-2">
                      <Home className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-500 uppercase">Surface exploitable</p>
                    <p className="text-2xl font-extrabold text-[#0f2847] mt-1">{simulationResults.exploitableSurface} m²</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-100 text-[#0f9b8e] rounded-full flex items-center justify-center mx-auto mb-2">
                      <Sun className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-500 uppercase">Panneaux installables</p>
                    <p className="text-2xl font-extrabold text-[#0f2847] mt-1">{simulationResults.installablePanels}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-500 uppercase">Puissance installable</p>
                    <p className="text-2xl font-extrabold text-[#0f2847] mt-1">{simulationResults.installablePowerWatts} Watts</p>
                  </div>
                </div>
              </div>

              {/* Onglets et préconisation avec grisement automatique si surface insuffisante */}
              <div>
                <div className="bg-[#0f9b8e] text-white p-4 rounded-t-2xl text-center font-bold text-lg">
                  ENR COURTAGE vous préconise l'installation {simulationResults.recommendedPower} kWc
                </div>

                <div className="grid grid-cols-3 bg-gray-100 p-1 border-x border-b border-gray-200">
                  {[3, 6, 9].map((pwc) => {
                    // Vérification de la surface minimale requise pour chaque puissance (3kWc: 15m², 6kWc: 30m², 9kWc: 45m²)
                    const isAllowed = (pwc === 3 && surfaceM2 >= 15) || (pwc === 6 && surfaceM2 >= 30) || (pwc === 9 && surfaceM2 >= 45);
                    const isSelected = selectedPowerTab === pwc;

                    return (
                      <button
                        key={pwc}
                        disabled={!isAllowed}
                        onClick={() => isAllowed && setSelectedPowerTab(pwc)}
                        className={`py-3.5 font-bold text-xs sm:text-sm md:text-base transition-all ${
                          !isAllowed
                            ? 'bg-gray-200/90 text-gray-400 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#0f2847] text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900 bg-gray-200/60'
                        }`}
                      >
                        Installation {pwc} kWc
                        {!isAllowed && <span className="block text-[10px] font-normal text-gray-400">(Surface insuffisante)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Détails économies */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-extrabold text-[#0f2847] mb-1">Économies estimées</h3>
                  <span className="text-xs font-semibold text-gray-400 uppercase">
                    Données calculées selon les tarifs d'électricité en vigueur
                  </span>
                  <div className="mt-4 flex items-baseline justify-center space-x-2">
                    <span className="text-4xl md:text-5xl font-black text-[#0f9b8e]">
                      {activeMetrics.firstYearSavings} €
                    </span>
                    <span className="text-gray-600 font-medium text-sm text-left">
                      dès la 1ère année<br />
                      <span className="text-xs text-gray-400">moyenne générée sur 10 ans</span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-center justify-around gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Nombre de panneaux</p>
                    <p className="text-xl font-bold text-[#0f2847]">{activeMetrics.panelsCount}</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Surface occupée</p>
                    <p className="text-xl font-bold text-[#0f2847]">{activeMetrics.surfaceOccupied} m²</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Coût moyen estimé</p>
                    <p className="text-xl font-bold text-[#0f2847]">{activeMetrics.cost} €</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Amortissement</p>
                    <p className="text-xl font-bold text-emerald-600">{activeMetrics.paybackYears} ans</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-100">
                    <p className="text-xs text-gray-500 uppercase">Votre production annuelle d'électricité</p>
                    <p className="text-2xl font-extrabold text-[#0f2847] mt-1">{activeMetrics.annualProdKwh} kWh</p>
                    <div className="mt-3 bg-white p-3 rounded-lg text-xs text-gray-600 border border-amber-200/60">
                      Taux d'autoconsommation estimé à <strong>{activeMetrics.autoRatePct}%</strong>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
                    <p className="text-xs text-gray-500 uppercase">Potentiel d'autoconsommation annuelle</p>
                    <p className="text-2xl font-extrabold text-[#0f9b8e] mt-1">{activeMetrics.autoconsumedProdKwh} kWh</p>
                    <div className="mt-3 bg-white p-3 rounded-lg text-xs text-gray-600 border border-emerald-200/60">
                      Soit jusqu'à <strong>{activeMetrics.billSavingsPct}%</strong> d'économies sur votre facture
                    </div>
                  </div>
                </div>

                {/* PROJECTION ÉCONOMIES CUMULÉES SUR 10, 20, 30 ANS */}
                <div className="pt-6 border-t border-gray-100 text-center">
                  <h4 className="text-lg font-bold text-[#0f2847] mb-6">Économies cumulées</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-xl flex flex-row md:flex-col items-center justify-between md:justify-center">
                      <p className="text-sm md:text-xs text-gray-400 font-semibold md:mb-1">sur 10 ans</p>
                      <p className="text-lg md:text-xl font-extrabold text-[#0f9b8e]">{activeMetrics.cum10} €</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl flex flex-row md:flex-col items-center justify-between md:justify-center">
                      <p className="text-sm md:text-xs text-gray-400 font-semibold md:mb-1">sur 20 ans</p>
                      <p className="text-lg md:text-xl font-extrabold text-[#0f9b8e]">{activeMetrics.cum20} €</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl flex flex-row md:flex-col items-center justify-between md:justify-center">
                      <p className="text-sm md:text-xs text-gray-400 font-semibold md:mb-1">sur 30 ans</p>
                      <p className="text-lg md:text-xl font-extrabold text-[#0f9b8e]">{activeMetrics.cum30} €</p>
                    </div>
                  </div>
                </div>

                {/* GRAPHIQUE BARRES DU ROI */}
                <RoiBarChart activeMetrics={activeMetrics} paybackYears={activeMetrics.paybackYears} />

                {/* IMPACT SUR L'ENVIRONNEMENT */}
                <div className="pt-6 border-t border-gray-100 text-center">
                  <h4 className="text-lg font-bold text-[#0f2847] mb-6 flex items-center justify-center space-x-2">
                    <Leaf className="w-5 h-5 text-emerald-500" />
                    <span>Votre impact sur l'environnement</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">
                      <p className="text-2xl font-black text-emerald-600">{activeMetrics.co2AvoidedKg} kg</p>
                      <p className="text-xs text-gray-600 mt-1">de CO₂ évités par an</p>
                    </div>
                    <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">
                      <p className="text-2xl font-black text-emerald-600">{activeMetrics.treesPlanted}</p>
                      <p className="text-xs text-gray-600 mt-1">arbres plantés par an</p>
                    </div>
                    <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">
                      <p className="text-2xl font-black text-emerald-600">{activeMetrics.foyersEquiv}</p>
                      <p className="text-xs text-gray-600 mt-1">foyer(s) alimenté(s) en électricité</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* FORMULAIRE DE CAPTURE DE LEAD & OPTIONS FINALES */}
              <div id="formulaire-etude-finale" className="bg-[#0f2847] text-white rounded-3xl p-6 md:p-10 shadow-2xl border border-blue-900/40 mt-12">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-3">Recevez votre étude complète</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Remplissez le formulaire ci-dessous pour recevoir le récapitulatif de votre simulation solaire et toutes les informations dont vous avez besoin pour passer au photovoltaïque !
                  </p>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-6 max-w-2xl mx-auto">

                  {leadFormError && (
                    <div className="bg-red-500/20 border border-red-400 text-red-100 p-3 rounded-xl text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{leadFormError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/80">NOM *</label>
                      <input
                        type="text"
                        required
                        value={leadForm.nom}
                        onChange={(e) => setLeadForm(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Votre nom"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#0f9b8e]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/80">PRÉNOM *</label>
                      <input
                        type="text"
                        required
                        value={leadForm.prenom}
                        onChange={(e) => setLeadForm(prev => ({ ...prev, prenom: e.target.value }))}
                        placeholder="Votre prénom"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#0f9b8e]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/80">ADRESSE MAIL *</label>
                      <input
                        type="email"
                        required
                        value={leadForm.email}
                        onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="votre@email.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#0f9b8e]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/80">TÉLÉPHONE *</label>
                      <input
                        type="tel"
                        required
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="06 12 34 56 78"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#0f9b8e]"
                      />
                    </div>
                  </div>

                  {/* SÉLECTION DES OPTIONS */}
                  <div className="pt-4">
                    <h4 className="text-center text-sm font-bold uppercase tracking-wider text-white/90 mb-4">Choisissez vos options</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setLeadForm(prev => ({ ...prev, optBatterie: !prev.optBatterie }))}
                        className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center space-y-3 ${
                          leadForm.optBatterie 
                            ? 'border-[#0f9b8e] bg-[#0f9b8e]/20 text-white ring-2 ring-[#0f9b8e]/50' 
                            : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${leadForm.optBatterie ? 'bg-[#0f9b8e] text-white' : 'bg-white/10 text-white/50'}`}>
                          <BatteryCharging className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-sm">Batterie de stockage</span>
                        {leadForm.optBatterie && <span className="text-[10px] bg-[#0f9b8e] text-white px-2 py-0.5 rounded-full font-bold">Sélectionné</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => setLeadForm(prev => ({ ...prev, optBorne: !prev.optBorne }))}
                        className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center space-y-3 ${
                          leadForm.optBorne 
                            ? 'border-[#0f9b8e] bg-[#0f9b8e]/20 text-white ring-2 ring-[#0f9b8e]/50' 
                            : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${leadForm.optBorne ? 'bg-[#0f9b8e] text-white' : 'bg-white/10 text-white/50'}`}>
                          <Car className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-sm">Borne de recharge</span>
                        {leadForm.optBorne && <span className="text-[10px] bg-[#0f9b8e] text-white px-2 py-0.5 rounded-full font-bold">Sélectionné</span>}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setLeadForm(prev => ({ ...prev, requestCallback: !prev.requestCallback }))}
                      className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center space-x-4 text-left ${
                        leadForm.requestCallback
                          ? 'border-[#0f9b8e] bg-[#0f9b8e]/20 text-white'
                          : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${leadForm.requestCallback ? 'border-[#0f9b8e] bg-[#0f9b8e]' : 'border-white/40'}`}>
                        {leadForm.requestCallback && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="text-xs sm:text-sm">
                        <strong className="block text-white text-base mb-1">Démarrez votre projet photovoltaïque dès maintenant</strong>
                        <span>Je souhaite être rappelé(e) par un(e) chargé(e) d'affaires sous 24h afin d'étudier mon projet photovoltaïque</span>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-start space-x-3 text-xs text-white/60">
                    <input
                      type="checkbox"
                      id="terms-check"
                      checked={leadForm.acceptTerms}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                      className="mt-0.5 rounded border-white/20 text-[#0f9b8e] focus:ring-[#0f9b8e]"
                    />
                    <label htmlFor="terms-check" className="cursor-pointer">
                      En soumettant ce formulaire, j'accepte que les informations saisies soient exploitées par ENR Courtage dans le cadre de la demande d'information et de la relation commerciale qui peut en découler.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingLead}
                    className="w-full py-4 bg-[#0f9b8e] hover:bg-[#0c8277] text-white font-extrabold rounded-2xl shadow-xl shadow-[#0f9b8e]/30 transition-all text-lg flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    {isSendingLead ? (
                      <span>Envoi de l'étude et du PDF en cours...</span>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Recevoir l'étude complète de votre projet</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-4 border-t border-white/10 space-y-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-white/70 hover:text-white inline-flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Refaire une simulation</span>
                    </button>
                    <p className="text-xs text-white/50">
                      © 2026 ENR COURTAGE - Tous droits d'utilisation et de reproduction réservés.
                    </p>
                  </div>

                </form>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default SolarSimulator;
