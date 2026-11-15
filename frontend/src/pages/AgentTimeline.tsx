import React, { useState, useEffect } from 'react';
import { 
  Bot, CheckCircle2, AlertTriangle, ShieldCheck, Play, 
  ArrowRight, Sparkles, UserCheck, Clock, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

interface AgentAction {
  id: string;
  timestamp: string;
  phase: string;
  observation: string;
  reasoning: string;
  proposed_action: string;
  status: string;
  approved_by?: string;
  explanation_en: string;
  explanation_ta: string;
}

interface Site {
  id: string;
  name: string;
}

export const AgentTimeline: React.FC = () => {
  const { language, t } = useLanguage();
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [runningCycle, setRunningCycle] = useState(false);

  useEffect(() => {
    fetchSites();
    fetchTimeline();
  }, []);

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

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const res = await api.get('/agent/timeline');
      setActions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAgentCycle = async () => {
    if (!selectedSiteId) return;
    setRunningCycle(true);
    try {
      const res = await api.post(`/agent/run-cycle/${selectedSiteId}`);
      alert(`Agent OODA cycle executed: Synthesized ${res.data.actions_executed} virtual patch actions.`);
      fetchTimeline();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Agent cycle failed");
    } finally {
      setRunningCycle(false);
    }
  };

  const handleApprove = async (actionId: string) => {
    try {
      await api.post(`/agent/approve/${actionId}`);
      alert("Agent action approved by owner!");
      fetchTimeline();
    } catch (err) {
      alert("Approval failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <Bot className="w-5 h-5 mr-2 text-indigo-500" />
            {t('nav.agent')} Timeline & Autonomous Reasoning
          </h2>
          <p className="text-xs text-slate-500">
            Autonomous Observe &rarr; Decide &rarr; Act &rarr; Report loop with human-in-the-loop guardrails.
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
            onClick={handleRunAgentCycle}
            disabled={runningCycle}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Sparkles className={`w-3.5 h-3.5 ${runningCycle ? 'animate-spin' : ''}`} />
            <span>{runningCycle ? 'Observing...' : 'Trigger Agent OODA Cycle'}</span>
          </button>
        </div>
      </div>

      {/* Guardrail Banner */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="font-bold text-indigo-400">Agent Safety Guardrails Armed</span>
          <p className="text-slate-400">
            Stage 5 Full-Enforcement requires owner approval. Auto-rollback armed if false-block rate crosses 5%.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          HUMAN-IN-THE-LOOP ACTIVE
        </span>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading autonomous agent timeline...</div>
      ) : actions.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Bot className="w-10 h-10 text-indigo-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Agent Actions Recorded Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Trigger Agent OODA Cycle" above to have the agent observe your stack, discover exposed CVEs, and synthesize virtual patches.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map((act) => (
            <div
              key={act.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    OODA: {act.phase}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {new Date(act.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    act.status.includes('APPROVED')
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {act.status}
                  </span>

                  {act.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => handleApprove(act.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Approve Full Enforce</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Reasoning & Observation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Observation:</span>
                  <p className="text-slate-800 dark:text-slate-200">{act.observation}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">AI Reasoning ("Why"):</span>
                  <p className="text-slate-800 dark:text-slate-200">{act.reasoning}</p>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-3 bg-brand-500/5 dark:bg-slate-800/40 border border-brand-500/20 rounded-2xl">
                <p className="text-slate-800 dark:text-slate-200 text-xs font-medium">
                  {act.explanation_en}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
