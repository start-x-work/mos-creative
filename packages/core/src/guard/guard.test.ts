import { describe, expect, it } from "vitest";
import { buildApproval } from "../approval";
import { resolveRuleSets, runGuard } from "./guard";

describe("runGuard", () => {
  it("highlights assertions with a point to check, and only advises", () => {
    const sets = resolveRuleSets("general");
    const report = runGuard("この方法なら必ず成果が出ます。", sets);
    const assertion = report.findings.find((f) => f.ruleId === "assertion");
    expect(assertion).toBeDefined();
    expect(assertion?.match).toBe("必ず");
    expect(assertion?.point).toContain("確認してください");
    // A finding carries ONLY these fields — no field that suggests wording.
    expect(Object.keys(assertion ?? {}).sort()).toEqual(
      ["index", "match", "point", "ruleId", "set", "severity"].sort(),
    );
  });

  it("adds the industry set on top of general", () => {
    const sets = resolveRuleSets("cosmetics");
    const report = runGuard("シミが消えると評判です。", sets);
    expect(report.findings.some((f) => f.set === "cosmetics")).toBe(true);
  });

  it("flags missing PR marker via requireOneOf", () => {
    const sets = resolveRuleSets("general");
    const report = runGuard("インフルエンサーが絶賛しています。", sets);
    expect(report.findings.some((f) => f.ruleId === "stealth_marketing")).toBe(
      true,
    );
  });

  it("does not flag stealth marketing when a PR marker is present", () => {
    const sets = resolveRuleSets("general");
    const report = runGuard("【PR】新商品のご紹介です。", sets);
    expect(report.findings.some((f) => f.ruleId === "stealth_marketing")).toBe(
      false,
    );
  });

  it("warns on user-defined NG words", () => {
    const sets = resolveRuleSets("general");
    const report = runGuard("激安セール中。", sets, ["激安"]);
    expect(report.findings.some((f) => f.ruleId === "user_ng_word")).toBe(true);
  });
});

describe("approval gate", () => {
  it("rejects approval without a name", () => {
    expect(() =>
      buildApproval({
        approver: "",
        flagsAcknowledged: true,
        guard: { findings: [], aiJudged: false },
        approvedAt: "2026-07-15T00:00:00Z",
      }),
    ).toThrow(/承認者名/);
  });

  it("rejects approval without flag acknowledgement", () => {
    expect(() =>
      buildApproval({
        approver: "山口",
        flagsAcknowledged: false,
        guard: { findings: [], aiJudged: false },
        approvedAt: "2026-07-15T00:00:00Z",
      }),
    ).toThrow(/確認チェック/);
  });

  it("builds a trail when both are present", () => {
    const trail = buildApproval({
      approver: "山口",
      flagsAcknowledged: true,
      guard: {
        findings: [
          {
            ruleId: "assertion",
            severity: "warning",
            match: "必ず",
            index: 3,
            point: "確認してください",
            set: "general",
          },
        ],
        aiJudged: false,
      },
      approvedAt: "2026-07-15T00:00:00Z",
    });
    expect(trail.approver).toBe("山口");
    expect(trail.findingCountAtApproval).toBe(1);
  });
});
