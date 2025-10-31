# SettleMate API リファレンス

## 概要

SettleMate APIは、RESTful APIとして設計されており、グループ管理、支出管理、清算管理などの機能を提供します。すべてのAPIエンドポイントは認証が必要です。

## 認証

### 認証方式

NextAuth.js v5によるセッションベース認証を使用します。

- **セッション方式**: JWT (JSON Web Token)
- **Cookie名**: `authjs.session-token`（開発環境）、`__Secure-authjs.session-token`（本番環境）
- **有効期限**: 30日間

### 認証エラー

認証が必要なエンドポイントに未認証でアクセスした場合:

```json
{
  "error": "Unauthorized"
}
```

**ステータスコード**: 401 Unauthorized

---

## グループ API

### グループ一覧取得

**GET** `/api/groups`

ログインユーザーが所属するグループの一覧を取得します。

#### レスポンス（200 OK）

```json
[
  {
    "id": "clx1234567890abcdefghijklm",
    "name": "温泉旅行",
    "icon": "🏨",
    "createdBy": "clx1234567890abcdefghijklm",
    "createdAt": "2025-10-20T00:00:00.000Z",
    "inviteCode": "ABC123XYZ",
    "_count": {
      "members": 5
    }
  }
]
```

---

### グループ作成

**POST** `/api/groups`

新しいグループを作成し、作成者を自動的にメンバーに追加します。

#### リクエストボディ

```json
{
  "name": "温泉旅行",
  "icon": "🏨"
}
```

**パラメータ**:
- `name`: グループ名（必須、1-100文字）
- `icon`: アイコン絵文字（オプション、1-10文字）

#### レスポンス（201 Created）

```json
{
  "id": "clx1234567890abcdefghijklm",
  "name": "温泉旅行",
  "icon": "🏨",
  "createdBy": "clx1234567890abcdefghijklm",
  "createdAt": "2025-10-20T00:00:00.000Z",
  "inviteCode": "ABC123XYZ"
}
```

---

### グループ詳細取得

**GET** `/api/groups/{id}`

特定のグループの詳細情報を取得します。

#### パラメータ

- `id`: グループID（URL パス）

#### レスポンス（200 OK）

```json
{
  "id": "clx1234567890abcdefghijklm",
  "name": "温泉旅行",
  "icon": "🏨",
  "createdBy": "clx1234567890abcdefghijklm",
  "createdAt": "2025-10-20T00:00:00.000Z",
  "inviteCode": "ABC123XYZ",
  "members": [
    {
      "id": "clx_member_1",
      "userId": "clx_user_1",
      "joinedAt": "2025-10-20T00:00:00.000Z",
      "user": {
        "id": "clx_user_1",
        "name": "太郎",
        "image": "https://..."
      }
    }
  ]
}
```

#### エラー

- `403 Forbidden`: グループのメンバーではありません
- `404 Not Found`: グループが見つかりません

---

### グループ更新

**PATCH** `/api/groups/{id}`

グループ情報を更新します。グループメンバーであれば更新可能です。

#### パラメータ

- `id`: グループID（URL パス）

#### リクエストボディ

```json
{
  "name": "秋の温泉旅行",
  "icon": "🍁"
}
```

#### レスポンス（200 OK）

```json
{
  "id": "clx1234567890abcdefghijklm",
  "name": "秋の温泉旅行",
  "icon": "🍁",
  "createdBy": "clx1234567890abcdefghijklm",
  "createdAt": "2025-10-20T00:00:00.000Z",
  "inviteCode": "ABC123XYZ"
}
```

---

### グループ削除

**DELETE** `/api/groups/{id}`

グループを削除します。関連する支出、残高、清算もすべて削除されます。

#### パラメータ

- `id`: グループID（URL パス）

#### レスポンス（204 No Content）

---

### グループ参加

**POST** `/api/groups/join/{code}`

招待コードを使ってグループに参加します。

#### パラメータ

- `code`: 招待コード（URL パス）

#### レスポンス（200 OK）

```json
{
  "groupId": "clx1234567890abcdefghijklm",
  "message": "グループに参加しました"
}
```

---

## 支出 API

詳細は [EXPENSE_API.md](EXPENSE_API.md) を参照してください。

### 支出作成

**POST** `/api/expenses`

### 支出一覧取得

**GET** `/api/groups/{id}/expenses`

### 支出詳細取得

