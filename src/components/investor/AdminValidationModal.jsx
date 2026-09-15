import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Copy,
  Mail,
  FileText,
  Building,
  User,
  Phone,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useInvestorStore, generateRandomPassword } from '@/stores/useInvestorStore';

export default function AdminValidationModal({ isOpen, onClose }) {
  const { investors, adminValidateInvestor, adminRejectInvestor, offers } = useInvestorStore();

  const [selectedInvestorForNda, setSelectedInvestorForNda] = useState(null);
  const [validatedData, setValidatedData] = useState(null); // { investor, password, emailSubject, emailBody }
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'offers' | 'active'

  if (!isOpen) return null;

  const pendingInvestors = investors.filter((inv) => inv.status === 'pending');
  const activeInvestors = investors.filter((inv) => inv.status === 'active' && !inv.isAdmin);

  const handleValidate = (inv) => {
    const randomPass = generateRandomPassword();
    const result = adminValidateInvestor(inv.id, randomPass);
    if (result.success) {
      setValidatedData(result);
    }
  };

  const handleReject = (inv) => {
    if (window.confirm(`Êtes-vous sûr de vouloir refuser la demande de ${inv.company} (${inv.name}) ?`)) {
      adminRejectInvestor(inv.id);
    }
  };

  const handleCopyEmail = () => {
    if (!validatedData) return;
    navigator.clipboard.writeText(validatedData.emailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                Administration ENR Courtage
              </span>
              <h3 className="text-xl font-black text-white">
                Validation des Accès Investisseurs & NDA
              </h3>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center space-x-1.5 bg-gray-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => {
                setValidatedData(null);
                setActiveTab('requests');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>À Valider ({pendingInvestors.length})</span>
            </button>

            <button
              onClick={() => {
                setValidatedData(null);
                setActiveTab('offers');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'offers'
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Offres Reçues ({offers.length})</span>
            </button>

            <button
              onClick={() => {
                setValidatedData(null);
                setActiveTab('active');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'active'
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Investisseurs Actifs ({activeInvestors.length})</span>
            </button>
          </div>
        </div>

        {/* Screen: Validated Email Result */}
        {validatedData ? (
          <div className="space-y-4 bg-gray-800/40 border border-emerald-500/40 rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  Accès Validé & NDA Contre-signé pour {validatedData.investor.company}
                </span>
              </div>
              <span className="text-xs font-mono text-gray-400">
                Mot de passe généré : <strong className="text-amber-400">{validatedData.password}</strong>
              </span>
            </div>

            <p className="text-xs text-gray-300">
              Le NDA bilatéral a été estampillé de votre contre-signature (Yann BARBERIS). Transmettez le mail type ci-dessous à l'investisseur pour lui donner ses accès :
            </p>

            {/* Email preview */}
            <div className="relative">
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 font-mono text-xs text-gray-200 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto">
                <div className="text-gray-500 font-bold border-b border-gray-800 pb-2 mb-2">
                  Destinataire : {validatedData.investor.email}<br />
                  Objet : {validatedData.emailSubject}
                </div>
                {validatedData.emailBody}
              </div>

              <button
                onClick={handleCopyEmail}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm border border-gray-700"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>{copied ? 'Copié !' : 'Copier l\'e-mail'}</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <a
                href={`mailto:${validatedData.investor.email}?subject=${encodeURIComponent(
                  validatedData.emailSubject
                )}&body=${encodeURIComponent(validatedData.emailBody)}`}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Mail className="w-4 h-4" />
                <span>Ouvrir dans mon logiciel de messagerie</span>
              </a>

              <button
                onClick={() => setValidatedData(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold"
              >
                Retour à la liste des demandes
              </button>
            </div>
          </div>
        ) : activeTab === 'requests' ? (
          /* TAB 1: PENDING REQUESTS */
          <div className="space-y-4">
            {pendingInvestors.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs bg-gray-800/20 rounded-xl border border-gray-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                <span>Aucune demande en attente de validation. Toutes les inscriptions ont été traitées.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingInvestors.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/80 hover:border-amber-500/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{inv.company}</span>
                        {inv.legalForm && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                            {inv.legalForm}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          NDA signé par l'investisseur
                        </span>
                      </div>

                      <div className="text-xs text-gray-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {inv.name} ({inv.role})
                        </span>
                        <span className="flex items-center gap-1 font-mono text-amber-400">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {inv.email}
                        </span>
                        {inv.phone && (
                          <span className="flex items-center gap-1 text-gray-400">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {inv.phone}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-gray-500">
                        Siège : {inv.headOffice} • RCS : {inv.rcsNumber} ({inv.rcsCity})
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => setSelectedInvestorForNda(inv)}
                        className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-600 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Lire le NDA</span>
                      </button>

                      <button
                        onClick={() => handleValidate(inv)}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Valider & Contre-signer</span>
                      </button>

                      <button
                        onClick={() => handleReject(inv)}
                        className="px-2.5 py-2 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-700 text-xs transition"
                        title="Refuser la demande"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'offers' ? (
          /* TAB 2: OFFERS RECEIVED */
          <div className="space-y-4">
            {offers.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs bg-gray-800/20 rounded-xl border border-gray-800">
                Aucune offre reçue pour le moment.
              </div>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-4 rounded-xl bg-gray-800/60 border border-gray-700 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{offer.portfolioName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                          {offer.offerType === 'total' ? 'Achat Global' : `Achat Partiel (${offer.selectedSitesCount} sites)`}
                        </span>
                      </div>
                      <span className="text-lg font-bold font-mono text-emerald-400">
                        {new Intl.NumberFormat('fr-FR').format(offer.amountEur)} € HT
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-400 text-[11px]">
                      <span>
                        Émetteur : <strong className="text-white">{offer.investorName}</strong> ({offer.investorCompany}) • {offer.investorEmail}
                      </span>
                      <span>{new Date(offer.createdAt).toLocaleString('fr-FR')}</span>
                    </div>

                    {offer.milestones && offer.milestones.length > 0 && (
                      <div className="bg-gray-900/60 p-2.5 rounded-lg border border-gray-800 space-y-1">
                        <span className="font-bold text-gray-400 block text-[10px] uppercase">Jalonnements proposés :</span>
                        {offer.milestones.map((m, mIdx) => (
                          <div key={mIdx} className="flex justify-between text-[11px] text-gray-300">
                            <span>• {m.label}</span>
                            <span className="font-mono text-amber-400">{m.percentage}% ({m.amount} €)</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {offer.comments && (
                      <p className="text-gray-300 bg-gray-900/40 p-2 rounded border border-gray-800 text-[11px]">
                        "{offer.comments}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* TAB 3: ACTIVE INVESTORS */
          <div className="space-y-3">
            {activeInvestors.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl bg-gray-800/40 border border-gray-800 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    {inv.company}
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      ✓ Accès Validé & NDA Actif
                    </span>
                  </div>
                  <div className="text-gray-400 text-[11px] mt-0.5">
                    {inv.name} • {inv.email} • Mot de passe : <span className="font-mono text-gray-300">{inv.password}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedInvestorForNda(inv)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                >
                  Voir NDA
                </button>
              </div>
            ))}
          </div>
        )}

        {/* NDA Reader Sub-modal */}
        {selectedInvestorForNda && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h4 className="font-bold text-white text-sm">
                  Accord de Confidentialité — {selectedInvestorForNda.company}
                </h4>
                <button
                  onClick={() => setSelectedInvestorForNda(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="h-96 overflow-y-auto p-4 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-300 font-sans space-y-3 whitespace-pre-line leading-relaxed">
                {selectedInvestorForNda.ndaText}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedInvestorForNda(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
