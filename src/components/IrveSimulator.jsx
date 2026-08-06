import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, Battery, Zap, Settings2, PlugZap } from 'lucide-react';

const vehicleDatabase = {
  "Audi": [
    { model: "Q4 e-tron - 2024", type: "SUV - Électrique", battery: 77, chargePower: 11, range: 520, connector: "CCS" },
    { model: "Q4 Sportback e-tron - 2024", type: "SUV - Électrique", battery: 77, chargePower: 11, range: 535, connector: "CCS" },
    { model: "e-tron GT - 2024", type: "Berline - Électrique", battery: 93, chargePower: 22, range: 488, connector: "CCS" },
    { model: "Q8 e-tron - 2024", type: "SUV - Électrique", battery: 106, chargePower: 22, range: 582, connector: "CCS" },
    { model: "A6 e-tron - 2025", type: "Berline - Électrique", battery: 100, chargePower: 22, range: 700, connector: "CCS" },
  ],
  "BMW": [
    { model: "i4 eDrive40 - 2024", type: "Berline - Électrique", battery: 83, chargePower: 11, range: 590, connector: "CCS" },
    { model: "iX1 xDrive30 - 2024", type: "SUV - Électrique", battery: 65, chargePower: 11, range: 440, connector: "CCS" },
    { model: "iX xDrive50 - 2024", type: "SUV - Électrique", battery: 105, chargePower: 11, range: 630, connector: "CCS" },
    { model: "i5 eDrive40 - 2024", type: "Berline - Électrique", battery: 84, chargePower: 11, range: 582, connector: "CCS" },
    { model: "iX3 - 2023", type: "SUV - Électrique", battery: 74, chargePower: 11, range: 460, connector: "CCS" },
  ],
  "BYD": [
    { model: "Atto 3 - 2024", type: "SUV - Électrique", battery: 60, chargePower: 11, range: 420, connector: "CCS" },
    { model: "Seal - 2024", type: "Berline - Électrique", battery: 82, chargePower: 11, range: 570, connector: "CCS" },
    { model: "Dolphin - 2024", type: "Citadine - Électrique", battery: 60, chargePower: 11, range: 427, connector: "CCS" },
  ],
  "Citroën": [
    { model: "ë-C4 - 2023", type: "Berline - Électrique", battery: 50, chargePower: 11, range: 354, connector: "CCS" },
    { model: "ë-C4 X - 2023", type: "Berline - Électrique", battery: 50, chargePower: 11, range: 360, connector: "CCS" },
    { model: "ë-Berlingo - 2023", type: "Ludospace - Électrique", battery: 50, chargePower: 11, range: 280, connector: "CCS" },
  ],
  "Cupra": [
    { model: "Born - 2024", type: "Berline - Électrique", battery: 77, chargePower: 11, range: 548, connector: "CCS" },
    { model: "Tavascan - 2024", type: "SUV - Électrique", battery: 77, chargePower: 11, range: 517, connector: "CCS" },
  ],
  "Dacia": [
    { model: "Spring - 2024", type: "Citadine - Électrique", battery: 27, chargePower: 7, range: 220, connector: "CCS" },
  ],
  "Fiat": [
    { model: "500e - 2024", type: "Citadine - Électrique", battery: 42, chargePower: 11, range: 321, connector: "CCS" },
    { model: "600e - 2024", type: "SUV - Électrique", battery: 54, chargePower: 11, range: 409, connector: "CCS" },
  ],
  "Ford": [
    { model: "Mustang Mach-E - 2024", type: "SUV - Électrique", battery: 91, chargePower: 11, range: 600, connector: "CCS" },
    { model: "Explorer EV - 2025", type: "SUV - Électrique", battery: 77, chargePower: 11, range: 500, connector: "CCS" },
  ],
  "Hyundai": [
    { model: "Ioniq 5 - 2024", type: "SUV - Électrique", battery: 77, chargePower: 11, range: 507, connector: "CCS" },
    { model: "Ioniq 6 - 2024", type: "Berline - Électrique", battery: 77, chargePower: 11, range: 614, connector: "CCS" },
    { model: "Kona Electric - 2024", type: "SUV - Électrique", battery: 65, chargePower: 11, range: 454, connector: "CCS" },
  ],
  "Jaguar": [
    { model: "I-PACE - 2024", type: "SUV - Électrique", battery: 90, chargePower: 11, range: 470, connector: "CCS" },
  ],
  "Kia": [
    { model: "EV6 - 2024", type: "SUV - Électrique", battery: 77, chargePower: 11, range: 528, connector: "CCS" },
    { model: "EV9 - 2024", type: "SUV - Électrique", battery: 100, chargePower: 11, range: 541, connector: "CCS" },
    { model: "Niro EV - 2024", type: "SUV - Électrique", battery: 65, chargePower: 11, range: 460, connector: "CCS" },
  ],
  "MG": [
    { model: "MG4 Standard - 2024", type: "Berline - Électrique", battery: 51, chargePower: 11, range: 350, connector: "CCS" },
    { model: "MG4 Long Range - 2024", type: "Berline - Électrique", battery: 64, chargePower: 11, range: 450, connector: "CCS" },
    { model: "ZS EV - 2024", type: "SUV - Électrique", battery: 51, chargePower: 11, range: 320, connector: "CCS" },
  ],
  "MINI": [
    { model: "Cooper SE - 2024", type: "Citadine - Électrique", battery: 54, chargePower: 11, range: 402, connector: "CCS" },
    { model: "Countryman SE - 2025", type: "SUV - Électrique", battery: 66, chargePower: 22, range: 432, connector: "CCS" },
  ],
  "Mercedes-Benz": [
    { model: "EQA - 2023", type: "SUV - Électrique", battery: 66, chargePower: 11, range: 426, connector: "CCS" },
    { model: "EQA 350 4MATIC - 2023", type: "SUV - Électrique", battery: 66, chargePower: 11, range: 385, connector: "CCS" },
    { model: "EQA 350 4MATIC - 2024", type: "SUV - Électrique", battery: 70, chargePower: 11, range: 410, connector: "CCS" },
    { model: "EQB 350 4MATIC - 2023", type: "SUV - Électrique", battery: 66, chargePower: 11, range: 390, connector: "CCS" },
    { model: "EQC 400 - 2023", type: "SUV - Électrique", battery: 80, chargePower: 11, range: 414, connector: "CCS" },
    { model: "EQS 450+ - 2023", type: "Berline - Électrique", battery: 108, chargePower: 22, range: 770, connector: "CCS" },
    { model: "CLA EV - 2025", type: "Berline - Électrique", battery: 58, chargePower: 11, range: 380, connector: "CCS" },
    { model: "EQA - 2024", type: "SUV - Électrique", battery: 70, chargePower: 11, range: 432, connector: "CCS" },
  ],
  "Nissan": [
    { model: "Leaf e+ - 2023", type: "Berline - Électrique", battery: 62, chargePower: 6.6, range: 385, connector: "CHAdeMO" },
    { model: "Ariya 87kWh - 2024", type: "SUV - Électrique", battery: 87, chargePower: 22, range: 533, connector: "CCS" },
  ],
  "Opel": [
    { model: "Corsa Electric - 2024", type: "Citadine - Électrique", battery: 50, chargePower: 11, range: 359, connector: "CCS" },
    { model: "Mokka Electric - 2024", type: "SUV - Électrique", battery: 50, chargePower: 11, range: 338, connector: "CCS" },
    { model: "Astra Electric - 2024", type: "Berline - Électrique", battery: 54, chargePower: 11, range: 416, connector: "CCS" },
  ],
  "Peugeot": [
    { model: "e-208 - 2023", type: "Citadine - Électrique", battery: 50, chargePower: 11, range: 362, connector: "CCS" },
    { model: "e-2008 - 2023", type: "SUV - Électrique", battery: 48, chargePower: 11, range: 345, connector: "CCS" },
    { model: "e-308 - 2023", type: "Berline - Électrique", battery: 54, chargePower: 11, range: 410, connector: "CCS" },
    { model: "e-3008 - 2025", type: "SUV - Électrique", battery: 73, chargePower: 11, range: 525, connector: "CCS" },
    { model: "e-5008 - 2025", type: "SUV - Électrique", battery: 73, chargePower: 11, range: 502, connector: "CCS" },
  ],
  "Porsche": [
    { model: "Taycan - 2024", type: "Berline - Électrique", battery: 93, chargePower: 22, range: 484, connector: "CCS" },
    { model: "Macan Electric - 2025", type: "SUV - Électrique", battery: 100, chargePower: 22, range: 590, connector: "CCS" },
  ],
  "Renault": [
    { model: "Mégane E-Tech - 2023", type: "Berline - Électrique", battery: 60, chargePower: 22, range: 450, connector: "CCS" },
    { model: "Scenic E-Tech - 2024", type: "Monospace - Électrique", battery: 87, chargePower: 22, range: 620, connector: "CCS" },
    { model: "Zoe R135 - 2023", type: "Citadine - Électrique", battery: 52, chargePower: 22, range: 395, connector: "Type 2" },
    { model: "R5 E-Tech - 2025", type: "Citadine - Électrique", battery: 52, chargePower: 11, range: 400, connector: "CCS" },
    { model: "Twingo E-Tech - 2026", type: "Citadine - Électrique", battery: 37, chargePower: 11, range: 300, connector: "CCS" },
  ],
  "Skoda": [
    { model: "Enyaq iV 80 - 2024", type: "SUV - Électrique", battery: 77, chargePower: 11, range: 534, connector: "CCS" },
    { model: "Enyaq Coupé iV 80 - 2024", type: "SUV Coupé - Électrique", battery: 77, chargePower: 11, range: 545, connector: "CCS" },
  ],
  "Tesla": [
    { model: "Model 3 - 2024", type: "Berline - Électrique", battery: 60, chargePower: 11, range: 513, connector: "CCS" },
    { model: "Model 3 Long Range - 2024", type: "Berline - Électrique", battery: 75, chargePower: 11, range: 629, connector: "CCS" },
    { model: "Model Y - 2024", type: "SUV - Électrique", battery: 60, chargePower: 11, range: 455, connector: "CCS" },
    { model: "Model Y Long Range - 2024", type: "SUV - Électrique", battery: 75, chargePower: 11, range: 533, connector: "CCS" },
    { model: "Model S - 2023", type: "Berline - Électrique", battery: 100, chargePower: 11, range: 634, connector: "CCS" },
    { model: "Model X - 2023", type: "SUV - Électrique", battery: 100, chargePower: 11, range: 576, connector: "CCS" },
  ],
  "Volkswagen": [
    { model: "ID.3 Pro S - 2024", type: "Berline - Électrique", battery: 77, chargePower: 11, range: 550, connector: "CCS" },
    { model: "ID.4 Pro - 2024", type: "SUV - Électrique", battery: 77, chargePower: 11, range: 520, connector: "CCS" },
    { model: "ID.5 GTX - 2024", type: "SUV Coupé - Électrique", battery: 77, chargePower: 11, range: 490, connector: "CCS" },
    { model: "ID.7 Pro S - 2024", type: "Berline - Électrique", battery: 86, chargePower: 22, range: 700, connector: "CCS" },
    { model: "ID.Buzz - 2024", type: "Monospace - Électrique", battery: 77, chargePower: 11, range: 418, connector: "CCS" },
  ],
  "Volvo": [
    { model: "EX30 - 2024", type: "SUV - Électrique", battery: 51, chargePower: 11, range: 344, connector: "CCS" },
    { model: "EX40 (XC40) - 2024", type: "SUV - Électrique", battery: 69, chargePower: 11, range: 438, connector: "CCS" },
    { model: "EC40 (C40) - 2024", type: "SUV Coupé - Électrique", battery: 69, chargePower: 11, range: 476, connector: "CCS" },
    { model: "EX90 - 2025", type: "SUV - Électrique", battery: 107, chargePower: 11, range: 600, connector: "CCS" },
  ],
};

