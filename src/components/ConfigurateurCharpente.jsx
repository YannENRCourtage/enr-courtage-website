import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Building2, ArrowRight, ArrowLeft, Check, CheckCircle2, RotateCcw, 
  Sparkles, Layers, ShieldCheck, HelpCircle, FileText, Send, Eye,
  Maximize2, ChevronRight, Info, Wrench, Warehouse, DollarSign, Sun, Zap, AlertTriangle
} from 'lucide-react';
import ecoEvoData from '../data/ecoEvoBuildings.json';
import { useToast } from './ui/use-toast';

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mrblwazb";

// Palette de couleurs RAL standard pour la toiture
const COLOR_PALETTE = [
  { id: '7016', name: 'Gris Anthracite (RAL 7016)', hex: '#373f47' },
  { id: '6005', name: 'Vert Mousse (RAL 6005)', hex: '#114232' },
  { id: '8012', name: 'Rouge Tuile (RAL 8012)', hex: '#6b322a' },
  { id: '9010', name: 'Blanc Pur (RAL 9010)', hex: '#e2e8f0' },
  { id: '9006', name: 'Gris Aluminium (RAL 9006)', hex: '#94a3b8' }
];

export default function ConfigurateurCharpente() {
  const { toast } = useToast();

  // Ref pour le conteneur du canvas WebGL Three.js
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);

  // ÉTAPE ACTUELLE DU CONFIGURATEUR (1 à 6)
  const [step, setStep] = useState(1);

  // SELECTION ÉTAPE 1 : CATÉGORIE (Bâtiment / Ombrière) ET TYPE
  const [category, setCategory] = useState('batiment'); // 'batiment' ou 'ombriere'
  const [subType, setSubType] = useState('symetrique'); // Bâtiment: 'symetrique', 'asymetrique', 'monopente' | Ombrière: 'simple_vl', 'double_vl', 'pl'
  
  // DIMENSIONS & CARACTÉRISTIQUES
  const [selectedWidth, setSelectedWidth] = useState(18.6); // Largeur pignon en m
  const [bayCount, setBayCount] = useState(4); // Nombre de travées (ex: 4 travées x 7.5m = 30m)
  const [bayLength, setBayLength] = useState(7.5); // Espacement travée (7.5m ou 6.2m)
  const [eaveHeight, setEaveHeight] = useState(5.5); // Hauteur égout (m)
  
  // OPTIONS COUVERTURE & CENTRALE SOLAIRE PV
  const [hasSolar, setHasSolar] = useState(false); // Option centrale solaire PV
  const [roofType, setRoofType] = useState('bac_acier'); // 'bac_acier', 'sandwich_40', 'sandwich_80'
  const [roofColor, setRoofColor] = useState('7016');
  const [claddingSides, setCladdingSides] = useState(0); // 0 (ouvert), 1, 2, 3, 4 faces
  const [showDimensions, setShowDimensions] = useState(true);

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
    if (category === 'ombriere') return eaveHeight + 0.8;
    if (subType === 'monopente') {
      return Math.round((eaveHeight + selectedWidth * 0.15) * 10) / 10;
    }
    // Bipente 10°
    return Math.round((eaveHeight + (selectedWidth / 2) * 0.176) * 10) / 10;
  }, [eaveHeight, selectedWidth, subType, category]);

  // CALCUL DE LA PUISSANCE SOLAIRE PV (kWc)
  const solarCapacityKwc = useMemo(() => {
    if (!hasSolar) return 0;
    return Math.round((totalSurface * 0.204) * 100) / 100;
  }, [hasSolar, totalSurface]);

  // CALCUL DU PRODUCTIBLE ET REVENUS SOLAIRES PV
  const solarProductionKwh = useMemo(() => {
    if (!hasSolar) return 0;
    return Math.round(solarCapacityKwc * 1150); // 1150 kWh/kWc
  }, [hasSolar, solarCapacityKwc]);

  const solarTariffPerKwh = useMemo(() => {
    if (!hasSolar) return 0;
    if (solarCapacityKwc <= 9) return 0; // rachat impossible
    if (solarCapacityKwc < 100) return 0.011; // 1,1 c€/kWh HT
    return 0.085; // 8,5 c€/kWh HT
  }, [hasSolar, solarCapacityKwc]);

  const solarAnnualRevenueEuros = useMemo(() => {
    if (!hasSolar) return 0;
    return Math.round(solarProductionKwh * solarTariffPerKwh);
  }, [hasSolar, solarProductionKwh, solarTariffPerKwh]);

  // RECHERCHE DU BÂTIMENT DANS LE CATALOGUE ECO-EVO / GREEN INVEST
  const matchedBuilding = useMemo(() => {
    const match = ecoEvoData.find(b => {
      const wDiff = Math.abs(b.width - selectedWidth);
      const lDiff = Math.abs(b.length - totalLength);
      return wDiff <= 0.8 && lDiff <= 0.8;
    });

    if (match) return match;

    const sameWidths = ecoEvoData.filter(b => Math.abs(b.width - selectedWidth) <= 1.5);
    if (sameWidths.length > 0) {
      sameWidths.sort((a, b) => Math.abs(a.length - totalLength) - Math.abs(b.length - totalLength));
      return sameWidths[0];
    }
    return null;
  }, [selectedWidth, totalLength]);

  // CALCUL DU PRIX HT DU BÂTIMENT OU DE L'OMBRIÈRE
  const calculatedPriceHT = useMemo(() => {
    let basePrice = 0;
    if (matchedBuilding && matchedBuilding.price_ht > 0) {
      basePrice = matchedBuilding.price_ht;
    } else {
      const m2Price = category === 'ombriere' ? 98 : 112;
      basePrice = Math.round(totalSurface * m2Price);
    }

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
  }, [matchedBuilding, totalSurface, roofType, claddingSides, selectedWidth, totalLength, eaveHeight, category]);

  // OPTIONS DISPONIBLES DE LARGEURS
  const availableWidths = useMemo(() => {
    if (category === 'ombriere') {
      if (subType === 'simple_vl') return [7.5, 8.5, 9.5];
      if (subType === 'double_vl') return [15.0, 15.8, 16.5];
      return [15.8, 18.0]; // PL
    }
    if (subType === 'monopente') {
      return [12.7, 15.0, 16.4, 18.6, 21.5, 24.4];
    }
    return [15.0, 16.4, 18.6, 20.0, 22.35, 25.5, 26.05, 29.75, 32.0, 33.46, 35.0, 39.0, 43.0];
  }, [category, subType]);

  // INITIALISATION ET MISE À JOUR DU RENDU 3D THREE.JS EN CANVAS PUR
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // SCÈNE SUR FOND BLANC PUR (#ffffff) COMME NELSONPV.FR
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    // CAMÉRA PERSPECTIVE
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(selectedWidth * 1.5, eaveHeight * 2.2, totalLength * 1.2);

    // RENDERER WEBGL
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Nettoyage conteneur et ajout canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // CONTROLES SOURIS ORBITCONTROLS (ROTATION, PAN, SCROLL ZOOM)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.01; // Empêche de passer sous le sol
    controls.target.set(0, eaveHeight / 2, 0);
    controls.update();
    controlsRef.current = controls;

    // ÉCLAIRAGE PHOTORÉALISTE SUR FOND BLANC
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(40, 60, 30);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight2.position.set(-30, 30, -20);
    scene.add(dirLight2);

    // SOL GRIS CLAIR / OMBRE
    const groundGeo = new THREE.PlaneGeometry(totalLength + 40, selectedWidth + 40);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    // GROUPE CONTENANT TOUTE LA STRUCTURE 3D DU BÂTIMENT
    const buildingGroup = new THREE.Group();

    // MATÉRIAUX ACIER ET TOITURE
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.8 });
    const rafterMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });
    const hexColor = COLOR_PALETTE.find(c => c.id === roofColor)?.hex || '#373f47';
    const roofMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(hexColor), roughness: 0.4, metalness: 0.3 });
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });

    // CRÉATION DES PORTIQUES ET POTEAUX
    const isOmbriere = category === 'ombriere';
    const numFrames = bayCount + 1;
    const halfW = selectedWidth / 2;

    for (let i = 0; i < numFrames; i++) {
      const zPos = -totalLength / 2 + i * bayLength;
      const frameGroup = new THREE.Group();
      frameGroup.position.set(0, 0, zPos);

      // Poteaux Gauche & Droit
      const colGeo = new THREE.BoxGeometry(0.3, eaveHeight, 0.3);
      const colL = new THREE.Mesh(colGeo, steelMat);
      colL.position.set(-halfW, eaveHeight / 2, 0);
      colL.castShadow = true;
      frameGroup.add(colL);

      const colR = new THREE.Mesh(colGeo, steelMat);
      colR.position.set(halfW, eaveHeight / 2, 0);
      colR.castShadow = true;
      frameGroup.add(colR);

      // Fermes de toiture
      if (!isOmbriere && subType === 'monopente') {
        const span = Math.hypot(selectedWidth, ridgeHeight - eaveHeight);
        const rGeo = new THREE.BoxGeometry(span, 0.25, 0.25);
        const rafter = new THREE.Mesh(rGeo, rafterMat);
        rafter.position.set(0, eaveHeight + (ridgeHeight - eaveHeight) / 2, 0);
        rafter.rotation.z = -Math.atan2(ridgeHeight - eaveHeight, selectedWidth);
        frameGroup.add(rafter);
      } else if (!isOmbriere) {
        const spanHalf = Math.hypot(halfW, ridgeHeight - eaveHeight);
        const rGeo = new THREE.BoxGeometry(spanHalf, 0.25, 0.25);
        
        const rafterL = new THREE.Mesh(rGeo, rafterMat);
        rafterL.position.set(-halfW / 2, eaveHeight + (ridgeHeight - eaveHeight) / 2, 0);
        rafterL.rotation.z = Math.atan2(ridgeHeight - eaveHeight, halfW);
        frameGroup.add(rafterL);

        const rafterR = new THREE.Mesh(rGeo, rafterMat);
        rafterR.position.set(halfW / 2, eaveHeight + (ridgeHeight - eaveHeight) / 2, 0);
        rafterR.rotation.z = -Math.atan2(ridgeHeight - eaveHeight, halfW);
        frameGroup.add(rafterR);

        // Tirant horizontal
        const tieGeo = new THREE.BoxGeometry(selectedWidth, 0.12, 0.12);
        const tie = new THREE.Mesh(tieGeo, steelMat);
        tie.position.set(0, eaveHeight, 0);
        frameGroup.add(tie);
      } else {
        // Ombrière
        const rGeo = new THREE.BoxGeometry(selectedWidth, 0.25, 0.25);
        const rafter = new THREE.Mesh(rGeo, rafterMat);
        rafter.position.set(0, eaveHeight + 0.3, 0);
        rafter.rotation.z = -0.15;
        frameGroup.add(rafter);
      }

      buildingGroup.add(frameGroup);
    }

    // TOITURE (PANNEAUX BAC ACIER)
    if (!isOmbriere && subType === 'monopente') {
      const roofGeo = new THREE.BoxGeometry(selectedWidth + 0.4, 0.08, totalLength + 0.6);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(0, (eaveHeight + ridgeHeight) / 2 + 0.1, 0);
      roof.rotation.x = Math.atan2(ridgeHeight - eaveHeight, selectedWidth);
      buildingGroup.add(roof);
    } else if (!isOmbriere) {
      const spanHalf = Math.hypot(halfW, ridgeHeight - eaveHeight);
      const roofGeo = new THREE.BoxGeometry(spanHalf + 0.3, 0.08, totalLength + 0.6);

      const roofL = new THREE.Mesh(roofGeo, roofMat);
      roofL.position.set(-halfW / 2, (eaveHeight + ridgeHeight) / 2 + 0.08, 0);
      roofL.rotation.z = Math.atan2(ridgeHeight - eaveHeight, halfW);
      buildingGroup.add(roofL);

      const roofR = new THREE.Mesh(roofGeo, roofMat);
      roofR.position.set(halfW / 2, (eaveHeight + ridgeHeight) / 2 + 0.08, 0);
      roofR.rotation.z = -Math.atan2(ridgeHeight - eaveHeight, halfW);
      buildingGroup.add(roofR);
    } else {
      const roofGeo = new THREE.BoxGeometry(selectedWidth + 0.3, 0.08, totalLength + 0.4);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(0, eaveHeight + 0.4, 0);
      roof.rotation.z = -0.15;
      buildingGroup.add(roof);
    }

    // DISPOSITION DES PANNEAUX SOLAIRES PV SI ACTIVÉ
    if (hasSolar) {
      const rows = Math.floor(totalLength / 1.9);
      const cols = Math.floor(selectedWidth / 1.3);
      const startX = -selectedWidth / 2 + 0.7;
      const startZ = -totalLength / 2 + 0.95;

      const panelGeo = new THREE.BoxGeometry(1.2, 0.04, 1.8);
      const solarGroup = new THREE.Group();
      solarGroup.position.set(0, (eaveHeight + ridgeHeight) / 2 + 0.2, 0);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const panel = new THREE.Mesh(panelGeo, solarMat);
          panel.position.set(startX + c * 1.3, 0.05, startZ + r * 1.9);
          solarGroup.add(panel);
        }
      }
      buildingGroup.add(solarGroup);
    }

    scene.add(buildingGroup);

    // BOUCLE D'ANIMATION WEBGL
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // REDIMENSIONNEMENT FENÊTRE
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [category, subType, selectedWidth, totalLength, bayCount, bayLength, eaveHeight, ridgeHeight, hasSolar, roofColor]);

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
        _subject: `[ENR COURTAGE] Demande de devis Structure Métallique - ${leadForm.lastName} ${leadForm.firstName}`,
        Nom: leadForm.lastName,
        Prenom: leadForm.firstName,
        Email: leadForm.email,
        Telephone: leadForm.phone,
        Departement: leadForm.dept,
        Profil: leadForm.userType,
        Configuration: {
          Categorie: category === 'batiment' ? 'Bâtiment' : 'Ombrière',
          Type: subType,
          Dimensions: `${selectedWidth}m x ${totalLength}m (${totalSurface} m²)`,
          Travees: `${bayCount} travées x ${bayLength}m`,
          HauteurEgout: `${eaveHeight} m`,
          HauteurFaitage: `${ridgeHeight} m`,
          OptionSolaire: hasSolar ? `Centrale PV ${solarCapacityKwc} kWc (${solarAnnualRevenueEuros} €/an)` : 'Sans solaire',
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
          description: "Un conseiller charpente métallique va vous recontacte sous 24h.",
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER PRÉSENTATION DU CONFIGURATEUR */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Configurateur 3D Bâtiment & Ombrière Métallique</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Votre structure métallique <span className="text-emerald-400">sur-mesure</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light">
            Configurez votre bâtiment ou ombrière métallique étape par étape, visualisez la structure en 3D dynamique et obtenez votre chiffrage immédiat.
          </p>
        </div>

        {/* BARRE D'ÉTAPES DU CONFIGURATEUR (SCREB STYLE) */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 mb-8 shadow-xl">
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2 sm:pb-0 no-scrollbar text-xs">
            {[
              { num: 1, label: '1. Modèle' },
              { num: 2, label: '2. Largeur' },
              { num: 3, label: '3. Longueur' },
              { num: 4, label: '4. Hauteur' },
              { num: 5, label: '5. Solaire & Finitions' },
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
          
          {/* COLONNE GAUCHE (7 COLS) : VISIONNEUSE 3D WEBGL SUR FOND BLANC (EXACTEMENT COMME NELSONPV.FR) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 border-2 border-slate-200 shadow-2xl relative flex flex-col justify-between min-h-[520px]">
            
            {/* Header & Badges NelsonPV Style */}
            <div className="flex flex-wrap items-center justify-between gap-3 z-10 mb-2">
              <div className="bg-blue-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-2">
                <Warehouse className="w-4 h-4" />
                <span>{totalLength}m x {selectedWidth}m - {totalSurface}m²</span>
              </div>

              {hasSolar && (
                <div className="bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <Zap className="w-4 h-4 fill-amber-500 text-amber-600" />
                  <span>{solarCapacityKwc} kWc</span>
                </div>
              )}
            </div>

            {/* VISIONNEUSE WEBGL 3D THREE.JS SUR FOND BLANC AVEC ROTATION A LA SOURIS (ORBITCONTROLS) */}
            <div 
              ref={mountRef} 
              className="relative w-full h-[400px] sm:h-[440px] bg-white rounded-2xl overflow-hidden border border-slate-200 cursor-grab active:cursor-grabbing shadow-inner"
            />

            {/* Indication d'interaction avec la souris */}
            <div className="mt-2 text-center text-xs text-slate-500 font-medium">
              💡 Maintenez le clic gauche et déplacez la souris pour faire pivoter le bâtiment en 3D
            </div>

            {/* BARRE DE CARACTÉRISTIQUES CLÉS EN BAS */}
            <div className="mt-4 bg-slate-100/90 rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Structure</span>
                <span className="font-bold text-slate-900">
                  {category === 'batiment' ? 'Bâtiment Charpente Métallique' : 'Ombrière Photovoltaïque'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Surface Totale</span>
                <span className="font-bold text-blue-600 text-sm">{totalSurface} m²</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Hauteur utile</span>
                <span className="font-bold text-slate-900">{eaveHeight} m</span>
              </div>
              {hasSolar && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Puissance Solaire</span>
                  <span className="font-extrabold text-amber-600 text-sm">{solarCapacityKwc} kWc</span>
                </div>
              )}
            </div>

          </div>

          {/* COLONNE DROITE (5 COLS) : CONTROLES ÉTAPE PAR ÉTAPE (SCREB STYLE) */}
          <div className="lg:col-span-5 bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl">
            
            <AnimatePresence mode="wait">
              
              {/* ÉTAPE 1 : CATÉGORIE (BÂTIMENT OU OMBRIÈRE) PUIS SOUS-TYPE */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Étape 1 sur 6</span>
                    <h3 className="text-xl font-bold text-white">Choisissez le type de structure</h3>
                    <p className="text-slate-400 text-xs mt-1">Sélectionnez Bâtiment ou Ombrière de parking.</p>
                  </div>

                  {/* Choix Principal : Bâtiment vs Ombrière */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setCategory('batiment');
                        setSubType('symetrique');
                        setSelectedWidth(18.6);
                      }}
                      className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                        category === 'batiment' 
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold shadow-lg' 
                          : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <Building2 className="w-7 h-7" />
                      <span className="text-sm font-extrabold">Bâtiment</span>
                    </button>

                    <button
                      onClick={() => {
                        setCategory('ombriere');
                        setSubType('double_vl');
                        setSelectedWidth(15.8);
                      }}
                      className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                        category === 'ombriere' 
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold shadow-lg' 
                          : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <Warehouse className="w-7 h-7" />
                      <span className="text-sm font-extrabold">Ombrière</span>
                    </button>
                  </div>

                  {/* Sous-choix Bâtiment */}
                  {category === 'batiment' && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Forme de toiture</label>
                      {[
                        { id: 'symetrique', title: 'Symétrique (Bipente 2 pans)', desc: 'Toiture 2 pans équilibrée à 10°' },
                        { id: 'asymetrique', title: 'Asymétrique (Bipente dissymétrique)', desc: 'Pan principal orienté optimisé' },
                        { id: 'monopente', title: 'Monopente', desc: 'Toiture 1 pan orientée' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSubType(opt.id)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                            subType === opt.id 
                              ? 'bg-emerald-500/20 border-emerald-400 text-white' 
                              : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                            subType === opt.id ? 'border-emerald-400 bg-emerald-400' : 'border-slate-500'
                          }`} />
                          <div>
                            <p className="font-bold text-xs text-white">{opt.title}</p>
                            <p className="text-[11px] text-slate-400">{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sous-choix Ombrière */}
                  {category === 'ombriere' && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Type d'ombrière</label>
                      {[
                        { id: 'simple_vl', title: 'Simple VL (Véhicules Légers)', desc: 'Ombrière 1 rangée de stationnement (Largeur ~7.5m)' },
                        { id: 'double_vl', title: 'Double VL (Véhicules Légers)', desc: 'Ombrière 2 rangées de stationnement (Largeur ~15.8m)' },
                        { id: 'pl', title: 'PL (Poids Lourds)', desc: 'Ombrière haute pour camions & bus (Hauteur 5.1m)' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSubType(opt.id)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                            subType === opt.id 
                              ? 'bg-emerald-500/20 border-emerald-400 text-white' 
                              : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                            subType === opt.id ? 'border-emerald-400 bg-emerald-400' : 'border-slate-500'
                          }`} />
                          <div>
                            <p className="font-bold text-xs text-white">{opt.title}</p>
                            <p className="text-[11px] text-slate-400">{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

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
                    <p className="text-slate-400 text-xs mt-1">Sélectionnez la largeur de pignon standardisée.</p>
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
                        <span className="text-[10px] opacity-75 font-normal">Portée</span>
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
                    <p className="text-slate-400 text-xs mt-1">Choisissez le nombre de travées (espacement 7.5m).</p>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {[3, 4, 5, 6, 7, 8, 9, 10, 12].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => setBayCount(cnt)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          bayCount === cnt 
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-extrabold shadow-md' 
                            : 'bg-slate-900/60 border-slate-700 text-slate-200 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-base font-bold block">x {cnt}</span>
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
                    <h3 className="text-xl font-bold text-white">Hauteur sous sablière</h3>
                    <p className="text-slate-400 text-xs mt-1">Hauteur utile sous égout pour le passage et le stockage.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { h: 3.9, label: '3.90 m', desc: 'Hauteur standard' },
                      { h: 4.0, label: '4.00 m', desc: 'Courant agricole' },
                      { h: 4.6, label: '4.60 m', desc: 'Passage camion' },
                      { h: 5.5, label: '5.50 m', desc: 'Stockage & logistique' },
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
                      <span>Étape suivante : Solaire & Finitions</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ÉTAPE 5 : OPTION SOLAIRE PV & FINITIONS */}
              {step === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Étape 5 sur 6</span>
                    <h3 className="text-xl font-bold text-white">Centrale Solaire PV & Finitions</h3>
                    <p className="text-slate-400 text-xs mt-1">Ajoutez une couverture solaire et choisissez la couleur des tôles.</p>
                  </div>

                  {/* Interrupteur Option Solaire PV */}
                  <div className="bg-amber-950/40 border-2 border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 fill-amber-400" />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-white">Couverture Solaire PV</p>
                        <p className="text-xs text-amber-200/80">Intégrer les panneaux photovoltaïques sur le toit</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setHasSolar(!hasSolar)}
                      className={`w-14 h-8 rounded-full p-1 transition-colors relative ${
                        hasSolar ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                        hasSolar ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Affichage des métriques solaires si activé */}
                  {hasSolar && (
                    <div className="bg-amber-900/30 border border-amber-500/30 p-4 rounded-xl text-xs space-y-2">
                      <div className="flex justify-between items-center text-amber-200">
                        <span>Puissance Installable :</span>
                        <strong className="text-sm font-extrabold text-white">{solarCapacityKwc} kWc</strong>
                      </div>
                      <div className="flex justify-between items-center text-amber-200">
                        <span>Production annuelle estimée :</span>
                        <strong className="text-white">{solarProductionKwh.toLocaleString('fr-FR')} kWh/an</strong>
                      </div>
                      <div className="flex justify-between items-center text-amber-200 pt-1 border-t border-amber-500/20">
                        <span>Revenus solaires estimés (1ère année) :</span>
                        <strong className="text-sm font-extrabold text-emerald-400">{solarAnnualRevenueEuros.toLocaleString('fr-FR')} €/an</strong>
                      </div>
                    </div>
                  )}

                  {/* Choix de la couleur RAL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Couleur des tôles (RAL)</label>
                    <div className="flex items-center gap-3">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setRoofColor(c.id)}
                          title={c.name}
                          className={`w-9 h-9 rounded-full border-2 transition-transform ${
                            roofColor === c.id ? 'scale-115 border-emerald-400 ring-2 ring-emerald-400/50' : 'border-slate-600 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
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
                    <p className="text-slate-400 text-xs mt-1">Chiffrage indicatif de la structure seule et des revenus solaires.</p>
                  </div>

                  {/* CARTE PRIX INDICATIF HT */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-emerald-500/40 text-center relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-300" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                      {category === 'batiment' ? 'Structure Bâtiment Seule' : 'Ombrière Métallique Seule'}
                    </span>
                    
                    <div className="text-3xl sm:text-4xl font-extrabold text-white my-2">
                      {calculatedPriceHT.toLocaleString('fr-FR')} € <span className="text-base text-slate-400 font-normal">HT</span>
                    </div>

                    {hasSolar && (
                      <div className="mt-3 pt-3 border-t border-slate-800 text-amber-400 text-xs font-bold">
                        ⚡ Centrale Solaire PV {solarCapacityKwc} kWc : +{solarAnnualRevenueEuros.toLocaleString('fr-FR')} €/an de revenus solaires
                      </div>
                    )}
                  </div>

                  {/* FORMULAIRE LEAD DE DEVIS GRATUIT */}
                  {!submitSuccess ? (
                    <form onSubmit={handleSubmitLead} className="space-y-3 pt-2">
                      <p className="text-xs font-bold text-white">Recevez votre étude technique & devis gratuit sous 24h :</p>
                      
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
                      <p className="text-xs text-slate-300">Notre équipe va étudier vos dimensions ({totalLength}m x {selectedWidth}m) et vous recontacter sous 24h.</p>
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
