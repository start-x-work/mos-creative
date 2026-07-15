import type { CreativeRecord } from "../types";

/**
 * Export formats. The approval trail is ALWAYS embedded (who / when / which
 * flags were acknowledged), per CR1 §2-5.
 *
 * `toMarketingOsJson` is the single source of the interchange schema consumed by
 * the Marketing-OS body's O2 intake (D-class). The schema lives here.
 */

const MARKETING_OS_SCHEMA = "mos-creative/marketing-os-export@1";

export function toMarkdown(record: CreativeRecord): string {
  const { brief, generation, status, guard, approval } = record;
  const lines: string[] = [];
  lines.push(`# ${brief.product.name || "(無題)"} — ${brief.format}`);
  lines.push("");
  lines.push(`- Status: ${status}`);
  lines.push(`- Model: ${generation.model}`);
  lines.push(`- Generated: ${generation.createdAt}`);
  if (approval) {
    lines.push(
      `- Approved by: ${approval.approver} @ ${approval.approvedAt} (${approval.findingCountAtApproval} flag(s) acknowledged)`,
    );
  }
  lines.push("");
  lines.push("## Draft");
  lines.push("");
  lines.push(generation.text);
  if (guard && guard.findings.length > 0) {
    lines.push("");
    lines.push("## Guard findings (points to check — not rewrites)");
    lines.push("");
    for (const f of guard.findings) {
      const where = f.match ? `「${f.match}」` : "(全体)";
      lines.push(
        `- [${f.severity}] ${where} (${f.set}/${f.ruleId}): ${f.point}`,
      );
    }
  }
  return `${lines.join("\n")}\n`;
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** One row per record. Trail columns are always present. */
export function toCsv(records: CreativeRecord[]): string {
  const header = [
    "id",
    "product",
    "format",
    "status",
    "model",
    "createdAt",
    "approver",
    "approvedAt",
    "flagsAcknowledged",
    "text",
  ];
  const rows = records.map((r) =>
    [
      r.id,
      r.brief.product.name,
      r.brief.format,
      r.status,
      r.generation.model,
      r.generation.createdAt,
      r.approval?.approver ?? "",
      r.approval?.approvedAt ?? "",
      String(r.approval?.findingCountAtApproval ?? ""),
      r.generation.text,
    ]
      .map((v) => csvEscape(String(v)))
      .join(","),
  );
  return `${[header.join(","), ...rows].join("\n")}\n`;
}

export interface MarketingOsExport {
  schema: string;
  brief: CreativeRecord["brief"];
  generation: CreativeRecord["generation"];
  status: CreativeRecord["status"];
  guard: CreativeRecord["guard"];
  approval: CreativeRecord["approval"];
}

/** Single-source interchange JSON for the Marketing-OS body O2 (D-class) intake. */
export function toMarketingOsJson(record: CreativeRecord): MarketingOsExport {
  return {
    schema: MARKETING_OS_SCHEMA,
    brief: record.brief,
    generation: record.generation,
    status: record.status,
    guard: record.guard,
    approval: record.approval,
  };
}

export interface BackupFile {
  schema: string;
  records: CreativeRecord[];
}

const BACKUP_SCHEMA = "mos-creative/backup@1";

/** Whole-project backup; importable for full restore. */
export function toBackup(records: CreativeRecord[]): BackupFile {
  return { schema: BACKUP_SCHEMA, records };
}

export function fromBackup(data: unknown): CreativeRecord[] {
  const file = data as BackupFile;
  if (!file || file.schema !== BACKUP_SCHEMA || !Array.isArray(file.records)) {
    throw new Error("Invalid mos-creative backup file.");
  }
  return file.records;
}
