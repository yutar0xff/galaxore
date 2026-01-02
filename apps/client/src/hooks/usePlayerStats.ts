import { Player, OreColor, TokenColor } from "@galaxore/shared";
import { calculateTokenCounts, calculateBonuses } from "../utils/game";
import { ORE_ORDER } from "../constants/ores";

export function usePlayerStats(player: Player) {
  const tokenCounts = calculateTokenCounts(player);
  const bonusCounts = calculateBonuses(player);

  const totalTokens = Object.values(player.tokens).reduce(
    (a, b) => a + (b || 0),
    0,
  );

  const hasAnyOres =
    ORE_ORDER.some((c) => bonusCounts[c] > 0 || tokenCounts[c] > 0) ||
    tokenCounts["gold"] > 0;

  return {
    tokenCounts,
    bonusCounts,
    totalTokens,
    hasAnyOres,
  };
}
