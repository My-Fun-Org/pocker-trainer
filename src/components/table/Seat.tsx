import { POSITION_LABEL } from "@/lib/poker";
import { CardFace, SEAT_MARKER_LABEL, SeatModel } from "./tableTypes";
import { PlayingCard } from "./PlayingCard";
import { ChipStack } from "./Chips";

interface SeatProps {
  seat: SeatModel;
}

export function Seat({ seat }: SeatProps) {
  const {
    name,
    position,
    stackBB,
    cards,
    faceDown,
    isHero,
    isActive,
    markers = [],
    betBB = 0,
  } = seat;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {cards && cards.length > 0 && (
        <div className="flex gap-1">
          {cards.map((card, i) => (
            <PlayingCard
              key={`${card.rank}${card.suit}`}
              card={card}
              face={faceDown ? CardFace.Down : CardFace.Up}
              size={isHero ? "md" : "sm"}
              index={i}
            />
          ))}
        </div>
      )}

      <div
        className={`relative min-w-[7.5rem] rounded-xl px-3 py-1.5 text-center ring-1 transition-colors ${
          isActive
            ? "bg-chip-gold/20 ring-chip-gold"
            : "bg-black/40 ring-white/10"
        }`}
      >
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-sm font-semibold text-white">
            {isHero ? "Hero" : name}
          </span>
          {markers.map((m) => (
            <span
              key={m}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black"
              title={m}
            >
              {SEAT_MARKER_LABEL[m]}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-white/70">
          {position && <span>{POSITION_LABEL[position]}</span>}
          {stackBB !== undefined && <span>{stackBB} BB</span>}
        </div>
      </div>

      {betBB > 0 && <ChipStack amountBB={betBB} />}
    </div>
  );
}
