import { describe, expect, it } from "vitest";
import {
  approveRecord,
  buildApproval,
  buildPrompt,
  type CreativeRecord,
  emptyBrief,
  resolveRuleSets,
  runGuard,
  toMarketingOsJson,
} from "../packages/core/src/index";

// Smoke test for the deterministic Brief → Prompt → Guard → Approve → Export
// flow (no network; the browser adds only the Gemini call in between).
describe("creative flow (headless)", () => {
  it("runs end to end and produces an O2-ready export with a trail", () => {
    const brief = emptyBrief("ad_copy");
    brief.product.name = "予約くん";
    brief.constraints.industryGuardSet = "general";
    brief.grounding.facts = ["導入後のCVR +12%（2026Q2 自社計測）"];

    // Prompt embeds the grounding rule.
    expect(buildPrompt(brief)).toContain("事実にない数値を創作しない");

    // A draft (would come from Gemini) is reviewed by the guard.
    const draft = "この方法なら必ず成果が出ます。導入後のCVR +12%。";
    const guard = runGuard(draft, resolveRuleSets("general"));
    expect(guard.findings.some((f) => f.ruleId === "assertion")).toBe(true);

    // Approval requires name + acknowledgement.
    expect(() =>
      buildApproval({
        approver: "",
        flagsAcknowledged: true,
        guard,
        approvedAt: "2026-07-15T00:00:00Z",
      }),
    ).toThrow();

    const record: CreativeRecord = {
      id: "rec_e2e",
      brief,
      generation: {
        id: "gen_e2e",
        briefId: "brief_e2e",
        text: draft,
        model: "gemini-2.5-flash",
        createdAt: "2026-07-15T00:00:00Z",
      },
      status: "draft",
      guard,
    };
    const approved = approveRecord(record, {
      approver: "山口",
      flagsAcknowledged: true,
      guard,
      approvedAt: "2026-07-15T01:00:00Z",
    });

    const out = toMarketingOsJson(approved);
    expect(out.schema).toBe("mos-creative/marketing-os-export@1");
    expect(out.approval?.approver).toBe("山口");
    expect(out.guard?.findings.length).toBeGreaterThan(0);
  });
});
