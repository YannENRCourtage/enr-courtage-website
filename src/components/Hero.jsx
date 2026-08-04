import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Zap, Battery, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Hero = ({ setActiveTab }) => {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'batterie',
      icon: <Battery className="h-10 w-10 text-white" />,
      title: "Batterie de soutien réseau",
      description: "Renforcez la stabilité du réseau électrique et générez des revenus",
      bgColor: "bg-teal-600",
      hoverColor: "hover:bg-teal-700",
      isFeatured: true
    },
    {
      id: 'irve',
      icon: <Car className="h-10 w-10 text-white" />,
      title: "Borne de recharge IRVE",
      description: "Installez des bornes de recharge pour véhicules électriques",
      bgColor: "bg-orange-500",
      hoverColor: "hover:bg-orange-600"
    },
    {
      id: 'construction',
      icon: <Building className="h-10 w-10 text-white" />,
      title: "Bâtiments & Ombrières tiers financées",
      description: "Obtenez un bâtiment neuf ou une ombrière 100% gratuit",
      bgColor: "bg-violet-600",
      hoverColor: "hover:bg-violet-700"
    },
    {
      id: 'autoconsommation',
      icon: <Zap className="h-10 w-10 text-white" />,
      title: "Autoconsommation",
      description: "Partagez et économisez sur votre facture d'électricité",
      bgColor: "bg-blue-600",
      hoverColor: "hover:bg-blue-700"
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
    <div className="relative pt-20 pb-32 flex items-center justify-center min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg leading-tight">
            Votre Partenaire en <br />
            <span className="text-yellow-400">Transition Énergétique</span>
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto drop-shadow-md font-medium">
            Des solutions innovantes et gratuites pour valoriser votre patrimoine et réduire vos factures.
          </p>
        </motion.div>

        {/* Desktop: Horizontal layout */}
        <div className="hidden lg:grid grid-cols-4 gap-4 xl:gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="flex-shrink-0 h-full"
            >
              <Card 
                className={`${card.bgColor} ${card.hoverColor} ${card.isFeatured ? 'border-4 border-yellow-400 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)]' : 'border-none shadow-xl'} cursor-pointer transform hover:-translate-y-2 hover:scale-105 hover:shadow-2xl transition-all duration-300 group h-full relative overflow-hidden`}
                onClick={() => handleCardClick(card.id)}
              >
                {card.isFeatured && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-teal-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                    NOUVEAU
                  </div>
                )}
                <CardContent className="p-8 flex flex-col items-center text-center h-full justify-center">
                  <div className={`mb-6 p-4 bg-white/20 rounded-full group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 ${card.isFeatured ? 'group-hover:rotate-12' : ''}`}>
                    {card.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{card.title}</h3>
                  <p className="text-white/90 text-lg leading-relaxed">{card.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tablet & Mobile: Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={card.isFeatured ? "md:col-span-2" : ""}
            >
              <Card 
                className={`${card.bgColor} ${card.hoverColor} ${card.isFeatured ? 'border-4 border-yellow-400' : 'border-none'} shadow-xl cursor-pointer transform hover:-translate-y-2 hover:scale-105 hover:shadow-2xl transition-all duration-300 h-full group relative overflow-hidden`}
                onClick={() => handleCardClick(card.id)}
              >
                {card.isFeatured && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-teal-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                    NOUVEAU
                  </div>
                )}
                <CardContent className={`${card.isFeatured ? 'p-10' : 'p-8'} flex flex-col items-center text-center h-full`}>
                  <div className={`mb-6 p-4 bg-white/20 rounded-full group-hover:scale-110 group-hover:bg-white/30 ${card.isFeatured ? 'group-hover:rotate-12' : ''} transition-all duration-300`}>
                    {card.icon}
                  </div>
                  <h3 className={`${card.isFeatured ? 'text-3xl' : 'text-2xl'} font-bold text-white mb-4`}>{card.title}</h3>
                  <p className={`text-white/90 ${card.isFeatured ? 'text-xl' : 'text-lg'} leading-relaxed`}>{card.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;