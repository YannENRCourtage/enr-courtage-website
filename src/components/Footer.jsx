import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail } from 'lucide-react';

const Footer = ({ setActiveTab }) => {
  const handleNavClick = (tabId) => setActiveTab(tabId);

  return (
    <footer className="bg-[#0a1628] text-white pt-16 pb-8" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="md:col-span-2 lg:col-span-1">
            <img
              src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/44f5c742023f9f03ac2d52340eb3ddfb.png"
              alt="Logo ENR COURTAGE"
              width="160" height="48"
              className="h-12 w-auto mb-5"
              loading="lazy" decoding="async"
            />
            <p className="text-gray-400 mb-5 text-sm leading-relaxed">Votre courtier de confiance pour tous vos projets d'énergies renouvelables.</p>
            <address className="not-italic space-y-3">
              <div className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-[#d4a843]" />
                <span className="text-sm">7 rue Gutenberg, 33700 Mérignac</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0 text-[#d4a843]" />
                <a href="mailto:contact@enr-courtage.fr" className="text-sm hover:text-[#d4a843] transition-colors">contact@enr-courtage.fr</a>
              </div>
            </address>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <span className="text-sm font-semibold mb-5 block uppercase tracking-wider text-white/80">Nos Solutions</span>
            <ul className="space-y-3 text-gray-400">
              <li><button onClick={() => handleNavClick('toiture')} className="text-sm hover:text-[#d4a843] transition-colors text-left">Toiture photovoltaïque</button></li>
              <li><button onClick={() => handleNavClick('batterie')} className="text-sm hover:text-[#d4a843] transition-colors text-left">Batterie de soutien réseau</button></li>
              <li><button onClick={() => handleNavClick('irve')} className="text-sm hover:text-[#d4a843] transition-colors text-left">Borne de recharge IRVE</button></li>
              <li><button onClick={() => handleNavClick('construction')} className="text-sm hover:text-[#d4a843] transition-colors text-left">Bâtiments & Ombrières</button></li>
              <li><button onClick={() => handleNavClick('autoconsommation')} className="text-sm hover:text-[#d4a843] transition-colors text-left">Autoconsommation</button></li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <span className="text-sm font-semibold mb-5 block uppercase tracking-wider text-white/80">Liens Utiles</span>
            <ul className="space-y-3 text-gray-400">
              <li><button onClick={() => handleNavClick('about')} className="text-sm hover:text-[#d4a843] transition-colors text-left">À propos</button></li>
              <li><a href="https://enr-courtage-energie.fr/" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[#d4a843] transition-colors">enr-courtage-energie.fr</a></li>
              <li><a href="https://batimentneufgratuit.fr/" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[#d4a843] transition-colors">batimentneufgratuit.fr</a></li>
              <li><a href="https://monelectricitelocale.fr/" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[#d4a843] transition-colors">monelectricitelocale.fr</a></li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col items-start md:items-start justify-between">
             <div className="flex flex-col items-start space-y-6">
                {/* Google Avis logo */}
                <a href="#" className="inline-block hover:opacity-80 transition-opacity" aria-label="Avis Google">
                  <img
                    src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/ee5a02128bc9c28d6982fb6b8f4b73e6.png"
                    alt="Avis Google"
                    className="h-11 w-auto rounded-lg object-contain bg-white/5 p-1.5"
                    loading="lazy" decoding="async"
                  />
                </a>
                
                {/* Nelson logo */}
                <a href="https://nelsonpv.fr" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-all duration-300" aria-label="Visiter Nelson PV">
                  <img
                    src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/bb9cff716bde1c901c58ea3f8b324b3a.png"
                    alt="Logo Nelson"
                    className="h-9 w-auto object-contain rounded-lg bg-white p-1"
                    loading="lazy" decoding="async"
                  />
                </a>

                {/* Adhérent ENERPLAN */}
                <div className="flex flex-col items-start space-y-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Adhérent ENERPLAN</span>
                  <a href="https://www.enerplan.asso.fr/" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-all duration-300" aria-label="Visiter ENERPLAN">
                    <img
                      src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/bf96a9a79f75957ad5e9282e568c3f14.jpg"
                      alt="Logo ENERPLAN - Syndicat des professionnels de l'énergie solaire"
                      className="h-9 w-auto object-contain rounded-lg bg-white p-1"
                      loading="lazy" decoding="async"
                    />
                  </a>
                </div>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-white/10 my-10"></div>

        <div className="text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="text-gray-500 text-xs">
            © 2020-{new Date().getFullYear()} ENR COURTAGE. Tous droits réservés.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;