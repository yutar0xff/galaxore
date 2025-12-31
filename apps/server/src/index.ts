import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { SocketServer } from './socket';
import os from 'os';
import 'dotenv/config';

const app = express();
app.use(cors());

const httpServer = createServer(app);
new SocketServer(httpServer);

const PORT = 3000;

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

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Network access: http://${wslIp}:${PORT}`);
});
