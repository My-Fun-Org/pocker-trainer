import { useCallback, useEffect, useMemo, useState } from "react";
import { PLAYER_TYPE_PROFILES, PLAYER_TYPES, PlayerType } from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { Choice, ChoiceButtons, CoachPanel, FeedbackStatus, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 3; // Villain range
const OBSERVED_HANDS = 20;

interface Observation {
  line: string;
  vpip: boolean;
  pfr: boolean;
}

interface Session {
  type: PlayerType;
  observations: Observation[];
  vpipPct: number;
  pfrPct: number;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateSession(): Session {
  const type = pick(PLAYER_TYPES);
  const p = PLAYER_TYPE_PROFILES[type];
  const observations: Observation[] = [];
  let vpipCount = 0;
  let pfrCount = 0;
  for (let i = 0; i < OBSERVED_HANDS; i++) {
    const vpip = Math.random() * 100 < p.vpip;
    const pfr = vpip && Math.random() * 100 < p.pfr;
    if (vpip) vpipCount++;
    if (pfr) pfrCount++;
    let line: string;
    if (!vpip) line = "folded preflop";
    else if (pfr) {
      const aggressive = p.af >= 4;
      line = aggressive
        ? pick(["raised preflop, barreled all three streets", "3-bet preflop, bet flop and turn"])
        : pick(["raised preflop, c-bet flop, checked turn", "open-raised, bet flop, gave up turn"]);
    } else {
      line = p.af <= 1
        ? pick(["limped, called two streets", "called preflop, called flop and turn, never raised"])
        : pick(["called preflop, called flop", "limp-called, check-called flop"]);
    }
    observations.push({ line: `Hand ${i + 1}: ${line}`, vpip, pfr });
  }
  return {
    type,
    observations,
    vpipPct: Math.round((vpipCount / OBSERVED_HANDS) * 100),
    pfrPct: Math.round((pfrCount / OBSERVED_HANDS) * 100),
  };
}

export function VillainProfilingTrainer() {
  const [session, setSession] = useState<Session | null>(null);
  const [typeGuess, setTypeGuess] = useState<PlayerType | null>(null);
  const [adjGuess, setAdjGuess] = useState<string | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  const next = useCallback(() => {
    setTypeGuess(null);
    setAdjGuess(null);
    setSession(generateSession());
  }, []);

  useEffect(() => next(), [next]);

  const profile = session ? PLAYER_TYPE_PROFILES[session.type] : null;

  const adjustmentChoices: Choice<string>[] = useMemo(() => {
    if (!profile) return [];
    const wrong = shuffle(PLAYER_TYPES.filter((t) => t !== profile.type))
      .slice(0, 2)
      .map((t) => PLAYER_TYPE_PROFILES[t].adjustment);
    return shuffle([profile.adjustment, ...wrong]).map((a) => ({ id: a, label: a }));
  }, [profile]);

  if (!session || !profile) return null;

  const revealed = typeGuess !== null;
  const typeCorrect = typeGuess === profile.type;
  const typeChoices: Choice<PlayerType>[] = PLAYER_TYPES.map((t) => ({
    id: t,
    label: PLAYER_TYPE_PROFILES[t].label,
  }));

  const guessAdj = (a: string) => {
    if (adjGuess) return;
    setAdjGuess(a);
    const both = typeCorrect && a === profile.adjustment;
    recordResult({
      mode: TrainingMode.VillainProfiling,
      correct: both,
      mistake: both
        ? undefined
        : { prompt: `VPIP ${session.vpipPct}/PFR ${session.pfrPct}`, chosen: typeGuess ? PLAYER_TYPE_PROFILES[typeGuess].label : "?", correct: profile.label },
    });
  };

  return (
    <TrainerShell mode={TrainingMode.VillainProfiling} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/80">You have observed 20 hands from this opponent.</p>
          <span className="font-mono text-xs text-chip-gold">
            VPIP {session.vpipPct}% · PFR {session.pfrPct}%
          </span>
        </div>
      </div>

      <div className="card-surface max-h-56 overflow-y-auto p-3 text-xs text-white/70">
        {session.observations.map((o, i) => (
          <p key={i} className={o.vpip ? "text-white/80" : "text-white/40"}>
            {o.line}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white/70">Classify this opponent</h3>
        <ChoiceButtons
          choices={typeChoices}
          selected={typeGuess ? [typeGuess] : []}
          onToggle={(t) => !typeGuess && setTypeGuess(t)}
          columns={4}
          disabled={revealed}
          revealed={revealed}
          correctIds={[profile.type]}
        />
      </div>

      {revealed && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white/70">
            A hand comes up against them - what is the adjustment?
          </h3>
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
            status={typeCorrect && adjGuess === profile.adjustment ? FeedbackStatus.Correct : FeedbackStatus.Partial}
            output={coach({
              mode: TrainingMode.VillainProfiling,
              correctDecision: typeCorrect,
              headline: `Across 20 hands this is a ${profile.label}.`,
              reasons: [
                `VPIP ${session.vpipPct}%, PFR ${session.pfrPct}% - ${profile.tell}`,
                `Adjustment: ${profile.adjustment}`,
              ],
            })}
          />
          <button className="btn-primary" onClick={next}>
            New opponent
          </button>
        </>
      )}
    </TrainerShell>
  );
}
