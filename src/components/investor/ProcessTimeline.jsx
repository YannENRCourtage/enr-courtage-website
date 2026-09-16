import React from 'react';
import { Send, FileSignature, FolderLock, Coins, CheckCheck, FileCheck, ChevronRight } from 'lucide-react';
import { PROCESS_STEPS } from '@/data/investorData';

const iconMap = {
  Send,
  FileSignature,
  FolderLock,
  Coins,
  FileCheck,
  CheckCheck,
};

export default function ProcessTimeline() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-[#0f172a] to-gray-900 border border-gray-800 p-6 sm:p-8">
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-widest mb-1">
          <CheckCheck className="w-4 h-4" />
          <span>Processus Structuré M&A</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Modalités de Cession & Calendrier Envisagé
        </h3>
        <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-3xl">
          Une démarche transactionnelle claire et réactive pour sécuriser la transmission des droits de développement.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 relative">
        {PROCESS_STEPS.map((step, idx) => {
          const Icon = iconMap[step.icon] || CheckCheck;
          const isLast = idx === PROCESS_STEPS.length - 1;

          return (
            <div
              key={step.step}
              className="bg-gray-800/40 hover:bg-gray-800/70 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between relative group"
            >
              {/* Connector line on desktop */}
              {!isLast && (
                <div className="hidden xl:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 text-gray-600">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-lg bg-gray-900 border border-gray-700 font-mono text-xs font-bold text-amber-400 flex items-center justify-center shadow-inner">
                    {step.label}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center justify-center text-gray-400 group-hover:text-white transition">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5">{step.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-gray-800/60 flex items-center text-[10px] text-gray-500 font-medium">
                <span>Étape {step.step}/{PROCESS_STEPS.length}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
