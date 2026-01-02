import React from "react";
import { Noble as NobleType } from "@local-splendor/shared";
import clsx from "clsx";
import { Noble } from "../ui/Noble";

interface NoblesSectionProps {
  nobles: NobleType[];
}

export function NoblesSection({ nobles }: NoblesSectionProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center overflow-hidden rounded-xl border border-slate-700 bg-slate-800/40 p-3">
      <span className="absolute top-2 left-2 z-10 rounded border border-slate-700 bg-slate-900 px-2 py-0.5 font-sans text-xs font-semibold tracking-widest text-slate-300 uppercase">
        Nobles
      </span>
      {/* Dynamic layout for nobles - no scrollbar */}
      <div
        className={clsx(
          "h-full w-full overflow-hidden pt-8 pb-1",
          nobles.length <= 4
            ? "flex flex-col items-center"
            : "grid grid-cols-2 items-center justify-center gap-2",
        )}
      >
        {nobles.map((noble) => (
          <div
            key={noble.id}
            className={clsx(
              nobles.length <= 4
                ? "flex min-h-0 w-full flex-1 items-center justify-center"
                : "flex h-full w-full items-center justify-center",
            )}
          >
            <Noble noble={noble} size="xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
