import React, { useRef, useState } from "react"
import { useToast } from "./ui/use-toast"

/**
 * Formulaire de contact ENR COURTAGE
 * - Envoi via Formspree (FormData)
 * - Toast (message bas droite) avec FOND BLANC pour succès et erreur
 * - Visuel aligné sur le site en ligne
 */

// ⚠️ Mets ici l’URL EXACTE affichée par Formspree (bouton "Copie").
// Exemple : https://formspree.io/f/mvgqjjqp
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mrblwazb"

export default function ContactForm() {
  const { toast } = useToast()
  const formRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    website: "" // honeypot anti-bot (doit rester vide)
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
      // FormData -> compat max avec Formspree
      const fd = new FormData()
      fd.append("name", formData.name)
      fd.append("email", formData.email)
      fd.append("phone", formData.phone)
      fd.append("company", formData.company)
      fd.append("message", formData.message)
      fd.append("_subject", "Contact via enr-courtage.fr")

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" }
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        // Message plus parlant dans le cas "Form not found" (404)
        const msg =
          data?.errors?.[0]?.message ||
          (res.status === 404
            ? "Formspree : Formulaire introuvable. Vérifie que l’URL/ID copié est exact et que le formulaire est actif."
            : "Erreur lors de l’envoi du message.")
        throw new Error(msg)
      }

      toast({
        title: "Votre message a bien été envoyé",
        description: "Nous vous recontacterons rapidement.",
        // Fond blanc demandé + bordure verte
        className: "bg-white text-gray-900 border border-green-400"
      })

      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
        website: ""
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Échec de l’envoi",
        description: err.message || "Veuillez réessayer plus tard.",
        // Fond blanc demandé + bordure rouge
        className: "bg-white text-gray-900 border border-red-400"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact-form" className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Titre / Sous-titre */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Contactez-nous
          </h2>
          <p className="mt-3 text-gray-600">
            Vous avez un projet ? Laissez-nous vos coordonnées et nous vous recontacterons
            pour étudier vos besoins.
          </p>
        </div>

        {/* Carte blanche */}
        <div className="mt-10 rounded-lg bg-white shadow-xl ring-1 ring-black/5">
          <div className="p-6 md:p-10">
            <h3 className="text-2xl font-semibold text-center text-gray-900">
              Demande d&apos;information
            </h3>

            <form ref={formRef} onSubmit={handleSubmit} className="mt-8 space-y-6">
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

              {/* Ligne 1 : Nom / Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="inline-flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5Zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5Z"/></svg>
                      Nom complet <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Votre nom complet"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="inline-flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6Zm-2 0-8 5-8-5h16Zm0 12H4V8l8 5 8-5v10Z"/></svg>
                      Email <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>
              </div>

              {/* Ligne 2 : Téléphone / Entreprise */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="inline-flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="m19.2 15.2-2.5-1c-.5-.2-1.1-.1-1.4.2l-1.2 1.2c-2.5-1.4-4.6-3.5-6-6l1.2-1.2c.3-.3.4-.9.2-1.4l-1-2.5c-.2-.5-.7-.8-1.3-.8H4.2c-.6 0-1.1.4-1.2.9-.2 1.1-.1 2.3.3 3.4 1.4 4.2 4.6 7.5 8.8 8.8 1.1.4 2.3.5 3.4.3.5-.1.9-.6.9-1.2v-2.5c0-.6-.3-1.1-.8-1.3Z"/></svg>
                      Téléphone
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="06 12 34 56 78"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="inline-flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21V3h18v18H3Zm2-2h14V5H5v14Zm2-2h10v-2H7v2Zm0-4H7v-2h10v2Zm0-4H7V7h10v2Z"/></svg>
                      Entreprise / Organisme
                    </span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    placeholder="Nom de votre entreprise"
                    value={formData.company}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Zm0 14H6l-2 2V4h16v12Z"/></svg>
                    Message <span className="text-red-500">*</span>
                  </span>
                </label>
                <textarea
                  name="message"
                  rows={6}
                  placeholder="Décrivez votre projet…"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                />
              </div>

              {/* Bouton bleu pleine largeur */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}