**GET** `/api/expenses/{id}`

### 支出更新

**PATCH** `/api/expenses/{id}`

### 支出削除

**DELETE** `/api/expenses/{id}`

---

## 残高 API

残高は支出や清算が記録されると自動的に計算・更新されるため、読み取り専用です。

### グループの残高取得

**GET** `/api/groups/{id}/balances`

グループ内のすべての残高を取得します。

#### パラメータ

- `id`: グループID（URL パス）

#### レスポンス（200 OK）

```json
[
  {
    "id": "clx_balance_1",
    "groupId": "clx_group_1",
    "userFrom": "clx_user_1",
    "userTo": "clx_user_2",
    "amount": 1000,
    "fromUser": {
      "id": "clx_user_1",
      "name": "太郎",
      "image": "https://..."
    },
    "toUser": {
      "id": "clx_user_2",
      "name": "花子",
      "image": "https://..."
    }
  }
]
```

**解釈**: userFromがuserToに対してamount円を支払うべき状態を表します。

#### エラー

- `403 Forbidden`: グループのメンバーではありません

---

## 清算 API

### 清算記録の作成

**POST** `/api/settlements`

実際の支払いを記録し、残高を更新します。

#### リクエストボディ

```json
{
  "groupId": "clx1234567890abcdefghijklm",
  "userTo": "clx_user_2",
  "amount": 1000,
  "method": "paypay",
  "description": "PayPayで送金しました"
}
```

**パラメータ**:
- `groupId`: グループID（必須）
- `userTo`: 支払先のユーザーID（必須）
- `amount`: 金額（必須、1円以上）
- `method`: 決済方法（必須）
  - `"cash"`: 現金
  - `"bank_transfer"`: 銀行振込
  - `"paypay"`: PayPay
  - `"line_pay"`: LINE Pay
- `description`: メモ（オプション、最大200文字）

#### レスポンス（201 Created）

```json
{
  "id": "clx_settlement_1",
  "groupId": "clx_group_1",
  "userFrom": "clx_user_1",
  "userTo": "clx_user_2",
  "amount": 1000,
  "method": "paypay",
  "description": "PayPayで送金しました",
  "createdAt": "2025-10-31T12:00:00.000Z"
}
```

#### エラー

- `400 Bad Request`: 残高不足または無効な金額
- `403 Forbidden`: グループのメンバーではありません
- `404 Not Found`: 残高が存在しません

---

### グループの清算履歴取得

**GET** `/api/groups/{id}/settlements`

グループの清算履歴を新しい順で取得します。

#### パラメータ

- `id`: グループID（URL パス）

#### レスポンス（200 OK）

```json
[
  {
    "id": "clx_settlement_1",
    "groupId": "clx_group_1",
    "paidBy": "clx_user_1",
    "paidTo": "clx_user_2",
    "amount": 1000,
    "method": "paypay",
    "description": "PayPayで送金しました",
    "settledAt": "2025-10-31T12:00:00.000Z",
    "payer": {
      "id": "clx_user_1",
      "name": "太郎",
      "image": "https://..."
    },
    "receiver": {
      "id": "clx_user_2",
      "name": "花子",
      "image": "https://..."
    }
  }
]
```

---

### 清算詳細取得

**GET** `/api/settlements/{id}`

特定の清算の詳細を取得します。

#### パラメータ

- `id`: 清算ID（URL パス）

#### レスポンス（200 OK）

```json
{
  "id": "clx_settlement_1",
  "groupId": "clx_group_1",
  "paidBy": "clx_user_1",
  "paidTo": "clx_user_2",
  "amount": 1000,
  "method": "paypay",
  "description": "PayPayで送金しました",
  "settledAt": "2025-10-31T12:00:00.000Z",
  "payer": {
    "id": "clx_user_1",
    "name": "太郎",
    "image": "https://..."
  },
  "receiver": {
    "id": "clx_user_2",
    "name": "花子",
    "image": "https://..."
  }
}
```

---

### 清算削除

**DELETE** `/api/settlements/{id}`

清算を削除し、残高を元に戻します。清算を記録した本人のみ削除可能です。

#### パラメータ

- `id`: 清算ID（URL パス）

#### レスポンス（204 No Content）

#### エラー

- `403 Forbidden`: 清算を記録した本人ではありません
- `404 Not Found`: 清算が見つかりません

---

## ユーザー API

### ユーザー情報取得

