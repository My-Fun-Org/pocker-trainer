import { Card } from "@/lib/poker";
import { CardFace } from "./tableTypes";
import { PlayingCard } from "./PlayingCard";

const FULL_BOARD = 5;

interface BoardProps {
  cards: Card[];
  /** Reserve five slots and show placeholders for undealt cards. */
  showPlaceholders?: boolean;
}

export function Board({ cards, showPlaceholders = true }: BoardProps) {
  const slots = showPlaceholders
    ? Array.from({ length: FULL_BOARD }, (_, i) => cards[i])
    : cards;

  return (
    <div className="flex items-center justify-center gap-2">
      {slots.map((card, i) =>
        card ? (
          <PlayingCard key={`${card.rank}${card.suit}`} card={card} face={CardFace.Up} index={i} />
        ) : (
          <div
            key={`slot-${i}`}
            className="h-20 w-14 rounded-lg border border-dashed border-white/15 bg-white/5"
          />
        ),
      )}
    </div>
  );
}
