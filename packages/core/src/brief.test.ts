import { describe, expect, it } from "vitest";
import { emptyBrief, parseBrief } from "./brief";
import { buildPrompt, groundingPreamble } from "./prompts";

describe("brief", () => {
  it("fills defaults and validates format", () => {
    const b = parseBrief({
      product: { name: "予約くん", summary: "美容室予約" },
      audience: { persona: "小規模サロン店長" },
      format: "ad_copy",
      constraints: { industryGuardSet: "general" },
      tone: {},
      grounding: {},
      kbf: ["予約の手軽さ"],
    });
    expect(b.version).toBe("1");
    expect(b.tone.style).toBe("敬体");
    expect(b.format).toBe("ad_copy");
    expect(b.grounding.facts).toEqual([]);
  });

  it("rejects an unknown format", () => {
    expect(() => parseBrief({ ...emptyBrief(), format: "hologram" })).toThrow();
  });
});

describe("grounding rule in prompts", () => {
  it("warns explicitly when no facts are provided", () => {
    const p = groundingPreamble(emptyBrief());
    expect(p).toContain("数値・実績・比較優位の主張は書かないでください");
  });

  it("lists human-entered facts and forbids fabrication", () => {
    const b = emptyBrief();
    b.grounding.facts = ["導入後のCVR +12%（2026Q2 自社計測）"];
    const p = groundingPreamble(b);
    expect(p).toContain("導入後のCVR +12%");
    expect(p).toContain("事実にない数値を創作しない");
  });

  it("sns_post prompt keeps URLs and hashtags out (no external posting)", () => {
    const b = emptyBrief("sns_post");
    const p = buildPrompt(b);
    expect(p).toContain("ハッシュタグは付けず");
    expect(p).toContain("URL も含めない");
  });
});
