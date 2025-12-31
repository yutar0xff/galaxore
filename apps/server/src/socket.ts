import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { EVENTS, Action, ActionType, GemColor } from '@local-splendor/shared';
import { SplendorGame } from './domain/game';

interface Room {
  players: string[]; // userIds
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

      socket.on(EVENTS.JOIN_ROOM, ({ roomId, asSpectator, userId }: { roomId: string, asSpectator?: boolean, userId?: string }) => {
        let room = this.rooms.get(roomId);
        if (!room) {
          room = { players: [], playerSockets: new Map(), spectators: [] };
          this.rooms.set(roomId, room);
        }

        if (asSpectator) {
          room.spectators.push(socket.id);
        } else {
          // If no userId provided, fallback to socket.id (should not happen with updated client)
          const uid = userId || socket.id;

          // Check if player is already in the room (reconnection)
          if (room.players.includes(uid)) {
              console.log(`User ${uid} reconnected with socket ${socket.id}`);
              room.playerSockets.set(uid, socket.id);
              socket.join(roomId);

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
          if (room.players.length >= 4) {
            socket.emit(EVENTS.ERROR, { message: "Room is full" });
            return;
          }

          room.players.push(uid);
          room.playerSockets.set(uid, socket.id);
        }

        socket.join(roomId);
        console.log(`User ${userId || socket.id} joined room ${roomId} (spectator: ${!!asSpectator})`);

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

        room.game = new SplendorGame(room.players);
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
      // Send lobby info (hacky: using update_game_state with null or special payload)
      // Or just send "WAITING_FOR_PLAYERS" event?
      // Re-using UPDATE_GAME_STATE but with a partial object indicating lobby?
      // Better: Create a separate event for Lobby Update or just generic State.
      // For now, I'll emit a custom event or null game state.
      this.io.to(roomId).emit('lobby_update', {
        players: room.players.length,
        spectators: room.spectators.length
      });
    }
  }
}
