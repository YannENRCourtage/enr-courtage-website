import React from 'react';
import { motion } from 'framer-motion';

const CatalogueSection = () => {
  // New Calameo ID extracted from the provided URL: 0072521744f89e58d6def
  const catalogueId = "0072521744f89e58d6def";
  const embedUrl = `https://www.calameo.com/read/${catalogueId}?embed&mode=book`;
  const mobileUrl = `https://www.calameo.com/books/${catalogueId}`;

  return (
    <section className="py-16 bg-gray-50 overflow-hidden" aria-labelledby="catalogue-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="catalogue-title" className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Notre catalogue
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Découvrez nos modèles de bâtiments et ombrières.
          </p>
        </div>

        {/* Desktop/Tablet Viewer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="hidden md:block w-full max-w-6xl mx-auto"
        >
          <div
            className="relative"
            style={{
              paddingTop: '56.25%', // 16:9 Aspect Ratio
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              borderRadius: '0.5rem',
              overflow: 'hidden',
            }}
          >
            <iframe
              title="Catalogue ENR COURTAGE"
              loading="lazy"
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl}
              allowFullScreen
              allow="clipboard-write"
              style={{ border: 0 }}
            ></iframe>
          </div>
        </motion.div>

        {/* Mobile Link */}
        <div className="md:hidden text-center mt-8">
          <p className="text-lg text-gray-700 mb-4">
            Consultez notre catalogue directement en ligne :
          </p>
          <a
            href={mobileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Voir le Catalogue
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CatalogueSection;