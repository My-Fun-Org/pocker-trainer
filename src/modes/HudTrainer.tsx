import { useCallback, useEffect, useState } from "react";
import { classifyByStats, PLAYER_TYPE_PROFILES, PLAYER_TYPES, PlayerType } from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { Choice, ChoiceButtons, CoachPanel, FeedbackStatus, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 3;

interface StatDef {
  stat: string;
  name: string;
  definition: string;
}

const STAT_DEFS: StatDef[] = [
  { stat: "VPIP", name: "Voluntarily Put $ In Pot", definition: "How often a player voluntarily puts money in preflop (calls or raises)." },
  { stat: "PFR", name: "Preflop Raise", definition: "How often a player raises preflop." },
  { stat: "3Bet", name: "Three-Bet", definition: "How often a player re-raises a preflop open." },
  { stat: "WTSD", name: "Went To Showdown", definition: "How often a player reaches showdown after seeing the flop." },
  { stat: "W$SD", name: "Won $ at Showdown", definition: "How often a player wins once they reach showdown." },
  { stat: "Fold to Cbet", name: "Fold to Continuation Bet", definition: "How often a player folds to a flop continuation bet." },
  { stat: "Steal", name: "Steal Attempt", definition: "How often a player raises first-in from the CO, BTN or SB to steal blinds." },
  { stat: "AF", name: "Aggression Factor", definition: "Ratio of bets and raises to calls postflop." },
  { stat: "RFI", name: "Raise First In", definition: "How often a player open-raises when folded to." },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type Kind = "define" | "interpret";

interface Drill {
  kind: Kind;
  prompt: string;
  choices: Choice<string>[];
  correct: string;
  explanation: string;
}

function makeDefine(): Drill {
  const def = pick(STAT_DEFS);
  const wrong = shuffle(STAT_DEFS.filter((d) => d.stat !== def.stat)).slice(0, 3);
  const choices = shuffle([def, ...wrong]).map((d) => ({ id: d.definition, label: d.definition }));
  return {
    kind: "define",
    prompt: `What does ${def.stat} (${def.name}) measure?`,
    choices,
    correct: def.definition,
    explanation: `${def.stat} = ${def.definition}`,
  };
}

function makeInterpret(): Drill {
  const type = pick(PLAYER_TYPES);
  const p = PLAYER_TYPE_PROFILES[type];
  const derived = classifyByStats(p.vpip, p.pfr, p.af);
  const choices = PLAYER_TYPES.map((t) => ({ id: t, label: PLAYER_TYPE_PROFILES[t].label }));
  return {
    kind: "interpret",
    prompt: `A villain shows VPIP ${p.vpip}% / PFR ${p.pfr}% / AF ${p.af}. What player type is this?`,
    choices,
    correct: derived,
    explanation: `${p.vpip}/${p.pfr}/${p.af} maps to a ${PLAYER_TYPE_PROFILES[derived].label}. ${p.adjustment}`,
  };
}

export function HudTrainer() {
  const [drill, setDrill] = useState<Drill | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  const next = useCallback(() => {
    setChoice(null);
    setDrill(Math.random() < 0.5 ? makeDefine() : makeInterpret());
  }, []);

  useEffect(() => next(), [next]);

  if (!drill) return null;

  const isCorrect = choice === drill.correct;
  const answer = (id: string) => {
    if (choice) return;
    setChoice(id);
    const correct = id === drill.correct;
    recordResult({
      mode: TrainingMode.Hud,
      correct,
      audit: {
        prompt: drill.prompt,
        chosen: drill.kind === "interpret" ? PLAYER_TYPE_PROFILES[id as PlayerType].label : id,
        correct: drill.kind === "interpret" ? PLAYER_TYPE_PROFILES[drill.correct as PlayerType].label : drill.correct,
        detail: [`Drill type: ${drill.kind}`, drill.explanation],
      },
    });
  };

  const labelFor = (id: string) =>
    drill.kind === "interpret" ? PLAYER_TYPE_PROFILES[id as PlayerType].label : id;

  return (
    <TrainerShell mode={TrainingMode.Hud} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">{drill.prompt}</p>
      </div>

      <ChoiceButtons
        choices={drill.choices}
        selected={choice ? [choice] : []}
        onToggle={answer}
        columns={drill.kind === "interpret" ? 4 : 1}
        disabled={choice !== null}
        revealed={choice !== null}
        correctIds={[drill.correct]}
      />

      {choice && (
        <>
          <button className="btn-primary w-full" onClick={next}>
            Next drill
          </button>
          <CoachPanel
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            output={coach({
              mode: TrainingMode.Hud,
              correctDecision: isCorrect,
              headline: isCorrect ? "Correct!" : `It's ${labelFor(drill.correct)}`,
              reasons: [drill.explanation],
            })}
          />
        </>
      )}
    </TrainerShell>
  );
}
