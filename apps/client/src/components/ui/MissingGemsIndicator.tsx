import React from 'react';
import { GemColor } from '@local-splendor/shared';
import clsx from 'clsx';
import { GEM_BORDER_COLORS_WITH_GOLD, GEM_ORDER } from '../../constants/gems';
import { GEM_IMAGES } from './Token';

interface MissingGemsIndicatorProps {
  missingGems: Record<GemColor, number>;
}

export function MissingGemsIndicator({ missingGems }: MissingGemsIndicatorProps) {
  const hasMissingGems = Object.values(missingGems).some(v => v > 0);

  if (!hasMissingGems) return null;

  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 whitespace-nowrap">
      <div className="flex items-center gap-1.5">
        {GEM_ORDER.map(color => {
          const missing = missingGems[color];
          if (missing <= 0) return null;
          return (
            <div key={color} className="relative">
              <div className={clsx("w-6 h-6 rounded-sm border overflow-hidden", GEM_BORDER_COLORS_WITH_GOLD[color])}>
                <img src={GEM_IMAGES[color]} alt={color} className="w-full h-full object-cover scale-150" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 text-red-500 text-xs font-black leading-none">{missing}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
