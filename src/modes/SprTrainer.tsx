import { useCallback, useEffect, useState } from "react";
import {
  Card,
  commitmentAdvice,
  HandClass,
  shuffledDeck,
  spr,
  SPR_BUCKETS,
  sprBucket,
} from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PokerTable, SeatModel } from "@/components/table";
import { Choice, ChoiceButtons, CoachPanel, FeedbackStatus, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 2; // Stack depth

const HAND_CLASSES: { cls: HandClass; label: string }[] = [
  { cls: HandClass.TopPair, label: "top pair" },
  { cls: HandClass.Overpair, label: "an overpair" },
  { cls: HandClass.MiddlePair, label: "middle pair" },
  { cls: HandClass.Set, label: "a set" },
  { cls: HandClass.TwoPair, label: "two pair" },
];

interface Scenario {
  hole: Card[];
  flop: Card[];
  potBB: number;
  effectiveStackBB: number;
  sprValue: number;
  bucket: string;
  handClass: HandClass;
  handLabel: string;
  committed: boolean;
  reason: string;
}

const YES = "Committed";
const NO = "Not committed";
const COMMIT_CHOICES: Choice<string>[] = [
  { id: YES, label: YES },
  { id: NO, label: NO },
];

function generate(): Scenario {
  const deck = shuffledDeck();
  const hole = [deck.pop()!, deck.pop()!];
  const flop = [deck.pop()!, deck.pop()!, deck.pop()!];
  const potBB = [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)];
  const effectiveStackBB = [20, 40, 60, 100, 150, 200][Math.floor(Math.random() * 6)];
  const sprValue = spr(potBB, effectiveStackBB);
  const { cls, label } = HAND_CLASSES[Math.floor(Math.random() * HAND_CLASSES.length)];
  const advice = commitmentAdvice(sprValue, cls);
  return {
    hole,
    flop,
    potBB,
    effectiveStackBB,
    sprValue,
    bucket: sprBucket(sprValue),
    handClass: cls,
    handLabel: label,
    committed: advice.committed,
    reason: advice.reason,
  };
}

const BUCKET_CHOICES: Choice<string>[] = SPR_BUCKETS.map((b) => ({ id: b, label: `SPR ${b}` }));

export function SprTrainer() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [bucketGuess, setBucketGuess] = useState<string | null>(null);
  const [commitGuess, setCommitGuess] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const recordResult = useProgressStore((s) => s.recordResult);

  const next = useCallback(() => {
    setBucketGuess(null);
    setCommitGuess(null);
    setSubmitted(false);
    setScenario(generate());
  }, []);

  useEffect(() => next(), [next]);

  if (!scenario) return null;

  const bucketCorrect = bucketGuess === scenario.bucket;
  const commitCorrect = commitGuess === (scenario.committed ? YES : NO);
  const allCorrect = bucketCorrect && commitCorrect;

  const submit = () => {
    if (submitted || !bucketGuess || !commitGuess) return;
    setSubmitted(true);
    recordResult({
      mode: TrainingMode.Spr,
      correct: allCorrect,
      audit: {
        prompt: `Pot ${scenario.potBB} BB, effective stack ${scenario.effectiveStackBB} BB, holding ${scenario.handLabel}`,
        chosen: `${bucketGuess}, ${commitGuess}`,
        correct: `SPR ${scenario.bucket}, ${scenario.committed ? YES : NO}`,
        detail: [
          `Hero: ${scenario.hole.map((c) => `${c.rank}${c.suit}`).join(" ")} | Flop: ${scenario.flop.map((c) => `${c.rank}${c.suit}`).join(" ")}`,
          `SPR = ${scenario.effectiveStackBB} / ${scenario.potBB} = ${scenario.sprValue.toFixed(1)} (${scenario.bucket})`,
          scenario.reason,
        ],
      },
    });
  };

  const heroSeat: SeatModel = {
    id: "hero",
    name: "Hero",
    isHero: true,
    isActive: true,
    stackBB: scenario.effectiveStackBB,
    cards: scenario.hole,
  };

  return (
    <TrainerShell mode={TrainingMode.Spr} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">
          The pot is <b>{scenario.potBB} BB</b> and effective stacks are{" "}
          <b>{scenario.effectiveStackBB} BB</b>. You hold <b>{scenario.handLabel}</b>. Estimate
          the SPR and decide whether you are committed.
        </p>
      </div>

      <PokerTable heroSeat={heroSeat} board={scenario.flop} potBB={scenario.potBB} />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white/70">What is the SPR?</h3>
        <ChoiceButtons
          choices={BUCKET_CHOICES}
          selected={bucketGuess ? [bucketGuess] : []}
          onToggle={setBucketGuess}
          columns={4}
          disabled={submitted}
          revealed={submitted}
          correctIds={[scenario.bucket]}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white/70">Are you committed with this hand?</h3>
        <ChoiceButtons
          choices={COMMIT_CHOICES}
          selected={commitGuess ? [commitGuess] : []}
          onToggle={setCommitGuess}
          columns={2}
          disabled={submitted}
          revealed={submitted}
          correctIds={[scenario.committed ? YES : NO]}
        />
      </div>

      {!submitted ? (
        <button
          className="btn-primary"
          disabled={!bucketGuess || !commitGuess}
          onClick={submit}
        >
          Check answer
        </button>
      ) : (
        <>
          <button className="btn-primary w-full" onClick={next}>
            Next spot
          </button>
          <CoachPanel
            status={allCorrect ? FeedbackStatus.Correct : bucketCorrect || commitCorrect ? FeedbackStatus.Partial : FeedbackStatus.Incorrect}
            output={coach({
              mode: TrainingMode.Spr,
              correctDecision: allCorrect,
              headline: `SPR is about ${scenario.sprValue.toFixed(1)} (${scenario.bucket}).`,
              reasons: [scenario.reason],
              math: [
                `SPR = effective stack / pot = ${scenario.effectiveStackBB} / ${scenario.potBB} = ${scenario.sprValue.toFixed(1)}`,
              ],
            })}
          />
        </>
      )}
    </TrainerShell>
  );
}
