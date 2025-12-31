import {
  GameState,
  Player,
  Card,
  Noble,
  TokenColor,
  GemColor,
  INITIAL_TOKENS,
  NOBLES_COUNT,
  WINNING_SCORE,
  MAX_RESERVED_CARDS,
  GEM_COLORS,
} from '@local-splendor/shared';
import { CARDS_1, CARDS_2, CARDS_3, NOBLES } from './card-data';

export class SplendorGame {
  private state: GameState;
  private decks: { 1: Card[]; 2: Card[]; 3: Card[] };

  constructor(playerIds: string[]) {
    this.decks = { 1: [], 2: [], 3: [] }; // Initialized in initializeGame
    this.state = this.initializeGame(playerIds);
  }

  public getState(): GameState {
    return this.state;
  }

  private initializeGame(playerIds: string[]): GameState {
    const playerCount = playerIds.length as 2 | 3 | 4;
    const initialTokens = INITIAL_TOKENS[playerCount];

    // Shuffle and store in private decks
    this.decks = {
      1: [...CARDS_1].sort(() => Math.random() - 0.5),
      2: [...CARDS_2].sort(() => Math.random() - 0.5),
      3: [...CARDS_3].sort(() => Math.random() - 0.5),
    };

    const selectedNobles = [...NOBLES].sort(() => Math.random() - 0.5).slice(0, NOBLES_COUNT[playerCount]);

    // Assign random unique image indices (0-5) to cloned noble objects
    const imageIndices = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
    const nobles = selectedNobles.map((noble, i) => ({
        ...noble,
        imageIndex: imageIndices[i % imageIndices.length]
    }));

    return {
      players: playerIds.map((id, index) => ({
        id,
        name: `Player ${index + 1}`,
        tokens: {},
        cards: [],
        reserved: [],
        score: 0,
      })),
      board: {
        nobles,
        cards: {
          1: this.decks[1].splice(0, 4),
          2: this.decks[2].splice(0, 4),
          3: this.decks[3].splice(0, 4),
        },
        decks: {
          1: this.decks[1].length,
          2: this.decks[2].length,
          3: this.decks[3].length,
        },
        tokens: {
          emerald: initialTokens.regular,
          sapphire: initialTokens.regular,
          ruby: initialTokens.regular,
          diamond: initialTokens.regular,
          onyx: initialTokens.regular,
          gold: initialTokens.gold,
        },
      },
      currentPlayerIndex: 0,
      turn: 1,
      winner: null,
      gameEnded: false,
    };
  }

  // --- Actions ---

  public takeGems(playerId: string, gems: GemColor[]) {
    this.validateTurn(playerId);

    const boardTokens = this.state.board.tokens;

    if (gems.length === 3) {
      if (new Set(gems).size !== 3) throw new Error("Must choose 3 different colors");
      gems.forEach(color => {
         if ((boardTokens[color] || 0) < 1) throw new Error(`Not enough ${color} tokens`);
      });
    } else if (gems.length === 2) {
      if (gems[0] !== gems[1]) throw new Error("Must be same color for 2 tokens");
      if ((boardTokens[gems[0]] || 0) < 4) throw new Error(`Need at least 4 tokens to take 2`);
    } else {
      throw new Error("Invalid gem selection count");
    }

    const player = this.getPlayer(playerId);
    gems.forEach(color => {
      this.state.board.tokens[color]! -= 1;
      player.tokens[color] = (player.tokens[color] || 0) + 1;
    });

    this.endTurn();
  }

  public reserveCard(playerId: string, cardId: string) {
    this.validateTurn(playerId);
    const player = this.getPlayer(playerId);
    if (player.reserved.length >= MAX_RESERVED_CARDS) throw new Error("Max reserved cards reached");

    const { card, level } = this.findCardOnBoard(cardId);
    if (!card) throw new Error("Card not found");

    player.reserved.push(card);
    this.replaceCardOnBoard(card.id, level);

    if ((this.state.board.tokens.gold || 0) > 0) {
      this.state.board.tokens.gold! -= 1;
      player.tokens.gold = (player.tokens.gold || 0) + 1;
    }

    this.endTurn();
  }

