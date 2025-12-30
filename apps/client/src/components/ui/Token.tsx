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

type TokenSize = 'sm' | 'md' | 'lg' | 'xl';

const TOKEN_SIZES = {
  sm: { container: 'w-8 h-8', text: 'text-xs', badge: 'text-[10px] px-1' },
  md: { container: 'w-12 h-12', text: 'text-sm', badge: 'text-xs px-1.5' },
  lg: { container: 'w-16 h-16', text: 'text-lg', badge: 'text-sm px-2' },
  xl: { container: 'w-20 h-20', text: 'text-xl', badge: 'text-base px-2.5 py-0.5' },
};

export function Token({ color, count, size = 'md', onClick }: { color: TokenColor; count?: number; size?: TokenSize; onClick?: () => void }) {
  const s = TOKEN_SIZES[size];
  return (
    <div
        className={clsx(
            "rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer relative",
            s.container, s.text,
            COLORS[color],
            color === 'diamond' || color === 'gold' ? 'text-black' : 'text-white',
        )}
        onClick={onClick}
    >
      {count !== undefined && <span className={clsx("absolute -top-1 -right-1 bg-gray-800 text-white rounded-full border border-gray-500 font-bold", s.badge)}>{count}</span>}
      <div className="w-2/3 h-2/3 rounded-full border-2 border-white/30"></div>
    </div>
  );
}
