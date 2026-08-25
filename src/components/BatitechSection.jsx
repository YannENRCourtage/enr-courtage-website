import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, Flame, Wheat, Zap, ArrowRight, CheckCircle2, 
  Leaf, Box, Sprout, TreePine, Battery, Wind
} from 'lucide-react';
import BatitechSimulator from '@/components/BatitechSimulator';

const BatitechSection = () => {
  const steps = [
    {
      icon: <Sun className="h-7 w-7" />,
      title: "Captation Solaire",
      description: "La centrale Cogen'Air® capte le rayonnement solaire sur la toiture. Les panneaux hybrides produisent de l'électricité et réchauffent l'air ambiant.",
      accent: "#f59e0b" // amber
    },
    {
      icon: <Flame className="h-7 w-7" />,
      title: "Récupération de Chaleur",
      description: "L'air chaud est collecté via les caissons de récupération sous embase puis acheminé vers le local ventilateur par la gaine de collecte.",
      accent: "#f97316" // orange
    },
    {
      icon: <Wheat className="h-7 w-7" />,
      title: "Séchage Multi-Matières",
      description: "L'air chaud est insufflé sous le plancher perforé à pontets des cellules. Il traverse la matière (fourrage, céréales, plaquettes) pour un séchage uniforme.",
      accent: "#10b981" // green
    },
    {
      icon: <Zap className="h-7 w-7" />,
      title: "Production Électrique",
      description: "Simultanément, la centrale photovoltaïque produit de l'électricité revendue via un contrat EDF OA, générant des revenus annuels garantis.",
      accent: "#3b82f6" // blue
    }
  ];

  const materials = [
    {
      icon: <Sprout className="h-6 w-6" />,
      title: "Fourrage Vrac",
      description: "Conservation optimale des valeurs nutritionnelles, réduction des pertes et meilleure appétence pour le bétail."
    },
    {
      icon: <Box className="h-6 w-6" />,
      title: "Bottes Carrées",
      description: "Séchage homogène à cœur des balles, prévention des moisissures et sécurisation du stockage."
    },
    {
      icon: <Wheat className="h-6 w-6" />,
      title: "Céréales",
      description: "Séchage efficace du blé tendre, maïs et autres grains pour atteindre le taux d'humidité idéal de conservation."
    },
    {
      icon: <TreePine className="h-6 w-6" />,
      title: "Plaquettes Forestières",
      description: "Valorisation du bois énergie avec un séchage possible jusqu'à 324 jours par an selon les conditions climatiques."
    }
  ];

  const models = [
    {
      id: "3.1.15",
      name: "BatiTech 3.1.15",
      details: ["3 Travées de 6m (18m)", "1 Cellule 6×15m (90 m²)", "1 Ventilateur 18,5 kW"],
      power: "30,15 kWc",
      panels: "90 modules Cogen'Air® (9×10)",
      investment: "327 053 €",
      breakdown: "Barconnière : 217 822 € | BASE : 77 386 € | Solaire PC : 31 845 €"
    },
    {
      id: "6.2.15",
      name: "BatiTech 6.2.15",
      details: ["6 Travées de 6m (36m)", "2 Cellules 6×15m (180 m²)", "2 Ventilateurs 18,5 kW"],
      power: "63,3 kWc",
      panels: "189 modules Cogen'Air® (9×21)",
      investment: "564 986 €",
      breakdown: "Barconnière : 380 751 € | BASE : 137 296 € | Solaire PC : 46 939 €"
    },
    {
      id: "8.3.15",
      name: "BatiTech 8.3.15",
      details: ["8 Travées de 6m (48m)", "3 Cellules 6×15m (270 m²)", "3 Ventilateurs 18,5 kW"],
      power: "93,8 kWc",
      panels: "280 modules Cogen'Air® (10×28)",
      investment: "764 501 €",
      breakdown: "Barconnière : 514 302 € | BASE : 194 220 € | Solaire PC : 55 979 €"
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
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-24 overflow-hidden bg-slate-950" aria-labelledby="batitech-title">
        <div 
          className="absolute inset-0 w-full h-full z-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/batitech/sechoir-hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-slate-950/60 z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto container-padding">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="text-center mb-12"
          >
            <h1 id="batitech-title" className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Séchoir Multi-Matières <span className="enr-gradient-text-gold">BatiTech®</span>
            </h1>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto font-light leading-relaxed">
              La solution clé en main couplant séchage multi-matières et production d'électricité photovoltaïque
            </p>
          </motion.div>

          {/* SIMULATEUR BATITECH */}
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

      {/* SECTION EXPLICATIVE LE PRINCIPE */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                className="w-full object-cover rounded-3xl shadow-xl border border-gray-100"
                alt="Schéma de fonctionnement BatiTech"
                src="/images/batitech/schema-fonctionnement.png"
                loading="lazy"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }} 
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-[#0f2847] mb-4">
                  Le Principe BatiTech®
                </h2>
                <p className="text-gray-600 leading-relaxed text-base">
                  BatiTech® Séchage à plat est un séchoir clé en main conçu par 2 entreprises spécialistes reconnues : <strong>Barconnière</strong>, spécialiste de la charpente métallique depuis 40 ans, et <strong>BASE</strong>, spécialiste du séchage agricole et de la technologie Thermovoltaïque® depuis 17 ans.
                </p>
              </div>

              <p className="text-gray-600 leading-relaxed text-base">
                BatiTech® s'appuie sur la gamme ECO EVO conçue et développée par Barconnière, adaptée pour le séchage grâce à un travail commun avec BASE.
              </p>

              {/* Callout Box */}
              <div className="bg-gradient-to-br from-[#0f2847] to-[#1a3a5c] rounded-2xl p-6 text-white shadow-md">
                <h3 className="text-lg font-bold text-white mb-4">Caractéristiques principales</h3>
                <ul className="space-y-3">
                  {[
                    "Charpente Barconnière AS9.2 (pente 15°, sans auvent)",
                    "Panneaux Cogen'Air® brevetés par BASE (335 Wc + 744 W thermique)",
                    "Rendement > 60% - Fabrication française",
                    "Plancher perforé à pontets carrossable",
                    "Principe évolutif EVO"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#d4a843] flex-shrink-0 mt-0.5" />
                      <span className="text-white/90 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION PANNEAU COGEN'AIR */}
      <section className="py-16 md:py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.8 }} 
              className="space-y-6 order-2 lg:order-1"
            >
              <div>
                <h2 className="text-3xl font-bold text-[#0f2847] mb-4">
                  Le Panneau Cogen'Air® — Panneau Solaire Hybride
                </h2>
                <p className="text-gray-600 leading-relaxed text-base mb-4">
                  Créé et breveté par la société BASE, le panneau Cogen'Air® produit simultanément de l'électricité et de la chaleur. En refroidissant les cellules photovoltaïques, il améliore le rendement électrique de près de 10%.
                </p>
                <p className="text-gray-600 leading-relaxed text-base">
                  Grâce aux échangeurs thermiques intégrés au dos du panneau, il est possible de produire de gros volumes d'air chaud de +5°C à +15°C par rapport à la température ambiante.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Certifications & Normes</h3>
                <div className="flex flex-wrap gap-2">
                  {["ETV", "TÜV Rheinland", "Certisolis", "CE", "IEC 61215", "IEC 61730"].map((cert, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <img
                className="w-full object-contain max-h-[400px]"
                alt="Panneau hybride Cogen'Air"
                src="/images/batitech/panneau-cogenair.png"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION (BENTO GRID) */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2847] mb-4">
              Fonctionnement du système
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une synergie parfaite entre production d'énergie et séchage haute performance.
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
              >
                <div className="bg-white rounded-2xl p-7 h-full shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 flex flex-col">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 hover:scale-110"
                    style={{ backgroundColor: step.accent + '15', color: step.accent }}
                  >
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#0f2847] mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section className="py-16 md:py-24 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto container-padding text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8">Découvrez la technologie Cogen'Air® en vidéo</h2>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video border border-slate-800">
              <video 
                controls 
                className="w-full h-full object-cover"
                poster="/images/batitech/schema-fonctionnement.png"
              >
                <source src="https://www.base-innovation.com/wp-content/uploads/2019/01/Animation-36-kWc_fond-blanc.compressé.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de cette vidéo.
              </video>
            </div>
            <p className="mt-6 text-slate-400 text-sm">
              Animation illustrant le principe de circulation d'air et de récupération de chaleur de la toiture vers la zone de séchage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SCHEMAS TECHNIQUES ET CONCEPTION */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2847] mb-4">
              Schémas Techniques & Innovations Constructives
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une conception rigoureuse associant la robustesse de la charpente Barconnière et la performance thermovoltaïque BASE.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <img 
                src="/images/batitech/schema-cogenair.png" 
                alt="Intégration Fix&Dry et récupération de chaleur" 
                className="w-full h-64 object-contain rounded-xl mb-4 bg-white p-2"
              />
              <h3 className="text-xl font-bold text-[#0f2847] mb-2">Principe Fix&Dry® & Récupération d'Air Chaud</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                L'air est aspiré au faîtage et en bas de pente, se réchauffe au contact des échangeurs Cogen'Air® sous la toiture bac acier, puis est collecté dans les caissons sous embases vers le ventilateur.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <img 
                src="/images/batitech/coupe-charpente.png" 
                alt="Coupe charpente BatiTech" 
                className="w-full h-64 object-contain rounded-xl mb-4 bg-white p-2"
              />
              <h3 className="text-xl font-bold text-[#0f2847] mb-2">Coupe Charpente Barconnière & Cellule</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Structure métallique profilée ECO EVO (pente 15°) intégrant le caisson de refoulement, les gaines de distribution d'air chaud et les cloisons béton renforcées pour le stockage.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <img 
                src="/images/batitech/cellules-multi-matieres.png" 
                alt="Planchers perforés à pontets carrossables" 
                className="w-full h-64 object-contain rounded-xl mb-4 bg-white p-2"
              />
              <h3 className="text-xl font-bold text-[#0f2847] mb-2">Planchers Perforés à Pontets Carrossables</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Tôles à pontets embouties assurant une résistance mécanique élevée (passage d'engins télescopiques) et une diffusion d'air optimale pour fourrage, grains et plaquettes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <img 
                src="/images/batitech/embases-fixdry.png" 
                alt="Embases et système Fix&Dry" 
                className="w-full h-64 object-contain rounded-xl mb-4 bg-white p-2"
              />
              <h3 className="text-xl font-bold text-[#0f2847] mb-2">Système Fix&Dry® & Embases Spécifiques</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Installation certifiée sous ATEx garantissant l'étanchéité absolue de la couverture et une aspiration canalisée sans déperdition thermique vers le local technique.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MATERIALS SECTION */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2847] mb-4">
              Que pouvez-vous sécher ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une solution polyvalente adaptée à de nombreux types de matières agricoles et forestières.
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
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  {mat.icon}
                </div>
                <h4 className="font-bold text-[#0f2847] mb-2">{mat.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{mat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MODELS COMPARISON SECTION */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2847] mb-4">
              3 Configurations de Référence
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choisissez le modèle BatiTech® adapté à vos volumes de séchage et à votre potentiel photovoltaïque.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {models.map((model, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col"
              >
                <div className="bg-gradient-to-r from-[#0f2847] to-[#1a3a5c] p-6 text-white text-center">
                  <h3 className="text-2xl font-bold">{model.name}</h3>
                </div>
                <div className="p-8 flex-grow flex flex-col gap-6">
                  <div className="space-y-3">
                    {model.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-gray-600 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-[#d4a843]" />
                        {detail}
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100 mt-auto space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Puissance</span>
                      <span className="font-bold text-[#0f2847] text-base">{model.power}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Panneaux</span>
                      <span className="font-semibold text-gray-700 text-sm">{model.panels}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
                      <span className="text-gray-500 text-sm font-medium">Investissement brut</span>
                      <span className="font-extrabold text-[#d4a843] text-lg">{model.investment}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 leading-tight">
                      {model.breakdown}
                    </div>
                  </div>

                  <button 
                    onClick={scrollToSimulator}
                    className="w-full mt-2 btn-outline py-2.5 border-[#0f2847] text-[#0f2847] hover:bg-[#0f2847] hover:text-white transition-colors rounded-xl font-semibold text-sm"
                  >
                    Simuler ce modèle
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CEE PREMIUM SECTION */}
      <section className="py-16 md:py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-[#0f2847] mb-6">
                Primes CEE : Votre investissement soutenu
              </h2>
              <p className="text-gray-600 leading-relaxed text-base mb-6">
                L'installation d'un système de séchage BatiTech® équipé de panneaux Cogen'Air® est <strong>éligible aux primes CEE (Certificats d'Économies d'Énergie)</strong>. 
                Grâce à une puissance thermique cumulée supérieure à 500 W/m², la technologie Cogen'Air® répond aux critères stricts pour le financement de votre outil de séchage.
              </p>
              <p className="text-gray-600 leading-relaxed text-base mb-6">
                Les montants de prime varient selon votre zone climatique (H1, H2, H3), le volume séché et le type d'activité. Ces aides permettent d'amortir considérablement le coût initial de l'installation.
              </p>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm inline-block">
                <p className="text-sm font-semibold text-[#0f2847]">
                  Notre équipe vous accompagne pour le montage et l'obtention de votre dossier CEE.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <img 
                src="/images/batitech/zones-climatiques.png" 
                alt="Carte des zones climatiques H1 H2 H3" 
                className="rounded-2xl shadow-md border border-gray-200 mx-auto max-w-full h-auto"
                style={{ maxHeight: '350px' }}
              />
              <p className="text-xs text-gray-400 mt-4">Carte indicative des zones climatiques pour le calcul des primes CEE.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-[#0f2847] to-[#163a5f] rounded-3xl p-10 md:p-14 text-white shadow-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à lancer votre projet BatiTech® ?
            </h2>
            <p className="text-white/80 mb-10 text-lg max-w-2xl mx-auto">
              Contactez nos experts pour une étude de faisabilité personnalisée. Nous dimensionnons la solution adaptée à vos besoins de séchage et chiffrons sa rentabilité.
            </p>
            <button 
              className="bg-[#d4a843] hover:bg-[#c49a3a] text-[#0f2847] font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center text-lg"
              onClick={() => {
                const contactForm = document.querySelector('[data-contact-form]');
                if (contactForm) contactForm.scrollIntoView({ behavior: 'smooth' });
                else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
            >
              Demander une étude gratuite
              <ArrowRight className="ml-3 h-6 w-6" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BatitechSection;
