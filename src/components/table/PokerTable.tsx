import { Card } from "@/lib/poker";
import { SeatModel } from "./tableTypes";
import { Seat } from "./Seat";
import { Board } from "./Board";
import { Pot } from "./Chips";

interface PokerTableProps {
  heroSeat: SeatModel;
  villainSeats?: SeatModel[];
  board?: Card[];
  potBB?: number;
  showPlaceholders?: boolean;
}

export function PokerTable({
  heroSeat,
  villainSeats = [],
  board = [],
  potBB = 0,
  showPlaceholders = true,
}: PokerTableProps) {
  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="relative rounded-[45%/60%] bg-felt bg-gradient-to-b from-felt-light to-felt-dark p-6 shadow-table ring-8 ring-table-rail sm:p-10">
        <div className="rounded-[45%/60%] ring-2 ring-white/10">
          <div className="flex min-h-[22rem] flex-col items-center justify-between gap-6 py-6">
            {/* Villains along the top */}
            <div className="flex w-full items-start justify-center gap-8">
              {villainSeats.map((seat) => (
                <Seat key={seat.id} seat={seat} />
              ))}
            </div>

            {/* Community board + pot */}
            <div className="flex flex-col items-center gap-3">
              {potBB > 0 && <Pot potBB={potBB} />}
              <Board cards={board} showPlaceholders={showPlaceholders} />
            </div>

            {/* Hero at the bottom */}
            <Seat seat={heroSeat} />
          </div>
        </div>
      </div>
    </div>
  );
}
