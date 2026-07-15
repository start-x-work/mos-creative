import { z } from "zod";

/**
 * brief.json — the single starting point of every generation.
 *
 * Per CR1 §2-3, the "ad-design" school (start from what to assert, not from a
 * free prompt) is the default: generation always originates from a Brief.
 * Free-form prompt input is demoted to an auxiliary hint at the app layer.
 */

/** Content format the brief targets. */
export const FormatSchema = z.enum([
  "ad_copy",
  "lp_hero",
  "sns_post",
  "email",
  "article",
  // v0.2 / v0.3 formats are declared here so the schema is forward-stable.
  "banner",
  "storyboard",
]);
export type Format = z.infer<typeof FormatSchema>;

/** Industry guard set names shared with the guard dictionaries. */
export const IndustryGuardSetSchema = z.enum([
  "general",
  "cosmetics",
  "health_food",
  "finance",
]);
export type IndustryGuardSet = z.infer<typeof IndustryGuardSetSchema>;

export const ToneSchema = z.object({
  /** 敬体 / 常体 など。 */
  style: z.string().default("敬体"),
  /** 声のトーン（例: 誠実・簡潔）。 */
  voice: z.string().default(""),
  /** ユーザー定義の NG ワード。 */
  ngWords: z.array(z.string()).default([]),
});
export type Tone = z.infer<typeof ToneSchema>;

export const BriefSchema = z.object({
  version: z.literal("1").default("1"),
  product: z.object({
    name: z.string().default(""),
    summary: z.string().default(""),
    url: z.string().default(""),
  }),
  audience: z.object({
    persona: z.string().default(""),
    /** ジャーニー段（AISCEAS 等の段名を選択式で）。 */
    journeyStage: z.string().default(""),
  }),
  /** 訴求する KBF（複数可）。 */
  kbf: z.array(z.string()).default([]),
  tone: ToneSchema,
  format: FormatSchema,
  constraints: z.object({
    maxLength: z.number().int().nonnegative().default(0),
    mustInclude: z.array(z.string()).default([]),
    industryGuardSet: IndustryGuardSetSchema.default("general"),
  }),
  grounding: z.object({
    /**
     * 事実の手動入力欄。数値・実績・比較優位の主張は、ここに人が入力したものだけを
     * 使用してよい（出典のない数値の生成は禁止）。幻覚対策を製品仕様にする。
     */
    facts: z.array(z.string()).default([]),
  }),
});

export type Brief = z.infer<typeof BriefSchema>;

/** Parse + fill defaults. Throws ZodError on invalid input. */
export function parseBrief(input: unknown): Brief {
  return BriefSchema.parse(input);
}

/** A minimal, valid empty brief for a given format (used to seed the editor). */
export function emptyBrief(format: Format = "ad_copy"): Brief {
  return BriefSchema.parse({
    version: "1",
    product: { name: "", summary: "", url: "" },
    audience: { persona: "", journeyStage: "" },
    kbf: [],
    tone: { style: "敬体", voice: "", ngWords: [] },
    format,
    constraints: { maxLength: 0, mustInclude: [], industryGuardSet: "general" },
    grounding: { facts: [] },
  });
}
