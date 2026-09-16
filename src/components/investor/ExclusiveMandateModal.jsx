import React, { useState } from 'react';
import {
  X,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Scale,
  Lock,
} from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';
import { generateExclusiveMandateText } from '@/data/investorData';

export default function ExclusiveMandateModal({
  offer,
  isOpen,
  onClose,
}) {
  const { currentInvestor, signMandate, isAdmin } = useInvestorStore();

  if (!isOpen || !offer) return null;

  const userIsAdmin = isAdmin();
  const mandateState = offer.mandate || {
    investorSigned: false,
    investorSignedAt: null,
    adminSigned: false,
    adminSignedAt: null,
  };

  const isInvestorSigned = mandateState.investorSigned;
  const isAdminSigned = mandateState.adminSigned;
  const isFullyExecuted = isInvestorSigned && isAdminSigned;

  const mandateText = generateExclusiveMandateText({
    companyName: offer.investorCompany || 'Acquéreur',
    legalForm: currentInvestor?.legalForm || 'Société par actions simplifiée',
    headOffice: currentInvestor?.headOffice || 'Siège Social',
    rcsNumber: currentInvestor?.rcsNumber || 'RCS',
    rcsCity: currentInvestor?.rcsCity || 'Paris',
    representativeName: offer.investorName,
    representativeRole: currentInvestor?.role || 'Directeur des Investissements',
    portfolioName: offer.portfolioName,
    offerType: offer.offerType,
    selectedSitesCount: offer.selectedSitesCount,
    amountEur: offer.amountEur,
    milestones: offer.milestones,
    dateStr: new Date(offer.updatedAt || offer.createdAt).toLocaleDateString('fr-FR'),
    exclusivityDays: 60,
    investorSigned: isInvestorSigned,
    investorSignedAt: mandateState.investorSignedAt,
    adminSigned: isAdminSigned,
    adminSignedAt: mandateState.adminSignedAt,
  });

  const handleSign = () => {
    if (userIsAdmin) {
      signMandate(offer.id, 'admin');
    } else {
      signMandate(offer.id, 'investor');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-4xl w-full p-5 sm:p-8 shadow-2xl relative my-6">
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
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Accord Transactionnel & LOI
                </span>
                {isFullyExecuted ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mandat Signé & En Vigueur
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> En attente de signature
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                Mandat d'Entrée en Négociation Exclusive
              </h3>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-bold transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / Exporter PDF</span>
          </button>
        </div>

        {/* Legal Alert: Obligation of Lawyer */}
        <div className="mb-5 p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
          <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white block">
              Clause Juridique Impérative — Recours aux services d'un Avocat
            </strong>
            <p className="text-gray-300 leading-relaxed">
              La régularisation des actes définitifs de cession (promesse de cession de droits de développement, baux emphytéotiques, séquestre et protocoles) requiert <strong>obligatoirement l'assistance d'un avocat</strong> pour chacune des Parties afin de garantir la conformité réglementaire et la sécurité de l'investissement.
            </p>
          </div>
        </div>

        {/* Transaction Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 text-xs">
          <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Périmètre Négocié</span>
            <div className="text-sm font-bold text-white mt-0.5">{offer.portfolioName}</div>
            <div className="text-[11px] text-gray-400">
              {offer.offerType === 'total' ? 'Totalité du portefeuille' : `${offer.selectedSitesCount} sites sélectionnés`}
            </div>
          </div>

          <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Montant d'Acquisition Convenu</span>
            <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
              {new Intl.NumberFormat('fr-FR').format(offer.amountEur)} € HT
            </div>
            <div className="text-[11px] text-gray-400">Ventilé en {offer.milestones?.length || 4} jalons</div>
          </div>

          <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Période d'Exclusivité</span>
            <div className="text-sm font-bold text-amber-300 mt-0.5">60 Jours Ouvrés</div>
            <div className="text-[11px] text-gray-400">Gel des discussions avec les tiers</div>
          </div>
        </div>

        {/* Contract Text Scroll Box */}
        <div className="relative mb-6">
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 font-sans text-xs text-gray-300 whitespace-pre-line leading-relaxed h-80 overflow-y-auto select-text">
            {mandateText}
          </div>
        </div>

        {/* Electronic Signature Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-800 pt-5">
          {/* Investor Signature Box */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Pour l'Acquéreur ({offer.investorCompany})</span>
              {isInvestorSigned ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Signé
                </span>
              ) : (
                <span className="text-amber-400 text-[11px] font-medium">En attente</span>
              )}
            </div>

            <div className="text-gray-400 text-[11px]">
              Signataire : <strong className="text-gray-200">{offer.investorName}</strong>
            </div>

            {isInvestorSigned ? (
              <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono">
                ✓ Signature électronique certifiée le {new Date(mandateState.investorSignedAt).toLocaleString('fr-FR')}
              </div>
            ) : !userIsAdmin ? (
              <button
                onClick={handleSign}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Signer électroniquement le Mandat</span>
              </button>
            ) : (
              <div className="text-[11px] text-gray-500 italic">
                En attente de signature par le représentant de {offer.investorCompany}
              </div>
            )}
          </div>

          {/* Admin Signature Box */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Pour le Cédant (ENR COURTAGE SAS)</span>
              {isAdminSigned ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Signé
                </span>
              ) : (
                <span className="text-amber-400 text-[11px] font-medium">En attente</span>
              )}
            </div>

            <div className="text-gray-400 text-[11px]">
              Signataire : <strong className="text-gray-200">Yann BARBERIS</strong> (Président)
            </div>

            {isAdminSigned ? (
              <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono">
                ✓ Signature électronique certifiée le {new Date(mandateState.adminSignedAt).toLocaleString('fr-FR')}
              </div>
            ) : userIsAdmin ? (
              <button
                onClick={handleSign}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Contre-signer et octroyer l'exclusivité</span>
              </button>
            ) : (
              <div className="text-[11px] text-gray-500 italic">
                En attente de signature par Yann BARBERIS (ENR COURTAGE)
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}