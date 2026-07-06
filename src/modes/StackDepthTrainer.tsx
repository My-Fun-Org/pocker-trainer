import { useCallback, useEffect, useState } from "react";
import { Card, parseCards, Position, POSITION_LABEL, toHandNotation } from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { markersForPosition, PokerTable, SeatModel } from "@/components/table";
import { Choice, ChoiceButtons, CoachPanel, FeedbackStatus, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 2; // Stack depth

interface DepthLine {
  depthBB: number;
  correctAction: string;
  explanation: string;
}

interface StackScenario {
  id: string;
  heroCards: string[];
  position: Position;
  situation: string;
  options: string[];
  depths: DepthLine[];
}

const SCENARIOS: StackScenario[] = [
  {
    id: "22-vs-3bet",
    heroCards: ["2c", "2d"],
    position: Position.CO,
    situation: "You open, the Button 3-bets. Do you continue?",
    options: ["Fold", "Call"],
    depths: [
      { depthBB: 30, correctAction: "Fold", explanation: "At 30 BB there are no set-mining odds - you cannot win enough when you flop a set to justify calling a 3-bet." },
      { depthBB: 100, correctAction: "Call", explanation: "At 100 BB implied odds are borderline but a call is fine in position against a 3-bet." },
      { depthBB: 200, correctAction: "Call", explanation: "At 200 BB the implied odds are excellent - stacking them when you flop a set pays for all the folds." },
    ],
  },
  {
    id: "sc-89s",
    heroCards: ["9s", "8s"],
    position: Position.BTN,
    situation: "It folds to you. Open or fold this suited connector?",
    options: ["Fold", "Raise"],
    depths: [
      { depthBB: 15, correctAction: "Raise", explanation: "Shallow, 98s still opens fine on the button as a steal, though it loses its implied-odds value." },
      { depthBB: 100, correctAction: "Raise", explanation: "A standard button open - great playability and equity realization in position." },
      { depthBB: 250, correctAction: "Raise", explanation: "Deep, suited connectors shine: they make disguised straights and flushes that stack big hands." },
    ],
  },
  {
    id: "ako-facing-shove",
    heroCards: ["Ah", "Ks"],
    position: Position.BB,
    situation: "A short stack shoves and it folds to you. Call or fold AKo?",
    options: ["Fold", "Call"],
    depths: [
      { depthBB: 15, correctAction: "Call", explanation: "Against a 15 BB shove AKo is a clear call - it dominates most of the shoving range and flips with pairs." },
      { depthBB: 40, correctAction: "Fold", explanation: "A 40 BB all-in is far tighter; AKo is now behind a value-heavy range and calling off 40 BB is too loose." },
    ],
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function StackDepthTrainer() {
  const [scenario, setScenario] = useState<StackScenario | null>(null);
  const [line, setLine] = useState<DepthLine | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  const next = useCallback(() => {
    setChoice(null);
    const s = pick(SCENARIOS);
    setScenario(s);
    setLine(pick(s.depths));
  }, []);

  useEffect(() => next(), [next]);

  if (!scenario || !line) return null;

  const heroCards: Card[] = parseCards(scenario.heroCards);
  const hand = toHandNotation(heroCards[0], heroCards[1]);
  const isCorrect = choice === line.correctAction;

  const answer = (id: string) => {
    if (choice) return;
    setChoice(id);
    const correct = id === line.correctAction;
    recordResult({
      mode: TrainingMode.StackDepth,
      correct,
      audit: {
        prompt: `${hand} in ${POSITION_LABEL[scenario.position]} at ${line.depthBB} BB - ${scenario.situation}`,
        chosen: id,
        correct: line.correctAction,
        detail: [
          `Hero: ${scenario.heroCards.join(" ")}`,
          line.explanation,
          `Same hand by depth: ${scenario.depths.map((d) => `${d.depthBB} BB -> ${d.correctAction}`).join(", ")}`,
        ],
      },
    });
  };

  const choices: Choice<string>[] = scenario.options.map((o) => ({ id: o, label: o }));

  const heroSeat: SeatModel = {
    id: "hero",
    name: "Hero",
    isHero: true,
    isActive: true,
    position: scenario.position,
    stackBB: line.depthBB,
    cards: heroCards,
    markers: markersForPosition(scenario.position),
  };

  return (
    <TrainerShell mode={TrainingMode.StackDepth} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">
          <b>{hand}</b> in the {POSITION_LABEL[scenario.position]} at{" "}
          <b>{line.depthBB} BB</b> deep. {scenario.situation}
        </p>
      </div>

      <PokerTable heroSeat={heroSeat} />

      <ChoiceButtons
        choices={choices}
        selected={choice ? [choice] : []}
        onToggle={answer}
        columns={choices.length}
        disabled={choice !== null}
        revealed={choice !== null}
        correctIds={[line.correctAction]}
      />

      {choice && (
        <>
          <CoachPanel
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            output={coach({
              mode: TrainingMode.StackDepth,
              correctDecision: isCorrect,
              headline: `At ${line.depthBB} BB: ${line.correctAction}.`,
              reasons: [
                line.explanation,
                "Same hand, different depths: " +
                  scenario.depths
                    .map((d) => `${d.depthBB} BB -> ${d.correctAction}`)
                    .join(", ") +
                  ".",
              ],
            })}
          />
          <button className="btn-primary" onClick={next}>
            Next hand
          </button>
        </>
      )}
    </TrainerShell>
  );
}
