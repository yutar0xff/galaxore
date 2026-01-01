import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { EVENTS, Action, ActionType, GemColor } from '@local-splendor/shared';
import { SplendorGame } from './domain/game';

interface Room {
  players: string[]; // userIds
  playerNames: Map<string, string>; // userId -> name
  playerSockets: Map<string, string>; // userId -> socketId
  spectators: string[]; // socketIds
  game?: SplendorGame;
}

export class SocketServer {
  private io: Server;
  private rooms: Map<string, Room> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupSocket();
  }

  private setupSocket() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on(EVENTS.JOIN_ROOM, ({ roomId, asSpectator, userId, name }: { roomId: string, asSpectator?: boolean, userId?: string, name?: string }) => {
        let room = this.rooms.get(roomId);
        if (!room) {
          room = { players: [], playerNames: new Map(), playerSockets: new Map(), spectators: [] };
          this.rooms.set(roomId, room);
        }

        if (asSpectator) {
          room.spectators.push(socket.id);
        } else {
          // If no userId provided, fallback to socket.id (should not happen with updated client)
          const uid = userId || socket.id;
          if (name) room.playerNames.set(uid, name);

          // Check if player is already in the room (reconnection)
          if (room.players.includes(uid)) {
              console.log(`User ${uid} reconnected with socket ${socket.id}`);
              room.playerSockets.set(uid, socket.id);
              socket.join(roomId);

              // Update name if changed
              if (name) room.playerNames.set(uid, name);

              // If game is running, send current state immediately
              if (room.game) {
                  socket.emit(EVENTS.UPDATE_GAME_STATE, room.game.getState());
              } else {
                  this.broadcastState(roomId);
              }
              return;
          }

          if (room.game) {
            socket.emit(EVENTS.ERROR, { message: "Game already started" });
            return;
          }
          if (room.players.length >= 6) {
            socket.emit(EVENTS.ERROR, { message: "Room is full" });
            return;
          }

          room.players.push(uid);
          room.playerSockets.set(uid, socket.id);
        }

        socket.join(roomId);
        console.log(`User ${userId || socket.id} (${name || 'unknown'}) joined room ${roomId} (spectator: ${!!asSpectator})`);

        // Notify everyone in room about new player count or game state
        this.broadcastState(roomId);
      });

      socket.on(EVENTS.START_GAME, ({ roomId }: { roomId: string }) => {
        const room = this.rooms.get(roomId);
        if (!room) return;
        if (room.players.length < 2) {
          socket.emit(EVENTS.ERROR, { message: "Need at least 2 players" });
          return;
        }

        // Shuffle player order
        const shuffledIds = [...room.players].sort(() => Math.random() - 0.5);
        const playerConfigs = shuffledIds.map(id => ({
            id,
            name: room.playerNames.get(id) || `Player`
        }));

        room.game = new SplendorGame(playerConfigs);
        this.broadcastState(roomId);
      });

      socket.on(EVENTS.RESET_GAME, ({ roomId }: { roomId: string }) => {
        const room = this.rooms.get(roomId);
        if (!room) return;

        // Only allow host (spectator) or players to reset?
        // For local game, anyone in room can reset is probably fine or restrict to host.
        // Assuming host is usually a spectator.

        room.game = undefined;
        // Clear players so they need to re-join
        room.players = [];
        room.playerSockets.clear();

        // Notify all clients that the game was reset - they should return to home
        this.io.to(roomId).emit(EVENTS.GAME_RESET);
        this.broadcastState(roomId);
      });

      socket.on(EVENTS.GAME_ACTION, ({ roomId, action }: { roomId: string, action: Action }) => {
        const room = this.rooms.get(roomId);
        if (!room || !room.game) return;

        // Allow host/spectator to set winning score
        if (action.type === 'SET_WINNING_SCORE') {
          try {
            room.game.setWinningScore(action.payload.score);
            this.broadcastState(roomId);
          } catch (e: any) {
            socket.emit(EVENTS.ERROR, { message: e.message });
          }
          return;
        }

        // Find userId from socket.id
        let userId: string | undefined;
        for (const [uid, sid] of room.playerSockets.entries()) {
            if (sid === socket.id) {
                userId = uid;
                break;
            }
        }

        if (!userId) {
            socket.emit(EVENTS.ERROR, { message: "Player not found" });
            return;
        }

        try {
          switch (action.type) {
            case 'TAKE_GEMS':
              room.game.takeGems(userId, action.payload.gems);
              break;
            case 'RESERVE_CARD':
              room.game.reserveCard(userId, action.payload.cardId);
              break;
            case 'BUY_CARD':
              room.game.buyCard(userId, action.payload.cardId, action.payload.payment);
              break;
            case 'DISCARD_TOKENS':
              room.game.discardTokens(userId, action.payload.tokens);
              break;
          }
          this.broadcastState(roomId);
        } catch (e: any) {
          socket.emit(EVENTS.ERROR, { message: e.message });
        }
      });

      socket.on(EVENTS.DISCONNECT, () => {
        console.log(`User disconnected: ${socket.id}`);
        // Cleanup logic (remove from room, etc.) - Simplified for now
        this.rooms.forEach((room, roomId) => {
           // If spectator, remove
           room.spectators = room.spectators.filter(p => p !== socket.id);

           // If player, remove from socket map but keep in players list if game is active
           let userIdToRemove: string | undefined;
           for (const [uid, sid] of room.playerSockets.entries()) {
               if (sid === socket.id) {
                   userIdToRemove = uid;
                   break;
               }
           }

           if (userIdToRemove) {
               room.playerSockets.delete(userIdToRemove);

               // If game is NOT active, we can remove the player from the list too
               // allowing them to re-join or someone else to take the spot
               if (!room.game) {
                   room.players = room.players.filter(p => p !== userIdToRemove);
                   this.broadcastState(roomId);
               }
           }
        });
      });
    });
  }

  private broadcastState(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.game) {
      this.io.to(roomId).emit(EVENTS.UPDATE_GAME_STATE, room.game.getState());
    } else {
      this.io.to(roomId).emit('lobby_update', {
        players: room.players.length,
        playerNames: room.players.map(id => room.playerNames.get(id) || 'Unknown'),
        spectators: room.spectators.length
      });
    }
  }
}
