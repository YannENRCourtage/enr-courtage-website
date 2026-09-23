import crypto from 'crypto';

/**
 * Vercel Serverless Function : POST /api/investisseurs/documents/get-signed-url
 * Génère une URL signée temporaire à expiration courte (15 minutes) avec traçabilité NDA.
 */
export default async function handler(req, res) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
  }

  try {
    const { documentId, documentName, portfolioId, userEmail, userName, userCompany, ndaSigned } = req.body || {};

    if (!userEmail) {
      return res.status(401).json({ error: 'Authentification requise : email manquant.' });
    }

    const isAdmin = userEmail.trim().toLowerCase() === 'y.barberis@enr-courtage.fr';

    // Vérification du NDA obligatoire pour tout investisseur non admin
    if (!isAdmin && !ndaSigned) {
      return res.status(403).json({
        error: 'Accès refusé : signature bilatérale du NDA requise pour générer une URL signée de Data Room.',
        ndaRequired: true,
      });
    }

    // Expiration à 15 minutes (900 secondes)
    const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60;
    const secretKey = process.env.DATA_ROOM_SIGNING_SECRET || 'enr-courtage-mna-secret-key-2026';

    const payload = `${documentId || documentName}:${userEmail}:${expiresAt}`;
    const signature = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');

    // Résolution du chemin sécurisé vers la pièce
    const resolvedPath = (portfolioId === 'volta' || String(documentName || '').toLowerCase().includes('volta') || String(documentName || '').toLowerCase().includes('batterie'))
      ? '/documents/dataroom/Nouvelle_Promesse_de_bail_batterie_BATIOT_32220_MONGAUSY.pdf'
      : '/documents/dataroom/Promesse_de_bail_CONSOLI_signe.pdf';

    const signedUrl = `${resolvedPath}?token=${signature}&exp=${expiresAt}&uid=${encodeURIComponent(userEmail)}`;

    return res.status(200).json({
      success: true,
      documentName: documentName || 'Document_MNA.pdf',
      signedUrl,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      expiresInSeconds: 900,
      watermark: {
        investorName: userName || 'Investisseur Partenaire',
        investorEmail: userEmail,
        investorCompany: userCompany || '',
        watermarkNotice: `DOCUMENT CONFIDENTIEL SOUS NDA — COMMUNIQUÉ À ${(userName || userEmail).toUpperCase()} LE ${new Date().toISOString()}`,
      },
    });
  } catch (error) {
    console.error('Erreur génération URL signée Data Room:', error);
    return res.status(500).json({ error: 'Erreur interne lors de la sécurisation du document.' });
  }
}
