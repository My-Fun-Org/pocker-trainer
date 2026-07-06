import { useMemo, useState } from "react";
import { analyzeBoardTexture, Card, parseCard, TEXTURE_LABEL } from "@/lib/poker";
import { PokerTable, SeatModel } from "@/components/table";
import { PageShell } from "@/components/ui";

type SchemaType = "board-texture" | "range";

function safeCards(input: string): Card[] {
  const tokens = input.trim().split(/[\s,]+/).filter(Boolean);
  const cards: Card[] = [];
  for (const t of tokens) {
    try {
      cards.push(parseCard(t));
    } catch {
      /* ignore */
    }
  }
  return cards;
}

export function ScenarioBuilder() {
  const [schema, setSchema] = useState<SchemaType>("board-texture");
  const [id, setId] = useState("scenario-1");
  const [heroInput, setHeroInput] = useState("Ah Kh");
  const [boardInput, setBoardInput] = useState("Ks 7d 2c");
  const [texture, setTexture] = useState("dry");
  const [prompt, setPrompt] = useState("Which hands continue?");
  const [options, setOptions] = useState("AA, KK, AK, QJs");
  const [correct, setCorrect] = useState("AA, KK, AK");
  const [explanation, setExplanation] = useState("");
  const [tags, setTags] = useState("flop, fundamentals");
  const [errors, setErrors] = useState<string[]>([]);

  const heroCards = useMemo(() => safeCards(heroInput), [heroInput]);
  const boardCards = useMemo(() => safeCards(boardInput), [boardInput]);

  const autoSuggest = () => {
    if (boardCards.length >= 3) {
      setTexture(analyzeBoardTexture(boardCards.slice(0, 3)).texture);
    }
  };

  const json = useMemo(() => {
    if (schema === "board-texture") {
      return JSON.stringify(
        { id, flop: boardCards.slice(0, 3).map((c) => `${c.rank}${c.suit}`), texture, explanation },
        null,
        2,
      );
    }
    return JSON.stringify(
      {
        id,
        heroCards: heroCards.map((c) => `${c.rank}${c.suit}`),
        flop: boardCards.map((c) => `${c.rank}${c.suit}`),
        question: {
          prompt,
          options: options.split(",").map((s) => s.trim()).filter(Boolean),
          correctAnswers: correct.split(",").map((s) => s.trim()).filter(Boolean),
          explanation,
        },
        tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      },
      null,
      2,
    );
  }, [schema, id, heroCards, boardCards, texture, prompt, options, correct, explanation, tags]);

  const validate = () => {
    const errs: string[] = [];
    if (!id.trim()) errs.push("id is required.");
    if (schema === "board-texture" && boardCards.length < 3) errs.push("A flop needs 3 valid cards.");
    if (schema === "range") {
      const opts = options.split(",").map((s) => s.trim()).filter(Boolean);
      const corr = correct.split(",").map((s) => s.trim()).filter(Boolean);
      if (opts.length < 2) errs.push("Provide at least 2 options.");
      const missing = corr.filter((c) => !opts.includes(c));
      if (missing.length) errs.push(`Correct answers not in options: ${missing.join(", ")}.`);
    }
    setErrors(errs);
  };

  const heroSeat: SeatModel = {
    id: "hero",
    name: "Hero",
    isHero: true,
    isActive: true,
    stackBB: 100,
    cards: heroCards,
  };

  return (
    <PageShell
      title="Scenario Builder"
      subtitle="Author training scenarios with a live preview and export valid JSON."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Module schema">
            <select
              value={schema}
              onChange={(e) => setSchema(e.target.value as SchemaType)}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/15"
            >
              <option value="board-texture">Board Texture</option>
              <option value="range">Range Reading</option>
            </select>
          </Field>
          <Field label="Scenario id">
            <Input value={id} onChange={setId} />
          </Field>
          <Field label="Hero cards">
            <Input value={heroInput} onChange={setHeroInput} />
          </Field>
          <Field label="Board">
            <Input value={boardInput} onChange={setBoardInput} />
          </Field>

          {schema === "board-texture" ? (
            <Field label="Texture (auto-suggestable)">
              <div className="flex gap-2">
                <select
                  value={texture}
                  onChange={(e) => setTexture(e.target.value)}
                  className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/15"
                >
                  <option value="dry">Dry</option>
                  <option value="wet">Wet</option>
                  <option value="very-wet">Very Wet</option>
                </select>
                <button className="btn-ghost text-xs" onClick={autoSuggest}>
                  Auto-suggest
                </button>
              </div>
              {boardCards.length >= 3 && (
                <p className="mt-1 text-xs text-white/50">
                  Engine reads this flop as {TEXTURE_LABEL[analyzeBoardTexture(boardCards.slice(0, 3)).texture]}.
                </p>
              )}
            </Field>
          ) : (
            <>
              <Field label="Question prompt">
                <Input value={prompt} onChange={setPrompt} />
              </Field>
              <Field label="Options (comma-separated)">
                <Input value={options} onChange={setOptions} />
              </Field>
              <Field label="Correct answers (comma-separated)">
                <Input value={correct} onChange={setCorrect} />
              </Field>
              <Field label="Tags (comma-separated)">
                <Input value={tags} onChange={setTags} />
              </Field>
            </>
          )}

          <Field label="Explanation">
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/15"
            />
          </Field>

          <button className="btn-primary" onClick={validate}>
            Validate
          </button>
          {errors.length > 0 && (
            <div className="card-surface p-3 text-sm text-red-300 ring-1 ring-red-400/40">
              {errors.map((e, i) => (
                <p key={i}>- {e}</p>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-chip-gold">Live preview</p>
          <PokerTable heroSeat={heroSeat} board={boardCards} showPlaceholders={boardCards.length > 0} />
          <p className="text-xs font-bold uppercase tracking-wide text-chip-gold">JSON output</p>
          <pre className="max-h-72 overflow-auto rounded-lg bg-black/40 p-3 font-mono text-xs text-white/80">
            {json}
          </pre>
          <button
            className="btn-ghost text-xs"
            onClick={() => navigator.clipboard?.writeText(json)}
          >
            Copy JSON
          </button>
        </div>
      </div>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/60">{label}</span>
      {children}
    </label>
  );
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/15 focus:outline-none focus:ring-chip-gold"
    />
  );
}
