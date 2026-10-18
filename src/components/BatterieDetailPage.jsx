import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Zap,
  Coins,
  CheckCircle,
  Users,
  Home,
  TrendingUp,
  Shield,
  Leaf,
  CheckSquare,
  Building2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BessEligibilitySimulator from '@/components/BessEligibilitySimulator';

const BatterieDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDirectSimulatorMode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (
      params.get('mode') === 'simulateur' ||
      params.get('utm_source') === 'facebook' ||
      location.hash === '#simulateur-eligibilite'
    );
  }, [location.search, location.hash]);

  const handleTabClick = () => {
    navigate('/');
  };

  const scrollToSimulator = () => {
    const simSection = document.getElementById('simulateur-eligibilite');
    if (simSection) {
      simSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToContact = () => {
    const simSection = document.getElementById('simulateur-eligibilite');
    if (simSection) {
      simSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate('/#contact-form');
  };

  // Centrage automatique sur le simulateur si accès via lien Facebook / ?mode=simulateur / #simulateur-eligibilite
  useEffect(() => {
    if (isDirectSimulatorMode) {
      const timer = setTimeout(() => {
        const simSection = document.getElementById('simulateur-eligibilite');
        if (simSection) {
          simSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isDirectSimulatorMode]);

  const benefits = [
    {
      icon: <Coins className="h-12 w-12 text-green-600" />,
      title: 'Rente annuelle garantie',
      description: 'Des revenus stables et prévisibles sur le long terme',
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-blue-600" />,
      title: 'Aucun investissement',
      description: 'Installation et équipement 100 % financés par nos soins',
    },
    {
      icon: <Shield className="h-12 w-12 text-orange-600" />,
      title: 'Aucune maintenance',
      description: "Nous gérons tout de A à Z, vous n'avez rien à faire",
    },
    {
      icon: <Leaf className="h-12 w-12 text-teal-600" />,
      title: 'Contribution à la transition énergétique',
      description: 'Participez activement à la stabilisation du réseau électrique français',
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-purple-600" />,
      title: 'Aucune contrainte pour votre activité',
      description: 'Empreinte minimale, impact maximal sur votre patrimoine',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 w-full max-w-full overflow-x-hidden relative">
      <Helmet>
        <title>Batterie de soutien réseau - Percevez une rente sans rien faire | ENR COURTAGE</title>
        <meta
          name="description"
          content="Valorisez votre terrain grâce à une batterie de soutien réseau. Vérifiez l'éligibilité de votre parcelle en 30 secondes et découvrez le montant de votre rente annuelle garantie sans aucun investissement."
        />
        <meta
          property="og:title"
          content="Batterie de soutien réseau - Percevez une rente sans rien faire | ENR COURTAGE"
        />
        <meta
          property="og:description"
          content="Vérifiez l'éligibilité de votre terrain en 30 secondes sur notre carte satellite et découvrez votre rente annuelle garantie sans aucun investissement."
        />
        <meta property="og:url" content="https://www.enr-courtage.fr/batterie-soutien-reseau" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://www.enr-courtage.fr/images/bess-agricole-grillage.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Batterie de soutien réseau - Percevez une rente sans rien faire | ENR COURTAGE"
        />
        <meta
          name="twitter:description"
          content="Vérifiez l'éligibilité de votre terrain en 30 secondes sur notre carte satellite et découvrez votre rente annuelle garantie sans aucun investissement."
        />
        <meta
          name="twitter:image"
          content="https://www.enr-courtage.fr/images/bess-agricole-grillage.jpg"
        />
      </Helmet>

      <Header
        activeTab="batterie"
        setActiveTab={handleTabClick}
        scrollToContact={scrollToContact}
      />

      <main role="main" className="pt-16 md:pt-20 w-full max-w-full overflow-x-hidden">
        {/* Hero Section avec vidéo "8.mp4" sous-imposée */}
        <section
          className="relative pt-20 md:pt-28 pb-16 md:pb-24 overflow-hidden bg-slate-950 w-full max-w-full"
          aria-labelledby="hero-title"
        >
          {/* Vidéo /8.mp4 en arrière-plan avec sous-imposition */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-85 scale-105"
            src="/8.mp4"
          />
          <div className="absolute inset-0 bg-slate-950/50 z-0 pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto container-padding text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1
                id="hero-title"
                className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight"
              >
                Batterie de <span className="enr-gradient-text-gold">soutien réseau</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto font-light leading-relaxed mb-8">
                Percevez une rente annuelle sans rien faire
              </p>
              <Button
                onClick={scrollToSimulator}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-base sm:text-xl px-6 sm:px-12 py-5 sm:py-8 shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-full max-w-full h-auto text-center whitespace-normal cursor-pointer"
              >
                Vérifier votre éligibilité
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Section "Le concept en toute simplicité" */}
        <section
          className="section-padding bg-gradient-to-br from-gray-50 to-blue-50 w-full max-w-full overflow-hidden"
          aria-labelledby="concept-title"
        >
          <div className="max-w-7xl mx-auto container-padding">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 id="concept-title" className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Le concept en toute simplicité
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-2xl border-4 border-blue-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-bl-full opacity-10"></div>
                <div className="relative z-10">
                  <h3 className="text-4xl md:text-5xl font-black text-blue-600 mb-6 leading-tight">
                    NOUS
                  </h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 leading-relaxed">
                    Faisons l&apos;intégralité des travaux et les finançons
                  </p>
                  <div className="mt-8 flex items-center space-x-4">
                    <CheckSquare className="h-10 w-10 text-blue-600 flex-shrink-0" />
                    <span className="text-lg text-gray-600 font-medium">Installation complète</span>
                  </div>
                  <div className="mt-4 flex items-center space-x-4">
                    <CheckSquare className="h-10 w-10 text-blue-600 flex-shrink-0" />
                    <span className="text-lg text-gray-600 font-medium">Financement 100%</span>
                  </div>
                  <div className="mt-4 flex items-center space-x-4">
                    <CheckSquare className="h-10 w-10 text-blue-600 flex-shrink-0" />
                    <span className="text-lg text-gray-600 font-medium">Maintenance assurée</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-2xl border-4 border-green-500 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-32 h-32 bg-green-500 rounded-br-full opacity-10"></div>
                <div className="relative z-10">
                  <h3 className="text-4xl md:text-5xl font-black text-green-600 mb-6 leading-tight">
                    VOUS
                  </h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 leading-relaxed">
                    Percevez une rente annuelle garantie
                  </p>
                  <div className="mt-8 flex items-center space-x-4">
                    <Coins className="h-10 w-10 text-green-600 flex-shrink-0" />
                    <span className="text-lg text-gray-600 font-medium">Revenus réguliers</span>
                  </div>
                  <div className="mt-4 flex items-center space-x-4">
                    <CheckCircle className="h-10 w-10 text-green-600 flex-shrink-0" />
                    <span className="text-lg text-gray-600 font-medium">Sans frais de votre part</span>
                  </div>
                  <div className="mt-4 flex items-center space-x-4">
                    <Shield className="h-10 w-10 text-green-600 flex-shrink-0" />
                    <span className="text-lg text-gray-600 font-medium">Aucun risque financier</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <p className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 inline-block max-w-full px-5 sm:px-8 py-3 sm:py-4 bg-yellow-300 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 break-words">
                Rien de plus simple.
              </p>
            </motion.div>
          </div>
        </section>

        {/* SIMULATEUR D'ÉLIGIBILITÉ INTERACTIF */}
        <BessEligibilitySimulator isDirectMode={isDirectSimulatorMode} />

        {/* Section "Aucune installation solaire requise" */}
        <section
          className="section-padding bg-white w-full max-w-full overflow-hidden"
          aria-labelledby="no-solar-title"
        >
          <div className="max-w-7xl mx-auto container-padding">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 id="no-solar-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Aucune installation solaire requise
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  Contrairement aux installations photovoltaïques traditionnelles, notre solution de batterie de
                  soutien réseau fonctionne de manière totalement indépendante.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  Pas besoin de panneaux solaires sur votre toiture ou votre terrain. La batterie se connecte
                  directement au réseau électrique pour stabiliser la distribution d&apos;énergie locale.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mt-6">
                  <p className="text-gray-800 font-semibold flex items-start">
                    <Zap className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                    Une solution simple et compacte qui nécessite uniquement un espace de 20 m² à proximité d&apos;un
                    transformateur électrique.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src="/images/bess-industriel-grillage.jpg"
                  alt="Batteries avec bâtiments industriels"
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section "Entièrement financée par nos soins" */}
        <section
          className="section-padding bg-gradient-to-br from-blue-900 to-teal-800 text-white w-full max-w-full overflow-hidden"
          aria-labelledby="financing-title"
        >
          <div className="max-w-7xl mx-auto container-padding">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 id="financing-title" className="text-3xl md:text-4xl font-bold mb-6">
                Entièrement financée par nos soins
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                ENR COURTAGE prend en charge 100% des coûts d&apos;installation et de maintenance. Vous n&apos;avez
                absolument rien à débourser.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20"
              >
                <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Installation complète</h3>
                <p className="text-blue-100 leading-relaxed">
                  Tous les travaux d&apos;installation sont réalisés par nos équipes certifiées, sans aucun frais pour
                  vous.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20"
              >
                <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Maintenance assurée</h3>
                <p className="text-blue-100 leading-relaxed">
                  Toute la maintenance préventive et corrective est prise en charge pendant toute la durée du contrat.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20"
              >
                <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Coins className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Rente garantie</h3>
                <p className="text-blue-100 leading-relaxed">
                  En échange de la mise à disposition de votre terrain, percevez une rente annuelle stable et
                  prévisible.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section "Adapté à tous les propriétaires fonciers" */}
        <section
          className="section-padding bg-white w-full max-w-full overflow-hidden"
          aria-labelledby="for-whom-title"
        >
          <div className="max-w-7xl mx-auto container-padding">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 id="for-whom-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Adapté à tous les propriétaires fonciers
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Que vous soyez agriculteur, chef d&apos;entreprise ou propriétaire résidentiel, cette opportunité est
                faite pour vous
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="overflow-hidden h-full rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <img
                    src="/images/bess-agricole-grillage.jpg"
                    alt="Batteries avec tracteur agricole"
                    className="w-full h-64 object-cover rounded-t-2xl"
                    loading="lazy"
                    decoding="async"
                  />
                  <CardContent className="p-6">
                    <Users className="h-10 w-10 text-green-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Propriétés agricoles</h3>
                    <p className="text-gray-600">
                      Agriculteurs et exploitants disposant d&apos;un terrain à proximité d&apos;un transformateur
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden h-full rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <img
                    src="/images/bess-industriel-grillage.jpg"
                    alt="Batteries avec bâtiments industriels"
                    className="w-full h-64 object-cover rounded-t-2xl"
                    loading="lazy"
                    decoding="async"
                  />
                  <CardContent className="p-6">
                    <Building2 className="h-10 w-10 text-blue-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Sites industriels</h3>
                    <p className="text-gray-600">
                      Entreprises et collectivités avec un espace disponible pour l&apos;installation
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="overflow-hidden h-full rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <img
                    src="/images/bess-tertiaire-grillage.jpg"
                    alt="Propriétaire foncier"
                    className="w-full h-64 object-cover rounded-t-2xl"
                    loading="lazy"
                    decoding="async"
                  />
                  <CardContent className="p-6">
                    <Home className="h-10 w-10 text-orange-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Propriétaire foncier</h3>
                    <p className="text-gray-600">
                      Particuliers disposant d&apos;un terrain inutilisé à proximité d&apos;infrastructures électriques
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-r from-blue-50 to-teal-50 border-l-4 border-blue-600 p-8 rounded-2xl shadow-md"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckSquare className="h-8 w-8 text-blue-600 mr-3" />
                Deux critères essentiels
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Être propriétaire du terrain</h4>
                    <p className="text-gray-700">
                      Vous devez être le propriétaire légal de la parcelle où sera installée la batterie
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      Proximité d&apos;un transformateur électrique
                    </h4>
                    <p className="text-gray-700">
                      Le terrain doit être situé à proximité d&apos;un transformateur pour une connexion optimale au
                      réseau
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section "Vos bénéfices concrets" */}
        <section
          className="section-padding bg-gradient-to-br from-gray-50 to-blue-50 w-full max-w-full overflow-hidden"
          aria-labelledby="benefits-title"
        >
          <div className="max-w-6xl mx-auto container-padding">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 id="benefits-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Vos bénéfices concrets
              </h2>
              <p className="text-lg text-gray-600">
                Une opportunité gagnant-gagnant pour vous et l&apos;environnement
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {benefits.slice(0, 3).map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Card className="p-8 h-full bg-white hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300 group rounded-2xl">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex-shrink-0 p-4 bg-gray-50 rounded-full mb-4 group-hover:bg-blue-50 transition-colors duration-300">
                        {benefit.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}

              <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {benefits.slice(3).map((benefit, idx) => (
                  <motion.div
                    key={idx + 3}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: (idx + 3) * 0.1 }}
                  >
                    <Card className="p-8 h-full bg-white hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300 group rounded-2xl">
                      <div className="flex flex-col items-center text-center">
                        <div className="flex-shrink-0 p-4 bg-gray-50 rounded-full mb-4 group-hover:bg-blue-50 transition-colors duration-300">
                          {benefit.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section Bannière finale "Intéressé ? Contactez-nous" */}
        <section
          className="section-padding bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700 w-full max-w-full overflow-hidden"
          aria-labelledby="cta-title"
        >
          <div className="max-w-7xl mx-auto container-padding">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="order-2 md:order-1"
              >
                <img
                  src="/images/bess-4-batteries-grillage.jpg"
                  alt="Batteries avec bâtiments industriels et panneaux solaires"
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover bg-white p-2"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="order-1 md:order-2 text-center md:text-left"
              >
                <TrendingUp className="h-20 w-20 text-yellow-400 mx-auto md:mx-0 mb-6" />
                <h2 id="cta-title" className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Intéressé ? Contactez-nous
                </h2>
                <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
                  Transformez votre terrain en source de revenus réguliers tout en contribuant à la stabilisation du
                  réseau électrique français. Sans investissement, sans contrainte.
                </p>
                <Button
                  onClick={scrollToSimulator}
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-gray-100 font-bold text-base sm:text-xl px-6 sm:px-12 py-5 sm:py-8 shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-full max-w-full h-auto text-center whitespace-normal cursor-pointer"
                >
                  Demander plus d&apos;informations
                </Button>
                <p className="text-blue-100 mt-6 text-sm">
                  Réponse sous 24h • Sans engagement
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer setActiveTab={handleTabClick} />
    </div>
  );
};

export default BatterieDetailPage;