import { useCallback, useEffect, useMemo, useState } from "react";
import { parseCards } from "@/lib/poker";
import {
  GateAnswers,
  GateConfig,
  GateInput,
  GateStepId,
  GateStepMode,
  GateStepSpec,
  requiredSatisfied,
} from "@/lib/gate";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PokerTable, SeatModel } from "@/components/table";
import {
  Choice,
  ChoiceButtons,
  CoachPanel,
  FeedbackStatus,
  ReasoningGate,
  TrainerShell,
} from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 3;

interface HandReadingScenario {
  id: string;
  heroCards: string[];
  board: string[];
  situation: string;
  worseOptions: string[];
  worseHandsCall: string[];
  betterOptions: string[];
  betterHandsContinue: string[];
  bluffOptions: string[];
  bluffs: string[];
  actionOptions: string[];
  correctAction: string;
  explanation: string;
}

const SCENARIOS: HandReadingScenario[] = [
  {
    id: "tptk-turn",
    heroCards: ["Ah", "Kd"],
    board: ["Kc", "9d", "4h", "2c"],
    situation: "You raised, villain called. You have top pair top kicker on the turn. You bet, villain calls.",
    worseOptions: ["KQ", "KJ", "KT", "9x", "QJ", "AA", "44"],
    worseHandsCall: ["KQ", "KJ", "KT", "9x"],
    betterOptions: ["AA", "KK", "99", "44", "KQ", "A9"],
    betterHandsContinue: ["AA", "KK", "99", "44"],
    bluffOptions: ["QJ", "JT", "T8s", "AA", "65s"],
    bluffs: ["QJ", "JT", "T8s", "65s"],
    actionOptions: ["Bet again", "Check", "Give up"],
    correctAction: "Bet again",
    explanation:
      "Worse kings and second pair keep calling, only sets and two pair beat you, and busted draws give up - a clear continued value bet.",
  },
  {
    id: "flush-river",
    heroCards: ["Ah", "5h"],
    board: ["Kh", "9h", "3h", "Jd", "2c"],
    situation: "You hold the nut flush on the river after check-check on the turn. Villain leads into you.",
    worseOptions: ["KJ", "two pair", "sets", "smaller flush", "KQ"],
    worseHandsCall: ["KJ", "two pair", "sets", "smaller flush", "KQ"],
    betterOptions: ["straight flush", "KJ", "sets"],
    betterHandsContinue: ["straight flush"],
    bluffOptions: ["missed straights", "QT no pair", "KJ", "smaller flush"],
    bluffs: ["missed straights", "QT no pair"],
    actionOptions: ["Raise for value", "Call", "Fold"],
    correctAction: "Raise for value",
    explanation:
      "You hold the nut flush - nothing better than a straight flush exists (blocked), and worse flushes plus two pair pay a raise. This is a value raise.",
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildConfig(s: HandReadingScenario): GateConfig {
  const steps: GateStepSpec[] = [
    {
      id: GateStepId.WorseHandsCall,
      mode: GateStepMode.Required,
      question: "What worse hands call your bet?",
      input: GateInput.MultiSelect,
      options: s.worseOptions,
      correct: s.worseHandsCall,
      explanation: "",
    },
    {
      id: GateStepId.BetterHandsContinue,
      mode: GateStepMode.Required,
      question: "What better hands continue (raise/call)?",
      input: GateInput.MultiSelect,
      options: s.betterOptions,
      correct: s.betterHandsContinue,
      explanation: "",
    },
    {
      id: GateStepId.Bluffs,
      mode: GateStepMode.Required,
      question: "What bluffs exist in villain's range?",
      input: GateInput.MultiSelect,
      options: s.bluffOptions,
      correct: s.bluffs,
      explanation: "",
    },
  ];
  return { steps };
}

export function HandReadingTrainer() {
  const [scenario, setScenario] = useState<HandReadingScenario | null>(null);
  const [answers, setAnswers] = useState<GateAnswers>({});
  const [action, setAction] = useState<string | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  const next = useCallback(() => {
    setAnswers({});
    setAction(null);
    setScenario(pick(SCENARIOS));
  }, []);

  useEffect(() => next(), [next]);

  const config = useMemo(() => (scenario ? buildConfig(scenario) : null), [scenario]);

  if (!scenario || !config) return null;

  const unlocked = requiredSatisfied(config, answers);
  const isCorrect = action === scenario.correctAction;

  const answer = (id: string) => {
    if (action) return;
    setAction(id);
    const correct = id === scenario.correctAction;
    recordResult({
      mode: TrainingMode.HandReading,
      correct,
      audit: {
        prompt: scenario.situation,
        chosen: id,
        correct: scenario.correctAction,
        detail: [
          `Hero: ${scenario.heroCards.join(" ")} | Board: ${scenario.board.join(" ")}`,
          `Worse hands that call (key): ${scenario.worseHandsCall.join(", ")}`,
          `Better hands that continue (key): ${scenario.betterHandsContinue.join(", ")}`,
          `Bluffs (key): ${scenario.bluffs.join(", ")}`,
          scenario.explanation,
        ],
      },
    });
  };

  const heroSeat: SeatModel = {
    id: "hero",
    name: "Hero",
    isHero: true,
    isActive: true,
    stackBB: 100,
    cards: parseCards(scenario.heroCards),
  };
  const villainSeats: SeatModel[] = [
    { id: "villain", name: "Villain", stackBB: 100, cards: [], faceDown: true },
  ];
  const actionChoices: Choice<string>[] = scenario.actionOptions.map((o) => ({ id: o, label: o }));

  const asArray = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

  return (
    <TrainerShell mode={TrainingMode.HandReading} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">{scenario.situation}</p>
      </div>

      <PokerTable heroSeat={heroSeat} villainSeats={villainSeats} board={parseCards(scenario.board)} />

      <ReasoningGate
        steps={config.steps}
        answers={answers}
        revealed={action !== null}
        onChange={(stepId, value) => setAnswers((prev) => ({ ...prev, [stepId]: value }))}
      />

      <div className="card-surface p-3">
        <p className="mb-2 text-sm font-semibold text-white">
          Your action{" "}
          {!unlocked && (
            <span className="text-xs font-normal text-white/50">(answer the reasoning steps to unlock)</span>
          )}
        </p>
        <ChoiceButtons
          choices={actionChoices}
          selected={action ? [action] : []}
          onToggle={answer}
          columns={actionChoices.length}
          disabled={!unlocked || action !== null}
          revealed={action !== null}
          correctIds={[scenario.correctAction]}
        />
      </div>

      {action && (
        <>
          <CoachPanel
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            output={coach({
              mode: TrainingMode.HandReading,
              correctDecision: isCorrect,
              headline: `Recommended line: ${scenario.correctAction}.`,
              reasons: [scenario.explanation],
              reads: [
                { label: "worse hands that call", chosen: asArray(answers[GateStepId.WorseHandsCall]), correct: scenario.worseHandsCall },
                { label: "better hands that continue", chosen: asArray(answers[GateStepId.BetterHandsContinue]), correct: scenario.betterHandsContinue },
                { label: "bluffs", chosen: asArray(answers[GateStepId.Bluffs]), correct: scenario.bluffs },
              ],
            })}
          />
          <button className="btn-primary" onClick={next}>
            Next spot
          </button>
        </>
      )}
    </TrainerShell>
  );
}
