import { useState } from "react";
import { Card, parseCard } from "@/lib/poker";
import { HandReview, ParsedHand, parseHandHistory, reviewHand } from "@/lib/handAnalysis";
import { TrainingMode } from "@/types/training";
import { PokerTable, SeatModel } from "@/components/table";
import { CoachPanel, FeedbackStatus, PageShell } from "@/components/ui";
import { coach } from "@/lib/coach";

const EXAMPLE = `PokerStars Hand #123: Hold'em No Limit ($1/$2)
Dealt to Hero [Ah Kh]
Hero: raises to 6
Villain: calls
*** FLOP *** [Ks 7d 2c]
Hero: bets 4
Villain: calls
*** TURN *** [Ks 7d 2c] [5h]
Hero: bets 8
Villain: calls
*** RIVER *** [Ks 7d 2c 5h] [2s]
Villain: bets 40
Hero: calls`;

function safeCards(input: string): Card[] {
  const tokens = input.trim().split(/[\s,]+/).filter(Boolean);
  const cards: Card[] = [];
  for (const t of tokens) {
    try {
      cards.push(parseCard(t));
    } catch {
      /* ignore invalid tokens */
    }
  }
  return cards;
}

export function HandAnalyzer() {
  const [pasted, setPasted] = useState("");
  const [heroInput, setHeroInput] = useState("");
  const [boardInput, setBoardInput] = useState("");
  const [hand, setHand] = useState<ParsedHand | null>(null);
  const [review, setReview] = useState<HandReview | null>(null);

  const analyzePasted = () => {
    const parsed = parseHandHistory(pasted);
    setHand(parsed);
    setReview(reviewHand(parsed));
  };

  const analyzeManual = () => {
    const hero = safeCards(heroInput).slice(0, 2);
    const board = safeCards(boardInput).slice(0, 5);
    const parsed: ParsedHand = {
      hero,
      flop: board.slice(0, 3),
      turn: board.slice(3, 4),
      river: board.slice(4, 5),
      actions: { all: [] },
    };
    setHand(parsed);
    setReview(reviewHand(parsed));
  };

  const boardCards = hand ? [...hand.flop, ...hand.turn, ...hand.river] : [];
  const heroSeat: SeatModel | null = hand
    ? { id: "hero", name: "Hero", isHero: true, isActive: true, stackBB: 100, cards: hand.hero }
    : null;

  return (
    <PageShell
      title="Hand Analyzer"
      subtitle="Paste a hand history or build one manually to get a street-by-street review."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-chip-gold">
            Paste a hand history
          </h2>
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={8}
            placeholder="Paste PokerStars / GG style text..."
            className="w-full rounded-lg bg-white/10 px-3 py-2 font-mono text-xs text-white ring-1 ring-white/15 focus:outline-none focus:ring-chip-gold"
          />
          <div className="mt-2 flex gap-2">
            <button className="btn-primary" onClick={analyzePasted} disabled={!pasted.trim()}>
              Analyze
            </button>
            <button className="btn-ghost" onClick={() => setPasted(EXAMPLE)}>
              Load example
            </button>
          </div>
        </div>

        <div className="card-surface p-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-chip-gold">
            Manual builder
          </h2>
          <label className="mb-1 block text-xs text-white/60">Hero cards (e.g. Ah Kh)</label>
          <input
            value={heroInput}
            onChange={(e) => setHeroInput(e.target.value)}
            className="mb-3 w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/15 focus:outline-none focus:ring-chip-gold"
          />
          <label className="mb-1 block text-xs text-white/60">Board (e.g. Ks 7d 2c 5h 2s)</label>
          <input
            value={boardInput}
            onChange={(e) => setBoardInput(e.target.value)}
            className="mb-3 w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/15 focus:outline-none focus:ring-chip-gold"
          />
          <button className="btn-primary" onClick={analyzeManual} disabled={!heroInput.trim()}>
            Analyze
          </button>
        </div>
      </div>

      {hand && heroSeat && review && (
        <>
          <PokerTable heroSeat={heroSeat} board={boardCards} showPlaceholders={boardCards.length > 0} />

          <div className="space-y-2">
            {review.perStreet.map((s, i) => (
              <div key={i} className="card-surface p-4">
                <p className="text-xs uppercase tracking-wide text-chip-gold">{s.street}</p>
                <p className="mt-1 text-sm text-white/85">{s.assessment}</p>
                {s.mistake && (
                  <p className="mt-1 text-sm text-red-300">
                    <b>Mistake:</b> {s.mistake}. {s.alternative}
                  </p>
                )}
              </div>
            ))}
          </div>

          <CoachPanel
            status={FeedbackStatus.Info}
            output={coach({
              mode: TrainingMode.HandAnalyzer,
              correctDecision: true,
              headline: "Hand summary",
              reasons: [review.summary],
            })}
          />
        </>
      )}
    </PageShell>
  );
}
