import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Label } from "../components/ui/Field";
import { type AiKeys, loadAiKeys, saveAiKeys } from "../lib/ai-settings";

export function Settings() {
  const [keys, setKeys] = useState<AiKeys>(loadAiKeys());
  const [saved, setSaved] = useState(false);

  function save() {
    saveAiKeys(keys);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">設定 — BYOK</h1>
      <Card>
        <Label>Gemini API キー</Label>
        <Input
          type="password"
          value={keys.gemini ?? ""}
          onChange={(e) => setKeys({ gemini: e.target.value })}
          placeholder="AIza..."
        />
        <p className="mt-2 text-xs text-slate-muted">
          キーはこのブラウザの sessionStorage
          にのみ保存され、タブを閉じると消えます。 Start-X
          のサーバへは送信されません。送信先は Gemini API のみです。
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={save}>保存</Button>
          {saved && <span className="text-xs text-success">保存しました</span>}
        </div>
      </Card>
    </div>
  );
}
