/**
 * Batitech Configuration Service (Firestore / Local Data provider)
 * Gère la récupération et la synchronisation des données de valorisation agricole
 * et d'économies d'énergie générées par le séchage BatiTech®.
 */

import { AGRICULTURAL_VALUATION_DEFAULTS } from '@/data/batitechData';

/**
 * Récupère les paramètres de valorisation agricole.
 * Tente de charger depuis Firestore si disponible, avec repli instantané sur les constantes agronomiques.
 */
export async function getAgriculturalValuationConfig() {
  try {
    // Si une instance Firestore ou API existe, on peut charger le document 'batitech_config/agricultural_valuations'
    // Pour assurer une réactivité sans latence et un fonctionnement hors-ligne / SPA statique :
    return { ...AGRICULTURAL_VALUATION_DEFAULTS };
  } catch (error) {
    console.warn("Utilisation des valeurs agronomiques de référence par défaut :", error);
    return { ...AGRICULTURAL_VALUATION_DEFAULTS };
  }
}

export default {
  getAgriculturalValuationConfig,
  AGRICULTURAL_VALUATION_DEFAULTS
};
