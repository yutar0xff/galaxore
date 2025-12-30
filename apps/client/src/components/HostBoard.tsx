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
    <div className="min-h-screen bg-gray-900 p-6 overflow-hidden flex flex-col relative text-white text-xl">
       {/* Top Controls */}
       <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-6">
              <span className="text-3xl font-bold">{t('Room')}: {roomId}</span>
              <div className="flex items-center gap-6 bg-gray-800 px-6 py-4 rounded-2xl">
                  <span className="text-xl text-gray-300 font-semibold">{t('Resources')}</span>
                  <div className="flex gap-6">
                      {(['emerald', 'sapphire', 'ruby', 'diamond', 'onyx', 'gold'] as TokenColor[]).map(color => (
                          <Token key={color} color={color} count={board.tokens[color] || 0} size="xl" />
                      ))}
                  </div>
              </div>
          </div>
          <div className="flex gap-4 items-center">
              <button onClick={handleReset} className="bg-red-600/80 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-lg font-bold backdrop-blur">
                  {t('Reset Game')}
              </button>
              <div className="flex bg-gray-800 rounded-lg text-lg">
                   <button onClick={() => changeLanguage('en')} className={`px-4 py-2 rounded-lg ${i18n.language === 'en' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>EN</button>
                   <button onClick={() => changeLanguage('ja')} className={`px-4 py-2 rounded-lg ${i18n.language === 'ja' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>JA</button>
              </div>
          </div>
       </div>

       <div className="flex flex-1 gap-8 h-full">

           {/* Left: Nobles */}
           <div className="w-44 flex flex-col gap-5 justify-start py-4">
               {board.nobles.map(noble => (
                   <Noble key={noble.id} noble={noble} size="xl" />
               ))}
           </div>

           {/* Center: Card Grid (3 rows: level 3,2,1) */}
           <div className="flex-1 flex flex-col justify-start gap-5 py-2">
               {[3, 2, 1].map((level) => (
                   <div key={level} className="flex gap-5 items-center">
                       <CardBack level={level as 1|2|3} size="xl" />
                       <div className="flex gap-5">
                           {board.cards[level as 1|2|3].map(card => (
                               <Card key={card.id} card={card} size="xl" />
                           ))}
                       </div>
                   </div>
               ))}
           </div>

           {/* Right: Players list */}
           <div className="w-[420px] flex flex-col gap-5 h-full">
               {players.map((p, idx) => {
                   // Count card bonuses by gem color
                   const bonuses: Record<GemColor, number> = { emerald: 0, sapphire: 0, ruby: 0, diamond: 0, onyx: 0 };
                   p.cards.forEach(card => { bonuses[card.gem]++; });

                   return (
                       <div key={p.id} className={`p-6 rounded-2xl transition-all ${
                           idx === currentPlayerIndex
                           ? 'bg-gradient-to-r from-yellow-900/80 to-gray-800 border-3 border-yellow-500 shadow-lg shadow-yellow-500/20'
                           : 'bg-gray-800/60 border border-gray-700'
                       }`}>
                           <div className="flex justify-between items-center mb-4">
                               <div className="font-bold text-2xl truncate flex-1">{p.name}</div>
                               <div className="font-black text-4xl text-yellow-400">{p.score}</div>
                           </div>
                           <div className="grid grid-cols-2 gap-4 text-xl text-gray-200 mb-4">
                               <div className="bg-black/30 px-5 py-3 rounded-lg">{t('Cards')}: <span className="text-white font-bold">{p.cards.length}</span></div>
                               <div className="bg-black/30 px-5 py-3 rounded-lg">{t('Res')}: <span className="text-white font-bold">{p.reserved.length}</span></div>
                           </div>
                           {/* Tokens (circles) and Bonuses (squares) */}
                           <div className="flex gap-6">
                               {/* Tokens - circles */}
                               <div className="flex flex-wrap gap-2">
                                   {Object.entries(p.tokens).map(([color, count]) => (
                                       (count as number) > 0 && (
                                           <div key={color} className="relative">
                                               <div className={`w-8 h-8 rounded-full ${getColorBg(color as TokenColor)}`}></div>
                                               <span className="absolute -top-2 -right-2 text-sm font-bold text-white drop-shadow-md bg-gray-900/80 rounded-full px-1">{count}</span>
                                           </div>
                                       )
                                   ))}
                               </div>
                               {/* Divider */}
                               {p.cards.length > 0 && <div className="w-px bg-gray-600"></div>}
                               {/* Bonuses - squares */}
                               <div className="flex flex-wrap gap-2">
                                   {Object.entries(bonuses).map(([color, count]) => (
                                       count > 0 && (
                                           <div key={color} className="relative">
                                               <div className={`w-8 h-8 rounded-sm ${getColorBg(color as GemColor)} border-2 ${getBorderColor(color as GemColor)}`}></div>
                                               <span className="absolute -top-2 -right-2 text-sm font-bold text-white drop-shadow-md bg-gray-900/80 rounded-full px-1">{count}</span>
                                           </div>
                                       )
                                   ))}
                               </div>
                           </div>
                       </div>
                   );
               })}
           </div>
       </div>
    </div>
  );
}

function getColorBg(color: TokenColor | GemColor) {
    switch(color) {
        case 'emerald': return 'bg-green-500';
        case 'sapphire': return 'bg-blue-500';
        case 'ruby': return 'bg-red-500';
        case 'diamond': return 'bg-white';
        case 'onyx': return 'bg-gray-800';
        case 'gold': return 'bg-yellow-400';
        default: return 'bg-gray-500';
    }
}

function getBorderColor(color: GemColor) {
    switch(color) {
        case 'emerald': return 'border-green-700';
        case 'sapphire': return 'border-blue-700';
        case 'ruby': return 'border-red-700';
        case 'diamond': return 'border-gray-400';
        case 'onyx': return 'border-gray-600';
        default: return 'border-gray-500';
    }
}
