import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Search, CheckCircle2, ArrowRight, ArrowLeft, Sun, Zap, 
  Leaf, Home, ShieldCheck, Sparkles, Building, DollarSign, TrendingUp, 
  Clock, Wallet, RotateCcw, Compass, Check, PhoneCall, FileText, Send, Award
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import ConfigurateurCharpente from '@/components/ConfigurateurCharpente';
import { useConfiguratorValues } from '@/stores/useConfiguratorStore';
import { useToast } from '@/components/ui/use-toast';

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mrblwazb";

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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

// Orientation efficiency multiplier
function getOrientationMultiplier(deg) {
  const angle = ((deg % 360) + 360) % 360;
  // 180° = South (100%)
  if (angle >= 150 && angle <= 210) return 1.0;
  // SE (120-150) or SW (210-240) -> 96%
  if ((angle >= 120 && angle < 150) || (angle > 210 && angle <= 240)) return 0.96;
  // East (90) or West (270) -> 88%
  if ((angle >= 60 && angle < 120) || (angle > 240 && angle <= 300)) return 0.88;
  // North (0 / 360) -> 65%
  return 0.68;
}

// Cardinal direction label helper
function getCardinalLabel(deg) {
  const angle = ((deg % 360) + 360) % 360;
  if (angle >= 337.5 || angle < 22.5) return 'Nord (0°)';
  if (angle >= 22.5 && angle < 67.5) return 'Nord-Est (45°)';
  if (angle >= 67.5 && angle < 112.5) return 'Est (90°)';
  if (angle >= 112.5 && angle < 157.5) return 'Sud-Est (135°)';
  if (angle >= 157.5 && angle < 202.5) return 'Sud Plein (180°) - Idéal ☀️';
  if (angle >= 202.5 && angle < 247.5) return 'Sud-Ouest (225°)';
  if (angle >= 247.5 && angle < 292.5) return 'Ouest (270°)';
  return 'Nord-Ouest (315°)';
}

