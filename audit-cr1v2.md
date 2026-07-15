# audit-cr1v2.md — CR1 v2.0（mos-creative）§0 リポジトリ監査ログ

**実施:** 2026-07-15 / セッション: start-x-work スコープ
**対象:** `start-x-work/marketing-os-seo`（OSS規約の踏襲元）
**添付先:** 新リポ `start-x-work/mos-creative` 初回PRの説明（指示書§0の規定）
**結論:** 指示書 CR1 v2.0 の §0/§2/§3 前提に **7件の矛盾** を検出。指示書の規定「audit before spec」に従い、**実装着手前に本書を v2.1 へ改訂**すること。詳細は末尾「要改訂リスト」。

---

## A. 参照リポの実体（最重要の訂正）

| 指示書の記述 | 実体 | 対応 |
|---|---|---|
| 参照実装 `start-x-work/mos-seo`／`gh repo clone start-x-work/mos-seo` | **そのリポは存在しない。** 実体は `start-x-work/marketing-os-seo`（npmパッケージ名 `@start-x-work/mos-seo` はこの monorepo 内 `packages/cli` の publish 名） | 参照先を `marketing-os-seo` に訂正 |

- clone: `git clone --depth 1 https://github.com/start-x-work/marketing-os-seo` → HEAD `e5444e1`、成功。

## B. 構成・ビルド・公開設定

**monorepo（pnpm workspace `packages/*`）**。指示書§0の「単一構成にするか monorepo にするか（既定=mos-seoに揃える）」の答え = **monorepo に揃える**。

```
marketing-os-seo/
├─ package.json            # private:true, name @start-x-work/marketing-os-seo, v0.0.0（ルートは非公開）
├─ pnpm-workspace.yaml     # packages: ["packages/*"]
├─ tsconfig.base.json
├─ biome.json              # lint/format = Biome（ESLint/Prettier ではない）
├─ LICENSE (Apache-2.0)
├─ NOTICE                  # Marketing-OS エコシステムへの導線
├─ .github/workflows/ci.yml
├─ docs/ (QUICKSTART.md, USAGE.md, ROADMAP.md)
└─ packages/
   ├─ core/  @start-x-work/marketing-os-seo-core  v1.1.0  publish:public  (tsup, esm+cjs+dts)
   │         deps: @start-x-work/mos-kit ^0.1.0, zod ^4.4.3   devDeps: cheerio
   ├─ cli/   @start-x-work/mos-seo               v1.1.1  publish:public  (tsup, bin: mos-seo)
   │         deps: citty, picocolors             devDeps: core(workspace:*)
   └─ web/   @start-x-work/marketing-os-seo-web  v0.1.0  private:true    (Cloudflare Pages)
             React 18 + react-dom 18 + react-router-dom 6 + @tanstack/react-query 5 + lucide-react
             Vite 8 + Tailwind 3 + postcss + autoprefixer + wrangler 4（pages deploy）
```

- ルート scripts: `build: pnpm -r build` / `test: vitest run` / `lint: biome check .` / `typecheck: pnpm -r typecheck`。packageManager: **pnpm@9.0.0**。
- CI（`.github/workflows/ci.yml`）: node 22 + pnpm、`install --frozen-lockfile → lint → build → test → typecheck`。**禁止用語チェックは存在しない**（下記E）。
- web の deploy: `wrangler pages deploy dist`、preview: `wrangler pages dev dist`。

## C. ライセンス（指示書想定と矛盾）

- 実体 = **Apache-2.0**（全公開パッケージ・LICENSE・NOTICE すべて Apache-2.0）。
- 指示書§0/§2の「想定：MIT。異なる場合は本書を改訂」→ **異なる。Apache-2.0 に確定し、指示書を改訂**。
- NOTICE で Marketing-OS エコシステムへの導線を保持する慣行あり（新リポも踏襲）。

## D. BYOK（APIキーの取り扱い）— 指示書と矛盾

- 実体 = **sessionStorage**（`packages/web/src/lib/ai-settings.ts`、STORAGE_KEY=`"mos-ai-keys"`、`gemini/openai/anthropic` を JSON 保存）。自社サーバ送信経路なし。
- 指示書§2-2は「**localStorage** に保存」と記載 → mos-seo 先行実装は **sessionStorage**。指示書§0の「mos-seoに先行実装があればそれに従う」に基づき **sessionStorage に統一**（指示書§2-2を訂正）。
  - 補足: sessionStorage はタブを閉じると消える＝より安全側。creative でもキー保存はこの方式を踏襲。生成物・ブリーフ等の永続データは指示書どおり IndexedDB でよい（キーとデータで保存先を分ける現行踏襲）。

## E. 禁止用語 lint の有無

- mos-seo に `lint-forbidden` 相当は **存在しない**（`find … -name "*forbidden*"` ゼロ、CI にも該当ステップなし）。
- 指示書§3「lint-forbidden.mjs 相当を OSS 側に**新設**」は妥当（新規作成）。ただし Section X の「禁止用語3語（単一ソース：lint-forbidden.mjs）」は既存前提の書き方 → **新規作成**であることを明記して改訂。
- lint/format 基盤は **Biome**。CI に `node scripts/lint-forbidden.mjs` ステップを追加する形で組み込む。

## F. README・llms.txt（LLMO 雛形）

- README は日本語＋英語混在・**保証/誇大表現なし**・「診断・評価・編集可能な成果物に徹し、自動公開・最終コンテンツ生成はしない」と明記。manifesto ハブへの導線あり。Packages 節・Web UI 節・BYOK 一文あり。→ 新リポの README 雛形として踏襲可能。
- **llms.txt は存在しない**（ルート・web/public いずれにも無し）。指示書§3の llms.txt は **新規**。「単一ソースから生成」する仕組みは mos-seo に無いので、creative 側で新規設計。

