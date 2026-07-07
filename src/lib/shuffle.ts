import { TrainingMode } from "@/types/training";

/**
 * Shuffle mode mixes single-decision drills from different sections. The pool a
 * player draws from widens as they level up, so beginners stay on fundamentals
 * while stronger players get the full mix.
 *
 * Multi-step drills (Range Builder, Decision Tree) and the platform tools are
 * intentionally excluded - shuffle is about fast, one-answer reps.
 */
const FUNDAMENTALS: TrainingMode[] = [
  TrainingMode.Preflop,
  TrainingMode.Position,
  TrainingMode.Outs,
  TrainingMode.PotOdds,
  TrainingMode.Equity,
  TrainingMode.BoardTexture,
  TrainingMode.BetSize,
];

const INTERMEDIATE: TrainingMode[] = [
  TrainingMode.Range,
  TrainingMode.HandReading,
  TrainingMode.StackDepth,
  TrainingMode.Spr,
  TrainingMode.PlayerTypes,
  TrainingMode.Bluff,
  TrainingMode.SemiBluff,
  TrainingMode.ValueBetting,
  TrainingMode.River,
  TrainingMode.ComboCounting,
  TrainingMode.VillainProfiling,
  TrainingMode.Hud,
];

const ADVANCED: TrainingMode[] = [TrainingMode.MentalGame];

/** The drills available to shuffle for a given player level (1-6). */
export function shufflePool(level: number): TrainingMode[] {
  if (level <= 2) return [...FUNDAMENTALS];
  if (level <= 4) return [...FUNDAMENTALS, ...INTERMEDIATE];
  return [...FUNDAMENTALS, ...INTERMEDIATE, ...ADVANCED];
}

export function randomMode(pool: TrainingMode[]): TrainingMode {
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Pick a random mode from the pool that is different from the current one. */
export function pickNext(pool: TrainingMode[], current: TrainingMode): TrainingMode {
  if (pool.length <= 1) return pool[0] ?? current;
  const options = pool.filter((m) => m !== current);
  return randomMode(options);
}
