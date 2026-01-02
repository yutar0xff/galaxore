import React from "react";
import { Card as CardType, OreColor } from "@galaxore/shared";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";
import { MissingOresIndicator } from "./MissingOresIndicator";

interface CardItemProps {
  card: CardType;
  affordable: boolean;
  missingOres: Record<OreColor, number>;
  onClick: () => void;
  isMyTurn: boolean;
  onAlert: (message: string) => void;
}

export function CardItem({
  card,
  affordable,
  missingOres,
  onClick,
  isMyTurn,
  onAlert,
}: CardItemProps) {
  const { t } = useTranslation();

  return (
    <div className="relative flex-shrink-0 snap-center">
      {affordable ? (
        <div className="absolute -top-12 left-1/2 z-50 flex -translate-x-1/2 items-center text-xs font-bold whitespace-nowrap text-green-500">
          {t("Available")}
        </div>
      ) : (
        <MissingOresIndicator missingOres={missingOres} />
      )}
      <Card
        card={card}
        onClick={() => {
          if (!isMyTurn) {
            onAlert(t("Not your turn"));
            return;
          }
          if (affordable) {
            onClick();
          } else {
            onAlert(t("Not enough resources"));
          }
        }}
      />
    </div>
  );
}
