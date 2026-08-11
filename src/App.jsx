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
import { isStagingOrTestEnvironment } from '@/utils/envUtils';


const videos = ['/1.mp4', '/2.mp4'];

function VideoBackground() {
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleVideoEnd = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % videos.length);
  }, []);

  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1 || !v2) return;

    if (activeIndex === 0) {
      v1.currentTime = 0;
      v1.play().catch(() => {});
    } else {
      v2.currentTime = 0;
      v2.play().catch(() => {});
    }
  }, [activeIndex]);

  return (
    <div className="absolute inset-0 z-0 hidden md:block" aria-hidden="true">
      <video
        ref={video1Ref}
        src={videos[0]}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: activeIndex === 0 ? 1 : 0,
          transition: 'opacity 0.8s ease-in-out',
        }}
      />
      <video
        ref={video2Ref}
        src={videos[1]}
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: activeIndex === 1 ? 1 : 0,
          transition: 'opacity 0.8s ease-in-out',
        }}
      />
    </div>
  );
}

function MainPage() {
  const [activeTab, setActiveTab] = useState('home');
  const contactFormRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['toiture', 'autoconsommation', 'irve', 'construction', 'batterie', 'about', 'home'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam && location.pathname === '/') {
      setActiveTab('home');
    }
  }, [location.search, location.pathname]);

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      window.history.pushState({}, '', '/');
    } else {
      window.history.pushState({}, '', `/?tab=${tab}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToContact = () => {
    const contactEl = document.querySelector('#contact-form') || document.querySelector('[data-contact-form]') || contactFormRef.current;
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
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
      case 'toiture':
        return (
          <motion.div key="toiture" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-28">
              <ToiturePhotovoltaiqueSection />
              <TestimonialsCarousel />
              <div ref={contactFormRef} data-contact-form><ContactForm /></div>
            </div>
          </motion.div>
        );
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
      case 'irve':
        return (
          <motion.div key="irve" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
            <div className="pt-28">
              <IrveSection />
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
              {/* <EligibilitySimulator /> temporarily removed to fix blank page */}
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
                <VideoBackground />
                {/* Mobile fallback: dark gradient background */}
                <div className="absolute inset-0 z-0 md:hidden gradient-bg-hero" aria-hidden="true" />
                <div className="relative z-10">
                  <Hero setActiveTab={handleSetActiveTab} />
                </div>
              </div>
              <ConfigurateurCharpente />
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