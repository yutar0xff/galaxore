import React from "react";
import { Card as CardType, OreColor } from "@galaxore/shared";
import clsx from "clsx";
import { ComponentSize } from "../../types/ui";
import {
  ORE_ORDER,
  ORE_BORDER_COLORS,
  ORE_IMAGES,
  ORE_5_IMAGES,
  ORE_COLORS,
} from "../../constants/ores";
import { LEVEL_IMAGES } from "../../constants/images";
import { ORE_THRESHOLD_FOR_5_IMAGE } from "../../constants/game";

const CARD_SIZES = {
  sm: {
    card: "w-20 h-28",
    points: "text-lg",
    ore: "w-5 h-5",
    costDot: "w-3 h-3",
    miniOre: "w-1 h-1",
    padding: "p-1.5",
    colGap: "gap-0.5",
    dotGap: "gap-0.5",
  },
  md: {
    card: "w-24 h-36",
    points: "text-xl",
    ore: "w-6 h-6",
    costDot: "w-8 h-8",
    miniOre: "w-1.5 h-1.5",
    padding: "p-2",
    colGap: "gap-1",
    dotGap: "gap-0.5",
  },
  lg: {
    card: "h-full w-auto max-w-full aspect-[2/3]",
    points: "text-4xl",
    ore: "w-12 h-12",
    costDot: "w-8 h-8",
    miniOre: "w-4 h-4",
    padding: "p-2",
    colGap: "gap-0.5",
    dotGap: "gap-0.5",
  },
  xl: {
    card: "w-[clamp(120px,9vw,220px)] h-full max-h-[22vh] aspect-[2/3]",
    points: "text-[clamp(1.5rem,2.2vw,3rem)]",
    ore: "w-[clamp(30px,2.5vw,50px)] h-[clamp(30px,2.5vw,50px)]",
    costDot: "w-[clamp(15px,1.4vw,25px)] h-[clamp(15px,1.4vw,25px)]",
    miniOre: "w-[clamp(5px,0.5vw,8px)] h-[clamp(5px,0.5vw,8px)]",
    padding: "p-[1vw]",
    colGap: "gap-[0.3vw]",
    dotGap: "gap-[0.2vw]",
  },
};

