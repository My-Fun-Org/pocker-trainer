import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TrainingMode } from "@/types/training";

export interface ModeStats {
  attempts: number;
  correct: number;
  currentStreak: number;
  bestStreak: number;
}

export interface MistakeEntry {
  mode: TrainingMode;
  prompt: string;
  chosen: string;
  correct: string;
  at: number;
}

const MAX_MISTAKES = 50;

const STORAGE_KEY = "pokertrainer.progress.v1";

function emptyStats(): ModeStats {
  return { attempts: 0, correct: 0, currentStreak: 0, bestStreak: 0 };
}

/**
 * Stable, shared empty-stats reference returned by `statsFor` for unplayed
 * modes. Returning a fresh object each call would give `useSyncExternalStore`
 * a new snapshot every render and trigger an infinite update loop.
 */
const EMPTY_STATS: ModeStats = Object.freeze(emptyStats());

export interface RecordResultInput {
  mode: TrainingMode;
  correct: boolean;
  mistake?: Omit<MistakeEntry, "mode" | "at">;
}

interface ProgressState {
  stats: Partial<Record<TrainingMode, ModeStats>>;
  mistakes: MistakeEntry[];
  recordResult: (input: RecordResultInput) => void;
  statsFor: (mode: TrainingMode) => ModeStats;
  resetMode: (mode: TrainingMode) => void;
  resetAll: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      stats: {},
      mistakes: [],

      recordResult: ({ mode, correct, mistake }) =>
        set((state) => {
          const prev = state.stats[mode] ?? emptyStats();
          const currentStreak = correct ? prev.currentStreak + 1 : 0;
          const next: ModeStats = {
            attempts: prev.attempts + 1,
            correct: prev.correct + (correct ? 1 : 0),
            currentStreak,
            bestStreak: Math.max(prev.bestStreak, currentStreak),
          };
          const mistakes =
            !correct && mistake
              ? [
                  { mode, at: Date.now(), ...mistake },
                  ...state.mistakes,
                ].slice(0, MAX_MISTAKES)
              : state.mistakes;
          return { stats: { ...state.stats, [mode]: next }, mistakes };
        }),

      statsFor: (mode) => get().stats[mode] ?? EMPTY_STATS,

      resetMode: (mode) =>
        set((state) => ({
          stats: { ...state.stats, [mode]: emptyStats() },
          mistakes: state.mistakes.filter((m) => m.mode !== mode),
        })),

      resetAll: () => set({ stats: {}, mistakes: [] }),
    }),
    { name: STORAGE_KEY },
  ),
);
