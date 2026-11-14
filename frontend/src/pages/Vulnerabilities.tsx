import React from 'react';
import { ShieldAlert, Database, Search, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Vulnerabilities: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('nav.vulnerabilities')}</h2>
          <p className="text-xs text-slate-500">Offline NVD 2.0, CISA KEV & EPSS Intelligence Engine.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Phase 3 Module
        </span>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <Database className="w-10 h-10 text-indigo-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Offline CVE & KEV Intelligence Cache</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Synchronizes NVD CVE database, CISA Known Exploited Vulnerabilities, and EPSS scores into local SQLite. Auto-matches local tech stack against disclosed CVEs.
        </p>
      </div>
    </div>
  );
};
