import type { Brief } from "./brief";

/** Status lifecycle. No path exists that reaches "approved" without a human. */
export type CreativeStatus = "draft" | "approved" | "archived";

/** A single generated candidate (text-first in v0.1). */
export interface Generation {
  id: string;
  briefId: string;
  /** The generated text body (draft). */
  text: string;
  /** Which model produced it, for the trail (e.g. "gemini-2.x"). */
  model: string;
  /** ISO timestamp; supplied by the caller (core does not read the clock). */
  createdAt: string;
}

/** Severity of a guard finding. Never "error" — the guard only advises. */
export type GuardSeverity = "info" | "warning";

/** A guard finding: a highlighted span plus the point to check. NO rewrite. */
export interface GuardFinding {
  /** Rule id, e.g. "assertion", "superlative", "stealth_marketing". */
  ruleId: string;
  severity: GuardSeverity;
  /** The matched substring in the reviewed text. */
  match: string;
  /** Character offset of the match within the reviewed text. */
  index: number;
  /** The point a human should check — an advisory, never a replacement string. */
  point: string;
  /** Which dictionary raised it, e.g. "general" or "cosmetics". */
  set: string;
}

export interface GuardReport {
  findings: GuardFinding[];
  /** True if AI-based contextual judging was requested and merged in. */
  aiJudged: boolean;
}

/** Approval requires BOTH a reviewer name AND explicit flag acknowledgement. */
export interface ApprovalTrail {
  approver: string;
  approvedAt: string;
  /** The guard findings the approver acknowledged at approval time. */
  acknowledgedFindings: GuardFinding[];
  /** How many findings were shown; kept for auditability. */
  findingCountAtApproval: number;
}

/** A creative unit: brief + chosen draft + (once approved) its trail. */
export interface CreativeRecord {
  id: string;
  brief: Brief;
  generation: Generation;
  status: CreativeStatus;
  guard?: GuardReport;
  approval?: ApprovalTrail;
}
