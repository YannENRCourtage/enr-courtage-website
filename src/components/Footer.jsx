import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail } from 'lucide-react';

const Footer = ({ setActiveTab }) => {
  const handleNavClick = (tabId) => setActiveTab(tabId);

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="md:col-span-2 lg:col-span-1">
            <img
              src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/44f5c742023f9f03ac2d52340eb3ddfb.png"
              alt="Logo ENR COURTAGE"
              width="160" height="48"
              className="h-12 w-auto mb-4"
              loading="lazy" decoding="async"
            />
            <p className="text-gray-300 mb-4">Votre partenaire de confiance pour tous vos projets d'énergies renouvelables.</p>
            <address className="not-italic space-y-2">
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">7 rue Gutenberg, 33700 Mérignac</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <a href="mailto:contact@enr-courtage.fr" className="text-sm hover:text-yellow-400 transition-colors">contact@enr-courtage.fr</a>
              </div>
            </address>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <span className="text-lg font-semibold mb-4 block">Nos Services</span>
            <ul className="space-y-2 text-gray-300">
              <li><button onClick={() => handleNavClick('construction')} className="hover:text-yellow-400 transition-colors text-left">Bâtiment Gratuit</button></li>
              <li><button onClick={() => handleNavClick('toiture')} className="hover:text-yellow-400 transition-colors text-left">Rénovation de toiture</button></li>
              <li><button onClick={() => handleNavClick('toiture')} className="hover:text-yellow-400 transition-colors text-left">Location de toiture</button></li>
              <li><button onClick={() => handleNavClick('autoconsommation')} className="hover:text-yellow-400 transition-colors text-left">Autoconsommation</button></li>
              <li><button onClick={() => handleNavClick('batterie')} className="hover:text-yellow-400 transition-colors text-left">Batterie de soutien réseau</button></li>
              <li><button onClick={() => handleNavClick('certificates')} className="hover:text-yellow-400 transition-colors text-left">Valorisation CEE</button></li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <span className="text-lg font-semibold mb-4 block">Plan du site</span>
            <ul className="space-y-2 text-gray-300">
              <li><button onClick={() => handleNavClick('about')} className="hover:text-yellow-400 transition-colors text-left">À propos</button></li>
              <li><a href="https://enr-courtage-energie.fr/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">enr-courtage-energie.fr</a></li>
              <li><a href="https://batimentneufgratuit.fr/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">batimentneufgratuit.fr</a></li>
              <li><a href="https://monelectricitelocale.fr/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">monelectricitelocale.fr</a></li>
              <li><a href="https://mapartdesoleil.fr" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">mapartdesoleil.fr</a></li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col items-start md:items-end justify-between">
             <div className="flex flex-col items-start md:items-start space-y-6">
                {/* Top: Google Avis logo */}
                <a href="#" className="inline-block hover:opacity-90 transition-opacity" aria-label="Avis Google">
                  <img
                    src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/ee5a02128bc9c28d6982fb6b8f4b73e6.png"
                    alt="Avis Google"
                    className="h-12 w-auto rounded-md object-contain bg-white/10 p-1"
                    loading="lazy" decoding="async"
                  />
                </a>
                
                {/* Middle: Nelson logo */}
                <div className="flex items-center space-x-6">
                  {/* Nelson logo */}
                  <a href="https://nelsonpv.fr" target="_blank" rel="noopener noreferrer" className="inline-block hover:scale-105 hover:opacity-80 transition-all duration-300" aria-label="Visiter Nelson PV">
                    <img
                      src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/bb9cff716bde1c901c58ea3f8b324b3a.png"
                      alt="Logo Nelson"
                      className="h-10 w-auto object-contain rounded bg-white p-1"
                      loading="lazy" decoding="async"
                    />
                  </a>
                </div>

                {/* Bottom: Adhérent ENERPLAN */}
                <div className="flex flex-col items-start space-y-2 pt-2">
                  <span className="text-sm font-medium text-gray-300">Adhérent ENERPLAN</span>
                  <a href="https://www.enerplan.asso.fr/" target="_blank" rel="noopener noreferrer" className="inline-block hover:scale-105 hover:opacity-80 transition-all duration-300" aria-label="Visiter ENERPLAN">
                    <img
                      src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/bf96a9a79f75957ad5e9282e568c3f14.jpg"
                      alt="Logo ENERPLAN - Syndicat des professionnels de l'énergie solaire"
                      className="h-10 w-auto object-contain rounded bg-white p-1"
                      loading="lazy" decoding="async"
                    />
                  </a>
                </div>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-gray-700 my-8"></div>

        <div className="text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="text-gray-400 text-sm">
            © 2020-ENR COURTAGE. Tous droits réservés.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;