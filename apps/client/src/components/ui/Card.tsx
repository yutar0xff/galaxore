import React from 'react';
import { Card as CardType, GemColor } from '@local-splendor/shared';
import clsx from 'clsx';
import { ComponentSize } from '../../types/ui';
import { GEM_ORDER, GEM_BORDER_COLORS, GEM_IMAGES, GEM_5_IMAGES, GEM_COLORS } from '../../constants/gems';
import { LEVEL_IMAGES } from '../../constants/images';
import { GEM_THRESHOLD_FOR_5_IMAGE } from '../../constants/game';

const CARD_SIZES = {
  sm: { card: 'w-20 h-28', points: 'text-lg', gem: 'w-5 h-5', costDot: 'w-3 h-3', miniGem: 'w-1 h-1', padding: 'p-1.5', colGap: 'gap-0.5', dotGap: 'gap-0.5' },
  md: { card: 'w-24 h-36', points: 'text-xl', gem: 'w-6 h-6', costDot: 'w-8 h-8', miniGem: 'w-1.5 h-1.5', padding: 'p-2', colGap: 'gap-1', dotGap: 'gap-0.5' },
  lg: { card: 'h-full w-auto max-w-full aspect-[2/3]', points: 'text-4xl', gem: 'w-12 h-12', costDot: 'w-8 h-8', miniGem: 'w-4 h-4', padding: 'p-2', colGap: 'gap-0.5', dotGap: 'gap-0.5' },
  xl: { card: 'w-[clamp(120px,9vw,220px)] h-full max-h-[22vh] aspect-[2/3]', points: 'text-[clamp(1.5rem,2.2vw,3rem)]', gem: 'w-[clamp(30px,2.5vw,50px)] h-[clamp(30px,2.5vw,50px)]', costDot: 'w-[clamp(15px,1.4vw,25px)] h-[clamp(15px,1.4vw,25px)]', miniGem: 'w-[clamp(5px,0.5vw,8px)] h-[clamp(5px,0.5vw,8px)]', padding: 'p-[1vw]', colGap: 'gap-[0.3vw]', dotGap: 'gap-[0.2vw]' },
};

