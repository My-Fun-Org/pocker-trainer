import { useCallback, useEffect, useState } from "react";
import {
  analyzeBoardTexture,
  BET_INTENT_LABEL,
  BET_SIZE_LABEL,
  BET_SIZE_OPTIONS,
  BetIntent,
  BetSize,
  Card,
  recommendSizes,
  shuffledDeck,
  spr,
  TEXTURE_LABEL,
} from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PokerTable, SeatModel } from "@/components/table";
import { Choice, ChoiceButtons, CoachPanel, FeedbackStatus, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 6; // Action
const HERO_STACK_BB = 100;

interface Scenario {
  hole: Card[];
  flop: Card[];
  potBB: number;
  effectiveStackBB: number;
  intent: BetIntent;
  recommended: BetSize[];
  explanation: string;
  textureLabel: string;
}

const INTENTS: BetIntent[] = [
  BetIntent.Value,
  BetIntent.Bluff,
  BetIntent.SemiBluff,
  BetIntent.Protection,
];

const SIZE_CHOICES: Choice<BetSize>[] = BET_SIZE_OPTIONS.map((id) => ({
  id,
  label: BET_SIZE_LABEL[id],
}));

function generate(): Scenario {
  const deck = shuffledDeck();
  const hole = [deck.pop()!, deck.pop()!];
  const flop = [deck.pop()!, deck.pop()!, deck.pop()!];
  const texture = analyzeBoardTexture(flop);
  const potBB = [8, 12, 16, 20, 30][Math.floor(Math.random() * 5)];
  const effectiveStackBB = HERO_STACK_BB - potBB / 2;
  const intent = INTENTS[Math.floor(Math.random() * INTENTS.length)];
  const advice = recommendSizes(texture.texture, intent, spr(potBB, effectiveStackBB));
  return {
    hole,
    flop,
    potBB,
    effectiveStackBB,
    intent,
    recommended: advice.recommended,
    explanation: advice.explanation,
    textureLabel: TEXTURE_LABEL[texture.texture],
  };
}

export function BetSizeTrainer() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [choice, setChoice] = useState<BetSize | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  const next = useCallback(() => {
    setChoice(null);
    setScenario(generate());
  }, []);

  useEffect(() => next(), [next]);

  if (!scenario) return null;

  const answer = (size: BetSize) => {
    if (choice) return;
    setChoice(size);
    const correct = scenario.recommended.includes(size);
    recordResult({
      mode: TrainingMode.BetSize,
      correct,
      audit: {
        prompt: `${BET_INTENT_LABEL[scenario.intent]} on a ${scenario.textureLabel} board (pot ${scenario.potBB} BB, stack ${scenario.effectiveStackBB} BB)`,
        chosen: BET_SIZE_LABEL[size],
        correct: scenario.recommended.map((s) => BET_SIZE_LABEL[s]).join(" or "),
        detail: [
          `Hero: ${scenario.hole.map((c) => `${c.rank}${c.suit}`).join(" ")} | Flop: ${scenario.flop.map((c) => `${c.rank}${c.suit}`).join(" ")}`,
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
    stackBB: scenario.effectiveStackBB,
    cards: scenario.hole,
  };
  const isCorrect = choice !== null && scenario.recommended.includes(choice);

  return (
    <TrainerShell mode={TrainingMode.BetSize} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">
          Pot is <b>{scenario.potBB} BB</b>, effective stacks{" "}
          <b>{scenario.effectiveStackBB} BB</b>. Your intent is{" "}
          <b>{BET_INTENT_LABEL[scenario.intent]}</b> on this{" "}
          <b>{scenario.textureLabel}</b> board. Pick the best size.
        </p>
      </div>

      <PokerTable heroSeat={heroSeat} board={scenario.flop} potBB={scenario.potBB} />

      <ChoiceButtons
        choices={SIZE_CHOICES}
        selected={choice ? [choice] : []}
        onToggle={answer}
        columns={4}
        disabled={choice !== null}
        revealed={choice !== null}
        correctIds={scenario.recommended}
      />

      {choice && (
        <>
          <CoachPanel
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Partial}
            output={coach({
              mode: TrainingMode.BetSize,
              correctDecision: isCorrect,
              headline: isCorrect
                ? "Good sizing."
                : `Prefer ${scenario.recommended.map((s) => BET_SIZE_LABEL[s]).join(" or ")}.`,
              reasons: [scenario.explanation],
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
