import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ArrowRight, ArrowLeft, Check, CheckCircle2, RotateCcw, 
  Sparkles, Layers, ShieldCheck, HelpCircle, FileText, Send, Eye,
  Maximize2, ChevronRight, Info, Wrench, Warehouse, DollarSign
} from 'lucide-react';
import ecoEvoData from '../data/ecoEvoBuildings.json';
import { useToast } from './ui/use-toast';

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mrblwazb";

// Palette de couleurs RAL standard pour la toiture / bardage
const COLOR_PALETTE = [
  { id: '7016', name: 'Gris Anthracite (RAL 7016)', hex: '#373f47', bgClass: 'bg-[#373f47]' },
  { id: '6005', name: 'Vert Mousse (RAL 6005)', hex: '#114232', bgClass: 'bg-[#114232]' },
  { id: '8012', name: 'Rouge Tuile (RAL 8012)', hex: '#6b322a', bgClass: 'bg-[#6b322a]' },
  { id: '9010', name: 'Blanc Pur (RAL 9010)', hex: '#f0f0f0', bgClass: 'bg-[#f0f0f0]' },
  { id: '9006', name: 'Gris Aluminium (RAL 9006)', hex: '#a5a8ab', bgClass: 'bg-[#a5a8ab]' }
];

export default function ConfigurateurCharpente() {
  const { toast } = useToast();

  // ÉTAPE ACTUELLE DU CONFIGURATEUR (1 à 6)
  const [step, setStep] = useState(1);
  const [viewMode, setViewMode] = useState('3D'); // '3D', '2D_PIGNON', '2D_PLAN'

  // ÉTAT DE LA CONFIGURATION
  const [buildingType, setBuildingType] = useState('symetrique'); // 'symetrique', 'monopente', 'auvent'
  const [selectedWidth, setSelectedWidth] = useState(18.6); // Largeur pignon en m
  const [bayCount, setBayCount] = useState(4); // Nombre de travées (ex: 4 travées x 7.5m = 30m)
  const [bayLength, setBayLength] = useState(7.5); // Espacement travée (7.5m ou 6.2m)
  const [eaveHeight, setEaveHeight] = useState(5.5); // Hauteur égout (m)
  const [roofType, setRoofType] = useState('bac_acier'); // 'bac_acier', 'sandwich_40', 'sandwich_80'
  const [roofColor, setRoofColor] = useState('7016');
  const [claddingSides, setCladdingSides] = useState(0); // 0 (ouvert), 1, 2, 3, 4 faces
  const [extensionType, setExtensionType] = useState('aucun'); // 'aucun', 'auvent_sud_4', 'appentis_8'

  // Formulaire de contact lead
  const [leadForm, setLeadForm] = useState({
    lastName: '',
    firstName: '',
    email: '',
    phone: '',
    dept: '',
    userType: 'Professionnel / Agriculteur',
    rgpd: true,
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // CALCUL DE LA LONGUEUR TOTALE
  const totalLength = useMemo(() => {
    return Math.round(bayCount * bayLength * 10) / 10;
  }, [bayCount, bayLength]);

  // CALCUL DE LA SURFACE TOTALE
  const totalSurface = useMemo(() => {
    return Math.round(selectedWidth * totalLength);
  }, [selectedWidth, totalLength]);

  // CALCUL DE LA HAUTEUR AU FAÎTAGE ESTIMÉE
  const ridgeHeight = useMemo(() => {
    if (buildingType === 'monopente') {
      return Math.round((eaveHeight + selectedWidth * 0.15) * 10) / 10;
    }
    // Bipente 10°
    return Math.round((eaveHeight + (selectedWidth / 2) * 0.176) * 10) / 10;
  }, [eaveHeight, selectedWidth, buildingType]);

  // RECHERCHE DU BÂTIMENT DANS LE CATALOGUE ECO-EVO / GREEN INVEST (ecoEvoBuildings.json)
  const matchedBuilding = useMemo(() => {
    // Filtrage par largeur approximative (marge 0.5m) et longueur (marge 0.5m)
    const match = ecoEvoData.find(b => {
      const wDiff = Math.abs(b.width - selectedWidth);
      const lDiff = Math.abs(b.length - totalLength);
      return wDiff <= 0.8 && lDiff <= 0.8;
    });

    if (match) return match;

    // Fallback: chercher par largeur la plus proche
    const sameWidths = ecoEvoData.filter(b => Math.abs(b.width - selectedWidth) <= 1.5);
    if (sameWidths.length > 0) {
      sameWidths.sort((a, b) => Math.abs(a.length - totalLength) - Math.abs(b.length - totalLength));
      return sameWidths[0];
    }

    return null;
  }, [selectedWidth, totalLength]);

  // CALCUL DU PRIX HT DU BÂTIMENT
  const calculatedPriceHT = useMemo(() => {
    let basePrice = 0;
    if (matchedBuilding && matchedBuilding.price_ht > 0) {
      basePrice = matchedBuilding.price_ht;
    } else {
      // Estimation moyenne au m² charpente ECO-EVO (~105 € à 125 € / m²)
      basePrice = Math.round(totalSurface * 112);
    }

    // Adaptations selon la couverture et bardage
    let roofSurcost = 0;
    if (roofType === 'sandwich_40') roofSurcost = totalSurface * 18;
    if (roofType === 'sandwich_80') roofSurcost = totalSurface * 28;

    let claddingSurcost = 0;
    if (claddingSides > 0) {
      const perimeter = (selectedWidth + totalLength) * 2;
      const wallArea = (perimeter * eaveHeight) * (claddingSides / 4);
      claddingSurcost = Math.round(wallArea * 35);
    }

    return Math.round(basePrice + roofSurcost + claddingSurcost);
  }, [matchedBuilding, totalSurface, roofType, claddingSides, selectedWidth, totalLength, eaveHeight]);

  // OPTIONS DISPONIBLES DE LARGEURS SELON TYPE
  const availableWidths = useMemo(() => {
    if (buildingType === 'monopente') {
      return [12.7, 15.0, 16.4, 18.6, 21.5, 24.4];
    }
    return [15.0, 16.4, 18.6, 20.0, 22.35, 25.5, 26.05, 29.75, 32.0, 33.46, 35.0, 39.0, 43.0];
  }, [buildingType]);

  // GESTION SOUMISSION LEAD
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!leadForm.lastName || !leadForm.firstName || !leadForm.email || !leadForm.phone) {
      toast({
        title: "Champs obligatoires manquants",
        description: "Veuillez renseigner votre nom, prénom, email et téléphone.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        _subject: `[ENR COURTAGE] Demande de devis Structure Métallique Sans Solaire - ${leadForm.lastName} ${leadForm.firstName}`,
        Nom: leadForm.lastName,
        Prenom: leadForm.firstName,
        Email: leadForm.email,
        Telephone: leadForm.phone,
        Departement: leadForm.dept,
        Profil: leadForm.userType,
        Configuration: {
          Type: buildingType === 'symetrique' ? 'Bipente Symétrique' : buildingType === 'monopente' ? 'Monopente' : 'Bipente avec Auvent',
          Dimensions: `${selectedWidth}m x ${totalLength}m (${totalSurface} m²)`,
          Travees: `${bayCount} travées x ${bayLength}m`,
          HauteurEgout: `${eaveHeight} m`,
          HauteurFaitage: `${ridgeHeight} m`,
          Couverture: roofType,
          Bardage: `${claddingSides} face(s)`,
          CodeModele: matchedBuilding ? matchedBuilding.code : 'Sur-mesure ECO-EVO',
          PrixEstimeHT: `${calculatedPriceHT.toLocaleString('fr-FR')} € HT`
        },
        Commentaires: leadForm.comments
      };

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSubmitSuccess(true);
        toast({
          title: "Demande transmise avec succès !",
          description: "Un conseiller charpente métallique va vous contacter sous 24h.",
          className: "bg-[#0f2847] text-white border border-emerald-500"
        });
      } else {
        throw new Error("Erreur lors de l'envoi");
      }
    } catch (err) {
      toast({
        title: "Erreur d'envoi",
        description: "Une erreur est survenue. Veuillez nous contacter directement par téléphone.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="configurateur-charpente" className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden font-sans">
      {/* Background aesthetic shapes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER ET PRÉSENTATION DU CONFIGURATEUR */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Configurateur 3D Bâtiment Charpente Métallique</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Votre structure métallique <span className="text-emerald-400">sans solaire</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light">
            Configurez votre bâtiment charpente métallique (Gamme ECO-EVO) étape par étape. Obtenez votre visuel 3D et votre tarif immédiat en quelques clics.
          </p>
        </div>

        {/* BARRE D'ÉTAPES DU CONFIGURATEUR (SCREB STYLE) */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 mb-8 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2 sm:pb-0 no-scrollbar text-xs">
            {[
              { num: 1, label: '1. Modèle' },
              { num: 2, label: '2. Largeur' },
              { num: 3, label: '3. Longueur' },
              { num: 4, label: '4. Hauteur' },
              { num: 5, label: '5. Habillage' },
              { num: 6, label: '6. Tarif & Devis' },
            ].map((st) => (
              <button
                key={st.num}
                onClick={() => setStep(st.num)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-semibold shrink-0 ${
                  step === st.num 
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20' 
                    : step > st.num 
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40' 
                      : 'bg-slate-700/50 text-slate-400 hover:text-white'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === st.num ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  {step > st.num ? <Check className="w-3 h-3 stroke-[3]" /> : st.num}
                </span>
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CONTENEUR PRINCIPAL DU CONFIGURATEUR (GRILLE 2 COLONNES) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLONNE GAUCHE (8 COLS) : VISUALISATEUR 3D / 2D VECTORIEL DYNAMIQUE */}
          <div className="lg:col-span-7 bg-slate-800/90 rounded-3xl p-6 border border-slate-700 shadow-2xl relative flex flex-col justify-between min-h-[480px]">
            
            {/* Header Visualisateur */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-700/80 pb-4">
              <div>
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest block">Aperçu interactif</span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{totalLength}m x {selectedWidth}m</span>
                  <span className="text-slate-400 text-sm font-normal">({totalSurface} m²)</span>
                </h3>
              </div>

              {/* Toggles de Vue (3D, 2D Pignon, 2D Vue du haut) */}
              <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 gap-1 text-xs">
                <button
                  onClick={() => setViewMode('3D')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${viewMode === '3D' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Vue 3D
                </button>
                <button
                  onClick={() => setViewMode('2D_PIGNON')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${viewMode === '2D_PIGNON' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  2D Pignon
                </button>
                <button
                  onClick={() => setViewMode('2D_PLAN')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${viewMode === '2D_PLAN' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Vue de dessus
                </button>
              </div>
            </div>

            {/* SVG RENDERING DU BÂTIMENT 3D / 2D */}
            <div className="relative w-full h-80 sm:h-96 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
              
              {/* Badge d'informations dimensions */}
              <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-700/90 rounded-xl p-3 text-xs space-y-1 shadow-lg backdrop-blur-md z-10">
                <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Warehouse className="w-3.5 h-3.5" />
                  <span>{matchedBuilding ? matchedBuilding.range : 'Gamme ECO-EVO'}</span>
                </p>
                <p className="text-slate-300">Surface : <strong className="text-white">{totalSurface} m²</strong></p>
                <p className="text-slate-300">Hauteur Égout : <strong className="text-white">{eaveHeight} m</strong></p>
                <p className="text-slate-300">Hauteur Faîtage : <strong className="text-white">{ridgeHeight} m</strong></p>
                <p className="text-slate-300">Travées : <strong className="text-white">{bayCount} x {bayLength}m</strong></p>
              </div>

              {/* SCHÉMA SVG INTERACTIF 3D ISOMÉTRIQUE / 2D */}
              <svg className="w-full h-full max-h-[340px]" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={COLOR_PALETTE.find(c => c.id === roofColor)?.hex || '#373f47'} />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <linearGradient id="steelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>
                </defs>

                {/* VUE 3D ISOMÉTRIQUE */}
                {viewMode === '3D' && (
                  <g transform="translate(400, 260)">
                    {/* Grille au sol */}
                    <ellipse cx="0" cy="110" rx="320" ry="80" fill="rgba(15, 23, 42, 0.6)" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />

                    {/* Structure Portique Acier (Colonnes & Fermes) */}
                    {Array.from({ length: Math.min(bayCount + 1, 10) }).map((_, i) => {
                      const offset = (i - (bayCount / 2)) * 32;
                      const isFront = i === bayCount;
                      return (
                        <g key={i} transform={`translate(${offset * 1.2}, ${-offset * 0.5})`}>
                          {/* Poteaux arrière & avant */}
                          <line x1="-140" y1="40" x2="-140" y2="-50" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
                          <line x1="140" y1="40" x2="140" y2="-50" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
                          {/* Arbalétriers (Ferme de toiture) */}
                          <line x1="-140" y1="-50" x2="0" y2="-110" stroke="#94a3b8" strokeWidth="4" />
                          <line x1="140" y1="-50" x2="0" y2="-110" stroke="#94a3b8" strokeWidth="4" />
                          {/* Tirant d'entrait */}
                          <line x1="-140" y1="-50" x2="140" y2="-50" stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />
                        </g>
                      );
                    })}

                    {/* Couverture de Toiture 3D (Pan versant Sud/Nord) */}
                    <polygon 
                      points="-240,-120 0,-180 200,-110 -40,-50" 
                      fill="url(#roofGrad)" 
                      stroke="#1e293b" 
                      strokeWidth="2" 
                    />
                    <polygon 
                      points="0,-180 240,-120 40,0 -40,-50" 
                      fill={COLOR_PALETTE.find(c => c.id === roofColor)?.hex || '#373f47'} 
                      opacity="0.85"
                      stroke="#1e293b" 
                      strokeWidth="2" 
                    />

                    {/* Bardage si sélectionné */}
                    {claddingSides > 0 && (
                      <polygon 
                        points="-240,-120 -40,-50 -40,40 -240,0" 
                        fill="#334155" 
                        opacity="0.75" 
                        stroke="#475569" 
                        strokeWidth="1.5" 
                      />
                    )}

                    {/* Lignes de cotations dimensionnelles 3D */}
                    <g transform="translate(0, 90)">
                      {/* Largeur pignon */}
                      <line x1="-140" y1="20" x2="140" y2="20" stroke="#10b981" strokeWidth="2" />
                      <text x="0" y="38" fill="#10b981" fontSize="13" fontWeight="bold" textAnchor="middle">Largeur : {selectedWidth} m</text>
                    </g>
                    <g transform="translate(180, 0)">
                      {/* Longueur bâtiment */}
                      <line x1="20" y1="-80" x2="-80" y2="20" stroke="#38bdf8" strokeWidth="2" />
                      <text x="-20" y="-10" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">Longueur : {totalLength} m</text>
                    </g>
                  </g>
                )}

                {/* VUE 2D PIGNON */}
                {viewMode === '2D_PIGNON' && (
                  <g transform="translate(400, 260)">
                    {/* Ligne du sol */}
                    <line x1="-250" y1="80" x2="250" y2="80" stroke="#475569" strokeWidth="3" />
                    
                    {/* Structure Pignon 2D */}
                    <line x1="-180" y1="80" x2="-180" y2="-40" stroke="#94a3b8" strokeWidth="6" />
                    <line x1="180" y1="80" x2="180" y2="-40" stroke="#94a3b8" strokeWidth="6" />
                    
                    {/* Pente de Toit Bipente / Monopente */}
                    {buildingType === 'monopente' ? (
                      <line x1="-180" y1="20" x2="180" y2="-80" stroke="#10b981" strokeWidth="8" />
                    ) : (
                      <>
                        <line x1="-180" y1="-40" x2="0" y2="-120" stroke="#10b981" strokeWidth="8" />
                        <line x1="180" y1="-40" x2="0" y2="-120" stroke="#10b981" strokeWidth="8" />
                      </>
                    )}

                    {/* Cotations 2D */}
                    <line x1="-180" y1="110" x2="180" y2="110" stroke="#10b981" strokeWidth="2" />
                    <text x="0" y="130" fill="#10b981" fontSize="14" fontWeight="bold" textAnchor="middle">Largeur Pignon : {selectedWidth} m</text>
                    
                    <line x1="-210" y1="80" x2="-210" y2="-40" stroke="#38bdf8" strokeWidth="2" />
                    <text x="-225" y="20" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="end">H. Égout : {eaveHeight}m</text>

                    <line x1="210" y1="80" x2="210" y2="-120" stroke="#f59e0b" strokeWidth="2" />
                    <text x="225" y="-20" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="start">H. Faîtage : {ridgeHeight}m</text>
                  </g>
                )}

                {/* VUE 2D VUE DE DESSUS (PLAN) */}
                {viewMode === '2D_PLAN' && (
                  <g transform="translate(400, 240)">
                    {/* Rectangle Bâtiment Vue du haut */}
                    <rect x="-180" y="-100" width="360" height="200" fill="#1e293b" stroke="#10b981" strokeWidth="3" rx="4" />
                    
                    {/* Lignes de travées */}
                    {Array.from({ length: bayCount - 1 }).map((_, idx) => {
                      const posX = -180 + ((idx + 1) * (360 / bayCount));
                      return <line key={idx} x1={posX} y1="-100" x2={posX} y2="100" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />;
                    })}

                    {/* Ligne de Faîtage centrale */}
                    <line x1="-180" y1="0" x2="180" y2="0" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 3" />
                    <text x="0" y="-8" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">Faîtage central</text>

                    <text x="0" y="140" fill="#10b981" fontSize="14" fontWeight="bold" textAnchor="middle">Longueur totale : {totalLength} m ({bayCount} travées de {bayLength}m)</text>
                    <text x="-210" y="5" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="end">Largeur : {selectedWidth} m</text>
                  </g>
                )}
              </svg>
            </div>

            {/* BARRE D'INFORMATIONS DU BÂTIMENT SÉLECTIONNÉ */}
            <div className="mt-6 bg-slate-900/80 rounded-2xl p-4 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400">Modèle référence :</p>
                  <p className="text-sm font-bold text-white">
                    {matchedBuilding ? `${matchedBuilding.range} - ${matchedBuilding.code}` : 'Charpente ECO-EVO'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <p className="text-slate-400">Surface couverte :</p>
                  <p className="text-sm font-extrabold text-emerald-400">{totalSurface} m²</p>
                </div>
                <div>
                  <p className="text-slate-400">Structure :</p>
                  <p className="text-sm font-bold text-white">Acier Galvanisé Haute Résistance</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE (5 COLS) : CONTROLES ÉTAPE PAR ÉTAPE (SCREB STYLE) */}
          <div className="lg:col-span-5 bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl">
            
            <AnimatePresence mode="wait">
              
              {/* ÉTAPE 1 : TYPE DE BÂTIMENT */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Étape 1 sur 6</span>
                    <h3 className="text-xl font-bold text-white">Choisissez le type de structure</h3>
                    <p className="text-slate-400 text-xs mt-1">Sélectionnez la forme de toiture adaptée à vos besoins d'exploitation.</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: 'symetrique', title: 'Bipente Symétrique (Gamme HELIOS / ORION)', desc: 'Le classique agricole et industriel, toiture 2 pans équilibrée à 10°' },
                      { id: 'monopente', title: 'Monopente / Asymétrique (Gamme ATLAS / YOKO)', desc: 'Toiture 1 pan orientée, idéale pour auvent ou adossement' },
                      { id: 'auvent', title: 'Bipente avec Auvent (Gamme SOLEA)', desc: 'Bâtiment fermé ou ouvert avec auvent latéral de protection' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setBuildingType(opt.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                          buildingType === opt.id 
                            ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10' 
                            : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                          buildingType === opt.id ? 'border-emerald-400 bg-emerald-400/20' : 'border-slate-500'
                        }`}>
                          {buildingType === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{opt.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
                  >
                    <span>Étape suivante : Largeur Pignon</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* ÉTAPE 2 : LARGEUR DU PIGNON */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Étape 2 sur 6</span>
                    <h3 className="text-xl font-bold text-white">Choisissez la largeur (Portée)</h3>
                    <p className="text-slate-400 text-xs mt-1">Sélectionnez la largeur de pignon standardisée de la gamme ECO-EVO.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableWidths.map((w) => (
                      <button
                        key={w}
                        onClick={() => setSelectedWidth(w)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          selectedWidth === w 
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20' 
                            : 'bg-slate-900/60 border-slate-700 text-slate-200 hover:border-slate-500 font-semibold'
                        }`}
                      >
                        <span className="text-lg block">{w} m</span>
                        <span className="text-[10px] opacity-75 font-normal">Portée pignon</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Retour</span>
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <span>Étape suivante : Longueur</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ÉTAPE 3 : NOMBRE DE TRAVÉES / LONGUEUR */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Étape 3 sur 6</span>
                    <h3 className="text-xl font-bold text-white">Longueur & Nombre de travées</h3>
                    <p className="text-slate-400 text-xs mt-1">Modifiez le nombre de travées (espacement standard 7.5m).</p>
                  </div>

                  {/* Boutons rapide SCREB style : x3, x4, x5, x6... */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {[4, 5, 6, 7, 8, 9, 10, 12].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => setBayCount(cnt)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          bayCount === cnt 
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-extrabold shadow-md' 
                            : 'bg-slate-900/60 border-slate-700 text-slate-200 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-base font-bold block">{cnt} travées</span>
                        <span className="text-[10px] opacity-80">{cnt * bayLength} m</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 text-xs space-y-1">
                    <p className="text-slate-300">Espacement travée : <strong className="text-white">{bayLength} m</strong></p>
                    <p className="text-slate-300">Longueur totale : <strong className="text-emerald-400 text-sm font-bold">{totalLength} m</strong></p>
                    <p className="text-slate-300">Surface couverte : <strong className="text-emerald-400 text-sm font-bold">{totalSurface} m²</strong></p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Retour</span>
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <span>Étape suivante : Hauteur</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ÉTAPE 4 : HAUTEUR À L'ÉGOUT */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Étape 4 sur 6</span>
                    <h3 className="text-xl font-bold text-white">Choisissez la hauteur à l'égout</h3>
                    <p className="text-slate-400 text-xs mt-1">Hauteur utile sous sablière pour vos engins et stockage.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { h: 3.9, label: '3.90 m', desc: 'Hauteur économique standard' },
                      { h: 4.0, label: '4.00 m', desc: 'Hauteur courante agricole' },
                      { h: 4.6, label: '4.60 m', desc: 'Passage poids lourds / engins' },
                      { h: 5.5, label: '5.50 m', desc: 'Grand stockage & logistique' },
                    ].map((item) => (
                      <button
                        key={item.h}
                        onClick={() => setEaveHeight(item.h)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          eaveHeight === item.h 
                            ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg' 
                            : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <p className="text-lg font-bold text-white">{item.label}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(3)}
                      className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Retour</span>
                    </button>
                    <button
                      onClick={() => setStep(5)}
                      className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <span>Étape suivante : Habillage</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ÉTAPE 5 : COUVERTURE, BARDAGE ET COULEUR */}
              {step === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Étape 5 sur 6</span>
                    <h3 className="text-xl font-bold text-white">Couverture & Bardage</h3>
                    <p className="text-slate-400 text-xs mt-1">Personnalisez le type de tôles et le niveau de fermeture du bâtiment.</p>
                  </div>

                  {/* Choix de la couverture */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Couverture de toit</label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { id: 'bac_acier', label: 'Bac Acier non isolé' },
                        { id: 'sandwich_40', label: 'Sandwich 40mm' },
                        { id: 'sandwich_80', label: 'Sandwich 80mm' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setRoofType(r.id)}
                          className={`p-2.5 rounded-xl border font-semibold text-center transition-all ${
                            roofType === r.id ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'bg-slate-900/60 border-slate-700 text-slate-300'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Choix du bardage */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Bardage périphérique</label>
                    <div className="grid grid-cols-5 gap-2 text-xs">
                      {[0, 1, 2, 3, 4].map((cnt) => (
                        <button
                          key={cnt}
                          onClick={() => setCladdingSides(cnt)}
                          className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                            claddingSides === cnt ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'bg-slate-900/60 border-slate-700 text-slate-300'
                          }`}
                        >
                          {cnt === 0 ? 'Ouvert' : `${cnt} face${cnt > 1 ? 's' : ''}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Choix de la couleur RAL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Couleur des tôles (RAL)</label>
                    <div className="flex items-center gap-3">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setRoofColor(c.id)}
                          title={c.name}
                          className={`w-9 h-9 rounded-full border-2 transition-transform ${c.bgClass} ${
                            roofColor === c.id ? 'scale-115 border-emerald-400 ring-2 ring-emerald-400/50' : 'border-slate-600 hover:scale-105'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(4)}
                      className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Retour</span>
                    </button>
                    <button
                      onClick={() => setStep(6)}
                      className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <span>Étape suivante : Obtenir le Tarif</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ÉTAPE 6 : RÉCAPITULATIF, TARIF HT ET DEMANDE DE DEVIS */}
              {step === 6 && (
                <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Étape 6 sur 6</span>
                    <h3 className="text-xl font-bold text-white">Récapitulatif & Tarif estimatif</h3>
                    <p className="text-slate-400 text-xs mt-1">Tarif indicatif d'après la grille de référence GREEN INVEST / Barconnière.</p>
                  </div>

                  {/* CARTE PRIX INDICATIF HT */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-emerald-500/40 text-center relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-300" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">Structure Métallique Seule</span>
                    
                    <div className="text-3xl sm:text-4xl font-extrabold text-white my-2">
                      {calculatedPriceHT.toLocaleString('fr-FR')} € <span className="text-base text-slate-400 font-normal">HT</span>
                    </div>

                    <p className="text-xs text-slate-400 italic mt-1">
                      {matchedBuilding 
                        ? `Tarif exact du catalogue catalogue ${matchedBuilding.range} - ${matchedBuilding.code}`
                        : `Estimation basée sur une surface de ${totalSurface} m² (${Math.round(calculatedPriceHT / totalSurface)} € HT / m²)`
                      }
                    </p>
                  </div>

                  {/* FORMULAIRE LEAD DE DEVIS GRATUIT */}
                  {!submitSuccess ? (
                    <form onSubmit={handleSubmitLead} className="space-y-3 pt-2">
                      <p className="text-xs font-bold text-white">Recevez votre étude technique & devis personnalisé sous 24h :</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Nom *"
                          value={leadForm.lastName}
                          onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Prénom *"
                          value={leadForm.firstName}
                          onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="email"
                          required
                          placeholder="Email *"
                          value={leadForm.email}
                          onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Téléphone *"
                          value={leadForm.phone}
                          onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                      >
                        {isSubmitting ? 'Transmission en cours...' : 'Demander mon devis gratuit'}
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="bg-emerald-950/80 border border-emerald-500/40 p-4 rounded-xl text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="font-bold text-sm text-white">Merci ! Votre demande a été enregistrée.</p>
                      <p className="text-xs text-slate-300">Notre équipe charpente métallique va étudier vos dimensions ({totalLength}m x {selectedWidth}m) et revenir vers vous sous 24h.</p>
                    </div>
                  )}

                  <button
                    onClick={() => setStep(5)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Modifier la configuration</span>
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
