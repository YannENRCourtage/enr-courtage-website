import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, Flame, Wheat, Zap, ArrowRight, CheckCircle2, 
  Leaf, Box, Sprout, TreePine, Battery, Wind, Award,
  ShieldCheck, Check, Layers, Cpu, Compass, Play, RefreshCw,
  Building2, Sparkles, FileText, ChevronRight
} from 'lucide-react';
import BatitechSimulator from '@/components/BatitechSimulator';

const BatitechSection = () => {
  const [activePlanTab, setActivePlanTab] = useState('3.1.15');

  const steps = [
    {
      icon: <Sun className="h-7 w-7" />,
      title: "1. Captation Solaire Thermique",
      description: "Les panneaux hybrides Cogen'Air® en toiture captent le rayonnement. L'air ambiant est aspiré et réchauffé au dos des cellules photovoltaïques (+5°C à +15°C).",
      accent: "#f59e0b",
      badge: "Solaire Hybride"
    },
    {
      icon: <Flame className="h-7 w-7" />,
      title: "2. Aspiration & Collecte d'Air Chaud",
      description: "L'air surchauffé est collecté par les caissons sous embases Fix&Dry® puis acheminé par une gaine étanche calorifugée jusqu'au local ventilateur.",
      accent: "#ea580c",
      badge: "Système Fix&Dry®"
    },
    {
      icon: <Wind className="h-7 w-7" />,
      title: "3. Insufflation & Séchage à Plat",
      description: "Le ventilateur haute pression insuffle l'air chaud sous le plancher carrossable à pontets des cellules, traversant uniformément la matière stockée.",
      accent: "#10b981",
      badge: "Plancher Pontets"
    },
    {
      icon: <Zap className="h-7 w-7" />,
      title: "4. Production & Vente d'Électricité",
      description: "Simultanément, la centrale PV produit une électricité décarbonée revendue en totalité via contrat EDF OA garanti 20 ans (rendement PV dopé de +10%).",
      accent: "#3b82f6",
      badge: "Revenus Garantis"
    }
  ];

  const materials = [
    {
      icon: <Sprout className="h-6 w-6" />,
      title: "Fourrage Vrac",
      description: "Séchage doux préservant la valeur nutritive, les protéines et la matière azotée totale (MAT). Réduction drastique des pertes mécaniques aux champs.",
      badge: "Qualité & Appétence",
      image: "/images/batitech/cellules-fourrage-grange.png"
    },
    {
      icon: <Box className="h-6 w-6" />,
      title: "Bottes Carrées",
      description: "Séchage homogène à cœur des balles haute densité (2,4 × 1,2 × 0,9 m) avec calepinage optimal en cellule et suppression totale des risques d'échauffement.",
      badge: "50 à 81 jours",
      image: "/images/batitech/cellule-bottes-carrees-3d.png"
    },
    {
      icon: <Wheat className="h-6 w-6" />,
      title: "Céréales (Blé & Maïs)",
      description: "Abaissement rapide du taux d'humidité (blé tendre 15j / maïs 37j) pour un stockage sécurisé sans développement de mycotoxines ni insectes.",
      badge: "Sécurisation Récolte",
      image: "/images/batitech/cellules-cereales-beton.png"
    },
    {
      icon: <TreePine className="h-6 w-6" />,
      title: "Plaquettes Forestières",
      description: "Valorisation du bois énergie avec passage rapide de 50% à 25-15% d'humidité. Fonctionnement possible jusqu'à 324 jours par an !",
      badge: "Jusqu'à 324 j/an",
      image: "/images/batitech/plancher-pontets-cereales.png"
    }
  ];

  const models = [
    {
      id: "3.1.15",
      name: "BatiTech 3.1.15",
      tagline: "Le modèle compact polyvalent",
      details: ["3 Travées de 6m (18m de façade)", "1 Cellule 6×15m (90 m² utiles)", "1 Ventilateur centrifuge 18,5 kW"],
      power: "30,15 kWc",
      panels: "90 modules Cogen'Air® (9×10)",
      investment: "327 053 €",
      breakdown: "Barconnière : 217 822 € | BASE : 77 386 € | Solaire PC : 31 845 €",
      archiImg: "/images/batitech/plan-batitech-3115-archi.png",
      pvImg: "/images/batitech/plan-batitech-3115-pv.png"
    },
    {
      id: "6.2.15",
      name: "BatiTech 6.2.15",
      tagline: "Le modèle d'exploitation de référence",
      details: ["6 Travées de 6m (36m de façade)", "2 Cellules 6×15m (180 m² utiles)", "2 Ventilateurs centrifuges 18,5 kW"],
      power: "63,3 kWc",
      panels: "189 modules Cogen'Air® (9×21)",
      investment: "564 986 €",
      breakdown: "Barconnière : 380 751 € | BASE : 137 296 € | Solaire PC : 46 939 €",
      archiImg: "/images/batitech/plan-batitech-6215-archi.png",
      pvImg: "/images/batitech/plan-batitech-6215-pv.png"
    },
    {
      id: "8.3.15",
      name: "BatiTech 8.3.15",
      tagline: "La grande capacité multi-filières",
      details: ["8 Travées de 6m (48m de façade)", "3 Cellules 6×15m (270 m² utiles)", "3 Ventilateurs centrifuges 18,5 kW"],
      power: "93,8 kWc",
      panels: "280 modules Cogen'Air® (10×28)",
      investment: "764 501 €",
      breakdown: "Barconnière : 514 302 € | BASE : 194 220 € | Solaire PC : 55 979 €",
      archiImg: "/images/batitech/plan-batitech-8315-archi.png",
      pvImg: "/images/batitech/plan-batitech-8315-pv.png"
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" }
    })
  };

  const scrollToSimulator = () => {
    const simulator = document.getElementById('batitech-simulator-section');
    if (simulator) simulator.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-900 text-slate-100 overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION & SIMULATEUR */}
      {/* ========================================================================= */}
      <section className="relative pt-24 md:pt-32 pb-20 md:pb-28 overflow-hidden bg-slate-950" aria-labelledby="batitech-title">
        {/* Background photo + Dynamic gradient lights */}
        <div 
          className="absolute inset-0 w-full h-full z-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/batitech/sechoir-hero.jpg')" }}
        />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-900 z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto container-padding">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="text-center mb-10"
          >
            <h1 id="batitech-title" className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Séchoir Multi-Matières <span className="enr-gradient-text-gold">BatiTech®</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
              La solution clé en main associant un séchage agricole & forestier haute performance et la production d'électricité photovoltaïque thermocoolée.
            </p>
          </motion.div>

          {/* SIMULATEUR BATITECH EMBEDDED */}
          <motion.div
            id="batitech-simulator-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <BatitechSimulator />
          </motion.div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 2. LE PRINCIPE BATITECH : SYNERGIE BARCONNIERE & BASE */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Visuals left */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-950 p-3 group">
                <img
                  className="w-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                  alt="Schéma de principe 3D du BatiTech"
                  src="/images/batitech/schema-principe-3d.png"
                  loading="lazy"
                />
                <div className="absolute bottom-6 left-6 right-6 bg-slate-950/85 backdrop-blur-md p-4 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <div className="text-amber-400 text-xs font-bold uppercase tracking-wider">Modélisation 3D</div>
                    <div className="text-white text-sm font-semibold">Structure BatiTech® & Gaine de Collecte</div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/40">
                    Brevets BASE & Barconnière
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 flex items-center space-x-3">
                  <img src="/images/batitech/schema-local-ventilateur.png" alt="Local ventilateur" className="w-16 h-16 object-contain rounded-lg bg-slate-900 p-1" />
                  <div>
                    <div className="text-xs text-slate-400">Local technique</div>
                    <div className="text-sm font-bold text-white">Caisson de refoulement</div>
                  </div>
                </div>
                <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 flex items-center space-x-3">
                  <img src="/images/batitech/ventilateur-bleu-local.png" alt="Ventilateur centrifuge" className="w-16 h-16 object-contain rounded-lg bg-slate-900 p-1" />
                  <div>
                    <div className="text-xs text-slate-400">Ventilation 18,5 kW</div>
                    <div className="text-sm font-bold text-white">Centrifuge haute pression</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Explanation right */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.8, delay: 0.2 }} 
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-400" />
                Alliance de deux leaders français
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Le Principe <span className="enr-gradient-text-gold">BatiTech®</span> : Séchoir Clé en Main
              </h2>

              <p className="text-slate-300 leading-relaxed text-base">
                <strong>BatiTech® Séchage à plat</strong> est né de l'union de deux experts incontournables : 
                <strong className="text-amber-400"> Barconnière</strong>, référence de la charpente métallique agricole depuis 40 ans, et 
                <strong className="text-amber-400"> BASE</strong>, pionnier français du séchage solaire et de la technologie Thermovoltaïque® depuis 17 ans.
              </p>

              <p className="text-slate-300 leading-relaxed text-base">
                Conçu sur la base de la gamme <strong>ECO EVO</strong> développée par Barconnière, le séchoir intègre un caisson de refoulement, un couloir de distribution aéraulique et des cellules à plancher perforé pour valoriser l'air chaud généré par la toiture photovoltaïque.
              </p>

              {/* Callout Specs Box */}
              <div className="bg-gradient-to-br from-slate-950 to-[#0f2847] rounded-2xl p-6 border border-slate-700/80 shadow-xl space-y-3">
                <h3 className="text-base font-bold text-amber-400 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-amber-400" />
                  Atouts constructifs majeurs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                    <span>Charpente Barconnière AS9.2 (pente 15°, sans auvent)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                    <span>Panneaux Cogen'Air® brevetés (335 Wc + 744 Wth)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                    <span>Rendement global &gt; 60% — 100% Fabriqué en France</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                    <span>Plancher perforé à pontets carrossable pour engins lourds</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 3. LE PANNEAU COGEN'AIR & RENDEMENT HYBRIDE */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-slate-950 relative border-t border-slate-800">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Text details left */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.8 }} 
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Sun className="w-4 h-4 text-blue-400" />
                Innovation Solaire Hybride
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Le Panneau <span className="enr-gradient-text-gold">Cogen'Air®</span>
              </h2>

              <p className="text-slate-300 leading-relaxed text-base">
                Créé et breveté par <strong>BASE</strong>, le panneau Cogen'Air® produit simultanément de l'électricité et de la chaleur. En refroidissant en permanence les cellules photovoltaïques grâce à la circulation d'air, <strong>il augmente la production électrique de près de 10%</strong> tout en délivrant des débits d'air chaud à <strong>+5°C à +15°C</strong> par rapport à l'air ambiant.
              </p>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="text-center px-4">
                  <div className="text-2xl md:text-3xl font-extrabold text-blue-400">335 Wc</div>
                  <div className="text-xs text-slate-400 mt-1">Puissance électrique</div>
                </div>
                <div className="text-2xl text-slate-600 font-light">+</div>
                <div className="text-center px-4">
                  <div className="text-2xl md:text-3xl font-extrabold text-amber-400">744 W</div>
                  <div className="text-xs text-slate-400 mt-1">Puissance thermique</div>
                </div>
                <div className="text-2xl text-slate-600 font-light">=</div>
                <div className="text-center px-4 bg-amber-500/10 py-2 rounded-xl border border-amber-500/30">
                  <div className="text-2xl md:text-3xl font-extrabold text-amber-300">1079 W</div>
                  <div className="text-xs text-amber-400 mt-1">&gt; 60% Rendement</div>
                </div>
              </div>

              {/* Certifications Image Strip */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Certifications & Normes Officielles :</div>
                <div className="bg-white rounded-xl p-3 border border-slate-700 shadow-md">
                  <img 
                    src="/images/batitech/cogenair-certifications-bandeau.png" 
                    alt="Certifications Cogen'Air ETV TUV Certisolis CE IEC" 
                    className="w-full object-contain max-h-16"
                  />
                </div>
              </div>
            </motion.div>

            {/* Visuals right */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-white p-4">
                <img
                  className="w-full object-contain max-h-[320px]"
                  alt="Schéma caractéristiques techniques Cogen'Air"
                  src="/images/batitech/cogenair-caracteristiques-schema.png"
                  loading="lazy"
                />
              </div>

              <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-slate-900 p-2 relative group">
                <img 
                  src="/images/batitech/toiture-cogenair-reelle.png" 
                  alt="Toiture Cogen'Air réelle en exploitation" 
                  className="w-full h-44 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-4">
                  <span className="text-xs font-semibold text-slate-200">
                    Toiture agricole réelle équipée en surimposition Fix&Dry® Cogen'Air®
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 4. FONCTIONNEMENT EN 4 ETAPES (BENTO GRID DYNAMIQUE) */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Synergie Énergie & Séchage
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Fonctionnement du Système BatiTech®
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Une technologie brevetée en circuit thermodynamique optimisé pour un rendement maximal toute l'année.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-slate-950/80 rounded-3xl p-7 border border-slate-800 hover:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group relative overflow-hidden"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-lg"
                  style={{ backgroundColor: step.accent + '20', color: step.accent, border: `1px solid ${step.accent}40` }}
                >
                  {step.icon}
                </div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: step.accent }}>
                  {step.badge}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 5. VIDEOS DEMONSTRATION & ANIMATION 3D */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-slate-950 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Play className="w-4 h-4 text-amber-400" />
              Démonstration Vidéo
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Découvrez la Technologie Cogen'Air® en Action
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Visualisez le fonctionnement du panneau thermovoltaïque et la circulation d'air chaud dans le séchoir.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* YouTube Video Embed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-slate-900 rounded-3xl p-4 md:p-6 border border-slate-800 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-amber-400 flex items-center">
                    <Play className="w-4 h-4 mr-2" /> Présentation Officielle Cogen'Air®
                  </span>
                  <span className="text-xs text-slate-500">Vidéo YouTube</span>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video border border-slate-800">
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/INZvWg8qw6c"
                    title="Présentation Panneau Cogen'Air BASE"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                Vidéo explicative du principe Cogen'Air® : captation solaire hybride et augmentation du rendement électrique.
              </p>
            </motion.div>

            {/* BASE 3D Animation Video */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-slate-900 rounded-3xl p-4 md:p-6 border border-slate-800 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-blue-400 flex items-center">
                    <Wind className="w-4 h-4 mr-2" /> Animation 3D Flux d'Air (36 kWc)
                  </span>
                  <span className="text-xs text-slate-500">Animation 3D</span>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video border border-slate-800">
                  <video 
                    controls 
                    className="w-full h-full object-cover"
                    poster="/images/batitech/schema-flux-air-global.png"
                  >
                    <source src="https://www.base-innovation.com/wp-content/uploads/2019/01/Animation-36-kWc_fond-blanc.compressé.mp4" type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture de cette vidéo.
                  </video>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                Circulation d'air chaud canalisé de la toiture vers le caisson de refoulement et le plancher perforé.
              </p>
            </motion.div>

            {/* Wood Chip Dryer Video */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-slate-900 rounded-3xl p-4 md:p-6 border border-slate-800 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-emerald-400 flex items-center">
                    <TreePine className="w-4 h-4 mr-2" /> Séchoir Bois & Plaquettes
                  </span>
                  <span className="text-xs text-slate-500">Vidéo Réelle</span>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video border border-slate-800">
                  <video 
                    controls 
                    className="w-full h-full object-cover"
                  >
                    <source src="https://www.base-innovation.com/wp-content/uploads/2019/04/S%C3%A9choir-bois-compress%C3%A9-190423.mp4" type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture de cette vidéo.
                  </video>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                Démonstration en exploitation réelle du séchage de bois et plaquettes forestières (séchage 324 jours/an).
              </p>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 6. CONCEPTION TECHNIQUE & INNOVATIONS CONSTRUCTIVES */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Layers className="w-4 h-4 text-amber-400" />
              Détails Constructifs & Brevets
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Schémas Techniques & Innovations
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Chaque composant du séchoir BatiTech® est conçu pour garantir étanchéité, robustesse mécanique et performance thermodynamique.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Card 1: Fix&Dry */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-slate-950 rounded-3xl p-6 border border-slate-800 hover:border-amber-500/40 transition-all shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Sun className="w-5 h-5 mr-2 text-amber-400" />
                  Système Fix&Dry® & Embases Spécifiques
                </h3>
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/40">Certifié ATEx</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <img 
                  src="/images/batitech/cogenair-comment-ca-marche.png" 
                  alt="Comment ça marche Fix&Dry" 
                  className="w-full h-36 object-contain rounded-xl bg-white p-1"
                />
                <img 
                  src="/images/batitech/embases-alignees-toiture.png" 
                  alt="Ligne d'embases sur toiture" 
                  className="w-full h-36 object-cover rounded-xl"
                />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Intégration en sur-imposition sur bac acier sans risque de fuite. L'air est aspiré au faîtage et en bas de pente, se réchauffe sous les panneaux hybrides et est collecté dans les caissons sous embases.
              </p>
            </motion.div>

            {/* Card 2: Coupe Charpente Barconnière */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-slate-950 rounded-3xl p-6 border border-slate-800 hover:border-blue-500/40 transition-all shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-blue-400" />
                  Coupe Charpente Barconnière AS9.2
                </h3>
                <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-lg border border-blue-500/40">Pente 15°</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <img 
                  src="/images/batitech/coupe-technique-bb.png" 
                  alt="Coupe technique B-B" 
                  className="w-full h-36 object-contain rounded-xl bg-white p-1"
                />
                <img 
                  src="/images/batitech/coupe-couleur-principe.png" 
                  alt="Coupe couleur de principe" 
                  className="w-full h-36 object-contain rounded-xl bg-white p-1"
                />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Structure métallique profilée ECO EVO intégrant le couloir de distribution, les gaines aérauliques et les murs de séparation béton pour une résistance maximale aux efforts de stockage.
              </p>
            </motion.div>

            {/* Card 3: Planchers Perforés Pontets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-950 rounded-3xl p-6 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-emerald-400" />
                  Planchers Perforés à Pontets Carrossables
                </h3>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/40">Engins Lourds</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <img 
                  src="/images/batitech/flux-air-pontets-3d.png" 
                  alt="Flux d'air pontets 3D" 
                  className="w-full h-28 object-contain rounded-xl bg-white p-1"
                />
                <img 
                  src="/images/batitech/plancher-pontets-fourrage.png" 
                  alt="Pontets fourrage" 
                  className="w-full h-28 object-cover rounded-xl"
                />
                <img 
                  src="/images/batitech/plancher-pontets-cereales.png" 
                  alt="Pontets grains" 
                  className="w-full h-28 object-cover rounded-xl"
                />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Tôles épaisses embouties à pontets offrant une résistance extrême au passage d'engins télescopiques tout en garantissant une répartition d'air ascendante uniforme sans colmatage.
              </p>
            </motion.div>

            {/* Card 4: Local Technique & Ventilation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-slate-950 rounded-3xl p-6 border border-slate-800 hover:border-orange-500/40 transition-all shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Wind className="w-5 h-5 mr-2 text-orange-400" />
                  Local Technique & Ventilation 18,5 kW
                </h3>
                <span className="px-2.5 py-1 bg-orange-500/20 text-orange-300 text-xs font-bold rounded-lg border border-orange-500/40">Centrifuge</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <img 
                  src="/images/batitech/schema-local-ventilateur.png" 
                  alt="Schéma local ventilateur" 
                  className="w-full h-36 object-contain rounded-xl bg-white p-1"
                />
                <img 
                  src="/images/batitech/ventilateur-industriel-seul.png" 
                  alt="Ventilateur industriel" 
                  className="w-full h-36 object-contain rounded-xl bg-white p-1"
                />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Ventilateur centrifuge haute pression de 18,5 kW par cellule, équipé d'un registre de réglage motorisé et d'un caisson insonorisé pour réguler précisément le débit d'air chaud insufflé.
              </p>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 7. POLYVALENCE DE SECHAGE MULTI-MATIERES */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Wheat className="w-4 h-4 text-emerald-400" />
              Séchage Polyvalent Toute l'Année
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Que Pouvez-Vous Sécher avec BatiTech® ?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Une solution unique permettant d'alterner différentes matières au gré des saisons pour rentabiliser l'installation sur 12 mois.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {materials.map((mat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-slate-900 rounded-3xl border border-slate-800 hover:border-amber-500/50 shadow-xl overflow-hidden flex flex-col group transition-all"
              >
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src={mat.image} 
                    alt={mat.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg text-xs font-bold text-amber-400 border border-amber-500/30">
                    {mat.badge}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                      {mat.icon}
                      <h4 className="font-bold text-white text-lg">{mat.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{mat.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Real Built Installation Showcase Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video sm:aspect-[16/10] bg-slate-950">
                <img 
                  src="https://www.base-innovation.com/wp-content/uploads/2020/09/sechage-multi-matieres.jpg" 
                  alt="Bâtiment séchoir multi-matières réalisé"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  Installation Réalisée
                </div>
              </div>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Bâtiment Construit en Exploitation
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                  Une rentabilité démontrée sur le terrain
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  L'association d'une toiture thermovoltaïque Cogen'Air® et d'une charpente métallique Barconnière permet d'obtenir un outil de production durable, finançable par les économies d'aliments et la vente d'électricité.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Autonomie protéique</div>
                    <div className="text-emerald-400 font-bold text-base">+2 à +4 pts MAT</div>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Énergie verte</div>
                    <div className="text-amber-400 font-bold text-base">Revente EDF OA 20 ans</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 8. LES 3 CONFIGURATIONS DE REFERENCE & PLANS ARCHI */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              3 Configurations de Référence
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Dimensions standardisées, calepinage photovoltaïque optimisé et puissance thermique adaptée à chaque taille d'exploitation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {models.map((model, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-slate-950 rounded-3xl border border-slate-800 hover:border-amber-500/50 shadow-2xl overflow-hidden flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="bg-gradient-to-r from-slate-900 to-[#0f2847] p-6 border-b border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-2xl font-extrabold text-white">{model.name}</h3>
                      <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/40">
                        {model.power}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{model.tagline}</p>
                  </div>

                  {/* Plans & Illustrations */}
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-3 bg-white p-2 rounded-2xl border border-slate-800">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold mb-1 text-center">Plan Masse</div>
                        <img 
                          src={model.archiImg} 
                          alt={`Plan architecture ${model.name}`} 
                          className="w-full h-32 object-contain"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold mb-1 text-center">Centrale Cogen'Air®</div>
                        <img 
                          src={model.pvImg} 
                          alt={`Plan PV ${model.name}`} 
                          className="w-full h-32 object-contain"
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      {model.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2.5 text-slate-300">
                        <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>{model.panels}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-900 mt-auto space-y-4">
                  <div className="pt-4 flex justify-between items-baseline">
                    <span className="text-xs text-slate-400 font-medium">Investissement brut clé en main :</span>
                    <span className="text-xl font-extrabold text-amber-400">{model.investment}</span>
                  </div>

                  <button 
                    onClick={scrollToSimulator}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center text-sm"
                  >
                    Simuler ce modèle
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 9. PRIMES CEE : FICHE STANDARDISEE AGRI-EQ-110 */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            
            {/* CEE Content Left */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Dispositif d'Aide de l'État
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                Primes CEE : Éligibilité <span className="enr-gradient-text-gold">Fiche AGRI-EQ-110</span>
              </h2>

              <p className="text-slate-300 leading-relaxed text-base">
                L'installation d'un séchoir multi-matières BatiTech® équipé de panneaux Cogen'Air® est officiellement <strong>éligible aux primes des Certificats d'Économies d'Énergie (CEE)</strong> sous la fiche standardisée <strong>AGRI-EQ-110</strong> (Séchage par énergie solaire thermique ou valorisation de chaleur).
              </p>

              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-lg">
                    ✓
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Critère de Puissance Cumulée Respecté</div>
                    <div className="text-slate-400 text-xs">Exigence CEE : &gt; 500 W/m² — Cogen'Air® atteint <strong>639 W/m² (1079 W / panneau)</strong></div>
                  </div>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed text-sm">
                Les montants de primes sont déduits directement du coût d'investissement et varient selon votre <strong>zone climatique (H1, H2, H3)</strong> et votre secteur (agricole ou forestier) :
              </p>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs text-blue-400 font-bold">Zone H1 (Nord/Est)</div>
                  <div className="text-base font-extrabold text-white mt-1">16 k€ à 120 k€</div>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs text-emerald-400 font-bold">Zone H2 (Centre/Ouest)</div>
                  <div className="text-base font-extrabold text-white mt-1">18 k€ à 136 k€</div>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs text-amber-400 font-bold">Zone H3 (Sud/Médit.)</div>
                  <div className="text-base font-extrabold text-white mt-1">21 k€ à 156 k€</div>
                </div>
              </div>
            </motion.div>

            {/* CEE Visuals Right */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-white p-4">
                <img 
                  src="/images/batitech/cee-eligibilite-schema.png" 
                  alt="Éligibilité CEE AGRI-EQ-110 Cogen'Air" 
                  className="w-full object-contain max-h-[280px]"
                />
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-800 shadow-md">
                <div className="text-xs font-bold text-slate-700 mb-2 text-center">Carte Officielle des Zones Climatiques H1 / H2 / H3</div>
                <img 
                  src="/images/batitech/zones-climatiques-h1h2h3.png" 
                  alt="Carte des zones climatiques" 
                  className="w-full h-52 object-contain"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 10. RECYCLAGE SOREN & ECO-RESPONSABILITE */}
      {/* ========================================================================= */}
      <section className="py-14 bg-slate-900 border-t border-slate-800">
        <div className="max-w-5xl mx-auto container-padding">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-700">
            <img 
              src="/images/batitech/recyclage-soren.png" 
              alt="Recyclage panneaux Cogen'Air SOREN" 
              className="w-full object-contain max-h-48"
            />
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 11. CTA FINAL */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-slate-950 relative border-t border-slate-800">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-slate-900 via-[#0f2847] to-slate-900 rounded-3xl p-10 md:p-14 text-white shadow-2xl border border-slate-700/80 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
              Prêt à concrétiser votre projet <span className="enr-gradient-text-gold">BatiTech®</span> ?
            </h2>
            <p className="text-slate-300 mb-10 text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Nos ingénieurs et spécialistes du séchage agricole dimensionnent votre installation sur-mesure et calculent le montant exact de votre prime CEE AGRI-EQ-110.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                className="w-full sm:w-auto bg-gradient-to-r from-[#d4a843] to-[#f59e0b] hover:from-[#c49a3a] hover:to-[#d97706] text-slate-950 font-extrabold px-10 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all inline-flex items-center justify-center text-lg"
                onClick={() => {
                  const contactForm = document.querySelector('[data-contact-form]') || document.querySelector('#contact-form');
                  if (contactForm) contactForm.scrollIntoView({ behavior: 'smooth' });
                  else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
              >
                Demander une étude gratuite
                <ArrowRight className="ml-3 h-6 w-6" />
              </button>
              <button 
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-4 rounded-xl border border-slate-700 transition-all inline-flex items-center justify-center text-lg"
                onClick={scrollToSimulator}
              >
                <RefreshCw className="mr-2 h-5 w-5 text-amber-400" />
                Lancer une simulation
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BatitechSection;
