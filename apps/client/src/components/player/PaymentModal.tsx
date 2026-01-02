import React, { useState, useEffect } from "react";
import {
  Card as CardType,
  Player,
  OreColor,
  TokenColor,
} from "@galaxore/shared";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Check, X, Minus, Plus } from "lucide-react";
import { ORE_BORDER_COLORS_WITH_GOLD, ORE_ORDER } from "../../constants/ores";
import { ORE_IMAGES } from "../ui/Token";
import { calculateDiscount } from "../../utils/game";
import { TokenPayment } from "../../types/game";

interface PaymentModalProps {
  card: CardType;
  player: Player;
  onClose: () => void;
  onSubmit: (card: CardType, payment?: TokenPayment) => void;
  isMyTurn: boolean;
}

export function PaymentModal({
  card,
  player,
  onClose,
  onSubmit,
  isMyTurn,
}: PaymentModalProps) {
  const { t } = useTranslation();
  const [tokenPayment, setTokenPayment] = useState<TokenPayment>({});

  // Calculate derived state
  const discount = calculateDiscount(player);

  // Initialize defaults on mount
  // Calculate initial payment: use tokens as much as possible, leaving deficit for gold
  useEffect(() => {
    const initialPayment: TokenPayment = {};
    for (const color of ORE_ORDER) {
      const cost = card.cost[color] || 0;
      if (cost === 0) continue;
      const bonus = discount[color] || 0;
      const req = Math.max(0, cost - bonus);

      // Default: use tokens as much as possible
      const available = player.tokens[color] || 0;
      const pay = Math.min(req, available);
      initialPayment[color] = pay;
    }
    setTokenPayment(initialPayment);
  }, [card, discount, player.tokens]);

  // Recalculate payment rows and gold needed based on current tokenPayment
  // For each ore color: calculate cost, discount, required amount, and how much player is paying
  // Gold is used to cover any deficit (required - paid)
  let goldUsed = 0;
  const allOreColors: OreColor[] = ORE_ORDER;
  const rows = allOreColors
    .map((color) => {
      const cost = card.cost[color] || 0;
      if (cost === 0 && (discount[color] || 0) === 0) return null; // Only show relevant ores
      const bonus = discount[color] || 0;
      const req = Math.max(0, cost - bonus);
      const pay = tokenPayment[color] ?? 0;
      const deficit = Math.max(0, req - pay);
      goldUsed += deficit;

      return { color, cost, bonus, req, pay };
    })
    .filter((row) => row !== null);

  const canAfford = (player.tokens.gold || 0) >= goldUsed;

  // Handle adjusting payment amount for a specific ore color
  // Validates that the new value is within allowed limits
  const handleAdjust = (color: TokenColor, delta: number) => {
    const current = tokenPayment[color] || 0;
    const row = rows.find((r) => r.color === color);
    if (!row) return;

    const newValue = current + delta;

    // Limits: cannot pay negative, cannot pay more than required, cannot pay more than owned
    if (newValue < 0) return;
    if (newValue > row.req) return;
    if (newValue > (player.tokens[color] || 0)) return;

    // Check Gold constraint for decreasing payment
    // If we decrease payment, goldUsed increases, so we need enough gold to cover
    if (delta < 0) {
      if (goldUsed + 1 > (player.tokens.gold || 0)) return;
    }

    setTokenPayment({ ...tokenPayment, [color]: newValue });
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 duration-200">
      <div className="w-full max-w-md rounded-xl border border-gray-600 bg-gray-800 p-6 shadow-2xl">
        <h2 className="mb-4 flex items-center justify-between text-xl font-bold text-white">
          {t("Select Payment")}
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-700">
            <X size={20} />
          </button>
        </h2>

        <div className="mb-6 space-y-4">
          {rows.map((row) => (
            <div
              key={row.color}
              className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900/50 p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    "h-10 w-10 overflow-hidden rounded-full border-2 shadow-sm",
                    ORE_BORDER_COLORS_WITH_GOLD[row.color],
                  )}
                >
                  <img
                    src={ORE_IMAGES[row.color]}
                    className="h-full w-full scale-150 object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs tracking-wider text-gray-400 uppercase">
                    {row.color}
                  </span>
                  <div className="flex gap-2 text-xs">
                    <span className="text-red-400">Cost: {row.cost}</span>
                    <span className="text-green-400">Bonus: {row.bonus}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-1">
                <button
                  onClick={() => handleAdjust(row.color, -1)}
                  disabled={
                    row.pay <= 0 || goldUsed + 1 > (player.tokens.gold || 0)
                  }
                  className="rounded bg-gray-700 p-1.5 text-white transition-colors hover:bg-gray-600 disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-lg font-bold text-white">
                  {row.pay}
                </span>
                <button
                  onClick={() => handleAdjust(row.color, 1)}
                  disabled={
                    row.pay >= row.req ||
                    row.pay >= (player.tokens[row.color] || 0)
                  }
                  className="rounded bg-gray-700 p-1.5 text-white transition-colors hover:bg-gray-600 disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* Gold Row (Calculated) */}
          <div className="flex items-center justify-between rounded-lg border border-yellow-700/50 bg-yellow-900/20 p-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-yellow-600 shadow-sm">
                <img
                  src={ORE_IMAGES["gold"]}
                  className="h-full w-full scale-150 object-cover"
                />
              </div>
              <span className="font-bold text-yellow-500">Gold Needed</span>
            </div>
            <span
              className={clsx(
                "text-xl font-bold",
                goldUsed > (player.tokens.gold || 0)
                  ? "text-red-500"
                  : "text-yellow-500",
              )}
            >
              {goldUsed}{" "}
              <span className="text-sm text-gray-400">
                / {player.tokens.gold || 0}
              </span>
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-700 py-3 font-bold text-white transition-colors hover:bg-gray-600"
          >
            {t("Cancel")}
          </button>
          <button
            onClick={() => {
              const finalPayment = { ...tokenPayment, gold: goldUsed };
              onSubmit(card, finalPayment);
            }}
            disabled={!canAfford || !isMyTurn}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check size={18} />
            {isMyTurn ? t("Confirm") : t("Not your turn")}
          </button>
        </div>
      </div>
    </div>
  );
}
