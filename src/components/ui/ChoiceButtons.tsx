import { Choice } from "./uiTypes";

interface ChoiceButtonsProps<T extends string> {
  choices: Choice<T>[];
  /** Currently selected ids (single-select uses a one-element array). */
  selected: T[];
  onToggle: (id: T) => void;
  multiple?: boolean;
  disabled?: boolean;
  /** When set, buttons reveal correct/incorrect styling. */
  revealed?: boolean;
  correctIds?: T[];
  columns?: number;
}

const COLUMN_CLASS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

export function ChoiceButtons<T extends string>({
  choices,
  selected,
  onToggle,
  multiple = false,
  disabled = false,
  revealed = false,
  correctIds = [],
  columns = 3,
}: ChoiceButtonsProps<T>) {
  return (
    <div className={`grid gap-2.5 ${COLUMN_CLASS[columns] ?? COLUMN_CLASS[3]}`}>
      {choices.map((choice) => {
        const isSelected = selected.includes(choice.id);
        const isCorrect = correctIds.includes(choice.id);
        const className = buttonClass({
          isSelected,
          isCorrect,
          revealed,
        });
        return (
          <button
            key={choice.id}
            type="button"
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => onToggle(choice.id)}
            className={className}
          >
            <span>{choice.label}</span>
            {choice.sublabel && (
              <span className="text-xs font-normal opacity-70">
                {choice.sublabel}
              </span>
            )}
            {multiple && isSelected && !revealed && (
              <span className="text-xs opacity-70">selected</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function buttonClass({
  isSelected,
  isCorrect,
  revealed,
}: {
  isSelected: boolean;
  isCorrect: boolean;
  revealed: boolean;
}): string {
  const base =
    "btn flex-col gap-0.5 py-3 ring-1 transition-colors disabled:opacity-100";
  if (revealed) {
    if (isCorrect) return `${base} bg-felt-light/90 text-white ring-emerald-300`;
    if (isSelected) return `${base} bg-chip-red/80 text-white ring-red-300`;
    return `${base} bg-white/5 text-white/50 ring-white/10`;
  }
  if (isSelected) return `${base} bg-chip-gold text-black ring-chip-gold`;
  return `${base} bg-white/10 text-white ring-white/15 hover:bg-white/20`;
}
