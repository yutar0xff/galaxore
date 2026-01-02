import React from "react";
import { useTranslation } from "react-i18next";
import { Home, Settings } from "lucide-react";

interface ControlsSectionProps {
  winningScore: number;
  onLeave: () => void;
  onOpenSettings: () => void;
}

export function ControlsSection({
  winningScore,
  onLeave,
  onOpenSettings,
}: ControlsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex shrink-0 flex-col gap-2">
      {/* Goal Display - Value Only */}
      <div className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 shadow-xl backdrop-blur-sm">
        <span className="font-mono text-2xl font-bold text-amber-400">
          {t("Goal")}: {winningScore}
        </span>
      </div>

      {/* Home & Settings Buttons */}
      <div className="flex gap-2">
        {/* Home Button - Responsive: icon only on small screens */}
        <button
          onClick={onLeave}
          className="group flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-white shadow-lg transition-all hover:bg-slate-600 sm:px-4"
          title={t("Home")}
        >
          <Home
            size={20}
            className="transition-transform group-hover:scale-110"
          />
          <span className="hidden text-sm font-bold sm:inline">
            {t("Home")}
          </span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="group flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-white shadow-lg transition-all hover:bg-slate-600 sm:px-4"
          title={t("Settings")}
        >
          <Settings
            size={20}
            className="transition-transform group-hover:scale-110"
          />
          <span className="hidden text-sm font-bold sm:inline">
            {t("Settings")}
          </span>
        </button>
      </div>
    </div>
  );
}
