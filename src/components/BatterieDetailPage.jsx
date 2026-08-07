import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Battery, Zap, Coins, CheckCircle, Users, Home, TrendingUp, Shield, Leaf, CheckSquare, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BatterieDetailPage = () => {
  const navigate = useNavigate();
  
  const handleTabClick = () => {
    navigate('/');
  };
  
  const scrollToContact = () => {
    navigate('/#contact-form');
    setTimeout(() => {
      const contactSection = document.querySelector('#contact-form') || document.querySelector('[data-contact-form]');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const benefits = [
    {
      icon: <Coins className="h-12 w-12 text-green-600" />,
      title: 'Rente annuelle garantie',
      description: 'Revenus stables et prévisibles sur toute la durée du contrat'
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-blue-600" />,
      title: 'Aucun investissement',
      description: 'Installation 100% financée par nos soins'
    },
    {
      icon: <Shield className="h-12 w-12 text-orange-600" />,
      title: 'Aucune maintenance',
      description: 'Nous gérons tout de A à Z, vous n\'avez rien à faire'
    },
    {
      icon: <Leaf className="h-12 w-12 text-teal-600" />,
      title: 'Contribution à la transition énergétique',
      description: 'Participez activement à la stabilisation du réseau électrique'
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-purple-600" />,
      title: 'Aucune contrainte pour votre activité',
      description: 'Empreinte minimale, impact maximal sur votre patrimoine'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Helmet>
        <title>Batterie de soutien réseau - Percevez une rente sans rien faire | ENR COURTAGE</title>
        <meta name="description" content="Solution innovante de batterie de soutien réseau 100% financée. Percevez une rente annuelle garantie sans investissement ni maintenance. Installation et gestion complète par ENR COURTAGE." />
      </Helmet>

      <Header 
        activeTab="batterie" 
        setActiveTab={handleTabClick} 
        scrollToContact={scrollToContact} 
      />

      <main role="main" className="pt-16 md:pt-20">
        {/* Hero Section avec vidéo "8.mp4" sous-imposée */}
        <section className="relative pt-20 md:pt-28 pb-16 md:pb-24 overflow-hidden bg-[#0f2847]" aria-labelledby="hero-title">
          {/* Vidéo 8.mp4 en arrière-plan avec sous-imposition légère */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-65 scale-105"
              src="/8.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f2847]/50 via-[#0f2847]/40 to-[#0f2847]/65" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto container-padding text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1 id="hero-title" className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                Batterie de <span className="enr-gradient-text-gold">soutien réseau</span>
              </h1>
              <p className="text-lg text-gray-200 max-w-3xl mx-auto font-light leading-relaxed mb-8">
                Percevez une rente annuelle sans rien faire
              </p>
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl px-12 py-8 shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-full"
              >
                Vérifier votre éligibilité
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50" aria-labelledby="concept-title">
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
                className="bg-white p-12 rounded-2xl shadow-2xl border-4 border-blue-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-bl-full opacity-10"></div>
                <div className="relative z-10">
                  <h3 className="text-4xl md:text-5xl font-black text-blue-600 mb-6 leading-tight">
                    NOUS
                  </h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 leading-relaxed">
                    Faisons l'intégralité des travaux et les finançons
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
                className="bg-white p-12 rounded-2xl shadow-2xl border-4 border-green-500 relative overflow-hidden"
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
              <p className="text-4xl md:text-5xl font-black text-gray-900 inline-block px-8 py-4 bg-yellow-300 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                Rien de plus simple.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-white" aria-labelledby="no-solar-title">
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
                  Contrairement aux installations photovoltaïques traditionnelles, notre solution de batterie de soutien réseau fonctionne de manière totalement indépendante.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  Pas besoin de panneaux solaires sur votre toiture ou votre terrain. La batterie se connecte directement au réseau électrique pour stabiliser la distribution d'énergie locale.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mt-6">
                  <p className="text-gray-800 font-semibold flex items-start">
                    <Zap className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                    Une solution simple et compacte qui nécessite uniquement un espace de 10-15m² à proximité d'un transformateur électrique.
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
                  src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/5692a18fc58c913539e337f9247bc57a.jpg" 
                  alt="Batteries avec bâtiments industriels"
                  className="rounded-2xl shadow-2xl w-full h-auto"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-gradient-to-br from-blue-900 to-teal-800 text-white" aria-labelledby="financing-title">
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
                ENR COURTAGE prend en charge 100% des coûts d'installation et de maintenance. Vous n'avez absolument rien à débourser.
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
                  Tous les travaux d'installation sont réalisés par nos équipes certifiées, sans aucun frais pour vous.
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
                  En échange de la mise à disposition de votre terrain, percevez une rente annuelle stable et prévisible.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-white" aria-labelledby="for-whom-title">
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
                Que vous soyez agriculteur, chef d'entreprise ou propriétaire résidentiel, valorisez votre terrain
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300">
                  <img 
                    src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/b1c9650f20a75cfe160c49f4980584ad.jpg" 
                    alt="Batteries avec tracteur agricole"
                    className="w-full h-64 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <CardContent className="p-6">
                    <Users className="h-10 w-10 text-green-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Propriétés agricoles</h3>
                    <p className="text-gray-600">
                      Agriculteurs et exploitants disposant d'un terrain à proximité d'un transformateur
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
                <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300">
                  <img 
                    src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/fc47fa566bdc88bd3c06256ec8e688c1.jpg" 
                    alt="Batteries avec bâtiments industriels"
                    className="w-full h-64 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <CardContent className="p-6">
                    <Building2 className="h-10 w-10 text-blue-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Sites industriels</h3>
                    <p className="text-gray-600">
                      Entreprises et collectivités avec un espace disponible pour l'installation
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
                <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300">
                  <img 
                    src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/191c8f398b6247abb7de04d559a9f23a.jpg" 
                    alt="Propriétaire foncier"
                    className="w-full h-64 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <CardContent className="p-6">
                    <Home className="h-10 w-10 text-orange-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Propriétaire foncier</h3>
                    <p className="text-gray-600">
                      Particuliers disposant d'un terrain inutilisé à proximité d'infrastructures électriques
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
              className="bg-gradient-to-r from-blue-50 to-teal-50 border-l-4 border-blue-600 p-8 rounded-lg"
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
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Proximité d'un transformateur électrique</h4>
                    <p className="text-gray-700">
                      Le terrain doit être situé à proximité d'un transformateur pour une connexion optimale au réseau
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50" aria-labelledby="benefits-title">
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
                Une opportunité gagnant-gagnant pour vous et l'environnement
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
                  <Card className="p-8 h-full bg-white hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300 group">
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
                    <Card className="p-8 h-full bg-white hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300 group">
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

        <section className="section-padding bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700" aria-labelledby="cta-title">
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
                  src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/14b930456a4b12be72389c1cf880c3e3.jpg" 
                  alt="Batteries avec bâtiments industriels et panneaux solaires"
                  className="rounded-2xl shadow-2xl w-full h-auto"
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
                  Transformez votre terrain en source de revenus réguliers tout en contribuant à la stabilisation du réseau électrique français. Sans investissement, sans contrainte.
                </p>
                <Button 
                  onClick={scrollToContact}
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-gray-100 font-bold text-xl px-12 py-8 shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-full"
                >
                  Demander plus d'informations
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