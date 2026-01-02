import { io, Socket } from "socket.io-client";

const PORT = 3001;

export const getSocket = async (): Promise<Socket> => {
  // 環境変数からサーバーURLを取得（本番環境用）
  // VITE_SERVER_URLが設定されている場合はそれを使用
  // 未設定の場合はローカル環境用のフォールバックを使用
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  let socketUrl: string;
  if (serverUrl) {
    // 本番環境: 環境変数で指定されたURLを使用
    socketUrl = serverUrl;
  } else {
    // ローカル環境: 従来通りhostnameとポートを使用
    const hostname = window.location.hostname;
    socketUrl = `http://${hostname}:${PORT}`;
  }

  return io(socketUrl, {
    transports: ["websocket"],
    autoConnect: false,
  });
};
