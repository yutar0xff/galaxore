import { useEffect, useState, useRef } from 'react';
import { getSocket } from '../infrastructure/socket';
import { GameState, EVENTS, Action } from '@local-splendor/shared';
import { Socket } from 'socket.io-client';

export const useGame = (roomId: string | null, options: { asSpectator?: boolean } = {}) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [lobbyInfo, setLobbyInfo] = useState<{ players: number, spectators: number } | null>(null);
  const socketRef = useRef<Socket | null>(null);

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
            setPlayerId(currentSocket?.id || null);
            currentSocket?.emit(EVENTS.JOIN_ROOM, { roomId, asSpectator: options.asSpectator });
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

        const onLobbyUpdate = (info: { players: number, spectators: number }) => {
            if (isMounted) setLobbyInfo(info);
        };

        const onError = ({ message }: { message: string }) => {
          if (isMounted) {
            setError(message);
            // Clear error after 3s
            setTimeout(() => setError(null), 3000);
          }
        };

        currentSocket.on('connect', onConnect);
        currentSocket.on('disconnect', onDisconnect);
        currentSocket.on(EVENTS.UPDATE_GAME_STATE, onUpdateGameState);
        currentSocket.on('lobby_update', onLobbyUpdate);
        currentSocket.on(EVENTS.ERROR, onError);

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
        currentSocket.off('connect');
        currentSocket.off('disconnect');
        currentSocket.off(EVENTS.UPDATE_GAME_STATE);
        currentSocket.off('lobby_update');
        currentSocket.off(EVENTS.ERROR);
        currentSocket.disconnect();
      }
    };
  }, [roomId, options.asSpectator]);

  const startGame = () => {
    socketRef.current?.emit(EVENTS.START_GAME, { roomId });
  };

  const sendAction = (action: Action) => {
    socketRef.current?.emit(EVENTS.GAME_ACTION, { roomId, action });
  };

  return { gameState, error, isConnected, playerId, lobbyInfo, startGame, sendAction };
};
