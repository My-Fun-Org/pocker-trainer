import { motion } from "framer-motion";

interface ChipStackProps {
  amountBB: number;
  label?: string;
}

/** A small chip badge showing an amount committed to the pot. */
export function ChipStack({ amountBB, label }: ChipStackProps) {
  if (amountBB <= 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 ring-1 ring-white/15"
    >
      <span className="h-3 w-3 rounded-full bg-chip-red ring-2 ring-white/70" />
      <span className="text-xs font-semibold text-white">
        {label ? `${label} ` : ""}
        {amountBB} BB
      </span>
    </motion.div>
  );
}

interface PotProps {
  potBB: number;
}

export function Pot({ potBB }: PotProps) {
  return (
    <motion.div
      key={potBB}
      initial={{ scale: 0.9, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-1"
    >
      <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-4 py-1.5 ring-1 ring-chip-gold/50">
        <span className="h-4 w-4 rounded-full bg-chip-gold ring-2 ring-white/70" />
        <span className="text-sm font-bold text-chip-gold">Pot {potBB} BB</span>
      </div>
    </motion.div>
  );
}
