import React, { useState, useEffect } from 'react';
import { 
  Sliders, User, ShieldCheck, Bell, Key, 
  Palette, Info, Save, Send, QrCode, Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useMode } from '../context/ModeContext';
import api from '../services/api';

export const Settings: React.FC = () => {
  const { t } = useLanguage();
  const { dashboardMode, setDashboardMode } = useMode();

  const [activeTab, setActiveTab] = useState<'general' | 'profile' | 'security' | 'notifications' | 'apikeys' | 'about'>('general');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // General Settings State
  const [projectName, setProjectName] = useState('PatchShield');
  const [defaultMode, setDefaultMode] = useState('PROTECT');
  const [rollbackThreshold, setRollbackThreshold] = useState(0.05);

  // Notification State
  const [tgToken, setTgToken] = useState('');
  const [tgChatId, setTgChatId] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpUser, setSmtpUser] = useState('');

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // 2FA State
  const [totpSecret, setTotpSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpSuccess, setTotpSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings/');
        setProjectName(res.data.project_name || 'PatchShield');
        setDefaultMode(res.data.default_security_mode || 'PROTECT');
        setRollbackThreshold(res.data.auto_rollback_threshold || 0.05);
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings/general', {
        project_name: projectName,
        default_security_mode: defaultMode,
        auto_rollback_threshold: parseFloat(String(rollbackThreshold)),
        offline_mode: true
      });
      setSaveMessage('General settings updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings/notifications', {
        telegram_bot_token: tgToken,
        telegram_chat_id: tgChatId,
        smtp_host: smtpHost,
        smtp_user: smtpUser
      });
      setSaveMessage('Notification settings updated!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      alert("Failed to save notifications");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      });
      alert("Password changed successfully!");
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to change password");
    }
  };

  const handleSetupTotp = async () => {
    try {
      const res = await api.post('/auth/totp/setup');
      setTotpSecret(res.data.secret);
    } catch (err) {
      alert("Failed to setup 2FA");
    }
  };

  const handleVerifyTotp = async () => {
    try {
      await api.post('/auth/totp/verify', { code: totpCode });
      setTotpSuccess(true);
      alert("2FA successfully enabled!");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Invalid 2FA code");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t('settings.title')}
        </h2>
        <p className="text-xs text-slate-500">Configure gateway behavior, alerts, and administrator security.</p>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs font-semibold flex items-center">
          <Check className="w-4 h-4 mr-2" />
          {saveMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 text-xs font-semibold">
        {[
          { key: 'general', label: t('settings.tabs.general'), icon: Sliders },
          { key: 'profile', label: t('settings.tabs.profile'), icon: User },
          { key: 'security', label: t('settings.tabs.security'), icon: ShieldCheck },
          { key: 'notifications', label: t('settings.tabs.notifications'), icon: Bell },
          { key: 'apikeys', label: t('settings.tabs.apiKeys'), icon: Key },
          { key: 'about', label: t('settings.tabs.about'), icon: Info },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 py-3 border-b-2 transition ${
                isActive
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General */}
      {activeTab === 'general' && (
        <div className="max-w-2xl space-y-6 text-xs">
          {/* Dashboard Experience Mode Selector */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-champagne-300">
                Dashboard Experience Mode
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between the simple merchant store view and advanced SecOps command deck.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Simple Mode Card */}
              <div
                onClick={() => setDashboardMode('simple')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  dashboardMode === 'simple'
                    ? 'bg-copper-500/10 border-copper-500 ring-2 ring-copper-500/30 text-copper-900 dark:text-copper-200 shadow-sm'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🏪</span>
                    <span className="font-bold text-xs">Simple (Shopkeeper)</span>
                  </div>
                  {dashboardMode === 'simple' && <Check className="w-4 h-4 text-copper-600 dark:text-copper-400" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Clean, merchant-friendly view for retail shop owners. Plain words, zero technical jargon.
                </p>
              </div>

              {/* Advanced Mode Card */}
              <div
                onClick={() => setDashboardMode('advanced')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  dashboardMode === 'advanced'
                    ? 'bg-teal-500/10 border-teal-500 ring-2 ring-teal-500/30 text-teal-900 dark:text-teal-200 shadow-sm'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">⚡</span>
                    <span className="font-bold text-xs">Advanced (SecOps)</span>
                  </div>
                  {dashboardMode === 'advanced' && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Complete SecOps telemetry, 20 attack defense modules, AST ReDoS engine & kernel drops.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveGeneral} className="space-y-4">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Default Global Security Mode</label>
            <select
              value={defaultMode}
              onChange={(e) => setDefaultMode(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="PROTECT">Protect (Virtual Patches Enforced)</option>
              <option value="MONITOR">Monitor Only (Log Only)</option>
              <option value="STRICT">Strict (Zero Tolerance)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Prove-then-Patch Auto-Rollback Threshold (FP Rate)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="0.5"
              value={rollbackThreshold}
              onChange={(e) => setRollbackThreshold(parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
            <p className="text-[11px] text-slate-500 mt-1">If false block rate exceeds {(rollbackThreshold * 100).toFixed(0)}%, rule automatically drops back to Shadow Mode.</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold shadow-md transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : t('settings.save')}</span>
          </button>
        </form>
      </div>
      )}

      {/* Tab 2: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleChangePassword} className="max-w-xl space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">New Secure Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold shadow-md transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Update Password</span>
          </button>
        </form>
      )}

      {/* Tab 3: Security 2FA */}
      {activeTab === 'security' && (
        <div className="max-w-xl space-y-4 text-xs">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
              <QrCode className="w-4 h-4 mr-2 text-indigo-500" />
              Two-Factor Authentication (TOTP Authenticator)
            </h3>
            <p className="text-slate-500">Protect administrator access using Google Authenticator or 1Password.</p>

            {!totpSecret ? (
              <button
                type="button"
                onClick={handleSetupTotp}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition"
              >
                Generate 2FA Secret Key
              </button>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-xs">
                  Secret: <span className="font-bold text-brand-400">{totpSecret}</span>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyTotp}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold"
                  >
                    Confirm & Enable
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Notifications (Telegram, Email) */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveNotifications} className="max-w-xl space-y-4 text-xs">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
              <Send className="w-4 h-4 mr-2 text-sky-500" />
              Telegram Instant Alerts (Tamil & English)
            </h3>
            <p className="text-slate-500">Receive instant mobile notifications whenever an attack is blocked or an agent proposes a patch.</p>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Telegram Bot Token</label>
              <input
                type="text"
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={tgToken}
                onChange={(e) => setTgToken(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Telegram Chat ID</label>
              <input
                type="text"
                placeholder="987654321"
                value={tgChatId}
                onChange={(e) => setTgChatId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold shadow-md transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Notifications</span>
          </button>
        </form>
      )}

      {/* Tab 5: API Keys */}
      {activeTab === 'apikeys' && (
        <div className="max-w-xl space-y-4 text-xs">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
              <Key className="w-4 h-4 mr-2 text-amber-500" />
              Developer API Keys
            </h3>
            <p className="text-slate-500">Access the PatchShield Gateway REST API programmatically.</p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-[11px] text-slate-400">
              Production Key: ps_live_7a89b4f028e1... (Full Access)
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: About */}
      {activeTab === 'about' && (
        <div className="max-w-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            PatchShield v1.0.0
          </h3>
          <p className="text-slate-500">
            Nasscom ARB 2.0 (Problem Statement 5: AI-Era Virtual Patching for Indian SMBs).
          </p>
          <div className="pt-2 text-[11px] text-slate-400 space-y-1">
            <p>&bull; Engine: FastAPI + SQLite + Reverse Proxy</p>
            <p>&bull; ML Subsystem: 23-Feature Random Forest + IsoForest</p>
            <p>&bull; Pipeline: 6-Stage Prove-then-Patch Verification</p>
          </div>
        </div>
      )}
    </div>
  );
};
