import {
  Card as CardType,
  Player,
  GemColor,
  TokenColor,
} from "@local-splendor/shared";
import { GEM_ORDER } from "../constants/gems";

/**
 * Calculate discount (bonuses) from player's cards
 */
export function calculateDiscount(player: Player): Record<GemColor, number> {
  const discount: Record<GemColor, number> = {
    emerald: 0,
    sapphire: 0,
    ruby: 0,
    diamond: 0,
    onyx: 0,
  };
  player.cards.forEach((c) => {
    discount[c.gem]++;
  });
  return discount;
}

/**
 * Calculate token counts from player's tokens
 */
export function calculateTokenCounts(
  player: Player,
): Record<TokenColor, number> {
  const tokenCounts: Record<TokenColor, number> = {
    emerald: 0,
    sapphire: 0,
    ruby: 0,
    diamond: 0,
    onyx: 0,
    gold: 0,
  };
  (Object.keys(player.tokens) as TokenColor[]).forEach((color) => {
    const count = player.tokens[color];
    if (count && count > 0) {
      tokenCounts[color] = count;
    }
  });
  return tokenCounts;
}

/**
 * Check if a player can afford a card
 */
export function canAffordCard(card: CardType, player: Player): boolean {
  const discount = calculateDiscount(player);

  let goldNeeded = 0;
  for (const color of GEM_ORDER) {
    const cost = card.cost[color] || 0;
    const bonus = discount[color] || 0;
    const req = Math.max(0, cost - bonus);
    const available = player.tokens[color] || 0;
    if (available < req) {
      goldNeeded += req - available;
    }
  }
  return (player.tokens.gold || 0) >= goldNeeded;
}

/**
 * Calculate missing gems for a card
 */
export function getMissingGems(
  card: CardType,
  player: Player,
): Record<GemColor, number> {
  const discount = calculateDiscount(player);

  const missing: Record<GemColor, number> = {
    emerald: 0,
    sapphire: 0,
    ruby: 0,
    diamond: 0,
    onyx: 0,
  };

  for (const color of GEM_ORDER) {
    const cost = card.cost[color] || 0;
    const bonus = discount[color] || 0;
    const req = Math.max(0, cost - bonus);
    const available = player.tokens[color] || 0;
    if (available < req) {
      missing[color] = req - available;
    }
  }

  return missing;
}

/**
 * Calculate bonuses from player's cards
 */
export function calculateBonuses(player: Player): Record<GemColor, number> {
  const bonusCounts: Record<GemColor, number> = {
    emerald: 0,
    sapphire: 0,
    ruby: 0,
    diamond: 0,
    onyx: 0,
  };
  player.cards.forEach((card) => {
    bonusCounts[card.gem]++;
  });
  return bonusCounts;
}

/**
 * Calculate number of nobles visited by a player
 */
export function calculateNoblesVisited(player: Player): number {
  const cardPoints = player.cards.reduce((sum, c) => sum + c.points, 0);
  return Math.max(0, (player.score - cardPoints) / 3);
}
