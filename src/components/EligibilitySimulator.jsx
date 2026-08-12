import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, CheckCircle2, AlertCircle, XCircle, Info, Globe, HelpCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Utilisation d'une configuration d'icône plus sûre pour Vite
const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const TARGET_REGIONS = ["Nouvelle-Aquitaine", "Occitanie", "Provence-Alpes-Côte d'Azur", "Provence"];

// Helper component to center map on new location
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Component to handle map clicks
function LocationSelector({ setLocation, fetchAddressFromCoords }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setLocation({ lat, lng });
      fetchAddressFromCoords(lat, lng);
    },
  });
  return null;
}

const EligibilitySimulator = () => {
  const [address, setAddress] = useState('');
  const [projectType, setProjectType] = useState('');
  const [distance, setDistance] = useState('');
  const [dontKnowDistance, setDontKnowDistance] = useState(false);
  const [location, setLocation] = useState({ lat: 46.2276, lng: 2.2137 }); // France center by default
  const [zoom, setZoom] = useState(5);
  const [region, setRegion] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Result state
  const [eligibility, setEligibility] = useState(null); // 'realisable' | 'etude' | 'non_realisable'

  const searchAddress = async (query) => {
    if (!query) return;
    setIsSearching(true);
    setSearchError('');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=fr&addressdetails=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        const newLocation = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        setLocation(newLocation);
        setZoom(13);
        const state = result.address?.state || '';
        setRegion(state);
        // Clean address for display
        setAddress(result.display_name.split(',').slice(0, 3).join(','));
      } else {
        setSearchError("Adresse introuvable. Veuillez préciser (ex: ville, code postal).");
      }
    } catch (error) {
      console.error("Erreur géocodage:", error);
      setSearchError("Erreur de recherche.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchAddress(address);
  };

  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await response.json();
      if (data) {
        const state = data.address?.state || '';
        setRegion(state);
        setAddress(data.display_name.split(',').slice(0, 3).join(','));
      }
    } catch (error) {
      console.error("Erreur reverse geocoding:", error);
    }
  };

  const markerDragEnd = (e) => {
    const marker = e.target;
    const position = marker.getLatLng();
    setLocation({ lat: position.lat, lng: position.lng });
    fetchAddressFromCoords(position.lat, position.lng);
  };

  useEffect(() => {
    // Evaluation de l'éligibilité
    if (!projectType || !region) {
      setEligibility(null);
      return;
    }

    const distNum = parseInt(distance, 10);
    const isDistOk = !dontKnowDistance && !isNaN(distNum) && distNum < 200;
    const isTargetRegion = TARGET_REGIONS.some(r => region.includes(r));

    if (dontKnowDistance || (distance !== '' && !isDistOk)) {
      setEligibility('non_realisable');
    } else if (isTargetRegion && isDistOk) {
      setEligibility('realisable');
    } else if (!isTargetRegion && isDistOk) {
      setEligibility('etude');
    } else {
      setEligibility(null);
    }
  }, [projectType, distance, dontKnowDistance, region]);

  return (
    <section className="py-20 bg-gray-50 overflow-hidden" id="simulateur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            Simulateur d'éligibilité
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Testez la faisabilité de votre projet de bâtiment ou d'ombrière photovoltaïque en quelques clics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
          
          {/* Formulaire & Carte */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
          >
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Type de projet */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">1. Type de projet envisagé</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setProjectType('batiment')}
                    className={`py-3 px-4 rounded-xl border-2 transition-all ${
                      projectType === 'batiment' 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' 
                        : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    Bâtiment neuf
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectType('ombriere')}
                    className={`py-3 px-4 rounded-xl border-2 transition-all ${
                      projectType === 'ombriere' 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' 
                        : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    Ombrière parking
                  </button>
                </div>
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">2. Adresse du projet</label>
                <form onSubmit={handleSearchSubmit} className="flex space-x-2 mb-4">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Saisissez une adresse..."
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSearching ? '...' : <Search className="h-5 w-5" />}
                  </button>
                </form>
                {searchError && <p className="text-sm text-red-500 mb-3">{searchError}</p>}
                
                {/* Carte */}
                <div className="h-64 rounded-xl overflow-hidden border border-gray-200 shadow-inner relative z-0">
                  <MapContainer 
                    center={location} 
                    zoom={zoom} 
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <ChangeView center={location} zoom={zoom} />
                    <LocationSelector setLocation={setLocation} fetchAddressFromCoords={fetchAddressFromCoords} />
                    <Marker 
                      position={location} 
                      draggable={true} 
                      eventHandlers={{ dragend: markerDragEnd }} 
                      icon={defaultIcon}
                    />
                  </MapContainer>
                  <div className="absolute top-2 right-2 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 shadow-sm border border-gray-200 flex items-center">
                    <Globe className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                    Déplacez le marqueur
                  </div>
                </div>
              </div>

              {/* Distance Transformateur */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  3. Distance jusqu'au transformateur ENEDIS
                </label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-grow">
                      <input
                        type="number"
                        min="0"
                        value={dontKnowDistance ? '' : distance}
                        onChange={(e) => {
                          setDistance(e.target.value);
                          setDontKnowDistance(false);
                        }}
                        disabled={dontKnowDistance}
                        placeholder="Ex: 150"
                        className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm font-medium">mètres</span>
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={dontKnowDistance}
                      onChange={(e) => setDontKnowDistance(e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-colors"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 flex items-center">
                      <HelpCircle className="w-4 h-4 mr-1.5 text-gray-400" />
                      Je ne sais pas
                    </span>
                  </label>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Résultats */}
          <div className="flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {!eligibility && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-300 flex flex-col items-center justify-center h-full min-h-[400px]"
                >
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <Search className="h-10 w-10 text-blue-500 opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">En attente de vos informations</h3>
                  <p className="text-gray-500">
                    Remplissez les informations ci-contre pour estimer instantanément la faisabilité de votre projet.
                  </p>
                </motion.div>
              )}

              {eligibility === 'realisable' && (
                <motion.div
                  key="realisable"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-10 border border-green-200 h-full flex flex-col justify-center relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <CheckCircle2 className="w-48 h-48 text-green-600" />
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-xl mb-6">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-900 mb-4">Projet Réalisable</h3>
                    <p className="text-lg text-green-800 mb-8 leading-relaxed">
                      Excellente nouvelle ! Les conditions de votre projet sont optimales pour une réalisation <strong>100% financée</strong>.
                    </p>
                    <div className="space-y-4">
                      <p className="flex items-start text-green-700">
                        <span className="mr-3 font-bold text-green-500">•</span>
                        Distance de raccordement idéale ({distance}m)
                      </p>
                      <p className="flex items-start text-green-700">
                        <span className="mr-3 font-bold text-green-500">•</span>
                        Région avec un bon ensoleillement ({region})
                      </p>
                    </div>
                    <div className="mt-10">
                      <a href="#contact" className="inline-block w-full text-center px-8 py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/30 hover:bg-green-700 transition-all transform hover:-translate-y-1">
                        Demander mon étude gratuite
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}

              {eligibility === 'etude' && (
                <motion.div
                  key="etude"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-10 border border-blue-200 h-full flex flex-col justify-center relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Info className="w-48 h-48 text-blue-600" />
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-xl mb-6">
                      <Info className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Projet à Étudier</h3>
                    <p className="text-lg text-blue-800 mb-8 leading-relaxed">
                      Votre projet présente un potentiel, mais nécessite une étude d'ensoleillement et de productible plus approfondie dans votre région.
                    </p>
                    <div className="bg-white/60 p-5 rounded-xl border border-blue-100 mb-8">
                      <p className="text-blue-900 text-sm">
                        La distance de raccordement ({distance}m) est bonne, mais votre région ({region || 'non spécifiée'}) nécessite une validation technique par nos ingénieurs pour garantir le modèle économique.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <a href="#contact" className="inline-block w-full text-center px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all transform hover:-translate-y-1">
                        Obtenir l'avis d'un expert
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}

              {eligibility === 'non_realisable' && (
                <motion.div
                  key="non_realisable"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-10 border border-amber-200 h-full flex flex-col justify-center relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <AlertCircle className="w-48 h-48 text-amber-600" />
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-xl mb-6">
                      <AlertCircle className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Étude approfondie requise</h3>
                    <p className="text-lg text-amber-800 mb-8 leading-relaxed">
                      Dans cette configuration, le projet n'est probablement pas réalisable sans reste à charge de votre part.
                    </p>
                    
                    <div className="space-y-3 mb-8">
                      {dontKnowDistance ? (
                        <p className="text-amber-700 bg-amber-100/50 p-4 rounded-lg text-sm flex items-start">
                          <XCircle className="w-5 h-5 mr-2 shrink-0 text-amber-600" />
                          La distance au transformateur est un élément crucial du coût. Nous devons la déterminer ensemble.
                        </p>
                      ) : (
                        <p className="text-amber-700 bg-amber-100/50 p-4 rounded-lg text-sm flex items-start">
                          <XCircle className="w-5 h-5 mr-2 shrink-0 text-amber-600" />
                          Une distance de {distance}m engendre des coûts de raccordement importants (tranchées, câblage).
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      <p className="text-sm font-medium text-amber-900 mb-3">Nous avons peut-être d'autres solutions :</p>
                      <a href="#contact" className="inline-block w-full text-center px-8 py-4 bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-600/30 hover:bg-amber-700 transition-all transform hover:-translate-y-1">
                        Contacter un conseiller
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

export default EligibilitySimulator;
