import React, { useState, useEffect } from 'react';
import { 
  Flame, ShieldCheck, ShieldAlert, Cpu, Sparkles, 
  Activity, Play, CheckCircle2, Sliders, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t('nav.attackModules')}
        </h2>
        <p className="text-xs text-slate-500">
          7 Attack-Specific Defense Modules & Secondary 23-Feature ML Anomaly Classifier.
        </p>
      </div>

      {/* 7 Defense Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((m) => (
          <div
            key={m.module_key}
            className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
              m.is_enabled
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 opacity-60'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {m.module_name}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    MODULE: {m.module_key}
                  </p>
                </div>

                {/* On/Off Switch */}
                <button
                  onClick={() => handleToggle(m.module_key)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                    m.is_enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Metrics pill */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500 text-[11px]">Blocked Attacks (24h):</span>
                <span className="font-bold text-emerald-500 font-mono text-sm">
                  {m.blocked_count_24h}
                </span>
              </div>
            </div>

            {/* Sensitivity Selector */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 text-[11px]">Sensitivity:</span>
              <div className="flex space-x-1">
                {['LOW', 'MEDIUM', 'HIGH'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSensitivityChange(m.module_key, s)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                      m.sensitivity === s
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ML Classifier Status & Inference Playground Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/30 text-white space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm tracking-wide">
                23-Feature Random Forest ML Fallback Subsystem
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Reused trained model from legacy IDS. Acts as secondary safety net for unknown attacks without a virtual patch rule.
            </p>
          </div>

          <div className="text-xs text-indigo-300 font-mono">
            {mlStatus ? mlStatus.model_version : 'Loading...'}
          </div>
        </div>

        {/* Live Test Inference Playground */}
        <div className="pt-2 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Live ML Inference Playground (Test any attack payload):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleRunMlTest}
              disabled={testing}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{testing ? 'Evaluating...' : 'Test ML Inference'}</span>
            </button>
          </div>

          {/* Inference Result View */}
          {mlInferenceResult && (
            <div className="p-4 bg-slate-900/90 border border-indigo-500/40 rounded-2xl text-xs space-y-2 font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-400">
                  Prediction: <strong className="text-rose-400 text-sm">{mlInferenceResult.prediction}</strong>
                </span>
                <span className="text-slate-400">
                  Confidence: <strong className="text-emerald-400">{(mlInferenceResult.confidence * 100).toFixed(1)}%</strong>
                </span>
                <span className="text-slate-400">
                  Anomaly Flag: <strong className="text-amber-400">{mlInferenceResult.is_anomaly ? 'YES' : 'NO'}</strong>
                </span>
              </div>

              {/* Top 3 Features Contribution */}
              {mlInferenceResult.top_features && mlInferenceResult.top_features.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                    Top 3 Contributing Features (Explainability):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    {mlInferenceResult.top_features.map((f: any, idx: number) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                        <p className="text-slate-400 text-[10px] truncate">{f.feature}</p>
                        <p className="font-bold text-white">Value: {f.value} <span className="text-indigo-400 text-[10px]">(Imp: {f.impact})</span></p>
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
