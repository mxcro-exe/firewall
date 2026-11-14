import React from 'react';
import { Activity, Play } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Traffic: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('nav.traffic')}</h2>
          <p className="text-xs text-slate-500">Sanitized Request Recorder & Historical Traffic Replay Engine.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Phase 4 Module
        </span>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <Activity className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Live Traffic Stream & Sanitized Replayer</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Passively records sanitized requests (tokens, cookies, and passwords automatically stripped) to build clean regression benchmarks for Prove-then-Patch false positive verification.
        </p>
      </div>
    </div>
  );
};
