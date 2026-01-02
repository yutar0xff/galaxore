import React, { useState } from "react";
import { Player, TokenColor } from "@local-splendor/shared";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Minus, Plus } from "lucide-react";
import {
  GEM_BORDER_COLORS_WITH_GOLD,
  ALL_TOKEN_COLORS,
} from "../../constants/gems";
import { GEM_IMAGES } from "../ui/Token";
import { calculateTokenCounts } from "../../utils/game";
import { MAX_TOKENS } from "../../constants/game";
import { TokenPayment } from "../../types/game";

interface DiscardTokensViewProps {
  player: Player;
  onDiscard: (tokens: Partial<Record<TokenColor, number>>) => void;
}

export function DiscardTokensView({
  player,
  onDiscard,
}: DiscardTokensViewProps) {
  const { t } = useTranslation();
  const [toDiscard, setToDiscard] = useState<TokenPayment>({});
  const currentTokens = calculateTokenCounts(player);

  let total = 0;
  Object.values(currentTokens).forEach((count) => {
    total += count;
  });

  const discardCount = Object.values(toDiscard).reduce(
    (a, b) => a + (b || 0),
    0,
  );
  const remaining = total - discardCount;
  const valid = remaining <= MAX_TOKENS;

  const handleAdjust = (color: TokenColor, delta: number) => {
    const current = toDiscard[color] || 0;
    const owned = currentTokens[color] || 0;
    const newValue = current + delta;

    if (newValue < 0) return;
    if (newValue > owned) return;

    setToDiscard({ ...toDiscard, [color]: newValue });
  };

  const submitDiscard = () => {
    onDiscard(toDiscard);
  };

  return (
    <div className="space-y-4 rounded-xl border border-red-500/50 bg-red-900/20 p-4">
      <h3 className="text-center text-xl font-bold text-red-400">
        {t("Too Many Tokens!")}
      </h3>
      <p className="mb-4 text-center text-gray-300">
        {t("You have")} {total} {t("tokens")}. {t("Discard until")} {MAX_TOKENS}
        .
      </p>

      <div className="mb-4 flex justify-center text-4xl font-bold">
        <span className={clsx(valid ? "text-green-500" : "text-red-500")}>
          {remaining}
        </span>
        <span className="text-gray-500">/ {MAX_TOKENS}</span>
      </div>

      <div className="space-y-2">
        {ALL_TOKEN_COLORS.map((color) => {
          const count = currentTokens[color];
          if (!count || count <= 0) return null;
          return (
            <div
              key={color}
              className="flex items-center justify-between rounded-lg bg-gray-800 p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    "h-8 w-8 overflow-hidden rounded-full border-2",
                    GEM_BORDER_COLORS_WITH_GOLD[color],
                  )}
                >
                  <img
                    src={GEM_IMAGES[color]}
                    className="h-full w-full scale-150 object-cover"
                  />
                </div>
                <span className="font-bold text-gray-300">x {count}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAdjust(color, -1)}
                  className="rounded bg-gray-700 p-2 text-white"
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center font-bold">
                  {toDiscard[color] || 0}
                </span>
                <button
                  onClick={() => handleAdjust(color, 1)}
                  className="rounded bg-gray-700 p-2 text-white"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={submitDiscard}
        disabled={!valid}
        className="mt-4 w-full rounded-xl bg-red-600 py-4 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("Discard Selected")}
      </button>
    </div>
  );
}
