import { useEffect, useState, useRef } from "react";
import { getSocket } from "../infrastructure/socket";
import { EVENTS } from "@galaxore/shared";
import { Socket } from "socket.io-client";

export interface RoomInfo {
  gameStarted: boolean;
  players: { id: string; name: string }[];
  boardUsers: number;
  boardUserNames: string[];
}

export const useRoomInfo = (roomId: string | null, pollInterval: number = 2000) => {
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  const fetchRoomInfo = async () => {
    if (!roomId) {
      setRoomInfo(null);
      return;
    }

    try {
      setError(null);
      let currentSocket = socketRef.current;

      if (!currentSocket) {
        currentSocket = await getSocket();
        socketRef.current = currentSocket;

        if (!currentSocket.connected) {
          currentSocket.connect();
        }
      }

      const requestInfo = () => {
        if (!currentSocket) return;

        currentSocket.emit(
          EVENTS.GET_ROOM_INFO,
          { roomId },
          (info: RoomInfo) => {
            setRoomInfo(info);
            setLoading(false);
          }
        );
      };

      const onConnect = () => {
        requestInfo();
      };

      const onError = ({ message }: { message: string }) => {
        setError(message);
        setLoading(false);
      };

      // Remove old listeners to avoid duplicates
      currentSocket.off("connect", onConnect);
      currentSocket.off(EVENTS.ERROR, onError);

      currentSocket.on("connect", onConnect);
      currentSocket.on(EVENTS.ERROR, onError);

      if (currentSocket.connected) {
        requestInfo();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch room info");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomId) {
      setRoomInfo(null);
      return;
    }

    let isMounted = true;

    // Initial fetch
    setLoading(true);
    fetchRoomInfo();

    // Set up polling
    if (pollInterval > 0) {
      pollIntervalRef.current = setInterval(() => {
        if (isMounted) {
          fetchRoomInfo();
        }
      }, pollInterval);
    }

    return () => {
      isMounted = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off(EVENTS.ERROR);
        // Don't disconnect socket here as it might be reused
      }
    };
  }, [roomId, pollInterval]);

  return { roomInfo, loading, error };
};
