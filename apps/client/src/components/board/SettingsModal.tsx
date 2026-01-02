import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../ui/Modal";
import { Minus, Plus } from "lucide-react";
import { changeLanguage as changeLanguageUtil } from "../../utils/i18n";
import { MIN_WINNING_SCORE, MAX_WINNING_SCORE } from "../../constants/game";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  winningScore: number;
  onSetWinningScore: (score: number) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  winningScore,
  onSetWinningScore,
}: SettingsModalProps) {
  const { t, i18n } = useTranslation();

  const handleScoreChange = (delta: number) => {
    const newScore = winningScore + delta;
    if (newScore >= MIN_WINNING_SCORE && newScore <= MAX_WINNING_SCORE) {
      onSetWinningScore(newScore);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("Settings")}
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        {/* Goal Setting */}
        <div className="space-y-3">
          <label className="block text-sm font-bold tracking-widest text-gray-300 uppercase">
            {t("Goal")} (VP)
          </label>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3">
            <button
              onClick={() => handleScoreChange(-1)}
              disabled={winningScore <= MIN_WINNING_SCORE}
              className="rounded-lg bg-slate-700 p-2 text-white transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Minus size={20} />
            </button>
            <span className="font-mono text-4xl font-bold text-amber-400">
              {winningScore}
            </span>
            <button
              onClick={() => handleScoreChange(1)}
              disabled={winningScore >= MAX_WINNING_SCORE}
              className="rounded-lg bg-slate-700 p-2 text-white transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-400">
            {MIN_WINNING_SCORE} - {MAX_WINNING_SCORE} {t("VP")}
          </p>
        </div>

        {/* Language Setting */}
        <div className="space-y-3">
          <label className="block text-sm font-bold tracking-widest text-gray-300 uppercase">
            {t("Language")}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => changeLanguageUtil("en", i18n)}
              className={`flex-1 rounded-xl border-2 px-4 py-3 font-bold transition-all ${
                i18n.language === "en"
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              English
            </button>
            <button
              onClick={() => changeLanguageUtil("ja", i18n)}
              className={`flex-1 rounded-xl border-2 px-4 py-3 font-bold transition-all ${
                i18n.language === "ja"
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              日本語
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
