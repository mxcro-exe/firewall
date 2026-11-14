import React, { useEffect, useState } from 'react';
import { History, Download, Filter, User, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

interface AuditEntry {
  id: number;
  actor: string;
  role: string;
  action: string;
  target_entity: string;
  details: string;
  ip_address: string;
  timestamp: string;
}

export const AuditLog: React.FC = () => {
  const { language, t } = useLanguage();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit/?limit=50');
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const exportCSV = () => {
    if (!logs.length) return;
    const headers = ['ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Entity', 'Details'];
    const rows = logs.map(l => [
      l.id,
      l.timestamp,
      l.actor,
      l.role,
      l.action,
      l.target_entity,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `patchshield_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('nav.auditLog')}
          </h2>
          <p className="text-xs text-slate-500">Immutable ledger of all administrative & agent actions.</p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Actor / Role</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">Loading audit log records...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">No audit records recorded yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900 dark:text-white">{log.actor}</span>
                      <span className="ml-1 text-[9px] px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                        {log.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-500/10 text-brand-500 border border-brand-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-600 dark:text-slate-400">
                      {log.target_entity}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500 truncate max-w-xs">
                      {log.details || '-'}
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
