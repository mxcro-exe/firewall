import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Database, Search, Filter, AlertTriangle, 
  CheckCircle2, HelpCircle, Upload, Plus, RefreshCw, Zap, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

interface CVEItem {
  cve_id: string;
  cvss_score: number;
  is_cisa_kev: boolean;
  epss_score: number;
  priority_score: number;
  description: string;
  affected_cpe: string;
  patch_guidance: string;
  published_date: string;
}

interface ExposureItem extends CVEItem {
  status: 'AFFECTED' | 'NOT_AFFECTED' | 'UNSURE';
  reason: string;
  matched_component?: string;
  matched_version?: string;
}

interface Site {
  id: string;
  name: string;
}

export const Vulnerabilities: React.FC = () => {
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'feed' | 'exposure' | 'inventory'>('exposure');
  const [cves, setCves] = useState<CVEItem[]>([]);
  const [exposureList, setExposureList] = useState<ExposureItem[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [inventory, setInventory] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [kevFilter, setKevFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Manual component modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [compName, setCompName] = useState('');
  const [compVersion, setCompVersion] = useState('');

  useEffect(() => {
    fetchSites();
    fetchCveFeed();
  }, []);

  useEffect(() => {
    if (selectedSiteId) {
      fetchExposure(selectedSiteId);
      fetchInventory(selectedSiteId);
    }
  }, [selectedSiteId]);

  const fetchSites = async () => {
    try {
      const res = await api.get('/sites/');
      setSites(res.data);
      if (res.data.length > 0) {
        setSelectedSiteId(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load sites", err);
    }
  };

  const fetchCveFeed = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cve/');
      setCves(res.data);
    } catch (err) {
      console.error("Failed to fetch CVE feed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExposure = async (siteId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/inventory/${siteId}/exposure`);
      setExposureList(res.data);
    } catch (err) {
      console.error("Failed to fetch exposure", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async (siteId: string) => {
    try {
      const res = await api.get(`/inventory/${siteId}`);
      setInventory(res.data);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    }
  };

  const handleScanHeaders = async () => {
    if (!selectedSiteId) return;
    setScanning(true);
    try {
      const res = await api.post(`/inventory/${selectedSiteId}/scan-headers`);
      alert(`Header scan complete: Detected ${res.data.detected_count} software components.`);
      fetchInventory(selectedSiteId);
      fetchExposure(selectedSiteId);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleUploadManifest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedSiteId) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/inventory/${selectedSiteId}/upload-manifest`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`Manifest parsed: ${res.data.packages_imported} packages imported!`);
      fetchInventory(selectedSiteId);
      fetchExposure(selectedSiteId);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Manifest upload failed");
    }
  };

  const handleAddManualComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteId) return;
    try {
      await api.post(`/inventory/${selectedSiteId}/manual`, {
        component_name: compName,
        version: compVersion
      });
      setShowAddModal(false);
      setCompName('');
      setCompVersion('');
      fetchInventory(selectedSiteId);
      fetchExposure(selectedSiteId);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to add component");
    }
  };

  const filteredCves = cves.filter(c => {
    const matchesSearch = c.cve_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKev = !kevFilter || c.is_cisa_kev;
    return matchesSearch && matchesKev;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('nav.vulnerabilities')} & Exposure Intelligence
          </h2>
          <p className="text-xs text-slate-500">
            Offline NVD 2.0, CISA KEV & EPSS Intelligence Engine.
          </p>
        </div>

        {/* Site Selector */}
        {sites.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Target Site:</span>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('exposure')}
          className={`py-3 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'exposure'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Site Exposure Matching ({exposureList.filter(e => e.status === 'AFFECTED').length} Affected)</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-3 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'inventory'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Stack Inventory ({inventory.length} Components)</span>
        </button>

        <button
          onClick={() => setActiveTab('feed')}
          className={`py-3 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'feed'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Offline CVE Cache ({cves.length} Cached)</span>
        </button>
      </div>

      {/* Tab 1: Exposure Matching */}
      {activeTab === 'exposure' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-brand-500/10 border border-brand-500/20 rounded-2xl text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-brand-400">Automated Exposure Engine Active</span>
              <p className="text-slate-400">Comparing your registered software stack against NVD CVEs, CISA KEV, and EPSS exploit probabilities.</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleScanHeaders}
                disabled={scanning}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                <span>Auto-Scan Upstream</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {exposureList.map((item) => (
              <div
                key={item.cve_id}
                className={`p-4 rounded-2xl border transition ${
                  item.status === 'AFFECTED'
                    ? 'bg-rose-500/5 border-rose-500/30'
                    : item.status === 'UNSURE'
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {item.cve_id}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 border ${
                        item.status === 'AFFECTED'
                          ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                          : item.status === 'UNSURE'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {item.status === 'AFFECTED' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {item.status === 'NOT_AFFECTED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {item.status === 'UNSURE' && <HelpCircle className="w-3 h-3 mr-1" />}
                      <span>{item.status}</span>
                    </span>

                    {item.is_cisa_kev && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30 font-mono">
                        CISA KEV ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <span className="text-slate-400">CVSS: <strong className="text-rose-400">{item.cvss_score}</strong></span>
                    <span className="text-slate-400">EPSS: <strong className="text-amber-400">{(item.epss_score * 100).toFixed(1)}%</strong></span>
                    <span className="text-slate-400">Priority: <strong className="text-brand-400">{item.priority_score}/10</strong></span>
                  </div>
                </div>

                <div className="pt-3 text-xs space-y-2">
                  <p className="text-slate-700 dark:text-slate-300">
                    {item.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 flex items-start space-x-2">
                    <span className="font-semibold text-brand-400 flex-shrink-0">Exposure Reason:</span>
                    <span>{item.reason}</span>
                  </div>

                  {item.status === 'AFFECTED' && (
                    <div className="pt-2 flex justify-end">
                      <a
                        href="/prove-patch"
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-md transition"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Prove-then-Patch this CVE</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Stack Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Software components and dependencies registered for the target site.
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Component</span>
              </button>

              <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload requirements.txt / package.json</span>
                <input
                  type="file"
                  onChange={handleUploadManifest}
                  className="hidden"
                  accept=".txt,.json"
                />
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Component / Library</th>
                  <th className="p-3">Installed Version</th>
                  <th className="p-3">Detection Source</th>
                  <th className="p-3">CPE String</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">
                      No stack components recorded yet. Click "Auto-Scan Upstream" or upload a manifest.
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{item.component_name}</td>
                      <td className="p-3 font-mono text-[11px] text-brand-400">{item.version}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-700">
                          {item.detection_source}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-500 truncate max-w-xs">{item.cpe_string || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: CVE Feed Cache */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search CVE ID or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
              />
            </div>

            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={kevFilter}
                onChange={(e) => setKevFilter(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span>CISA KEV Only (Active Exploits)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCves.map((cve) => (
              <div key={cve.cve_id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{cve.cve_id}</span>
                  <span className="text-[10px] font-mono font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                    CVSS {cve.cvss_score}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{cve.description}</p>
                <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500">
                  <span>EPSS: {(cve.epss_score * 100).toFixed(1)}%</span>
                  <span>Priority: {cve.priority_score}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Component Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Software to Stack Inventory</h3>
            <form onSubmit={handleAddManualComponent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Software / Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. storefront, activemq, express"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Installed Version</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2.4.0, 5.18.0"
                  value={compVersion}
                  onChange={(e) => setCompVersion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-md"
                >
                  Save Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
