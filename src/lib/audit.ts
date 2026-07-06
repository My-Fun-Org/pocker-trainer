import { AuditEntry } from "@/store/progress";
import { MODE_BY_ID, TrainingMode } from "@/types/training";

/** Human-readable module title for an audit entry's mode. */
export function auditModeTitle(mode: TrainingMode): string {
  return MODE_BY_ID[mode]?.title ?? mode;
}

/** Pretty JSON export of audit entries, enriched with readable fields. */
export function auditToJson(entries: AuditEntry[]): string {
  return JSON.stringify(
    entries.map((e) => ({
      ...e,
      module: auditModeTitle(e.mode),
      when: new Date(e.at).toISOString(),
    })),
    null,
    2,
  );
}

/** CSV export of audit entries. */
export function auditToCsv(entries: AuditEntry[]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    ["timestamp", "module", "result", "prompt", "your_answer", "trainer_correct", "detail"],
    ...entries.map((e) => [
      new Date(e.at).toISOString(),
      auditModeTitle(e.mode),
      e.wasCorrect ? "correct" : "incorrect",
      e.prompt,
      e.chosen,
      e.correct,
      e.detail.join(" | "),
    ]),
  ];
  return rows.map((r) => r.map((c) => escape(String(c))).join(",")).join("\n");
}

/** Trigger a browser download of `content` as a file. */
export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Convenience: download the given audit entries as a dated JSON file. */
export function downloadAuditJson(entries: AuditEntry[]) {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadFile(`poker-audit-${stamp}.json`, auditToJson(entries), "application/json");
}

/** Convenience: download the given audit entries as a dated CSV file. */
export function downloadAuditCsv(entries: AuditEntry[]) {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadFile(`poker-audit-${stamp}.csv`, auditToCsv(entries), "text/csv");
}
