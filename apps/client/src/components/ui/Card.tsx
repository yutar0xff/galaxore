import React from 'react';
import { Card as CardType, GemColor } from '@local-splendor/shared';
import clsx from 'clsx';

const GEM_COLORS: Record<GemColor, string> = {
  emerald: 'bg-green-500',
  sapphire: 'bg-blue-500',
  ruby: 'bg-red-500',
  diamond: 'bg-gray-100',
  onyx: 'bg-gray-800',
};

type CardSize = 'sm' | 'md' | 'lg' | 'xl';

const CARD_SIZES = {
  sm: { card: 'w-20 h-28', points: 'text-lg', gem: 'w-5 h-5', cost: 'w-4 h-4 text-[9px]', padding: 'p-1.5', gap: 'gap-1' },
  md: { card: 'w-24 h-32', points: 'text-xl', gem: 'w-6 h-6', cost: 'w-5 h-5 text-[10px]', padding: 'p-2', gap: 'gap-1' },
  lg: { card: 'w-32 h-44', points: 'text-2xl', gem: 'w-8 h-8', cost: 'w-6 h-6 text-xs', padding: 'p-3', gap: 'gap-1.5' },
  xl: { card: 'w-40 h-56', points: 'text-4xl', gem: 'w-10 h-10', cost: 'w-8 h-8 text-sm', padding: 'p-4', gap: 'gap-2' },
};

export function Card({ card, onClick, size = 'md' }: { card: CardType; onClick?: () => void; size?: CardSize }) {
  const s = CARD_SIZES[size];
  return (
    <div
        className={clsx(s.card, s.padding, "bg-white rounded-lg shadow-lg flex flex-col relative cursor-pointer hover:scale-105 transition-transform")}
        onClick={onClick}
    >
      {/* Header: Points and Bonus Gem */}
      <div className="flex justify-between items-start mb-2">
        <span className={clsx("font-bold text-black", s.points)}>{card.points > 0 ? card.points : ''}</span>
        <div className={clsx("rounded-full border border-gray-300", s.gem, GEM_COLORS[card.gem])}></div>
      </div>

      {/* Image Placeholder */}
      <div className="flex-1 bg-gray-200 rounded mb-2 opacity-50"></div>

      {/* Cost */}
      <div className={clsx("flex flex-wrap content-end", s.gap)}>
        {Object.entries(card.cost).map(([color, count]) => (
            count > 0 && (
                <div key={color} className={clsx("rounded-full flex items-center justify-center text-white font-bold border border-gray-400", s.cost, GEM_COLORS[color as GemColor])}>
                    {count}
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
