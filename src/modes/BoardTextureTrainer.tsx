import { useCallback, useEffect, useState } from "react";
import { Texture, TEXTURE_LABEL, TEXTURE_OPTIONS } from "@/lib/poker";
import { BoardTextureScenario, loadBoardTextureScenarios } from "@/lib/data";
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

const REASONING_STEP = 2; // "Dry or wet board?"

const TEXTURE_CHOICES: Choice<Texture>[] = TEXTURE_OPTIONS.map((id) => ({
  id,
  label: TEXTURE_LABEL[id],
}));

function pickDifferent(
  scenarios: BoardTextureScenario[],
  current?: BoardTextureScenario,
): BoardTextureScenario {
  if (scenarios.length === 1) return scenarios[0];
  let next = current;
  while (!next || next.id === current?.id) {
    next = scenarios[Math.floor(Math.random() * scenarios.length)];
  }
  return next;
}

export function BoardTextureTrainer() {
  const [scenarios, setScenarios] = useState<BoardTextureScenario[]>([]);
  const [scenario, setScenario] = useState<BoardTextureScenario | null>(null);
  const [choice, setChoice] = useState<Texture | null>(null);
  const recordResult = useProgressStore((s) => s.recordResult);

  useEffect(() => {
    loadBoardTextureScenarios().then((list) => {
      setScenarios(list);
      setScenario(pickDifferent(list));
    });
  }, []);

  const next = useCallback(() => {
    setChoice(null);
    setScenario((current) => pickDifferent(scenarios, current ?? undefined));
  }, [scenarios]);

  if (!scenario) {
    return (
      <TrainerShell
        mode={TrainingMode.BoardTexture}
        highlightStep={REASONING_STEP}
      >
        <p className="text-white/60">Loading boards...</p>
      </TrainerShell>
    );
  }

  const answer = (texture: Texture) => {
    if (choice) return;
    setChoice(texture);
    const isCorrect = texture === scenario.texture;
    recordResult({
      mode: TrainingMode.BoardTexture,
      correct: isCorrect,
      audit: {
        prompt: `How wet is the flop ${scenario.flop.map((c) => `${c.rank}${c.suit}`).join(" ")}?`,
        chosen: TEXTURE_LABEL[texture],
        correct: TEXTURE_LABEL[scenario.texture],
        detail: [scenario.explanation],
      },
    });
  };

  const heroSeat: SeatModel = {
    id: "board-viewer",
    name: "Board",
    isActive: false,
  };
  const isCorrect = choice === scenario.texture;

  return (
    <TrainerShell mode={TrainingMode.BoardTexture} highlightStep={REASONING_STEP}>
      <div className="card-surface p-4">
        <p className="text-sm text-white/80">
          Read the flop's flush and straight coordination. How wet is this board?
        </p>
      </div>

      <PokerTable heroSeat={heroSeat} board={scenario.flop} />

      <ChoiceButtons
        choices={TEXTURE_CHOICES}
        selected={choice ? [choice] : []}
        onToggle={answer}
        columns={3}
        disabled={choice !== null}
        revealed={choice !== null}
        correctIds={[scenario.texture]}
      />

      {choice && (
        <>
          <button className="btn-primary w-full" onClick={next}>
            Next board
          </button>
          <Feedback
            status={isCorrect ? FeedbackStatus.Correct : FeedbackStatus.Incorrect}
            title={
              isCorrect
                ? "Correct!"
                : `This board is ${TEXTURE_LABEL[scenario.texture]}`
            }
          >
            <p>{scenario.explanation}</p>
          </Feedback>
        </>
      )}
    </TrainerShell>
  );
}
