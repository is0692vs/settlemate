# 開発者ガイド

## 開発環境のセットアップ

### 前提条件

以下のツールをインストールしてください:

- **Node.js**: 20.x以上
- **pnpm**: 8.x以上（推奨）
  ```bash
  npm install -g pnpm
  ```
- **PostgreSQL**: 14.x以上
- **Git**: 最新版

### 環境構築手順

#### 1. リポジトリのクローン

```bash
git clone https://github.com/is0692vs/settlemate.git
cd settlemate
```

#### 2. 依存関係のインストール

```bash
pnpm install
```

#### 3. データベースのセットアップ

ローカルにPostgreSQLをインストールするか、Dockerを使用します。

**Dockerを使用する場合:**

```bash
docker run --name settlemate-postgres \
  -e POSTGRES_USER=settlemate \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=settlemate \
  -p 5432:5432 \
  -d postgres:16
```

#### 4. 環境変数の設定

`.env.local` ファイルを作成:

```bash
cp .env.example .env.local
```

`.env.local` を編集:

```env
# データベース接続文字列
DATABASE_URL="postgresql://settlemate:password@localhost:5432/settlemate"

# Google OAuth設定（下記参照）
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# NextAuth設定
AUTH_SECRET="your-random-secret-key"  # openssl rand -base64 32
AUTH_URL="http://localhost:3000"
```

#### 5. Google OAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「OAuthクライアントID」を選択
5. アプリケーションの種類: 「ウェブアプリケーション」
6. 承認済みのリダイレクトURI:
   - `http://localhost:3000/api/auth/callback/google`
7. クライアントIDとシークレットをコピーして `.env.local` に貼り付け

#### 6. データベースマイグレーション

```bash
pnpm prisma migrate dev
```

初回は「migration name」を聞かれるので、`init` などと入力してください。

#### 7. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

---

## 開発フロー

### ブランチ戦略

- **main**: 本番環境にデプロイされるブランチ
- **feature/xxx**: 新機能開発用ブランチ
- **fix/xxx**: バグ修正用ブランチ
- **docs/xxx**: ドキュメント更新用ブランチ

### 開発の流れ

1. **issueを作成**
   - 実装する機能やバグを明確に記載

2. **ブランチを作成**
   ```bash
   git checkout -b feature/new-feature
   ```

3. **コードを書く**
   - コードを書く前にテストを書く（TDD推奨）
   - 小さく分割してコミット

4. **テストとLint**
   ```bash
   pnpm typecheck  # 型チェック
   pnpm lint       # ESLintチェック
   pnpm build      # ビルド確認
   ```

5. **コミット**
   ```bash
   git add .
   git commit -m "feat: 新機能の説明"
   ```

   **コミットメッセージの規約**:
   - `feat:` 新機能
   - `fix:` バグ修正
   - `docs:` ドキュメント更新
   - `style:` コードスタイル変更（機能に影響なし）
   - `refactor:` リファクタリング
   - `test:` テスト追加・修正
   - `chore:` ビルドプロセスやツールの変更

6. **プッシュとPR作成**
   ```bash
   git push origin feature/new-feature
   ```
   
   GitHubでプルリクエストを作成し、レビューを依頼します。

---

## プロジェクト構造の詳細

### app/ ディレクトリ

Next.js 15のApp Routerを使用しています。

```
app/
├── api/              # APIルート
│   ├── expenses/     # 支出関連API
│   ├── groups/       # グループ関連API
│   └── settlements/  # 清算関連API
├── auth/             # 認証ページ
├── dashboard/        # ダッシュボード（認証必須）
│   ├── groups/       # グループ管理
│   └── profile/      # プロフィール設定
├── layout.tsx        # ルートレイアウト
└── page.tsx          # ホームページ
```

**命名規則**:
- `page.tsx`: ページコンポーネント
- `layout.tsx`: レイアウトコンポーネント
- `route.ts`: APIルート
- `loading.tsx`: ローディング状態
- `error.tsx`: エラー画面

### components/ ディレクトリ

再利用可能なReactコンポーネントを配置します。

```
components/
├── balance/          # 残高表示関連
├── expenses/         # 支出管理関連
├── graphs/           # グラフ可視化
├── groups/           # グループ管理関連
├── settlements/      # 清算関連
└── ui/              # 汎用UIコンポーネント
```

**コンポーネント命名規則**:
- PascalCase（例: `ExpenseList.tsx`）
- 1ファイル1コンポーネント
- Server ComponentとClient Componentを明確に区別

**Client Component**:
```tsx
"use client";  // ファイルの先頭に記述

export default function MyClientComponent() {
  // ...
}
```

### lib/ ディレクトリ

ユーティリティ関数、定数、バリデーションスキーマなどを配置します。

```
lib/
├── api/              # API呼び出しヘルパー
├── constants/        # 定数定義
├── utils/            # ユーティリティ関数
├── validations/      # Zodスキーマ
└── prisma.ts         # Prismaクライアント
```

---

## データベース操作

### Prismaの基本操作

#### モデルの定義

`prisma/schema.prisma` でデータモデルを定義します。

