import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { Card } from './ui/Card';
import { Token } from './ui/Token';
import { TokenColor, GemColor, Card as CardType } from '@local-splendor/shared';

export function PlayerController() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const { gameState, playerId, sendAction, error } = useGame(roomId);

  const [selectedTokens, setSelectedTokens] = useState<GemColor[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [view, setView] = useState<'board' | 'hand'>('board');

  if (!gameState || !playerId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-4 p-4">
        <h2 className="text-2xl font-bold">Connecting to Room...</h2>
        <div className="text-gray-400">Room ID: {roomId}</div>
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>

        {/* Waiting screen if connected but game not started */}
        {playerId && !gameState && (
             <div className="text-center mt-4">
                 <p className="text-green-400 mb-2">Connected!</p>
                 <p>Waiting for host to start the game...</p>
             </div>
        )}
      </div>
    );
  }

  const player = gameState.players.find(p => p.id === playerId);
  const isMyTurn = gameState.players[gameState.currentPlayerIndex].id === playerId;

  if (!player) return <div className="text-white p-4">Player not found in game state</div>;

  const handleTokenClick = (color: TokenColor) => {
    if (color === 'gold') return; // Cannot take gold directly
    const gem = color as GemColor;

    // Toggle selection logic
    // Simple logic: If < 3, add. If already selected 2 same, stop.
    // If selecting 2 same, must be empty before.

    if (selectedTokens.includes(gem)) {
       // Deselect or check for 2 same
       if (selectedTokens.length === 1 && selectedTokens[0] === gem) {
           setSelectedTokens([gem, gem]); // 2 same
       } else {
           setSelectedTokens(selectedTokens.filter(t => t !== gem));
       }
    } else {
        if (selectedTokens.length >= 3) return;
        // If currently have 2 same, cannot add different
        if (selectedTokens.length === 2 && selectedTokens[0] === selectedTokens[1]) return;

        setSelectedTokens([...selectedTokens, gem]);
    }
  };

  const submitTokens = () => {
      sendAction({ type: 'TAKE_GEMS', payload: { gems: selectedTokens } });
      setSelectedTokens([]);
  };

  const handleCardClick = (card: CardType) => {
      setSelectedCard(card);
  };

  const handleBuy = () => {
      if (!selectedCard) return;
      sendAction({ type: 'BUY_CARD', payload: { cardId: selectedCard.id } });
      setSelectedCard(null);
  };

  const handleReserve = () => {
      if (!selectedCard) return;
      sendAction({ type: 'RESERVE_CARD', payload: { cardId: selectedCard.id } });
      setSelectedCard(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col pb-20">
      {/* Header: Turn Indicator */}
      <div className={`p-4 text-center font-bold text-xl ${isMyTurn ? 'bg-green-600' : 'bg-gray-800'}`}>
        {isMyTurn ? "YOUR TURN" : `Waiting for ${gameState.players[gameState.currentPlayerIndex].name}`}
      </div>

      {error && (
          <div className="bg-red-500 p-2 text-center text-white sticky top-0 z-50">
              {error}
          </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {view === 'board' ? (
            <>
                {/* Tokens Selection */}
                <div className="bg-gray-800 p-4 rounded-xl">
                    <h3 className="mb-2 font-bold text-gray-400">Take Tokens</h3>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {(['emerald', 'sapphire', 'ruby', 'diamond', 'onyx'] as TokenColor[]).map(color => (
                            <div key={color} className={`relative ${selectedTokens.includes(color as GemColor) ? 'ring-4 ring-white rounded-full' : ''}`}>
                                <Token
                                    color={color}
                                    count={gameState.board.tokens[color]}
                                    onClick={() => handleTokenClick(color)}
                                />
                                {selectedTokens.filter(c => c === color).length > 0 && (
                                    <div className="absolute top-0 right-0 bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                        {selectedTokens.filter(c => c === color).length}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {selectedTokens.length > 0 && isMyTurn && (
                        <button onClick={submitTokens} className="mt-4 w-full bg-blue-600 py-2 rounded font-bold">
                            Confirm Take Gems
                        </button>
                    )}
                </div>

                {/* Cards */}
                {[3, 2, 1].map(level => (
                    <div key={level}>
                        <h3 className="mb-2 font-bold text-gray-400">Level {level}</h3>
                        <div className="flex overflow-x-auto gap-4 pb-2">
                            {gameState.board.cards[level as 1|2|3].map(card => (
                                <div key={card.id} className="flex-shrink-0">
                                    <Card card={card} onClick={() => handleCardClick(card)} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </>
        ) : (
            // My Hand View
            <div className="space-y-6">
                <div className="bg-gray-800 p-4 rounded">
                    <h3 className="mb-2 font-bold">My Tokens</h3>
                    <div className="flex gap-2">
                        {Object.entries(player.tokens).map(([color, count]) => (
                            (count as number) > 0 && <Token key={color} color={color as TokenColor} count={count as number} size="sm" />
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800 p-4 rounded">
                    <h3 className="mb-2 font-bold">Reserved Cards</h3>
                    <div className="flex flex-wrap gap-4">
                        {player.reserved.map(card => (
                            <Card key={card.id} card={card} onClick={() => handleCardClick(card)} />
                        ))}
                        {player.reserved.length === 0 && <span className="text-gray-500">No reserved cards</span>}
                    </div>
                </div>

                 <div className="bg-gray-800 p-4 rounded">
                    <h3 className="mb-2 font-bold">Purchased Cards (Bonuses)</h3>
                     <div className="flex flex-wrap gap-2">
                        {/* Summary of bonuses */}
                        {player.cards.map(card => (
                             <div key={card.id} className={`w-8 h-10 rounded border ${getGemBg(card.gem)}`}></div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Card Action Modal */}
      {selectedCard && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 p-6 rounded-xl w-full max-w-sm flex flex-col gap-4">
                  <h3 className="text-xl font-bold text-center">Select Action</h3>
                  <div className="flex justify-center">
                      <Card card={selectedCard} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                      <button onClick={handleBuy} className="bg-green-600 p-3 rounded font-bold">Buy</button>
                      <button onClick={handleReserve} className="bg-yellow-600 p-3 rounded font-bold">Reserve</button>
                  </div>
                  <button onClick={() => setSelectedCard(null)} className="mt-2 text-gray-400">Cancel</button>
              </div>
          </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-900 border-t border-gray-800 flex justify-around items-center z-40">
        <button
            onClick={() => setView('board')}
            className={`flex-1 h-full font-bold ${view === 'board' ? 'text-blue-400' : 'text-gray-500'}`}
        >
            Board
        </button>
        <button
             onClick={() => setView('hand')}
            className={`flex-1 h-full font-bold ${view === 'hand' ? 'text-blue-400' : 'text-gray-500'}`}
        >
            My Hand ({player.score} VP)
        </button>
      </div>
    </div>
  );
}

function getGemBg(color: GemColor) {
     switch(color) {
        case 'emerald': return 'bg-green-500';
        case 'sapphire': return 'bg-blue-500';
        case 'ruby': return 'bg-red-500';
        case 'diamond': return 'bg-gray-100';
        case 'onyx': return 'bg-gray-800';
    }
}
