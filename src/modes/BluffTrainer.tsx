import { useCallback, useEffect, useState } from "react";
import {
  breakEvenFold,
  Card,
  PLAYER_TYPE_PROFILES,
  PLAYER_TYPES,
  PlayerType,
  shuffledDeck,
} from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PokerTable, SeatModel } from "@/components/table";
import { Choice, ChoiceButtons, CoachPanel, FeedbackStatus, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 5; // Bluffs
const HERO_STACK_BB = 100;

/** Rough fold-to-river-bet tendency by archetype (percent). */
const FOLD_TENDENCY: Record<PlayerType, number> = {
  [PlayerType.Nit]: 68,
  [PlayerType.Tag]: 52,
  [PlayerType.Lag]: 42,
  [PlayerType.CallingStation]: 15,
  [PlayerType.Maniac]: 30,
  [PlayerType.Whale]: 18,
  [PlayerType.ShortStack]: 45,
};

interface Scenario {
  hole: Card[];
  board: Card[];
  villainType: PlayerType;
  potBB: number;
  betBB: number;
  requiredFold: number;
  estimatedFold: number;
  correct: string;
}

const BLUFF = "Bluff";
const CHECK = "Give up";
const CHOICES: Choice<string>[] = [
  { id: BLUFF, label: BLUFF },
  { id: CHECK, label: CHECK },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generate(): Scenario {
  const deck = shuffledDeck();
  const hole = [deck.pop()!, deck.pop()!];
  const board = [deck.pop()!, deck.pop()!, deck.pop()!, deck.pop()!, deck.pop()!];
  const villainType = pick(PLAYER_TYPES);
  const potBB = pick([20, 30, 40, 60]);
  const betBB = Math.round(potBB * pick([0.5, 0.66, 0.75, 1]));
  const requiredFold = breakEvenFold(betBB, potBB);
  const estimatedFold = FOLD_TENDENCY[villainType];
  const correct = estimatedFold >= requiredFold ? BLUFF : CHECK;
  return { hole, board, villainType, potBB, betBB, requiredFold, estimatedFold, correct };
}

export function BluffTrainer() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  const next = useCallback(() => {
    setChoice(null);
    setScenario(generate());
  }, []);

  useEffect(() => next(), [next]);

  if (!scenario) return null;

  const profile = PLAYER_TYPE_PROFILES[scenario.villainType];
  const isCorrect = choice === scenario.correct;

  const answer = (id: string) => {
    if (choice) return;
    setChoice(id);
    const correct = id === scenario.correct;
    recordResult({
      mode: TrainingMode.Bluff,
      correct,
      mistake: correct
        ? undefined
        : { prompt: `Bluff vs ${profile.label}`, chosen: id, correct: scenario.correct },
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
    { id: "villain", name: profile.label, stackBB: HERO_STACK_BB, cards: [], faceDown: true },
  ];

  return (
    <TrainerShell mode={TrainingMode.Bluff} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">
          River. Pot <b>{scenario.potBB} BB</b>. Your hand missed. If you bet{" "}
          <b>{scenario.betBB} BB</b> as a bluff against this <b>{profile.label}</b>, should you
          pull the trigger?
        </p>
      </div>

      <PokerTable heroSeat={heroSeat} villainSeats={villainSeats} board={scenario.board} potBB={scenario.potBB} />

      <ChoiceButtons
        choices={CHOICES}
        selected={choice ? [choice] : []}
        onToggle={answer}
        columns={2}
        disabled={choice !== null}
        revealed={choice !== null}
        correctIds={[scenario.correct]}
      />

      {choice && (
        <>
          <CoachPanel
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            output={coach({
              mode: TrainingMode.Bluff,
              correctDecision: isCorrect,
              headline: scenario.correct === BLUFF ? "This is a profitable bluff." : "Give it up here.",
              reasons: [
                `Betting ${scenario.betBB} into ${scenario.potBB} needs villain to fold ${scenario.requiredFold.toFixed(0)}%.`,
                `A ${profile.label} folds roughly ${scenario.estimatedFold}% - ${
                  scenario.estimatedFold >= scenario.requiredFold ? "enough" : "not enough"
                }. ${profile.adjustment}`,
              ],
              math: [
                `Break-even fold = bet / (bet + pot) = ${scenario.betBB} / ${scenario.betBB + scenario.potBB} = ${scenario.requiredFold.toFixed(0)}%`,
                `Estimated fold ${scenario.estimatedFold}% ${scenario.estimatedFold >= scenario.requiredFold ? ">=" : "<"} ${scenario.requiredFold.toFixed(0)}%`,
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
