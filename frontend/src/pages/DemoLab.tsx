import React, { useState, useEffect } from 'react';
import { 
  Play, ShieldCheck, ShieldAlert, Sparkles, AlertTriangle, 
  Terminal, Globe, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { InfoHint } from '../components/common/InfoHint';
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
      case 'ssrf':
        url = `http://localhost:8000/proxy/${selectedSiteId}/api/products?url=http://169.254.169.254/latest/meta-data/`;
        break;
      case 'nosql':
        url = `http://localhost:8000/proxy/${selectedSiteId}/api/products?q[$gt]=`;
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
        data = { message: "Raw non-JSON response received" };
      }

      setTestResult({
        scenario,
        url,
        status: resp.status,
        data,
        isBlocked: resp.status === 403 || resp.status === 404
      });
    } catch (err: any) {
      setTestResult({
        scenario,
        url,
        status: 0,
        data: { error: err.message || "Network Error" },
        isBlocked: false
      });
    } finally {
      setTesting(false);
    }
  };

  const scenarios = [
    {
      id: 'normal',
      title: 'Legitimate Customer Request',
      badge: 'SAFE SHOPPER',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-deepteal-700/60 dark:text-iceteal-200 dark:border-iceteal-300/30',
      btnClass: 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs',
      btnLabel: 'Send Safe Request',
      infoTitle: 'Legitimate Traffic Simulation',
      infoDesc: 'Benign customer browsing the product catalog. Passes cleanly through the gateway with HTTP 200 OK.'
    },
    {
      id: 'sqli',
      title: 'SQL Injection Attack',
      badge: 'OWASP TOP 10',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-copper-500/20 dark:text-copper-300 dark:border-copper-500/40',
      btnClass: 'bg-copper-600 hover:bg-copper-700 text-white shadow-xs border border-copper-700',
      btnLabel: 'Send SQLi Exploit',
      infoTitle: 'SQL Injection Simulation',
      infoDesc: 'Exploit payload attempting database leak via UNION SELECT. Virtual patch intercepts and returns HTTP 403 Forbidden.'
    },
    {
      id: 'traversal',
      title: 'Path Traversal & LFI',
      badge: 'CVE-2023-3452',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-copper-500/20 dark:text-copper-300 dark:border-copper-500/40',
      btnClass: 'bg-copper-600 hover:bg-copper-700 text-white shadow-xs border border-copper-700',
      btnLabel: 'Send Traversal Exploit',
      infoTitle: 'Path Traversal Simulation',
      infoDesc: 'Exploit attempting to escape web root to read /etc/passwd or secret files. Dropped by Path Traversal module with 403.'
    },
    {
      id: 'cmd',
      title: 'OS Command Injection',
      badge: 'RCE EXPLOIT',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-copper-500/25 dark:text-copper-300 dark:border-copper-500/40',
      btnClass: 'bg-copper-600 hover:bg-copper-700 text-white shadow-xs border border-copper-700',
      btnLabel: 'Send Shell Exploit',
      infoTitle: 'Command Injection Simulation',
      infoDesc: 'Exploit injecting shell metacharacters (; cat /etc/passwd). Blocked by Command Injection shield.'
    },
    {
      id: 'bot',
      title: 'Malicious Scanner Bot',
      badge: 'BOT SCANNER',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-deepteal-700/60 dark:text-iceteal-200 dark:border-iceteal-300/30',
      btnClass: 'bg-copper-600 hover:bg-copper-700 text-white shadow-xs border border-copper-700',
      btnLabel: 'Send Bot Probe',
      infoTitle: 'Automated Vulnerability Scanner',
      infoDesc: 'Probe with automated crawler / scanner User-Agent (sqlmap). Dropped immediately without origin leakage.'
    },
    {
      id: 'honeypot',
      title: 'Honeypot Deception Trap',
      badge: 'DECEPTION TRAP',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-copper-500/20 dark:text-copper-300 dark:border-copper-500/40',
      btnClass: 'bg-copper-600 hover:bg-copper-700 text-white shadow-xs border border-copper-700',
      btnLabel: 'Probe Honeypot URL',
      infoTitle: 'Honeypot Decoy Trap',
      infoDesc: 'Attacker probes hidden files like /.env or /wp-login.php. Gateway returns a fake 404 decoy without touching upstream.'
    },
    {
      id: 'ssrf',
      title: 'SSRF Cloud Metadata Theft',
      badge: 'CLOUD THEFT',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-copper-500/25 dark:text-copper-300 dark:border-copper-500/40',
      btnClass: 'bg-copper-600 hover:bg-copper-700 text-white shadow-xs border border-copper-700',
      btnLabel: 'Send SSRF Exploit',
      infoTitle: 'SSRF Metadata Probe',
      infoDesc: 'Attacker sends URL pointing to 169.254.169.254 to steal AWS/GCP cloud IAM keys. Blocked with 403 Forbidden.'
    },
    {
      id: 'nosql',
      title: 'NoSQL Operator Injection',
      badge: 'NOSQL OPERATOR',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-copper-500/20 dark:text-copper-300 dark:border-copper-500/40',
      btnClass: 'bg-copper-600 hover:bg-copper-700 text-white shadow-xs border border-copper-700',
      btnLabel: 'Send NoSQL Exploit',
      infoTitle: 'MongoDB Operator Injection',
      infoDesc: 'Attacker injects [$gt]= operator to bypass authentication or dump database documents. Blocked with 403 Forbidden.'
    }
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 dark:border-cyanteal-500/20 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-copper-600 dark:text-copper-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-champagne-200">
              Interactive Attack Simulator & Evaluation Lab
            </h2>
            <InfoHint 
              title="Live Attack Simulator" 
              content="Real-time interactive testing console. Fire live attacks or benign requests directly through the gateway to prove instant mitigation."
              badge="SECURITY LAB"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-iceteal-300/80 mt-0.5">
            Compare legitimate customer traffic flow vs real-time exploit neutralization.
          </p>
        </div>

        {sites.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-600 dark:text-iceteal-300">Target Site:</span>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="px-2.5 py-1 bg-slate-100 dark:bg-obsidian-950 border border-slate-200 dark:border-cyanteal-500/35 rounded-lg text-xs font-semibold text-slate-900 dark:text-champagne-200 focus:outline-none focus:ring-1 focus:ring-copper-500 shadow-xs"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Test Runner Buttons Grid (Compact 3.5 padding) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {scenarios.map((sc) => (
          <div 
            key={sc.id} 
            className="p-3.5 rounded-xl glass-panel border border-slate-200 dark:border-cyanteal-500/30 hover:border-slate-300 dark:hover:border-iceteal-300/40 transition-all duration-150 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${sc.badgeClass}`}>
                  {sc.badge}
                </span>
                <InfoHint title={sc.infoTitle} content={sc.infoDesc} badge="SCENARIO" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-champagne-200">{sc.title}</h3>
            </div>

            <button
              onClick={() => runTestScenario(sc.id)}
              disabled={testing}
              className={`w-full py-2 px-2.5 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 flex items-center justify-center space-x-1.5 ${sc.btnClass}`}
            >
              <Play className="w-3 h-3" />
              <span>{testing ? 'Testing...' : sc.btnLabel}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Live Response Result Box */}
      {testResult && (
        <div className="p-4 rounded-xl glass-panel-elevated border border-slate-200 dark:border-cyanteal-500/35 space-y-2.5 font-mono text-xs shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-cyanteal-500/20">
            <div className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-copper-600 dark:text-copper-400" />
              <span className="font-bold text-slate-900 dark:text-champagne-200 uppercase text-xs">Gateway Telemetry Output:</span>
              <span className="text-slate-600 dark:text-iceteal-300 font-sans text-xs">{testResult.scenario}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                testResult.status === 200
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-deepteal-700/60 dark:text-iceteal-200 dark:border-iceteal-300/40'
                  : testResult.status === 403
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-copper-500/20 dark:text-copper-300 dark:border-copper-500/40'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300'
              }`}>
                HTTP {testResult.status} {testResult.isBlocked ? '🛡️ (NEUTRALIZED BY GATEWAY)' : '✅ (PASSED TO STORE)'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 dark:text-iceteal-300 truncate font-sans">URL: {testResult.url}</p>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-[10px] font-mono leading-relaxed border border-slate-800">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
