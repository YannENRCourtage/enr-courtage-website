/**
 * Utilitaires transactionnels M&A : formatage nqmérique & calcul des jalons
 */

/**
 * Formate un nombre ou une chaîne avec des espaces comme séparateurs de milliers.
 * Ex : '5000000' -> '5 000 000', 1250000 -> '1 250 000'
 */
export function formatThousands(val) {
  if (val === null || val === undefined || val === '') return '';
  const digits = String(val).replace(/[^0-9]/g, '');
  if (!digits) return '';
  return Number(digits).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Nettoie une chaîne formatée pour en extraire le nombre entier/décimal.
 * Ex : '5 000 000' -> 5000000
 */
export function parseThousands(val) {
  if (val === null || val === undefined || val === '') return 0;
  const cleaned = String(val).replace(/[^0-9.,]/g, '').replace(',', '.');
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Áquilibre automatiquement un tableau de jalons pour que le total fasse strictement 100%.
 * Règle utilisateur :
 * - Si on augmente/diminue un jalon i < n-1, c'est le dernier jalon (n-1) qui est réduit/augmenté en conséquence.
 * - Si le dernier jalon atteint 0 ou 100, la compensation se reporte sur les jalons précédents.
 * - Si c'est le dernier jalon (n-1) qui est modifié, c'est son jalon précédent (n-2) qui est ajusté en conséquence.
 */
export function autoBalanceMilestones(milestones, changedIndex, requestedValue) {
  if (!milestones || milestones.length <= 1) return milestones;

  const clampedVal = Math.max(0, Math.min(100, Number(requestedValue) || 0));
  const newMilestones = milestones.map((m) => ({ ...m }));
  const oldVal = Number(newMilestones[changedIndex]?.percentage) || 0;
  const diff = clampedVal - oldVal;

  if (diff === 0) return newMilestones;
  newMilestones[changedIndex].percentage = clampedVal;

  let remainingDiff = diff;
  const n = newMilestones.length;

  if (changedIndex === n - 1) {
    for (let i = n - 2; i >= 0 && remainingDiff !== 0; i--) {
      const cur = Number(newMilestones[i].percentage) || 0;
      if (remainingDiff > 0) {
        const deduction = Math.min(cur, remainingDiff);
        newMilestones[i].percentage = cur - deduction;
        remainingDiff -= deduction;
      } else {
        const addition = Math.min(100 - cur, -remainingDiff);
        newMilestones[i].percentage = cur + addition;
        remainingDiff += addition;
      }
    }
  } else {
    const indicesToAdjust = [];
    for (let i = n - 1; i >= 0; i--) {
      if (i !== changedIndex) indicesToAdjust.push(i);
    }
    for (const i of indicesToAdjust) {
      if (remainingDiff === 0) break;
      const cur = Number(newMilestones[i].percentage) || 0;
      if (remainingDiff > 0) {
        const deduction = Math.min(cur, remainingDiff);
        newMilestones[i].percentage = cur - deduction;
        remainingDiff -= deduction;
      } else {
        const addition = Math.min(100 - cur, -remainingDiff);
        newMilestones[i].percentage = cur + addition;
        remainingDiff += addition;
      }
    }
  }

  const currentTotal = newMilestones.reduce((s, m) => s + (Number(m.percentage) || 0), 0);
  if (currentTotal !== 100) {
    const adjIdx = changedIndex === n - 1 ? (n > 1 ? n - 2 : 0) : n - 1;
    newMilestones[adjIdx].percentage = Math.max(0, Math.min(100, newMilestones[adjIdx].percentage + (100 - currentTotal)));
  }

  return newMilestones;
}
