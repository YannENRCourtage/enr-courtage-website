import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Search, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, 
  Sun, Zap, Leaf, Home, Award, ChevronRight, Info, ShieldCheck, Sparkles, FileText
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polygon, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icones Leaflet personnalisées
const markerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const handleIcon = new L.DivIcon({
  className: 'custom-handle-icon',
  html: `<div style="background-color: #10b981; border: 2px solid white; width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.4); cursor: grab;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Composant pour recentrer la carte Leaflet
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Composant pour mettre à jour la position au drag de la carte à l'étape 2
function MapEventsHandler({ setCenterCoords, step }) {
  const map = useMapEvents({
    moveend: () => {
      if (step === 2) {
        const c = map.getCenter();
        setCenterCoords({ lat: c.lat, lng: c.lng });
      }
    }
  });
  return null;
}

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

// Calcul de l'orientation selon l'arête la plus haute choisie
function calculateOrientation(edgeCorners, allCorners) {
  if (!edgeCorners || edgeCorners.length < 2) return { text: "Sud-Ouest", code: "SO", azimuth: 225 };
  
  const [p1, p2] = edgeCorners;
  const avgLat = ((p1.lat + p2.lat) / 2) * (Math.PI / 180);
  const dx = (p2.lng - p1.lng) * Math.cos(avgLat);
  const dy = p2.lat - p1.lat;
  
  // Angle du toit descendant perpendiculairement à l'arête faîtière
  let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (angle < 0) angle += 360;

  // Détermination cardinale
  if (angle >= 337.5 || angle < 22.5) return { text: "Nord", code: "N", azimuth: 0 };
  if (angle >= 22.5 && angle < 67.5) return { text: "Nord-Est", code: "NE", azimuth: 45 };
  if (angle >= 67.5 && angle < 112.5) return { text: "Est", code: "E", azimuth: 90 };
  if (angle >= 112.5 && angle < 157.5) return { text: "Sud-Est", code: "SE", azimuth: 135 };
  if (angle >= 157.5 && angle < 202.5) return { text: "Sud", code: "S", azimuth: 180 };
  if (angle >= 202.5 && angle < 247.5) return { text: "Sud-Ouest", code: "SO", azimuth: 225 };
  if (angle >= 247.5 && angle < 292.5) return { text: "Ouest", code: "O", azimuth: 270 };
  return { text: "Nord-Ouest", code: "NO", azimuth: 315 };
}

const SolarSimulator = ({ onCompleteLead }) => {
  // État du parcours (1 à 7 + 6.5 pour chargement)
  const [step, setStep] = useState(1);

  // Étape 1 : Adresse & Coordonnées
  const [addressInput, setAddressInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [coords, setCoords] = useState({ lat: 44.757, lng: -0.739 }); // Défaut (Saint-Jean-d'Illac / Bordeaux area)
  const [mapZoom, setMapZoom] = useState(19);

  // Étape 2 : Positionnement repère centre carte
  const [centerCoords, setCenterCoords] = useState({ lat: 44.757, lng: -0.739 });

  // Étape 3 : Quadrilatère toiture & calcul surface
  const [roofCorners, setRoofCorners] = useState([]);
  const [surfaceM2, setSurfaceM2] = useState(49);

  // Étape 4 : Orientation toiture (sélection arête haute)
  const [selectedEdgeIndex, setSelectedEdgeIndex] = useState(0); // 0, 1, 2, 3
  const [orientation, setOrientation] = useState({ text: "Sud-Ouest", code: "SO" });

  // Étape 5 : Inclinaison toiture (0, 15, 30, 45)
  const [inclination, setInclination] = useState(30);

  // Étape 6 : Consommation (kWh/an ou €/an) & Véhicules électriques
  const [consumptionType, setConsumptionType] = useState('kwh'); // 'kwh' ou 'euro'
  const [consumptionKwh, setConsumptionKwh] = useState(6000);
  const [consumptionEuros, setConsumptionEuros] = useState(1500);
  const [electricVehicles, setElectricVehicles] = useState(0); // 0, 1, 2, 3

  // Étape 6.5 : Écran de transition / chargement
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Étape 7 : Onglet de puissance sélectionné (3, 6, 9 kWc)
  const [selectedPowerTab, setSelectedPowerTab] = useState(9); // 3, 6, 9

  // Synchronisation adresse lors de la saisie (API Adresse Gouv)
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

  // Sélection d'une adresse suggérée
  const handleSelectSuggestion = (feature) => {
    const label = feature.properties.label;
    const [lng, lat] = feature.geometry.coordinates;
    setAddressInput(label);
    setSelectedAddress(label);
    setCoords({ lat, lng });
    setCenterCoords({ lat, lng });
    setSuggestions([]);
  };

  const handleStartFromStep1 = () => {
    if (!selectedAddress && addressInput) {
      setSelectedAddress(addressInput);
    }
    // Initialiser les 4 coins du quadrilatère autour du point
    const lat = centerCoords.lat;
    const lng = centerCoords.lng;
    const deltaLat = 0.00006;
    const deltaLng = 0.00008;
    setRoofCorners([
      { lat: lat + deltaLat, lng: lng - deltaLng }, // Top Left
      { lat: lat + deltaLat, lng: lng + deltaLng }, // Top Right
      { lat: lat - deltaLat, lng: lng + deltaLng }, // Bottom Right
      { lat: lat - deltaLat, lng: lng - deltaLng }  // Bottom Left
    ]);
    setStep(2);
  };

  // Validation étape 2 : repère fixe
  const handleValidateStep2 = () => {
    // Recentrer les 4 coins autour des nouvelles coordonnées
    const lat = centerCoords.lat;
    const lng = centerCoords.lng;
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
    setStep(3);
  };

  // Mise à jour d'un coin du polygon en drag&drop (Étape 3)
  const handleCornerDrag = (index, newLat, newLng) => {
    const updated = [...roofCorners];
    updated[index] = { lat: newLat, lng: newLng };
    setRoofCorners(updated);
    const newArea = calculatePolygonArea(updated);
    if (newArea > 0) setSurfaceM2(newArea);
  };

  // Validation étape 3 : surface
  const handleValidateStep3 = () => {
    setStep(4);
  };

  // Mise à jour de l'orientation lors du clic sur une arête (Étape 4)
  const handleSelectEdge = (index) => {
    setSelectedEdgeIndex(index);
    const p1 = roofCorners[index];
    const p2 = roofCorners[(index + 1) % roofCorners.length];
    const orient = calculateOrientation([p1, p2], roofCorners);
    setOrientation(orient);
  };

  // Validation étape 4 : orientation
  const handleValidateStep4 = () => {
    setStep(5);
  };

  // Validation étape 5 : inclinaison
  const handleValidateStep5 = () => {
    setStep(6);
  };

  // Validation étape 6 : consommation -> lancement transition 6.5
  const handleValidateStep6 = () => {
    setStep(6.5);
    setLoadingProgress(0);
  };

  // Effet de la barre de progression pour la transition 6.5
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

  // Synchronisation des entrées kWh / Euros
  const handleKwhChange = (val) => {
    const kwh = parseFloat(val) || 0;
    setConsumptionKwh(kwh);
    setConsumptionEuros(Math.round(kwh * 0.25)); // Tarif moyen ~0.25€/kWh
  };

  const handleEurosChange = (val) => {
    const euros = parseFloat(val) || 0;
    setConsumptionEuros(euros);
    setConsumptionKwh(Math.round(euros / 0.25));
  };

  // ==========================================
  // CALCULS PHOTOVOLTAÏQUES ÉTAPE 7
  // ==========================================
  const simulationResults = useMemo(() => {
    // Surface exploitable effective
    const exploitableSurface = Math.max(15, surfaceM2);
    // Panneaux installables (1 panneau ~2m² et ~480W)
    const installablePanels = Math.floor(exploitableSurface / 2);
    const installablePowerWatts = installablePanels * 480;

    // Déterminer l'offre préconisée (3, 6 ou 9 kWc)
    let recommendedPower = 3;
    if (consumptionKwh > 7500 || exploitableSurface > 40) recommendedPower = 9;
    else if (consumptionKwh > 4000 || exploitableSurface > 25) recommendedPower = 6;

    // Facteur d'orientation (Sud 100%, SO/SE 95%, O/E 85%, etc.)
    let orientFactor = 0.95;
    if (orientation.code === 'S') orientFactor = 1.0;
    else if (orientation.code === 'SO' || orientation.code === 'SE') orientFactor = 0.95;
    else if (orientation.code === 'O' || orientation.code === 'E') orientFactor = 0.85;
    else orientFactor = 0.75;

    // Facteur d'inclinaison (30° idéal 100%, 15°/45° 96%, 0° 90%)
    let inclFactor = 1.0;
    if (inclination === 30) inclFactor = 1.0;
    else if (inclination === 15 || inclination === 45) inclFactor = 0.96;
    else inclFactor = 0.90;

    // Ensoleillement moyen France (kWh / kWc / an)
    const baseProductionPerKwc = 1250 * orientFactor * inclFactor;

    // Calculs spécifiques pour chaque puissance (3, 6, 9 kWc)
    const getMetricsForPower = (kWc) => {
      const annualProdKwh = Math.round(kWc * baseProductionPerKwc);

      // Taux d'autoconsommation (%) dépendant du profil et véhicules elec
      let autoRate = 0.85;
      if (kWc === 6) autoRate = 0.65;
      if (kWc === 9) autoRate = 0.55;
      if (electricVehicles > 0) autoRate = Math.min(0.95, autoRate + electricVehicles * 0.08);

      const autoconsumedProdKwh = Math.round(annualProdKwh * autoRate);

      // Prix de l'électricité économisée (~0.26€/kWh avec inflation progressive)
      const firstYearSavings = Math.round(autoconsumedProdKwh * 0.26 + (annualProdKwh - autoconsumedProdKwh) * 0.13);

      // Cumuls sur 10, 20, 30 ans avec inflation annuelle de l'électricité (3.5%/an)
      let cum10 = 0, cum20 = 0, cum30 = 0;
      let currentYearSavings = firstYearSavings;
      for (let y = 1; y <= 30; y++) {
        if (y <= 10) cum10 += currentYearSavings;
        if (y <= 20) cum20 += currentYearSavings;
        if (y <= 30) cum30 += currentYearSavings;
        currentYearSavings *= 1.035; // +3.5% augmentation énergie par an
      }

      // Nombre de panneaux et surface occupée
      const panelsCount = kWc === 3 ? "6 à 8" : kWc === 6 ? "12 à 16" : "18 à 24";
      const surfaceOccupied = kWc === 3 ? 15 : kWc === 6 ? 30 : 45;

      // Coût d'installation moyen et temps d'amortissement
      const costMap = { 3: 5999, 6: 8999, 9: 11499 };
      const cost = costMap[kWc];
      const paybackYears = (cost / firstYearSavings).toFixed(1);

      // Pourcentage d'économies sur la facture annuelle
      const billSavingsPct = Math.min(100, Math.round((firstYearSavings / (consumptionEuros || 1500)) * 100));

      // Impact écologique
      const co2AvoidedKg = Math.round(annualProdKwh * 0.5); // ~0.5kg CO2 par kWh solaire en mix français évité
      const treesPlanted = Math.round(co2AvoidedKg / 350); // ~350kg/an par arbre mature
      const foyersEquiv = (annualProdKwh / 4500).toFixed(1); // 4500 kWh par foyer moyen

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

  // Transmettre les résultats au formulaire de contact si demandé
  const handleRequestFullStudy = () => {
    if (onCompleteLead) {
      onCompleteLead({
        address: selectedAddress || addressInput,
        surfaceM2,
        orientation: orientation.text,
        inclination,
        consumptionKwh,
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

  return (
    <div id="simulateur-solaire" className="w-full max-w-5xl mx-auto my-8 bg-white rounded-3xl shadow-[0_20px_60px_rgba(15,40,71,0.08)] border border-gray-100 overflow-hidden font-sans">
      
      {/* BARRE DE PROGRESSION EN TÊTE (Étapes 1, 2, 3) */}
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

          {/* ========================================================= */}
          {/* ÉTAPE 1 : SAISIE DE L'ADRESSE POSTALE                      */}
          {/* ========================================================= */}
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

                {/* Suggestions autocomplétion */}
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
                    <div className="px-3 py-1.5 bg-gray-50 text-right text-[10px] text-gray-400">
                      propulsé par BAN / data.gouv.fr
                    </div>
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

          {/* ========================================================= */}
          {/* ÉTAPE 2 : PLACEMENT DU REPÈRE SUR LA TOITURE              */}
          {/* ========================================================= */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="text-center">
              <h3 className="text-2xl font-bold text-[#0f2847] mb-2 flex items-center justify-center space-x-2">
                <span>Repérons votre toiture</span>
                <Info className="w-5 h-5 text-[#0f9b8e]" />
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Faites glisser la carte pour positionner votre toiture sous le curseur vert
              </p>

              <div className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner mb-6">
                <MapContainer center={[coords.lat, coords.lng]} zoom={mapZoom} scrollWheelZoom={false} className="w-full h-full">
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="&copy; Esri World Imagery"
                    maxZoom={20}
                  />
                  <MapRecenter center={[coords.lat, coords.lng]} zoom={mapZoom} />
                  <MapEventsHandler setCenterCoords={setCenterCoords} step={step} />
                </MapContainer>

                {/* Marqueur fixe vert au centre de la carte */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none drop-shadow-lg">
                  <div className="w-8 h-8 rounded-full bg-[#10b981] border-4 border-white shadow-xl flex items-center justify-center animate-bounce">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
              </div>

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

          {/* ========================================================= */}
          {/* ÉTAPE 3 : DÉFINITION DE LA TOITURE (4 COINS & SURFACE)     */}
          {/* ========================================================= */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="text-center">
              <h3 className="text-2xl font-bold text-[#0f2847] mb-2 flex items-center justify-center space-x-2">
                <span>Calculons la surface de votre toiture</span>
                <Info className="w-5 h-5 text-[#0f9b8e]" />
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Déplacez les 4 coins vert fluo du pan de votre toiture pouvant accueillir des panneaux photovoltaïques
              </p>

              <div className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner mb-6">
                <MapContainer center={[centerCoords.lat, centerCoords.lng]} zoom={19} scrollWheelZoom={false} className="w-full h-full">
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="&copy; Esri World Imagery"
                    maxZoom={20}
                  />

                  {/* Polygoon affiché avec remplissage vert translucent */}
                  {roofCorners.length === 4 && (
                    <Polygon
                      positions={roofCorners.map(c => [c.lat, c.lng])}
                      pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.35, weight: 3 }}
                    />
                  )}

                  {/* Poignées de coin déplaçables */}
                  {roofCorners.map((corner, idx) => (
                    <Marker
                      key={idx}
                      position={[corner.lat, corner.lng]}
                      icon={handleIcon}
                      draggable={true}
                      eventHandlers={{
                        drag: (e) => {
                          const latLng = e.target.getLatLng();
                          handleCornerDrag(idx, latLng.lat, latLng.lng);
                        }
                      }}
                    />
                  ))}
                </MapContainer>
              </div>

              {/* Affichage dynamique de la surface calculée */}
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

          {/* ========================================================= */}
          {/* ÉTAPE 4 : ORIENTATION DE LA TOITURE (CLIC ARÊTE HAUTE)    */}
          {/* ========================================================= */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="text-center">
              <h3 className="text-2xl font-bold text-[#0f2847] mb-2 flex items-center justify-center space-x-2">
                <span>Déterminons l'orientation de votre toiture</span>
                <Info className="w-5 h-5 text-[#0f9b8e]" />
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Cliquez sur le côté le plus haut de votre toiture (le faîtage)
              </p>

              <div className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner mb-6">
                <MapContainer center={[centerCoords.lat, centerCoords.lng]} zoom={19} scrollWheelZoom={false} className="w-full h-full">
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="&copy; Esri World Imagery"
                    maxZoom={20}
                  />

                  {/* Polygon de base en vert */}
                  <Polygon
                    positions={roofCorners.map(c => [c.lat, c.lng])}
                    pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2, weight: 2 }}
                  />

                  {/* Affichage des 4 arêtes avec possibilité d'en cliquer une */}
                  {roofCorners.map((corner, i) => {
                    const nextCorner = roofCorners[(i + 1) % roofCorners.length];
                    const isSelected = selectedEdgeIndex === i;
                    return (
                      <Polyline
                        key={i}
                        positions={[[corner.lat, corner.lng], [nextCorner.lat, nextCorner.lng]]}
                        pathOptions={{
                          color: isSelected ? '#ef4444' : '#10b981',
                          weight: isSelected ? 6 : 3,
                          opacity: 1
                        }}
                        eventHandlers={{
                          click: () => handleSelectEdge(i)
                        }}
                      />
                    );
                  })}
                </MapContainer>
              </div>

              {/* Résultat d'orientation */}
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

          {/* ========================================================= */}
          {/* ÉTAPE 5 : INCLINAISON DE LA TOITURE                       */}
          {/* ========================================================= */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="text-center max-w-xl mx-auto py-4">
              <h3 className="text-2xl font-bold text-[#0f2847] mb-6">
                Quelle est l'inclinaison de votre toiture ?
              </h3>

              {/* Visuel stylisé de toit */}
              <div className="w-full h-32 mb-8 flex items-center justify-center">
                <svg className="w-64 h-32 text-[#0f9b8e]" viewBox="0 0 200 100" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M 20 80 L 100 20 L 180 80" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 30 72.5 L 90 27.5 L 90 72.5 Z" fill="#0f9b8e" fillOpacity="0.15" strokeDasharray="3 3" />
                  <line x1="20" y1="80" x2="180" y2="80" stroke="#cbd5e1" strokeWidth="2" />
                </svg>
              </div>

              {/* Boutons d'inclinaison */}
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

              <p className="text-xs text-gray-500 mb-8 bg-gray-50 p-3 rounded-lg border border-gray-100">
                Si vous ne connaissez pas l'inclinaison exacte de votre toiture, choisissez <strong>30°</strong>. Il s'agit de la construction la plus courante en France.
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

          {/* ========================================================= */}
          {/* ÉTAPE 6 : CONSOMMATION ÉLECTRIQUE ET VÉHICULES ÉLECTRIQUES */}
          {/* ========================================================= */}
          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="text-center max-w-xl mx-auto py-4">
              <h3 className="text-2xl font-bold text-[#0f2847] mb-6">
                Quelle est votre consommation d'électricité ?
              </h3>

              {/* Saisie en kWh ou en Euros */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Je connais ma consommation en kWh :
                  </label>
                  <div className="flex items-center justify-center max-w-xs mx-auto border border-gray-300 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#0f9b8e]">
                    <input
                      type="number"
                      value={consumptionKwh}
                      onChange={(e) => handleKwhChange(e.target.value)}
                      className="w-full px-4 py-3 text-center text-xl font-bold outline-none text-gray-800"
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
                      className="w-full px-4 py-3 text-center text-xl font-bold outline-none text-gray-800"
                    />
                    <span className="bg-[#0f9b8e] text-white font-bold px-4 py-3 text-sm">
                      € / an
                    </span>
                  </div>
                </div>
              </div>

              {/* Nombre de véhicules électriques */}
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

          {/* ========================================================= */}
          {/* ÉTAPE 6.5 : ÉCRAN DE CHARGEMENT ET D'AJUSTEMENT             */}
          {/* ========================================================= */}
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

          {/* ========================================================= */}
          {/* ÉTAPE 7 : RÉSULTATS DE LA SIMULATION                      */}
          {/* ========================================================= */}
          {step === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">

              {/* Tête de fiche résultat */}
              <div className="text-center border-b border-gray-100 pb-6">
                <h2 className="text-3xl font-extrabold text-[#0f2847] mb-2">Résultats de votre simulation</h2>
                {selectedAddress && (
                  <p className="text-sm text-gray-500 flex items-center justify-center space-x-1">
                    <MapPin className="w-4 h-4 text-[#0f9b8e]" />
                    <span>{selectedAddress}</span>
                  </p>
                )}
              </div>

              {/* 1. Synthèse du potentiel de toiture */}
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

              {/* 2. Bandeau de préconisation & Onglets de puissance */}
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

              {/* 3. Section Économies & Caractéristiques clés */}
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

                {/* Maison et badges informations */}
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

                {/* Détail de la production et taux d'autoconsommation */}
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

                {/* Projection Économies Cumulées sur 10, 20, 30 ans */}
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

                {/* Impact environnemental */}
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

              {/* Boutons d'action finaux */}
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
