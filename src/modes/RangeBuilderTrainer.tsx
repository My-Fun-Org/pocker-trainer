import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, expandRange, expandRangeToCombos, parseCards } from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PokerTable, SeatModel } from "@/components/table";
import { CoachPanel, FeedbackStatus, RangeGrid, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 3; // Villain range

interface StreetStep {
  name: string;
  board: string[];
  action: string;
  targetTokens: string[];
}

interface RangeScenario {
  id: string;
  heroCards: string[];
  villainDesc: string;
  streets: StreetStep[];
}

const SCENARIO: RangeScenario = {
  id: "btn-vs-bb",
  heroCards: ["Ah", "Kh"],
  villainDesc: "The Button opens and you call from the BB. Narrow their range street by street.",
  streets: [
    {
      name: "Preflop",
      board: [],
      action: "Button opens 2.5x - a wide steal range.",
      targetTokens: ["22+", "A2s+", "K9s+", "Q9s+", "J9s+", "T8s+", "98s", "ATo+", "KJo+", "QJo"],
    },
    {
      name: "Flop",
      board: ["Ks", "8d", "3c"],
      action: "You check, Button c-bets small, you call. They keep a range that bets this dry K-high board.",
      targetTokens: ["AA", "KK", "88", "33", "AKo", "AKs", "KQs", "KJs", "KTs", "A8s", "98s", "76s"],
    },
    {
      name: "Turn",
      board: ["Ks", "8d", "3c", "2h"],
      action: "You check-call again. Only value and strong draws keep barreling; floats give up.",
      targetTokens: ["AA", "KK", "88", "33", "AKo", "AKs", "KQs", "KJs"],
    },
  ],
};

function overlap(chosen: Set<string>, target: Set<string>): number {
  if (target.size === 0) return 0;
  let hit = 0;
  for (const h of target) if (chosen.has(h)) hit++;
  const extra = [...chosen].filter((h) => !target.has(h)).length;
  const raw = (hit - extra * 0.5) / target.size;
  return Math.max(0, Math.min(1, raw));
}

export function RangeBuilderTrainer() {
  const scenario = SCENARIO;
  const [streetIndex, setStreetIndex] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const recordResult = useProgressStore((s) => s.recordResult);

  const reset = useCallback(() => {
    setStreetIndex(0);
    setSelected(new Set());
    setSubmitted(false);
    setScores([]);
  }, []);

  useEffect(() => reset(), [reset]);

  const step = scenario.streets[streetIndex];
  const target = useMemo(() => new Set(expandRange(step.targetTokens)), [step]);
  const dead: Card[] = useMemo(
    () => parseCards([...scenario.heroCards, ...step.board]),
    [step],
  );

  const toggle = (hand: string) => {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(hand)) next.delete(hand);
      else next.add(hand);
      return next;
    });
  };

  const submit = () => {
    if (submitted) return;
    setSubmitted(true);
    const score = overlap(selected, target);
    const nextScores = [...scores, score];
    setScores(nextScores);
    const isLast = streetIndex === scenario.streets.length - 1;
    if (isLast) {
      const avg = nextScores.reduce((a, b) => a + b, 0) / nextScores.length;
      recordResult({
        mode: TrainingMode.RangeBuilder,
        correct: avg >= 0.6,
        mistake:
          avg >= 0.6
            ? undefined
            : { prompt: scenario.id, chosen: `${Math.round(avg * 100)}% match`, correct: "60%+ target match" },
      });
    }
  };

  const advance = () => {
    if (streetIndex < scenario.streets.length - 1) {
      setStreetIndex((i) => i + 1);
      setSelected(new Set());
      setSubmitted(false);
    } else {
      reset();
    }
  };

  const combos = expandRangeToCombos(step.targetTokens, dead);
  const heroSeat: SeatModel = {
    id: "hero",
    name: "Hero",
    isHero: true,
    isActive: true,
    stackBB: 100,
    cards: parseCards(scenario.heroCards),
  };
  const villainSeats: SeatModel[] = [
    { id: "villain", name: "Button", stackBB: 100, cards: [], faceDown: true },
  ];
  const lastScore = scores[scores.length - 1] ?? 0;

  return (
    <TrainerShell mode={TrainingMode.RangeBuilder} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">{scenario.villainDesc}</p>
        <p className="mt-2 text-sm">
          <span className="font-semibold text-chip-gold">{step.name}:</span> {step.action}
        </p>
      </div>

      <PokerTable
        heroSeat={heroSeat}
        villainSeats={villainSeats}
        board={parseCards(step.board)}
        showPlaceholders={step.board.length > 0}
      />

      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-white/70">
          Select the hands you think are in the Button's range here.
        </p>
        <RangeGrid selected={selected} onToggle={toggle} revealed={submitted} target={target} />
        {submitted && (
          <p className="text-xs text-white/50">
            Target range: <b className="text-white/80">{combos} combos</b> · green = correct, red =
            extra, amber = missed
          </p>
        )}
      </div>

      {!submitted ? (
        <button className="btn-primary" onClick={submit}>
          Check {step.name} range
        </button>
      ) : (
        <>
          <CoachPanel
            status={lastScore >= 0.6 ? FeedbackStatus.Correct : FeedbackStatus.Partial}
            output={coach({
              mode: TrainingMode.RangeBuilder,
              correctDecision: lastScore >= 0.6,
              headline: `${step.name} range: ${Math.round(lastScore * 100)}% match (${combos} combos).`,
              reasons: [
                step.action,
                streetIndex < scenario.streets.length - 1
                  ? "As the hand continues the range narrows - drop the hands that would have taken a different line."
                  : "Notice how the range collapsed street by street; that shrinking set is what you bluff-catch or value bet against.",
              ],
            })}
          />
          <button className="btn-primary" onClick={advance}>
            {streetIndex < scenario.streets.length - 1 ? `Next street (${scenario.streets[streetIndex + 1].name})` : "Restart"}
          </button>
        </>
      )}
    </TrainerShell>
  );
}
