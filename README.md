# SettleMate

**割り勘・立て替え管理アプリ**

SettleMateは、友人やグループでの支出を簡単に管理できるWebアプリケーションです。旅行、飲み会、イベントなど、複数人での支払いを記録し、自動的に清算額を計算します。

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## 📱 主な機能

### ✅ 実装済み機能

- **👥 グループ管理**
  - グループの作成・編集・削除
  - 招待コードによるメンバー追加
  - グループアイコン設定（絵文字対応）

- **💰 支出管理**
  - 支出の登録・編集・削除
  - 均等割りと手動借金登録の2つの分割方式
  - 支出履歴の閲覧

- **📊 残高管理**
  - グループ内メンバー間の貸借関係を自動計算
  - グラフによる可視化（ReactFlow使用）
  - 誰が誰にいくら払うべきかを明確に表示

- **💳 清算機能**
  - 現金、銀行振込、PayPay、LINE Payなど複数の決済方法に対応
  - 清算履歴の記録
  - 清算後の残高自動更新

- **🔐 認証**
  - Google OAuth 2.0によるログイン
  - NextAuth.js v5使用

- **📱 PWA対応**
  - スマートフォンのホーム画面に追加可能
  - オフライン動作対応（一部機能）
  - プッシュ通知対応（将来実装予定）

### 🚧 今後実装予定の機能

- 支出の統計分析
- エクスポート機能（CSV、PDF）
- 通知機能
- 多言語対応

## 🚀 クイックスタート

### 前提条件

- Node.js 20以上
- pnpm 8以上（推奨）
- PostgreSQLデータベース

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/is0692vs/settlemate.git
cd settlemate

# 依存関係をインストール
pnpm install

# 環境変数を設定
cp .env.example .env.local
# .env.localを編集して必要な環境変数を設定

# データベースのマイグレーション
pnpm prisma migrate dev

# 開発サーバーを起動
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### 必要な環境変数

```env
# データベース
DATABASE_URL="postgresql://user:password@localhost:5432/settlemate"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# NextAuth
AUTH_SECRET="your-secret-key"  # openssl rand -base64 32 で生成
AUTH_URL="http://localhost:3000"  # 本番環境では実際のURLを設定
```

## 📚 ドキュメント

- [開発者ガイド](docs/DEVELOPMENT.md) - 開発環境のセットアップと開発フロー
- [アーキテクチャ](docs/ARCHITECTURE.md) - システム構成と技術スタック
- [API仕様書](docs/API.md) - REST API リファレンス
- [デプロイメントガイド](docs/DEPLOYMENT.md) - 本番環境へのデプロイ手順
- [ユーザーガイド](docs/USER_GUIDE.md) - エンドユーザー向け使い方ガイド

### 個別ドキュメント

- [支出API](docs/EXPENSE_API.md) - 支出管理APIの詳細
- [PWA対応](docs/PWA.md) - Progressive Web App機能について
- [データベースマイグレーション](MIGRATIONS.md) - Prismaマイグレーション手順

## 🛠️ 技術スタック

### フロントエンド

- **フレームワーク**: Next.js 15.5 (App Router)
- **言語**: TypeScript 5
- **スタイリング**: Tailwind CSS 4
- **UI Components**: React 19
- **グラフ可視化**: ReactFlow
- **フォーム**: React Hook Form + Zod

### バックエンド

- **ランタイム**: Node.js
- **API**: Next.js API Routes
- **ORM**: Prisma 6.17
- **データベース**: PostgreSQL
- **認証**: NextAuth.js v5

### インフラ・デプロイ

- **ホスティング**: Vercel
- **データベース**: Vercel Postgres（推奨）
- **CI/CD**: GitHub Actions
- **PWA**: @ducanh2912/next-pwa

## 📖 使い方

### 1. グループを作成

ダッシュボードから「グループ管理」→「新規グループ作成」を選択し、グループ名とアイコンを設定します。

### 2. メンバーを招待

グループ詳細画面で表示される招待リンクを共有するか、招待コードをメンバーに伝えます。

### 3. 支出を記録

グループ内で「支出を追加」から、誰がいくら支払ったか、参加者は誰かを入力します。

### 4. 残高を確認

グループ詳細画面で、誰が誰にいくら払うべきかが自動計算されます。グラフで視覚的に確認できます。

### 5. 清算する

「清算する」ボタンから、実際に支払った金額と決済方法を記録します。残高が自動的に更新されます。

詳しい使い方は[ユーザーガイド](docs/USER_GUIDE.md)を参照してください。

## 🧪 テスト

```bash
# 型チェック
pnpm typecheck

# Lintチェック
pnpm lint

# ビルド確認
pnpm build
```

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは[MIT License](LICENSE)の下でライセンスされています。

## 👤 作者

**is0692vs**

## 🙏 謝辞

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [ReactFlow](https://reactflow.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
