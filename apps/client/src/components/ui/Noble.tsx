import React from "react";
import { Noble as NobleType, OreColor } from "@galaxore/shared";
import clsx from "clsx";
import { ComponentSize } from "../../types/ui";
import { ORE_ORDER, ORE_BORDER_COLORS, ORE_IMAGES } from "../../constants/ores";
import { NOBLE_IMAGES } from "../../constants/images";

const NOBLE_SIZES = {
  sm: {
    container: "w-16 h-20 aspect-[4/5]",
    points: "text-base",
    square: "w-3 h-3",
    padding: "p-1",
    rowGap: "gap-0.5",
    dotGap: "gap-0.5",
  },
  md: {
    container: "w-20 h-24 aspect-[5/6]",
    points: "text-lg",
    square: "w-4 h-4",
    padding: "p-1.5",
    rowGap: "gap-1",
    dotGap: "gap-0.5",
  },
  lg: {
    container: "w-32 h-40 aspect-[4/5]",
    points: "text-3xl",
    square: "w-6 h-6",
    padding: "p-2",
    rowGap: "gap-1",
    dotGap: "gap-1",
  },
  xl: {
    container:
      "h-full w-auto max-w-full max-h-full aspect-[11/14] flex-shrink-0",
    points: "text-[clamp(2rem,3vw,2.5rem)]",
    square: "w-[clamp(20px,2vw,32px)] h-[clamp(20px,2vw,32px)]",
    padding: "p-[clamp(0.5rem,1vw,1rem)]",
    rowGap: "gap-[clamp(0.25rem,0.5vw,0.5rem)]",
    dotGap: "gap-[clamp(0.25rem,0.5vw,0.5rem)]",
  },
};

export function Noble({
  noble,
  size = "md",
}: {
  noble: NobleType;
  size?: ComponentSize;
}) {
  const s = NOBLE_SIZES[size];

  // Use assigned image index or fallback
  const nobleImg =
    noble.imageIndex !== undefined
      ? NOBLE_IMAGES[noble.imageIndex % NOBLE_IMAGES.length]
      : NOBLE_IMAGES[
          parseInt(noble.id.split("-")[1] || "0", 10) % NOBLE_IMAGES.length
        ];

  return (
    <div
      className={clsx(
        s.container,
        s.padding,
        "group relative overflow-hidden rounded-lg border-2 border-amber-600/30 shadow-xl transition-all duration-200 hover:shadow-2xl hover:brightness-110",
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-gray-200">
        <img
          src={nobleImg}
          alt="Noble"
          className="h-full w-full object-cover opacity-90"
        />
      </div>

      {/* Gradient Overlay for text readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/40" />

      {/* Content Container - Flex column: Points at top, Requirements at bottom */}
      <div className="relative z-10 flex h-full min-h-0 flex-col justify-between">
        {/* Points */}
        <span
          className={clsx(
            "self-start font-serif font-black text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]",
            s.points,
          )}
        >
          {noble.points}
        </span>

        {/* Requirements */}
        <div
          className={clsx(
            "flex flex-col overflow-visible rounded-md border border-white/10 bg-black/40 p-1 backdrop-blur-sm",
            s.rowGap,
          )}
        >
          {ORE_ORDER.map((color) => {
            const count = noble.requirements[color] || 0;
            return (
              count > 0 && (
                <div key={color} className={clsx("flex", s.dotGap)}>
                  {Array.from({ length: count }).map((_, i) => (
                    <div
                      key={i}
                      className={clsx(
                        "overflow-hidden rounded-sm border shadow-sm",
                        s.square,
                        ORE_BORDER_COLORS[color],
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
              )
            );
          })}
        </div>
      </div>
    </div>
  );
}
