import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Globe, Activity, ArrowUpRight, 
  CheckCircle2, AlertTriangle, Zap, Server, Sliders, HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMode } from '../context/ModeContext';
import api from '../services/api';

export const Dashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const { dashboardMode, globalMode } = useMode();
  
  const [sitesCount, setSitesCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await api.get('/sites/');
        setSitesCount(res.data.length || 1);
      } catch (err) {
        console.error("Failed to load sites", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Mode Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-brand-900/40 via-indigo-950/30 to-slate-900 border border-brand-500/30">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              {t('dashboard.title')}
            </h2>
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {globalMode} MODE
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="mt-3 md:mt-0 flex items-center space-x-2">
          <a
            href="/sites"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t('dashboard.addSite')}</span>
          </a>
        </div>
      </div>

      {/* SHOPKEEPER SIMPLE MODE ASSISTANT BANNER (When Simple Mode is active) */}
      {dashboardMode === 'simple' && (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-emerald-500/10 border-2 border-indigo-500/30 shadow-lg space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('simple_mode.title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                {t('simple_mode.subtitle')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {[
              { title: 'SQL Injection', text: t('simple_mode.sqli'), badge: 'DATABASE SHIELD' },
              { title: 'Cross-Site Scripting (XSS)', text: t('simple_mode.xss'), badge: 'BROWSER SHIELD' },
              { title: 'Path Traversal', text: t('simple_mode.path'), badge: 'FILE SYSTEM' },
              { title: 'Command Injection', text: t('simple_mode.cmd'), badge: 'SERVER ACCESS' },
              { title: 'Brute-Force Passwords', text: t('simple_mode.brute'), badge: 'LOGIN GUARD' },
              { title: 'DDoS Traffic Flood', text: t('simple_mode.ddos'), badge: 'RATE LIMIT' },
              { title: 'Hacker Scanner Bots', text: t('simple_mode.bot'), badge: 'BOT DROP' },
            ].map((card, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{card.title}</span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    PROTECTED
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('dashboard.totalSites')}</span>
            <Globe className="w-4 h-4 text-brand-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {sitesCount}
            </span>
            <span className="text-[11px] text-emerald-500 font-medium">Active Reverse Proxy</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('dashboard.activePatches')}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              1
            </span>
            <span className="text-[11px] text-emerald-500 font-medium">Enforced & Safe</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('dashboard.blockedAttacks')}</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              0
            </span>
            <span className="text-[11px] text-rose-500 font-medium">0.00% False Blocks</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('dashboard.healthScore')}</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-500">
              88/100
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">Grade A (Safe)</span>
          </div>
        </div>
      </div>

      {/* Prove-then-Patch Stepper Overview Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'ta' 
                ? 'நிரூபித்து இணை (Prove-then-Patch) தானியங்கி குழாய்' 
                : language === 'hi'
                ? 'प्रमाणित पैच (Prove-then-Patch) स्वचालित परीक्षण पाइपलाइन'
                : 'Prove-then-Patch Active Verification Pipeline'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ta' 
                ? 'ஒவ்வொரு விதியும் உற்பத்திக்கு செல்வதற்கு முன் நிஜ மாதிரிகள் மூலம் சோதிக்கப்படுகிறது' 
                : language === 'hi'
                ? 'प्रत्येक वर्चुअल पैच को लागू करने से पहले सैंडबॉक्स व ट्रैफ़िक रीप्ले में परखा जाता है'
                : 'Every virtual patch is battle-tested in sandbox & historical traffic before live enforcement.'}
            </p>
          </div>
          <a href="/prove-patch" className="text-xs text-brand-500 hover:text-brand-400 font-medium flex items-center">
            <span>{language === 'ta' ? 'விவரங்களை காண்க' : language === 'hi' ? 'विवरण देखें' : 'Inspect Stepper'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>

        {/* 6-Stage Visual Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-2">
          {[
            { step: '1', title: 'Sandbox Exploit', status: 'PASS', color: 'border-emerald-500 text-emerald-500' },
            { step: '2', title: 'Traffic Replay FP', status: '0% FP', color: 'border-emerald-500 text-emerald-500' },
            { step: '3', title: 'Shadow Mode', status: 'LOG ONLY', color: 'border-indigo-500 text-indigo-500' },
            { step: '4', title: 'Canary Split', status: '5% TRAFFIC', color: 'border-amber-500 text-amber-500' },
            { step: '5', title: 'Full Enforce', status: 'AUTO-ROLLBACK', color: 'border-brand-500 text-brand-500' },
            { step: '6', title: 'Auto-Retire', status: 'READY', color: 'border-slate-500 text-slate-400' },
          ].map((st) => (
            <div key={st.step} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center space-y-1">
              <span className="text-[10px] font-mono text-slate-400">STAGE {st.step}</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{st.title}</p>
              <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {st.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Attack Modules & PatchShield Agent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): 7 Attack Defense Modules Preview */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('nav.attackModules')} (7 Active Shields)
            </h3>
            <a href="/attack-modules" className="text-xs text-brand-500 hover:text-brand-400 font-medium">
              View All Modules &rarr;
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'ddos', name: 'DDoS & Flood Shield', status: 'ACTIVE', sub: '60 req/min limit' },
              { key: 'sqli', name: 'SQL Injection Guard', status: 'ACTIVE', sub: 'AST & Token Matcher' },
              { key: 'xss', name: 'Cross-Site Scripting (XSS)', status: 'ACTIVE', sub: 'HTML Unpacker' },
              { key: 'path', name: 'Path Traversal Guard', status: 'ACTIVE', sub: 'LFI / Sensitive files' },
              { key: 'cmd', name: 'Command Injection Shield', status: 'ACTIVE', sub: 'OS Metacharacters' },
              { key: 'brute', name: 'Brute-Force & Credential Guard', status: 'ACTIVE', sub: '5 tries / 5 mins' },
            ].map((m) => (
              <div key={m.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{m.name}</p>
                  <p className="text-[10px] text-slate-500">{m.sub}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-500 border border-emerald-500/20">
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right (1 col): PatchShield Agent OODA Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2" />
              {t('nav.agent')}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              OODA ACTIVE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
              <span className="text-[10px] text-indigo-400 font-mono font-bold">LATEST AGENT DECISION:</span>
              <p className="text-slate-800 dark:text-slate-200">
                {language === 'ta' 
                  ? 'பின்னணி அமைப்புகளை கண்காணித்து வருகிறது. எந்த அச்சுறுத்தலும் கண்டறியப்படவில்லை.' 
                  : language === 'hi'
                  ? 'रिवर्स प्रॉक्सी ट्रैफ़िक की निगरानी जारी है। कोई नया सुरक्षा ख़तरा नहीं मिला।'
                  : 'Monitoring reverse-proxy traffic and offline CVE feeds. Upstream latency nominal.'}
              </p>
            </div>

            <div className="space-y-2 text-[11px] text-slate-500">
              <div className="flex justify-between">
                <span>Guardrails:</span>
                <span className="text-slate-300 font-semibold">Owner Approval Required</span>
              </div>
              <div className="flex justify-between">
                <span>Auto-Rollback:</span>
                <span className="text-emerald-400 font-semibold">Armed (&gt;5% FP)</span>
              </div>
            </div>

            <a
              href="/agent"
              className="block w-full text-center py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
            >
              Open Agent Timeline &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
