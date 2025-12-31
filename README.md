# Local Splendor

ローカルネットワークで遊べるSplendorクローンゲームです。

## 起動方法

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 開発サーバーの起動

```bash
pnpm dev
```

- クライアント: http://localhost:5173
- サーバー: http://localhost:3000

## スマホからの接続設定 (WSL2環境)

WSL2でホストする場合、PCを再起動するたびにWSL内部のIPアドレスが変わるため、接続できなくなることがあります。
以下の手順で設定を行うことで、Windows側のIPアドレスを使って安定して接続できるようになります。

### 手順1: サーバーIPの固定設定

`apps/server` ディレクトリに `.env` ファイルを作成し、WindowsホストのIPアドレスを指定します。

1. **WindowsのIPアドレスを確認**
   PowerShellで以下を実行し、`IPv4 アドレス` を確認します（例: `192.168.1.15`）。
   ```powershell
   ipconfig
   ```

2. **`.env` ファイルの作成**
   `apps/server/.env` ファイルを作成し、確認したIPアドレスを記述します。

   ```env
   # apps/server/.env
   HOST_IP=192.168.1.15
   ```
   ※ `192.168.1.15` の部分は実際のあなたのPCのIPアドレスに書き換えてください。

### 手順2: ポートフォワーディング（バイパス）の設定

Windows側に来た通信をWSL2へ転送する設定を行います。
**PowerShellを管理者として実行**し、以下のコマンドを実行してください。

```powershell
# 変数設定（WSLのIPアドレスを自動取得して設定する場合）
$wsl_ip = (wsl hostname -I).Trim()
$host_ip = "0.0.0.0"

# ポート転送ルールの追加 (3000:サーバー, 5173:クライアント)
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=$host_ip connectport=3000 connectaddress=$wsl_ip
netsh interface portproxy add v4tov4 listenport=5173 listenaddress=$host_ip connectport=5173 connectaddress=$wsl_ip

# ファイアウォールの許可（初回のみ必要）
New-NetFirewallRule -DisplayName "Splendor Server" -Direction Inbound -LocalPort 3000,5173 -Protocol TCP -Action Allow
```

### 接続確認

設定後、スマホのブラウザから `http://<WindowsのIPアドレス>:5173`（例: `http://192.168.1.15:5173`）にアクセスしてください。

### PC再起動後の対応

PCを再起動してWSLのIPが変わった場合は、**手順2のポートフォワーディング設定のみ** 再実行してください。
`.env` の `HOST_IP` はWindows側のIPが変わらない限り変更不要です。

もしWindows側のIPも変わった場合（ルーターのDHCP割り当て変更など）は、`.env` の修正とポートフォワーディング設定の両方が必要です。
