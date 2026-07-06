import { Card, toHandNotation } from "./cards";
import { shuffledDeck } from "./deck";
import {
  analyzeDraws,
  DrawAnalysis,
  DrawType,
  estimateEquityFromOuts,
  isDrawingHand,
  OUTS,
} from "./draws";
import { computePotOdds, Decision, potOddsVerdict, PotOddsResult } from "./potOdds";
import { Position, POSITIONS, PreflopSituation } from "./preflop";
import { PREFLOP_ORDER } from "./positions";

const ONE_CARD_TO_COME = 1;

/** Candidate pot sizes (in big-blind chips) for generated pot-odds spots. */
const POT_SIZES = [20, 30, 40, 50, 60, 80, 100] as const;

/** Bet sizes as a fraction of the pot. */
const BET_FRACTIONS = [0.33, 0.5, 0.66, 0.75, 1] as const;

const DEFAULT_OUTS_TRIES = 40;
const DEFAULT_POT_ODDS_TRIES = 60;
const RFI_PROBABILITY = 0.5;

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export interface OutsScenario {
  hole: Card[];
  flop: Card[];
  analysis: DrawAnalysis;
}

/** Deal hero + flop, retrying to favor a teachable draw. */
export function generateOutsScenario(maxTries = DEFAULT_OUTS_TRIES): OutsScenario {
  let fallback: OutsScenario | null = null;
  for (let i = 0; i < maxTries; i++) {
    const deck = shuffledDeck();
    const hole = [deck.pop()!, deck.pop()!];
    const flop = [deck.pop()!, deck.pop()!, deck.pop()!];
    const analysis = analyzeDraws(hole, flop);
    const scenario = { hole, flop, analysis };
    if (!fallback) fallback = scenario;
    if (isDrawingHand(analysis.drawType)) return scenario;
  }
  return fallback!;
}

export interface PotOddsScenario {
  hole: Card[];
  board: Card[]; // turn (4 cards)
  pot: number;
  bet: number;
  analysis: DrawAnalysis;
  odds: PotOddsResult;
  heroEquity: number;
  correct: Decision;
}

/** Deal hero + turn with a live draw, plus a random bet, for a pot-odds decision. */
export function generatePotOddsScenario(
  maxTries = DEFAULT_POT_ODDS_TRIES,
): PotOddsScenario {
  let fallback: PotOddsScenario | null = null;

  for (let i = 0; i < maxTries; i++) {
    const deck = shuffledDeck();
    const hole = [deck.pop()!, deck.pop()!];
    const board = [deck.pop()!, deck.pop()!, deck.pop()!, deck.pop()!];
    const analysis = analyzeDraws(hole, board);

    const pot = pickRandom(POT_SIZES);
    const bet = Math.round(pot * pickRandom(BET_FRACTIONS));
    const odds = computePotOdds({ pot, bet });
    const heroEquity = estimateEquityFromOuts(analysis.outs, ONE_CARD_TO_COME);
    const correct = potOddsVerdict(odds.requiredEquity, heroEquity);

    const scenario: PotOddsScenario = {
      hole,
      board,
      pot,
      bet,
      analysis,
      odds,
      heroEquity,
      correct,
    };
    if (!fallback) fallback = scenario;

    if (analysis.outs > OUTS.NONE && analysis.drawType !== DrawType.MadeHand) {
      return scenario;
    }
  }
  return fallback!;
}

export interface PreflopScenario {
  hole: Card[];
  hand: string; // 169-notation
  position: Position;
  situation: PreflopSituation;
  /** For a vsRaise spot: the earlier seat that opened before hero. */
  openerPosition?: Position;
}

/**
 * Deal a preflop spot. Pass `forcePosition` to drill a specific seat; otherwise
 * a random position is chosen so every seat is practiced.
 *
 * The available situation depends on position *relative to the other players*:
 * - UTG acts first, so it can only be raise-first-in (never facing a raise).
 * - The Big Blind is never folded to, so it always faces a raise.
 * - Facing a raise requires at least one earlier seat to have opened.
 */
export function generatePreflopScenario(
  forcePosition?: Position,
): PreflopScenario {
  const deck = shuffledDeck();
  const hole = [deck.pop()!, deck.pop()!];
  const hand = toHandNotation(hole[0], hole[1]);
  const position = forcePosition ?? pickRandom(POSITIONS);

  const earlierSeats = PREFLOP_ORDER.slice(0, PREFLOP_ORDER.indexOf(position));
  const canRfi = position !== Position.BB;
  const canFaceRaise = earlierSeats.length > 0;

  let situation: PreflopSituation;
  if (canRfi && canFaceRaise) {
    situation =
      Math.random() < RFI_PROBABILITY
        ? PreflopSituation.Rfi
        : PreflopSituation.VsRaise;
  } else if (canFaceRaise) {
    situation = PreflopSituation.VsRaise;
  } else {
    situation = PreflopSituation.Rfi;
  }

  const openerPosition =
    situation === PreflopSituation.VsRaise ? pickRandom(earlierSeats) : undefined;

  return { hole, hand, position, situation, openerPosition };
}
