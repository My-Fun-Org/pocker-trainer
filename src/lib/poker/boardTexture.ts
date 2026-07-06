import { Card, CARD_CONSTANTS, RANK_VALUE, Suit } from "./cards";

/** Board texture classifications, referenced as values instead of raw strings. */
export const Texture = {
  Dry: "dry",
  Wet: "wet",
  VeryWet: "very-wet",
} as const;

export type Texture = (typeof Texture)[keyof typeof Texture];

export const TEXTURE_LABEL: Record<Texture, string> = {
  [Texture.Dry]: "Dry",
  [Texture.Wet]: "Wet",
  [Texture.VeryWet]: "Very Wet",
};

export const TEXTURE_OPTIONS: Texture[] = [
  Texture.Dry,
  Texture.Wet,
  Texture.VeryWet,
];

/** Narrow an arbitrary string (e.g. from JSON) to a Texture, or throw. */
export function parseTexture(value: string): Texture {
  const match = TEXTURE_OPTIONS.find((t) => t === value);
  if (!match) throw new Error(`Unknown texture: ${value}`);
  return match;
}

/** Heuristic weights used to score coordination. */
const SCORE = {
  MONOTONE: 3,
  TWO_TONE: 1,
  TIGHTLY_CONNECTED: 2,
  CONNECTED: 1,
} as const;

const THRESHOLD = {
  VERY_WET: 3,
  WET: 1,
} as const;

const MONOTONE_SUIT_COUNT = 3;
const TWO_TONE_SUIT_COUNT = 2;
const TIGHT_SPAN = 2;
const CONNECTED_SPAN = 4;
const BROADWAY_MIN_VALUE = 10;

export interface TextureAnalysis {
  texture: Texture;
  score: number;
  reasons: string[];
}

/** Classify a flop as dry / wet / very-wet using flush and straight coordination. */
export function analyzeBoardTexture(flop: Card[]): TextureAnalysis {
  const reasons: string[] = [];
  let score = 0;

  const suitCounts = new Map<Suit, number>();
  for (const c of flop) suitCounts.set(c.suit, (suitCounts.get(c.suit) ?? 0) + 1);
  const maxSuit = Math.max(...suitCounts.values());
  if (maxSuit === MONOTONE_SUIT_COUNT) {
    score += SCORE.MONOTONE;
    reasons.push("Monotone (three of one suit) - flushes are already possible.");
  } else if (maxSuit === TWO_TONE_SUIT_COUNT) {
    score += SCORE.TWO_TONE;
    reasons.push("Two-tone - a flush draw is available.");
  } else {
    reasons.push("Rainbow - no flush draws.");
  }

  const distinct = [...new Set(flop.map((c) => RANK_VALUE[c.rank]))].sort(
    (a, b) => a - b,
  );
  const paired = distinct.length < flop.length;
  if (paired) {
    reasons.push("Paired board - fewer two-card combos connect.");
  }
  if (distinct.length === CARD_CONSTANTS.FLOP_SIZE) {
    const span = distinct[distinct.length - 1] - distinct[0];
    if (span <= TIGHT_SPAN) {
      score += SCORE.TIGHTLY_CONNECTED;
      reasons.push("Tightly connected - many straights and straight draws.");
    } else if (span <= CONNECTED_SPAN) {
      score += SCORE.CONNECTED;
      reasons.push("Connected - several straight draws are live.");
    } else {
      reasons.push("Disconnected ranks - few straight draws.");
    }
  }

  const broadway = flop.filter(
    (c) => RANK_VALUE[c.rank] >= BROADWAY_MIN_VALUE,
  ).length;
  if (broadway >= CARD_CONSTANTS.FLOP_SIZE && !paired) {
    reasons.push("All broadway cards hit many preflop-calling ranges.");
  }

  let texture: Texture;
  if (score >= THRESHOLD.VERY_WET) texture = Texture.VeryWet;
  else if (score >= THRESHOLD.WET) texture = Texture.Wet;
  else texture = Texture.Dry;

  return { texture, score, reasons };
}
