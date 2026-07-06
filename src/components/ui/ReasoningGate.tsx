import {
  GateAnswers,
  GateAnswerValue,
  GateInput,
  GateStepMode,
  GateStepSpec,
  isStepAnswered,
} from "@/lib/gate";
import { ChoiceButtons } from "./ChoiceButtons";
import { RangeGrid } from "./RangeGrid";

interface ReasoningGateProps {
  steps: GateStepSpec[];
  answers: GateAnswers;
  onChange: (stepId: GateStepSpec["id"], value: GateAnswerValue) => void;
  revealed?: boolean;
}

/**
 * Renders the reasoning steps a drill requires, capturing the player's read
 * before the action buttons unlock (see the flagship Reasoning Gate PRD).
 */
export function ReasoningGate({ steps, answers, onChange, revealed = false }: ReasoningGateProps) {
  const visible = steps.filter((s) => s.mode !== GateStepMode.Hidden);
  const required = visible.filter((s) => s.mode === GateStepMode.Required);
  const answeredCount = required.filter((s) => isStepAnswered(s, answers[s.id])).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-white/60">
        <span className="font-semibold uppercase tracking-wide text-chip-gold">
          Reasoning gate
        </span>
        <span>
          {answeredCount} of {required.length} required steps
        </span>
      </div>

      {visible.map((step) => {
        const value = answers[step.id];
        const answered = isStepAnswered(step, value);
        return (
          <div
            key={step.id}
            className={`card-surface p-3 ring-1 ${
              answered ? "ring-emerald-400/30" : "ring-white/10"
            }`}
          >
            <p className="mb-2 text-sm font-semibold text-white/90">
              {step.question}
              {step.mode === GateStepMode.Required && (
                <span className="ml-2 text-[10px] uppercase text-chip-gold">required</span>
              )}
            </p>
            <StepInput step={step} value={value} onChange={onChange} revealed={revealed} />
          </div>
        );
      })}
    </div>
  );
}

function StepInput({
  step,
  value,
  onChange,
  revealed,
}: {
  step: GateStepSpec;
  value: GateAnswerValue | undefined;
  onChange: ReasoningGateProps["onChange"];
  revealed: boolean;
}) {
  if (step.input === GateInput.RangeGrid) {
    const selected = new Set(Array.isArray(value) ? value : []);
    return (
      <RangeGrid
        selected={selected}
        revealed={revealed}
        target={step.correct ? new Set(step.correct) : undefined}
        readOnly={revealed}
        onToggle={(hand) => {
          const next = new Set(selected);
          if (next.has(hand)) next.delete(hand);
          else next.add(hand);
          onChange(step.id, [...next]);
        }}
      />
    );
  }

  if (step.input === GateInput.MultiSelect || step.input === GateInput.SingleChoice) {
    const multiple = step.input === GateInput.MultiSelect;
    const selected = Array.isArray(value) ? value : value !== undefined ? [String(value)] : [];
    const choices = (step.options ?? []).map((o) => ({ id: o, label: o }));
    return (
      <ChoiceButtons
        choices={choices}
        selected={selected}
        multiple={multiple}
        columns={choices.length > 4 ? 4 : choices.length || 3}
        disabled={revealed}
        revealed={revealed}
        correctIds={revealed ? step.correct ?? [] : []}
        onToggle={(id) => {
          if (!multiple) {
            onChange(step.id, [id]);
            return;
          }
          const next = selected.includes(id)
            ? selected.filter((x) => x !== id)
            : [...selected, id];
          onChange(step.id, next);
        }}
      />
    );
  }

  if (step.input === GateInput.Number) {
    return (
      <input
        type="number"
        disabled={revealed}
        value={value === undefined ? "" : String(value)}
        onChange={(e) => onChange(step.id, Number(e.target.value))}
        className="w-32 rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/15 focus:outline-none focus:ring-chip-gold"
      />
    );
  }

  return (
    <textarea
      disabled={revealed}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(step.id, e.target.value)}
      placeholder="Type your read..."
      className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/15 focus:outline-none focus:ring-chip-gold"
      rows={2}
    />
  );
}
