export const Position = {
  UTG: "UTG",
  MP: "MP",
  CO: "CO",
  BTN: "BTN",
  SB: "SB",
  BB: "BB",
} as const;

export type Position = (typeof Position)[keyof typeof Position];

export const POSITIONS: Position[] = [
  Position.UTG,
  Position.MP,
  Position.CO,
  Position.BTN,
  Position.SB,
  Position.BB,
];

export const POSITION_LABEL: Record<Position, string> = {
  [Position.UTG]: "Under the Gun",
  [Position.MP]: "Middle Position",
  [Position.CO]: "Cutoff",
  [Position.BTN]: "Button",
  [Position.SB]: "Small Blind",
  [Position.BB]: "Big Blind",
};

export const PreflopSituation = {
  /** Folded to hero: raise-first-in. */
  Rfi: "rfi",
  /** Facing a single open-raise. */
  VsRaise: "vsRaise",
} as const;

export type PreflopSituation =
  (typeof PreflopSituation)[keyof typeof PreflopSituation];

export const PreflopAction = {
  Fold: "fold",
  Call: "call",
  Raise: "raise",
  ThreeBet: "3bet",
} as const;

export type PreflopAction = (typeof PreflopAction)[keyof typeof PreflopAction];

export const PREFLOP_ACTION_LABEL: Record<PreflopAction, string> = {
  [PreflopAction.Fold]: "Fold",
  [PreflopAction.Call]: "Call",
  [PreflopAction.Raise]: "Raise",
  [PreflopAction.ThreeBet]: "3-Bet",
};

export interface PositionRange {
  /** Raise-first-in range when folded to hero. */
  rfi: { raise: string[] };
  /** Response ranges when facing a single open-raise. */
  vsRaise: { call: string[]; threeBet: string[] };
}

export type PreflopChart = Record<Position, PositionRange>;

export interface PreflopVerdict {
  action: PreflopAction;
  reason: string;
}

function inRange(hand: string, range: string[]): boolean {
  return range.includes(hand);
}

/**
 * Determine the chart-correct preflop action for a hand.
 * - Rfi: pot folded to hero -> raise if in RFI range, otherwise fold.
 * - VsRaise: facing an open -> 3-bet, call, or fold per the chart.
 */
export function correctPreflopAction(
  chart: PreflopChart,
  position: Position,
  situation: PreflopSituation,
  hand: string,
): PreflopVerdict {
  const ranges = chart[position];

  if (situation === PreflopSituation.Rfi) {
    if (inRange(hand, ranges.rfi.raise)) {
      return {
        action: PreflopAction.Raise,
        reason: `${hand} is a standard open-raise from ${POSITION_LABEL[position]}.`,
      };
    }
    return {
      action: PreflopAction.Fold,
      reason: `${hand} is outside the ${POSITION_LABEL[position]} opening range - too weak or too easily dominated to open.`,
    };
  }

  if (inRange(hand, ranges.vsRaise.threeBet)) {
    return {
      action: PreflopAction.ThreeBet,
      reason: `${hand} is strong enough to 3-bet for value or as a balanced bluff from ${POSITION_LABEL[position]}.`,
    };
  }
  if (inRange(hand, ranges.vsRaise.call)) {
    return {
      action: PreflopAction.Call,
      reason: `${hand} plays well as a call - good enough to continue but not to 3-bet.`,
    };
  }
  return {
    action: PreflopAction.Fold,
    reason: `${hand} should be folded facing a raise from ${POSITION_LABEL[position]} - it is dominated too often.`,
  };
}
