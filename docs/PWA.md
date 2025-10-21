# PWA 対応について

## 概要

SettleMate は PWA（Progressive Web App）として実装されており、スマートフォンのホーム画面に追加してアプリのように使用できます。

## 特徴

- 📱 **ホーム画面に追加可能**: iOS、Android どちらでもホーム画面に追加できます
- 🚀 **スタンドアロンモード**: アドレスバーなしでアプリライクな体験
- 🎨 **カスタムアイコン**: SettleMate のオリジナルアイコンが表示されます
- ⚡ **高速動作**: Service Worker によるキャッシュで高速に動作

## ホーム画面への追加方法

### iOS (Safari)

1. Safari でアプリを開く
2. 画面下部の「シェア」ボタンをタップ
3. 「ホーム画面に追加」を選択
4. 「追加」をタップ

### Android (Chrome)

1. Chrome でアプリを開く
2. 画面右上のメニュー（3 点）をタップ
3. 「ホーム画面に追加」を選択
4. 「追加」をタップ

または、プロンプトが自動で表示される場合があります。

## 技術仕様

- **パッケージ**: [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa)
- **Service Worker**: 本番環境でのみ有効
- **マニフェスト**: `/public/manifest.json`
- **アイコン**:
  - 192x192px (Android)
  - 512x512px (Android)
  - 180x180px (iOS Apple Touch Icon)

## 開発時の注意

- 開発環境（`NODE_ENV=development`）では Service Worker は無効
- 本番ビルド（`pnpm build`）で Service Worker ファイルが生成される
- Service Worker ファイル（`sw.js`など）は`.gitignore`に含まれる

## 確認方法

### ローカルで確認

```bash
pnpm build
pnpm start
```

Chrome DevTools の「Application」タブで以下を確認：

- Service Workers: 登録されているか
- Manifest: マニフェストが正しく読み込まれているか
- Storage: キャッシュが動作しているか

### 本番環境で確認

Vercel にデプロイ後、スマートフォンでアクセスして実際にホーム画面に追加できるか確認してください。

## アイコンの再生成

必要に応じて、以下のスクリプトでアイコンを再生成できます：

```bash
# SVGアイコンを生成
node generate-icons.js

# PNGに変換
node convert-svg-to-png.js
```
