import React from "react";
import { GameState, Player } from "@local-splendor/shared";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Modal } from "./Modal";

interface GameResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  playerId?: string;
  onReset?: () => void;
  onViewBoard?: () => void;
  variant?: "player" | "board";
}

export function GameResultModal({
  isOpen,
  onClose,
  gameState,
  playerId,
  onReset,
  onViewBoard,
  variant = "player",
}: GameResultModalProps) {
  const { t } = useTranslation();
  const winner = gameState.players.find((p) => p.id === gameState.winner);
  const isWinner = variant === "player" && winner?.id === playerId;

  const sortedPlayers = [...gameState.players].sort(
    (a, b) => b.score - a.score,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("Game Over")}
      maxWidth={variant === "board" ? "max-w-4xl" : "max-w-md"}
      className="border-amber-500/50"
    >
      <div
        className={clsx(
          "flex flex-col items-center",
          variant === "board" ? "gap-8" : "gap-6",
        )}
      >
        {/* Winner Display */}
        {variant === "board" ? (
          <div className="font-serif text-5xl text-blue-200">
            {t("Winner")}:{" "}
            <span className="font-bold text-amber-400">{winner?.name}</span>
          </div>
        ) : (
          <div className="font-serif text-2xl text-blue-200">
            {isWinner ? (
              <span className="animate-pulse text-green-400">
                {t("You Won!")}
              </span>
            ) : (
              <span>
                {winner?.name} {t("Won")}
              </span>
            )}
          </div>
        )}

        {/* Final Standings */}
        <div
          className={clsx(
            "flex w-full flex-col",
            variant === "board" ? "gap-4" : "gap-2",
          )}
        >
          <h3
            className={clsx(
              "border-b border-slate-700 font-bold tracking-wider text-slate-400 uppercase",
              variant === "board" ? "mb-2 pb-2 text-2xl" : "mb-2 pb-1 text-lg",
            )}
          >
            {t("Final Standings")}
          </h3>
          {sortedPlayers.map((p, i) => (
            <div
              key={p.id}
              className={clsx(
                "flex items-center justify-between rounded-xl bg-slate-700/30 transition hover:bg-slate-700/50",
                variant === "board" ? "p-4" : "p-3",
              )}
            >
              <div
                className={clsx(
                  "flex items-center",
                  variant === "board" ? "gap-6" : "gap-4",
                )}
              >
                <span
                  className={clsx(
                    "font-bold",
                    i === 0 ? "text-amber-400" : "text-slate-500",
                    variant === "board" ? "w-10 text-3xl" : "w-6 text-lg",
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={clsx(
                    "font-bold",
                    variant === "board"
                      ? p.id === gameState.winner
                        ? "text-3xl text-amber-100"
                        : "text-3xl text-slate-300"
                      : p.id === playerId
                        ? "text-lg text-yellow-400"
                        : "text-lg text-slate-300",
                  )}
                >
                  {p.name}
                </span>
              </div>
              <div
                className={clsx(
                  "flex items-center",
                  variant === "board" ? "gap-10" : "",
                )}
              >
                {variant === "board" && (
                  <div className="text-right">
                    <div className="text-sm text-slate-500 uppercase">
                      {t("Cards")}
                    </div>
                    <div className="font-mono text-2xl text-slate-300">
                      {p.cards.length}
                    </div>
                  </div>
                )}
                <div
                  className={clsx(
                    "text-right",
                    variant === "board" ? "w-24" : "",
                  )}
                >
                  {variant === "board" && (
                    <div className="text-sm text-slate-500 uppercase">
                      {t("Score")}
                    </div>
                  )}
                  <span
                    className={clsx(
                      "font-mono font-bold text-amber-400",
                      variant === "board" ? "text-5xl" : "text-xl",
                    )}
                  >
                    {p.score}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div
          className={clsx(
            "flex w-full",
            variant === "board" ? "gap-6 pt-6" : "gap-4 pt-4",
          )}
        >
          {onViewBoard && (
            <button
              onClick={onViewBoard}
              className={clsx(
                "flex-1 rounded-2xl bg-slate-700 font-bold text-white shadow-lg transition-all hover:bg-slate-600",
                variant === "board" ? "py-5 text-xl" : "py-4",
              )}
            >
              {t("View Board")}
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className={clsx(
                "flex-1 rounded-2xl bg-red-600 font-bold text-white shadow-lg transition-all hover:bg-red-700",
                variant === "board" ? "py-5 text-xl" : "py-4",
              )}
            >
              {t("Start New Game")}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
