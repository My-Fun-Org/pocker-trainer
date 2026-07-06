import { useState } from "react";
import { parseCards } from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { PokerTable, SeatModel } from "@/components/table";
import { CoachPanel, FeedbackStatus, PageShell } from "@/components/ui";
import { coach } from "@/lib/coach";

interface Frame {
  street: string;
  board: string[];
  potBB: number;
  heroAction: string;
  note: string;
}

interface Branch {
  atFrame: number;
  action: string;
  continuation: string;
  evDelta: string;
}

const HERO = ["Ah", "Kh"];

const FRAMES: Frame[] = [
  { street: "Preflop", board: [], potBB: 6, heroAction: "Raise to 2.5x with AKs", note: "Standard open - AKs is a premium." },
  { street: "Flop", board: ["Ks", "8d", "3c"], potBB: 13, heroAction: "C-bet 1/3 pot", note: "Top pair top kicker on a dry board. You chose a small c-bet." },
  { street: "Turn", board: ["Ks", "8d", "3c", "5h"], potBB: 20, heroAction: "Check back", note: "You checked the turn, keeping the pot small." },
  { street: "River", board: ["Ks", "8d", "3c", "5h", "2s"], potBB: 20, heroAction: "Call a small bet", note: "Villain leads small; you bluff-catch with TPTK." },
];

const BRANCHES: Branch[] = [
  {
    atFrame: 2,
    action: "Bet the turn instead of checking",
    continuation: "Betting 2/3 pot charges gutshots and worse kings, and sets up a river value bet.",
    evDelta: "+0.7 BB",
  },
];

export function ReplaySimulator() {
  const [frame, setFrame] = useState(0);
  const [branch, setBranch] = useState<Branch | null>(null);

  const current = FRAMES[frame];
  const branchHere = BRANCHES.find((b) => b.atFrame === frame);

  const heroSeat: SeatModel = {
    id: "hero",
    name: "Hero",
    isHero: true,
    isActive: true,
    stackBB: 100,
    cards: parseCards(HERO),
  };
  const villainSeats: SeatModel[] = [
    { id: "villain", name: "Villain", stackBB: 100, cards: [], faceDown: true },
  ];

  return (
    <PageShell
      title="Replay Simulator"
      subtitle="Step through the hand, pause on any street, and explore what a different action would do."
    >
      <div className="card-surface flex items-center justify-between p-3">
        <button
          className="btn-ghost"
          disabled={frame === 0}
          onClick={() => {
            setBranch(null);
            setFrame((f) => Math.max(0, f - 1));
          }}
        >
          &larr; Prev
        </button>
        <div className="flex gap-1.5">
          {FRAMES.map((f, i) => (
            <span
              key={i}
              className={`rounded-full px-2 py-0.5 text-xs ${
                i === frame ? "bg-chip-gold text-black" : "bg-white/10 text-white/60"
              }`}
            >
              {f.street}
            </span>
          ))}
        </div>
        <button
          className="btn-ghost"
          disabled={frame === FRAMES.length - 1}
          onClick={() => {
            setBranch(null);
            setFrame((f) => Math.min(FRAMES.length - 1, f + 1));
          }}
        >
          Next &rarr;
        </button>
      </div>

      <PokerTable
        heroSeat={heroSeat}
        villainSeats={villainSeats}
        board={parseCards(current.board)}
        potBB={current.potBB}
        showPlaceholders={current.board.length > 0}
      />

      <div className="card-surface p-4">
        <p className="text-xs uppercase tracking-wide text-chip-gold">{current.street}</p>
        <p className="mt-1 text-sm text-white/85">
          <b>Hero:</b> {current.heroAction}
        </p>
        <p className="mt-1 text-sm text-white/60">{current.note}</p>
      </div>

      {branchHere && !branch && (
        <button className="btn-primary" onClick={() => setBranch(branchHere)}>
          What if: {branchHere.action}?
        </button>
      )}

      {branch && (
        <CoachPanel
          status={FeedbackStatus.Info}
          output={coach({
            mode: TrainingMode.Replay,
            correctDecision: true,
            headline: `Alternate line: ${branch.action}`,
            reasons: [branch.continuation, `Estimated EV change vs the actual line: ${branch.evDelta}.`],
          })}
        />
      )}
    </PageShell>
  );
}
