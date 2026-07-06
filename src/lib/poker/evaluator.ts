import { Card, CARD_CONSTANTS, RANK_VALUE, Suit } from "./cards";

const { STRAIGHT_LENGTH, ACE_HIGH_VALUE, ACE_LOW_VALUE, MAX_RANK_VALUE } =
  CARD_CONSTANTS;

/** Base for packing tiebreaker rank values into a single comparable score. */
const TIEBREAKER_BASE = MAX_RANK_VALUE + 1;
const TIEBREAKER_SLOTS = 5;

export enum HandCategory {
  HighCard = 0,
  Pair = 1,
  TwoPair = 2,
  ThreeOfAKind = 3,
  Straight = 4,
  Flush = 5,
  FullHouse = 6,
  FourOfAKind = 7,
  StraightFlush = 8,
}

export const CATEGORY_NAME: Record<HandCategory, string> = {
  [HandCategory.HighCard]: "High Card",
  [HandCategory.Pair]: "Pair",
  [HandCategory.TwoPair]: "Two Pair",
  [HandCategory.ThreeOfAKind]: "Three of a Kind",
  [HandCategory.Straight]: "Straight",
  [HandCategory.Flush]: "Flush",
  [HandCategory.FullHouse]: "Full House",
  [HandCategory.FourOfAKind]: "Four of a Kind",
  [HandCategory.StraightFlush]: "Straight Flush",
};

export interface HandResult {
  category: HandCategory;
  name: string;
  /** Comparable score; higher is better. */
  score: number;
}

/** Highest card of a straight from a set of rank values, or 0 if none. Handles the wheel (A-5). */
const NO_STRAIGHT = 0;

function straightHigh(values: Set<number>): number {
  const vals = new Set(values);
  if (vals.has(ACE_HIGH_VALUE)) vals.add(ACE_LOW_VALUE); // wheel: treat Ace as low
  const lowestStraightHigh = ACE_LOW_VALUE + STRAIGHT_LENGTH - 1; // 5-high wheel
  for (let high = ACE_HIGH_VALUE; high >= lowestStraightHigh; high--) {
    let ok = true;
    for (let k = 0; k < STRAIGHT_LENGTH; k++) {
      if (!vals.has(high - k)) {
        ok = false;
        break;
      }
    }
    if (ok) return high;
  }
  return NO_STRAIGHT;
}

/** Build a comparable score from category and ordered tiebreaker values. */
function makeScore(category: HandCategory, tiebreakers: number[]): number {
  let score = category;
  for (let i = 0; i < TIEBREAKER_SLOTS; i++) {
    score = score * TIEBREAKER_BASE + (tiebreakers[i] ?? 0);
  }
  return score;
}

/**
 * Evaluate the best 5-card poker hand from 5-7 cards.
 */
export function evaluate(cards: Card[]): HandResult {
  const values = cards.map((c) => RANK_VALUE[c.rank]).sort((a, b) => b - a);

  const countByValue = new Map<number, number>();
  for (const v of values) countByValue.set(v, (countByValue.get(v) ?? 0) + 1);

  const cardsBySuit = new Map<Suit, number[]>();
  for (const c of cards) {
    const arr = cardsBySuit.get(c.suit) ?? [];
    arr.push(RANK_VALUE[c.rank]);
    cardsBySuit.set(c.suit, arr);
  }

  // Flush / straight flush detection
  let flushValues: number[] | null = null;
  for (const arr of cardsBySuit.values()) {
    if (arr.length >= 5) {
      flushValues = [...arr].sort((a, b) => b - a);
      break;
    }
  }

  if (flushValues) {
    const sfHigh = straightHigh(new Set(flushValues));
    if (sfHigh) {
      return {
        category: HandCategory.StraightFlush,
        name: sfHigh === 14 ? "Royal Flush" : "Straight Flush",
        score: makeScore(HandCategory.StraightFlush, [sfHigh]),
      };
    }
  }

  // Group by count
  const groups = [...countByValue.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  const quad = groups.find((g) => g[1] === 4);
  if (quad) {
    const kicker = values.filter((v) => v !== quad[0])[0] ?? 0;
    return {
      category: HandCategory.FourOfAKind,
      name: CATEGORY_NAME[HandCategory.FourOfAKind],
      score: makeScore(HandCategory.FourOfAKind, [quad[0], kicker]),
    };
  }

  const trips = groups.filter((g) => g[1] === 3);
  const pairs = groups.filter((g) => g[1] === 2);

  if (trips.length >= 1 && (trips.length >= 2 || pairs.length >= 1)) {
    const tripVal = trips[0][0];
    const pairVal = trips.length >= 2 ? trips[1][0] : pairs[0][0];
    return {
      category: HandCategory.FullHouse,
      name: CATEGORY_NAME[HandCategory.FullHouse],
      score: makeScore(HandCategory.FullHouse, [tripVal, pairVal]),
    };
  }

  if (flushValues) {
    return {
      category: HandCategory.Flush,
      name: CATEGORY_NAME[HandCategory.Flush],
      score: makeScore(HandCategory.Flush, flushValues.slice(0, 5)),
    };
  }

  const stHigh = straightHigh(new Set(values));
  if (stHigh) {
    return {
      category: HandCategory.Straight,
      name: CATEGORY_NAME[HandCategory.Straight],
      score: makeScore(HandCategory.Straight, [stHigh]),
    };
  }

  if (trips.length >= 1) {
    const tripVal = trips[0][0];
    const kickers = values.filter((v) => v !== tripVal).slice(0, 2);
    return {
      category: HandCategory.ThreeOfAKind,
      name: CATEGORY_NAME[HandCategory.ThreeOfAKind],
      score: makeScore(HandCategory.ThreeOfAKind, [tripVal, ...kickers]),
    };
  }

  if (pairs.length >= 2) {
    const [hi, lo] = [pairs[0][0], pairs[1][0]];
    const kicker = values.filter((v) => v !== hi && v !== lo)[0] ?? 0;
    return {
      category: HandCategory.TwoPair,
      name: CATEGORY_NAME[HandCategory.TwoPair],
      score: makeScore(HandCategory.TwoPair, [hi, lo, kicker]),
    };
  }

  if (pairs.length === 1) {
    const pairVal = pairs[0][0];
    const kickers = values.filter((v) => v !== pairVal).slice(0, 3);
    return {
      category: HandCategory.Pair,
      name: CATEGORY_NAME[HandCategory.Pair],
      score: makeScore(HandCategory.Pair, [pairVal, ...kickers]),
    };
  }

  return {
    category: HandCategory.HighCard,
    name: CATEGORY_NAME[HandCategory.HighCard],
    score: makeScore(HandCategory.HighCard, values.slice(0, 5)),
  };
}

/** Compare two 7-card hands: positive if a wins, negative if b wins, 0 tie. */
export function compareHands(a: Card[], b: Card[]): number {
  return evaluate(a).score - evaluate(b).score;
}