const brandLogos = {
  "Peugeot": "🦁", "Renault": "♦️", "Tesla": "⚡", "BMW": "🔵", 
  "Mercedes-Benz": "⭐", "Audi": "⭕", "Volkswagen": "W", "Hyundai": "H", 
  "Kia": "K", "Citroën": "⚙️", "Fiat": "F", "Opel": "⚡", 
  "Volvo": "V", "BYD": "B", "MG": "M", "Dacia": "D", 
  "Nissan": "N", "Ford": "🐎", "Cupra": "C", "Skoda": "S", 
  "MINI": "M", "Porsche": "🐎", "Jaguar": "🐆"
};

const chargers = [
  { name: 'Prise murale', power: 2.3, color: 'bg-red-500' },
  { name: 'Borne', power: 7.4, color: 'bg-green-500' },
  { name: 'Borne', power: 11, color: 'bg-blue-600', isRecommended: 11 },
  { name: 'Borne', power: 22, color: 'bg-[#0f2847]', isRecommended: 22 },
];

function calculateChargeTime(batteryCapacity, vehicleChargePower, chargerPower) {
  const effectivePower = Math.min(vehicleChargePower, chargerPower);
  const timeHours = batteryCapacity / effectivePower;
  const hours = Math.floor(timeHours);
  const minutes = Math.round((timeHours - hours) * 60);
  return { hours, minutes, totalMinutes: hours * 60 + minutes };
}

