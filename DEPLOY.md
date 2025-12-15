# デプロイ手順

## Vercelへのデプロイ（推奨）

VercelはNext.jsの開発元が提供するプラットフォームで、最も簡単にデプロイできます。

### 1. GitHubにリポジトリを作成

1. GitHubにログイン
2. 新しいリポジトリを作成（例: `pdf-tools`）
3. ローカルで以下のコマンドを実行：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/pdf-tools.git
git push -u origin main
```

### 2. Vercelに接続

1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでログイン
3. "Add New Project"をクリック
4. 作成したリポジトリを選択
5. 設定を確認（通常は自動検出されます）：
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. "Deploy"をクリック

### 3. デプロイ完了

数分でデプロイが完了し、URLが発行されます。

## その他のデプロイオプション

### Netlify

1. [Netlify](https://www.netlify.com)にアクセス
2. GitHubリポジトリを接続
3. ビルド設定：
   - Build command: `npm run build`
   - Publish directory: `.next`

### セルフホスティング

```bash
# ビルド
npm run build

# 本番サーバー起動
npm start
```

## 注意事項

- 環境変数が必要な場合は、Vercelのダッシュボードで設定してください
- カスタムドメインを設定する場合は、Vercelの設定から追加できます


