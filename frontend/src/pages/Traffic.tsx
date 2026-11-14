import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Filter, ShieldCheck, ShieldAlert, Eye, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

interface TrafficEntry {
  id: number;
  site_id: string;
  timestamp: string;
  client_ip: string;
  method: string;
  path: string;
  query_params_sanitized: string;
  body_sanitized: string;
  rule_action: string;
  matched_rule_id?: string;
  response_status: number;
}

export const Traffic: React.FC = () => {
  const { language, t } = useLanguage();
  const [logs, setLogs] = useState<TrafficEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchTraffic = async () => {
    try {
      setLoading(true);
      const url = filterAction === 'ALL' ? '/traffic/?limit=100' : `/traffic/?action=${filterAction}&limit=100`;
      const res = await api.get(url);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraffic();
  }, [filterAction]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTraffic();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, filterAction]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('nav.traffic')} Stream & Replay Log
          </h2>
          <p className="text-xs text-slate-500">
            Real-time sanitized gateway telemetry (tokens and credentials stripped).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <span>Auto-Refresh (5s)</span>
          </label>

          <button
            onClick={fetchTraffic}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action Filter Pills */}
      <div className="flex flex-wrap gap-2 text-xs">
        {['ALL', 'ENFORCE_BLOCKED', 'CANARY_BLOCKED', 'SHADOW_LOGGED', 'PASSED'].map((act) => (
          <button
            key={act}
            onClick={() => setFilterAction(act)}
            className={`px-3 py-1 rounded-xl font-semibold transition ${
              filterAction === act
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {act}
          </button>
        ))}
      </div>

      {/* Traffic Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Client IP</th>
                <th className="p-3">Method</th>
                <th className="p-3">Path</th>
                <th className="p-3">Sanitized Query / Payload</th>
                <th className="p-3">Action</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No traffic matching the selected filter. Send requests to port 8000 to observe telemetry.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 font-mono text-[11px]">
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3 text-slate-400">{log.client_ip}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 dark:text-white">{log.method}</span>
                    </td>
                    <td className="p-3 text-brand-400 truncate max-w-xs">{log.path}</td>
                    <td className="p-3 text-slate-500 truncate max-w-sm">
                      {log.query_params_sanitized ? `?${log.query_params_sanitized}` : (log.body_sanitized || '-')}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        log.rule_action.includes('BLOCKED')
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                          : log.rule_action.includes('SHADOW')
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      }`}>
                        {log.rule_action}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${log.response_status === 403 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {log.response_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
