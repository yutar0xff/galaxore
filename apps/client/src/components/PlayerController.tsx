import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { Modal } from './ui/Modal';
import { TokenColor, GemColor, Card as CardType } from '@local-splendor/shared';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Gem, ShoppingCart, ArrowLeft, Wallet } from 'lucide-react';
import { Dashboard } from './player/Dashboard';
import { TakeGemsView } from './player/TakeGemsView';
import { BuyCardView } from './player/BuyCardView';
import { ReserveView } from './player/ReserveView';
import { DiscardTokensView } from './player/DiscardTokensView';
import { useBeforeUnload } from '../hooks/useBeforeUnload';
import { useDialog } from '../hooks/useDialog';
import { GameResultModal } from './ui/GameResultModal';
import { ErrorBanner } from './ui/ErrorBanner';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { MAX_TOKENS } from '../constants/game';
import { TokenPayment } from '../types/game';

type ActionView = 'DASHBOARD' | 'TAKE_GEMS' | 'BUY_CARD' | 'RESERVE' | 'DISCARD_TOKENS';

export function PlayerController() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('roomId');

  const { dialog, showAlert, showConfirm, closeDialog } = useDialog();

  const handleGameReset = () => {
    showAlert(t('Game has been reset by host'));
    navigate('/');
  };

  const { gameState, playerId, sendAction, error, setError } = useGame(roomId, { onGameReset: handleGameReset });

  const [currentView, setCurrentView] = useState<ActionView>('DASHBOARD');
  const [selectedTokens, setSelectedTokens] = useState<GemColor[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentCard, setPaymentCard] = useState<CardType | null>(null);

  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
      if (gameState?.gameEnded) {
          setShowResults(true);
      }
  }, [gameState?.gameEnded]);

  useBeforeUnload();

  useEffect(() => {
    if (gameState?.phase === 'DISCARDING' && gameState.players[gameState.currentPlayerIndex].id === playerId) {
        if (currentView !== 'DISCARD_TOKENS') {
            setCurrentView('DISCARD_TOKENS');
        }
    } else if (currentView === 'DISCARD_TOKENS' && gameState?.phase === 'NORMAL') {
        setCurrentView('DASHBOARD');
    }
  }, [gameState?.phase, gameState?.currentPlayerIndex, playerId]);

  if (!gameState || !playerId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-4 p-4">
        <h2 className="text-2xl font-bold">{t('Connecting to Room...')}</h2>
        <div className="text-gray-400">{t('Room ID')}: {roomId}</div>
        <LoadingSpinner />

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

  // Handle token selection logic:
  // - Can select up to 3 different colors, OR 2 of the same color
  // - Clicking a selected token removes it (unless it's the only one, then duplicates it)
  const handleTokenClick = (color: GemColor) => {
    if (selectedTokens.includes(color)) {
       if (selectedTokens.length === 1 && selectedTokens[0] === color) {
           setSelectedTokens([color, color]); // 2 same
       } else {
           setSelectedTokens(selectedTokens.filter(t => t !== color));
       }
    } else {
        if (selectedTokens.length >= 3) return; // Max 3 tokens
        if (selectedTokens.length === 2 && selectedTokens[0] === selectedTokens[1]) return; // Can't add 3rd if already have 2 same
        setSelectedTokens([...selectedTokens, color]);
    }
  };

  const totalTokens = Object.values(player.tokens).reduce((a, b) => a + (b || 0), 0);

  const submitTokens = () => {
      // Check if taking these tokens will exceed MAX_TOKENS
      if (totalTokens + selectedTokens.length > MAX_TOKENS) {
          showConfirm(t('Taking these tokens will exceed the token limit. You will need to discard some. Proceed?'), () => {
              sendAction({ type: 'TAKE_GEMS', payload: { gems: selectedTokens } });
              setSelectedTokens([]);
              setCurrentView('DASHBOARD');
          });
          return;
      }

      sendAction({ type: 'TAKE_GEMS', payload: { gems: selectedTokens } });
      setSelectedTokens([]);
      setCurrentView('DASHBOARD');
  };

  const submitBuy = (card: CardType, payment?: TokenPayment) => {
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

  const handleCardClick = (card: CardType) => {
    setPaymentCard(card);
    setPaymentModalOpen(true);
  };

  const handleDiscard = (tokens: TokenPayment) => {
    sendAction({ type: 'DISCARD_TOKENS', payload: { tokens } });
    setCurrentView('DASHBOARD');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Result Modal */}
      {gameState.gameEnded && (
        <GameResultModal
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          gameState={gameState}
          playerId={playerId}
          onViewBoard={() => setShowResults(false)}
          variant="player"
        />
      )}

      {/* Show Result Button (when ended) */}
      {gameState.gameEnded && !showResults && (
          <button
            onClick={() => setShowResults(true)}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 px-8 py-4 bg-amber-600/90 hover:bg-amber-500 text-white text-xl font-black rounded-2xl shadow-xl border-2 border-amber-400 animate-pulse backdrop-blur-md transition-all active:scale-95"
          >
            {t('Show Results')}
          </button>
      )}

      {/* App Header - only show back button when not on dashboard */}
      {currentView !== 'DASHBOARD' && (
          <div className="bg-gray-800 px-6 py-5 shadow-lg flex items-center border-b border-gray-700">
              <button onClick={() => {
                  if (currentView === 'DISCARD_TOKENS') return; // Cannot go back
                  setCurrentView('DASHBOARD');
                  setSelectedTokens([]);
              }} className={clsx("mr-6 text-gray-300 hover:text-white transition-colors", currentView === 'DISCARD_TOKENS' && "opacity-0 pointer-events-none")}>
                  <ArrowLeft size={32} />
              </button>
             <div className="flex-1 text-center font-bold text-2xl tracking-tight">
                {currentView === 'TAKE_GEMS' && t('Take Tokens')}
                {currentView === 'BUY_CARD' && t('Buy Card')}
                {currentView === 'RESERVE' && t('Reserve')}
                {currentView === 'DISCARD_TOKENS' && t('Discard Tokens')}
             </div>
          </div>
      )}

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-40">
         {currentView === 'DASHBOARD' && <Dashboard player={player} gameState={gameState} i18n={i18n} />}
         {currentView === 'TAKE_GEMS' && (
           <TakeGemsView
             player={player}
             gameState={gameState}
             selectedTokens={selectedTokens}
             onTokenClick={handleTokenClick}
             onSubmit={submitTokens}
             isMyTurn={isMyTurn}
           />
         )}
         {currentView === 'BUY_CARD' && (
           <BuyCardView
             player={player}
             gameState={gameState}
             isMyTurn={isMyTurn}
             paymentModalOpen={paymentModalOpen}
             paymentCard={paymentCard}
             onCardClick={handleCardClick}
             onPaymentSubmit={submitBuy}
             onPaymentClose={() => { setPaymentModalOpen(false); setPaymentCard(null); }}
             onAlert={showAlert}
           />
         )}
         {currentView === 'RESERVE' && (
           <ReserveView
             player={player}
             gameState={gameState}
             isMyTurn={isMyTurn}
             onCardClick={submitReserve}
             onAlert={showAlert}
           />
         )}
         {currentView === 'DISCARD_TOKENS' && (
           <DiscardTokensView
             player={player}
             onDiscard={handleDiscard}
           />
         )}
      </div>

      {/* Turn indicator + Fixed Bottom Action Bar (only on dashboard) */}
      {currentView === 'DASHBOARD' && (
          <div className="fixed bottom-0 left-0 right-0 z-50">
              {/* Turn Indicator */}
              <div className={clsx(
                  "text-center py-4 font-bold text-2xl border-t shadow-[0_-4px_15px_rgba(0,0,0,0.3)]",
                  isMyTurn
                      ? "bg-green-600 text-white border-green-500"
                      : "bg-gray-800 text-gray-400 border-gray-700"
              )}>
                  {isMyTurn
                      ? t('YOUR TURN')
                      : t('Waiting for', { name: gameState.players[gameState.currentPlayerIndex].name })}
              </div>

              {/* Action Buttons - 4 in a row */}
              <div className="bg-gray-900 border-t border-gray-800 p-3 flex gap-3">
                  <button
                      onClick={() => setCurrentView('TAKE_GEMS')}
                      className="flex-1 bg-gray-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-gray-700 transition border-2 border-gray-700 shadow-lg active:scale-95"
                  >
                      <Gem size={32} />
                      <span className="text-xs font-black uppercase tracking-widest">{t('Take')}</span>
                  </button>

                  <button
                      onClick={() => setCurrentView('BUY_CARD')}
                      className="flex-1 bg-gray-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-gray-700 transition border-2 border-gray-700 shadow-lg active:scale-95"
                  >
                      <ShoppingCart size={32} />
                      <span className="text-xs font-black uppercase tracking-widest">{t('Buy')}</span>
                  </button>

                  <button
                      onClick={() => setCurrentView('RESERVE')}
                      className="flex-1 bg-gray-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-gray-700 transition border-2 border-gray-700 shadow-lg active:scale-95"
                  >
                      <Wallet size={32} />
                      <span className="text-xs font-black uppercase tracking-widest">{t('Reserve')}</span>
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
