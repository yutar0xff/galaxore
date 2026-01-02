# デプロイ手順書

このドキュメントでは、Local SplendorをCloudflare Pages（クライアント）とRailway（サーバー）にデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Cloudflareアカウント
- Railwayアカウント
- モノレポがGitHubで管理されていること

## アーキテクチャ

- **クライアント**: Cloudflare Pages（静的サイトホスティング）
- **サーバー**: Railway（Node.jsアプリケーション）
- **ローカル開発環境**: 従来通り維持

## 1. Railway（サーバー）のデプロイ

### 1.1 Railwayプロジェクトの作成

1. [Railway](https://railway.app)にログイン
2. 「New Project」をクリック
3. 「Deploy from GitHub repo」を選択
4. リポジトリを選択

### 1.2 プロジェクト設定

Railwayが自動的にプロジェクトを検出しますが、以下の設定を行います：

#### Root Directoryの設定
- Settings → Root Directory: `apps/server` に設定

#### ビルドコマンド
Railwayは `railway.json` を自動的に読み込みます。手動で設定する場合：

```
cd ../.. && pnpm install && pnpm --filter @local-splendor/shared run build && cd apps/server && pnpm build
```

#### 起動コマンド
```
pnpm start
```

### 1.3 環境変数の設定

Railwayダッシュボードの「Variables」タブで以下を設定：

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 本番環境フラグ |
| `PORT` | （自動設定） | Railwayが自動的に設定（読み取り専用） |
| `CORS_ORIGIN` | `https://splendor-web.pages.dev` | Cloudflare PagesのURL（カンマ区切りで複数指定可能） |

**注意**: `CORS_ORIGIN`には、デプロイ後のCloudflare PagesのURLを設定してください。

**本番環境のURL**:
- クライアント: https://splendor-web.pages.dev/
- サーバー: https://splendor-web-server.up.railway.app/

### 1.4 デプロイの確認

1. Railwayダッシュボードで「Deployments」を確認
2. デプロイが成功したら、「Settings」→「Domains」で公開URLを確認
3. サーバーURL: https://splendor-web-server.up.railway.app/

## 2. Cloudflare Pages（クライアント）のデプロイ

### 2.1 Cloudflare Pagesプロジェクトの作成

1. [Cloudflare Dashboard](https://dash.cloudflare.com)にログイン
2. 「Pages」を選択
3. 「Create a project」→「Connect to Git」を選択
4. GitHubリポジトリを選択

### 2.2 ビルド設定

以下の設定を行います：

| 項目 | 値 |
|------|-----|
| **Project name** | `local-splendor-client`（任意） |
| **Production branch** | `main` または `master` |
| **Build command** | `pnpm run build`（ルートディレクトリから実行） |
| **Build output directory** | `apps/client/dist` |
| **Root directory** | （空欄のまま） |

**注意**: モノレポのため、ルートディレクトリで `pnpm install` を実行する必要があります。ビルドコマンドはルートディレクトリの `pnpm run build` を使用することで、共有パッケージを先にビルドしてからクライアントをビルドします。

### 2.3 環境変数の設定

「Settings」→「Environment variables」で以下を設定：

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `VITE_SERVER_URL` | `https://splendor-web-server.up.railway.app` | RailwayのサーバーURL |

**本番環境のURL**:
- クライアント: https://splendor-web.pages.dev/
- サーバー: https://splendor-web-server.up.railway.app/

### 2.4 デプロイの確認

1. 「Deployments」タブでデプロイ状況を確認
2. デプロイが成功したら、公開URLを確認: https://splendor-web.pages.dev/
3. このURLをRailwayの `CORS_ORIGIN` 環境変数に設定

## 3. 環境変数の相互設定

### 3.1 Railway側のCORS設定を更新

Railwayの環境変数 `CORS_ORIGIN` を設定：

```
https://splendor-web.pages.dev
```

複数のドメインを許可する場合（例: プレビュー環境も含める）:

```
https://splendor-web.pages.dev,https://preview-splendor-web.pages.dev
```

### 3.2 動作確認

1. Cloudflare PagesのURLにアクセス
2. ゲームが正常に動作することを確認
3. WebSocket接続が確立されることを確認（ブラウザの開発者ツールで確認）

## 4. ローカル開発環境の維持

ローカル開発環境は従来通り動作します：

```bash
# ルートディレクトリで
pnpm dev
```

環境変数が未設定の場合、自動的にローカル環境用の設定が使用されます：

- **クライアント**: `http://localhost:3000` に接続
- **サーバー**: ポート3000でリッスン

### ローカル環境変数ファイル（オプション）

必要に応じて、ローカル環境用の環境変数ファイルを作成できます：

#### `apps/client/.env.local`
```
# ローカル開発時のみ使用（.gitignoreに含まれています）
# VITE_SERVER_URL=http://localhost:3000
```

#### `apps/server/.env`
```
# ローカル開発時のみ使用（.gitignoreに含まれています）
# HOST_IP=192.168.1.15
# CORS_ORIGIN=http://localhost:5173
```

## 5. トラブルシューティング

### 5.1 WebSocket接続エラー

**症状**: クライアントがサーバーに接続できない

**確認事項**:
1. Railwayの `CORS_ORIGIN` にCloudflare PagesのURLが正しく設定されているか
2. Cloudflare Pagesの `VITE_SERVER_URL` にRailwayのURLが正しく設定されているか
3. Railwayのサーバーが正常に起動しているか（Railwayダッシュボードの「Logs」を確認）

### 5.2 ビルドエラー

**症状**: Cloudflare PagesまたはRailwayでビルドが失敗する

**確認事項**:
1. モノレポの依存関係が正しくインストールされているか
2. 共有パッケージ（`@local-splendor/shared`）が先にビルドされているか
3. ビルドコマンドが正しく設定されているか
4. 最新のコードがGitHubにプッシュされているか
5. Cloudflare Pagesのビルドキャッシュをクリアする（Settings → Builds & deployments → Clear build cache）

**ビルドキャッシュのクリア方法**:
- Cloudflare Pagesダッシュボードで「Settings」→「Builds & deployments」を開く
- 「Clear build cache」ボタンをクリック
- 再度デプロイを実行

### 5.3 CORSエラー

**症状**: ブラウザコンソールにCORSエラーが表示される

**解決方法**:
1. Railwayの `CORS_ORIGIN` 環境変数を確認
2. Cloudflare PagesのURLが正確に設定されているか確認（プロトコル `https://` を含む）
3. 複数のURLを許可する場合は、カンマ区切りで設定

### 5.4 ポートエラー（Railway）

**症状**: Railwayでポート関連のエラーが発生

**解決方法**:
- Railwayは自動的に `PORT` 環境変数を設定します
- コード内で `process.env.PORT` を読み取っていることを確認
- 手動で `PORT` 環境変数を設定しないでください（Railwayが自動設定）

## 6. 継続的デプロイ（CI/CD）

### GitHub連携

- **Railway**: GitHubリポジトリにプッシュすると自動的にデプロイされます
- **Cloudflare Pages**: GitHubリポジトリにプッシュすると自動的にデプロイされます

### ブランチ戦略

- **Production**: `main` または `master` ブランチへのプッシュで本番環境にデプロイ
- **Preview**: 他のブランチへのプッシュでプレビュー環境にデプロイ（Cloudflare Pages）

## 7. モノレポ特有の注意事項

### ビルド順序

モノレポのため、以下の順序でビルドする必要があります：

1. ルートで `pnpm install` を実行
2. `@local-splendor/shared` パッケージをビルド
3. 各アプリ（client/server）をビルド

### 依存関係

- 各アプリは `@local-splendor/shared` に依存しています
- ビルド前に共有パッケージをビルドする必要があります

## 8. コスト

### Cloudflare Pages
- 無料プランで十分な機能が利用可能
- ビルド時間: 月500分まで無料

### Railway
- 無料プラン: $5のクレジット（毎月リセット）
- Hobbyプラン: $5/月（推奨）

## 9. セキュリティ

### 環境変数
- 機密情報は環境変数で管理
- `.env` ファイルは `.gitignore` に含まれています
- 本番環境の環境変数は各プラットフォームのダッシュボードで管理

### CORS設定
- 本番環境では `CORS_ORIGIN` で許可するオリジンを明示的に指定
- ワイルドカード（`*`）はローカル開発時のみ使用

## 10. 更新手順

### サーバーの更新
1. コードを変更してGitHubにプッシュ
2. Railwayが自動的にデプロイを開始
3. デプロイ完了を確認

### クライアントの更新
1. コードを変更してGitHubにプッシュ
2. Cloudflare Pagesが自動的にビルドとデプロイを開始
3. デプロイ完了を確認

### 環境変数の更新
1. 各プラットフォームのダッシュボードで環境変数を更新
2. 必要に応じて再デプロイを実行
