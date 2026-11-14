import React, { useState, useEffect } from 'react';
import { 
  Flame, ShieldCheck, ShieldAlert, Cpu, Sparkles, 
  Activity, Play, CheckCircle2, Sliders, AlertTriangle, Info,
  Filter, Layers, KeyRound, Database, Network
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const moduleCategories: Record<string, string> = {
    // Injections
    sqli: 'injection',
    xss: 'injection',
    cmd: 'injection',
    ssti: 'injection',
    nosql: 'injection',
    // Data & Files
    path: 'data_files',
    xxe: 'data_files',
    deserial: 'data_files',
    ssrf: 'data_files',
    recon: 'data_files',
    // Auth & Access
    brute: 'auth',
    csrf: 'auth',
    redirect: 'auth',
    mass_assign: 'auth',
    ldap: 'auth',
    // Traffic & Protocols
    ddos: 'traffic',
    bot: 'traffic',
    smuggling: 'traffic',
    graphql: 'traffic',
    proto_abuse: 'traffic',
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
      ssrf: { desc: t('simple_mode.ssrf'), badge: 'CLOUD SSRF' },
      recon: { desc: t('simple_mode.recon'), badge: 'RECON TRAP' },
      xxe: { desc: t('simple_mode.xxe'), badge: 'XXE PARSER' },
      ssti: { desc: t('simple_mode.ssti'), badge: 'SSTI TEMPLATE' },
      deserial: { desc: t('simple_mode.deserial'), badge: 'DESERIAL RCE' },
      redirect: { desc: t('simple_mode.redirect'), badge: 'OPEN REDIRECT' },
      csrf: { desc: t('simple_mode.csrf'), badge: 'CSRF GUARD' },
      nosql: { desc: t('simple_mode.nosql'), badge: 'NOSQL DB' },
      smuggling: { desc: t('simple_mode.smuggling'), badge: 'HTTP SMUGGLE' },
      ldap: { desc: t('simple_mode.ldap'), badge: 'LDAP DIRECTORY' },
      graphql: { desc: t('simple_mode.graphql'), badge: 'GRAPHQL API' },
      mass_assign: { desc: t('simple_mode.mass_assign'), badge: 'MASS ASSIGN' },
      proto_abuse: { desc: t('simple_mode.proto_abuse'), badge: 'PROTOCOL GUARD' },
    };
    return map[key] || { desc: 'Dedicated attack mitigation engine.', badge: 'SHIELD' };
  };

  const filteredModules = selectedCategory === 'all'
    ? modules
    : modules.filter(m => moduleCategories[m.module_key] === selectedCategory);

  const activeCount = modules.filter(m => m.is_enabled).length;

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
              title="20 Defense-in-Depth Attack Modules"
              content="Independent detection and mitigation switches covering OWASP Top 10, SSRF, Deserialization, NoSQL, and Protocol Abuse. You can independently tune sensitivity or toggle each module."
              badge="20 SHIELDS"
            />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            20 high-speed attack detectors paired with an intelligent 23-feature Random Forest ML fallback.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-deepteal-700/60 text-iceteal-200 border border-iceteal-300/30">
            {activeCount}/20 DEFENSES ARMED
          </span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'all', label: language === 'ta' ? 'அனைத்து 20 கேடயங்கள்' : language === 'hi' ? 'सभी 20 कवच' : 'All 20 Shields', count: modules.length },
          { key: 'injection', label: language === 'ta' ? 'ஊசி தாக்குதல்கள் (Injections)' : language === 'hi' ? 'इंजेक्शन हमले (Injections)' : 'Injections (5)', count: 5 },
          { key: 'data_files', label: language === 'ta' ? 'கோப்பு & தரவு கவசம்' : language === 'hi' ? 'डेटा एवं फ़ाइलें' : 'Data & Files (5)', count: 5 },
          { key: 'auth', label: language === 'ta' ? 'அங்கீகாரம் & அணுகல்' : language === 'hi' ? 'प्रमाणीकरण एवं पहुँच' : 'Auth & Access (5)', count: 5 },
          { key: 'traffic', label: language === 'ta' ? 'போக்குவரத்து & நெறிமுறைகள்' : language === 'hi' ? 'ट्रैफ़िक एवं प्रोटोकॉल' : 'Traffic & Protocols (5)', count: 5 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedCategory(tab.key)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all duration-200 flex-shrink-0 flex items-center space-x-1.5 ${
              selectedCategory === tab.key
                ? 'bg-deepteal-700 text-cream-100 border border-iceteal-300/40 shadow-glow-teal font-bold'
                : 'bg-obsidian-900/60 text-slate-400 hover:text-cream-200 border border-white/5'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 20 Defense Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map((m) => {
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
              <div className="pt-2 border-t border-cyanteal-500/15 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center space-x-1 text-[11px]">
                  <Sliders className="w-3 h-3 text-copper-400" />
                  <span>Sensitivity:</span>
                </span>
                <div className="flex items-center space-x-1">
                  {['LOW', 'MEDIUM', 'HIGH'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => handleSensitivityChange(m.module_key, lvl)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-colors ${
                        m.sensitivity === lvl
                          ? 'bg-copper-500 text-cream-100 font-bold shadow-glow-copper'
                          : 'bg-obsidian-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Random Forest ML Subsystem Terminal */}
      <div className="p-6 rounded-3xl glass-panel-elevated border border-cyanteal-500/30 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-deepteal-700 text-iceteal-300 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-cream-200 flex items-center space-x-2">
                <span>Tier 3: 23-Feature Random Forest ML Anomaly Engine</span>
                <InfoHint 
                  title="Random Forest ML Inference Subsystem" 
                  content="Extracts 23 mathematical features (Shannon entropy, char ratio, AST token density, obfuscation pass count) to detect novel zero-day exploits not yet matched by regex signatures."
                  badge="ML CORE"
                />
              </h3>
              <p className="text-xs text-slate-400">
                Inference Model: <span className="text-iceteal-300 font-mono">random_forest_v2.pkl</span> | Fallback Latency: <span className="text-emerald-400 font-mono">&lt; 0.65ms</span>
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
            MODEL ONLINE
          </span>
        </div>

        {/* Live Payload Inference Test Bar */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-slate-300">
            Test Live Payload Against ML Feature Extractor:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              className="flex-1 px-4 py-2 rounded-2xl bg-obsidian-950/80 border border-cyanteal-500/30 text-xs font-mono text-cream-200 focus:outline-none focus:border-iceteal-300"
              placeholder="Enter raw payload or SQLi string..."
            />
            <button
              onClick={handleRunMlTest}
              disabled={testing}
              className="px-5 py-2 rounded-2xl bg-copper-500 hover:bg-copper-400 text-cream-100 text-xs font-bold shadow-glow-copper flex items-center justify-center space-x-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{testing ? 'Analyzing...' : 'Run ML Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Inference Diagnostics Result */}
        {mlInferenceResult && (
          <div className="p-4 rounded-2xl bg-obsidian-950/90 border border-cyanteal-500/30 font-mono text-xs space-y-2">
            <div className="flex justify-between items-center text-[11px] border-b border-white/10 pb-2">
              <span className="text-slate-400">Predicted Class:</span>
              <span className="font-bold text-copper-300 uppercase">
                {mlInferenceResult.prediction} (Confidence: {(mlInferenceResult.confidence * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Top Active Decision Tree Features:
            </div>
            <div className="flex flex-wrap gap-2">
              {mlInferenceResult.top_features?.map((f: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-deepteal-700/60 text-iceteal-300 text-[10px]">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
