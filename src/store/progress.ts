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

/**
 * A full record of a single exercise attempt, kept so the trainer's own
 * "correct" answers can be reviewed later for logic bugs.
 */
export interface AuditEntry {
  id: string;
  mode: TrainingMode;
  at: number;
  /** The scenario / question as shown to the player. */
  prompt: string;
  /** What the player answered. */
  chosen: string;
  /** What the trainer graded as correct. */
  correct: string;
  wasCorrect: boolean;
  /** Cards, board, math and reasoning captured for later verification. */
  detail: string[];
}

const MAX_MISTAKES = 50;
const MAX_AUDITS = 500;

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

export interface AuditInput {
  prompt: string;
  chosen: string;
  correct: string;
  detail?: string[];
}

export interface RecordResultInput {
  mode: TrainingMode;
  correct: boolean;
  /** Full attempt record; also used to derive the mistakes list. */
  audit?: AuditInput;
}

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface ProgressState {
  stats: Partial<Record<TrainingMode, ModeStats>>;
  mistakes: MistakeEntry[];
  audits: AuditEntry[];
  recordResult: (input: RecordResultInput) => void;
  statsFor: (mode: TrainingMode) => ModeStats;
  resetMode: (mode: TrainingMode) => void;
  resetAll: () => void;
  clearAudits: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      stats: {},
      mistakes: [],
      audits: [],

      recordResult: ({ mode, correct, audit }) =>
        set((state) => {
          const prev = state.stats[mode] ?? emptyStats();
          const currentStreak = correct ? prev.currentStreak + 1 : 0;
          const next: ModeStats = {
            attempts: prev.attempts + 1,
            correct: prev.correct + (correct ? 1 : 0),
            currentStreak,
            bestStreak: Math.max(prev.bestStreak, currentStreak),
          };

          const at = Date.now();
          let audits = state.audits;
          let mistakes = state.mistakes;

          if (audit) {
            const entry: AuditEntry = {
              id: makeId(),
              mode,
              at,
              prompt: audit.prompt,
              chosen: audit.chosen,
              correct: audit.correct,
              wasCorrect: correct,
              detail: audit.detail ?? [],
            };
            audits = [entry, ...state.audits].slice(0, MAX_AUDITS);

            if (!correct) {
              mistakes = [
                { mode, at, prompt: audit.prompt, chosen: audit.chosen, correct: audit.correct },
                ...state.mistakes,
              ].slice(0, MAX_MISTAKES);
            }
          }

          return { stats: { ...state.stats, [mode]: next }, mistakes, audits };
        }),

      statsFor: (mode) => get().stats[mode] ?? EMPTY_STATS,

      resetMode: (mode) =>
        set((state) => ({
          stats: { ...state.stats, [mode]: emptyStats() },
          mistakes: state.mistakes.filter((m) => m.mode !== mode),
          audits: state.audits.filter((a) => a.mode !== mode),
        })),

      resetAll: () => set({ stats: {}, mistakes: [], audits: [] }),

      clearAudits: () => set({ audits: [] }),
    }),
    { name: STORAGE_KEY },
  ),
);
