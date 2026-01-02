import express from "express";
import { createServer } from "http";
import cors from "cors";
import { SocketServer } from "./socket";
import os from "os";
import "dotenv/config";

const app = express();

// CORS險ｭ螳・ 迺ｰ蠅・､画焚縺ｧ險ｱ蜿ｯ縺吶ｋ繧ｪ繝ｪ繧ｸ繝ｳ繧呈欠螳壼庄閭ｽ
// 譛ｪ險ｭ螳壹・蝣ｴ蜷医・蜈ｨ險ｱ蜿ｯ・医Ο繝ｼ繧ｫ繝ｫ髢狗匱逕ｨ・・
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

const httpServer = createServer(app);
new SocketServer(httpServer);

// 繝昴・繝育分蜿ｷ: Railway縺ｯ閾ｪ蜍慕噪縺ｫPORT迺ｰ蠅・､画焚繧定ｨｭ螳・
// 譛ｪ險ｭ螳壹・蝣ｴ蜷医・3000繧剃ｽｿ逕ｨ・医Ο繝ｼ繧ｫ繝ｫ迺ｰ蠅・畑・・
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

// 譛ｬ逡ｪ迺ｰ蠅・〒縺ｯRailway縺瑚・蜍慕噪縺ｫ繝帙せ繝医ｒ險ｭ螳壹☆繧九◆繧√・
// 繝ｭ繝ｼ繧ｫ繝ｫ迺ｰ蠅・・縺ｿIP繧｢繝峨Ξ繧ｹ繧定｡ｨ遉ｺ
httpServer.listen(PORT, '0.0.0.0', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Network access: http://${wslIp}:${PORT}`);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});
