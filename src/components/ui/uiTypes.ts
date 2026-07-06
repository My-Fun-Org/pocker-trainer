/** Outcome state of a submitted answer. */
export const FeedbackStatus = {
  Correct: "correct",
  Incorrect: "incorrect",
  Partial: "partial",
  Info: "info",
} as const;

export type FeedbackStatus = (typeof FeedbackStatus)[keyof typeof FeedbackStatus];

/** A selectable choice rendered by ChoiceButtons. */
export interface Choice<T extends string> {
  id: T;
  label: string;
  sublabel?: string;
}
