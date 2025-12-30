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

export function Card({ card, onClick }: { card: CardType; onClick?: () => void }) {
  return (
    <div
        className="w-24 h-32 bg-white rounded-lg shadow-lg flex flex-col p-2 relative cursor-pointer hover:scale-105 transition-transform"
        onClick={onClick}
    >
      {/* Header: Points and Bonus Gem */}
      <div className="flex justify-between items-start mb-2">
        <span className="font-bold text-xl text-black">{card.points > 0 ? card.points : ''}</span>
        <div className={clsx("w-6 h-6 rounded-full border border-gray-300", GEM_COLORS[card.gem])}></div>
      </div>

      {/* Image Placeholder */}
      <div className="flex-1 bg-gray-200 rounded mb-2 opacity-50"></div>

      {/* Cost */}
      <div className="flex flex-wrap gap-1 content-end">
        {Object.entries(card.cost).map(([color, count]) => (
            count > 0 && (
                <div key={color} className={clsx("w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-gray-400", GEM_COLORS[color as GemColor])}>
                    {count}
                </div>
            )
        ))}
      </div>
    </div>
  );
}

export function CardBack({ level }: { level: 1 | 2 | 3 }) {
    const colors = { 1: 'bg-green-700', 2: 'bg-yellow-700', 3: 'bg-blue-700' };
    return (
        <div className={clsx("w-24 h-32 rounded-lg shadow-lg flex items-center justify-center text-white text-2xl font-bold", colors[level])}>
            {level === 1 ? '●' : level === 2 ? '●●' : '●●●'}
        </div>
    )
}
