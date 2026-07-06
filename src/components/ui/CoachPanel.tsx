import { useState } from "react";
import { motion } from "framer-motion";
import { CoachOutput } from "@/lib/coach";
import { FeedbackStatus } from "./uiTypes";

interface CoachPanelProps {
  status: FeedbackStatus;
  output: CoachOutput;
}

const STATUS_RING: Record<FeedbackStatus, string> = {
  [FeedbackStatus.Correct]: "ring-emerald-400/50",
  [FeedbackStatus.Incorrect]: "ring-red-400/50",
  [FeedbackStatus.Partial]: "ring-amber-400/50",
  [FeedbackStatus.Info]: "ring-sky-400/40",
};

/**
 * The AI Coach voice (PRD module 27): headline + specific reasons, an optional
 * read-vs-reality contrast, and an expandable "show the math".
 */
export function CoachPanel({ status, output }: CoachPanelProps) {
  const [showMath, setShowMath] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-surface p-4 ring-1 ${STATUS_RING[status]}`}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-chip-gold text-xs font-bold text-black">
          AI
        </span>
        <h3 className="text-base font-semibold text-white">{output.headline}</h3>
      </div>

      <div className="mt-2 space-y-1.5 text-sm text-white/80">
        {output.reasons.map((reason, i) => (
          <p key={i}>{reason}</p>
        ))}
      </div>

      {output.contrast && (
        <div className="mt-3 rounded-lg bg-amber-400/10 p-3 text-sm text-amber-200 ring-1 ring-amber-400/30">
          <span className="font-semibold">Your read vs reality: </span>
          {output.contrast}
        </div>
      )}

      {output.math && output.math.length > 0 && (
        <div className="mt-3">
          <button
            className="text-xs font-semibold uppercase tracking-wide text-chip-gold hover:underline"
            onClick={() => setShowMath((v) => !v)}
          >
            {showMath ? "Hide the math" : "Show the math"}
          </button>
          {showMath && (
            <div className="mt-2 space-y-1 rounded-lg bg-white/5 p-3 font-mono text-xs text-white/70">
              {output.math.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
