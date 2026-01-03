import React from "react";
import { Player, GameState, TokenColor, OreColor } from "@galaxore/shared";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Card } from "../ui/Card";
import { Token, ORE_IMAGES } from "../ui/Token";
import {
  ORE_BORDER_COLORS_WITH_GOLD,
  ORE_ORDER,
  ALL_TOKEN_COLORS,
} from "../../constants/ores";
import { changeLanguage as changeLanguageUtil } from "../../utils/i18n";
import { i18n as I18nType } from "i18next";
import { MAX_TOKENS } from "../../constants/game";
import { usePlayerStats } from "../../hooks/usePlayerStats";

interface DashboardProps {
  player: Player;
  gameState: GameState;
  i18n: I18nType;
}

export function Dashboard({ player, gameState, i18n }: DashboardProps) {
  const { t } = useTranslation();
  const { tokenCounts, bonusCounts, totalTokens, hasAnyOres } =
    usePlayerStats(player);
  const allOreColors: OreColor[] = ORE_ORDER;

  return (
    <div className="flex h-full flex-col">
      {/* Last Action */}
      {gameState.lastAction && (
        <div className="relative mx-2 mt-4 mb-6 flex min-h-[120px] flex-col justify-center rounded-2xl border border-slate-700 bg-slate-800/80 px-6 py-4 shadow-xl backdrop-blur-sm">
          <span className="absolute -top-2 -left-2 rounded border border-slate-700 bg-slate-900 px-2 py-0.5 font-sans text-xs font-bold tracking-widest text-slate-400 uppercase">
            Last
          </span>

          {/* Layout changes based on action type */}
          {gameState.lastAction.type === "BUY_CARD" ||
          gameState.lastAction.type === "RESERVE_CARD" ? (
            /* Card: Horizontal Layout */
            <div className="flex items-center gap-6">
              <div className="flex flex-1 flex-col">
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-bold text-amber-400">
                    {gameState.lastAction.playerName}
                  </span>
                  <span className="text-sm font-semibold text-gray-300">
                    {gameState.lastAction.type === "BUY_CARD"
                      ? t("bought a card")
                      : t("reserved a card")}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-1">
                <div className="origin-center scale-100">
                  <Card card={gameState.lastAction.card!} size="sm" />
                </div>
                <div className="mt-1 text-xs font-bold text-slate-400 uppercase">
                  {gameState.lastAction.type === "RESERVE_CARD"
                    ? t("Reserved")
                    : t("Bought")}
                </div>
              </div>
            </div>
          ) : (
            /* Token: Vertical Layout */
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-bold text-amber-400">
                  {gameState.lastAction.playerName}
                </span>
                <span className="text-sm font-semibold text-gray-300">
                  {gameState.lastAction.type === "TAKE_ORES" &&
                    t("took tokens")}
                  {gameState.lastAction.type === "DISCARD_TOKENS" &&
                    t("discarded tokens")}
                </span>
              </div>
              <div className="flex min-h-[80px] items-center justify-center rounded-xl bg-black/30 p-3">
                <div className="flex gap-4">
                  {ALL_TOKEN_COLORS.map((color) => {
                    const count = gameState.lastAction?.tokens?.[color];
                    return count && count > 0 ? (
                      <Token
                        key={color}
                        color={color}
                        count={count}
                        size="lg"
                      />
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Board Tokens */}
      <div className="relative mx-2 mb-6 rounded-2xl border border-slate-700 bg-slate-800/80 px-6 py-4 shadow-xl backdrop-blur-sm">
        <span className="absolute -top-2 -left-2 rounded border border-slate-700 bg-slate-900 px-2 py-0.5 font-sans text-xs font-bold tracking-widest text-slate-400 uppercase">
          {t("Resources")}
        </span>
        <div className="flex justify-center gap-4">
          {ALL_TOKEN_COLORS.map((c) => (
            <div key={c} className="flex flex-col items-center">
              <div
                className={clsx(
                  "h-10 w-10 overflow-hidden rounded-full border-2 border-gray-500 shadow-md",
                  ORE_BORDER_COLORS_WITH_GOLD[c],
                )}
              >
                <img
                  src={ORE_IMAGES[c]}
                  className="h-full w-full scale-150 object-cover"
                />
              </div>
              <span className="mt-2 text-base font-bold text-gray-200">
                {gameState.board.tokens[c] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Header: Player name and score */}
      <div className="mt-2 mb-6 flex items-center justify-between px-4">
        <span className="font-serif text-3xl font-bold tracking-tight text-white">
          {player.name}
        </span>
        <div className="flex items-center gap-6">
          <div className="flex rounded-xl border border-slate-700 bg-slate-800 p-1">
            <button
              onClick={() => changeLanguageUtil("en", i18n)}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${i18n.language === "en" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-slate-700"}`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguageUtil("ja", i18n)}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${i18n.language === "ja" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-slate-700"}`}
            >
              JA
            </button>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              {t("Score")}
            </span>
            <span className="font-mono text-4xl leading-none font-bold text-amber-400 drop-shadow-sm">
              {player.score}
            </span>
          </div>
        </div>
      </div>

      {/* Owned Ores Section - columns by color */}
      <div className="custom-scrollbar mb-24 flex-1 overflow-y-auto px-4">
        <div className="mb-6 flex items-baseline justify-between border-b border-gray-700 pb-3">
          <h3 className="text-lg font-bold tracking-wider text-gray-400 uppercase">
            {t("Owned Ores")}
          </h3>
          <div
            className={clsx(
              "rounded-full border px-4 py-1.5 text-base font-bold shadow-inner",
              totalTokens > MAX_TOKENS
                ? "border-red-500 bg-red-900/50 text-red-100"
                : "border-slate-600 bg-slate-800 text-slate-200",
            )}
          >
            Tokens: {totalTokens} / {MAX_TOKENS}
          </div>
        </div>
        <div className="flex flex-wrap justify-start gap-6">
          {/* Each color column: squares (bonuses) on top, circles (tokens) below */}
          {allOreColors.map((color) => {
            const bonus = bonusCounts[color] || 0;
            const token = tokenCounts[color] || 0;
            if (bonus === 0 && token === 0) return null;

            return (
              <div key={color} className="flex flex-col items-center gap-3">
                {/* Bonuses - squares with border */}
                {Array.from({ length: bonus }).map((_, i) => (
                  <div
                    key={`b-${i}`}
                    className={clsx(
                      "h-16 w-16 transform overflow-hidden rounded-xl border-4 shadow-lg transition-transform active:scale-95",
                      ORE_BORDER_COLORS_WITH_GOLD[color],
                    )}
                  >
                    <img
                      src={ORE_IMAGES[color]}
                      alt={color}
                      className="h-full w-full scale-150 object-cover"
                    />
                  </div>
                ))}
                {/* Tokens - circles with border */}
                {Array.from({ length: token }).map((_, i) => (
                  <div
                    key={`t-${i}`}
                    className={clsx(
                      "h-20 w-20 transform overflow-hidden rounded-full border-4 shadow-lg transition-transform active:scale-95",
                      ORE_BORDER_COLORS_WITH_GOLD[color],
                    )}
                  >
                    <img
                      src={ORE_IMAGES[color]}
                      alt={color}
                      className="h-full w-full scale-150 object-cover"
                    />
                  </div>
                ))}
              </div>
            );
          })}
          {/* Gold tokens column - circles with border */}
          {(tokenCounts["gold"] || 0) > 0 && (
            <div className="flex flex-col items-center gap-3">
              {Array.from({ length: tokenCounts["gold"] }).map((_, i) => (
                <div
                  key={`gold-${i}`}
                  className="h-20 w-20 transform overflow-hidden rounded-full border-4 border-yellow-600 shadow-lg transition-transform active:scale-95"
                >
                  <img
                    src={ORE_IMAGES["gold"]}
                    alt="gold"
                    className="h-full w-full scale-150 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        {!hasAnyOres && (
          <span className="mt-10 block text-center text-2xl font-semibold text-gray-500">
            {t("No Ores")}
          </span>
        )}
      </div>
    </div>
  );
}
