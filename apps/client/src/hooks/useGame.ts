import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getSocket } from "../infrastructure/socket";
import { GameState, EVENTS, Action } from "@galaxore/shared";
import { Socket } from "socket.io-client";
import { ERROR_DISPLAY_DURATION } from "../constants/game";

const getUserId = () => {
  let id = localStorage.getItem("galaxore_user_id");
  if (!id) {
    id =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    localStorage.setItem("galaxore_user_id", id);
  }
  return id;
};

export const useGame = (
  roomId: string | null,
  options: { asBoard?: boolean; onGameReset?: () => void; switchUserId?: string } = {},
) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [lobbyInfo, setLobbyInfo] = useState<{
    players: number;
    playerNames?: string[];
    boardUsers: number;
    boardUserNames?: string[];
  } | null>(null);
  const [wasReset, setWasReset] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const userIdRef = useRef<string>(getUserId());

  const [searchParams] = useSearchParams();
  const userName =
    searchParams.get("name") || localStorage.getItem("galaxore_player_name");

  useEffect(() => {
    if (!roomId) return;

    let currentSocket: Socket | null = null;
    let isMounted = true;

    const setupSocket = async () => {
      try {
        currentSocket = await getSocket();
        socketRef.current = currentSocket;

        if (!currentSocket.connected) {
          currentSocket.connect();
        }

        const onConnect = () => {
          if (isMounted) {
            setIsConnected(true);

            // If switchUserId is provided, use SWITCH_DEVICE instead of JOIN_ROOM
            if (options.switchUserId) {
              setPlayerId(options.switchUserId);
              currentSocket?.emit(EVENTS.SWITCH_DEVICE, {
                roomId,
                targetUserId: options.switchUserId,
              });
            } else {
              setPlayerId(userIdRef.current);
              currentSocket?.emit(EVENTS.JOIN_ROOM, {
                roomId,
                asBoard: options.asBoard,
                userId: userIdRef.current,
                name: userName,
              });
            }
          }
        };

        const onDisconnect = () => {
          if (isMounted) setIsConnected(false);
        };

        const onUpdateGameState = (game: GameState) => {
          if (isMounted) {
            setGameState(game);
          }
        };

        const onLobbyUpdate = (info: {
          players: number;
          playerNames?: string[];
          boardUsers: number;
          boardUserNames?: string[];
        }) => {
          if (isMounted) setLobbyInfo(info);
        };

        const onError = ({ message }: { message: string }) => {
          if (isMounted) {
            setError(message);
            // Clear error after ERROR_DISPLAY_DURATION
            setTimeout(() => setError(null), ERROR_DISPLAY_DURATION);
          }
        };

        const onGameReset = () => {
          if (isMounted) {
            setGameState(null);
            options.onGameReset?.();
          }
        };

        currentSocket.on("connect", onConnect);
        currentSocket.on("disconnect", onDisconnect);
        currentSocket.on(EVENTS.UPDATE_GAME_STATE, onUpdateGameState);
        currentSocket.on("lobby_update", onLobbyUpdate);
        currentSocket.on(EVENTS.ERROR, onError);
        currentSocket.on(EVENTS.GAME_RESET, onGameReset);

        if (currentSocket.connected) {
          onConnect();
        }
      } catch (err) {
        console.error(err);
      }
    };

    setupSocket();

    return () => {
      isMounted = false;
      if (currentSocket) {
        currentSocket.off("connect");
        currentSocket.off("disconnect");
        currentSocket.off(EVENTS.UPDATE_GAME_STATE);
        currentSocket.off("lobby_update");
        currentSocket.off(EVENTS.ERROR);
        currentSocket.off(EVENTS.GAME_RESET);
        currentSocket.disconnect();
      }
    };
  }, [roomId, options.asBoard, options.switchUserId]);

  const startGame = () => {
    socketRef.current?.emit(EVENTS.START_GAME, { roomId });
  };

  const resetGame = () => {
    socketRef.current?.emit(EVENTS.RESET_GAME, { roomId });
  };

  const sendAction = (action: Action) => {
    socketRef.current?.emit(EVENTS.GAME_ACTION, { roomId, action });
  };

  return {
    gameState,
    error,
    setError,
    isConnected,
    playerId,
    lobbyInfo,
    startGame,
    resetGame,
    sendAction,
  };
};
