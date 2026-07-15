import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function Home() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">
          生成は自分のキーで。検査はその場で。決めるのは人。
        </h1>
        <p className="max-w-2xl text-sm text-slate-muted">
          ブリーフから下書きを作り、同じ画面で表現の観点をハイライトし、人の承認証跡を
          添えて書き出す——日本の実務のためのクリエイティブ制作支援
          OSS。投稿・入稿・ 予約配信は行いません。
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <h2 className="mb-1 font-medium">1. ブリーフ</h2>
          <p className="text-sm text-slate-muted">
            誰に・何を・どのトーンで。数値は事実欄に入れたものだけを使います。
          </p>
        </Card>
        <Card>
          <h2 className="mb-1 font-medium">2. 生成 → 検査</h2>
          <p className="text-sm text-slate-muted">
            下書きを生成し、断定・保証・最上級・ステマ観点などをその場で確認。
          </p>
        </Card>
        <Card>
          <h2 className="mb-1 font-medium">3. 承認 → 書き出し</h2>
          <p className="text-sm text-slate-muted">
            承認者名とフラグ確認で承認。証跡を同梱して書き出します。
          </p>
        </Card>
      </div>
      <Link to="/studio">
        <Button>Studio を開く</Button>
      </Link>
    </div>
  );
}
