import React from 'react';
import { motion } from 'framer-motion';
import { Battery, Zap, TrendingDown, MapPin, Coins, CheckCircle, AlertTriangle, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BatterieCarousel from '@/components/BatterieCarousel';

const BatterieSection = ({ scrollToContact }) => {
  const challenges = [
    {
      icon: <Zap className="h-8 w-8 text-orange-600" />,
      title: "Équilibre offre-demande",
      description: "La nécessité constante d'équilibrer la production et la consommation d'électricité en temps réel"
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
      title: "Tensions internationales",
      description: "Les défis géopolitiques qui impactent l'approvisionnement énergétique de la France"
    },
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: "Souveraineté énergétique",
      description: "L'importance de garantir l'indépendance énergétique du territoire français"
    }
  ];

  const solutions = [
    {
      icon: <MapPin className="h-6 w-6 text-green-600" />,
      title: "Empreinte réduite",
      description: "Seulement 10-15m² d'espace nécessaire pour l'installation"
    },
    {
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      title: "Stabilisation du réseau",
      description: "Correction instantanée des instabilités électriques locales"
    },
    {
      icon: <Battery className="h-6 w-6 text-orange-600" />,
      title: "Support local",
      description: "Gestion optimale des tensions entre consommation et production"
    },
    {
      icon: <TrendingDown className="h-6 w-6 text-purple-600" />,
      title: "Qualité améliorée",
      description: "Amélioration significative de la qualité du réseau électrique"
    }
  ];

  const benefits = [
    "Économies importantes pour la collectivité sur le long terme",
    "Évite des investissements massifs dans la modernisation des infrastructures",
    "Contribution à la transition énergétique locale",
    "Renforcement de la résilience du réseau électrique",
    "Réduction des coupures et des perturbations électriques"
  ];

  const ownerBenefits = [
    "Recherche de terrains plats près des transformateurs électriques",
    "Versement d'un loyer pour la mise à disposition de l'espace",
    "Aucune intervention requise du propriétaire",
    "Installation et maintenance assurées par ENR COURTAGE ENERGIE",
    "Revenus locatifs garantis pendant toute la durée du contrat"
  ];

  return (
    <div className="bg-white w-full max-w-full overflow-x-hidden relative">
      {/* Hero Section avec vidéo "8.mp4" sous-imposée */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-24 overflow-hidden bg-[#0f2847]" aria-labelledby="batterie-hero-title">
        {/* Vidéo /8.mp4 en arrière-plan avec sous-imposition */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-10 opacity-65 scale-105"
          src="/8.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2847]/50 via-[#0f2847]/40 to-[#0f2847]/65 -z-10 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto container-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 id="batterie-hero-title" className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Batterie de <span className="enr-gradient-text-gold">soutien réseau</span>
            </h1>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto font-light leading-relaxed">
              Une solution innovante pour renforcer la stabilité du réseau électrique français
            </p>
          </motion.div>
        </div>
      </section>

      {/* Le défi Section */}
      <section className="py-20 bg-gray-50" aria-labelledby="defi-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 id="defi-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Le défi du réseau électrique français
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Le réseau électrique français fait face à des défis majeurs qui nécessitent des solutions innovantes et décentralisées. La gestion locale et distribuée du réseau est devenue un élément clé pour assurer la stabilité et la pérennité de notre système énergétique.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {challenges.map((challenge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-6">
                      {challenge.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {challenge.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {challenge.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong className="text-blue-900">La gestion décentralisée du réseau</strong> est aujourd'hui reconnue comme un pilier essentiel pour garantir la résilience et l'efficacité de notre système énergétique national.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Notre solution Section */}
      <section className="py-20 bg-white" aria-labelledby="solution-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 id="solution-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Notre solution de batterie de soutien
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              ENR COURTAGE ENERGIE propose une solution innovante, compacte et efficace pour renforcer localement le réseau électrique.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-gradient-to-br from-white to-gray-50 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
                        {solution.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {solution.title}
                        </h3>
                        <p className="text-gray-600">
                          {solution.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white shadow-xl"
          >
            <div className="flex items-center justify-center mb-4">
              <Battery className="h-12 w-12 mr-4" />
              <h3 className="text-2xl font-bold">Technologie de pointe</h3>
            </div>
            <p className="text-center text-lg text-green-50 leading-relaxed max-w-3xl mx-auto">
              Nos batteries utilisent des technologies avancées pour garantir une réponse rapide et efficace aux besoins du réseau, tout en minimisant l'impact environnemental et spatial de l'installation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Bénéfices Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100" aria-labelledby="benefices-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 id="benefices-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Bénéfices pour la collectivité
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Une solution qui profite à tous : habitants, entreprises et collectivités locales
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                      <p className="text-gray-700 leading-relaxed font-medium">
                        {benefit}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 bg-white rounded-xl p-8 shadow-lg"
          >
            <div className="flex items-center justify-center mb-4">
              <TrendingDown className="h-10 w-10 text-blue-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Impact économique</h3>
            </div>
            <p className="text-center text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              En évitant des investissements massifs dans la modernisation complète des infrastructures, les batteries de soutien réseau permettent des économies substantielles tout en garantissant un service de qualité.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Opportunité pour les propriétaires Section */}
      <section className="py-20 bg-white" aria-labelledby="opportunite-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 id="opportunite-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Une opportunité pour les propriétaires fonciers
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Transformez un petit espace inutilisé en source de revenus stable et contribuez à la transition énergétique de votre territoire
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-orange-900 flex items-center">
                    <Coins className="h-8 w-8 mr-3 text-orange-600" />
                    Le modèle économique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {ownerBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-blue-900 mb-3">Critères recherchés</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Terrain plat de 10-15m² minimum</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Proximité avec un transformateur électrique</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Accès routier pour installation et maintenance</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-green-900 mb-3">Vos avantages</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Revenus locatifs garantis et réguliers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Aucun investissement de votre part</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Contribution à la transition énergétique</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="py-20 bg-gray-50" aria-labelledby="carousel-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 id="carousel-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos installations en images
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Découvrez nos batteries de soutien réseau déployées dans différents contextes : agricole, industriel et mixte
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <BatterieCarousel />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800" aria-labelledby="cta-title">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 id="cta-title" className="text-3xl md:text-4xl font-bold text-white mb-6">
              Intéressé par notre solution ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Que vous soyez propriétaire foncier ou collectivité, contactez-nous pour étudier ensemble les opportunités de déploiement d'une batterie de soutien réseau sur votre territoire.
            </p>
            <Button
              onClick={scrollToContact}
              size="lg"
              className="bg-white text-blue-700 hover:bg-gray-100 font-bold text-lg px-10 py-6 shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Contactez-nous
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BatterieSection;