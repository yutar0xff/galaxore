import React from "react";
import { Player, GameState, Card as CardType } from "@galaxore/shared";
import { useTranslation } from "react-i18next";
import { ResourcesHeader } from "./ResourcesHeader";
import { PaymentModal } from "./PaymentModal";
import { TokenPayment } from "../../types/game";
import { CARD_LEVELS } from "../../constants/game";
import { CardItem } from "../ui/CardItem";
import { canAffordCard, getMissingOres } from "../../utils/game";

interface BuyCardViewProps {
  player: Player;
  gameState: GameState;
  isMyTurn: boolean;
  paymentModalOpen: boolean;
  paymentCard: CardType | null;
  onCardClick: (card: CardType) => void;
  onPaymentSubmit: (card: CardType, payment?: TokenPayment) => void;
  onPaymentClose: () => void;
  onAlert: (message: string) => void;
}

export function BuyCardView({
  player,
  gameState,
  isMyTurn,
  paymentModalOpen,
  paymentCard,
  onCardClick,
  onPaymentSubmit,
  onPaymentClose,
  onAlert,
}: BuyCardViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <ResourcesHeader player={player} />

      {/* Reserved Cards Section */}
      {player.reserved.length > 0 && (
        <div className="mb-2 border-b border-gray-700 pb-6">
          <h3 className="mb-3 border-l-4 border-yellow-500 pl-2 font-bold text-yellow-500">
            {t("Reserved Cards")}
          </h3>
          <div className="flex snap-x gap-4 overflow-x-auto px-2 pt-14 pb-2">
            {player.reserved.map((card) => {
              const affordable = canAffordCard(card, player);
              const missingOres = getMissingOres(card, player);
              return (
                <CardItem
                  key={card.id}
                  card={card}
                  affordable={affordable}
                  missingOres={missingOres}
                  onClick={() => onCardClick(card)}
                  isMyTurn={isMyTurn}
                  onAlert={onAlert}
                />
              );
            })}
          </div>
        </div>
      )}

      {CARD_LEVELS.map((level) => (
        <div key={level}>
          <h3 className="mb-2 font-bold text-gray-400">
            {t("Level")} {level}
          </h3>
          <div className="flex snap-x gap-4 overflow-x-auto pt-14 pb-4">
            {gameState.board.cards[level].map((card) => {
              const affordable = canAffordCard(card, player);
              const missingOres = getMissingOres(card, player);
              return (
                <CardItem
                  key={card.id}
                  card={card}
                  affordable={affordable}
                  missingOres={missingOres}
                  onClick={() => onCardClick(card)}
                  isMyTurn={isMyTurn}
                  onAlert={onAlert}
                />
              );
            })}
          </div>
        </div>
      ))}
      {paymentModalOpen && paymentCard && (
        <PaymentModal
          card={paymentCard}
          player={player}
          isMyTurn={isMyTurn}
          onSubmit={onPaymentSubmit}
          onClose={onPaymentClose}
        />
      )}
    </div>
  );
}
