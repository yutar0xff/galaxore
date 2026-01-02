import React from "react";
import { Player, GemColor } from "@local-splendor/shared";
import clsx from "clsx";
import { GEM_BORDER_COLORS_WITH_GOLD, GEM_ORDER } from "../../constants/gems";
import { GEM_IMAGES } from "../ui/Token";
import { usePlayerStats } from "../../hooks/usePlayerStats";

interface ResourcesHeaderProps {
  player: Player;
}

export function ResourcesHeader({ player }: ResourcesHeaderProps) {
  const { tokenCounts, bonusCounts } = usePlayerStats(player);
  const allGemColors: GemColor[] = GEM_ORDER;

  return (
    <div className="mb-4 overflow-x-auto rounded-xl border border-gray-700 bg-gray-800 p-3">
      <div className="mx-auto flex min-w-min justify-center gap-4">
        {allGemColors.map((color) => {
          const bonus = bonusCounts[color] || 0;
          const token = tokenCounts[color] || 0;

          return (
            <div key={color} className="flex flex-col items-center gap-2">
              {/* Bonus (Square) */}
              <div className="relative">
                <div
                  className={clsx(
                    "h-10 w-10 overflow-hidden rounded-sm border-2",
                    GEM_BORDER_COLORS_WITH_GOLD[color],
                    bonus === 0 && "opacity-30 grayscale",
                  )}
                >
                  <img
                    src={GEM_IMAGES[color]}
                    alt={color}
                    className="h-full w-full scale-150 object-cover"
                  />
                </div>
                <span className="absolute -right-2 -bottom-2 flex h-5 w-5 items-center justify-center rounded-full border border-gray-500 bg-slate-900 text-xs font-bold text-white shadow-md">
                  {bonus}
                </span>
              </div>

              {/* Token (Circle) */}
              <div className="relative">
                <div
                  className={clsx(
                    "h-10 w-10 overflow-hidden rounded-full border-2",
                    GEM_BORDER_COLORS_WITH_GOLD[color],
                    token === 0 && "opacity-30 grayscale",
                  )}
                >
                  <img
                    src={GEM_IMAGES[color]}
                    alt={color}
                    className="h-full w-full scale-150 object-cover"
                  />
                </div>
                <span className="absolute -right-2 -bottom-2 flex h-5 w-5 items-center justify-center rounded-full border border-gray-500 bg-slate-900 text-xs font-bold text-white shadow-md">
                  {token}
                </span>
              </div>
            </div>
          );
        })}

        {/* Gold Token */}
        <div className="flex flex-col items-center justify-end gap-2">
          <div className="h-10 w-10 opacity-0"></div>{" "}
          {/* Spacer for alignment with bonus row */}
          <div className="relative">
            <div
              className={clsx(
                "h-10 w-10 overflow-hidden rounded-full border-2 border-yellow-600",
                !tokenCounts["gold"] && "opacity-30 grayscale",
              )}
            >
              <img
                src={GEM_IMAGES["gold"]}
                alt="gold"
                className="h-full w-full scale-150 object-cover"
              />
            </div>
            <span className="absolute -right-2 -bottom-2 flex h-5 w-5 items-center justify-center rounded-full border border-gray-500 bg-slate-900 text-xs font-bold text-white shadow-md">
              {tokenCounts["gold"] || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
