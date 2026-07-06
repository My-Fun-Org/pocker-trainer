import { useMemo, useState } from "react";
import { TrainingMode } from "@/types/training";
import { useProgressStore } from "@/store/progress";
import { auditModeTitle as modeTitle, downloadAuditCsv, downloadAuditJson } from "@/lib/audit";
import { PageShell } from "@/components/ui";

type Filter = "all" | "correct" | "incorrect";

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString();
}

export function AuditLog() {
  const audits = useProgressStore((s) => s.audits);
  const clearAudits = useProgressStore((s) => s.clearAudits);
  const [modeFilter, setModeFilter] = useState<TrainingMode | "all">("all");
  const [resultFilter, setResultFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const modesPresent = useMemo(() => {
    const set = new Set<TrainingMode>();
    for (const a of audits) set.add(a.mode);
    return [...set].sort((a, b) => modeTitle(a).localeCompare(modeTitle(b)));
  }, [audits]);

  const filtered = useMemo(
    () =>
      audits.filter(
        (a) =>
          (modeFilter === "all" || a.mode === modeFilter) &&
          (resultFilter === "all" ||
            (resultFilter === "correct" ? a.wasCorrect : !a.wasCorrect)),
      ),
    [audits, modeFilter, resultFilter],
  );

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const exportJson = () => downloadAuditJson(filtered);
  const exportCsv = () => downloadAuditCsv(filtered);

  const stamp = new Date().toISOString().slice(0, 10);

  return (
    <PageShell
      title="Exercise Audit Log"
      subtitle="Every decision you made, with the trainer's answer and its reasoning - review it to spot logic bugs."
      actions={
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost px-3 py-2 text-sm" onClick={exportJson} disabled={filtered.length === 0}>
            Export JSON
          </button>
          <button className="btn-ghost px-3 py-2 text-sm" onClick={exportCsv} disabled={filtered.length === 0}>
            Export CSV
          </button>
          <button
            className="btn-ghost px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
            onClick={() => {
              if (audits.length && confirm("Clear the entire audit log? This cannot be undone.")) {
                clearAudits();
              }
            }}
            disabled={audits.length === 0}
          >
            Clear log
          </button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80"
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value as TrainingMode | "all")}
        >
          <option value="all">All modules ({audits.length})</option>
          {modesPresent.map((m) => (
            <option key={m} value={m}>
              {modeTitle(m)} ({audits.filter((a) => a.mode === m).length})
            </option>
          ))}
        </select>

        <div className="flex overflow-hidden rounded-lg border border-white/10">
          {(["all", "correct", "incorrect"] as Filter[]).map((f) => (
            <button
              key={f}
              className={`px-3 py-2 text-sm capitalize ${
                resultFilter === f ? "bg-chip-gold text-black" : "text-white/70 hover:bg-white/5"
              }`}
              onClick={() => setResultFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-white/50">
          Showing {filtered.length} of {audits.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface p-8 text-center text-sm text-white/50">
          {audits.length === 0
            ? "No exercises recorded yet. Play any trainer and every decision will be logged here."
            : "No entries match this filter."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => {
            const open = expanded.has(e.id);
            return (
              <div key={e.id} className="card-surface overflow-hidden">
                <button
                  className="flex w-full items-start gap-3 p-3 text-left"
                  onClick={() => toggle(e.id)}
                >
                  <span
                    className={`mt-0.5 inline-block shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      e.wasCorrect ? "bg-emerald-500/20 text-emerald-200" : "bg-red-500/20 text-red-200"
                    }`}
                  >
                    {e.wasCorrect ? "Correct" : "Wrong"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-chip-gold">{modeTitle(e.mode)}</span>
                      <span className="text-[11px] text-white/40">{formatTime(e.at)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-white/80">{e.prompt}</p>
                  </div>
                  <span className="mt-1 shrink-0 text-white/40">{open ? "−" : "+"}</span>
                </button>

                {open && (
                  <div className="space-y-3 border-t border-white/10 p-3 text-sm">
                    <p className="text-white/80">{e.prompt}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg bg-black/30 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-white/40">Your answer</p>
                        <p className={e.wasCorrect ? "text-emerald-200" : "text-red-200"}>{e.chosen}</p>
                      </div>
                      <div className="rounded-lg bg-black/30 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-white/40">
                          Trainer says correct
                        </p>
                        <p className="text-white/85">{e.correct}</p>
                      </div>
                    </div>
                    {e.detail.length > 0 && (
                      <ul className="space-y-1 text-xs text-white/60">
                        {e.detail.map((d, i) => (
                          <li key={i}>- {d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-[11px] text-white/30">Audit generated {stamp}. Stored locally in your browser only.</p>
    </PageShell>
  );
}
