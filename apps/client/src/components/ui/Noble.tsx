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

export function Noble({ noble }: { noble: NobleType }) {
  return (
    <div className="w-20 h-20 bg-amber-100 rounded border-2 border-amber-300 flex flex-col p-1 shadow-md">
      <span className="font-bold text-lg text-black self-center mb-1">{noble.points}</span>
      <div className="flex flex-col gap-1">
        {Object.entries(noble.requirements).map(([color, count]) => (
           count > 0 && (
               <div key={color} className={clsx("w-8 h-4 rounded text-[10px] flex items-center justify-center text-white font-bold border border-gray-400", GEM_COLORS[color as GemColor])}>
                   {count}
               </div>
           )
        ))}
      </div>
    </div>
  );
}
