import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MODE_BY_ID, TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { CoachPanel, FeedbackStatus, PageShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const PROMPTS = [
  "What was your best fold this session?",
  "What was your worst call?",
  "What was the biggest mistake you can learn from?",
  "Did you trust or ignore your read - and how did that go?",
  "Was there a tilt or emotional moment? What triggered it?",
];

export function SessionReview() {
  const stats = useProgressStore((s) => s.stats);
  const mistakes = useProgressStore((s) => s.mistakes);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const summary = useMemo(() => {
    const entries = Object.entries(stats).filter(([, v]) => v && v.attempts > 0) as [
      TrainingMode,
      { attempts: number; correct: number },
    ][];
    const totalAttempts = entries.reduce((sum, [, v]) => sum + v.attempts, 0);
    const totalCorrect = entries.reduce((sum, [, v]) => sum + v.correct, 0);
    const weakest = entries
      .map(([mode, v]) => ({ mode, acc: v.correct / v.attempts, attempts: v.attempts }))
      .filter((e) => e.attempts >= 3)
      .sort((a, b) => a.acc - b.acc)[0];
    return { totalAttempts, totalCorrect, weakest };
  }, [stats]);

  const accuracy =
    summary.totalAttempts > 0
      ? Math.round((summary.totalCorrect / summary.totalAttempts) * 100)
      : 0;

  return (
    <PageShell
      title="Session Review"
      subtitle="Reflect on your play, separate decisions from outcomes, and drill your weak spot."
    >
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Hands played" value={String(summary.totalAttempts)} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Leaks logged" value={String(mistakes.length)} />
      </div>

      {summary.totalAttempts === 0 ? (
        <div className="card-surface p-6 text-center text-white/60">
          Play some drills first, then come back to review your session.
        </div>
      ) : (
        <>
          <CoachPanel
            status={FeedbackStatus.Info}
            output={coach({
              mode: TrainingMode.SessionReview,
              correctDecision: true,
              headline: "Session summary",
              reasons: [
                `You played ${summary.totalAttempts} decisions at ${accuracy}% accuracy this session.`,
                summary.weakest
                  ? `Your biggest leak is ${MODE_BY_ID[summary.weakest.mode].title} at ${Math.round(summary.weakest.acc * 100)}% - practice it next.`
                  : "Keep playing more hands so a weakest area emerges.",
              ],
            })}
          />

          {summary.weakest && (
            <Link to={MODE_BY_ID[summary.weakest.mode].path} className="btn-primary inline-flex">
              Practice your weak spot: {MODE_BY_ID[summary.weakest.mode].title} &rarr;
            </Link>
          )}

          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-chip-gold">
              Guided reflection
            </h2>
            {PROMPTS.map((prompt, i) => (
              <div key={i} className="card-surface p-4">
                <p className="mb-2 text-sm font-semibold text-white/85">{prompt}</p>
                <textarea
                  value={answers[i] ?? ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                  rows={2}
                  placeholder="Your reflection..."
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/15 focus:outline-none focus:ring-chip-gold"
                />
              </div>
            ))}
          </div>

          {mistakes.length > 0 && (
            <div className="card-surface p-4">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-chip-gold">
                Recent leaks
              </h2>
              <ul className="space-y-1.5 text-sm text-white/70">
                {mistakes.slice(0, 10).map((m, i) => (
                  <li key={i}>
                    <span className="text-white/50">[{MODE_BY_ID[m.mode]?.title ?? m.mode}]</span>{" "}
                    {m.prompt} - chose <b className="text-red-300">{m.chosen}</b>, correct was{" "}
                    <b className="text-emerald-300">{m.correct}</b>.
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface p-4 text-center">
      <div className="text-2xl font-bold text-chip-gold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-white/50">{label}</div>
    </div>
  );
}
