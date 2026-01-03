import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRoomInfo } from "../hooks/useRoomInfo";
import { getSocket } from "../infrastructure/socket";
import { EVENTS } from "@galaxore/shared";
import { Socket } from "socket.io-client";

interface JoinScreenProps {
  onJoin: (
    roomId: string,
    isBoard: boolean,
    name?: string,
    switchUserId?: string,
  ) => void;
}

// 太陽系の星の名前リスト
const PLANET_NAMES = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "Sun",
  "Moon",
];

// ランダムな星の名前を取得（既存プレイヤー名を除外）
const getRandomPlanetName = (excludeNames: string[] = []): string => {
  const availableNames = PLANET_NAMES.filter(
    (name) => !excludeNames.includes(name),
  );
  if (availableNames.length === 0) {
    // すべて使用済みの場合は、ランダムな番号を追加
    return `Planet${Math.floor(Math.random() * 1000)}`;
  }
  return availableNames[Math.floor(Math.random() * availableNames.length)];
};

// ローカル環境かどうかを判定
const isLocalEnvironment = () => {
  return (
    !window.location.hostname.includes("pages.dev") &&
    !window.location.hostname.includes("railway.app") &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("192.168.") ||
      window.location.hostname.includes("10."))
  );
};

type Step = "roomId" | "playerSelection" | "deviceSwitch";

