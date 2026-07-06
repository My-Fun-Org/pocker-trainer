import { parseCards, parseTexture, Position, PreflopChart } from "@/lib/poker";
import { BoardTextureScenario, RangeScenario } from "./types";

const DATA_FILES = {
  preflopRanges: "data/preflop-ranges.json",
  rangeScenarios: "data/range-scenarios.json",
  boardTextureScenarios: "data/board-texture-scenarios.json",
} as const;

async function fetchJson<T>(file: string): Promise<T> {
  const res = await fetch(`${import.meta.env.BASE_URL}${file}`);
  if (!res.ok) {
    throw new Error(`Failed to load ${file}: ${res.status}`);
  }
  return (await res.json()) as T;
}

let preflopChartCache: PreflopChart | null = null;

export async function loadPreflopChart(): Promise<PreflopChart> {
  if (preflopChartCache) return preflopChartCache;
  const raw = await fetchJson<Record<string, unknown>>(DATA_FILES.preflopRanges);
  const { _meta, ...positions } = raw;
  void _meta;
  preflopChartCache = positions as unknown as PreflopChart;
  return preflopChartCache;
}

interface RawRangeScenario {
  id: string;
  title: string;
  stakes: string;
  players: number;
  heroPosition: string;
  heroCards: string[];
  villainPosition: string;
  stackDepthBB: number;
  preflopAction: string[];
  flop: string[];
  turn?: string[];
  river?: string[];
  question: {
    prompt: string;
    options: string[];
    correctAnswers: string[];
    explanation: string;
  };
}

let rangeScenarioCache: RangeScenario[] | null = null;

export async function loadRangeScenarios(): Promise<RangeScenario[]> {
  if (rangeScenarioCache) return rangeScenarioCache;
  const raw = await fetchJson<{ scenarios: RawRangeScenario[] }>(
    DATA_FILES.rangeScenarios,
  );
  rangeScenarioCache = raw.scenarios.map((s) => ({
    ...s,
    heroPosition: s.heroPosition as Position,
    villainPosition: s.villainPosition as Position,
    heroCards: parseCards(s.heroCards),
    flop: parseCards(s.flop ?? []),
    turn: parseCards(s.turn ?? []),
    river: parseCards(s.river ?? []),
  }));
  return rangeScenarioCache;
}

interface RawBoardTextureScenario {
  id: string;
  flop: string[];
  texture: string;
  explanation: string;
}

let boardTextureCache: BoardTextureScenario[] | null = null;

export async function loadBoardTextureScenarios(): Promise<
  BoardTextureScenario[]
> {
  if (boardTextureCache) return boardTextureCache;
  const raw = await fetchJson<{ scenarios: RawBoardTextureScenario[] }>(
    DATA_FILES.boardTextureScenarios,
  );
  boardTextureCache = raw.scenarios.map((s) => ({
    id: s.id,
    flop: parseCards(s.flop),
    texture: parseTexture(s.texture),
    explanation: s.explanation,
  }));
  return boardTextureCache;
}
