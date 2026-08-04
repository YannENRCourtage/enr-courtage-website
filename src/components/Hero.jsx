import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Battery, Car, Building, Zap, ArrowRight } from 'lucide-react';

const Hero = ({ setActiveTab }) => {
  const navigate = useNavigate();

  const cards = [
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
      title: "Bâtiments & Ombrières tiers financées",
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
          className="text-center mb-20"
        >
          <p className="text-sm md:text-base uppercase tracking-[0.25em] text-white/60 font-medium mb-4">
            Courtier en énergies renouvelables
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-[1.05] tracking-tight">
            Votre Partenaire en <br />
            <span className="enr-gradient-text-gold">Transition Énergétique</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
            Des solutions innovantes et gratuites pour valoriser votre patrimoine et réduire vos factures.
          </p>
        </motion.div>

        {/* Desktop: Corporate card grid */}
        <div className="hidden lg:grid grid-cols-4 gap-5">
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
        </div>
      </div>
    </div>
  );
};

export default Hero;