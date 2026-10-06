/**
 * Moteur intelligent d'appariement automatique des documents NDA aux investisseurs
 * Reconnaît le nom de la société, le nom du signataire ou le domaine e-mail dans le titre du fichier.
 * Exemple : "NDA ALBIOMA x ENR COURTAGE.pdf" -> Quentin TROLONGE (ALBIOMA)
 */

function cleanText(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]/g, ' ') // Remplace les caractères spéciaux par des espaces
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchNdaFileToInvestor(fileName, investors = []) {
  if (!fileName || !Array.isArray(investors) || investors.length === 0) {
    return null;
  }

  const cleanedFileName = cleanText(fileName);
  const words = cleanedFileName.split(' ').filter((w) => w.length >= 2);

  // Mots d'exclusion génériques
  const stopWords = new Set([
    'nda', 'accord', 'confidentialite', 'signe', 'signee', 'signed', 'enr',
    'courtage', 'sas', 'pdf', 'doc', 'docx', 'bilateral', 'convention', 'version',
    'final', 'v1', 'v2', 'fr', 'com', 'org', 'le', 'la', 'les', 'de', 'du', 'des', 'et'
  ]);

  const meaningfulWords = words.filter((w) => !stopWords.has(w));

  let bestMatch = null;
  let highestScore = 0;

  for (const inv of investors) {
    if (!inv || typeof inv !== 'object') continue;

    let score = 0;
    const invName = cleanText(inv.name);
    const invCompany = cleanText(inv.company);
    const invEmail = (inv.email || '').toLowerCase().trim();
    const invDivers = cleanText(inv.divers);

    // 1. Match direct sur le nom de l'entreprise (Score très élevé)
    if (invCompany && invCompany.length >= 3) {
      const companyWords = invCompany.split(' ').filter((w) => !stopWords.has(w) && w.length >= 3);
      for (const cw of companyWords) {
        if (cleanedFileName.includes(cw)) {
          score += 50 + cw.length * 2;
        }
      }
      if (cleanedFileName.includes(invCompany)) {
        score += 80;
      }
    }

    // 2. Match sur le nom du signataire (nom ou prénom)
    if (invName && invName.length >= 3) {
      const nameParts = invName.split(' ').filter((w) => !stopWords.has(w) && w.length >= 3);
      for (const np of nameParts) {
        if (cleanedFileName.includes(np)) {
          score += 40 + np.length * 2;
        }
      }
      if (cleanedFileName.includes(invName)) {
        score += 70;
      }
    }

    // 3. Match sur le champ 'divers' (ex: "ALBIOMA", "Jean DUS (ENEE)", etc.)
    if (invDivers && invDivers.length >= 3) {
      const divParts = invDivers.split(' ').filter((w) => !stopWords.has(w) && w.length >= 3);
      for (const dp of divParts) {
        if (cleanedFileName.includes(dp)) {
          score += 35 + dp.length;
        }
      }
    }

    // 4. Match sur le domaine e-mail
    if (invEmail.includes('@')) {
      const [emailUser, emailDomain] = invEmail.split('@');
      const domainName = emailDomain.split('.')[0];
      if (domainName && domainName.length >= 3 && !['gmail', 'hotmail', 'yahoo', 'msn', 'outlook'].includes(domainName)) {
        if (cleanedFileName.includes(cleanText(domainName))) {
          score += 45;
        }
      }
      if (emailUser && emailUser.length >= 4) {
        const cleanUser = cleanText(emailUser);
        if (cleanedFileName.includes(cleanUser)) {
          score += 30;
        }
      }
    }

    // Règles d'alias spécifiques
    const fnLower = cleanedFileName;
    if (fnLower.includes('albioma') && (invCompany.includes('albioma') || invEmail.includes('albioma'))) score += 100;
    if (fnLower.includes('altarea') && (invCompany.includes('altarea') || invEmail.includes('altarea'))) score += 100;
    if (fnLower.includes('babel') && (invCompany.includes('babel') || invEmail.includes('babel'))) score += 100;
    if (fnLower.includes('caap') && (invCompany.includes('caap') || invEmail.includes('caap'))) score += 100;
    if (fnLower.includes('devenco') && (invCompany.includes('devenco') || invEmail.includes('devenco'))) score += 100;
    if (fnLower.includes('digitalsun') && (invCompany.includes('digitalsun') || invEmail.includes('digitalsun'))) score += 100;
    if (fnLower.includes('enee') && (invCompany.includes('enee') || invDivers.includes('enee'))) score += 100;
    if (fnLower.includes('enoe') && (invCompany.includes('enoe') || invEmail.includes('enoe'))) score += 100;
    if (fnLower.includes('girasole') && (invCompany.includes('girasole') || invEmail.includes('girasole'))) score += 100;
    if (fnLower.includes('green invest') || fnLower.includes('barconniere')) {
      if (invCompany.includes('green') || invEmail.includes('barconniere')) score += 100;
    }
    if (fnLower.includes('ingelyo') && (invCompany.includes('ingelyo') || invEmail.includes('ingelyo'))) score += 100;
    if (fnLower.includes('mcel') && (invCompany.includes('mcel') || invEmail.includes('mcel'))) score += 100;
    if (fnLower.includes('melvan') && (invCompany.includes('melvan') || invEmail.includes('melvan'))) score += 100;
    if ((fnLower.includes('nass') || fnLower.includes('wind')) && (invCompany.includes('nass') || invEmail.includes('nass'))) score += 100;
    if (fnLower.includes('noep') || fnLower.includes('nicoli')) {
      if (invCompany.includes('noep') || invName.includes('nicoli') || invEmail.includes('nicoli')) score += 100;
    }
    if (fnLower.includes('prosolia') && (invCompany.includes('prosolia') || invEmail.includes('prosolia'))) score += 100;
    if (fnLower.includes('solstyce') && (invCompany.includes('solstyce') || invEmail.includes('solstyce'))) score += 100;
    if (fnLower.includes('stratelyo') && (invCompany.includes('stratelyo') || invEmail.includes('stratelyo'))) score += 100;
    if (fnLower.includes('sunrock') && (invCompany.includes('sunrock') || invEmail.includes('sunrock'))) score += 100;
    if (fnLower.includes('sunvolt') && (invCompany.includes('sunvolt') || invEmail.includes('sunvolt'))) score += 100;
    if (fnLower.includes('synapstor') && (invCompany.includes('synapstor') || invEmail.includes('synapstor'))) score += 100;
    if (fnLower.includes('valorem') && (invCompany.includes('valorem') || invEmail.includes('valorem'))) score += 100;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = inv;
    }
  }

  // Seuil minimum de pertinence
  if (highestScore >= 30) {
    return {
      investor: bestMatch,
      score: highestScore,
      matchReason: `Correspondance détectée (${bestMatch.company || bestMatch.name})`,
    };
  }

  return null;
}
