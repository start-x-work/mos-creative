import type { ApprovalTrail, CreativeRecord, GuardReport } from "./types";

export class ApprovalError extends Error {}

export interface ApproveInput {
  approver: string;
  /** Must be true: the human confirmed they reviewed the guard flags. */
  flagsAcknowledged: boolean;
  guard: GuardReport;
  /** ISO timestamp supplied by the caller (core never reads the clock). */
  approvedAt: string;
}

/**
 * Build an approval trail. Throws unless BOTH a non-empty approver name and an
 * explicit flag acknowledgement are present. There is no code path that yields
 * an ApprovalTrail without a human name — i.e. no unattended approval.
 */
export function buildApproval(input: ApproveInput): ApprovalTrail {
  if (!input.approver || input.approver.trim() === "") {
    throw new ApprovalError("承認者名が必要です（無人承認は不可）。");
  }
  if (input.flagsAcknowledged !== true) {
    throw new ApprovalError(
      "ガードフラグの確認チェックが必要です（無人承認は不可）。",
    );
  }
  return {
    approver: input.approver.trim(),
    approvedAt: input.approvedAt,
    acknowledgedFindings: input.guard.findings,
    findingCountAtApproval: input.guard.findings.length,
  };
}

/** Transition a record to "approved" by attaching a valid trail. */
export function approveRecord(
  record: CreativeRecord,
  input: ApproveInput,
): CreativeRecord {
  const approval = buildApproval(input);
  return { ...record, status: "approved", guard: input.guard, approval };
}
