import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Users, Zap, TrendingUp, Shield, Home, Building, ShoppingCart, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HowItWorksSection from '@/components/HowItWorksSection';

const AutoconsommationSection = () => {
  const advantages = [
    { icon: <Users className="h-8 w-8 text-blue-600" />, title: "Mutualisation des coûts", description: "Partagez les investissements et réduisez vos coûts énergétiques" },
    { icon: <Zap className="h-8 w-8 text-green-600" />, title: "Énergie locale", description: "Consommez l'énergie produite localement et réduisez les pertes" },
    { icon: <TrendingUp className="h-8 w-8 text-purple-600" />, title: "Rentabilité optimisée", description: "Maximisez votre retour sur investissement énergétique" },
    { icon: <Shield className="h-8 w-8 text-orange-600" />, title: "Sécurité énergétique", description: "Garantissez votre approvisionnement énergétique durable" }
  ];

  const examples = [
    { icon: <Home className="h-10 w-10 text-blue-500" />, bgColor: 'bg-blue-100', title: 'Particulier', subtitle: 'Famille de 4 personnes', consumption: '4 500 kWh/an', savings: '~ 180 €', percentage: '~ 17 % d\'économies', btnColor: 'bg-gradient-to-r from-blue-400 to-cyan-400' },
    { icon: <Building className="h-10 w-10 text-purple-500" />, bgColor: 'bg-purple-100', title: 'Entreprise', subtitle: 'PME de 20 salariés', consumption: '25 000 kWh/an', savings: '~ 1000 €', percentage: '~ 17 % d\'économies', btnColor: 'bg-gradient-to-r from-purple-400 to-pink-400' },
    { icon: <ShoppingCart className="h-10 w-10 text-orange-500" />, bgColor: 'bg-orange-100', title: 'Commerce', subtitle: 'Boulangerie', consumption: '15 000 kWh/an', savings: '~ 600 €', percentage: '~ 17 % d\'économies', btnColor: 'bg-gradient-to-r from-orange-400 to-red-400' },
    { icon: <HeartPulse className="h-10 w-10 text-green-500" />, bgColor: 'bg-green-100', title: 'Établissement de santé', subtitle: 'EHPAD, clinique...', consumption: '180 000 kWh/an', savings: '~ 3600 €', percentage: '~ 10 % d\'économies', btnColor: 'bg-gradient-to-r from-green-400 to-emerald-400' }
  ];

  return (
    <div className="bg-gray-50">
      {/* Top Section with White Background */}
      <section className="py-20 bg-white" aria-labelledby="acc-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <h2 id="acc-title" className="text-4xl font-bold text-gray-900 mb-6">Autoconsommation Collective</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les avantages de l'autoconsommation collective (ACC) et rejoignez une communauté énergétique durable et économique.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <img
                className="w-full h-96 object-cover rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transform hover:scale-105 transition-transform duration-300"
                alt="Projet d'autoconsommation collective"
                src="https://images.unsplash.com/photo-1677938438353-3df2b797568a"
                width="1200" height="600" loading="lazy" decoding="async"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">Qu'est-ce que l'Autoconsommation Collective ?</h3>
              <p className="text-gray-600 leading-relaxed">
                L'autoconsommation collective permet à plusieurs consommateurs de partager l'électricité produite par une ou plusieurs installations de production d'énergies renouvelables. Elle optimise l'utilisation de l'énergie locale et réduit significativement les coûts.
              </p>
              <p className="text-gray-600 leading-relaxed">Un système gagnant-gagnant : le producteur valorise son énergie, le consommateur bénéficie d'une électricité verte et moins chère.</p>
              <div className="text-right">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-center"
                  onClick={() => window.open('https://mapartdesoleil.fr/', '_blank', 'noopener,noreferrer')}>
                  Découvrir les projets sur<br/>mapartdesoleil.fr
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Avantages Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-8">
            <h3 className="text-3xl font-semibold text-center text-gray-900 mb-12">Les avantages de l'ACC</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {advantages.map((advantage, index) => (
                <Card key={index} className="card-hover bg-white border-none shadow-lg">
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 bg-gray-50 p-4 rounded-full">{advantage.icon}</div>
                    <CardTitle className="text-lg text-gray-900">{advantage.title}</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-gray-600 text-center text-sm leading-relaxed">{advantage.description}</p></CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <HowItWorksSection />

      {/* Examples & CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900">Des exemples <span className="text-green-500">concrets</span></h3>
              <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Économies annuelles possibles en rejoignant une opération d'autoconsommation collective.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {examples.map((example, index) => (
                <Card key={index} className={`${example.bgColor} rounded-2xl shadow-lg border-0 overflow-hidden transform hover:-translate-y-2 transition-transform duration-300`}>
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-xl ${example.bgColor} shadow-inner`}>{example.icon}</div>
                      <span className="text-5xl font-bold text-gray-300/70">€</span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-xl font-bold text-gray-800">{example.title}</h4>
                      <p className="text-gray-600 text-sm">{example.subtitle}</p>
                    </div>
                    <div className="mt-6 space-y-3 text-sm">
                      <div className="flex justify-between items-center"><span className="text-gray-500">Consommation</span><span className="font-bold text-gray-700">{example.consumption}</span></div>
                      <div className="flex justify-between items-center"><span className="text-gray-500">Économie annuelle</span><span className="font-bold text-green-600">{example.savings}</span></div>
                    </div>
                    <div className="mt-auto pt-6">
                      <div className={`${example.btnColor} text-white text-center font-bold py-3 rounded-lg`}>{example.percentage}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="text-center bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-xl p-8 shadow-xl">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Prêt à rejoindre un projet d'autoconsommation collective ?</h3>
            <p className="text-gray-800 mb-6 text-lg">Découvrez nos projets en cours et adhérez à une communauté énergétique durable.</p>
            <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 font-bold px-8 py-6 text-lg"
              onClick={() => window.open('https://mapartdesoleil.fr/', '_blank', 'noopener,noreferrer')}>
              Voir les projets <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AutoconsommationSection;