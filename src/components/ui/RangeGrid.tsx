import { cellNotation, GRID_RANKS } from "@/lib/poker";

interface RangeGridProps {
  /** Currently selected hand notations. */
  selected: Set<string>;
  onToggle?: (hand: string) => void;
  /** Read-only display (no clicks). */
  readOnly?: boolean;
  /** When revealed, highlight the target range for comparison. */
  revealed?: boolean;
  target?: Set<string>;
  compact?: boolean;
}

function cellClass(
  hand: string,
  isPair: boolean,
  selected: boolean,
  revealed: boolean,
  inTarget: boolean,
): string {
  const shape = isPair
    ? "bg-white/[0.08]"
    : hand.endsWith("s")
      ? "bg-white/[0.05]"
      : "bg-white/[0.02]";
  if (revealed) {
    if (selected && inTarget) return "bg-emerald-500/70 text-white ring-emerald-300";
    if (selected && !inTarget) return "bg-red-500/60 text-white ring-red-300";
    if (!selected && inTarget) return "bg-amber-500/50 text-white ring-amber-300";
    return `${shape} text-white/40`;
  }
  if (selected) return "bg-chip-gold text-black ring-chip-gold";
  return `${shape} text-white/70 hover:bg-white/20`;
}

/** Interactive 13x13 starting-hand grid used by range-based modules. */
export function RangeGrid({
  selected,
  onToggle,
  readOnly = false,
  revealed = false,
  target,
  compact = false,
}: RangeGridProps) {
  const size = compact ? "text-[8px]" : "text-[10px] sm:text-xs";
  return (
    <div className="inline-grid grid-cols-13 gap-px rounded-lg bg-black/30 p-1.5">
      {GRID_RANKS.map((row) =>
        GRID_RANKS.map((col) => {
          const hand = cellNotation(row, col);
          const pair = row === col;
          const isSelected = selected.has(hand);
          const inTarget = target?.has(hand) ?? false;
          return (
            <button
              key={`${row}${col}`}
              type="button"
              disabled={readOnly}
              onClick={() => onToggle?.(hand)}
              className={`flex aspect-square items-center justify-center rounded-[3px] ring-1 ring-white/5 font-semibold ${size} transition-colors disabled:cursor-default ${cellClass(
                hand,
                pair,
                isSelected,
                revealed,
                inTarget,
              )}`}
            >
              {hand}
            </button>
          );
        }),
      )}
    </div>
  );
}
