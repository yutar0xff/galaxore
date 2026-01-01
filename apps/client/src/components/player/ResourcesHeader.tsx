import React from 'react';
import { Player, GemColor } from '@local-splendor/shared';
import clsx from 'clsx';
import { GEM_BORDER_COLORS_WITH_GOLD, GEM_ORDER } from '../../constants/gems';
import { GEM_IMAGES } from '../ui/Token';
import { usePlayerStats } from '../../hooks/usePlayerStats';

interface ResourcesHeaderProps {
  player: Player;
}

export function ResourcesHeader({ player }: ResourcesHeaderProps) {
  const { tokenCounts, bonusCounts } = usePlayerStats(player);
  const allGemColors: GemColor[] = GEM_ORDER;

  return (
    <div className="bg-gray-800 p-3 rounded-xl mb-4 overflow-x-auto border border-gray-700">
      <div className="flex gap-4 min-w-min mx-auto justify-center">
        {allGemColors.map(color => {
          const bonus = bonusCounts[color] || 0;
          const token = tokenCounts[color] || 0;

          return (
            <div key={color} className="flex flex-col items-center gap-2">
              {/* Bonus (Square) */}
              <div className="relative">
                <div className={clsx("w-10 h-10 rounded-sm border-2 overflow-hidden", GEM_BORDER_COLORS_WITH_GOLD[color], bonus === 0 && "opacity-30 grayscale")}>
                  <img src={GEM_IMAGES[color]} alt={color} className="w-full h-full object-cover scale-150" />
                </div>
                <span className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-gray-500 shadow-md">
                  {bonus}
                </span>
              </div>

              {/* Token (Circle) */}
              <div className="relative">
                <div className={clsx("w-10 h-10 rounded-full border-2 overflow-hidden", GEM_BORDER_COLORS_WITH_GOLD[color], token === 0 && "opacity-30 grayscale")}>
                  <img src={GEM_IMAGES[color]} alt={color} className="w-full h-full object-cover scale-150" />
                </div>
                <span className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-gray-500 shadow-md">
                  {token}
                </span>
              </div>
            </div>
          );
        })}

        {/* Gold Token */}
        <div className="flex flex-col items-center gap-2 justify-end">
          <div className="w-10 h-10 opacity-0"></div> {/* Spacer for alignment with bonus row */}
          <div className="relative">
            <div className={clsx("w-10 h-10 rounded-full border-2 border-yellow-600 overflow-hidden", (!tokenCounts['gold']) && "opacity-30 grayscale")}>
              <img src={GEM_IMAGES['gold']} alt="gold" className="w-full h-full object-cover scale-150" />
            </div>
            <span className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-gray-500 shadow-md">
              {tokenCounts['gold'] || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
