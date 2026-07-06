import { Card, CARD_CONSTANTS, RANK_VALUE, Suit } from "./cards";
import { evaluate, HandCategory } from "./evaluator";

/** Draw classifications, referenced as values instead of raw strings. */
export const DrawType = {
  FlushDraw: "flush-draw",
  Oesd: "oesd",
  Gutshot: "gutshot",
  ComboDraw: "combo-draw",
  Overcards: "overcards",
  MadeHand: "made-hand",
  NoDraw: "no-draw",
} as const;

export type DrawType = (typeof DrawType)[keyof typeof DrawType];

export const DRAW_LABEL: Record<DrawType, string> = {
  [DrawType.FlushDraw]: "Flush Draw",
  [DrawType.Oesd]: "Open-Ended Straight Draw",
  [DrawType.Gutshot]: "Gutshot Straight Draw",
  [DrawType.ComboDraw]: "Combo Draw (flush + straight)",
  [DrawType.Overcards]: "Two Overcards",
  [DrawType.MadeHand]: "Made Hand",
  [DrawType.NoDraw]: "No Draw",
};

/** Standard teaching out-counts per draw. */
export const OUTS = {
  FLUSH_DRAW: 9,
  OESD: 8,
  GUTSHOT: 4,
  OVERCARDS: 6,
  NONE: 0,
} as const;

const OESD_COMPLETING_RANKS = 2;
const GUTSHOT_COMPLETING_RANKS = 1;
const RANKS_THAT_COMPLETE_STRAIGHT_OUT_MULTIPLIER = CARD_CONSTANTS.SUIT_COUNT;
const OVERCARD_OUTS_PER_CARD = 3;

/** Draw types that represent an unmade but drawing hand. */
const DRAWING_TYPES: ReadonlySet<DrawType> = new Set([
  DrawType.FlushDraw,
  DrawType.Oesd,
  DrawType.Gutshot,
  DrawType.ComboDraw,
]);

export function isDrawingHand(drawType: DrawType): boolean {
  return DRAWING_TYPES.has(drawType);
}

export interface DrawAnalysis {
  drawType: DrawType;
  outs: number;
  /** Equity estimate (0-100) from this street to the river. */
  equityToRiver: number;
  madeCategory: HandCategory;
  notes: string[];
}

const { ACE_HIGH_VALUE, ACE_LOW_VALUE, MIN_RANK_VALUE, STRAIGHT_LENGTH, BOARD_FULL } =
  CARD_CONSTANTS;
const NO_STRAIGHT = 0;
const FLUSH_DRAW_SUITED_COUNT = 4;

