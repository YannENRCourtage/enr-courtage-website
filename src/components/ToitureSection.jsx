import React from 'react';
import { motion } from 'framer-motion';
import { Home, Wrench, DollarSign, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ToitureSection = ({ scrollToContact }) => {
  const services = [
    { icon: <Wrench className="h-8 w-8 text-blue-600" />, title: "Rénovation complète", description: "Rénovation par du bac acier et feutre anti-condensation." },
    { icon: <Home className="h-8 w-8 text-green-600" />, title: "Location de toiture", description: "Mise à disposition de votre toiture pour installation photovoltaïque." },
    { icon: <DollarSign className="h-8 w-8 text-purple-600" />, title: "Revenus ou Soulte", description: "Générez des revenus locatifs ou recevez une soulte immédiate." },
    { icon: <UserCheck className="h-8 w-8 text-orange-600" />, title: "Pour tous", description: "Offre éligible pour les professionnels et les particuliers." }
  ];

  const processSteps = [
    { step: "1", title: "Évaluation", description: "Analyse technique de votre toiture et étude de faisabilité (dès 500m²)." },
    { step: "2", title: "Proposition", description: "Présentation du projet et des conditions de location ou de soulte." },
    { step: "3", title: "Rénovation", description: "Travaux de rénovation et installation des équipements solaires." },
    { step: "4", title: "Exploitation", description: "Mise en service et versement des revenus ou de la soulte." }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" aria-labelledby="toiture-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h1 id="toiture-title" className="text-4xl font-bold text-gray-900 mb-6">Rénovation & Location de Toitures</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Valorisez votre patrimoine immobilier en rénovant votre toiture existante et en la louant pour une installation photovoltaïque rentable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <img
              className="w-full h-96 object-cover rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transform hover:scale-105 transition-transform duration-300"
              alt="Rénovation de toiture avec panneaux solaires"
              src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/c38a3cd40e8c09ce942aec3828c3d28e.png"
              width="1200" height="600" loading="lazy" decoding="async"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Transformez votre toiture en source de revenus</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous prenons en charge la rénovation complète de votre toiture (dès 500m²) et vous proposons un contrat de location longue durée ou une soulte immédiate pour l'installation de panneaux photovoltaïques.
            </p>
            <Button size="lg" className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg" onClick={scrollToContact}>
              <span className="italic font-bold text-lg">"Combien vous rapporte votre toiture aujourd'hui ?"</span>
            </Button>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="card-hover bg-white">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">{service.icon}</div>
                <CardTitle className="text-lg">{service.title}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-gray-600 text-center">{service.description}</p></CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="mb-16">
          <h3 className="text-3xl font-semibold text-center text-gray-900 mb-12">Notre processus en 4 étapes</h3>
          <div className="relative">
            <div className="hidden md:flex absolute top-8 left-0 w-full h-0.5 bg-gray-300 -translate-y-1/2 items-center justify-between px-24"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg z-10">{step.step}</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ToitureSection;