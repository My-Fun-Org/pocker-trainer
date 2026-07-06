import { useCallback, useEffect, useState } from "react";
import {
  correctPreflopAction,
  generatePreflopScenario,
  Position,
  POSITION_LABEL,
  POSITIONS,
  PREFLOP_ACTION_LABEL,
  PreflopAction,
  PreflopChart,
  PreflopScenario,
  PreflopSituation,
  PreflopVerdict,
} from "@/lib/poker";
import { loadPreflopChart } from "@/lib/data";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PreflopTable } from "@/components/table";
import {
  Choice,
  ChoiceButtons,
  Feedback,
  FeedbackStatus,
  TrainerShell,
} from "@/components/ui";

const OPENER_RAISE_BB = 2.5;
const REASONING_STEP = 6; // "What is my action?"

const choice = (id: PreflopAction): Choice<PreflopAction> => ({
  id,
  label: PREFLOP_ACTION_LABEL[id],
});

// Folded to hero: you can only open-raise or fold (nobody to call/3-bet).
// Order fold -> raise so fold sits on the left and the aggressive line on the right.
const RFI_CHOICES: Choice<PreflopAction>[] = [
  choice(PreflopAction.Fold),
  choice(PreflopAction.Raise),
];
// Facing an open: fold (left), flat-call (middle), 3-bet (right).
const VS_RAISE_CHOICES: Choice<PreflopAction>[] = [
  choice(PreflopAction.Fold),
  choice(PreflopAction.Call),
  choice(PreflopAction.ThreeBet),
];

/** Fixed seat order early -> late for the position-contrast strip. */
const SEAT_ORDER: Position[] = [
  Position.UTG,
  Position.MP,
  Position.CO,
  Position.BTN,
  Position.SB,
  Position.BB,
];

/** Tailwind tone for an action chip in the contrast strip. */
function actionTone(action: PreflopAction): string {
  switch (action) {
    case PreflopAction.Raise:
    case PreflopAction.ThreeBet:
      return "bg-emerald-500/20 text-emerald-200";
    case PreflopAction.Call:
      return "bg-amber-500/20 text-amber-200";
    default:
      return "bg-white/5 text-white/40";
  }
}

type Focus = Position | "any";

const FOCUS_OPTIONS: { id: Focus; label: string }[] = [
  { id: "any", label: "Any" },
  ...POSITIONS.map((p) => ({ id: p as Focus, label: p })),
];

export function PreflopTrainer() {
  const [chart, setChart] = useState<PreflopChart | null>(null);
  const [scenario, setScenario] = useState<PreflopScenario | null>(null);
  const [selection, setSelection] = useState<PreflopAction | null>(null);
  const [verdict, setVerdict] = useState<PreflopVerdict | null>(null);
  const [focus, setFocus] = useState<Focus>("any");
  const recordResult = useProgressStore((s) => s.recordResult);

  useEffect(() => {
    loadPreflopChart().then(setChart);
  }, []);

  const deal = useCallback(() => {
    setSelection(null);
    setVerdict(null);
    setScenario(generatePreflopScenario(focus === "any" ? undefined : focus));
  }, [focus]);

  useEffect(() => {
    if (chart) deal();
  }, [chart, deal]);

  const answer = (action: PreflopAction) => {
    if (!chart || !scenario || verdict) return;
    const result = correctPreflopAction(
      chart,
      scenario.position,
      scenario.situation,
      scenario.hand,
    );
    setSelection(action);
    setVerdict(result);
    const isCorrect = action === result.action;
    const context =
      scenario.situation === PreflopSituation.VsRaise && scenario.openerPosition
        ? `facing a ${POSITION_LABEL[scenario.openerPosition]} open`
        : "folded to you";
    recordResult({
      mode: TrainingMode.Preflop,
      correct: isCorrect,
      audit: {
        prompt: `${scenario.hand} from ${POSITION_LABEL[scenario.position]} (${context})`,
        chosen: PREFLOP_ACTION_LABEL[action],
        correct: PREFLOP_ACTION_LABEL[result.action],
        detail: [result.reason].filter(Boolean) as string[],
      },
    });
  };

  if (!scenario) {
    return (
      <TrainerShell mode={TrainingMode.Preflop} highlightStep={REASONING_STEP}>
        <p className="text-white/60">Dealing...</p>
      </TrainerShell>
    );
  }

  const facingRaise = scenario.situation === PreflopSituation.VsRaise;
  const isCorrect = verdict !== null && selection === verdict.action;
  const actionChoices = facingRaise ? VS_RAISE_CHOICES : RFI_CHOICES;

  // Same hand, every seat: the core "UTG folds, Button raises" lesson.
  const contrast =
    chart && verdict
      ? SEAT_ORDER.filter(
          (pos) => !(scenario.situation === PreflopSituation.Rfi && pos === Position.BB),
        ).map((pos) => ({
          pos,
          action: correctPreflopAction(chart, pos, scenario.situation, scenario.hand)
            .action,
        }))
      : [];

  return (
    <TrainerShell mode={TrainingMode.Preflop} highlightStep={REASONING_STEP}>
      <div className="card-surface p-3">
        <p className="mb-2 text-[10px] uppercase tracking-wide text-white/40">
          Practice a seat
        </p>
        <div className="flex flex-wrap gap-1.5">
          {FOCUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFocus(opt.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                focus === opt.id
                  ? "bg-chip-gold text-black"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card-surface p-4">
        <p className="text-sm text-white/80">
          You are in <b>{POSITION_LABEL[scenario.position]}</b>.{" "}
          {facingRaise && scenario.openerPosition
            ? `The ${POSITION_LABEL[scenario.openerPosition]} opens to ${OPENER_RAISE_BB} BB and everyone folds to you.`
            : "Everyone folds to you."}{" "}
          What is your play?
        </p>
      </div>

      <PreflopTable
        heroPosition={scenario.position}
        heroCards={scenario.hole}
        facingRaise={facingRaise}
        openerPosition={scenario.openerPosition}
        openRaiseBB={OPENER_RAISE_BB}
        potBB={facingRaise ? OPENER_RAISE_BB + 1.5 : 1.5}
      />

      <ChoiceButtons
        choices={actionChoices}
        selected={selection ? [selection] : []}
        onToggle={answer}
        columns={actionChoices.length}
        disabled={verdict !== null}
        revealed={verdict !== null}
        correctIds={verdict ? [verdict.action] : []}
      />

      {verdict && (
        <>
          <button className="btn-primary w-full" onClick={deal}>
            Next hand
          </button>

          <Feedback
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            title={
              isCorrect
                ? "Correct!"
                : `Better line: ${PREFLOP_ACTION_LABEL[verdict.action]}`
            }
          >
            <p>{verdict.reason}</p>
          </Feedback>

          <div className="card-surface p-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-chip-gold">
              {scenario.hand} by position{" "}
              <span className="text-white/40 normal-case">
                ({facingRaise ? "facing a raise" : "when folded to you"})
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {contrast.map(({ pos, action }) => (
                <div
                  key={pos}
                  className={`flex flex-col items-center gap-0.5 rounded-md px-2.5 py-1.5 ${actionTone(
                    action,
                  )} ${pos === scenario.position ? "ring-2 ring-chip-gold" : ""}`}
                >
                  <span className="text-[10px] uppercase tracking-wide opacity-70">
                    {pos}
                  </span>
                  <span className="text-xs font-semibold">
                    {PREFLOP_ACTION_LABEL[action]}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-white/50">
              Same cards, different seats: earlier positions must fold hands that later
              positions can open or 3-bet.
            </p>
          </div>
        </>
      )}
    </TrainerShell>
  );
}
