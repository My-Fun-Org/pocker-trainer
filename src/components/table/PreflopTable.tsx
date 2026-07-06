import { Card, POSITION_LABEL, Position, PREFLOP_ORDER } from "@/lib/poker";
import { CardFace, markersForPosition, SEAT_MARKER_LABEL } from "./tableTypes";
import { PlayingCard } from "./PlayingCard";

type SeatState = "hero" | "toAct" | "folded" | "raiser";

interface PreflopTableProps {
  heroPosition: Position;
  heroCards: Card[];
  /** True when a player has already opened and it is folded to hero. */
  facingRaise: boolean;
  /** The earlier seat that opened, when facingRaise. */
  openerPosition?: Position;
  openRaiseBB?: number;
  potBB?: number;
}

/**
 * Six anchor points around the oval, index 0 = hero (bottom center). Seats are
 * filled in action order, so the anchors run clockwise: the seat that acts right
 * after hero sits to hero's left (bottom-left), then up the left side, across the
 * top, and down the right side. That keeps the dealer to hero's right and the
 * blinds to hero's left, matching how a real Texas Hold'em table plays.
 */
const ANCHORS: { top: number; left: number }[] = [
  { top: 87, left: 50 },
  { top: 68, left: 13 },
  { top: 27, left: 15 },
  { top: 8, left: 50 },
  { top: 27, left: 85 },
  { top: 68, left: 87 },
];

const STATE_CLASS: Record<SeatState, string> = {
  hero: "bg-chip-gold/20 ring-2 ring-chip-gold",
  raiser: "bg-chip-red/15 ring-2 ring-chip-red/70",
  toAct: "bg-black/45 ring-1 ring-white/25",
  folded: "bg-black/30 ring-1 ring-white/10 opacity-45",
};

const STATE_TAG: Record<SeatState, string> = {
  hero: "You",
  raiser: "Opens 2.5 BB",
  toAct: "To act",
  folded: "Folded",
};

/**
 * A preflop table that shows hero's seat relative to every other player: who
 * has the button, who already folded in front, who opened, and who is still to
 * act behind. Position is only meaningful relative to these other seats.
 */
export function PreflopTable({
  heroPosition,
  heroCards,
  facingRaise,
  openerPosition,
  openRaiseBB = 2.5,
  potBB,
}: PreflopTableProps) {
  const heroIdx = PREFLOP_ORDER.indexOf(heroPosition);
  // Seat order starting at hero, going around the table in action order.
  const rotated = [
    ...PREFLOP_ORDER.slice(heroIdx),
    ...PREFLOP_ORDER.slice(0, heroIdx),
  ];

  const stateFor = (pos: Position): SeatState => {
    if (pos === heroPosition) return "hero";
    if (facingRaise && pos === openerPosition) return "raiser";
    return PREFLOP_ORDER.indexOf(pos) < heroIdx ? "folded" : "toAct";
  };

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="relative rounded-[45%/60%] bg-felt bg-gradient-to-b from-felt-light to-felt-dark p-4 shadow-table ring-8 ring-table-rail sm:p-8">
        <div className="relative h-[22rem] rounded-[45%/60%] ring-2 ring-white/10 sm:h-[24rem]">
          {/* Center: street + pot */}
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
            <span className="text-xs uppercase tracking-widest text-white/40">Preflop</span>
            {potBB !== undefined && (
              <span className="rounded-full bg-black/50 px-3 py-1 text-sm font-bold text-chip-gold ring-1 ring-chip-gold/50">
                Pot {potBB} BB
              </span>
            )}
          </div>

          {rotated.map((pos, i) => {
            const anchor = ANCHORS[i];
            const state = stateFor(pos);
            const markers = markersForPosition(pos);
            const isHero = state === "hero";
            return (
              <div
                key={pos}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                style={{ top: `${anchor.top}%`, left: `${anchor.left}%` }}
              >
                {isHero && heroCards.length > 0 && (
                  <div className="flex gap-1">
                    {heroCards.map((card, ci) => (
                      <PlayingCard
                        key={`${card.rank}${card.suit}`}
                        card={card}
                        face={CardFace.Up}
                        size="sm"
                        index={ci}
                      />
                    ))}
                  </div>
                )}
                <div className={`min-w-[5.5rem] rounded-xl px-2.5 py-1.5 text-center ${STATE_CLASS[state]}`}>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-bold text-white">{pos}</span>
                    {markers.map((m) => (
                      <span
                        key={m}
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-black"
                        title={m}
                      >
                        {SEAT_MARKER_LABEL[m]}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] text-white/60">{POSITION_LABEL[pos]}</div>
                  <div
                    className={`mt-0.5 text-[10px] font-semibold ${
                      state === "raiser"
                        ? "text-chip-red"
                        : state === "toAct"
                          ? "text-white/50"
                          : state === "hero"
                            ? "text-chip-gold"
                            : "text-white/30"
                    }`}
                  >
                    {state === "raiser" ? `Opens ${openRaiseBB} BB` : STATE_TAG[state]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
