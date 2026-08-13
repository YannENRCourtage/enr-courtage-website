import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Sun, Battery, Car, Building, Zap, ShieldCheck, Award, Users, RefreshCw, ArrowRight } from 'lucide-react';

const AboutSection = () => {
  const solutions = [
    {
      icon: <Building2 className="h-7 w-7 text-emerald-400" />,
      title: "Structure métallique sur-mesure",
      description: "Conception et chiffrage 3D immédiat de charpente métallique pour bâtiments agricoles, industriels et commerciaux.",
      badge: "Configurateur 3D"
    },
    {
      icon: <Sun className="h-7 w-7 text-lime-400" />,
      title: "Toiture photovoltaïque",
      description: "Valorisation de toitures existantes et revente totale de l'électricité produite pour générer des revenus annuels.",
      badge: "Revente Électricité"
    },
    {
      icon: <Battery className="h-7 w-7 text-teal-400" />,
      title: "Batterie de soutien réseau",
      description: "Installation de batteries de forte capacité pour la stabilisation du réseau national avec rente annuelle garantie.",
      badge: "Rente Garantie"
    },
    {
      icon: <Car className="h-7 w-7 text-amber-400" />,
      title: "Borne de recharge IRVE",
      description: "Déploiement et exploitation d'infrastructures de recharge pour véhicules électriques d'entreprises et collectivités.",
      badge: "Mobilité Électrique"
    },
    {
      icon: <Building className="h-7 w-7 text-indigo-400" />,
      title: "Bâtiments & Ombrières tiers financés",
      description: "Construction de hangars neufs ou d'ombrières de parking photovoltaïques 100% financés par nos investisseurs.",
      badge: "100% Financé"
    },
    {
      icon: <Zap className="h-7 w-7 text-blue-400" />,
      title: "Autoconsommation (Individuelle & Collective)",
      description: "Production et partage local d'énergie solaire sans apport financier pour réduire immédiatement les factures d'électricité.",
      badge: "Économies Immédiates"
    }
  ];

  const values = [
    {
      icon: <Sun className="h-8 w-8 text-amber-400" />,
      title: "Innovation Solaire",
      description: "Nous développons des solutions solaires de pointe adaptées à chaque profil immobilier et foncier."
    },
    {
      icon: <RefreshCw className="h-8 w-8 text-blue-400" />,
      title: "Circuit Court Local",
      description: "Nous connectons producteurs et consommateurs pour une énergie partagée, décarbonée et accessible."
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-emerald-400" />,
      title: "Engagement Durable",
      description: "Nous nous engageons pour une transition énergétique sereine, sans aucun apport financier pour nos clients."
    },
    {
      icon: <Award className="h-8 w-8 text-purple-400" />,
      title: "Excellence & Rigueur",
      description: "Nous garantissons un suivi sur-mesure, des études satellites de précision et une transparence totale."
    }
  ];

  return (
    <div className="bg-[#070b12] text-white min-h-screen">
      
      {/* Dark Hero Header with Full-Width Video Background */}
      <div className="relative pt-36 pb-24 overflow-hidden border-b border-white/10" style={{ marginTop: '-80px' }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
          src="/3.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b12]/90 via-[#070b12]/80 to-[#070b12] z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 mb-6 backdrop-blur-md">
              <span>Présent depuis 2008</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
              À propos d'<span className="enr-gradient-text-gold">ENR COURTAGE</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
              Acteur de référence dans le courtage et le tiers-financement des énergies renouvelables <strong className="text-white font-semibold">depuis 2008</strong>. Nous connectons producteurs, entreprises et collectivités pour une énergie propre, locale et rentable.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Section 1: Notre Mission & Notre Histoire */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 tracking-tight">
              Notre Mission & Notre Expertise
            </h2>
            
            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
              Présente sur les métiers de la transition énergétique et du photovoltaïque <strong className="text-amber-400">depuis 2008</strong>, l'équipe d'<strong>ENR COURTAGE</strong> a pour mission de démocratiser l'accès à l'énergie solaire et aux infrastructures décarbonées.
            </p>

            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
              Nous croyons que chaque entreprise, collectivité ou exploitant agricole doit pouvoir valoriser son foncier ou son patrimoine immobilier grâce au tiers-financement — sans aucun investissement ni risque financier.
            </p>

            <div className="bg-[#0a1628] border border-white/10 p-6 rounded-2xl">
              <div className="flex items-start space-x-4">
                <Users className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Siège basé à Mérignac (33)</h4>
                  <p className="text-gray-400 text-sm">
                    Nos équipes pilotent l'intégralité des projets sur toute la France : étude satellite, démarches administratives, raccordement Enedis, installation et maintenance.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-gradient-to-b from-[#0f192c] to-[#0a1220] p-3 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <img
                src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/14b930456a4b12be72389c1cf880c3e3.jpg"
                alt="Installation toiture photovoltaïque ENR COURTAGE"
                className="w-full h-auto object-cover rounded-2xl"
                loading="lazy"
                decoding="async"
              />
              <div className="p-4 text-center">
                <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Plus de 700 projets solaires & bâtiments accompagnés en France
                </p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Section 2: Nos 6 Solutions & Métiers */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Nos 6 Métiers & Solutions Globales
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto">
              Une palette d'expertises éprouvées depuis 2008 pour répondre à chaque besoin énergétique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((sol, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-b from-[#0f172a]/90 via-[#0a101d] to-[#070b14] p-7 rounded-3xl border border-white/10 hover:border-amber-400/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {sol.icon}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/5 border border-white/10 px-3 py-1 rounded-full text-amber-300">
                      {sol.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">
                    {sol.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {sol.description}
                  </p>
                </div>

                <div className="flex items-center text-xs font-bold text-amber-400 uppercase tracking-wider pt-4 border-t border-white/5">
                  <span>Savoir-faire garanti</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section 3: Nos Valeurs Fondamentales */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Nos Valeurs Fondamentales
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto">
              Les piliers de notre accompagnement au quotidien auprès de nos partenaires.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, index) => (
              <div
                key={index}
                className="bg-[#0a1628] p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between hover:border-blue-400/40 transition-all duration-300"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    {val.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{val.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{val.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AboutSection;