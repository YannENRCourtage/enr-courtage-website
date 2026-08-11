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
  '16.4': { ridge: 6.9, eave: 4.0, pitch: 15 },
  '20.0': { ridge: 7.3, eave: 4.0, pitch: 15 },
  '25.5': { ridge: 8.9, eave: 4.0, pitch: 15 },
  '29.1': { ridge: 9.8, eave: 4.0, pitch: 15 },
  '12.7': { ridge: 7.4, eave: 4.0, pitch: 15 },
  '6.9': { ridge: 4.10, eave: 2.9, pitch: 10 },
  '9.1': { ridge: 4.2, eave: 3.5, pitch: 5 },
  '11.3': { ridge: 4.4, eave: 3.5, pitch: 5 },
  '15.8': { ridge: 5.8, eave: 4.5, pitch: 5 },
  '20.2': { ridge: 6.2, eave: 4.5, pitch: 5 },
  '24.6': { ridge: 6.6, eave: 4.5, pitch: 5 },
};

// Helper: Create 3D Text Sprite facing camera
function createTextSprite(text, fontSize = 32, color = '#0f172a', bgColor = 'rgba(255,255,255,0.92)') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (bgColor) {
    ctx.fillStyle = bgColor;
    if (ctx.roundRect) {
      ctx.roundRect(12, 24, 232, 80, 14);
    } else {
      ctx.fillRect(12, 24, 232, 80);
    }
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.font = `Bold ${fontSize}px Inter, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(4.5, 2.25, 1);
  return sprite;
}

export default function ConfigurateurCharpente() {
  const { toast } = useToast();

  // Configuration State
  const [buildingType, setBuildingType] = useState('symetrique');
  const [largeurBatiment, setLargeurBatiment] = useState('22.3');
  const [espacementTravees, setEspacementTravees] = useState('7.5m'); // '6m' or '7.5m'
  const [nombreTravees, setNombreTravees] = useState(5);
  const [solarEnabled, setSolarEnabled] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);

  // Extensions (GCH = Gauche, DRT = Droite)
  // Value: 'none', 'auvent' (4.0m), 'appentis' (9.3m)
  const [extGch, setExtGch] = useState('auvent');
  const [extDrt, setExtDrt] = useState('appentis');

  // Canvas Refs
  const canvasContainerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

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
  const numericWidth = useMemo(() => parseFloat(largeurBatiment) || 18.6, [largeurBatiment]);
  const bayLength = useMemo(() => (espacementTravees === '6m' ? 6.0 : 7.5), [espacementTravees]);
  const longueur = useMemo(() => bayLength * nombreTravees, [bayLength, nombreTravees]);
  
  const totalWidth = useMemo(() => numericWidth + widthGch + widthDrt, [numericWidth, widthGch, widthDrt]);
  const totalSurface = useMemo(() => Math.round(totalWidth * longueur), [totalWidth, longueur]);

  // Specs (ridge height, eave height, pitch)
  const specs = useMemo(() => WIDTH_HEIGHT_MAP[largeurBatiment] || { ridge: 7.1, eave: 5.5, pitch: 10 }, [largeurBatiment]);

  // Solar power & panels
  const panelCount = useMemo(() => {
    if (!solarEnabled) return 0;
    return Math.floor((totalSurface * 0.95) / 2.68);
  }, [solarEnabled, totalSurface]);

  const solarPowerKwc = useMemo(() => {
    if (!solarEnabled) return 0;
    return Math.round(panelCount * 0.465 * 100) / 100;
  }, [solarEnabled, panelCount]);

  // Pricing calculations
  const charpentePriceHT = useMemo(() => {
    const match = ecoEvoData.find(b => Math.abs(b.width - numericWidth) <= 0.8 && Math.abs(b.length - longueur) <= 0.8);
    let base = match ? match.price_ht : Math.round(totalSurface * 108);

    // Add surcost for extensions
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
  // 3D Scene Initialization & Render Loop (Three.js WebGL)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // Scene on pure WHITE background (#ffffff)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(totalWidth * 1.3, specs.ridge * 1.7, longueur * 1.05);
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

    // Lighting (Bright daylight matching Green Invest interface)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(40, 60, 30);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    dirLight1.shadow.bias = -0.0001;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight2.position.set(-40, 30, -30);
    scene.add(dirLight2);

    // Soft Contact Shadow Ground Plane (matching Nelson Green Invest visual)
    const groundGeo = new THREE.PlaneGeometry(longueur + 40, totalWidth + 40);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.25 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Light grey floor background plane
    const floorGeo = new THREE.PlaneGeometry(longueur + 100, totalWidth + 100);
    const floorMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    scene.add(floor);

    // -------------------------------------------------------------------------
    // Build 3D Metal Structure
    // -------------------------------------------------------------------------
    const buildingGroup = new THREE.Group();

    // Exact Green Invest Materials (galvanized steel frame + dark corrugated roof)
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x8a95a5, metalness: 0.75, roughness: 0.25 });
    const rafterMat = new THREE.MeshStandardMaterial({ color: 0x788696, metalness: 0.8, roughness: 0.2 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x38414e, metalness: 0.35, roughness: 0.45 });
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.9, roughness: 0.1 });
    const lineMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });

    const w = numericWidth;
    const l = longueur;
    const eh = specs.eave;
    const rh = specs.ridge;
    const halfW = w / 2;
    const isOmbriere = buildingType.startsWith('ombriere');

    // Portal frames along bays
    for (let i = 0; i <= nombreTravees; i++) {
      const z = -l / 2 + i * bayLength;
      const frame = new THREE.Group();
      frame.position.set(0, 0, z);

      // Main Building Columns & Rafters
      if (buildingType === 'symetrique') {
        // Left Column
        const colGeo = new THREE.BoxGeometry(0.24, eh, 0.24);
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
        const rafterGeo = new THREE.BoxGeometry(spanL, 0.2, 0.2);
        const rafterL = new THREE.Mesh(rafterGeo, rafterMat);
        rafterL.position.set(-halfW / 2, (eh + rh) / 2, 0);
        rafterL.rotation.z = Math.atan2(rh - eh, halfW);
        rafterL.castShadow = true;
        frame.add(rafterL);

        // Right Rafter
        const rafterR = new THREE.Mesh(rafterGeo, rafterMat);
        rafterR.position.set(halfW / 2, (eh + rh) / 2, 0);
        rafterR.rotation.z = -Math.atan2(rh - eh, halfW);
        rafterR.castShadow = true;
        frame.add(rafterR);

        // Tie beam
        const tieGeo = new THREE.BoxGeometry(w, 0.12, 0.12);
        const tie = new THREE.Mesh(tieGeo, steelMat);
        tie.position.set(0, eh, 0);
        frame.add(tie);

      } else {
        // Asymétrique / Monopente / Ombrière
        const colGeoL = new THREE.BoxGeometry(0.24, eh, 0.24);
        const colL = new THREE.Mesh(colGeoL, steelMat);
        colL.position.set(-halfW, eh / 2, 0);
        colL.castShadow = true;
        frame.add(colL);

        const colGeoR = new THREE.BoxGeometry(0.24, rh, 0.24);
        const colR = new THREE.Mesh(colGeoR, steelMat);
        colR.position.set(halfW, rh / 2, 0);
        colR.castShadow = true;
        frame.add(colR);

        const span = Math.hypot(w, rh - eh);
        const rGeo = new THREE.BoxGeometry(span, 0.2, 0.2);
        const rafter = new THREE.Mesh(rGeo, rafterMat);
        rafter.position.set(0, (eh + rh) / 2, 0);
        rafter.rotation.z = Math.atan2(rh - eh, w);
        rafter.castShadow = true;
        frame.add(rafter);
      }

      // Extension Gauche (GCH) Structure
      if (widthGch > 0 && !isOmbriere) {
        const extX = -halfW - widthGch / 2;
        if (extGch === 'appentis') {
          const outerH = 3.9;
          const colGeoExt = new THREE.BoxGeometry(0.2, outerH, 0.2);
          const colExt = new THREE.Mesh(colGeoExt, steelMat);
          colExt.position.set(-halfW - widthGch, outerH / 2, 0);
          colExt.castShadow = true;
          frame.add(colExt);

          const rSpan = Math.hypot(widthGch, eh - outerH);
          const rGeoExt = new THREE.BoxGeometry(rSpan, 0.18, 0.18);
          const rafterExt = new THREE.Mesh(rGeoExt, rafterMat);
          rafterExt.position.set(extX, (eh + outerH) / 2, 0);
          rafterExt.rotation.z = Math.atan2(eh - outerH, widthGch);
          frame.add(rafterExt);
        } else {
          // Auvent
          const rGeoExt = new THREE.BoxGeometry(widthGch, 0.18, 0.18);
          const rafterExt = new THREE.Mesh(rGeoExt, rafterMat);
          rafterExt.position.set(extX, eh + 0.1, 0);
          rafterExt.rotation.z = Math.atan2(rh - eh, halfW);
          frame.add(rafterExt);
        }
      }

      // Extension Droite (DRT) Structure
      if (widthDrt > 0 && !isOmbriere) {
        const extX = halfW + widthDrt / 2;
        if (extDrt === 'appentis') {
          const outerH = 3.9;
          const colGeoExt = new THREE.BoxGeometry(0.2, outerH, 0.2);
          const colExt = new THREE.Mesh(colGeoExt, steelMat);
          colExt.position.set(halfW + widthDrt, outerH / 2, 0);
          colExt.castShadow = true;
          frame.add(colExt);

          const rSpan = Math.hypot(widthDrt, eh - outerH);
          const rGeoExt = new THREE.BoxGeometry(rSpan, 0.18, 0.18);
          const rafterExt = new THREE.Mesh(rGeoExt, rafterMat);
          rafterExt.position.set(extX, (eh + outerH) / 2, 0);
          rafterExt.rotation.z = -Math.atan2(eh - outerH, widthDrt);
          frame.add(rafterExt);
        } else {
          // Auvent
          const rGeoExt = new THREE.BoxGeometry(widthDrt, 0.18, 0.18);
          const rafterExt = new THREE.Mesh(rGeoExt, rafterMat);
          rafterExt.position.set(extX, eh + 0.1, 0);
          rafterExt.rotation.z = -Math.atan2(rh - eh, halfW);
          frame.add(rafterExt);
        }
      }

      buildingGroup.add(frame);
    }

    // Purlins
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
      rSheetL.castShadow = true;
      buildingGroup.add(rSheetL);

      const rSheetR = new THREE.Mesh(rSheetGeo, roofMat);
      rSheetR.position.set(halfW / 2, (eh + rh) / 2 + 0.05, 0);
      rSheetR.rotation.z = -Math.atan2(rh - eh, halfW);
      rSheetR.castShadow = true;
      buildingGroup.add(rSheetR);
    } else {
      const span = Math.hypot(w, rh - eh);
      const rSheetGeo = new THREE.BoxGeometry(span + 0.2, 0.05, l + 0.4);
      const rSheet = new THREE.Mesh(rSheetGeo, roofMat);
      rSheet.position.set(0, (eh + rh) / 2 + 0.05, 0);
      rSheet.rotation.z = Math.atan2(rh - eh, w);
      rSheet.castShadow = true;
      buildingGroup.add(rSheet);
    }

    // Roof Extensions (Auvent/Appentis Roof Sheets)
    if (widthGch > 0 && !isOmbriere) {
      const rGeo = new THREE.BoxGeometry(widthGch + 0.2, 0.05, l + 0.4);
      const rMesh = new THREE.Mesh(rGeo, roofMat);
      rMesh.position.set(-halfW - widthGch / 2, eh + 0.1, 0);
      rMesh.rotation.z = extGch === 'appentis' ? Math.atan2(eh - 3.9, widthGch) : Math.atan2(rh - eh, halfW);
      rMesh.castShadow = true;
      buildingGroup.add(rMesh);
    }
    if (widthDrt > 0 && !isOmbriere) {
      const rGeo = new THREE.BoxGeometry(widthDrt + 0.2, 0.05, l + 0.4);
      const rMesh = new THREE.Mesh(rGeo, roofMat);
      rMesh.position.set(halfW + widthDrt / 2, eh + 0.1, 0);
      rMesh.rotation.z = extDrt === 'appentis' ? -Math.atan2(eh - 3.9, widthDrt) : -Math.atan2(rh - eh, halfW);
      rMesh.castShadow = true;
      buildingGroup.add(rMesh);
    }

    // Photovoltaic Solar Panels Grid (Implantation Solaire)
    if (solarEnabled) {
      const solarGroup = new THREE.Group();
      const rows = Math.floor(l / 1.9);
      const cols = Math.floor(halfW / 1.3);
      const panelGeo = new THREE.BoxGeometry(1.2, 0.03, 1.8);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Left roof slope
          const panelL = new THREE.Mesh(panelGeo, solarMat);
          const pxL = -halfW + 0.8 + c * 1.3;
          const pzL = -l / 2 + 1.0 + r * 1.9;
          const pyL = eh + (pxL + halfW) * Math.tan(Math.atan2(rh - eh, halfW)) + 0.1;
          panelL.position.set(pxL, pyL, pzL);
          panelL.rotation.z = Math.atan2(rh - eh, halfW);
          solarGroup.add(panelL);

          // Right roof slope
          const panelR = new THREE.Mesh(panelGeo, solarMat);
          const pxR = 0.8 + c * 1.3;
          const pzR = -l / 2 + 1.0 + r * 1.9;
          const pyR = rh - pxR * Math.tan(Math.atan2(rh - eh, halfW)) + 0.1;
          panelR.position.set(pxR, pyR, pzR);
          panelR.rotation.z = -Math.atan2(rh - eh, halfW);
          solarGroup.add(panelR);
        }
      }

      // Panels on Extensions if active
      if (widthDrt > 0 && extDrt === 'appentis') {
        const extCols = Math.floor(widthDrt / 1.3);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < extCols; c++) {
            const panel = new THREE.Mesh(panelGeo, solarMat);
            const px = halfW + 0.8 + c * 1.3;
            const pz = -l / 2 + 1.0 + r * 1.9;
            const py = eh - (px - halfW) * Math.tan(Math.atan2(eh - 3.9, widthDrt)) + 0.1;
            panel.position.set(px, py, pz);
            panel.rotation.z = -Math.atan2(eh - 3.9, widthDrt);
            solarGroup.add(panel);
          }
        }
      }

      buildingGroup.add(solarGroup);
    }

    // -------------------------------------------------------------------------
    // 3D Dimension Lines & Annotation Labels (Matching Nelson Green Invest)
    // -------------------------------------------------------------------------
    if (showDimensions) {
      const dimGroup = new THREE.Group();

      // Width Annotation Line & Text
      const lineWGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-halfW, 0.05, l / 2 + 2.5),
        new THREE.Vector3(halfW, 0.05, l / 2 + 2.5)
      ]);
      const lineW = new THREE.Line(lineWGeo, lineMat);
      dimGroup.add(lineW);

      const labelW = createTextSprite(`${numericWidth.toFixed(1)} m`, 30);
      labelW.position.set(0, 0.5, l / 2 + 2.5);
      dimGroup.add(labelW);

      // Appentis / Extension Width Annotation if present
      if (widthDrt > 0) {
        const lineExtGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(halfW, 0.05, l / 2 + 2.5),
          new THREE.Vector3(halfW + widthDrt, 0.05, l / 2 + 2.5)
        ]);
        const lineExt = new THREE.Line(lineExtGeo, lineMat);
        dimGroup.add(lineExt);

        const labelExt = createTextSprite(`${widthDrt.toFixed(1)} m`, 30);
        labelExt.position.set(halfW + widthDrt / 2, 0.5, l / 2 + 2.5);
        dimGroup.add(labelExt);
      }

      // Length Annotation Line & Text (Right Side)
      const xLengthLine = halfW + widthDrt + 2.5;
      const lineLGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(xLengthLine, 0.05, -l / 2),
        new THREE.Vector3(xLengthLine, 0.05, l / 2)
      ]);
      const lineL = new THREE.Line(lineLGeo, lineMat);
      dimGroup.add(lineL);

      const labelL = createTextSprite(`${longueur.toFixed(1)} m`, 30);
      labelL.position.set(xLengthLine + 1.2, 0.5, 0);
      dimGroup.add(labelL);

      // Eave Height Annotation Line & Text
      const lineEaveGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-halfW - widthGch - 2.0, 0, -l / 2),
        new THREE.Vector3(-halfW - widthGch - 2.0, eh, -l / 2)
      ]);
      const lineEave = new THREE.Line(lineEaveGeo, lineMat);
      dimGroup.add(lineEave);

      const labelEave = createTextSprite(`${eh.toFixed(1)} m`, 28);
      labelEave.position.set(-halfW - widthGch - 3.2, eh / 2, -l / 2);
      dimGroup.add(labelEave);

      // Ridge Height Annotation Line & Text
      const lineRidgeGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, -l / 2 - 2.0),
        new THREE.Vector3(0, rh, -l / 2 - 2.0)
      ]);
      const lineRidge = new THREE.Line(lineRidgeGeo, lineMat);
      dimGroup.add(lineRidge);

      const labelRidge = createTextSprite(`${rh.toFixed(2)} m`, 28);
      labelRidge.position.set(0, rh / 2, -l / 2 - 3.2);
      dimGroup.add(labelRidge);

      // Surface Text directly on Roof
      const labelSurf = createTextSprite(`${totalSurface} m²`, 36, '#0f172a', 'rgba(255,255,255,0.95)');
      labelSurf.position.set(0, rh + 1.2, 0);
      dimGroup.add(labelSurf);

      buildingGroup.add(dimGroup);
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
  }, [buildingType, numericWidth, longueur, specs, bayLength, nombreTravees, solarEnabled, extGch, extDrt, widthGch, widthDrt, totalWidth, totalSurface, showDimensions]);

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

      {/* MAIN CONFIGURATOR CONTAINER */}
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
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Configurateur 3D
          </h2>

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

          {/* Extensions (GCH & DRT) */}
          {(!buildingType.startsWith('ombriere')) && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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

          {/* Puissance & Nombre de Panneaux (NO pricing mentioned here as requested) */}
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
          
          {/* Top-Left Overlays: Badges & Dimensions Toggle */}
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

            {/* Toggle Dimensions Switch Button */}
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

          {/* BOTTOM RIGHT SUMMARY BOX (SYNTHÈSE DU TARIF CHARPENTE & SOLAIRE) */}
          <div style={{
            position: 'absolute', bottom: '1.25rem', right: '1.25rem', zIndex: 10,
            background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(10px)',
            borderRadius: '14px', border: '1px solid #cbd5e1', padding: '0.9rem 1.25rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: '280px', display: 'flex',
            flexDirection: 'column', gap: '0.4rem'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
              SYNTHÈSE DE LA STRUCTURE
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#334155' }}>
              <span>Dimensions:</span>
              <strong>{longueur.toFixed(2)}m x {totalWidth.toFixed(2)}m</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#334155' }}>
              <span>Surface au sol:</span>
              <strong>{totalSurface} m²</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#0f172a', paddingTop: '0.2rem', borderTop: '1px stroke #f1f5f9' }}>
              <span>Charpente métallique:</span>
              <strong style={{ color: '#2563eb' }}>{charpentePriceHT.toLocaleString('fr-FR')} € HT</strong>
            </div>

            {solarEnabled && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ea580c', paddingTop: '0.2rem' }}>
                <span>Installation solaire:</span>
                <strong>{solarPriceHT.toLocaleString('fr-FR')} € HT</strong>
              </div>
            )}
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
        {/* RIGHT PANEL: ACTIONS (Width 140px)                                  */}
        {/* =================================================================== */}
        <div style={{
          width: '140px', minWidth: '140px', background: '#ffffff',
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
        </div>

      </div>

    </section>
  );
}
