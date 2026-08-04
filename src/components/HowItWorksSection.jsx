import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Building2, Home, CheckCircle2, Unlock, FileX, Users } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <Sun className="h-10 w-10 text-white" />,
      title: "Producteur",
      description: "Centrale solaire photovoltaïque qui produit de l'électricité verte",
      advantage: "Production locale d'énergie renouvelable",
      bgColor: "bg-orange-500",
      shadowColor: "shadow-orange-200"
    },
    {
      icon: <Building2 className="h-10 w-10 text-white" />,
      title: "PMO",
      description: "Personne Morale Organisatrice Association qui gère et répartit l'énergie",
      advantage: "Gestion transparente et bénéfique pour tous",
      bgColor: "bg-blue-500",
      shadowColor: "shadow-blue-200"
    },
    {
      icon: <Home className="h-10 w-10 text-white" />,
      title: "Consommateurs",
      description: "Particuliers et entreprises qui bénéficient d'une électricité moins chère",
      advantage: "Jusqu'à 40% d'économies sur la facture",
      bgColor: "bg-green-500",
      shadowColor: "shadow-green-200"
    }
  ];

  const features = [
    { icon: <CheckCircle2 className="h-6 w-6 text-green-600" />, text: "Adhésion gratuite" },
    { icon: <Unlock className="h-6 w-6 text-blue-600" />, text: "Sans engagement" },
    { icon: <FileX className="h-6 w-6 text-orange-600" />, text: "Sans abonnement" },
    { icon: <Users className="h-6 w-6 text-purple-600" />, text: "Modèle Associatif" }
  ];

  return (
    <section className="py-20 bg-white" aria-labelledby="how-it-works-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="how-it-works-title" className="text-4xl font-bold text-gray-900 mb-6">
            Comment ça fonctionne ?
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Un dispositif encadré par la loi qui permet à des consommateurs proches d'une installation solaire de partager l'électricité produite — et d'économiser sur chaque facture.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-1 bg-gradient-to-r from-orange-200 via-blue-200 to-green-200 z-0"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className={`w-24 h-24 rounded-full ${step.bgColor} ${step.shadowColor} shadow-xl flex items-center justify-center mb-6 transform hover:scale-110 transition-transform duration-300`}>
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600 mb-4 h-20">{step.description}</p>
              <div className={`bg-${step.bgColor.split('-')[1]}-50 px-4 py-2 rounded-full border border-${step.bgColor.split('-')[1]}-200`}>
                <span className={`text-sm font-semibold text-${step.bgColor.split('-')[1]}-700`}>
                  {step.advantage}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6 md:gap-12 pt-8 border-t border-gray-100"
        >
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 bg-gray-50 px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-shadow duration-300">
              {feature.icon}
              <span className="font-semibold text-gray-800">{feature.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;