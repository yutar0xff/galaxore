import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { EVENTS, Action, ActionType, GemColor } from '@local-splendor/shared';
import { SplendorGame } from './domain/game';

interface Room {
  players: string[];
  spectators: string[];
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

      socket.on(EVENTS.JOIN_ROOM, ({ roomId, asSpectator }: { roomId: string, asSpectator?: boolean }) => {
        let room = this.rooms.get(roomId);
        if (!room) {
          room = { players: [], spectators: [] };
          this.rooms.set(roomId, room);
        }

        if (asSpectator) {
          room.spectators.push(socket.id);
        } else {
          if (room.game) {
            socket.emit(EVENTS.ERROR, { message: "Game already started" });
            return;
          }
          if (room.players.length >= 4) {
            socket.emit(EVENTS.ERROR, { message: "Room is full" });
            return;
          }
          room.players.push(socket.id);
        }

        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId} (spectator: ${!!asSpectator})`);

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
        // Optionally clear players or keep them in lobby?
        // Let's keep them in lobby so they can restart easily.
        this.broadcastState(roomId);
      });

      socket.on(EVENTS.GAME_ACTION, ({ roomId, action }: { roomId: string, action: Action }) => {
        const room = this.rooms.get(roomId);
        if (!room || !room.game) return;

        try {
          switch (action.type) {
            case 'TAKE_GEMS':
              room.game.takeGems(socket.id, action.payload.gems);
              break;
            case 'RESERVE_CARD':
              room.game.reserveCard(socket.id, action.payload.cardId);
              break;
            case 'BUY_CARD':
              room.game.buyCard(socket.id, action.payload.cardId);
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
           room.players = room.players.filter(p => p !== socket.id);
           room.spectators = room.spectators.filter(p => p !== socket.id);
           // If game active, maybe pause or forfeit? ignoring for MVP
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
