import React, { useRef, useState } from "react"
import { useToast } from "./ui/use-toast"
import { Send, Phone, PhoneCall } from "lucide-react"

/**
 * Formulaire de contact ENR COURTAGE - Style Dark "Nous contacter"
 * - Envoi via Formspree (FormData)
 * - Toast (message bas droite) avec FOND BLANC pour succès et erreur
 * - Section dark 'Nous contacter' avec rappel téléphonique
 */

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mrblwazb"

export default function ContactForm() {
  const { toast } = useToast()
  const formRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingCallback, setIsSubmittingCallback] = useState(false)
  const [callbackPhone, setCallbackPhone] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "" // honeypot anti-bot
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.website) return // honeypot
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const fd = new FormData()
      fd.append("name", formData.name)
      fd.append("email", formData.email)
      fd.append("subject", formData.subject)
      fd.append("message", formData.message)
      fd.append("_subject", "Contact via enr-courtage.fr - " + (formData.subject || "Demande de contact"))

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" }
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg =
          data?.errors?.[0]?.message ||
          (res.status === 404
            ? "Formspree : Formulaire introuvable."
            : "Erreur lors de l’envoi du message.")
        throw new Error(msg)
      }

      toast({
        title: "Votre message a bien été envoyé",
        description: "Notre équipe vous répondra sous 24h.",
        className: "bg-white text-gray-900 border border-green-400"
      })

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        website: ""
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Échec de l’envoi",
        description: err.message || "Veuillez réessayer plus tard.",
        className: "bg-white text-gray-900 border border-red-400"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCallbackSubmit = async (e) => {
    e.preventDefault()
    if (!callbackPhone || callbackPhone.trim().length < 6) {
      toast({
        variant: "destructive",
        title: "Numéro invalide",
        description: "Veuillez entrer un numéro de téléphone valide.",
        className: "bg-white text-gray-900 border border-red-400"
      })
      return
    }

    if (isSubmittingCallback) return
    setIsSubmittingCallback(true)

    try {
      const fd = new FormData()
      fd.append("phone", callbackPhone)
      fd.append("_subject", "Demande de rappel téléphonique via enr-courtage.fr")

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" }
      })

      if (!res.ok) throw new Error("Erreur lors de la demande de rappel.")

      toast({
        title: "Demande de rappel enregistrée",
        description: `Notre équipe vous rappellera très rapidement au ${callbackPhone}.`,
        className: "bg-white text-gray-900 border border-green-400"
      })

      setCallbackPhone("")
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Échec de la demande",
        description: err.message || "Veuillez réessayer plus tard.",
        className: "bg-white text-gray-900 border border-red-400"
      })
    } finally {
      setIsSubmittingCallback(false)
    }
  }

  return (
    <section id="contact-form" data-contact-form className="py-16 bg-[#070b12] text-white">
      <div className="max-w-4xl mx-auto px-4 relative group">
        {/* Animated colorful glowing halo backdrop */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-amber-400 to-indigo-600 rounded-[34px] blur-xl opacity-60 group-hover:opacity-100 group-hover:blur-2xl transition-all duration-500 group-hover:scale-[1.02] animate-pulse pointer-events-none" />

        <div className="relative bg-[#0a1628] rounded-3xl p-8 sm:p-12 border border-white/15 shadow-2xl transition-all duration-500 group-hover:border-amber-400/50 group-hover:shadow-[0_0_50px_rgba(245,158,11,0.25)] group-hover:-translate-y-1">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
              Nous contacter
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Une question ? Un projet solaire ? Notre équipe vous répond sous 24h.
            </p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot caché */}
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="hidden"
              tabIndex="-1"
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Votre nom &amp; prénom
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', backgroundColor: '#070d18', colorScheme: 'dark' }}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#070d18] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Votre adresse email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jean.dupont@entreprise.fr"
                  style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', backgroundColor: '#070d18', colorScheme: 'dark' }}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#070d18] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Sujet de votre demande
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Étude de toiture / Autoconsommation / Batterie"
                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', backgroundColor: '#070d18', colorScheme: 'dark' }}
                className="w-full px-4 py-3.5 rounded-xl bg-[#070d18] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Votre message
              </label>
              <textarea
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Décrivez votre bâtiment, adresse ou terrain..."
                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', backgroundColor: '#070d18', colorScheme: 'dark' }}
                className="w-full px-4 py-3.5 rounded-xl bg-[#070d18] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? "Envoi en cours..." : "Envoyer le message"}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Rappel téléphonique */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-md">
            <div className="flex items-center space-x-3 text-sm w-full sm:w-auto flex-1">
              <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <input
                type="tel"
                value={callbackPhone}
                onChange={(e) => setCallbackPhone(e.target.value)}
                placeholder="Laissez votre numéro pour être rappelé..."
                style={{ color: '#0f2847', WebkitTextFillColor: '#0f2847', backgroundColor: '#ffffff', colorScheme: 'light' }}
                className="bg-white border-none text-[#0f2847] text-sm placeholder-gray-500 focus:outline-none w-full font-medium"
              />
            </div>
            <button
              type="button"
              onClick={handleCallbackSubmit}
              disabled={isSubmittingCallback}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all flex items-center justify-center space-x-2 flex-shrink-0 shadow-md disabled:opacity-50"
            >
              <PhoneCall className="w-4 h-4 text-white" />
              <span>{isSubmittingCallback ? "Rappel en cours..." : "Rappeler"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}