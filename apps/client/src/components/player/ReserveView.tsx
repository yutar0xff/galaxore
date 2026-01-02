import React from "react";
import { Player, GameState, Card as CardType } from "@local-splendor/shared";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/Card";
import { ResourcesHeader } from "./ResourcesHeader";
import { CardLevel } from "../../types/game";
import { CARD_LEVELS } from "../../constants/game";

interface ReserveViewProps {
  player: Player;
  gameState: GameState;
  isMyTurn: boolean;
  onCardClick: (card: CardType) => void;
  onAlert: (message: string) => void;
}

export function ReserveView({
  player,
  gameState,
  isMyTurn,
  onCardClick,
  onAlert,
}: ReserveViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <ResourcesHeader player={player} />
      <p className="text-center text-sm text-gray-400">
        {t("Select a card to reserve")}
      </p>
      {CARD_LEVELS.map((level) => (
        <div key={level}>
          <h3 className="mb-2 font-bold text-gray-400">
            {t("Level")} {level}
          </h3>
          <div className="flex snap-x gap-4 overflow-x-auto pb-4">
            {gameState.board.cards[level].map((card) => (
              <div key={card.id} className="flex-shrink-0 snap-center">
                <Card
                  card={card}
                  onClick={() => {
                    if (!isMyTurn) {
                      onAlert(t("Not your turn"));
                      return;
                    }
                    onCardClick(card);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
