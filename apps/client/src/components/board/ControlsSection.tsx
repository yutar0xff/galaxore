import React from "react";
import { useTranslation } from "react-i18next";
import { Home, Minus, Plus } from "lucide-react";
import { changeLanguage as changeLanguageUtil } from "../../utils/i18n";

interface ControlsSectionProps {
  winningScore: number;
  onSetWinningScore: (score: number) => void;
  onLeave: () => void;
}

export function ControlsSection({
  winningScore,
  onSetWinningScore,
  onLeave,
}: ControlsSectionProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className="grid shrink-0 grid-cols-2 gap-2">
      {/* Goal */}
      <div className="relative flex items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 pt-7 pb-2 shadow-xl backdrop-blur-sm">
        <span className="absolute top-1.5 left-1.5 rounded border border-slate-700 bg-slate-900 px-2 py-0.5 font-sans text-xs font-semibold tracking-widest text-slate-300 uppercase">
          Goal
        </span>
        <button
          onClick={() => onSetWinningScore(winningScore - 1)}
          className="rounded-lg bg-slate-700 p-1.5 text-white transition-colors hover:bg-slate-600"
        >
          <Minus size={20} />
        </button>
        <span className="font-mono text-3xl font-bold text-amber-400">
          {winningScore}
        </span>
        <button
          onClick={() => onSetWinningScore(winningScore + 1)}
          className="rounded-lg bg-slate-700 p-1.5 text-white transition-colors hover:bg-slate-600"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Home & Lang */}
      <div className="flex gap-2">
        <button
          onClick={onLeave}
          className="group flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-600 bg-slate-700 py-2 text-white shadow-lg transition-all hover:bg-slate-600"
        >
          <Home
            size={20}
            className="transition-transform group-hover:scale-110"
          />
          <span className="text-sm font-bold">{t("Home")}</span>
        </button>
        <div className="flex flex-col justify-center gap-0.5 rounded-lg border border-slate-700 bg-slate-800/80 p-1 backdrop-blur">
          <button
            onClick={() => changeLanguageUtil("en", i18n)}
            className={`rounded px-2 py-0.5 text-xs font-bold transition-all ${i18n.language === "en" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguageUtil("ja", i18n)}
            className={`rounded px-2 py-0.5 text-xs font-bold transition-all ${i18n.language === "ja" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}
          >
            JA
          </button>
        </div>
      </div>
    </div>
  );
}
