import { motion } from "framer-motion";
import { FeedbackStatus } from "./uiTypes";

interface FeedbackProps {
  status: FeedbackStatus;
  title: string;
  children?: React.ReactNode;
}

const STATUS_STYLE: Record<FeedbackStatus, { ring: string; text: string; badge: string }> =
  {
    [FeedbackStatus.Correct]: {
      ring: "ring-emerald-400/50",
      text: "text-emerald-300",
      badge: "bg-emerald-400/20",
    },
    [FeedbackStatus.Incorrect]: {
      ring: "ring-red-400/50",
      text: "text-red-300",
      badge: "bg-red-400/20",
    },
    [FeedbackStatus.Partial]: {
      ring: "ring-amber-400/50",
      text: "text-amber-300",
      badge: "bg-amber-400/20",
    },
    [FeedbackStatus.Info]: {
      ring: "ring-sky-400/40",
      text: "text-sky-300",
      badge: "bg-sky-400/20",
    },
  };

export function Feedback({ status, title, children }: FeedbackProps) {
  const style = STATUS_STYLE[status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-surface p-4 ring-1 ${style.ring}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${style.badge} ${style.text}`}
        >
          {status}
        </span>
        <h3 className={`text-base font-semibold ${style.text}`}>{title}</h3>
      </div>
      {children && (
        <div className="mt-2 space-y-1.5 text-sm text-white/80">{children}</div>
      )}
    </motion.div>
  );
}
