import React, { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle2, AlertTriangle, ShieldAlert, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

interface AlertItem {
  id: string;
  site_id?: string;
  severity: string;
  title_en: string;
  title_ta: string;
  message_en: string;
  message_ta: string;
  channel: string;
  is_read: boolean;
  created_at: string;
}

export const Alerts: React.FC = () => {
  const { language, t } = useLanguage();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const url = unreadOnly ? '/alerts/?unread_only=true' : '/alerts/';
      const res = await api.get(url);
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [unreadOnly]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/alerts/${id}/read`);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('nav.alerts')} & Mobile Notifications
          </h2>
          <p className="text-xs text-slate-500">
            Jargon-free alerts delivered across Telegram, Email, and In-App in Tamil & English.
          </p>
        </div>

        <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded text-brand-600 focus:ring-brand-500"
          />
          <span>Show Unread Only</span>
        </label>
      </div>

      {/* Telegram Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Telegram Alerts Dispatcher</p>
            <p className="text-slate-500">Instant mobile push alerts for shopkeepers whenever an attack is repelled.</p>
          </div>
        </div>
        <a
          href="/settings"
          className="text-xs text-brand-500 hover:text-brand-400 font-semibold flex items-center"
        >
          Configure Telegram Bot in Settings &rarr;
        </a>
      </div>

      {/* Alerts Stream */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">All Systems Secure</h3>
          <p className="text-xs text-slate-500">No security alerts or unpatched attacks detected.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((al) => (
            <div
              key={al.id}
              className={`p-5 rounded-3xl border transition space-y-3 ${
                !al.is_read
                  ? 'bg-white dark:bg-slate-900 border-brand-500/40 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    al.severity === 'CRITICAL'
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 font-mono'
                      : al.severity === 'HIGH'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 font-mono'
                      : 'bg-brand-500/10 text-brand-400 border-brand-500/30 font-mono'
                  }`}>
                    {al.severity}
                  </span>

                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {language === 'ta' ? al.title_ta : al.title_en}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="font-mono text-[11px]">{new Date(al.created_at).toLocaleString()}</span>
                  {!al.is_read && (
                    <button
                      onClick={() => handleMarkRead(al.id)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Read</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Message side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">English:</span>
                  <p>{al.message_en}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">தமிழ்:</span>
                  <p>{al.message_ta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
