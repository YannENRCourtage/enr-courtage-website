import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Wind, Wheat, TreePine, DollarSign, MapPin, ChevronRight, ChevronLeft, 
  BarChart3, Calculator, Zap, Factory, Leaf, CheckCircle2, AlertCircle, RotateCcw,
  RefreshCw, Check, Search, ShieldCheck, FileText, Send, Building2, Plus, Minus,
  Sparkles, Flame, TrendingUp, Info
} from 'lucide-react';
import { useToast } from './ui/use-toast';

// We import data from the batitechData file. 
import * as BatitechData from '@/data/batitechData';
import { getAgriculturalValuationConfig } from '@/services/batitechConfigService';

const BATITECH_MODELS = BatitechData.BATITECH_MODELS || {
  "3.1.15": { id: "3.1.15", name: "BatiTech 3.1.15", travees: 3, cells: 1, kwc: 82.5, panels: 192, investment: { total: 115000 } },
  "6.2.15": { id: "6.2.15", name: "BatiTech 6.2.15", travees: 6, cells: 2, kwc: 165, panels: 384, investment: { total: 215000 } },
  "8.3.15": { id: "8.3.15", name: "BatiTech 8.3.15", travees: 8, cells: 3, kwc: 247.5, panels: 576, investment: { total: 310000 } }
};
const CEE_PREMIUMS = BatitechData.CEE_PREMIUMS || {};
const CLIMATE_ZONES_BY_DEPARTMENT = BatitechData.CLIMATE_ZONES_BY_DEPARTMENT || {};
const DRYING_CAPACITIES = BatitechData.DRYING_CAPACITIES || {};
const VENTILATOR_COSTS = BatitechData.VENTILATOR_COSTS || {};
const ORIENTATION_COEFFICIENTS = BatitechData.ORIENTATION_COEFFICIENTS || { "S": 1.0, "SE": 0.95, "SO": 0.95, "E": 0.85, "O": 0.85 };
const PRODUCTIBLE_BY_POSTAL_PREFIX = BatitechData.PRODUCTIBLE_BY_POSTAL_PREFIX || {};
const STORAGE_CAPACITIES = BatitechData.STORAGE_CAPACITIES || {};
const ELECTRICITY_RATE = BatitechData.ELECTRICITY_RATE || 0.16; // €/kWh for ventilator costs
const TARIF_RACHAT = BatitechData.TARIF_RACHAT_EDF_OA || 0.085; // €/kWh for electricity sale (EDF OA)
const AGRICULTURAL_VALUATION_DEFAULTS = BatitechData.AGRICULTURAL_VALUATION_DEFAULTS || {};

// Helper to format currency
const formatEuros = (value) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value || 0);
};

