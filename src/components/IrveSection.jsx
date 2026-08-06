import React from 'react';
import { motion } from 'framer-motion';
import { Car, Zap, ShieldCheck, BatteryCharging, ArrowRight, CheckCircle2 } from 'lucide-react';
import IrveSimulator from '@/components/IrveSimulator';

const IrveSection = () => {
  const advantages = [
    { 
      icon: <Car className="h-7 w-7" />, 
      title: "Tous types de puissances", 
      description: "Installation de bornes allant de 7.4kW à 22kW pour s'adapter à la vitesse de charge nécessaire pour votre flotte ou vos clients.",
      accent: "#d4a843"
    },
    { 
      icon: <Zap className="h-7 w-7" />, 
      title: "Conseil sur mesure", 
      description: "Nous vous orientons vers le meilleur investissement possible en analysant précisément vos besoins d'utilisation et de fréquentation.",
      accent: "#0f9b8e"
    },
    { 
      icon: <BatteryCharging className="h-7 w-7" />, 
      title: "Formule Abonnement", 
      description: "Financez vos bornes de recharge par abonnement, sans investissement initial lourd, en préservant votre trésorerie.",
      accent: "#6366f1"
    },
    { 
      icon: <ShieldCheck className="h-7 w-7" />, 
      title: "Matériel certifié", 
      description: "Des infrastructures robustes, sécurisées et conformes aux dernières réglementations (qualification IRVE obligatoire).",
      accent: "#2563eb"
    }
  ];

  const features = [
    "Audit électrique du site et conseil personnalisé",
    "Fourniture et installation de bornes de 7.4kW à 22kW",
    "Solutions de financement par abonnement",
    "Supervision et gestion des recharges",
    "Maintenance préventive et curative",
    "Accompagnement pour l'obtention des aides (Advenir)"
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
      <section className="pt-20 md:pt-28 pb-10 md:pb-14 bg-white" aria-labelledby="irve-title">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="text-center mb-20"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[#d4a843] font-semibold mb-4">Notre solution</p>
            <h2 id="irve-title" className="text-4xl md:text-5xl font-bold text-[#0f2847] mb-6 tracking-tight">
              Bornes de recharge IRVE
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
              Déployez des infrastructures de recharge pour véhicules électriques (IRVE) adaptées à vos besoins, 
              avec ou sans investissement initial grâce à nos offres d'abonnement.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <img
                className="w-full h-[450px] object-cover rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
                alt="Installation de bornes de recharge IRVE"
                src="/irve-home.png"
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
                  De 7.4kW à 22kW : la solution idéale pour votre site
                </h3>
                <p className="text-gray-500 leading-relaxed text-base">
                  Que vous souhaitiez équiper le parking de votre entreprise, un commerce, ou une copropriété, 
                  nous vous conseillons sur le meilleur investissement possible. Nous analysons l'utilisation prévue 
                  (charge lente quotidienne ou charge plus rapide) pour dimensionner parfaitement votre installation.
                </p>
              </div>
              <div>
                <p className="text-gray-500 leading-relaxed text-base">
                  Nous gérons l'intégralité de votre projet : de l'étude de faisabilité électrique à l'installation 
                  par nos techniciens qualifiés, en passant par la maintenance et l'assistance utilisateur.
                </p>
              </div>

              {/* Subscription highlight */}
              <div className="bg-gradient-to-br from-[#0f2847] to-[#1a3a5c] rounded-2xl p-6 text-white">
                <h4 className="text-lg font-bold mb-2">Optez pour l'Abonnement</h4>
                <p className="text-white/70 text-sm leading-relaxed">
                  Préservez votre trésorerie. Nos solutions de financement par abonnement couvrent le matériel, 
                  l'installation et la maintenance. Simplifiez votre transition vers la mobilité électrique.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Simulateur IRVE */}
      <section className="pb-20 pt-4 bg-white" aria-labelledby="irve-simulator">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <IrveSimulator />
          </motion.div>
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
              Pourquoi choisir notre accompagnement ?
            </h3>
            <p className="text-gray-500 max-w-xl mx-auto">
              Une expertise pointue pour des bornes de recharge durables et performantes.
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
                Ce que comprend notre offre IRVE
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
                    <CheckCircle2 className="h-5 w-5 text-[#d4a843] flex-shrink-0 mt-0.5" />
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
                  Prêt à équiper votre parking ?
                </h3>
                <p className="text-white/60 mb-8 text-base leading-relaxed">
                  Contactez-nous pour étudier l'installation de bornes de recharge et découvrir nos formules d'abonnement.
                </p>
                <button 
                  className="btn-secondary inline-flex items-center"
                  onClick={() => {
                    const contactForm = document.querySelector('[data-contact-form]');
                    if (contactForm) contactForm.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Demander un devis gratuit
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

export default IrveSection;
