import { Card, Position } from "@/lib/poker";

/** Whether a card is shown face up or face down. */
export const CardFace = {
  Up: "up",
  Down: "down",
} as const;

export type CardFace = (typeof CardFace)[keyof typeof CardFace];

/** Blind / dealer markers a seat can display. */
export const SeatMarker = {
  Dealer: "dealer",
  SmallBlind: "small-blind",
  BigBlind: "big-blind",
} as const;

export type SeatMarker = (typeof SeatMarker)[keyof typeof SeatMarker];

export const SEAT_MARKER_LABEL: Record<SeatMarker, string> = {
  [SeatMarker.Dealer]: "D",
  [SeatMarker.SmallBlind]: "SB",
  [SeatMarker.BigBlind]: "BB",
};

export interface SeatModel {
  id: string;
  name: string;
  position?: Position;
  stackBB?: number;
  cards?: Card[];
  faceDown?: boolean;
  isHero?: boolean;
  isActive?: boolean;
  markers?: SeatMarker[];
  /** Chips committed in front of the seat this street. */
  betBB?: number;
}

const POSITION_MARKERS: Partial<Record<Position, SeatMarker[]>> = {
  BTN: [SeatMarker.Dealer],
  SB: [SeatMarker.SmallBlind],
  BB: [SeatMarker.BigBlind],
};

export function markersForPosition(position?: Position): SeatMarker[] {
  if (!position) return [];
  return POSITION_MARKERS[position] ?? [];
}
