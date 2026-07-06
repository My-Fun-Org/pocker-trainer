import { Card } from "./cards";
import { shuffledDeck } from "./deck";
import { evaluate } from "./evaluator";

export interface EquityResult {
  /** Hero win probability including split-pot fractions, 0-100. */
  equity: number;
  iterations: number;
}

/**
 * Monte Carlo equity of hero's hand vs `opponents` random hands, running out
 * the remaining board. Cheap and good enough for training feedback.
 */
export function monteCarloEquity(
  hole: Card[],
  board: Card[],
  opponents = 1,
  iterations = 2000,
): EquityResult {
  let wins = 0;
  let ties = 0;

  for (let i = 0; i < iterations; i++) {
    const dead = [...hole, ...board];
    const deck = shuffledDeck(dead);

    const villains: Card[][] = [];
    for (let v = 0; v < opponents; v++) {
      villains.push([deck.pop()!, deck.pop()!]);
    }
    const runout = [...board];
    while (runout.length < 5) runout.push(deck.pop()!);

    const heroScore = evaluate([...hole, ...runout]).score;
    let best = heroScore;
    let tiedWith = 0;
    for (const villain of villains) {
      const vScore = evaluate([...villain, ...runout]).score;
      if (vScore > best) {
        best = vScore;
        tiedWith = 0;
      } else if (vScore === best) {
        tiedWith++;
      }
    }

    if (heroScore === best) {
      if (tiedWith > 0) ties += 1 / (tiedWith + 1);
      else wins++;
    }
  }

  return {
    equity: ((wins + ties) / iterations) * 100,
    iterations,
  };
}

/**
 * Monte Carlo equity of hero vs a specific villain hand, running out the board.
 */
export function headsUpEquity(
  hero: Card[],
  villain: Card[],
  board: Card[] = [],
  iterations = 3000,
): EquityResult {
  let wins = 0;
  let ties = 0;

  for (let i = 0; i < iterations; i++) {
    const deck = shuffledDeck([...hero, ...villain, ...board]);
    const runout = [...board];
    while (runout.length < 5) runout.push(deck.pop()!);

    const heroScore = evaluate([...hero, ...runout]).score;
    const villScore = evaluate([...villain, ...runout]).score;
    if (heroScore > villScore) wins++;
    else if (heroScore === villScore) ties += 0.5;
  }

  return {
    equity: ((wins + ties) / iterations) * 100,
    iterations,
  };
}
