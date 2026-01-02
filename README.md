# Local Splendor

ローカルネットワークで遊べるSplendorクローンゲームです。

## 著作権について

**重要**: このプロジェクトは非公式のファンメイドプロジェクトです。

- "Splendor" は Space Cowboys / Asmodee Group の商標です
- このプロジェクトは Space Cowboys または Asmodee Group とは提携・承認されていません
- 元のゲームデザインは Marc André によるものです
- 元のゲーム: [Splendor | Space Cowboys](https://www.spacecowboys.fr/splendor-en)

このプロジェクトは教育目的および個人利用のために作成されました。商業利用は意図していません。

## オンラインでプレイ

- **本番環境**: https://splendor-web.pages.dev/
- **サーバー**: https://splendor-web-server.up.railway.app/

## 起動方法

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 開発サーバーの起動

```bash
pnpm dev
```

- クライアント: `http://<WindowsのIPアドレス>:5173`
- サーバー: `http://<WindowsのIPアドレス>:3001`

## 初回設定

ファイアウォールでポートを開放する必要があります。

### 手順1: WindowsのIPアドレスを確認

PowerShellで以下を実行し、`IPv4 アドレス` を確認します（例: `192.168.1.15`）。

```powershell
ipconfig
```

Wi-Fi接続の場合は「Wireless LAN adapter Wi-Fi」、有線接続の場合は「Ethernet adapter」の項目から `IPv4 アドレス` を確認してください。

### 手順2: サーバーIPの設定

`apps/server` ディレクトリに `.env` ファイルを作成し、確認したIPアドレスを記述します。

```env
# apps/server/.env
HOST_IP=192.168.1.15
```

※ `192.168.1.15` の部分は、手順1で確認した実際のIPアドレスに書き換えてください。

### 手順3: ファイアウォールの許可設定

**PowerShellを管理者として実行**し、以下のコマンドを実行してファイアウォールでポートを開放します。

```powershell
New-NetFirewallRule -DisplayName "Splendor Local Game" -Direction Inbound -LocalPort 3001,5173 -Protocol TCP -Action Allow
```

### 手順4: ゲーム起動とQRコード読み取り

1. `pnpm dev` でサーバーとクライアントを起動します
2. ブラウザで `http://<WindowsのIPアドレス>:5173` にアクセスします
3. ゲームルームを作成すると、画面にQRコードが表示されます
4. スマートフォンのカメラアプリでQRコードを読み取ります
5. 読み取ったURLにアクセスしてゲームに参加できます

### 注意事項

- PCのIPアドレスが変わった場合（ルーターのDHCP割り当て変更など）は、`.env` ファイルの `HOST_IP` を更新してください
- 同じWi-Fiネットワークに接続されている必要があります
- ネットワークプロファイルが「パブリック」になっている場合は、「プライベート」に変更することを推奨します