// Render ore display for a column - uses 5-ore image when count is 6+
function renderOreDisplay(count: number, color: OreColor) {
  const oreImage = ORE_IMAGES[color];
  const ore5Image = ORE_5_IMAGES[color];

  if (count <= ORE_THRESHOLD_FOR_5_IMAGE) {
    // Show individual ores (5個までは個別表示)
    // 上下左右20%をクロップ: divのサイズを列幅に合わせ（正方形）、画像を1.25倍に拡大してdivでクロップ
    return (
      <div className="flex h-full w-full flex-col-reverse gap-0.5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex w-full items-end overflow-hidden rounded-sm"
            style={{ aspectRatio: "1" }}
          >
            <div className="relative h-full w-full">
              <img
                src={oreImage}
                alt={color}
                className="absolute inset-0 h-full w-full scale-[1.25] object-cover object-center"
              />
            </div>
          </div>
        ))}
      </div>
    );
  } else {
    // 6+ ores: show 5-ore image at bottom, then remaining individual ores above
    const remainder = count - ORE_THRESHOLD_FOR_5_IMAGE;
    return (
      <div className="flex h-full w-full flex-col-reverse gap-0.5">
        {ore5Image && (
          <div
            className="flex w-full items-end overflow-hidden rounded-sm"
            style={{ aspectRatio: "1" }}
          >
            <div className="relative h-full w-full">
              <img
                src={ore5Image}
                alt={`${color} x5`}
                className="absolute inset-0 h-full w-full scale-[1.25] object-cover object-center"
              />
            </div>
          </div>
        )}
        {Array.from({ length: remainder }).map((_, i) => (
          <div
            key={`r-${i}`}
            className="flex w-full items-end overflow-hidden rounded-sm"
            style={{ aspectRatio: "1" }}
          >
            <div className="relative h-full w-full">
              <img
                src={oreImage}
                alt={color}
                className="absolute inset-0 h-full w-full scale-[1.25] object-cover object-center"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export function Card({
  card,
  onClick,
  size = "md",
}: {
  card: CardType;
  onClick?: () => void;
  size?: ComponentSize;
}) {
  const s = CARD_SIZES[size];
  const bonusImage = ORE_IMAGES[card.ore];

  const levelBorderColors = {
    1: "border-emerald-500",
    2: "border-amber-500",
    3: "border-blue-500",
  };

  return (
    <div
      className={clsx(
        s.card,
        s.padding,
        "relative flex cursor-pointer flex-col overflow-hidden rounded-lg border-2 bg-white shadow-xl ring-1 ring-black/5 transition-all duration-200 hover:shadow-2xl hover:brightness-110",
        levelBorderColors[card.level],
      )}
      onClick={onClick}
    >
      {/* Background Image (Watermark) */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src={LEVEL_IMAGES[card.level]}
          alt={`Level ${card.level}`}
          className="h-full w-full object-cover opacity-20"
        />
      </div>

      {/* Glossy overlay effect */}
      <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-b from-white/40 to-transparent" />

      {/* Header: Points and Bonus Ore (square with cropped image) */}
      <div className="relative z-10 mb-2 flex items-start justify-between">
        <span className={clsx("font-bold text-black drop-shadow-sm", s.points)}>
          {card.points > 0 ? card.points : ""}
        </span>
        <div
          className={clsx(
            "overflow-hidden rounded-sm border-2 bg-white shadow-sm",
            s.ore,
            !bonusImage && ORE_COLORS[card.ore],
            ORE_BORDER_COLORS[card.ore],
          )}
        >
          {bonusImage && (
            <img
              src={bonusImage}
              alt={card.ore}
              className="h-full w-full scale-150 object-cover"
            />
          )}
        </div>
      </div>

      {/* Cost - always 4 columns, flexbox-based, left-aligned */}
      <div className="relative z-10 flex min-h-0 flex-1 items-end gap-0.5">
        {(() => {
          // Get colors with cost > 0, in order, up to 4 columns
          const colorsWithCost = ORE_ORDER.filter(
            (color) => (card.cost[color] || 0) > 0,
          ).slice(0, 4);
          // Always show 4 columns, fill from left
          return Array.from({ length: 4 }, (_, i) => {
            const color = colorsWithCost[i];
            const count = color ? card.cost[color] || 0 : 0;
            return (
              <div
                key={color || `empty-${i}`}
                className="flex h-full min-w-0 flex-1 items-end"
              >
                {count > 0 ? renderOreDisplay(count, color!) : null}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

const CARDBACK_SIZES = {
  sm: { card: "w-20 h-28", text: "text-xl" },
  md: { card: "w-24 h-36", text: "text-2xl" },
  lg: { card: "h-full w-auto aspect-[2/3]", text: "text-2xl" },
  xl: {
    card: "w-[clamp(120px,9vw,220px)] h-full max-h-[22vh] aspect-[2/3]",
    text: "text-[clamp(2rem,4vw,4rem)]",
  },
};

export function CardBack({
  level,
  size = "md",
}: {
  level: 1 | 2 | 3;
  size?: ComponentSize;
}) {
  const s = CARDBACK_SIZES[size];

  // Border colors matching the level theme
  const borderColors = {
    1: "border-emerald-600/50",
    2: "border-amber-600/50",
    3: "border-blue-600/50",
  };

  const dotColors = {
    1: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]",
    2: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]",
    3: "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]",
  };

  return (
    <div
      className={clsx(
        s.card,
        s.text,
        "relative flex flex-col items-center justify-center overflow-hidden rounded-lg border-2 bg-gray-900 font-bold text-white shadow-2xl transition-all duration-200 hover:shadow-2xl hover:brightness-110",
        borderColors[level],
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={LEVEL_IMAGES[level]}
          alt={`Level ${level}`}
          className="h-full w-full object-cover opacity-60 brightness-75 contrast-125 filter"
        />
      </div>

      {/* Dots only (no capsule blur / no extra decoration) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex rotate-45 transform gap-2">
          {Array.from({ length: level }).map((_, i) => (
            <div
              key={i}
              className={clsx("h-3 w-3 rounded-full", dotColors[level])}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
