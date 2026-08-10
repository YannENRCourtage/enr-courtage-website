/**
 * Helper to check if current environment is staging, preview (Vercel), or local test.
 * Features in test/development phase are visible on:
 * - https://enr-courtage-website.vercel.app
 * - Any *.vercel.app preview URLs
 * - Localhost / 127.0.0.1
 * - Any domain with ?test=true or ?preview=true URL parameter
 * 
 * And hidden on main production domain (www.enr-courtage.fr and enr-courtage.fr).
 */
export function isStagingOrTestEnvironment() {
  if (typeof window === 'undefined') return false;

  const host = window.location.hostname.toLowerCase();
  const search = window.location.search.toLowerCase();

  // Force show on test parameter
  if (search.includes('test=true') || search.includes('preview=true')) {
    return true;
  }

  // Show on Vercel preview domains & localhost
  if (host.includes('vercel.app') || host === 'localhost' || host === '127.0.0.1') {
    return true;
  }

  // Hide on official production domains
  if (host === 'www.enr-courtage.fr' || host === 'enr-courtage.fr') {
    return false;
  }

  // Default to true for any other preview domain
  return true;
}
