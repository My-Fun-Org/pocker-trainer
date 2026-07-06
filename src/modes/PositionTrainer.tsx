import { useCallback, useEffect, useState } from "react";
import {
  actsFirst,
  isStealSeat,
  Position,
  POSITION_LABEL,
  POSITIONS,
  Street,
} from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { Choice, ChoiceButtons, Feedback, FeedbackStatus, TrainerShell } from "@/components/ui";

const REASONING_STEP = 1; // Position

type Kind = "actsFirst" | "widen" | "steal" | "defend";

interface Exercise {
  kind: Kind;
  prompt: string;
  choices: Choice<string>[];
  correct: string;
  explanation: string;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function subsetSeats(): Position[] {
  // 3-5 seated players including at least two.
  const count = 3 + Math.floor(Math.random() * 3);
  const shuffled = [...POSITIONS].sort(() => Math.random() - 0.5).slice(0, count);
  return POSITIONS.filter((p) => shuffled.includes(p));
}

const YES = "Yes";
const NO = "No";
const YES_NO: Choice<string>[] = [
  { id: YES, label: YES },
  { id: NO, label: NO },
];

function generateExercise(): Exercise {
  const kind = pick<Kind>(["actsFirst", "widen", "steal", "defend"]);

  if (kind === "actsFirst") {
    const seats = subsetSeats();
    const street = pick([Street.Preflop, Street.Postflop]);
    const first = actsFirst(seats, street);
    return {
      kind,
      prompt: `Seated: ${seats.map((s) => POSITION_LABEL[s]).join(", ")}. Who acts first ${
        street === Street.Preflop ? "preflop" : "postflop"
      }?`,
      choices: seats.map((s) => ({ id: s, label: POSITION_LABEL[s] })),
      correct: first,
      explanation:
        street === Street.Preflop
          ? "Preflop the player left of the big blind acts first; the blinds act last."
          : "Postflop the blinds act first and the button acts last - position is decided by distance from the button.",
    };
  }

  if (kind === "widen") {
    const hero = pick(POSITIONS);
    const shouldWiden = isStealSeat(hero);
    return {
      kind,
      prompt: `You are on the ${POSITION_LABEL[hero]} and it folds to you. Should you widen your opening range here?`,
      choices: YES_NO,
      correct: shouldWiden ? YES : NO,
      explanation: shouldWiden
        ? `${POSITION_LABEL[hero]} is a late seat with few players left to act, so you open wider and realize more equity in position.`
        : `${POSITION_LABEL[hero]} is an early seat with many players behind - open tighter, you will often be out of position.`,
    };
  }

  if (kind === "steal") {
    const hero = pick([Position.CO, Position.BTN, Position.SB]);
    return {
      kind,
      prompt: `It folds to you on the ${POSITION_LABEL[hero]}. Only the blinds remain. Is this a blind-steal spot?`,
      choices: YES_NO,
      correct: YES,
      explanation:
        "With only the blinds left, raising pressures two players who must fold most hands or play out of position - a profitable steal.",
    };
  }

  // defend
  return {
    kind,
    prompt:
      "You are in the Big Blind. The Button opens to 2.5 BB and it folds to you. Should you defend (call/3-bet) rather than fold most hands?",
    choices: YES_NO,
    correct: YES,
    explanation:
      "You already have 1 BB invested and close the action getting a great price, so the Big Blind defends a wide range against a steal.",
  };
}

export function PositionTrainer() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  const next = useCallback(() => {
    setChoice(null);
    setExercise(generateExercise());
  }, []);

  useEffect(() => next(), [next]);

  if (!exercise) return null;

  const answer = (id: string) => {
    if (choice) return;
    setChoice(id);
    const correct = id === exercise.correct;
    const labelFor = (v: string) => exercise.choices.find((c) => c.id === v)?.label ?? v;
    recordResult({
      mode: TrainingMode.Position,
      correct,
      audit: {
        prompt: exercise.prompt,
        chosen: labelFor(id),
        correct: labelFor(exercise.correct),
        detail: [`Exercise type: ${exercise.kind}`, exercise.explanation],
      },
    });
  };

  const isCorrect = choice === exercise.correct;

  return (
    <TrainerShell mode={TrainingMode.Position} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">{exercise.prompt}</p>
      </div>

      <ChoiceButtons
        choices={exercise.choices}
        selected={choice ? [choice] : []}
        onToggle={answer}
        columns={exercise.choices.length > 3 ? 3 : 2}
        disabled={choice !== null}
        revealed={choice !== null}
        correctIds={[exercise.correct]}
      />

      {choice && (
        <>
          <button className="btn-primary w-full" onClick={next}>
            Next exercise
          </button>
          <Feedback
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            title={isCorrect ? "Correct!" : "Not quite"}
          >
            <p>{exercise.explanation}</p>
          </Feedback>
        </>
      )}
    </TrainerShell>
  );
}
