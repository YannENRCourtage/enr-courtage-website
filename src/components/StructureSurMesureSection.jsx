import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Search, CheckCircle2, ArrowRight, ArrowLeft, Sun, Zap, 
  Leaf, Home, ShieldCheck, Sparkles, Building, DollarSign, TrendingUp, 
  Clock, Wallet, RotateCcw, Compass, Check, PhoneCall, FileText, Send, Move, Percent
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ConfigurateurCharpente from '@/components/ConfigurateurCharpente';
import { useConfiguratorValues } from '@/stores/useConfiguratorStore';
import { useToast } from '@/components/ui/use-toast';
import ecoEvoData from '../data/ecoEvoBuildings.json';

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mrblwazb";

// Solar Pricing Schedule based on PJ 5 table (identical to ConfigurateurCharpente)
function getSolarPriceHT(kwc) {
  if (!kwc || kwc <= 0) return 0;
  const wc = kwc * 1000;
  let rateHT = 0.76;
  if (kwc <= 36) rateHT = 1.05;
  else if (kwc <= 99.99) rateHT = 0.98;
  else if (kwc <= 249.99) rateHT = 0.92;
  else if (kwc <= 499.99) rateHT = 0.86;
  else if (kwc <= 999.99) rateHT = 0.79;

  return Math.round(wc * rateHT);
}

// Regional solar productible factor (kWh/kWc)
function getRegionalProductible(addressStr) {
  if (!addressStr) return 1150;
  const match = addressStr.match(/\b(\d{5})\b/);
  const dept = match ? match[1].substring(0, 2) : '';

  if (['04', '05', '06', '13', '83', '84', '20', '2A', '2B'].includes(dept)) return 1250;
  if (['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81', '82', '16', '17', '33', '40', '47', '64'].includes(dept)) return 1180;
  if (['22', '29', '35', '56', '44', '49', '53', '72', '85', '18', '28', '36', '37', '41', '45'].includes(dept)) return 1100;
  if (['14', '27', '50', '61', '76', '75', '77', '78', '91', '92', '93', '94', '95', '08', '51', '52', '54', '55', '57', '67', '68', '88', '59', '62'].includes(dept)) return 1050;

  return 1150;
}

// Orientation efficiency multiplier with angle in range [-180°, 180°]
function getOrientationMultiplier(deg) {
  const absDeg = Math.abs(deg);
  if (absDeg <= 30) return 1.0; // Sud Plein (0° ± 30°)
  if (absDeg > 30 && absDeg <= 65) return 0.96; // Sud-Est (-45°) / Sud-Ouest (45°)
  if (absDeg > 65 && absDeg <= 115) return 0.88; // Est (-90°) / Ouest (90°)
  return 0.68; // Nord (180° / -180°)
}

// Cardinal direction label helper
function getCardinalLabel(deg) {
  if (deg >= -22.5 && deg <= 22.5) return 'Sud Plein (0°) - Idéal ☀️';
  if (deg > 22.5 && deg <= 67.5) return 'Sud-Ouest (45°)';
  if (deg > 67.5 && deg <= 112.5) return 'Ouest (90°)';
  if (deg > 112.5 && deg <= 157.5) return 'Nord-Ouest (135°)';
  if (deg < -157.5 || deg > 157.5) return 'Nord (180°)';
  if (deg >= -157.5 && deg < -112.5) return 'Nord-Est (-135°)';
  if (deg >= -112.5 && deg < -67.5) return 'Est (-90°)';
  if (deg >= -67.5 && deg < -22.5) return 'Sud-Est (-45°)';
  return `${deg}°`;
}

