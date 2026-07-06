import { useCallback, useEffect, useMemo, useState } from "react";
import { loadRangeScenarios, RangeScenario } from "@/lib/data";
import { POSITION_LABEL } from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import {
  markersForPosition,
  PokerTable,
  SeatModel,
} from "@/components/table";
import {
  Choice,
  ChoiceButtons,
  Feedback,
  FeedbackStatus,
  TrainerShell,
} from "@/components/ui";

const REASONING_STEP = 3; // "What worse hands call? / think in ranges"

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((x) => setB.has(x));
}

export function RangeTrainer() {
  const [scenarios, setScenarios] = useState<RangeScenario[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const recordResult = useProgressStore((s) => s.recordResult);

  useEffect(() => {
    loadRangeScenarios().then(setScenarios);
  }, []);

  const scenario = scenarios[index];

  const choices: Choice<string>[] = useMemo(
    () =>
      scenario?.question.options.map((o) => ({ id: o, label: o })) ?? [],
    [scenario],
  );

  const toggle = (id: string) => {
    if (submitted) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const next = useCallback(() => {
    setSelected([]);
    setSubmitted(false);
    setIndex((i) => (i + 1) % scenarios.length);
  }, [scenarios.length]);

  if (!scenario) {
    return (
      <TrainerShell mode={TrainingMode.Range} highlightStep={REASONING_STEP}>
        <p className="text-white/60">Loading scenarios...</p>
      </TrainerShell>
    );
  }

  const correctAnswers = scenario.question.correctAnswers;
  const isCorrect = sameSet(selected, correctAnswers);

  const submit = () => {
    if (submitted) return;
    setSubmitted(true);
    const fmt = (cs: { rank: string; suit: string }[]) => cs.map((c) => `${c.rank}${c.suit}`).join(" ");
    recordResult({
      mode: TrainingMode.Range,
      correct: isCorrect,
      audit: {
        prompt: `${scenario.title} - ${scenario.question.prompt}`,
        chosen: selected.join(", ") || "(nothing)",
        correct: correctAnswers.join(", "),
        detail: [
          `Hero: ${fmt(scenario.heroCards)}${board.length ? ` | Board: ${fmt(board)}` : ""}`,
          ...scenario.preflopAction,
          scenario.question.explanation,
        ],
      },
    });
  };

  const board = [...scenario.flop, ...scenario.turn, ...scenario.river];
  const heroSeat: SeatModel = {
    id: "hero",
    name: "Hero",
    isHero: true,
    isActive: true,
    position: scenario.heroPosition,
    stackBB: scenario.stackDepthBB,
    cards: scenario.heroCards,
    markers: markersForPosition(scenario.heroPosition),
  };
  const villainSeats: SeatModel[] = [
    {
      id: "villain",
      name: `Villain (${POSITION_LABEL[scenario.villainPosition]})`,
      position: scenario.villainPosition,
      stackBB: scenario.stackDepthBB,
      cards: [],
      faceDown: true,
      markers: markersForPosition(scenario.villainPosition),
    },
  ];

  return (
    <TrainerShell mode={TrainingMode.Range} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <h2 className="text-base font-semibold text-white">{scenario.title}</h2>
        <ul className="mt-1 text-xs text-white/60">
          {scenario.preflopAction.map((a, i) => (
            <li key={i}>- {a}</li>
          ))}
        </ul>
      </div>

      <PokerTable
        heroSeat={heroSeat}
        villainSeats={villainSeats}
        board={board}
        showPlaceholders={board.length > 0}
      />

      <div className="card-surface p-4">
        <p className="text-sm font-semibold text-white">
          {scenario.question.prompt}
        </p>
        <p className="mt-1 text-xs text-white/50">Select all that apply.</p>
      </div>

      <ChoiceButtons
        choices={choices}
        selected={selected}
        onToggle={toggle}
        multiple
        columns={4}
        disabled={submitted}
        revealed={submitted}
        correctIds={correctAnswers}
      />

      {!submitted ? (
        <button className="btn-primary" onClick={submit}>
          Check answer
        </button>
      ) : (
        <>
          <Feedback
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Partial}
            title={isCorrect ? "Correct read!" : "Compare your read"}
          >
            <p>{scenario.question.explanation}</p>
            <p className="text-white/60">
              Answer: {correctAnswers.join(", ")}
            </p>
          </Feedback>
          <button className="btn-primary" onClick={next}>
            Next scenario
          </button>
        </>
      )}
    </TrainerShell>
  );
}
