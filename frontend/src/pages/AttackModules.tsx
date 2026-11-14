import React, { useState, useEffect } from 'react';
import { 
  Flame, ShieldCheck, ShieldAlert, Cpu, Sparkles, 
  Activity, Play, CheckCircle2, Sliders, AlertTriangle, Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { InfoHint } from '../components/common/InfoHint';
import api from '../services/api';

interface AttackModule {
  module_key: string;
  module_name: string;
  is_enabled: boolean;
  sensitivity: string;
  blocked_count_24h: number;
}

export const AttackModules: React.FC = () => {
  const { language, t } = useLanguage();
  const [modules, setModules] = useState<AttackModule[]>([]);
  const [mlStatus, setMlStatus] = useState<any>(null);
  const [testPayload, setTestPayload] = useState("' UNION SELECT @@version, 1--");
  const [mlInferenceResult, setMlInferenceResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchModules();
    fetchMlStatus();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await api.get('/attack-modules/');
      setModules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMlStatus = async () => {
    try {
      const res = await api.get('/attack-modules/ml/status');
      setMlStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (moduleKey: string) => {
    try {
      await api.patch(`/attack-modules/${moduleKey}/toggle`);
      fetchModules();
    } catch (err) {
      alert("Failed to toggle module");
    }
  };

  const handleSensitivityChange = async (moduleKey: string, newSensitivity: string) => {
    try {
      await api.put(`/attack-modules/${moduleKey}/sensitivity`, { sensitivity: newSensitivity });
      fetchModules();
    } catch (err) {
      alert("Failed to update sensitivity");
    }
  };

  const handleRunMlTest = async () => {
    setTesting(true);
    try {
      const res = await api.post('/attack-modules/ml/test-inference', {
        method: 'GET',
        path: '/api/test',
        query_string: `q=${encodeURIComponent(testPayload)}`
      });
      setMlInferenceResult(res.data);
    } catch (err) {
      alert("Inference test failed");
    } finally {
      setTesting(false);
    }
  };

  const getModuleInfo = (key: string) => {
    const map: Record<string, { desc: string; badge: string }> = {
      sqli: { desc: t('simple_mode.sqli'), badge: 'DATABASE' },
      xss: { desc: t('simple_mode.xss'), badge: 'XSS FILTER' },
      path: { desc: t('simple_mode.path'), badge: 'FILE SYSTEM' },
      cmd: { desc: t('simple_mode.cmd'), badge: 'SHELL' },
      ddos: { desc: t('simple_mode.ddos'), badge: 'RATE LIMIT' },
      brute: { desc: t('simple_mode.brute'), badge: 'BRUTE-FORCE' },
      bot: { desc: t('simple_mode.bot'), badge: 'BOT SCRAPER' },
    };
    return map[key] || { desc: 'Dedicated attack mitigation engine.', badge: 'SHIELD' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyanteal-500/20 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-cream-300">
              {t('nav.attackModules')}
            </h2>
            <InfoHint 
              title="7 Defense In-Depth Modules"
              content="Independent detection and mitigation switches. You can disable, tune sensitivity (Low, Med, High), and monitor blocks per module independently."
              badge="7 SHIELDS"
            />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dedicated attack detectors paired with an intelligent 23-feature Random Forest ML fallback.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-deepteal-700/60 text-iceteal-200 border border-iceteal-300/30">
            ALL 7 DEFENSES ARMED
          </span>
        </div>
      </div>

      {/* 7 Defense Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => {
          const info = getModuleInfo(m.module_key);
          return (
            <div
              key={m.module_key}
              className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                m.is_enabled
                  ? 'glass-panel border-cyanteal-500/30 hover:border-iceteal-300/50 shadow-lg'
                  : 'bg-obsidian-850/40 border-white/5 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-bold text-sm text-cream-200">
                        {m.module_name}
                      </h3>
                      <InfoHint title={m.module_name} content={info.desc} badge={info.badge} />
                    </div>
                    <p className="text-[10px] font-mono text-iceteal-300 uppercase tracking-wider">
                      MODULE: {m.module_key}
                    </p>
                  </div>

                  {/* Sleek On/Off Switch */}
                  <button
                    onClick={() => handleToggle(m.module_key)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                      m.is_enabled ? 'bg-cyanteal-500 justify-end shadow-glow-teal' : 'bg-obsidian-800 justify-start border border-white/10'
                    }`}
                  >
                    <div className="bg-cream-200 w-4 h-4 rounded-full shadow-md" />
                  </button>
                </div>

                {/* Metrics pill */}
                <div className="p-3 rounded-2xl bg-obsidian-850/80 border border-cyanteal-500/20 flex justify-between items-center text-xs">
                  <span className="text-slate-400 text-[11px]">Blocked Attacks (24h):</span>
                  <span className="font-bold text-iceteal-300 font-mono text-sm">
                    {m.blocked_count_24h}
                  </span>
                </div>
              </div>

              {/* Sensitivity Selector */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-cyanteal-500/20">
                <span className="text-slate-400 text-[11px]">Sensitivity:</span>
                <div className="flex space-x-1">
                  {['LOW', 'MEDIUM', 'HIGH'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSensitivityChange(m.module_key, s)}
                      className={`px-2.5 py-0.5 rounded-xl text-[10px] font-mono font-bold transition-all duration-200 ${
                        m.sensitivity === s
                          ? 'bg-gradient-to-r from-deepteal-700 to-cyanteal-500 text-cream-200 border border-iceteal-300/40 shadow-sm'
                          : 'bg-obsidian-850 text-slate-400 hover:text-cream-200 hover:bg-obsidian-800 border border-transparent'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ML Classifier Status & Inference Playground Card */}
      <div className="p-6 rounded-3xl glass-panel-elevated border border-cyanteal-500/35 text-white space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyanteal-500/20 pb-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-iceteal-300" />
              <h3 className="font-bold text-sm tracking-wide text-cream-300">
                23-Feature Random Forest ML Fallback Subsystem
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                MODEL LOADED
              </span>
              <InfoHint 
                title="Reused ML Classification Engine"
                content="Preserved from the legacy IDS project and upgraded. Employs a 23-feature vector extraction (path length, entropy, special chars, etc.) and Isolation Forest outlier detection to classify attacks that lack an explicit virtual patch."
                badge="ML ARB 2.0"
              />
            </div>
            <p className="text-xs text-slate-300 font-sans">
              Secondary safety net for zero-day threats with top-3 feature explainability.
            </p>
          </div>

          <div className="text-xs text-cream-300 font-mono bg-obsidian-950 px-3 py-1 rounded-full border border-cyanteal-500/30">
            {mlStatus ? mlStatus.model_version : 'Model: RF-23-v1.0'}
          </div>
        </div>

        {/* Live Test Inference Playground */}
        <div className="pt-2 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Live ML Inference Playground (Evaluate any attack query string):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-obsidian-950/90 border border-cyanteal-500/30 rounded-2xl text-xs text-cream-200 font-mono focus:outline-none focus:ring-1 focus:ring-iceteal-300"
            />
            <button
              onClick={handleRunMlTest}
              disabled={testing}
              className="px-5 py-2.5 bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 text-cream-100 rounded-2xl text-xs font-bold shadow-glow-copper transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{testing ? 'Evaluating...' : 'Test ML Inference'}</span>
            </button>
          </div>

          {/* Inference Result View */}
          {mlInferenceResult && (
            <div className="p-4 bg-obsidian-950 border border-cyanteal-500/40 rounded-2xl text-xs space-y-2.5 font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                <span className="text-slate-400">
                  Prediction: <strong className="text-copper-400 text-sm">{mlInferenceResult.prediction}</strong>
                </span>
                <span className="text-slate-400">
                  Confidence: <strong className="text-emerald-400">{(mlInferenceResult.confidence * 100).toFixed(1)}%</strong>
                </span>
                <span className="text-slate-400">
                  Anomaly Flag: <strong className="text-cream-300">{mlInferenceResult.is_anomaly ? 'YES' : 'NO'}</strong>
                </span>
              </div>

              {/* Top 3 Features Contribution */}
              {mlInferenceResult.top_features && mlInferenceResult.top_features.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-iceteal-300 font-bold uppercase tracking-wider">
                    Top 3 Contributing Features (Explainability):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    {mlInferenceResult.top_features.map((f: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-deepteal-700/20 border border-cyanteal-500/30">
                        <p className="text-slate-400 text-[10px] truncate">{f.feature}</p>
                        <p className="font-bold text-cream-200">Value: {f.value} <span className="text-iceteal-300 text-[10px]">(Imp: {f.impact})</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
