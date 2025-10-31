# SettleMate ドキュメント

SettleMateのドキュメントへようこそ！このディレクトリには、開発者、エンドユーザー、コントリビューター向けの包括的なドキュメントが含まれています。

## 📚 ドキュメント一覧

### 🚀 スタートガイド

まずはこちらから読み始めてください。

- **[README.md](../README.md)** - プロジェクト概要とクイックスタート
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - 開発環境のセットアップと開発フロー
- **[.env.example](../.env.example)** - 環境変数のサンプルファイル

### 👥 エンドユーザー向け

SettleMateの使い方を学びたい方向けのドキュメントです。

- **[USER_GUIDE.md](USER_GUIDE.md)** - 詳細な使い方ガイド
  - アカウント登録とログイン
  - グループの作成と管理
  - 支出の記録と清算
  - よくある質問（FAQ）
  - 実際の使用例

### 💻 開発者向け

SettleMateの開発に参加したい方向けのドキュメントです。

#### 基本ドキュメント

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - システムアーキテクチャ
  - システム構成図
  - 技術スタック
  - データベース設計
  - データフロー
  - セキュリティとパフォーマンス

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - 開発者ガイド
  - 開発環境のセットアップ
  - 開発フロー
  - コードスタイルガイド
  - デバッグ方法
  - トラブルシューティング

#### API ドキュメント

- **[API.md](API.md)** - REST API リファレンス
  - グループAPI
  - 支出API（概要）
  - 残高API
  - 清算API
  - ユーザーAPI
  - 認証とエラーハンドリング

- **[EXPENSE_API.md](EXPENSE_API.md)** - 支出API詳細
  - 支出CRUD操作の詳細
  - 均等割りと手動借金登録
  - 残高計算ロジック
  - 使用例

#### インフラ・デプロイ

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - デプロイメントガイド
  - Vercelへのデプロイ（推奨）
  - 他のプラットフォーム（Netlify, Docker）
  - CI/CD設定
  - 本番環境のモニタリング
  - スケーリング戦略

- **[MIGRATIONS.md](../MIGRATIONS.md)** - データベースマイグレーション
  - 開発環境でのマイグレーション
  - 本番環境でのマイグレーション
  - トラブルシューティング

#### その他の機能ドキュメント

- **[PWA.md](PWA.md)** - Progressive Web App対応
  - PWA機能の概要
  - ホーム画面への追加方法
  - 技術仕様
  - アイコンの再生成

### 🤝 コントリビューター向け

プロジェクトに貢献したい方向けのドキュメントです。

- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - コントリビューションガイド
  - バグ報告と機能リクエスト
  - プルリクエストの手順
  - コードスタイルガイド
  - レビュープロセス
  - 優先度の高いコントリビューション

## 🗺️ ドキュメントマップ

あなたの目的に応じて、最適なドキュメントを見つけてください。

### 「SettleMateを使いたい」

1. [README.md](../README.md) - プロジェクト概要を理解
2. [USER_GUIDE.md](USER_GUIDE.md) - 使い方を学ぶ
3. [PWA.md](PWA.md) - アプリとして使う（オプション）

### 「SettleMateを開発したい」

1. [README.md](../README.md) - プロジェクト概要を理解
2. [DEVELOPMENT.md](DEVELOPMENT.md) - 開発環境をセットアップ
3. [ARCHITECTURE.md](ARCHITECTURE.md) - システム構成を理解
4. [API.md](API.md) - APIの使い方を学ぶ

### 「SettleMateをデプロイしたい」

1. [README.md](../README.md) - プロジェクト概要を理解
2. [DEPLOYMENT.md](DEPLOYMENT.md) - デプロイ手順を実行
3. [MIGRATIONS.md](../MIGRATIONS.md) - データベースを準備

### 「SettleMateに貢献したい」

1. [README.md](../README.md) - プロジェクト概要を理解
2. [CONTRIBUTING.md](../CONTRIBUTING.md) - コントリビューション方法を学ぶ
3. [DEVELOPMENT.md](DEVELOPMENT.md) - 開発環境をセットアップ
4. プルリクエストを作成！

## 📖 ドキュメントの読み方

### 記号の意味

- ✅ 実装済み
- 🚧 実装中
- ❌ 未実装
- ⚠️ 注意が必要
- 💡 ヒント
- 🔒 セキュリティ関連

### コードブロック

```bash
# シェルコマンド
pnpm install
```

```typescript
// TypeScriptコード
const example = "example";
```

```json
// JSON形式
{
  "key": "value"
}
```

## 🔍 ドキュメント検索

### よくあるトピック

**環境構築**
- [開発環境のセットアップ](DEVELOPMENT.md#開発環境のセットアップ)
- [環境変数の設定](DEVELOPMENT.md#環境変数の設定)
- [Google OAuthの設定](DEVELOPMENT.md#google-oauth設定)

**API**
- [グループAPI](API.md#グループ-api)
- [支出API](EXPENSE_API.md)
- [清算API](API.md#清算-api)
- [認証](API.md#認証)

**デプロイ**
- [Vercelデプロイ](DEPLOYMENT.md#vercelへのデプロイ推奨)
- [環境変数の設定](DEPLOYMENT.md#環境変数の設定)
- [データベースマイグレーション](MIGRATIONS.md)

**トラブルシューティング**
- [開発環境](DEVELOPMENT.md#トラブルシューティング)
- [デプロイ](DEPLOYMENT.md#トラブルシューティング)
- [ユーザー向け](USER_GUIDE.md#トラブルシューティング)

## 📝 ドキュメントの更新

ドキュメントに誤りを見つけた場合や改善提案がある場合:

1. [GitHub Issues](https://github.com/is0692vs/settlemate/issues)で報告
2. プルリクエストで直接修正を提案

ドキュメントのコントリビューションも大歓迎です！

## 🌐 言語

現在、すべてのドキュメントは**日本語**で提供されています。

英語版ドキュメントの作成も計画中です。コントリビューションを歓迎します！

## 📊 ドキュメント統計

- **総ドキュメント数**: 10ファイル
- **総行数**: 約3,500行
- **カバー範囲**:
  - ユーザーガイド ✅
  - 開発者ガイド ✅
  - APIリファレンス ✅
  - アーキテクチャ ✅
  - デプロイメント ✅
  - コントリビューション ✅

## 🔗 外部リソース

### 公式ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [ReactFlow Documentation](https://reactflow.dev/learn)

### コミュニティ

- [GitHub Repository](https://github.com/is0692vs/settlemate)
- [GitHub Issues](https://github.com/is0692vs/settlemate/issues)
- [GitHub Discussions](https://github.com/is0692vs/settlemate/discussions)

## 💬 サポート

ドキュメントでわからないことがあれば:

1. このREADMEで関連ドキュメントを探す
2. 各ドキュメントの目次で該当セクションを探す
3. それでも見つからない場合は[GitHub Issues](https://github.com/is0692vs/settlemate/issues)で質問

---

SettleMateのドキュメントをお読みいただき、ありがとうございます！

Happy Coding! 🚀
