import { TokenColor } from './types';

export const EVENTS = {
  JOIN_ROOM: 'join_room',
  START_GAME: 'start_game',
  GAME_ACTION: 'game_action',
  UPDATE_GAME_STATE: 'update_game_state',
  ERROR: 'error',
  DISCONNECT: 'disconnect',
};

export const GEM_COLORS: TokenColor[] = ['emerald', 'sapphire', 'ruby', 'diamond', 'onyx', 'gold'];

export const INITIAL_TOKENS = {
  2: { regular: 4, gold: 5 },
  3: { regular: 5, gold: 5 },
  4: { regular: 7, gold: 5 },
};

export const NOBLES_COUNT = {
  2: 3,
  3: 4,
  4: 5,
};

export const WINNING_SCORE = 15;
export const MAX_RESERVED_CARDS = 3;
export const MAX_TOKENS = 10;
