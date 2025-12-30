import React from 'react';
import { Noble as NobleType, GemColor } from '@local-splendor/shared';
import clsx from 'clsx';

const GEM_COLORS: Record<GemColor, string> = {
  emerald: 'bg-green-500',
  sapphire: 'bg-blue-500',
  ruby: 'bg-red-500',
  diamond: 'bg-gray-200',
  onyx: 'bg-gray-800',
};

type NobleSize = 'sm' | 'md' | 'lg' | 'xl';

const NOBLE_SIZES = {
  sm: { container: 'w-16 h-16', points: 'text-base', req: 'w-6 h-3 text-[8px]', padding: 'p-1', gap: 'gap-1' },
  md: { container: 'w-20 h-20', points: 'text-lg', req: 'w-8 h-4 text-[10px]', padding: 'p-1', gap: 'gap-1' },
  lg: { container: 'w-28 h-28', points: 'text-2xl', req: 'w-10 h-5 text-xs', padding: 'p-2', gap: 'gap-1' },
  xl: { container: 'w-36 h-36', points: 'text-3xl', req: 'w-12 h-6 text-sm', padding: 'p-3', gap: 'gap-1.5' },
};

export function Noble({ noble, size = 'md' }: { noble: NobleType; size?: NobleSize }) {
  const s = NOBLE_SIZES[size];
  return (
    <div className={clsx(s.container, s.padding, "bg-amber-100 rounded-lg border-2 border-amber-300 flex flex-col shadow-md")}>
      <span className={clsx("font-bold text-black self-center mb-1", s.points)}>{noble.points}</span>
      <div className={clsx("flex flex-col", s.gap)}>
        {Object.entries(noble.requirements).map(([color, count]) => (
           count > 0 && (
               <div key={color} className={clsx("rounded flex items-center justify-center text-white font-bold border border-gray-400", s.req, GEM_COLORS[color as GemColor])}>
                   {count}
               </div>
           )
        ))}
      </div>
    </div>
  );
}
