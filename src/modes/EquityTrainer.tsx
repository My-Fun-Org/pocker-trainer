import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, headsUpEquity, parseCards } from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PlayingCard } from "@/components/table";
import { Choice, ChoiceButtons, CoachPanel, FeedbackStatus, TrainerShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const REASONING_STEP = 5; // Hand strength

interface Matchup {
  label: string;
  hero: string[];
  villain: string[];
  board?: string[];
  note: string;
}

const MATCHUPS: Matchup[] = [
  { label: "AA vs KK", hero: ["As", "Ah"], villain: ["Ks", "Kh"], note: "A dominating overpair - the classic cooler." },
  { label: "AK vs QQ", hero: ["As", "Ks"], villain: ["Qh", "Qd"], note: "A near coin-flip race, not a dominated spot." },
  { label: "AKs vs 22", hero: ["As", "Ks"], villain: ["2h", "2d"], note: "Two overcards vs a small pair is roughly a flip." },
  { label: "AQ vs AK", hero: ["Ah", "Qh"], villain: ["As", "Ks"], note: "Dominated by the better kicker - a trap hand." },
  { label: "JT suited vs AK", hero: ["Js", "Ts"], villain: ["Ah", "Kd"], note: "Suited connectors run surprisingly close to two big cards." },
  {
    label: "Flush draw vs top pair (flop)",
    hero: ["9h", "8h"],
    villain: ["Ac", "Kd"],
    board: ["Ah", "5h", "2c"],
    note: "A bare flush draw is behind but has real equity against top pair.",
  },
  {
    label: "Set vs flush draw (flop)",
    hero: ["7c", "7d"],
    villain: ["Ah", "Kh"],
    board: ["7h", "5h", "2c"],
    note: "A set is a big favorite even against a nut flush draw.",
  },
  {
    label: "Overpair vs OESD (flop)",
    hero: ["Ac", "Ad"],
    villain: ["9h", "8h"],
    board: ["Ts", "7d", "2c"],
    note: "An overpair holds up well against an open-ended draw.",
  },
];

const BUCKETS: Choice<string>[] = [
  { id: "<35", label: "< 35%" },
  { id: "35-45", label: "35-45%" },
  { id: "45-55", label: "45-55%" },
  { id: "55-65", label: "55-65%" },
  { id: "65-80", label: "65-80%" },
  { id: ">80", label: "> 80%" },
];

function bucketOf(equity: number): string {
  if (equity < 35) return "<35";
  if (equity < 45) return "35-45";
  if (equity < 55) return "45-55";
  if (equity < 65) return "55-65";
  if (equity < 80) return "65-80";
  return ">80";
}

export function EquityTrainer() {
  const [matchup, setMatchup] = useState<Matchup | null>(null);
  const [equity, setEquity] = useState<number | null>(null);
  const [guess, setGuess] = useState<string | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  const next = useCallback(() => {
    setGuess(null);
    const m = MATCHUPS[Math.floor(Math.random() * MATCHUPS.length)];
    const hero = parseCards(m.hero);
    const villain = parseCards(m.villain);
    const board = parseCards(m.board ?? []);
    const result = headsUpEquity(hero, villain, board);
    setMatchup(m);
    setEquity(result.equity);
  }, []);

  useEffect(() => next(), [next]);

  const heroCards: Card[] = useMemo(() => parseCards(matchup?.hero ?? []), [matchup]);
  const villainCards: Card[] = useMemo(() => parseCards(matchup?.villain ?? []), [matchup]);
  const boardCards: Card[] = useMemo(() => parseCards(matchup?.board ?? []), [matchup]);

  if (!matchup || equity === null) return null;

  const correctBucket = bucketOf(equity);
  const isCorrect = guess === correctBucket;

  const answer = (id: string) => {
    if (guess) return;
    setGuess(id);
    const correct = id === correctBucket;
    recordResult({
      mode: TrainingMode.Equity,
      correct,
      audit: {
        prompt: `Estimate hero equity: ${matchup.label}`,
        chosen: BUCKETS.find((b) => b.id === id)?.label ?? id,
        correct: `${correctBucket} (actual ~${equity.toFixed(1)}%)`,
        detail: [
          `Hero ${matchup.hero.join(" ")} vs Villain ${matchup.villain.join(" ")}${matchup.board ? ` on ${matchup.board.join(" ")}` : ""}`,
          `Simulated equity ~${equity.toFixed(1)}% (Monte Carlo, 3,000 runouts - may vary slightly per run)`,
          matchup.note,
        ],
      },
    });
  };

  return (
    <TrainerShell mode={TrainingMode.Equity} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">
          Estimate hero's equity in <b>{matchup.label}</b>. How often does hero win by the river?
        </p>
      </div>

      <div className="card-surface flex flex-wrap items-center justify-center gap-8 p-6">
        <Hand title="Hero" cards={heroCards} />
        <span className="text-2xl font-bold text-white/40">vs</span>
        <Hand title="Villain" cards={villainCards} />
        {boardCards.length > 0 && (
          <div className="flex items-center gap-4 border-l border-white/10 pl-8">
            <Hand title="Board" cards={boardCards} />
          </div>
        )}
      </div>

      <ChoiceButtons
        choices={BUCKETS}
        selected={guess ? [guess] : []}
        onToggle={answer}
        columns={3}
        disabled={guess !== null}
        revealed={guess !== null}
        correctIds={[correctBucket]}
      />

      {guess && (
        <>
          <CoachPanel
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            output={coach({
              mode: TrainingMode.Equity,
              correctDecision: isCorrect,
              headline: `Hero wins about ${equity.toFixed(1)}% (${correctBucket}%).`,
              reasons: [matchup.note],
              math: [
                `Simulated over 3,000 runouts.`,
                `Hero equity ${equity.toFixed(1)}% -> bucket ${correctBucket}.`,
              ],
            })}
          />
          <button className="btn-primary" onClick={next}>
            Next matchup
          </button>
        </>
      )}
    </TrainerShell>
  );
}

function Hand({ title, cards }: { title: string; cards: Card[] }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-white/50">{title}</span>
      <div className="flex gap-1.5">
        {cards.map((c, i) => (
          <PlayingCard key={i} card={c} />
        ))}
      </div>
    </div>
  );
}
