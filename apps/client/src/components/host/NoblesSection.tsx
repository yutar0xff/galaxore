import React from 'react';
import { Noble as NobleType } from '@local-splendor/shared';
import clsx from 'clsx';
import { Noble } from '../ui/Noble';

interface NoblesSectionProps {
  nobles: NobleType[];
}

export function NoblesSection({ nobles }: NoblesSectionProps) {
  return (
    <div className="bg-slate-800/40 rounded-xl border border-slate-700 p-3 flex-1 relative flex flex-col items-center min-h-0 overflow-hidden">
      <span className="absolute top-2 left-2 text-xs font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-sans z-10">
        Nobles
      </span>
      {/* Dynamic layout for nobles - no scrollbar */}
      <div className={clsx(
        "h-full w-full pt-8 pb-1 overflow-hidden",
        nobles.length <= 4
          ? "flex flex-col items-center"
          : "grid grid-cols-2 gap-2 items-center justify-center"
      )}>
        {nobles.map(noble => (
          <div key={noble.id} className={clsx(
            nobles.length <= 4
              ? "flex-1 min-h-0 w-full flex items-center justify-center"
              : "h-full w-full flex items-center justify-center"
          )}>
            <Noble noble={noble} size="xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
