# 支出 API ドキュメント

## 概要

支出 CRUD API は、グループ内での支出管理を実現します。均等割りと手動借金登録の 2 つの分割方法に対応しています。

---

## エンドポイント

### 1. 支出作成

**POST** `/api/expenses`

支出を作成し、自動的に残高（Balance）を計算・更新します。

#### リクエストボディ

```json
{
  "groupId": "clx1234567890abcdefghijklm",
  "paidBy": "clx1234567890abcdefghijklm",
  "amount": 3000,
  "description": "ディナー",
  "participants": [
    "clx1234567890abcdefghijklm",
    "clx1234567890abcdefghijklm",
    "clx1234567890abcdefghijklm"
  ],
  "splitType": "equal"
}
```

**パラメータ説明**：

- `groupId`: グループ ID（CUID）
- `paidBy`: 支払い者のユーザー ID（CUID）
- `amount`: 金額（整数、最大 1000 万円）
- `description`: 説明（最大 200 文字、オプション）
- `participants`: 参加者 ID 配列（最小 2 人）
- `splitType`: `"equal"` または `"manual"`
  - `"equal"`: 均等割り
  - `"manual"`: 手動借金登録（participants[0]から participants[1]への貸付）

#### レスポンス（201 Created）

```json
{
  "id": "clx1234567890abcdefghijklm",
  "groupId": "clx1234567890abcdefghijklm",
  "paidBy": "clx1234567890abcdefghijklm",
  "amount": 3000,
  "description": "ディナー",
  "participants": [
    "clx1234567890abcdefghijklm",
    "clx1234567890abcdefghijklm",
    "clx1234567890abcdefghijklm"
  ],
  "splitType": "equal",
  "date": "2025-10-21T12:34:56.789Z"
}
```

#### エラー

- `401 Unauthorized`: 認証が必要です
- `403 Forbidden`: グループのメンバーではありません
- `400 Bad Request`: バリデーションエラーまたは無効な参加者

---

### 2. 支出一覧取得

**GET** `/api/groups/{id}/expenses`

グループの支出一覧を新しい順で取得します。

#### パラメータ

- `id`: グループ ID（URL パス）

#### レスポンス（200 OK）

```json
[
  {
    "id": "clx1234567890abcdefghijklm",
    "groupId": "clx1234567890abcdefghijklm",
    "paidBy": "clx1234567890abcdefghijklm",
    "amount": 3000,
    "description": "ディナー",
    "participants": [
      "clx1234567890abcdefghijklm",
      "clx1234567890abcdefghijklm",
      "clx1234567890abcdefghijklm"
    ],
    "splitType": "equal",
    "date": "2025-10-21T12:34:56.789Z",
    "payer": {
      "id": "clx1234567890abcdefghijklm",
      "name": "太郎",
      "image": "https://..."
    }
  }
]
```

#### エラー

- `401 Unauthorized`: 認証が必要です
- `403 Forbidden`: グループのメンバーではありません

---

### 3. 支出詳細取得

**GET** `/api/expenses/{id}`

支出の詳細情報を取得します。

#### パラメータ

- `id`: 支出 ID（URL パス）

#### レスポンス（200 OK）

```json
{
  "id": "clx1234567890abcdefghijklm",
  "groupId": "clx1234567890abcdefghijklm",
  "paidBy": "clx1234567890abcdefghijklm",
  "amount": 3000,
  "description": "ディナー",
  "participants": [
    "clx1234567890abcdefghijklm",
    "clx1234567890abcdefghijklm",
    "clx1234567890abcdefghijklm"
  ],
  "splitType": "equal",
  "date": "2025-10-21T12:34:56.789Z",
  "payer": {
    "id": "clx1234567890abcdefghijklm",
    "name": "太郎",
    "image": "https://..."
  },
  "group": {
    "id": "clx1234567890abcdefghijklm",
    "name": "温泉旅行",
    "icon": "🏨",
    "createdBy": "clx1234567890abcdefghijklm",
    "createdAt": "2025-10-20T00:00:00.000Z"
  }
}
```

#### エラー

- `401 Unauthorized`: 認証が必要です
- `403 Forbidden`: グループのメンバーではありません
- `404 Not Found`: 支出が見つかりません

---

### 4. 支出更新

**PATCH** `/api/expenses/{id}`

支出を更新します。支払い者のみが更新可能です。

#### パラメータ

- `id`: 支出 ID（URL パス）

#### リクエストボディ（オプション）

```json
{
  "amount": 3500,
  "description": "ディナー（デザート込み）"
}
```

#### レスポンス（200 OK）

```json
{
  "id": "clx1234567890abcdefghijklm",
  "groupId": "clx1234567890abcdefghijklm",
  "paidBy": "clx1234567890abcdefghijklm",
  "amount": 3500,
  "description": "ディナー（デザート込み）",
  "participants": [
    "clx1234567890abcdefghijklm",
    "clx1234567890abcdefghijklm",
    "clx1234567890abcdefghijklm"
  ],
  "splitType": "equal",
  "date": "2025-10-21T12:34:56.789Z"
}
```

#### エラー

- `401 Unauthorized`: 認証が必要です
- `403 Forbidden`: 支払い者ではありません
- `404 Not Found`: 支出が見つかりません
- `400 Bad Request`: バリデーションエラー

---

### 5. 支出削除

**DELETE** `/api/expenses/{id}`

支出を削除し、残高（Balance）を逆計算・更新します。支払い者のみが削除可能です。

#### パラメータ

- `id`: 支出 ID（URL パス）

#### レスポンス（204 No Content）

#### エラー

- `401 Unauthorized`: 認証が必要です
- `403 Forbidden`: 支払い者ではありません
- `404 Not Found`: 支出が見つかりません

---

## 残高計算ロジック

### 均等割り（`splitType: "equal"`）

支出を参加者全員で均等に分割します。端数は切り捨てられます。

**例**：

- 支出: 3000 円
- 参加者: 3 人
- 一人当たり: 1000 円

### 手動借金登録（`splitType: "manual"`）

参加者間での貸し借りを直接登録します。

**例**：

- 支出: 5000 円
- paidBy: ユーザー A
- participants: [ユーザー A, ユーザー B]
- ユーザー B がユーザー A に 5000 円を返す

---

## 使用例

### curl での支出作成

```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-session-cookie>" \
  -d '{
    "groupId": "clx1234567890abcdefghijklm",
    "paidBy": "clx1234567890abcdefghijklm",
    "amount": 3000,
    "description": "ディナー",
    "participants": ["clx1234567890abcdefghijklm", "clx0987654321zyxwvutsrqpon"],
    "splitType": "equal"
  }'
```

### JavaScript での支出作成

```typescript
const response = await fetch("/api/expenses", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    groupId: "clx1234567890abcdefghijklm",
    paidBy: "clx1234567890abcdefghijklm",
    amount: 3000,
    description: "ディナー",
    participants: ["clx1234567890abcdefghijklm", "clx0987654321zyxwvutsrqpon"],
    splitType: "equal",
  }),
});

const expense = await response.json();
console.log(expense);
```
