# デプロイメントガイド

## 概要

このドキュメントでは、SettleMateを本番環境にデプロイする方法を説明します。推奨プラットフォームはVercelですが、他のプラットフォームでもデプロイ可能です。

## Vercelへのデプロイ（推奨）

Vercelは、Next.jsアプリケーションのホスティングに最適化されており、最も簡単にデプロイできます。

### 前提条件

- GitHubアカウント
- Vercelアカウント（[vercel.com](https://vercel.com)で無料登録）
- PostgreSQLデータベース（Vercel Postgresまたは他のプロバイダー）

### デプロイ手順

#### 1. GitHubリポジトリの準備

リポジトリがGitHubにプッシュされていることを確認してください。

```bash
git remote -v
git push origin main
```

#### 2. Vercelプロジェクトの作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 「Add New...」→「Project」を選択
3. GitHubリポジトリ「settlemate」をインポート
4. フレームワークプリセット: **Next.js** が自動選択される
5. 「Deploy」をクリック（環境変数は後で設定）

#### 3. データベースのセットアップ

##### オプション1: Vercel Postgres（推奨）

1. Vercelダッシュボードでプロジェクトを開く
2. 「Storage」タブに移動
3. 「Create Database」→「Postgres」を選択
4. データベース名を入力して作成
5. 自動的に環境変数が設定される

##### オプション2: 外部PostgreSQL

Neon、Supabase、AWS RDSなどのPostgreSQLサービスを使用する場合:

1. データベースを作成
2. 接続文字列を取得
3. Vercelの環境変数に設定（次のステップを参照）

#### 4. 環境変数の設定

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Environment Variables」に移動
3. 以下の環境変数を追加:

```env
# データベース（Vercel Postgres使用時は自動設定）
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
AUTH_SECRET=your-random-secret-key
AUTH_URL=https://your-domain.vercel.app
```

**重要な注意事項**:
- `AUTH_SECRET`: セキュアなランダム文字列（`openssl rand -base64 32`で生成）
- `AUTH_URL`: デプロイ後の実際のURL
- すべての環境変数を「Production」「Preview」「Development」に設定

#### 5. Google OAuth設定の更新

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 既存のOAuthクライアントIDを編集
3. 「承認済みのリダイレクトURI」に本番URLを追加:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```
4. 保存

#### 6. データベースマイグレーション

環境変数が設定されたら、データベースマイグレーションを実行します。

##### 方法1: ビルド時に自動実行（設定済み）

`package.json`のbuildスクリプトで自動的にマイグレーションが実行されます:

```json
{
  "scripts": {
    "build": "pnpm tsx scripts/run-migrations.ts && prisma generate && next build --turbopack"
  }
}
```

Vercelで再デプロイすると自動的にマイグレーションが実行されます。

##### 方法2: ローカルから実行

```bash
# 本番データベースのURLを環境変数に設定
export DATABASE_URL="postgresql://..."

# マイグレーションを実行
pnpm prisma migrate deploy
```

#### 7. デプロイの確認

1. Vercelダッシュボードで「Deployments」タブを確認
2. デプロイが成功したら、URLにアクセス
3. Googleでログインして動作確認

#### 8. カスタムドメインの設定（オプション）

1. Vercelダッシュボードで「Settings」→「Domains」に移動
2. カスタムドメインを追加
3. DNSレコードを設定（Vercelの指示に従う）
4. `AUTH_URL`環境変数を更新
5. Google OAuthのリダイレクトURIを更新

---

## 他のプラットフォームへのデプロイ

### Netlify

1. Netlifyにリポジトリを接続
2. ビルドコマンド: `pnpm build`
3. 公開ディレクトリ: `.next`
4. 環境変数を設定
5. Netlify Pluginで`@netlify/plugin-nextjs`をインストール

### Dockerでのデプロイ

#### Dockerfileの作成

```dockerfile
FROM node:20-alpine AS base

# 依存関係のインストール
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# ビルド
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && \
    pnpm prisma generate && \
    pnpm build

# 本番イメージ
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose.ymlの作成

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - AUTH_SECRET=${AUTH_SECRET}
      - AUTH_URL=${AUTH_URL}
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=settlemate
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=settlemate
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres-data:
```

#### デプロイコマンド

```bash
docker-compose up -d
```

---

## CI/CDの設定

### GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type check
        run: pnpm typecheck
      
      - name: Lint
        run: pnpm lint
      
      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**Secrets設定**:
1. GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」
2. 必要な環境変数をSecretsとして追加

---

## 本番環境のモニタリング

### Vercel Analytics

Vercelプロジェクトで自動的に有効化されます。

- パフォーマンス指標
- 訪問者数
- ページビュー

### エラートラッキング（推奨）

#### Sentryの設定

1. [Sentry](https://sentry.io)でプロジェクトを作成
2. Next.js SDKをインストール:
   ```bash
   pnpm add @sentry/nextjs
   ```
3. 設定ファイルを生成:
   ```bash
   npx @sentry/wizard -i nextjs
   ```
4. 環境変数を追加:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
   ```

### ログ管理

Vercelのダッシュボードで以下のログを確認できます:

- ビルドログ
- 関数ログ（API Routes）
- エッジログ

---

## パフォーマンス最適化

### 本番ビルドの最適化確認

```bash
pnpm build
```

ビルド出力で以下を確認:

- ページサイズ
- First Load JS（初回ロード時のJSサイズ）
- Static（静的生成されたページ）
- Server（サーバーレンダリングのページ）

### 画像最適化

Next.jsの`Image`コンポーネントを使用すると、Vercelが自動的に画像を最適化します。

### キャッシング戦略

```typescript
// app/layout.tsx
export const revalidate = 3600; // 1時間ごとに再検証
```

---

## セキュリティ

### 環境変数の保護

- ✅ `.env.local`を`.gitignore`に追加
- ✅ 本番環境の環境変数はVercelのダッシュボードで管理
- ❌ 環境変数をコードにハードコーディングしない

### HTTPS

Vercelは自動的にHTTPSを有効化します。カスタムドメインでも無料のSSL証明書が発行されます。

### セキュリティヘッダー

`next.config.js`でセキュリティヘッダーを設定:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};
```

---

## バックアップとリストア

### データベースバックアップ

#### Vercel Postgres

Vercelダッシュボードからバックアップを手動で作成できます。

#### 手動バックアップ

```bash
# ダンプを作成
pg_dump $DATABASE_URL > backup.sql

