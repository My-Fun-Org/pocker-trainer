import { useCallback, useEffect, useState } from "react";
import { parseCards } from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PokerTable, SeatModel } from "@/components/table";
import { Choice, ChoiceButtons, CoachPanel, FeedbackStatus, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 6;

const Emotion = {
  Tilt: "Tilt",
  Fear: "Fear",
  HopeCall: "Hope call",
  Revenge: "Revenge",
  ScaredMoney: "Scared money",
  Discipline: "Discipline",
} as const;
type Emotion = (typeof Emotion)[keyof typeof Emotion];

interface MentalScenario {
  id: string;
  emotion: Emotion;
  setup: string;
  heroCards: string[];
  board: string[];
  options: string[];
  correctAction: string;
  trap: string;
  explanation: string;
}

const SCENARIOS: MentalScenario[] = [
  {
    id: "cooler-88",
    emotion: Emotion.Discipline,
    setup: "You got it all-in with 88 on 8-5-2 (a set) and lost to a rivered flush last hand. Now you have AA preflop facing a 3-bet.",
    heroCards: ["Ah", "Ad"],
    board: [],
    options: ["4-bet / get it in", "Fold (still stinging from the beat)"],
    correctAction: "4-bet / get it in",
    trap: "Letting the previous cooler make you play scared with the best hand.",
    explanation:
      "Your 88 got it in good and lost - that is variance, not a mistake. AA is the top of your range; get it in every time. Results don't change correct decisions.",
  },
  {
    id: "fear-scary-board",
    emotion: Emotion.Fear,
    setup: "You have the nut flush on the river. The board is not paired. Villain, a calling station, shoves.",
    heroCards: ["Ah", "Kh"],
    board: ["Qh", "9h", "3h", "5c", "2d"],
    options: ["Call", "Fold (afraid of a bigger hand)"],
    correctAction: "Call",
    trap: "A scary shove tempting you to fold the effective nuts.",
    explanation:
      "You hold the nut flush - no better flush exists. Against a station who shoves worse flushes and two pair, folding here is fear, not a read.",
  },
  {
    id: "hope-busted-draw",
    emotion: Emotion.HopeCall,
    setup: "You chased a flush and missed on the river. Villain bets 3/4 pot. You have ace-high, no pair.",
    heroCards: ["Ah", "5h"],
    board: ["Kc", "9s", "4d", "Jc", "2s"],
    options: ["Fold", "Call (hoping ace-high is good)"],
    correctAction: "Fold",
    trap: "Hoping your busted draw is somehow good enough to call.",
    explanation:
      "You have no pair and no equity - hoping does not beat a bet. Fold and save the chips; a missed draw is a fold, not a hero call.",
  },
  {
    id: "revenge-tilt",
    emotion: Emotion.Revenge,
    setup: "A LAG just bluffed you off a hand and is needling in chat. Next hand you look down at Q7o in early position.",
    heroCards: ["Qh", "7s"],
    board: [],
    options: ["Fold", "Raise to punish them"],
    correctAction: "Fold",
    trap: "Playing a trash hand out of position to get revenge.",
    explanation:
      "Q7o UTG is a fold regardless of who is in the pot. Revenge-raising a weak hand out of position is exactly the spew they want to induce.",
  },
  {
    id: "scared-money",
    emotion: Emotion.ScaredMoney,
    setup: "You are up a big amount and want to protect it. You flop top set on a wet board and villain raises your c-bet.",
    heroCards: ["9c", "9d"],
    board: ["9h", "8h", "5c"],
    options: ["Re-raise / commit", "Just call to keep the pot small"],
    correctAction: "Re-raise / commit",
    trap: "Playing to protect a stack instead of maximizing EV with a monster.",
    explanation:
      "Top set on a wet board wants to build the pot and charge draws now. Playing scared to protect winnings leaves value on the table - chips are chips.",
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const EMOTION_STYLE: Record<Emotion, string> = {
  [Emotion.Tilt]: "bg-red-500/20 text-red-200",
  [Emotion.Fear]: "bg-sky-500/20 text-sky-200",
  [Emotion.HopeCall]: "bg-amber-500/20 text-amber-200",
  [Emotion.Revenge]: "bg-red-500/20 text-red-200",
  [Emotion.ScaredMoney]: "bg-emerald-500/20 text-emerald-200",
  [Emotion.Discipline]: "bg-chip-gold/20 text-chip-gold",
};

export function MentalGameTrainer() {
  const [scenario, setScenario] = useState<MentalScenario | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  const next = useCallback(() => {
    setChoice(null);
    setScenario(pick(SCENARIOS));
  }, []);

  useEffect(() => next(), [next]);

  if (!scenario) return null;

  const isCorrect = choice === scenario.correctAction;
  const answer = (id: string) => {
    if (choice) return;
    setChoice(id);
    const correct = id === scenario.correctAction;
    recordResult({
      mode: TrainingMode.MentalGame,
      correct,
      mistake: correct ? undefined : { prompt: scenario.setup, chosen: id, correct: scenario.correctAction },
    });
  };

  const choices: Choice<string>[] = scenario.options.map((o) => ({ id: o, label: o }));
  const heroSeat: SeatModel = {
    id: "hero",
    name: "Hero",
    isHero: true,
    isActive: true,
    stackBB: 100,
    cards: parseCards(scenario.heroCards),
  };

  return (
    <TrainerShell mode={TrainingMode.MentalGame} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold uppercase ${EMOTION_STYLE[scenario.emotion]}`}>
          {scenario.emotion} test
        </span>
        <p className="mt-2 text-sm text-white/80">{scenario.setup}</p>
      </div>

      <PokerTable heroSeat={heroSeat} board={parseCards(scenario.board)} showPlaceholders={scenario.board.length > 0} />

      <ChoiceButtons
        choices={choices}
        selected={choice ? [choice] : []}
        onToggle={answer}
        columns={2}
        disabled={choice !== null}
        revealed={choice !== null}
        correctIds={[scenario.correctAction]}
      />

      {choice && (
        <>
          <CoachPanel
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            output={coach({
              mode: TrainingMode.MentalGame,
              correctDecision: isCorrect,
              headline: isCorrect ? "Disciplined." : "That's the emotional trap.",
              reasons: [`The trap: ${scenario.trap}`, scenario.explanation],
            })}
          />
          <button className="btn-primary" onClick={next}>
            Next scenario
          </button>
        </>
      )}
    </TrainerShell>
  );
}
