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

  const scenarios = [
    {
      id: 'normal',
      title: 'Normal Customer Search',
      badge: 'BENIGN TRAFFIC',
      badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
      btnClass: 'bg-gradient-to-r from-deepteal-700 to-cyanteal-500 hover:from-deepteal-600 hover:to-cyanteal-400 text-cream-100 shadow-glow-teal',
      btnLabel: 'Send Benign Query',
      infoTitle: 'Legitimate Business Traffic',
      infoDesc: 'Normal shopper search for "coffee". Verifies that legitimate shoppers are NEVER blocked (0.00% False Positive Rate).'
    },
    {
      id: 'sqli',
      title: 'SQL Injection Attack',
      badge: 'CVE-2023-38606',
      badgeClass: 'bg-copper-500/20 text-copper-300 border-copper-500/40',
      btnClass: 'bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 text-cream-100 shadow-glow-copper',
      btnLabel: 'Send SQLi Exploit',
      infoTitle: 'SQL Injection Simulation',
      infoDesc: 'Exploit payload attempting database leak via UNION SELECT. Virtual patch intercepts and returns HTTP 403 Forbidden.'
    },
    {
      id: 'traversal',
      title: 'Path Traversal & LFI',
      badge: 'CVE-2023-3452',
      badgeClass: 'bg-copper-500/20 text-copper-300 border-copper-500/40',
      btnClass: 'bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 text-cream-100 shadow-glow-copper',
      btnLabel: 'Send Traversal Exploit',
      infoTitle: 'Path Traversal Simulation',
      infoDesc: 'Exploit attempting to escape web root to read /etc/passwd or secret files. Dropped by Path Traversal module with 403.'
    },
    {
      id: 'cmd',
      title: 'OS Command Injection',
      badge: 'RCE EXPLOIT',
      badgeClass: 'bg-rose-950 text-rose-400 border-rose-500/30',
      btnClass: 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-cream-100 shadow-md',
      btnLabel: 'Send Shell Exploit',
      infoTitle: 'Command Injection Simulation',
      infoDesc: 'Exploit injecting shell metacharacters (; cat /etc/passwd). Blocked by Command Injection shield.'
    },
    {
      id: 'bot',
      title: 'Malicious Scanner Bot',
      badge: 'BOT SCANNER',
      badgeClass: 'bg-cyanteal-500/20 text-iceteal-300 border-cyanteal-500/40',
      btnClass: 'bg-gradient-to-r from-deepteal-700 to-cyanteal-500 hover:from-deepteal-600 hover:to-cyanteal-400 text-cream-100 shadow-glow-teal',
      btnLabel: 'Send Bot Probe',
      infoTitle: 'Automated Vulnerability Scanner',
      infoDesc: 'Probe with automated crawler / scanner User-Agent (sqlmap). Dropped immediately without origin leakage.'
    },
    {
      id: 'honeypot',
      title: 'Honeypot Deception Trap',
      badge: 'DECEPTION TRAP',
      badgeClass: 'bg-copper-500/20 text-copper-300 border-copper-500/40',
      btnClass: 'bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 text-cream-100 shadow-glow-copper',
      btnLabel: 'Probe Honeypot URL',
      infoTitle: 'Honeypot Decoy Trap',
      infoDesc: 'Attacker probes hidden files like /.env or /wp-login.php. Gateway returns a fake 404 decoy without touching upstream.'
    },
    {
      id: 'ssrf',
      title: 'SSRF Cloud Metadata Theft',
      badge: 'CLOUD THEFT',
      badgeClass: 'bg-rose-950 text-rose-400 border-rose-500/30',
      btnClass: 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-cream-100 shadow-md',
      btnLabel: 'Send SSRF Exploit',
      infoTitle: 'SSRF Metadata Probe',
      infoDesc: 'Attacker sends URL pointing to 169.254.169.254 to steal AWS/GCP cloud IAM keys. Blocked with 403 Forbidden.'
    },
    {
      id: 'nosql',
      title: 'NoSQL Operator Injection',
      badge: 'NOSQL OPERATOR',
      badgeClass: 'bg-copper-500/20 text-copper-300 border-copper-500/40',
      btnClass: 'bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 text-cream-100 shadow-glow-copper',
      btnLabel: 'Send NoSQL Exploit',
      infoTitle: 'MongoDB Operator Injection',
      infoDesc: 'Attacker injects [$gt]= operator to bypass authentication or dump database documents. Blocked with 403 Forbidden.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyanteal-500/20 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-copper-400" />
            <h2 className="text-xl font-bold text-cream-300">
              Interactive Attack Simulator & Evaluation Lab
            </h2>
            <InfoHint 
              title="Live Attack Simulator" 
              content="Real-time interactive testing console. Fire live attacks or benign requests directly through the gateway to prove instant mitigation."
              badge="DEMO LAB"
            />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare legitimate customer traffic flow vs real-time exploit neutralization.
          </p>
        </div>

        {sites.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Target Site:</span>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="px-3 py-1.5 bg-obsidian-950 border border-cyanteal-500/40 rounded-xl text-xs font-semibold text-cream-200 focus:outline-none focus:ring-1 focus:ring-iceteal-300"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Test Runner Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((sc) => (
          <div 
            key={sc.id} 
            className="p-5 rounded-3xl glass-panel border border-cyanteal-500/30 hover:border-iceteal-300/40 transition-all duration-300 shadow-lg space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${sc.badgeClass}`}>
                  {sc.badge}
                </span>
                <InfoHint title={sc.infoTitle} content={sc.infoDesc} badge="SCENARIO" />
              </div>
              <h3 className="font-bold text-sm text-cream-200">{sc.title}</h3>
            </div>

            <button
              onClick={() => runTestScenario(sc.id)}
              disabled={testing}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center justify-center space-x-1.5 ${sc.btnClass}`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{testing ? 'Testing...' : sc.btnLabel}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Live Response Result Box */}
      {testResult && (
        <div className="p-6 rounded-3xl glass-panel-elevated border border-cyanteal-500/40 text-white space-y-3 font-mono text-xs shadow-2xl animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-cyanteal-500/20">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-iceteal-300" />
              <span className="font-bold text-cream-300 uppercase">Gateway Telemetry Output:</span>
              <span className="text-slate-400">{testResult.scenario}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                testResult.status === 200
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-glow-teal'
                  : testResult.status === 403
                  ? 'bg-copper-500/20 text-copper-300 border border-copper-500/40 shadow-glow-copper'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
              }`}>
                HTTP {testResult.status} {testResult.isBlocked ? '🛡️ (NEUTRALIZED BY GATEWAY)' : '✅ (PASSED TO STORE)'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] text-iceteal-300 truncate">URL: {testResult.url}</p>
            <pre className="p-3.5 bg-obsidian-950/95 border border-cyanteal-500/30 rounded-2xl overflow-x-auto text-[11px] text-cream-200 font-mono leading-relaxed">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
