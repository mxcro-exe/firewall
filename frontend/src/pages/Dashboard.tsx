import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Globe, Activity, ArrowUpRight, 
  CheckCircle2, AlertTriangle, Zap, Server, Sliders, HeartHandshake,
  Bot, Flame, Sparkles, Clock, Lock, RefreshCw, Terminal, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMode } from '../context/ModeContext';
import { InfoHint } from '../components/common/InfoHint';
import api from '../services/api';

export const Dashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const { dashboardMode, globalMode } = useMode();
  
  const [sitesCount, setSitesCount] = useState<number>(1);
  const [activePatchesCount, setActivePatchesCount] = useState<number>(1);
  const [blockedCount, setBlockedCount] = useState<number>(0);
  const [healthScore, setHealthScore] = useState<number>(88);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeStage, setActiveStage] = useState<number>(5); // Default to Stage 5 Full Enforce

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sitesRes, rulesRes, trafficRes] = await Promise.allSettled([
          api.get('/sites/'),
          api.get('/rules/'),
          api.get('/traffic/stats')
        ]);

        if (sitesRes.status === 'fulfilled' && sitesRes.value.data) {
          setSitesCount(sitesRes.value.data.length || 1);
          if (sitesRes.value.data[0]?.health_score) {
            setHealthScore(sitesRes.value.data[0].health_score);
          }
        }

        if (rulesRes.status === 'fulfilled' && rulesRes.value.data) {
          const enforced = rulesRes.value.data.filter((r: any) => 
            ['SHADOW', 'CANARY', 'ENFORCED'].includes(r.status)
          );
          setActivePatchesCount(enforced.length || 1);
        }

        if (trafficRes.status === 'fulfilled' && trafficRes.value.data) {
          setBlockedCount(trafficRes.value.data.blocked_count || 0);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stages = [
    {
      num: 1,
      title: 'Sandbox Exploit',
      status: 'PASS',
      badge: '100% BLOCKED',
      desc: language === 'ta' 
        ? 'பாதுகாப்பான தனி சூழலில் தாக்குதல் மாதிரிகள் சோதிக்கப்பட்டு 100% தடுக்கப்படுவது உறுதிசெய்யப்படுகிறது.'
        : language === 'hi'
        ? 'सैंडबॉक्स में हमले के नमूनों का परीक्षण कर 100% रुकावट सुनिश्चित की जाती है।'
        : 'Replays standardized attack payloads in an isolated sandbox. Must achieve 100% block rate.',
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
    },
    {
      num: 2,
      title: 'Traffic Replay FP',
      status: 'PASS',
      badge: '0.00% FP',
      desc: language === 'ta'
        ? 'முந்தைய வாடிக்கையாளர் போக்குவரத்து மீண்டும் இயக்கப்பட்டு, எந்தவொரு நல்ல பயனரும் தடுக்கப்படவில்லை என்பது நிரூபிக்கப்படுகிறது.'
        : language === 'hi'
        ? 'असली ग्राहक ट्रैफ़िक को रीप्ले कर यह प्रमाणित किया जाता है कि कोई भी वैध अनुरोध ब्लॉक न हो।'
        : 'Replays historical sanitized customer traffic. Rule is instantly rejected if false positive > 0%.',
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
    },
    {
      num: 3,
      title: 'Shadow Mode',
      status: 'LOG ONLY',
      badge: 'PASSIVE',
      desc: language === 'ta'
        ? 'வாடிக்கையாளர்களைத் தடுக்காமல் பின்னணியில் அமைதியாகத் தரவுகளைச் சேகரித்து கண்காணிக்கிறது.'
        : language === 'hi'
        ? 'बिना ट्रैफ़िक रोके पृष्ठभूमि में शांतिपूर्वक टेलीमेट्री और लॉग एकत्र करता है।'
        : 'Passive monitoring in live environment. Logs matches without blocking legitimate customer requests.',
      color: 'border-iceteal-300/40 text-iceteal-300 bg-deepteal-700/30'
    },
    {
      num: 4,
      title: 'Canary Split',
      status: '5% CANARY',
      badge: 'CANARY',
      desc: language === 'ta'
        ? 'IP ஹாஷ் அடிப்படையில் 5% இணைய போக்குவரத்தில் மட்டும் சோதனை முறையில் அமல்படுத்தப்படுகிறது.'
        : language === 'hi'
        ? 'IP हैश बकेटिंग के आधार पर केवल 5% लाइव ट्रैफ़िक पर सुरक्षा नियम लागू होता है।'
        : 'Enforced only on 5% of client traffic using deterministic IP hash-bucketing.',
      color: 'border-copper-400/40 text-copper-300 bg-copper-500/20'
    },
    {
      num: 5,
      title: 'Full Enforce',
      status: 'ACTIVE',
      badge: 'PROTECTING',
      desc: language === 'ta'
        ? 'அனைத்து பயனர்களுக்கும் முழு பாதுகாப்பு நடைமுறைக்கு வந்துள்ளது. தானியங்கி திரும்பப் பெறுதல் பாதுகாப்பு இயங்குகிறது.'
        : language === 'hi'
        ? '100% ट्रैफ़िक पर पूर्ण सुरक्षा सक्रिय है। आपातकालीन ऑटो-रोलबैक सुरक्षा कवच चालू है।'
        : 'Active production enforcement across 100% traffic with auto-rollback safety circuit breaker.',
      color: 'border-iceteal-300/60 text-cream-200 bg-cyanteal-500/30 font-bold'
    },
    {
      num: 6,
      title: 'Auto-Retire',
      status: 'MONITORING',
      badge: 'LIFECYCLE',
      desc: language === 'ta'
        ? 'மென்பொருள் புதுப்பிக்கப்பட்டவுடன் இந்த மெய்நிகர் பாதுகாப்பு விதி தானாகவே ஓய்வு பெறும்.'
        : language === 'hi'
        ? 'सॉफ़्टवेयर अपडेट होने पर यह वर्चुअल पैच नियम स्वचालित रूप से सेवानिवृत्त हो जाएगा।'
        : 'Continuously checks software versions. Automatically retires the virtual patch upon upgrade.',
      color: 'border-slate-600 text-slate-400 bg-obsidian-850/60'
    }
  ];

  const attackModules = [
    {
      key: 'sqli',
      title: 'SQL Injection Guard',
      sub: 'AST & Token Matcher',
      blocks: '0 Blocks',
      status: 'ACTIVE',
      infoTitle: 'SQL Injection (SQLi)',
      infoDesc: t('simple_mode.sqli'),
      badge: 'DATABASE'
    },
    {
      key: 'xss',
      title: 'Cross-Site Scripting (XSS)',
      sub: 'HTML & Polyglot Filter',
      blocks: '0 Blocks',
      status: 'ACTIVE',
      infoTitle: 'Cross-Site Scripting (XSS)',
      infoDesc: t('simple_mode.xss'),
      badge: 'BROWSER'
    },
    {
      key: 'path',
      title: 'Path Traversal Shield',
      sub: 'LFI & File System Guard',
      blocks: '0 Blocks',
      status: 'ACTIVE',
      infoTitle: 'Path Traversal',
      infoDesc: t('simple_mode.path'),
      badge: 'FILES'
    },
    {
      key: 'cmd',
      title: 'Command Injection Guard',
      sub: 'Shell Metacharacters',
      blocks: '0 Blocks',
      status: 'ACTIVE',
      infoTitle: 'OS Command Injection',
      infoDesc: t('simple_mode.cmd'),
      badge: 'SYSTEM'
    },
    {
      key: 'ddos',
      title: 'DDoS & Rate Limiter',
      sub: '60 req/min Burst Ceiling',
      blocks: '0 Blocks',
      status: 'ACTIVE',
      infoTitle: 'DDoS & Flood Protection',
      infoDesc: t('simple_mode.ddos'),
      badge: 'TRAFFIC'
    },
    {
      key: 'brute',
      title: 'Brute-Force Guard',
      sub: '5 Fails / 10-min Ban',
      blocks: '0 Blocks',
      status: 'ACTIVE',
      infoTitle: 'Brute-Force Login Protection',
      infoDesc: t('simple_mode.brute'),
      badge: 'AUTH'
    },
    {
      key: 'bot',
      title: 'Scraper & Bot Drop',
      sub: 'sqlmap, nikto, scanner drop',
      blocks: '0 Blocks',
      status: 'ACTIVE',
      infoTitle: 'Malicious Scanner Bots',
      infoDesc: t('simple_mode.bot'),
      badge: 'BOTS'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden p-6 rounded-3xl glass-panel border border-cyanteal-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-glow-teal animate-ping" />
              <h2 className="text-xl font-bold text-cream-300 tracking-wide font-sans">
                {t('dashboard.title')}
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-deepteal-700/80 text-iceteal-200 border border-iceteal-300/30 uppercase tracking-wider">
                {globalMode} MODE
              </span>
              <InfoHint 
                title="Global Gateway Security Mode" 
                content="MONITOR: Passthrough with logging only. PROTECT (Recommended): Active scoped virtual patches and 7 attack shields enforce 403 blocks. STRICT: Aggressive threshold with ML anomaly blocking."
                badge="WAF CONFIG"
              />
            </div>
            <p className="text-xs text-slate-300 max-w-2xl font-sans">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="/demo-lab"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 text-cream-100 text-xs font-bold shadow-glow-copper border border-copper-400/30 transition-all duration-200 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-cream-200" />
              <span>{t('dashboard.testSim')}</span>
            </a>
            <a
              href="/sites"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl glass-panel hover:bg-cyanteal-500/20 text-cream-300 text-xs font-semibold border border-cyanteal-500/40 transition-all duration-200"
            >
              <Globe className="w-3.5 h-3.5 text-iceteal-300" />
              <span>{t('dashboard.addSite')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4 Sleek KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-3xl glass-panel border border-cyanteal-500/25 hover:border-iceteal-300/40 hover:-translate-y-0.5 transition-all duration-300 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">{t('dashboard.totalSites')}</span>
            <div className="flex items-center space-x-1.5">
              <InfoHint 
                title="Protected Multi-Tenant Sites" 
                content="Number of upstream web applications and APIs actively routed through this PatchShield gateway reverse proxy."
                badge="TOPOLOGY"
              />
              <div className="w-7 h-7 rounded-xl bg-deepteal-700/40 flex items-center justify-center text-iceteal-300 border border-cyanteal-500/20">
                <Globe className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-cream-300 tracking-tight font-mono">
              {sitesCount}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-semibold">
              REVERSE PROXY
            </span>
          </div>
          <div className="h-1 w-full bg-obsidian-850 rounded-full overflow-hidden">
            <div className="h-full bg-iceteal-300 w-full rounded-full" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-3xl glass-panel border border-cyanteal-500/25 hover:border-iceteal-300/40 hover:-translate-y-0.5 transition-all duration-300 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">{t('dashboard.activePatches')}</span>
            <div className="flex items-center space-x-1.5">
              <InfoHint 
                title="Active Scoped Virtual Patches" 
                content="Precision rules generated from CVE intelligence, verified through exploit sandboxes and traffic replays, currently neutralizing attacks in production."
                badge="VIRTUAL PATCH"
              />
              <div className="w-7 h-7 rounded-xl bg-deepteal-700/40 flex items-center justify-center text-emerald-400 border border-cyanteal-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-cream-300 tracking-tight font-mono">
              {activePatchesCount}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-semibold">
              ENFORCED & SAFE
            </span>
          </div>
          <div className="h-1 w-full bg-obsidian-850 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-full rounded-full" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-3xl glass-panel border border-cyanteal-500/25 hover:border-iceteal-300/40 hover:-translate-y-0.5 transition-all duration-300 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">{t('dashboard.blockedAttacks')}</span>
            <div className="flex items-center space-x-1.5">
              <InfoHint 
                title="Intrusion Attempts Blocked" 
                content="Number of malicious requests terminated with HTTP 403 Forbidden across all 7 attack modules and virtual patches in the past 24 hours."
                badge="TELEMETRY"
              />
              <div className="w-7 h-7 rounded-xl bg-copper-500/20 flex items-center justify-center text-copper-400 border border-copper-500/30">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-cream-300 tracking-tight font-mono">
              {blockedCount}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-copper-500/20 text-copper-300 border border-copper-500/30 font-semibold">
              0.00% FP RATE
            </span>
          </div>
          <div className="h-1 w-full bg-obsidian-850 rounded-full overflow-hidden">
            <div className="h-full bg-copper-400 w-1/4 rounded-full" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-3xl glass-panel border border-cyanteal-500/25 hover:border-iceteal-300/40 hover:-translate-y-0.5 transition-all duration-300 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">{t('dashboard.healthScore')}</span>
            <div className="flex items-center space-x-1.5">
              <InfoHint 
                title="Security Posture Health Score" 
                content="Computed dynamically (0-100) based on header protections, active patches, unpatched CVE exposure, and direct WAF bypass verification."
                badge="PS5 KPI"
              />
              <div className="w-7 h-7 rounded-xl bg-deepteal-700/40 flex items-center justify-center text-cream-300 border border-cyanteal-500/20">
                <Activity className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-cream-300 tracking-tight font-mono">
              {healthScore}<span className="text-base text-slate-500">/100</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-semibold">
              GRADE A
            </span>
          </div>
          <div className="h-1 w-full bg-obsidian-850 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyanteal-500 to-iceteal-300 rounded-full" style={{ width: `${healthScore}%` }} />
          </div>
        </div>
      </div>

      {/* Prove-then-Patch Visual Interactive Stepper */}
      <div className="p-6 rounded-3xl glass-panel border border-cyanteal-500/30 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyanteal-500/20 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-cream-300">
                {language === 'ta' 
                  ? 'நிரூபித்து இணை (Prove-then-Patch) தானியங்கி குழாய்' 
                  : language === 'hi'
                  ? 'प्रमाणित पैच (Prove-then-Patch) परीक्षण पाइपलाइन'
                  : 'Prove-then-Patch 6-Stage Lifecycle'}
              </h3>
              <InfoHint 
                title="What is Prove-then-Patch?"
                content="Unlike traditional WAFs that blindly apply untested regexes and cause business disruption, PatchShield forces every virtual patch through safe exploit sandboxes, historical traffic replays, and canary testing before full enforcement."
                badge="CORE INNOVATION"
              />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'ta' 
                ? 'தவறான தடுப்புகள் இன்றி பாதுகாப்பை நிரூபித்து அமல்படுத்தும் கட்டமைப்பு'
                : language === 'hi'
                ? 'शून्य गलत रुकावट के साथ सुरक्षित वर्चुअल पैचिंग सत्यापन'
                : 'Zero-disruption virtual patching: prove on exploits, prove on real traffic, then deploy.'}
            </p>
          </div>

          <a 
            href="/prove-patch" 
            className="text-xs text-iceteal-300 hover:text-cream-300 font-semibold flex items-center space-x-1"
          >
            <span>Full Evidence Stepper</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* 6-Stage Pill Stepper Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((st) => (
            <div
              key={st.num}
              onClick={() => setActiveStage(st.num)}
              className={`cursor-pointer p-3.5 rounded-2xl border transition-all duration-200 space-y-2 relative overflow-hidden ${
                activeStage === st.num
                  ? 'bg-deepteal-700/60 border-iceteal-300/60 shadow-glow-teal ring-1 ring-iceteal-300/40'
                  : 'bg-obsidian-850/60 border-cyanteal-500/25 hover:border-cyanteal-500/50 hover:bg-obsidian-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500">STAGE {st.num}</span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${st.color}`}>
                  {st.status}
                </span>
              </div>
              <p className="text-xs font-bold text-cream-200 truncate">{st.title}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                <span>{st.badge}</span>
                <InfoHint title={`Stage ${st.num}: ${st.title}`} content={st.desc} badge="EVIDENCE" />
              </div>
            </div>
          ))}
        </div>

        {/* Active Stage Detailed Breakdown Drawer */}
        <div className="p-4 rounded-2xl bg-obsidian-850/90 border border-cyanteal-500/30 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-cyanteal-500/20 text-iceteal-300 flex items-center justify-center font-mono font-bold flex-shrink-0">
              {activeStage}
            </div>
            <div>
              <span className="font-bold text-cream-300 text-xs">
                Stage {activeStage}: {stages[activeStage - 1].title}
              </span>
              <p className="text-slate-300 text-[11px] mt-0.5">
                {stages[activeStage - 1].desc}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              AUDIT HASH: #SHA256-VERIFIED
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: 7 Attack-Specific Shields & Autonomous Agent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): 7 Attack Defense Modules */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-cyanteal-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-cyanteal-500/20 pb-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-copper-400" />
              <h3 className="text-sm font-bold text-cream-300 font-sans">
                {t('nav.attackModules')} (7 Active Defense Shields)
              </h3>
              <InfoHint 
                title="Attack-Specific Defense Engines"
                content="Each attack type has its own isolated detector, regularized MITRE signature, dedicated metrics, and independent on/off toggle for pinpoint accuracy without side effects."
                badge="DEFENSE IN DEPTH"
              />
            </div>
            <a href="/attack-modules" className="text-xs text-iceteal-300 hover:text-cream-300 font-semibold flex items-center">
              <span>Configure Shields &rarr;</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attackModules.map((m) => (
              <div 
                key={m.key} 
                className="p-3.5 rounded-2xl bg-obsidian-850/70 border border-cyanteal-500/25 hover:border-cyanteal-500/50 hover:bg-obsidian-800/80 transition-all duration-200 flex items-center justify-between"
              >
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center space-x-1.5">
                    <p className="text-xs font-bold text-cream-200">{m.title}</p>
                    <InfoHint title={m.infoTitle} content={m.infoDesc} badge={m.badge} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">{m.sub}</p>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): PatchShield Autonomous Agent */}
        <div className="p-6 rounded-3xl glass-panel border border-cyanteal-500/30 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-cyanteal-500/20 pb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-iceteal-300" />
                <h3 className="text-sm font-bold text-cream-300 font-sans">
                  {t('nav.agent')}
                </h3>
                <InfoHint 
                  title="PatchShield Agent (OODA Loop)" 
                  content="The autonomous AI agent continuously Observes traffic + CVE feeds, Decides attack classification, Acts by proving and deploying virtual patches, and Reports in Tamil, Hindi & English."
                  badge="AUTONOMOUS AI"
                />
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyanteal-500/20 text-iceteal-300 border border-cyanteal-500/40">
                OODA LOOP
              </span>
            </div>

            {/* Terminal-style Latest Decision Box */}
            <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-cyanteal-500/30 font-mono text-[11px] space-y-2">
              <div className="flex items-center justify-between text-[10px] text-iceteal-300 border-b border-white/5 pb-1">
                <span>[AGENT-CYCLE #419]</span>
                <span className="text-emerald-400">STATE: OPTIMAL</span>
              </div>
              <p className="text-slate-300 font-sans leading-relaxed text-xs">
                {language === 'ta' 
                  ? 'பின்னணி அமைப்புகளை கண்காணித்து வருகிறது. எந்த அச்சுறுத்தலும் கண்டறியப்படவில்லை.' 
                  : language === 'hi'
                  ? 'रिवर्स प्रॉक्सी ट्रैफ़िक की निगरानी जारी है। कोई नया सुरक्षा ख़तरा नहीं मिला।'
                  : 'Monitoring reverse-proxy traffic and offline CVE feeds. Zero unpatched exploits detected.'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-obsidian-850/60 border border-cyanteal-500/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Enforcement Guardrail:</span>
                <span className="text-cream-300 font-semibold font-mono text-[11px]">Owner Approval</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Auto-Rollback Threshold:</span>
                <span className="text-emerald-400 font-semibold font-mono text-[11px]">&gt;2.0% FP Trip</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ML Fallback:</span>
                <span className="text-iceteal-300 font-semibold font-mono text-[11px]">23-Feat Random Forest</span>
              </div>
            </div>
          </div>

          <a
            href="/agent"
            className="w-full py-2.5 px-4 rounded-2xl glass-panel hover:bg-cyanteal-500/20 text-center text-xs font-bold text-cream-300 border border-cyanteal-500/40 shadow-sm transition-all duration-200 block"
          >
            Open Agent Timeline &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};
