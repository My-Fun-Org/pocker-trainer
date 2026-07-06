import { Card, RANKS, SUITS, sameCard } from "./cards";

export function fullDeck(): Card[] {
  const deck: Card[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

/** Fisher-Yates shuffle (returns a new array). */
export function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** A shuffled deck excluding any `dead` cards already in play. */
export function shuffledDeck(dead: Card[] = []): Card[] {
  const deck = fullDeck().filter((c) => !dead.some((d) => sameCard(c, d)));
  return shuffle(deck);
}

/** Deal `n` cards off the top of a deck, mutating the deck. */
export function deal(deck: Card[], n: number): Card[] {
  return deck.splice(0, n);
}
