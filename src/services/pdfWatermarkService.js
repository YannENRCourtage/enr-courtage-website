import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

/**
 * Applique un filigrane de sécurité anti-fuite diagonal et discret sur chaque page d'un document PDF.
 * Format réglementaire M&A : "DOCUMENT CONFIDENTIEL SOUS NDA — COMMUNIQUÉ À [NOM_INVESTISSEUR] ([EMAIL]) LE [DATE_HEURE_UTC]"
 *
 * @param {ArrayBuffer|Uint8Array} pdfBytes - Données binaires du fichier PDF source
 * @param {Object} options - Données de traçabilité de l'investisseur
 * @param {string} options.investorName - Nom du représentant / investisseur
 * @param {string} options.investorEmail - Email professionnel
 * @param {string} options.investorCompany - Entreprise représentée
 * @returns {Promise<Uint8Array>} PDF filigrané prêt au téléchargement ou à l'affichage
 */
export async function applyWatermarkToPdf(pdfBytes, { investorName, investorEmail, investorCompany } = {}) {
  try {
    if (!pdfBytes) return pdfBytes;

    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    const nowUtc = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const cleanName = (investorName || 'INVESTISSEUR PARTENAIRE').trim().toUpperCase();
    const cleanEmail = (investorEmail || 'SOUS ACCORD NDA').trim();
    const cleanCompany = (investorCompany || '').trim().toUpperCase();

    const watermarkMain = `DOCUMENT CONFIDENTIEL SOUS NDA — COMMUNIQUÉ À ${cleanName}${cleanCompany ? ` (${cleanCompany})` : ''} [${cleanEmail}] LE ${nowUtc}`;
    const watermarkFooter = `CONFIDENTIEL • ENR COURTAGE SAS • USAGE STRICTEMENT INTERNE PAR ${cleanEmail} • HORODATAGE : ${nowUtc}`;

    pages.forEach((page) => {
      const { width, height } = page.getSize();

      // Taille adaptée à la largeur de page
      const fontSize = Math.max(8, Math.min(11, width / 70));
      const textWidth = font.widthOfTextAtSize(watermarkMain, fontSize);

      // 1. Filigrane diagonal central (incliné à 35 degrés, opacité 0.22)
      page.drawText(watermarkMain, {
        x: Math.max(20, (width - textWidth * 0.72) / 2),
        y: height / 2,
        size: fontSize,
        font,
        color: rgb(0.72, 0.12, 0.12), // Rouge bordeaux feutré discret
        opacity: 0.22,
        rotate: degrees(35),
      });

      // 2. Filigrane diagonal supérieur (répétition anti-recadrage)
      page.drawText(watermarkMain, {
        x: Math.max(20, (width - textWidth * 0.72) / 2 - 40),
        y: height * 0.78,
        size: fontSize * 0.85,
        font,
        color: rgb(0.4, 0.4, 0.45),
        opacity: 0.15,
        rotate: degrees(35),
      });

      // 3. Filigrane diagonal inférieur (répétition anti-recadrage)
      page.drawText(watermarkMain, {
        x: Math.max(20, (width - textWidth * 0.72) / 2 + 40),
        y: height * 0.22,
        size: fontSize * 0.85,
        font,
        color: rgb(0.4, 0.4, 0.45),
        opacity: 0.15,
        rotate: degrees(35),
      });

      // 4. Mention permanente de traçabilité en bas de page
      page.drawText(watermarkFooter, {
        x: 24,
        y: 12,
        size: 6.5,
        font,
        color: rgb(0.3, 0.35, 0.4),
        opacity: 0.65,
      });
    });

    return await pdfDoc.save();
  } catch (err) {
    console.warn("Échec de l'application du filigrane PDF, document original renvoyé:", err);
    return pdfBytes;
  }
}