function formatTime(hours, minutes) {
  return `${hours.toString().padStart(2, '0')}h${minutes.toString().padStart(2, '0')}`;
}

const IrveSimulator = () => {
  const brands = Object.keys(vehicleDatabase).sort();
  const [selectedBrand, setSelectedBrand] = useState("Peugeot");
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);

  const selectedVehicle = useMemo(() => {
    return vehicleDatabase[selectedBrand][selectedModelIndex] || vehicleDatabase[selectedBrand][0];
  }, [selectedBrand, selectedModelIndex]);

  useEffect(() => {
    setSelectedModelIndex(0);
  }, [selectedBrand]);

  const recommendedChargerPower = selectedVehicle.chargePower >= 22 ? 22 : 11;

  const chargeTimes = useMemo(() => {
    return chargers.map(charger => {
      const time = calculateChargeTime(selectedVehicle.battery, selectedVehicle.chargePower, charger.power);
      return {
        ...charger,
        ...time,
        recommended: charger.isRecommended === recommendedChargerPower
      };
    });
  }, [selectedVehicle]);

  const maxTotalMinutes = Math.max(...chargeTimes.map(ct => ct.totalMinutes));

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden font-sans border border-gray-100">
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
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#d4a843]"
                >
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brandLogos[brand] || "🚗"} {brand}</option>
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
                  value={selectedModelIndex}
                  onChange={(e) => setSelectedModelIndex(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#d4a843]"
                >
                  {vehicleDatabase[selectedBrand].map((vehicle, idx) => (
                    <option key={idx} value={idx}>{vehicle.model}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>

          <motion.div 
            key={`${selectedBrand}-${selectedModelIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 rounded-xl p-5 border border-gray-100 relative"
          >
            <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm border border-gray-100 flex items-center gap-1">
              <Settings2 className="w-3 h-3" />
              {selectedVehicle.connector}
            </div>
            
            <div className="flex justify-center mb-6 mt-4">
              <div className="w-40 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center shadow-inner relative overflow-hidden">
                <Car className="w-16 h-16 text-gray-400 opacity-50" />
                <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-gray-900/10 to-transparent"></div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-[#0f2847] mb-1">{selectedBrand} {selectedVehicle.model}</h3>
            <p className="text-gray-500 text-sm mb-4">{selectedVehicle.type}</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                <div className="flex items-center gap-3 text-gray-600">
                  <Battery className="w-5 h-5 text-[#0f9b8e]" />
                  <span className="text-sm font-medium">Capacité batterie</span>
                </div>
                <span className="font-bold text-[#0f2847]">{selectedVehicle.battery} kWh</span>
              </div>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                <div className="flex items-center gap-3 text-gray-600">
                  <Zap className="w-5 h-5 text-[#d4a843]" />
                  <span className="text-sm font-medium">Puissance de charge max</span>
                </div>
                <span className="font-bold text-[#0f2847]">{selectedVehicle.chargePower} kW</span>
              </div>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                <div className="flex items-center gap-3 text-gray-600">
                  <Car className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Autonomie (WLTP)</span>
                </div>
                <span className="font-bold text-[#0f2847]">{selectedVehicle.range} km</span>
              </div>
            </div>
          </motion.div>

          <p className="text-xs text-gray-400 text-justify italic">
            * Les données présentées peuvent varier suivant le modèle ou les options - vérifiez la puissance de charge de votre véhicule pour confirmer les résultats. La puissance de charge acceptée par votre véhicule est plafonnée à {selectedVehicle.chargePower} kW.
          </p>
        </div>

        {/* Right Panel: Chart */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <h3 className="text-lg font-bold text-[#0f2847] mb-6 border-b border-gray-100 pb-2">
            Comparatif des temps de recharge de 0 à 100%
          </h3>
          
          <div className="flex-grow flex items-end justify-around gap-2 sm:gap-6 pt-12 pb-4 h-64 sm:h-80 relative">
            {chargeTimes.map((charger, idx) => {
              // Calculate height percentage relative to the maximum time, but ensure a minimum height
              const heightPercent = Math.max(15, (charger.totalMinutes / maxTotalMinutes) * 100);
              
              return (
                <div key={idx} className="flex flex-col items-center justify-end w-full h-full relative group">
                  {charger.recommended && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-10 bg-[#0f9b8e] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap z-10"
                    >
                      Recommandé
                    </motion.div>
                  )}
                  
                  <div className="text-center font-bold text-[#0f2847] mb-2 text-sm sm:text-base">
                    {formatTime(charger.hours, charger.minutes)}
                  </div>
                  
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                    className={`w-full max-w-[80px] rounded-t-lg shadow-sm ${charger.color} ${charger.recommended ? 'ring-4 ring-[#0f9b8e]/30' : ''}`}
                  >
                  </motion.div>
                  
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
                <strong className="text-[#0f2847]">Le saviez-vous ?</strong> Le temps de charge est limité par le chargeur embarqué de votre véhicule. Même sur une borne 22 kW, votre {selectedBrand} ne chargera pas à plus de {selectedVehicle.chargePower} kW.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrveSimulator;
