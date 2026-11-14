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
  title_hi?: string;
  message_en: string;
  message_ta: string;
  message_hi?: string;
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

  const getAlertTitle = (al: AlertItem) => {
    if (language === 'ta') return al.title_ta || al.title_en;
    if (language === 'hi') return al.title_hi || al.title_en;
    return al.title_en;
  };

  const getAlertMessage = (al: AlertItem) => {
    if (language === 'ta') return al.message_ta || al.message_en;
    if (language === 'hi') return al.message_hi || al.message_en;
    return al.message_en;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('alerts.title')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('alerts.subtitle')}
          </p>
        </div>

        <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded text-brand-600 focus:ring-brand-500"
          />
          <span>{language === 'ta' ? 'படிக்காதவை மட்டும்' : language === 'hi' ? 'केवल न पढ़े गए' : 'Show Unread Only'}</span>
        </label>
      </div>

      {/* Telegram Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">
              {language === 'ta' ? 'டெலிகிராம் நேரலை அறிவிப்பான்' : language === 'hi' ? 'टेलीग्राम लाइव अलर्ट प्रेषक' : 'Telegram Alerts Dispatcher'}
            </p>
            <p className="text-slate-500">
              {language === 'ta' 
                ? 'தாக்குதல் முறியடிக்கப்படும் போது வணிகர்களுக்கு உடனடி மொபைல் அறிவிப்பு அனுப்பப்படுகிறது.'
                : language === 'hi'
                ? 'हमले को विफल किए जाने पर व्यवसायियों को तुरंत मोबाइल सूचना भेजी जाती है।'
                : 'Instant mobile push alerts for shopkeepers whenever an attack is repelled in Tamil, Hindi & English.'}
            </p>
          </div>
        </div>
        <a
          href="/settings"
          className="text-xs text-brand-500 hover:text-brand-400 font-semibold flex items-center"
        >
          {language === 'ta' ? 'அமைப்புகளில் டெலிகிராம் இணைக்கவும் →' : language === 'hi' ? 'सेटिंग्स में टेलीग्राम कॉन्फ़िगर करें →' : 'Configure Telegram in Settings →'}
        </a>
      </div>

      {/* Alerts Stream */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">{t('common.loading')}</div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {language === 'ta' ? 'அனைத்து அமைப்புகளும் பாதுகாப்பாக உள்ளன' : language === 'hi' ? 'सभी प्रणालियाँ सुरक्षित हैं' : 'All Systems Secure'}
          </h3>
          <p className="text-xs text-slate-500">{t('alerts.empty')}</p>
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
                    {getAlertTitle(al)}
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
                      <span>{t('alerts.markRead')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Actionable Explanation */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {getAlertMessage(al)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
