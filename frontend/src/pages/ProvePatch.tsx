import React from 'react';
import { GitCompare, Play, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ProvePatch: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('nav.provePatch')}</h2>
          <p className="text-xs text-slate-500">6-Stage Exploit Sandbox & False-Positive Replay Verification Pipeline.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Phase 4 Core
        </span>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <GitCompare className="w-10 h-10 text-emerald-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Prove-then-Patch Verification Stepper</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Automated proof harness: Exploit sandbox payload test &rarr; Legitimate traffic replay (0% false blocks) &rarr; Shadow mode &rarr; Canary distribution &rarr; Full enforcement with auto-rollback.
        </p>
      </div>
    </div>
  );
};
