import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CATEGORY_ORDER, MODE_BY_ID, TRAINING_MODES, TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { levelFrom, MAX_STARS, starRating, totalStars } from "@/lib/progression";
import { ACHIEVEMENTS, dailyChallengeMode } from "@/lib/achievements";
import { PageShell } from "@/components/ui";

export function StatsDashboard() {
  const stats = useProgressStore((s) => s.stats);
  const mistakes = useProgressStore((s) => s.mistakes);

  const overall = useMemo(() => {
    const entries = TRAINING_MODES.map((m) => ({ meta: m, s: stats[m.mode] })).filter(
      (e) => e.s && e.s.attempts > 0,
    );
    const attempts = entries.reduce((sum, e) => sum + (e.s?.attempts ?? 0), 0);
    const correct = entries.reduce((sum, e) => sum + (e.s?.correct ?? 0), 0);
    const weakest = entries
      .filter((e) => (e.s?.attempts ?? 0) >= 3)
      .map((e) => ({ meta: e.meta, acc: (e.s!.correct / e.s!.attempts) }))
      .sort((a, b) => a.acc - b.acc)[0];
    return { attempts, correct, weakest };
  }, [stats]);

  const stars = totalStars(stats);
  const level = levelFrom(stars);
  const accuracy = overall.attempts > 0 ? Math.round((overall.correct / overall.attempts) * 100) : 0;

  const mistakeByMode = useMemo(() => {
    const map = new Map<TrainingMode, number>();
    for (const m of mistakes) map.set(m.mode, (map.get(m.mode) ?? 0) + 1);
    return map;
  }, [mistakes]);

  const daily = dailyChallengeMode();
  const ctx = { stats, mistakes };

  return (
    <PageShell title="Statistics Dashboard" subtitle="Your accuracy, streaks, biggest leak and progress.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Level" value={`${level.level} · ${level.title}`} />
        <Stat label="Stars" value={`${stars} ★`} />
        <Stat label="Decisions" value={String(overall.attempts)} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
      </div>

      <div className="card-surface flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-chip-gold">Daily challenge</p>
          <p className="text-sm text-white/80">{MODE_BY_ID[daily].title} - {MODE_BY_ID[daily].tagline}</p>
        </div>
        <Link to={MODE_BY_ID[daily].path} className="btn-primary">
          Take today's challenge &rarr;
        </Link>
      </div>

      {overall.weakest && (
        <div className="card-surface p-4">
          <p className="text-xs uppercase tracking-wide text-red-300">Biggest leak</p>
          <p className="text-sm text-white/80">
            {overall.weakest.meta.title} at {Math.round(overall.weakest.acc * 100)}% -{" "}
            <Link to={overall.weakest.meta.path} className="text-chip-gold hover:underline">
              drill it now
            </Link>
            .
          </p>
        </div>
      )}

      {CATEGORY_ORDER.map((category) => {
        const modes = TRAINING_MODES.filter((m) => m.category === category);
        return (
          <div key={category} className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-chip-gold">{category}</h2>
            <div className="space-y-1.5">
              {modes.map((m) => {
                const s = stats[m.mode];
                const acc = s && s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0;
                const rating = s ? starRating(s) : 0;
                const leaks = mistakeByMode.get(m.mode) ?? 0;
                return (
                  <Link
                    key={m.mode}
                    to={m.path}
                    className="card-surface flex items-center gap-3 p-2.5 text-sm hover:ring-chip-gold/40"
                  >
                    <span className="w-40 shrink-0 truncate text-white/80">{m.title}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-chip-gold"
                        style={{ width: `${s && s.attempts ? acc : 0}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-white/60">{s?.attempts ? `${acc}%` : "-"}</span>
                    <span className="w-14 text-right text-chip-gold">
                      {"★".repeat(rating)}{"☆".repeat(MAX_STARS - rating)}
                    </span>
                    <span className="w-16 text-right text-xs text-red-300/70">
                      {leaks ? `${leaks} leaks` : ""}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-chip-gold">Achievements</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = a.unlocked(ctx);
            return (
              <div
                key={a.id}
                className={`card-surface p-3 ${unlocked ? "ring-1 ring-chip-gold/50" : "opacity-50"}`}
              >
                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[10px] uppercase ${
                      unlocked ? "bg-chip-gold text-black" : "bg-white/10 text-white/50"
                    }`}
                  >
                    {unlocked ? "Unlocked" : "Locked"}
                  </span>
                  {a.title}
                </p>
                <p className="mt-1 text-xs text-white/60">{a.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface p-4 text-center">
      <div className="text-lg font-bold text-chip-gold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-white/50">{label}</div>
    </div>
  );
}
