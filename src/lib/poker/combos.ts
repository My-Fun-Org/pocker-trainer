import { Card, sameCard } from "./cards";
import { baseCombos, expandRange, handToCards } from "./ranges";

function usesDead(combo: Card[], dead: Card[]): boolean {
  return combo.some((c) => dead.some((d) => sameCard(c, d)));
}

/**
 * Number of combos of a starting hand still available given dead cards
 * (board + known hole cards). Accounts for blocker/card-removal effects.
 */
export function comboCount(notation: string, dead: Card[] = []): number {
  if (dead.length === 0) return baseCombos(notation);
  return handToCards(notation).filter((combo) => !usesDead(combo, dead)).length;
}

/** Total combos across a whole range (tokens expanded), with card removal. */
export function expandRangeToCombos(tokens: string[], dead: Card[] = []): number {
  return expandRange(tokens).reduce(
    (sum, hand) => sum + comboCount(hand, dead),
    0,
  );
}

/** Per-hand combo breakdown for a range, sorted most-combos first. */
export interface ComboBreakdownEntry {
  hand: string;
  combos: number;
}

export function comboBreakdown(
  tokens: string[],
  dead: Card[] = [],
): ComboBreakdownEntry[] {
  return expandRange(tokens)
    .map((hand) => ({ hand, combos: comboCount(hand, dead) }))
    .filter((e) => e.combos > 0)
    .sort((a, b) => b.combos - a.combos);
}
