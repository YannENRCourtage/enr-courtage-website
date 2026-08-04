import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FranceMap from '@/components/FranceMap';

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);

  const testimonials = [
    { name: "Michel B.", company: "Exploitation Agricole", rating: 5, text: "Excellent accompagnement pour notre projet d'autoconsommation collective. L'équipe d'ENR COURTAGE a su nous guider à chaque étape avec professionnalisme." },
    { name: "Sophie L.", company: "Directrice d'entreprise", rating: 5, text: "Grâce à ENR COURTAGE, nous avons obtenu notre nouveau bâtiment 100% gratuit avec installation photovoltaïque. Un service remarquable et une solution parfaite pour notre activité." },
    { name: "Pierre D.", company: "Propriétaire immobilier", rating: 5, text: "La location de notre toiture nous génère des revenus réguliers tout en contribuant à la transition énergétique. Une solution gagnant-gagnant parfaitement orchestrée." },
    { name: "Marie C.", company: "Responsable technique", rating: 5, text: "Projet d'ombrière photovoltaïque réalisé dans les délais avec une qualité irréprochable. L'équipe technique est très compétente et à l'écoute." },
    { name: "Jean-Paul M.", company: "Gérant de société", rating: 5, text: "ENR COURTAGE nous a permis de réduire significativement nos coûts énergétiques grâce à leur expertise en autoconsommation collective. Très satisfait du résultat." },
    { name: "Isabelle R.", company: "Propriétaire foncier", rating: 5, text: "Service client exceptionnel et suivi personnalisé tout au long du projet. La rénovation de notre toiture a été parfaitement exécutée." }
  ];

  const nextTestimonial = () => setCurrentIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));
  const prevTestimonial = () => setCurrentIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));

  useEffect(() => {
    timerRef.current = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const pause = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resume = () => { timerRef.current = setInterval(nextTestimonial, 5000); };

  return (
    <section className="py-20 bg-gray-900/90 text-white backdrop-blur-sm" aria-labelledby="temoignages-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h2 id="temoignages-title" className="text-3xl font-bold mb-4">Témoignages clients</h2>
          <p className="text-gray-300 mb-2">Découvrez ce que nos clients pensent de nos services</p>
          <p className="text-xl font-semibold text-blue-400">Déjà plus de 700 projets accompagnés !</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Carousel */}
          <div className="flex flex-col">
            <div className="relative h-80 overflow-hidden" onMouseEnter={pause} onMouseLeave={resume}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center"
                  aria-live="polite"
                >
                  <article className="testimonial-card bg-white text-gray-900 rounded-xl p-8 w-full max-w-lg mx-auto shadow-lg border border-gray-200">
                    <div className="text-center">
                      <Quote className="h-8 w-8 text-yellow-400 mx-auto mb-4" aria-hidden="true" />
                      <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6 italic">"{testimonials[currentIndex].text}"</p>
                      <div className="flex justify-center mb-4" aria-label={`${testimonials[currentIndex].rating} étoiles`}>
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" aria-hidden="true" />
                        ))}
                      </div>
                      <footer>
                        <p className="font-semibold text-gray-900">{testimonials[currentIndex].name}</p>
                        <p className="text-gray-500 text-sm">{testimonials[currentIndex].company}</p>
                      </footer>
                    </div>
                  </article>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center items-center space-x-4 mt-8" role="group" aria-label="Navigation des témoignages">
              <Button variant="outline" size="icon" onClick={prevTestimonial} className="rounded-full bg-gray-700 border-gray-600 hover:bg-gray-600 text-white" aria-label="Témoignage précédent">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${index === currentIndex ? 'bg-yellow-400' : 'bg-gray-500'}`}
                  aria-label={`Aller au témoignage ${index + 1}`}
                  aria-current={index === currentIndex ? 'true' : undefined}
                />
              ))}
              <Button variant="outline" size="icon" onClick={nextTestimonial} className="rounded-full bg-gray-700 border-gray-600 hover:bg-gray-600 text-white" aria-label="Témoignage suivant">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Column: France Map */}
          <div className="flex justify-center h-full min-h-[400px]">
            <FranceMap />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;