export default function StructureSurMesureSection() {
  const { toast } = useToast();
  const config = useConfiguratorValues();

  // Step state (1: Address, 2: Map & Orientation, 3: Results & Financial Study)
  const [step, setStep] = useState(1);

  // Address Geocoding state
  const [addressInput, setAddressInput] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('13001 Marseille, France');
  const [coords, setCoords] = useState({ lat: 43.2965, lng: 5.3698 });
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Orientation State (Degrees 0 to 360)
  const [orientationDeg, setOrientationDeg] = useState(180); // Default South

  // Map & Footprint Leaflet Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonLayerRef = useRef(null);

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

  // Calculate Building Footprint Dimensions from 3D Configurator state
  const getExtWidth = (side) => {
    if (side === 'appentis') return 9.3;
    if (side === 'auvent') return 4.0;
    return 0;
  };
  const totalWidth = config.width + getExtWidth(config.leftSide) + getExtWidth(config.rightSide);
  const totalLength = config.length || 37.5;
  const totalSurface = Math.round(totalWidth * totalLength);

  // Solar kWc from 3D configurator state (or auto estimation if solar toggle off)
  const installedKwc = useMemo(() => {
    if (config.hasSolar && config.solarStats?.power) {
      return config.solarStats.power;
    }
    return Math.round((totalSurface / 2.38) * 0.465 * 100) / 100;
  }, [config.hasSolar, config.solarStats, totalSurface]);

  // Financial & Solar Calculations (LLD Sunlib Model)
  const productibleBase = useMemo(() => getRegionalProductible(selectedAddress), [selectedAddress]);
  const orientationFactor = useMemo(() => getOrientationMultiplier(orientationDeg), [orientationDeg]);

  const annualProductionKwh = useMemo(() => {
    return Math.round(installedKwc * productibleBase * orientationFactor);
  }, [installedKwc, productibleBase, orientationFactor]);

  // EDF OA Tariff (average ~0.125 €/kWh for feed-in)
  const edfOaTariff = 0.125;
  const annualSolarRevenue = useMemo(() => {
    return Math.round(annualProductionKwh * edfOaTariff);
  }, [annualProductionKwh]);

  // LLD Sunlib Financial Model
  // Investment / Structure + Solar cost estimate
  const estimatedInvestmentHT = useMemo(() => {
    const charpenteEst = Math.round(totalSurface * 110);
    const solarEst = Math.round(installedKwc * 1000 * 0.88);
    return charpenteEst + solarEst;
  }, [totalSurface, installedKwc]);

  // Sunlib LLD Monthly Rent (€ HT/mois)
  const monthlyLldRent = useMemo(() => {
    return Math.round((estimatedInvestmentHT * 0.0058));
  }, [estimatedInvestmentHT]);

  const annualLldRent = useMemo(() => monthlyLldRent * 12, [monthlyLldRent]);
  const netAnnualRente = useMemo(() => annualSolarRevenue - annualLldRent, [annualSolarRevenue, annualLldRent]);
  const roiYears = useMemo(() => {
    if (annualSolarRevenue <= 0) return 12;
    return Math.round((estimatedInvestmentHT / annualSolarRevenue) * 10) / 10;
  }, [estimatedInvestmentHT, annualSolarRevenue]);

  // 30-Year Financial Graph Data
  const chart30YearsData = useMemo(() => {
    const data = [];
    let cumulRevenue = 0;
    let cumulRent = 0;
    let cumulNet = 0;

    for (let yr = 1; yr <= 30; yr++) {
      // 20-year EDF OA fixed, years 21-30 market resale
      const yrRev = yr <= 20 ? annualSolarRevenue : Math.round(annualSolarRevenue * 0.85);
      const yrRent = yr <= 20 ? annualLldRent : 0; // LLD contract paid off after 20 years!

      cumulRevenue += yrRev;
      cumulRent += yrRent;
      cumulNet += (yrRev - yrRent);

      if (yr % 2 === 0 || yr === 1 || yr === 30) {
        data.push({
          annee: `An ${yr}`,
          RevenusBruts: Math.round(cumulRevenue / 1000),
          LoyersLld: Math.round(cumulRent / 1000),
          GainNetCumule: Math.round(cumulNet / 1000)
        });
      }
    }
    return data;
  }, [annualSolarRevenue, annualLldRent]);

  // Environmental Impact Stats
  const co2AvoidedTonnes = useMemo(() => Math.round((annualProductionKwh * 0.09) / 1000 * 10) / 10, [annualProductionKwh]);
  const treesPlanted = useMemo(() => Math.round(co2AvoidedTonnes * 45), [co2AvoidedTonnes]);
  const householdsPowered = useMemo(() => Math.round(annualProductionKwh / 3500), [annualProductionKwh]);

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
      mapInstanceRef.current.setView([lat, lng], 18);
    }
  };

  // Initialize & Update Leaflet Satellite Map on Step 2
  useEffect(() => {
    if (step !== 2 || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 18,
        zoomControl: true
      });

      // Esri Satellite Layer
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri, Maxar, Earthstar Geographics',
        maxZoom: 20
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([coords.lat, coords.lng], 18);
    }

    // Draw rotated building footprint polygon on satellite map
    const map = mapInstanceRef.current;
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
    }

    // Convert meters to lat/lng offsets around center
    const latMeters = 111111;
    const lngMeters = 111111 * Math.cos((coords.lat * Math.PI) / 180);

    const halfW = (totalWidth / 2) / lngMeters;
    const halfL = (totalLength / 2) / latMeters;

    const rad = (orientationDeg * Math.PI) / 180;
    const cosR = Math.cos(rad);
    const sinR = Math.sin(rad);

    const baseCorners = [
      { x: -halfW, y: -halfL },
      { x: halfW, y: -halfL },
      { x: halfW, y: halfL },
      { x: -halfW, y: halfL }
    ];

    const rotatedCorners = baseCorners.map(c => {
      const rx = c.x * cosR - c.y * sinR;
      const ry = c.x * sinR + c.y * cosR;
      return [coords.lat + ry, coords.lng + rx];
    });

    const polygon = L.polygon(rotatedCorners, {
      color: '#2563eb',
      weight: 3,
      fillColor: '#3b82f6',
      fillOpacity: 0.45
    }).addTo(map);

    polygon.bindTooltip(`<b>${totalLength.toFixed(1)}m × ${totalWidth.toFixed(1)}m</b><br/>Surface: ${totalSurface} m²`, {
      permanent: true,
      direction: 'center',
      className: 'bg-white/95 text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-md border border-slate-300'
    });

    polygonLayerRef.current = polygon;

  }, [step, coords, totalWidth, totalLength, totalSurface, orientationDeg]);

  // Lead Form submission
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      const payload = {
        ...leadForm,
        projet: 'Structure métallique sur-mesure (Sunlib LLD)',
        adresse: selectedAddress,
        orientation: getCardinalLabel(orientationDeg),
        dimensions: `${totalLength.toFixed(1)}m x ${totalWidth.toFixed(1)}m (${totalSurface}m²)`,
        puissanceKwc: installedKwc,
        productionKwh: annualProductionKwh,
        loyerSunlibMois: monthlyLldRent,
        renteAnnuelle: annualSolarRevenue,
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
            className="w-full h-full object-cover opacity-50 scale-105"
            src="/1.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f2847]/80 via-[#0f2847]/70 to-[#0f2847]/95" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Award className="w-4 h-4 text-emerald-400" /> Partenaire Financier LLD Sunlib & Revente EDF OA
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Votre structure métallique <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">sur-mesure</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed mb-8">
              Configurez votre bâtiment en 3D, simulez son implantation satellite réelle et découvrez immédiatement son plan de financement et sa rentabilité nette en Location Longue Durée (LLD Sunlib).
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 1: 3D CONFIGURATOR MODULE */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ConfigurateurCharpente />
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE SIMULATION TUNNEL (3 STEPS) */}
      <section id="tunnel-faisabilite" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Tunnel Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Étude de faisabilité & <span className="text-blue-600">Simulateur LLD Sunlib</span>
            </h2>
            <p className="text-slate-600 text-base">
              Renseignez l'adresse de votre terrain pour simuler la disposition satellite exacte de votre bâtiment ({totalLength.toFixed(1)}m × {totalWidth.toFixed(1)}m) et calculer ses revenus photovoltaïques.
            </p>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-4 mt-8">
              {[
                { num: 1, label: '1. Adresse' },
                { num: 2, label: '2. Implantation & Orientation' },
                { num: 3, label: '3. Rentabilité LLD' }
              ].map(s => (
                <button
                  key={s.num}
                  onClick={() => setStep(s.num)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    step === s.num
                      ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-105'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-extrabold ${step === s.num ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-700'}`}>
                    {s.num}
                  </span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* STEP CONTENT WRAPPER */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10">
            
            {/* STEP 1: ADDRESS SEARCH */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Où souhaitez-vous implanter votre bâtiment ?</h3>
                    <p className="text-slate-500 text-sm">Entrez la commune, le code postal ou l'adresse précise du terrain d'accueil.</p>
                  </div>

                  <div className="relative">
                    <div className="relative flex items-center">
                      <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={addressInput}
                        onChange={(e) => handleAddressSearch(e.target.value)}
                        placeholder="Ex: 13001 Marseille ou Rue de la Paix, Lyon..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-base font-semibold text-slate-900 transition-all shadow-sm"
                      />
                    </div>

                    {/* BAN Autocomplete Dropdown */}
                    {addressSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden divide-y divide-slate-100">
                        {addressSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectAddress(item)}
                            className="p-3.5 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-3 text-sm text-slate-700"
                          >
                            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span>{item.properties.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" /> Adresse sélectionnée :
                    </div>
                    <div className="text-sm font-bold text-blue-600">{selectedAddress}</div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 text-base"
                  >
                    <span>Valider l'adresse & passer à l'orientation</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SATELLITE MAP & ORIENTATION SLIDER */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* Left Controls: Orientation & Dimensions */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Implantation Satellite</h3>
                      <p className="text-slate-500 text-xs">
                        L'emprise de votre bâtiment (<strong>{totalLength.toFixed(1)}m × {totalWidth.toFixed(1)}m – {totalSurface} m²</strong>) est projetée sur le terrain. Ajustez l'orientation.
                      </p>
                    </div>

                    {/* Orientation Slider */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5"><Compass className="w-4 h-4 text-blue-600" /> Orientation du bâtiment</span>
                        <span className="text-blue-600 text-sm font-extrabold">{orientationDeg}°</span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="5"
                        value={orientationDeg}
                        onChange={(e) => setOrientationDeg(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />

                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center text-xs font-bold text-blue-900">
                        {getCardinalLabel(orientationDeg)}
                      </div>

                      {/* Quick preset buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Sud (180°)', val: 180 },
                          { label: 'Sud-Est (135°)', val: 135 },
                          { label: 'Sud-Ouest (225°)', val: 225 }
                        ].map(preset => (
                          <button
                            key={preset.val}
                            onClick={() => setOrientationDeg(preset.val)}
                            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                              orientationDeg === preset.val ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Summary of Footprint Specs */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <div className="font-bold text-slate-900">Spécifications Charpente :</div>
                      <div className="flex justify-between text-slate-600"><span>Type :</span><strong>{config.buildingType}</strong></div>
                      <div className="flex justify-between text-slate-600"><span>Emprise au sol :</span><strong>{totalLength.toFixed(1)}m × {totalWidth.toFixed(1)}m</strong></div>
                      <div className="flex justify-between text-slate-600"><span>Surface totale :</span><strong className="text-blue-600">{totalSurface} m²</strong></div>
                      <div className="flex justify-between text-slate-600"><span>Puissance Solaire :</span><strong className="text-amber-600">{installedKwc} kWc</strong></div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Adresse
                      </button>
                      
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                      >
                        <span>Calculer les revenus & LLD</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right: Leaflet Satellite Map View */}
                  <div className="lg:col-span-2 h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-md relative" ref={mapContainerRef}>
                    <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 border border-slate-200 shadow-sm">
                      📍 Satellite : {selectedAddress}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: FINANCIAL DASHBOARD (LLD SUNLIB MODEL & 30Y RECHARTS) */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <div className="space-y-10">
                  
                  {/* Dashboard Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
                        <Award className="w-4 h-4" /> Étude de Rentabilité LLD Sunlib Validée
                      </div>
                      <h3 className="text-2xl font-extrabold text-slate-900">Tableau de Bord Financier & Productible</h3>
                      <p className="text-slate-500 text-xs mt-1">Implantation à {selectedAddress} • Orientation {getCardinalLabel(orientationDeg)}</p>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center gap-2 w-fit"
                    >
                      <RotateCcw className="w-4 h-4" /> Modifier l'implantation
                    </button>
                  </div>

                  {/* 5 KEY KPI CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    
                    {/* KPI 1: Puissance Installable */}
                    <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <span>Puissance</span>
                        <Zap className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="mt-4">
                        <div className="text-2xl font-black text-amber-400">{installedKwc} <span className="text-xs text-slate-300 font-bold">kWc</span></div>
                        <div className="text-[11px] text-slate-400 mt-1">{totalSurface} m² de toiture</div>
                      </div>
                    </div>

                    {/* KPI 2: Production Annuelle */}
                    <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <span>Production</span>
                        <Sun className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="mt-4">
                        <div className="text-2xl font-black text-white">{annualProductionKwh.toLocaleString('fr-FR')} <span className="text-xs text-slate-300 font-bold">kWh/an</span></div>
                        <div className="text-[11px] text-emerald-400 mt-1">Rendement {Math.round(orientationFactor * 100)}%</div>
                      </div>
                    </div>

                    {/* KPI 3: Revenus Solaires Annuels */}
                    <div className="bg-emerald-950 text-white p-5 rounded-2xl shadow-lg border border-emerald-800 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-emerald-300 text-xs font-bold uppercase tracking-wider">
                        <span>Revenus Bruts</span>
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="mt-4">
                        <div className="text-2xl font-black text-emerald-400">+{annualSolarRevenue.toLocaleString('fr-FR')} <span className="text-xs text-emerald-200 font-bold">€ HT/an</span></div>
                        <div className="text-[11px] text-emerald-300 mt-1">Revente EDF OA 20 ans</div>
                      </div>
                    </div>

                    {/* KPI 4: Loyer LLD Sunlib */}
                    <div className="bg-blue-950 text-white p-5 rounded-2xl shadow-lg border border-blue-800 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-blue-300 text-xs font-bold uppercase tracking-wider">
                        <span>Loyer LLD Sunlib</span>
                        <Wallet className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="mt-4">
                        <div className="text-2xl font-black text-blue-300">{monthlyLldRent.toLocaleString('fr-FR')} <span className="text-xs text-blue-200 font-bold">€ HT/mois</span></div>
                        <div className="text-[11px] text-blue-200 mt-1">Sans apport initial</div>
                      </div>
                    </div>

                    {/* KPI 5: Temps de Retour ROI */}
                    <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <span>Retour / ROI</span>
                        <Clock className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="mt-4">
                        <div className="text-2xl font-black text-white">{roiYears} <span className="text-xs text-slate-300 font-bold">ans</span></div>
                        <div className="text-[11px] text-emerald-400 mt-1">Amortissement rapide</div>
                      </div>
                    </div>

                  </div>

                  {/* 30-YEAR RECHARTS FINANCIAL GRAPH */}
                  <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-black text-white flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-emerald-400" /> Évolution des Gains Net Cumulés sur 30 Ans
                        </h4>
                        <p className="text-slate-400 text-xs mt-1">Modèle Location Longue Durée (LLD Sunlib) • Revente totale d'électricité</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-3 h-3 bg-emerald-500 rounded-full inline-block" /> Gain Net Cumulé (€k)</span>
                        <span className="flex items-center gap-1.5 text-blue-400"><span className="w-3 h-3 bg-blue-500 rounded-full inline-block" /> Loyers LLD (€k)</span>
                      </div>
                    </div>

                    <div className="h-72 w-full pt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chart30YearsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                          <XAxis dataKey="annee" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} unit="k€" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                            formatter={(val) => [`${val.toLocaleString('fr-FR')} k€ HT`, '']}
                          />
                          <Bar dataKey="LoyersLld" fill="#3b82f6" name="Loyers LLD (k€)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="GainNetCumule" fill="#10b981" name="Gain Net Cumulé (k€)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ENVIRONMENTAL IMPACT SECTION */}
                  <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-700/50">
                    <h4 className="text-xl font-black mb-6 text-emerald-300 flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-emerald-400" /> Impact Environnemental & Écologique Estimé
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-emerald-950/60 p-5 rounded-2xl border border-emerald-700/40 text-center">
                        <div className="text-3xl font-black text-emerald-400 mb-1">{co2AvoidedTonnes} t</div>
                        <div className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Tonnes de CO₂ évitées / an</div>
                      </div>

                      <div className="bg-emerald-950/60 p-5 rounded-2xl border border-emerald-700/40 text-center">
                        <div className="text-3xl font-black text-emerald-400 mb-1">{treesPlanted}</div>
                        <div className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Arbres équivalents plantés</div>
                      </div>

                      <div className="bg-emerald-950/60 p-5 rounded-2xl border border-emerald-700/40 text-center">
                        <div className="text-3xl font-black text-emerald-400 mb-1">{householdsPowered}</div>
                        <div className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Foyers alimentés en électricité</div>
                      </div>
                    </div>
                  </div>

                  {/* LEAD GENERATION FORM (CONVERSION) */}
                  <div id="etude-contact-form" className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-blue-600 shadow-2xl space-y-6">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                      <div className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200">
                        <PhoneCall className="w-4 h-4" /> Étude Approfondie Gratuite & Sans Engagement
                      </div>
                      <h4 className="text-2xl sm:text-3xl font-black text-slate-900">Demandez votre étude détaillée ENR COURTAGE</h4>
                      <p className="text-slate-600 text-sm">
                        Recevez le dossier complet de votre projet ({totalLength.toFixed(1)}m × {totalWidth.toFixed(1)}m, {installedKwc} kWc) avec l'analyse d'implantation Sunlib LLD sous 24h à 48h.
                      </p>
                    </div>

                    {formSubmitted ? (
                      <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                        <h5 className="text-2xl font-black text-emerald-900">Merci {leadForm.prenom} !</h5>
                        <p className="text-slate-700 text-sm">
                          Votre demande d'étude pour le projet à <strong>{selectedAddress}</strong> a bien été enregistrée. Notre équipe d'experts vous recontactera très rapidement.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleLeadSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Nom *</label>
                          <input
                            type="text"
                            required
                            value={leadForm.nom}
                            onChange={(e) => setLeadForm({ ...leadForm, nom: e.target.value })}
                            placeholder="Votre nom"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Prénom *</label>
                          <input
                            type="text"
                            required
                            value={leadForm.prenom}
                            onChange={(e) => setLeadForm({ ...leadForm, prenom: e.target.value })}
                            placeholder="Votre prénom"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Email professionnel *</label>
                          <input
                            type="email"
                            required
                            value={leadForm.email}
                            onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                            placeholder="votre.email@domaine.com"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone *</label>
                          <input
                            type="tel"
                            required
                            value={leadForm.telephone}
                            onChange={(e) => setLeadForm({ ...leadForm, telephone: e.target.value })}
                            placeholder="06 00 00 00 00"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Société / Nom du projet (Optionnel)</label>
                          <input
                            type="text"
                            value={leadForm.societe}
                            onChange={(e) => setLeadForm({ ...leadForm, societe: e.target.value })}
                            placeholder="Nom de votre entreprise, exploitation agricole ou SCI..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Commentaires / Précisions sur votre terrain</label>
                          <textarea
                            rows={3}
                            value={leadForm.commentaire}
                            onChange={(e) => setLeadForm({ ...leadForm, commentaire: e.target.value })}
                            placeholder="Précisez votre calendrier de projet, caractéristiques du terrain, etc."
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div className="sm:col-span-2 pt-2">
                          <button
                            type="submit"
                            disabled={isSubmittingForm}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-base uppercase tracking-wider"
                          >
                            {isSubmittingForm ? (
                              <span>Envoi en cours...</span>
                            ) : (
                              <>
                                <span>Envoyer ma demande d'étude de faisabilité</span>
                                <Send className="w-5 h-5" />
                              </>
                            )}
                          </button>
                          <div className="text-center text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Vos données sont protégées. Étude 100% gratuite et sans engagement.
                          </div>
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
