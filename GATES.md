# Release gates — mos-creative

Governance record for the CR1 v2.0 publication gates. Kept in-repo so the
decision trail travels with the code.

## D-6 — 業態別チェックリスト初期版の承認 / Industry checklist approval

- Scope: `packages/core/src/guard/rules.general.json`,
  `rules.cosmetics.json`, `rules.health_food.json`, `rules.finance.json`.
- Status: **approved for v0.1 by the product owner (2026-07-15).**
- Note: these are explicitly *initial* dictionaries that surface points to
  check; they are not legal advice. They are expected to be refined over time.
  The guard advises only (highlight + point) and never proposes wording.

## D-7 — 特許・商標リスク確認 / Patent & trademark clearance

- Known risk: JP Patent 6621095 covers ad-text checkers that display an
  **OK/NG judgment together with an alternative expression (代替表現)**.
- Design-level mitigation (implemented & verified): the guard **never emits an
  alternative expression / rewrite / リライト案**. A `GuardFinding` carries only
  `{ ruleId, severity, match, index, point, set }` — there is no
  suggestion/replacement field. Enforced by:
  - `packages/core/src/guard/guard.test.ts` (asserts the finding's exact keys),
  - CI gate: `grep -rniE "rewrite|代替表現|リライト案|replacement"` over
    `packages/core/src/guard/` returns nothing.
- Status: **product owner has authorized proceeding (2026-07-15).** A formal
  patent-attorney (弁理士) review remains the owner's to file and record here;
  this record captures the design mitigation and the owner's go-ahead, not a
  legal opinion.

## Publication prerequisites (owner actions)

These require credentials/permissions not available to the build agent:

1. GitHub repository → **Settings → Secrets and variables → Actions**:
   - `NPM_TOKEN` (npm automation token with publish rights to `@start-x-work`)
   - `CLOUDFLARE_API_TOKEN` (Pages:Edit)
   - `CLOUDFLARE_ACCOUNT_ID`
2. Flip repository visibility to **public** when ready to launch.
3. Apply CR1 spec v2.1 (the 7 reconciliations in `audit-cr1v2.md`) and the
   "body-integration cancelled" overwrite records in the private strategy docs.

Once (1) and (2) are done, publish/deploy run via the gated workflows:
- `Release (npm publish)` — push tag `v0.1.0` (or run manually).
- `Deploy Web (Cloudflare Pages)` — run manually (workflow_dispatch).
