import React from 'react';
import { TokenColor } from '@local-splendor/shared';
import clsx from 'clsx';

const COLORS: Record<TokenColor, string> = {
  emerald: 'bg-green-500',
  sapphire: 'bg-blue-500',
  ruby: 'bg-red-500',
  diamond: 'bg-white',
  onyx: 'bg-black border border-gray-600',
  gold: 'bg-yellow-400',
};

export function Token({ color, count, size = 'md', onClick }: { color: TokenColor; count?: number; size?: 'sm' | 'md' | 'lg'; onClick?: () => void }) {
  return (
    <div
        className={clsx(
            "rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer relative",
            COLORS[color],
            color === 'diamond' || color === 'gold' ? 'text-black' : 'text-white',
            size === 'sm' ? 'w-8 h-8 text-xs' : size === 'md' ? 'w-12 h-12 text-sm' : 'w-16 h-16 text-lg'
        )}
        onClick={onClick}
    >
      {count !== undefined && <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs px-1 rounded-full border border-gray-500">{count}</span>}
      <div className="w-2/3 h-2/3 rounded-full border-2 border-white/30"></div>
    </div>
  );
}
