import React from 'react';
import { motion } from 'framer-motion';

const FranceMap = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="flex flex-col items-center justify-center w-full h-full bg-white rounded-xl p-4 shadow-lg border border-gray-200"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Nos réalisations en France *</h3>
      <div className="relative w-full overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
        <img
          src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/3715d0c61900ed03a2f45a51b26123d0.jpg"
          alt="Carte de France montrant nos projets"
          className="w-full h-auto object-contain max-h-[400px]"
          loading="lazy"
        />
      </div>
      <p className="text-xs text-gray-400 italic mt-3 text-center">* carte extraite de notre logiciel de gestion</p>
    </motion.div>
  );
};

export default FranceMap;