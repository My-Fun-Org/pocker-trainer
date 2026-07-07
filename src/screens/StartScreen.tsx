import { Link } from "react-router-dom";
import {
  CATEGORY_ORDER,
  MODE_BY_ID,
  ROUTES,
  TRAINING_MODES,
  TrainingModeMeta,
} from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { levelFrom, MAX_STARS, starRating, totalStars } from "@/lib/progression";
import { dailyChallengeMode } from "@/lib/achievements";
import { downloadAuditJson } from "@/lib/audit";
import { REASONING_STEPS } from "@/components/ui";

export function StartScreen() {
  const resetAll = useProgressStore((s) => s.resetAll);
  const stats = useProgressStore((s) => s.stats);
  const audits = useProgressStore((s) => s.audits);
  const totalAttempts = Object.values(stats).reduce((sum, m) => sum + (m?.attempts ?? 0), 0);
  const stars = totalStars(stats);
  const level = levelFrom(stars);
  const daily = MODE_BY_ID[dailyChallengeMode()];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">
          Poker<span className="text-chip-gold">Trainer</span>
        </h1>
        <p className="mt-2 text-white/60">
          Learn how to think, not what to memorize - one reasoning step at a time.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
          <Link to={ROUTES.stats} className="text-chip-gold hover:underline">
            Statistics
          </Link>
          <Link to={ROUTES.audit} className="text-chip-gold hover:underline">
            Exercise audit log
          </Link>
          <button
            className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-40"
            onClick={() => downloadAuditJson(audits)}
            disabled={audits.length === 0}
            title={
              audits.length === 0
                ? "Play some exercises first - nothing to download yet"
                : "Download every recorded exercise as JSON"
            }
          >
            Download audit ({audits.length})
          </button>
        </div>
      </header>

      <Link
        to={ROUTES.shuffle}
        className="mb-8 flex flex-col items-start gap-3 rounded-2xl bg-gradient-to-r from-chip-gold/25 to-chip-gold/5 p-5 ring-1 ring-chip-gold/40 transition-transform hover:-translate-y-0.5 hover:ring-chip-gold/70 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">🔀</span>
          <div>
            <p className="text-lg font-bold text-white">Shuffle drill</p>
            <p className="text-sm text-white/70">
              A mixed workout - one spot at a time, jumping between sections scaled
              to your level. Answer, then move to the next.
            </p>
          </div>
        </div>
        <span className="btn-primary shrink-0">Start shuffle &rarr;</span>
      </Link>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="card-surface flex flex-col justify-between p-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-chip-gold">Your level</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {level.level} · {level.title}
            </p>
          </div>
          <p className="mt-2 text-sm text-white/60">
            {stars} stars earned · {level.starsForNext > 0 ? `${level.starsForNext} to next level` : "max level!"}
          </p>
        </div>

        <div className="card-surface flex flex-col justify-between p-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-chip-gold">Daily challenge</p>
            <p className="mt-1 text-lg font-semibold text-white">{daily.title}</p>
            <p className="text-sm text-white/60">{daily.tagline}</p>
          </div>
          <Link to={daily.path} className="btn-primary mt-3 self-start">
            Play now &rarr;
          </Link>
        </div>

        <Link to={ROUTES.stats} className="card-surface flex flex-col justify-between p-5 hover:ring-chip-gold/40">
          <div>
            <p className="text-xs uppercase tracking-wide text-chip-gold">Progress</p>
            <p className="mt-1 text-2xl font-bold text-white">{totalAttempts}</p>
            <p className="text-sm text-white/60">decisions played</p>
          </div>
          <span className="mt-3 text-sm font-semibold text-chip-gold">View statistics &rarr;</span>
        </Link>
      </div>

      <section className="mb-8 card-surface p-5">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-chip-gold">
          The habit every drill builds
        </h2>
        <ol className="grid gap-2 text-sm text-white/80 sm:grid-cols-3">
          {REASONING_STEPS.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      {CATEGORY_ORDER.map((category) => {
        const modes = TRAINING_MODES.filter((m) => m.category === category);
        if (modes.length === 0) return null;
        return (
          <section key={category} className="mb-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-chip-gold">
              {category}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modes.map((meta) => (
                <ModeCard key={meta.mode} meta={meta} />
              ))}
            </div>
          </section>
        );
      })}

      {totalAttempts > 0 && (
        <div className="mt-8 text-center">
          <button className="btn-ghost text-sm" onClick={resetAll}>
            Reset all progress
          </button>
        </div>
      )}
    </div>
  );
}

function ModeCard({ meta }: { meta: TrainingModeMeta }) {
  const stats = useProgressStore((s) => s.statsFor(meta.mode));
  const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : null;
  const rating = starRating(stats);

  return (
    <Link
      to={meta.path}
      className="card-surface group flex flex-col gap-3 p-5 transition-transform hover:-translate-y-1 hover:ring-chip-gold/40"
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl text-chip-gold">{meta.glyph}</span>
        <div className="flex flex-col items-end gap-1">
          {accuracy !== null && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
              {accuracy}% · {stats.attempts} played
            </span>
          )}
          <span className="text-xs text-chip-gold">
            {"★".repeat(rating)}
            <span className="text-white/20">{"★".repeat(MAX_STARS - rating)}</span>
          </span>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{meta.title}</h3>
        <p className="text-xs font-medium uppercase tracking-wide text-chip-gold/80">{meta.tagline}</p>
      </div>
      <p className="text-sm text-white/60">{meta.description}</p>
      <span className="mt-auto text-sm font-semibold text-chip-gold group-hover:underline">
        Start training &rarr;
      </span>
    </Link>
  );
}
