import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Home, Landmark, Tractor, CheckCircle, FileText, TrendingUp, Award, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CertificatesSection = () => {
  const beneficiaries = [
    {
      icon: <Building2 className="h-12 w-12 text-white" />,
      title: "Entreprises & Industries",
      description: "Optimisez vos investissements énergétiques et réduisez vos coûts opérationnels",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-700",
      borderColor: "border-blue-500"
    },
    {
      icon: <Home className="h-12 w-12 text-white" />,
      title: "Bailleurs & Copropriétés",
      description: "Valorisez vos travaux de rénovation énergétique et améliorez le confort de vos logements",
      bgColor: "bg-gradient-to-br from-green-500 to-green-700",
      borderColor: "border-green-500"
    },
    {
      icon: <Landmark className="h-12 w-12 text-white" />,
      title: "Collectivités & Tertiaire",
      description: "Financez vos projets de transition énergétique et atteignez vos objectifs environnementaux",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-700",
      borderColor: "border-purple-500"
    },
    {
      icon: <Tractor className="h-12 w-12 text-white" />,
      title: "Agriculture & Artisanat",
      description: "Bénéficiez d'aides pour moderniser vos équipements et réduire votre facture énergétique",
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-700",
      borderColor: "border-orange-500"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Analyse de votre projet",
      description: "Étude approfondie de vos besoins et de l'éligibilité de vos travaux au dispositif CEE"
    },
    {
      number: "2",
      title: "Montage du dossier",
      description: "Constitution complète de votre dossier administratif et technique pour maximiser vos aides"
    },
    {
      number: "3",
      title: "Négociation des primes",
      description: "Mise en concurrence des obligés pour obtenir les meilleures valorisations de vos certificats"
    },
    {
      number: "4",
      title: "Versement des aides",
      description: "Suivi jusqu'au versement effectif des primes CEE sur votre compte"
    }
  ];

  const valorisationExamples = [
    {
      title: "Isolation des combles",
      surface: "200 m²",
      prime: "2 400 € à 3 200 €"
    },
    {
      title: "Chaudière biomasse",
      power: "50 kW",
      prime: "8 000 € à 12 000 €"
    },
    {
      title: "Éclairage LED",
      quantity: "100 luminaires",
      prime: "1 500 € à 2 500 €"
    },
    {
      title: "Pompe à chaleur",
      power: "30 kW",
      prime: "4 000 € à 6 000 €"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-white" aria-labelledby="cee-hero-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h1 id="cee-hero-title" className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Certificats d'Économie d'Énergie
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Le dispositif des Certificats d'Économie d'Énergie (CEE) est un mécanisme de financement qui permet aux entreprises et particuliers réalisant des travaux d'efficacité énergétique d'obtenir des primes financières. ENR COURTAGE vous accompagne gratuitement pour valoriser vos opérations et maximiser vos aides.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-center w-full sm:w-auto uppercase tracking-wider"
                  onClick={() => window.open('https://enr-courtage-energie.fr/', '_blank', 'noopener,noreferrer')}
                >
                  en savoir plus
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <img
                className="w-full h-[400px] lg:h-[500px] object-cover rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
                src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/d51c3accbfab9910f7c6f4fc3ac13be2.jpg"
                alt="Rayons de supermarché illustrant l'efficacité énergétique"
                width="800"
                height="600"
                loading="eager"
                decoding="async"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Qui peut en bénéficier Section */}
      <section className="py-20 bg-gray-50" aria-labelledby="beneficiaries-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 id="beneficiaries-title" className="text-4xl font-bold text-gray-900 mb-4">
              Qui peut en bénéficier ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Les Certificats d'Économie d'Énergie s'adressent à tous les acteurs souhaitant réaliser des économies d'énergie
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {beneficiaries.map((beneficiary, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className={`h-full border-2 ${beneficiary.borderColor} overflow-hidden transform hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl`}>
                  <div className={`${beneficiary.bgColor} p-6`}>
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {beneficiary.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white">
                        {beneficiary.title}
                      </h3>
                    </div>
                  </div>
                  <CardContent className="p-6 bg-white">
                    <p className="text-gray-700 leading-relaxed">
                      {beneficiary.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre accompagnement Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-green-100" aria-labelledby="accompaniment-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 id="accompaniment-title" className="text-4xl font-bold text-gray-900 mb-4">
              Notre accompagnement
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Un service clé en main pour valoriser au mieux vos Certificats d'Économie d'Énergie
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <Card className="h-full bg-white border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-3xl font-bold text-white">{step.number}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-0.5 bg-green-400"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Obligé & Mandataire CEE Section */}
      <section className="py-20 bg-white" aria-labelledby="oblige-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-8 rounded-2xl shadow-xl">
                <Award className="h-40 w-40 text-green-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 id="oblige-title" className="text-3xl font-bold text-gray-900 mb-6">
                Obligé & Mandataire CEE
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  <strong className="text-green-700">Les obligés</strong> sont les fournisseurs d'énergie (électricité, gaz, fioul, carburants) 
                  qui doivent promouvoir l'efficacité énergétique auprès de leurs clients. Ils sont tenus par la loi d'obtenir 
                  des Certificats d'Économie d'Énergie.
                </p>
                <p>
                  <strong className="text-green-700">ENR COURTAGE</strong>, en tant que mandataire CEE, agit comme intermédiaire 
                  entre vous et les obligés. Nous négocions les meilleures primes pour vos travaux d'économies d'énergie en 
                  mettant en concurrence plusieurs obligés.
                </p>
                <p>
                  Notre rôle est de <strong>maximiser la valorisation de vos certificats</strong> tout en vous déchargeant 
                  de toutes les démarches administratives. Notre accompagnement est <strong className="text-green-700">100% gratuit et</strong> sans engagement.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Qu'est-ce que le dispositif CEE Section */}
      <section className="py-20 bg-gray-50" aria-labelledby="device-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 id="device-title" className="text-4xl font-bold text-gray-900 mb-6">
              Qu'est-ce que le dispositif CEE ?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Le dispositif des Certificats d'Économie d'Énergie (CEE) est un mécanisme national qui oblige 
              les fournisseurs d'énergie à promouvoir l'efficacité énergétique auprès de leurs clients.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full bg-white shadow-lg border-2 border-green-200">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600 mr-4" />
                    <h3 className="text-2xl font-bold text-gray-900">Principe du dispositif</h3>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      Les fournisseurs d'énergie (obligés) doivent inciter leurs clients à réaliser des économies d'énergie. 
                      Pour cela, ils achètent des Certificats d'Économie d'Énergie générés par des travaux d'amélioration énergétique.
                    </p>
                    <p>
                      En contrepartie, ils versent des <strong className="text-green-700">primes CEE</strong> qui permettent 
                      de financer une partie significative de vos travaux de rénovation énergétique.
                    </p>
                    <p>
                      Ce système gagnant-gagnant permet de <strong>réduire la consommation énergétique nationale</strong> tout 
                      en rendant les travaux d'efficacité énergétique plus accessibles financièrement.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full bg-gradient-to-br from-green-600 to-green-800 text-white shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <FileText className="h-10 w-10 text-white mr-4" />
                    <h3 className="text-2xl font-bold">Travaux éligibles</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Isolation thermique (combles, murs, planchers)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Systèmes de chauffage performants (pompes à chaleur, chaudières biomasse)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Éclairage LED et systèmes de régulation</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Ventilation double flux et récupération de chaleur</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Optimisation des process industriels</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                      <span>Installation photovoltaïque avec autoconsommation</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Valorisation Examples */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Exemples de valorisation CEE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {valorisationExamples.map((example, index) => (
                <Card key={index} className="bg-white border-2 border-green-200 hover:border-green-400 transition-all duration-300 shadow-md hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center mb-4">
                      <TrendingUp className="h-12 w-12 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 text-center mb-2">
                      {example.title}
                    </h4>
                    <p className="text-gray-600 text-center mb-3 text-sm">
                      {example.surface || example.power || example.quantity}
                    </p>
                    <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-3">
                      <p className="text-green-800 font-bold text-center text-lg">
                        {example.prime}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-gray-600 mt-8 italic">
              * Montants indicatifs variables selon les caractéristiques du projet et les conditions du marché CEE
            </p>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-12 text-center shadow-2xl mb-12"
          >
            <h3 className="text-3xl font-bold text-white mb-4">
              Prêt à valoriser vos travaux d'économies d'énergie ?
            </h3>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Contactez-nous dès aujourd'hui pour une estimation gratuite de vos primes CEE
            </p>
            <Button 
              size="lg" 
              className="bg-white text-green-700 hover:bg-gray-100 font-bold text-lg px-8 py-6 shadow-xl transform hover:scale-105 transition-all duration-300"
              onClick={() => window.open('https://enr-courtage-energie.fr/', '_blank', 'noopener,noreferrer')}
            >
              Demander mon estimation
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CertificatesSection;