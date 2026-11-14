import React, { useState, useEffect } from 'react';
import { 
  GitCompare, Play, CheckCircle2, AlertTriangle, RotateCcw, 
  ShieldCheck, FileCode, ArrowRight, Eye, RefreshCw, Terminal, Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

interface Rule {
  id: string;
  name: string;
  cve_id?: string;
  endpoint_path: string;
  status: string;
  version: number;
}

interface ProofEvidence {
  id: string;
  stage: string;
  status: string;
  exploit_evidence?: string;
  replay_fp_rate?: number;
  run_log?: string;
  completed_at: string;
}

export const ProvePatch: React.FC = () => {
  const { language, t } = useLanguage();

  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [evidenceList, setEvidenceList] = useState<ProofEvidence[]>([]);
  const [targetStage, setTargetStage] = useState<string>('ENFORCED');

  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    if (selectedRuleId) {
      fetchEvidence(selectedRuleId);
    }
  }, [selectedRuleId]);

  const fetchRules = async () => {
    try {
      const res = await api.get('/rules/');
      setRules(res.data);
      if (res.data.length > 0) {
        setSelectedRuleId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvidence = async (ruleId: string) => {
    try {
      const res = await api.get(`/prove-patch/${ruleId}/evidence`);
      setEvidenceList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunPipeline = async () => {
    if (!selectedRuleId) return;
    setRunning(true);
    setRunResult(null);

    try {
      const res = await api.post(`/prove-patch/${selectedRuleId}/run`, {
        advance_to_stage: targetStage
      });
      setRunResult(res.data);
      fetchRules();
      fetchEvidence(selectedRuleId);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Pipeline execution failed");
    } finally {
      setRunning(false);
    }
  };

  const handleRollback = async () => {
    if (!selectedRuleId) return;
    try {
      await api.post(`/prove-patch/${selectedRuleId}/rollback`, {
        reason: "Manual operator safety rollback"
      });
      fetchRules();
      fetchEvidence(selectedRuleId);
    } catch (err) {
      alert("Rollback failed");
    }
  };

  const selectedRule = rules.find(r => r.id === selectedRuleId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('nav.provePatch')}
          </h2>
          <p className="text-xs text-slate-500">
            Automated 6-stage Exploit Verification, Legitimate Traffic Replay & Canary Controller.
          </p>
        </div>

        {/* Rule Selector */}
        {rules.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Select Virtual Patch:</span>
            <select
              value={selectedRuleId}
              onChange={(e) => setSelectedRuleId(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              {rules.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stepper Banner */}
      {selectedRule ? (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedRule.name}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20">
                  {selectedRule.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Target Endpoint: {selectedRule.endpoint_path}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={targetStage}
                onChange={(e) => setTargetStage(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="ENFORCED">Target: Full Enforce (100%)</option>
                <option value="CANARY">Target: Canary Mode (5%)</option>
                <option value="SHADOW">Target: Shadow Mode (Log Only)</option>
              </select>

              <button
                onClick={handleRunPipeline}
                disabled={running}
                className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                <Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
                <span>{running ? 'Verifying...' : 'Run Prove-then-Patch'}</span>
              </button>

              <button
                onClick={handleRollback}
                className="p-2 text-amber-400 hover:text-amber-300 rounded-xl border border-amber-500/30 hover:bg-amber-500/10 transition"
                title="Rollback to Shadow Mode"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual 6-Stage Progress Stepper */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              {
                id: 'STAGE_1_EXPLOIT',
                label: 'Stage 1',
                title: 'Sandbox Exploit',
                desc: 'Must block safe POC payloads',
                activeStatuses: ['SANDBOX_OK', 'SHADOW', 'CANARY', 'ENFORCED']
              },
              {
                id: 'STAGE_2_REPLAY',
                label: 'Stage 2',
                title: 'Traffic Replay FP',
                desc: '0% False Blocks on benign traffic',
                activeStatuses: ['SHADOW', 'CANARY', 'ENFORCED']
              },
              {
                id: 'STAGE_3_SHADOW',
                label: 'Stage 3',
                title: 'Shadow Mode',
                desc: 'Passive live log evaluation',
                activeStatuses: ['SHADOW', 'CANARY', 'ENFORCED']
              },
              {
                id: 'STAGE_4_CANARY',
                label: 'Stage 4',
                title: 'Canary (5%)',
                desc: 'Controlled traffic test',
                activeStatuses: ['CANARY', 'ENFORCED']
              },
              {
                id: 'STAGE_5_ENFORCE',
                label: 'Stage 5',
                title: 'Full Enforce',
                desc: 'Active blocking + Auto-Rollback',
                activeStatuses: ['ENFORCED']
              },
              {
                id: 'STAGE_6_RETIRE',
                label: 'Stage 6',
                title: 'Auto-Retire',
                desc: 'Retires when patch installed',
                activeStatuses: ['RETIRED']
              },
            ].map((st, idx) => {
              const isPassed = st.activeStatuses.includes(selectedRule.status);
              return (
                <div
                  key={st.id}
                  className={`p-3.5 rounded-2xl border transition text-center space-y-1.5 ${
                    isPassed
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider">{st.label}</span>
                    {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{st.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">{st.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Live Run Output Notice */}
          {runResult && (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              runResult.status === 'SUCCESS'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <div className="flex items-center space-x-2 font-bold">
                {runResult.status === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>
                  {runResult.status === 'SUCCESS'
                    ? 'All Prove-then-Patch stages passed! Rule promoted to ' + runResult.current_rule_status
                    : 'Verification Failed: ' + runResult.message}
                </span>
              </div>
            </div>
          )}

          {/* Evidence Logs Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center">
              <Terminal className="w-4 h-4 mr-1.5 text-brand-500" />
              Proof Evidence & Execution Log
            </h4>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden font-mono text-[11px]">
              {evidenceList.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  No proof run logs recorded yet. Click "Run Prove-then-Patch" to generate live verification evidence.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800/80 p-3 space-y-2">
                  {evidenceList.map((e) => (
                    <div key={e.id} className="py-2 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-brand-400">{e.stage}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          e.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {e.status}
                        </span>
                      </div>
                      <p className="text-slate-300">{e.run_log}</p>
                      {e.exploit_evidence && (
                        <pre className="text-[10px] text-slate-400 bg-slate-900 p-2 rounded-lg overflow-x-auto">
                          {e.exploit_evidence}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500">Please select or create a virtual patch rule to run proof verification.</p>
        </div>
      )}
    </div>
  );
};
