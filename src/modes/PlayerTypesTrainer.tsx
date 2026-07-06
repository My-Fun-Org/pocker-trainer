import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PLAYER_TYPE_PROFILES,
  PLAYER_TYPES,
  PlayerType,
} from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { Choice, ChoiceButtons, CoachPanel, FeedbackStatus, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 3; // Villain range

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function PlayerTypesTrainer() {
  const [type, setType] = useState<PlayerType | null>(null);
  const [typeGuess, setTypeGuess] = useState<PlayerType | null>(null);
  const [adjGuess, setAdjGuess] = useState<string | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  const next = useCallback(() => {
    setTypeGuess(null);
    setAdjGuess(null);
    setType(pick(PLAYER_TYPES));
  }, []);

  useEffect(() => next(), [next]);

  const profile = type ? PLAYER_TYPE_PROFILES[type] : null;

  const adjustmentChoices: Choice<string>[] = useMemo(() => {
    if (!profile) return [];
    const wrong = shuffle(PLAYER_TYPES.filter((t) => t !== profile.type))
      .slice(0, 2)
      .map((t) => PLAYER_TYPE_PROFILES[t].adjustment);
    return shuffle([profile.adjustment, ...wrong]).map((a) => ({ id: a, label: a }));
  }, [profile]);

  if (!type || !profile) return null;

  const typeChoices: Choice<PlayerType>[] = PLAYER_TYPES.map((t) => ({
    id: t,
    label: PLAYER_TYPE_PROFILES[t].label,
  }));

  const typeCorrect = typeGuess === profile.type;
  const revealed = typeGuess !== null;
  const adjCorrect = adjGuess === profile.adjustment;

  const guessType = (t: PlayerType) => {
    if (typeGuess) return;
    setTypeGuess(t);
  };

  const guessAdj = (a: string) => {
    if (adjGuess) return;
    setAdjGuess(a);
    const bothCorrect = typeCorrect && a === profile.adjustment;
    recordResult({
      mode: TrainingMode.PlayerTypes,
      correct: bothCorrect,
      mistake: bothCorrect
        ? undefined
        : {
            prompt: profile.tell,
            chosen: `${typeGuess ? PLAYER_TYPE_PROFILES[typeGuess].label : "?"}`,
            correct: profile.label,
          },
    });
  };

  return (
    <TrainerShell mode={TrainingMode.PlayerTypes} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-xs uppercase tracking-wide text-white/50">Observed behavior</p>
        <p className="mt-1 text-sm text-white/85">{profile.tell}</p>
        <p className="mt-2 font-mono text-xs text-white/60">
          VPIP {profile.vpip}% · PFR {profile.pfr}% · AF {profile.af}
          {profile.stackBB ? ` · Stack ${profile.stackBB} BB` : ""}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white/70">Classify this opponent</h3>
        <ChoiceButtons
          choices={typeChoices}
          selected={typeGuess ? [typeGuess] : []}
          onToggle={guessType}
          columns={4}
          disabled={revealed}
          revealed={revealed}
          correctIds={[profile.type]}
        />
      </div>

      {revealed && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white/70">Pick the correct adjustment</h3>
          <ChoiceButtons
            choices={adjustmentChoices}
            selected={adjGuess ? [adjGuess] : []}
            onToggle={guessAdj}
            columns={1}
            disabled={adjGuess !== null}
            revealed={adjGuess !== null}
            correctIds={[profile.adjustment]}
          />
        </div>
      )}

      {adjGuess && (
        <>
          <CoachPanel
            status={typeCorrect && adjCorrect ? FeedbackStatus.Correct : FeedbackStatus.Partial}
            output={coach({
              mode: TrainingMode.PlayerTypes,
              correctDecision: typeCorrect && adjCorrect,
              headline: `This is a ${profile.label}.`,
              reasons: [profile.tell, `Adjustment: ${profile.adjustment}`],
            })}
          />
          <button className="btn-primary" onClick={next}>
            Next opponent
          </button>
        </>
      )}
    </TrainerShell>
  );
}
