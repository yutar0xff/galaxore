import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { Card, CardBack } from './ui/Card';
import { Noble } from './ui/Noble';
import { Token, GEM_IMAGES } from './ui/Token';
import { GemColor, TokenColor } from '@local-splendor/shared';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const GEM_BORDER_COLORS: Record<GemColor, string> = {
  emerald: 'border-green-700',
  sapphire: 'border-blue-700',
  ruby: 'border-red-700',
  diamond: 'border-gray-400',
  onyx: 'border-gray-600',
};

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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black p-6 overflow-hidden flex flex-col relative text-white text-xl font-serif">
       {/* Top Controls */}
       <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-6">
              <span className="text-3xl font-bold tracking-wider drop-shadow-lg text-amber-500">{t('Room')}: {roomId}</span>
              <div className="flex items-center gap-6 bg-slate-800/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-700 shadow-xl">
                  <span className="text-xl text-slate-300 font-semibold uppercase tracking-widest text-sm">{t('Resources')}</span>
                  <div className="flex gap-6">
                      {(['emerald', 'sapphire', 'ruby', 'diamond', 'onyx', 'gold'] as TokenColor[]).map(color => (
                          <Token key={color} color={color} count={board.tokens[color] || 0} size="xl" />
                      ))}
                  </div>
              </div>
          </div>
          <div className="flex gap-4 items-center">
              <button onClick={handleReset} className="bg-red-600/80 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-lg font-bold backdrop-blur shadow-lg border border-red-500/50 transition-all hover:scale-105">
                  {t('Reset Game')}
              </button>
              <div className="flex bg-slate-800/80 backdrop-blur rounded-lg text-lg border border-slate-700 p-1">
                   <button onClick={() => changeLanguage('en')} className={`px-4 py-2 rounded-md transition-all ${i18n.language === 'en' ? 'bg-blue-600 shadow-lg' : 'hover:bg-slate-700 text-slate-400'}`}>EN</button>
                   <button onClick={() => changeLanguage('ja')} className={`px-4 py-2 rounded-md transition-all ${i18n.language === 'ja' ? 'bg-blue-600 shadow-lg' : 'hover:bg-slate-700 text-slate-400'}`}>JA</button>
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

           {/* Center: Card Grid (3 rows: level 1,2,3 from top to bottom?) Wait, standard splendor has level 3 at top.
               User request: "Change deck order to 1,2,3".
               If they mean visual order from top to bottom:
               Usually it's:
               Top: Level 3
               Mid: Level 2
               Bot: Level 1

               If user wants 1,2,3 from top, I should loop [1,2,3].
               Let's assume "1,2,3" means Level 1 at top.
           */}
           <div className="flex-1 flex flex-col justify-start gap-5 py-2">
               {[1, 2, 3].map((level) => (
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
                   <div className="w-[520px] flex flex-col gap-5 h-full">
               {players.map((p, idx) => {
                   // Count card bonuses by gem color
                   const bonuses: Record<GemColor, number> = { emerald: 0, sapphire: 0, ruby: 0, diamond: 0, onyx: 0 };
                   p.cards.forEach(card => { bonuses[card.gem]++; });

                   return (
                       <div key={p.id} className={`p-6 rounded-2xl transition-all duration-300 border-2 ${
                           idx === currentPlayerIndex
                           ? 'bg-gradient-to-br from-amber-900/90 to-slate-900/90 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.3)] scale-105 z-10'
                           : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800/80'
                       }`}>
                           <div className="flex justify-between items-center mb-4">
                               <div className={clsx("font-serif text-2xl truncate flex-1 tracking-wide", idx === currentPlayerIndex ? "text-amber-100 font-bold" : "text-slate-300")}>{p.name}</div>
                               <div className="font-serif font-black text-4xl text-amber-400 drop-shadow-md">{p.score}</div>
                           </div>
                           <div className="grid grid-cols-2 gap-4 text-xl text-gray-200 mb-4">
                               <div className="bg-black/40 px-4 py-2 rounded-lg border border-white/5 flex justify-between items-center">
                                   <span className="text-slate-400 text-sm uppercase tracking-wider">{t('Cards')}</span>
                                   <span className="text-white font-bold">{p.cards.length}</span>
                               </div>
                               <div className="bg-black/40 px-4 py-2 rounded-lg border border-white/5 flex justify-between items-center">
                                   <span className="text-slate-400 text-sm uppercase tracking-wider">{t('Res')}</span>
                                   <span className="text-white font-bold">{p.reserved.length}</span>
                               </div>
                           </div>
                           {/* Tokens (circles) and Bonuses (squares) */}
                           <div className="flex gap-6">
                               {/* Tokens - circles */}
                               <div className="flex flex-wrap gap-2">
                                   {Object.entries(p.tokens).map(([color, count]) => (
                                       (count as number) > 0 && (
                                           <div key={color} className="relative group">
                                               <div className={`w-10 h-10 rounded-full border-2 border-gray-400 overflow-hidden shadow-lg transform transition-transform group-hover:scale-110`}>
                                                   <img src={GEM_IMAGES[color as TokenColor]} alt={color} className="w-full h-full object-cover scale-150" />
                                               </div>
                                               <span className="absolute -top-2 -right-2 text-sm font-bold text-white drop-shadow-md bg-slate-900 rounded-full w-6 h-6 flex items-center justify-center border border-slate-600">{count}</span>
                                           </div>
                                       )
                                   ))}
                               </div>
                               {/* Divider */}
                               {p.cards.length > 0 && <div className="w-px bg-slate-600/50 my-1"></div>}
                               {/* Bonuses - squares */}
                               <div className="flex flex-wrap gap-2">
                                   {Object.entries(bonuses).map(([color, count]) => (
                                       count > 0 && (
                                           <div key={color} className="relative group">
                                               <div className={clsx("w-10 h-10 rounded-md border-2 overflow-hidden shadow-lg transform transition-transform group-hover:scale-110", GEM_BORDER_COLORS[color as GemColor])}>
                                                   <img src={GEM_IMAGES[color as GemColor]} alt={color} className="w-full h-full object-cover scale-150" />
                                               </div>
                                               <span className="absolute -top-2 -right-2 text-sm font-bold text-white drop-shadow-md bg-slate-900 rounded-full w-6 h-6 flex items-center justify-center border border-slate-600">{count}</span>
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
