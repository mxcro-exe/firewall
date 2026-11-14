import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Globe, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export const Onboarding: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [siteName, setSiteName] = useState('My Online Store');
  const [domain, setDomain] = useState('localhost');
  const [upstream, setUpstream] = useState('http://127.0.0.1:9000');
  const [mode, setMode] = useState('PROTECT');
  const [tgToken, setTgToken] = useState('');
  const [tgChatId, setTgChatId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await api.post('/auth/setup-wizard', {
        site_name: siteName,
        domain_or_host: domain,
        upstream_url: upstream,
        security_mode: mode,
        telegram_bot_token: tgToken || null,
        telegram_chat_id: tgChatId || null,
      });
      localStorage.setItem('patchshield_first_run', 'true');
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Setup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 mx-auto flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {t('auth.wizardTitle')}
          </h2>
          <p className="text-xs text-slate-400">
            {t('auth.wizardDesc')}
          </p>
        </div>

        {/* Stepper indicators */}
        <div className="flex justify-between items-center px-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step === s
                    ? 'bg-brand-600 text-white'
                    : step > s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                {s === 1 ? 'Site' : s === 2 ? 'Mode' : 'Alerts'}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Add site */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Business Website / App Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Domain or Hostname</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Upstream Server URL (Where your backend runs)</label>
              <input
                type="text"
                value={upstream}
                onChange={(e) => setUpstream(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <span>Continue to Security Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Choose Mode */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <label className="block text-slate-300 font-medium">Choose Initial Protection Mode</label>
            <div className="space-y-2">
              {[
                { key: 'PROTECT', title: 'Protect (Recommended)', desc: 'Blocks high-confidence exploits, passes benign traffic.' },
                { key: 'MONITOR', title: 'Monitor Only', desc: 'Zero blocking. Logs attacks and shadow-evaluates virtual patches.' },
                { key: 'STRICT', title: 'Strict Lockdown', desc: 'Aggressive heuristics and instant IP bans on any anomaly.' }
              ].map((m) => (
                <div
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    mode === m.key
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
                  }`}
                >
                  <p className="font-semibold text-white">{m.title}</p>
                  <p className="text-[11px] text-slate-400">{m.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold flex items-center justify-center space-x-1.5"
              >
                <span>Continue to Alerts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Telegram Alerts */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-800/60 rounded-xl space-y-1">
              <p className="font-semibold text-white">Connect Telegram Alerts (Optional)</p>
              <p className="text-[11px] text-slate-400">Receive instant attack alerts in Tamil or English on your phone.</p>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Telegram Bot Token (Optional)</label>
              <input
                type="text"
                placeholder="Can configure later in settings"
                value={tgToken}
                onChange={(e) => setTgToken(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Telegram Chat ID (Optional)</label>
              <input
                type="text"
                placeholder="Can configure later in settings"
                value={tgChatId}
                onChange={(e) => setTgChatId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={submitting}
                className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center space-x-1.5"
              >
                <span>{submitting ? 'Activating...' : 'Launch PatchShield'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
