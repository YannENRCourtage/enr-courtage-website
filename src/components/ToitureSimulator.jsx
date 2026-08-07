import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Search, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, 
  Sun, Zap, Leaf, Home, Award, Info, ShieldCheck, Sparkles, FileText,
  RotateCcw, AlertCircle, PhoneCall, Check, Lock, Send, Building, DollarSign
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

// Icône de poignée de coin avec zone tactile
const createHandleIcon = (label) => new L.DivIcon({
  className: 'custom-handle-icon',
  html: `<div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; cursor: grab;">
          <div style="background-color: #84cc16; border: 3px solid #ffffff; width: 24px; height: 24px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
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
function SatelliteMap({ step, centerCoords, setCenterCoords, roofCorners, setRoofCorners, setSurfaceM2, onAddressUpdated }) {
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
      // Marqueur central vert
      const centerMarkerIcon = new L.DivIcon({
        className: 'custom-center-marker',
        html: `<div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
                <div style="background-color: #84cc16; border: 4px solid #ffffff; width: 26px; height: 26px; border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;">
                  <div style="background-color: #ffffff; width: 8px; height: 8px; border-radius: 50%;"></div>
                </div>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      L.marker([centerCoords.lat, centerCoords.lng], { icon: centerMarkerIcon, interactive: false }).addTo(group);
    }

    if (step === 3 && roofCorners && roofCorners.length === 4) {
      const polygon = L.polygon(roofCorners.map(c => [c.lat, c.lng]), {
        color: '#84cc16',
        fillColor: '#84cc16',
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
  }, [step, roofCorners]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden shadow-inner" />
    </div>
  );
}

export default function ToitureSimulator() {
  const { toast } = useToast();
  
  // Étape courante (1: Adresse, 2: Carte emplacement, 3: Coins toiture, 3.5: Animation calcul, 4: Résultats & Devis)
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [centerCoords, setCenterCoords] = useState({ lat: 48.8785, lng: 2.3168 }); // Paris par défaut
  
  // Coins du rectangle de la toiture
  const [roofCorners, setRoofCorners] = useState([]);
  const [surfaceM2, setSurfaceM2] = useState(500); // 500m² par défaut
  
  // État du calcul animé (Étape 3.5)
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Formulaire de contact (Étape 4)
  const [leadForm, setLeadForm] = useState({
    lastName: '',
    firstName: '',
    email: '',
    phone: '',
    userType: 'proprietaire', // proprietaire, entreprise, agriculteur
    comments: '',
    rgpd: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Autocomplétion BAN (api-adresse.data.gouv.fr)
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(searchQuery)}&limit=5`)
        .then(res => res.json())
        .then(data => {
          if (data && data.features) {
            setSuggestions(data.features.map(f => ({
              label: f.properties.label,
              coordinates: f.geometry.coordinates // [lng, lat]
            })));
          }
        })
        .catch(err => console.error("Erreur BAN autocompletion:", err));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectAddress = (sugg) => {
    setSelectedAddress(sugg.label);
    setSearchQuery(sugg.label);
    setSuggestions([]);
    const coords = { lat: sugg.coordinates[1], lng: sugg.coordinates[0] };
    setCenterCoords(coords);
    setStep(2);
  };

  const handleAddressUpdatedFromMap = (label, coords) => {
    setSelectedAddress(label);
    setSearchQuery(label);
  };

  // Initialiser les 4 coins de la toiture autour des coordonnées centrales
  const handleValidateLocation = () => {
    const dLat = 0.00015; // ~15m
    const dLng = 0.00025; // ~20m
    const corners = [
      { lat: centerCoords.lat + dLat, lng: centerCoords.lng - dLng }, // 1: Nord-Ouest
      { lat: centerCoords.lat + dLat, lng: centerCoords.lng + dLng }, // 2: Nord-Est
      { lat: centerCoords.lat - dLat, lng: centerCoords.lng + dLng }, // 3: Sud-Est
      { lat: centerCoords.lat - dLat, lng: centerCoords.lng - dLng }  // 4: Sud-Ouest
    ];
    setRoofCorners(corners);
    const area = calculatePolygonArea(corners);
    if (area > 0) setSurfaceM2(area);
    setStep(3);
  };

  // Valider la sélection de la toiture -> Lance l'animation de calcul (Étape 3.5)
  const handleValidateCorners = () => {
    setStep(3.5);
    setLoadingProgress(0);
  };

  // Effet d'animation de chargement de l'étape 3.5
  useEffect(() => {
    if (step === 3.5) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep(4), 300);
            return 100;
          }
          return prev + 5;
        });
      }, 70);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Réinitialiser la simulation
  const handleRestart = () => {
    setStep(1);
    setSearchQuery('');
    setSelectedAddress('');
    setSubmitSuccess(false);
  };

  // ==========================================
  // CALCULS PHOTOVOLTAÏQUES (REVENTE TOTAL)
  // ==========================================
  // Densité standard : ~6 m² par kWc (soit ~0.165 kWc par m²)
  const rawKwc = useMemo(() => {
    return Math.round((surfaceM2 / 6) * 10) / 10;
  }, [surfaceM2]);

  // Plafonnement tarifaire conventionné à 500 kWc pour les revenus affichés
  const installableKwc = useMemo(() => {
    return Math.min(rawKwc, 500);
  }, [rawKwc]);

  // Production potentielle annuelle (kWh) -> ~1150 kWh / kWc en France
  const annualProductionKwh = useMemo(() => {
    return Math.round(installableKwc * 1150);
  }, [installableKwc]);

  // Tarif de rachat EDF OA Revente Totale (~0.075 € à 0.12 € / kWh selon puissance)
  const tariffPerKwh = useMemo(() => {
    if (installableKwc <= 9) return 0.130;
    if (installableKwc <= 36) return 0.115;
    if (installableKwc <= 100) return 0.098;
    return 0.085; // >100kWc
  }, [installableKwc]);

  // Revenus potentiels annuels (€)
  const annualRevenueEuros = useMemo(() => {
    return Math.round(annualProductionKwh * tariffPerKwh);
  }, [annualProductionKwh, tariffPerKwh]);

  // Équivalents annuels
  const foyersMoyens = useMemo(() => {
    return Math.round((annualProductionKwh / 4700) * 10) / 10;
  }, [annualProductionKwh]);

  const co2TonnesEvitees = useMemo(() => {
    return Math.round((annualProductionKwh * 0.032 / 1000) * 10) / 10;
  }, [annualProductionKwh]);

  // Soumission du formulaire Lead (Formspree + PDF)
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!leadForm.lastName || !leadForm.firstName || !leadForm.email || !leadForm.phone) {
      toast({
        title: "Champs obligatoires manquants",
        description: "Veuillez remplir votre nom, prénom, email et téléphone.",
        variant: "destructive"
      });
      return;
    }
    if (!leadForm.rgpd) {
      toast({
        title: "Consentement requis",
        description: "Veuillez accepter le traitement de vos données pour être recontacté.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        _subject: `[ENR COURTAGE] Nouvelle demande Toiture Photovoltaïque - ${leadForm.lastName} ${leadForm.firstName}`,
        Nom: leadForm.lastName,
        Prenom: leadForm.firstName,
        Email: leadForm.email,
        Telephone: leadForm.phone,
        Profil: leadForm.userType,
        Adresse: selectedAddress || searchQuery,
        Surface_Toiture: `${surfaceM2} m²`,
        Puissance_Installable: `${installableKwc} kWc`,
        Production_Annuelle: `${annualProductionKwh.toLocaleString('fr-FR')} kWh`,
        Revenus_Annuels_Estimes: `${annualRevenueEuros.toLocaleString('fr-FR')} €/an`,
        Commentaires: leadForm.comments || 'Aucun'
      };

      await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Générer et télécharger le PDF
      try {
        const jspdfModule = await loadJsPDF();
        const { jsPDF } = jspdfModule;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        // Page 1: Synthèse du Projet
        doc.setFillColor(15, 40, 71); // #0f2847
        doc.rect(0, 0, 210, 38, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('ENR COURTAGE', 15, 18);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("Étude de Rentabilité - Toiture Photovoltaïque (Revente d'Électricité)", 15, 26);

        // Header Date
        doc.setFontSize(9);
        doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 150, 18);

        // Adresse du Projet
        const addrFormatted = formatAddressForPdf(selectedAddress || searchQuery);
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(15, 45, 180, 28, 3, 3, 'F');
        doc.setTextColor(15, 40, 71);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text("ADRESSE DE LA TOITURE", 22, 54);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(addrFormatted.line1, 22, 61);
        if (addrFormatted.line2) doc.text(addrFormatted.line2, 22, 67);

        // Cartes Métriques Clés
        // Card 1: Puissance
        doc.setFillColor(236, 253, 245); // Light green
        doc.setDrawColor(16, 185, 129);
        doc.roundedRect(15, 80, 56, 35, 3, 3, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 40, 71);
        doc.text("PUISSANCE INSTALLABLE", 18, 88);
        doc.setFontSize(16);
        doc.setTextColor(16, 185, 129);
        doc.text(`${installableKwc} kWc`, 18, 102);

        // Card 2: Production
        doc.setFillColor(239, 246, 255); // Light blue
        doc.setDrawColor(59, 130, 246);
        doc.roundedRect(77, 80, 56, 35, 3, 3, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 40, 71);
        doc.text("PRODUCTION ANNUELLE", 80, 88);
        doc.setFontSize(15);
        doc.setTextColor(37, 99, 235);
        doc.text(`${annualProductionKwh.toLocaleString('fr-FR')} kWh`, 80, 102);

        // Card 3: Revenus
        doc.setFillColor(254, 243, 199); // Light amber
        doc.setDrawColor(217, 119, 6);
        doc.roundedRect(139, 80, 56, 35, 3, 3, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 40, 71);
        doc.text("REVENUS ANNUELS", 142, 88);
        doc.setFontSize(16);
        doc.setTextColor(217, 119, 6);
        doc.text(`${annualRevenueEuros.toLocaleString('fr-FR')} €/an`, 142, 102);

        // Impact Environnemental & Équivalence
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, 123, 180, 32, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 40, 71);
        doc.text("ÉQUIVALENT ANNUEL EN FRANCE", 22, 133);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`• Foyers moyens alimentés : ${foyersMoyens} foyers`, 22, 142);
        doc.text(`• Émissions de CO2 évitées : ${co2TonnesEvitees.toLocaleString('fr-FR')} tonnes / an`, 22, 148);

        // Coordonnées du Client
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text("INFORMATIONS DU DEMANDEUR", 15, 168);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Demandeur : ${leadForm.firstName} ${leadForm.lastName}`, 15, 176);
        doc.text(`Email : ${leadForm.email}`, 15, 182);
        doc.text(`Téléphone : ${leadForm.phone}`, 15, 188);
        doc.text(`Profil : ${leadForm.userType}`, 15, 194);

        // Footer Legal
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("© 2026 ENR COURTAGE - Tous droits d'utilisation et de reproduction réservés.", 15, 280);

        doc.save(`ENR-COURTAGE-Etude-Toiture-Photovoltaique-${leadForm.lastName}.pdf`);
      } catch (err) {
        console.error("Erreur génération PDF:", err);
      }

      setSubmitSuccess(true);
      toast({
        title: "Demande transmise avec succès !",
        description: "Un expert ENR COURTAGE étudiera votre projet et vous recontactera sous 24h.",
      });
    } catch (err) {
      console.error("Erreur envoi lead:", err);
      toast({
        title: "Erreur lors de l'envoi",
        description: "Une erreur est survenue, veuillez réessayer ou nous contacter par téléphone.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Header du Simulateur */}
      <div className="bg-[#0f2847] px-6 py-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#84cc16] font-bold">Simulateur de rentabilité</span>
          <h2 className="text-2xl font-bold text-white mt-1">Valorisez votre toiture photovoltaïque</h2>
          <p className="text-gray-300 text-xs sm:text-sm mt-1">Estimez la puissance installable et les revenus générés par la revente d'électricité</p>
        </div>
        {step > 1 && step < 4 && (
          <button
            onClick={handleRestart}
            className="self-start sm:self-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors border border-white/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Recommencer
          </button>
        )}
      </div>

      {/* Stepper visuel (Étapes 1 à 3) */}
      {step < 3.5 && (
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-semibold text-gray-500">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#0f2847] font-bold' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-[#84cc16] text-white' : 'bg-gray-200 text-gray-600'}`}>1</span>
              <span>Adresse</span>
            </div>
            <div className="h-0.5 w-12 bg-gray-200" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#0f2847] font-bold' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#84cc16] text-white' : 'bg-gray-200 text-gray-600'}`}>2</span>
              <span>Emplacement</span>
            </div>
            <div className="h-0.5 w-12 bg-gray-200" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#0f2847] font-bold' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-[#84cc16] text-white' : 'bg-gray-200 text-gray-600'}`}>3</span>
              <span>Toiture</span>
            </div>
          </div>
        </div>
      )}

      {/* Corps du Simulateur */}
      <div className="p-6 md:p-8">
        {/* ==========================================
            ÉTAPE 1 : SAISIE DE L'ADRESSE POSTALE
           ========================================== */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto text-center py-8"
          >
            <div className="w-16 h-16 bg-[#84cc16]/10 text-[#84cc16] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#0f2847] mb-2">Où se situe votre bâtiment ou toiture ?</h3>
            <p className="text-gray-500 text-sm mb-8">Renseignez l'adresse de votre bâtiment (hangar, entrepôt, usine, local commercial ou copropriété) pour simuler son potentiel photovoltaïque.</p>

            <div className="relative max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Saisissez votre adresse postale (ex: 52 Rue de la Victoire, Paris)..."
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#84cc16] focus:bg-white shadow-sm transition-all text-[#0f2847] font-medium"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>

              {/* Suggestions BAN */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-2xl mt-2 shadow-2xl z-50 overflow-hidden divide-y divide-gray-50 text-left">
                  {suggestions.map((sugg, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAddress(sugg)}
                      className="w-full px-5 py-3.5 hover:bg-gray-50 flex items-center gap-3 transition-colors text-sm text-gray-700 font-medium"
                    >
                      <MapPin className="w-4 h-4 text-[#84cc16] flex-shrink-0" />
                      <span>{sugg.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left border-t border-gray-100 pt-8">
              <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-[#84cc16] flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-600 font-medium">Revenus contractuels garantis 20 ans EDF OA</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-xl">
                <Building className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-600 font-medium">Pour tous types de bâtiments professionnels ou copropriétés</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-xl">
                <DollarSign className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-600 font-medium">Étude de rentabilité 100% gratuite & sans engagement</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            ÉTAPE 2 : LOCALISATION SUR LA CARTE SATELLITE
           ========================================== */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-900 font-semibold">
                Positionnez le curseur sur votre toiture en le faisant glisser
              </p>
            </div>

            <div className="h-[420px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative">
              <SatelliteMap
                step={step}
                centerCoords={centerCoords}
                setCenterCoords={setCenterCoords}
                onAddressUpdated={handleAddressUpdatedFromMap}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-600 hover:text-[#0f2847] text-sm font-semibold px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Modifier l'adresse
              </button>

              <button
                onClick={handleValidateLocation}
                className="w-full sm:w-auto bg-[#84cc16] hover:bg-[#65a30d] text-white text-sm font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all uppercase tracking-wide flex items-center justify-center gap-2"
              >
                VALIDEZ VOTRE EMPLACEMENT
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            ÉTAPE 3 : SÉLECTION DES 4 COINS DE LA TOITURE
           ========================================== */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-900 font-semibold">
                  Sélectionnez les 4 coins de votre toiture pouvant accueillir des panneaux photovoltaïques
                </p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-emerald-200 text-xs font-bold text-[#0f2847] shadow-sm flex items-center gap-2 self-start sm:self-auto">
                <span>Surface mesurée :</span>
                <span className="text-[#84cc16] text-sm">{surfaceM2} m²</span>
              </div>
            </div>

            <div className="h-[420px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative">
              <SatelliteMap
                step={step}
                centerCoords={centerCoords}
                setCenterCoords={setCenterCoords}
                roofCorners={roofCorners}
                setRoofCorners={setRoofCorners}
                setSurfaceM2={setSurfaceM2}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                onClick={() => setStep(2)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-600 hover:text-[#0f2847] text-sm font-semibold px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Ajuster l'emplacement
              </button>

              <button
                onClick={handleValidateCorners}
                className="w-full sm:w-auto bg-[#84cc16] hover:bg-[#65a30d] text-white text-sm font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all uppercase tracking-wide flex items-center justify-center gap-2"
              >
                VALIDEZ LA SÉLECTION
                <Check className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            ÉTAPE 3.5 : ANIMATION DE CALCUL DES REVENUS
           ========================================== */}
        {step === 3.5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center py-20"
          >
            <div className="w-20 h-20 bg-[#84cc16]/10 text-[#84cc16] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Sun className="w-10 h-10 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <h3 className="text-2xl font-bold text-[#0f2847] mb-2">Calcul des revenus potentiels...</h3>
            <p className="text-gray-500 text-sm mb-8">Analyse du gisement solaire et modélisation de votre centrale en revente totale</p>

            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5 shadow-inner mb-4">
              <div
                className="bg-gradient-to-r from-[#84cc16] to-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-500">{loadingProgress}%</span>
          </motion.div>
        )}

        {/* ==========================================
            ÉTAPE 4 : RÉSULTATS DE L'ÉTUDE DE TOITURE
           ========================================== */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Bouton refaire une simulation en haut */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <MapPin className="w-4 h-4 text-[#84cc16]" />
                <span className="text-[#0f2847] font-bold">{selectedAddress || searchQuery}</span>
                <span className="text-gray-400">({surfaceM2} m² sélectionnés)</span>
              </div>
              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 bg-white hover:bg-gray-100 text-[#0f2847] text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Refaire une simulation
              </button>
            </div>

            {/* Carte Principale des Résultats (Identique visuellement à la maquette Groupe Roy / ENR COURTAGE) */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-[#84cc16] shadow-xl text-center relative overflow-hidden">
              <span className="text-xs uppercase tracking-widest text-[#84cc16] font-bold block mb-1">RÉSULTATS DE L'ÉTUDE</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0f2847] mb-8">Potentiel photovoltaïque de votre toiture</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Puissance installable */}
                <div className="bg-emerald-50/60 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-[#84cc16] text-white rounded-full flex items-center justify-center mb-3 shadow-md">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Puissance installable</span>
                  <span className="text-3xl font-extrabold text-[#84cc16]">{installableKwc} kWc</span>
                </div>

                {/* Production potentielle annuelle */}
                <div className="bg-blue-50/60 p-6 rounded-2xl border border-blue-100 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mb-3 shadow-md">
                    <Sun className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Production potentielle annuelle</span>
                  <span className="text-3xl font-extrabold text-blue-700">{annualProductionKwh.toLocaleString('fr-FR')} kWh</span>
                </div>

                {/* Revenus potentiels annuels */}
                <div className="bg-amber-50/60 p-6 rounded-2xl border border-amber-100 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center mb-3 shadow-md">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Revenus potentiels annuels</span>
                  <span className="text-3xl font-extrabold text-amber-600">{annualRevenueEuros.toLocaleString('fr-FR')} €</span>
                </div>
              </div>

              {/* Mention légale plafonnement tarifaire */}
              <p className="text-xs text-gray-400 italic mb-8 border-b border-gray-100 pb-6">
                La production et les revenus affichés sont limités à 500 kWc, conformément aux tarifs conventionnés.
              </p>

              {/* Section Équivalents Annuels */}
              <div className="mb-10">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-6">Soit l'équivalent annuel en France de...</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
                    <div className="w-12 h-12 bg-[#0f2847] text-white rounded-xl flex items-center justify-center flex-shrink-0">
                      <Home className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-2xl font-extrabold text-[#0f2847] block leading-none">{foyersMoyens}</span>
                      <span className="text-xs text-gray-500 font-medium">Foyers moyens alimentés</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
                    <div className="w-12 h-12 bg-[#0f2847] text-white rounded-xl flex items-center justify-center flex-shrink-0">
                      <Leaf className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-2xl font-extrabold text-[#0f2847] block leading-none">{co2TonnesEvitees.toLocaleString('fr-FR')}</span>
                      <span className="text-xs text-gray-500 font-medium">Tonnes d'émissions de CO₂ évitées</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulaire Lead pour être recontacté */}
              {!submitSuccess ? (
                <form onSubmit={handleSubmitLead} className="bg-gray-50/80 p-6 sm:p-8 rounded-2xl border border-gray-200 text-left max-w-2xl mx-auto">
                  <h4 className="text-lg font-bold text-[#0f2847] mb-2 text-center">Contactez un expert pour valoriser votre toiture</h4>
                  <p className="text-xs text-gray-500 mb-6 text-center">Recevez votre étude de faisabilité technique & financière détaillée sous 24h.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Nom *</label>
                      <input
                        type="text"
                        required
                        value={leadForm.lastName}
                        onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })}
                        placeholder="Dupont"
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Prénom *</label>
                      <input
                        type="text"
                        required
                        value={leadForm.firstName}
                        onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })}
                        placeholder="Jean"
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        placeholder="06 12 34 56 78"
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Profil du propriétaire</label>
                    <select
                      value={leadForm.userType}
                      onChange={(e) => setLeadForm({ ...leadForm, userType: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                    >
                      <option value="proprietaire">Propriétaire privé / Particulier</option>
                      <option value="entreprise">Entreprise / Industriel / Commercial</option>
                      <option value="agriculteur">Exploitant agricole</option>
                      <option value="copropriete">Copropriété / Syndic</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={leadForm.rgpd}
                        onChange={(e) => setLeadForm({ ...leadForm, rgpd: e.target.checked })}
                        className="mt-0.5 rounded text-[#84cc16] focus:ring-[#84cc16]"
                      />
                      <span className="text-xs text-gray-500 leading-tight">
                        J'accepte d'être recontacté par ENR COURTAGE pour recevoir mon étude personnalisée. Mes données ne seront jamais vendues à des tiers.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#84cc16] hover:bg-[#65a30d] text-white text-sm font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Envoi de votre étude en cours...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>CONTACTEZ UN EXPERT POUR VALORISER VOTRE TOITURE</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl max-w-xl mx-auto text-center">
                  <CheckCircle2 className="w-12 h-12 text-[#84cc16] mx-auto mb-3" />
                  <h4 className="text-xl font-bold text-[#0f2847] mb-2">Demande transmise avec succès !</h4>
                  <p className="text-xs text-gray-600 mb-4">
                    Votre étude de rentabilité PDF a été générée et téléchargée sur votre appareil. Un expert ENR COURTAGE va analyser la faisabilité de votre toiture et vous recontacter.
                  </p>
                  <button
                    onClick={handleRestart}
                    className="bg-[#0f2847] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#163a5f] transition-colors"
                  >
                    Réaliser une autre simulation
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
