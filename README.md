# PDF Tools

ブラウザ完結型のPDFユーティリティアプリケーション。すべての処理はクライアントサイドで完結し、サーバーにデータをアップロードすることはありません。

## 機能

- **PDF結合**: 複数のPDFファイルをアップロードし、ドラッグ&ドロップで順序を変更して結合
- **画像からPDF**: 画像ファイル（JPG/PNG）をPDFに変換・結合

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF処理**: pdf-lib, pdfjs-dist
- **UI**: Lucide React, @dnd-kit

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番サーバーの起動
npm start
```

## プロジェクト構造

```
src/
├── app/              # Next.js App Router
│   ├── page.tsx     # ダッシュボード
│   ├── merge/       # PDF結合ツール
│   └── image-to-pdf/ # 画像からPDF変換ツール
├── components/      # Reactコンポーネント
└── utils/          # ユーティリティ関数
```

## ライセンス

MIT
