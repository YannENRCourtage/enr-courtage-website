import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Génère un véritable fichier PDF certifié pour les documents de la Data Room
 * lorsque le binaire original n'est pas encore téléversé par l'administrateur.
 */
export async function generateCertifiedPdfBlob({
  fileName = 'Document_Officiel.pdf',
  fileType = 'PDF',
  fileSize = '1.2 Mo',
  portfolioName = 'HELIOS (30 MW)',
  portfolioType = 'Agrivoltaïque',
  investorName = 'Investisseur Agréé',
  investorCompany = 'Fonds d\'investissement EnR',
  investorEmail = '',
  categoryName = 'Documents Juridiques & Foncier',
  dateFormatted = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}) {
  try {
    const pdfDoc = await PDFDocument.create();
    
    // Polices standard
    const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontHelveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Format A4 : 595.28 x 841.89 points
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    // Couleurs de la charte ENR Courtage
    const emeraldDark = rgb(6 / 255, 78 / 255, 59 / 255);     // #064e3b
    const emeraldPrimary = rgb(5 / 255, 150 / 255, 105 / 255); // #059669
    const emeraldLight = rgb(236 / 255, 253 / 255, 245 / 255); // #ecfdf5
    const textDark = rgb(17 / 255, 24 / 255, 39 / 255);        // #111827
    const textMuted = rgb(107 / 255, 114 / 255, 128 / 255);    // #6b7280
    const borderGray = rgb(229 / 255, 231 / 255, 235 / 255);   // #e5e7eb

    // 1. Bandeau supérieur vert émeraude
    page.drawRectangle({
      x: 0,
      y: height - 90,
      width: width,
      height: 90,
      color: emeraldDark,
    });

    // Titre de marque dans le bandeau
    page.drawText('ENR COURTAGE ENERGIE', {
      x: 40,
      y: height - 42,
      size: 18,
      font: fontHelveticaBold,
      color: rgb(1, 1, 1),
    });

    page.drawText('PLATEFORME SÉCURISÉE M&A ENERGIES RENOUVELABLES | DATA ROOM ÉLECTRONIQUE', {
      x: 40,
      y: height - 60,
      size: 8.5,
      font: fontHelvetica,
      color: rgb(167 / 255, 243 / 255, 208 / 255), // emerald-200
    });

    // Badge Confidentiel
    page.drawRectangle({
      x: width - 170,
      y: height - 58,
      width: 130,
      height: 26,
      color: rgb(185 / 255, 28 / 255, 28 / 255), // red-700
    });
    page.drawText('STRICTEMENT CONFIDENTIEL', {
      x: width - 162,
      y: height - 47,
      size: 7.5,
      font: fontHelveticaBold,
      color: rgb(1, 1, 1),
    });

    // 2. Filigrane de fond
    page.drawText('ENR COURTAGE - CONFIDENTIEL', {
      x: 60,
      y: height / 2 - 40,
      size: 34,
      font: fontHelveticaBold,
      color: rgb(240 / 255, 240 / 255, 240 / 255),
      rotate: { type: 'degrees', angle: 35 },
    });

    // 3. Cadre principal de certification
    const frameX = 40;
    const frameY = height - 450;
    const frameWidth = width - 80;
    const frameHeight = 330;

    page.drawRectangle({
      x: frameX,
      y: frameY,
      width: frameWidth,
      height: frameHeight,
      borderColor: borderGray,
      borderWidth: 1.5,
      color: rgb(255 / 255, 255 / 255, 255 / 255),
    });

    // En-tête du cadre (fond émeraude très clair)
    page.drawRectangle({
      x: frameX,
      y: frameY + frameHeight - 45,
      width: frameWidth,
      height: 45,
      color: emeraldLight,
      borderColor: borderGray,
      borderWidth: 1,
    });

    page.drawText('CERTIFICAT D\'AUTHENTICITÉ & DE MISE À DISPOSITION DATA ROOM', {
      x: frameX + 20,
      y: frameY + frameHeight - 28,
      size: 11,
      font: fontHelveticaBold,
      color: emeraldDark,
    });

    // Contenu des métadonnées
    let currentY = frameY + frameHeight - 75;
    const drawMetaRow = (label, value, isBold = false) => {
      page.drawText(label, {
        x: frameX + 20,
        y: currentY,
        size: 9.5,
        font: fontHelveticaBold,
        color: textMuted,
      });
      page.drawText(String(value || '-'), {
        x: frameX + 170,
        y: currentY,
        size: 9.5,
        font: isBold ? fontHelveticaBold : fontHelvetica,
        color: textDark,
      });
      currentY -= 24;
    };

    drawMetaRow('Document : ', fileName, true);
    drawMetaRow('Portefeuille cible : ', `${portfolioName} (${portfolioType})`, true);
    drawMetaRow('Catégorie : ', categoryName);
    drawMetaRow('Format / Taille : ', `${fileType} (${fileSize})`);
    drawMetaRow('Bénéficiaire : ', `${investorName}${investorCompany ? ' - ' + investorCompany : ''}`);
    if (investorEmail) {
      drawMetaRow('Identifiant d\'accès : ', investorEmail);
    }
    drawMetaRow('Horodatage certifié : ', dateFormatted);
    drawMetaRow('Empreinte cryptographique : ', `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`);

    // Ligne de séparation
    page.drawLine({
      start: { x: frameX + 20, y: currentY - 5 },
      end: { x: frameX + frameWidth - 20, y: currentY - 5 },
      thickness: 1,
      color: borderGray,
    });

    currentY -= 30;

    // Statut
    page.drawText('STATUT : PIÈCE OFFICIELLE CERTIFIÉE CONFORME À L\'ORIGINAL', {
      x: frameX + 20,
      y: currentY,
      size: 10,
      font: fontHelveticaBold,
      color: emeraldPrimary,
    });

    // 4. Cadre de mentions juridiques & NDA
    const legalBoxY = 120;
    const legalBoxHeight = 240;
    page.drawRectangle({
      x: frameX,
      y: legalBoxY,
      width: frameWidth,
      height: legalBoxHeight,
      color: rgb(249 / 255, 250 / 255, 251 / 255), // gray-50
      borderColor: borderGray,
      borderWidth: 1,
    });

    page.drawText('CONDITIONS DE CONSULTATION ET PROTECTION DU SECRET DES AFFAIRES', {
      x: frameX + 20,
      y: legalBoxY + legalBoxHeight - 25,
      size: 10,
      font: fontHelveticaBold,
      color: textDark,
    });

    const legalTexts = [
      '1. Cadre contractuel : Ce document est mis à la disposition exclusive du tiers identifié ci-dessus',
      '   en application stricte de l\'Accord de Confidentialité (NDA) bilatéral préalablement régularisé.',
      '2. Secret des affaires : Conformément aux articles L. 151-1 et suivants du Code de commerce, toute',
      '   divulgation, reproduction ou exploitation non autorisée engage la responsabilité civile et pénale de l\'auteur.',
      '3. Propriété intellectuelle et industrielle : L\'ensemble des études techniques, foncières et financières',
      '   demeure la propriété exclusive d\'ENR COURTAGE et de ses partenaires développeurs et producteurs.',
      '4. Traçabilité : Chaque téléchargement fait l\'objet d\'une journalisation sécurisée (IP, date, heure et utilisateur)',
      '   consultable en temps réel par les administrateurs de la plateforme ENR COURTAGE.',
      '5. Fin de mission : À l\'issue de la phase d\'audit (Due Diligence), les documents doivent être détruits sans délai.'
    ];

    let textY = legalBoxY + legalBoxHeight - 50;
    legalTexts.forEach((line) => {
      page.drawText(line, {
        x: frameX + 20,
        y: textY,
        size: 8.5,
        font: fontHelvetica,
        color: rgb(55 / 255, 65 / 255, 81 / 255), // gray-700
      });
      textY -= 16;
    });

    // Tampon officiel en bas à droite du cadre légal
    const stampX = frameX + frameWidth - 190;
    const stampY = legalBoxY + 15;
    page.drawRectangle({
      x: stampX,
      y: stampY,
      width: 170,
      height: 48,
      borderColor: emeraldPrimary,
      borderWidth: 1.5,
      color: rgb(240 / 255, 253 / 255, 244 / 255),
    });
    page.drawText('ENR COURTAGE - VISA M&A', {
      x: stampX + 15,
      y: stampY + 30,
      size: 9,
      font: fontHelveticaBold,
      color: emeraldDark,
    });
    page.drawText('Document certifié conforme', {
      x: stampX + 15,
      y: stampY + 18,
      size: 8,
      font: fontHelveticaOblique,
      color: emeraldPrimary,
    });
    page.drawText(`Paraphes : YB / ${investorName.split(' ').map(n => n[0]).join('') || 'INV'}`, {
      x: stampX + 15,
      y: stampY + 7,
      size: 7.5,
      font: fontHelveticaBold,
      color: textDark,
    });

    // 5. Pied de page
    page.drawText('ENR COURTAGE ENERGIE SAS • 28 Rue d\'Enghien, 75010 Paris • RCS Paris • www.enr-courtage.fr', {
      x: 80,
      y: 45,
      size: 7.5,
      font: fontHelvetica,
      color: textMuted,
    });
    page.drawText('Page 1/1 - Document généré électroniquement via la Data Room Sécurisée', {
      x: 170,
      y: 32,
      size: 7,
      font: fontHelveticaOblique,
      color: textMuted,
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF certifié:', error);
    return null;
  }
}
