import React, { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AutoconsommationSection from '@/components/AutoconsommationSection';
import ConstructionSection from '@/components/ConstructionSection';
import ToitureSection from '@/components/ToitureSection';
import AboutSection from '@/components/AboutSection';
import CertificatesSection from '@/components/CertificatesSection';
import BatterieSection from '@/components/BatterieSection';
import BatterieDetailPage from '@/components/BatterieDetailPage';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import CatalogueSection from '@/components/CatalogueSection';

function MainPage() {
  const [activeTab, setActiveTab] = useState('home');
  const contactFormRef = useRef(null);

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToContact = () => {
    if (contactFormRef.current) {
      contactFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const transition = { duration: 0.5 };

  const renderContent = () => {
    switch (activeTab) {
      case 'autoconsommation':
        return (
          <motion.div key="autoconsommation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-28">
              <AutoconsommationSection />
              <TestimonialsCarousel />
              <div ref={contactFormRef}><ContactForm /></div>
            </div>
          </motion.div>
        );
      case 'construction':
        return (
          <motion.div key="construction" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-28">
              <ConstructionSection />
              <TestimonialsCarousel />
              <CatalogueSection />
              <div ref={contactFormRef}><ContactForm /></div>
            </div>
          </motion.div>
        );
      case 'toiture':
        return (
          <motion.div key="toiture" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-28">
              <ToitureSection scrollToContact={scrollToContact} />
              <TestimonialsCarousel />
              <div ref={contactFormRef}><ContactForm /></div>
            </div>
          </motion.div>
        );
      case 'batterie':
        return (
          <motion.div key="batterie" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-28">
              <BatterieSection scrollToContact={scrollToContact} />
              <div ref={contactFormRef}><ContactForm /></div>
            </div>
          </motion.div>
        );
      case 'certificates':
        return (
          <motion.div key="certificates" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-28">
              <CertificatesSection />
              <div ref={contactFormRef}><ContactForm /></div>
            </div>
          </motion.div>
        );
      case 'about':
        return (
          <motion.div key="about" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-28">
              <AboutSection />
              <TestimonialsCarousel />
              <div ref={contactFormRef}><ContactForm /></div>
            </div>
          </motion.div>
        );
      default:
        return (
          <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-28">
              <div className="relative">
                <div className="absolute inset-0 z-0 opacity-75 hidden md:block" aria-hidden="true">
                  <video
                    src="/1.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative z-10">
                  <Hero setActiveTab={handleSetActiveTab} />
                </div>
              </div>
              <TestimonialsCarousel />
              <div ref={contactFormRef}><ContactForm /></div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>ENR COURTAGE – Bâtiment gratuit & location de toiture photovoltaïque</title>
        <meta name="description" content="Bénéficiez d'un bâtiment ou d'une rénovation de toiture financée à 100% par des investisseurs. ENR COURTAGE compare les offres et sélectionne la meilleure solution." />
        <meta name="keywords" content="bâtiment gratuit, hangar gratuit, bâtiment agricole, location de toiture photovoltaïque, batterie de soutien réseau, ENR COURTAGE" />
      </Helmet>

      <Header activeTab={activeTab} setActiveTab={handleSetActiveTab} scrollToContact={scrollToContact} />

      <main role="main">
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </main>

      <Footer setActiveTab={handleSetActiveTab} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/batterie-soutien-reseau" element={<BatterieDetailPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;