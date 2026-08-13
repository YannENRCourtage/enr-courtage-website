import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Coins, CheckCircle, ArrowRight } from 'lucide-react';

const WhyUsBentoSection = ({ scrollToContact }) => {
  return (
    <section className="py-24 bg-[#070b12] text-white relative overflow-hidden" aria-labelledby="why-us-title">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 id="why-us-title" className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Pourquoi choisir <span className="enr-gradient-text-gold">ENR COURTAGE</span> ?
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-5xl mx-auto leading-relaxed whitespace-normal lg:whitespace-nowrap">
            Une approche innovante et sécurisée pour valoriser votre patrimoine immobilier et foncier sans investissement.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Card 1: 100% Tiers Financé */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-b from-[#0f192c] to-[#0a1220] p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between group hover:border-amber-400/40 transition-all duration-300"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Coins className="w-7 h-7" />
              </div>
              <div className="text-5xl font-black text-white mb-3 tracking-tight">100%</div>
              <h3 className="text-2xl font-bold text-white mb-4">Tiers Financé</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Obtenez un bâtiment neuf, une ombrière photovoltaïque ou une batterie réseau sans débourser 1€. Tous les coûts de construction et de maintenance sont pris en charge.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span>Zero investissement</span>
              <CheckCircle className="w-4 h-4 ml-2 text-amber-400" />
            </div>
          </motion.div>

          {/* Card 2: Suivi Expert & Clé en main */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-b from-[#0f192c] to-[#0a1220] p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between group hover:border-blue-400/40 transition-all duration-300"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="text-5xl font-black text-white mb-3 tracking-tight">30 ans</div>
              <h3 className="text-2xl font-bold text-white mb-4">Accompagnement Sérénité</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                De l'analyse satellite initiale aux démarches administratives, au raccordement Enedis et à la maintenance longue durée : tout est piloté de A à Z.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-blue-400 uppercase tracking-wider">
              <span>Gestion globale & simplifiée</span>
              <CheckCircle className="w-4 h-4 ml-2 text-blue-400" />
            </div>
          </motion.div>

          {/* Card 3: Revenus Garantis & Autoconsommation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-b from-[#0f192c] to-[#0a1220] p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between group hover:border-emerald-400/40 transition-all duration-300"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <div className="text-5xl font-black text-white mb-3 tracking-tight">Immediate</div>
              <h3 className="text-2xl font-bold text-white mb-4">Rente & Économies</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Percevez un loyer foncier annuel garanti pour la mise à disposition de votre terrain ou réduisez durablement votre facture d'électricité jusqu'à 40%.
              </p>
            </div>
            <button
              onClick={scrollToContact}
              className="flex items-center justify-between w-full pt-4 border-t border-white/10 text-xs font-bold text-emerald-400 uppercase tracking-wider hover:text-emerald-300 transition-colors"
            >
              <span>Estimer mes opportunités</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyUsBentoSection;
