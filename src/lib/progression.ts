import { ModeStats } from "@/store/progress";
import { TrainingMode, TRAINING_MODES } from "@/types/training";

/** Star thresholds: attempts required and accuracy required per star. */
const STAR_RULES = [
  { attempts: 5, accuracy: 0.5 },
  { attempts: 15, accuracy: 0.7 },
  { attempts: 30, accuracy: 0.85 },
] as const;

export const MAX_STARS = STAR_RULES.length;

/** 0-3 star rating for a module based on volume and accuracy. */
export function starRating(stats: ModeStats): number {
  if (stats.attempts === 0) return 0;
  const acc = stats.correct / stats.attempts;
  let stars = 0;
  for (const rule of STAR_RULES) {
    if (stats.attempts >= rule.attempts && acc >= rule.accuracy) stars++;
  }
  return stars;
}

export interface LevelInfo {
  level: number;
  title: string;
  totalStars: number;
  starsForNext: number;
}

const LEVEL_TITLES = [
  "Fish",
  "Rookie",
  "Grinder",
  "Regular",
  "Shark",
  "Crusher",
];

/** Overall level derived from total stars across all modules. */
export function levelFrom(totalStars: number): LevelInfo {
  const perLevel = 6;
  const level = Math.min(LEVEL_TITLES.length, Math.floor(totalStars / perLevel) + 1);
  const starsForNext = level * perLevel - totalStars;
  return {
    level,
    title: LEVEL_TITLES[level - 1],
    totalStars,
    starsForNext: Math.max(0, starsForNext),
  };
}

export function totalStars(stats: Partial<Record<TrainingMode, ModeStats>>): number {
  return TRAINING_MODES.reduce((sum, meta) => {
    const s = stats[meta.mode];
    return sum + (s ? starRating(s) : 0);
  }, 0);
}
