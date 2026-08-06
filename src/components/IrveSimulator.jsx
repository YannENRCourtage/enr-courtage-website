import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Car, Zap, Battery, PlugZap, Settings2 } from 'lucide-react';

const CHARGE_STATIONS = [
  { id: 'murale', name: 'Prise murale', power: 2.3, color: 'bg-red-500' },
  { id: 'borne7', name: 'Borne', power: 7.4, color: 'bg-green-500' },
  { id: 'borne11', name: 'Borne', power: 11, color: 'bg-blue-600', isRecommended: 11 },
  { id: 'borne22', name: 'Borne', power: 22, color: 'bg-[#0f2847]', isRecommended: 22 },
];

const translateVehicleType = (type) => {
  if (!type) return 'Véhicule';
  const mapping = {
    'passenger_car': 'Berline',
    'suv': 'SUV',
    'hatchback': 'Citadine',
    'van': 'Utilitaire',
    'pickup': 'Pick-up',
    'estate': 'Break'
  };
  return mapping[type] || type;
};

const formatTime = (hoursFloat) => {
  if (!hoursFloat || !isFinite(hoursFloat)) return '00h00';
  let h = Math.floor(hoursFloat);
  let m = Math.round((hoursFloat - h) * 60);
  if (m === 60) {
    h += 1;
    m = 0;
  }
  return `${h.toString().padStart(2, '0')}h${m.toString().padStart(2, '0')}`;
};

const getBrandSlug = (makeName) => {
  const slugOverrides = {
    'mercedes-benz': 'mercedes-benz',
    'mercedes': 'mercedes-benz',
    'bmw': 'bmw',
    'volkswagen': 'volkswagen',
    'rolls-royce': 'rolls-royce',
    'land rover': 'land-rover',
    'alfa romeo': 'alfa-romeo',
    'aston martin': 'aston-martin',
    'general motors': 'general-motors',
    'mg': 'mg',
    'ds': 'ds',
    'byd': 'byd',
    'gmc': 'gmc',
    'nio': 'nio',
    'ora': 'ora',
    'jac': 'jac',
    'gap': 'gap',
  };
  const lower = (makeName || '').toLowerCase().trim();
  if (slugOverrides[lower]) return slugOverrides[lower];
  return lower.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

const LOCAL_LOGO_BRANDS = {
  'peugeot': '/images/brands/peugeot.png',
  'renault': '/images/brands/renault.png',
};

const getBrandLogoUrl = (makeName) => {
  if (!makeName) return null;
  const lower = makeName.toLowerCase().trim();
  if (LOCAL_LOGO_BRANDS[lower]) return LOCAL_LOGO_BRANDS[lower];
  const slug = getBrandSlug(makeName);
  return `https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/${slug}.png`;
};

const getConnectorDisplayName = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('ccs')) return 'CCS';
  if (t.includes('type1') || t.includes('j1772')) return 'Type 1';
  if (t.includes('chademo')) return 'CHAdeMO';
  return 'Type 2';
};

