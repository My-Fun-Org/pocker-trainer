const PERCENT = 100;

/** Call/fold decision, referenced as values instead of raw strings. */
export const Decision = {
  Call: "call",
  Fold: "fold",
} as const;

export type Decision = (typeof Decision)[keyof typeof Decision];

export const DECISION_LABEL: Record<Decision, string> = {
  [Decision.Call]: "Call",
  [Decision.Fold]: "Fold",
};

export interface PotOddsInput {
  /** Pot size before the opponent's bet. */
  pot: number;
  /** Amount the opponent just bet. */
  bet: number;
}

export interface PotOddsResult {
  /** Amount hero must call (equal to the bet in a heads-up spot). */
  callAmount: number;
  /** Total pot hero would win if they call (pot + bet + call). */
  finalPot: number;
  /** Equity hero needs to break even, as a percentage 0-100. */
  requiredEquity: number;
  /** Pot odds expressed as "X to 1". */
  oddsRatio: number;
}

/**
 * Required equity = call / (pot + bet + call).
 * Heads-up, hero's call equals the opponent's bet.
 */
export function computePotOdds({ pot, bet }: PotOddsInput): PotOddsResult {
  const callAmount = bet;
  const finalPot = pot + bet + callAmount;
  const requiredEquity = (callAmount / finalPot) * PERCENT;
  const oddsRatio = (pot + bet) / callAmount;
  return { callAmount, finalPot, requiredEquity, oddsRatio };
}

/** Correct decision: call when hero equity meets or beats the required equity. */
export function potOddsVerdict(
  requiredEquity: number,
  heroEquity: number,
): Decision {
  return heroEquity >= requiredEquity ? Decision.Call : Decision.Fold;
}
