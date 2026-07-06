export type Suit = "s" | "h" | "d" | "c";
export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "T"
  | "J"
  | "Q"
  | "K"
  | "A";

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const RANKS: Rank[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
];

export const SUITS: Suit[] = ["s", "h", "d", "c"];

/** Structural constants of the game, used instead of magic numbers. */
export const CARD_CONSTANTS = {
  STRAIGHT_LENGTH: 5,
  ACE_HIGH_VALUE: 14,
  ACE_LOW_VALUE: 1,
  MIN_RANK_VALUE: 2,
  MAX_RANK_VALUE: 14,
  RANKS_PER_SUIT: 13,
  SUIT_COUNT: 4,
  HOLE_CARDS: 2,
  FLOP_SIZE: 3,
  TURN_SIZE: 4,
  BOARD_FULL: 5,
} as const;

export const SUIT_SYMBOL: Record<Suit, string> = {
  s: "\u2660", // spades
  h: "\u2665", // hearts
  d: "\u2666", // diamonds
  c: "\u2663", // clubs
};

export const SUIT_IS_RED: Record<Suit, boolean> = {
  s: false,
  h: true,
  d: true,
  c: false,
};

/** Numeric value used for straight/high-card comparisons. Ace high = 14. */
export const RANK_VALUE: Record<Rank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

/** Parse a string like "As" or "Th" into a Card. */
export function parseCard(str: string): Card {
  const rank = str[0].toUpperCase() as Rank;
  const suit = str[1].toLowerCase() as Suit;
  if (!RANKS.includes(rank) || !SUITS.includes(suit)) {
    throw new Error(`Invalid card: ${str}`);
  }
  return { rank, suit };
}

export function parseCards(strs: string[]): Card[] {
  return strs.map(parseCard);
}

export function formatCard(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function cardValue(card: Card): number {
  return RANK_VALUE[card.rank];
}

export function sameCard(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

/**
 * Convert two hole cards into 169-hand notation, e.g. "AKs", "AKo", "TT".
 */
export function toHandNotation(a: Card, b: Card): string {
  const [hi, lo] =
    RANK_VALUE[a.rank] >= RANK_VALUE[b.rank] ? [a, b] : [b, a];
  if (hi.rank === lo.rank) return `${hi.rank}${lo.rank}`;
  const suited = hi.suit === lo.suit ? "s" : "o";
  return `${hi.rank}${lo.rank}${suited}`;
}
