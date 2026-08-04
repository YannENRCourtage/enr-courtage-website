import React, { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AutoconsommationSection from '@/components/AutoconsommationSection';
import ConstructionSection from '@/components/ConstructionSection';
import AboutSection from '@/components/AboutSection';
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
              <div ref={contactFormRef} data-contact-form><ContactForm /></div>
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
              <div ref={contactFormRef} data-contact-form><ContactForm /></div>
            </div>
          </motion.div>
        );
      case 'batterie':
        return (
          <motion.div key="batterie" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-28">
              <BatterieSection scrollToContact={scrollToContact} />
              <div ref={contactFormRef} data-contact-form><ContactForm /></div>
            </div>
          </motion.div>
        );
      case 'about':
        return (
          <motion.div key="about" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-28">
              <AboutSection />
              <TestimonialsCarousel />
              <div ref={contactFormRef} data-contact-form><ContactForm /></div>
            </div>
          </motion.div>
        );
      default:
        return (
          <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-28">
              <div className="relative">
                <div className="absolute inset-0 z-0 hidden md:block" aria-hidden="true">
                  <video
                    src="/1.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Mobile fallback: dark gradient background */}
                <div className="absolute inset-0 z-0 md:hidden gradient-bg-hero" aria-hidden="true" />
                <div className="relative z-10">
                  <Hero setActiveTab={handleSetActiveTab} />
                </div>
              </div>
              <TestimonialsCarousel />
              <div ref={contactFormRef} data-contact-form><ContactForm /></div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>ENR COURTAGE – Courtier en énergies renouvelables | Bâtiment gratuit, IRVE, Autoconsommation</title>
        <meta name="description" content="ENR COURTAGE, courtier en énergies renouvelables. Batterie de soutien réseau, bornes IRVE, bâtiments & ombrières tiers financées, autoconsommation solaire en abonnement." />
        <meta name="keywords" content="bâtiment gratuit, hangar gratuit, ombrière photovoltaïque, borne de recharge IRVE, batterie de soutien réseau, autoconsommation solaire, ENR COURTAGE" />
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