# リストア
psql $DATABASE_URL < backup.sql
```

#### 自動バックアップ

多くのPostgreSQLプロバイダーは自動バックアップをサポートしています。

---

## トラブルシューティング

### デプロイが失敗する

**ビルドエラー**:
```bash
# ローカルで本番ビルドをテスト
pnpm build
```

**環境変数が設定されていない**:
- Vercelダッシュボードで環境変数を確認
- `DATABASE_URL`が正しく設定されているか確認

### 認証が動作しない

1. `AUTH_URL`が正しいか確認
2. Google Cloud ConsoleのリダイレクトURIが正しいか確認
3. `AUTH_SECRET`が設定されているか確認

### データベース接続エラー

1. `DATABASE_URL`が正しいか確認
2. `?sslmode=require`が接続文字列に含まれているか確認
3. データベースサーバーが稼働しているか確認
4. ファイアウォール設定を確認

### マイグレーションエラー

```bash
# ローカルからマイグレーションを実行
export DATABASE_URL="your-production-database-url"
pnpm prisma migrate deploy
```

---

## スケーリング

### Vercelでの自動スケーリング

Vercelは以下を自動的にスケーリングします:

- 関数（API Routes）
- エッジ関数
- 静的アセット

### データベースのスケーリング

#### 接続プール

Prismaは自動的に接続プールを管理します。

#### Read Replica

将来的に読み取り負荷が高い場合は、Read Replicaの使用を検討してください。

```typescript
// 読み取り専用のPrismaクライアント
const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_URL,
    },
  },
});
```

---

## メンテナンス

### ゼロダウンタイムデプロイ

Vercelは自動的にゼロダウンタイムデプロイを実現します:

1. 新しいバージョンがビルドされる
2. ヘルスチェックが成功したら切り替え
3. 古いバージョンは段階的に削除

### ロールバック

デプロイに問題がある場合:

1. Vercelダッシュボードで「Deployments」タブを開く
2. 以前の正常なデプロイを選択
3. 「Promote to Production」をクリック

---

## チェックリスト

デプロイ前に以下を確認してください:

- [ ] すべての環境変数が設定されている
- [ ] Google OAuthのリダイレクトURIが更新されている
- [ ] データベースマイグレーションが完了している
- [ ] ローカルで本番ビルドをテスト済み
- [ ] セキュリティヘッダーが設定されている
- [ ] エラートラッキング（Sentry等）が設定されている
- [ ] カスタムドメインが設定されている（オプション）
- [ ] バックアップ戦略が確立されている

---

## 参考資料

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

デプロイに成功したら、ぜひSettleMateを活用してください！🚀
