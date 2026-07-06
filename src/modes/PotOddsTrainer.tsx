import { useCallback, useEffect, useState } from "react";
import {
  Decision,
  DECISION_LABEL,
  DRAW_LABEL,
  generatePotOddsScenario,
  PotOddsScenario,
} from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PokerTable, SeatModel } from "@/components/table";
import {
  Choice,
  ChoiceButtons,
  Feedback,
  FeedbackStatus,
  TrainerShell,
} from "@/components/ui";

const REASONING_STEP = 6; // "What is my action?"
const HERO_STACK_BB = 100;

const DECISION_CHOICES: Choice<Decision>[] = [
  { id: Decision.Call, label: DECISION_LABEL[Decision.Call] },
  { id: Decision.Fold, label: DECISION_LABEL[Decision.Fold] },
];

export function PotOddsTrainer() {
  const [scenario, setScenario] = useState<PotOddsScenario | null>(null);
  const [choice, setChoice] = useState<Decision | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  const deal = useCallback(() => {
    setChoice(null);
    setScenario(generatePotOddsScenario());
  }, []);

  useEffect(() => deal(), [deal]);

  if (!scenario) {
    return (
      <TrainerShell mode={TrainingMode.PotOdds} highlightStep={REASONING_STEP}>
        <p className="text-white/60">Dealing...</p>
      </TrainerShell>
    );
  }

  const { analysis, odds, heroEquity, correct, pot, bet } = scenario;

  const answer = (decision: Decision) => {
    if (choice) return;
    setChoice(decision);
    const isCorrect = decision === correct;
    recordResult({
      mode: TrainingMode.PotOdds,
      correct: isCorrect,
      audit: {
        prompt: `Turn: pot ${pot} BB, villain bets ${bet} BB, holding a ${DRAW_LABEL[analysis.drawType].toLowerCase()}`,
        chosen: DECISION_LABEL[decision],
        correct: DECISION_LABEL[correct],
        detail: [
          `Hero: ${scenario.hole.map((c) => `${c.rank}${c.suit}`).join(" ")} | Board: ${scenario.board.map((c) => `${c.rank}${c.suit}`).join(" ")}`,
          `Need ${odds.requiredEquity.toFixed(1)}% equity (${odds.oddsRatio.toFixed(1)} to 1); have ~${heroEquity}% with ${analysis.outs} outs.`,
        ],
      },
    });
  };

  const heroSeat: SeatModel = {
    id: "hero",
    name: "Hero",
    isHero: true,
    isActive: true,
    stackBB: HERO_STACK_BB,
    cards: scenario.hole,
  };
  const villainSeats: SeatModel[] = [
    {
      id: "villain",
      name: "Villain",
      stackBB: HERO_STACK_BB,
      betBB: bet,
      cards: [],
      faceDown: true,
    },
  ];

  const isCorrect = choice === correct;

  return (
    <TrainerShell mode={TrainingMode.PotOdds} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">
          The pot is <b>{pot} BB</b> and the villain bets <b>{bet} BB</b> on the
          turn. You hold a {DRAW_LABEL[analysis.drawType].toLowerCase()}. Do the
          pot odds justify a call?
        </p>
      </div>

      <PokerTable
        heroSeat={heroSeat}
        villainSeats={villainSeats}
        board={scenario.board}
        potBB={pot}
      />

      <ChoiceButtons
        choices={DECISION_CHOICES}
        selected={choice ? [choice] : []}
        onToggle={answer}
        columns={2}
        disabled={choice !== null}
        revealed={choice !== null}
        correctIds={[correct]}
      />

      {choice && (
        <>
          <Feedback
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            title={isCorrect ? "Correct!" : `The correct play is to ${correct}`}
          >
            <p>
              You must call {odds.callAmount} BB to win {odds.finalPot} BB, so you
              need <b>{odds.requiredEquity.toFixed(1)}%</b> equity (pot odds of{" "}
              {odds.oddsRatio.toFixed(1)} to 1).
            </p>
            <p>
              With {analysis.outs} outs and one card to come you have about{" "}
              <b>{heroEquity}%</b> equity - {" "}
              {heroEquity >= odds.requiredEquity
                ? "enough to call profitably."
                : "not enough, so folding is correct."}
            </p>
          </Feedback>
          <button className="btn-primary" onClick={deal}>
            Next hand
          </button>
        </>
      )}
    </TrainerShell>
  );
}