// ==========================================
// COMPOSANT GRAPHIQUE 30 ANS
// ==========================================
function CumulativeRevenuesBarChart({ annualProductionKwh, tariffPerKwh = 0.125, paybackYears, installationCostHT }) {
  const pbYearFloat = typeof paybackYears === 'number' ? paybackYears : parseFloat(paybackYears) || 0;

  const getCumulAtYear = (targetYear) => {
    let sum = 0;
    for (let y = 1; y <= targetYear; y++) {
      const yrTariff = y <= 20 ? tariffPerKwh : tariffPerKwh * 0.85;
      sum += annualProductionKwh * yrTariff;
    }
    return Math.round(sum);
  };

  const cum10 = getCumulAtYear(10).toLocaleString('fr-FR');
  const cum20 = getCumulAtYear(20).toLocaleString('fr-FR');
  const cum30 = getCumulAtYear(30).toLocaleString('fr-FR');

  const data = useMemo(() => {
    const list = [];
    let sum = 0;
    for (let y = 1; y <= 30; y++) {
      const yrTariff = y <= 20 ? tariffPerKwh : tariffPerKwh * 0.85;
      sum += annualProductionKwh * yrTariff;
      list.push({ year: y, cumRevenue: Math.round(sum) });
    }
    return list;
  }, [annualProductionKwh, tariffPerKwh]);

  const maxVal = data.length > 0 ? data[data.length - 1].cumRevenue : 1;
  const targetYears = [1, 5, 10, 15, 20, 25, 30];

  return (
    <div className="bg-[#0f2847] text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800 space-y-6">
      
      {/* Header */}
      <div>
        <h4 className="text-xl font-black text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#84cc16]" /> Revenus cumulés de la revente d'électricité
        </h4>
        <p className="text-slate-300 text-xs mt-1">Projection sur 30 ans du chiffre d'affaires cumulé généré par votre centrale photovoltaïque</p>
      </div>

      {/* Cartes de synthèse à 10, 20 et 30 ans */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
          <p className="text-xs text-slate-400 mb-1 font-semibold">sur 10 ans</p>
          <p className="text-xl sm:text-2xl font-extrabold text-[#84cc16]">{cum10} €</p>
        </div>
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
          <p className="text-xs text-slate-400 mb-1 font-semibold">sur 20 ans</p>
          <p className="text-xl sm:text-2xl font-extrabold text-[#84cc16]">{cum20} €</p>
        </div>
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
          <p className="text-xs text-slate-400 mb-1 font-semibold">sur 30 ans</p>
          <p className="text-xl sm:text-2xl font-extrabold text-[#84cc16]">{cum30} €</p>
        </div>
      </div>

      {/* Graphique de Barres en Histogramme avec ligne d'amortissement */}
      <div className="relative h-64 w-full pt-8 pb-0">
        <div className="absolute left-6 right-2 bottom-0 h-px bg-slate-600 z-0"></div>

        {/* Ligne d'amortissement rouge pointillée avec badge d'année ROI */}
        {pbYearFloat > 0 && pbYearFloat <= 30 && (
          <div 
            className="absolute top-0 bottom-0 border-l-2 border-dashed border-[#ef4444] z-20 pointer-events-none"
            style={{ left: `calc(1.5rem + (100% - 2rem) * ${pbYearFloat / 30})` }}
          >
            <div className="absolute -top-7 -translate-x-1/2 bg-[#ef4444] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
              Amorti en {paybackYears} ans
            </div>
          </div>
        )}

        <div className="flex items-end justify-between h-full pl-6 pr-2 relative z-10">
          {data.map((d) => {
            const heightPct = Math.min(100, Math.max(1, (d.cumRevenue / maxVal) * 100));
            const isAmortized = pbYearFloat > 0 && d.year >= pbYearFloat;

            return (
              <div key={d.year} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                {/* Tooltip au survol */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 bg-slate-900 text-white text-[11px] font-bold py-1.5 px-2.5 rounded-lg border border-slate-700 whitespace-nowrap z-30 pointer-events-none shadow-xl">
                  Année {d.year} : +{d.cumRevenue.toLocaleString('fr-FR')} €
                </div>

                <div 
                  className={`w-[75%] max-w-[14px] rounded-t-md transition-all duration-300 group-hover:scale-110 ${isAmortized ? 'bg-[#10b981] group-hover:bg-[#34d399]' : 'bg-[#3b82f6] group-hover:bg-[#60a5fa]'}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Axe des ordonnées / Repères d'Années */}
      <div className="w-full h-px bg-slate-600 mt-2 mb-2"></div>
      <div className="flex justify-between pl-6 pr-2 text-xs font-bold text-slate-300">
        {targetYears.map((yr) => (
          <div key={yr} className="text-center w-6">
            {yr}
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="flex justify-center gap-6 text-xs text-slate-300 mt-5 border-t border-slate-700/60 pt-3 flex-wrap">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-[#3b82f6] inline-block"></span>
          <span>Amortissement en cours</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-[#10b981] inline-block"></span>
          <span>Bénéfices nets (Post ROI)</span>
        </span>
      </div>
    </div>
  );
}

export default function StructureSurMesureSection() {
  const { toast } = useToast();
  const config = useConfiguratorValues();

  // Step state (1: Adresse, 2: Implantation & Orientation, 3: Rentabilité & Faisabilité)
  const [step, setStep] = useState(1);

  // Address Geocoding state
  const [addressInput, setAddressInput] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('13001 Marseille, France');
  const [coords, setCoords] = useState({ lat: 43.2965, lng: 5.3698 });
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Orientation State in range [-180°, 180°] (Default 0° = Plein Sud)
  const [orientationDeg, setOrientationDeg] = useState(0);

  // Map & Polygon Leaflet Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const ridgeLineLayerRef = useRef(null);

  // Form Lead State
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [leadForm, setLeadForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    societe: '',
    commentaire: ''
  });

  // Building Footprint Dimensions & Extension widths from 3D Configurator state
  const getExtWidth = (side) => {
    if (side === 'appentis') return 9.3;
    if (side === 'auvent') return 4.0;
    return 0;
  };
  const leftExtW = getExtWidth(config.leftSide);
  const rightExtW = getExtWidth(config.rightSide);
  const mainWidth = config.width;
  const totalWidth = mainWidth + leftExtW + rightExtW;
  const totalLength = config.length || 37.5;
  const totalSurface = Math.round(totalWidth * totalLength);

  // Solar kWc from 3D configurator state
  const installedKwc = useMemo(() => {
    if (config.hasSolar && config.solarStats?.power) {
      return config.solarStats.power;
    }
    return Math.round((totalSurface / 2.38) * 0.465 * 100) / 100;
  }, [config.hasSolar, config.solarStats, totalSurface]);

  // Financial & Solar Calculations
  const productibleBase = useMemo(() => getRegionalProductible(selectedAddress), [selectedAddress]);
  const orientationFactor = useMemo(() => getOrientationMultiplier(orientationDeg), [orientationDeg]);

  const annualProductionKwh = useMemo(() => {
    return Math.round(installedKwc * productibleBase * orientationFactor);
  }, [installedKwc, productibleBase, orientationFactor]);

  // EDF OA Tariff
  const edfOaTariff = 0.125;
  const annualSolarRevenue = useMemo(() => {
    return Math.round(annualProductionKwh * edfOaTariff);
  }, [annualProductionKwh]);

  // Exact Structure & Solar Cost Calculation matching ConfigurateurCharpente.jsx TOTAL HT
  const estimatedInvestmentHT = useMemo(() => {
    const matchedBuilding = ecoEvoData.find(b => Math.abs(b.width - config.width) <= 0.8 && Math.abs(b.length - totalLength) <= 0.8);
    let basePrice = matchedBuilding ? matchedBuilding.price_ht : Math.round(totalSurface * 110);
    if (leftExtW > 0) basePrice += Math.round(totalLength * leftExtW * (config.leftSide === 'auvent' ? 55 : 75));
    if (rightExtW > 0) basePrice += Math.round(totalLength * rightExtW * (config.rightSide === 'auvent' ? 55 : 75));
    const charpentePriceHT = Math.round(basePrice);

    const solarPowerKwc = config.hasSolar ? installedKwc : 0;
    const solarPriceHT = getSolarPriceHT(solarPowerKwc);

    return charpentePriceHT + (config.hasSolar ? solarPriceHT : 0);
  }, [config.width, config.leftSide, config.rightSide, config.hasSolar, installedKwc, totalLength, totalSurface, leftExtW, rightExtW]);

  // Taux de placement financier (ROI Yield %)
  const financialPlacementRate = useMemo(() => {
    if (estimatedInvestmentHT <= 0) return '9.5';
    return ((annualSolarRevenue / estimatedInvestmentHT) * 100).toFixed(1);
  }, [annualSolarRevenue, estimatedInvestmentHT]);

  const roiYears = useMemo(() => {
    if (annualSolarRevenue <= 0) return 10;
    return Math.round((estimatedInvestmentHT / annualSolarRevenue) * 10) / 10;
  }, [estimatedInvestmentHT, annualSolarRevenue]);

  // Environmental Impact Stats
  const co2AvoidedTonnes = useMemo(() => (Math.round((annualProductionKwh * 0.09) / 1000 * 10) / 10).toFixed(1), [annualProductionKwh]);
  const treesPlanted = useMemo(() => Math.round(co2AvoidedTonnes * 45), [co2AvoidedTonnes]);
  const householdsPowered = useMemo(() => (Math.round(annualProductionKwh / 3500 * 10) / 10).toFixed(1), [annualProductionKwh]);

  // BAN Geocoding Search
  const handleAddressSearch = async (query) => {
    setAddressInput(query);
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    setIsSearchingAddress(true);
    try {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      if (data && data.features) {
        setAddressSuggestions(data.features);
      }
    } catch (err) {
      console.error("Erreur geocoding BAN:", err);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const selectAddress = (feature) => {
    const label = feature.properties.label;
    const [lng, lat] = feature.geometry.coordinates;
    setSelectedAddress(label);
    setAddressInput(label);
    setCoords({ lat, lng });
    setAddressSuggestions([]);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 19);
    }
  };

  // Initialize & Update Leaflet Satellite Map on Step 2
  useEffect(() => {
    if (step !== 2) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [coords.lat, coords.lng],
          zoom: 19,
          maxZoom: 22,
          zoomControl: true,
          doubleClickZoom: false
        });

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Esri, Maxar, Earthstar Geographics',
          maxNativeZoom: 19,
          maxZoom: 22
        }).addTo(map);

        map.on('move', () => {
          const center = map.getCenter();
          setCoords({ lat: center.lat, lng: center.lng });
        });

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.setView([coords.lat, coords.lng], mapInstanceRef.current.getZoom() || 19);
      }

      const map = mapInstanceRef.current;

      // Remove existing layers
      if (polygonLayerRef.current) map.removeLayer(polygonLayerRef.current);
      if (ridgeLineLayerRef.current) map.removeLayer(ridgeLineLayerRef.current);

      // ==========================================
      // NON-DISTORTING CARTESIAN ROTATION MATH
      // Invert angle sign for visual rendering so Sud-Ouest (45°) tilts in the exact direction requested in Image 5!
      // ==========================================
      const halfL = totalLength / 2; // meters along length (East-West at 0°)
      const halfW = totalWidth / 2;  // meters along width (North-South at 0°)

      const mapRad = (-orientationDeg * Math.PI) / 180;
      const cosR = Math.cos(mapRad);
      const sinR = Math.sin(mapRad);

      // Base corners in pure 2D Cartesian meters
      const baseCornersMeters = [
        { x: -halfL, y: -halfW },
        { x: halfL, y: -halfW },
        { x: halfL, y: halfW },
        { x: -halfL, y: halfW }
      ];

      // Rotate 2D Cartesian meter coordinates
      const rotatedMeters = baseCornersMeters.map(c => ({
        x: c.x * cosR - c.y * sinR,
        y: c.x * sinR + c.y * cosR
      }));

      // Convert local Cartesian meters to Geodetic WGS84 Lat/Lng
      const R_EARTH = 6378137;
      const latRad = (coords.lat * Math.PI) / 180;
      const metersPerLatDegree = (Math.PI / 180) * R_EARTH;
      const metersPerLngDegree = (Math.PI / 180) * R_EARTH * Math.cos(latRad);

      const rotatedCorners = rotatedMeters.map(c => [
        coords.lat + (c.y / metersPerLatDegree),
        coords.lng + (c.x / metersPerLngDegree)
      ]);

      // Render exact 90° building footprint polygon
      const polygon = L.polygon(rotatedCorners, {
        color: '#2563eb',
        weight: 3,
        fillColor: '#3b82f6',
        fillOpacity: 0.45
      }).addTo(map);

      // Tooltip placed cleanly BELOW the building (direction: 'bottom')
      polygon.bindTooltip(`<b>${totalLength.toFixed(1)}m × ${totalWidth.toFixed(1)}m</b><br/>Surface: ${totalSurface} m²`, {
        permanent: true,
        direction: 'bottom',
        offset: [0, 15],
        className: 'bg-white/95 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-slate-300'
      });

      // ==========================================
      // ACCURATE ASYMMETRIC RIDGE LINE OFFSET MATH
      // ==========================================
      let ridgeRatioInMain = 0.5;
      if (config.buildingType === 'asymetrique_1') ridgeRatioInMain = 0.33;
      else if (config.buildingType === 'asymetrique_2') ridgeRatioInMain = 0.67;

      const ridgeYFromBottom = leftExtW + (mainWidth * ridgeRatioInMain);
      const ridgeLocalY = ridgeYFromBottom - halfW;

      const ridgeStartMeter = { x: -halfL, y: ridgeLocalY };
      const ridgeEndMeter = { x: halfL, y: ridgeLocalY };

      const rStartRot = {
        x: ridgeStartMeter.x * cosR - ridgeStartMeter.y * sinR,
        y: ridgeStartMeter.x * sinR + ridgeStartMeter.y * cosR
      };
      const rEndRot = {
        x: ridgeEndMeter.x * cosR - ridgeEndMeter.y * sinR,
        y: ridgeEndMeter.x * sinR + ridgeEndMeter.y * cosR
      };

      const ridgeStartLatLng = [
        coords.lat + (rStartRot.y / metersPerLatDegree),
        coords.lng + (rStartRot.x / metersPerLngDegree)
      ];
      const ridgeEndLatLng = [
        coords.lat + (rEndRot.y / metersPerLatDegree),
        coords.lng + (rEndRot.x / metersPerLngDegree)
      ];

      const ridgeLine = L.polyline([ridgeStartLatLng, ridgeEndLatLng], {
        color: '#f59e0b',
        weight: 3,
        dashArray: '6, 6'
      }).addTo(map);

      ridgeLine.bindTooltip('<b>--- Faîtage du bâtiment ---</b>', {
        permanent: false,
        direction: 'top',
        className: 'bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm'
      });

      polygonLayerRef.current = polygon;
      ridgeLineLayerRef.current = ridgeLine;
    }, 60);

    return () => clearTimeout(timer);

  }, [step, coords, totalWidth, totalLength, totalSurface, mainWidth, leftExtW, rightExtW, config.buildingType, orientationDeg]);

  // Lead Form submission
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      const payload = {
        ...leadForm,
        projet: 'Structure métallique sur-mesure (Rentabilité & Faisabilité)',
        adresse: selectedAddress,
        orientation: getCardinalLabel(orientationDeg),
        dimensions: `${totalLength.toFixed(1)}m x ${totalWidth.toFixed(1)}m (${totalSurface}m²)`,
        puissanceKwc: installedKwc,
        productionKwh: annualProductionKwh,
        renteAnnuelle: annualSolarRevenue,
        tauxPlacement: `${financialPlacementRate}% / an`,
        investissementEst: estimatedInvestmentHT
      };

      await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setFormSubmitted(true);
      toast({
        title: "Demande d'étude envoyée avec succès !",
        description: "Un conseiller ENR COURTAGE prendra contact avec vous sous 24h à 48h.",
      });
    } catch (err) {
      toast({
        title: "Erreur d'envoi",
        description: "Un problème est survenu. Veuillez réétayer ou nous contacter directement par téléphone.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen">
      
      {/* HERO SECTION WITH VIDEO BACKGROUND */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-[#0f2847]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60 scale-105"
            src="/1.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f2847]/70 via-[#0f2847]/60 to-[#0f2847]/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Votre structure métallique <span className="enr-gradient-text-gold">sur-mesure</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto font-light leading-relaxed mb-4">
              Configurez votre bâtiment en 3D, simulez son implantation satellite sur votre terrain et découvrez son étude de faisabilité et de rentabilité solaire.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 1: 3D CONFIGURATOR MODULE */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ConfigurateurCharpente hideHeader={true} />
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE SIMULATION TUNNEL */}
      <section id="tunnel-faisabilite" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Tunnel Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f2847] tracking-tight mb-3">
              Étude de faisabilité & <span className="enr-gradient-text-gold">Rentabilité Solaire</span>
            </h2>
            <p className="text-gray-600 text-base">
              Renseignez l'adresse de votre terrain pour simuler la disposition satellite exacte de votre bâtiment ({totalLength.toFixed(1)}m × {totalWidth.toFixed(1)}m) et calculer vos revenus photovoltaïques.
            </p>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-8">
              {[
                { num: 1, label: '1. Adresse' },
                { num: 2, label: '2. Emplacement & Orientation' },
                { num: 3, label: '3. Rentabilité & Faisabilité' }
              ].map(s => (
                <button
                  key={s.num}
                  onClick={() => setStep(s.num)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${
                    step === s.num
                      ? 'bg-[#0f2847] text-white border-[#0f2847] shadow-lg scale-105'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-extrabold ${step === s.num ? 'bg-[#d4a843] text-[#0f2847]' : 'bg-gray-200 text-gray-700'}`}>
                    {s.num}
                  </span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* STEP CONTENT CONTAINER */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden p-6 sm:p-10">
            
            {/* STEP 1: ADDRESS SEARCH */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="max-w-2xl mx-auto space-y-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0f2847]">Où se situe votre bâtiment ou terrain ?</h3>
                  <p className="text-gray-500 text-sm">Entrez la commune, le code postal ou l'adresse précise du terrain d'accueil.</p>

                  <div className="relative text-left">
                    <div className="relative flex items-center">
                      <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={addressInput}
                        onChange={(e) => handleAddressSearch(e.target.value)}
                        placeholder="Ex: 52 Rue de la Victoire, Paris ou Rue de la Paix, Lyon..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#0f2847] focus:ring-4 focus:ring-blue-100 outline-none text-base font-semibold text-gray-900 transition-all shadow-sm"
                      />
                    </div>

                    {/* BAN Autocomplete Dropdown */}
                    {addressSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden divide-y divide-gray-100">
                        {addressSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectAddress(item)}
                            className="p-3.5 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-3 text-sm text-gray-700 font-medium"
                          >
                            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span>{item.properties.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-[#0f2847] hover:bg-[#1a3a5c] text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 text-base"
                  >
                    <span>Valider l'adresse & passer à l'orientation</span>
                    <ArrowRight className="w-5 h-5 text-[#d4a843]" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SATELLITE MAP */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                  
                  {/* Left Controls */}
                  <div className="lg:col-span-1 space-y-6">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#0f2847] mb-2">Implantation Satellite</h3>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        L'emprise (<strong>{totalLength.toFixed(1)}m × {totalWidth.toFixed(1)}m – {totalSurface} m²</strong>) reste au centre. Déplacez la carte ci-contre pour caler votre parcelle sous le bâtiment. Le trait pointillé orange représente le <strong>faîtage</strong>.
                      </p>
                    </div>

                    {/* Orientation Slider (Range [-180°, 180°], 0° = Sud Plein) */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200 space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                        <span className="flex items-center gap-1.5"><Compass className="w-4 h-4 text-blue-600" /> Orientation</span>
                        <span className="text-blue-600 text-sm font-extrabold">{orientationDeg}°</span>
                      </div>

                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        value={orientationDeg}
                        onChange={(e) => setOrientationDeg(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0f2847]"
                      />

                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 text-center text-xs font-bold text-blue-900">
                        {getCardinalLabel(orientationDeg)}
                      </div>

                      {/* Quick preset buttons (Sud = 0°, Sud-Est = -45°, Sud-Ouest = 45°) */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { label: 'Sud (0°)', val: 0 },
                          { label: 'Sud-Est (-45°)', val: -45 },
                          { label: 'Sud-Ouest (45°)', val: 45 }
                        ].map(preset => (
                          <button
                            key={preset.val}
                            onClick={() => setOrientationDeg(preset.val)}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-all ${
                              orientationDeg === preset.val ? 'bg-[#0f2847] text-white border-[#0f2847]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Summary of Footprint Specs */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                      <div className="font-bold text-[#0f2847] border-b pb-1.5">Spécifications Charpente :</div>
                      <div className="flex justify-between text-gray-600"><span>Type :</span><strong className="text-gray-900">{config.buildingType}</strong></div>
                      <div className="flex justify-between text-gray-600"><span>Emprise :</span><strong className="text-gray-900">{totalLength.toFixed(1)}m × {totalWidth.toFixed(1)}m</strong></div>
                      <div className="flex justify-between text-gray-600"><span>Surface totale :</span><strong className="text-blue-600">{totalSurface} m²</strong></div>
                      <div className="flex justify-between text-gray-600"><span>Puissance Solaire :</span><strong className="text-amber-600">{installedKwc} kWc</strong></div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setStep(1)}
                        className="px-3 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold text-xs flex items-center gap-1"
                      >
                        <ArrowLeft className="w-4 h-4" /> Adresse
                      </button>
                      
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 bg-[#0f2847] hover:bg-[#1a3a5c] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                      >
                        <span>Calculer la rentabilité</span>
                        <ArrowRight className="w-4 h-4 text-[#d4a843]" />
                      </button>
                    </div>
                  </div>

                  {/* Right: Satellite Map Viewer with Fixed Center Footprint */}
                  <div className="lg:col-span-3 h-[520px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg relative" ref={mapContainerRef}>
                    <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur px-3.5 py-2 rounded-xl text-xs font-bold text-gray-800 border border-gray-200 shadow-md flex items-center gap-2">
                      <Move className="w-4 h-4 text-blue-600" /> Glissez la carte pour ajuster l'emplacement de votre parcelle sous le bâtiment
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: FINANCIAL & FEASIBILITY DASHBOARD */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="space-y-10">
                  
                  {/* Dashboard Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Étude de Rentabilité Solaire Validée
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0f2847]">Tableau de Bord Financier & Productible</h3>
                      <p className="text-gray-500 text-xs mt-1">Implantation à {selectedAddress} • Orientation {getCardinalLabel(orientationDeg)}</p>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold text-xs flex items-center gap-2 w-fit"
                    >
                      <RotateCcw className="w-4 h-4" /> Modifier l'orientation
                    </button>
                  </div>

                  {/* 6 KPI CARDS ARRANGED ON 2 NEAT ROWS */}
                  <div className="space-y-4">
                    {/* Row 1: Energy & Solar Revenues */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* KPI 1: Puissance Installable */}
                      <div className="bg-[#0f2847] text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between">
                        <div className="flex justify-between items-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                          <span>Puissance Solaire</span>
                          <Zap className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="mt-3">
                          <div className="text-2xl sm:text-3xl font-black text-amber-400">{installedKwc} <span className="text-xs text-gray-300 font-bold">kWc</span></div>
                          <div className="text-xs text-gray-300 mt-1">{totalSurface} m² de toiture disponible</div>
                        </div>
                      </div>

                      {/* KPI 2: Production Annuelle */}
                      <div className="bg-[#0f2847] text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between">
                        <div className="flex justify-between items-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                          <span>Production Annuelle</span>
                          <Sun className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="mt-3">
                          <div className="text-2xl sm:text-3xl font-black text-white">{annualProductionKwh.toLocaleString('fr-FR')} <span className="text-xs text-gray-300 font-bold">kWh/an</span></div>
                          <div className="text-xs text-emerald-400 mt-1">Rendement {Math.round(orientationFactor * 100)}% ({productibleBase} kWh/kWc)</div>
                        </div>
                      </div>

                      {/* KPI 3: Revenus Solaires Annuels */}
                      <div className="bg-emerald-950 text-white p-5 rounded-2xl shadow-lg border border-emerald-800 flex flex-col justify-between">
                        <div className="flex justify-between items-center text-emerald-300 text-xs font-bold uppercase tracking-wider">
                          <span>Revenus 1ère Année</span>
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="mt-3">
                          <div className="text-2xl sm:text-3xl font-black text-emerald-400">+{annualSolarRevenue.toLocaleString('fr-FR')} <span className="text-xs text-emerald-200 font-bold">€ HT/an</span></div>
                          <div className="text-xs text-emerald-300 mt-1">Garantis 20 ans par EDF OA</div>
                        </div>
                      </div>

                    </div>

                    {/* Row 2: Financial Investment & Returns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* KPI 4: Coût estimé (Synced exactly with TOTAL HT) */}
                      <div className="bg-[#0f2847] text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between">
                        <div className="flex justify-between items-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                          <span>Coût estimé</span>
                          <Wallet className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="mt-3">
                          <div className="text-2xl sm:text-3xl font-black text-purple-300">{estimatedInvestmentHT.toLocaleString('fr-FR')} <span className="text-xs text-purple-200 font-bold">€ HT</span></div>
                          <div className="text-xs text-gray-300 mt-1">Total HT Structure & PV</div>
                        </div>
                      </div>

                      {/* KPI 5: Taux de Placement Financier */}
                      <div className="bg-amber-950 text-white p-5 rounded-2xl shadow-lg border border-amber-800 flex flex-col justify-between">
                        <div className="flex justify-between items-center text-amber-300 text-xs font-bold uppercase tracking-wider">
                          <span>Taux de Rendement</span>
                          <Percent className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="mt-3">
                          <div className="text-2xl sm:text-3xl font-black text-amber-400">{financialPlacementRate} <span className="text-xs text-amber-200 font-bold">% / an</span></div>
                          <div className="text-xs text-amber-300 mt-1">Performance financière intéressante</div>
                        </div>
                      </div>

                      {/* KPI 6: Temps de Retour ROI */}
                      <div className="bg-[#0f2847] text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between">
                        <div className="flex justify-between items-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                          <span>Amortissement (ROI)</span>
                          <Clock className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="mt-3">
                          <div className="text-2xl sm:text-3xl font-black text-white">{roiYears} <span className="text-xs text-gray-300 font-bold">ans</span></div>
                          <div className="text-xs text-emerald-400 mt-1">Amortissement rapide du capital</div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* 30-YEAR RECHARTS FINANCIAL GRAPH */}
                  <CumulativeRevenuesBarChart
                    annualProductionKwh={annualProductionKwh}
                    tariffPerKwh={edfOaTariff}
                    paybackYears={roiYears}
                    installationCostHT={estimatedInvestmentHT}
                  />

                  {/* ENVIRONMENTAL IMPACT SECTION */}
                  <div className="pt-8 mt-10 border-t border-gray-200 text-center">
                    <h4 className="text-lg font-bold text-[#0f2847] mb-6 flex items-center justify-center gap-2">
                      <Leaf className="w-5 h-5 text-emerald-500" />
                      <span>Votre impact sur l'environnement</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">
                        <p className="text-2xl font-black text-emerald-600">{co2AvoidedTonnes} tonnes</p>
                        <p className="text-xs text-gray-600 mt-1">de CO₂ évitées par an</p>
                      </div>
                      <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">
                        <p className="text-2xl font-black text-emerald-600">{treesPlanted}</p>
                        <p className="text-xs text-gray-600 mt-1">arbres plantés par an</p>
                      </div>
                      <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">
                        <p className="text-2xl font-black text-emerald-600">{householdsPowered}</p>
                        <p className="text-xs text-gray-600 mt-1">foyer(s) alimenté(s) en électricité</p>
                      </div>
                    </div>
                  </div>

                  {/* LEAD GENERATION FORM (ENLARGED max-w-4xl & RENAMED TITLE/BUTTON) */}
                  <div id="etude-contact-form" className="bg-gray-50/80 p-6 sm:p-10 rounded-3xl border border-gray-200 text-left max-w-4xl mx-auto mt-10 shadow-sm">
                    <h4 className="text-2xl sm:text-3xl font-extrabold text-[#0f2847] mb-2 text-center">Contactez un expert</h4>
                    <p className="text-xs text-gray-500 mb-8 text-center">Recevez votre étude de faisabilité technique & financière détaillée sous 24h.</p>

                    {formSubmitted ? (
                      <div className="bg-emerald-50 border border-emerald-500 rounded-2xl p-8 text-center space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                        <h5 className="text-2xl font-bold text-emerald-900">Merci {leadForm.prenom} !</h5>
                        <p className="text-gray-700 text-sm">
                          Votre demande d'étude pour le projet à <strong>{selectedAddress}</strong> a bien été enregistrée. Notre équipe d'experts vous recontactera très rapidement.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleLeadSubmit} className="space-y-4 max-w-3xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Nom *</label>
                            <input
                              type="text"
                              required
                              value={leadForm.nom}
                              onChange={(e) => setLeadForm({ ...leadForm, nom: e.target.value })}
                              placeholder="Dupont"
                              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Prénom *</label>
                            <input
                              type="text"
                              required
                              value={leadForm.prenom}
                              onChange={(e) => setLeadForm({ ...leadForm, prenom: e.target.value })}
                              placeholder="Jean"
                              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                            <input
                              type="email"
                              required
                              value={leadForm.email}
                              onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                              placeholder="jean.dupont@exemple.fr"
                              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone *</label>
                            <input
                              type="tel"
                              required
                              value={leadForm.telephone}
                              onChange={(e) => setLeadForm({ ...leadForm, telephone: e.target.value })}
                              placeholder="06 12 34 56 78"
                              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Société / Nom du projet (Optionnel)</label>
                          <input
                            type="text"
                            value={leadForm.societe}
                            onChange={(e) => setLeadForm({ ...leadForm, societe: e.target.value })}
                            placeholder="Nom de votre entreprise, exploitation agricole ou SCI..."
                            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Commentaires / Précisions sur votre terrain</label>
                          <textarea
                            rows={3}
                            value={leadForm.commentaire}
                            onChange={(e) => setLeadForm({ ...leadForm, commentaire: e.target.value })}
                            placeholder="Précisez votre calendrier de projet, caractéristiques du terrain, etc."
                            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                          />
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={isSubmittingForm}
                            className="w-full bg-[#84cc16] hover:bg-[#65a30d] text-white font-black py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-wider"
                          >
                            {isSubmittingForm ? (
                              <span>Envoi en cours...</span>
                            ) : (
                              <>
                                <span>Contactez un expert</span>
                                <Send className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

          </div>
        </div>
      </section>

    </div>
  );
}
