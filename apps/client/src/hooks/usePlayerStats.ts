import { Player, GemColor, TokenColor } from '@local-splendor/shared';
import { calculateTokenCounts, calculateBonuses } from '../utils/game';
import { GEM_ORDER } from '../constants/gems';

export function usePlayerStats(player: Player) {
  const tokenCounts = calculateTokenCounts(player);
  const bonusCounts = calculateBonuses(player);

  const totalTokens = Object.values(player.tokens).reduce((a, b) => a + (b || 0), 0);

  const hasAnyGems = GEM_ORDER.some(c => (bonusCounts[c] > 0) || (tokenCounts[c] > 0)) || (tokenCounts['gold'] > 0);

  return {
    tokenCounts,
    bonusCounts,
    totalTokens,
    hasAnyGems,
  };
}
