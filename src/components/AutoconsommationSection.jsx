import React from 'react';
import { motion } from 'framer-motion';
import { Sun, BatteryCharging, TrendingDown, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import SolarSimulator from '@/components/SolarSimulator';

const AutoconsommationSection = () => {
  const advantages = [
    { 
      icon: <Sun className="h-7 w-7" />, 
      title: "Production sur site", 
      description: "Installez une centrale solaire photovoltaïque directement sur votre toiture ou au sol et produisez votre propre électricité verte.",
      accent: "#d4a843"
    },
    { 
      icon: <TrendingDown className="h-7 w-7" />, 
      title: "Réduction de facture", 
      description: "Diminuez votre facture d'électricité de 30 à 70% en consommant directement l'énergie que vous produisez.",
      accent: "#0f9b8e"
    },
    { 
      icon: <BatteryCharging className="h-7 w-7" />, 
      title: "Avec ou sans batterie", 
      description: "Optimisez votre taux d'autoconsommation grâce à un système de stockage par batterie pour utiliser votre énergie même la nuit.",
      accent: "#6366f1"
    },
    { 
      icon: <Shield className="h-7 w-7" />, 
      title: "Sécurité énergétique", 
      description: "Protégez-vous contre la hausse des prix de l'électricité et sécurisez votre approvisionnement énergétique sur le long terme.",
      accent: "#2563eb"
    }
  ];

  const features = [
    "Étude de dimensionnement personnalisée",
    "Installation clé en main par nos partenaires certifiés",
    "Formule en abonnement : aucun investissement initial",
    "Monitoring de production en temps réel",
    "Maintenance et garantie incluses",
    "Accompagnement administratif complet"
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" }
    })
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="section-padding bg-white" aria-labelledby="acc-title">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="text-center mb-12"
          >
            <h2 id="acc-title" className="text-4xl md:text-5xl font-bold text-[#0f2847] mb-6 tracking-tight">
              Autoconsommation
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
              Produisez votre propre électricité grâce à une centrale solaire photovoltaïque installée sur votre site. 
              Réduisez votre facture énergétique sans investissement initial grâce à notre formule en abonnement.
            </p>
          </motion.div>

          {/* SIMULATEUR SOLAIRE ETAPE PAR ETAPE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20"
          >
            <SolarSimulator />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <img
                className="w-full h-[450px] object-cover rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
                alt="Installation de panneaux solaires en autoconsommation"
                src="/autoconsommation-home.jpg"
                width="1200" height="600" loading="lazy" decoding="async"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, delay: 0.4 }} 
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-[#0f2847] mb-4">
                  Produisez et consommez votre propre énergie
                </h3>
                <p className="text-gray-500 leading-relaxed text-base">
                  L'autoconsommation solaire vous permet de produire l'électricité dont vous avez besoin directement sur votre site. 
                  Grâce à l'installation d'une centrale photovoltaïque sur votre toiture, parking ou terrain, vous consommez 
                  une énergie propre et locale, tout en maîtrisant vos coûts énergétiques.
                </p>
              </div>
              <div>
                <p className="text-gray-500 leading-relaxed text-base">
                  Avec ou sans batterie de stockage, notre solution s'adapte à votre profil de consommation. 
                  Le surplus d'énergie peut être revendu sur le réseau, générant des revenus complémentaires pour votre activité.
                </p>
              </div>

              {/* Subscription highlight */}
              <div className="bg-gradient-to-br from-[#0f2847] to-[#1a3a5c] rounded-2xl p-6 text-white">
                <h4 className="text-lg font-bold mb-2">Formule Abonnement</h4>
                <p className="text-white/70 text-sm leading-relaxed">
                  Aucun investissement initial. Nous finançons, installons et maintenons votre centrale solaire. 
                  Vous payez un abonnement mensuel fixe, inférieur à votre ancienne facture d'électricité.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Avantages Section */}
      <section className="section-padding gradient-bg-section">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-[#0f2847] mb-4">
              Les avantages de l'autoconsommation
            </h3>
            <p className="text-gray-500 max-w-xl mx-auto">
              Une solution rentable, durable et adaptée à votre activité.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-2xl p-7 h-full shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-400 group border border-gray-100/80">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: advantage.accent + '15', color: advantage.accent }}
                  >
                    {advantage.icon}
                  </div>
                  <h4 className="text-lg font-bold text-[#0f2847] mb-3">{advantage.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{advantage.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features & CTA Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-3xl font-bold text-[#0f2847] mb-8">
                Ce que comprend notre offre
              </h3>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-[#0f9b8e] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-base">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-[#0f2847] to-[#163a5f] rounded-2xl p-10 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Prêt à réduire votre facture d'électricité ?
                </h3>
                <p className="text-white/60 mb-8 text-base leading-relaxed">
                  Contactez-nous pour une étude personnalisée gratuite de votre potentiel d'autoconsommation solaire.
                </p>
                <button 
                  className="btn-secondary inline-flex items-center"
                  onClick={() => {
                    const contactForm = document.querySelector('[data-contact-form]');
                    if (contactForm) contactForm.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Demander une étude gratuite
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AutoconsommationSection;