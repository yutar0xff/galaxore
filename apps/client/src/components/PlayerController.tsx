import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useGame } from "../hooks/useGame";
import { Modal } from "./ui/Modal";
import { TokenColor, OreColor, Card as CardType } from "@galaxore/shared";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Gem, ShoppingCart, ArrowLeft, Wallet } from "lucide-react";
import useSound from "use-sound";
import { Dashboard } from "./player/Dashboard";
import { TakeOresView } from "./player/TakeOresView";
import { BuyCardView } from "./player/BuyCardView";
import { ReserveView } from "./player/ReserveView";
import { DiscardTokensView } from "./player/DiscardTokensView";
import { PlayerListHeader } from "./player/PlayerListHeader";
import { useBeforeUnload } from "../hooks/useBeforeUnload";
import { useDialog } from "../hooks/useDialog";
import { GameResultModal } from "./ui/GameResultModal";
import { ErrorBanner } from "./ui/ErrorBanner";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { MAX_TOKENS } from "../constants/game";
import { TokenPayment } from "../types/game";
import { TURN_SOUND } from "../constants/sounds";
import { setupAudioContextOnInteraction } from "../utils/audio";

type ActionView =
  | "DASHBOARD"
  | "TAKE_ORES"
  | "BUY_CARD"
  | "RESERVE"
  | "DISCARD_TOKENS";

