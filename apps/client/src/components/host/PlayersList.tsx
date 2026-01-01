import React from 'react';
import { Player, GemColor, TokenColor } from '@local-splendor/shared';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { GEM_BORDER_COLORS, GEM_ORDER, ALL_TOKEN_COLORS } from '../../constants/gems';
import { GEM_IMAGES } from '../ui/Token';
import { calculateNoblesVisited, calculateBonuses } from '../../utils/game';

interface PlayersListProps {
  players: Player[];
  currentPlayerIndex: number;
}

export function PlayersList({ players, currentPlayerIndex }: PlayersListProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 p-1 min-h-0">
      {players.map((p, idx) => {
        const bonuses = calculateBonuses(p);
        const noblesVisited = calculateNoblesVisited(p);

        return (
          <div key={p.id} className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 border-2 ${
            idx === currentPlayerIndex
              ? 'bg-gradient-to-br from-amber-900/90 to-slate-900/90 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800/80'
          }`}>
            {/* Player Name, Score, Res, Nobles in one row */}
            <div className="flex items-center gap-3 mb-2">
              <div className={clsx("font-serif text-lg truncate flex-1 tracking-wide", idx === currentPlayerIndex ? "text-amber-100 font-bold" : "text-slate-300")}>{p.name}</div>
              <div className="font-serif font-black text-2xl text-amber-400 drop-shadow-md">{p.score}</div>
              <div className="bg-black/40 px-2 py-1 rounded-lg border border-white/5 flex items-center gap-1.5">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">{t('Res')}</span>
                <span className="text-white font-bold text-base">{p.reserved.length}</span>
              </div>
              <div className="bg-black/40 px-2 py-1 rounded-lg border border-white/5 flex items-center gap-1.5">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">{t('Nobles')}</span>
                <span className="text-white font-bold text-base">{noblesVisited}</span>
              </div>
            </div>

            {/* Tokens & Bonuses - Always 2 rows */}
            <div className="flex flex-col gap-1.5">
              {/* Tokens */}
              <div className="flex flex-wrap gap-2 min-h-[56px] items-center">
                {ALL_TOKEN_COLORS.map((color) => {
                  const count = p.tokens[color] || 0;
                  return count > 0 ? (
                    <div key={color} className="relative flex-shrink-0">
                      <div className={clsx("w-14 h-14 rounded-full border-2 overflow-hidden shadow-sm", color === 'gold' ? 'border-yellow-600' : 'border-gray-400')}>
                        <img src={GEM_IMAGES[color]} alt={color} className="w-full h-full object-cover scale-150" />
                      </div>
                      <span className="absolute -top-2 -right-2 text-xl font-black text-white bg-slate-900 rounded-full w-8 h-8 flex items-center justify-center border-2 border-slate-600 shadow-lg z-20">{count}</span>
                    </div>
                  ) : null;
                })}
              </div>

              <div className="h-px bg-slate-600/30 w-full"></div>

              {/* Bonuses */}
              <div className="flex flex-wrap gap-2 min-h-[56px]">
                {GEM_ORDER.map((color) => {
                  const count = bonuses[color] || 0;
                  return count > 0 ? (
                    <div key={color} className="relative flex-shrink-0">
                      <div className={clsx("w-14 h-14 rounded-sm border-2 overflow-hidden shadow-sm", GEM_BORDER_COLORS[color])}>
                        <img src={GEM_IMAGES[color]} alt={color} className="w-full h-full object-cover scale-150" />
                      </div>
                      <span className="absolute -top-2 -right-2 text-xl font-black text-white bg-slate-900 rounded-full w-8 h-8 flex items-center justify-center border-2 border-slate-600 shadow-lg z-20">{count}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
