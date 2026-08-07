import React from 'react';
import { motion } from 'framer-motion';
import { Building, CheckCircle, Truck, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  return (
    <div className="bg-white">
      {/* Hero Section avec vidéo "6.mp4" sous-imposée */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-24 overflow-hidden bg-[#0f2847]" aria-labelledby="construction-title">
        {/* Vidéo 6.mp4 en arrière-plan avec sous-imposition légère */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-65 scale-105"
            src="/6.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f2847]/50 via-[#0f2847]/40 to-[#0f2847]/65" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto container-padding">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 id="construction-title" className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Bâtiments & Ombrières <span className="enr-gradient-text-gold">tiers financés</span>
            </h1>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto font-light leading-relaxed">
              Obtenez un bâtiment neuf ou une ombrière photovoltaïque 100% gratuit grâce au tiers-financement.
            </p>
          </motion.div>

          {/* Main Content - Two Column Layout avec sous-imposition vidéo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6 text-white"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Une solution innovante pour les professionnels
              </h2>
              <p className="text-gray-200 leading-relaxed text-base">
                Un investisseur finance la construction de votre bâtiment en échange de l'exploitation de la toiture photovoltaïque. Vous disposez d'un bâtiment neuf adapté à vos besoins professionnels, sans aucun investissement ni endettement.
              </p>
              <div className="space-y-3 pt-2">
                {advantages.map((advantage, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-[#84cc16] flex-shrink-0" />
                    <span className="text-gray-100 font-medium">{advantage}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <img
                className="w-full h-96 object-cover rounded-2xl shadow-2xl border border-white/10 transform hover:scale-[1.02] transition-transform duration-300"
                src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/c8083f1123229a9d1488c2bd2a6064da.jpg"
                alt="Bâtiment neuf et ombrière photovoltaïque"
                width="800"
                height="600"
                loading="eager"
                decoding="async"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Cards Section */}
      <section className="py-16 md:py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {services.map((service, index) => (
              <Card key={index} className="card-hover bg-white border border-gray-100 shadow-md">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="text-lg text-[#0f2847] font-bold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ConstructionSection;