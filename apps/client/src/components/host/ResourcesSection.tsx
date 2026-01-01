import React from 'react';
import { TokenColor } from '@local-splendor/shared';
import { Token } from '../ui/Token';
import { ALL_TOKEN_COLORS } from '../../constants/gems';

interface ResourcesSectionProps {
  tokens: Partial<Record<TokenColor, number>>;
}

export function ResourcesSection({ tokens }: ResourcesSectionProps) {
  return (
    <div className="bg-slate-800/80 backdrop-blur-sm px-4 pt-7 pb-3 rounded-xl border border-slate-700 shadow-xl relative shrink-0 flex justify-center items-center">
      <span className="absolute top-1.5 left-1.5 text-xs font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-sans">
        Resources
      </span>
      <div className="flex gap-4 items-center">
        {ALL_TOKEN_COLORS.map(color => (
          <Token key={color} color={color} count={tokens[color] || 0} size="lg" />
        ))}
      </div>
    </div>
  );
}
