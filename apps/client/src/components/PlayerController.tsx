import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { Token, GEM_IMAGES } from './ui/Token';
import { TokenColor, GemColor, Card as CardType, GEM_COLORS } from '@local-splendor/shared';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Gem, Coins, Hand, ShoppingCart, ArrowLeft, Check, LogOut, Wallet, Minus, Plus, X } from 'lucide-react';

const GEM_BORDER_COLORS: Record<GemColor | 'gold', string> = {
  emerald: 'border-green-700',
  sapphire: 'border-blue-700',
  ruby: 'border-red-700',
  diamond: 'border-gray-400',
  onyx: 'border-gray-600',
  gold: 'border-yellow-600',
};

type ActionView = 'DASHBOARD' | 'TAKE_GEMS' | 'BUY_CARD' | 'RESERVE' | 'DISCARD_TOKENS';

const PaymentModal = ({ card, player, onClose, onSubmit, t, isMyTurn }: {
    card: CardType,
    player: any,
    onClose: () => void,
    onSubmit: (card: CardType, payment: Record<string, number>) => void,
    t: any,
    isMyTurn: boolean
}) => {
    const [tokenPayment, setTokenPayment] = useState<Record<string, number>>({});

    // Calculate derived state
    const discount: Record<string, number> = { emerald: 0, sapphire: 0, ruby: 0, diamond: 0, onyx: 0 };
    player.cards.forEach((c: any) => { discount[c.gem]++; });

    // Initialize defaults on mount
    useEffect(() => {
        const initialPayment: Record<string, number> = {};
        for (const color of Object.keys(card.cost)) {
           if(color === 'gold') continue;
           const cost = card.cost[color] || 0;
           const bonus = discount[color] || 0;
           const req = Math.max(0, cost - bonus);

           // Default: use tokens as much as possible
           const available = player.tokens[color as TokenColor] || 0;
           const pay = Math.min(req, available);
           initialPayment[color] = pay;
        }
        setTokenPayment(initialPayment);
    }, [card]);

    // Recalculate based on current tokenPayment
    let goldUsed = 0;
    const rows = Object.keys(card.cost).map(color => {
        const cost = card.cost[color] || 0;
        const bonus = discount[color] || 0;
        const req = Math.max(0, cost - bonus);
        const pay = tokenPayment[color] ?? 0;
        const deficit = Math.max(0, req - pay);
        goldUsed += deficit;

        return { color, cost, bonus, req, pay };
    });

    const canAfford = (player.tokens.gold || 0) >= goldUsed;

    const handleAdjust = (color: string, delta: number) => {
        const current = tokenPayment[color] || 0;
        const row = rows.find(r => r.color === color);
        if(!row) return;

        const newValue = current + delta;

        // Limits
        if (newValue < 0) return; // Cannot pay negative
        if (newValue > row.req) return; // Cannot pay more than req
        if (newValue > (player.tokens[color as TokenColor] || 0)) return; // Cannot pay more than owned

        // Check Gold constraint for decreasing payment
        // If we decrease payment, goldUsed increases.
        if (delta < 0) {
            if (goldUsed + 1 > (player.tokens.gold || 0)) return; // Not enough gold to cover
        }

        setTokenPayment({ ...tokenPayment, [color]: newValue });
    };

    return (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
           <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-600">
               <h2 className="text-xl font-bold mb-4 flex justify-between items-center text-white">
                  {t('Select Payment')}
                  <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded"><X size={20} /></button>
               </h2>

               <div className="space-y-4 mb-6">
                   {rows.map(row => (
                       <div key={row.color} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                           <div className="flex items-center gap-3">
                               <div className={clsx("w-10 h-10 rounded-full border-2 overflow-hidden shadow-sm", GEM_BORDER_COLORS[row.color as GemColor])}>
                                    <img src={GEM_IMAGES[row.color as GemColor]} className="w-full h-full object-cover scale-150" />
                               </div>
                               <div className="flex flex-col">
                                   <span className="text-xs text-gray-400 uppercase tracking-wider">{row.color}</span>
                                   <div className="flex gap-2 text-xs">
                                       <span className="text-red-400">Cost: {row.cost}</span>
                                       <span className="text-green-400">Bonus: {row.bonus}</span>
                                   </div>
                               </div>
                           </div>

                           <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-1">
                               <button
                                   onClick={() => handleAdjust(row.color, -1)}
                                   disabled={row.pay <= 0 || (goldUsed + 1 > (player.tokens.gold || 0))}
                                   className="p-1.5 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 transition-colors text-white"
                               >
                                   <Minus size={16} />
                               </button>
                               <span className="w-8 text-center font-bold text-lg text-white">{row.pay}</span>
                               <button
                                   onClick={() => handleAdjust(row.color, 1)}
                                   disabled={row.pay >= row.req || row.pay >= (player.tokens[row.color as TokenColor] || 0)}
                                   className="p-1.5 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 transition-colors text-white"
                               >
                                   <Plus size={16} />
                               </button>
                           </div>
                       </div>
                   ))}

                   {/* Gold Row (Calculated) */}
                   <div className="flex items-center justify-between bg-yellow-900/20 p-3 rounded-lg border border-yellow-700/50">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full border-2 border-yellow-600 overflow-hidden shadow-sm">
                                 <img src={GEM_IMAGES['gold']} className="w-full h-full object-cover scale-150" />
                             </div>
                             <span className="font-bold text-yellow-500">Gold Needed</span>
                        </div>
                        <span className={clsx("font-bold text-xl", goldUsed > (player.tokens.gold || 0) ? "text-red-500" : "text-yellow-500")}>
                            {goldUsed} <span className="text-sm text-gray-400">/ {player.tokens.gold || 0}</span>
                        </span>
                   </div>
               </div>

               <div className="flex gap-3">
                   <button onClick={onClose} className="flex-1 py-3 rounded-lg font-bold bg-gray-700 hover:bg-gray-600 text-white transition-colors">{t('Cancel')}</button>
                   <button
                      onClick={() => {
                          const finalPayment = { ...tokenPayment, gold: goldUsed };
                          onSubmit(card, finalPayment);
                      }}
                      disabled={!canAfford || !isMyTurn}
                      className="flex-1 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex justify-center items-center gap-2"
                   >
                       <Check size={18} />
                       {isMyTurn ? t('Confirm') : t('Not your turn')}
                   </button>
               </div>
           </div>
       </div>
    );
};