// Render gem display for a column - uses 5-gem image when count is 6+
function renderGemDisplay(count: number, color: GemColor) {
  const gemImage = GEM_IMAGES[color];
  const gem5Image = GEM_5_IMAGES[color];

  if (count <= GEM_THRESHOLD_FOR_5_IMAGE) {
    // Show individual gems (5個までは個別表示)
    // 上下左右20%をクロップ: divのサイズを列幅に合わせ（正方形）、画像を1.25倍に拡大してdivでクロップ
    return (
      <div className="flex flex-col-reverse gap-0.5 h-full w-full">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-sm overflow-hidden w-full flex items-end" style={{ aspectRatio: '1' }}>
            <div className="w-full h-full relative">
              <img src={gemImage} alt={color} className="absolute inset-0 w-full h-full object-cover scale-[1.25] object-center" />
            </div>
          </div>
        ))}
      </div>
    );
  } else {
    // 6+ gems: show 5-gem image at bottom, then remaining individual gems above
    const remainder = count - GEM_THRESHOLD_FOR_5_IMAGE;
    return (
      <div className="flex flex-col-reverse gap-0.5 h-full w-full">
        {gem5Image && (
          <div className="rounded-sm overflow-hidden w-full flex items-end" style={{ aspectRatio: '1' }}>
            <div className="w-full h-full relative">
              <img src={gem5Image} alt={`${color} x5`} className="absolute inset-0 w-full h-full object-cover scale-[1.25] object-center" />
            </div>
          </div>
        )}
        {Array.from({ length: remainder }).map((_, i) => (
          <div key={`r-${i}`} className="rounded-sm overflow-hidden w-full flex items-end" style={{ aspectRatio: '1' }}>
            <div className="w-full h-full relative">
              <img src={gemImage} alt={color} className="absolute inset-0 w-full h-full object-cover scale-[1.25] object-center" />
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export function Card({ card, onClick, size = 'md' }: { card: CardType; onClick?: () => void; size?: ComponentSize }) {
  const s = CARD_SIZES[size];
  const bonusImage = GEM_IMAGES[card.gem];

  const levelBorderColors = {
      1: 'border-emerald-500',
      2: 'border-amber-500',
      3: 'border-blue-500'
  };

  return (
    <div
        className={clsx(
            s.card, s.padding,
            "rounded-lg shadow-xl flex flex-col relative cursor-pointer transition-all duration-200 border-2 ring-1 ring-black/5 bg-white overflow-hidden hover:brightness-110 hover:shadow-2xl",
            levelBorderColors[card.level]
        )}
        onClick={onClick}
    >
      {/* Background Image (Watermark) */}
      <div className="absolute inset-0 pointer-events-none">
          <img
            src={LEVEL_IMAGES[card.level]}
            alt={`Level ${card.level}`}
            className="w-full h-full object-cover opacity-20"
          />
      </div>

      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-lg pointer-events-none" />

      {/* Header: Points and Bonus Gem (square with cropped image) */}
      <div className="flex justify-between items-start mb-2 relative z-10">
        <span className={clsx("font-bold text-black drop-shadow-sm", s.points)}>{card.points > 0 ? card.points : ''}</span>
        <div className={clsx(
          "rounded-sm border-2 overflow-hidden shadow-sm bg-white",
          s.gem,
          !bonusImage && GEM_COLORS[card.gem],
          GEM_BORDER_COLORS[card.gem]
        )}>
          {bonusImage && <img src={bonusImage} alt={card.gem} className="w-full h-full object-cover scale-150" />}
        </div>
      </div>

      {/* Cost - always 4 columns, flexbox-based, left-aligned */}
      <div className="flex-1 flex items-end relative z-10 gap-0.5 min-h-0">
        {(() => {
          // Get colors with cost > 0, in order, up to 4 columns
          const colorsWithCost = GEM_ORDER.filter(color => (card.cost[color] || 0) > 0).slice(0, 4);
          // Always show 4 columns, fill from left
          return Array.from({ length: 4 }, (_, i) => {
            const color = colorsWithCost[i];
            const count = color ? (card.cost[color] || 0) : 0;
            return (
              <div key={color || `empty-${i}`} className="flex-1 min-w-0 h-full flex items-end">
                {count > 0 ? renderGemDisplay(count, color!) : null}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

const CARDBACK_SIZES = {
  sm: { card: 'w-20 h-28', text: 'text-xl' },
  md: { card: 'w-24 h-36', text: 'text-2xl' },
  lg: { card: 'h-full w-auto aspect-[2/3]', text: 'text-2xl' },
  xl: { card: 'w-[clamp(120px,9vw,220px)] h-full max-h-[22vh] aspect-[2/3]', text: 'text-[clamp(2rem,4vw,4rem)]' },
};

export function CardBack({ level, size = 'md' }: { level: 1 | 2 | 3; size?: ComponentSize }) {
    const s = CARDBACK_SIZES[size];

    // Border colors matching the level theme
    const borderColors = {
        1: 'border-emerald-600/50',
        2: 'border-amber-600/50',
        3: 'border-blue-600/50'
    };

    const dotColors = {
        1: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]',
        2: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]',
        3: 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]'
    };

    return (
        <div className={clsx(
            s.card, s.text,
            "rounded-lg shadow-2xl flex flex-col items-center justify-center text-white font-bold relative overflow-hidden border-2 transition-all duration-200 hover:brightness-110 hover:shadow-2xl bg-gray-900",
            borderColors[level]
        )}>
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={LEVEL_IMAGES[level]}
                    alt={`Level ${level}`}
                    className="w-full h-full object-cover opacity-60 filter brightness-75 contrast-125"
                />
            </div>

            {/* Dots only (no capsule blur / no extra decoration) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-2 transform rotate-45">
                    {Array.from({ length: level }).map((_, i) => (
                        <div
                            key={i}
                            className={clsx("w-3 h-3 rounded-full", dotColors[level])}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
