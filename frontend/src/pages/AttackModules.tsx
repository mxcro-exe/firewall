import React from 'react';
import { Flame, Sliders } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AttackModules: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('nav.attackModules')}</h2>
          <p className="text-xs text-slate-500">7 Attack-Specific Modules (DDoS, SQLi, XSS, Path, Cmd, Brute, Bot).</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Phase 5 Module
        </span>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <Flame className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Attack-Specific Defense Shields</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Each attack vector features its own dedicated detector, mitigation rules, on/off switch, sensitivity slider, and live metrics card.
        </p>
      </div>
    </div>
  );
};