export function PlayerController() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get("roomId");
  const switchUserId = searchParams.get("switchUserId");

  const { dialog, showAlert, showConfirm, closeDialog } = useDialog();

  const handleGameReset = () => {
    showAlert(t("Game has been reset by board"));
    navigate("/");
  };

  const { gameState, playerId, lobbyInfo, sendAction, error, setError } =
    useGame(roomId, {
      onGameReset: handleGameReset,
      switchUserId: switchUserId || undefined,
    });

  const [currentView, setCurrentView] = useState<ActionView>("DASHBOARD");
  const [selectedTokens, setSelectedTokens] = useState<OreColor[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentCard, setPaymentCard] = useState<CardType | null>(null);

  const [showResults, setShowResults] = useState(false);
  const [playTurnSound] = useSound(TURN_SOUND, { volume: 0.5 });
  const prevIsMyTurnRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (gameState?.gameEnded) {
      setShowResults(true);
    }
  }, [gameState?.gameEnded]);

  useBeforeUnload();

  // iOS対応: 音声コンテキストを有効化
  useEffect(() => {
    setupAudioContextOnInteraction();
  }, []);

  // Play sound when it becomes my turn (with 2 second delay)
  useEffect(() => {
    if (gameState && playerId) {
      const currentIsMyTurn =
        gameState.players[gameState.currentPlayerIndex].id === playerId;
      if (
        prevIsMyTurnRef.current !== null &&
        !prevIsMyTurnRef.current &&
        currentIsMyTurn
      ) {
        const timeoutId = setTimeout(() => {
          playTurnSound();
        }, 2000);
        return () => clearTimeout(timeoutId);
      }
      prevIsMyTurnRef.current = currentIsMyTurn;
    }
  }, [gameState?.currentPlayerIndex, playerId, gameState, playTurnSound]);

  useEffect(() => {
    if (
      gameState?.phase === "DISCARDING" &&
      gameState.players[gameState.currentPlayerIndex].id === playerId
    ) {
      if (currentView !== "DISCARD_TOKENS") {
        setCurrentView("DISCARD_TOKENS");
      }
    } else if (
      currentView === "DISCARD_TOKENS" &&
      gameState?.phase === "NORMAL"
    ) {
      setCurrentView("DASHBOARD");
    }
  }, [gameState?.phase, gameState?.currentPlayerIndex, playerId]);

  if (!gameState || !playerId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-900 p-4 text-white">
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 flex items-center gap-2 text-gray-400 hover:text-white"
        >
          ← {t("Back to Home")}
        </button>

        {!playerId || !lobbyInfo ? (
          <>
            <h2 className="text-2xl font-bold">{t("Connecting to Room...")}</h2>
            <div className="text-gray-400">
              {t("Room ID")}: {roomId}
            </div>
            <LoadingSpinner />
          </>
        ) : (
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <p className="mb-4 text-xl font-bold text-green-400">
                {t("Waiting for game to start...")}
              </p>
              <LoadingSpinner />
            </div>

            {/* プレイヤー一覧 */}
            <div className="space-y-3">
              <div className="text-xl font-bold">
                {t("Players")}: {lobbyInfo.players || 0}
              </div>
              {lobbyInfo.playerNames && lobbyInfo.playerNames.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {lobbyInfo.playerNames.map((name, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-blue-500/50 bg-blue-600/20 px-4 py-2 font-bold text-blue-300"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  {t("No players yet")}
                </div>
              )}
            </div>

            {/* ボードユーザー数 */}
            <div className="space-y-3">
              <div className="text-xl font-bold">
                {t("Board Users")}: {lobbyInfo.boardUsers || 0}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const player = gameState.players.find((p) => p.id === playerId);
  const isMyTurn =
    gameState.players[gameState.currentPlayerIndex].id === playerId;

  if (!player)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-900 p-4 text-white">
        <h2 className="text-2xl font-bold">{t("Player not found")}</h2>
        <button
          onClick={() => navigate("/")}
          className="rounded-lg bg-blue-600 px-6 py-3 font-bold hover:bg-blue-700"
        >
          {t("Back to Home")}
        </button>
      </div>
    );

  // --- Handlers ---

  // Handle token selection logic:
  // - Can select up to 3 different colors, OR 2 of the same color
  // - Clicking a selected token removes it (unless it's the only one, then duplicates it)
  const handleTokenClick = (color: OreColor) => {
    if (selectedTokens.includes(color)) {
      if (selectedTokens.length === 1 && selectedTokens[0] === color) {
        setSelectedTokens([color, color]); // 2 same
      } else {
        setSelectedTokens(selectedTokens.filter((t) => t !== color));
      }
    } else {
      if (selectedTokens.length >= 3) return; // Max 3 tokens
      if (
        selectedTokens.length === 2 &&
        selectedTokens[0] === selectedTokens[1]
      )
        return; // Can't add 3rd if already have 2 same
      setSelectedTokens([...selectedTokens, color]);
    }
  };

  const totalTokens = Object.values(player.tokens).reduce(
    (a, b) => a + (b || 0),
    0,
  );

  const submitTokens = () => {
    // Check if taking these tokens will exceed MAX_TOKENS
    if (totalTokens + selectedTokens.length > MAX_TOKENS) {
      showConfirm(
        t(
          "Taking these tokens will exceed the token limit. You will need to discard some. Proceed?",
        ),
        () => {
          sendAction({ type: "TAKE_ORES", payload: { ores: selectedTokens } });
          setSelectedTokens([]);
          setCurrentView("DASHBOARD");
        },
      );
      return;
    }

    sendAction({ type: "TAKE_ORES", payload: { ores: selectedTokens } });
    setSelectedTokens([]);
    setCurrentView("DASHBOARD");
  };

  const submitBuy = (card: CardType, payment?: TokenPayment) => {
    sendAction({ type: "BUY_CARD", payload: { cardId: card.id, payment } });
    setCurrentView("DASHBOARD");
    setPaymentModalOpen(false);
    setPaymentCard(null);
  };

  const submitReserve = (card: CardType) => {
    const goldAvailable = gameState.board.tokens.gold || 0;
    let message = t("Reserve this card?");
    if (goldAvailable === 0) {
      message = t("No gold available. Reserve anyway?");
    }
    showConfirm(message, () => {
      sendAction({ type: "RESERVE_CARD", payload: { cardId: card.id } });
      setCurrentView("DASHBOARD");
    });
  };

  const handleCardClick = (card: CardType) => {
    setPaymentCard(card);
    setPaymentModalOpen(true);
  };

  const handleDiscard = (tokens: TokenPayment) => {
    sendAction({ type: "DISCARD_TOKENS", payload: { tokens } });
    setCurrentView("DASHBOARD");
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-gray-900 text-white">
      {/* Result Modal */}
      {gameState.gameEnded && (
        <GameResultModal
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          gameState={gameState}
          playerId={playerId}
          onViewBoard={() => setShowResults(false)}
          variant="player"
        />
      )}

      {/* Show Result Button (when ended) */}
      {gameState.gameEnded && !showResults && (
        <button
          onClick={() => setShowResults(true)}
          className="fixed top-1/2 left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-2xl border-2 border-amber-400 bg-amber-600/90 px-8 py-4 text-xl font-black text-white shadow-xl backdrop-blur-md transition-all hover:bg-amber-500 active:scale-95"
        >
          {t("Show Results")}
        </button>
      )}

      {/* Player List Header - Sticky at top */}
      {gameState && (
        <PlayerListHeader
          players={gameState.players}
          currentPlayerIndex={gameState.currentPlayerIndex}
          playerId={playerId}
        />
      )}

      {/* App Header - only show back button when not on dashboard */}
      {currentView !== "DASHBOARD" && (
        <div className="flex items-center border-b border-gray-700 bg-gray-800 px-6 py-5 shadow-lg">
          <button
            onClick={() => {
              if (currentView === "DISCARD_TOKENS") return; // Cannot go back
              setCurrentView("DASHBOARD");
              setSelectedTokens([]);
            }}
            className={clsx(
              "mr-6 text-gray-300 transition-colors hover:text-white",
              currentView === "DISCARD_TOKENS" &&
                "pointer-events-none opacity-0",
            )}
          >
            <ArrowLeft size={32} />
          </button>
          <div className="flex-1 text-center text-2xl font-bold tracking-tight">
            {currentView === "TAKE_ORES" && t("Take Tokens")}
            {currentView === "BUY_CARD" && t("Buy Card")}
            {currentView === "RESERVE" && t("Reserve")}
            {currentView === "DISCARD_TOKENS" && t("Discard Tokens")}
          </div>
        </div>
      )}

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-40">
        {currentView === "DASHBOARD" && (
          <Dashboard player={player} gameState={gameState} i18n={i18n} />
        )}
        {currentView === "TAKE_ORES" && (
          <TakeOresView
            player={player}
            gameState={gameState}
            selectedTokens={selectedTokens}
            onTokenClick={handleTokenClick}
            onSubmit={submitTokens}
            isMyTurn={isMyTurn}
          />
        )}
        {currentView === "BUY_CARD" && (
          <BuyCardView
            player={player}
            gameState={gameState}
            isMyTurn={isMyTurn}
            paymentModalOpen={paymentModalOpen}
            paymentCard={paymentCard}
            onCardClick={handleCardClick}
            onPaymentSubmit={submitBuy}
            onPaymentClose={() => {
              setPaymentModalOpen(false);
              setPaymentCard(null);
            }}
            onAlert={showAlert}
          />
        )}
        {currentView === "RESERVE" && (
          <ReserveView
            player={player}
            gameState={gameState}
            isMyTurn={isMyTurn}
            onCardClick={submitReserve}
            onAlert={showAlert}
          />
        )}
        {currentView === "DISCARD_TOKENS" && (
          <DiscardTokensView player={player} onDiscard={handleDiscard} />
        )}
      </div>

      {/* Fixed Bottom Action Bar (only on dashboard) */}
      {currentView === "DASHBOARD" && (
        <div className="fixed right-0 bottom-0 left-0 z-50">
          {/* Your Turn Banner */}
          {isMyTurn && (
            <div className="border-t border-green-500 bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 text-center text-white shadow-lg">
              <span className="text-lg font-bold">{t("Your Turn")}</span>
            </div>
          )}
          {/* Action Buttons - 4 in a row */}
          <div className="flex gap-3 border-t border-gray-800 bg-gray-900 p-3">
            <button
              onClick={() => setCurrentView("TAKE_ORES")}
              className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 border-gray-700 bg-gray-800 p-4 shadow-lg transition hover:bg-gray-700 active:scale-95"
            >
              <Gem size={32} />
              <span className="text-xs font-black tracking-widest uppercase">
                {t("Take")}
              </span>
            </button>

            <button
              onClick={() => setCurrentView("BUY_CARD")}
              className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 border-gray-700 bg-gray-800 p-4 shadow-lg transition hover:bg-gray-700 active:scale-95"
            >
              <ShoppingCart size={32} />
              <span className="text-xs font-black tracking-widest uppercase">
                {t("Buy")}
              </span>
            </button>

            <button
              onClick={() => setCurrentView("RESERVE")}
              className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 border-gray-700 bg-gray-800 p-4 shadow-lg transition hover:bg-gray-700 active:scale-95"
            >
              <Wallet size={32} />
              <span className="text-xs font-black tracking-widest uppercase">
                {t("Reserve")}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Global Dialog */}
      <Modal
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        title={dialog.title}
        maxWidth="max-w-sm"
        footer={
          <div className="flex w-full justify-end gap-3">
            {dialog.type === "confirm" && (
              <button
                onClick={closeDialog}
                className="rounded-lg bg-gray-700 px-4 py-2 font-bold text-white transition-colors hover:bg-gray-600"
              >
                {t("Cancel")}
              </button>
            )}
            <button
              onClick={() => {
                if (dialog.onConfirm) dialog.onConfirm();
                closeDialog();
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        }
      >
        <p className="text-lg text-gray-300">{dialog.message}</p>
      </Modal>
    </div>
  );
}
