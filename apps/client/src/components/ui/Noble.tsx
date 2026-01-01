import React from 'react';
import { Noble as NobleType, GemColor } from '@local-splendor/shared';
import clsx from 'clsx';

// Import gem images
import rubyImg from '../../assets/gems/ruby.png';
import emeraldImg from '../../assets/gems/emerald.png';
import sapphireImg from '../../assets/gems/sapphire.png';
import diamondImg from '../../assets/gems/diamond.png';
import onyxImg from '../../assets/gems/onyx.png';

// Import noble images
import man1Img from '../../assets/nobles/man1.png';
import man2Img from '../../assets/nobles/man2.png';
import man3Img from '../../assets/nobles/man3.png';
import woman1Img from '../../assets/nobles/woman1.png';
import woman2Img from '../../assets/nobles/woman2.png';
import woman3Img from '../../assets/nobles/woman3.png';

const GEM_BORDER_COLORS: Record<GemColor, string> = {
  emerald: 'border-green-700',
  sapphire: 'border-blue-700',
  ruby: 'border-red-700',
  diamond: 'border-gray-400',
  onyx: 'border-gray-600',
};

// Map colors to their images
const GEM_IMAGES: Record<GemColor, string> = {
  ruby: rubyImg,
  emerald: emeraldImg,
  sapphire: sapphireImg,
  diamond: diamondImg,
  onyx: onyxImg,
};

// Noble images pool
const NOBLE_IMAGES = [man1Img, man2Img, man3Img, woman1Img, woman2Img, woman3Img];

type NobleSize = 'sm' | 'md' | 'lg' | 'xl';

const NOBLE_SIZES = {
  sm: { container: 'w-16 h-20 aspect-[4/5]', points: 'text-base', square: 'w-3 h-3', padding: 'p-1', rowGap: 'gap-0.5', dotGap: 'gap-0.5' },
  md: { container: 'w-20 h-24 aspect-[5/6]', points: 'text-lg', square: 'w-4 h-4', padding: 'p-1.5', rowGap: 'gap-1', dotGap: 'gap-0.5' },
  lg: { container: 'w-32 h-40 aspect-[4/5]', points: 'text-3xl', square: 'w-6 h-6', padding: 'p-2', rowGap: 'gap-1', dotGap: 'gap-1' },
  xl: { container: 'h-full w-auto max-w-full max-h-full aspect-[11/14] flex-shrink-0', points: 'text-[clamp(2rem,3vw,2.5rem)]', square: 'w-[clamp(20px,2vw,32px)] h-[clamp(20px,2vw,32px)]', padding: 'p-[clamp(0.5rem,1vw,1rem)]', rowGap: 'gap-[clamp(0.25rem,0.5vw,0.5rem)]', dotGap: 'gap-[clamp(0.25rem,0.5vw,0.5rem)]' },
};

export function Noble({ noble, size = 'md' }: { noble: NobleType; size?: NobleSize }) {
  const s = NOBLE_SIZES[size];

  // Use assigned image index or fallback
  const nobleImg = noble.imageIndex !== undefined
      ? NOBLE_IMAGES[noble.imageIndex % NOBLE_IMAGES.length]
      : NOBLE_IMAGES[parseInt(noble.id.split('-')[1] || '0', 10) % NOBLE_IMAGES.length];

  return (
    <div className={clsx(
        s.container, s.padding,
        "rounded-lg shadow-xl relative overflow-hidden group transition-all duration-200 hover:brightness-110 hover:shadow-2xl border-2 border-amber-600/30"
    )}>
      {/* Background Image */}
      <div className="absolute inset-0 bg-gray-200">
          <img src={nobleImg} alt="Noble" className="w-full h-full object-cover opacity-90" />
      </div>

      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/40 pointer-events-none" />

      {/* Content Container - Flex column: Points at top, Requirements at bottom */}
      <div className="relative z-10 flex flex-col justify-between h-full min-h-0">
          {/* Points */}
          <span className={clsx("font-serif font-black text-black self-start drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]", s.points)}>
              {noble.points}
          </span>

          {/* Requirements */}
          <div className={clsx("flex flex-col bg-black/40 backdrop-blur-sm p-1 rounded-md border border-white/10 overflow-visible", s.rowGap)}>
            {Object.entries(noble.requirements).map(([color, count]) => (
               count > 0 && (
                   <div key={color} className={clsx("flex", s.dotGap)}>
                       {Array.from({ length: count }).map((_, i) => (
                           <div
                               key={i}
                               className={clsx(
                                   "rounded-sm border overflow-hidden shadow-sm",
                                   s.square,
                                   GEM_BORDER_COLORS[color as GemColor]
                               )}
                           >
                             <img
                               src={GEM_IMAGES[color as GemColor]}
                               alt={color}
                               className="w-full h-full object-cover scale-150"
                             />
                           </div>
                       ))}
                   </div>
               )
            ))}
          </div>
      </div>
    </div>
  );
}
