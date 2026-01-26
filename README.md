# Kodama Blog

Next.js(App Router) + Tailwind CSS + Contentlayer を使ったブログプロジェクト。

## ディレクトリ構造(主要)

- `app/` ルーティング/ページ/レイアウト(App Router)
- `components/` 再利用可能なUI
- `layouts/` 記事・ページ用のレイアウト
- `data/` サイト設定・ナビ・記事/著者データ
- `lib/` ユーティリティ/共通処理
- `public/` 静的ファイル
- `css/` グローバルCSS
- `scripts/` ビルド後処理など
- `contentlayer.config.ts` Contentlayer設定

## 環境構築

1. Node.js(LTS推奨) を準備
2. 依存関係の導入

```bash
pnpm install
```

3. 開発サーバ起動

```bash
pnpm run dev
```

その他のコマンド:

```bash
pnpm run build   # 本番ビルド
pnpm run serve   # 本番サーバ起動
pnpm run lint    # Lint
```

- start: next devで開発サーバ起動。
- dev: cross-env INIT_CWD=$PWDを付けて開発サーバ起動。
- build: next build後にpostbuild.mjs実行（JSON modules有効化）。
- serve: next startで本番サーバ起動。
- analyze: ANALYZE=trueでビルドしバンドル解析。
- lint: 対象ディレクトリにnext lint --fix。
- prepare: huskyセットアップ。

git commit時のeslintは、Huskyのpre-commitフックからlint-stagedが走り、lint-staged設定でeslint --fixが実行されています。

- package.json
- .husky/pre-commit

## ページ構成(App Router)

- ルート: `app/page.tsx`
- ルートレイアウト: `app/layout.tsx`
- 主要ページ:
  - `app/about/` About
  - `app/blog/` Blog一覧/詳細
  - `app/projects/` Projects
  - `app/draft/` Draft
- API: `app/api/`
- 生成系:
  - `app/sitemap.ts`
  - `app/robots.ts`
  - `app/seo.tsx`

## データ取得

- SSR(サーバ側レンダリング)時は microCMS からコンテンツをフェッチします
- microCMS が無効/失敗時は Contentlayer にフォールバックします
