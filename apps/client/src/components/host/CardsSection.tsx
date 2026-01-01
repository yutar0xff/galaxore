import React from "react";
import { Card as CardType } from "@local-splendor/shared";
import { Card, CardBack } from "../ui/Card";
import { CardLevel } from "../../types/game";
import { CARD_LEVELS } from "../../constants/game";

interface CardsSectionProps {
  cards: {
    1: CardType[];
    2: CardType[];
    3: CardType[];
  };
}

export function CardsSection({ cards }: CardsSectionProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      {CARD_LEVELS.map((level) => (
        <div
          key={level}
          className="flex min-h-0 flex-1 items-center gap-2 overflow-hidden rounded-xl border border-white/5 bg-slate-800/20 p-1.5"
        >
          <div className="flex h-full shrink-0 items-center justify-center">
            <CardBack level={level} size="lg" />
          </div>
          <div className="flex h-full min-w-0 flex-1 items-center gap-2 overflow-hidden">
            {cards[level].map((card) => (
              <div
                key={card.id}
                className="flex h-full min-w-0 flex-1 items-center"
              >
                <Card card={card} size="lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
