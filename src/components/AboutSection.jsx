import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Award, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AboutSection = () => {
  const values = [
    { icon: <Target className="h-8 w-8 text-blue-600" />, title: "Excellence", description: "Nous visons l'excellence dans chaque projet pour garantir votre satisfaction" },
    { icon: <Users className="h-8 w-8 text-green-600" />, title: "Partenariat", description: "Nous construisons des relations durables basées sur la confiance mutuelle" },
    { icon: <Lightbulb className="h-8 w-8 text-purple-600" />, title: "Innovation", description: "Nous adoptons les dernières technologies pour des solutions énergétiques avancées" },
    { icon: <Award className="h-8 w-8 text-orange-600" />, title: "Qualité", description: "Nous garantissons la qualité de nos installations et de notre service" }
  ];

  return (
    <section className="py-20 bg-white" aria-labelledby="about-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h1 id="about-title" className="text-4xl font-bold text-gray-900 mb-6">À propos d'ENR COURTAGE</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Votre partenaire de confiance pour tous vos projets d'énergies renouvelables. Découvrez notre expertise et notre engagement pour un avenir énergétique durable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Qui sommes-nous ?</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              ENR COURTAGE est une entreprise spécialisée dans le courtage et le tiers-financement de projets d'énergies renouvelables. Nous accompagnons particuliers, professionnels, entreprises et collectivités dans la réalisation de leurs projets énergétiques durables.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Notre expertise couvre l'autoconsommation collective, la construction de bâtiments neufs avec solutions énergétiques intégrées, ainsi que la rénovation et la location de toitures pour installations photovoltaïques.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
            <img
              className="w-full h-auto object-contain rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transform hover:scale-105 transition-transform duration-300"
              alt="ENR COURTAGE interview sur BFM Business"
              src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/581d6bea42c149d0e59bf349f237167d.png"
              width="1280"
              height="720"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mb-16">
          <h3 className="text-3xl font-semibold text-center text-gray-900 mb-12">Nos valeurs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="card-hover bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">{value.icon}</div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-gray-600 text-center">{value.description}</p></CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="text-center bg-gradient-to-br from-blue-100 to-sky-200 rounded-xl p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Notre mission</h3>
          <p className="text-gray-600 text-lg max-w-4xl mx-auto">
            Faciliter la transition énergétique en rendant le solaire accessible à tous.<br className="hidden sm:block" /> 
            Notre objectif : une production d'énergie propre au service du plus grand nombre.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;