export default function IrveSimulator() {
  const [data, setData] = useState(null);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedVehicleCode, setSelectedVehicleCode] = useState('');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    fetch('/data/open-ev-data.json')
      .then(res => res.json())
      .then(json => {
        setData(json.vehicles || []);
        const peugeotVehicles = json.vehicles?.filter(v => v.make?.name?.toLowerCase() === 'peugeot');
        const defaultVehicle = peugeotVehicles?.find(v => v.model?.name?.toLowerCase().includes('2008'));
        
        if (defaultVehicle) {
          setSelectedMake(defaultVehicle.make.name);
          setSelectedVehicleCode(defaultVehicle.unique_code || JSON.stringify(defaultVehicle));
        } else if (json.vehicles?.length > 0) {
          setSelectedMake(json.vehicles[0].make.name);
          setSelectedVehicleCode(json.vehicles[0].unique_code || JSON.stringify(json.vehicles[0]));
        }
      })
      .catch(err => console.error("Erreur chargement EV Data:", err));
  }, []);

  const makes = useMemo(() => {
    if (!data) return [];
    const makeSet = new Set(data.map(v => v.make?.name).filter(Boolean));
    return Array.from(makeSet).sort();
  }, [data]);

  const vehiclesOfMake = useMemo(() => {
    if (!data || !selectedMake) return [];
    return data
      .filter(v => v.make?.name === selectedMake)
      .sort((a, b) => {
        const nameA = `${a.model?.name} ${a.year}`.toLowerCase();
        const nameB = `${b.model?.name} ${b.year}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [data, selectedMake]);

  const handleMakeChange = (e) => {
    const make = e.target.value;
    setSelectedMake(make);
    setLogoError(false);
    const newVehicles = data.filter(v => v.make?.name === make);
    if (newVehicles.length > 0) {
      setSelectedVehicleCode(newVehicles[0].unique_code || JSON.stringify(newVehicles[0]));
    } else {
      setSelectedVehicleCode('');
    }
  };

  const selectedVehicle = useMemo(() => {
    if (!vehiclesOfMake || !selectedVehicleCode) return null;
    return vehiclesOfMake.find(v => (v.unique_code || JSON.stringify(v)) === selectedVehicleCode);
  }, [vehiclesOfMake, selectedVehicleCode]);

  const getVehicleName = (v) => {
    if (!v) return '';
    return `${v.model?.name || ''} ${v.variant?.name ? v.variant.name : ''} - ${v.year || ''}`.trim().replace(/^ - | - $/g, '');
  };

  const batteryCapacity = selectedVehicle?.battery?.pack_capacity_kwh_net || selectedVehicle?.battery?.pack_capacity_kwh_gross || 0;
  const acPower = selectedVehicle?.charging?.ac?.max_power_kw || 0;
  const connector = selectedVehicle?.charge_ports?.[0]?.connector || 'Type 2';
  
  const rangeKms = selectedVehicle?.range?.rated?.[0]?.range_km;
  const autonomy = rangeKms ? `${Math.round(rangeKms)} km` : 'NC';
  
  const logoUrl = selectedMake ? getBrandLogoUrl(selectedMake) : null;

  const calculateChargingStats = () => {
    if (!batteryCapacity || !acPower) return [];
    let recommendedFound = false;
    return CHARGE_STATIONS.map((station, index) => {
      const actualPower = Math.min(station.power, acPower);
      const timeHours = batteryCapacity / actualPower;
      let isRecommended = false;
      if (index > 0 && station.power >= acPower && !recommendedFound) {
        isRecommended = true;
        recommendedFound = true;
      }
      return {
        ...station,
        timeHours,
        timeFormatted: formatTime(timeHours),
        isRecommended
      };
    });
  };

  const chargingStats = calculateChargingStats();
  if (chargingStats.length > 0 && !chargingStats.some(s => s.isRecommended)) {
    chargingStats[chargingStats.length - 1].isRecommended = true;
  }
  const maxTimeHours = Math.max(...chargingStats.map(s => s.timeHours), 1); // Avoid division by zero

  const isPhev = selectedVehicle?.model?.name?.toLowerCase().includes('phev') || 
                 selectedVehicle?.trim?.name?.toLowerCase().includes('phev') || 
                 selectedVehicle?.unique_code?.toLowerCase().includes('phev') || 
                 selectedVehicle?.model?.name?.toLowerCase().includes('hybrid') || 
                 selectedVehicle?.unique_code?.toLowerCase().includes('hybrid') || 
                 selectedVehicle?.model?.name?.toLowerCase().includes('ehybrid');
  const energyType = isPhev ? 'Hybride Rechargeable Essence' : 'Électrique';

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-[#0f2847] p-6 text-white flex items-center gap-4">
        <div className="bg-[#0f9b8e] p-3 rounded-full shadow-lg">
          <PlugZap className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold m-0">Votre véhicule électrique</h2>
          <p className="text-blue-100 text-sm mt-1">Simulez le temps de recharge de votre véhicule</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row p-6 gap-8">
        {/* Left Panel: Selection & Info */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Marque</label>
              <div className="relative">
                <select
                  value={selectedMake}
                  onChange={handleMakeChange}
                  disabled={!data}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#d4a843]"
                >
                  <option value="" disabled>Sélectionnez une marque</option>
                  {makes.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Modèle</label>
              <div className="relative">
                <select
                  value={selectedVehicleCode}
                  onChange={(e) => setSelectedVehicleCode(e.target.value)}
                  disabled={!selectedMake || vehiclesOfMake.length === 0}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#d4a843]"
                >
                  <option value="" disabled>Sélectionnez un modèle</option>
                  {vehiclesOfMake.map(v => (
                    <option key={v.unique_code || JSON.stringify(v)} value={v.unique_code || JSON.stringify(v)}>
                      {getVehicleName(v)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {selectedVehicle && (
            <motion.div 
              key={selectedVehicleCode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 rounded-xl p-5 border border-gray-100 relative"
            >
              <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm border border-gray-100 flex items-center gap-1">
                <Settings2 className="w-3 h-3" />
                {getConnectorDisplayName(connector)}
              </div>
              
              <div className="flex justify-center mb-6 mt-4">
                <div className="w-40 h-24 bg-white rounded-lg flex items-center justify-center shadow-inner relative overflow-hidden border border-gray-100 p-2">
                  {logoUrl && !logoError ? (
                    <img 
                      src={logoUrl} 
                      alt={`Logo ${selectedMake}`} 
                      className="max-w-[80%] max-h-[80%] object-contain"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <Car className="w-16 h-16 text-gray-300" />
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-[#0f2847] mb-1">{selectedMake} {getVehicleName(selectedVehicle)}</h3>
              <p className="text-gray-500 text-sm mb-4 capitalize">{translateVehicleType(selectedVehicle.vehicle_type)} - {energyType}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Battery className="w-5 h-5 text-[#0f9b8e]" />
                    <span className="text-sm font-medium">Capacité batterie</span>
                  </div>
                  <span className="font-bold text-[#0f2847]">{batteryCapacity} kWh</span>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Zap className="w-5 h-5 text-[#d4a843]" />
                    <span className="text-sm font-medium">Puissance de charge max</span>
                  </div>
                  <span className="font-bold text-[#0f2847]">{acPower} kW</span>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Car className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">Autonomie (WLTP)</span>
                  </div>
                  <span className="font-bold text-[#0f2847]">{autonomy}</span>
                </div>
              </div>
            </motion.div>
          )}

          <p className="text-xs text-gray-400 text-justify italic">
            * Les données présentées peuvent varier suivant le modèle ou les options - vérifiez la puissance de charge de votre véhicule pour confirmer les résultats. La puissance de charge acceptée par votre véhicule est plafonnée à {acPower} kW.
          </p>
        </div>

        {/* Right Panel: Chart */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <h3 className="text-lg font-bold text-[#0f2847] mb-6 border-b border-gray-100 pb-2">
            Comparatif des temps de recharge de 0 à 100%
          </h3>
          
          <div className="flex-grow flex items-end justify-around gap-2 sm:gap-6 pt-12 pb-4 h-64 sm:h-80 relative">
            {chargingStats.map((charger, idx) => {
              const baseTime = chargingStats.length > 0 ? chargingStats[0].timeHours : maxTimeHours;
              const gainHours = baseTime - charger.timeHours;
              const gainFormatted = formatTime(gainHours);
              
              const isWallPlug = idx === 0;
              
              // Percentages
              const fillPercent = Math.max(10, (charger.timeHours / maxTimeHours) * 100);
              const minGreen = 15;
              const gainPercent = gainHours > 0 ? Math.max((gainHours / maxTimeHours) * 100, minGreen) : 0;
              
              return (
                <div key={idx} className="flex flex-col items-center justify-end w-full h-full relative group">
                  {charger.isRecommended && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-12 bg-gradient-to-r from-[#0f9b8e] to-teal-400 text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap z-10 animate-pulse border-2 border-white"
                    >
                      Recommandé
                    </motion.div>
                  )}
                  
                  <div className="w-full max-w-[80px] flex-1 flex flex-col justify-end relative group">
                    
                    {!isWallPlug && gainHours > 0 && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${gainPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                        className={`w-full bg-[#10b981] flex flex-col items-center justify-center relative shadow-sm ${charger.isRecommended ? 'ring-4 ring-offset-0 ring-[#0f9b8e]/50 border-b border-[#0f9b8e]/50 rounded-t-lg' : 'rounded-t-lg'}`}
                      >
                        {gainPercent >= minGreen && (
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] sm:text-[10px] font-bold text-white/90 leading-tight">Gagné</span>
                            <span className="text-xs sm:text-sm font-extrabold text-white leading-tight">{gainFormatted}</span>
                          </div>
                        )}
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${fillPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                      className={`w-full flex items-center justify-center relative shadow-sm ${charger.color} ${
                        isWallPlug ? 'rounded-t-lg' : ''
                      } ${
                        charger.isRecommended && (!gainHours || gainHours <= 0) ? 'ring-4 ring-[#0f9b8e]/50 rounded-t-lg' : ''
                      } ${
                        charger.isRecommended && gainHours > 0 ? 'ring-4 ring-offset-0 ring-[#0f9b8e]/50 border-t-0 ring-t-0' : ''
                      }`}
                    >
                      <span className={`font-bold text-white text-sm sm:text-base ${fillPercent < 15 ? "absolute -top-6 text-[#0f2847]" : ""}`}>
                        {charger.timeFormatted}
                      </span>
                    </motion.div>
                  </div>
                  
                  <div className="text-center mt-3 h-10 flex flex-col items-center justify-center">
                    <span className="text-xs sm:text-sm font-semibold text-gray-700 leading-tight">{charger.name}</span>
                    <span className="text-xs text-gray-500 font-bold">{charger.power} kW</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-auto bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start gap-3">
            <div className="mt-0.5 text-[#0f9b8e]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <strong className="text-[#0f2847]">Le saviez-vous ?</strong> Le temps de charge est limité par le chargeur embarqué de votre véhicule. Même sur une borne 22 kW, votre {selectedMake} ne chargera pas à plus de {acPower} kW.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
