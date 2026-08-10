import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Battery, Car, Building, Zap, ArrowRight, Sun, Building2 } from 'lucide-react';

const Hero = ({ setActiveTab }) => {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'toiture',
      icon: <Sun className="h-7 w-7" />,
      title: "Toiture photovoltaïque",
      description: "Valorisez votre toiture et générez des revenus annuels en revente d'électricité",
      accent: "#84cc16"
    },
    {
      id: 'batterie',
      icon: <Battery className="h-7 w-7" />,
      title: "Batterie de soutien réseau",
      description: "Renforcez la stabilité du réseau électrique et générez des revenus passifs",
      accent: "#0f9b8e",
      isFeatured: true
    },
    {
      id: 'irve',
      icon: <Car className="h-7 w-7" />,
      title: "Borne de recharge IRVE",
      description: "Installez des bornes de recharge pour véhicules électriques sur votre site",
      accent: "#d4a843"
    },
    {
      id: 'construction',
      icon: <Building className="h-7 w-7" />,
      title: "Bâtiments & Ombrières tiers financés",
      description: "Obtenez un bâtiment neuf ou une ombrière photovoltaïque 100% financé",
      accent: "#6366f1"
    },
    {
      id: 'autoconsommation',
      icon: <Zap className="h-7 w-7" />,
      title: "Autoconsommation",
      description: "Produisez votre propre énergie et réduisez votre facture d'électricité",
      accent: "#2563eb"
    }
  ];

  const handleCardClick = (cardId) => {
    if (cardId === 'batterie') {
      navigate('/batterie-soutien-reseau');
    } else {
      setActiveTab(cardId);
    }
  };

  return (
    <div className="relative pt-16 pb-28 flex items-center justify-center min-h-[85vh]">
      {/* Dark overlay for better readability over video */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/70 via-[#0f2847]/60 to-[#0a1628]/80 z-[1]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-[1.05] tracking-tight">
            Votre Partenaire en <br />
            <span className="enr-gradient-text-gold">Transition Énergétique</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-4xl mx-auto font-light leading-relaxed">
            Des solutions innovantes et gratuites pour valoriser votre patrimoine et réduire vos factures.
          </p>
        </motion.div>

        {/* Desktop: Corporate card grid */}
        <div className="hidden lg:grid grid-cols-5 gap-4">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 + index * 0.1, ease: "easeOut" }}
            >
              <div
                className="glass-effect rounded-2xl p-7 cursor-pointer group h-full flex flex-col relative overflow-hidden"
                onClick={() => handleCardClick(card.id)}
              >
                {card.isFeatured && (
                  <div className="absolute top-3 right-3 bg-[#d4a843] text-[#0f2847] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Nouveau
                  </div>
                )}
                
                {/* Accent line top */}
                <div 
                  className="absolute top-0 left-0 right-0 h-[3px] opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: card.accent }}
                />
                
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110"
                  style={{ backgroundColor: card.accent + '20', color: card.accent }}
                >
                  {card.icon}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-white/95 transition-colors">
                  {card.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-5 flex-grow group-hover:text-white/65 transition-colors">
                  {card.description}
                </p>
                
                <div className="flex items-center text-sm font-medium transition-all duration-300 group-hover:translate-x-1" style={{ color: card.accent }}>
                  <span>Découvrir</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          ))}

          {/* 6ème Solution: Votre structure métallique sans solaire (largeur 3 cadres, demi-hauteur) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
            className="col-start-2 col-span-3 mt-4"
          >
            <div
              className="glass-effect rounded-2xl p-4 md:p-5 cursor-pointer group relative overflow-hidden border border-emerald-500/40 hover:border-emerald-400 transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:shadow-[0_0_35px_rgba(16,185,129,0.3)] flex items-center justify-between gap-6"
              onClick={() => {
                const el = document.getElementById('configurateur-charpente');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Votre structure métallique sans solaire
                    </h3>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/30">
                      Configurateur 3D
                    </span>
                  </div>
                  <p className="text-white/60 text-xs mt-0.5">
                    Configurez votre bâtiment charpente métallique (Gamme ECO-EVO) étape par étape et obtenez votre tarif immédiat
                  </p>
                </div>
              </div>
              <div className="flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0">
                <span>Lancer le configurateur</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tablet & Mobile: Stacked layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 + index * 0.1 }}
            >
              <div
                className="glass-effect rounded-xl p-5 cursor-pointer group relative overflow-hidden"
                onClick={() => handleCardClick(card.id)}
              >
                {card.isFeatured && (
                  <div className="absolute top-3 right-3 bg-[#d4a843] text-[#0f2847] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Nouveau
                  </div>
                )}
                <div 
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
                  style={{ background: card.accent }}
                />
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: card.accent + '20', color: card.accent }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{card.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{card.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* 6ème Solution mobile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="col-span-1 sm:col-span-2 mt-2"
          >
            <div
              className="glass-effect rounded-xl p-4 cursor-pointer group relative overflow-hidden border border-emerald-500/40"
              onClick={() => {
                const el = document.getElementById('configurateur-charpente');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-400" />
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Votre structure métallique sans solaire</h3>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">3D</span>
                  </div>
                  <p className="text-white/60 text-xs mt-0.5">Configurateur bâtiment charpente métallique Gamme ECO-EVO</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;