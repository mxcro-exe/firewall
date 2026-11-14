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
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 dark:border-cyanteal-500/20 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-champagne-200">
            {t('nav.traffic')} Stream & Replay Log
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-iceteal-300/80">
            Real-time sanitized gateway telemetry (tokens and credentials stripped).
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <label className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-copper-600 focus:ring-copper-500 bg-white dark:bg-obsidian-950 border-slate-300 dark:border-cyanteal-500/30"
            />
            <span className="text-[11px]">Auto-Refresh (5s)</span>
          </label>

          <button
            onClick={fetchTraffic}
            disabled={loading}
            className="flex items-center space-x-1 px-2.5 py-1 glass-panel hover:bg-slate-100 dark:hover:bg-deepteal-700/40 text-slate-700 dark:text-champagne-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-cyanteal-500/30 transition shadow-xs"
          >
            <RefreshCw className={`w-3 h-3 text-copper-600 dark:text-copper-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action Filter Pills */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        {['ALL', 'ENFORCE_BLOCKED', 'CANARY_BLOCKED', 'SHADOW_LOGGED', 'PASSED'].map((act) => (
          <button
            key={act}
            onClick={() => setFilterAction(act)}
            className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition ${
              filterAction === act
                ? 'bg-copper-600 text-white font-bold shadow-xs border border-copper-700'
                : 'glass-panel border-slate-200 dark:border-cyanteal-500/25 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-champagne-200'
            }`}
          >
            {act}
          </button>
        ))}
      </div>

      {/* Traffic Table */}
      <div className="glass-panel border border-slate-200 dark:border-cyanteal-500/30 rounded-xl overflow-hidden shadow-xs dark:shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-deepteal-700/40 border-b border-slate-200 dark:border-cyanteal-500/25 text-[10px] text-slate-600 dark:text-iceteal-300 uppercase font-bold">
              <tr>
                <th className="p-2 sm:p-2.5">Time</th>
                <th className="p-2 sm:p-2.5">Client IP</th>
                <th className="p-2 sm:p-2.5">Method</th>
                <th className="p-2 sm:p-2.5">Path</th>
                <th className="p-2 sm:p-2.5">Sanitized Query / Payload</th>
                <th className="p-2 sm:p-2.5">Action</th>
                <th className="p-2 sm:p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-cyanteal-500/15 text-slate-700 dark:text-slate-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 font-sans text-xs">
                    No traffic matching the selected filter. Send requests to port 8000 to observe telemetry.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-deepteal-700/25 font-mono text-[11px] transition-colors">
                    <td className="p-2 sm:p-2.5 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-2 sm:p-2.5 text-slate-600 dark:text-iceteal-300/80">{log.client_ip}</td>
                    <td className="p-2 sm:p-2.5">
                      <span className="font-bold text-slate-900 dark:text-champagne-200">{log.method}</span>
                    </td>
                    <td className="p-2 sm:p-2.5 text-slate-800 dark:text-iceteal-300 truncate max-w-xs">{log.path}</td>
                    <td className="p-2 sm:p-2.5 text-slate-500 dark:text-slate-400 truncate max-w-sm">
                      {log.query_params_sanitized ? `?${log.query_params_sanitized}` : (log.body_sanitized || '-')}
                    </td>
                    <td className="p-2 sm:p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        log.rule_action.includes('BLOCKED')
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-copper-500/20 dark:text-copper-300 dark:border-copper-500/40'
                          : log.rule_action.includes('SHADOW')
                          ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-deepteal-700/60 dark:text-iceteal-200 dark:border-iceteal-300/30'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emeraldink-900/60 dark:text-iceteal-200 dark:border-iceteal-300/30'
                      }`}>
                        {log.rule_action}
                      </span>
                    </td>
                    <td className="p-2 sm:p-2.5">
                      <span className={`font-bold ${log.response_status === 403 ? 'text-rose-600 dark:text-copper-400' : 'text-emerald-600 dark:text-iceteal-300'}`}>
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
