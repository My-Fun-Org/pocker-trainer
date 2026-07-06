import { Card, PreflopChart, Position, Texture } from "@/lib/poker";

export interface RangeQuestion {
  prompt: string;
  options: string[];
  correctAnswers: string[];
  explanation: string;
}

/** A range-reading scenario after card strings are parsed to Card objects. */
export interface RangeScenario {
  id: string;
  title: string;
  stakes: string;
  players: number;
  heroPosition: Position;
  heroCards: Card[];
  villainPosition: Position;
  stackDepthBB: number;
  preflopAction: string[];
  flop: Card[];
  turn: Card[];
  river: Card[];
  question: RangeQuestion;
}

export interface BoardTextureScenario {
  id: string;
  flop: Card[];
  texture: Texture;
  explanation: string;
}

export type { PreflopChart };
