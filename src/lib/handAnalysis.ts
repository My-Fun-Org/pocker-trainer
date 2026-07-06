import {
  analyzeBoardTexture,
  analyzeDraws,
  Card,
  CATEGORY_NAME,
  evaluate,
  HandCategory,
  parseCard,
  Texture,
  toHandNotation,
} from "@/lib/poker";

export interface ParsedHand {
  hero: Card[];
  flop: Card[];
  turn: Card[];
  river: Card[];
  /** Hero's action per street, best-effort. */
  actions: Record<string, string[]>;
}

export interface StreetReview {
  street: string;
  assessment: string;
  mistake?: string;
  alternative?: string;
}

export interface HandReview {
  perStreet: StreetReview[];
  summary: string;
}

const CARD_RE = /([2-9TJQKA][shdc])/gi;

function cardsFrom(segment: string | undefined, max: number): Card[] {
  if (!segment) return [];
  const matches = segment.match(CARD_RE) ?? [];
  return matches.slice(0, max).map((m) => parseCard(m));
}

/** Best-effort parser for common PokerStars/GG-style hand-history text. */
export function parseHandHistory(text: string): ParsedHand {
  const heroMatch = text.match(/Dealt to \w+\s*\[([^\]]+)\]/i);
  const flopMatch = text.match(/\*\*\*\s*FLOP\s*\*\*\*\s*\[([^\]]+)\]/i);
  const turnMatch = text.match(/\*\*\*\s*TURN\s*\*\*\*\s*\[[^\]]+\]\s*\[([^\]]+)\]/i);
  const riverMatch = text.match(/\*\*\*\s*RIVER\s*\*\*\*\s*\[[^\]]+\]\s*\[([^\]]+)\]/i);

  const heroLine = /Hero:.*/gi;
  const heroActions = (text.match(heroLine) ?? []).map((l) => l.replace(/^Hero:\s*/i, "").trim());

  return {
    hero: cardsFrom(heroMatch?.[1], 2),
    flop: cardsFrom(flopMatch?.[1], 3),
    turn: cardsFrom(turnMatch?.[1], 1),
    river: cardsFrom(riverMatch?.[1], 1),
    actions: { all: heroActions },
  };
}

function heroAction(hand: ParsedHand): string {
  return (hand.actions.all ?? []).join(" ").toLowerCase();
}

/** Deterministic street-by-street review using the poker engine. */
export function reviewHand(hand: ParsedHand): HandReview {
  const perStreet: StreetReview[] = [];
  const hero = hand.hero;
  const acts = heroAction(hand);

  if (hero.length === 2) {
    const notation = toHandNotation(hero[0], hero[1]);
    perStreet.push({
      street: "Preflop",
      assessment: `You held ${notation}. ${describePreflop(notation)}`,
    });
  }

  const flop = hand.flop;
  if (flop.length === 3) {
    const texture = analyzeBoardTexture(flop);
    const made = evaluate([...hero, ...flop]);
    const draws = analyzeDraws(hero, flop);
    const review: StreetReview = {
      street: "Flop",
      assessment: `Board is ${texture.texture.replace("-", " ")}. You have ${made.name.toLowerCase()}${
        draws.outs > 0 ? ` with ${draws.outs} outs` : ""
      }.`,
    };
    if ((texture.texture === Texture.Wet || texture.texture === Texture.VeryWet) && /bets?\b/.test(acts) && /1\/4|1\/3|small/.test(acts)) {
      review.mistake = "Under-bet a wet board";
      review.alternative = "Size up to 2/3+ to charge the many draws and protect your equity.";
    }
    perStreet.push(review);
  }

  const turnBoard = [...flop, ...hand.turn];
  if (turnBoard.length === 4) {
    const made = evaluate([...hero, ...turnBoard]);
    perStreet.push({
      street: "Turn",
      assessment: `On the turn you have ${made.name.toLowerCase()}. ${
        made.category >= HandCategory.TwoPair
          ? "A strong hand - keep building the pot."
          : "A marginal hand - control the pot size."
      }`,
    });
  }

  const riverBoard = [...turnBoard, ...hand.river];
  if (riverBoard.length === 5) {
    const made = evaluate([...hero, ...riverBoard]);
    const review: StreetReview = {
      street: "River",
      assessment: `Final hand: ${made.name.toLowerCase()}.`,
    };
    if (made.category <= HandCategory.Pair && /calls?\b/.test(acts) && /raise/.test(acts)) {
      review.mistake = "Paid off a raise with one pair";
      review.alternative = "One pair is a bluff-catcher at best; against a raise it is often a fold.";
    }
    perStreet.push(review);
  }

  const mistakes = perStreet.filter((s) => s.mistake).map((s) => s.mistake!);
  const summary =
    mistakes.length === 0
      ? "No clear leaks flagged from the available detail - decisions look reasonable given the info."
      : `Key leaks: ${mistakes.join("; ")}. Focus your study there.`;

  return { perStreet, summary };
}

function describePreflop(notation: string): string {
  const pair = notation.length === 2 && notation[0] === notation[1];
  if (pair) return "A pocket pair - value depends on set-mining odds and stack depth.";
  if (notation.startsWith("A")) return "An ace-x hand - kicker and suitedness decide its playability.";
  if (notation.endsWith("s")) return "A suited hand with extra flush and straight potential.";
  return "An offsuit hand - be mindful of domination and position.";
}

export const CATEGORY_NAMES = CATEGORY_NAME;
