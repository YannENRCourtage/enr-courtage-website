import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Zap, ShieldCheck, DollarSign, Building, ArrowRight, CheckCircle2, TrendingUp, Award, Clock } from 'lucide-react';
import ToitureSimulator from '@/components/ToitureSimulator';

const ToiturePhotovoltaiqueSection = () => {
  const advantages = [
    {
      icon: <DollarSign className="h-7 w-7" />,
      title: "Revenus garantis sur 20 ans",
      description: "L'électricité produite est rachetée à un tarif fixe réglementé par l'État via le contrat d'obligation d'achat EDF OA pendant 20 ans.",
      accent: "#84cc16"
    },
    {
      icon: <TrendingUp className="h-7 w-7" />,
      title: "Valorisation de votre patrimoine",
      description: "Transformez une surface inexploitée (toiture de bâtiment, hangar, entrepôt, local commercial) en un actif rentable à haute valeur environnementale.",
      accent: "#0f9b8e"
    },
    {
      icon: <ShieldCheck className="h-7 w-7" />,
      title: "Investissement sécurisé",
      description: "Les revenus de la revente couvrent le financement de l'installation et génèrent une rentabilité nette positive et prévisible.",
      accent: "#2563eb"
    },
    {
      icon: <Award className="h-7 w-7" />,
      title: "Accompagnement de A à Z",
      description: "ENR COURTAGE gère l'intégralité du projet : étude de faisabilité, démarches administratives, raccordement Enedis et suivi de mise en service.",
      accent: "#d4a843"
    }
  ];

  const stepsList = [
    "Étude de faisabilité technique et financière de la toiture",
    "Dimensionnement de la centrale et modélisation du revenu",
    "Gestion des démarches administratives et permis d'aménager / DP",
    "Demande de raccordement auprès du réseau Enedis",
    "Installation et mise en service par nos installateurs certifiés RGE",
    "Signature du contrat de revente EDF OA et perception des premiers revenus"
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
      {/* Hero Section avec vidéo "4.mp4" sous-imposée */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-24 overflow-hidden bg-[#0f2847]" aria-labelledby="toiture-title">
        {/* Vidéo 4.mp4 en arrière-plan avec sous-imposition (overlay) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40 scale-105"
            src="/4.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f2847]/85 via-[#0f2847]/75 to-[#0f2847]/95" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto container-padding">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="text-center mb-12"
          >
            <h1 id="toiture-title" className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Toiture photovoltaïque
            </h1>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto font-light leading-relaxed">
              En tant que propriétaire d'un bâtiment (industriel, agricole, commercial, copropriété ou particulier), 
              investissez dans une centrale solaire photovoltaïque en revente totale pour transformer votre toiture en une source de revenus réguliers et garantis.
            </p>
          </motion.div>

          {/* SIMULATEUR DE RENTABILITÉ TOITURE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ToitureSimulator />
          </motion.div>
        </div>
      </section>

      {/* SECTION EXPLICATIVE REVENTE D'ÉLECTRICITÉ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                className="w-full h-[450px] object-cover rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100"
                alt="Panneaux photovoltaïques sur toiture métallique"
                src="/toiture-revente-3.png"
                width="1200" height="600" loading="lazy" decoding="async"
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
                  Comment fonctionne la revente d'électricité photovoltaïque ?
                </h2>
                <p className="text-gray-600 leading-relaxed text-base">
                  Si vous êtes propriétaire d'un bâtiment ou d'une toiture inutilisée, vous avez l'opportunité d'y installer des panneaux photovoltaïques. 
                  En optant pour la <strong>revente totale d'électricité</strong>, la totalité de l'énergie produite par vos panneaux est injectée sur le réseau public d'électricité Enedis.
                </p>
              </div>

              <p className="text-gray-600 leading-relaxed text-base">
                L'État a mis en place un cadre réglementaire incitatif : l'acheteur obligé (EDF Obligation d'Achat) s'engage à vous racheter chaque kilowattheure (kWh) produit à un tarif garanti et fixe pendant une durée de 20 ans.
              </p>

              {/* Encadré d'avantage financier */}
              <div className="bg-gradient-to-br from-[#0f2847] to-[#1a3a5c] rounded-2xl p-6 text-white shadow-md">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#84cc16]" />
                  Contrat garanti 20 ans par l'État
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Pas de surprise : les tarifs de rachat sont indexés et bloqués par arrêté tarifaire. Votre investissement s'amortit rapidement et dégage des profits nets prévisibles.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Avantages Section - Élargie pour garantir un titre sur une seule ligne */}
      <section className="section-padding bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2847] mb-4">
              Pourquoi valoriser votre toiture avec ENR COURTAGE ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nous vous accompagnons de l'étude de rentabilité initiale jusqu'à la perception de vos revenus solaires.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-2xl px-4 py-6 h-full shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 group border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: advantage.accent + '15', color: advantage.accent }}
                    >
                      {advantage.icon}
                    </div>
                    <h3 className="text-xs sm:text-sm lg:text-[14px] font-extrabold text-[#0f2847] mb-3 whitespace-nowrap tracking-tight leading-snug">
                      {advantage.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{advantage.description}</p>
                  </div>
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
              <h2 className="text-3xl font-bold text-[#0f2847] mb-8">
                Les étapes de votre projet de toiture photovoltaïque
              </h2>
              <ul className="space-y-4">
                {stepsList.map((stepItem, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-[#84cc16] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-base font-medium">{stepItem}</span>
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
              <div className="bg-gradient-to-br from-[#0f2847] to-[#163a5f] rounded-3xl p-10 text-center text-white shadow-xl">
                <h3 className="text-2xl font-bold mb-4">
                  Prêt à valoriser votre toiture ?
                </h3>
                <p className="text-white/70 mb-8 text-base leading-relaxed">
                  Contactez nos experts pour obtenir une étude de faisabilité gratuite et chiffrer précisément les revenus de votre bâtiment.
                </p>
                <button 
                  className="bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center uppercase tracking-wide text-sm"
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

export default ToiturePhotovoltaiqueSection;
