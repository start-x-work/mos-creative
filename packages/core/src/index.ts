/**
 * Public API surface for @start-x-work/mos-creative v0.1+.
 *
 * Local-first, draft-first creative production: a brief schema, prompt
 * scaffolds (with a grounding rule), a deterministic expression guard
 * (highlight + point to check — never a rewrite), a human-only approval gate,
 * and export formats that always embed the approval trail.
 *
 * This library performs NO network I/O and reads NO clock: timestamps are
 * supplied by callers. The Web UI is the first consumer.
 */

export {
  ApprovalError,
  type ApproveInput,
  approveRecord,
  buildApproval,
} from "./approval";
export {
  type Brief,
  BriefSchema,
  emptyBrief,
  type Format,
  FormatSchema,
  type IndustryGuardSet,
  IndustryGuardSetSchema,
  parseBrief,
  type Tone,
  ToneSchema,
} from "./brief";
export {
  type BackupFile,
  fromBackup,
  type MarketingOsExport,
  toBackup,
  toCsv,
  toMarkdown,
  toMarketingOsJson,
} from "./export/index";
export {
  BUILTIN_RULE_SETS,
  type GuardRule,
  type GuardRuleSet,
  resolveRuleSets,
  runGuard,
} from "./guard/guard";
export { buildPrompt, groundingPreamble } from "./prompts";
export type {
  ApprovalTrail,
  CreativeRecord,
  CreativeStatus,
  Generation,
  GuardFinding,
  GuardReport,
  GuardSeverity,
} from "./types";
