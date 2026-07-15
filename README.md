# Marketing-OS Creative

生成は自分のキーで。検査はその場で。決めるのは人。——日本の実務のためのクリエイティブ制作支援 OSS。

Generate with your own key. Review in place. A human decides. — a creative-production support OSS built for real-world Japanese practice.

思想・境界線は **[manifesto](https://github.com/start-x-work/manifesto)** を参照。本ツールは診断・生成の下書き・表現の気づき・人による承認に徹し、外部への投稿・入稿・予約配信は行わない。

The Manifesto explains the philosophy and boundary. This tool is limited to drafting, in-place review, and human approval. It never posts, submits, or schedules to any external service.

## 何をするか / What it does

- **ブリーフ起点の下書き生成** — 広告コピー / LP 見出し / SNS 投稿案 / メール / 記事構成＋本文を、ブリーフ（誰に・何を・どのトーンで）から生成する。
- **表現ガード（その場の気づき）** — 断定・保証・最上級・ステマ表記欠落・業態別（薬機/景表/金商 等）の観点を、生成と同じ画面でハイライトする。**代替表現の自動提示はしない**（書き換えは人がエディタで行う）。
- **承認証跡** — `draft → approved → archived`。承認にはガードフラグの確認と承認者名の入力が必須。無人承認の経路はない。
- **書き出し** — Markdown / CSV / Marketing-OS 連携 JSON。承認証跡を常に同梱。

Draft generation from a brief, in-place expression guard (highlight + points to check, **no auto-rewrite**), an approval trail that always requires a reviewer name and flag acknowledgement, and exports that always carry that trail.

## ローカルファースト・BYOK / Local-first, BYOK

- あなたの Gemini API キーはブラウザの **sessionStorage** にのみ保存され、Start-X のサーバへは送信されません。
- 生成物・ブリーフ・承認証跡・ブランドプロファイル・ガード辞書は **IndexedDB**（あなたの手元）に保存されます。
- ネットワークの送信先は **Gemini API のみ**。テレメトリはありません。バックエンドはありません（Cloudflare Pages 静的配信）。

Your key lives only in your browser's sessionStorage; your data lives in IndexedDB. The only network destination is the Gemini API. No telemetry, no backend.

> **免責 / Disclaimer:** 表現ガードは「気づきの提供」であり、**法的審査を代替するものではありません**。最終判断は人が行ってください。The expression guard surfaces points to check; it does not replace legal review.

## パッケージ / Packages

- `packages/core` — `@start-x-work/mos-creative`: ブリーフスキーマ・プロンプト骨格・ガード辞書・書き出しフォーマット（ライブラリ）。
- `packages/web` — Cloudflare Pages 上の Web UI（このライブラリの最初の利用者）。

## 開発 / Development

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint && pnpm lint:forbidden
```

Web UI:

```bash
pnpm --filter @start-x-work/mos-creative-web dev
```

## 次を検討しているなら / If you are considering what's next

継続的な観測と組み合わせるなら **AI CMO**。制作から実行ごと委ねるなら **BPO**。— どちらも [marketing-os.jp](https://marketing-os.jp)。

Pair it with ongoing observation via **AI CMO**, or hand off production and execution via **BPO** — both at [marketing-os.jp](https://marketing-os.jp).

## License

Apache-2.0. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
