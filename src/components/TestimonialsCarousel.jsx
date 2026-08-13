import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);

  const testimonials = [
    {
      name: "Jean-Paul M.",
      company: "Gérant de société",
      rating: 5,
      text: "*ENR COURTAGE nous a permis de réduire significativement nos coûts énergétiques grâce à leur expertise en autoconsommation collective. Très satisfait du résultat.*"
    },
    {
      name: "Michel B.",
      company: "Exploitation Agricole",
      rating: 5,
      text: "*Excellent accompagnement pour notre projet d'autoconsommation collective. L'équipe d'ENR COURTAGE a su nous guider à chaque étape avec un grand professionnalisme.*"
    },
    {
      name: "Sophie L.",
      company: "Directrice d'entreprise",
      rating: 5,
      text: "*Grâce à ENR COURTAGE, nous avons obtenu notre nouveau bâtiment 100% gratuit avec installation photovoltaïque. Un service remarquable et une solution parfaite pour notre activité.*"
    },
    {
      name: "Pierre D.",
      company: "Propriétaire immobilier",
      rating: 5,
      text: "*La mise à disposition de notre terrain nous génère une rente annuelle garantie sans aucun frais de notre part. Une opportunité exceptionnelle parfaitement encadrée.*"
    }
  ];

  const nextTestimonial = () => setCurrentIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));
  const prevTestimonial = () => setCurrentIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));

  useEffect(() => {
    timerRef.current = setInterval(nextTestimonial, 6000);
    return () => clearInterval(timerRef.current);
  }, []);

  const pause = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resume = () => { timerRef.current = setInterval(nextTestimonial, 6000); };

  const activeTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 bg-[#070b12] text-white border-t border-white/5 relative overflow-hidden" aria-labelledby="temoignages-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.7 }} 
          className="text-center mb-14"
        >
          <h2 id="temoignages-title" className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Ils nous font confiance
          </h2>
          <p className="text-gray-300 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Découvrez ce que nos clients pensent de nos services.<br />
            <span className="text-blue-400 font-bold">Déjà plus de 700 projets accompagnés !</span>
          </p>
        </motion.div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Left Column: White Card with Tablet Map Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white text-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between items-center text-center border border-gray-100"
          >
            <div className="w-full">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Nos réalisations en France *
              </h3>
              
              <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 w-full flex items-center justify-center">
                <img
                  src="/Réalisations.png"
                  alt="Nos réalisations en France sur tablette"
                  className="w-full h-auto max-h-[380px] object-contain rounded-xl shadow-sm"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <p className="text-xs text-gray-400 italic mt-6">
              * carte extraite de notre logiciel de gestion
            </p>
          </motion.div>

          {/* Right Column: Dark Testimonial Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-[#0a1628] rounded-3xl p-8 sm:p-10 shadow-2xl text-white flex flex-col justify-between border border-white/10 relative overflow-hidden"
            onMouseEnter={pause}
            onMouseLeave={resume}
          >
            <div>
              <Quote className="w-12 h-12 text-amber-400 mb-6 flex-shrink-0" aria-hidden="true" />
              
              <div className="min-h-[160px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="text-lg sm:text-xl text-gray-200 italic leading-relaxed"
                  >
                    {activeTestimonial.text}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Stars & Author */}
              <div className="mt-6">
                <div className="flex space-x-1 text-amber-400 mb-3" aria-label={`${activeTestimonial.rating} étoiles sur 5`}>
                  {[...Array(activeTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>

                <div className="font-bold text-white text-xl">
                  {activeTestimonial.name}
                </div>
                <div className="text-gray-400 text-sm font-medium">
                  {activeTestimonial.company}
                </div>
              </div>
            </div>

            {/* Bottom Dots & Controls */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center space-x-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`transition-all duration-300 rounded-full ${
                      idx === currentIndex ? 'w-8 h-2 bg-amber-400' : 'w-2 h-2 bg-gray-600 hover:bg-gray-400'
                    }`}
                    aria-label={`Aller au témoignage ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={prevTestimonial}
                  className="p-2.5 rounded-full border border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-white transition-colors"
                  aria-label="Témoignage précédent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="p-2.5 rounded-full border border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-white transition-colors"
                  aria-label="Témoignage suivant"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </motion.div>

        </div>

        {/* Google 4.9/5 Rating Recap Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-6 py-3 rounded-full text-sm font-semibold text-gray-200 shadow-lg">
            <div className="flex text-amber-400 space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span>Google 4.9/5 — Plus de 700 clients satisfaits & projets accompagnés</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default TestimonialsCarousel;