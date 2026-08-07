import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Search, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, 
  Sun, Zap, Leaf, Home, Award, ChevronRight, Info, ShieldCheck, Sparkles, FileText, MousePointerClick, RotateCcw, AlertCircle
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const R = 6378137; // Rayon de la Terre en mètres
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

// Calcul exact de l'orientation de la PENTE (faîtage = trait rouge)
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

// ==========================================
// COMPOSANT CARTE LEAFLET ULTRA-FLUIDE
// ==========================================
function SatelliteMap({ step, centerCoords, setCenterCoords, roofCorners, setRoofCorners, selectedEdgeIndex, onSelectEdge, setSurfaceM2 }) {
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

  useEffect(() => {
    if (mapRef.current && centerCoords) {
      mapRef.current.setView([centerCoords.lat, centerCoords.lng], mapRef.current.getZoom() || 19);
    }
  }, [centerCoords]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMoveEnd = () => {
      if (currentStepRef.current === 2) {
        const c = map.getCenter();
        setCenterCoords({ lat: c.lat, lng: c.lng });
      }
    };

    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, []);

  // GESTION PERSISTANTE DES COINS POUR UN DRAG&DROP CONTINU
  useEffect(() => {
    const map = mapRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

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
// COMPOSANT PRINCIPAL SIMULATEUR SOLAIRE
// ==========================================
const SolarSimulator = ({ onCompleteLead }) => {
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

  // Étape 4 : Orientation toiture (sélection arête haute)
  const [selectedEdgeIndex, setSelectedEdgeIndex] = useState(0);
  const [orientation, setOrientation] = useState({ text: "Sud-Ouest", code: "SO" });

  // Étape 5 : Inclinaison toiture (0, 15, 30, 45)
  const [inclination, setInclination] = useState(30);

  // Étape 6 : Consommation (kWh/an ou €/an) & Véhicules électriques
  // Par défaut vide avec placeholders et validation obligatoire
  const [consumptionKwh, setConsumptionKwh] = useState('');
  const [consumptionEuros, setConsumptionEuros] = useState('');
  const [consumptionError, setConsumptionError] = useState('');
  const [electricVehicles, setElectricVehicles] = useState(0);

  // Étape 6.5 : Écran de transition / chargement
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Étape 7 : Onglet de puissance sélectionné (3, 6, 9 kWc)
  const [selectedPowerTab, setSelectedPowerTab] = useState(9);

  // Autocomplétion API BAN / Adresse Gouv
  useEffect(() => {
    if (addressInput.trim().length > 3) {
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
  }, [addressInput]);

  const handleSelectSuggestion = (feature) => {
    const label = feature.properties.label;
    const [lng, lat] = feature.geometry.coordinates;
    setAddressInput(label);
    setSelectedAddress(label);
    setCoords({ lat, lng });
    setCenterCoords({ lat, lng });
    setSuggestions([]);
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

  // CALCULS PHOTOVOLTAÏQUES ÉTAPE 7
  const simulationResults = useMemo(() => {
    const kwhVal = parseFloat(consumptionKwh) || 6000;
    const eurVal = parseFloat(consumptionEuros) || 1500;

    const exploitableSurface = Math.max(15, surfaceM2);
    const installablePanels = Math.floor(exploitableSurface / 2);
    const installablePowerWatts = installablePanels * 480;

    let recommendedPower = 3;
    if (kwhVal > 7500 || exploitableSurface > 40) recommendedPower = 9;
    else if (kwhVal > 4000 || exploitableSurface > 25) recommendedPower = 6;

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
      const firstYearSavings = Math.round(autoconsumedProdKwh * 0.26 + (annualProdKwh - autoconsumedProdKwh) * 0.13);

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
      recommendedPower,
      metrics: {
        3: getMetricsForPower(3),
        6: getMetricsForPower(6),
        9: getMetricsForPower(9)
      }
    };
  }, [surfaceM2, orientation, inclination, consumptionKwh, consumptionEuros, electricVehicles]);

  const handleRequestFullStudy = () => {
    if (onCompleteLead) {
      onCompleteLead({
        address: selectedAddress || addressInput,
        surfaceM2,
        orientation: orientation.text,
        inclination,
        consumptionKwh: consumptionKwh || 6000,
        electricVehicles,
        selectedPower: selectedPowerTab,
        savingsFirstYear: simulationResults.metrics[selectedPowerTab].firstYearSavings
      });
    } else {
      const contactForm = document.querySelector('[data-contact-form]');
      if (contactForm) contactForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeMetrics = simulationResults.metrics[selectedPowerTab] || simulationResults.metrics[9];

  // Calcul dynamique de la hauteur du toit dans le SVG selon l'inclinaison sélectionnée (0°, 15°, 30°, 45°)
  const roofPeakY = inclination === 0 ? 80 : inclination === 15 ? 55 : inclination === 30 ? 35 : 15;

  return (
    <div id="simulateur-solaire" className="w-full max-w-5xl mx-auto my-8 bg-white rounded-3xl shadow-[0_20px_60px_rgba(15,40,71,0.08)] border border-gray-100 overflow-hidden font-sans">
      
      {/* BARRE DE PROGRESSION EN TÊTE */}
      {step < 7 && (
        <div className="bg-gradient-to-r from-[#0f2847] to-[#163a5f] p-6 text-white text-center relative">
          <div className="flex items-center justify-center space-x-6 text-xs md:text-sm font-medium">
            <div className={`flex items-center space-x-2 ${step <= 5 ? 'opacity-100 font-bold text-[#d4a843]' : 'opacity-60'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${step <= 5 ? 'border-[#d4a843] bg-[#d4a843]/20' : 'border-white/40'}`}>1</span>
              <span>Votre toiture</span>
            </div>
            <span className="text-white/30">―</span>
            <div className={`flex items-center space-x-2 ${step === 6 ? 'opacity-100 font-bold text-[#d4a843]' : 'opacity-60'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${step === 6 ? 'border-[#d4a843] bg-[#d4a843]/20' : 'border-white/40'}`}>2</span>
              <span>Votre consommation</span>
            </div>
            <span className="text-white/30">―</span>
            <div className={`flex items-center space-x-2 ${step >= 6.5 ? 'opacity-100 font-bold text-[#d4a843]' : 'opacity-60'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${step >= 6.5 ? 'border-[#d4a843] bg-[#d4a843]/20' : 'border-white/40'}`}>3</span>
              <span>Votre résultat</span>
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
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-[#0f9b8e] focus:ring-2 focus:ring-[#0f9b8e]/20 outline-none text-gray-800 text-lg shadow-sm transition-all"
                  />
                </div>

                {suggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex items-center space-x-3 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-[#0f9b8e] flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item.properties.label}</span>
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

          {/* ÉTAPE 5 : INCLINAISON DE LA TOITURE AVEC DESSIN DYNAMIQUE ET RETOUR À LA LIGNE */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="text-center max-w-xl mx-auto py-4">
              <h3 className="text-2xl font-bold text-[#0f2847] mb-6">
                Quelle est l'inclinaison de votre toiture ?
              </h3>

              {/* Visuel SVG dynamique dont la pente s'ajuste selon l'angle sélectionné (0°, 15°, 30°, 45°) */}
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

          {/* ÉTAPE 6 : CONSOMMATION ÉLECTRIQUE (CHAMPS VIDES AVEC PLACEHOLDERS ET VALIDATION OBLIGATOIRE) */}
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
                      className="w-full px-4 py-3 text-center text-xl font-bold outline-none text-gray-800 placeholder-gray-300"
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
                      className="w-full px-4 py-3 text-center text-xl font-bold outline-none text-gray-800 placeholder-gray-300"
                    />
                    <span className="bg-[#0f9b8e] text-white font-bold px-4 py-3 text-sm">
                      € / an
                    </span>
                  </div>
                </div>
              </div>

              {/* Affichage du message d'erreur si la saisie est vide */}
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

          {/* ÉTAPE 7 */}
          {step === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">

              <div className="text-center border-b border-gray-100 pb-6">
                <h2 className="text-3xl font-extrabold text-[#0f2847] mb-2">Résultats de votre simulation</h2>
                {selectedAddress && (
                  <p className="text-sm text-gray-500 flex items-center justify-center space-x-1">
                    <MapPin className="w-4 h-4 text-[#0f9b8e]" />
                    <span>{selectedAddress}</span>
                  </p>
                )}
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

              {/* Onglets et préconisation */}
              <div>
                <div className="bg-[#0f9b8e] text-white p-4 rounded-t-2xl text-center font-bold text-lg">
                  ENR COURTAGE vous préconise l'installation {simulationResults.recommendedPower} kWc
                </div>

                <div className="grid grid-cols-3 bg-gray-100 p-1 border-x border-b border-gray-200">
                  {[3, 6, 9].map((pwc) => (
                    <button
                      key={pwc}
                      onClick={() => setSelectedPowerTab(pwc)}
                      className={`py-3.5 font-bold text-sm md:text-base transition-all ${
                        selectedPowerTab === pwc
                          ? 'bg-[#0f2847] text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900 bg-gray-200/60'
                      }`}
                    >
                      Installation {pwc} kWc
                    </button>
                  ))}
                </div>
              </div>

              {/* Détails économies */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-8">
                <div className="text-center">
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

                <div className="pt-6 border-t border-gray-100 text-center">
                  <h4 className="text-lg font-bold text-[#0f2847] mb-6">Économies cumulées</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-400 mb-1">sur 10 ans</p>
                      <p className="text-lg md:text-xl font-extrabold text-[#0f9b8e]">{activeMetrics.cum10} €</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-400 mb-1">sur 20 ans</p>
                      <p className="text-lg md:text-xl font-extrabold text-[#0f9b8e]">{activeMetrics.cum20} €</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-400 mb-1">sur 30 ans</p>
                      <p className="text-lg md:text-xl font-extrabold text-[#0f9b8e]">{activeMetrics.cum30} €</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 bg-amber-50 inline-block px-4 py-2 rounded-full text-amber-800 border border-amber-200">
                    Rappel : Vous amortissez votre centrale photovoltaïque au bout de <strong>{activeMetrics.paybackYears} ans</strong>
                  </p>
                </div>

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

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={handleRequestFullStudy}
                  className="w-full sm:w-auto px-8 py-4 bg-[#0f9b8e] hover:bg-[#0c8277] text-white font-bold rounded-xl shadow-xl shadow-[#0f9b8e]/20 transition-all text-base flex items-center justify-center space-x-2"
                >
                  <FileText className="w-5 h-5" />
                  <span>Recevoir votre étude complète</span>
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center space-x-1 py-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Recommencer la simulation</span>
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default SolarSimulator;
