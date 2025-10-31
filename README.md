# SettleMate

SettleMate は、グループでの支出を簡単に管理し、精算を自動化する Web アプリケーションです。友達や家族との旅行、飲み会、共同生活などのシーンで、誰がいくら払ったかを記録し、公平な精算をサポートします。

## 🚀 主な機能

### グループ管理

- **グループ作成**: 新しいグループを作成し、メンバーを招待
- **招待コード**: 安全な招待コードでメンバーをグループに追加
- **メンバー管理**: グループメンバーの追加・管理

### 支出管理

- **支出記録**: 誰が何にいくら使ったかを簡単に記録
- **均等割り**: グループメンバーで自動的に均等分割
- **参加者限定**: 特定のメンバーのみで支出を分割可能
- **手動割り**: 金額を個別に指定して分割

### 精算機能

- **自動計算**: 誰が誰にいくら支払うべきかを自動計算
- **精算記録**: 支払い完了を記録して残高をクリア
- **残高可視化**: グループ内の借金・貸し借りをグラフで表示

### ユーザー機能

- **認証**: NextAuth.js を使用した安全なログイン
- **プロフィール**: ユーザー情報の管理
- **支払い方法**: 対応する支払い方法の設定

## 🛠️ 技術スタック

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel
- **Charts**: React Flow, Dagre.js

## 📋 前提条件

- Node.js 18+
- pnpm
- PostgreSQL

## 🚀 ローカル開発環境のセットアップ

1. **リポジトリをクローン**

```bash
git clone https://github.com/is0692vs/settlemate.git
cd settlemate
```

2. **依存関係のインストール**

```bash
pnpm install
```

3. **環境変数の設定**

`.env`ファイルを作成し、以下の変数を設定してください：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/settlemate"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. **データベースのセットアップ**

```bash
# Prismaクライアントの生成
pnpm prisma generate

# データベースマイグレーション
pnpm tsx scripts/run-migrations.ts
```

5. **開発サーバーの起動**

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 📁 プロジェクト構造

```
settlemate/
├── app/                    # Next.js App Router
│   ├── api/               # APIエンドポイント
│   ├── auth/              # 認証ページ
│   ├── dashboard/         # ダッシュボード
│   └── groups/            # グループ関連ページ
├── components/            # Reactコンポーネント
│   ├── auth/              # 認証関連コンポーネント
│   ├── expenses/          # 支出関連コンポーネント
│   ├── groups/            # グループ関連コンポーネント
│   ├── settlements/       # 精算関連コンポーネント
│   └── ui/                # UIコンポーネント
├── lib/                   # ユーティリティ関数
│   ├── prisma.ts          # Prismaクライアント
│   ├── auth.ts            # NextAuth設定
│   └── utils/             # ヘルパー関数
├── prisma/                # データベーススキーマ
│   ├── schema.prisma      # Prismaスキーマ
│   └── migrations/        # データベースマイグレーション
└── public/                # 静的ファイル
```

## 🧪 テスト

```bash
# 型チェック
pnpm typecheck

# ESLint
pnpm lint

# ビルドテスト
pnpm build
```

## 🚀 デプロイ

このプロジェクトは Vercel へのデプロイを推奨しています。

1. [Vercel](https://vercel.com) にアカウントを作成
2. リポジトリを Vercel に接続
3. 環境変数を設定
4. デプロイ

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

This project is private and all rights reserved.

## 📞 サポート

バグ報告や機能リクエストは、GitHub Issues をご利用ください。
