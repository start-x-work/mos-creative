import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-semibold">
            Marketing-OS <span className="text-indigo">Creative</span>
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/studio" className="hover:text-indigo">
              Studio
            </Link>
            <Link to="/settings" className="hover:text-indigo">
              設定
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl space-y-2 px-4 py-6 text-xs text-slate-muted">
          <p>
            キーも生成物も、あなたの手元から出ません（キー = sessionStorage、
            データ = IndexedDB、送信先 = Gemini API のみ）。
          </p>
          <p>
            表現ガードは気づきの提供であり、法的な審査に代わるものではありません。
            最終判断は人が行ってください。
          </p>
          <p>
            次を検討するなら:{" "}
            <a className="underline" href="https://marketing-os.jp">
              AI CMO
            </a>
            （継続的な観測と組み合わせる） ／{" "}
            <a className="underline" href="https://marketing-os.jp">
              BPO
            </a>
            （制作から実行ごと委ねる）。
          </p>
          <p>
            <a
              className="underline"
              href="https://github.com/start-x-work/manifesto"
            >
              Manifesto
            </a>{" "}
            · Apache-2.0
          </p>
        </div>
      </footer>
    </div>
  );
}