## G. ブランド色（指示書「3値のみ」と要調整）

- 実体（`packages/web/src/lib/theme.ts` / `tailwind.config.ts`）は **3値＋セマンティック拡張**:
  - コア3値: indigo `#5957EE` / slate `#0A2540` / white `#FFFFFF`
  - 拡張: indigoLight `#EEEEFE` / slateMuted `#425466` / border `#E6E9EC` / success `#1A9D62` / warning `#C77700` / danger `#DF1B41`
- 指示書§2-7「使用色は3値のみ」は mos-seo 実態と差異あり。creative は **draft/approved/archived ステータス**と**ガードフラグ表示**を持つため、success/warning/danger が機能的に必要。
  - 決定: 指示書§0の「差異があれば§0監査で確認し Organization として統一」に従い、**mos-seo の `theme.ts` パレットをそのまま採用**（コア3値＋セマンティック）。指示書§2-7の「3値のみ」は「コアブランド3値＋mos-seo準拠のセマンティック色」に改訂。旧ブランド2値（#1a1a1a/#0052cc）不使用は維持。

## H. 本体（private）側の監査 — 実行不能（制約として記録）

指示書§0 ステップ5〜7（本体 `yamaguchitakehiro0129/Marketing-OS` の CR1 v1.0 着手状況・Gemini 呼び出しパターン・positioning.ts）は **本セッションで実行不能**。

- 理由: `add_repo` の **cross-tier 制約** — 本セッションは `start-x-work` オーナー起点のため、別オーナー（`yamaguchitakehiro0129`）配下の private リポを追加できない（v1 仕様）。前フェーズで確認済み。
- 影響と回避:
  - ステップ5（CR1 v1.0 着手済みコードの退避）: 本体側の作業。指示書は「本体側 CR1 実装は**中止**」なので、退避対象の有無確認は本体セッションで実施。**mos-creative のOSS実装はこれに依存しない**。
  - ステップ6（Gemini 共通プロンプト）: 指示書が「公開リポに直接コピーしない・骨格のみ新規書き起こし」と規定 → 参照不可でも**新規書き起こしが前提**なので実装をブロックしない。
  - ステップ7（positioning.ts 英訳転用）: README/対外コピーの転用元。本体セッションで `positioning.ts` に原文追記→英訳転用（N1/C-2と同運用）。creative 初期実装は README を新規記述で先行し、確定コピーは後から差し替え可能。

---

## §0 で決めること（監査結果に基づく決定）

- [x] 構成: **monorepo（`packages/core` + `packages/web`、必要なら `packages/cli`）** を mos-seo と同型で採用。
- [x] ライセンス: **Apache-2.0**（＋NOTICE で導線保持）。※指示書「想定MIT」を改訂。
- [x] BYOKキー保存先: **sessionStorage**（`mos-seo` 準拠。指示書「localStorage」を改訂）。生成物・ブリーフ等の永続データは IndexedDB。
- [x] 私有リポの持ち出し範囲: **コード・プロンプト原文・業界別ナレッジ・顧客由来データは持ち出さない**。プロンプト骨格・ガード辞書は creative で新規書き起こし（本体セッションが無くても実装可）。
- [x] lint/format: **Biome**。禁止用語チェックは `scripts/lint-forbidden.mjs` を**新規作成**し CI に追加。
- [x] 色: **mos-seo `theme.ts` パレットを採用**（コア3値＋セマンティック）。指示書§2-7「3値のみ」を改訂。
- [ ] 本体 CR1 v1.0 着手済みコードの退避: **本体セッションで確認**（cross-tier のため本セッション不能）。

## 指示書 CR1 v2.0 → v2.1 要改訂リスト（audit before spec）

1. 参照リポ名: `start-x-work/mos-seo` → **`start-x-work/marketing-os-seo`**（monorepo。cli の publish 名が mos-seo）。
2. 構成: 「単一構成 or monorepo」→ **monorepo 確定**（packages/*、pnpm@9、tsup、Biome、Vitest）。
3. ライセンス: 想定MIT → **Apache-2.0 確定**。
4. §2-2 BYOK: localStorage → **sessionStorage**（キー保存）。永続データは IndexedDB。
5. §3/Section X 禁止用語 lint: 「単一ソース：lint-forbidden.mjs」→ **mos-seo に未存在。新規作成**する旨を明記。
6. §3 llms.txt: mos-seo に未存在 → **新規設計**。
7. §2-7 色「3値のみ」→ **mos-seo `theme.ts` パレット（3値＋セマンティック）採用**。旧2値不使用は維持。
8. （制約記録）§0 ステップ5〜7 の本体監査は cross-tier で本セッション不能 → **本体セッションで実施**。creative のOSS実装自体はブロックされない。

## 実装ブロッカー整理

- **技術ブロッカーなし**（monorepo scaffold・core schema・guard 辞書・web は本セッション/新セッションで実装可能。ただし新規リポ作成・npm publish・Pages deploy は外向きアクションのため要判断）。
- **ガバナンス・ゲート**: 指示書規定により、以下は着手/公開の前提:
  - audit before spec: **本監査で矛盾検出 → 指示書 v2.1 改訂が実装着手の前提**。
  - D-6（業態別チェックリスト初期版承認）・D-7（特許・商標リスク確認）: **公開（publish/deploy）前の必須ゲート**。ビルド自体は先行可。
  - 上書き記録（v1.0／統合メディア分析戦略書／本書の3箇所）: 着手前に記録。← 本体private文書のため本セッション不能。
