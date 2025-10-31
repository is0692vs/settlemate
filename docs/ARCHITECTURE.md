# SettleMate アーキテクチャ

## 概要

SettleMateは、Next.js 15のApp Routerを使用したフルスタックWebアプリケーションです。モダンなReactの機能とサーバーサイドレンダリングを活用し、高速で使いやすいユーザー体験を提供します。

## システム構成図

```
┌─────────────────────────────────────────────────────────┐
│                        クライアント                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Browser    │  │  iOS Safari  │  │ Android PWA  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      Next.js App Router                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Pages (Server Components)                │  │
│  │  • Dashboard • Groups • Expenses • Settlements   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │               API Routes (Edge)                   │  │
│  │  • /api/expenses • /api/groups • /api/settlements│  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Authentication (NextAuth.js)           │  │
│  │              Google OAuth 2.0                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    Prisma ORM Layer                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Models: User, Group, Expense, Balance, Settlement│  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │       Tables: users, groups, expenses, etc.      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## ディレクトリ構造

```
settlemate/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes
│   │   ├── expenses/          # 支出管理API
│   │   ├── groups/            # グループ管理API
│   │   ├── settlements/       # 清算管理API
│   │   └── users/             # ユーザー管理API
│   ├── auth/                  # 認証関連ページ
│   ├── dashboard/             # ダッシュボード
│   │   ├── groups/           # グループ詳細・編集
│   │   └── profile/          # プロフィール設定
│   ├── groups/                # グループ参加
│   ├── layout.tsx             # ルートレイアウト
│   ├── page.tsx               # ホームページ
│   └── globals.css            # グローバルスタイル
├── components/                 # Reactコンポーネント
│   ├── balance/               # 残高表示コンポーネント
│   ├── expenses/              # 支出関連コンポーネント
│   ├── graphs/                # グラフ可視化コンポーネント
│   ├── groups/                # グループ関連コンポーネント
│   ├── profile/               # プロフィール関連コンポーネント
│   ├── settlements/           # 清算関連コンポーネント
│   └── ui/                    # 汎用UIコンポーネント
├── lib/                        # ユーティリティとライブラリ
│   ├── api/                   # API呼び出しヘルパー
│   ├── constants/             # 定数定義
│   ├── utils/                 # ユーティリティ関数
│   ├── validations/           # Zodバリデーションスキーマ
│   └── prisma.ts              # Prismaクライアント
├── prisma/                     # データベーススキーマとマイグレーション
│   ├── migrations/            # マイグレーションファイル
│   └── schema.prisma          # Prismaスキーマ定義
├── public/                     # 静的ファイル
│   ├── manifest.json          # PWAマニフェスト
│   └── icons/                 # アプリアイコン
├── scripts/                    # ビルド・デプロイスクリプト
├── docs/                       # ドキュメント
├── auth.ts                     # NextAuth設定
├── next.config.js             # Next.js設定
├── tailwind.config.js         # Tailwind CSS設定
└── tsconfig.json              # TypeScript設定
```

## 技術スタック詳細

### フロントエンド

#### Next.js 15 App Router

- **Server Components**: デフォルトでサーバーサイドレンダリング
- **Client Components**: インタラクティブな機能のみクライアント側で実行
- **Server Actions**: フォーム送信などのサーバー処理を簡潔に記述
- **Streaming SSR**: React Suspenseによる段階的なページ読み込み

#### React 19

- **Server Components**: サーバー側でのレンダリング
- **Concurrent Features**: 並行レンダリングによるパフォーマンス向上
- **Suspense**: 非同期処理の統一的な扱い

#### Tailwind CSS 4

- **Utility-First**: ユーティリティクラスベースのスタイリング
- **Responsive Design**: モバイルファーストの設計
- **Dark Mode**: ダークモード対応（将来実装予定）

#### ReactFlow

- **グラフ可視化**: 残高関係をノードとエッジで表現
- **インタラクティブ**: ドラッグ&ドロップ、ズーム機能
- **カスタムノード**: カスタムデザインのノード表示

### バックエンド

#### Next.js API Routes

- **RESTful API**: 標準的なHTTPメソッド（GET, POST, PATCH, DELETE）
- **Edge Runtime**: 高速なレスポンス（一部API）
- **Middleware**: 認証、バリデーション、エラーハンドリング

#### Prisma ORM

- **Type-Safe**: TypeScriptの型安全性
- **Migration**: データベーススキーマのバージョン管理
- **Query Builder**: 直感的なクエリ記述
- **Relations**: リレーションの自動解決

#### NextAuth.js v5

- **OAuth Providers**: Google認証
- **Session Management**: JWTベースのセッション管理
- **Database Adapter**: Prisma Adapterによるユーザー情報の永続化
- **Callbacks**: カスタム認証フロー

### データベース設計

#### ERD（Entity Relationship Diagram）

```
User ─────┐
│         │
│ 1     N │
│         │
Account   Session
          
User ─────┬─────────┬──────────┬──────────┐
│ 1      │ 1       │ 1        │ 1        │
│      N │       N │        N │        N │
│        │         │          │          │
GroupMember  Expense    Settlement    Balance
│            (paidBy)   (paidBy)      (userFrom)
│
│ N
│
│ 1
Group
```

#### 主要なテーブル

**User（ユーザー）**
- 認証情報とプロフィール
- 対応決済方法の設定

**Group（グループ）**
- グループ情報
- 招待コード

**GroupMember（グループメンバー）**
- ユーザーとグループの多対多の関連

**Expense（支出）**
- 支出の記録
- 参加者情報（JSON配列）
- 分割タイプ（均等割り/手動）

**Balance（残高）**
- ユーザー間の貸借関係
- グループごとに管理

**Settlement（清算）**
- 実際の支払い記録
- 決済方法

詳細なスキーマ定義は `prisma/schema.prisma` を参照してください。

## データフロー

### 1. 支出記録のフロー

```
1. ユーザーが支出フォームを入力
   ↓
