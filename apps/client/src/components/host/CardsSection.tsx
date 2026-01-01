import React from 'react';
import { Card as CardType } from '@local-splendor/shared';
import { Card, CardBack } from '../ui/Card';
import { CardLevel } from '../../types/game';
import { CARD_LEVELS } from '../../constants/game';

interface CardsSectionProps {
  cards: {
    1: CardType[];
    2: CardType[];
    3: CardType[];
  };
}

export function CardsSection({ cards }: CardsSectionProps) {
  return (
    <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden">
      {CARD_LEVELS.map((level) => (
        <div key={level} className="flex-1 flex gap-2 items-center min-h-0 bg-slate-800/20 rounded-xl p-1.5 border border-white/5 overflow-hidden">
          <div className="shrink-0 h-full flex items-center justify-center">
            <CardBack level={level} size="lg" />
          </div>
          <div className="flex-1 flex gap-2 items-center h-full overflow-hidden min-w-0">
            {cards[level].map(card => (
              <div key={card.id} className="flex-1 min-w-0 h-full flex items-center">
                <Card card={card} size="lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
