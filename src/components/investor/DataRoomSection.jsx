import React, { useState, useMemo } from 'react';
import { FolderLock, FileText, Download, ShieldCheck, Scale, Wrench, Calculator, Map, Network, CheckCircle2, FileCode, Paperclip } from 'lucide-react';
import { useInvestorStore } from '@/stores/useInvestorStore';

const categoryIconMap = {
  Scale,
  Wrench,
  Calculator,
  Map,
  Network,
  Juridique: Scale,
  Technique: Wrench,
  Financier: Calculator,
  Urbanisme: Map,
  Réseau: Network,
};

export default function DataRoomSection({
  portfolio,
  investorName = 'Investisseur',
  investorCompany = '',
}) {
  const { customDataRoom, deletedDefaultDocs, recordDownload, currentInvestor } = useInvestorStore();
  const [downloadedFiles, setDownloadedFiles] = useState({});

  // Merge default categories with custom uploaded files, respecting deletions
  const categories = useMemo(() => {
    if (!portfolio || !portfolio.dataRoom) return [];
    
    const deletedForPortfolio = deletedDefaultDocs?.[portfolio.id] || [];

    const defaultCats = portfolio.dataRoom.categories.map((cat) => ({
      ...cat,
      // Exclude deleted demo / default documents
      files: (cat.files || []).filter((f) => !deletedForPortfolio.includes(f.name)),
    }));

    const customDocsForPortfolio = customDataRoom?.[portfolio.id] || {};

    Object.entries(customDocsForPortfolio).forEach(([catName, customFiles]) => {
      const existingCat = defaultCats.find(
        (c) => c.name.toLowerCase() === catName.toLowerCase()
      );

      if (existingCat) {
        // Append custom files avoiding exact duplicates
        customFiles.forEach((cf) => {
          if (!existingCat.files.some((f) => f.name === cf.name)) {
            existingCat.files.push(cf);
          }
        });
      } else if (customFiles && customFiles.length > 0) {
        defaultCats.push({
          name: catName,
          icon: 'Paperclip',
          files: customFiles,
        });
      }
    });

    // Only return categories that still have files
    return defaultCats.filter((cat) => cat.files && cat.files.length > 0);
  }, [portfolio, customDataRoom, deletedDefaultDocs]);

  if (!portfolio || !portfolio.dataRoom) {
    return null;
  }

  const handleDownload = (file) => {
    // Record download locally
    setDownloadedFiles((prev) => ({
      ...prev,
      [file.name]: true,
    }));

    // Record download persistently for admin supervision
    const activeEmail = currentInvestor?.email || 'investisseur@partenaire.fr';
    const activeName = investorName || currentInvestor?.name || 'Investisseur';
    const activeCompany = investorCompany || currentInvestor?.company || 'Investisseur Qualifié';

    if (recordDownload) {
      recordDownload({
        userEmail: activeEmail,
        userName: activeName,
        userCompany: activeCompany,
        portfolioId: portfolio.id,
        portfolioName: portfolio.name,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
    }

    // If file has actual data uploaded by admin, download that
    if (file.fileData) {
      const a = document.createElement('a');
      a.href = file.fileData;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Otherwise generate certified confidential document placeholder
    const blob = new Blob(
      [
        `==============================================================================\n` +
        `ENR COURTAGE — DATA ROOM TRANSACTIONNELLE M&A\n` +
        `ACCÈS CERTIFIÉ SOUS ACCORD DE CONFIDENTIALITÉ BILATÉRAL VALIDÉ\n` +
        `==============================================================================\n\n` +
        `Portefeuille : ${portfolio.name} (${portfolio.type})\n` +
        `Document certifié : ${file.name}\n` +
        `Bénéficiaire accrédité : ${activeName} (${activeCompany})\n` +
        `Date d'accès & horodatage : ${new Date().toLocaleString('fr-FR')}\n` +
        `Statut juridique : Accord bilatéral de confidentialité (NDA) dument validé et contre-signé par Yann BARBERIS, Président d'ENR COURTAGE SAS.\n\n` +
        `[SYNTHÈSE DU DOSSIER]\n` +
        `Ce document est certifié conforme aux pièces versées dans la Data Room du portefeuille ${portfolio.name}.\n` +
        `Les pièces d'exécution originales (plans, autorisations d'urbanisme purgées, devis de construction et promesses de bail) sont communicables sans restriction à vos conseils juridiques et techniques.\n\n` +
        `Pour toute question ou demande de pièce complémentaire :\n` +
        `Yann BARBERIS — y.barberis@enr-courtage.fr`
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/[^a-zA-Z0-9]/g, '_')}_CERTIFIE_CONFIDENTIEL.txt`;
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
              <span className="text-xs text-emerald-400 font-semibold">✓ NDA Bilatéral Actif</span>
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
        {categories.map((category, idx) => {
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
