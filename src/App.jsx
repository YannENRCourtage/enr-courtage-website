import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import EligibilitySimulator from '@/components/EligibilitySimulator';

import IrveSection from '@/components/IrveSection';
import ToiturePhotovoltaiqueSection from '@/components/ToiturePhotovoltaiqueSection';
import ConfigurateurCharpente from '@/components/ConfigurateurCharpente';
import StructureSurMesureSection from '@/components/StructureSurMesureSection';
import WhyUsBentoSection from '@/components/WhyUsBentoSection';
import BatitechSection from '@/components/BatitechSection';



function MainPage() {
  const [activeTab, setActiveTab] = useState('home');
  const contactFormRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['toiture', 'autoconsommation', 'irve', 'construction', 'batterie', 'about', 'structure_sur_mesure', 'sechoir', 'home'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (location.pathname === '/structure-metallique-sur-mesure') {
      setActiveTab('structure_sur_mesure');
    } else if (location.pathname === '/sechoir-batitech' || location.pathname === '/sechoir-multimatieres-batitech') {
      setActiveTab('sechoir');
    } else if (location.pathname === '/a-propos' || location.pathname === '/about') {
      setActiveTab('about');
    } else if (!tabParam && location.pathname === '/') {
      setActiveTab('home');
    }
  }, [location.search, location.pathname]);

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      window.history.pushState({}, '', '/');
    } else if (tab === 'structure_sur_mesure') {
      window.history.pushState({}, '', '/structure-metallique-sur-mesure');
    } else if (tab === 'sechoir') {
      window.history.pushState({}, '', '/sechoir-batitech');
    } else if (tab === 'about') {
      window.history.pushState({}, '', '/?tab=about');
    } else {
      window.history.pushState({}, '', `/?tab=${tab}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToContact = () => {
    const contactEl = document.querySelector('#contact-form') || document.querySelector('[data-contact-form]') || contactFormRef.current;
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      handleSetActiveTab('toiture');
      setTimeout(() => {
        const el = document.querySelector('#contact-form') || document.querySelector('[data-contact-form]');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  useEffect(() => {
    if (window.location.hash === '#contact-form') {
      setTimeout(() => {
        scrollToContact();
      }, 200);
    }
  }, []);

  const transition = { duration: 0.5 };

  const renderContent = () => {
    switch (activeTab) {
      case 'structure_sur_mesure':
        return (
          <motion.div key="structure_sur_mesure" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-20">
              <StructureSurMesureSection />
              <TestimonialsCarousel />
              <div ref={contactFormRef} data-contact-form><ContactForm /></div>
            </div>
          </motion.div>
        );
      case 'sechoir':
        return (
          <motion.div key="sechoir" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-20">
              <BatitechSection />
              <TestimonialsCarousel />
              <div ref={contactFormRef} data-contact-form><ContactForm /></div>
            </div>
          </motion.div>
        );
      case 'toiture':
        return (
          <motion.div key="toiture" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-20">
              <ToiturePhotovoltaiqueSection />
              <TestimonialsCarousel />
              <div ref={contactFormRef} data-contact-form><ContactForm /></div>
            </div>
          </motion.div>
        );
      case 'autoconsommation':
        return (
          <motion.div key="autoconsommation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-20">
              <AutoconsommationSection />
              <TestimonialsCarousel />
              <div ref={contactFormRef} data-contact-form><ContactForm /></div>
            </div>
          </motion.div>
        );
      case 'irve':
        return (
          <motion.div key="irve" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-20">
              <IrveSection />
              <TestimonialsCarousel />
              <div ref={contactFormRef} data-contact-form><ContactForm /></div>
            </div>
          </motion.div>
        );
      case 'construction':
        return (
          <motion.div key="construction" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-20">
              <ConstructionSection />
              <TestimonialsCarousel />
              {/* <EligibilitySimulator /> temporarily removed to fix blank page */}
              <div ref={contactFormRef} data-contact-form><ContactForm /></div>
            </div>
          </motion.div>
        );
      case 'batterie':
        return (
          <motion.div key="batterie" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-20">
              <BatterieSection scrollToContact={scrollToContact} />
              <div ref={contactFormRef} data-contact-form><ContactForm /></div>
            </div>
          </motion.div>
        );
      case 'about':
        return (
          <motion.div key="about" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-20">
              <AboutSection />
              <TestimonialsCarousel />
            </div>
          </motion.div>
        );
      default:
        return (
          <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-20">
              <Hero setActiveTab={handleSetActiveTab} />
              <ConfigurateurCharpente />
              <WhyUsBentoSection scrollToContact={scrollToContact} />
              <div ref={contactFormRef} data-contact-form><ContactForm /></div>
              <TestimonialsCarousel />
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white w-full max-w-full overflow-x-hidden relative">
      <Helmet>
        <title>ENR COURTAGE – Courtier en énergies renouvelables | Bâtiment gratuit, IRVE, Autoconsommation</title>
        <meta name="description" content="ENR COURTAGE, courtier en énergies renouvelables. Batterie de soutien réseau, bornes IRVE, bâtiments & ombrières tiers financées, autoconsommation solaire en abonnement." />
        <meta name="keywords" content="bâtiment gratuit, hangar gratuit, ombrière photovoltaïque, borne de recharge IRVE, batterie de soutien réseau, autoconsommation solaire, ENR COURTAGE" />
      </Helmet>

      <Header activeTab={activeTab} setActiveTab={handleSetActiveTab} scrollToContact={scrollToContact} />

      <main role="main" className="w-full max-w-full overflow-x-hidden">
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
        <Route path="/structure-metallique-sur-mesure" element={<MainPage />} />
        <Route path="/sechoir-batitech" element={<MainPage />} />
        <Route path="/sechoir-multimatieres-batitech" element={<MainPage />} />
        <Route path="/a-propos" element={<MainPage />} />
        <Route path="/about" element={<MainPage />} />
        <Route path="/batterie-soutien-reseau" element={<BatterieDetailPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;