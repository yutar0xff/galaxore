import { io, Socket } from "socket.io-client";

const PORT = 3001;

export const getSocket = async (): Promise<Socket> => {
  const hostname = window.location.hostname;
  return io(`http://${hostname}:${PORT}`, {
    transports: ["websocket"],
    autoConnect: false,
  });
};
