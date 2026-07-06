import { MistakeEntry, ModeStats } from "@/store/progress";
import { TrainingMode, TRAINING_MODES } from "@/types/training";

export interface AchievementContext {
  stats: Partial<Record<TrainingMode, ModeStats>>;
  mistakes: MistakeEntry[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: (ctx: AchievementContext) => boolean;
}

function totalAttempts(ctx: AchievementContext): number {
  return Object.values(ctx.stats).reduce((sum, s) => sum + (s?.attempts ?? 0), 0);
}

function bestStreak(ctx: AchievementContext): number {
  return Object.values(ctx.stats).reduce((max, s) => Math.max(max, s?.bestStreak ?? 0), 0);
}

function modesPlayed(ctx: AchievementContext): number {
  return Object.values(ctx.stats).filter((s) => (s?.attempts ?? 0) > 0).length;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-hand",
    title: "First Hand",
    description: "Complete your first drill.",
    unlocked: (ctx) => totalAttempts(ctx) >= 1,
  },
  {
    id: "century",
    title: "Century",
    description: "Play 100 total decisions.",
    unlocked: (ctx) => totalAttempts(ctx) >= 100,
  },
  {
    id: "hot-streak",
    title: "Hot Streak",
    description: "Reach a 10-answer streak in any module.",
    unlocked: (ctx) => bestStreak(ctx) >= 10,
  },
  {
    id: "on-fire",
    title: "On Fire",
    description: "Reach a 25-answer streak.",
    unlocked: (ctx) => bestStreak(ctx) >= 25,
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Try at least 8 different modules.",
    unlocked: (ctx) => modesPlayed(ctx) >= 8,
  },
  {
    id: "completionist",
    title: "Completionist",
    description: "Play every training module at least once.",
    unlocked: (ctx) => modesPlayed(ctx) >= TRAINING_MODES.length - 3,
  },
];

/** A rotating daily challenge module keyed to the calendar day. */
export function dailyChallengeMode(): TrainingMode {
  const drills = TRAINING_MODES.filter(
    (m) => m.category !== "Platform & Tools",
  );
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return drills[dayIndex % drills.length].mode;
}
