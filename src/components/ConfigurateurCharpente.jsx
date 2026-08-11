import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Building2, Sun, Zap, Download, Maximize, FileText, CheckCircle2, 
  ChevronRight, ArrowRight, ArrowLeft, RefreshCw, Send, X, Layers
} from 'lucide-react';
import { useToast } from './ui/use-toast';

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mrblwazb";

// Solar Pricing Schedule based on PJ 5
// de 0kWc à 36kWc: 1,05€ HT/Wc
// de 36,01kWc à 99,99kWc: 0,98€ HT/Wc
// de 100kWc à 249,99kWc: 0,92€ HT/Wc
// de 250kWc à 499,99kWc: 0,86€ HT/Wc
// de 500kWc à 999,99kWc: 0,79€ HT/Wc
// au-delà de 1000kWc: 0,76€ HT/Wc
function getSolarPricing(kwc) {
  if (!kwc || kwc <= 0) return null;
  const wc = kwc * 1000;
  let rateHT = 0.76;
  if (kwc <= 36) rateHT = 1.05;
  else if (kwc <= 99.99) rateHT = 0.98;
  else if (kwc <= 249.99) rateHT = 0.92;
  else if (kwc <= 499.99) rateHT = 0.86;
  else if (kwc <= 999.99) rateHT = 0.79;

  const totalHT = wc * rateHT;
  const tva = totalHT * 0.20;
  const totalTTC = totalHT * 1.20;

  return {
    rateHT,
    totalHT: Math.round(totalHT),
    tva: Math.round(tva),
    totalTTC: Math.round(totalTTC)
  };
}

// Map of standard building types & available widths
const BUILDING_TYPES = [
  { value: 'symetrique', label: 'Symétrique' },
  { value: 'asymetrique_1_zone', label: 'Asymétrique 1 zone' },
  { value: 'asymetrique_2_zones', label: 'Asymétrique 2 zones' },
  { value: 'monopente', label: 'Monopente' },
  { value: 'ombriere_vl_simple_gauche', label: 'Ombrière VL simple gauche' },
  { value: 'ombriere_vl_simple_droite', label: 'Ombrière VL simple droite' },
  { value: 'ombriere_vl_double', label: 'Ombrière VL double' },
  { value: 'ombriere_pl', label: 'Ombrière PL' },
];

const TYPE_WIDTHS_MAP = {
  symetrique: ['15.0', '18.6', '22.3', '26.0', '29.8', '33.5'],
  asymetrique_1_zone: ['16.4', '20.0'],
  asymetrique_2_zones: ['25.5', '29.1'],
  monopente: ['12.7', '16.4'],
  ombriere_vl_simple_gauche: ['6.9'],
  ombriere_vl_simple_droite: ['6.9'],
  ombriere_vl_double: ['9.1', '11.3'],
  ombriere_pl: ['15.8', '20.2', '24.6'],
};

// Fixed ridge heights by width
const WIDTH_HEIGHT_MAP = {
  '15.0': { ridge: 6.8, eave: 5.5, pitch: 10 },
  '18.6': { ridge: 7.1, eave: 5.5, pitch: 10 },
  '22.3': { ridge: 7.5, eave: 5.5, pitch: 10 },
  '26.0': { ridge: 7.8, eave: 5.5, pitch: 10 },
  '29.8': { ridge: 8.1, eave: 5.5, pitch: 10 },
  '33.5': { ridge: 8.5, eave: 5.5, pitch: 10 },
  '16.4': { ridge: 6.9, eave: 4.0, pitch: 15 },
  '20.0': { ridge: 7.3, eave: 4.0, pitch: 15 },
  '25.5': { ridge: 8.9, eave: 4.0, pitch: 15 },
  '29.1': { ridge: 9.8, eave: 4.0, pitch: 15 },
  '12.7': { ridge: 7.4, eave: 4.0, pitch: 15 },
  '6.9': { ridge: 4.7, eave: 3.7, pitch: 10 },
  '9.1': { ridge: 4.2, eave: 3.5, pitch: 5 },
  '11.3': { ridge: 4.4, eave: 3.5, pitch: 5 },
  '15.8': { ridge: 5.8, eave: 4.5, pitch: 5 },
  '20.2': { ridge: 6.2, eave: 4.5, pitch: 5 },
  '24.6': { ridge: 6.6, eave: 4.5, pitch: 5 },
};

