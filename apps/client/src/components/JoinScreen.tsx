import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface JoinScreenProps {
  onJoin: (roomId: string, isHost: boolean, name?: string) => void;
}

export function JoinScreen({ onJoin }: JoinScreenProps) {
  const { t } = useTranslation();
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState(localStorage.getItem('splendor_player_name') || '');

  const handleJoin = (isHost: boolean) => {
      if (!isHost && !name.trim()) {
          alert(t('Please enter your name'));
          return;
      }
      if (name.trim()) {
          localStorage.setItem('splendor_player_name', name.trim());
      }
      onJoin(roomId || 'default', isHost, name.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 bg-gray-900 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 drop-shadow-2xl font-serif italic tracking-tighter">
          Splendor
        </h1>
        <p className="text-gray-400 uppercase tracking-[0.4em] text-sm font-bold">{t('Local Multiplayer')}</p>
      </div>

      <div className="flex flex-col space-y-8 w-full max-w-md bg-gray-800/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-black pl-1 tracking-widest">{t('Player Name')}</label>
                <input
                  type="text"
                  placeholder={t('Enter your name')}
                  className="w-full px-6 py-4 bg-gray-900 border border-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 rounded-2xl text-white outline-none transition-all font-bold text-xl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-black pl-1 tracking-widest">{t('Room ID')}</label>
                <input
                  type="text"
                  placeholder={t('Optional: default')}
                  className="w-full px-6 py-4 bg-gray-900 border border-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 rounded-2xl text-white outline-none transition-all font-bold text-xl"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />
            </div>
        </div>

        <div className="flex flex-col gap-4">
            <button
              onClick={() => handleJoin(false)}
              className="w-full py-5 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-[1.25rem] font-black text-2xl shadow-xl transition-all active:scale-[0.97] border border-blue-400/20"
            >
              {t('Join as Player')}
            </button>

            <div className="relative py-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-sm uppercase"><span className="bg-transparent px-4 text-gray-600 font-black tracking-[0.2em]">{t('or')}</span></div>
            </div>

            <button
              onClick={() => handleJoin(true)}
              className="w-full py-5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-[1.25rem] font-bold text-xl transition-all border border-white/5 active:scale-[0.97]"
            >
              {t('Host on this device')}
            </button>
        </div>
      </div>

      <div className="text-center space-y-2 opacity-50">
        <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-bold">{t('Best Experience')}</p>
        <p className="text-sm text-gray-500">{t('Host on PC · Play on Mobile')}</p>
      </div>
    </div>
  );
}
