# Shiki Syntax Highlighting

このプロジェクトでは、Shikiを使用してコードブロックのシンタックスハイライトを実装しています。

## 機能

### 1. デュアルテーマサポート
- **Light Mode**: `github-light` テーマ
- **Dark Mode**: `github-dark` テーマ
- サイトのテーマ設定（light/dark）に応じて自動的に切り替わります

### 2. コピーボタン
- 各コードブロックにコピーボタンが表示されます
- マウスホバー時にボタンが表示されます
- クリックするとコードがクリップボードにコピーされます
- コピー成功時にチェックマークアイコンが2秒間表示されます

### 3. 対応コンテンツ
- **MDXコンテンツ（Contentlayer）**: `rehype-pretty-code`を使用して自動的にハイライト
- **microCMSコンテンツ**: サーバーサイドで`lib/shiki-highlighter.ts`を使用してハイライト

## 実装の詳細

### MDXコンテンツ（Contentlayer）
`contentlayer.config.ts`でrehype-pretty-codeプラグインを設定:

```typescript
[
  rehypePrettyCode,
  {
    theme: {
      dark: 'github-dark',
      light: 'github-light',
    },
    keepBackground: false,
  },
]
```

### microCMSコンテンツ
`lib/shiki-highlighter.ts`でHTMLコンテンツ内のコードブロックを検出し、Shikiでハイライト:

- `<pre><code class="language-xxx">...</code></pre>` 形式を検出
- HTMLエンティティをデコード
- Shikiでハイライト処理
- デュアルテーマに対応した出力を生成

### コピーボタンコンポーネント
- `components/Pre.tsx`: コードブロックのラッパーコンポーネント
- `components/CopyButton.tsx`: コピーボタンのUI実装
- `lucide-react`のアイコンを使用

### スタイリング
`css/shiki.css`でShiki用のカスタムスタイルを定義:

- コードブロックの基本スタイル
- コピーボタンの配置とホバー効果
- インラインコードのスタイル
- テーマ別の背景色

## 使用方法

### MDXファイルでの使用

```markdown
\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`
```

### microCMSでの使用
microCMSのリッチエディタでコードブロックを作成すると、自動的にShikiでハイライトされます。

## 参考資料
- [Shiki公式サイト](https://shiki.style/)
- [rehype-pretty-code](https://rehype-pretty-code.netlify.app/)
- [Shiki Dual Themes ドキュメント](https://shiki.style/guide/dual-themes)