2. Client Component → API Route (/api/expenses)
   ↓
3. バリデーション（Zod）
   ↓
4. データベースに支出を保存（Prisma）
   ↓
5. 残高（Balance）を自動計算・更新
   ├─ 均等割りの場合: amount / participants.length
   └─ 手動の場合: 指定された金額
   ↓
6. レスポンスをクライアントに返却
   ↓
7. UIを更新（revalidatePath）
```

### 2. 清算のフロー

```
1. ユーザーが清算フォームを入力
   ↓
2. Client Component → API Route (/api/settlements)
   ↓
3. バリデーション
   ↓
4. 残高の確認（不足していないか）
   ↓
5. トランザクション処理
   ├─ Settlementレコード作成
   └─ Balanceレコード更新（または削除）
   ↓
6. レスポンスをクライアントに返却
   ↓
7. UIを更新
```

### 3. 認証フロー

```
1. ユーザーが「Googleでログイン」ボタンをクリック
   ↓
2. Google OAuth画面にリダイレクト
   ↓
3. ユーザーが認証を許可
   ↓
4. NextAuth.jsがコールバックを受信
   ↓
5. ユーザー情報をデータベースに保存/更新
   ↓
6. JWTセッションを生成
   ↓
7. ダッシュボードにリダイレクト
```

## セキュリティ

### 認証・認可

- **NextAuth.js**: 業界標準の認証ライブラリ
- **OAuth 2.0**: Googleアカウントによる安全な認証
- **Session Management**: HTTPOnly Cookieによるセッション管理
- **CSRF Protection**: Next.jsの組み込みCSRF保護

### アクセス制御

- **グループメンバーシップチェック**: 各APIでメンバーであることを確認
- **支払い者権限**: 支出の編集・削除は支払い者のみ可能
- **Server-Side Validation**: すべての入力をサーバー側で検証

### データ保護

- **環境変数**: 機密情報は環境変数で管理
- **Database URL**: PostgreSQL接続文字列の保護
- **Prepared Statements**: Prismaによる自動的なSQLインジェクション対策

## パフォーマンス最適化

### Server Components

- 可能な限りServer Componentsを使用
- データフェッチをサーバー側で実行
- クライアントに送信するJavaScriptを最小化

### 画像最適化

- Next.js Image Componentの使用（将来実装予定）
- PWAアイコンの最適化

### バンドルサイズの最小化

- Tree Shaking: 未使用コードの除去
- Code Splitting: 自動的なコード分割
- Dynamic Import: 必要な時にのみロード

### キャッシング

- **React Cache**: Server Componentsでのデータキャッシュ
- **Revalidation**: revalidatePathによる効率的な更新
- **Service Worker**: PWAによるオフラインキャッシュ

## PWA（Progressive Web App）

### 機能

- **オフライン対応**: Service Workerによるキャッシング
- **インストール可能**: ホーム画面への追加
- **アプリライクな体験**: スタンドアロンモード

### 実装

- **@ducanh2912/next-pwa**: Next.js 15対応のPWAライブラリ
- **manifest.json**: アプリのメタデータ
- **Service Worker**: 本番環境でのみ有効化

詳細は [PWA.md](PWA.md) を参照してください。

## スケーラビリティ

### 水平スケーリング

- **Vercel**: 自動スケーリング
- **Edge Functions**: グローバルに分散されたAPI
- **Database Connection Pooling**: Prismaによる接続プール管理

### データベース最適化

- **インデックス**: 頻繁にクエリされるカラムにインデックス
- **複合一意制約**: データ整合性の保証
- **カスケード削除**: 関連データの自動削除

### 今後の改善予定

- **Redis Cache**: 頻繁にアクセスされるデータのキャッシング
- **Read Replicas**: 読み取り専用レプリカによる負荷分散
- **CDN**: 静的アセットの配信

## 監視とロギング

### 現在の実装

- **Console Logging**: 開発環境でのデバッグ
- **NextAuth Debug Mode**: 認証フローのログ出力
- **Error Boundaries**: エラーのキャッチと表示

### 将来の実装予定

- **Sentry**: エラートラッキング
- **Vercel Analytics**: パフォーマンス監視
- **Database Query Logging**: スロークエリの検出

## テスト戦略

### 現在

- **TypeScript**: コンパイル時の型チェック
- **ESLint**: コード品質チェック
- **Prisma Validation**: スキーマの検証

### 将来実装予定

- **Unit Tests**: Vitest/Jest
- **Integration Tests**: Playwright
- **E2E Tests**: Playwright
- **API Tests**: Supertest

## 技術的な決定事項

### なぜNext.js 15を選んだか

- **App Router**: 最新のReact機能をフル活用
- **Server Components**: パフォーマンスの向上
- **Built-in Optimization**: 画像、フォント、バンドルの最適化
- **Vercel統合**: シームレスなデプロイ

### なぜPrismaを選んだか

- **Type Safety**: TypeScriptとの完璧な統合
- **Developer Experience**: 直感的なAPI
- **Migration**: データベーススキーマの進化を管理
- **Multi-Database Support**: 将来的な移行が容易

### なぜPostgreSQLを選んだか

- **Reliability**: 実績のあるRDBMS
- **ACID Compliance**: データ整合性の保証
- **JSON Support**: 柔軟なデータ構造（participants配列など）
- **Vercel Postgres**: 簡単なホスティング

## 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [ReactFlow Documentation](https://reactflow.dev/learn)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
