import React from 'react';
import { Player, GameState, GemColor } from '@local-splendor/shared';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Token } from '../ui/Token';
import { ResourcesHeader } from './ResourcesHeader';
import { GEM_ORDER } from '../../constants/gems';

interface TakeGemsViewProps {
  player: Player;
  gameState: GameState;
  selectedTokens: GemColor[];
  onTokenClick: (color: GemColor) => void;
  onSubmit: () => void;
  isMyTurn: boolean;
}

export function TakeGemsView({ player, gameState, selectedTokens, onTokenClick, onSubmit, isMyTurn }: TakeGemsViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Current Owned Tokens Section */}
      <ResourcesHeader player={player} />

      <div className="bg-gray-800 p-4 rounded-xl">
        <h3 className="text-gray-400 text-sm font-bold mb-4 uppercase tracking-wide text-center">{t('Select Tokens to Take')}</h3>
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          {GEM_ORDER.map(color => (
            <div key={color} className={`relative transition-all duration-200 ${selectedTokens.includes(color) ? 'scale-110 ring-4 ring-white rounded-full' : ''}`}>
              <Token
                color={color}
                count={gameState.board.tokens[color]}
                onClick={() => onTokenClick(color)}
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
          onClick={onSubmit}
          disabled={selectedTokens.length === 0 || !isMyTurn}
          className="w-full bg-blue-600 py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Check size={20} />
          {isMyTurn ? t('Confirm') : t('Not your turn')}
        </button>
      </div>
    </div>
  );
}
