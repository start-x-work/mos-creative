import type { Brief, Format } from "../brief";

/**
 * Prompt scaffolds. Pure functions that turn a Brief into a prompt string.
 *
 * Written fresh for this OSS (no carry-over of private-repo prompt text, per
 * §0 audit decision). The grounding rule (§2-3) is embedded in every prompt so
 * the model is structurally discouraged from inventing numbers.
 */

/** The grounding + boundary preamble shared by all formats. */
export function groundingPreamble(brief: Brief): string {
  const facts = brief.grounding.facts;
  const factsBlock =
    facts.length > 0
      ? facts.map((f) => `- ${f}`).join("\n")
      : "(事実の入力はありません。数値・実績・比較優位の主張は書かないでください。)";
  const ng =
    brief.tone.ngWords.length > 0 ? brief.tone.ngWords.join("、") : "(なし)";
  return [
    "あなたは日本語のコピー・記事の下書きを作る編集アシスタントです。",
    "以下の規約を厳守してください:",
    "1. 数値・実績・比較優位・「No.1」等の主張は、下の【事実】に人が入力したものだけを根拠に使う。事実にない数値を創作しない。",
    "2. 断定・保証（「必ず」「100%」等）や誇大表現を避け、確認可能な範囲で書く。",
    "3. NG ワードを使わない。指定のトーン・語調に従う。",
    "4. これは下書きである。最終確認と公開は人が行う前提で、誇張せず編集しやすい形で出す。",
    "",
    "【事実（この範囲でのみ数値・実績を使う）】",
    factsBlock,
    "",
    `【トーン】${brief.tone.style} / ${brief.tone.voice || "指定なし"}`,
    `【NG ワード】${ng}`,
  ].join("\n");
}

function audienceBlock(brief: Brief): string {
  return [
    `【対象】${brief.audience.persona || "指定なし"}`,
    `【ジャーニー段】${brief.audience.journeyStage || "指定なし"}`,
    `【訴求 KBF】${brief.kbf.length > 0 ? brief.kbf.join("、") : "指定なし"}`,
    `【商品】${brief.product.name || "指定なし"}：${brief.product.summary || ""}`,
  ].join("\n");
}

function constraintsBlock(brief: Brief): string {
  const c = brief.constraints;
  const lines: string[] = [];
  if (c.maxLength > 0) lines.push(`- 最大 ${c.maxLength} 文字程度に収める`);
  if (c.mustInclude.length > 0)
    lines.push(`- 次を必ず含める: ${c.mustInclude.join("、")}`);
  return lines.length > 0 ? `【制約】\n${lines.join("\n")}` : "";
}

const INSTRUCTION: Record<Format, string> = {
  ad_copy:
    "上記に基づき、広告コピーの案を3つ、それぞれ見出しと本文（短文）で出してください。",
  lp_hero:
    "上記に基づき、LP のヒーロー見出しとサブコピーの案を3組出してください。",
  sns_post:
    "上記に基づき、SNS 投稿案を3つ出してください。ハッシュタグは付けず、URL も含めないでください（配信・投稿は人が別途行います）。",
  email:
    "上記に基づき、メールの件名案を3つと、本文の下書きを1つ出してください。",
  article:
    "上記に基づき、記事の構成（見出し階層）を作り、続けて本文のドラフトを書いてください。",
  banner:
    "上記に基づき、バナーに載せる訴求文（メインコピー・サブコピー・CTA）の案を3組出してください。画像そのものは生成しません。",
  storyboard:
    "上記に基づき、動画の台本とカット割り（各カットの説明）を作ってください。映像そのものは生成しません。",
};

/** Build the full prompt for a brief's format. */
export function buildPrompt(brief: Brief): string {
  return [
    groundingPreamble(brief),
    "",
    audienceBlock(brief),
    "",
    constraintsBlock(brief),
    "",
    INSTRUCTION[brief.format],
  ]
    .filter((s) => s !== "")
    .join("\n");
}
