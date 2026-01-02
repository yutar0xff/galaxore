export type OreColor = 'emerald' | 'sapphire' | 'ruby' | 'diamond' | 'onyx';
export type TokenColor = OreColor | 'gold';

export interface Cost {
  [key: string]: number; // OreColor: quantity
}

export interface Card {
  id: string;
  level: 1 | 2 | 3;
  points: number;
  cost: Cost;
  ore: OreColor; // Bonus provided
}

export interface Noble {
  id: string;
  points: number;
  requirements: Cost; // Bonus ores required
  imageIndex?: number; // 0-5, assigned at game start
}

export interface Player {
  id: string;
  name: string;
  tokens: { [key in TokenColor]?: number }; // Owned tokens
  cards: Card[]; // Purchased cards
  reserved: Card[]; // Reserved cards (max 3)
  score: number; // Current VP
}

export interface GameState {
  players: Player[];
  board: {
    nobles: Noble[];
    cards: {
      1: Card[];
      2: Card[];
      3: Card[];
    };
    tokens: { [key in TokenColor]?: number }; // Supply
    decks: {
      1: number; // Remaining count
      2: number;
      3: number;
    };
  };
  currentPlayerIndex: number;
  turn: number;
  winner: string | null; // Player ID
  gameEnded: boolean;
  phase: 'NORMAL' | 'DISCARDING';
  lastAction: LastActionInfo | null;
  winningScore: number;
}

export interface LastActionInfo {
  type: ActionType;
  playerName: string;
  card?: Card; // Reserved or bought card
  tokens?: { [key in TokenColor]?: number }; // Tokens taken or discarded
}

export type ActionType = 'TAKE_ORES' | 'RESERVE_CARD' | 'BUY_CARD' | 'DISCARD_TOKENS' | 'SET_WINNING_SCORE';

export interface Action {
  type: ActionType;
  payload: any;
}
