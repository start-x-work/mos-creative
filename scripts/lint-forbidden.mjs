#!/usr/bin/env node
/**
 * lint-forbidden.mjs — single source of the forbidden-vocabulary check for the
 * files WE author (UI copy, README, docs). It does NOT inspect user-generated
 * content produced through the app.
 *
 * Rationale: the Marketing-OS brand forbids aggressive/《駆逐・破壊・革命》-style
 * vocabulary and unearned guarantees in our own outward copy. mos-seo has no
 * equivalent check (confirmed in §0 audit), so this is newly created here per
 * CR1 §3 and Section X.
 *
 * Exit non-zero if any forbidden term is found so CI fails.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();

// The three brand-forbidden terms (single source). Aggressive conquest vocabulary.
const FORBIDDEN = [
  { term: "駆逐", why: "攻撃的語彙の禁止（Part 9 §1-2）" },
  { term: "破壊", why: "攻撃的語彙の禁止（Part 9 §1-2）" },
  { term: "革命", why: "攻撃的語彙の禁止（Part 9 §1-2）" },
];

// Guarantee / superlative claims we must never make in our own outward copy.
// These are skipped when the same line negates them (a disclaimer such as
// "法的審査を代替するものではありません" is exactly what we WANT to say).
const NEGATION_CUES = [
  "ではありません",
  "ではない",
  "しません",
  "ありません",
  "ない",
  "not replace",
  "does not",
  "n't",
];
const FORBIDDEN_CLAIMS = [
  {
    term: "成果保証",
    why: "誇大・保証表現の禁止（Part 9 §1-3）",
    negatable: true,
  },
  {
    term: "効果を保証",
    why: "誇大・保証表現の禁止（Part 9 §1-3）",
    negatable: true,
  },
  {
    term: "法的審査を代替",
    why: "法的審査の代替を謳わない（本書§2-4）",
    negatable: true,
  },
];

const ALL = [...FORBIDDEN, ...FORBIDDEN_CLAIMS];

// Only our own authored text. Skip build output, deps, lockfiles, and the
// guard rule dictionaries (those legitimately LIST risky words to detect them).
const INCLUDE_EXT = new Set([".ts", ".tsx", ".md", ".mjs", ".html", ".css"]);
const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  ".git",
  ".wrangler",
  "coverage",
]);
const SKIP_PATH_SUBSTR = [
  "packages/core/src/guard/rules.", // rule dictionaries name risky terms on purpose
  "scripts/lint-forbidden.mjs", // this file lists the terms by definition
];

/** @param {string} dir */
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      yield* walk(full);
    } else if (INCLUDE_EXT.has(extname(entry))) {
      yield full;
    }
  }
}

const violations = [];
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file);
  if (SKIP_PATH_SUBSTR.some((s) => rel.includes(s))) continue;
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    for (const rule of ALL) {
      if (!line.includes(rule.term)) continue;
      // Skip a negated claim on the same line (an intentional disclaimer).
      if (rule.negatable) {
        const after = line.slice(line.indexOf(rule.term) + rule.term.length);
        if (NEGATION_CUES.some((cue) => after.includes(cue))) continue;
      }
      violations.push({
        rel,
        line: i + 1,
        term: rule.term,
        why: rule.why,
        text: line.trim(),
      });
    }
  });
}

if (violations.length > 0) {
  console.error("✗ forbidden vocabulary found in authored copy:\n");
  for (const v of violations) {
    console.error(`  ${v.rel}:${v.line}  「${v.term}」 — ${v.why}`);
    console.error(`      ${v.text}`);
  }
  console.error(`\n${violations.length} violation(s).`);
  process.exit(1);
}

console.log("✓ lint-forbidden: no forbidden vocabulary in authored copy.");
