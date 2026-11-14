import React from 'react';
import { FileCode, Plus, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Rules: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('nav.rules')}</h2>
          <p className="text-xs text-slate-500">Scoped Virtual Patch Rules (Method + Path + Param + Sanitized AST).</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
          Phase 4 Module
        </span>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <FileCode className="w-10 h-10 text-brand-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Deterministic Virtual Patch Rule Engine</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Hyper-targeted virtual patches scoped specifically by endpoint and parameter. Every rule includes versioning, instant disable, rollback, and plain-language explanation in Tamil & English.
        </p>
      </div>
    </div>
  );
};
