import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MODE_BY_ID, ROUTES, TrainingMode } from "@/types/training";
import { MODE_COMPONENT } from "@/modes/componentMap";
import { useProgressStore } from "@/store/progress";
import { levelFrom, totalStars } from "@/lib/progression";
import { pickNext, randomMode, shufflePool } from "@/lib/shuffle";

/**
 * Shuffle mode: play one drill at a time from a level-scoped pool, jumping to a
 * new random section after each answer. The trainers are reused as-is; their own
 * in-card "next" button is hidden via CSS (see `[data-shuffle]` in index.css) so
 * the sticky bar below is the single way to advance.
 */
export function ShuffleRunner() {
  const stats = useProgressStore((s) => s.stats);
  const level = useMemo(() => levelFrom(totalStars(stats)).level, [stats]);
  const pool = useMemo(() => shufflePool(level), [level]);

  const [current, setCurrent] = useState<TrainingMode>(() => randomMode(pool));
  const [nextMode, setNextMode] = useState<TrainingMode>(() => pickNext(pool, current));
  const [round, setRound] = useState(0);
  const [baseline, setBaseline] = useState(0);
  const [played, setPlayed] = useState(0);
  const [correct, setCorrect] = useState(0);

  // Capture the attempt count for this drill when the round starts, so we can
  // tell when the player has answered the current spot.
  useEffect(() => {
    setBaseline(useProgressStore.getState().statsFor(current).attempts);
  }, [current, round]);

  const currentAttempts = useProgressStore((s) => s.statsFor(current).attempts);
  const answered = currentAttempts > baseline;
  const lastAudit = useProgressStore((s) => s.audits[0]);
  const lastCorrect =
    answered && lastAudit?.mode === current ? lastAudit.wasCorrect : undefined;

  const advance = useCallback(() => {
    if (lastCorrect) setCorrect((c) => c + 1);
    setPlayed((p) => p + 1);
    setCurrent(nextMode);
    setNextMode((prevNext) => pickNext(pool, prevNext));
    setRound((r) => r + 1);
  }, [lastCorrect, nextMode, pool]);

  const Trainer = MODE_COMPONENT[current];
  const currentMeta = MODE_BY_ID[current];
  const nextMeta = MODE_BY_ID[nextMode];
  const levelTitle = levelFrom(totalStars(stats)).title;

  return (
    <div data-shuffle className="pb-28">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="card-surface flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-chip-gold px-2.5 py-1 text-sm font-black uppercase tracking-wide text-black">
              Shuffle
            </span>
            <div className="text-sm">
              <p className="font-semibold text-white">
                Now: {currentMeta.title}
              </p>
              <p className="text-xs text-white/50">
                Level {level} · {levelTitle} · mixing {pool.length} sections
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-xs text-white/60">
              <p>
                <span className="font-bold text-white">{played}</span> played
              </p>
              <p>
                <span className="font-bold text-emerald-300">{correct}</span> correct
              </p>
            </div>
            <Link to={ROUTES.home} className="btn-ghost px-3 py-1.5 text-sm">
              Exit
            </Link>
          </div>
        </div>
      </div>

      <Trainer key={round} />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-felt-dark/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          {answered ? (
            <span
              className={`hidden text-sm font-semibold sm:inline ${
                lastCorrect ? "text-emerald-300" : "text-chip-red"
              }`}
            >
              {lastCorrect ? "Correct!" : "Noted."}
            </span>
          ) : (
            <span className="hidden text-sm text-white/40 sm:inline">
              Answer the spot to continue
            </span>
          )}
          <button
            className="btn-primary grow px-6 disabled:opacity-40 sm:grow-0"
            onClick={advance}
            disabled={!answered}
          >
            Next section: {nextMeta.title} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
