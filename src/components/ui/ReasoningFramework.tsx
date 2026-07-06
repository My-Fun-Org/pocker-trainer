/** The core 6-step thinking habit the whole app trains. */
export const REASONING_STEPS: readonly string[] = [
  "What do I have?",
  "Dry or wet board?",
  "What worse hands call?",
  "What better hands raise?",
  "What bluffs exist?",
  "What is my action?",
];

interface ReasoningFrameworkProps {
  /** Optionally highlight the step this drill emphasizes (1-based). */
  highlightStep?: number;
  compact?: boolean;
}

export function ReasoningFramework({
  highlightStep,
  compact = false,
}: ReasoningFrameworkProps) {
  return (
    <div className="card-surface p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-chip-gold">
        The 6-step habit
      </h3>
      <ol className={`space-y-1.5 ${compact ? "text-xs" : "text-sm"}`}>
        {REASONING_STEPS.map((step, i) => {
          const highlighted = highlightStep === i + 1;
          return (
            <li
              key={step}
              className={`flex items-center gap-2.5 rounded-lg px-2 py-1 ${
                highlighted ? "bg-chip-gold/15 text-white" : "text-white/70"
              }`}
            >
              <span
                className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  highlighted
                    ? "bg-chip-gold text-black"
                    : "bg-white/10 text-white/70"
                }`}
              >
                {i + 1}
              </span>
              {step}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
