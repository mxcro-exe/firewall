import React from 'react';
import { HelpCircle, BookOpen, Terminal, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Help: React.FC = () => {
  const { language, t } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('nav.help')}</h2>
        <p className="text-xs text-slate-500">Quick guides, frequently asked questions, and architecture overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-brand-500" />
            What is "Prove-then-Patch"?
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Unlike legacy WAFs that apply rules blindly, PatchShield tests every virtual patch in an automated exploit sandbox and verifies it against recorded legitimate traffic. If it causes even a single false block, it is rejected before touching your real customers.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <Terminal className="w-4 h-4 mr-2 text-indigo-500" />
            How do I protect my web application?
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Go to <strong>Protected Sites</strong> &rarr; Click <strong>Add Site</strong>. Provide your backend URL (e.g. <code>http://127.0.0.1:9000</code>). Point your domain or reverse proxy to PatchShield port 8000. All traffic will now pass through the virtual patching gateway!
          </p>
        </div>
      </div>
    </div>
  );
};
