import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { SocketServer } from './socket';
import os from 'os';
import 'dotenv/config';

const app = express();

// CORS設定: 環境変数で許可するオリジンを指定可能
// 未設定の場合は全許可（ローカル開発用）
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

const httpServer = createServer(app);
new SocketServer(httpServer);

// ポート番号: Railwayは自動的にPORT環境変数を設定
// 未設定の場合は3000を使用（ローカル環境用）
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

function getIpAddress() {
  if (process.env.HOST_IP) {
    return process.env.HOST_IP;
  }

  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    if (!iface) continue;
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
}

const wslIp = getIpAddress();

// API endpoint to get server IP
app.get('/api/ip', (req, res) => {
  res.json({
    ip: wslIp,
    serverPort: PORT,
    clientPort: 5173
  });
});

// 本番環境ではRailwayが自動的にホストを設定するため、
// ローカル環境のみIPアドレスを表示
httpServer.listen(PORT, '0.0.0.0', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Network access: http://${wslIp}:${PORT}`);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});
