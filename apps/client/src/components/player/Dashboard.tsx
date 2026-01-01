import React from 'react';
import { Player, GameState, TokenColor, GemColor } from '@local-splendor/shared';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Card } from '../ui/Card';
import { Token, GEM_IMAGES } from '../ui/Token';
import { GEM_BORDER_COLORS_WITH_GOLD, GEM_ORDER, ALL_TOKEN_COLORS } from '../../constants/gems';
import { changeLanguage as changeLanguageUtil } from '../../utils/i18n';
import { i18n as I18nType } from 'i18next';
import { MAX_TOKENS } from '../../constants/game';
import { usePlayerStats } from '../../hooks/usePlayerStats';

interface DashboardProps {
  player: Player;
  gameState: GameState;
  i18n: I18nType;
}

export function Dashboard({ player, gameState, i18n }: DashboardProps) {
  const { t } = useTranslation();
  const { tokenCounts, bonusCounts, totalTokens, hasAnyGems } = usePlayerStats(player);
  const allGemColors: GemColor[] = GEM_ORDER;

  return (
    <div className="flex flex-col h-full">
      {/* Last Action */}
      {gameState.lastAction && (
        <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-700 shadow-xl relative mx-2 mb-6 mt-4 min-h-[120px] flex flex-col justify-center">
          <span className="absolute -top-2 -left-2 text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-sans font-bold">Last</span>

          {/* Layout changes based on action type */}
          {(gameState.lastAction.type === 'BUY_CARD' || gameState.lastAction.type === 'RESERVE_CARD') ? (
            /* Card: Horizontal Layout */
            <div className="flex items-center gap-6">
              <div className="flex flex-col flex-1">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-amber-400 text-xl">{gameState.lastAction.playerName}</span>
                  <span className="text-gray-300 text-sm font-semibold">
                    {gameState.lastAction.type === 'BUY_CARD' ? t('bought a card') : t('reserved a card')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="scale-100 origin-center">
                  <Card card={gameState.lastAction.card!} size="sm" />
                </div>
                <div className="text-xs text-slate-400 uppercase font-bold mt-1">
                  {gameState.lastAction.type === 'RESERVE_CARD' ? t('Reserved') : t('Bought')}
                </div>
              </div>
            </div>
          ) : (
            /* Token: Vertical Layout */
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline gap-3">
                <span className="font-bold text-amber-400 text-xl">{gameState.lastAction.playerName}</span>
                <span className="text-gray-300 text-sm font-semibold">
                  {gameState.lastAction.type === 'TAKE_GEMS' && t('took tokens')}
                  {gameState.lastAction.type === 'DISCARD_TOKENS' && t('discarded tokens')}
                </span>
              </div>
              <div className="flex items-center justify-center bg-black/30 rounded-xl p-3 min-h-[80px]">
                <div className="flex gap-4">
                  {ALL_TOKEN_COLORS.map((color) => {
                    const count = gameState.lastAction?.tokens?.[color];
                    return count && count > 0 ? (
                      <Token key={color} color={color} count={count} size="lg" />
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Board Tokens */}
      <div className="mx-2 mb-6 px-6 py-4 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 shadow-xl relative">
        <span className="absolute -top-2 -left-2 text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-sans font-bold">{t('Resources')}</span>
        <div className="flex gap-4 justify-center">
          {ALL_TOKEN_COLORS.map(c => (
            <div key={c} className="flex flex-col items-center">
              <div className={clsx("w-10 h-10 rounded-full border-2 border-gray-500 overflow-hidden shadow-md", GEM_BORDER_COLORS_WITH_GOLD[c])}>
                <img src={GEM_IMAGES[c]} className="w-full h-full object-cover scale-150" />
              </div>
              <span className="text-base font-bold text-gray-200 mt-2">{gameState.board.tokens[c] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Header: Player name and score */}
      <div className="flex justify-between items-center mb-6 px-4 mt-2">
        <span className="text-3xl font-bold font-serif text-white tracking-tight">{player.name}</span>
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-800 rounded-xl border border-slate-700 p-1">
            <button onClick={() => changeLanguageUtil('en', i18n)} className={`px-3 py-1.5 text-sm rounded-lg transition-all font-bold ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-700'}`}>EN</button>
            <button onClick={() => changeLanguageUtil('ja', i18n)} className={`px-3 py-1.5 text-sm rounded-lg transition-all font-bold ${i18n.language === 'ja' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-700'}`}>JA</button>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">{t('Score')}</span>
            <span className="text-4xl font-bold text-amber-400 font-mono leading-none drop-shadow-sm">{player.score}</span>
          </div>
        </div>
      </div>

      {/* Owned Gems Section - columns by color */}
      <div className="flex-1 px-4 mb-24 overflow-y-auto custom-scrollbar">
        <div className="flex items-baseline justify-between mb-6 border-b border-gray-700 pb-3">
          <h3 className="text-lg text-gray-400 font-bold uppercase tracking-wider">{t('Owned Gems')}</h3>
          <div className={clsx("text-base font-bold px-4 py-1.5 rounded-full border shadow-inner", totalTokens > MAX_TOKENS ? "bg-red-900/50 border-red-500 text-red-100" : "bg-slate-800 border-slate-600 text-slate-200")}>
            Tokens: {totalTokens} / {MAX_TOKENS}
          </div>
        </div>
        <div className="flex gap-6 justify-start flex-wrap">
          {/* Each color column: squares (bonuses) on top, circles (tokens) below */}
          {allGemColors.map(color => {
            const bonus = bonusCounts[color] || 0;
            const token = tokenCounts[color] || 0;
            if (bonus === 0 && token === 0) return null;

            return (
              <div key={color} className="flex flex-col gap-3 items-center">
                {/* Bonuses - squares with border */}
                {Array.from({ length: bonus }).map((_, i) => (
                  <div
                    key={`b-${i}`}
                    className={clsx(
                      "w-16 h-16 rounded-xl border-4 overflow-hidden shadow-lg transform active:scale-95 transition-transform",
                      GEM_BORDER_COLORS_WITH_GOLD[color]
                    )}
                  >
                    <img src={GEM_IMAGES[color]} alt={color} className="w-full h-full object-cover scale-150" />
                  </div>
                ))}
                {/* Tokens - circles with border */}
                {Array.from({ length: token }).map((_, i) => (
                  <div
                    key={`t-${i}`}
                    className={clsx(
                      "w-20 h-20 rounded-full border-4 overflow-hidden shadow-lg transform active:scale-95 transition-transform",
                      GEM_BORDER_COLORS_WITH_GOLD[color]
                    )}
                  >
                    <img src={GEM_IMAGES[color]} alt={color} className="w-full h-full object-cover scale-150" />
                  </div>
                ))}
              </div>
            );
          })}
          {/* Gold tokens column - circles with border */}
          {(tokenCounts['gold'] || 0) > 0 && (
            <div className="flex flex-col gap-3 items-center">
              {Array.from({ length: tokenCounts['gold'] }).map((_, i) => (
                <div
                  key={`gold-${i}`}
                  className="w-20 h-20 rounded-full border-4 overflow-hidden border-yellow-600 shadow-lg transform active:scale-95 transition-transform"
                >
                  <img src={GEM_IMAGES['gold']} alt="gold" className="w-full h-full object-cover scale-150" />
                </div>
              ))}
            </div>
          )}
        </div>
        {!hasAnyGems && <span className="text-gray-500 text-2xl font-semibold block text-center mt-10">{t('No Gems')}</span>}
      </div>
    </div>
  );
}
