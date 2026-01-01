import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface JoinScreenProps {
  onJoin: (roomId: string, isHost: boolean, name?: string) => void;
}

export function JoinScreen({ onJoin }: JoinScreenProps) {
  const { t } = useTranslation();
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState(
    localStorage.getItem("splendor_player_name") || "",
  );

  const handleJoin = (isHost: boolean) => {
    if (!isHost && !name.trim()) {
      alert(t("Please enter your name"));
      return;
    }
    if (name.trim()) {
      localStorage.setItem("splendor_player_name", name.trim());
    }
    onJoin(roomId || "default", isHost, name.trim());
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-8 bg-gray-900 p-4 text-white">
      <div className="space-y-4 text-center">
        <h1 className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text font-serif text-8xl font-black tracking-tighter text-transparent italic drop-shadow-2xl">
          Splendor
        </h1>
        <p className="text-sm font-bold tracking-[0.4em] text-gray-400 uppercase">
          {t("Local Multiplayer")}
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
              placeholder={t("Optional: default")}
              className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-6 py-4 text-xl font-bold text-white transition-all outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleJoin(false)}
            className="w-full rounded-[1.25rem] border border-blue-400/20 bg-gradient-to-br from-blue-600 to-blue-700 py-5 text-2xl font-black shadow-xl transition-all hover:from-blue-500 hover:to-blue-600 active:scale-[0.97]"
          >
            {t("Join as Player")}
          </button>

          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-transparent px-4 font-black tracking-[0.2em] text-gray-600">
                {t("or")}
              </span>
            </div>
          </div>

          <button
            onClick={() => handleJoin(true)}
            className="w-full rounded-[1.25rem] border border-white/5 bg-gray-700/50 py-5 text-xl font-bold text-gray-300 transition-all hover:bg-gray-700 active:scale-[0.97]"
          >
            {t("Host on this device")}
          </button>
        </div>
      </div>

      <div className="space-y-2 text-center opacity-50">
        <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
          {t("Best Experience")}
        </p>
        <p className="text-sm text-gray-500">
          {t("Host on PC · Play on Mobile")}
        </p>
      </div>
    </div>
  );
}
