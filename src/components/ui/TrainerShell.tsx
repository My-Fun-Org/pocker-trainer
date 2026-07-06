import { Link } from "react-router-dom";
import { MODE_BY_ID, ROUTES, TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { ReasoningFramework } from "./ReasoningFramework";

interface TrainerShellProps {
  mode: TrainingMode;
  highlightStep?: number;
  children: React.ReactNode;
}

export function TrainerShell({ mode, highlightStep, children }: TrainerShellProps) {
  const meta = MODE_BY_ID[mode];
  const stats = useProgressStore((s) => s.statsFor(mode));
  const accuracy =
    stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={ROUTES.home} className="btn-ghost px-3 py-2 text-sm">
            &larr; Modes
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{meta.title}</h1>
            <p className="text-sm text-white/60">{meta.tagline}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Stat label="Solved" value={`${stats.correct}/${stats.attempts}`} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <Stat label="Streak" value={`${stats.currentStreak}`} />
          <Stat label="Best" value={`${stats.bestStreak}`} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-5">{children}</div>
        <aside className="space-y-5">
          <ReasoningFramework highlightStep={highlightStep} />
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface px-3 py-1.5 text-center">
      <div className="text-sm font-bold text-chip-gold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-white/50">
        {label}
      </div>
    </div>
  );
}
