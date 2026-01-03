import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { EVENTS, Action, ActionType, OreColor } from '@galaxore/shared';
import { GalaxoreGame } from './domain/game';
import { randomUUID } from 'crypto';

interface Room {
  players: string[]; // userIds
  playerNames: Map<string, string>; // userId -> name
  playerSockets: Map<string, string>; // userId -> socketId
  boardUsers: string[]; // socketIds
  boardUserNames: Map<string, string>; // socketId -> name
  game?: GalaxoreGame;
}

export class SocketServer {
  private io: Server;
  private rooms: Map<string, Room> = new Map();

  constructor(httpServer: HttpServer) {
    // CORS設宝E 環墝E��数㝧許坯㝙るオリジンを指定坯能
    // 未設定�E場坈�E全許坯�E�ローカル開発用�E�E
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : '*';

    this.io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupSocket();
  }

  private setupSocket() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      // Get room info without joining
      socket.on(EVENTS.GET_ROOM_INFO, ({ roomId }: { roomId: string }, callback?: (info: any) => void) => {
        const room = this.rooms.get(roomId);
        if (!room) {
          const info = {
            gameStarted: false,
            players: [],
            boardUsers: 0,
            boardUserNames: [],
          };
          if (callback) callback(info);
          return;
        }

        const info = {
          gameStarted: !!room.game,
          players: room.players.map(id => ({
            id,
            name: room.playerNames.get(id) || 'Unknown'
          })),
          boardUsers: room.boardUsers.length,
          boardUserNames: room.boardUsers.map(sid => room.boardUserNames.get(sid) || 'Unknown'),
        };
        if (callback) callback(info);
      });

      // Switch device for an existing player
      socket.on(EVENTS.SWITCH_DEVICE, ({ roomId, targetUserId }: { roomId: string, targetUserId: string }) => {
        const room = this.rooms.get(roomId);
        if (!room || !room.game) {
          socket.emit(EVENTS.ERROR, { message: "Game not found or not started" });
          return;
        }

        // Check if target user exists in the game
        if (!room.players.includes(targetUserId)) {
          socket.emit(EVENTS.ERROR, { message: "Player not found in game" });
          return;
        }

        // Disconnect old socket if exists
        const oldSocketId = room.playerSockets.get(targetUserId);
        if (oldSocketId) {
          const oldSocket = this.io.sockets.sockets.get(oldSocketId);
          if (oldSocket) {
            oldSocket.disconnect();
          }
        }

        // Update socket mapping
        room.playerSockets.set(targetUserId, socket.id);
        socket.join(roomId);

        // Send current game state
        socket.emit(EVENTS.UPDATE_GAME_STATE, room.game.getState());
        console.log(`Device switched for user ${targetUserId} to socket ${socket.id}`);
      });

      socket.on(EVENTS.JOIN_ROOM, ({ roomId, asBoard, userId, name }: { roomId: string, asBoard?: boolean, userId?: string, name?: string }) => {
        let room = this.rooms.get(roomId);
        if (!room) {
          room = { players: [], playerNames: new Map(), playerSockets: new Map(), boardUsers: [], boardUserNames: new Map() };
          this.rooms.set(roomId, room);
        }

        if (asBoard) {
          room.boardUsers.push(socket.id);
          // ???????????UUID??????????
          const boardUserId = randomUUID();
          room.boardUserNames.set(socket.id, boardUserId);
        } else {
          // If no userId provided, fallback to socket.id (should not happen with updated client)
          const uid = userId || socket.id;
          if (name) room.playerNames.set(uid, name);

          // Check if player is already in the room (reconnection)
          if (room.players.includes(uid)) {
              console.log(`User ${uid} reconnected with socket ${socket.id}`);

              // Disconnect old socket if exists
              const oldSocketId = room.playerSockets.get(uid);
              if (oldSocketId && oldSocketId !== socket.id) {
                const oldSocket = this.io.sockets.sockets.get(oldSocketId);
                if (oldSocket) {
                  oldSocket.disconnect();
                }
              }

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

          // Game already started - check if we can reconnect with same userId
          if (room.game) {
            // If userId matches an existing player, allow reconnection
            if (uid && room.players.includes(uid)) {
              // Disconnect old socket if exists
              const oldSocketId = room.playerSockets.get(uid);
              if (oldSocketId && oldSocketId !== socket.id) {
                const oldSocket = this.io.sockets.sockets.get(oldSocketId);
                if (oldSocket) {
                  oldSocket.disconnect();
                }
              }

              room.playerSockets.set(uid, socket.id);
              socket.join(roomId);
              socket.emit(EVENTS.UPDATE_GAME_STATE, room.game.getState());
              console.log(`User ${uid} reconnected to started game with socket ${socket.id}`);
              return;
            }

            // Game started but userId doesn't match - return available players for device switch
            socket.emit(EVENTS.ERROR, {
              message: "Game already started",
              availablePlayers: room.players.map(id => ({
                id,
                name: room.playerNames.get(id) || 'Unknown'
              }))
            });
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
        console.log(`User ${userId || socket.id} (${name || 'unknown'}) joined room ${roomId} (board user: ${!!asBoard})`);

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

        room.game = new GalaxoreGame(playerConfigs);
        this.broadcastState(roomId);
      });

      socket.on(EVENTS.RESET_GAME, ({ roomId }: { roomId: string }) => {
        const room = this.rooms.get(roomId);
        if (!room) return;

        // Only allow board user or players to reset?
        // For local game, anyone in room can reset is probably fine or restrict to board user.
        // Assuming board user is usually the one managing the board.

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

        // Allow board user to set winning score
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
            case 'TAKE_ORES':
              room.game.takeOres(userId, action.payload.ores);
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
           // If board user, remove
           const wasBoardUser = room.boardUsers.includes(socket.id);
           if (wasBoardUser) {
             room.boardUsers = room.boardUsers.filter(p => p !== socket.id);
             room.boardUserNames.delete(socket.id);
             this.broadcastState(roomId);
           }

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
        boardUsers: room.boardUsers.length,
        boardUserNames: room.boardUsers.map(sid => room.boardUserNames.get(sid) || 'Unknown')
      });
    }
  }
}
