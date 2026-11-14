import React, { useState, useEffect } from 'react';
import { 
  FileCode, Plus, CheckCircle2, AlertTriangle, RotateCcw, 
  Trash2, ShieldCheck, Zap, ArrowRight, Play, Eye
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

interface Rule {
  id: string;
  name: string;
  cve_id?: string;
  site_id: string;
  http_method: string;
  endpoint_path: string;
  target_param?: string;
  pattern_type: string;
  pattern_value: string;
  status: 'DRAFT' | 'SANDBOX_OK' | 'SHADOW' | 'CANARY' | 'ENFORCED' | 'RETIRED';
  version: number;
  explanation_en: string;
  explanation_ta: string;
  is_active: boolean;
  created_at: string;
}

interface Site {
  id: string;
  name: string;
}

export const Rules: React.FC = () => {
  const { language, t } = useLanguage();

  const [rules, setRules] = useState<Rule[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal Form State
  const [templates, setTemplates] = useState<any>({});
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [ruleName, setRuleName] = useState('');
  const [cveId, setCveId] = useState('');
  const [httpMethod, setHttpMethod] = useState('ANY');
  const [endpointPath, setEndpointPath] = useState('');
  const [targetParam, setTargetParam] = useState('');
  const [patternValue, setPatternValue] = useState('');
  const [explEn, setExplEn] = useState('');
  const [explTa, setExplTa] = useState('');

  useEffect(() => {
    fetchSites();
    fetchTemplates();
  }, []);

  useEffect(() => {
    fetchRules(selectedSiteId);
  }, [selectedSiteId]);

  const fetchSites = async () => {
    try {
      const res = await api.get('/sites/');
      setSites(res.data);
      if (res.data.length > 0) {
        setSelectedSiteId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/rules/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRules = async (siteId: string) => {
    try {
      setLoading(true);
      const url = siteId ? `/rules/?site_id=${siteId}` : '/rules/';
      const res = await api.get(url);
      setRules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (tplKey: string) => {
    setSelectedTemplate(tplKey);
    const tpl = templates[tplKey];
    if (tpl) {
      setRuleName(tpl.name);
      setPatternValue(tpl.pattern_value);
      setExplEn(tpl.explanation_en);
      setExplTa(tpl.explanation_ta);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteId) return;

    try {
      await api.post('/rules/', {
        site_id: selectedSiteId,
        cve_id: cveId || null,
        name: ruleName,
        http_method: httpMethod,
        endpoint_path: endpointPath,
        target_param: targetParam || null,
        pattern_value: patternValue,
        explanation_en: explEn,
        explanation_ta: explTa
      });
      setShowAddModal(false);
      resetForm();
      fetchRules(selectedSiteId);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create rule");
    }
  };

  const resetForm = () => {
    setRuleName('');
    setCveId('');
    setHttpMethod('ANY');
    setEndpointPath('');
    setTargetParam('');
    setPatternValue('');
    setExplEn('');
    setExplTa('');
    setSelectedTemplate('');
  };

  const handleRollback = async (ruleId: string) => {
    if (!confirm("Are you sure you want to rollback this virtual patch back to Shadow mode?")) return;
    try {
      await api.post(`/prove-patch/${ruleId}/rollback`, { reason: "Operator manual rollback" });
      fetchRules(selectedSiteId);
    } catch (err) {
      alert("Rollback failed");
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Delete this rule?")) return;
    try {
      await api.delete(`/rules/${ruleId}`);
      fetchRules(selectedSiteId);
    } catch (err) {
      alert("Failed to delete rule");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('nav.rules')}
          </h2>
          <p className="text-xs text-slate-500">
            Scoped Virtual Patch Rules (Method + Endpoint + Parameter + Sanitized Pattern).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {sites.length > 0 && (
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Virtual Patch</span>
          </button>
        </div>
      </div>

      {/* Rules List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading virtual patch rules...</div>
      ) : rules.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <FileCode className="w-10 h-10 text-brand-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Virtual Patch Rules Configured</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first scoped virtual patch or auto-generate one from the Exposure Matching page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
                    <FileCode className="w-4 h-4 mr-1.5 text-brand-500" />
                    {rule.name}
                  </span>

                  {rule.cve_id && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                      {rule.cve_id}
                    </span>
                  )}

                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                    v{rule.version}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      rule.status === 'ENFORCED'
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                        : rule.status === 'CANARY'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        : rule.status === 'SHADOW'
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                        : rule.status === 'RETIRED'
                        ? 'bg-slate-500/10 text-slate-500 border-slate-500/30'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    }`}
                  >
                    {rule.status}
                  </span>

                  <a
                    href="/prove-patch"
                    className="flex items-center space-x-1 px-2.5 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    <Play className="w-3 h-3" />
                    <span>Prove & Deploy</span>
                  </a>

                  {(rule.status === 'ENFORCED' || rule.status === 'CANARY') && (
                    <button
                      onClick={() => handleRollback(rule.id)}
                      className="p-1.5 text-amber-400 hover:text-amber-300 rounded-lg border border-amber-500/30 hover:bg-amber-500/10 transition"
                      title="Rollback to Shadow Mode"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scope pill row */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  METHOD: <strong className="text-brand-400">{rule.http_method}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ENDPOINT: <strong className="text-emerald-400">{rule.endpoint_path}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  TARGET PARAM: <strong className="text-amber-400">{rule.target_param || 'ALL_PAYLOAD'}</strong>
                </span>
              </div>

              {/* Explanations */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-xs space-y-1">
                <p className="text-slate-800 dark:text-slate-200">
                  <strong>English:</strong> {rule.explanation_en}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>தமிழ்:</strong> {rule.explanation_ta}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Virtual Patch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create Scoped Virtual Patch Rule
            </h3>

            {/* Template Selector */}
            <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl space-y-1 text-xs">
              <label className="block font-bold text-brand-400">Choose Attack Defense Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              >
                <option value="">-- Custom Rule --</option>
                <option value="sqli">SQL Injection Shield</option>
                <option value="path_traversal">Path Traversal & Sensitive File Guard</option>
                <option value="xss">Cross-Site Scripting (XSS) Guard</option>
                <option value="cmd_injection">OS Command Injection Blocker</option>
                <option value="ssrf">Server-Side Request Forgery (SSRF)</option>
                <option value="file_upload">Malicious File Upload Blocker</option>
              </select>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Virtual Patch for Product Search SQLi"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">CVE ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. CVE-2023-38606"
                    value={cveId}
                    onChange={(e) => setCveId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">HTTP Method</label>
                  <select
                    value={httpMethod}
                    onChange={(e) => setHttpMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="ANY">ANY</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Endpoint Path</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /api/products"
                    value={endpointPath}
                    onChange={(e) => setEndpointPath(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Target Parameter</label>
                  <input
                    type="text"
                    placeholder="e.g. q (or leave empty for body)"
                    value={targetParam}
                    onChange={(e) => setTargetParam(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Pattern Value (Regex / AST Pattern)</label>
                <textarea
                  required
                  rows={2}
                  value={patternValue}
                  onChange={(e) => setPatternValue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Explanation (English)</label>
                <input
                  type="text"
                  value={explEn}
                  onChange={(e) => setExplEn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">விளக்கம் (தமிழ்)</label>
                <input
                  type="text"
                  value={explTa}
                  onChange={(e) => setExplTa(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-md"
                >
                  Save Draft Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
