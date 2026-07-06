import { useCallback, useEffect, useState } from "react";
import {
  DRAW_LABEL,
  DrawType,
  generateOutsScenario,
  OutsScenario,
} from "@/lib/poker";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { PokerTable, SeatModel } from "@/components/table";
import {
  Choice,
  ChoiceButtons,
  Feedback,
  FeedbackStatus,
  TrainerShell,
} from "@/components/ui";

const REASONING_STEP = 1; // "What do I have?"
const HERO_STACK_BB = 100;
const BASE_OUT_OPTIONS = [0, 4, 6, 8, 9, 12, 15];

const DRAW_CHOICES: Choice<DrawType>[] = [
  DrawType.FlushDraw,
  DrawType.Oesd,
  DrawType.Gutshot,
  DrawType.ComboDraw,
  DrawType.Overcards,
  DrawType.MadeHand,
  DrawType.NoDraw,
].map((id) => ({ id, label: DRAW_LABEL[id] }));

function outOptions(correctOuts: number): Choice<string>[] {
  const values = [...new Set([...BASE_OUT_OPTIONS, correctOuts])].sort(
    (a, b) => a - b,
  );
  return values.map((v) => ({ id: String(v), label: `${v} outs` }));
}

export function OutsTrainer() {
  const [scenario, setScenario] = useState<OutsScenario | null>(null);
  const [drawGuess, setDrawGuess] = useState<DrawType | null>(null);
  const [outsGuess, setOutsGuess] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const recordResult = useProgressStore((s) => s.recordResult);

  const deal = useCallback(() => {
    setDrawGuess(null);
    setOutsGuess(null);
    setSubmitted(false);
    setScenario(generateOutsScenario());
  }, []);

  useEffect(() => deal(), [deal]);

  if (!scenario) {
    return (
      <TrainerShell mode={TrainingMode.Outs} highlightStep={REASONING_STEP}>
        <p className="text-white/60">Dealing...</p>
      </TrainerShell>
    );
  }

  const { analysis } = scenario;
  const drawCorrect = drawGuess === analysis.drawType;
  const outsCorrect = outsGuess !== null && Number(outsGuess) === analysis.outs;
  const allCorrect = drawCorrect && outsCorrect;

  const submit = () => {
    if (submitted || drawGuess === null || outsGuess === null) return;
    setSubmitted(true);
    recordResult({
      mode: TrainingMode.Outs,
      correct: drawCorrect && outsCorrect,
      audit: {
        prompt: "Identify the draw and count outs to the river",
        chosen: `${DRAW_LABEL[drawGuess]}, ${outsGuess} outs`,
        correct: `${DRAW_LABEL[analysis.drawType]}, ${analysis.outs} outs`,
        detail: [
          `Hero: ${scenario.hole.map((c) => `${c.rank}${c.suit}`).join(" ")} | Flop: ${scenario.flop.map((c) => `${c.rank}${c.suit}`).join(" ")}`,
          ...analysis.notes,
          `Rule of 2 and 4: ~${analysis.equityToRiver}% equity to improve by the river.`,
        ],
      },
    });
  };

  const heroSeat: SeatModel = {
    id: "hero",
    name: "Hero",
    isHero: true,
    isActive: true,
    stackBB: HERO_STACK_BB,
    cards: scenario.hole,
  };

  const status = allCorrect
    ? FeedbackStatus.Correct
    : drawCorrect || outsCorrect
      ? FeedbackStatus.Partial
      : FeedbackStatus.Incorrect;

  return (
    <TrainerShell mode={TrainingMode.Outs} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">
          Identify your draw on the flop, then count your outs to the river.
        </p>
      </div>

      <PokerTable heroSeat={heroSeat} board={scenario.flop} />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white/70">What draw do you have?</h3>
        <ChoiceButtons
          choices={DRAW_CHOICES}
          selected={drawGuess ? [drawGuess] : []}
          onToggle={setDrawGuess}
          columns={3}
          disabled={submitted}
          revealed={submitted}
          correctIds={[analysis.drawType]}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white/70">How many outs?</h3>
        <ChoiceButtons
          choices={outOptions(analysis.outs)}
          selected={outsGuess ? [outsGuess] : []}
          onToggle={setOutsGuess}
          columns={4}
          disabled={submitted}
          revealed={submitted}
          correctIds={[String(analysis.outs)]}
        />
      </div>

      {!submitted ? (
        <button
          className="btn-primary"
          disabled={drawGuess === null || outsGuess === null}
          onClick={submit}
        >
          Check answer
        </button>
      ) : (
        <>
          <button className="btn-primary w-full" onClick={deal}>
            Next hand
          </button>
          <Feedback
            status={status}
            title={
              allCorrect
                ? "Nailed it!"
                : `It's a ${DRAW_LABEL[analysis.drawType]} with ${analysis.outs} outs`
            }
          >
            {analysis.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
            <p>
              Rule of 2 and 4: about{" "}
              <b>{analysis.equityToRiver}% equity</b> to improve by the river.
            </p>
          </Feedback>
        </>
      )}
    </TrainerShell>
  );
}
