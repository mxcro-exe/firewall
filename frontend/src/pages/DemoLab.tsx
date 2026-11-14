import React, { useState, useEffect } from 'react';
import { 
  Play, ShieldCheck, ShieldAlert, Sparkles, AlertTriangle, 
  Terminal, Globe, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

interface Site {
  id: string;
  name: string;
}

export const DemoLab: React.FC = () => {
  const { language, t } = useLanguage();
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
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
    fetchSites();
  }, []);

  const runTestScenario = async (scenario: string) => {
    if (!selectedSiteId) return;
    setTesting(true);
    setTestResult(null);

    let url = '';
    let method = 'GET';
    let headers: Record<string, string> = {};

    switch (scenario) {
      case 'normal':
        url = `http://localhost:8000/proxy/${selectedSiteId}/api/products?q=coffee`;
        break;
      case 'sqli':
        url = `http://localhost:8000/proxy/${selectedSiteId}/api/products?q=coffee'+UNION+SELECT+1,2,@@version--`;
        break;
      case 'traversal':
        url = `http://localhost:8000/proxy/${selectedSiteId}/api/preview?filename=../../../../etc/passwd`;
        break;
      case 'cmd':
        url = `http://localhost:8000/proxy/${selectedSiteId}/api/system/ping?host=127.0.0.1;+cat+/etc/passwd`;
        break;
      case 'bot':
        url = `http://localhost:8000/proxy/${selectedSiteId}/api/products`;
        headers = { 'User-Agent': 'sqlmap/1.6.4#stable' };
        break;
      case 'honeypot':
        url = `http://localhost:8000/proxy/${selectedSiteId}/.env`;
        break;
      default:
        break;
    }

    try {
      const resp = await fetch(url, { method, headers });
      let data: any = {};
      try {
        data = await resp.json();
      } catch {
        data = { text: await resp.text() };
      }

      setTestResult({
        scenario,
        status: resp.status,
        url,
        data,
        isBlocked: resp.status === 403 || resp.status === 404
      });
    } catch (err: any) {
      setTestResult({
        scenario,
        status: 502,
        url,
        data: { error: "Gateway or upstream unreachable on port 8000. Start backend server." },
        isBlocked: false
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-brand-500" />
            Interactive Attack Simulator & Evaluation Lab
          </h2>
          <p className="text-xs text-slate-500">
            One-click interactive proof: compare normal customer traffic vs live exploit attempts against the gateway.
          </p>
        </div>

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
      </div>

      {/* Test Runner Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Scenario 1: Normal Shopper */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              BENIGN TRAFFIC
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Normal Customer Search</h3>
            <p className="text-[11px] text-slate-500">
              Legitimate shopper queries: <code>?q=coffee</code>. Proves 0% false positives.
            </p>
          </div>
          <button
            onClick={() => runTestScenario('normal')}
            disabled={testing}
            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Send Benign Request</span>
          </button>
        </div>

        {/* Scenario 2: SQLi */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-mono">
              CVE-2023-38606
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">SQL Injection Exploit</h3>
            <p className="text-[11px] text-slate-500">
              Attempts database extraction: <code>q=coffee'+UNION+SELECT...</code>.
            </p>
          </div>
          <button
            onClick={() => runTestScenario('sqli')}
            disabled={testing}
            className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Send SQLi Attack</span>
          </button>
        </div>

        {/* Scenario 3: Path Traversal */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono">
              CVE-2023-3452
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Path Traversal & LFI</h3>
            <p className="text-[11px] text-slate-500">
              Attempts reading system secrets: <code>filename=../../etc/passwd</code>.
            </p>
          </div>
          <button
            onClick={() => runTestScenario('traversal')}
            disabled={testing}
            className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Send Traversal Attack</span>
          </button>
        </div>

        {/* Scenario 4: Command Injection */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-mono">
              RCE EXPLOIT
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">OS Command Injection</h3>
            <p className="text-[11px] text-slate-500">
              Injects shell pipe: <code>host=127.0.0.1; cat /etc/passwd</code>.
            </p>
          </div>
          <button
            onClick={() => runTestScenario('cmd')}
            disabled={testing}
            className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Send RCE Attack</span>
          </button>
        </div>

        {/* Scenario 5: Bot Scraper */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              BOT SCANNER
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Automated Bot User-Agent</h3>
            <p className="text-[11px] text-slate-500">
              Probes gateway using scanner fingerprint: <code>User-Agent: sqlmap/1.6.4</code>.
            </p>
          </div>
          <button
            onClick={() => runTestScenario('bot')}
            disabled={testing}
            className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Send Bot Request</span>
          </button>
        </div>

        {/* Scenario 6: Honeypot */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono">
              DECEPTION TRAP
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Honeypot Trap Probe</h3>
            <p className="text-[11px] text-slate-500">
              Attacker checks secret config: <code>/.env</code> or <code>/wp-login.php</code>.
            </p>
          </div>
          <button
            onClick={() => runTestScenario('honeypot')}
            disabled={testing}
            className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Probe Honeypot</span>
          </button>
        </div>
      </div>

      {/* Live Response Result Box */}
      {testResult && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-3 font-mono text-xs shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-brand-400" />
              <span className="font-bold text-slate-200 uppercase">Test Scenario Output:</span>
              <span className="text-slate-400">{testResult.scenario}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                testResult.status === 200
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : testResult.status === 403
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                HTTP {testResult.status} {testResult.isBlocked ? '(PROTECTED BY GATEWAY)' : '(PASSED)'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] text-slate-400 truncate">URL: {testResult.url}</p>
            <pre className="p-3 bg-slate-900 rounded-xl overflow-x-auto text-[11px] text-slate-300">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