export default function ConfigurateurCharpente() {
  const { toast } = useToast();

  // Mode Selection: 'standard' (formerly eco-evo) vs 'sur-mesure'
  const [gammeMode, setGammeMode] = useState('standard');

  // Config State
  const [buildingType, setBuildingType] = useState('symetrique');
  const [largeurBatiment, setLargeurBatiment] = useState('18.6');
  const [espacementTravees, setEspacementTravees] = useState('7.5m'); // '6m' or '7.5m'
  const [nombreTravees, setNombreTravees] = useState(4);
  const [solarEnabled, setSolarEnabled] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);
  const [viewMode, setViewMode] = useState('3d'); // '3d' or '2d'

  // Extensions
  const [extensions, setExtensions] = useState({
    nord: { avant: 0, arriere: 0 },
    sud: { avant: 0, arriere: 0 }
  });

  // Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [leadForm, setLeadForm] = useState({
    lastName: '', firstName: '', email: '', phone: '', company: '', comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Canvas Refs
  const canvasContainerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  // Available Widths computed based on type & mode
  const availableWidths = useMemo(() => {
    return TYPE_WIDTHS_MAP[buildingType] || ['18.6'];
  }, [buildingType]);

  // Keep width valid when buildingType changes
  useEffect(() => {
    if (!availableWidths.includes(largeurBatiment)) {
      setLargeurBatiment(availableWidths[0]);
    }
  }, [buildingType, availableWidths, largeurBatiment]);

  // Geometry calculations
  const numericWidth = useMemo(() => parseFloat(largeurBatiment) || 18.6, [largeurBatiment]);
  const bayLength = useMemo(() => (espacementTravees === '6m' ? 6.0 : 7.5), [espacementTravees]);
  const longueur = useMemo(() => bayLength * nombreTravees, [bayLength, nombreTravees]);
  const surface = useMemo(() => Math.round(numericWidth * longueur), [numericWidth, longueur]);

  // Fixed parameters
  const specs = useMemo(() => {
    return WIDTH_HEIGHT_MAP[largeurBatiment] || { ridge: 7.1, eave: 4.5, pitch: 10 };
  }, [largeurBatiment]);

  // Solar capacity & panel count
  const panelCount = useMemo(() => {
    if (!solarEnabled) return 0;
    // Calculate panels fitting on roof surface (~2.5m² per 465Wc panel)
    return Math.floor(surface / 2.5);
  }, [solarEnabled, surface]);

  const solarPowerKwc = useMemo(() => {
    if (!solarEnabled) return 0;
    return Math.round(panelCount * 0.465 * 100) / 100;
  }, [solarEnabled, panelCount]);

  const solarPricing = useMemo(() => {
    return getSolarPricing(solarPowerKwc);
  }, [solarPowerKwc]);

  // Toggle extension
  const toggleExtension = (side, position) => {
    setExtensions(prev => ({
      ...prev,
      [side]: {
        ...prev[side],
        [position]: prev[side][position] > 0 ? 0 : 3.0
      }
    }));
  };

  // ---------------------------------------------------------------------------
  // 3D Scene Initialization & Render Loop (Three.js Pure WebGL)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene with pure WHITE background (#ffffff) as requested
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(numericWidth * 1.4, specs.ridge * 1.8, longueur * 1.1);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.target.set(0, specs.eave / 2, 0);
    controls.update();
    controlsRef.current = controls;

    // Lighting (Bright & crisp on white background)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(30, 50, 40);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight2.position.set(-30, 30, -30);
    scene.add(dirLight2);

    // Ground plane shadow catcher
    const groundGeo = new THREE.PlaneGeometry(longueur + 30, numericWidth + 30);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    // -------------------------------------------------------------------------
    // Build 3D Metal Structure
    // -------------------------------------------------------------------------
    const buildingGroup = new THREE.Group();

    // Materials (matching Green Invest visuals)
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
    const rafterMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.4, roughness: 0.5 });
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.9, roughness: 0.1 });

    const w = numericWidth;
    const l = longueur;
    const eh = specs.eave;
    const rh = specs.ridge;
    const halfW = w / 2;

    // Portal frames along bays
    for (let i = 0; i <= nombreTravees; i++) {
      const z = -l / 2 + i * bayLength;
      const frame = new THREE.Group();
      frame.position.set(0, 0, z);

      if (buildingType === 'symetrique') {
        // Left Column
        const colGeo = new THREE.BoxGeometry(0.25, eh, 0.25);
        const colL = new THREE.Mesh(colGeo, steelMat);
        colL.position.set(-halfW, eh / 2, 0);
        colL.castShadow = true;
        frame.add(colL);

        // Right Column
        const colR = new THREE.Mesh(colGeo, steelMat);
        colR.position.set(halfW, eh / 2, 0);
        colR.castShadow = true;
        frame.add(colR);

        // Left Rafter
        const spanL = Math.hypot(halfW, rh - eh);
        const rafterLGeo = new THREE.BoxGeometry(spanL, 0.2, 0.2);
        const rafterL = new THREE.Mesh(rafterLGeo, rafterMat);
        rafterL.position.set(-halfW / 2, (eh + rh) / 2, 0);
        rafterL.rotation.z = Math.atan2(rh - eh, halfW);
        frame.add(rafterL);

        // Right Rafter
        const rafterR = new THREE.Mesh(rafterLGeo, rafterMat);
        rafterR.position.set(halfW / 2, (eh + rh) / 2, 0);
        rafterR.rotation.z = -Math.atan2(rh - eh, halfW);
        frame.add(rafterR);

        // Tie beam
        const tieGeo = new THREE.BoxGeometry(w, 0.12, 0.12);
        const tie = new THREE.Mesh(tieGeo, steelMat);
        tie.position.set(0, eh, 0);
        frame.add(tie);

      } else if (buildingType.startsWith('asymetrique')) {
        const colGeo = new THREE.BoxGeometry(0.25, eh, 0.25);
        const colL = new THREE.Mesh(colGeo, steelMat);
        colL.position.set(-halfW, eh / 2, 0);
        frame.add(colL);

        const colRGeo = new THREE.BoxGeometry(0.25, rh, 0.25);
        const colR = new THREE.Mesh(colRGeo, steelMat);
        colR.position.set(halfW, rh / 2, 0);
        frame.add(colR);

        const span = Math.hypot(w, rh - eh);
        const rGeo = new THREE.BoxGeometry(span, 0.2, 0.2);
        const rafter = new THREE.Mesh(rGeo, rafterMat);
        rafter.position.set(0, (eh + rh) / 2, 0);
        rafter.rotation.z = Math.atan2(rh - eh, w);
        frame.add(rafter);

      } else if (buildingType === 'monopente') {
        const colGeoL = new THREE.BoxGeometry(0.25, eh, 0.25);
        const colL = new THREE.Mesh(colGeoL, steelMat);
        colL.position.set(-halfW, eh / 2, 0);
        frame.add(colL);

        const colGeoR = new THREE.BoxGeometry(0.25, rh, 0.25);
        const colR = new THREE.Mesh(colGeoR, steelMat);
        colR.position.set(halfW, rh / 2, 0);
        frame.add(colR);

        const span = Math.hypot(w, rh - eh);
        const rGeo = new THREE.BoxGeometry(span, 0.2, 0.2);
        const rafter = new THREE.Mesh(rGeo, rafterMat);
        rafter.position.set(0, (eh + rh) / 2, 0);
        rafter.rotation.z = Math.atan2(rh - eh, w);
        frame.add(rafter);

      } else if (buildingType === 'ombriere_vl_double') {
        // Center single pillar
        const colGeo = new THREE.BoxGeometry(0.35, rh, 0.35);
        const colC = new THREE.Mesh(colGeo, steelMat);
        colC.position.set(0, rh / 2, 0);
        frame.add(colC);

        const rGeo = new THREE.BoxGeometry(w, 0.2, 0.2);
        const rafter = new THREE.Mesh(rGeo, rafterMat);
        rafter.position.set(0, rh, 0);
        frame.add(rafter);

      } else {
        // Ombrière VL simple & PL
        const colGeo = new THREE.BoxGeometry(0.25, eh, 0.25);
        const colL = new THREE.Mesh(colGeo, steelMat);
        colL.position.set(-halfW, eh / 2, 0);
        frame.add(colL);

        const colR = new THREE.Mesh(colGeo, steelMat);
        colR.position.set(halfW, rh / 2, 0);
        frame.add(colR);

        const rGeo = new THREE.BoxGeometry(w, 0.2, 0.2);
        const rafter = new THREE.Mesh(rGeo, rafterMat);
        rafter.position.set(0, (eh + rh) / 2, 0);
        rafter.rotation.z = 0.1;
        frame.add(rafter);
      }

      buildingGroup.add(frame);
    }

    // Longitudinal purlins
    const purlinGeo = new THREE.BoxGeometry(0.08, 0.08, l + 0.2);
    const p1 = new THREE.Mesh(purlinGeo, steelMat);
    p1.position.set(-halfW, eh + 0.05, 0);
    const p2 = new THREE.Mesh(purlinGeo, steelMat);
    p2.position.set(halfW, eh + 0.05, 0);
    const pRidge = new THREE.Mesh(purlinGeo, steelMat);
    pRidge.position.set(0, rh + 0.05, 0);
    buildingGroup.add(p1, p2, pRidge);

    // Roof Sheets
    if (buildingType === 'symetrique') {
      const spanL = Math.hypot(halfW, rh - eh);
      const rSheetGeo = new THREE.BoxGeometry(spanL + 0.2, 0.05, l + 0.4);
      
      const rSheetL = new THREE.Mesh(rSheetGeo, roofMat);
      rSheetL.position.set(-halfW / 2, (eh + rh) / 2 + 0.05, 0);
      rSheetL.rotation.z = Math.atan2(rh - eh, halfW);
      buildingGroup.add(rSheetL);

      const rSheetR = new THREE.Mesh(rSheetGeo, roofMat);
      rSheetR.position.set(halfW / 2, (eh + rh) / 2 + 0.05, 0);
      rSheetR.rotation.z = -Math.atan2(rh - eh, halfW);
      buildingGroup.add(rSheetR);
    } else {
      const span = Math.hypot(w, rh - eh);
      const rSheetGeo = new THREE.BoxGeometry(span + 0.2, 0.05, l + 0.4);
      const rSheet = new THREE.Mesh(rSheetGeo, roofMat);
      rSheet.position.set(0, (eh + rh) / 2 + 0.05, 0);
      rSheet.rotation.z = Math.atan2(rh - eh, w);
      buildingGroup.add(rSheet);
    }

    // Solar Panels Grid in 3D
    if (solarEnabled) {
      const solarGroup = new THREE.Group();
      const rows = Math.floor(l / 2.0);
      const cols = Math.floor(halfW / 1.4);
      const panelGeo = new THREE.BoxGeometry(1.2, 0.03, 1.8);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Left roof slope
          const panelL = new THREE.Mesh(panelGeo, solarMat);
          const pxL = -halfW + 0.8 + c * 1.3;
          const pzL = -l / 2 + 1.0 + r * 2.0;
          const pyL = eh + (pxL + halfW) * Math.tan(Math.atan2(rh - eh, halfW)) + 0.1;
          panelL.position.set(pxL, pyL, pzL);
          panelL.rotation.z = Math.atan2(rh - eh, halfW);
          solarGroup.add(panelL);

          // Right roof slope
          const panelR = new THREE.Mesh(panelGeo, solarMat);
          const pxR = 0.8 + c * 1.3;
          const pzR = -l / 2 + 1.0 + r * 2.0;
          const pyR = rh - pxR * Math.tan(Math.atan2(rh - eh, halfW)) + 0.1;
          panelR.position.set(pxR, pyR, pzR);
          panelR.rotation.z = -Math.atan2(rh - eh, halfW);
          solarGroup.add(panelR);
        }
      }
      buildingGroup.add(solarGroup);
    }

    scene.add(buildingGroup);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const wRes = container.clientWidth;
      const hRes = container.clientHeight;
      camera.aspect = wRes / hRes;
      camera.updateProjectionMatrix();
      renderer.setSize(wRes, hRes);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [buildingType, numericWidth, longueur, specs, bayLength, nombreTravees, solarEnabled]);

  // 2D/3D View Switch
  const handleViewMode = (mode) => {
    setViewMode(mode);
    if (!cameraRef.current || !controlsRef.current) return;
    if (mode === '2d') {
      cameraRef.current.position.set(0, specs.ridge * 1.1, numericWidth * 2.2);
      controlsRef.current.target.set(0, specs.ridge / 2, 0);
    } else {
      cameraRef.current.position.set(numericWidth * 1.4, specs.ridge * 1.8, longueur * 1.1);
      controlsRef.current.target.set(0, specs.eave / 2, 0);
    }
    controlsRef.current.update();
  };

  // Screenshot capture
  const handleScreenshot = () => {
    if (!rendererRef.current) return;
    const link = document.createElement('a');
    link.download = `configurateur-charpente-${Date.now()}.png`;
    link.href = rendererRef.current.domElement.toDataURL('image/png');
    link.click();
  };

  // Fullscreen
  const handleFullscreen = () => {
    const elem = canvasContainerRef.current;
    if (elem && elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };

  // Lead Quote submission
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        _subject: `[ENR COURTAGE] Demande de devis Structure Métallique - ${leadForm.lastName} ${leadForm.firstName}`,
        Nom: leadForm.lastName,
        Prenom: leadForm.firstName,
        Email: leadForm.email,
        Telephone: leadForm.phone,
        Societe: leadForm.company,
        Configuration: {
          Type: buildingType,
          Largeur: `${numericWidth} m`,
          Longueur: `${longueur} m (${surface} m²)`,
          Travees: `${nombreTravees} travées x ${bayLength}m`,
          OptionSolaire: solarEnabled ? `Oui (${solarPowerKwc} kWc)` : 'Non',
          TarifSolaireHT: solarPricing ? `${solarPricing.totalHT.toLocaleString('fr-FR')} € HT` : 'N/A'
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
        toast({ title: "Demande transmise avec succès !", description: "Un conseiller va vous contacter sous 24h." });
      } else {
        throw new Error("Erreur");
      }
    } catch (err) {
      toast({ title: "Erreur d'envoi", description: "Veuillez réessayer.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="configurateur-charpente" style={{ background: '#ffffff', color: '#1f2937', padding: '3rem 1rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* SECTION HEADER */}
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2.5rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
          Votre structure métallique <span style={{ color: '#2563eb' }}>sur-mesure</span>
        </h2>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.5 }}>
          Configurez votre bâtiment ou ombrière métallique étape par étape, visualisez la structure en 3D dynamique et obtenez votre chiffrage immédiat.
        </p>
      </div>

      {/* MAIN CONFIGURATOR CONTAINER (EXACT LAYOUT AS NELSON GREEN INVEST INTERFACE) */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        height: 'calc(100vh - 120px)',
        minHeight: '680px',
        maxHeight: '900px',
        background: '#f8fafc',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        overflow: 'hidden'
      }}>
        
        {/* =================================================================== */}
        {/* LEFT PANEL: CONFIGURATION CONTROLS (Width 270px)                    */}
        {/* =================================================================== */}
        <div style={{
          width: '270px',
          minWidth: '270px',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          overflowY: 'auto',
          padding: '1.25rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Configurateur 2D/3D
          </h2>

          {/* Gamme Toggle Switch */}
          <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', padding: '0.2rem', borderRadius: '10px' }}>
            <button
              onClick={() => setGammeMode('standard')}
              style={{
                flex: 1, padding: '0.5rem 0.6rem', borderRadius: '8px', border: 'none',
                background: gammeMode === 'standard' ? '#3b82f6' : 'transparent',
                color: gammeMode === 'standard' ? '#ffffff' : '#64748b',
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              Gamme Standard
            </button>
            <button
              onClick={() => setGammeMode('sur-mesure')}
              style={{
                flex: 1, padding: '0.5rem 0.6rem', borderRadius: '8px', border: 'none',
                background: gammeMode === 'sur-mesure' ? '#3b82f6' : 'transparent',
                color: gammeMode === 'sur-mesure' ? '#ffffff' : '#64748b',
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              Bâtiments sur-mesure
            </button>
          </div>

          {/* Type de Bâtiment */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TYPE DE BÂTIMENT
            </label>
            <select
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
              style={{
                width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#ffffff', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, cursor: 'pointer'
              }}
            >
              {BUILDING_TYPES.map(bt => (
                <option key={bt.value} value={bt.value}>{bt.label}</option>
              ))}
            </select>
          </div>

          {/* Largeur du Bâtiment */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              LARGEUR DU BÂTIMENT
            </label>
            <select
              value={largeurBatiment}
              onChange={(e) => setLargeurBatiment(e.target.value)}
              style={{
                width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#ffffff', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, cursor: 'pointer'
              }}
            >
              {availableWidths.map(wVal => (
                <option key={wVal} value={wVal}>{wVal} m</option>
              ))}
            </select>
          </div>

          {/* Extensions (Auvent / Appentis) */}
          {(!buildingType.startsWith('ombriere')) && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                EXTENSIONS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <span style={{ width: '32px', color: '#64748b', fontWeight: 700 }}>RCH</span>
                  <button
                    onClick={() => toggleExtension('nord', 'avant')}
                    style={{
                      flex: 1, padding: '0.35rem', borderRadius: '6px',
                      border: `1px solid ${extensions.nord.avant > 0 ? '#3b82f6' : '#cbd5e1'}`,
                      background: extensions.nord.avant > 0 ? '#eff6ff' : '#ffffff',
                      color: extensions.nord.avant > 0 ? '#2563eb' : '#64748b',
                      fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    AUVENT
                  </button>
                  <button
                    onClick={() => toggleExtension('nord', 'arriere')}
                    style={{
                      flex: 1, padding: '0.35rem', borderRadius: '6px',
                      border: `1px solid ${extensions.nord.arriere > 0 ? '#3b82f6' : '#cbd5e1'}`,
                      background: extensions.nord.arriere > 0 ? '#eff6ff' : '#ffffff',
                      color: extensions.nord.arriere > 0 ? '#2563eb' : '#64748b',
                      fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    APPENTIS
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <span style={{ width: '32px', color: '#64748b', fontWeight: 700 }}>DRY</span>
                  <button
                    onClick={() => toggleExtension('sud', 'avant')}
                    style={{
                      flex: 1, padding: '0.35rem', borderRadius: '6px',
                      border: `1px solid ${extensions.sud.avant > 0 ? '#3b82f6' : '#cbd5e1'}`,
                      background: extensions.sud.avant > 0 ? '#eff6ff' : '#ffffff',
                      color: extensions.sud.avant > 0 ? '#2563eb' : '#64748b',
                      fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    AUVENT
                  </button>
                  <button
                    onClick={() => toggleExtension('sud', 'arriere')}
                    style={{
                      flex: 1, padding: '0.35rem', borderRadius: '6px',
                      border: `1px solid ${extensions.sud.arriere > 0 ? '#3b82f6' : '#cbd5e1'}`,
                      background: extensions.sud.arriere > 0 ? '#eff6ff' : '#ffffff',
                      color: extensions.sud.arriere > 0 ? '#2563eb' : '#64748b',
                      fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    APPENTIS
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Espacement Travées */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ESPACEMENT TRAVÉES
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['6m', '7.5m'].map(esp => (
                <button
                  key={esp}
                  onClick={() => setEspacementTravees(esp)}
                  style={{
                    flex: 1, padding: '0.45rem', borderRadius: '8px', border: 'none',
                    background: espacementTravees === esp ? '#3b82f6' : '#f1f5f9',
                    color: espacementTravees === esp ? '#ffffff' : '#64748b',
                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {esp}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre de Travées */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              NOMBRE DE TRAVÉES
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={() => setNombreTravees(Math.max(1, nombreTravees - 1))}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                  background: '#ef4444', color: '#ffffff', fontSize: '1.2rem', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                −
              </button>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', minWidth: '32px', textAlign: 'center' }}>
                {nombreTravees}
              </span>
              <button
                onClick={() => setNombreTravees(Math.min(20, nombreTravees + 1))}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                  background: '#22c55e', color: '#ffffff', fontSize: '1.2rem', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                +
              </button>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem', display: 'block' }}>
              {nombreTravees} travée{nombreTravees > 1 ? 's' : ''} x {bayLength}m = {longueur}m
            </span>
          </div>

          {/* Paramètres Fixes */}
          <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              PARAMÈTRES FIXES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>
              <span>🔴 Pente: {specs.pitch}°</span>
              <span>🔴 H. Égout: {specs.eave}m</span>
            </div>
          </div>

          {/* Option Solaire Toggle */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OPTION SOLAIRE
            </label>
            <button
              onClick={() => setSolarEnabled(!solarEnabled)}
              style={{
                width: '100%', padding: '0.6rem', borderRadius: '8px',
                border: `2px solid ${solarEnabled ? '#f97316' : '#e2e8f0'}`,
                background: solarEnabled ? '#fff7ed' : '#ffffff',
                color: solarEnabled ? '#ea580c' : '#64748b',
                fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              Couverture Solaire PV
            </button>
          </div>

          {/* Puissance & Tarif Solaire Detailed Breakdown (Pj 5 Table) */}
          {solarEnabled && (
            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '10px', padding: '0.8rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#c2410c', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                PUISSANCE INSTALLÉE
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ea580c' }}>
                {solarPowerKwc} <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>kWc</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginBottom: '0.5rem' }}>
                {panelCount} panneaux (465Wc)
              </div>

              {/* Pricing detail from Pj 5 */}
              {solarPricing && (
                <div style={{ borderTop: '1px solid #fed7aa', paddingTop: '0.5rem', fontSize: '0.75rem', color: '#9a3412', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tarif Wc HT:</span>
                    <strong>{solarPricing.rateHT.toFixed(2)} € / Wc</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Montant Solaire HT:</span>
                    <strong style={{ color: '#059669' }}>{solarPricing.totalHT.toLocaleString('fr-FR')} € HT</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#65a30d' }}>
                    <span>TVA (20%):</span>
                    <span>{solarPricing.tva.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* CENTER PANEL: 3D VIEWPORT & CANVAS (Pure White #ffffff)              */}
        {/* =================================================================== */}
        <div style={{ flex: 1, position: 'relative', background: '#ffffff' }} ref={canvasContainerRef}>
          
          {/* Top-Left Overlays: Badges & Dimensions Toggle */}
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Dimensions Badge */}
            <div style={{
              background: '#ffffff', borderRadius: '8px', padding: '0.55rem 1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
              fontSize: '0.9rem', fontWeight: 700, color: '#0f172a'
            }}>
              {longueur.toFixed(2)}m x {numericWidth.toFixed(2)}m – {surface}m²
            </div>

            {/* Solar Badge */}
            {solarEnabled && (
              <div style={{
                background: '#ffffff', borderRadius: '8px', padding: '0.55rem 1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #fed7aa',
                fontSize: '0.9rem', fontWeight: 800, color: '#ea580c',
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}>
                ⚡ {solarPowerKwc} kWc
              </div>
            )}

            {/* Toggle Dimensions Switch Button */}
            <div
              onClick={() => setShowDimensions(!showDimensions)}
              style={{
                background: '#ef4444', borderRadius: '8px', padding: '0.5rem 0.9rem',
                display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer',
                color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <span>Afficher les côtes</span>
              <div style={{
                width: '36px', height: '20px', borderRadius: '10px',
                background: showDimensions ? '#22c55e' : '#94a3b8',
                position: 'relative', transition: 'background 0.2s'
              }}>
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%', background: '#ffffff',
                  position: 'absolute', top: '2px', left: showDimensions ? '18px' : '2px',
                  transition: 'left 0.2s'
                }} />
              </div>
            </div>
          </div>

          {/* Mouse interaction tip */}
          <div style={{
            position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)',
            zIndex: 10, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
            padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem',
            color: '#64748b', fontWeight: 600, border: '1px solid #e2e8f0', pointerEvents: 'none'
          }}>
            💡 Maintenez le clic gauche et glissez pour faire pivoter en 3D
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT PANEL: ACTIONS & MODALS (Width 165px)                         */}
        {/* =================================================================== */}
        <div style={{
          width: '165px', minWidth: '165px', background: '#ffffff',
          borderLeft: '1px solid #e2e8f0', padding: '1rem 0.8rem',
          display: 'flex', flexDirection: 'column', gap: '0.75rem'
        }}>
          {/* View mode toggle */}
          <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            <button
              onClick={() => handleViewMode('3d')}
              style={{
                flex: 1, padding: '0.45rem', border: 'none',
                background: viewMode === '3d' ? '#3b82f6' : '#ffffff',
                color: viewMode === '3d' ? '#ffffff' : '#64748b',
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Vue 3D
            </button>
            <button
              onClick={() => handleViewMode('2d')}
              style={{
                flex: 1, padding: '0.45rem', border: 'none',
                background: viewMode === '2d' ? '#3b82f6' : '#ffffff',
                color: viewMode === '2d' ? '#ffffff' : '#64748b',
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Vue 2D
            </button>
          </div>

          {/* Generate Offer button */}
          <button
            onClick={() => setShowOfferModal(true)}
            style={{
              padding: '0.65rem 0.5rem', borderRadius: '8px', border: 'none',
              background: '#22c55e', color: '#ffffff', fontSize: '0.8rem',
              fontWeight: 800, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
              boxShadow: '0 4px 10px rgba(34,197,94,0.25)', transition: 'all 0.2s'
            }}
          >
            📄 Générer l'Offre
          </button>

          {/* Download Image button */}
          <button
            onClick={handleScreenshot}
            style={{
              padding: '0.55rem 0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1',
              background: '#ffffff', color: '#475569', fontSize: '0.75rem',
              fontWeight: 600, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
            }}
          >
            <Download size={14} /> Télécharger image
          </button>

          {/* Fullscreen button */}
          <button
            onClick={handleFullscreen}
            style={{
              padding: '0.55rem 0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1',
              background: '#ffffff', color: '#475569', fontSize: '0.75rem',
              fontWeight: 600, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
            }}
          >
            <Maximize size={14} /> Plein écran
          </button>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* OFFER GENERATION MODAL                                                */}
      {/* ===================================================================== */}
      {showOfferModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', maxWidth: '500px', width: '100%',
            padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative'
          }}>
            <button
              onClick={() => setShowOfferModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>

            {!submitSuccess ? (
              <>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                  Demande de devis & étude technique
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Recevez gratuitement votre étude technique détaillée pour la structure {longueur}m x {numericWidth}m ({surface}m²).
                </p>

                <form onSubmit={handleSubmitLead} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <input
                      type="text" required placeholder="Nom *" value={leadForm.lastName}
                      onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })}
                      style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                    <input
                      type="text" required placeholder="Prénom *" value={leadForm.firstName}
                      onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })}
                      style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <input
                      type="email" required placeholder="Email *" value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                    <input
                      type="tel" required placeholder="Téléphone *" value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <input
                    type="text" placeholder="Entreprise / Exploitation" value={leadForm.company}
                    onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />

                  <textarea
                    rows={2} placeholder="Remarques ou spécificités..." value={leadForm.comments}
                    onChange={(e) => setLeadForm({ ...leadForm, comments: e.target.value })}
                    style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />

                  <button
                    type="submit" disabled={isSubmitting}
                    style={{
                      marginTop: '0.5rem', padding: '0.8rem', borderRadius: '8px', border: 'none',
                      background: '#22c55e', color: '#ffffff', fontSize: '0.9rem', fontWeight: 800,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                    }}
                  >
                    {isSubmitting ? 'Transmission en cours...' : 'Envoyer ma demande de devis'}
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Merci ! Votre demande a été enregistrée.
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Un conseiller charpente métallique va analyser vos dimensions ({longueur}m x {numericWidth}m) et vous contacter sous 24h.
                </p>
                <button
                  onClick={() => { setShowOfferModal(false); setSubmitSuccess(false); }}
                  style={{ marginTop: '1.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
}
