import { useCallback, useEffect, useState } from "react";
import {
  correctPreflopAction,
  generatePreflopScenario,
  POSITION_LABEL,
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
import {
  markersForPosition,
  PokerTable,
  SeatModel,
} from "@/components/table";
import {
  Choice,
  ChoiceButtons,
  Feedback,
  FeedbackStatus,
  TrainerShell,
} from "@/components/ui";

const HERO_STACK_BB = 100;
const OPENER_RAISE_BB = 2.5;
const REASONING_STEP = 6; // "What is my action?"

const ACTION_CHOICES: Choice<PreflopAction>[] = [
  { id: PreflopAction.Fold, label: PREFLOP_ACTION_LABEL[PreflopAction.Fold] },
  { id: PreflopAction.Call, label: PREFLOP_ACTION_LABEL[PreflopAction.Call] },
  { id: PreflopAction.Raise, label: PREFLOP_ACTION_LABEL[PreflopAction.Raise] },
  {
    id: PreflopAction.ThreeBet,
    label: PREFLOP_ACTION_LABEL[PreflopAction.ThreeBet],
  },
];

export function PreflopTrainer() {
  const [chart, setChart] = useState<PreflopChart | null>(null);
  const [scenario, setScenario] = useState<PreflopScenario | null>(null);
  const [choice, setChoice] = useState<PreflopAction | null>(null);
  const [verdict, setVerdict] = useState<PreflopVerdict | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  useEffect(() => {
    loadPreflopChart().then(setChart);
  }, []);

  const deal = useCallback(() => {
    setChoice(null);
    setVerdict(null);
    setScenario(generatePreflopScenario());
  }, []);

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
    setChoice(action);
    setVerdict(result);
    const isCorrect = action === result.action;
    recordResult({
      mode: TrainingMode.Preflop,
      correct: isCorrect,
      mistake: isCorrect
        ? undefined
        : {
            prompt: `${scenario.hand} from ${scenario.position}`,
            chosen: PREFLOP_ACTION_LABEL[action],
            correct: PREFLOP_ACTION_LABEL[result.action],
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
  const heroSeat: SeatModel = {
    id: "hero",
    name: "Hero",
    isHero: true,
    isActive: true,
    position: scenario.position,
    stackBB: HERO_STACK_BB,
    cards: scenario.hole,
    markers: markersForPosition(scenario.position),
  };
  const villainSeats: SeatModel[] = facingRaise
    ? [
        {
          id: "raiser",
          name: "Raiser",
          stackBB: HERO_STACK_BB,
          betBB: OPENER_RAISE_BB,
          cards: [],
          faceDown: true,
        },
      ]
    : [];

  const isCorrect = verdict !== null && choice === verdict.action;

  return (
    <TrainerShell mode={TrainingMode.Preflop} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">
          You are in <b>{POSITION_LABEL[scenario.position]}</b>.{" "}
          {facingRaise
            ? "A player opens to 2.5 BB and it folds to you."
            : "It folds around to you."}{" "}
          What is your play?
        </p>
      </div>

      <PokerTable
        heroSeat={heroSeat}
        villainSeats={villainSeats}
        potBB={facingRaise ? OPENER_RAISE_BB + 1.5 : 1.5}
      />

      <ChoiceButtons
        choices={ACTION_CHOICES}
        selected={choice ? [choice] : []}
        onToggle={answer}
        columns={4}
        disabled={verdict !== null}
        revealed={verdict !== null}
        correctIds={verdict ? [verdict.action] : []}
      />

      {verdict && (
        <>
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
          <button className="btn-primary" onClick={deal}>
            Next hand
          </button>
        </>
      )}
    </TrainerShell>
  );
}