// ==========================================
// ROI BAR CHART COMPONENT (30 ANS)
// ==========================================
function RoiBarChart({ investmentNet, annualGain }) {
  const years = Array.from({ length: 30 }, (_, i) => i + 1);
  const cost = investmentNet;
  const firstYearSavings = annualGain;

  const data = useMemo(() => {
    let cumSavings = 0;
    return years.map(y => {
      cumSavings += firstYearSavings; // linear progression
      const netBalance = Math.round(cumSavings - cost);
      return { year: y, netBalance };
    });
  }, [cost, firstYearSavings]);

  const maxVal = Math.max(...data.map(d => d.netBalance), 50000);
  const minVal = Math.min(...data.map(d => d.netBalance), -cost);

  const isPositiveGain = firstYearSavings > 0;
  const paybackYears = isPositiveGain ? (cost / firstYearSavings).toFixed(1) : null;
  const pbYearFloat = paybackYears ? parseFloat(paybackYears) : null;
  const roiLinePct = (pbYearFloat && pbYearFloat <= 30) ? ((pbYearFloat - 0.5) / 30) * 100 : null;

  const targetYears = [1, 5, 10, 15, 20, 25, 30];

  return (
    <div className="bg-[#162238] rounded-2xl p-6 text-white my-8 border border-slate-700 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h4 className="text-lg font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <span>Économies cumulées & Amortissement sur 30 ans</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Projection sur 30 ans du solde net (Revenus EDF OA + Valorisation agricole & chaleur - Coûts ventilation - Investissement net)
          </p>
        </div>
        <div className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          {paybackYears ? `Amorti en ${paybackYears} ans` : 'Non amortissable'}
        </div>
      </div>

      <div className="relative h-60 w-full pt-8 pb-0">
        {roiLinePct !== null && (
          <div 
            className="absolute top-8 bottom-2 z-20 flex flex-col items-center pointer-events-none"
            style={{ left: `${Math.min(100, Math.max(0, roiLinePct))}%` }}
          >
            <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">
              ROI ({paybackYears} ans)
            </span>
            <div className="w-px h-full border-r-2 border-dashed border-blue-400"></div>
          </div>
        )}

        <div className="absolute left-6 right-2 top-[58%] h-px bg-slate-600 z-0"></div>

        <div className="flex items-end justify-between h-full pl-6 pr-2 relative z-10">
          {data.map((d) => {
            const isPositive = d.netBalance >= 0;
            const heightPct = isPositive 
              ? Math.min(100, Math.max(6, (d.netBalance / maxVal) * 55))
              : Math.min(40, Math.max(8, (Math.abs(d.netBalance) / Math.abs(minVal)) * 35));

            return (
              <div key={d.year} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2 rounded border border-slate-700 whitespace-nowrap z-30 pointer-events-none">
                  Année {d.year} : {d.netBalance > 0 ? `+${d.netBalance.toLocaleString('fr-FR')} €` : `${d.netBalance.toLocaleString('fr-FR')} €`}
                </div>

                <div 
                  className={`w-[80%] max-w-[10px] rounded-t-sm transition-all duration-300 ${
                    isPositive 
                      ? 'bg-amber-500 group-hover:bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
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
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
const BatitechSimulator = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [detailedMode, setDetailedMode] = useState(false);

  // Step 1: Model Selection & Options
  const [selectedModel, setSelectedModel] = useState("3.1.15");
  const [auventSud, setAuventSud] = useState(false);
  const [auventNord, setAuventNord] = useState(false);
  const [extraTravees, setExtraTravees] = useState(0);

  // Step 2: Location & Orientation
  const [addressInput, setAddressInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [department, setDepartment] = useState('');
  const [climateZone, setClimateZone] = useState('H2');
  const [dryingZone, setDryingZone] = useState('B');
  const [productible, setProductible] = useState(1100);
  
  const [orientation, setOrientation] = useState('S');
  const [inclination, setInclination] = useState(15);

  // Step 3: Needs & Agricultural Valuation
  const [activityType, setActivityType] = useState('Agricole');
  
  const [materials, setMaterials] = useState({
    fourrage: { 
      active: false, 
      qty: '', 
      hr: '45-15',
      gainPerTon: AGRICULTURAL_VALUATION_DEFAULTS.fourrage?.defaultGainPerTon || 55,
      energySavingsPerTon: AGRICULTURAL_VALUATION_DEFAULTS.fourrage?.defaultEnergySavingsPerTon || 10
    },
    bottes: { 
      active: false, 
      qty: '', 
      duration: '50j',
      gainPerTon: AGRICULTURAL_VALUATION_DEFAULTS.bottes?.defaultGainPerTon || 50,
      energySavingsPerTon: AGRICULTURAL_VALUATION_DEFAULTS.bottes?.defaultEnergySavingsPerTon || 10
    },
    ble: { 
      active: false, 
      qty: '',
      gainPerTon: AGRICULTURAL_VALUATION_DEFAULTS.ble?.defaultGainPerTon || 25,
      energySavingsPerTon: AGRICULTURAL_VALUATION_DEFAULTS.ble?.defaultEnergySavingsPerTon || 15
    },
    mais: { 
      active: false, 
      qty: '',
      gainPerTon: AGRICULTURAL_VALUATION_DEFAULTS.mais?.defaultGainPerTon || 35,
      energySavingsPerTon: AGRICULTURAL_VALUATION_DEFAULTS.mais?.defaultEnergySavingsPerTon || 25
    },
    plaquettes: { 
      active: false, 
      qty: '', 
      hr: '45-25',
      gainPerTon: AGRICULTURAL_VALUATION_DEFAULTS.plaquettes?.defaultGainPerTon || 30,
      energySavingsPerTon: AGRICULTURAL_VALUATION_DEFAULTS.plaquettes?.defaultEnergySavingsPerTon || 20
    }
  });

  // Charger la configuration par défaut (Firestore / async store) au montage
  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await getAgriculturalValuationConfig();
        if (config) {
          setMaterials(prev => {
            const updated = { ...prev };
            Object.keys(config).forEach(key => {
              if (updated[key]) {
                updated[key] = {
                  ...updated[key],
                  gainPerTon: config[key].defaultGainPerTon,
                  energySavingsPerTon: config[key].defaultEnergySavingsPerTon
                };
              }
            });
            return updated;
          });
        }
      } catch (err) {
        console.warn("Utilisation des paramètres agronomiques locaux :", err);
      }
    }
    loadConfig();
  }, []);

  // Step 4: Loading
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Handlers for Address Search
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
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [addressInput, selectedAddress]);

  const handleSelectSuggestion = (feature) => {
    const label = feature.properties.label;
    const postcode = feature.properties.postcode;
    
    let dpt = postcode.substring(0, 2);
    if (postcode.startsWith('97')) dpt = postcode.substring(0, 3);
    if (postcode.startsWith('20')) {
      dpt = postcode === '20000' || parseInt(postcode) < 20200 ? '2A' : '2B';
    }

    setAddressInput(label);
    setSelectedAddress(label);
    setDepartment(dpt);
    
    // Determine zones using helper functions from data file
    const cZone = BatitechData.getClimateZone ? BatitechData.getClimateZone(dpt) : (CLIMATE_ZONES_BY_DEPARTMENT[dpt] || 'H2');
    const dZone = BatitechData.getDryingZone ? BatitechData.getDryingZone(dpt) : 'B';
    const prod = BatitechData.getProductibleByPostalCode ? BatitechData.getProductibleByPostalCode(postcode) : 1100;
    
    setClimateZone(cZone);
    setDryingZone(dZone);
    setProductible(prod);
    setSuggestions([]);
  };

  const handleToggleMaterial = (mat) => {
    setMaterials(prev => ({
      ...prev,
      [mat]: { ...prev[mat], active: !prev[mat].active }
    }));
  };

  const handleMaterialChange = (mat, field, value) => {
    setMaterials(prev => ({
      ...prev,
      [mat]: { ...prev[mat], [field]: value }
    }));
  };

  const validateStep2 = () => {
    if (!selectedAddress) {
      toast({
        title: "Adresse requise",
        description: "Veuillez sélectionner une adresse valide dans la liste.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const hasActive = Object.values(materials).some(m => m.active);
    if (!hasActive) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins une matière à sécher.",
        variant: "destructive"
      });
      return false;
    }
    
    let isValid = true;
    Object.entries(materials).forEach(([key, val]) => {
      if (val.active && (!val.qty || isNaN(parseFloat(val.qty)) || parseFloat(val.qty) <= 0)) {
        isValid = false;
      }
    });

    if (!isValid) {
      toast({
        title: "Quantités invalides",
        description: "Veuillez indiquer une quantité valide pour chaque matière sélectionnée.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    
    if (step === 3) {
      setStep(3.5); // Loading step
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  useEffect(() => {
    if (step === 3.5) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep(4);
            return 100;
          }
          return prev + 15;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Calculations for Step 4
  const results = useMemo(() => {
    if (step !== 4) return null;

    const model = BatitechData.BATITECH_MODELS_MAP?.[selectedModel] || 
                  BatitechData.BATITECH_MODELS?.find(m => m.id === selectedModel) ||
                  BATITECH_MODELS[selectedModel] ||
                  BatitechData.BATITECH_MODELS[0];
    
    const orientCoef = BatitechData.getOrientationCoefficient 
      ? BatitechData.getOrientationCoefficient(inclination, orientation) 
      : 1.0;
    
    // A. Production Électrique (Revente totale EDF OA @ 0.085 €/kWh)
    const annualProduction = Math.round((model.kwc || model.kWc) * productible * orientCoef);
    const electricityRevenue = Math.round(annualProduction * TARIF_RACHAT);

    // B. Prime CEE (Fiche AGRI-EQ-110)
    const actKey = activityType.toLowerCase().startsWith('for') ? 'forestiere' : 'agricole';
    const ceePremium = BatitechData.CEE_PREMIUMS?.[selectedModel]?.[actKey]?.[climateZone] || 
                       BatitechData.CEE_PREMIUMS?.[model.id]?.[actKey]?.[climateZone] || 0;

    // C. Coûts de Ventilation & Capacités
    let ventilatorCosts = 0;
    let capacities = [];
    const modelCaps = BatitechData.DRYING_CAPACITIES?.[selectedModel] || 
                      BatitechData.DRYING_CAPACITIES?.[model.id] || {};
    const ventCount = model.ventilators || 1;

    // Fourrage vrac
    if (materials.fourrage?.active) {
      const qty = parseFloat(materials.fourrage.qty) || 0;
      const hrKey = materials.fourrage.hr || '45-15';
      const cap = modelCaps.fourrageVrac?.[hrKey]?.[dryingZone] || 
                  modelCaps.fourrageVrac?.[`HR ${hrKey}`]?.[dryingZone] || 0;
      ventilatorCosts += 1421 * ventCount;
      capacities.push({
        name: `Fourrage vrac (${hrKey})`,
        needed: qty,
        capacity: cap,
        sufficient: cap >= qty
      });
    }

    // Bottes carrées
    if (materials.bottes?.active) {
      const qty = parseFloat(materials.bottes.qty) || 0;
      const dur = materials.bottes.duration || '50j';
      const cap = modelCaps.bottesCarrees?.[dur]?.[dryingZone] || 
                  modelCaps.bottesCarrees?.[`${dur} HR 35-15`]?.[dryingZone] || 0;
      ventilatorCosts += (dur === '81j' ? 2273 : 1421) * ventCount;
      capacities.push({
        name: `Bottes carrées (${dur})`,
        needed: qty,
        capacity: cap,
        sufficient: cap >= qty
      });
    }

    // Blé tendre
    if (materials.ble?.active) {
      const qty = parseFloat(materials.ble.qty) || 0;
      const cap = modelCaps.cereales?.bleTendre?.[dryingZone] || 
                  modelCaps.cereales?.['Blé tendre 15j HR 15-12']?.[dryingZone] || 
                  modelCaps.cereales?.['Blé tendre 15j']?.[dryingZone] || 0;
      ventilatorCosts += 426 * ventCount;
      capacities.push({
        name: "Céréales - Blé tendre (15j)",
        needed: qty,
        capacity: cap,
        sufficient: cap >= qty
      });
    }

    // Maïs
    if (materials.mais?.active) {
      const qty = parseFloat(materials.mais.qty) || 0;
      const cap = modelCaps.cereales?.mais?.[dryingZone] || 
                  modelCaps.cereales?.['Maïs 37j HR 35-15']?.[dryingZone] || 
                  modelCaps.cereales?.['Maïs 37j']?.[dryingZone] || 0;
      ventilatorCosts += 1051 * ventCount;
      capacities.push({
        name: "Céréales - Maïs (37j)",
        needed: qty,
        capacity: cap,
        sufficient: cap >= qty
      });
    }

    // Plaquettes forestières
    if (materials.plaquettes?.active) {
      const qty = parseFloat(materials.plaquettes.qty) || 0;
      const hrKey = materials.plaquettes.hr || '45-25';
      const cap = modelCaps.plaquettes?.[hrKey]?.[dryingZone] || 
                  modelCaps.plaquettes?.[`HR ${hrKey}`]?.[dryingZone] || 0;
      ventilatorCosts += 9207 * ventCount;
      capacities.push({
        name: `Plaquettes forestières (${hrKey})`,
        needed: qty,
        capacity: cap,
        sufficient: cap >= qty
      });
    }

    // D. VALORISATION AGRICOLE & ÉCONOMIES D'ÉNERGIE (Modèle économique complet)
    let totalTonnage = 0;
    let totalAgriQualityGain = 0;
    let totalEnergySavings = 0;
    const materialValuationBreakdown = [];

    Object.entries(materials).forEach(([matKey, matVal]) => {
      if (matVal.active) {
        const qty = parseFloat(matVal.qty) || 0;
        totalTonnage += qty;

        const gainPerTon = (matVal.gainPerTon !== '' && !isNaN(parseFloat(matVal.gainPerTon)))
          ? parseFloat(matVal.gainPerTon)
          : (AGRICULTURAL_VALUATION_DEFAULTS[matKey]?.defaultGainPerTon || 0);

        const energySavingsPerTon = (matVal.energySavingsPerTon !== '' && !isNaN(parseFloat(matVal.energySavingsPerTon)))
          ? parseFloat(matVal.energySavingsPerTon)
          : (AGRICULTURAL_VALUATION_DEFAULTS[matKey]?.defaultEnergySavingsPerTon || 0);

        const cropQualityGain = qty * gainPerTon;
        const cropEnergySavings = qty * energySavingsPerTon;
        const cropTotalValuation = cropQualityGain + cropEnergySavings;

        totalAgriQualityGain += cropQualityGain;
        totalEnergySavings += cropEnergySavings;

        materialValuationBreakdown.push({
          key: matKey,
          label: AGRICULTURAL_VALUATION_DEFAULTS[matKey]?.label || matKey,
          qty,
          gainPerTon,
          energySavingsPerTon,
          cropQualityGain,
          cropEnergySavings,
          cropTotalValuation
        });
      }
    });

    const totalAgriculturalValuation = totalAgriQualityGain + totalEnergySavings;

    // E. Calcul de l'Investissement et Options Auvents / Travées
    const getAuventUnitCost = (mId) => {
      if (mId === '3.1.15' || mId === 'batitech_3_1_15') return 4500; // 3 travées
      if (mId === '6.2.15' || mId === 'batitech_6_2_15') return 9000; // 6 travées
      if (mId === '8.3.15' || mId === 'batitech_8_3_15') return 12000; // 8 travées
      return 4500;
    };

    const auventUnitCost = getAuventUnitCost(selectedModel);
    const totalAuventCost = (auventSud ? auventUnitCost : 0) + (auventNord ? auventUnitCost : 0);
    const numExtraTravees = parseInt(extraTravees, 10) || 0;
    const totalExtraTraveesCost = numExtraTravees * 20250;
    const totalOptionsCost = totalAuventCost + totalExtraTraveesCost;

    const baseInvestment = model.investment.total;
    const investmentBrut = baseInvestment + totalOptionsCost;
    const investmentNet = Math.max(0, investmentBrut - ceePremium);

    // F. NOUVELLE FORMULE DU GAIN NET ANNUEL :
    // Gain Net = (Revenus Vente Électricité) - (Coûts Ventilation) + (Plus-value agricole) + (Économies énergies fossiles substituées)
    const annualGain = (electricityRevenue - ventilatorCosts) + totalAgriculturalValuation;

    // G. TEMPS DE RETOUR (ROI) AVEC GESTION DE DIVISION PAR ZÉRO / GAIN NÉGATIF
    let roi = "-";
    if (annualGain > 0) {
      roi = (investmentNet / annualGain).toFixed(1);
    } else {
      roi = "Non amortissable";
    }

    const optionsDetails = [];
    if (auventSud) optionsDetails.push(`Auvent Sud (+${formatEuros(auventUnitCost)})`);
    if (auventNord) optionsDetails.push(`Auvent Nord (+${formatEuros(auventUnitCost)})`);
    if (numExtraTravees > 0) optionsDetails.push(`${numExtraTravees} travée${numExtraTravees > 1 ? 's' : ''} sup. 6m (+${formatEuros(totalExtraTraveesCost)})`);

    return {
      model,
      annualProduction,
      electricityRevenue,
      ceePremium,
      ventilatorCosts,
      baseInvestment,
      totalOptionsCost,
      optionsDetails,
      investmentBrut,
      investmentNet,
      totalTonnage,
      totalAgriQualityGain,
      totalEnergySavings,
      totalAgriculturalValuation,
      materialValuationBreakdown,
      annualGain,
      roi,
      capacities
    };
  }, [step, selectedModel, productible, orientation, inclination, activityType, climateZone, dryingZone, materials, auventSud, auventNord, extraTravees]);



  // ==========================================
  // STEP COMPONENTS
  // ==========================================

  const getAuventUnitCostForDisplay = (mId) => {
    if (mId === '3.1.15' || mId === 'batitech_3_1_15') return 4500;
    if (mId === '6.2.15' || mId === 'batitech_6_2_15') return 9000;
    if (mId === '8.3.15' || mId === 'batitech_8_3_15') return 12000;
    return 4500;
  };
  const currentAuventUnitCost = getAuventUnitCostForDisplay(selectedModel);
  const currentTotalOptionsCost = (auventSud ? currentAuventUnitCost : 0) + (auventNord ? currentAuventUnitCost : 0) + (parseInt(extraTravees, 10) || 0) * 20250;

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Choisissez votre modèle BatiTech</h3>
          <p className="text-slate-400">Sélectionnez le séchoir solaire adapté à vos besoins</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-800/50 p-2 rounded-xl border border-slate-700">
          <span className={`text-sm ${!detailedMode ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>Simplifié</span>
          <button 
            onClick={() => setDetailedMode(!detailedMode)}
            className="w-12 h-6 bg-slate-900 rounded-full relative border border-slate-600 transition-colors"
          >
            <div className={`w-4 h-4 rounded-full bg-amber-500 absolute top-0.5 transition-all ${detailedMode ? 'left-7' : 'left-1'}`} />
          </button>
          <span className={`text-sm ${detailedMode ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>Détaillé</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(BATITECH_MODELS).map((model) => (
          <div 
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 border-2 ${
              selectedModel === model.id 
                ? 'bg-amber-900/20 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)]' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xl font-bold text-white">{model.name}</h4>
              {selectedModel === model.id && <CheckCircle2 className="w-6 h-6 text-amber-500" />}
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Structure</span>
                <span className="text-white font-semibold">{model.travees} travées, {model.cells} cellule{model.cells > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Puissance</span>
                <span className="text-white font-semibold">{model.kwc} kWc</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Panneaux</span>
                <span className="text-white font-semibold">{model.panels} modules</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-500 mb-1">Investissement indicatif</div>
              <div className="text-xl font-bold text-amber-400">{formatEuros(model.investment.total)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Mode Détaillé : Options Auvents et Travées Supplémentaires */}
      {detailedMode && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-5 mt-6"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <Building2 className="w-5 h-5" />
              <span>Options Charpente & Extensions (Mode Détaillé)</span>
            </div>
            {currentTotalOptionsCost > 0 && (
              <span className="text-xs font-bold px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                + {formatEuros(currentTotalOptionsCost)} HT
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auvent Sud */}
            <div 
              onClick={() => setAuventSud(!auventSud)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                auventSud 
                  ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="text-white font-bold text-sm flex items-center">
                  <span>Rajout Auvent Sud (4m de rampant)</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Structure + couverture bac acier ({selectedModel === '3.1.15' ? '3 travées de 6m' : selectedModel === '6.2.15' ? '6 travées de 6m' : '8 travées de 6m'})</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-amber-400">+{formatEuros(currentAuventUnitCost)} HT</div>
                <div className={`text-xs mt-0.5 font-semibold ${auventSud ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {auventSud ? 'Inclus ✓' : 'Option'}
                </div>
              </div>
            </div>

            {/* Auvent Nord */}
            <div 
              onClick={() => setAuventNord(!auventNord)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                auventNord 
                  ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="text-white font-bold text-sm flex items-center">
                  <span>Rajout Auvent Nord (4m de rampant)</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Structure + couverture bac acier ({selectedModel === '3.1.15' ? '3 travées de 6m' : selectedModel === '6.2.15' ? '6 travées de 6m' : '8 travées de 6m'})</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-amber-400">+{formatEuros(currentAuventUnitCost)} HT</div>
                <div className={`text-xs mt-0.5 font-semibold ${auventNord ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {auventNord ? 'Inclus ✓' : 'Option'}
                </div>
              </div>
            </div>
          </div>

          {/* Travées Supplémentaires */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-white font-bold text-sm">Ajouter une ou plusieurs travées supplémentaires de 6m (sans auvent)</div>
              <div className="text-xs text-slate-400 mt-1">
                Comprend les fondations principales (2u), charpente métallique, couverture et bardage façade Sud sur 6m.
              </div>
              <div className="text-xs text-amber-400 font-semibold mt-1">+ 20 250,00 € HT / travée de 6m</div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                type="button"
                onClick={() => setExtraTravees(Math.max(0, extraTravees - 1))}
                className="w-9 h-9 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors flex items-center justify-center border border-slate-700"
              >
                -
              </button>
              <input 
                type="number"
                min="0"
                max="10"
                value={extraTravees}
                onChange={(e) => setExtraTravees(Math.max(0, parseInt(e.target.value, 10) || 0))}
                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                className="w-16 bg-slate-900 border border-slate-700 !text-white text-center font-bold rounded-lg py-1.5 batitech-input text-base"
              />
              <button 
                type="button"
                onClick={() => setExtraTravees(extraTravees + 1)}
                className="w-9 h-9 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors flex items-center justify-center border border-slate-700"
              >
                +
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Localisation et Implantation</h3>
        <p className="text-slate-400">Pour calculer précisément votre productible et vos primes CEE</p>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <label className="block text-sm font-semibold text-white mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-amber-500" />
          Adresse du site
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
            className="w-full bg-slate-950 border border-slate-700 !text-white text-lg rounded-xl pl-10 pr-4 py-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 batitech-input dark-input placeholder-slate-500 font-medium"
            placeholder="Saisissez l'adresse du site..."
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-lg max-h-60 overflow-auto">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="px-4 py-3 hover:bg-slate-700 cursor-pointer text-white text-sm border-b border-slate-700/50 last:border-0"
                  onClick={() => handleSelectSuggestion(s)}
                >
                  {s.properties.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedAddress && (
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex items-center">
              <span className="text-slate-400 text-sm mr-2">Zone Climatique CEE:</span>
              <span className="text-white font-bold">{climateZone}</span>
            </div>
            <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex items-center">
              <span className="text-slate-400 text-sm mr-2">Zone Séchage:</span>
              <span className="text-white font-bold">{dryingZone}</span>
            </div>
            <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex items-center">
              <span className="text-slate-400 text-sm mr-2">Fiche CEE :</span>
              <span className="text-amber-400 font-bold">AGRI-EQ-110</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <label className="block text-sm font-semibold text-white mb-4 flex items-center">
          <Sun className="w-4 h-4 mr-2 text-amber-500" />
          Orientation du bâtiment
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: 'E', label: 'Est' },
            { id: 'SE', label: 'Sud-Est' },
            { id: 'S', label: 'Sud' },
            { id: 'SO', label: 'Sud-Ouest' },
            { id: 'O', label: 'Ouest' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setOrientation(opt.id)}
              className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                orientation === opt.id
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {detailedMode && (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <label className="block text-sm font-semibold text-white mb-4">Inclinaison de la toiture</label>
            <div className="grid grid-cols-4 gap-3">
              {[0, 15, 30, 60].map(deg => (
                <button
                  key={deg}
                  onClick={() => setInclination(deg)}
                  className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                    inclination === deg
                      ? 'bg-amber-500 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>
        )}
        {!detailedMode && (
          <div className="mt-6 text-sm text-slate-400 flex items-center">
            <InfoIcon className="w-4 h-4 mr-2 text-amber-500" />
            Inclinaison fixe à 15° (Charpente Barconnière AS9.2)
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderStep3 = () => {
    const cropsList = [
      { id: 'fourrage', label: 'Fourrage vrac (Séchage en grange)', icon: <Leaf className="w-5 h-5" />, unitLabel: 't MS/an', defaultGain: 55, defaultEnergy: 10, hint: 'Gain MAT +2 à +4 pts, économie d\'achat de concentrés/soja' },
      { id: 'bottes', label: 'Bottes carrées (Foin conditionné)', icon: <PackageIcon className="w-5 h-5" />, unitLabel: 't MS/an', defaultGain: 50, defaultEnergy: 10, hint: 'Conservation des feuilles, haute digestibilité, zéro poussière' },
      { id: 'ble', label: 'Céréales - Blé tendre', icon: <Wheat className="w-5 h-5" />, unitLabel: 't/an', defaultGain: 25, defaultEnergy: 15, hint: 'Économie des taxes de séchage OS et maîtrise de récolte' },
      { id: 'mais', label: 'Céréales - Maïs grain', icon: <Wheat className="w-5 h-5" />, unitLabel: 't/an', defaultGain: 35, defaultEnergy: 25, hint: 'Substitution du séchage fossile à flamme directe (gaz propane)' },
      { id: 'plaquettes', label: 'Plaquettes forestières (Bois énergie)', icon: <TreePine className="w-5 h-5" />, unitLabel: 't/an', defaultGain: 30, defaultEnergy: 20, hint: 'Valorisation bois sec classe M20/M25 (PCI doublé de 2 à 4 kWh/kg)' }
    ];

    const currentTotalValuation = Object.entries(materials).reduce((acc, [k, m]) => {
      if (!m.active) return acc;
      const q = parseFloat(m.qty) || 0;
      const g = (m.gainPerTon !== '' && !isNaN(parseFloat(m.gainPerTon))) ? parseFloat(m.gainPerTon) : (AGRICULTURAL_VALUATION_DEFAULTS[k]?.defaultGainPerTon || 0);
      const e = (m.energySavingsPerTon !== '' && !isNaN(parseFloat(m.energySavingsPerTon))) ? parseFloat(m.energySavingsPerTon) : (AGRICULTURAL_VALUATION_DEFAULTS[k]?.defaultEnergySavingsPerTon || 0);
      return acc + q * (g + e);
    }, 0);

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Vos Besoins en Séchage & Valorisation Agricole</h3>
          <p className="text-slate-400">Sélectionnez les matières, indiquez vos volumes et ajustez vos gains agronomiques</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <label className="block text-sm font-semibold text-white mb-4">Type d'activité (Fiche CEE AGRI-EQ-110)</label>
          <div className="flex space-x-4">
            <button
              onClick={() => setActivityType('Agricole')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center transition-all ${
                activityType === 'Agricole' ? 'bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Wheat className="w-5 h-5 mr-2" />
              Agricole
            </button>
            <button
              onClick={() => setActivityType('Forestière')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center transition-all ${
                activityType === 'Forestière' ? 'bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <TreePine className="w-5 h-5 mr-2" />
              Forestière
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {cropsList.map((mat) => {
            const isMatActive = materials[mat.id]?.active;
            const matQty = parseFloat(materials[mat.id]?.qty) || 0;
            const matGain = (materials[mat.id]?.gainPerTon !== '' && !isNaN(parseFloat(materials[mat.id]?.gainPerTon))) 
              ? parseFloat(materials[mat.id]?.gainPerTon) 
              : mat.defaultGain;
            const matEnergy = (materials[mat.id]?.energySavingsPerTon !== '' && !isNaN(parseFloat(materials[mat.id]?.energySavingsPerTon))) 
              ? parseFloat(materials[mat.id]?.energySavingsPerTon) 
              : mat.defaultEnergy;
            const matEstAnnualGain = matQty * (matGain + matEnergy);

            return (
              <div 
                key={mat.id} 
                className={`bg-slate-900 rounded-2xl p-5 border transition-all ${isMatActive ? 'border-amber-500/60 shadow-lg' : 'border-slate-800'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center space-x-3 cursor-pointer select-none text-white font-semibold text-base">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-600 text-amber-500 focus:ring-amber-500 bg-slate-800" 
                      checked={isMatActive}
                      onChange={() => handleToggleMaterial(mat.id)}
                    />
                    <span className="flex items-center text-amber-400 mr-1">{mat.icon}</span>
                    <span>{mat.label}</span>
                  </label>
                  
                  {isMatActive && (
                    <div className="flex items-center space-x-2 pl-8 sm:pl-0">
                      <input
                        type="number"
                        min="1"
                        placeholder={mat.unitLabel}
                        style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                        className="w-36 bg-slate-950 border border-slate-700 !text-white text-sm rounded-lg px-3 py-2.5 batitech-input dark-input font-bold"
                        value={materials[mat.id].qty}
                        onChange={(e) => handleMaterialChange(mat.id, 'qty', e.target.value)}
                      />
                      <span className="text-xs text-slate-400 font-semibold">{mat.unitLabel}</span>
                    </div>
                  )}
                </div>

                {/* Section Valorisation Agricole & Économies intégrée */}
                {isMatActive && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-slate-800 space-y-4"
                  >
                    <div className="bg-slate-950/80 rounded-xl p-4 border border-emerald-500/30">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 border-b border-slate-800 pb-2">
                        <div className="flex items-center text-emerald-400 text-xs font-bold uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 mr-1.5 text-emerald-400" />
                          Valorisation Agricole & Économies Thermiques
                        </div>
                        {matQty > 0 && (
                          <div className="text-xs font-bold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/40">
                            Gain généré : + {formatEuros(matEstAnnualGain)} / an
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Plus-value agronomique & qualité */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                            <span>Plus-value qualité / concentrés</span>
                            <span className="text-[11px] text-amber-400 font-semibold">(Réf. : {mat.defaultGain} €/t)</span>
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={materials[mat.id].gainPerTon}
                              onChange={(e) => handleMaterialChange(mat.id, 'gainPerTon', e.target.value)}
                              style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                              className="w-full bg-slate-900 border border-slate-700 !text-white text-sm rounded-lg pl-3 pr-12 py-2 batitech-input font-bold"
                            />
                            <span className="absolute right-3 text-xs text-slate-400 font-medium pointer-events-none">€/t</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-tight">{mat.hint}</p>
                        </div>

                        {/* Économie d'énergie fossile substituée */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                            <span>Économie énergie fossile substituée</span>
                            <span className="text-[11px] text-amber-400 font-semibold">(Réf. : {mat.defaultEnergy} €/t)</span>
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={materials[mat.id].energySavingsPerTon}
                              onChange={(e) => handleMaterialChange(mat.id, 'energySavingsPerTon', e.target.value)}
                              style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                              className="w-full bg-slate-900 border border-slate-700 !text-white text-sm rounded-lg pl-3 pr-12 py-2 batitech-input font-bold"
                            />
                            <span className="absolute right-3 text-xs text-slate-400 font-medium pointer-events-none">€/t</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-tight">Économie de combustible (gaz propane / fioul) sur séchoir thermique</p>
                        </div>
                      </div>
                    </div>

                    {/* Mode détaillé selectors */}
                    {detailedMode && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                        <span className="text-xs text-slate-400 font-medium">Paramètre hygrométrique / durée :</span>
                        {mat.id === 'fourrage' && (
                          <select 
                            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                            className="bg-slate-900 border border-slate-700 !text-white text-xs rounded-lg px-3 py-1.5 batitech-input dark-input font-medium"
                            value={materials[mat.id].hr}
                            onChange={(e) => handleMaterialChange(mat.id, 'hr', e.target.value)}
                          >
                            <option value="50-15" className="bg-slate-900 text-white">Séchage 50% HR vers 15% HR</option>
                            <option value="45-15" className="bg-slate-900 text-white">Séchage 45% HR vers 15% HR</option>
                            <option value="40-15" className="bg-slate-900 text-white">Séchage 40% HR vers 15% HR</option>
                          </select>
                        )}
                        {mat.id === 'bottes' && (
                          <select 
                            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                            className="bg-slate-900 border border-slate-700 !text-white text-xs rounded-lg px-3 py-1.5 batitech-input dark-input font-medium"
                            value={materials[mat.id].duration}
                            onChange={(e) => handleMaterialChange(mat.id, 'duration', e.target.value)}
                          >
                            <option value="50j" className="bg-slate-900 text-white">Durée 50 jours</option>
                            <option value="81j" className="bg-slate-900 text-white">Durée 81 jours</option>
                          </select>
                        )}
                        {mat.id === 'plaquettes' && (
                          <select 
                            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                            className="bg-slate-900 border border-slate-700 !text-white text-xs rounded-lg px-3 py-1.5 batitech-input dark-input font-medium"
                            value={materials[mat.id].hr}
                            onChange={(e) => handleMaterialChange(mat.id, 'hr', e.target.value)}
                          >
                            <option value="50-30" className="bg-slate-900 text-white">Séchage 50% HR vers 30% HR</option>
                            <option value="45-25" className="bg-slate-900 text-white">Séchage 45% HR vers 25% HR</option>
                            <option value="40-15" className="bg-slate-900 text-white">Séchage 40% HR vers 15% HR</option>
                          </select>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Global Agricultural Valuation Live Box */}
        {currentTotalValuation > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/30 rounded-2xl p-5 border border-emerald-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-white font-extrabold text-base">Valorisation Agricole & Chaleur Solaire Totale</div>
                <div className="text-xs text-slate-300">Gains protéiques, digestibilité, économies d'aliments et de séchage fossile</div>
              </div>
            </div>
            <div className="text-right sm:flex-shrink-0">
              <div className="text-2xl font-black text-emerald-400">
                + {formatEuros(currentTotalValuation)} / an
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Injecté dans le calcul de rentabilité</div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  const renderLoading = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative w-32 h-32 mb-8">
        <svg className="w-full h-full animate-spin text-slate-800" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" />
        </svg>
        <svg className="w-full h-full absolute top-0 left-0 text-amber-500" viewBox="0 0 100 100">
          <circle 
            cx="50" cy="50" r="45" fill="none" strokeWidth="8" strokeLinecap="round"
            strokeDasharray="283" strokeDashoffset={283 - (283 * loadingProgress) / 100}
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
          {Math.round(loadingProgress)}%
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Calcul de votre projet BatiTech...</h3>
      <p className="text-slate-400">Analyse de la production solaire, valorisation agricole et temps de retour.</p>
    </motion.div>
  );

  const renderStep4 = () => {
    if (!results) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Votre Simulation <span className="text-amber-500">{results.model.name}</span></h2>
          <p className="text-slate-400">Voici l'estimation économique et agronomique complète de votre projet</p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><Zap className="w-16 h-16 text-emerald-400" /></div>
            <div className="text-emerald-400 text-sm font-bold mb-2">Production Électrique</div>
            <div className="text-3xl font-bold text-white mb-1">{new Intl.NumberFormat('fr-FR').format(results.annualProduction)} <span className="text-lg text-slate-400 font-normal">kWh/an</span></div>
            <div className="text-emerald-500 font-semibold">{formatEuros(results.electricityRevenue)} / an (EDF OA)</div>
          </div>
          
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><TrendingUp className="w-16 h-16 text-amber-500" /></div>
            <div className="text-amber-500 text-sm font-bold mb-2">Valorisation Agricole & Chaleur</div>
            <div className="text-3xl font-bold text-white mb-1">+ {formatEuros(results.totalAgriculturalValuation)} <span className="text-lg text-slate-400 font-normal">/an</span></div>
            <div className="text-slate-400 text-xs">Qualité ({formatEuros(results.totalAgriQualityGain)}) + Énergie ({formatEuros(results.totalEnergySavings)})</div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><Calculator className="w-16 h-16 text-blue-400" /></div>
            <div className="text-blue-400 text-sm font-bold mb-2">Temps de Retour (ROI)</div>
            <div className="text-3xl font-bold text-white mb-1">{results.roi} {results.roi !== "Non amortissable" && <span className="text-lg text-slate-400 font-normal">ans</span>}</div>
            <div className="text-blue-400 text-sm font-semibold">Gain net annuel : {formatEuros(results.annualGain)}/an</div>
          </div>
        </div>

        {/* Capacities Dashboard */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Wind className="w-6 h-6 mr-3 text-amber-500" />
            Capacité de Séchage & Volumes Annuels
          </h3>
          <div className="space-y-4">
            {results.capacities.map((cap, i) => (
              <div key={i} className="bg-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between border border-slate-700">
                <div className="font-semibold text-white text-lg mb-2 md:mb-0">{cap.name}</div>
                <div className="flex items-center space-x-6 w-full md:w-auto">
                  <div className="flex-1 md:flex-none text-center">
                    <div className="text-xs text-slate-400 mb-1">Besoin annuel</div>
                    <div className="text-lg text-white font-bold">{cap.needed} t</div>
                  </div>
                  <div className="text-slate-600 text-xl">/</div>
                  <div className="flex-1 md:flex-none text-center">
                    <div className="text-xs text-slate-400 mb-1">Capacité modèle</div>
                    <div className="text-lg text-amber-500 font-bold">{cap.capacity} t</div>
                  </div>
                  <div className="w-10 flex justify-end">
                    {cap.sufficient ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-orange-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {results.capacities.length === 0 && (
              <div className="text-slate-400 text-center py-4">Aucune matière sélectionnée</div>
            )}
          </div>
        </div>

        {/* Détail Valorisation Agricole */}
        {results.materialValuationBreakdown.length > 0 && (
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Sparkles className="w-6 h-6 mr-3 text-emerald-400" />
              Détail de la Plus-Value Agronomique & Économies d'Énergie
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Culture / Matière</th>
                    <th className="py-3 px-4 text-center">Volume</th>
                    <th className="py-3 px-4 text-center">Plus-value qualité</th>
                    <th className="py-3 px-4 text-center">Éco. Énergie fossile</th>
                    <th className="py-3 px-4 text-right">Gain Annuel Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {results.materialValuationBreakdown.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-white">{row.label}</td>
                      <td className="py-3 px-4 text-center">{row.qty} t</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-medium">+{row.gainPerTon} €/t ({formatEuros(row.cropQualityGain)})</td>
                      <td className="py-3 px-4 text-center text-blue-400 font-medium">+{row.energySavingsPerTon} €/t ({formatEuros(row.cropEnergySavings)})</td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400">+{formatEuros(row.cropTotalValuation)}/an</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-950/80 font-bold text-white">
                    <td className="py-3 px-4">TOTAL VALORISATION</td>
                    <td className="py-3 px-4 text-center">{results.totalTonnage} t</td>
                    <td className="py-3 px-4 text-center text-emerald-400">+{formatEuros(results.totalAgriQualityGain)}</td>
                    <td className="py-3 px-4 text-center text-blue-400">+{formatEuros(results.totalEnergySavings)}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 text-base">+{formatEuros(results.totalAgriculturalValuation)}/an</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Financial Details */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <DollarSign className="w-6 h-6 mr-3 text-amber-500" />
            Bilan Financier & Modèle Économique Global
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="text-xs uppercase font-bold text-amber-400 tracking-wider mb-2">Investissement Initial</div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
                <span className="text-slate-400">Séchoir de base {results.model.name}</span>
                <span className="text-white font-semibold">{formatEuros(results.baseInvestment)}</span>
              </div>
              {results.totalOptionsCost > 0 && (
                <div className="flex justify-between items-center py-2.5 border-b border-slate-800 text-amber-300">
                  <span className="text-slate-400 text-sm">Options ({results.optionsDetails.join(', ')})</span>
                  <span className="font-semibold">+ {formatEuros(results.totalOptionsCost)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
                <span className="text-slate-300 font-medium">Investissement Brut Total</span>
                <span className="text-white font-bold">{formatEuros(results.investmentBrut)}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
                <span className="text-slate-400">Prime CEE (Fiche AGRI-EQ-110)</span>
                <span className="text-emerald-400 font-semibold">- {formatEuros(results.ceePremium)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-slate-800 px-4 rounded-xl font-bold text-lg">
                <span className="text-white">Investissement Net à Financer</span>
                <span className="text-amber-500">{formatEuros(results.investmentNet)}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider mb-2">Flux de Trésorerie Annuels</div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-slate-400">Revenus Vente Électricité (EDF OA)</span>
                <span className="text-emerald-400 font-semibold">+ {formatEuros(results.electricityRevenue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-slate-400">Plus-value qualité agricole & concentrés</span>
                <span className="text-emerald-400 font-semibold">+ {formatEuros(results.totalAgriQualityGain)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-slate-400">Économies énergies fossiles substituées</span>
                <span className="text-emerald-400 font-semibold">+ {formatEuros(results.totalEnergySavings)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-slate-400">Coûts de Ventilation (Électricité)</span>
                <span className="text-red-400 font-semibold">- {formatEuros(results.ventilatorCosts)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-gradient-to-r from-emerald-950/60 to-slate-800 px-4 rounded-xl font-bold text-lg border border-emerald-500/30">
                <span className="text-white">Gain Net Annuel Global</span>
                <span className="text-emerald-400">+ {formatEuros(results.annualGain)} / an</span>
              </div>
            </div>
          </div>
        </div>

        <RoiBarChart investmentNet={results.investmentNet} annualGain={results.annualGain} />

        <div className="text-center pt-8 pb-4">
          <button 
            className="btn-primary bg-amber-500 hover:bg-amber-600 text-slate-900 border-none px-10 py-4 text-lg w-full md:w-auto flex items-center justify-center mx-auto"
            onClick={() => {
              const contactForm = document.querySelector('[data-contact-form]');
              if (contactForm) contactForm.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <FileText className="w-5 h-5 mr-3" />
            Demander un devis personnalisé
          </button>
          <button 
            onClick={() => setStep(1)}
            className="mt-6 text-slate-400 hover:text-white flex items-center justify-center mx-auto transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refaire une simulation
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#0a101d] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800/60 p-4 md:p-10 my-10">
      
      {/* Progress Dots */}
      {step < 3.5 && (
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map(s => (
              <React.Fragment key={s}>
                <div className={`w-3 h-3 rounded-full transition-colors ${step >= s ? 'bg-amber-500' : 'bg-slate-700'}`} />
                {s < 3 && <div className={`w-8 h-1 rounded-full transition-colors ${step > s ? 'bg-amber-500' : 'bg-slate-700'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && <motion.div key="step1">{renderStep1()}</motion.div>}
        {step === 2 && <motion.div key="step2">{renderStep2()}</motion.div>}
        {step === 3 && <motion.div key="step3">{renderStep3()}</motion.div>}
        {step === 3.5 && <motion.div key="step35">{renderLoading()}</motion.div>}
        {step === 4 && <motion.div key="step4">{renderStep4()}</motion.div>}
      </AnimatePresence>

      {/* Navigation Buttons */}
      {step < 3.5 && (
        <div className="mt-10 flex justify-between items-center pt-6 border-t border-slate-800/50">
          <button
            onClick={handlePrev}
            className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-300 bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Retour
          </button>
          <button
            onClick={handleNext}
            className="flex items-center px-8 py-3 rounded-xl font-semibold bg-amber-500 hover:bg-amber-600 text-slate-900 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
          >
            Continuer
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};

// Icons (mocked for ones missing from lucide-react import list if necessary)
function InfoIcon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
}
function PackageIcon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
}

export default BatitechSimulator;
