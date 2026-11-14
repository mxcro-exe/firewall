import React from 'react';
import { BarChart3, TrendingDown, Target, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Metrics: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('nav.metrics')}</h2>
          <p className="text-xs text-slate-500">Nasscom ARB 2.0 PS5 Target Key Performance Indicators.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Phase 6 Module
        </span>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <BarChart3 className="w-10 h-10 text-emerald-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">PS5 Virtual Patching Benchmark KPIs</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Tracks Mean Time to Virtual Patch (MTTVP), Exposure Window Reduction %, False-Positive Block Rate (&lt;0.01%), and Coverage % of Known Disclosed CVEs.
        </p>
      </div>
    </div>
  );
};