export function PlayerController() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('roomId');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const [dialog, setDialog] = useState<{
      isOpen: boolean;
      type: 'alert' | 'confirm';
      title?: string;
      message: string;
      onConfirm?: () => void;
  }>({ isOpen: false, type: 'alert', message: '' });

  const showAlert = (message: string, title?: string) => {
      setDialog({ isOpen: true, type: 'alert', message, title: title || t('Alert') });
  };

  const showConfirm = (message: string, onConfirm: () => void, title?: string) => {
      setDialog({ isOpen: true, type: 'confirm', message, onConfirm, title: title || t('Confirm') });
  };

  const closeDialog = () => setDialog({ ...dialog, isOpen: false });

  const handleGameReset = () => {
    showAlert(t('Game has been reset by host'));
    navigate('/');
  };

  const { gameState, playerId, sendAction, error, wasReset } = useGame(roomId, { onGameReset: handleGameReset });

  const [currentView, setCurrentView] = useState<ActionView>('DASHBOARD');
  const [selectedTokens, setSelectedTokens] = useState<GemColor[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentCard, setPaymentCard] = useState<CardType | null>(null);

  useEffect(() => {
    if (gameState?.phase === 'DISCARDING' && gameState.players[gameState.currentPlayerIndex].id === playerId) {
        if (currentView !== 'DISCARD_TOKENS') {
            setCurrentView('DISCARD_TOKENS');
        }
    }
  }, [gameState, playerId, currentView]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (!gameState || !playerId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-4 p-4">
        <h2 className="text-2xl font-bold">{t('Connecting to Room...')}</h2>
        <div className="text-gray-400">{t('Room ID')}: {roomId}</div>
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>

        {playerId && !gameState && (
             <div className="text-center mt-4">
                 <p className="text-green-400 mb-2">{t('Connected!')}</p>
                 <p>{t('Waiting for host to start the game...')}</p>
             </div>
        )}
      </div>
    );
  }

  const player = gameState.players.find(p => p.id === playerId);
  const isMyTurn = gameState.players[gameState.currentPlayerIndex].id === playerId;

  if (!player) return <div className="text-white p-4">{t('Player not found')}</div>;

  // --- Handlers ---

  const canAffordCard = (card: CardType) => {
      const discount: Record<string, number> = { emerald: 0, sapphire: 0, ruby: 0, diamond: 0, onyx: 0 };
      player.cards.forEach(c => { discount[c.gem]++; });

      let goldNeeded = 0;
      for (const color of Object.keys(card.cost)) {
          const cost = card.cost[color] || 0;
          const bonus = discount[color] || 0;
          const req = Math.max(0, cost - bonus);
          const available = player.tokens[color as TokenColor] || 0;
          if (available < req) {
              goldNeeded += (req - available);
          }
      }
      return (player.tokens.gold || 0) >= goldNeeded;
  };

  const handleTokenClick = (color: TokenColor) => {
    if (color === 'gold') return;
    const gem = color as GemColor;

    if (selectedTokens.includes(gem)) {
       if (selectedTokens.length === 1 && selectedTokens[0] === gem) {
           setSelectedTokens([gem, gem]); // 2 same
       } else {
           setSelectedTokens(selectedTokens.filter(t => t !== gem));
       }
    } else {
        if (selectedTokens.length >= 3) return;
        if (selectedTokens.length === 2 && selectedTokens[0] === selectedTokens[1]) return;
        setSelectedTokens([...selectedTokens, gem]);
    }
  };

  const submitTokens = () => {
      sendAction({ type: 'TAKE_GEMS', payload: { gems: selectedTokens } });
      setSelectedTokens([]);
      setCurrentView('DASHBOARD');
  };

  const submitBuy = (card: CardType, payment?: Record<string, number>) => {
      sendAction({ type: 'BUY_CARD', payload: { cardId: card.id, payment } });
      setCurrentView('DASHBOARD');
      setPaymentModalOpen(false);
      setPaymentCard(null);
  };

  const submitReserve = (card: CardType) => {
      const goldAvailable = gameState.board.tokens.gold || 0;
      let message = t('Reserve this card?');
      if (goldAvailable === 0) {
          message = t('No gold available. Reserve anyway?');
      }
      showConfirm(message, () => {
          sendAction({ type: 'RESERVE_CARD', payload: { cardId: card.id } });
          setCurrentView('DASHBOARD');
      });
  };

  // --- Components ---

  const ResourcesHeader = () => {
      const tokenCounts: Record<string, number> = {};
      Object.entries(player.tokens).forEach(([color, count]) => {
          tokenCounts[color] = count as number;
      });

      const bonusCounts: Record<GemColor, number> = { emerald: 0, sapphire: 0, ruby: 0, diamond: 0, onyx: 0 };
      player.cards.forEach(card => { bonusCounts[card.gem]++; });

      const allGemColors: GemColor[] = ['emerald', 'sapphire', 'ruby', 'diamond', 'onyx'];

      return (
        <div className="bg-gray-800 p-3 rounded-xl mb-4 overflow-x-auto border border-gray-700">
           <div className="flex gap-4 min-w-min mx-auto justify-center">
              {allGemColors.map(color => {
                 const bonus = bonusCounts[color] || 0;
                 const token = tokenCounts[color] || 0;

                 return (
                    <div key={color} className="flex flex-col items-center gap-2">
                        {/* Bonus (Square) */}
                        <div className="relative">
                            <div className={clsx("w-10 h-10 rounded-sm border-2 overflow-hidden", GEM_BORDER_COLORS[color], bonus === 0 && "opacity-30 grayscale")}>
                                <img src={GEM_IMAGES[color]} alt={color} className="w-full h-full object-cover scale-150" />
                            </div>
                            <span className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-gray-500 shadow-md">
                                {bonus}
                            </span>
                        </div>

                        {/* Token (Circle) */}
                         <div className="relative">
                            <div className={clsx("w-10 h-10 rounded-full border-2 overflow-hidden", GEM_BORDER_COLORS[color], token === 0 && "opacity-30 grayscale")}>
                                <img src={GEM_IMAGES[color]} alt={color} className="w-full h-full object-cover scale-150" />
                            </div>
                            <span className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-gray-500 shadow-md">
                                {token}
                            </span>
                        </div>
                    </div>
                 );
              })}

              {/* Gold Token */}
               <div className="flex flex-col items-center gap-2 justify-end">
                   <div className="w-10 h-10 opacity-0"></div> {/* Spacer for alignment with bonus row */}
                   <div className="relative">
                        <div className={clsx("w-10 h-10 rounded-full border-2 border-yellow-600 overflow-hidden", (!tokenCounts['gold']) && "opacity-30 grayscale")}>
                            <img src={GEM_IMAGES['gold']} alt="gold" className="w-full h-full object-cover scale-150" />
                        </div>
                         <span className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-gray-500 shadow-md">
                            {tokenCounts['gold'] || 0}
                         </span>
                   </div>
               </div>
           </div>
        </div>
      );
  };

  // --- Sub Views ---

  const Dashboard = () => {
      // Count tokens and bonuses by color
      const tokenCounts: Record<string, number> = {};
      Object.entries(player.tokens).forEach(([color, count]) => {
          if ((count as number) > 0) tokenCounts[color] = count as number;
      });

      const bonusCounts: Record<GemColor, number> = { emerald: 0, sapphire: 0, ruby: 0, diamond: 0, onyx: 0 };
      player.cards.forEach(card => { bonusCounts[card.gem]++; });

      const allGemColors: GemColor[] = ['ruby', 'sapphire', 'emerald', 'diamond', 'onyx'];
      const hasAnyGems = allGemColors.some(c => (bonusCounts[c] > 0) || (tokenCounts[c] > 0)) || (tokenCounts['gold'] > 0);
      const totalTokens = Object.values(player.tokens).reduce((a, b) => a + (b || 0), 0);

      return (
      <div className="flex flex-col h-full">
          {/* Last Action */}
          {gameState.lastAction && (
              <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-700 shadow-xl relative mx-2 mb-4 mt-2 min-h-[100px] flex flex-col justify-center">
                  <span className="absolute -top-2 -left-2 text-[10px] text-slate-400 bg-slate-900 px-1 rounded border border-slate-700 uppercase tracking-widest font-sans">Last</span>

                  {/* Layout changes based on action type */}
                  {(gameState.lastAction.type === 'BUY_CARD' || gameState.lastAction.type === 'RESERVE_CARD') ? (
                    /* Card: Horizontal Layout */
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-400">{gameState.lastAction.playerName}</span>
                            <span className="text-gray-300 text-xs">
                                {gameState.lastAction.type === 'BUY_CARD' ? t('bought a card') : t('reserved a card')}
                            </span>
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
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400">{gameState.lastAction.playerName}</span>
                          <span className="text-gray-300 text-xs">
                              {gameState.lastAction.type === 'TAKE_GEMS' && t('took tokens')}
                              {gameState.lastAction.type === 'DISCARD_TOKENS' && t('discarded tokens')}
                          </span>
                      </div>
                      <div className="flex items-center justify-center bg-black/20 rounded p-2 min-h-[64px]">
                          <div className="flex gap-3">
                              {Object.entries(gameState.lastAction.tokens || {}).map(([color, count]) => (
                                  count && count > 0 && <Token key={color} color={color as TokenColor} count={count} size="lg" />
                              ))}
                          </div>
                      </div>
                    </div>
                  )}
              </div>
          )}

          {/* Board Tokens */}
          <div className="mx-2 mb-2 px-4 py-3 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl relative">
               <span className="absolute -top-2 -left-2 text-[10px] text-slate-400 bg-slate-900 px-1 rounded border border-slate-700 uppercase tracking-widest font-sans">{t('Resources')}</span>
               <div className="flex gap-3 justify-center">
                   {['emerald', 'sapphire', 'ruby', 'diamond', 'onyx', 'gold'].map(c => (
                       <div key={c} className="flex flex-col items-center">
                           <div className={clsx("w-8 h-8 rounded-full border border-gray-500 overflow-hidden shadow-sm", GEM_BORDER_COLORS[c as GemColor] || 'border-yellow-600')}>
                                <img src={GEM_IMAGES[c as GemColor]} className="w-full h-full object-cover scale-150" />
                           </div>
                           <span className="text-sm font-bold text-gray-300 mt-1">{gameState.board.tokens[c as TokenColor] || 0}</span>
                       </div>
                   ))}
               </div>
          </div>

          {/* Header: Player name and score */}
          <div className="flex justify-between items-center mb-4 px-4 mt-2">
              <span className="text-2xl font-bold font-serif">{player.name}</span>
              <div className="flex items-center gap-4">
                  <div className="flex bg-slate-800 rounded-lg border border-slate-700 p-1">
                      <button onClick={() => changeLanguage('en')} className={`px-2 py-1 text-xs rounded transition-all font-bold ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-700'}`}>EN</button>
                      <button onClick={() => changeLanguage('ja')} className={`px-2 py-1 text-xs rounded transition-all font-bold ${i18n.language === 'ja' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-700'}`}>JA</button>
                  </div>
                  <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">{t('Score')}</span>
                      <span className="text-2xl font-bold text-amber-400 font-mono leading-none">{player.score}</span>
                  </div>
              </div>
          </div>

          {/* Owned Gems Section - columns by color */}
          <div className="flex-1 px-2 mb-20 overflow-y-auto">
              <div className="flex items-baseline justify-between mb-4 border-b border-gray-700 pb-2">
                  <h3 className="text-base text-gray-400 font-semibold uppercase tracking-wide">{t('Owned Gems')}</h3>
                  <div className={clsx("text-sm font-bold px-2 py-0.5 rounded-full border", totalTokens > 10 ? "bg-red-900/50 border-red-500 text-red-200" : "bg-slate-800 border-slate-600 text-slate-300")}>
                      Tokens: {totalTokens} / 10
                  </div>
              </div>
              <div className="flex gap-4 justify-start flex-wrap">
                  {/* Each color column: squares (bonuses) on top, circles (tokens) below */}
                  {allGemColors.map(color => {
                      const bonus = bonusCounts[color] || 0;
                      const token = tokenCounts[color] || 0;
                      if (bonus === 0 && token === 0) return null;

                      return (
                          <div key={color} className="flex flex-col gap-2 items-center">
                              {/* Bonuses - squares with border */}
                              {Array.from({ length: bonus }).map((_, i) => (
                                  <div
                                      key={`b-${i}`}
                                      className={clsx(
                                          "w-14 h-14 rounded-md border-3 overflow-hidden",
                                          GEM_BORDER_COLORS[color]
                                      )}
                                  >
                                      <img src={GEM_IMAGES[color]} alt={color} className="w-full h-full object-cover scale-150" />
                                  </div>
                              ))}
                              {/* Tokens - circles with border */}
                              {Array.from({ length: token }).map((_, i) => (
                                  <div
                                      key={`t-${i}`}
                                      className={clsx(
                                          "w-16 h-16 rounded-full border-3 overflow-hidden",
                                          GEM_BORDER_COLORS[color]
                                      )}
                                  >
                                      <img src={GEM_IMAGES[color]} alt={color} className="w-full h-full object-cover scale-150" />
                                  </div>
                              ))}
                          </div>
                      );
                  })}
                  {/* Gold tokens column - circles with border */}
                  {(tokenCounts['gold'] || 0) > 0 && (
                      <div className="flex flex-col gap-2 items-center">
                          {Array.from({ length: tokenCounts['gold'] }).map((_, i) => (
                              <div
                                  key={`gold-${i}`}
                                  className="w-16 h-16 rounded-full border-3 overflow-hidden border-yellow-600"
                              >
                                  <img src={GEM_IMAGES['gold']} alt="gold" className="w-full h-full object-cover scale-150" />
                              </div>
                          ))}
                      </div>
                  )}
              </div>
              {!hasAnyGems && <span className="text-gray-500 text-lg">{t('No Gems')}</span>}
          </div>
      </div>
      );
  };

  const TakeGemsView = () => (
      <div className="space-y-4">
          {/* Current Owned Tokens Section */}
          <ResourcesHeader />

          <div className="bg-gray-800 p-4 rounded-xl">
             <h3 className="text-gray-400 text-sm font-bold mb-4 uppercase tracking-wide text-center">{t('Select Tokens to Take')}</h3>
             <div className="flex flex-wrap gap-4 justify-center mb-6">
                {(['emerald', 'sapphire', 'ruby', 'diamond', 'onyx'] as TokenColor[]).map(color => (
                    <div key={color} className={`relative transition-all duration-200 ${selectedTokens.includes(color as GemColor) ? 'scale-110 ring-4 ring-white rounded-full' : ''}`}>
                        <Token
                            color={color}
                            count={gameState.board.tokens[color]}
                            onClick={() => handleTokenClick(color)}
                        />
                        {selectedTokens.filter(c => c === color).length > 0 && (
                            <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
                                {selectedTokens.filter(c => c === color).length}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="text-center text-gray-400 text-sm mb-4">
                {selectedTokens.length === 0 && t('Select 3 different colors or 2 same color')}
                {selectedTokens.length > 0 && selectedTokens.length < 3 && new Set(selectedTokens).size === selectedTokens.length && t('Select up to 3 different colors')}
                {selectedTokens.length === 2 && selectedTokens[0] === selectedTokens[1] && t('2 same color selected')}
            </div>

            <button
                onClick={submitTokens}
                disabled={selectedTokens.length === 0 || !isMyTurn}
                className="w-full bg-blue-600 py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
                <Check size={20} />
                {isMyTurn ? t('Confirm') : t('Not your turn')}
            </button>
          </div>
      </div>
  );

  const BuyCardView = () => (
      <div className="space-y-4">
          <ResourcesHeader />

          {/* Reserved Cards Section */}
          {player.reserved.length > 0 && (
              <div className="border-b border-gray-700 pb-6 mb-2">
                  <h3 className="mb-3 font-bold text-yellow-500 pl-2 border-l-4 border-yellow-500">{t('Reserved Cards')}</h3>
                  <div className="flex overflow-x-auto gap-4 pb-2 snap-x px-2">
                     {player.reserved.map(card => {
                         const affordable = canAffordCard(card);
                         return (
                             <div key={card.id} className="flex-shrink-0 snap-center relative">
                                 <Card card={card} onClick={() => {
                                 if (!isMyTurn) {
                                     showAlert(t('Not your turn'));
                                     return;
                                 }
                                 if (affordable) {
                                     setPaymentCard(card);
                                     setPaymentModalOpen(true);
                                 } else {
                                     showAlert(t('Not enough resources'));
                                 }
                             }} />
                                 {affordable && (
                                     <div className="absolute inset-0 rounded-lg ring-4 ring-green-500 pointer-events-none animate-pulse opacity-50 z-20"></div>
                                 )}
                             </div>
                         );
                     })}
                  </div>
              </div>
          )}

          {[1, 2, 3].map(level => (
            <div key={level}>
                <h3 className="mb-2 font-bold text-gray-400">{t('Level')} {level}</h3>
                <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                    {gameState.board.cards[level as 1|2|3].map(card => {
                        const affordable = canAffordCard(card);
                        return (
                            <div key={card.id} className="flex-shrink-0 snap-center relative">
                                <Card card={card} onClick={() => {
                                    if (!isMyTurn) {
                                        showAlert(t('Not your turn'));
                                        return;
                                    }
                                    if (affordable) {
                                        setPaymentCard(card);
                                        setPaymentModalOpen(true);
                                    }
                                }} />
                                {affordable && (
                                     <div className="absolute inset-0 rounded-lg ring-4 ring-green-500 pointer-events-none animate-pulse opacity-50 z-20"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
          ))}
          {paymentModalOpen && paymentCard && (
            <PaymentModal
              card={paymentCard}
              player={player}
              t={t}
              isMyTurn={isMyTurn}
              onSubmit={submitBuy}
              onClose={() => { setPaymentModalOpen(false); setPaymentCard(null); }}
            />
          )}
      </div>
  );

  const ReserveView = () => (
      <div className="space-y-4">
          <ResourcesHeader />
          <p className="text-gray-400 text-sm text-center">{t('Select a card to reserve')}</p>
          {[1, 2, 3].map(level => (
            <div key={level}>
                <h3 className="mb-2 font-bold text-gray-400">{t('Level')} {level}</h3>
                <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                    {gameState.board.cards[level as 1|2|3].map(card => (
                        <div key={card.id} className="flex-shrink-0 snap-center">
                             <Card card={card} onClick={() => {
                                if (!isMyTurn) { showAlert(t('Not your turn')); return; }
                                submitReserve(card);
                            }} />
                        </div>
                    ))}
                </div>
            </div>
          ))}
      </div>
  );

  const DiscardTokensView = () => {
      const [toDiscard, setToDiscard] = useState<Record<string, number>>({});
      const currentTokens: Record<string, number> = {};
      let total = 0;
      Object.entries(player.tokens).forEach(([k, v]) => {
          if ((v as number) > 0) {
              currentTokens[k] = v as number;
              total += v as number;
          }
      });

      const discardCount = Object.values(toDiscard).reduce((a,b)=>a+b, 0);
      const remaining = total - discardCount;
      const valid = remaining <= 10;

      const handleAdjust = (color: string, delta: number) => {
           const current = toDiscard[color] || 0;
           const owned = currentTokens[color] || 0;
           const newValue = current + delta;

           if (newValue < 0) return;
           if (newValue > owned) return;

           setToDiscard({ ...toDiscard, [color]: newValue });
      };

      const submitDiscard = () => {
          sendAction({ type: 'DISCARD_TOKENS', payload: { tokens: toDiscard } });
          setCurrentView('DASHBOARD');
      };

      return (
          <div className="space-y-4 p-4 bg-red-900/20 rounded-xl border border-red-500/50">
               <h3 className="text-xl font-bold text-red-400 text-center">{t('Too Many Tokens!')}</h3>
               <p className="text-center text-gray-300 mb-4">{t('You have')} {total} {t('tokens')}. {t('Discard until')} 10.</p>

               <div className="flex justify-center text-4xl font-bold mb-4">
                   <span className={clsx(valid ? "text-green-500" : "text-red-500")}>{remaining}</span>
                   <span className="text-gray-500">/ 10</span>
               </div>

               <div className="space-y-2">
                   {Object.entries(currentTokens).map(([color, count]) => (
                       <div key={color} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                           <div className="flex items-center gap-3">
                               <div className={clsx("w-8 h-8 rounded-full border-2 overflow-hidden", GEM_BORDER_COLORS[color as GemColor] || 'border-yellow-600')}>
                                   <img src={GEM_IMAGES[color as GemColor]} className="w-full h-full object-cover scale-150" />
                               </div>
                               <span className="font-bold text-gray-300">x {count}</span>
                           </div>

                           <div className="flex items-center gap-3">
                               <button onClick={() => handleAdjust(color, -1)} className="p-2 bg-gray-700 rounded text-white"><Minus size={16}/></button>
                               <span className="w-6 text-center font-bold">{toDiscard[color] || 0}</span>
                               <button onClick={() => handleAdjust(color, 1)} className="p-2 bg-gray-700 rounded text-white"><Plus size={16}/></button>
                           </div>
                       </div>
                   ))}
               </div>

               <button
                   onClick={submitDiscard}
                   disabled={!valid}
                   className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl mt-4"
               >
                   {t('Discard Selected')}
               </button>
          </div>
      );
  };

  if (gameState.gameEnded) {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    const isWinner = winner?.id === playerId;
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 text-center gap-6">
            <h1 className="text-5xl font-bold mb-4 text-yellow-500 drop-shadow-lg">{t('Game Over')}</h1>
            <div className="text-3xl mb-8 font-serif">
                {isWinner ? <span className="text-green-400 animate-pulse">{t('You Won!')}</span> : <span className="text-blue-300">{winner?.name} {t('Won')}</span>}
            </div>

            <div className="flex flex-col gap-2 bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-gray-400">{t('Final Score')}</h3>
                {gameState.players.sort((a,b) => b.score - a.score).map((p, i) => (
                    <div key={p.id} className="flex justify-between items-center border-b border-gray-700 last:border-0 py-2">
                        <span className={clsx("font-bold text-lg", p.id === playerId ? "text-yellow-400" : "text-gray-300")}>
                            {i+1}. {p.name}
                        </span>
                        <span className="font-mono text-xl">{p.score}</span>
                    </div>
                ))}
            </div>

            <button onClick={() => navigate('/')} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xl shadow-lg transition-transform hover:scale-105">
                {t('Back to Home')}
            </button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* App Header - only show back button when not on dashboard */}
      {currentView !== 'DASHBOARD' && (
          <div className="bg-gray-800 p-4 shadow-md flex items-center">
              <button onClick={() => {
                  if (currentView === 'DISCARD_TOKENS') return; // Cannot go back
                  setCurrentView('DASHBOARD');
                  setSelectedTokens([]);
              }} className={clsx("mr-4 text-gray-300", currentView === 'DISCARD_TOKENS' && "opacity-0 pointer-events-none")}>
                  <ArrowLeft size={24} />
              </button>
             <div className="flex-1 text-center font-bold">
                {currentView === 'TAKE_GEMS' && t('Take Tokens')}
                {currentView === 'BUY_CARD' && t('Buy Card')}
                {currentView === 'RESERVE' && t('Reserve')}
                {currentView === 'DISCARD_TOKENS' && t('Discard Tokens')}
             </div>
          </div>
      )}

      {error && (
          <div className="bg-red-500 p-2 text-center text-white animate-bounce">
              {error}
          </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-40">
         {currentView === 'DASHBOARD' && <Dashboard />}
         {currentView === 'TAKE_GEMS' && <TakeGemsView />}
         {currentView === 'BUY_CARD' && <BuyCardView />}
         {currentView === 'RESERVE' && <ReserveView />}
         {currentView === 'DISCARD_TOKENS' && <DiscardTokensView />}
      </div>

      {/* Turn indicator + Fixed Bottom Action Bar (only on dashboard) */}
      {currentView === 'DASHBOARD' && (
          <div className="fixed bottom-0 left-0 right-0 z-50">
              {/* Turn Indicator */}
              <div className={clsx(
                  "text-center py-3 font-bold text-lg border-t",
                  isMyTurn
                      ? "bg-green-600 text-white border-green-500"
                      : "bg-gray-700 text-gray-300 border-gray-600"
              )}>
                  {isMyTurn
                      ? t('YOUR TURN')
                      : t('Waiting for', { name: gameState.players[gameState.currentPlayerIndex].name })}
              </div>

              {/* Action Buttons - 4 in a row */}
              <div className="bg-gray-800 border-t border-gray-700 p-2 flex gap-2">
                  <button
                      onClick={() => setCurrentView('TAKE_GEMS')}
                      className="flex-1 bg-gray-700 p-3 rounded-xl flex flex-col items-center gap-1 hover:bg-gray-600 transition border-2 border-gray-600"
                  >
                      <Gem size={28} />
                      <span className="text-[10px] font-bold">{t('Take')}</span>
                  </button>

                  <button
                      onClick={() => setCurrentView('BUY_CARD')}
                      className="flex-1 bg-gray-700 p-3 rounded-xl flex flex-col items-center gap-1 hover:bg-gray-600 transition border-2 border-gray-600"
                  >
                      <ShoppingCart size={28} />
                      <span className="text-[10px] font-bold">{t('Buy')}</span>
                  </button>

                  <button
                      onClick={() => setCurrentView('RESERVE')}
                      className="flex-1 bg-gray-700 p-3 rounded-xl flex flex-col items-center gap-1 hover:bg-gray-600 transition border-2 border-gray-600"
                  >
                      <Wallet size={28} />
                      <span className="text-[10px] font-bold">{t('Reserve')}</span>
                  </button>
              </div>
          </div>
      )}

      {/* Global Dialog */}
      <Modal
          isOpen={dialog.isOpen}
          onClose={closeDialog}
          title={dialog.title}
          maxWidth="max-w-sm"
          footer={
              <div className="flex justify-end gap-3 w-full">
                  {dialog.type === 'confirm' && (
                      <button
                          onClick={closeDialog}
                          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
                      >
                          {t('Cancel')}
                      </button>
                  )}
                  <button
                      onClick={() => {
                          if (dialog.onConfirm) dialog.onConfirm();
                          closeDialog();
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
                  >
                      OK
                  </button>
              </div>
          }
      >
          <p className="text-gray-300 text-lg">{dialog.message}</p>
      </Modal>
    </div>
  );
}
