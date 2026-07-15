import {
  ApprovalError,
  approveRecord,
  type Brief,
  buildPrompt,
  type CreativeRecord,
  emptyBrief,
  type Format,
  type GuardReport,
  resolveRuleSets,
  runGuard,
  toBackup,
  toCsv,
  toMarkdown,
  toMarketingOsJson,
} from "@start-x-work/mos-creative";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Label, Textarea } from "../components/ui/Field";
import { loadAiKeys } from "../lib/ai-settings";
import { DEFAULT_MODEL, generateText } from "../lib/gemini";
import { putRecord } from "../storage/db";

const FORMATS: Format[] = [
  "ad_copy",
  "lp_hero",
  "sns_post",
  "email",
  "article",
];
const GUARD_SETS = ["general", "cosmetics", "health_food", "finance"] as const;

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function Studio() {
  const [brief, setBrief] = useState<Brief>(emptyBrief("ad_copy"));
  const [draft, setDraft] = useState("");
  const [guard, setGuard] = useState<GuardReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [approver, setApprover] = useState("");
  const [flagsAck, setFlagsAck] = useState(false);
  const [record, setRecord] = useState<CreativeRecord | null>(null);

  function patch(p: Partial<Brief>) {
    setBrief((b) => ({ ...b, ...p }));
    setRecord(null);
  }

  async function onGenerate() {
    setError("");
    setBusy(true);
    setRecord(null);
    try {
      const key = loadAiKeys().gemini ?? "";
      const text = await generateText(buildPrompt(brief), key, DEFAULT_MODEL);
      setDraft(text);
      runReview(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function runReview(text: string) {
    const sets = resolveRuleSets(brief.constraints.industryGuardSet);
    setGuard(runGuard(text, sets, brief.tone.ngWords));
  }

  function onApprove() {
    setError("");
    if (!guard) {
      setError("先に生成・検査を実行してください。");
      return;
    }
    const base: CreativeRecord = {
      id: crypto.randomUUID(),
      brief,
      generation: {
        id: crypto.randomUUID(),
        briefId: brief.product.name || "brief",
        text: draft,
        model: DEFAULT_MODEL,
        createdAt: new Date().toISOString(),
      },
      status: "draft",
      guard,
    };
    try {
      const approved = approveRecord(base, {
        approver,
        flagsAcknowledged: flagsAck,
        guard,
        approvedAt: new Date().toISOString(),
      });
      setRecord(approved);
      void putRecord(approved);
    } catch (e) {
      if (e instanceof ApprovalError) setError(e.message);
      else throw e;
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Brief */}
      <Card className="space-y-3">
        <h2 className="font-semibold">1. ブリーフ</h2>
        <div>
          <Label>商品名</Label>
          <Input
            value={brief.product.name}
            onChange={(e) =>
              patch({ product: { ...brief.product, name: e.target.value } })
            }
          />
        </div>
        <div>
          <Label>商品概要</Label>
          <Input
            value={brief.product.summary}
            onChange={(e) =>
              patch({ product: { ...brief.product, summary: e.target.value } })
            }
          />
        </div>
        <div>
          <Label>対象（ペルソナ）</Label>
          <Input
            value={brief.audience.persona}
            onChange={(e) =>
              patch({
                audience: { ...brief.audience, persona: e.target.value },
              })
            }
          />
        </div>
        <div>
          <Label>訴求 KBF（カンマ区切り）</Label>
          <Input
            value={brief.kbf.join(", ")}
            onChange={(e) =>
              patch({
                kbf: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>フォーマット</Label>
            <select
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={brief.format}
              onChange={(e) => patch({ format: e.target.value as Format })}
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>業態ガード</Label>
            <select
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={brief.constraints.industryGuardSet}
              onChange={(e) =>
                patch({
                  constraints: {
                    ...brief.constraints,
                    industryGuardSet: e.target
                      .value as Brief["constraints"]["industryGuardSet"],
                  },
                })
              }
            >
              {GUARD_SETS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label>語調 / トーン</Label>
          <Input
            value={brief.tone.voice}
            placeholder="誠実・簡潔 など"
            onChange={(e) =>
              patch({ tone: { ...brief.tone, voice: e.target.value } })
            }
          />
        </div>
        <div>
          <Label>NG ワード（カンマ区切り）</Label>
          <Input
            value={brief.tone.ngWords.join(", ")}
            onChange={(e) =>
              patch({
                tone: {
                  ...brief.tone,
                  ngWords: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                },
              })
            }
          />
        </div>
        <div>
          <Label>事実（数値・実績はここに入れたものだけを使用。1行1件）</Label>
          <Textarea
            rows={3}
            value={brief.grounding.facts.join("\n")}
            onChange={(e) =>
              patch({
                grounding: {
                  facts: e.target.value.split("\n").filter(Boolean),
                },
              })
            }
          />
        </div>
        <Button onClick={onGenerate} disabled={busy}>
          {busy ? "生成中..." : "生成する"}
        </Button>
        {error && <p className="text-xs text-danger">{error}</p>}
      </Card>

      {/* Right: Draft + Guard + Approve */}
      <div className="space-y-6">
        <Card className="space-y-3">
          <h2 className="font-semibold">2. 下書き（編集可）</h2>
          <Textarea
            rows={8}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setRecord(null);
            }}
            placeholder="生成された下書きがここに表示されます。人が仕上げます。"
          />
          <Button
            variant="secondary"
            onClick={() => runReview(draft)}
            disabled={!draft}
          >
            この内容を再検査
          </Button>
        </Card>

        <Card className="space-y-2">
          <h2 className="font-semibold">
            3. 表現ガード（気づき・書き換えはしません）
          </h2>
          {!guard && <p className="text-sm text-slate-muted">未検査です。</p>}
          {guard && guard.findings.length === 0 && (
            <p className="text-sm text-success">
              辞書上の該当はありません（最終判断は人が行ってください）。
            </p>
          )}
          {guard && guard.findings.length > 0 && (
            <ul className="space-y-2 text-sm">
              {guard.findings.map((f) => (
                <li
                  key={`${f.set}-${f.ruleId}-${f.index}-${f.match}`}
                  className="rounded-lg border border-border p-2"
                >
                  <span
                    className={
                      f.severity === "warning"
                        ? "font-medium text-warning"
                        : "font-medium text-slate-muted"
                    }
                  >
                    [{f.severity}] {f.match ? `「${f.match}」` : "全体"} (
                    {f.set}/{f.ruleId})
                  </span>
                  <p className="text-slate-muted">{f.point}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="font-semibold">4. 承認（人のみ）</h2>
          <div>
            <Label>承認者名</Label>
            <Input
              value={approver}
              onChange={(e) => setApprover(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={flagsAck}
              onChange={(e) => setFlagsAck(e.target.checked)}
            />
            ガードのフラグを確認しました
          </label>
          <Button onClick={onApprove} disabled={!draft}>
            承認する
          </Button>
          {record?.status === "approved" && (
            <p className="text-xs text-success">
              承認済み: {record.approval?.approver} @{" "}
              {record.approval?.approvedAt}
            </p>
          )}
        </Card>

        {record?.status === "approved" && (
          <Card className="space-y-2">
            <h2 className="font-semibold">5. 書き出し（証跡を同梱）</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  download(
                    `${record.id}.md`,
                    toMarkdown(record),
                    "text/markdown",
                  )
                }
              >
                Markdown
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  download(`${record.id}.csv`, toCsv([record]), "text/csv")
                }
              >
                CSV
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  download(
                    `${record.id}.marketing-os.json`,
                    JSON.stringify(toMarketingOsJson(record), null, 2),
                    "application/json",
                  )
                }
              >
                Marketing-OS JSON
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  download(
                    "mos-creative-backup.json",
                    JSON.stringify(toBackup([record]), null, 2),
                    "application/json",
                  )
                }
              >
                バックアップ
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
