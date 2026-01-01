import React from 'react';
import { TokenColor, GemColor } from '@local-splendor/shared';
import clsx from 'clsx';

// Import gem images
import rubyImg from '../../assets/gems/ruby.png';
import emeraldImg from '../../assets/gems/emerald.png';
import sapphireImg from '../../assets/gems/sapphire.png';
import diamondImg from '../../assets/gems/diamond.png';
import onyxImg from '../../assets/gems/onyx.png';
import goldImg from '../../assets/gems/gold.png';

const COLORS: Record<TokenColor, string> = {
  emerald: 'bg-green-500',
  sapphire: 'bg-blue-500',
  ruby: 'bg-red-500',
  diamond: 'bg-white',
  onyx: 'bg-black border border-gray-600',
  gold: 'bg-yellow-400',
};

// Map colors to their images
export const GEM_IMAGES: Record<TokenColor, string> = {
  ruby: rubyImg,
  emerald: emeraldImg,
  sapphire: sapphireImg,
  diamond: diamondImg,
  onyx: onyxImg,
  gold: goldImg,
};

type TokenSize = 'sm' | 'md' | 'lg' | 'xl';

const TOKEN_SIZES = {
  sm: { container: 'w-8 h-8', text: 'text-xs', badge: 'text-sm px-1.5' },
  md: { container: 'w-12 h-12', text: 'text-sm', badge: 'text-base px-2' },
  lg: { container: 'w-16 h-16', text: 'text-lg', badge: 'text-xl px-2.5 py-0.5' },
  xl: { container: 'w-24 h-24', text: 'text-2xl', badge: 'text-2xl px-3 py-1' },
};

// Cropped gem image component - removes ~25% padding from each side
export function GemImage({ color, className }: { color: GemColor | TokenColor; className?: string }) {
  const gemImage = GEM_IMAGES[color as TokenColor];
  if (!gemImage) return null;

  return (
    <img
      src={gemImage}
      alt={color}
      className={clsx("scale-150 object-cover", className)}
    />
  );
}

export function Token({ color, count, size = 'md', onClick }: { color: TokenColor; count?: number; size?: TokenSize; onClick?: () => void }) {
  const s = TOKEN_SIZES[size];
  const gemImage = GEM_IMAGES[color];

  return (
    <div className="relative cursor-pointer" onClick={onClick}>
      {/* Badge - outside overflow-hidden container */}
      {count !== undefined && (
        <span className={clsx("absolute -top-1 -right-1 bg-gray-800 text-white rounded-full border border-gray-500 font-bold z-10", s.badge)}>
          {count}
        </span>
      )}

      {/* Token circle with border */}
      <div
          className={clsx(
              "rounded-full flex items-center justify-center font-bold shadow-md overflow-hidden border-2 border-gray-400",
              s.container, s.text,
          )}
      >
        <img src={gemImage} alt={color} className="w-full h-full object-cover scale-150" />
      </div>
    </div>
  );
}
