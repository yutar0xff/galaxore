import React from "react";
import { Player, GameState, GemColor } from "@local-splendor/shared";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Token } from "../ui/Token";
import { ResourcesHeader } from "./ResourcesHeader";
import { GEM_ORDER } from "../../constants/gems";

interface TakeGemsViewProps {
  player: Player;
  gameState: GameState;
  selectedTokens: GemColor[];
  onTokenClick: (color: GemColor) => void;
  onSubmit: () => void;
  isMyTurn: boolean;
}

export function TakeGemsView({
  player,
  gameState,
  selectedTokens,
  onTokenClick,
  onSubmit,
  isMyTurn,
}: TakeGemsViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Current Owned Tokens Section */}
      <ResourcesHeader player={player} />

      <div className="rounded-xl bg-gray-800 p-4">
        <h3 className="mb-4 text-center text-sm font-bold tracking-wide text-gray-400 uppercase">
          {t("Select Tokens to Take")}
        </h3>
        <div className="mb-6 flex flex-wrap justify-center gap-4">
          {GEM_ORDER.map((color) => (
            <div
              key={color}
              className={`relative transition-all duration-200 ${selectedTokens.includes(color) ? "scale-110 rounded-full ring-4 ring-white" : ""}`}
            >
              <Token
                color={color}
                count={gameState.board.tokens[color]}
                onClick={() => onTokenClick(color)}
              />
              {selectedTokens.filter((c) => c === color).length > 0 && (
                <div className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold">
                  {selectedTokens.filter((c) => c === color).length}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mb-4 text-center text-sm text-gray-400">
          {selectedTokens.length === 0 &&
            t("Select 3 different colors or 2 same color")}
          {selectedTokens.length > 0 &&
            selectedTokens.length < 3 &&
            new Set(selectedTokens).size === selectedTokens.length &&
            t("Select up to 3 different colors")}
          {selectedTokens.length === 2 &&
            selectedTokens[0] === selectedTokens[1] &&
            t("2 same color selected")}
        </div>

        <button
          onClick={onSubmit}
          disabled={selectedTokens.length === 0 || !isMyTurn}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          <Check size={20} />
          {isMyTurn ? t("Confirm") : t("Not your turn")}
        </button>
      </div>
    </div>
  );
}
