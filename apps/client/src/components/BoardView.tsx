import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useGame } from "../hooks/useGame";
import { Card, CardBack } from "./ui/Card";
import { Modal } from "./ui/Modal";
import { Noble } from "./ui/Noble";
import { Token, ORE_IMAGES } from "./ui/Token";
import { OreColor, TokenColor, Card as CardType } from "@galaxore/shared";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import useSound from "use-sound";
import { ORE_ORDER } from "../constants/ores";
import { ControlsSection } from "./board/ControlsSection";
import { NoblesSection } from "./board/NoblesSection";
import { ResourcesSection } from "./board/ResourcesSection";
import { CardsSection } from "./board/CardsSection";
import { PlayersList } from "./board/PlayersList";
import { SettingsModal } from "./board/SettingsModal";
import { calculateNoblesVisited, calculateBonuses } from "../utils/game";
import { useBeforeUnload } from "../hooks/useBeforeUnload";
import { useDialog } from "../hooks/useDialog";
import { GameResultModal } from "./ui/GameResultModal";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import {
  SERVER_PORT,
  MIN_PLAYERS_TO_START,
  MAX_PLAYERS,
  MIN_WINNING_SCORE,
  MAX_WINNING_SCORE,
  PRODUCTION_CLIENT_URL,
} from "../constants/game";
import { CHANGE_SOUND } from "../constants/sounds";
import { setupAudioContextOnInteraction } from "../utils/audio";

