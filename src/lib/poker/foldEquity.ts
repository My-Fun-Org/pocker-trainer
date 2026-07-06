const PERCENT = 100;

/**
 * Break-even fold percentage for a pure bluff: risk / (risk + reward).
 * Betting `bet` into `pot` needs villain to fold this often to be +EV as a bluff.
 */
export function breakEvenFold(bet: number, pot: number): number {
  if (bet + pot <= 0) return 0;
  return (bet / (bet + pot)) * PERCENT;
}

/**
 * Minimum defense frequency: how often the bettor's opponent must continue so
 * the bettor cannot profitably bluff any two cards. MDF = pot / (pot + bet).
 */
export function minDefenseFrequency(bet: number, pot: number): number {
  if (bet + pot <= 0) return PERCENT;
  return (pot / (pot + bet)) * PERCENT;
}

/**
 * Combined EV signal for a semi-bluff: fold equity plus equity when called.
 * Returns a 0-100 "aggression score"; higher favors betting/raising.
 */
export function semiBluffScore(
  estimatedFoldPct: number,
  equityWhenCalledPct: number,
): number {
  const foldShare = estimatedFoldPct;
  const calledShare = ((PERCENT - estimatedFoldPct) / PERCENT) * equityWhenCalledPct;
  return Math.min(PERCENT, foldShare + calledShare);
}
