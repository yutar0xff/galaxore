import express from "express";
import { createServer } from "http";
import cors from "cors";
import { SocketServer } from "./socket";
import os from "os";
import "dotenv/config";

const app = express();

// CORS設宝E 環墝E��数㝧許坯㝙るオリジンを指定坯能
// 未設定�E場坈�E全許坯�E�ローカル開発用�E�E
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Prevent search engine indexing
app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
  next();
});

const httpServer = createServer(app);
new SocketServer(httpServer);

// ポ�Eト番坷: Railway㝯自動的㝫PORT環墝E��数を設宝E
// 未設定�E場坈�E3000を使用�E�ローカル環墝E���E�E
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

function getIpAddress() {
  if (process.env.HOST_IP) {
    return process.env.HOST_IP;
  }

  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    if (!iface) continue;
    for (const alias of iface) {
      if (alias.family === "IPv4" && !alias.internal) {
        return alias.address;
      }
    }
  }
  return "localhost";
}

const wslIp = getIpAddress();

// API endpoint to get server IP
app.get("/api/ip", (req, res) => {
  res.json({
    ip: wslIp,
    serverPort: PORT,
    clientPort: 5173,
  });
});

// 本番環墝E��㝯Railway㝌�E動的㝫ホストを設定㝙る㝟ゝ〝E
// ローカル環墝E�E㝿IPアドレスを表示
httpServer.listen(PORT, '0.0.0.0', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Network access: http://${wslIp}:${PORT}`);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});
