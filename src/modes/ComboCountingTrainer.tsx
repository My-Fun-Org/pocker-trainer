import { useCallback, useEffect, useState } from "react";
import { Card, comboCount, formatCard, shuffledDeck } from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PlayingCard } from "@/components/table";
import { Choice, ChoiceButtons, CoachPanel, FeedbackStatus, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 3; // Villain range

const HANDS = ["AA", "KK", "QQ", "AKs", "AKo", "AK", "QJs", "T9s", "77", "A5s"];

type Kind = "count" | "compare";

interface Scenario {
  kind: Kind;
  dead: Card[];
  hand?: string;
  handA?: string;
  handB?: string;
  correct: string;
  countA?: number;
  countB?: number;
  explanation: string;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generate(): Scenario {
  const kind: Kind = Math.random() < 0.5 ? "count" : "compare";
  const deck = shuffledDeck();
  const deadCount = pick([0, 3, 3, 4]);
  const dead: Card[] = [];
  for (let i = 0; i < deadCount; i++) dead.push(deck.pop()!);

  if (kind === "count") {
    const hand = pick(HANDS);
    const n = comboCount(hand, dead);
    return {
      kind,
      dead,
      hand,
      correct: String(n),
      explanation:
        dead.length === 0
          ? `${hand} has ${n} combos with a full deck (pairs 6, suited 4, offsuit 12, any 16).`
          : `${hand} drops to ${n} combos once the board removes matching cards - blockers matter.`,
    };
  }

  let handA = pick(HANDS);
  let handB = pick(HANDS);
  while (handB === handA) handB = pick(HANDS);
  const countA = comboCount(handA, dead);
  const countB = comboCount(handB, dead);
  const correct = countA === countB ? "Equal" : countA > countB ? "A" : "B";
  return {
    kind,
    dead,
    handA,
    handB,
    countA,
    countB,
    correct,
    explanation: `${handA} = ${countA} combos, ${handB} = ${countB} combos${
      dead.length ? " after card removal" : ""
    }.`,
  };
}

function countOptions(correct: number): Choice<string>[] {
  const set = new Set<number>([correct, 3, 4, 6, 9, 12, 16]);
  return [...set].sort((a, b) => a - b).map((v) => ({ id: String(v), label: String(v) }));
}

const COMPARE_OPTIONS: Choice<string>[] = [
  { id: "A", label: "Hand A" },
  { id: "B", label: "Hand B" },
  { id: "Equal", label: "Equal" },
];

export function ComboCountingTrainer() {
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
    recordResult({
      mode: TrainingMode.ComboCounting,
      correct,
      audit: {
        prompt:
          scenario.kind === "count"
            ? `How many combos of ${scenario.hand}${scenario.dead.length ? " (with dead cards)" : ""}?`
            : `Which is more likely: ${scenario.handA} (A) or ${scenario.handB} (B)?`,
        chosen: id,
        correct: scenario.correct,
        detail: [
          scenario.dead.length ? `Dead cards: ${scenario.dead.map(formatCard).join(" ")}` : "Full deck (no dead cards)",
          scenario.explanation,
        ],
      },
    });
  };

  return (
    <TrainerShell mode={TrainingMode.ComboCounting} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        {scenario.kind === "count" ? (
          <p className="text-sm text-white/80">
            How many combinations of <b>{scenario.hand}</b> are possible
            {scenario.dead.length ? " given the dead cards below?" : " with a full deck?"}
          </p>
        ) : (
          <p className="text-sm text-white/80">
            Which is more likely here - <b>{scenario.handA}</b> (A) or <b>{scenario.handB}</b> (B)?
          </p>
        )}
      </div>

      {scenario.dead.length > 0 && (
        <div className="card-surface flex items-center gap-3 p-4">
          <span className="text-xs uppercase tracking-wide text-white/50">Dead cards</span>
          <div className="flex gap-1.5">
            {scenario.dead.map((c) => (
              <PlayingCard key={formatCard(c)} card={c} size="sm" />
            ))}
          </div>
        </div>
      )}

      <ChoiceButtons
        choices={scenario.kind === "count" ? countOptions(Number(scenario.correct)) : COMPARE_OPTIONS}
        selected={choice ? [choice] : []}
        onToggle={answer}
        columns={scenario.kind === "count" ? 4 : 3}
        disabled={choice !== null}
        revealed={choice !== null}
        correctIds={[scenario.correct]}
      />

      {choice && (
        <>
          <button className="btn-primary w-full" onClick={next}>
            Next question
          </button>
          <CoachPanel
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            output={coach({
              mode: TrainingMode.ComboCounting,
              correctDecision: isCorrect,
              headline: isCorrect ? "Correct count!" : "Recount the combos",
              reasons: [scenario.explanation],
            })}
          />
        </>
      )}
    </TrainerShell>
  );
}
