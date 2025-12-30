export type GemColor = 'emerald' | 'sapphire' | 'ruby' | 'diamond' | 'onyx';
export type TokenColor = GemColor | 'gold';

export interface Cost {
  [key: string]: number; // GemColor: quantity
}

export interface Card {
  id: string;
  level: 1 | 2 | 3;
  points: number;
  cost: Cost;
  gem: GemColor; // Bonus provided
}

export interface Noble {
  id: string;
  points: number;
  requirements: Cost; // Bonus gems required
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
}

export type ActionType = 'TAKE_GEMS' | 'RESERVE_CARD' | 'BUY_CARD';

export interface Action {
  type: ActionType;
  payload: any;
}
