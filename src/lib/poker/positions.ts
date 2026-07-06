import { Position, POSITIONS } from "./preflop";

/** Preflop action order for a full 6-max table (UTG acts first). */
export const PREFLOP_ORDER: Position[] = [...POSITIONS];

/** Postflop action order: blinds act first, button last. */
export const POSTFLOP_ORDER: Position[] = [
  Position.SB,
  Position.BB,
  Position.UTG,
  Position.MP,
  Position.CO,
  Position.BTN,
];

export const Street = {
  Preflop: "preflop",
  Postflop: "postflop",
} as const;

export type Street = (typeof Street)[keyof typeof Street];

/** Who acts first among `seats` on the given street. */
export function actsFirst(seats: Position[], street: Street): Position {
  const order = street === Street.Preflop ? PREFLOP_ORDER : POSTFLOP_ORDER;
  for (const pos of order) {
    if (seats.includes(pos)) return pos;
  }
  return seats[0];
}

/** True if `a` is in position on `b` postflop (acts after b). */
export function isInPosition(a: Position, b: Position): boolean {
  return POSTFLOP_ORDER.indexOf(a) > POSTFLOP_ORDER.indexOf(b);
}

/** Positions considered "late" (widen opening / steal candidates). */
export const STEAL_POSITIONS: Position[] = [Position.CO, Position.BTN, Position.SB];

export function isStealSeat(position: Position): boolean {
  return STEAL_POSITIONS.includes(position);
}
