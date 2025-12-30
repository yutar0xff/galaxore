import React from 'react';
import { Card as CardType, GemColor } from '@local-splendor/shared';
import clsx from 'clsx';

const GEM_COLORS: Record<GemColor, string> = {
  emerald: 'bg-green-500',
  sapphire: 'bg-blue-500',
  ruby: 'bg-red-500',
  diamond: 'bg-gray-100 border-gray-400',
  onyx: 'bg-gray-800',
};

const GEM_BORDER_COLORS: Record<GemColor, string> = {
  emerald: 'border-green-700',
  sapphire: 'border-blue-700',
  ruby: 'border-red-700',
  diamond: 'border-gray-400',
  onyx: 'border-gray-600',
};

type CardSize = 'sm' | 'md' | 'lg' | 'xl';

const CARD_SIZES = {
  sm: { card: 'w-20 h-28', points: 'text-lg', gem: 'w-5 h-5', costDot: 'w-3 h-3', padding: 'p-1.5', rowGap: 'gap-0.5', dotGap: 'gap-0.5' },
  md: { card: 'w-24 h-32', points: 'text-xl', gem: 'w-6 h-6', costDot: 'w-4 h-4', padding: 'p-2', rowGap: 'gap-1', dotGap: 'gap-0.5' },
  lg: { card: 'w-32 h-44', points: 'text-2xl', gem: 'w-8 h-8', costDot: 'w-5 h-5', padding: 'p-3', rowGap: 'gap-1', dotGap: 'gap-1' },
  xl: { card: 'w-40 h-56', points: 'text-4xl', gem: 'w-10 h-10', costDot: 'w-6 h-6', padding: 'p-4', rowGap: 'gap-1.5', dotGap: 'gap-1' },
};

export function Card({ card, onClick, size = 'md' }: { card: CardType; onClick?: () => void; size?: CardSize }) {
  const s = CARD_SIZES[size];
  return (
    <div
        className={clsx(s.card, s.padding, "bg-white rounded-lg shadow-lg flex flex-col relative cursor-pointer hover:scale-105 transition-transform")}
        onClick={onClick}
    >
      {/* Header: Points and Bonus Gem (square) */}
      <div className="flex justify-between items-start mb-2">
        <span className={clsx("font-bold text-black", s.points)}>{card.points > 0 ? card.points : ''}</span>
        <div className={clsx("rounded-sm border-2", s.gem, GEM_COLORS[card.gem], GEM_BORDER_COLORS[card.gem])}></div>
      </div>

      {/* Image Placeholder */}
      <div className="flex-1 bg-gray-200 rounded mb-2 opacity-50"></div>

      {/* Cost - each color on its own row with multiple dots */}
      <div className={clsx("flex flex-col", s.rowGap)}>
        {Object.entries(card.cost).map(([color, count]) => (
            count > 0 && (
                <div key={color} className={clsx("flex", s.dotGap)}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div
                            key={i}
                            className={clsx(
                                "rounded-full border-2",
                                s.costDot,
                                GEM_COLORS[color as GemColor],
                                GEM_BORDER_COLORS[color as GemColor]
                            )}
                        />
                    ))}
                </div>
            )
        ))}
      </div>
    </div>
  );
}

const CARDBACK_SIZES = {
  sm: { card: 'w-20 h-28', text: 'text-xl' },
  md: { card: 'w-24 h-32', text: 'text-2xl' },
  lg: { card: 'w-32 h-44', text: 'text-3xl' },
  xl: { card: 'w-40 h-56', text: 'text-4xl' },
};

export function CardBack({ level, size = 'md' }: { level: 1 | 2 | 3; size?: CardSize }) {
    const colors = { 1: 'bg-green-700', 2: 'bg-yellow-700', 3: 'bg-blue-700' };
    const s = CARDBACK_SIZES[size];
    return (
        <div className={clsx(s.card, s.text, "rounded-lg shadow-lg flex items-center justify-center text-white font-bold", colors[level])}>
            {level === 1 ? '●' : level === 2 ? '●●' : '●●●'}
        </div>
    )
}
