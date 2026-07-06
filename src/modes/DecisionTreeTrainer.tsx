import { useCallback, useEffect, useState } from "react";
import { parseCards } from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PokerTable, SeatModel } from "@/components/table";
import { Choice, ChoiceButtons, CoachPanel, FeedbackStatus, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 6; // Action

interface TreeOption {
  action: string;
  nextNodeId?: string;
  correct: boolean;
  explanation: string;
}

interface DecisionNode {
  id: string;
  street: string;
  prompt: string;
  board: string[];
  potBB: number;
  options: TreeOption[];
}

interface DecisionTreeScenario {
  id: string;
  heroCards: string[];
  rootId: string;
  nodes: Record<string, DecisionNode>;
}

const TREE: DecisionTreeScenario = {
  id: "ako-tree",
  heroCards: ["Ah", "Kh"],
  rootId: "flop",
  nodes: {
    flop: {
      id: "flop",
      street: "Flop",
      prompt: "You raised preflop and the BB called. Flop Kc 7d 2s. You have top pair top kicker. Villain checks.",
      board: ["Kc", "7d", "2s"],
      potBB: 6,
      options: [
        { action: "Bet 1/2 pot", nextNodeId: "turn", correct: true, explanation: "Betting for value and protection on a dry board is standard - you get called by worse kings and pairs." },
        { action: "Check back", correct: false, explanation: "Checking wastes a street of value with the best hand on a board that barely hits their range." },
      ],
    },
    turn: {
      id: "turn",
      street: "Turn",
      prompt: "You bet the flop and villain called. Turn is the 5h (Kc 7d 2s 5h). Villain checks again.",
      board: ["Kc", "7d", "2s", "5h"],
      potBB: 12,
      options: [
        { action: "Bet 2/3 pot", nextNodeId: "river", correct: true, explanation: "Keep value betting - worse kings and pairs still call, and you deny equity to gutshots and overcards." },
        { action: "Check back", correct: false, explanation: "Checking lets draws see a free river and misses value from second-best pairs." },
      ],
    },
    river: {
      id: "river",
      street: "River",
      prompt: "You bet turn, villain called. River is the 5h pairs the board? No - river is the 2c (Kc 7d 2s 5h 2c). Villain leads into you for a small bet.",
      board: ["Kc", "7d", "2s", "5h", "2c"],
      potBB: 30,
      options: [
        { action: "Call", correct: true, explanation: "A small donk lead is often a blocking bet or a missed draw turning made hands face-up; your top pair top kicker is an easy bluff-catcher." },
        { action: "Raise", correct: false, explanation: "Raising only folds out worse and gets called by better - there is nothing to gain by raising a bluff-catcher." },
        { action: "Fold", correct: false, explanation: "Folding top pair top kicker to a small bet over-folds against a range full of worse hands and bluffs." },
      ],
    },
  },
};

export function DecisionTreeTrainer() {
  const [nodeId, setNodeId] = useState(TREE.rootId);
  const [choice, setChoice] = useState<string | null>(null);
  const [path, setPath] = useState<{ street: string; action: string; correct: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const recordResult = useProgressStore((s) => s.recordResult);

  const reset = useCallback(() => {
    setNodeId(TREE.rootId);
    setChoice(null);
    setPath([]);
    setDone(false);
  }, []);

  useEffect(() => reset(), [reset]);

  const node = TREE.nodes[nodeId];
  const picked = choice ? node.options.find((o) => o.action === choice) : null;

  const answer = (action: string) => {
    if (choice) return;
    setChoice(action);
    const option = node.options.find((o) => o.action === action)!;
    setPath((p) => [...p, { street: node.street, action, correct: option.correct }]);
  };

  const advance = () => {
    if (!picked) return;
    if (picked.nextNodeId) {
      setNodeId(picked.nextNodeId);
      setChoice(null);
    } else {
      setDone(true);
      const allCorrect = [...path].every((s) => s.correct);
      recordResult({
        mode: TrainingMode.DecisionTree,
        correct: allCorrect,
        mistake: allCorrect
          ? undefined
          : { prompt: TREE.id, chosen: path.map((s) => s.action).join(" > "), correct: "the recommended line" },
      });
    }
  };

  const choices: Choice<string>[] = node.options.map((o) => ({ id: o.action, label: o.action }));
  const correctIds = node.options.filter((o) => o.correct).map((o) => o.action);
  const heroSeat: SeatModel = {
    id: "hero",
    name: "Hero",
    isHero: true,
    isActive: true,
    stackBB: 100,
    cards: parseCards(TREE.heroCards),
  };
  const villainSeats: SeatModel[] = [
    { id: "villain", name: "Villain", stackBB: 100, cards: [], faceDown: true },
  ];

  return (
    <TrainerShell mode={TrainingMode.DecisionTree} highlightStep={REASONING_STEP}>
      {path.length > 0 && (
        <div className="card-surface flex flex-wrap gap-2 p-3 text-xs">
          {path.map((s, i) => (
            <span
              key={i}
              className={`rounded-full px-2 py-0.5 ${s.correct ? "bg-emerald-500/20 text-emerald-200" : "bg-red-500/20 text-red-200"}`}
            >
              {s.street}: {s.action}
            </span>
          ))}
        </div>
      )}

      <div className="card-surface p-4">
        <p className="text-xs uppercase tracking-wide text-chip-gold">{node.street}</p>
        <p className="mt-1 text-sm text-white/80">{node.prompt}</p>
      </div>

      <PokerTable heroSeat={heroSeat} villainSeats={villainSeats} board={parseCards(node.board)} potBB={node.potBB} />

      {!done && (
        <ChoiceButtons
          choices={choices}
          selected={choice ? [choice] : []}
          onToggle={answer}
          columns={choices.length}
          disabled={choice !== null}
          revealed={choice !== null}
          correctIds={correctIds}
        />
      )}

      {picked && !done && (
        <>
          <CoachPanel
            status={picked.correct ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            output={coach({
              mode: TrainingMode.DecisionTree,
              correctDecision: picked.correct,
              headline: picked.correct ? "Good decision." : "That branch costs EV.",
              reasons: [picked.explanation],
            })}
          />
          <button className="btn-primary" onClick={advance}>
            {picked.nextNodeId ? "Continue the hand" : "Finish"}
          </button>
        </>
      )}

      {done && (
        <>
          <CoachPanel
            status={path.every((s) => s.correct) ? FeedbackStatus.Correct : FeedbackStatus.Partial}
            output={coach({
              mode: TrainingMode.DecisionTree,
              correctDecision: path.every((s) => s.correct),
              headline: "Line recap",
              reasons: [
                `Your line: ${path.map((s) => `${s.street} ${s.action}`).join(" -> ")}.`,
                path.every((s) => s.correct)
                  ? "You played the whole hand on the recommended line - value, value, bluff-catch."
                  : "Compare each node's explanation to see where your line diverged from the recommended one.",
              ],
            })}
          />
          <button className="btn-primary" onClick={reset}>
            Play again
          </button>
        </>
      )}
    </TrainerShell>
  );
}
