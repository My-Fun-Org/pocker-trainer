import { useCallback, useEffect, useState } from "react";
import {
  analyzeBoardTexture,
  analyzeDraws,
  breakEvenFold,
  Card,
  computePotOdds,
  DRAW_LABEL,
  DrawType,
  estimateEquityFromOuts,
  isDrawingHand,
  semiBluffScore,
  shuffledDeck,
  Texture,
} from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PokerTable, SeatModel } from "@/components/table";
import { Choice, ChoiceButtons, CoachPanel, FeedbackStatus, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 5; // Bluffs / draws
const HERO_STACK_BB = 100;
const ONE_CARD = 1;
const ASSUMED_FOLD_TO_RAISE = 40;

interface Scenario {
  hole: Card[];
  board: Card[]; // flop
  potBB: number;
  betBB: number;
  drawType: DrawType;
  outs: number;
  equityWhenCalled: number;
  requiredEquity: number;
  wet: boolean;
  correct: string;
  score: number;
}

const FOLD = "Fold";
const CALL = "Call";
const RAISE = "Raise";
const CHOICES: Choice<string>[] = [
  { id: FOLD, label: FOLD },
  { id: CALL, label: CALL },
  { id: RAISE, label: `${RAISE} (semi-bluff)` },
];

function generate(): Scenario {
  for (let i = 0; i < 80; i++) {
    const deck = shuffledDeck();
    const hole = [deck.pop()!, deck.pop()!];
    const board = [deck.pop()!, deck.pop()!, deck.pop()!];
    const analysis = analyzeDraws(hole, board);
    if (!isDrawingHand(analysis.drawType)) continue;

    const potBB = [15, 20, 25, 30][Math.floor(Math.random() * 4)];
    const betBB = Math.round(potBB * [0.33, 0.5, 0.66][Math.floor(Math.random() * 3)]);
    const odds = computePotOdds({ pot: potBB, bet: betBB });
    const equityWhenCalled = estimateEquityFromOuts(analysis.outs, ONE_CARD);
    const wet =
      analyzeBoardTexture(board).texture !== Texture.Dry;
    const score = semiBluffScore(ASSUMED_FOLD_TO_RAISE, equityWhenCalled);

    let correct: string;
    if (analysis.outs >= 8) correct = RAISE; // strong draw: two ways to win
    else if (equityWhenCalled >= odds.requiredEquity) correct = CALL;
    else correct = FOLD;

    return {
      hole,
      board,
      potBB,
      betBB,
      drawType: analysis.drawType,
      outs: analysis.outs,
      equityWhenCalled,
      requiredEquity: odds.requiredEquity,
      wet,
      correct,
      score,
    };
  }
  // Fallback (should be rare): recurse once.
  return generate();
}

export function SemiBluffTrainer() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  const next = useCallback(() => {
    setChoice(null);
    setScenario(generate());
  }, []);

  useEffect(() => next(), [next]);

  if (!scenario) return null;

  const isCorrect = choice === scenario.correct;

  const answer = (id: string) => {
    if (choice) return;
    setChoice(id);
    const correct = id === scenario.correct;
    const fmt = (cs: Card[]) => cs.map((c) => `${c.rank}${c.suit}`).join(" ");
    recordResult({
      mode: TrainingMode.SemiBluff,
      correct,
      audit: {
        prompt: `Flop: ${DRAW_LABEL[scenario.drawType]}, pot ${scenario.potBB} BB, villain bets ${scenario.betBB} BB`,
        chosen: id,
        correct: scenario.correct,
        detail: [
          `Hero: ${fmt(scenario.hole)} | Board: ${fmt(scenario.board)}`,
          `${scenario.outs} outs, ~${scenario.equityWhenCalled}% equity when called vs ${scenario.requiredEquity.toFixed(0)}% required`,
          `Board ${scenario.wet ? "wet" : "dry"}; assumed fold-to-raise ${ASSUMED_FOLD_TO_RAISE}%, semi-bluff score ${scenario.score.toFixed(2)}`,
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
    { id: "villain", name: "Villain", stackBB: HERO_STACK_BB, betBB: scenario.betBB, cards: [], faceDown: true },
  ];

  const reasons =
    scenario.correct === RAISE
      ? [
          `You hold a ${DRAW_LABEL[scenario.drawType].toLowerCase()} with ${scenario.outs} outs (~${scenario.equityWhenCalled}% equity when called).`,
          `A semi-bluff raise wins two ways: fold equity now (~${ASSUMED_FOLD_TO_RAISE}%) plus your outs later - far better than a passive call on a ${scenario.wet ? "wet" : "dry"} board.`,
        ]
      : scenario.correct === CALL
        ? [
            `Your ${scenario.outs} outs give ~${scenario.equityWhenCalled}% equity, above the ${scenario.requiredEquity.toFixed(0)}% the pot odds require.`,
            "Fold equity is too thin to raise, but the price is right to peel and realize your equity.",
          ]
        : [
            `Only ${scenario.outs} outs (~${scenario.equityWhenCalled}% equity) versus the ${scenario.requiredEquity.toFixed(0)}% the pot odds demand.`,
            "Not enough equity or fold equity - releasing is the disciplined play.",
          ];

  return (
    <TrainerShell mode={TrainingMode.SemiBluff} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">
          Flop. Pot <b>{scenario.potBB} BB</b>, villain bets <b>{scenario.betBB} BB</b>. You hold a{" "}
          <b>{DRAW_LABEL[scenario.drawType].toLowerCase()}</b>. What is your play?
        </p>
      </div>

      <PokerTable heroSeat={heroSeat} villainSeats={villainSeats} board={scenario.board} potBB={scenario.potBB} />

      <ChoiceButtons
        choices={CHOICES}
        selected={choice ? [choice] : []}
        onToggle={answer}
        columns={3}
        disabled={choice !== null}
        revealed={choice !== null}
        correctIds={[scenario.correct]}
      />

      {choice && (
        <>
          <CoachPanel
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            output={coach({
              mode: TrainingMode.SemiBluff,
              correctDecision: isCorrect,
              headline: `Best play: ${scenario.correct}.`,
              reasons,
              math: [
                `Pot odds need ${scenario.requiredEquity.toFixed(0)}% equity; you have ~${scenario.equityWhenCalled}%.`,
                `Break-even fold for a bluff-raise ~ ${breakEvenFold(scenario.betBB, scenario.potBB).toFixed(0)}%.`,
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
