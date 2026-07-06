import { Card, Rank, RANK_VALUE, RANKS, SUITS } from "./cards";

/**
 * Ranks ordered high-to-low, the axis order used by a standard 13x13 range grid.
 */
export const GRID_RANKS: Rank[] = [...RANKS].reverse();

/** Combo counts for the three shapes of a starting hand. */
export const COMBOS = {
  PAIR: 6,
  SUITED: 4,
  OFFSUIT: 12,
  /** Any (suited + offsuit) non-pair, e.g. "AK". */
  ANY_NONPAIR: 16,
} as const;

/**
 * The 169-hand notation for a grid cell at (rowRank, colRank).
 * Diagonal = pair, upper triangle = suited, lower triangle = offsuit.
 */
export function cellNotation(row: Rank, col: Rank): string {
  if (row === col) return `${row}${col}`;
  const hi = RANK_VALUE[row] >= RANK_VALUE[col] ? row : col;
  const lo = RANK_VALUE[row] >= RANK_VALUE[col] ? col : row;
  // Suited hands live in the upper-right triangle (row index < col index).
  const rowIsUpper = GRID_RANKS.indexOf(row) < GRID_RANKS.indexOf(col);
  return `${hi}${lo}${rowIsUpper ? "s" : "o"}`;
}

/** Every 169 starting-hand notation, in grid reading order. */
export function allHandNotations(): string[] {
  const out: string[] = [];
  for (const row of GRID_RANKS) {
    for (const col of GRID_RANKS) {
      out.push(cellNotation(row, col));
    }
  }
  return out;
}

/** Base combo count for a notation ignoring card removal. */
export function baseCombos(notation: string): number {
  if (isPair(notation)) return COMBOS.PAIR;
  if (notation.endsWith("s")) return COMBOS.SUITED;
  if (notation.endsWith("o")) return COMBOS.OFFSUIT;
  return COMBOS.ANY_NONPAIR;
}

export function isPair(notation: string): boolean {
  return notation.length === 2 && notation[0] === notation[1];
}

function rankAt(index: number): Rank {
  return RANKS[index];
}

/**
 * Expand a compact range token (e.g. "TT+", "AJs+", "A5s-A2s", "KQo", "AK")
 * into the set of 169-hand notations it covers.
 */
export function expandToken(token: string): string[] {
  const trimmed = token.trim();
  if (!trimmed) return [];

  // Range with an explicit hyphen, e.g. "A5s-A2s" or "99-66".
  if (trimmed.includes("-")) {
    const [start, end] = trimmed.split("-");
    return expandHyphenRange(start.trim(), end.trim());
  }

  // Plus notation, e.g. "TT+", "AJs+".
  if (trimmed.endsWith("+")) {
    return expandPlus(trimmed.slice(0, -1));
  }

  // Bare "AK" means both suited and offsuit.
  if (trimmed.length === 2 && trimmed[0] !== trimmed[1]) {
    const hi = normalizeRank(trimmed[0]);
    const lo = normalizeRank(trimmed[1]);
    return [`${hi}${lo}s`, `${hi}${lo}o`];
  }

  return [canonical(trimmed)];
}

/** Expand a list of tokens into a de-duplicated set of notations. */
export function expandRange(tokens: string[]): string[] {
  const set = new Set<string>();
  for (const token of tokens) {
    for (const hand of expandToken(token)) set.add(hand);
  }
  return [...set];
}

function normalizeRank(ch: string): Rank {
  return ch.toUpperCase() as Rank;
}

function canonical(token: string): string {
  if (token.length === 2) return `${normalizeRank(token[0])}${normalizeRank(token[1])}`;
  const hi = normalizeRank(token[0]);
  const lo = normalizeRank(token[1]);
  return `${hi}${lo}${token[2].toLowerCase()}`;
}

function expandPlus(token: string): string[] {
  // Pair plus: "TT+" => TT, JJ, QQ, KK, AA.
  if (token.length === 2 && token[0] === token[1]) {
    const from = RANKS.indexOf(normalizeRank(token[0]));
    const out: string[] = [];
    for (let i = from; i < RANKS.length; i++) out.push(`${rankAt(i)}${rankAt(i)}`);
    return out;
  }
  // Suited/offsuit plus: "AJs+" => AJs, AQs, AKs (raise the lower card up to hi-1).
  const hi = normalizeRank(token[0]);
  const lo = normalizeRank(token[1]);
  const suit = token[2]?.toLowerCase() ?? "s";
  const hiIdx = RANKS.indexOf(hi);
  const loIdx = RANKS.indexOf(lo);
  const out: string[] = [];
  for (let i = loIdx; i < hiIdx; i++) out.push(`${hi}${rankAt(i)}${suit}`);
  return out;
}

function expandHyphenRange(start: string, end: string): string[] {
  // Pair range "99-66".
  if (start.length === 2 && start[0] === start[1]) {
    const a = RANKS.indexOf(normalizeRank(start[0]));
    const b = RANKS.indexOf(normalizeRank(end[0]));
    const [lo, hi] = a <= b ? [a, b] : [b, a];
    const out: string[] = [];
    for (let i = lo; i <= hi; i++) out.push(`${rankAt(i)}${rankAt(i)}`);
    return out;
  }
  // Suited/offsuit run with a fixed high card, "A5s-A2s".
  const hi = normalizeRank(start[0]);
  const suit = start[2]?.toLowerCase() ?? "s";
  const a = RANKS.indexOf(normalizeRank(start[1]));
  const b = RANKS.indexOf(normalizeRank(end[1]));
  const [lo, high] = a <= b ? [a, b] : [b, a];
  const out: string[] = [];
  for (let i = lo; i <= high; i++) out.push(`${hi}${rankAt(i)}${suit}`);
  return out;
}

/** Enumerate every concrete two-card combo for a notation. */
export function handToCards(notation: string): Card[][] {
  const combos: Card[][] = [];
  const hi = notation[0] as Rank;
  const lo = notation[1] as Rank;

  if (isPair(notation)) {
    for (let i = 0; i < SUITS.length; i++) {
      for (let j = i + 1; j < SUITS.length; j++) {
        combos.push([
          { rank: hi, suit: SUITS[i] },
          { rank: lo, suit: SUITS[j] },
        ]);
      }
    }
    return combos;
  }

  const suited = notation.endsWith("s");
  for (const s1 of SUITS) {
    for (const s2 of SUITS) {
      if (suited && s1 !== s2) continue;
      if (!suited && s1 === s2) continue;
      combos.push([
        { rank: hi, suit: s1 },
        { rank: lo, suit: s2 },
      ]);
    }
  }
  // Offsuit enumerates ordered pairs twice; keep unique unordered combos.
  if (!suited) {
    const seen = new Set<string>();
    return combos.filter(([a, b]) => {
      const key = [`${a.rank}${a.suit}`, `${b.rank}${b.suit}`].sort().join("");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  return combos;
}
