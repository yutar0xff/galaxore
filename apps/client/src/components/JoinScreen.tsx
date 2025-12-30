import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface JoinScreenProps {
  onJoin: (roomId: string, isHost: boolean) => void;
}

export function JoinScreen({ onJoin }: JoinScreenProps) {
  const { t } = useTranslation();
  const [roomId, setRoomId] = useState('');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
      <h1 className="text-4xl font-bold text-yellow-500">{t('Local Splendor')}</h1>

      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <input
          type="text"
          placeholder={t('Room ID')}
          className="px-4 py-2 text-black rounded"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <button
          onClick={() => onJoin(roomId || 'default', false)}
          className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 font-bold"
        >
          {t('Join as Player')}
        </button>

        <div className="border-t border-gray-700 my-4"></div>

        <button
          onClick={() => onJoin(roomId || 'default', true)}
          className="px-6 py-3 bg-purple-600 rounded hover:bg-purple-700 font-bold"
        >
          {t('Enter Room as Host')}
        </button>
      </div>

      <div className="text-sm text-gray-500">
        <p>{t('Host on PC, Play on Mobile')}</p>
      </div>
    </div>
  );
}
