import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PRODUCTION_CLIENT_URL } from "../constants/game";

interface JoinScreenProps {
  onJoin: (roomId: string, isBoard: boolean, name?: string) => void;
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

// ランダムな星の名前を取得
const getRandomPlanetName = () => {
  return PLANET_NAMES[Math.floor(Math.random() * PLANET_NAMES.length)];
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

export function JoinScreen({ onJoin }: JoinScreenProps) {
  const { t } = useTranslation();
  const defaultName = useMemo(
    () => localStorage.getItem("splendor_player_name") || getRandomPlanetName(),
    [],
  );
  // ローカル環境でのみデフォルト値を設定
  const defaultRoomId = useMemo(
    () => (isLocalEnvironment() ? "default" : ""),
    [],
  );
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [name, setName] = useState(defaultName);

  const handleJoin = (isBoard: boolean) => {
    if (!isBoard && !name.trim()) {
      alert(t("Please enter your name"));
      return;
    }
    if (name.trim()) {
      localStorage.setItem("splendor_player_name", name.trim());
    }
    // ローカル環境でのみフォールバックを使用
    const finalRoomId =
      roomId.trim() || (isLocalEnvironment() ? "default" : "");
    if (!finalRoomId) {
      alert(t("Please enter a Room ID"));
      return;
    }
    onJoin(finalRoomId, isBoard, name.trim());
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-8 bg-gray-900 p-4 text-white">
      <div className="w-full max-w-2xl space-y-4 px-4 text-center">
        <h1 className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text font-serif text-5xl font-black tracking-tight break-words text-transparent italic drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl">
          Splendor
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
              {t("Player Name")}
            </label>
            <input
              type="text"
              placeholder={t("Enter your name")}
              className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-6 py-4 text-xl font-bold text-white transition-all outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="pl-1 text-xs font-black tracking-widest text-gray-500 uppercase">
            {t("Join as")}
          </label>
          <div className="flex flex-row gap-4">
            <button
              onClick={() => handleJoin(false)}
              className="flex-1 rounded-[1.25rem] border border-blue-400/20 bg-gradient-to-br from-blue-600 to-blue-700 py-5 text-2xl font-black shadow-xl transition-all hover:from-blue-500 hover:to-blue-600 active:scale-[0.97]"
            >
              {t("Player")}
            </button>

            <button
              onClick={() => handleJoin(true)}
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
