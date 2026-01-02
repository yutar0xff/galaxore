import React from "react";
import { Player, OreColor, TokenColor } from "@galaxore/shared";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
  ORE_BORDER_COLORS,
  ORE_ORDER,
  ALL_TOKEN_COLORS,
} from "../../constants/ores";
import { ORE_IMAGES } from "../ui/Token";
import { calculateNoblesVisited, calculateBonuses } from "../../utils/game";

interface PlayersListProps {
  players: Player[];
  currentPlayerIndex: number;
}

export function PlayersList({ players, currentPlayerIndex }: PlayersListProps) {
  const { t } = useTranslation();

  return (
    <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-1">
      {players.map((p, idx) => {
        const bonuses = calculateBonuses(p);
        const noblesVisited = calculateNoblesVisited(p);

        return (
          <div
            key={p.id}
            className={`flex-shrink-0 rounded-xl border-2 p-3 transition-all duration-300 ${
              idx === currentPlayerIndex
                ? "border-amber-500 bg-gradient-to-br from-amber-900/90 to-slate-900/90 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "border-slate-700 bg-slate-800/60 hover:bg-slate-800/80"
            }`}
          >
            {/* Player Name, Score, Res, Nobles in one row */}
            <div className="mb-2 flex items-center gap-3">
              <div
                className={clsx(
                  "flex-1 truncate font-serif text-lg tracking-wide",
                  idx === currentPlayerIndex
                    ? "font-bold text-amber-100"
                    : "text-slate-300",
                )}
              >
                {p.name}
              </div>
              <div className="font-serif text-2xl font-black text-amber-400 drop-shadow-md">
                {p.score}
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-black/40 px-2 py-1">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {t("Res")}
                </span>
                <span className="text-base font-bold text-white">
                  {p.reserved.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-black/40 px-2 py-1">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {t("Nobles")}
                </span>
                <span className="text-base font-bold text-white">
                  {noblesVisited}
                </span>
              </div>
            </div>

            {/* Tokens & Bonuses - Always 2 rows */}
            <div className="flex flex-col gap-1.5">
              {/* Tokens */}
              <div className="flex min-h-[56px] flex-wrap items-center gap-2">
                {ALL_TOKEN_COLORS.map((color) => {
                  const count = p.tokens[color] || 0;
                  return count > 0 ? (
                    <div key={color} className="relative flex-shrink-0">
                      <div
                        className={clsx(
                          "h-14 w-14 overflow-hidden rounded-full border-2 shadow-sm",
                          color === "gold"
                            ? "border-yellow-600"
                            : "border-gray-400",
                        )}
                      >
                        <img
                          src={ORE_IMAGES[color]}
                          alt={color}
                          className="h-full w-full scale-150 object-cover"
                        />
                      </div>
                      <span className="absolute -top-2 -right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-900 text-xl font-black text-white shadow-lg">
                        {count}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>

              <div className="h-px w-full bg-slate-600/30"></div>

              {/* Bonuses */}
              <div className="flex min-h-[56px] flex-wrap gap-2">
                {ORE_ORDER.map((color) => {
                  const count = bonuses[color] || 0;
                  return count > 0 ? (
                    <div key={color} className="relative flex-shrink-0">
                      <div
                        className={clsx(
                          "h-14 w-14 overflow-hidden rounded-sm border-2 shadow-sm",
                          ORE_BORDER_COLORS[color],
                        )}
                      >
                        <img
                          src={ORE_IMAGES[color]}
                          alt={color}
                          className="h-full w-full scale-150 object-cover"
                        />
                      </div>
                      <span className="absolute -top-2 -right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-900 text-xl font-black text-white shadow-lg">
                        {count}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
