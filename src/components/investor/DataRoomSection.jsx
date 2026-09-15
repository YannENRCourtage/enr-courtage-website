import React, { useState } from 'react';
import { FolderLock, FileText, Download, ShieldCheck, Scale, Wrench, Calculator, Map, Network, CheckCircle2 } from 'lucide-react';

const categoryIconMap = {
  Scale,
  Wrench,
  Calculator,
  Map,
  Network,
};

export default function DataRoomSection({
  portfolio,
  investorName = 'Investisseur',
  investorCompany = '',
}) {
  const [downloadedFiles, setDownloadedFiles] = useState({});

  if (!portfolio || !portfolio.dataRoom) {
    return null;
  }

  const handleDownload = (file) => {
    // Record download locally
    setDownloadedFiles((prev) => ({
      ...prev,
      [file.name]: true,
    }));

    // Generate a quick simulated text/pdf file for demonstration
    const blob = new Blob(
      [
        `CONFIDENTIEL - ENR COURTAGE DATA ROOM\n` +
        `Portefeuille : ${portfolio.name} (${portfolio.type})\n` +
        `Document : ${file.name}\n` +
        `Destinataire : ${investorName} (${investorCompany})\n` +
        `Date d'accès : ${new Date().toLocaleString('fr-FR')}\n\n` +
        `Ce document est soumis au secret professionnel et aux termes stricts du NDA bilatéral signé avec ENR Courtage.\n` +
        `Toute reproduction ou diffusion sans accord écrit est strictement interdite.`
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/[^a-zA-Z0-9]/g, '_')}_CONFIDENTIEL.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-[#0c1220] to-gray-900 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FolderLock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Data Room Virtuelle
              </span>
              <span className="text-xs text-gray-400">Accès Sécurisé sous NDA</span>
            </div>
            <h3 className="text-xl font-black text-white mt-1">
              Documents du portefeuille {portfolio.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Accès accordé à <strong className="text-white">{investorCompany || investorName}</strong></span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {portfolio.dataRoom.categories.map((category, idx) => {
          const CatIcon = categoryIconMap[category.icon] || FileText;

          return (
            <div
              key={idx}
              className="bg-gray-800/40 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider mb-3">
                <CatIcon className="w-4 h-4 text-emerald-400" />
                <span>{category.name}</span>
                <span className="text-[10px] text-gray-500 font-normal">({category.files.length} fichiers)</span>
              </div>

              <div className="space-y-2">
                {category.files.map((file, fIdx) => {
                  const isDownloaded = downloadedFiles[file.name];

                  return (
                    <div
                      key={fIdx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-gray-900/60 border border-gray-800/80 hover:border-emerald-500/40 transition group"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-800 text-gray-400 border border-gray-700">
                          {file.type}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-200 truncate group-hover:text-emerald-300 transition">
                            {file.name}
                          </p>
                          <span className="text-[10px] text-gray-500">{file.size}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownload(file)}
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1.5 shrink-0 ${
                          isDownloaded
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-gray-800 hover:bg-emerald-600 text-gray-300 hover:text-white border border-gray-700'
                        }`}
                      >
                        {isDownloaded ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Téléchargé</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3 h-3" />
                            <span>Consulter</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
        <span>Toutes les consultations et téléchargements font l'objet d'une traçabilité horodatée.</span>
        <span className="text-emerald-400 font-mono">Chiffrement AES-256</span>
      </div>
    </div>
  );
}
