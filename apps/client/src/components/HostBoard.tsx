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

  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
      if (gameState?.gameEnded) {
          setShowResults(true);
      }
  }, [gameState?.gameEnded]);

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
                  {t('Players')}: {lobbyInfo?.players || 0} / 6
                </div>
                {lobbyInfo?.playerNames && lobbyInfo.playerNames.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 max-w-md">
                        {lobbyInfo.playerNames.map((name, i) => (
                            <span key={i} className="px-3 py-1 bg-slate-800 rounded-full text-amber-400 font-bold border border-slate-700">{name}</span>
                        ))}
                    </div>
                )}
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

  const winner = gameState.players.find(p => p.id === gameState.winner);

  // 3-Column Layout: Last/Noble | Resources/Cards | Controls/Players
  return (
    <div className="h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black p-3 flex flex-col relative text-white font-serif overflow-hidden">
      {/* Result Modal */}
      {gameState.gameEnded && (
          <Modal
            isOpen={showResults}
            onClose={() => setShowResults(false)}
            title={t('Game Over')}
            maxWidth="max-w-4xl"
            className="border-amber-500/50"
          >
            <div className="flex flex-col items-center gap-8">
                <div className="text-5xl font-serif text-blue-200">
                    {t('Winner')}: <span className="text-amber-400 font-bold">{winner?.name}</span>
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <h3 className="text-2xl font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700 pb-2 mb-2">{t('Final Standings')}</h3>
                    {gameState.players.sort((a,b) => b.score - a.score).map((p, i) => (
                        <div key={p.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition">
                            <div className="flex items-center gap-6">
                                 <span className={clsx("font-bold text-3xl w-10", i===0 ? "text-amber-400" : "text-slate-500")}>{i+1}</span>
                                 <span className={clsx("font-bold text-3xl", p.id === gameState.winner ? "text-amber-100" : "text-slate-300")}>{p.name}</span>
                            </div>
                            <div className="flex items-center gap-10">
                                 <div className="text-right">
                                     <div className="text-sm text-slate-500 uppercase">{t('Cards')}</div>
                                     <div className="text-2xl font-mono text-slate-300">{p.cards.length}</div>
                                 </div>
                                 <div className="text-right w-24">
                                     <div className="text-sm text-slate-500 uppercase">{t('Score')}</div>
                                     <div className="text-5xl font-mono font-bold text-amber-400">{p.score}</div>
                                 </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-6 w-full pt-6">
                    <button onClick={() => setShowResults(false)} className="flex-1 py-5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl shadow-lg transition-all text-xl">
                        {t('View Board')}
                    </button>
                    <button onClick={handleReset} className="flex-1 py-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg transition-all text-xl">
                        {t('Start New Game')}
                    </button>
                </div>
            </div>
          </Modal>
      )}

      {/* Show Result Button (when ended) */}
      {gameState.gameEnded && !showResults && (
          <button
            onClick={() => setShowResults(true)}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 px-12 py-8 bg-amber-600/90 hover:bg-amber-500 text-white text-4xl font-black rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.6)] border-4 border-amber-400 animate-pulse backdrop-blur-md transition-all active:scale-95"
          >
            {t('Show Results')}
          </button>
      )}

      {/* Container - full height minus padding */}
      <div className="flex-1 grid grid-cols-[18vw_1fr_26vw] gap-3 h-full w-full overflow-hidden">

        {/* Column 1: Controls & Nobles */}
        <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
          {/* Controls Row */}
          <div className="grid grid-cols-2 gap-2 shrink-0">
              {/* Goal */}
              <div className="bg-slate-800/80 backdrop-blur-sm px-3 pt-7 pb-2 rounded-xl border border-slate-700 shadow-xl relative flex items-center justify-between gap-2">
                <span className="absolute top-1.5 left-1.5 text-xs font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-sans">
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
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-xl border border-slate-600 shadow-lg transition-all flex items-center justify-center gap-1 group py-2"
                 >
                    <Home size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">{t('Home')}</span>
                 </button>
                 <div className="bg-slate-800/80 backdrop-blur rounded-lg border border-slate-700 p-1 flex flex-col justify-center gap-0.5">
                    <button onClick={() => changeLanguage('en')} className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>EN</button>
                    <button onClick={() => changeLanguage('ja')} className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${i18n.language === 'ja' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>JA</button>
                 </div>
              </div>
          </div>

          {/* Nobles - Maximize Vertical Space */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-700 p-3 flex-1 relative flex flex-col items-center min-h-0 overflow-hidden">
             <span className="absolute top-2 left-2 text-xs font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-sans z-10">
               Nobles
             </span>
             {/* Dynamic layout for nobles - no scrollbar */}
             <div className={clsx(
               "h-full w-full pt-8 pb-1 overflow-hidden",
               board.nobles.length <= 4
                 ? "flex flex-col items-center"
                 : "grid grid-cols-2 gap-2 items-center justify-center"
             )}>
               {board.nobles.map(noble => (
                 <div key={noble.id} className={clsx(
                   board.nobles.length <= 4
                     ? "flex-1 min-h-0 w-full flex items-center justify-center"
                     : "h-full w-full flex items-center justify-center"
                 )}>
                   <Noble noble={noble} size="xl" />
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Column 2: Resources & Cards */}
        <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
          {/* Resources - Compact */}
          <div className="bg-slate-800/80 backdrop-blur-sm px-4 pt-7 pb-3 rounded-xl border border-slate-700 shadow-xl relative shrink-0 flex justify-center items-center">
             <span className="absolute top-1.5 left-1.5 text-xs font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-sans">
               Resources
             </span>
             <div className="flex gap-4 items-center">
               {(['ruby', 'emerald', 'sapphire', 'diamond', 'onyx', 'gold'] as TokenColor[]).map(color => (
                 <Token key={color} color={color} count={board.tokens[color] || 0} size="lg" />
               ))}
             </div>
          </div>

          {/* Cards Grid - Each level fills 1/3 of remaining space */}
          <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden">
             {[1, 2, 3].map((level) => (
               <div key={level} className="flex-1 flex gap-2 items-center min-h-0 bg-slate-800/20 rounded-xl p-1.5 border border-white/5 overflow-hidden">
                 <div className="shrink-0 h-full flex items-center justify-center">
                   <CardBack level={level as 1|2|3} size="lg" />
                 </div>
                 <div className="flex-1 flex gap-2 items-center h-full overflow-hidden min-w-0">
                   {board.cards[level as 1|2|3].map(card => (
                     <div key={card.id} className="flex-1 min-w-0 h-full flex items-center">
                         <Card card={card} size="lg" />
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Column 3: Players List Only */}
        <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
          {/* Players List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 p-1 min-h-0">
               {players.map((p, idx) => {
                   // Count card bonuses
                   const bonuses: Record<GemColor, number> = { emerald: 0, sapphire: 0, ruby: 0, diamond: 0, onyx: 0 };
                   p.cards.forEach(card => { bonuses[card.gem]++; });

                   // Calculate nobles visited
                   const cardPoints = p.cards.reduce((sum, c) => sum + c.points, 0);
                   const noblesVisited = Math.max(0, (p.score - cardPoints) / 3);

                   return (
                       <div key={p.id} className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 border-2 ${
                           idx === currentPlayerIndex
                           ? 'bg-gradient-to-br from-amber-900/90 to-slate-900/90 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                           : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800/80'
                       }`}>
                           {/* Player Name, Score, Res, Nobles in one row */}
                           <div className="flex items-center gap-3 mb-2">
                               <div className={clsx("font-serif text-lg truncate flex-1 tracking-wide", idx === currentPlayerIndex ? "text-amber-100 font-bold" : "text-slate-300")}>{p.name}</div>
                               <div className="font-serif font-black text-2xl text-amber-400 drop-shadow-md">{p.score}</div>
                               <div className="bg-black/40 px-2 py-1 rounded-lg border border-white/5 flex items-center gap-1.5">
                                   <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">{t('Res')}</span>
                                   <span className="text-white font-bold text-base">{p.reserved.length}</span>
                               </div>
                               <div className="bg-black/40 px-2 py-1 rounded-lg border border-white/5 flex items-center gap-1.5">
                                   <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">{t('Nobles')}</span>
                                   <span className="text-white font-bold text-base">{noblesVisited}</span>
                               </div>
                           </div>

                           {/* Tokens & Bonuses - Always 2 rows */}
                           <div className="flex flex-col gap-1.5">
                               {/* Tokens */}
                               <div className="flex flex-wrap gap-2 min-h-[56px] items-center">
                                   {(['ruby', 'emerald', 'sapphire', 'diamond', 'onyx', 'gold'] as TokenColor[]).map((color) => {
                                       const count = p.tokens[color] || 0;
                                       return count > 0 ? (
                                           <div key={color} className="relative flex-shrink-0">
                                               <div className={clsx("w-14 h-14 rounded-full border-2 overflow-hidden shadow-sm", color === 'gold' ? 'border-yellow-600' : 'border-gray-400')}>
                                                   <img src={GEM_IMAGES[color as TokenColor]} alt={color} className="w-full h-full object-cover scale-150" />
                                               </div>
                                               <span className="absolute -top-2 -right-2 text-xl font-black text-white bg-slate-900 rounded-full w-8 h-8 flex items-center justify-center border-2 border-slate-600 shadow-lg z-20">{count}</span>
                                           </div>
                                       ) : null;
                                   })}
                               </div>

                               <div className="h-px bg-slate-600/30 w-full"></div>

                               {/* Bonuses */}
                               <div className="flex flex-wrap gap-2 min-h-[56px]">
                                   {(['ruby', 'emerald', 'sapphire', 'diamond', 'onyx'] as GemColor[]).map((color) => {
                                       const count = bonuses[color] || 0;
                                       return count > 0 ? (
                                           <div key={color} className="relative flex-shrink-0">
                                               <div className={clsx("w-14 h-14 rounded-sm border-2 overflow-hidden shadow-sm", GEM_BORDER_COLORS[color])}>
                                                   <img src={GEM_IMAGES[color]} alt={color} className="w-full h-full object-cover scale-150" />
                                               </div>
                                               <span className="absolute -top-2 -right-2 text-xl font-black text-white bg-slate-900 rounded-full w-8 h-8 flex items-center justify-center border-2 border-slate-600 shadow-lg z-20">{count}</span>
                                           </div>
                                       ) : null;
                                   })}
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
         maxWidth="max-w-md"
         footer={
             <div className="flex justify-end gap-4 w-full">
                 <button
                     onClick={closeConfirm}
                     className="px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors text-lg"
                 >
                     {t('Cancel')}
                 </button>
                 <button
                     onClick={() => {
                         if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                         closeConfirm();
                     }}
                     className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors text-lg"
                 >
                     {t('Confirm')}
                 </button>
             </div>
         }
      >
         <p className="text-gray-300 text-2xl">{confirmDialog.message}</p>
      </Modal>
    </div>
  );
}