function straightHigh(values: Set<number>): number {
  const vals = new Set(values);
  if (vals.has(ACE_HIGH_VALUE)) vals.add(ACE_LOW_VALUE);
  const lowestStraightHigh = ACE_LOW_VALUE + STRAIGHT_LENGTH - 1;
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

/** Ranks that would complete a straight when added to the current cards. */
function straightCompletingRanks(values: number[]): number[] {
  const set = new Set(values);
  if (straightHigh(set) > NO_STRAIGHT) return []; // already a straight
  const completing: number[] = [];
  for (let r = ACE_HIGH_VALUE; r >= MIN_RANK_VALUE; r--) {
    if (set.has(r)) continue;
    const next = new Set(set);
    next.add(r);
    if (straightHigh(next) > NO_STRAIGHT) completing.push(r);
  }
  return completing;
}

/**
 * Analyze hero's draws given hole cards and the current board (flop or turn).
 */
export function analyzeDraws(hole: Card[], board: Card[]): DrawAnalysis {
  const all = [...hole, ...board];
  // Board cards still to come this hand (flop -> 2, turn -> 1).
  const streetCardsToCome = BOARD_FULL - board.length;
  const made = evaluate(all);
  const notes: string[] = [];

  // Flush draw: exactly four of one suit among seen cards.
  const suitCounts = new Map<Suit, number>();
  for (const c of all) suitCounts.set(c.suit, (suitCounts.get(c.suit) ?? 0) + 1);
  const flushDraw = [...suitCounts.values()].some(
    (n) => n === FLUSH_DRAW_SUITED_COUNT,
  );
  const flushOuts = flushDraw ? OUTS.FLUSH_DRAW : OUTS.NONE;

  // Straight draws
  const values = all.map((c) => RANK_VALUE[c.rank]);
  const completing = straightCompletingRanks(values);
  const straightRanks = completing.length;
  const straightOuts = straightRanks * RANKS_THAT_COMPLETE_STRAIGHT_OUT_MULTIPLIER;

  const strongMade = made.category >= HandCategory.TwoPair;

  let drawType: DrawType;
  let outs: number;

  if (flushDraw && straightRanks >= GUTSHOT_COMPLETING_RANKS) {
    drawType = DrawType.ComboDraw;
    // Remove flush-suit cards that also complete the straight to avoid double counting.
    outs = flushOuts + straightOuts - straightRanks;
    notes.push("Flush draw combined with a straight draw makes this a monster.");
  } else if (flushDraw) {
    drawType = DrawType.FlushDraw;
    outs = flushOuts;
    notes.push(
      `A four-flush needs one more of the suit; ${CARD_CONSTANTS.RANKS_PER_SUIT} - ${FLUSH_DRAW_SUITED_COUNT} = ${OUTS.FLUSH_DRAW} outs.`,
    );
  } else if (straightRanks >= OESD_COMPLETING_RANKS) {
    drawType = DrawType.Oesd;
    outs = OUTS.OESD;
    notes.push(
      `Open on both ends: two ranks complete the straight (${OESD_COMPLETING_RANKS} x ${RANKS_THAT_COMPLETE_STRAIGHT_OUT_MULTIPLIER} = ${OUTS.OESD} outs).`,
    );
  } else if (straightRanks === GUTSHOT_COMPLETING_RANKS) {
    drawType = DrawType.Gutshot;
    outs = OUTS.GUTSHOT;
    notes.push(
      `One inside rank completes the straight (${GUTSHOT_COMPLETING_RANKS} x ${RANKS_THAT_COMPLETE_STRAIGHT_OUT_MULTIPLIER} = ${OUTS.GUTSHOT} outs).`,
    );
  } else if (strongMade) {
    drawType = DrawType.MadeHand;
    outs = OUTS.NONE;
    notes.push(`You already have ${made.name.toLowerCase()}.`);
  } else {
    const boardMax = Math.max(...board.map((c) => RANK_VALUE[c.rank]));
    const bothOver = hole.every((c) => RANK_VALUE[c.rank] > boardMax);
    if (bothOver && made.category < HandCategory.Pair) {
      drawType = DrawType.Overcards;
      outs = OUTS.OVERCARDS;
      notes.push(
        `Two overcards can pair for the best hand (${CARD_CONSTANTS.HOLE_CARDS} x ${OVERCARD_OUTS_PER_CARD} = ${OUTS.OVERCARDS} outs).`,
      );
    } else {
      drawType = DrawType.NoDraw;
      outs = OUTS.NONE;
    }
  }

  const equityToRiver = estimateEquityFromOuts(outs, streetCardsToCome);

  return {
    drawType,
    outs,
    equityToRiver,
    madeCategory: made.category,
    notes,
  };
}

const RULE_OF_FOUR_MULTIPLIER = 4;
const RULE_OF_TWO_MULTIPLIER = 2;
const LARGE_OUTS_THRESHOLD = 8;
const SMALL_OUTS_THRESHOLD = 4;
const MAX_DRAW_EQUITY = 95;
const TWO_CARDS_TO_COME = 2;

/**
 * Rule of 2 and 4: two cards to come -> outs * 4 (corrected for large counts);
 * one card to come -> outs * 2.
 */
export function estimateEquityFromOuts(outs: number, cardsToCome: number): number {
  if (outs <= OUTS.NONE) return 0;
  if (cardsToCome >= TWO_CARDS_TO_COME) {
    const raw =
      outs > LARGE_OUTS_THRESHOLD
        ? outs * RULE_OF_FOUR_MULTIPLIER - (outs - LARGE_OUTS_THRESHOLD)
        : outs * RULE_OF_FOUR_MULTIPLIER;
    return Math.min(raw, MAX_DRAW_EQUITY);
  }
  const correction = outs > SMALL_OUTS_THRESHOLD ? 1 : 0;
  return Math.min(outs * RULE_OF_TWO_MULTIPLIER + correction, MAX_DRAW_EQUITY);
}
