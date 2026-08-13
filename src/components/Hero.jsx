import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Battery, Car, Building, Zap, ArrowRight, Sun, Building2, CheckCircle2 } from 'lucide-react';

const Hero = ({ setActiveTab }) => {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'toiture',
      icon: <Sun className="h-7 w-7" />,
      title: "Toiture photovoltaïque",
      description: "Valorisez votre toiture et générez des revenus annuels en revente d'électricité",
      accent: "#84cc16",
      bgClass: "bg-gradient-to-b from-lime-950/40 via-[#0a101d] to-[#070b14] border-lime-500/30 hover:border-lime-400"
    },
    {
      id: 'batterie',
      icon: <Battery className="h-7 w-7" />,
      title: "Batterie de soutien réseau",
      description: "Renforcez la stabilité du réseau électrique et générez des revenus passifs",
      accent: "#0f9b8e",
      isFeatured: true,
      bgClass: "bg-gradient-to-b from-teal-950/40 via-[#0a101d] to-[#070b14] border-teal-500/30 hover:border-teal-400"
    },
    {
      id: 'irve',
      icon: <Car className="h-7 w-7" />,
      title: "Borne de recharge IRVE",
      description: "Installez des bornes de recharge pour véhicules électriques sur votre site",
      accent: "#d4a843",
      bgClass: "bg-gradient-to-b from-amber-950/40 via-[#0a101d] to-[#070b14] border-amber-500/30 hover:border-amber-400"
    },
    {
      id: 'construction',
      icon: <Building className="h-7 w-7" />,
      title: "Bâtiments & Ombrières tiers financés",
      description: "Obtenez un bâtiment neuf ou une ombrière photovoltaïque 100% financé",
      accent: "#6366f1",
      bgClass: "bg-gradient-to-b from-indigo-950/40 via-[#0a101d] to-[#070b14] border-indigo-500/30 hover:border-indigo-400"
    },
    {
      id: 'autoconsommation',
      icon: <Zap className="h-7 w-7" />,
      title: "Autoconsommation",
      description: "Produisez votre propre énergie et réduisez votre facture d'électricité",
      accent: "#2563eb",
      bgClass: "bg-gradient-to-b from-blue-950/40 via-[#0a101d] to-[#070b14] border-blue-500/30 hover:border-blue-400"
    },
    {
      id: 'structure_sur_mesure',
      icon: <Building2 className="h-7 w-7" />,
      title: "Structure métallique sur-mesure",
      description: "Configurez votre bâtiment charpente métallique étape par étape et obtenez votre tarif immédiat en 3D",
      accent: "#10b981",
      bgClass: "bg-gradient-to-b from-emerald-950/40 via-[#0a101d] to-[#070b14] border-emerald-500/30 hover:border-emerald-400"
    }
  ];

  const handleCardClick = (cardId) => {
    if (cardId === 'batterie') {
      navigate('/batterie-soutien-reseau');
    } else if (cardId === 'structure_sur_mesure') {
      navigate('/structure-metallique-sur-mesure');
      setActiveTab('structure_sur_mesure');
    } else {
      setActiveTab(cardId);
    }
  };

  const scrollToContact = () => {
    const el = document.querySelector('#contact-form') || document.querySelector('[data-contact-form]');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative pt-20 pb-24 flex flex-col items-center justify-center min-h-[90vh] overflow-hidden bg-[#090d16]">
      {/* Background Video 1.mp4 */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60 scale-105"
          src="/1.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090d16]/80 via-[#090d16]/70 to-[#090d16]/95" />
      </div>

      {/* Dark overlay with glowing radial gradient backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none z-[1]" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none z-[1]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Main Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight tracking-tight max-w-5xl mx-auto">
            <span className="block">La transition énergétique</span>
            <span className="enr-gradient-text-gold block">gratuite & 100% financée</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed mb-10 max-w-3xl mx-auto">
            Une offre complète pour valoriser vos toitures et terrains partout en France : bâtiments neufs, batteries réseau, IRVE & autoconsommation.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToContact}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-extrabold rounded-full shadow-2xl text-base transition-all transform hover:scale-105 flex items-center justify-center space-x-3"
            >
              <span>Nous contacter</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#solutions-bento"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full border border-white/20 backdrop-blur-md text-base transition-all text-center"
            >
              Découvrir nos solutions
            </a>
          </div>
        </motion.div>

        {/* Solutions Bento Grid Section */}
        <div id="solutions-bento" className="pt-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Nos Solutions Clé en Main
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Cliquez sur une solution pour accéder à son simulateur dédié
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: "easeOut" }}
              >
                <div
                  className={`p-7 rounded-3xl border ${card.bgClass} transition-all duration-300 shadow-2xl backdrop-blur-md cursor-pointer group h-full flex flex-col justify-between relative overflow-hidden`}
                  onClick={() => handleCardClick(card.id)}
                >
                  {card.isFeatured && (
                    <div className="absolute top-4 right-4 bg-amber-400 text-slate-900 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                      Nouveau
                    </div>
                  )}

                  <div>
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 border"
                      style={{ 
                        backgroundColor: card.accent + '15', 
                        color: card.accent,
                        borderColor: card.accent + '30'
                      }}
                    >
                      {card.icon}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-amber-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                      {card.description}
                    </p>
                  </div>

                  <div 
                    className="flex items-center text-xs font-extrabold uppercase tracking-wider transition-all duration-300 group-hover:translate-x-1 border-t border-white/5 pt-4"
                    style={{ color: card.accent }}
                  >
                    <span>Accéder à la solution</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;