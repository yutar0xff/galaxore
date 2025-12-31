import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { Card, CardBack } from './ui/Card';
import { Modal } from './ui/Modal';
import { Noble } from './ui/Noble';
import { Token, GEM_IMAGES } from './ui/Token';
import { GemColor, TokenColor, Card as CardType } from '@local-splendor/shared';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Home, Minus, Plus } from 'lucide-react';

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
  const { gameState, lobbyInfo, startGame, resetGame, sendAction } = useGame(roomId, { asSpectator: true });
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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const [confirmDialog, setConfirmDialog] = useState<{
      isOpen: boolean;
      message: string;
      onConfirm?: () => void;
  }>({ isOpen: false, message: '' });

  const showConfirm = (message: string, onConfirm: () => void) => {
      setConfirmDialog({ isOpen: true, message, onConfirm });
  };

  const closeConfirm = () => setConfirmDialog({ ...confirmDialog, isOpen: false });

  const handleLeave = () => {
      showConfirm(t('Are you sure you want to leave?'), () => {
          resetGame();
          navigate('/');
      });
  };

  const handleReset = () => {
      resetGame();
  };

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-8 relative">
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-4 left-4 text-gray-400 hover:text-white flex items-center gap-2"
                >
                    ← {t('Back to Home')}
                </button>

                <h1 className="text-4xl">{t('Room')}: {roomId}</h1>

                <div className="bg-white p-4 rounded-xl">
                    {joinUrl && <QRCodeSVG value={joinUrl} size={256} />}
                </div>
                <p className="text-gray-400">{t('Scan to Join')}</p>
                <p className="text-sm text-gray-500">{joinUrl}</p>

                <div className="text-2xl mt-4">
                  {t('Players')}: {lobbyInfo?.players || 0} / 4
                </div>
                <div className="text-xl text-gray-400">
                  {t('Spectators')}: {lobbyInfo?.spectators || 0}
                </div>

                {(lobbyInfo?.players || 0) >= 2 && (
                    <button
                        onClick={startGame}
                        className="px-8 py-4 bg-green-600 rounded text-2xl font-bold hover:bg-green-700 animate-pulse mt-4"
                    >
                        {t('Start Game')}
                    </button>
                )}
                {(lobbyInfo?.players || 0) < 2 && (
                    <div className="text-yellow-500 mt-4">{t('Waiting for players...')}</div>
                )}
      </div>
    );
  }

  const { board, players, currentPlayerIndex } = gameState;

  // Score setting handler
  const handleSetWinningScore = (newScore: number) => {
      if (newScore < 5 || newScore > 30) return;
      sendAction({ type: 'SET_WINNING_SCORE', payload: { score: newScore } });
  };

  if (gameState.gameEnded) {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 text-center gap-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-900 to-black pointer-events-none"></div>

            <h1 className="text-8xl font-serif font-bold mb-4 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">{t('Game Over')}</h1>

            <div className="text-5xl font-serif text-blue-200 mb-8">
                {t('Winner')}: <span className="text-amber-400 font-bold">{winner?.name}</span>
            </div>

            <div className="flex flex-col gap-3 bg-slate-800/80 backdrop-blur p-8 rounded-2xl border border-amber-500/30 w-full max-w-2xl shadow-2xl">
                <h3 className="text-3xl font-bold mb-6 text-slate-300 border-b border-slate-600 pb-2">{t('Final Standings')}</h3>
                {gameState.players.sort((a,b) => b.score - a.score).map((p, i) => (
                    <div key={p.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition">
                        <div className="flex items-center gap-4">
                             <span className={clsx("font-bold text-2xl w-8", i===0 ? "text-amber-400" : "text-slate-400")}>{i+1}</span>
                             <span className={clsx("font-bold text-2xl", p.id === gameState.winner ? "text-amber-100" : "text-slate-300")}>{p.name}</span>
                        </div>
                        <div className="flex items-center gap-8">
                             <div className="text-right">
                                 <div className="text-xs text-slate-400 uppercase tracking-wider">{t('Cards')}</div>
                                 <div className="text-xl font-mono text-slate-300">{p.cards.length}</div>
                             </div>
                             <div className="text-right w-16">
                                 <div className="text-xs text-slate-400 uppercase tracking-wider">{t('Score')}</div>
                                 <div className="text-4xl font-mono font-bold text-amber-400">{p.score}</div>
                             </div>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={handleReset} className="mt-8 px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-2xl shadow-xl transition-all hover:scale-105 z-10">
                {t('Start New Game')}
            </button>
        </div>
    );
  }

  // 3-Column Layout: Last/Noble | Resources/Cards | Controls/Players
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black p-4 flex flex-col relative text-white font-serif overflow-hidden">
      {/* Container - full height minus padding */}
      <div className="flex-1 grid grid-cols-[340px_1fr_560px] gap-4 h-full">

        {/* Column 1: Last Action & Nobles */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Last Action - Fixed Height */}
          <div className="bg-slate-800/80 backdrop-blur-sm px-4 pt-6 pb-2 rounded-xl border border-slate-700 shadow-xl relative shrink-0 h-[220px] flex flex-col">
             <span className="absolute top-2 left-2 text-xs font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-sans">
               Last
             </span>
             {gameState.lastAction ? (
               <div className="flex flex-col gap-2 h-full">
                 {/* Layout changes based on action type */}
                 {(gameState.lastAction.type === 'BUY_CARD' || gameState.lastAction.type === 'RESERVE_CARD') ? (
                   /* Card: Horizontal Layout */
                   <div className="flex items-center gap-4 h-full">
                     <div className="flex flex-col flex-1">
                       <div className="text-amber-400 font-bold text-xl truncate border-b border-slate-600 pb-1 mt-2">{gameState.lastAction.playerName}</div>
                       <div className="text-slate-300 text-sm font-bold mt-1">
                         {gameState.lastAction.type === 'BUY_CARD' ? t('bought a card') : t('reserved a card')}
                       </div>
                     </div>
                     <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="scale-75 origin-center">
                          <Card card={gameState.lastAction.card!} size="sm" />
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">
                          {gameState.lastAction.type === 'RESERVE_CARD' ? t('Reserved') : t('Bought')}
                        </div>
                      </div>
                   </div>
                 ) : (
                   /* Token: Vertical Layout */
                   <div className="flex flex-col gap-2 h-full">
                     <div className="text-amber-400 font-bold text-xl truncate border-b border-slate-600 pb-1 mt-2">{gameState.lastAction.playerName}</div>
                     <div className="text-slate-300 text-sm font-bold">
                       {gameState.lastAction.type === 'TAKE_GEMS' && t('took tokens')}
                       {gameState.lastAction.type === 'DISCARD_TOKENS' && t('discarded tokens')}
                     </div>
                     <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-wrap gap-3 justify-center">
                          {Object.entries(gameState.lastAction.tokens || {}).map(([color, count]) => (
                            count && count > 0 && <Token key={color} color={color as TokenColor} count={count} size="lg" />
                          ))}
                        </div>
                     </div>
                   </div>
                 )}
               </div>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-400 italic">
                 {t('No actions yet')}
               </div>
             )}
          </div>

          {/* Nobles - Maximize Vertical Space */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-700 p-4 flex-1 relative flex flex-col items-center">
             <span className="absolute top-2 left-2 text-xs font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-sans z-10">
               Nobles
             </span>
             {/* Use full height and evenly distribute nobles */}
             <div className="flex flex-col h-full w-full items-center justify-around pt-8 pb-2">
               {board.nobles.map(noble => (
                 <div key={noble.id} className="transform scale-110 hover:scale-125 transition-transform origin-center">
                   <Noble noble={noble} size="xl" />
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Column 2: Resources & Cards */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Resources */}
          <div className="bg-slate-800/80 backdrop-blur-sm px-6 pt-8 pb-4 rounded-xl border border-slate-700 shadow-xl relative shrink-0 flex justify-center">
             <span className="absolute top-2 left-2 text-xs font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-sans">
               Resources
             </span>
             <div className="flex gap-6">
               {(['emerald', 'sapphire', 'ruby', 'diamond', 'onyx', 'gold'] as TokenColor[]).map(color => (
                 <Token key={color} color={color} count={board.tokens[color] || 0} size="lg" />
               ))}
             </div>
          </div>

          {/* Cards Grid - Changed order to 1, 2, 3 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-2">
             {[1, 2, 3].map((level) => (
               <div key={level} className="flex gap-4 items-center h-full max-h-[33%]">
                 <div className="shrink-0 h-full">
                   <CardBack level={level as 1|2|3} size="xl" />
                 </div>
                 <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar items-center h-full">
                   {board.cards[level as 1|2|3].map(card => (
                     <div key={card.id} className="shrink-0 h-full">
                         <Card card={card} size="xl" />
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Column 3: Controls & Players */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Controls Row */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
              {/* Goal */}
              <div className="bg-slate-800/80 backdrop-blur-sm px-3 pt-8 pb-3 rounded-xl border border-slate-700 shadow-xl relative flex items-center justify-between gap-2">
                <span className="absolute top-2 left-2 text-xs font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-sans">
                  Goal
                </span>
                <button
                  onClick={() => handleSetWinningScore(gameState.winningScore - 1)}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                >
                  <Minus size={20} />
                </button>
                <span className="text-3xl font-bold font-mono text-amber-400">{gameState.winningScore}</span>
                <button
                  onClick={() => handleSetWinningScore(gameState.winningScore + 1)}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Home & Lang */}
              <div className="flex gap-2">
                 <button
                    onClick={handleLeave}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-xl border border-slate-600 shadow-lg transition-all flex items-center justify-center gap-1 group"
                  >
                    <Home size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">{t('Home')}</span>
                 </button>
                 <div className="bg-slate-800/80 backdrop-blur rounded-lg border border-slate-700 p-1 flex flex-col justify-center">
                    <button onClick={() => changeLanguage('en')} className={`px-2 py-0.5 rounded text-xs font-bold ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>EN</button>
                    <button onClick={() => changeLanguage('ja')} className={`px-2 py-0.5 rounded text-xs font-bold ${i18n.language === 'ja' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>JA</button>
                 </div>
              </div>
          </div>

          {/* Players List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 p-2">
               {players.map((p, idx) => {
                   // Count card bonuses
                   const bonuses: Record<GemColor, number> = { emerald: 0, sapphire: 0, ruby: 0, diamond: 0, onyx: 0 };
                   p.cards.forEach(card => { bonuses[card.gem]++; });

                   // Calculate nobles visited
                   const cardPoints = p.cards.reduce((sum, c) => sum + c.points, 0);
                   const noblesVisited = Math.max(0, (p.score - cardPoints) / 3);

                   return (
                       <div key={p.id} className={`p-4 rounded-xl transition-all duration-300 border-2 ${
                           idx === currentPlayerIndex
                           ? 'bg-gradient-to-br from-amber-900/90 to-slate-900/90 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-[1.02] z-10 my-1'
                           : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800/80'
                       }`}>
                           <div className="flex justify-between items-center mb-2">
                               <div className={clsx("font-serif text-lg truncate flex-1 tracking-wide mr-2", idx === currentPlayerIndex ? "text-amber-100 font-bold" : "text-slate-300")}>{p.name}</div>
                               <div className="font-serif font-black text-2xl text-amber-400 drop-shadow-md">{p.score}</div>
                           </div>

                           <div className="grid grid-cols-2 gap-2 mb-2">
                               <div className="bg-black/40 px-2 py-1 rounded border border-white/5 flex justify-between items-center">
                                   <span className="text-slate-400 text-[10px] uppercase tracking-wider">{t('Res')}</span>
                                   <span className="text-white font-bold text-sm">{p.reserved.length}</span>
                               </div>
                               <div className="bg-black/40 px-2 py-1 rounded border border-white/5 flex justify-between items-center">
                                   <span className="text-slate-400 text-[10px] uppercase tracking-wider">{t('Nobles')}</span>
                                   <span className="text-white font-bold text-sm">{noblesVisited}</span>
                               </div>
                           </div>

                           {/* Tokens & Bonuses */}
                           <div className="flex flex-col gap-2">
                               {/* Tokens */}
                               <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                                   {Object.entries(p.tokens).map(([color, count]) => (
                                       (count as number) > 0 && (
                                           <div key={color} className="relative group">
                                               <div className="w-10 h-10 rounded-full border-2 border-gray-400 overflow-hidden shadow-sm">
                                                   <img src={GEM_IMAGES[color as TokenColor]} alt={color} className="w-full h-full object-cover scale-150" />
                                               </div>
                                               <span className="absolute -top-2 -right-2 text-xs font-bold text-white bg-slate-900 rounded-full w-5 h-5 flex items-center justify-center border border-slate-600">{count}</span>
                                           </div>
                                       )
                                   ))}
                               </div>

                               <div className="h-px bg-slate-600/30 w-full"></div>

                               {/* Bonuses */}
                               <div className="flex flex-wrap gap-1 min-h-[24px]">
                                   {Object.entries(bonuses).map(([color, count]) => (
                                       count > 0 && (
                                           <div key={color} className="relative group">
                                               <div className={clsx("w-6 h-6 rounded-sm border overflow-hidden shadow-sm", GEM_BORDER_COLORS[color as GemColor])}>
                                                   <img src={GEM_IMAGES[color as GemColor]} alt={color} className="w-full h-full object-cover scale-150" />
                                               </div>
                                               <span className="absolute -top-2 -right-2 text-[10px] font-bold text-white bg-slate-900 rounded-full w-4 h-4 flex items-center justify-center border border-slate-600">{count}</span>
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

      {/* Confirm Dialog */}
      <Modal
         isOpen={confirmDialog.isOpen}
         onClose={closeConfirm}
         title={t('Confirmation')}
         maxWidth="max-w-sm"
         footer={
             <div className="flex justify-end gap-3 w-full">
                 <button
                     onClick={closeConfirm}
                     className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
                 >
                     {t('Cancel')}
                 </button>
                 <button
                     onClick={() => {
                         if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                         closeConfirm();
                     }}
                     className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
                 >
                     {t('Confirm')}
                 </button>
             </div>
         }
      >
         <p className="text-gray-300 text-lg">{confirmDialog.message}</p>
      </Modal>
    </div>
  );
}
