import React from 'react';
import { Card as CardType, GemColor } from '@local-splendor/shared';
import { useTranslation } from 'react-i18next';
import { Card } from './Card';
import { MissingGemsIndicator } from './MissingGemsIndicator';

interface CardItemProps {
  card: CardType;
  affordable: boolean;
  missingGems: Record<GemColor, number>;
  onClick: () => void;
  isMyTurn: boolean;
  onAlert: (message: string) => void;
}

export function CardItem({ card, affordable, missingGems, onClick, isMyTurn, onAlert }: CardItemProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-shrink-0 snap-center relative">
      {affordable ? (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 text-green-500 text-xs font-bold whitespace-nowrap flex items-center">
          {t('Available')}
        </div>
      ) : (
        <MissingGemsIndicator missingGems={missingGems} />
      )}
      <Card card={card} onClick={() => {
        if (!isMyTurn) {
          onAlert(t('Not your turn'));
          return;
        }
        if (affordable) {
          onClick();
        } else {
          onAlert(t('Not enough resources'));
        }
      }} />
    </div>
  );
}
