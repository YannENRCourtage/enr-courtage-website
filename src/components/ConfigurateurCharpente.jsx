import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Download, Maximize, CheckCircle2, Zap } from 'lucide-react';
import ecoEvoData from '../data/ecoEvoBuildings.json';
import { useToast } from './ui/use-toast';

// Solar Pricing Schedule based on PJ 5
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

// Building types & available widths
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

const WIDTH_HEIGHT_MAP = {
  '15.0': { ridge: 6.8, eave: 5.5, pitch: 10 },
  '18.6': { ridge: 7.1, eave: 5.5, pitch: 10 },
  '22.3': { ridge: 7.47, eave: 5.5, pitch: 10 },
  '26.0': { ridge: 7.8, eave: 5.5, pitch: 10 },
  '29.8': { ridge: 8.1, eave: 5.5, pitch: 10 },
  '33.5': { ridge: 8.5, eave: 5.5, pitch: 10 },
  '16.4': { ridge: 7.40, eave: 4.0, pitch: 15 },
  '20.0': { ridge: 7.80, eave: 4.0, pitch: 15 },
  '25.5': { ridge: 8.9, eave: 4.0, pitch: 15 },
  '29.1': { ridge: 9.8, eave: 4.0, pitch: 15 },
  '12.7': { ridge: 7.4, eave: 4.0, pitch: 15 },
  '6.9': { ridge: 4.10, eave: 2.9, pitch: 10 },
  '9.1': { ridge: 4.2, eave: 3.5, pitch: 5 },
  '11.3': { ridge: 4.4, eave: 3.5, pitch: 5 },
  '15.8': { ridge: 7.90, eave: 5.1, pitch: 10 },
  '20.2': { ridge: 8.30, eave: 5.1, pitch: 10 },
  '24.6': { ridge: 8.70, eave: 5.1, pitch: 10 },
};

