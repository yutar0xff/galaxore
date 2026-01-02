import React from "react";
import { OreColor } from "@galaxore/shared";
import clsx from "clsx";
import { ORE_BORDER_COLORS_WITH_GOLD, ORE_ORDER } from "../../constants/ores";
import { ORE_IMAGES } from "./Token";

interface MissingOresIndicatorProps {
  missingOres: Record<OreColor, number>;
}

export function MissingOresIndicator({
  missingOres,
}: MissingOresIndicatorProps) {
  const hasMissingOres = Object.values(missingOres).some((v) => v > 0);

  if (!hasMissingOres) return null;

  return (
    <div className="absolute -top-12 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap">
      <div className="flex items-center gap-1.5">
        {ORE_ORDER.map((color) => {
          const missing = missingOres[color];
          if (missing <= 0) return null;
          return (
            <div key={color} className="relative">
              <div
                className={clsx(
                  "h-6 w-6 overflow-hidden rounded-sm border",
                  ORE_BORDER_COLORS_WITH_GOLD[color],
                )}
              >
                <img
                  src={ORE_IMAGES[color]}
                  alt={color}
                  className="h-full w-full scale-150 object-cover"
                />
              </div>
              <span className="absolute -top-1.5 -right-1.5 text-xs leading-none font-black text-red-500">
                {missing}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
