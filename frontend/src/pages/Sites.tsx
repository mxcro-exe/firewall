import React, { useEffect, useState } from 'react';
import { 
  Globe, Plus, ShieldCheck, ShieldAlert, Eye, 
  ExternalLink, AlertTriangle, CheckCircle2, Trash2, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

interface Site {
  id: string;
  name: string;
  domain_or_host: string;
  upstream_url: string;
  listen_port: number;
  security_mode: 'MONITOR' | 'PROTECT' | 'STRICT';
  health_score: number;
  bypass_detected: boolean;
  is_active: boolean;
  created_at: string;
}

export const Sites: React.FC = () => {
  const { language, t } = useLanguage();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [checkingBypassId, setCheckingBypassId] = useState<string | null>(null);

  // Form State
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newUpstream, setNewUpstream] = useState('');
  const [newMode, setNewMode] = useState<'MONITOR' | 'PROTECT' | 'STRICT'>('PROTECT');

  const fetchSites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sites/');
      setSites(res.data);
    } catch (err) {
      console.error("Failed to fetch sites", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sites/', {
        name: newName,
        domain_or_host: newDomain,
        upstream_url: newUpstream,
        security_mode: newMode,
        listen_port: 8000
      });
      setShowAddModal(false);
      setNewName('');
      setNewDomain('');
      setNewUpstream('');
      fetchSites();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create site");
    }
  };

  const handleToggleMode = async (siteId: string, currentMode: string) => {
    const nextModeMap: Record<string, string> = {
      MONITOR: 'PROTECT',
      PROTECT: 'STRICT',
      STRICT: 'MONITOR'
    };
    const nextMode = nextModeMap[currentMode] || 'PROTECT';
    try {
      await api.patch(`/sites/${siteId}/mode`, { security_mode: nextMode });
      fetchSites();
    } catch (err) {
      console.error("Failed to update site mode", err);
    }
  };

  const handleCheckBypass = async (siteId: string) => {
    try {
      setCheckingBypassId(siteId);
      const res = await api.post(`/sites/${siteId}/check-bypass`);
      alert(res.data.recommendation);
      fetchSites();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Bypass check failed");
    } finally {
      setCheckingBypassId(null);
    }
  };

  const handleDeleteSite = async (siteId: string, siteName: string) => {
    if (!confirm(`Are you sure you want to remove ${siteName}?`)) return;
    try {
      await api.delete(`/sites/${siteId}`);
      fetchSites();
    } catch (err) {
      console.error("Failed to delete site", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('sites.title')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('sites.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t('sites.addSite')}</span>
        </button>
      </div>

      {/* Sites Grid / Cards */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading protected sites...</div>
      ) : sites.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Globe className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No protected sites registered</h3>
          <p className="text-xs text-slate-500">Add your web store, API backend, or billing server to start virtual patching.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sites.map((site) => (
            <div
              key={site.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Title & Delete */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
                      <Globe className="w-4 h-4 mr-1.5 text-brand-500" />
                      {site.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500">{site.domain_or_host}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSite(site.id, site.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    title="Remove site"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Upstream Target:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px] truncate max-w-[150px]">
                      {site.upstream_url}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Health Score:</span>
                    <span className="font-bold text-emerald-500 text-[11px]">
                      {site.health_score}/100 (Grade A)
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Security Mode:</span>
                    <button
                      onClick={() => handleToggleMode(site.id, site.security_mode)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border transition ${
                        site.security_mode === 'STRICT'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                          : site.security_mode === 'PROTECT'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                      }`}
                      title="Click to toggle mode"
                    >
                      {site.security_mode} &harr;
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Direct Bypass:</span>
                    {site.bypass_detected ? (
                      <span className="flex items-center text-[10px] text-rose-500 font-semibold">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Exposed!
                      </span>
                    ) : (
                      <span className="flex items-center text-[10px] text-emerald-500 font-semibold">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Shielded
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleCheckBypass(site.id)}
                  disabled={checkingBypassId === site.id}
                  className="flex items-center space-x-1.5 text-xs text-brand-500 hover:text-brand-400 font-medium transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checkingBypassId === site.id ? 'animate-spin' : ''}`} />
                  <span>{checkingBypassId === site.id ? 'Checking...' : t('sites.checkBypass')}</span>
                </button>

                <a
                  href={`http://localhost:8000/proxy/${site.id}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  <span>Gateway Link</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Site Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('sites.addSite')}
            </h3>

            <form onSubmit={handleCreateSite} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('sites.siteName')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Online Store"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('sites.domain')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. store.local or localhost"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('sites.upstream')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. http://127.0.0.1:9000"
                  value={newUpstream}
                  onChange={(e) => setNewUpstream(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Initial Security Mode
                </label>
                <select
                  value={newMode}
                  onChange={(e: any) => setNewMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="PROTECT">Protect (Active Blocking)</option>
                  <option value="MONITOR">Monitor Only (Log Only)</option>
                  <option value="STRICT">Strict (Zero Tolerance)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-md transition"
                >
                  Save Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
