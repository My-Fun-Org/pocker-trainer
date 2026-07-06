import { motion } from "framer-motion";
import { Card, SUIT_IS_RED, SUIT_SYMBOL } from "@/lib/poker";
import { CardFace } from "./tableTypes";

const SIZE = {
  sm: "h-16 w-11 text-sm",
  md: "h-20 w-14 text-xl",
  lg: "h-28 w-20 text-3xl",
} as const;

export type CardSize = keyof typeof SIZE;

interface PlayingCardProps {
  card?: Card;
  face?: CardFace;
  size?: CardSize;
  /** Stagger index for the deal animation. */
  index?: number;
}

const DEAL_STAGGER_SECONDS = 0.08;

export function PlayingCard({
  card,
  face = CardFace.Up,
  size = "md",
  index = 0,
}: PlayingCardProps) {
  const isFaceUp = face === CardFace.Up && card !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: -24, rotateY: 90 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{
        delay: index * DEAL_STAGGER_SECONDS,
        type: "spring",
        stiffness: 260,
        damping: 22,
      }}
      className={`relative flex select-none items-center justify-center overflow-hidden rounded-lg font-semibold shadow-card ${SIZE[size]}`}
    >
      {isFaceUp ? (
        <FaceUp card={card!} />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-lg border border-white/20 bg-gradient-to-br from-indigo-800 to-indigo-950">
          <div className="h-3/4 w-3/4 rounded-md border border-white/10 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_4px,transparent_4px,transparent_8px)]" />
        </div>
      )}
    </motion.div>
  );
}

function FaceUp({ card }: { card: Card }) {
  const red = SUIT_IS_RED[card.suit];
  const color = red ? "text-chip-red" : "text-neutral-900";
  return (
    <div className="relative flex h-full w-full items-center justify-center rounded-lg border border-black/10 bg-white leading-none">
      <span className={`${color} absolute left-1 top-1 text-[0.72em] font-bold`}>
        {card.rank}
      </span>
      <span className={`${color} text-[1.5em]`}>{SUIT_SYMBOL[card.suit]}</span>
      <span
        className={`${color} absolute bottom-1 right-1 rotate-180 text-[0.72em] font-bold`}
      >
        {card.rank}
      </span>
    </div>
  );
}
