/** Stack-to-pot ratio helpers. */

export const SprBucket = {
  VeryLow: "~1",
  Low: "~2",
  Medium: "~4",
  High: "~7",
  VeryHigh: "13+",
} as const;

export type SprBucket = (typeof SprBucket)[keyof typeof SprBucket];

export const SPR_BUCKETS: SprBucket[] = [
  SprBucket.VeryLow,
  SprBucket.Low,
  SprBucket.Medium,
  SprBucket.High,
  SprBucket.VeryHigh,
];

/** SPR = effective stack / pot. */
export function spr(potBB: number, effectiveStackBB: number): number {
  if (potBB <= 0) return Infinity;
  return effectiveStackBB / potBB;
}

/** Snap a raw SPR to the nearest teaching bucket. */
export function sprBucket(value: number): SprBucket {
  if (value < 1.5) return SprBucket.VeryLow;
  if (value < 3) return SprBucket.Low;
  if (value < 5.5) return SprBucket.Medium;
  if (value < 10) return SprBucket.High;
  return SprBucket.VeryHigh;
}

/** Strength class of hero's made hand, for commitment advice. */
export const HandClass = {
  Overpair: "overpair",
  TopPair: "top-pair",
  MiddlePair: "middle-pair",
  Set: "set",
  TwoPair: "two-pair",
  Draw: "draw",
} as const;

export type HandClass = (typeof HandClass)[keyof typeof HandClass];

export interface CommitmentAdvice {
  committed: boolean;
  reason: string;
}

/** Whether a one-pair-class hand is committed at a given SPR. */
export function commitmentAdvice(
  value: number,
  handClass: HandClass,
): CommitmentAdvice {
  const strong = handClass === HandClass.Set || handClass === HandClass.TwoPair;
  if (strong) {
    return {
      committed: true,
      reason: `${handClass} is strong enough to commit at almost any SPR.`,
    };
  }
  const onePairish =
    handClass === HandClass.Overpair ||
    handClass === HandClass.TopPair ||
    handClass === HandClass.MiddlePair;
  if (!onePairish) {
    return {
      committed: false,
      reason: "A draw is rarely committed; it wants to realize equity cheaply.",
    };
  }
  if (value <= 3) {
    return {
      committed: true,
      reason: `At SPR ${value.toFixed(1)} a one-pair hand is happy to get it in - there is little room to be outdrawn or bluffed.`,
    };
  }
  if (value <= 6) {
    return {
      committed: handClass === HandClass.Overpair,
      reason: `At SPR ${value.toFixed(1)} it is a marginal, one-to-two-street hand; overpairs lean committed, top pair does not.`,
    };
  }
  return {
    committed: false,
    reason: `At SPR ${value.toFixed(1)} one pair is a pot-control hand - keep the pot small and avoid stacking off.`,
  };
}