// Helper: Create 3D Text Sprite for measurement annotations
function createTextSprite(text, fontSize = 30, color = '#000000', bgColor = 'rgba(255,255,255,0.95)') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (bgColor) {
    ctx.fillStyle = bgColor;
    if (ctx.roundRect) {
      ctx.roundRect(14, 26, 228, 76, 12);
    } else {
      ctx.fillRect(14, 26, 228, 76);
    }
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.font = `Bold ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(3.8, 1.9, 1);
  return sprite;
}

export default function ConfigurateurCharpente() {
  const { toast } = useToast();

  // Configuration State
  const [buildingType, setBuildingType] = useState('asymetrique_1_zone');
  const [largeurBatiment, setLargeurBatiment] = useState('16.4');
  const [espacementTravees, setEspacementTravees] = useState('7.5m'); // '6m' or '7.5m'
  const [nombreTravees, setNombreTravees] = useState(5);
  const [solarEnabled, setSolarEnabled] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);

  // Extensions (GCH = Gauche, DRT = Droite)
  // Value: 'none', 'auvent' (4.0m), 'appentis' (9.3m)
  const [extGch, setExtGch] = useState('none');
  const [extDrt, setExtDrt] = useState('none');

  // Canvas & Scene Refs
  const canvasContainerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const buildingGroupRef = useRef(null);

  // Available Widths computed based on type
  const availableWidths = useMemo(() => TYPE_WIDTHS_MAP[buildingType] || ['18.6'], [buildingType]);

  // Keep width valid when buildingType changes
  useEffect(() => {
    if (!availableWidths.includes(largeurBatiment)) {
      setLargeurBatiment(availableWidths[0]);
    }
  }, [buildingType, availableWidths, largeurBatiment]);

  // Extension widths
  const widthGch = useMemo(() => (extGch === 'auvent' ? 4.0 : (extGch === 'appentis' ? 9.3 : 0)), [extGch]);
  const widthDrt = useMemo(() => (extDrt === 'auvent' ? 4.0 : (extDrt === 'appentis' ? 9.3 : 0)), [extDrt]);

  // Geometry calculations
  const numericWidth = useMemo(() => parseFloat(largeurBatiment) || 16.4, [largeurBatiment]);
  const bayLength = useMemo(() => (espacementTravees === '6m' ? 6.0 : 7.5), [espacementTravees]);
  const longueur = useMemo(() => bayLength * nombreTravees, [bayLength, nombreTravees]);
  
  const totalWidth = useMemo(() => numericWidth + widthGch + widthDrt, [numericWidth, widthGch, widthDrt]);
  const totalSurface = useMemo(() => Math.round(totalWidth * longueur), [totalWidth, longueur]);

  // Specs (ridge height, eave height, pitch)
  const specs = useMemo(() => WIDTH_HEIGHT_MAP[largeurBatiment] || { ridge: 7.4, eave: 4.0, pitch: 15 }, [largeurBatiment]);

  // Solar power & panels
  const panelCount = useMemo(() => {
    if (!solarEnabled) return 0;
    return Math.floor((totalSurface * 0.95) / 2.38);
  }, [solarEnabled, totalSurface]);

  const solarPowerKwc = useMemo(() => {
    if (!solarEnabled) return 0;
    return Math.round(panelCount * 0.465 * 100) / 100;
  }, [solarEnabled, panelCount]);

  // Pricing calculations
  const charpentePriceHT = useMemo(() => {
    const match = ecoEvoData.find(b => Math.abs(b.width - numericWidth) <= 0.8 && Math.abs(b.length - longueur) <= 0.8);
    let base = match ? match.price_ht : Math.round(totalSurface * 110);

    if (extGch === 'auvent') base += Math.round(longueur * 4.0 * 55);
    if (extGch === 'appentis') base += Math.round(longueur * 9.3 * 75);
    if (extDrt === 'auvent') base += Math.round(longueur * 4.0 * 55);
    if (extDrt === 'appentis') base += Math.round(longueur * 9.3 * 75);

    return Math.round(base);
  }, [numericWidth, longueur, totalSurface, extGch, extDrt]);

  const solarPriceHT = useMemo(() => {
    return getSolarPriceHT(solarPowerKwc);
  }, [solarPowerKwc]);

  // Toggle extension handler
  const toggleExt = (side, type) => {
    if (side === 'gch') {
      setExtGch(prev => (prev === type ? 'none' : type));
    } else {
      setExtDrt(prev => (prev === type ? 'none' : type));
    }
  };

  // ---------------------------------------------------------------------------
  // 1. Initial Scene Setup (Three.js WebGL) - RUNS ONCE ON MOUNT
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // Pure WHITE background (#ffffff) with NO ground shadows as requested
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffffff);
    sceneRef.current = scene;

    // Camera matching Nelson orientation: position [8, 6, 8], fov 45
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(16, 12, 16);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // OrbitControls (Persistent position, smooth damping)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.01;
    controls.target.set(0, 3, 0);
    controls.update();
    controlsRef.current = controls;

    // Lighting (Bright & crisp daylight)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight1.position.set(20, 30, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight2.position.set(-20, 20, -20);
    scene.add(dirLight2);

    // Group for building meshes
    const bGroup = new THREE.Group();
    buildingGroupRef.current = bGroup;
    scene.add(bGroup);

    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler (Window + Fullscreen change fix)
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const wRes = container.clientWidth;
      const hRes = container.clientHeight;
      cameraRef.current.aspect = wRes / hRes;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(wRes, hRes);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
      renderer.dispose();
    };
  }, []); // Run ONCE on mount to ensure persistent camera orientation

  // ---------------------------------------------------------------------------
  // 2. Rebuild 3D Meshes when options change (Camera position remains persistent)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const bGroup = buildingGroupRef.current;
    if (!bGroup) return;

    // Clear previous meshes
    while (bGroup.children.length > 0) {
      const obj = bGroup.children[0];
      bGroup.remove(obj);
    }

    // Exact Nelson Green Invest Materials (steel grey frame + dark roof + indigo solar)
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x5a6675, metalness: 0.6, roughness: 0.3 });
    const rafterMat = new THREE.MeshStandardMaterial({ color: 0x4a5565, metalness: 0.65, roughness: 0.3 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x38414e, metalness: 0.4, roughness: 0.5 });
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x1a237e, metalness: 0.85, roughness: 0.15 });
    const lineMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });

    const w = numericWidth;
    const l = longueur;
    const eh = specs.eave;
    const rh = specs.ridge;
    const halfW = w / 2;
    const pitchRad = (specs.pitch * Math.PI) / 180;
    const isOmbriere = buildingType.startsWith('ombriere');

    // Scale down 3D model to fit view space cleanly (scale 0.25)
    const s = 0.25;
    const sw = w * s;
    const sl = l * s;
    const seh = eh * s;
    const srh = rh * s;
    const shalfW = sw / 2;
    const sbayL = bayLength * s;

    const sWidthGch = widthGch * s;
    const sWidthDrt = widthDrt * s;

    // Center offset
    const centerX = (sWidthGch - sWidthDrt) / 2;
    const structureGroup = new THREE.Group();
    structureGroup.position.set(centerX, 0, 0);

    // Generate Frames at each travée
    for (let i = 0; i <= nombreTravees; i++) {
      const z = -sl / 2 + i * sbayL;
      const frame = new THREE.Group();
      frame.position.set(0, 0, z);

      if (buildingType === 'symetrique') {
        // Left Column
        const colGeo = new THREE.BoxGeometry(0.08, seh, 0.08);
        const colL = new THREE.Mesh(colGeo, steelMat);
        colL.position.set(-shalfW, seh / 2, 0);
        frame.add(colL);

        // Right Column
        const colR = new THREE.Mesh(colGeo, steelMat);
        colR.position.set(shalfW, seh / 2, 0);
        frame.add(colR);

        // Rafters
        const spanL = Math.hypot(shalfW, srh - seh);
        const rGeo = new THREE.BoxGeometry(spanL, 0.06, 0.06);
        const rafterL = new THREE.Mesh(rGeo, rafterMat);
        rafterL.position.set(-shalfW / 2, (seh + srh) / 2, 0);
        rafterL.rotation.z = Math.atan2(srh - seh, shalfW);
        frame.add(rafterL);

        const rafterR = new THREE.Mesh(rGeo, rafterMat);
        rafterR.position.set(shalfW / 2, (seh + srh) / 2, 0);
        rafterR.rotation.z = -Math.atan2(srh - seh, shalfW);
        frame.add(rafterR);

        // Tie beam
        const tieGeo = new THREE.BoxGeometry(sw, 0.05, 0.05);
        const tie = new THREE.Mesh(tieGeo, steelMat);
        tie.position.set(0, seh, 0);
        frame.add(tie);

      } else {
        // Asymétrique / Monopente / Ombrière
        const colGeoL = new THREE.BoxGeometry(0.08, seh, 0.08);
        const colL = new THREE.Mesh(colGeoL, steelMat);
        colL.position.set(-shalfW, seh / 2, 0);
        frame.add(colL);

        const colGeoR = new THREE.BoxGeometry(0.08, srh, 0.08);
        const colR = new THREE.Mesh(colGeoR, steelMat);
        colR.position.set(shalfW, srh / 2, 0);
        frame.add(colR);

        const span = Math.hypot(sw, srh - seh);
        const rGeo = new THREE.BoxGeometry(span, 0.06, 0.06);
        const rafter = new THREE.Mesh(rGeo, rafterMat);
        rafter.position.set(0, (seh + srh) / 2, 0);
        rafter.rotation.z = Math.atan2(srh - seh, sw);
        frame.add(rafter);
      }

      // Extension Gauche (GCH) Structure - Strictly following roof pitch
      if (sWidthGch > 0 && !isOmbriere) {
        const extX = -shalfW - sWidthGch / 2;
        const outerEH = extGch === 'appentis' ? 3.9 * s : seh - sWidthGch * Math.tan(pitchRad);

        const colExtGeo = new THREE.BoxGeometry(0.07, outerEH, 0.07);
        const colExt = new THREE.Mesh(colExtGeo, steelMat);
        colExt.position.set(-shalfW - sWidthGch, outerEH / 2, 0);
        frame.add(colExt);

        const rSpan = Math.hypot(sWidthGch, seh - outerEH);
        const rExtGeo = new THREE.BoxGeometry(rSpan, 0.05, 0.05);
        const rafterExt = new THREE.Mesh(rExtGeo, rafterMat);
        rafterExt.position.set(extX, (seh + outerEH) / 2, 0);
        rafterExt.rotation.z = Math.atan2(seh - outerEH, sWidthGch);
        frame.add(rafterExt);
      }

      // Extension Droite (DRT) Structure - Strictly following roof pitch
      if (sWidthDrt > 0 && !isOmbriere) {
        const extX = shalfW + sWidthDrt / 2;
        const outerEH = extDrt === 'appentis' ? 3.9 * s : seh - sWidthDrt * Math.tan(pitchRad);

        const colExtGeo = new THREE.BoxGeometry(0.07, outerEH, 0.07);
        const colExt = new THREE.Mesh(colExtGeo, steelMat);
        colExt.position.set(shalfW + sWidthDrt, outerEH / 2, 0);
        frame.add(colExt);

        const rSpan = Math.hypot(sWidthDrt, seh - outerEH);
        const rExtGeo = new THREE.BoxGeometry(rSpan, 0.05, 0.05);
        const rafterExt = new THREE.Mesh(rExtGeo, rafterMat);
        rafterExt.position.set(extX, (seh + outerEH) / 2, 0);
        rafterExt.rotation.z = -Math.atan2(seh - outerEH, sWidthDrt);
        frame.add(rafterExt);
      }

      // Diagonal Cross Bracing (Croix de Saint-André) between 1st & 2nd frame
      if (i === 1) {
        const bLineGeo1 = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-shalfW, 0, -sl / 2),
          new THREE.Vector3(-shalfW, seh, -sl / 2 + sbayL)
        ]);
        const bLine1 = new THREE.Line(bLineGeo1, steelMat);
        frame.add(bLine1);

        const bLineGeo2 = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-shalfW, seh, -sl / 2),
          new THREE.Vector3(-shalfW, 0, -sl / 2 + sbayL)
        ]);
        const bLine2 = new THREE.Line(bLineGeo2, steelMat);
        frame.add(bLine2);
      }

      structureGroup.add(frame);
    }

    // Roof Sheets
    if (buildingType === 'symetrique') {
      const spanL = Math.hypot(shalfW, srh - seh);
      const rSheetGeo = new THREE.BoxGeometry(spanL, 0.02, sl + 0.1);
      
      const rSheetL = new THREE.Mesh(rSheetGeo, roofMat);
      rSheetL.position.set(-shalfW / 2, (seh + srh) / 2 + 0.02, 0);
      rSheetL.rotation.z = Math.atan2(srh - seh, shalfW);
      structureGroup.add(rSheetL);

      const rSheetR = new THREE.Mesh(rSheetGeo, roofMat);
      rSheetR.position.set(shalfW / 2, (seh + srh) / 2 + 0.02, 0);
      rSheetR.rotation.z = -Math.atan2(srh - seh, shalfW);
      structureGroup.add(rSheetR);
    } else {
      const span = Math.hypot(sw, srh - seh);
      const rSheetGeo = new THREE.BoxGeometry(span, 0.02, sl + 0.1);
      const rSheet = new THREE.Mesh(rSheetGeo, roofMat);
      rSheet.position.set(0, (seh + srh) / 2 + 0.02, 0);
      rSheet.rotation.z = Math.atan2(srh - seh, sw);
      structureGroup.add(rSheet);
    }

    // Solar Panels Grid (Implantation Solaire)
    if (solarEnabled) {
      const solarGroup = new THREE.Group();
      const rows = Math.floor(sl / 0.5);
      const cols = Math.floor(sw / 0.4);
      const panelGeo = new THREE.BoxGeometry(0.35, 0.015, 0.48);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const panel = new THREE.Mesh(panelGeo, solarMat);
          const px = -shalfW + 0.2 + c * 0.38;
          const pz = -sl / 2 + 0.25 + r * 0.5;
          const py = seh + (px + shalfW) * Math.tan(Math.atan2(srh - seh, sw)) + 0.03;
          panel.position.set(px, py, pz);
          panel.rotation.z = Math.atan2(srh - seh, sw);
          solarGroup.add(panel);
        }
      }
      structureGroup.add(solarGroup);
    }

    // -------------------------------------------------------------------------
    // 3D Measurement Dimension Markers & Annotations
    // -------------------------------------------------------------------------
    if (showDimensions) {
      const dimGroup = new THREE.Group();

      // Width Line & Label
      const lineWGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-shalfW, 0.02, sl / 2 + 0.6),
        new THREE.Vector3(shalfW, 0.02, sl / 2 + 0.6)
      ]);
      const lineW = new THREE.Line(lineWGeo, lineMat);
      dimGroup.add(lineW);

      const labelW = createTextSprite(`${numericWidth.toFixed(1)} m`, 32);
      labelW.position.set(0, 0.2, sl / 2 + 0.6);
      dimGroup.add(labelW);

      // Extension Width Label if active
      if (sWidthDrt > 0) {
        const lineExtGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(shalfW, 0.02, sl / 2 + 0.6),
          new THREE.Vector3(shalfW + sWidthDrt, 0.02, sl / 2 + 0.6)
        ]);
        const lineExt = new THREE.Line(lineExtGeo, lineMat);
        dimGroup.add(lineExt);

        const labelExt = createTextSprite(`${widthDrt.toFixed(1)} m`, 30);
        labelExt.position.set(shalfW + sWidthDrt / 2, 0.2, sl / 2 + 0.6);
        dimGroup.add(labelExt);
      }

      // Length Line & Label (Right side)
      const xLength = shalfW + sWidthDrt + 0.6;
      const lineLGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(xLength, 0.02, -sl / 2),
        new THREE.Vector3(xLength, 0.02, sl / 2)
      ]);
      const lineL = new THREE.Line(lineLGeo, lineMat);
      dimGroup.add(lineL);

      const labelL = createTextSprite(`${longueur.toFixed(1)} m`, 32);
      labelL.position.set(xLength + 0.4, 0.2, 0);
      dimGroup.add(labelL);

      // Eave Height Line & Label
      const xEaveLine = -shalfW - sWidthGch - 0.6;
      const lineEaveGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(xEaveLine, 0, -sl / 2),
        new THREE.Vector3(xEaveLine, seh, -sl / 2)
      ]);
      const lineEave = new THREE.Line(lineEaveGeo, lineMat);
      dimGroup.add(lineEave);

      const labelEave = createTextSprite(`${specs.eave.toFixed(1)} m`, 30);
      labelEave.position.set(xEaveLine - 0.4, seh / 2, -sl / 2);
      dimGroup.add(labelEave);

      // Ridge Height Line & Label
      const lineRidgeGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, -sl / 2 - 0.6),
        new THREE.Vector3(0, srh, -sl / 2 - 0.6)
      ]);
      const lineRidge = new THREE.Line(lineRidgeGeo, lineMat);
      dimGroup.add(lineRidge);

      const labelRidge = createTextSprite(`${specs.ridge.toFixed(2)} m`, 30);
      labelRidge.position.set(0, srh / 2, -sl / 2 - 0.9);
      dimGroup.add(labelRidge);

      // Roof Surface Label (On top of roof)
      const labelSurf = createTextSprite(`${totalSurface} m²`, 36, '#0f172a', 'rgba(255,255,255,0.96)');
      labelSurf.position.set(0, srh + 0.4, 0);
      dimGroup.add(labelSurf);

      structureGroup.add(dimGroup);
    }

    bGroup.add(structureGroup);

  }, [buildingType, numericWidth, longueur, specs, bayLength, nombreTravees, solarEnabled, extGch, extDrt, widthGch, widthDrt, totalWidth, totalSurface, showDimensions]);

  // Screenshot capture
  const handleScreenshot = () => {
    if (!rendererRef.current) return;
    const link = document.createElement('a');
    link.download = `configurateur-charpente-${Date.now()}.png`;
    link.href = rendererRef.current.domElement.toDataURL('image/png');
    link.click();
  };

  // Fullscreen toggle
  const handleFullscreen = () => {
    const elem = canvasContainerRef.current;
    if (elem && elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };

  return (
    <section id="configurateur-charpente" style={{ background: '#ffffff', color: '#1f2937', padding: '3rem 1rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* SECTION HEADER */}
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Votre structure métallique <span style={{ color: '#2563eb' }}>sur-mesure</span>
        </h2>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.5 }}>
          Configurez votre bâtiment ou ombrière métallique étape par étape, visualisez la structure en 3D dynamique et obtenez votre chiffrage immédiat.
        </p>
      </div>

      {/* MAIN CONFIGURATOR CONTAINER (EXACT REPLICA OF NELSON GREEN INVEST INTERFACE) */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        height: 'calc(100vh - 120px)',
        minHeight: '680px',
        maxHeight: '900px',
        background: '#ffffff',
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
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
            Configurateur 3D
          </h2>

          {/* Type de Bâtiment */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#374151', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#374151', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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

          {/* Extensions (GCH & DRT) */}
          {(!buildingType.startsWith('ombriere')) && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#374151', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                EXTENSIONS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {/* GCH */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <span style={{ width: '32px', color: '#64748b', fontWeight: 800 }}>GCH</span>
                  <button
                    onClick={() => toggleExt('gch', 'auvent')}
                    style={{
                      flex: 1, padding: '0.35rem', borderRadius: '6px',
                      border: `1px solid ${extGch === 'auvent' ? '#3b82f6' : '#cbd5e1'}`,
                      background: extGch === 'auvent' ? '#eff6ff' : '#ffffff',
                      color: extGch === 'auvent' ? '#2563eb' : '#64748b',
                      fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    AUVENT
                  </button>
                  <button
                    onClick={() => toggleExt('gch', 'appentis')}
                    style={{
                      flex: 1, padding: '0.35rem', borderRadius: '6px',
                      border: `1px solid ${extGch === 'appentis' ? '#3b82f6' : '#cbd5e1'}`,
                      background: extGch === 'appentis' ? '#eff6ff' : '#ffffff',
                      color: extGch === 'appentis' ? '#2563eb' : '#64748b',
                      fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    APPENTIS
                  </button>
                </div>

                {/* DRT */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <span style={{ width: '32px', color: '#64748b', fontWeight: 800 }}>DRT</span>
                  <button
                    onClick={() => toggleExt('drt', 'auvent')}
                    style={{
                      flex: 1, padding: '0.35rem', borderRadius: '6px',
                      border: `1px solid ${extDrt === 'auvent' ? '#3b82f6' : '#cbd5e1'}`,
                      background: extDrt === 'auvent' ? '#eff6ff' : '#ffffff',
                      color: extDrt === 'auvent' ? '#2563eb' : '#64748b',
                      fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    AUVENT
                  </button>
                  <button
                    onClick={() => toggleExt('drt', 'appentis')}
                    style={{
                      flex: 1, padding: '0.35rem', borderRadius: '6px',
                      border: `1px solid ${extDrt === 'appentis' ? '#3b82f6' : '#cbd5e1'}`,
                      background: extDrt === 'appentis' ? '#eff6ff' : '#ffffff',
                      color: extDrt === 'appentis' ? '#2563eb' : '#64748b',
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
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#374151', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#374151', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              PARAMÈTRES FIXES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>
              <span>🔴 Pente: {specs.pitch}°</span>
              <span>🔴 H. Égout: {specs.eave}m</span>
            </div>
          </div>

          {/* Option Solaire Toggle */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#374151', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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

          {/* Puissance & Nombre de Panneaux (NO pricing mentioned here) */}
          {solarEnabled && (
            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '10px', padding: '0.8rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#c2410c', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                PUISSANCE INSTALLÉE
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ea580c' }}>
                {solarPowerKwc} <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>kWc</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '0.2rem' }}>
                {panelCount} panneaux (465Wc)
              </div>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* CENTER PANEL: 3D VIEWPORT & CANVAS (Pure White #ffffff)              */}
        {/* =================================================================== */}
        <div style={{ flex: 1, position: 'relative', background: '#ffffff' }} ref={canvasContainerRef}>
          
          {/* Top-Left Overlays: Badges & Dimensions Toggle Button */}
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Dimensions Badge */}
            <div style={{
              background: '#ffffff', borderRadius: '8px', padding: '0.55rem 1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
              fontSize: '0.9rem', fontWeight: 700, color: '#0f172a'
            }}>
              {longueur.toFixed(2)}m x {totalWidth.toFixed(2)}m – {totalSurface}m²
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

            {/* Toggle Dimensions Button (Nelson Pill Style) */}
            <div
              onClick={() => setShowDimensions(!showDimensions)}
              style={{
                background: '#3b82f6', borderRadius: '8px', padding: '0.5rem 0.9rem',
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
            position: 'absolute', bottom: '1rem', left: '1.25rem',
            zIndex: 10, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
            padding: '0.4rem 0.9rem', borderRadius: '20px', fontSize: '0.75rem',
            color: '#64748b', fontWeight: 600, border: '1px solid #e2e8f0', pointerEvents: 'none'
          }}>
            💡 Maintenez le clic gauche et glissez pour faire pivoter la structure en 3D
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT PANEL: ACTIONS & SUMMARY (Width 180px)                        */}
        {/* =================================================================== */}
        <div style={{
          width: '185px', minWidth: '185px', background: '#ffffff',
          borderLeft: '1px solid #e2e8f0', padding: '1rem 0.75rem',
          display: 'flex', flexDirection: 'column', gap: '0.75rem'
        }}>
          {/* Download Image button */}
          <button
            onClick={handleScreenshot}
            style={{
              padding: '0.6rem 0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1',
              background: '#ffffff', color: '#334155', fontSize: '0.75rem',
              fontWeight: 700, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
            }}
          >
            <Download size={14} /> Télécharger image
          </button>

          {/* Fullscreen button */}
          <button
            onClick={handleFullscreen}
            style={{
              padding: '0.6rem 0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1',
              background: '#ffffff', color: '#334155', fontSize: '0.75rem',
              fontWeight: 700, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
            }}
          >
            <Maximize size={14} /> Plein écran
          </button>

          {/* SUMMARY BOX DIRECTLY UNDER BUTTONS AS REQUESTED */}
          <div style={{
            marginTop: '0.5rem', background: '#f8fafc', borderRadius: '12px',
            border: '1px solid #cbd5e1', padding: '0.8rem 0.75rem',
            display: 'flex', flexDirection: 'column', gap: '0.45rem'
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
              SYNTHÈSE DU BÂTIMENT
            </div>
            
            <div style={{ fontSize: '0.75rem', color: '#334155' }}>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.65rem' }}>Dimensions</span>
              <strong>{longueur.toFixed(2)}m x {totalWidth.toFixed(2)}m</strong>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#334155' }}>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.65rem' }}>Surface au sol</span>
              <strong>{totalSurface} m²</strong>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#0f172a', paddingTop: '0.3rem', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.65rem' }}>Charpente métallique</span>
              <strong style={{ color: '#2563eb' }}>{charpentePriceHT.toLocaleString('fr-FR')} € HT</strong>
            </div>

            {solarEnabled && (
              <div style={{ fontSize: '0.78rem', color: '#ea580c', paddingTop: '0.2rem' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.65rem' }}>Installation solaire</span>
                <strong>{solarPriceHT.toLocaleString('fr-FR')} € HT</strong>
              </div>
            )}
          </div>
        </div>

      </div>

    </section>
  );
}
