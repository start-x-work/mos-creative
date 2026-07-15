import type { GuardFinding, GuardReport, GuardSeverity } from "../types";
import cosmetics from "./rules.cosmetics.json";
import finance from "./rules.finance.json";
import general from "./rules.general.json";
import healthFood from "./rules.health_food.json";

/**
 * The expression guard. It is deliberately limited to "highlight + point to
 * check": it only flags a span and explains what to verify. It never edits the
 * text and never proposes alternative wording for the user — the human edits in
 * the editor. This is a design constraint (CR1 §2-4, D-7 patent-risk avoidance),
 * not an omission. A GuardFinding has no suggestion/alternative field.
 */

export interface GuardRule {
  id: string;
  severity: GuardSeverity;
  point: string;
  /** Any occurrence of these terms raises a finding at each match. */
  terms?: string[];
  /** If NONE of these markers are present, raise a single finding. */
  requireOneOf?: string[];
}

export interface GuardRuleSet {
  set: string;
  note?: string;
  rules: GuardRule[];
}

export const BUILTIN_RULE_SETS: Record<string, GuardRuleSet> = {
  general: general as GuardRuleSet,
  cosmetics: cosmetics as GuardRuleSet,
  health_food: healthFood as GuardRuleSet,
  finance: finance as GuardRuleSet,
};

/** Resolve the rule sets to apply: general is always included. */
export function resolveRuleSets(
  industryGuardSet: string,
  extra: GuardRuleSet[] = [],
): GuardRuleSet[] {
  const sets: GuardRuleSet[] = [BUILTIN_RULE_SETS.general];
  if (industryGuardSet !== "general" && BUILTIN_RULE_SETS[industryGuardSet]) {
    sets.push(BUILTIN_RULE_SETS[industryGuardSet]);
  }
  return [...sets, ...extra];
}

function findAll(haystack: string, needle: string): number[] {
  if (needle === "") return [];
  const out: number[] = [];
  let from = 0;
  for (;;) {
    const i = haystack.indexOf(needle, from);
    if (i === -1) break;
    out.push(i);
    from = i + needle.length;
  }
  return out;
}

/**
 * Run the deterministic guard over `text`.
 * @param userNgWords brief.tone.ngWords — user-defined NG words, always warned.
 * @param aiFindings optional findings from an opt-in AI pass (app layer). Merged
 *   in as-is; core never calls a network itself.
 */
export function runGuard(
  text: string,
  sets: GuardRuleSet[],
  userNgWords: string[] = [],
  aiFindings: GuardFinding[] = [],
): GuardReport {
  const findings: GuardFinding[] = [];

  for (const rs of sets) {
    for (const rule of rs.rules) {
      if (rule.terms) {
        for (const term of rule.terms) {
          for (const index of findAll(text, term)) {
            findings.push({
              ruleId: rule.id,
              severity: rule.severity,
              match: term,
              index,
              point: rule.point,
              set: rs.set,
            });
          }
        }
      }
      if (rule.requireOneOf) {
        const present = rule.requireOneOf.some((m) => text.includes(m));
        if (!present) {
          findings.push({
            ruleId: rule.id,
            severity: rule.severity,
            match: "",
            index: 0,
            point: rule.point,
            set: rs.set,
          });
        }
      }
    }
  }

  for (const ng of userNgWords) {
    for (const index of findAll(text, ng)) {
      findings.push({
        ruleId: "user_ng_word",
        severity: "warning",
        match: ng,
        index,
        point: "ブリーフで指定された NG ワードです。",
        set: "user",
      });
    }
  }

  findings.push(...aiFindings);
  findings.sort((a, b) => a.index - b.index);

  return { findings, aiJudged: aiFindings.length > 0 };
}