export function JoinScreen({ onJoin }: JoinScreenProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("roomId");
  const [selectedRole, setSelectedRole] = useState<"player" | "board" | null>(
    null,
  );
  const [roomId, setRoomId] = useState(isLocalEnvironment() ? "default" : "");
  const [name, setName] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [socketRef, setSocketRef] = useState<Socket | null>(null);

  // プレイヤー選択画面では定期的にルーム情報を更新（2秒ごと）
  const { roomInfo, loading, error } = useRoomInfo(
    step !== "roomId" ? roomId : null,
    step === "playerSelection" ? 2000 : 0, // プレイヤー選択時のみポーリング
  );

  // 既存プレイヤー名のリスト
  const existingPlayerNames = useMemo(() => {
    return roomInfo?.players.map((p) => p.name) || [];
  }, [roomInfo]);

  // 名前のデフォルト値を生成（既存プレイヤー名と重複しない）
  useEffect(() => {
    if (step === "playerSelection" && !name) {
      const savedName = localStorage.getItem("galaxore_player_name");
      if (savedName && !existingPlayerNames.includes(savedName)) {
        setName(savedName);
      } else {
        setName(getRandomPlanetName(existingPlayerNames));
      }
    }
  }, [step, existingPlayerNames, name]);

  // ゲーム開始済みの場合の処理
  useEffect(() => {
    if (roomInfo?.gameStarted && selectedRole && roomId) {
      handleGameStarted();
    }
  }, [roomInfo?.gameStarted, selectedRole, roomId]);

  const handleGameStarted = async () => {
    const userId = localStorage.getItem("galaxore_user_id");
    if (!userId) return;

    // Socket接続を確立
    const socket = await getSocket();
    setSocketRef(socket);

    if (!socket.connected) {
      socket.connect();
    }

    socket.once("connect", () => {
      // 同じuserIdで再接続を試行
      socket.emit(EVENTS.JOIN_ROOM, {
        roomId,
        asBoard: selectedRole === "board",
        userId,
        name: selectedRole === "player" ? name : undefined,
      });

      socket.once(
        EVENTS.ERROR,
        ({
          message,
          availablePlayers,
        }: {
          message: string;
          availablePlayers?: any[];
        }) => {
          if (availablePlayers && availablePlayers.length > 0) {
            // デバイス切り替えが必要
            setStep("deviceSwitch");
          } else {
            alert(message);
          }
        },
      );

      socket.once(EVENTS.UPDATE_GAME_STATE, () => {
        // 再接続成功
        onJoin(
          roomId,
          selectedRole === "board",
          selectedRole === "player" ? name : undefined,
        );
      });
    });
  };

  const handleRoomIdSubmit = () => {
    const finalRoomId =
      roomId.trim() || (isLocalEnvironment() ? "default" : "");
    if (!finalRoomId) {
      alert(t("Please enter a Room ID"));
      return;
    }
    setRoomId(finalRoomId);
  };

  const handleRoleSelect = (role: "player" | "board") => {
    setSelectedRole(role);
    const finalRoomId =
      roomId.trim() || (isLocalEnvironment() ? "default" : "");
    if (!finalRoomId) {
      alert(t("Please enter a Room ID"));
      return;
    }
    setRoomId(finalRoomId);

    // Board選択時は直接参加
    if (role === "board") {
      onJoin(finalRoomId, true);
      return;
    }

    // Player選択時はロビー情報を表示
    setStep("playerSelection");
  };

  const handlePlayerJoin = () => {
    if (!name.trim()) {
      alert(t("Please enter your name"));
      return;
    }
    if (existingPlayerNames.includes(name.trim())) {
      alert(t("This name is already taken. Please choose another name."));
      return;
    }
    localStorage.setItem("galaxore_player_name", name.trim());
    onJoin(roomId, false, name.trim());
  };

  const handleDeviceSwitch = async () => {
    if (!selectedPlayerId || !socketRef) return;

    socketRef.emit(EVENTS.SWITCH_DEVICE, {
      roomId,
      targetUserId: selectedPlayerId,
    });

    socketRef.once(EVENTS.UPDATE_GAME_STATE, () => {
      onJoin(roomId, selectedRole === "board", undefined, selectedPlayerId);
    });

    socketRef.once(EVENTS.ERROR, ({ message }: { message: string }) => {
      alert(message);
    });
  };

  // ステップ1: ゲームID入力とplayer/board選択
  if (step === "roomId") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-8 bg-gray-900 p-4 text-white">
        <div className="w-full max-w-2xl space-y-4 px-4 text-center">
          <h1 className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text font-serif text-5xl font-black tracking-tight break-words text-transparent italic drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl">
            Galaxore
          </h1>
          <p className="text-xs font-bold tracking-[0.4em] text-gray-400 uppercase sm:text-sm">
            {t("Local Multiplayer")}
          </p>
          <p className="mt-2 text-[10px] text-gray-500 opacity-60">
            Unofficial fan project · Splendor™ is a trademark of Space Cowboys /
            Asmodee Group
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col space-y-8 rounded-[2.5rem] border border-white/10 bg-gray-800/50 p-10 shadow-2xl backdrop-blur-xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="pl-1 text-xs font-black tracking-widest text-gray-500 uppercase">
                {t("Room ID")}
              </label>
              <input
                type="text"
                placeholder={isLocalEnvironment() ? "default" : ""}
                className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-6 py-4 text-xl font-bold text-white transition-all outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRoomIdSubmit();
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="pl-1 text-xs font-black tracking-widest text-gray-500 uppercase">
              {t("Join as")}
            </label>
            <div className="flex flex-row gap-4">
              <button
                onClick={() => handleRoleSelect("player")}
                className="flex-1 rounded-[1.25rem] border border-blue-400/20 bg-gradient-to-br from-blue-600 to-blue-700 py-5 text-2xl font-black shadow-xl transition-all hover:from-blue-500 hover:to-blue-600 active:scale-[0.97]"
              >
                {t("Player")}
              </button>

              <button
                onClick={() => handleRoleSelect("board")}
                className="flex-1 rounded-[1.25rem] border border-amber-400/20 bg-gradient-to-br from-amber-600 to-amber-700 py-5 text-2xl font-black shadow-xl transition-all hover:from-amber-500 hover:to-amber-600 active:scale-[0.97]"
              >
                {t("Board")}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-center opacity-50">
          <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
            {t("Best Experience")}
          </p>
          <p className="text-sm text-gray-500">
            {t("Board on PC · Play on Mobile")}
          </p>
        </div>
      </div>
    );
  }

  // ステップ2: Player選択時のUI
  if (step === "playerSelection") {
    const isNameTaken = Boolean(
      name.trim() && existingPlayerNames.includes(name.trim()),
    );

    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-8 bg-gray-900 p-4 text-white">
        <div className="w-full max-w-2xl space-y-4 px-4 text-center">
          <h1 className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text font-serif text-5xl font-black tracking-tight break-words text-transparent italic drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl">
            Galaxore
          </h1>
          <p className="text-xs font-bold tracking-[0.4em] text-gray-400 uppercase sm:text-sm">
            {t("Local Multiplayer")}
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col space-y-8 rounded-[2.5rem] border border-white/10 bg-gray-800/50 p-10 shadow-2xl backdrop-blur-xl">
          {loading ? (
            <div className="text-center text-gray-400">{t("Loading...")}</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <>
              {/* 待機中プレイヤー一覧 */}
              {roomInfo && roomInfo.players.length > 0 && (
                <div className="space-y-2">
                  <label className="pl-1 text-xs font-black tracking-widest text-gray-500 uppercase">
                    {t("Waiting Players")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {roomInfo.players.map((player) => (
                      <span
                        key={player.id}
                        className="rounded-full border border-blue-500/50 bg-blue-600/20 px-4 py-2 text-sm font-bold text-blue-300"
                      >
                        {player.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ボードユーザー数 */}
              {roomInfo && (
                <div className="space-y-2">
                  <label className="pl-1 text-xs font-black tracking-widest text-gray-500 uppercase">
                    {t("Board Users")}: {roomInfo.boardUsers}
                  </label>
                </div>
              )}

              {/* 名前入力欄 */}
              <div className="space-y-2">
                <label className="pl-1 text-xs font-black tracking-widest text-gray-500 uppercase">
                  {t("Player Name")}
                </label>
                <input
                  type="text"
                  placeholder={t("Enter your name")}
                  className={`w-full rounded-2xl border px-6 py-4 text-xl font-bold text-white transition-all outline-none focus:ring-2 ${
                    isNameTaken
                      ? "border-red-500 bg-gray-900 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-700 bg-gray-900 focus:border-amber-500 focus:ring-amber-500"
                  }`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {isNameTaken && (
                  <p className="text-xs text-red-400">
                    {t("This name is already taken")}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep("roomId")}
                  className="flex-1 rounded-[1.25rem] border border-gray-600 bg-gray-700 py-4 text-lg font-bold shadow-xl transition-all hover:bg-gray-600 active:scale-[0.97]"
                >
                  {t("Back")}
                </button>
                <button
                  onClick={handlePlayerJoin}
                  disabled={!name.trim() || isNameTaken}
                  className="flex-1 rounded-[1.25rem] border border-blue-400/20 bg-gradient-to-br from-blue-600 to-blue-700 py-4 text-lg font-black shadow-xl transition-all hover:from-blue-500 hover:to-blue-600 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("Join as Player")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ステップ3: デバイス切り替え選択
  if (step === "deviceSwitch" && roomInfo?.gameStarted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-8 bg-gray-900 p-4 text-white">
        <div className="w-full max-w-2xl space-y-4 px-4 text-center">
          <h1 className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text font-serif text-5xl font-black tracking-tight break-words text-transparent italic drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl">
            Galaxore
          </h1>
          <p className="text-xs font-bold tracking-[0.4em] text-gray-400 uppercase sm:text-sm">
            {t("Game Already Started")}
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col space-y-8 rounded-[2.5rem] border border-white/10 bg-gray-800/50 p-10 shadow-2xl backdrop-blur-xl">
          <div className="space-y-4">
            <p className="text-center text-gray-300">
              {t("Select a player to switch device")}
            </p>
            {roomInfo.players.map((player) => (
              <button
                key={player.id}
                onClick={() => setSelectedPlayerId(player.id)}
                className={`w-full rounded-2xl border px-6 py-4 text-lg font-bold transition-all ${
                  selectedPlayerId === player.id
                    ? "border-blue-500 bg-blue-600/20 text-blue-300"
                    : "border-gray-700 bg-gray-900 text-white hover:border-gray-600"
                }`}
              >
                {player.name}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep("roomId")}
              className="flex-1 rounded-[1.25rem] border border-gray-600 bg-gray-700 py-4 text-lg font-bold shadow-xl transition-all hover:bg-gray-600 active:scale-[0.97]"
            >
              {t("Back")}
            </button>
            <button
              onClick={handleDeviceSwitch}
              disabled={!selectedPlayerId}
              className="flex-1 rounded-[1.25rem] border border-blue-400/20 bg-gradient-to-br from-blue-600 to-blue-700 py-4 text-lg font-black shadow-xl transition-all hover:from-blue-500 hover:to-blue-600 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("Switch Device")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
