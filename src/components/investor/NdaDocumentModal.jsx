import React, { useState, useEffect } from 'react';
import {
  X,
  FileSignature,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  Building,
  User,
  Calendar,
  Sparkles,
  FileText,
  FileCheck,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { getDocumentBinary } from '@/services/fileStorageService';

// Helper to generate initials from full name (strips parentheses like (MOA) and special characters)
function getInitials(name = '') {
  if (!name) return 'YB';
  const clean = name.replace(/\(.*?\)/g, '').replace(/[^a-zA-ZÀ-ÿ\s-]/g, '').trim();
  if (!clean) return 'YB';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function NdaDocumentModal({ isOpen, onClose, investor = null }) {
  const { currentInvestor: storeInvestor } = useInvestorStore();
  const activeInvestor = investor || storeInvestor;
  const currentInvestor = activeInvestor;

  const [uploadedPdfUrl, setUploadedPdfUrl] = useState(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' | 'generated'

  useEffect(() => {
    let objectUrl = null;
    if (!isOpen || !activeInvestor) {
      setUploadedPdfUrl(null);
      return;
    }

    if (activeInvestor.ndaFileBase64) {
      setUploadedPdfUrl(activeInvestor.ndaFileBase64);
      setViewMode('pdf');
      return;
    }

    const docId = activeInvestor.ndaDocumentId || ('nda_user_' + activeInvestor.id);
    setIsLoadingPdf(true);
    getDocumentBinary(docId).then((record) => {
      if (record && record.blob) {
        objectUrl = URL.createObjectURL(record.blob);
        setUploadedPdfUrl(objectUrl);
        setViewMode('pdf');
      } else {
        setViewMode('generated');
      }
      setIsLoadingPdf(false);
    }).catch(() => {
      setIsLoadingPdf(false);
      setViewMode('generated');
    });

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isOpen, activeInvestor]);

  if (!isOpen) return null;

  const rawInvestorName = activeInvestor?.name || 'Jean DUS';
  const investorCleanName = rawInvestorName.replace(/\(.*?\)/g, '').trim() || rawInvestorName;
  const investorName = activeInvestor?.name || 'Jean DUS';
  const investorCompany = activeInvestor?.company || 'ENEE ENERGY PARTNERS';
  const investorRole = activeInvestor?.role || 'Directeur des Investissements';
  const investorInitials = getInitials(investorName);
  const signedDate = activeInvestor?.ndaSignedAt
    ? new Date(activeInvestor.ndaSignedAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('fr-FR');
  const signedTimestamp = activeInvestor?.ndaSignedAt
    ? new Date(activeInvestor.ndaSignedAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '09:30';

  const handlePrint = () => {
    const printContent = document.getElementById('printable-nda-document');
    if (!printContent) {
      window.print();
      return;
    }

    // Remove any previous print iframe
    const oldIframe = document.getElementById('nda-isolated-print-iframe');
    if (oldIframe) {
      oldIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'nda-isolated-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();

    // Copy document stylesheets & styles
    let stylesHtml = '';
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      stylesHtml += node.outerHTML;
    });

    const clonedContent = printContent.cloneNode(true);

    doc.write(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>Accord de Confidentialité Bilatéral (NDA) - ENR COURTAGE</title>
          ${stylesHtml}
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm 10mm;
            }
            *, *::before, *::after {
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              background-color: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            }
            .nda-print-wrapper {
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .nda-page {
              box-sizing: border-box !important;
              background: #ffffff !important;
              border: 1px solid #e2e8f0 !important;
              border-radius: 6px !important;
              padding: 16px 20px !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .nda-page-1 {
              page-break-after: always !important;
              break-after: page !important;
              margin-bottom: 0 !important;
            }
            .nda-page-2 {
              page-break-after: avoid !important;
              break-after: avoid !important;
              margin-top: 0 !important;
            }
            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div class="nda-print-wrapper">
            ${clonedContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Trigger printing once iframe DOM and CSS are ready
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        iframe.remove();
      }, 3000);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md overflow-y-auto p-3 sm:p-6 flex flex-col items-center justify-start print:p-0 print:bg-white print:static">
      {/* Floating always-visible close button in the top-right corner */}
      <button
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] no-print p-2.5 sm:p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white shadow-2xl border border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
        title="Fermer le document (Échap)"
        aria-label="Fermer le document"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-4 sm:p-8 shadow-2xl relative my-4 sm:my-8 text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  NDA Bilatéral Signé
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enregistré & Valide
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                Accord de Confidentialité Bilatéral (NDA)
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {uploadedPdfUrl && (
              <>
                <a
                  href={uploadedPdfUrl}
                  download={activeInvestor.ndaFileName || 'Accord_Confidentialite_Signe.pdf'}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-2 shadow-sm"
                  title="Télécharger le document PDF original signé"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger le PDF signé</span>
                </a>

                <button
                  type="button"
                  onClick={() => setViewMode((m) => (m === 'pdf' ? 'generated' : 'pdf'))}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>{viewMode === 'pdf' ? 'Transcription textuelle' : 'Document PDF original'}</span>
                </button>
              </>
            )}

            {(!uploadedPdfUrl || viewMode === 'generated') && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
                title="Imprimer ou enregistrer en PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer / Télécharger PDF</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* VUE 1 : DOCUMENT PDF ORIGINAL CHARGÉ DEPUIS L'ORDINATEUR         */}
        {/* ================================================================= */}
        {uploadedPdfUrl && viewMode === 'pdf' ? (
          <div className="space-y-4">
            <div className="p-3 bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-300 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center space-x-2 text-slate-800">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Fichier original signé : <strong className="text-slate-950 font-mono">{activeInvestor.ndaFileName || 'Document_NDA_Signe.pdf'}</strong>
                </span>
              </div>
              <a
                href={uploadedPdfUrl}
                download={activeInvestor.ndaFileName || 'Accord_Confidentialite_Signe.pdf'}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Télécharger ce PDF</span>
              </a>
            </div>

            <iframe
              src={uploadedPdfUrl}
              className="w-full h-[78vh] rounded-xl border border-slate-300 shadow-inner bg-slate-100"
              title="Document NDA Signé Original"
            />
          </div>
        ) : (
        /* ================================================================= */
        /* VUE 2 : DOCUMENT CONTRACTUEL FORMALISÉ (PAGE 1 ET PAGE 2)          */
        /* ================================================================= */
        <div id="printable-nda-document" className="space-y-8 font-sans text-slate-800 print:space-y-0">
          
          {/* =============================================================== */}
          {/* FEUILLE / PAGE 1 DU CONTRAT                                     */}
          {/* =============================================================== */}
          <div className="nda-page nda-page-1 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-5 relative print:border-none print:shadow-none print:p-5 print:break-after-page">
            {/* Header Officiel de Page 1 */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black tracking-widest uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ENR COURTAGE
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    RCS Bordeaux 881 500 552
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight mt-1">
                  ACCORD DE CONFIDENTIALITÉ BILATÉRAL (NDA)
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  Cession de Droits de Développement — Portefeuilles HÉLIOS (PV) & VOLTA (BESS)
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-300 block">
                  Strictement Confidentiel
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Date d'effet : {signedDate}
                </span>
              </div>
            </div>

            {/* Parties Soussignées */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-4 space-y-3 text-xs leading-relaxed">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                ENTRE LES SOUSSIGNÉS :
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded border border-slate-200">
                  <strong className="text-slate-900 block font-black">1. ENR COURTAGE SAS</strong>
                  <span className="text-slate-600 block text-[11px] mt-0.5">
                    Société par actions simplifiée au capital de 1 000 €, siège social sis 7 Rue Gutenberg, 33700 Mérignac, RCS Bordeaux n° 881 500 552, représentée par <strong>Monsieur Yann BARBERIS</strong>, en qualité de Président.
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 mt-1 block">
                    (Ci-après désignée « La Partie Divulgatrice » ou « ENR COURTAGE »)
                  </span>
                </div>

                <div className="p-3 bg-white rounded border border-slate-200">
                  <strong className="text-slate-900 block font-black">2. {investorCompany}</strong>
                  <span className="text-slate-600 block text-[11px] mt-0.5">
                    Représentée par <strong>{investorName}</strong>, agissant en qualité de {investorRole}, dûment habilité(e) aux fins des présentes.
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 mt-1 block">
                    (Ci-après désignée « La Partie Réceptrice » ou « L'Investisseur »)
                  </span>
                </div>
              </div>
            </div>

            {/* Préambule & Articles 1 à 3 */}
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed text-justify">
              <div>
                <strong className="text-slate-900 font-bold uppercase block text-[11px] mb-1">
                  PRÉAMBULE
                </strong>
                <p>
                  Les Parties sont entrées en discussions en vue d'étudier l'acquisition potentielle par l'Investisseur de droits de développement portant sur des centrales solaires photovoltaïques en toitures (Portefeuille HÉLIOS — 9,12 MWc) et/ou des unités de stockage d'énergie par batteries stationnaires (Portefeuille VOLTA — 15,50 MW). Dans ce cadre, ENR COURTAGE met à disposition de l'Investisseur des données hautement stratégiques, techniques et financières nécessitant une protection renforcée.
                </p>
              </div>

              <div>
                <strong className="text-slate-900 font-bold uppercase block text-[11px] mb-1">
                  ARTICLE 1 — DÉFINITION DES INFORMATIONS CONFIDENTIELLES
                </strong>
                <p>
                  Constituent des Informations Confidentielles l'ensemble des informations écrites, orales ou électroniques transmises via la Data Room, incluant expressément : la liste nominative et cadastrale des sites, les baux et promesses de bail emphytéotique, les autorisations d'urbanisme (DP/PC), les études de productible, les dimensionnements techniques, les devis charpente et raccordement Enedis, ainsi que les valorisations et conditions financières d'acquisition.
                </p>
              </div>

              <div>
                <strong className="text-slate-900 font-bold uppercase block text-[11px] mb-1">
                  ARTICLE 2 — ENGAGEMENT DE CONFIDENTIALITÉ & USAGE RESTREINT
                </strong>
                <p>
                  La Partie Réceptrice s'engage formellement à : (i) préserver la stricte confidentialité des Informations Confidentielles avec un degré de précaution au moins équivalent à celui appliqué à ses propres données sensibles ; (ii) n'utiliser ces éléments qu'à la seule fin d'évaluer la transaction envisagée ; (iii) ne divulguer ces données qu'à ses collaborateurs, auditeurs ou conseils juridiques (avocats) ayant un strict besoin d'en connaître et préalablement informés des présentes obligations.
                </p>
              </div>

              <div>
                <strong className="text-slate-900 font-bold uppercase block text-[11px] mb-1">
                  ARTICLE 3 — EXCLUSIONS
                </strong>
                <p>
                  Sont exclues de cette obligation les informations tombées dans le domaine public sans faute de la Partie Réceptrice, ou dont la communication est exigée par une décision judiciaire ou administrative ayant force exécutoire, sous réserve d'en avertir préalablement ENR COURTAGE.
                </p>
              </div>
            </div>

            {/* ============================================================= */}
            {/* PIED DE PAGE 1 : PARAPHES OBLIGATOIRES DES 2 PARTIES          */}
            {/* ============================================================= */}
            <div className="pt-4 mt-6 border-t-2 border-slate-300 flex items-center justify-between text-[11px]">
              {/* Paraphe Cédant Yann BARBERIS */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 font-medium">Paraphe Cédant :</span>
                <div className="px-2.5 py-1 bg-amber-50 border border-amber-300 rounded font-serif italic font-black text-amber-900 text-xs shadow-inner">
                  YB
                </div>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">(Yann BARBERIS)</span>
              </div>

              {/* Page Numbering */}
              <div className="text-center font-mono text-[10px] text-slate-400">
                Page 1 sur 2 • Accord de Confidentialité Bilatéral
              </div>

              {/* Paraphe Acquéreur */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 font-medium">Paraphe Acquéreur :</span>
                <div className="px-2.5 py-1 bg-blue-50 border border-blue-300 rounded font-serif italic font-black text-blue-900 text-xs shadow-inner">
                  {investorInitials}
                </div>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">({investorCleanName})</span>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* FEUILLE / PAGE 2 DU CONTRAT                                     */}
          {/* =============================================================== */}
          <div className="nda-page nda-page-2 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-5 relative print:border-none print:shadow-none print:p-5 print:break-after-avoid">
            {/* Header Officiel de Page 2 */}
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                ENR COURTAGE SAS & {investorCompany} — Suite des Clauses Contractuelles
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Réf : NDA-{activeInvestor?.id || 'BILATERAL-2026'}
              </span>
            </div>

            {/* Articles 4 à 7 */}
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed text-justify">
              <div>
                <strong className="text-slate-900 font-bold uppercase block text-[11px] mb-1">
                  ARTICLE 4 — STRICT NON-CONTOURNEMENT & PROTECTION DU FONCIER
                </strong>
                <p>
                  Pendant la durée du présent accord et pour une période subséquente d'un (1) an, la Partie Réceptrice s'interdit formellement de contacter, directement ou indirectement, les propriétaires fonciers, exploitants agricoles, bailleurs, mairies ou partenaires techniques identifiés au sein des dossiers transmis, dans le but de contractualiser en contournant ENR COURTAGE. Toute tentative de contournement engagera immédiatement la responsabilité délictuelle et contractuelle du contrevenant.
                </p>
              </div>

              <div>
                <strong className="text-slate-900 font-bold uppercase block text-[11px] mb-1">
                  ARTICLE 5 — RESTITUTION ET DESTRUCTION DES DOCUMENTS
                </strong>
                <p>
                  En cas de clôture ou d'interruption des pourparlers, l'Investisseur s'engage, sur simple demande écrite d'ENR COURTAGE, à détruire ou restituer l'ensemble des pièces issues de la Data Room et à certifier par écrit l'effacement définitif de toute copie informatique sous un délai de sept (7) jours ouvrés.
                </p>
              </div>

              <div>
                <strong className="text-slate-900 font-bold uppercase block text-[11px] mb-1">
                  ARTICLE 6 — DURÉE DE L'ACCORD
                </strong>
                <p>
                  Le présent engagement prend effet à la date de sa signature électronique par les deux Parties et restera en vigueur pour une durée d'<strong>un (1) an</strong> à compter de cette date.
                </p>
              </div>

              <div>
                <strong className="text-slate-900 font-bold uppercase block text-[11px] mb-1">
                  ARTICLE 7 — LOI APPLICABLE & TRIBUNAL COMPÉTENT
                </strong>
                <p>
                  Le présent contrat est expressément soumis au droit français. À défaut de résolution amiable, tout litige relatif à sa validité, son interprétation ou son exécution sera soumis à la compétence exclusive du <strong>Tribunal de Commerce de Bordeaux</strong>.
                </p>
              </div>
            </div>

            {/* Mention de fait */}
            <div className="text-[11px] text-slate-600 italic text-right pt-2 border-t border-slate-100">
              Fait à Mérignac et validé par voie électronique, le {signedDate}, en deux (2) originaux numériques probants.
            </div>

            {/* ============================================================= */}
            {/* BLOC DE SIGNATURES OFFICIELLES DES 2 PARTIES                  */}
            {/* ============================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {/* 1. Signature Cédant — Yann BARBERIS */}
              <div className="p-4 rounded-xl bg-amber-50/50 border-2 border-amber-300 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                  <span className="font-bold text-slate-900 text-xs">Pour ENR COURTAGE SAS</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    ✓ Signé & Validé
                  </span>
                </div>

                <div className="text-xs space-y-0.5">
                  <div><strong>Signataire :</strong> Yann BARBERIS</div>
                  <div className="text-slate-600"><strong>Qualité :</strong> Président</div>
                  <div className="text-[10px] text-slate-500 font-mono">Date : {signedDate} à {signedTimestamp}</div>
                </div>

                {/* Stylized Realistic Signature Box for Yann BARBERIS */}
                <div className="mt-3 p-3 bg-white rounded-lg border border-amber-300 shadow-sm flex flex-col items-center justify-center relative">
                  <div className="font-serif italic text-xl font-bold text-slate-900 tracking-wide select-none transform -rotate-2">
                    Yann Barberis
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-1">
                    Signature numérique certifiée • ID: YB-ENR-2026-OK
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Paraphe officiel : <strong>YB</strong></span>
                  <span className="font-mono text-emerald-700 font-bold">Contre-signature validée</span>
                </div>
              </div>

              {/* 2. Signature Acquéreur — Investisseur */}
              <div className="p-4 rounded-xl bg-blue-50/50 border-2 border-blue-300 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-blue-200 pb-1.5">
                  <span className="font-bold text-slate-900 text-xs">Pour {investorCompany}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    ✓ Signé & Validé
                  </span>
                </div>

                <div className="text-xs space-y-0.5">
                  <div><strong>Signataire :</strong> {investorCleanName}</div>
                  <div className="text-slate-600"><strong>Qualité :</strong> {investorRole}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Date : {signedDate} à {signedTimestamp}</div>
                </div>

                {/* Stylized Realistic Signature Box for Investor */}
                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-300 shadow-sm flex flex-col items-center justify-center relative">
                  <div className="font-serif italic text-xl font-bold text-slate-900 tracking-wide select-none transform rotate-1">
                    {investorCleanName}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-1">
                    Signature numérique certifiée • ID: INV-{investorInitials}-2026-OK
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Paraphe officiel : <strong>{investorInitials}</strong></span>
                  <span className="font-mono text-blue-700 font-bold">Bon pour accord bilatéral</span>
                </div>
              </div>
            </div>

            {/* ============================================================= */}
            {/* PIED DE PAGE 2 : PARAPHES OBLIGATOIRES DES 2 PARTIES          */}
            {/* ============================================================= */}
            <div className="pt-4 mt-6 border-t-2 border-slate-300 flex items-center justify-between text-[11px]">
              {/* Paraphe Cédant Yann BARBERIS */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 font-medium">Paraphe Cédant :</span>
                <div className="px-2.5 py-1 bg-amber-50 border border-amber-300 rounded font-serif italic font-black text-amber-900 text-xs shadow-inner">
                  YB
                </div>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">(Yann BARBERIS)</span>
              </div>

              {/* Page Numbering */}
              <div className="text-center font-mono text-[10px] text-slate-400">
                Page 2 sur 2 • Fin de l'Accord de Confidentialité Bilatéral
              </div>

              {/* Paraphe Acquéreur */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 font-medium">Paraphe Acquéreur :</span>
                <div className="px-2.5 py-1 bg-blue-50 border border-blue-300 rounded font-serif italic font-black text-blue-900 text-xs shadow-inner">
                  {investorInitials}
                </div>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">({investorCleanName})</span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Footer actions (Hidden on Print) */}
        <div className="no-print mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Document probant à valeur d'acte sous seing privé dématérialisé.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer le NDA</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