```prisma
model Expense {
  id           String   @id @default(cuid())
  groupId      String
  paidBy       String
  amount       Int
  description  String?
  date         DateTime @default(now())
  
  group        Group    @relation(fields: [groupId], references: [id])
  payer        User     @relation(fields: [paidBy], references: [id])
}
```

#### マイグレーションの作成

```bash
pnpm prisma migrate dev --name add_new_field
```

#### Prisma Studioでデータを確認

```bash
pnpm prisma studio
```

ブラウザで [http://localhost:5555](http://localhost:5555) が開きます。

#### データのクエリ例

```typescript
// 単一レコード取得
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { groupMembers: true },
});

// 複数レコード取得
const expenses = await prisma.expense.findMany({
  where: { groupId },
  orderBy: { date: "desc" },
  include: { payer: true },
});

// 作成
const expense = await prisma.expense.create({
  data: {
    groupId,
    paidBy: userId,
    amount: 1000,
    description: "ランチ",
  },
});

// 更新
await prisma.expense.update({
  where: { id: expenseId },
  data: { amount: 1500 },
});

// 削除
await prisma.expense.delete({
  where: { id: expenseId },
});

// トランザクション
await prisma.$transaction(async (tx) => {
  await tx.expense.create({ data: expenseData });
  await tx.balance.update({ where: balanceWhere, data: balanceData });
});
```

---

## APIルートの作成

### 基本構造

```typescript
// app/api/example/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // データ取得
    const data = await prisma.someModel.findMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // リクエストボディの取得
    const body = await request.json();

    // バリデーション
    const result = mySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error },
        { status: 400 }
      );
    }

    // データ作成
    const created = await prisma.someModel.create({
      data: result.data,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### バリデーション

Zodを使用して入力値を検証します。

```typescript
// lib/validations/expense.ts
import { z } from "zod";

export const createExpenseSchema = z.object({
  groupId: z.string().cuid(),
  paidBy: z.string().cuid(),
  amount: z.number().int().min(1).max(10000000),
  description: z.string().max(200).optional(),
  participants: z.array(z.string().cuid()).min(2),
  splitType: z.enum(["equal", "manual"]),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
```

---

## スタイリング

### Tailwind CSS

ユーティリティクラスを使用してスタイリングします。

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-bold text-gray-900">タイトル</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    ボタン
  </button>
</div>
```

### レスポンシブデザイン

モバイルファーストで設計します。

```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* モバイル: 100%, タブレット: 50%, デスクトップ: 33.3% */}
</div>
```

### カスタムスタイル

`tailwind.config.js` でカスタマイズできます。

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
      },
    },
  },
};
```

---

## デバッグ

### Server Componentsのデバッグ

Server Componentsでは `console.log` がターミナルに出力されます。

```tsx
export default async function MyPage() {
  const data = await fetchData();
  console.log("Server:", data);  // ターミナルに出力
  return <div>...</div>;
}
```

### Client Componentsのデバッグ

Client Componentsでは `console.log` がブラウザのコンソールに出力されます。

```tsx
"use client";

export default function MyComponent() {
  console.log("Client:", data);  // ブラウザコンソールに出力
  return <div>...</div>;
}
```

### React Developer Tools

Reactの状態やコンポーネント階層を確認できます。

- [Chrome拡張](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox拡張](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Prisma Studioでデータ確認

```bash
pnpm prisma studio
```

---

## テスト

### 型チェック

```bash
pnpm typecheck
```

TypeScriptの型エラーを確認します。

### Lintチェック

```bash
pnpm lint
```

ESLintでコード品質をチェックします。

### 自動修正

```bash
pnpm lint --fix
```

---

## パフォーマンス最適化

### Server Componentsの活用

- データフェッチはServer Componentsで行う
- Client Componentsは必要最小限に

### 画像最適化

```tsx
import Image from "next/image";

<Image
  src="/image.jpg"
  width={500}
  height={300}
  alt="説明"
/>
```

### Dynamic Import

大きなコンポーネントは動的にインポートします。

```tsx
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <p>Loading...</p>,
});
```

---

## トラブルシューティング

### ビルドエラー

```bash
# node_modulesとキャッシュをクリア
rm -rf node_modules .next
pnpm install
pnpm build
```

### データベース接続エラー

```bash
# DATABASE_URLが正しいか確認
echo $DATABASE_URL

# PostgreSQLが起動しているか確認
docker ps
```

### 認証エラー

- Google Cloud Consoleで認証情報が正しいか確認
- リダイレクトURIが正しいか確認
- セッションをクリア（ブラウザのCookieを削除）

---

## 便利なツール

### VSCode拡張機能

- **Prisma**: Prismaスキーマのシンタックスハイライト
- **Tailwind CSS IntelliSense**: Tailwindのオートコンプリート
- **ESLint**: ESLintの統合
- **Prettier**: コードフォーマッター

### おすすめ設定

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## リソース

### 公式ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### コミュニティ

- [Next.js Discord](https://nextjs.org/discord)
- [Prisma Discord](https://discord.gg/prisma)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

## 次のステップ

1. [アーキテクチャドキュメント](ARCHITECTURE.md)を読む
2. [API仕様書](API.md)を確認する
3. 実際にコードを書いてみる
4. プルリクエストを作成する

ハッピーコーディング！🚀
