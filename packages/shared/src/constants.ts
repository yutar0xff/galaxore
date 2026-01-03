import { TokenColor } from './types';

export const EVENTS = {
  JOIN_ROOM: 'join_room',
  START_GAME: 'start_game',
  GAME_ACTION: 'game_action',
  UPDATE_GAME_STATE: 'update_game_state',
  ERROR: 'error',
  DISCONNECT: 'disconnect',
  RESET_GAME: 'reset_game',
  GAME_RESET: 'game_reset', // Notification to clients that game was reset
  GET_ROOM_INFO: 'get_room_info', // Get room info without joining
  SWITCH_DEVICE: 'switch_device', // Switch device for an existing player
};

export const ORE_COLORS: TokenColor[] = ['ruby', 'emerald', 'sapphire', 'diamond', 'onyx', 'gold'];

export const INITIAL_TOKENS = {
  2: { regular: 4, gold: 5 },
  3: { regular: 5, gold: 5 },
  4: { regular: 7, gold: 5 },
  5: { regular: 9, gold: 7 },
  6: { regular: 10, gold: 8 },
};

export const NOBLES_COUNT = {
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 7,
};

export const BOARD_CARDS_COUNT = {
  2: 4,
  3: 4,
  4: 4,
  5: 5,
  6: 6,
};

export const WINNING_SCORE = 15;
export const MAX_RESERVED_CARDS = 3;
export const MAX_TOKENS = 10;
