import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { Card } from './ui/Card';
import { Token, GEM_IMAGES } from './ui/Token';
import { TokenColor, GemColor, Card as CardType, GEM_COLORS } from '@local-splendor/shared';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Gem, Coins, Hand, ShoppingCart, ArrowLeft, Check, LogOut, Wallet } from 'lucide-react';

const GEM_BORDER_COLORS: Record<GemColor | 'gold', string> = {
  emerald: 'border-green-700',
  sapphire: 'border-blue-700',
  ruby: 'border-red-700',
  diamond: 'border-gray-400',
  onyx: 'border-gray-600',
  gold: 'border-yellow-600',
};

type ActionView = 'DASHBOARD' | 'TAKE_GEMS' | 'BUY_CARD' | 'RESERVE';

export function PlayerController() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('roomId');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const handleGameReset = () => {
    alert(t('Game has been reset by host'));
    navigate('/');
  };

  const { gameState, playerId, sendAction, error, wasReset } = useGame(roomId, { onGameReset: handleGameReset });

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

  if (!player) return <div className="text-white p-4">{t('Player not found')}</div>;

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

      return (
      <div className="flex flex-col h-full">
          {/* Header: Player name and score */}
          <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-xl font-bold">{player.name}</span>
              <div className="flex items-center gap-4">
                  <div className="flex bg-gray-800 rounded border border-gray-700 p-0.5">
                      <button onClick={() => changeLanguage('en')} className={`px-2 py-1 text-xs rounded transition-all ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>EN</button>
                      <button onClick={() => changeLanguage('ja')} className={`px-2 py-1 text-xs rounded transition-all ${i18n.language === 'ja' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>JA</button>
                  </div>
                  <span className="text-xl font-bold text-yellow-500">{t('Score')}: {player.score}</span>
              </div>
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
                                          "w-14 h-14 rounded-full border-3 overflow-hidden",
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
                                  className="w-14 h-14 rounded-full border-3 overflow-hidden border-yellow-600"
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
      <div className="space-y-4">
          <ResourcesHeader />

          {/* Reserved Cards Section */}
          {player.reserved.length > 0 && (
              <div className="border-b border-gray-700 pb-6 mb-2">
                  <h3 className="mb-3 font-bold text-yellow-500 pl-2 border-l-4 border-yellow-500">{t('Reserved Cards')}</h3>
                  <div className="flex overflow-x-auto gap-4 pb-2 snap-x px-2">
                     {player.reserved.map(card => (
                         <div key={card.id} className="flex-shrink-0 snap-center">
                             <Card card={card} onClick={() => {
                                 if(window.confirm(t('Buy this reserved card?'))) submitBuy(card);
                             }} />
                         </div>
                     ))}
                  </div>
              </div>
          )}

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
                                if(window.confirm(t('Reserve this card?'))) submitReserve(card);
                            }} />
                        </div>
                    ))}
                </div>
            </div>
          ))}
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
              </div>
          </div>
      )}
    </div>
  );
}
