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
npm install
```

3. 開発サーバ起動

```bash
npm run dev
```

その他のコマンド:

```bash
npm run build   # 本番ビルド
npm run serve   # 本番サーバ起動
npm run lint    # Lint
```

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
