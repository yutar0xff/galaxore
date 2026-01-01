import React from 'react';
import { GameState, Player } from '@local-splendor/shared';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Modal } from './Modal';

interface GameResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  playerId?: string;
  onReset?: () => void;
  onViewBoard?: () => void;
  variant?: 'player' | 'host';
}

export function GameResultModal({
  isOpen,
  onClose,
  gameState,
  playerId,
  onReset,
  onViewBoard,
  variant = 'player',
}: GameResultModalProps) {
  const { t } = useTranslation();
  const winner = gameState.players.find(p => p.id === gameState.winner);
  const isWinner = variant === 'player' && winner?.id === playerId;

  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Game Over')}
      maxWidth={variant === 'host' ? 'max-w-4xl' : 'max-w-md'}
      className="border-amber-500/50"
    >
      <div className={clsx("flex flex-col items-center", variant === 'host' ? "gap-8" : "gap-6")}>
        {/* Winner Display */}
        {variant === 'host' ? (
          <div className="text-5xl font-serif text-blue-200">
            {t('Winner')}: <span className="text-amber-400 font-bold">{winner?.name}</span>
          </div>
        ) : (
          <div className="text-2xl font-serif text-blue-200">
            {isWinner ? (
              <span className="text-green-400 animate-pulse">{t('You Won!')}</span>
            ) : (
              <span>{winner?.name} {t('Won')}</span>
            )}
          </div>
        )}

        {/* Final Standings */}
        <div className={clsx("flex flex-col w-full", variant === 'host' ? "gap-4" : "gap-2")}>
          <h3 className={clsx(
            "font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700",
            variant === 'host' ? "text-2xl pb-2 mb-2" : "text-lg pb-1 mb-2"
          )}>
            {t('Final Standings')}
          </h3>
          {sortedPlayers.map((p, i) => (
            <div
              key={p.id}
              className={clsx(
                "flex justify-between items-center rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition",
                variant === 'host' ? "p-4" : "p-3"
              )}
            >
              <div className={clsx("flex items-center", variant === 'host' ? "gap-6" : "gap-4")}>
                <span className={clsx(
                  "font-bold",
                  i === 0 ? "text-amber-400" : "text-slate-500",
                  variant === 'host' ? "text-3xl w-10" : "text-lg w-6"
                )}>
                  {i + 1}
                </span>
                <span className={clsx(
                  "font-bold",
                  variant === 'host'
                    ? (p.id === gameState.winner ? "text-amber-100 text-3xl" : "text-slate-300 text-3xl")
                    : (p.id === playerId ? "text-yellow-400 text-lg" : "text-slate-300 text-lg")
                )}>
                  {p.name}
                </span>
              </div>
              <div className={clsx("flex items-center", variant === 'host' ? "gap-10" : "")}>
                {variant === 'host' && (
                  <div className="text-right">
                    <div className="text-sm text-slate-500 uppercase">{t('Cards')}</div>
                    <div className="text-2xl font-mono text-slate-300">{p.cards.length}</div>
                  </div>
                )}
                <div className={clsx(
                  "text-right",
                  variant === 'host' ? "w-24" : ""
                )}>
                  {variant === 'host' && (
                    <div className="text-sm text-slate-500 uppercase">{t('Score')}</div>
                  )}
                  <span className={clsx(
                    "font-mono font-bold text-amber-400",
                    variant === 'host' ? "text-5xl" : "text-xl"
                  )}>
                    {p.score}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className={clsx("flex w-full", variant === 'host' ? "gap-6 pt-6" : "gap-4 pt-4")}>
          {onViewBoard && (
            <button
              onClick={onViewBoard}
              className={clsx(
                "flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl shadow-lg transition-all",
                variant === 'host' ? "py-5 text-xl" : "py-4"
              )}
            >
              {t('View Board')}
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className={clsx(
                "flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg transition-all",
                variant === 'host' ? "py-5 text-xl" : "py-4"
              )}
            >
              {t('Start New Game')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
