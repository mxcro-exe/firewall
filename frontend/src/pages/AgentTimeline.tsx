import React from 'react';
import { Bot, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AgentTimeline: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('nav.agent')}</h2>
          <p className="text-xs text-slate-500">Autonomous OODA Loop (Observe &rarr; Decide &rarr; Act &rarr; Report).</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Phase 6 Module
        </span>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <Bot className="w-10 h-10 text-indigo-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Agentic AI Activity & Reasoning Timeline</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Audit every autonomous action taken by the PatchShield Agent. Shows the "Why" behind every virtual patch suggestion, with human-in-the-loop owner approval for Stage 5 full-enforce.
        </p>
      </div>
    </div>
  );
};
