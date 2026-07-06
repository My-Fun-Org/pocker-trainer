import { useCallback, useEffect, useState } from "react";
import { computePotOdds, parseCards } from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PokerTable, SeatModel } from "@/components/table";
import { Choice, ChoiceButtons, CoachPanel, FeedbackStatus, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 3;

interface RiverScenario {
  id: string;
  heroCards: string[];
  board: string[];
  heroDesc: string;
  history: string;
  potBB: number;
  betBB: number;
  valueCombos: number;
  bluffCombos: number;
  actionOptions: string[];
  correctAction: string;
  explanation: string;
}

const SCENARIOS: RiverScenario[] = [
  {
    id: "bluff-catch-call",
    heroCards: ["Ah", "Jc"],
    board: ["Jd", "9s", "4c", "2h", "7d"],
    heroDesc: "top pair (AJ) - a bluff-catcher",
    history: "You called two streets. Villain fires a big river bet.",
    potBB: 30,
    betBB: 20,
    valueCombos: 6,
    bluffCombos: 12,
    actionOptions: ["Call", "Fold", "Raise"],
    correctAction: "Call",
    explanation:
      "6 value combos vs 12 bluff combos means villain is bluffing more than half the time. Getting the price you need, your bluff-catcher is a clear call.",
  },
  {
    id: "bluff-catch-fold",
    heroCards: ["Ah", "Tc"],
    board: ["Ks", "Qd", "5c", "3h", "2s"],
    heroDesc: "ace-high (missed AT)",
    history: "Villain check-called flop, then leads turn and rivers a pot-sized bet.",
    potBB: 24,
    betBB: 24,
    valueCombos: 14,
    bluffCombos: 4,
    actionOptions: ["Call", "Fold", "Raise"],
    correctAction: "Fold",
    explanation:
      "Villain's line is value-heavy: 14 value combos to only 4 bluffs. Facing a pot-sized bet you need 33% and have far less - this is a fold.",
  },
  {
    id: "thin-value",
    heroCards: ["Ac", "Qd"],
    board: ["Qs", "Jd", "6c", "4h", "2s"],
    heroDesc: "top pair top kicker (AQ)",
    history: "You have position and villain checks the river to you.",
    potBB: 20,
    betBB: 12,
    valueCombos: 0,
    bluffCombos: 0,
    actionOptions: ["Bet thin value", "Check back"],
    correctAction: "Bet thin value",
    explanation:
      "Worse queens and jacks call a small bet while few better hands checked to you - a 1/2 pot thin value bet prints against a capped range.",
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function RiverTrainer() {
  const [scenario, setScenario] = useState<RiverScenario | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  const next = useCallback(() => {
    setChoice(null);
    setScenario(pick(SCENARIOS));
  }, []);

  useEffect(() => next(), [next]);

  if (!scenario) return null;

  const totalCombos = scenario.valueCombos + scenario.bluffCombos;
  const odds = computePotOdds({ pot: scenario.potBB, bet: scenario.betBB });
  const bluffShare = totalCombos > 0 ? (scenario.bluffCombos / totalCombos) * 100 : 0;
  const isCorrect = choice === scenario.correctAction;

  const answer = (id: string) => {
    if (choice) return;
    setChoice(id);
    const correct = id === scenario.correctAction;
    recordResult({
      mode: TrainingMode.River,
      correct,
      audit: {
        prompt: `${scenario.heroDesc} - ${scenario.history}`,
        chosen: id,
        correct: scenario.correctAction,
        detail: [
          `Hero: ${scenario.heroCards.join(" ")} | Board: ${scenario.board.join(" ")}`,
          totalCombos > 0
            ? `Villain range: ${scenario.valueCombos} value vs ${scenario.bluffCombos} bluff combos (bluff ${bluffShare.toFixed(0)}%); need ${odds.requiredEquity.toFixed(0)}% to call.`
            : `Thin value: bet ${scenario.betBB} into ${scenario.potBB}.`,
          scenario.explanation,
        ],
      },
    });
  };

  const choices: Choice<string>[] = scenario.actionOptions.map((o) => ({ id: o, label: o }));
  const heroSeat: SeatModel = {
    id: "hero",
    name: "Hero",
    isHero: true,
    isActive: true,
    stackBB: 100,
    cards: parseCards(scenario.heroCards),
  };
  const villainSeats: SeatModel[] = [
    {
      id: "villain",
      name: "Villain",
      stackBB: 100,
      betBB: scenario.correctAction.includes("value") ? undefined : scenario.betBB,
      cards: [],
      faceDown: true,
    },
  ];

  const math =
    totalCombos > 0
      ? [
          `Villain range: ${scenario.valueCombos} value combos vs ${scenario.bluffCombos} bluff combos.`,
          `Bluff share = ${scenario.bluffCombos}/${totalCombos} = ${bluffShare.toFixed(0)}%.`,
          `You need ${odds.requiredEquity.toFixed(0)}% to call (pot ${scenario.potBB}, bet ${scenario.betBB}).`,
        ]
      : [`Betting ${scenario.betBB} into ${scenario.potBB} for thin value.`];

  return (
    <TrainerShell mode={TrainingMode.River} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">
          River. You have <b>{scenario.heroDesc}</b>. {scenario.history}
        </p>
      </div>

      <PokerTable heroSeat={heroSeat} villainSeats={villainSeats} board={parseCards(scenario.board)} potBB={scenario.potBB} />

      <ChoiceButtons
        choices={choices}
        selected={choice ? [choice] : []}
        onToggle={answer}
        columns={choices.length}
        disabled={choice !== null}
        revealed={choice !== null}
        correctIds={[scenario.correctAction]}
      />

      {choice && (
        <>
          <button className="btn-primary w-full" onClick={next}>
            Next river
          </button>
          <CoachPanel
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            output={coach({
              mode: TrainingMode.River,
              correctDecision: isCorrect,
              headline: `Best play: ${scenario.correctAction}.`,
              reasons: [scenario.explanation],
              math,
            })}
          />
        </>
      )}
    </TrainerShell>
  );
}
