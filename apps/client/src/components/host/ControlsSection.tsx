import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Minus, Plus } from 'lucide-react';
import { changeLanguage as changeLanguageUtil } from '../../utils/i18n';

interface ControlsSectionProps {
  winningScore: number;
  onSetWinningScore: (score: number) => void;
  onLeave: () => void;
}

export function ControlsSection({ winningScore, onSetWinningScore, onLeave }: ControlsSectionProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-2 shrink-0">
      {/* Goal */}
      <div className="bg-slate-800/80 backdrop-blur-sm px-3 pt-7 pb-2 rounded-xl border border-slate-700 shadow-xl relative flex items-center justify-between gap-2">
        <span className="absolute top-1.5 left-1.5 text-xs font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-sans">
          Goal
        </span>
        <button
          onClick={() => onSetWinningScore(winningScore - 1)}
          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
        >
          <Minus size={20} />
        </button>
        <span className="text-3xl font-bold font-mono text-amber-400">{winningScore}</span>
        <button
          onClick={() => onSetWinningScore(winningScore + 1)}
          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Home & Lang */}
      <div className="flex gap-2">
        <button
          onClick={onLeave}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-xl border border-slate-600 shadow-lg transition-all flex items-center justify-center gap-1 group py-2"
        >
          <Home size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-bold text-sm">{t('Home')}</span>
        </button>
        <div className="bg-slate-800/80 backdrop-blur rounded-lg border border-slate-700 p-1 flex flex-col justify-center gap-0.5">
          <button onClick={() => changeLanguageUtil('en', i18n)} className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>EN</button>
          <button onClick={() => changeLanguageUtil('ja', i18n)} className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${i18n.language === 'ja' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>JA</button>
        </div>
      </div>
    </div>
  );
}
