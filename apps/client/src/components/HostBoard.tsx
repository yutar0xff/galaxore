import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { Card, CardBack } from './ui/Card';
import { Noble } from './ui/Noble';
import { Token } from './ui/Token';
import { GemColor, TokenColor } from '@local-splendor/shared';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

export function HostBoard() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('roomId');
  const { gameState, lobbyInfo, startGame, resetGame } = useGame(roomId, { asSpectator: true });
  const [serverIp, setServerIp] = useState<string | null>(null);

  useEffect(() => {
    // Prevent accidental navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    // Fetch server IP address
    const fetchServerIp = async () => {
      try {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const serverPort = 3000;
        const response = await fetch(`${protocol}//${hostname}:${serverPort}/api/ip`);
        const data = await response.json();
        if (data.ip) {
          setServerIp(data.ip);
        }
      } catch (error) {
        console.warn('Could not fetch server IP, using fallback:', error);
      }
    };
    fetchServerIp();
  }, []);

  const joinHost = serverIp || window.location.hostname;
  const joinUrl = roomId
      ? `${window.location.protocol}//${joinHost}:${window.location.port}/game?roomId=${roomId}`
      : '';

  if (!roomId) return <div>{t('Invalid Room ID')}</div>;

  const handleLeave = () => {
      if (window.confirm(t('Are you sure you want to leave?'))) {
          navigate('/');
      }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleReset = () => {
      if (window.confirm(t('Are you sure you want to reset the game?'))) {
          resetGame();
      }
  };

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-8 relative">
        <button
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 text-gray-400 hover:text-white flex items-center gap-2"
        >
            ← Back to Home
        </button>

        <h1 className="text-4xl">Room: {roomId}</h1>

        <div className="bg-white p-4 rounded-xl">
            {joinUrl && <QRCodeSVG value={joinUrl} size={256} />}
        </div>
        <p className="text-gray-400">Scan to Join</p>
        <p className="text-sm text-gray-500">{joinUrl}</p>

        <div className="text-2xl mt-4">
          Players: {lobbyInfo?.players || 0} / 4
        </div>
        <div className="text-xl text-gray-400">
          Spectators: {lobbyInfo?.spectators || 0}
        </div>

        {(lobbyInfo?.players || 0) >= 2 && (
            <button
                onClick={startGame}
                className="px-8 py-4 bg-green-600 rounded text-2xl font-bold hover:bg-green-700 animate-pulse mt-4"
            >
                Start Game
            </button>
        )}
        {(lobbyInfo?.players || 0) < 2 && (
            <div className="text-yellow-500 mt-4">Waiting for players...</div>
        )}
      </div>
    );
  }

  const { board, players, currentPlayerIndex } = gameState;

  return (
    <div className="min-h-screen bg-gray-900 p-6 overflow-hidden flex flex-col relative text-white">
       {/* Controls */}
       <div className="absolute top-4 right-4 flex gap-4 z-50">
           <button onClick={handleReset} className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-bold backdrop-blur">
               {t('Reset Game')}
           </button>
           <div className="flex bg-gray-800 rounded">
                <button onClick={() => changeLanguage('en')} className={`px-3 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>EN</button>
                <button onClick={() => changeLanguage('ja')} className={`px-3 py-1 rounded ${i18n.language === 'ja' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>JA</button>
           </div>
       </div>

       <div className="flex flex-1 gap-6 h-full">

           {/* Left Area: Nobles (Vertical) */}
           <div className="w-24 flex flex-col gap-4 justify-center py-8">
               {board.nobles.map(noble => (
                   <div key={noble.id} className="transform scale-125 origin-left mb-4">
                       <Noble noble={noble} />
                   </div>
               ))}
           </div>

           {/* Center Area: Card Pyramid */}
           <div className="flex-1 flex flex-col justify-center gap-8 py-8 pr-8">
               {[3, 2, 1].map((level) => (
                   <div key={level} className="flex gap-6 items-center">
                       <div className="transform scale-125 origin-right mr-4">
                           <CardBack level={level as 1|2|3} />
                       </div>
                       <div className="flex gap-6">
                           {board.cards[level as 1|2|3].map(card => (
                               <div key={card.id} className="transform scale-125">
                                   <Card card={card} />
                               </div>
                           ))}
                       </div>
                   </div>
               ))}
           </div>

           {/* Right Area: Info & Tokens */}
           <div className="w-80 flex flex-col gap-6 h-full">

               {/* Token Bank */}
               <div className="bg-gray-800/80 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 flex-none">
                   <h3 className="text-gray-400 font-bold uppercase tracking-wider">{t('Resources')}</h3>
                   <div className="grid grid-cols-3 gap-4">
                       {(['emerald', 'sapphire', 'ruby', 'diamond', 'onyx', 'gold'] as TokenColor[]).map(color => (
                           <Token key={color} color={color} count={board.tokens[color] || 0} size="lg" />
                       ))}
                   </div>
               </div>

               {/* Player List */}
               <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                   {players.map((p, idx) => (
                       <div key={p.id} className={`p-4 rounded-xl transition-all ${
                           idx === currentPlayerIndex
                           ? 'bg-gradient-to-r from-yellow-900/80 to-gray-800 border-2 border-yellow-500 shadow-lg shadow-yellow-500/20'
                           : 'bg-gray-800/60 border border-gray-700'
                       }`}>
                           <div className="flex justify-between items-center mb-2">
                               <div className="font-bold text-lg truncate flex-1">{p.name}</div>
                               <div className="font-black text-2xl text-yellow-500">{p.score}</div>
                           </div>

                           {/* Stats Grid */}
                           <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-3 bg-black/20 p-2 rounded">
                               <div>{t('Cards')}: <span className="text-white font-bold">{p.cards.length}</span></div>
                               <div>{t('Res')}: <span className="text-white font-bold">{p.reserved.length}</span></div>
                           </div>

                           {/* Tokens Mini View */}
                           <div className="flex flex-wrap gap-1.5">
                               {Object.entries(p.tokens).map(([color, count]) => (
                                   (count as number) > 0 && (
                                       <div key={color} className="relative">
                                           <div className={`w-4 h-4 rounded-full ${getColorBg(color as TokenColor)}`}></div>
                                           <span className="absolute -top-2 -right-1 text-[10px] font-bold text-white drop-shadow-md">{count}</span>
                                       </div>
                                   )
                               ))}
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       </div>
    </div>
  );
}

function getColorBg(color: TokenColor) {
    switch(color) {
        case 'emerald': return 'bg-green-500';
        case 'sapphire': return 'bg-blue-500';
        case 'ruby': return 'bg-red-500';
        case 'diamond': return 'bg-white';
        case 'onyx': return 'bg-black border border-gray-600';
        case 'gold': return 'bg-yellow-400';
        default: return 'bg-gray-500';
    }
}
