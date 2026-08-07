import React from 'react';
import { motion } from 'framer-motion';
import { Building, CheckCircle, Truck, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ConstructionSection = () => {
  const services = [
    {
      icon: <Building className="h-8 w-8 text-blue-600" />,
      title: "Bâtiments neufs gratuits",
      description: "Des bâtiments de 1000m² à 3000m² pour votre activité professionnelle, sans aucun coût pour vous."
    },
    {
      icon: <Truck className="h-8 w-8 text-green-600" />,
      title: "Ombrières photovoltaïques",
      description: "Des ombrières neuves pour vos parkings, financées par la production d'énergie solaire."
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-600" />,
      title: "Tiers-financement",
      description: "Le projet est 100% gratuit pour vous, financé par un investisseur via la production d'électricité."
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-orange-600" />,
      title: "Clé en main",
      description: "Nous gérons tout : conception, permis de construire, construction et raccordement."
    }
  ];

  const advantages = [
    "Projet 100% gratuit pour vous",
    "Bâtiment neuf adapté à vos besoins",
    "Vous restez propriétaire du foncier",
    "Aucun investissement, aucun endettement",
    "Valorisation de votre foncier",
    "Offre réservée aux professionnels"
  ];

  const scrollToCatalogue = () => {
    const catalogueElement = document.getElementById('catalogue-title') || document.querySelector('section[aria-labelledby="catalogue-title"]');
    if (catalogueElement) {
      catalogueElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" aria-labelledby="construction-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 id="construction-title" className="text-4xl font-bold text-gray-900 mb-6">
            Bâtiments & Ombrières <span className="enr-gradient-text-gold">tiers financés</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Obtenez un bâtiment neuf ou une ombrière photovoltaïque 100% gratuit grâce au tiers-financement.
          </p>
        </motion.div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-gray-900">
              Une solution innovante pour les professionnels
            </h2>
            <p className="text-gray-600 leading-relaxed m-0">
              Un investisseur finance la construction de votre bâtiment en échange de l'exploitation de la toiture photovoltaïque. Vous disposez d'un bâtiment neuf adapté à vos besoins professionnels, sans aucun investissement ni endettement.
            </p>
            <div className="space-y-3 pt-0">
              {advantages.map((advantage, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{advantage}</span>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
                onClick={scrollToCatalogue}
              >
                <span className="italic font-bold text-lg">Voir notre catalogue</span>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <img
              className="w-full h-96 object-cover rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transform hover:scale-105 transition-transform duration-300"
              src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/c8083f1123229a9d1488c2bd2a6064da.jpg"
              alt="Bâtiment neuf et ombrière photovoltaïque"
              width="800"
              height="600"
              loading="eager"
              decoding="async"
            />
          </motion.div>
        </div>

        {/* Services Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, index) => (
            <Card key={index} className="card-hover bg-white">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  {service.icon}
                </div>
                <CardTitle className="text-lg">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ConstructionSection;