import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Sun, Battery, Car, Building, Zap, ShieldCheck, Award, RefreshCw, ArrowRight, Phone, PhoneCall, Send, CheckCircle2 } from 'lucide-react';

const AboutSection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [callbackPhone, setCallbackPhone] = useState('');

  const solutions = [
    {
      id: 'structure_sur_mesure',
      path: '/structure-metallique-sur-mesure',
      icon: <Building2 className="h-7 w-7 text-emerald-400" />,
      title: "Structure métallique sur-mesure",
      description: "Conception et chiffrage 3D immédiat de charpente métallique pour bâtiments agricoles, industriels et commerciaux.",
      badge: "Configurateur 3D"
    },
    {
      id: 'toiture',
      path: '/?tab=toiture',
      icon: <Sun className="h-7 w-7 text-lime-400" />,
      title: "Toiture photovoltaïque",
      description: "Valorisation de toitures existantes et revente totale de l'électricité produite pour générer des revenus annuels.",
      badge: "Revente Électricité"
    },
    {
      id: 'batterie',
      path: '/batterie-soutien-reseau',
      icon: <Battery className="h-7 w-7 text-teal-400" />,
      title: "Batterie de soutien réseau",
      description: "Installation de batteries de forte capacité pour la stabilisation du réseau national avec rente annuelle garantie.",
      badge: "Rente Garantie"
    },
    {
      id: 'irve',
      path: '/?tab=irve',
      icon: <Car className="h-7 w-7 text-amber-400" />,
      title: "Borne de recharge IRVE",
      description: "Déploiement et exploitation d'infrastructures de recharge pour véhicules électriques d'entreprises et collectivités.",
      badge: "Mobilité Électrique"
    },
    {
      id: 'construction',
      path: '/?tab=construction',
      icon: <Building className="h-7 w-7 text-indigo-400" />,
      title: "Bâtiments & Ombrières tiers financés",
      description: "Construction de hangars neufs ou d'ombrières de parking photovoltaïques 100% financés par nos investisseurs.",
      badge: "100% Financé"
    },
    {
      id: 'autoconsommation',
      path: '/?tab=autoconsommation',
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

  const handleSolutionClick = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#070b12] text-white min-h-screen font-sans">
      
      {/* Dark Hero Header with Full-Width Video Background */}
      <div className="relative pt-36 pb-24 overflow-hidden border-b border-white/10" style={{ marginTop: '-80px' }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-35"
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
              À propos d'<span className="enr-gradient-text-gold">ENR COURTAGE</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
              Acteur de référence dans le courtage et le tiers-financement des énergies renouvelables depuis 2008. Nous connectons producteurs, entreprises, collectivités et particuliers pour une énergie propre, locale et rentable.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Section 1: Notre Mission & Notre Expertise */}
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
              Présente sur les métiers de la transition énergétique et du photovoltaïque <strong className="text-amber-400">depuis 2008</strong>, l'équipe d'<strong>ENR COURTAGE</strong> accompagne les <strong className="text-white">professionnels, entreprises, collectivités, exploitants agricoles ainsi que les particuliers</strong> dans la concrétisation de leurs projets énergétiques.
            </p>

            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
              Notre expertise couvre une gamme complète de solutions : la construction sur-mesure de bâtiments à charpente métallique, la valorisation de toitures en revente totale d'électricité, le déploiement de batteries de soutien au réseau national, l'installation de bornes de recharge IRVE, les bâtiments et ombrières de parking 100% tiers financés, ainsi que l'autoconsommation solaire individuelle et collective.
            </p>

            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8">
              En tant que <strong className="text-amber-400">membre de l'association ENERPLAN</strong> (le syndicat des professionnels de l'énergie solaire), nous garantissons l'excellence technique, la rigueur réglementaire et le sérieux irréprochable de toutes nos installations sur l'ensemble du territoire français.
            </p>

            <div className="inline-flex items-center space-x-3 bg-amber-500/10 border border-amber-500/20 px-5 py-3 rounded-2xl text-amber-300 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>Membre adhérent ENERPLAN — Garantie d'expertise & de conformité</span>
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
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto max-h-[380px] object-cover rounded-2xl shadow-xl"
                src="/Birds_perched_on_tree_branch_202608111430.mp4"
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
              Cliquez sur une solution pour découvrir son simulateur et ses fonctionnalités dédiées.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((sol) => (
              <div
                key={sol.id}
                onClick={() => handleSolutionClick(sol.path)}
                className="bg-gradient-to-b from-[#0f172a]/90 via-[#0a101d] to-[#070b14] p-7 rounded-3xl border border-white/10 hover:border-amber-400/60 transition-all duration-300 shadow-xl flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
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

                <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider pt-4 border-t border-white/5 group-hover:translate-x-1 transition-transform">
                  <span>Accéder à la solution</span>
                  <ArrowRight className="w-4 h-4" />
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
          className="mb-24"
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Nos Valeurs Fondamentales
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto">
              Les piliers de notre accompagnement au quotidien auprès de nos clients et partenaires.
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

        {/* Section 4: Nous contacter (Style enr-courtage-energie.fr Image 4) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          id="contact-form"
          className="max-w-4xl mx-auto"
        >
          <div className="bg-[#0a1628] rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
                Nous contacter
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Une question ? Un projet solaire ? Notre équipe vous répond sous 24h.
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Votre nom & prénom
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#070d18] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Votre adresse email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean.dupont@entreprise.fr"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#070d18] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Sujet de votre demande
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Étude de toiture / Autoconsommation / Batterie"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#070d18] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Votre message
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Décrivez votre bâtiment, adresse ou terrain..."
                  className="w-full px-4 py-3.5 rounded-xl bg-[#070d18] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Envoyer le message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Bottom Rappel section matching Image 4 */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#070d18]/60 p-4 sm:p-5 rounded-2xl border border-white/5">
              <div className="flex items-center space-x-3 text-sm text-gray-300 w-full sm:w-auto">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <input
                  type="tel"
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  placeholder="Laissez votre numéro pour être rappelé..."
                  className="bg-transparent border-none text-white text-sm placeholder-gray-500 focus:outline-none w-full"
                />
              </div>
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all flex items-center justify-center space-x-2 flex-shrink-0 shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Rappeler</span>
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AboutSection;