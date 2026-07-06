import { useCallback, useEffect, useState } from "react";
import { Card, parseCards } from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PokerTable, SeatModel } from "@/components/table";
import { Choice, ChoiceButtons, CoachPanel, FeedbackStatus, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 3; // Worse hands call

interface ValueScenario {
  id: string;
  heroCards: string[];
  board: string[];
  heroDesc: string;
  villainDesc: string;
  /** Candidate hands the player evaluates. */
  options: string[];
  /** Worse hands that actually call - the gate answer key. */
  worseThatCall: string[];
  recommendation: "bet" | "checkBack";
  explanation: string;
}

const MIN_WORSE = 3;

const SCENARIOS: ValueScenario[] = [
  {
    id: "top-pair-good-kicker",
    heroCards: ["Ah", "Qc"],
    board: ["Qs", "9d", "4c", "7h", "2s"],
    heroDesc: "top pair, top kicker (AQ)",
    villainDesc: "a loose caller who peeled the flop",
    options: ["KQ", "QJ", "QT", "99", "44", "AA", "JT", "T8s"],
    worseThatCall: ["KQ", "QJ", "QT", "JT", "T8s"],
    recommendation: "bet",
    explanation:
      "Worse queens (KQ/QJ/QT) and busted draws (JT, T8s) all call a value bet, so betting for thin value is clearly correct.",
  },
  {
    id: "second-pair-thin",
    heroCards: ["Jh", "Th"],
    board: ["Ac", "Jd", "8s", "5c", "2h"],
    heroDesc: "middle pair (JT on an ace-high board)",
    villainDesc: "a tight player who called the flop",
    options: ["A2s", "AK", "AQ", "KJ", "TT", "99", "88"],
    worseThatCall: ["99"],
    recommendation: "checkBack",
    explanation:
      "Almost nothing worse calls: aces beat you and few worse pairs continue on the river. This is a check-back, not a value bet.",
  },
  {
    id: "set-wet-board",
    heroCards: ["7c", "7d"],
    board: ["7h", "8h", "9c", "2d", "Js"],
    heroDesc: "a set of sevens",
    villainDesc: "an aggressive opponent with many draws",
    options: ["T9", "TT", "98", "JT", "Jx", "flush", "T6s"],
    worseThatCall: ["T9", "98", "JT", "Jx", "T6s"],
    recommendation: "bet",
    explanation:
      "Two pair, worse straights blocked, top-pair jacks and missed draws with showdown value all call - bet big for value and protection.",
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const BET = "Bet for value";
const CHECK = "Check back";

export function ValueBettingTrainer() {
  const [scenario, setScenario] = useState<ValueScenario | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState<string | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  const next = useCallback(() => {
    setSelected([]);
    setAction(null);
    setScenario(pick(SCENARIOS));
  }, []);

  useEffect(() => next(), [next]);

  if (!scenario) return null;

  const validWorse = selected.filter((h) => scenario.worseThatCall.includes(h));
  const gateSatisfied = validWorse.length >= MIN_WORSE && selected.every((h) => scenario.worseThatCall.includes(h));

  const heroCards: Card[] = parseCards(scenario.heroCards);
  const boardCards: Card[] = parseCards(scenario.board);

  const toggle = (id: string) => {
    if (action) return;
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const answer = (id: string) => {
    if (action) return;
    setAction(id);
    const correctAction = scenario.recommendation === "bet" ? BET : CHECK;
    const correct = id === correctAction;
    recordResult({
      mode: TrainingMode.ValueBetting,
      correct,
      mistake: correct
        ? undefined
        : { prompt: `Value bet: ${scenario.heroDesc}`, chosen: id, correct: correctAction },
    });
  };

  const correctAction = scenario.recommendation === "bet" ? BET : CHECK;
  const isCorrect = action === correctAction;

  const heroSeat: SeatModel = {
    id: "hero",
    name: "Hero",
    isHero: true,
    isActive: true,
    stackBB: 100,
    cards: heroCards,
  };
  const villainSeats: SeatModel[] = [
    { id: "villain", name: "Villain", stackBB: 100, cards: [], faceDown: true },
  ];

  const options: Choice<string>[] = scenario.options.map((o) => ({ id: o, label: o }));

  return (
    <TrainerShell mode={TrainingMode.ValueBetting} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">
          River. You have <b>{scenario.heroDesc}</b> against <b>{scenario.villainDesc}</b>. Before
          you may bet, name the worse hands that call.
        </p>
      </div>

      <PokerTable heroSeat={heroSeat} villainSeats={villainSeats} board={boardCards} />

      <div className="card-surface p-4">
        <p className="text-sm font-semibold text-white">
          Which of these call a value bet? (select the worse hands)
        </p>
        <p className="mt-1 text-xs text-white/50">
          You must list {MIN_WORSE}+ worse calling hands before the Bet button unlocks.
        </p>
      </div>

      <ChoiceButtons
        choices={options}
        selected={selected}
        onToggle={toggle}
        multiple
        columns={4}
        disabled={action !== null}
        revealed={action !== null}
        correctIds={scenario.worseThatCall}
      />

      {!action ? (
        <div className="grid grid-cols-2 gap-2.5">
          <button
            className="btn-primary disabled:opacity-40"
            disabled={!gateSatisfied}
            onClick={() => answer(BET)}
          >
            {gateSatisfied ? BET : `Bet (list ${MIN_WORSE}+ worse calls)`}
          </button>
          <button className="btn-ghost" onClick={() => answer(CHECK)}>
            {CHECK}
          </button>
        </div>
      ) : (
        <>
          <CoachPanel
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            output={coach({
              mode: TrainingMode.ValueBetting,
              correctDecision: isCorrect,
              headline: scenario.recommendation === "bet" ? "Bet for value." : "Check it back.",
              reasons: [scenario.explanation],
              reads: [
                { label: "worse hands that call", chosen: selected, correct: scenario.worseThatCall },
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
