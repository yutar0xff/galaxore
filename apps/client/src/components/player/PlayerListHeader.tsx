import React from "react";
import { Player } from "@local-splendor/shared";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";

interface PlayerListHeaderProps {
  players: Player[];
  currentPlayerIndex: number;
  playerId: string | null;
}

export function PlayerListHeader({
  players,
  currentPlayerIndex,
  playerId,
}: PlayerListHeaderProps) {
  return (
    <div className="sticky top-0 z-50 border-b border-gray-700 bg-gray-900 shadow-lg">
      <div className="px-4 py-2">
        <div className="flex items-center justify-center gap-2 overflow-x-auto">
          {players.map((player, idx) => {
            const isCurrentPlayer = idx === currentPlayerIndex;
            const isMe = player.id === playerId;
            const isLast = idx === players.length - 1;

            return (
              <React.Fragment key={player.id}>
                <span
                  className={clsx(
                    "flex-shrink-0 rounded-md px-3 py-1 font-serif text-sm font-bold transition-all duration-300",
                    isCurrentPlayer
                      ? "scale-110 bg-gradient-to-br from-amber-600/90 to-amber-700/90 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      : isMe
                        ? "bg-slate-700/60 text-blue-300"
                        : "bg-slate-800/40 text-slate-400",
                  )}
                >
                  {player.name}
                </span>
                {!isLast && (
                  <ChevronRight
                    size={16}
                    className={clsx(
                      "flex-shrink-0 transition-colors",
                      isCurrentPlayer ? "text-amber-500" : "text-slate-600",
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