**GET** `/api/users/{id}`

特定のユーザーの公開情報を取得します。

#### パラメータ

- `id`: ユーザーID（URL パス）

#### レスポンス（200 OK）

```json
{
  "id": "clx_user_1",
  "name": "太郎",
  "displayName": "タロー",
  "image": "https://...",
  "acceptedPaymentMethods": ["cash", "bank_transfer", "paypay"]
}
```

---

### ユーザー情報更新

**PATCH** `/api/users/{id}`

自分のユーザー情報を更新します。

#### パラメータ

- `id`: ユーザーID（URL パス、自分のIDのみ）

#### リクエストボディ

```json
{
  "displayName": "タロー",
  "acceptedPaymentMethods": ["cash", "paypay", "line_pay"]
}
```

**パラメータ**:
- `displayName`: 表示名（オプション、1-50文字）
- `acceptedPaymentMethods`: 対応決済方法の配列（オプション）

#### レスポンス（200 OK）

```json
{
  "id": "clx_user_1",
  "name": "太郎",
  "displayName": "タロー",
  "image": "https://...",
  "acceptedPaymentMethods": ["cash", "paypay", "line_pay"]
}
```

---

## エラーレスポンス

### 共通エラー形式

```json
{
  "error": "エラーメッセージ",
  "details": {
    // オプション: 詳細なエラー情報
  }
}
```

### ステータスコード

| コード | 意味 | 説明 |
|--------|------|------|
| 200 | OK | リクエスト成功 |
| 201 | Created | リソース作成成功 |
| 204 | No Content | 削除成功 |
| 400 | Bad Request | リクエストが無効 |
| 401 | Unauthorized | 認証が必要 |
| 403 | Forbidden | アクセス権限がない |
| 404 | Not Found | リソースが見つからない |
| 500 | Internal Server Error | サーバーエラー |

---

## レート制限

現在、レート制限は実装されていませんが、将来的に以下の制限を導入予定:

- **API呼び出し**: 100リクエスト/分/ユーザー
- **グループ作成**: 10グループ/日/ユーザー
- **支出記録**: 100件/日/グループ

---

## バージョニング

現在はv1相当ですが、URLにバージョン番号は含まれていません。将来的に破壊的変更が必要な場合は、`/api/v2/` のような形式を導入する予定です。

---

## 使用例

### JavaScript/TypeScript

```typescript
// 支出を記録する
const createExpense = async () => {
  const response = await fetch("/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      groupId: "clx_group_1",
      paidBy: "clx_user_1",
      amount: 3000,
      description: "ディナー",
      participants: ["clx_user_1", "clx_user_2", "clx_user_3"],
      splitType: "equal",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const expense = await response.json();
  return expense;
};

// 残高を取得する
const getBalances = async (groupId: string) => {
  const response = await fetch(`/api/groups/${groupId}/balances`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch balances");
  }

  const balances = await response.json();
  return balances;
};

// 清算を記録する
const createSettlement = async () => {
  const response = await fetch("/api/settlements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      groupId: "clx_group_1",
      userTo: "clx_user_2",
      amount: 1000,
      method: "paypay",
      description: "PayPayで送金",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const settlement = await response.json();
  return settlement;
};
```

### cURL

```bash
# グループ一覧取得
curl -X GET http://localhost:3000/api/groups \
  -H "Cookie: authjs.session-token=<your-session-token>"

# 支出記録
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=<your-session-token>" \
  -d '{
    "groupId": "clx_group_1",
    "paidBy": "clx_user_1",
    "amount": 3000,
    "description": "ディナー",
    "participants": ["clx_user_1", "clx_user_2"],
    "splitType": "equal"
  }'

# 清算記録
curl -X POST http://localhost:3000/api/settlements \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=<your-session-token>" \
  -d '{
    "groupId": "clx_group_1",
    "userTo": "clx_user_2",
    "amount": 1000,
    "method": "paypay"
  }'
```

---

## Webhook（将来実装予定）

将来的に、以下のイベントに対するWebhookをサポート予定:

- `expense.created`: 支出が記録されたとき
- `settlement.created`: 清算が記録されたとき
- `group.member_joined`: 新しいメンバーが参加したとき

---

## 参考資料

- [支出API詳細](EXPENSE_API.md)
- [アーキテクチャ](ARCHITECTURE.md)
- [開発者ガイド](DEVELOPMENT.md)
