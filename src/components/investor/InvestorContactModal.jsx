import React, { useState } from 'react';
import { X, Send, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { useToast } from '../ui/use-toast';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mrblwazb';

export default function InvestorContactModal({ isOpen, onClose, initialSubject = '' }) {
  const { currentInvestor } = useInvestorStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: currentInvestor?.name || '',
    email: currentInvestor?.email || '',
    subject: initialSubject || "Demande d'information M&A — Portefeuilles PV & BESS",
    message: '',
    website: '', // honeypot
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.website) return; // bot
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('subject', formData.subject);
      fd.append('message', formData.message);
      fd.append('company', currentInvestor?.company || 'Investisseur');
      fd.append('_subject', `[M&A INVESTISSEURS] ${formData.subject} — ${formData.name} (${currentInvestor?.company || ''})`);

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: fd,
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'envoi du message.");
      }

      setIsSubmitted(true);

      toast({
        title: 'Votre message a bien été envoyé',
        description: 'Yann BARBERIS et notre équipe M&A vous répondront sous 24h.',
        className: 'bg-white text-gray-900 border border-emerald-500',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Échec de l’envoi',
        description: err.message || 'Veuillez réessayer plus tard.',
        className: 'bg-white text-gray-900 border border-red-500',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6">
        {/* Animated glowing halo backdrop matching website design */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-amber-400 to-indigo-600 rounded-[34px] blur-xl opacity-60 pointer-events-none" />

        {/* Modal Card */}
        <div className="relative bg-[#0a1628] rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl text-white">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
              Nous contacter
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              Une question ? Un projet solaire ? Notre équipe vous répond sous 24h.
            </p>
          </div>

          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Message transmis avec succès</h3>
              <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
                Votre demande a bien été transmise à Yann BARBERIS et au pôle M&A d'ENR COURTAGE. Nous reviendrons vers vous dans les plus brefs délais.
              </p>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg"
              >
                Fermer la fenêtre
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Honeypot anti-bot */}
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="hidden"
                tabIndex="-1"
                autoComplete="off"
              />

              {/* Row: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                    Votre Nom & Prénom
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-3 bg-[#0d1f38] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                    Votre Adresse Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jean.dupont@entreprise.fr"
                    className="w-full px-4 py-3 bg-[#0d1f38] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                  Sujet de votre demande
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Étude de portefeuille / Demande d'information / Proposition"
                  className="w-full px-4 py-3 bg-[#0d1f38] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                  Votre Message
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Décrivez votre demande, questions relatives aux dossiers, ou créneaux d'échange souhaités..."
                  className="w-full px-4 py-3 bg-[#0d1f38] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs leading-relaxed resize-none"
                />
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span>Envoi en cours...</span>
                  ) : (
                    <>
                      <span>Envoyer le message</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-[10px] text-gray-400">
                  Formulaire sécurisé • Vos échanges restent strictement confidentiels sous NDA.
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
