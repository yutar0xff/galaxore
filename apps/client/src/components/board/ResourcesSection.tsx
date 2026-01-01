import React from "react";
import { TokenColor } from "@local-splendor/shared";
import { Token } from "../ui/Token";
import { ALL_TOKEN_COLORS } from "../../constants/gems";

interface ResourcesSectionProps {
  tokens: Partial<Record<TokenColor, number>>;
}

export function ResourcesSection({ tokens }: ResourcesSectionProps) {
  return (
    <div className="relative flex shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-4 pt-7 pb-3 shadow-xl backdrop-blur-sm">
      <span className="absolute top-1.5 left-1.5 rounded border border-slate-700 bg-slate-900 px-2 py-0.5 font-sans text-xs font-semibold tracking-widest text-slate-300 uppercase">
        Resources
      </span>
      <div className="flex items-center gap-4">
        {ALL_TOKEN_COLORS.map((color) => (
          <Token
            key={color}
            color={color}
            count={tokens[color] || 0}
            size="lg"
          />
        ))}
      </div>
    </div>
  );
}
