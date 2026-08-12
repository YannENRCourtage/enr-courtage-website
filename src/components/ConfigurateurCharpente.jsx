import React, { useState, useEffect, useRef } from 'react';
import BuildingScene from './configurator/BuildingScene.jsx';
import { ControlPanel } from './configurator/ui/ControlPanel.jsx';
import { useConfiguratorValues, useConfiguratorActions } from '@/stores/useConfiguratorStore.js';
import { Download, Maximize, X } from 'lucide-react';
import ecoEvoData from '../data/ecoEvoBuildings.json';

// Solar Pricing Schedule based on PJ 5 table
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

export default function ConfigurateurCharpente({ hideHeader = false }) {
  const config = useConfiguratorValues();
  const actions = useConfiguratorActions();

  const [viewMode, setViewMode] = useState('3D');
  const [isCapturing, setIsCapturing] = useState(false);
  const canvasRef = useRef(null);

  // Calculate building width including active extensions
  const getExtWidth = (side) => {
    if (side === 'appentis') return 9.3;
    if (side === 'auvent') return 4.0;
    return 0;
  };

  const leftExtW = getExtWidth(config.leftSide);
  const rightExtW = getExtWidth(config.rightSide);
  const totalWidth = config.width + leftExtW + rightExtW;
  const totalLength = config.length;
  const totalSurface = Math.round(totalWidth * totalLength);

  // Structure Price Calculation
  const matchedBuilding = ecoEvoData.find(b => Math.abs(b.width - config.width) <= 0.8 && Math.abs(b.length - totalLength) <= 0.8);
  let basePrice = matchedBuilding ? matchedBuilding.price_ht : Math.round(totalSurface * 110);
  if (leftExtW > 0) basePrice += Math.round(totalLength * leftExtW * (config.leftSide === 'auvent' ? 55 : 75));
  if (rightExtW > 0) basePrice += Math.round(totalLength * rightExtW * (config.rightSide === 'auvent' ? 55 : 75));
  const charpentePriceHT = Math.round(basePrice);

  // Solar Pricing
  const solarPowerKwc = config.hasSolar ? (config.solarStats?.power || Math.round((totalSurface / 2.5) * 0.465 * 100) / 100) : 0;
  const solarPriceHT = getSolarPriceHT(solarPowerKwc);
  const totalPriceHT = charpentePriceHT + (config.hasSolar ? solarPriceHT : 0);

  // Download screenshot handler
  const handleScreenshot = async () => {
    if (!canvasRef.current) return;
    setIsCapturing(true);
    await new Promise(r => setTimeout(r, 250));
    const imgData = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `vue_3d_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsCapturing(false);
  };

  // Fullscreen handler (Requests fullscreen on the ENTIRE configurator wrapper)
  const handleFullscreen = () => {
    const elem = document.getElementById('configurateur-main-wrapper');
    if (!document.fullscreenElement) {
      if (elem?.requestFullscreen) {
        elem.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Dispatch resize event when exiting/entering fullscreen to restore canvas aspect ratio
  useEffect(() => {
    const handleFSChange = () => {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  return (
    <section id="configurateur-charpente" className="py-6 bg-white text-slate-900 font-sans relative">
      <div className="max-w-[1440px] mx-auto px-4">
        
        {/* SECTION HEADER */}
        {!hideHeader && (
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Votre structure métallique <span className="enr-gradient-text-gold">sur-mesure</span>
            </h2>
            <p className="text-slate-600 text-base font-normal leading-relaxed">
              Configurez votre bâtiment ou ombrière métallique étape par étape, visualisez la structure en 3D dynamique et obtenez votre chiffrage immédiat.
            </p>
          </div>
        )}

        {/* CONFIGURATOR MAIN WRAPPER (NELSON EXACT LAYOUT) */}
        <div id="configurateur-main-wrapper" className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl relative flex flex-col lg:flex-row h-auto lg:h-[760px] lg:max-h-[calc(100vh-100px)] overflow-visible lg:overflow-hidden isolate">
          
          {/* ========== ZONE 1: CONTROL PANEL (PARAMÉTRAGE) ========== */}
          <div className="relative z-20 w-full lg:w-[380px] h-auto max-h-[480px] sm:max-h-[550px] lg:max-h-none overflow-y-auto lg:h-full bg-white border-b lg:border-b-0 lg:border-r border-slate-200">
            <ControlPanel isAcama={false} />
          </div>

          {/* ========== ZONE 2: 3D VISUALIZER (VISIONNEUSE 3D) ========== */}
          <div id="3d-view-container" className="w-full flex-1 relative h-[380px] sm:h-[500px] lg:h-full bg-white isolate border-b lg:border-b-0 border-slate-200 overflow-hidden">
            
            {/* 3D R3F Canvas */}
            <div className="w-full h-full">
              <BuildingScene
                ref={canvasRef}
                viewMode={viewMode}
                isCapturing={isCapturing}
                transparent={false}
              />
            </div>

            {/* Exit Fullscreen Button */}
            {document.fullscreenElement && (
              <button
                onClick={() => document.exitFullscreen()}
                className="absolute top-4 right-4 z-[200] bg-white/90 p-2 rounded-full shadow-lg border border-slate-200 hover:bg-slate-100"
              >
                <X className="w-6 h-6 text-slate-800" />
              </button>
            )}

            {/* TOP-LEFT OVERLAY BADGES & DIMENSIONS TOGGLE */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex flex-col gap-2 w-fit pointer-events-auto max-w-[calc(100%-140px)] sm:max-w-none">
              {/* Dimensions Badge */}
              <div className="bg-white/95 backdrop-blur px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-md border border-slate-200">
                <span className="text-slate-900 font-bold text-xs sm:text-base whitespace-nowrap">
                  {totalLength.toFixed(2)}m x {totalWidth.toFixed(2)}m - {totalSurface}m²
                </span>
              </div>

              {/* Solar Badge (If Solar Option Active) */}
              {config.hasSolar && (
                <div className="bg-amber-50/95 backdrop-blur px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-md border border-amber-200">
                  <span className="text-amber-800 font-extrabold text-xs sm:text-base whitespace-nowrap">
                    ⚡ {solarPowerKwc.toFixed(2)} kWc
                  </span>
                </div>
              )}

              {/* Toggle Dimensions Blue Pill Button (Nelson Style) */}
              <button
                onClick={actions.toggleDimensions}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md border transition-all flex items-center justify-between gap-2 sm:gap-4 bg-blue-600 text-white border-blue-700 hover:bg-blue-700"
              >
                <span>Afficher les côtes</span>
                <div className="w-8 h-4 sm:w-9 sm:h-5 rounded-full relative bg-white/30 transition-colors">
                  <div className={`absolute top-0.5 sm:top-1 w-3 h-3 rounded-full bg-white transition-all ${config.showDimensions ? 'left-4 sm:left-5' : 'left-1'}`} />
                </div>
              </button>
            </div>

            {/* TOP-RIGHT ACTION BUTTONS */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex flex-col gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200 pointer-events-auto w-32 sm:w-44">
              {/* Screenshot Button */}
              <button
                onClick={handleScreenshot}
                className="w-full bg-white text-slate-700 font-bold py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs"
                title="Télécharger l'image"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Télécharger image</span>
                <span className="sm:hidden">Télécharger</span>
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={handleFullscreen}
                className="w-full bg-white text-slate-700 font-bold py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs"
                title="Plein écran"
              >
                <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Plein écran</span>
                <span className="sm:hidden">Plein écran</span>
              </button>
            </div>

            {/* Mouse Drag Hint */}
            <div className="hidden sm:block absolute bottom-4 left-4 z-10 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 text-[11px] font-medium pointer-events-none">
              💡 Maintenez le clic gauche et glissez pour faire pivoter la structure en 3D
            </div>

          </div>

          {/* ========== ZONE 3: SYNTHÈSE CARD (RECAP) ========== */}
          <div className="static lg:absolute lg:bottom-4 lg:right-4 z-10 lg:z-20 bg-white lg:bg-white/95 lg:backdrop-blur-md p-4 rounded-b-3xl lg:rounded-2xl shadow-none lg:shadow-xl border-t lg:border border-slate-200 w-full lg:w-72 flex flex-col gap-2.5 font-sans pointer-events-auto">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              Synthèse de la structure
            </div>
            
            <div className="flex justify-between items-center text-xs text-slate-700">
              <span className="text-slate-500 font-medium">Dimensions :</span>
              <span className="font-bold text-slate-900">{totalLength.toFixed(2)}m x {totalWidth.toFixed(2)}m</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-700">
              <span className="text-slate-500 font-medium">Surface au sol :</span>
              <span className="font-bold text-blue-600">{totalSurface} m²</span>
            </div>

            <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-100">
              <span className="text-slate-600 font-medium">Charpente métallique :</span>
              <span className="font-extrabold text-blue-600">{charpentePriceHT.toLocaleString('fr-FR')} € HT</span>
            </div>

            {config.hasSolar && (
              <>
                <div className="flex justify-between items-center text-xs text-amber-800 pt-1.5 border-t border-slate-100">
                  <span className="text-slate-600 font-medium">Puissance installée :</span>
                  <span className="font-bold text-amber-600">{solarPowerKwc.toFixed(2)} kWc</span>
                </div>
                <div className="flex justify-between items-center text-xs text-amber-800">
                  <span className="text-slate-600 font-medium">Installation solaire :</span>
                  <span className="font-extrabold text-amber-600">{solarPriceHT.toLocaleString('fr-FR')} € HT</span>
                </div>
              </>
            )}

            {/* TOTAL HT ROW */}
            <div className="flex justify-between items-center text-xs pt-2 border-t-2 border-slate-200 mt-1">
              <span className="text-slate-900 font-extrabold uppercase">Total HT :</span>
              <span className="font-extrabold text-emerald-600 text-sm">{totalPriceHT.toLocaleString('fr-FR')} € HT</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
