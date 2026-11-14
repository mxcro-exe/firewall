import React from 'react';
import { FileText, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Reports: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('nav.reports')}</h2>
          <p className="text-xs text-slate-500">Weekly Executive Summaries & Incident Post-Mortems (PDF / CSV).</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
          Phase 6 Module
        </span>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <FileText className="w-10 h-10 text-violet-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Executive Compliance & Incident Reports</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Generates comprehensive branded PDF reports summarizing protected sites, blocked intrusion attempts, and Mean Time to Virtual Patch (MTTVP) reduction.
        </p>
      </div>
    </div>
  );
};