export function BoardView() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get("roomId");
  const { gameState, lobbyInfo, startGame, resetGame, sendAction } = useGame(
    roomId,
    { asBoard: true },
  );
  const [serverIp, setServerIp] = useState<string | null>(null);
  const [playChangeSound] = useSound(CHANGE_SOUND, { volume: 0.5 });
  const prevCurrentPlayerIndexRef = useRef<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useBeforeUnload();

  // iOS対応: 音声コンテキストを有効化
  useEffect(() => {
    setupAudioContextOnInteraction();
  }, []);

  useEffect(() => {
    // Fetch server IP address
    const fetchServerIp = async () => {
      try {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const response = await fetch(
          `${protocol}//${hostname}:${SERVER_PORT}/api/ip`,
        );
        const data = await response.json();
        if (data.ip) {
          setServerIp(data.ip);
        }
      } catch (error) {
        console.warn("Could not fetch server IP, using fallback:", error);
      }
    };
    fetchServerIp();
  }, []);

  // 本番環境では固定URLを使用、ローカル環境では動的に生成
  const isProduction =
    window.location.hostname === "galaxore.pages.dev" ||
    window.location.hostname.includes("pages.dev");
  const joinUrl = roomId
    ? isProduction
      ? `${PRODUCTION_CLIENT_URL}/?roomId=${roomId}`
      : (() => {
          const joinHost = serverIp || window.location.hostname;
          const port = window.location.port ? `:${window.location.port}` : "";
          return `${window.location.protocol}//${joinHost}${port}/?roomId=${roomId}`;
        })()
    : "";

  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (gameState?.gameEnded) {
      setShowResults(true);
    }
  }, [gameState?.gameEnded]);

  // Play sound when player changes
  useEffect(() => {
    if (gameState) {
      const currentIndex = gameState.currentPlayerIndex;
      if (
        prevCurrentPlayerIndexRef.current !== null &&
        prevCurrentPlayerIndexRef.current !== currentIndex
      ) {
        playChangeSound();
      }
      prevCurrentPlayerIndexRef.current = currentIndex;
    }
  }, [gameState?.currentPlayerIndex, gameState, playChangeSound]);

  if (!roomId) return <div>{t("Invalid Room ID")}</div>;

  const { dialog, showConfirm, closeDialog } = useDialog();

  const handleLeave = () => {
    showConfirm(t("Are you sure you want to leave?"), () => {
      resetGame();
      navigate("/");
    });
  };

  const handleReset = () => {
    resetGame();
  };

  if (!gameState) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-900 text-white">
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 flex items-center gap-2 text-gray-400 hover:text-white"
        >
          ← {t("Back to Home")}
        </button>

        <h1 className="text-4xl">
          {t("Room")}: {roomId}
        </h1>

        <div className="rounded-xl bg-white p-4">
          {joinUrl && <QRCodeSVG value={joinUrl} size={256} />}
        </div>
        <p className="text-gray-400">{t("Scan to Join")}</p>
        <p className="text-sm text-gray-500">{joinUrl}</p>

        <div className="w-full max-w-md space-y-6">
          {/* プレイヤー一覧 */}
          <div className="space-y-3">
            <div className="text-2xl font-bold">
              {t("Players")}: {lobbyInfo?.players || 0} / {MAX_PLAYERS}
            </div>
            {lobbyInfo?.playerNames && lobbyInfo.playerNames.length > 0 ? (
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

          {/* ボードユーザー一覧 */}
          <div className="space-y-3">
            <div className="text-2xl font-bold">
              {t("Board Users")}: {lobbyInfo?.boardUsers || 0}
            </div>
            {lobbyInfo?.boardUserNames &&
            lobbyInfo.boardUserNames.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-2">
                {lobbyInfo.boardUserNames.map((name, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-amber-500/50 bg-amber-600/20 px-4 py-2 font-bold text-amber-300"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                {t("No board users yet")}
              </div>
            )}
          </div>
        </div>

        {(lobbyInfo?.players || 0) >= MIN_PLAYERS_TO_START && (
          <button
            onClick={startGame}
            className="mt-4 animate-pulse rounded bg-green-600 px-8 py-4 text-2xl font-bold hover:bg-green-700"
          >
            {t("Start Game")}
          </button>
        )}
        {(lobbyInfo?.players || 0) < MIN_PLAYERS_TO_START && (
          <div className="mt-4 text-yellow-500">
            {t("Waiting for players...")}
          </div>
        )}
      </div>
    );
  }

  const { board, players, currentPlayerIndex } = gameState;

  // Score setting handler
  const handleSetWinningScore = (newScore: number) => {
    if (newScore < MIN_WINNING_SCORE || newScore > MAX_WINNING_SCORE) return;
    sendAction({ type: "SET_WINNING_SCORE", payload: { score: newScore } });
  };

  const winner = gameState.players.find((p) => p.id === gameState.winner);

  // 3-Column Layout: Last/Noble | Resources/Cards | Controls/Players
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black p-3 font-serif text-white">
      {/* Result Modal */}
      {gameState.gameEnded && (
        <GameResultModal
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          gameState={gameState}
          onViewBoard={() => setShowResults(false)}
          onReset={handleReset}
          variant="board"
        />
      )}

      {/* Show Result Button (when ended) */}
      {gameState.gameEnded && !showResults && (
        <button
          onClick={() => setShowResults(true)}
          className="fixed top-1/2 left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-3xl border-4 border-amber-400 bg-amber-600/90 px-12 py-8 text-4xl font-black text-white shadow-[0_0_60px_rgba(245,158,11,0.6)] backdrop-blur-md transition-all hover:bg-amber-500 active:scale-95"
        >
          {t("Show Results")}
        </button>
      )}

      {/* Container - full height minus padding */}
      <div className="grid h-full w-full flex-1 grid-cols-[18vw_1fr_26vw] gap-3 overflow-hidden">
        {/* Column 1: Controls & Nobles */}
        <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
          <ControlsSection
            winningScore={gameState.winningScore}
            onLeave={handleLeave}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          <NoblesSection nobles={board.nobles} />
        </div>

        {/* Column 2: Resources & Cards */}
        <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
          <ResourcesSection tokens={board.tokens} />
          <CardsSection cards={board.cards} />
        </div>

        {/* Column 3: Players List Only */}
        <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
          <PlayersList
            players={players}
            currentPlayerIndex={currentPlayerIndex}
          />
        </div>
      </div>

      {/* Settings Modal */}
      {gameState && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          winningScore={gameState.winningScore}
          onSetWinningScore={handleSetWinningScore}
        />
      )}

      {/* Confirm Dialog */}
      <Modal
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        title={dialog.title || t("Confirmation")}
        maxWidth="max-w-md"
        footer={
          <div className="flex w-full justify-end gap-4">
            {dialog.type === "confirm" && (
              <button
                onClick={closeDialog}
                className="rounded-xl bg-gray-700 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-gray-600"
              >
                {t("Cancel")}
              </button>
            )}
            <button
              onClick={() => {
                if (dialog.onConfirm) dialog.onConfirm();
                closeDialog();
              }}
              className="rounded-xl bg-red-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-red-700"
            >
              {t("Confirm")}
            </button>
          </div>
        }
      >
        <p className="text-2xl text-gray-300">{dialog.message}</p>
      </Modal>
    </div>
  );
}
