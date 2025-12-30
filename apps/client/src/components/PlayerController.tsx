import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { Card } from './ui/Card';
import { Token } from './ui/Token';
import { TokenColor, GemColor, Card as CardType, GEM_COLORS } from '@local-splendor/shared';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Gem, Coins, Hand, ShoppingCart, ArrowLeft, Check, LogOut, Wallet } from 'lucide-react';

type ActionView = 'DASHBOARD' | 'TAKE_GEMS' | 'BUY_CARD' | 'RESERVE' | 'BUY_RESERVED';

export function PlayerController() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const { gameState, playerId, sendAction, error } = useGame(roomId);

  const [currentView, setCurrentView] = useState<ActionView>('DASHBOARD');
  const [selectedTokens, setSelectedTokens] = useState<GemColor[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

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

  if (!player) return <div className="text-white p-4">Player not found</div>;

  // --- Handlers ---

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

  const submitBuy = (card: CardType) => {
      sendAction({ type: 'BUY_CARD', payload: { cardId: card.id } });
      setCurrentView('DASHBOARD');
  };

  const submitReserve = (card: CardType) => {
      sendAction({ type: 'RESERVE_CARD', payload: { cardId: card.id } });
      setCurrentView('DASHBOARD');
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

      return (
      <div className="flex flex-col h-full">
          {/* Header: Player name and score */}
          <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-xl font-bold">{player.name}</span>
              <span className="text-xl font-bold text-yellow-500">{t('Score')}: {player.score}</span>
          </div>

          {/* Owned Gems Section - columns by color */}
          <div className="flex-1 px-2">
              <h3 className="text-base text-gray-400 font-semibold mb-4 uppercase tracking-wide">{t('Owned Gems')}</h3>
              <div className="flex gap-4 justify-start flex-wrap">
                  {/* Each color column: squares (bonuses) on top, circles (tokens) below */}
                  {allGemColors.map(color => {
                      const bonus = bonusCounts[color] || 0;
                      const token = tokenCounts[color] || 0;
                      if (bonus === 0 && token === 0) return null;

                      return (
                          <div key={color} className="flex flex-col gap-2 items-center">
                              {/* Bonuses - squares */}
                              {Array.from({ length: bonus }).map((_, i) => (
                                  <div
                                      key={`b-${i}`}
                                      className={clsx(
                                          "w-14 h-14 rounded-md border-3",
                                          getGemBg(color),
                                          getGemBorder(color)
                                      )}
                                  />
                              ))}
                              {/* Tokens - circles */}
                              {Array.from({ length: token }).map((_, i) => (
                                  <div
                                      key={`t-${i}`}
                                      className={clsx(
                                          "w-14 h-14 rounded-full border-3",
                                          getGemBg(color),
                                          getGemBorder(color)
                                      )}
                                  />
                              ))}
                          </div>
                      );
                  })}
                  {/* Gold tokens column */}
                  {(tokenCounts['gold'] || 0) > 0 && (
                      <div className="flex flex-col gap-2 items-center">
                          {Array.from({ length: tokenCounts['gold'] }).map((_, i) => (
                              <div
                                  key={`gold-${i}`}
                                  className="w-14 h-14 rounded-full border-3 bg-yellow-400 border-yellow-600"
                              />
                          ))}
                      </div>
                  )}
              </div>
              {!hasAnyGems && <span className="text-gray-500 text-lg">{t('No Gems')}</span>}
          </div>
      </div>
      );
  };

  const Dashboard = () => (
      <div className="space-y-6">
          {/* Status Header */}
          <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold text-yellow-500">{player.score} {t('VP')}</h2>
                  <div className="text-sm text-gray-400">
                    Turn: {gameState.turn}
                  </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                  {/* Owned Tokens */}
                  {Object.entries(player.tokens).map(([color, count]) => (
                      (count as number) > 0 && <Token key={color} color={color as TokenColor} count={count as number} size="sm" />
                  ))}
                  {Object.keys(player.tokens).length === 0 && <span className="text-gray-500 text-xs">{t('No Tokens')}</span>}
              </div>
              <div className="flex gap-1 mt-2">
                  {/* Bonuses */}
                  {player.cards.map((c, i) => (
                      <div key={i} className={`w-4 h-6 rounded-sm ${getGemBg(c.gem)}`} />
                  ))}
              </div>
          </div>

          {/* Action Menu */}
          <div className="grid grid-cols-2 gap-4">
              <button
                  disabled={!isMyTurn}
                  onClick={() => setCurrentView('TAKE_GEMS')}
                  className="bg-blue-600 p-4 rounded-xl flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
              >
                  <Gem size={32} />
                  <span className="font-bold">{t('Take Tokens')}</span>
              </button>

              <button
                  disabled={!isMyTurn}
                  onClick={() => setCurrentView('BUY_CARD')}
                  className="bg-green-600 p-4 rounded-xl flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
              >
                  <ShoppingCart size={32} />
                  <span className="font-bold">{t('Buy Card')}</span>
              </button>

              <button
                  disabled={!isMyTurn}
                  onClick={() => setCurrentView('RESERVE')}
                  className="bg-yellow-600 p-4 rounded-xl flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-700 transition"
              >
                  <Wallet size={32} />
                  <span className="font-bold">{t('Reserve')}</span>
              </button>

              <button
                  disabled={!isMyTurn}
                  onClick={() => setCurrentView('BUY_RESERVED')}
                  className="bg-purple-600 p-4 rounded-xl flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition relative"
              >
                  <Hand size={32} />
                  <span className="font-bold">{t('Buy Reserved')}</span>
                  {player.reserved.length > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {player.reserved.length}
                      </span>
                  )}
              </button>
          </div>
      </div>
  );

  const TakeGemsView = () => (
      <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-xl">
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
                disabled={selectedTokens.length === 0}
                className="w-full bg-blue-600 py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
                <Check size={20} />
                {t('Confirm')}
            </button>
          </div>
      </div>
  );

  const BuyCardView = () => (
      <div className="space-y-8">
          {[1, 2, 3].map(level => (
            <div key={level}>
                <h3 className="mb-2 font-bold text-gray-400">{t('Level')} {level}</h3>
                <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                    {gameState.board.cards[level as 1|2|3].map(card => (
                        <div key={card.id} className="flex-shrink-0 snap-center">
                            <Card card={card} onClick={() => {
                                if(window.confirm(t('Buy this card?'))) submitBuy(card);
                            }} />
                        </div>
                    ))}
                </div>
            </div>
          ))}
      </div>
  );

  const ReserveView = () => (
      <div className="space-y-8">
          <p className="text-gray-400 text-sm">{t('Select a card to reserve')}</p>
          {[1, 2, 3].map(level => (
            <div key={level}>
                <h3 className="mb-2 font-bold text-gray-400">{t('Level')} {level}</h3>
                <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                    {gameState.board.cards[level as 1|2|3].map(card => (
                        <div key={card.id} className="flex-shrink-0 snap-center">
                             <Card card={card} onClick={() => {
                                if(window.confirm(t('Reserve this card?'))) submitReserve(card);
                            }} />
                        </div>
                    ))}
                </div>
            </div>
          ))}
      </div>
  );

  const BuyReservedView = () => (
      <div className="space-y-4">
          <div className="flex flex-wrap gap-4 justify-center">
             {player.reserved.map(card => (
                 <Card key={card.id} card={card} onClick={() => {
                     if(window.confirm(t('Buy this reserved card?'))) submitBuy(card);
                 }} />
             ))}
             {player.reserved.length === 0 && <div className="text-gray-500 py-8">{t('No reserved cards')}</div>}
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* App Header - only show back button when not on dashboard */}
      {currentView !== 'DASHBOARD' && (
          <div className="bg-gray-800 p-4 shadow-md flex items-center">
              <button onClick={() => {
                  setCurrentView('DASHBOARD');
                  setSelectedTokens([]);
              }} className="mr-4 text-gray-300">
                  <ArrowLeft size={24} />
              </button>
             <div className="flex-1 text-center font-bold">
                {currentView === 'TAKE_GEMS' && t('Take Tokens')}
                {currentView === 'BUY_CARD' && t('Buy Card')}
                {currentView === 'RESERVE' && t('Reserve')}
                {currentView === 'BUY_RESERVED' && t('Buy Reserved')}
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col pb-20">
      {/* App Header */}
      <div className="bg-gray-800 p-4 sticky top-0 z-40 shadow-md flex items-center">
         {currentView !== 'DASHBOARD' && (
             <button onClick={() => {
                 setCurrentView('DASHBOARD');
                 setSelectedTokens([]);
             }} className="mr-4 text-gray-300">
                 <ArrowLeft size={24} />
             </button>
         )}
         <div className="flex-1 text-center font-bold">
            {isMyTurn ? <span className="text-green-400">{t('YOUR TURN')}</span> : <span className="text-gray-400">{t('Waiting for', { name: gameState.players[gameState.currentPlayerIndex].name })}</span>}
         </div>
      </div>

      {error && (
          <div className="bg-red-500 p-2 text-center text-white sticky top-16 z-50 animate-bounce">
              {error}
          </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
         {currentView === 'DASHBOARD' && <Dashboard />}
         {currentView === 'TAKE_GEMS' && <TakeGemsView />}
         {currentView === 'BUY_CARD' && <BuyCardView />}
         {currentView === 'RESERVE' && <ReserveView />}
         {currentView === 'BUY_RESERVED' && <BuyReservedView />}
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
                      disabled={!isMyTurn}
                      onClick={() => setCurrentView('TAKE_GEMS')}
                      className="flex-1 bg-gray-700 p-3 rounded-xl flex flex-col items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition border-2 border-gray-600"
                  >
                      <Gem size={28} />
                      <span className="text-[10px] font-bold">{t('Take')}</span>
                  </button>

                  <button
                      disabled={!isMyTurn}
                      onClick={() => setCurrentView('BUY_CARD')}
                      className="flex-1 bg-gray-700 p-3 rounded-xl flex flex-col items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition border-2 border-gray-600"
                  >
                      <ShoppingCart size={28} />
                      <span className="text-[10px] font-bold">{t('Buy')}</span>
                  </button>

                  <button
                      disabled={!isMyTurn}
                      onClick={() => setCurrentView('RESERVE')}
                      className="flex-1 bg-gray-700 p-3 rounded-xl flex flex-col items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition border-2 border-gray-600"
                  >
                      <Wallet size={28} />
                      <span className="text-[10px] font-bold">{t('Reserve')}</span>
                  </button>

                  <button
                      disabled={!isMyTurn}
                      onClick={() => setCurrentView('BUY_RESERVED')}
                      className="flex-1 bg-gray-700 p-3 rounded-xl flex flex-col items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition border-2 border-gray-600 relative"
                  >
                      <Hand size={28} />
                      <span className="text-[10px] font-bold">{t('Reserved')}</span>
                      {player.reserved.length > 0 && (
                          <span className="absolute top-1 right-1 bg-red-500 text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                              {player.reserved.length}
                          </span>
                      )}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}

function getGemBg(color: GemColor | string) {
     switch(color) {
        case 'emerald': return 'bg-green-500';
        case 'sapphire': return 'bg-blue-500';
        case 'ruby': return 'bg-red-500';
        case 'diamond': return 'bg-gray-100';
        case 'onyx': return 'bg-gray-800';
        case 'gold': return 'bg-yellow-400';
        default: return 'bg-gray-500';
    }
}

function getGemBorder(color: GemColor | string) {
     switch(color) {
        case 'emerald': return 'border-green-700';
        case 'sapphire': return 'border-blue-700';
        case 'ruby': return 'border-red-700';
        case 'diamond': return 'border-gray-400';
        case 'onyx': return 'border-gray-600';
        case 'gold': return 'border-yellow-600';
        default: return 'border-gray-500';
    }
}