  public buyCard(playerId: string, cardId: string) {
    this.validateTurn(playerId);
    const player = this.getPlayer(playerId);

    let card = player.reserved.find(c => c.id === cardId);
    let fromReserved = true;
    let level: 1 | 2 | 3 = 1;

    if (!card) {
      const found = this.findCardOnBoard(cardId);
      if (!found.card) throw new Error("Card not found");
      card = found.card;
      level = found.level;
      fromReserved = false;
    }

    const cost = card.cost;
    const discount = this.getPlayerDiscount(player);
    let goldNeeded = 0;
    const payment: { [key in TokenColor]?: number } = {};

    for (const color of GEM_COLORS) {
      if (color === 'gold') continue;
      const req = Math.max(0, (cost[color] || 0) - (discount[color] || 0));
      const available = player.tokens[color] || 0;

      if (available >= req) {
        payment[color] = req;
      } else {
        payment[color] = available;
        goldNeeded += (req - available);
      }
    }

    if ((player.tokens.gold || 0) < goldNeeded) throw new Error("Not enough resources");

    Object.entries(payment).forEach(([color, amount]) => {
      player.tokens[color as GemColor]! -= amount;
      this.state.board.tokens[color as GemColor]! += amount;
    });
    if (goldNeeded > 0) {
      player.tokens.gold! -= goldNeeded;
      this.state.board.tokens.gold! += goldNeeded;
    }

    player.cards.push(card);
    player.score += card.points;

    if (fromReserved) {
      player.reserved = player.reserved.filter(c => c.id !== card.id);
    } else {
      this.replaceCardOnBoard(card.id, level);
    }

    this.checkNobles(player);
    this.endTurn();
  }

  // --- Helpers ---

  private getPlayer(id: string) {
    return this.state.players.find(p => p.id === id)!;
  }

  private validateTurn(playerId: string) {
    const current = this.state.players[this.state.currentPlayerIndex];
    if (current.id !== playerId) throw new Error("Not your turn");
  }

  private findCardOnBoard(cardId: string): { card: Card | undefined, level: 1 | 2 | 3 } {
    for (const l of [1, 2, 3] as const) {
      const card = this.state.board.cards[l].find(c => c.id === cardId);
      if (card) return { card, level: l };
    }
    return { card: undefined, level: 1 };
  }

  private replaceCardOnBoard(cardId: string, level: 1 | 2 | 3) {
    const row = this.state.board.cards[level];
    const idx = row.findIndex(c => c.id === cardId);
    if (idx !== -1) {
      if (this.decks[level].length > 0) {
        row[idx] = this.decks[level].pop()!;
        this.state.board.decks[level] = this.decks[level].length;
      } else {
        row.splice(idx, 1);
      }
    }
  }

  private getPlayerDiscount(player: Player): { [key in GemColor]?: number } {
    const discount: { [key in GemColor]?: number } = {};
    player.cards.forEach(c => {
      discount[c.gem] = (discount[c.gem] || 0) + 1;
    });
    return discount;
  }

  private checkNobles(player: Player) {
    const discount = this.getPlayerDiscount(player);
    const nobleIndex = this.state.board.nobles.findIndex(n => {
      return Object.entries(n.requirements).every(([color, count]) => (discount[color as GemColor] || 0) >= count);
    });

    if (nobleIndex !== -1) {
      const noble = this.state.board.nobles[nobleIndex];
      player.score += noble.points;
      this.state.board.nobles.splice(nobleIndex, 1);
    }
  }

  private endTurn() {
    this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    if (this.state.currentPlayerIndex === 0) {
        this.state.turn++;
        const winner = this.getWinner();
        if (winner) {
            this.state.winner = winner.id;
            this.state.gameEnded = true;
        }
    }
  }

  private getWinner(): Player | null {
      // Check if any player reached 15 VP. If so, round finishes, then check max score.
      // My logic in endTurn checks this at the start of next round (when index wraps to 0).
      // So effectively we play until all players have equal turns.

      const candidates = this.state.players.filter(p => p.score >= WINNING_SCORE);
      if (candidates.length === 0) return null;

      candidates.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.cards.length - b.cards.length;
      });

      return candidates[0];
  }
}
