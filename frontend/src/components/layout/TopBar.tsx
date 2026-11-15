import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Menu, Search, Bell, Globe2, Sun, Moon,
  User as UserIcon, LogOut, ShieldCheck, ShieldAlert, Eye, 
  ChevronDown, Command, X, ArrowRight, Sparkles, Flame, 
  Activity, Shield, FileCode, Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useMode } from '../../context/ModeContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface TopBarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

interface SearchEntry {
  id: string;
  title: string;
  description: string;
  category: 'Page' | 'Attack Shield' | 'CVE Rule' | 'Feature' | 'Tool';
  path: string;
  keywords: string[];
  icon?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { language, setLanguage, t } = useLanguage();
  const { dashboardMode, setDashboardMode, globalMode, setGlobalMode } = useMode();
  const { username, role, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Dropdown States
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modeMenuRef = useRef<HTMLDivElement>(null);

  // Search Database
  const searchDatabase: SearchEntry[] = useMemo(() => [
    {
      id: 'page-deck',
      title: 'Security Deck & Telemetry',
      description: 'Executive dashboard with live traffic, blocked attacks, and system health',
      category: 'Page',
      path: '/',
      keywords: ['dashboard', 'home', 'deck', 'overview', 'metrics', 'kpi', 'live'],
      icon: <Shield className="w-3.5 h-3.5 text-copper-500" />
    },
    {
      id: 'page-attack-modules',
      title: '20 Attack Defense Modules',
      description: 'Configure and monitor all 20 zero-day application shields',
      category: 'Page',
      path: '/attack-modules',
      keywords: ['attack', 'modules', 'shields', 'sqli', 'xss', 'ssrf', 'rce', 'lfi', '20', 'defense'],
      icon: <Flame className="w-3.5 h-3.5 text-rose-500" />
    },
    {
      id: 'page-demo-lab',
      title: 'Live Defense Demo Lab',
      description: 'Interactive exploit simulator comparing vulnerable store vs protected gateway',
      category: 'Tool',
      path: '/demo-lab',
      keywords: ['demo', 'lab', 'simulator', 'exploit', 'test', 'live', 'store', 'shop'],
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />
    },
    {
      id: 'page-traffic',
      title: 'Proxy Streaming Telemetry',
      description: 'Non-blocking chunked HTTP stream inspection (<1ms latency) with TCP RST drops',
      category: 'Feature',
      path: '/traffic',
      keywords: ['traffic', 'proxy', 'stream', 'chunked', 'latency', 'tcp', 'rst', 'packets', 'logs'],
      icon: <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-iceteal-300" />
    },
    {
      id: 'page-rules',
      title: 'ReDoS-Proof Virtual Patch Rules',
      description: 'AST-analyzed linear-time DFA regex rule engine preventing catastrophic backtracking',
      category: 'CVE Rule',
      path: '/rules',
      keywords: ['rules', 'redos', 'regex', 'ast', 'virtual', 'patch', 'dfa', 'cve', 'waf'],
      icon: <FileCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
    },
    {
      id: 'page-prove-patch',
      title: 'Prove-then-Patch Verifier',
      description: 'Isolated sandbox container exploit verification before production deployment',
      category: 'Tool',
      path: '/prove-patch',
      keywords: ['prove', 'patch', 'sandbox', 'verifier', 'container', 'isolate', 'docker', 'stage1'],
      icon: <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-iceteal-300" />
    },
    {
      id: 'page-sites',
      title: 'Protected Sites & Upstreams',
      description: 'Manage protected e-commerce domains, reverse proxy routes, and backend upstreams',
      category: 'Page',
      path: '/sites',
      keywords: ['sites', 'upstreams', 'domains', 'stores', 'proxy', 'host', 'routes'],
      icon: <Globe2 className="w-3.5 h-3.5 text-teal-600 dark:text-iceteal-300" />
    },
    {
      id: 'page-vulnerabilities',
      title: 'Vulnerability Disclosures & CVEs',
      description: 'National vulnerability database feeds and automated SMB virtual patching',
      category: 'Page',
      path: '/vulnerabilities',
      keywords: ['vulnerabilities', 'cve', 'cve-2024-3400', 'advisories', 'nvd', 'disclosures'],
      icon: <ShieldAlert className="w-3.5 h-3.5 text-copper-500" />
    },
    {
      id: 'page-agent',
      title: 'AI Autonomous Patch Agent',
      description: 'Claude & Gemini powered virtual patch synthesizer with automated test suites',
      category: 'Feature',
      path: '/agent',
      keywords: ['agent', 'ai', 'autonomous', 'llm', 'synthesis', 'claude', 'gemini', 'patch'],
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
    },
    {
      id: 'page-alerts',
      title: 'Real-Time Store Alerts',
      description: 'Instant notification stream for shopkeeper mobile alerts and critical attacks',
      category: 'Page',
      path: '/alerts',
      keywords: ['alerts', 'notifications', 'whatsapp', 'sms', 'critical', 'incidents'],
      icon: <Bell className="w-3.5 h-3.5 text-copper-500" />
    },
    {
      id: 'page-reports',
      title: 'Safety & Audit Reports',
      description: 'Downloadable executive compliance summaries and NASSCOM ARB security audits',
      category: 'Page',
      path: '/reports',
      keywords: ['reports', 'pdf', 'executive', 'compliance', 'nasscom', 'audit', 'summary'],
      icon: <FileCode className="w-3.5 h-3.5 text-slate-500 dark:text-champagne-300" />
    },
    {
      id: 'page-metrics',
      title: 'Latency & PS5 Metrics',
      description: 'Microsecond in-memory ban cache stats, token bucket sliding window, and CPU load',
      category: 'Feature',
      path: '/metrics',
      keywords: ['metrics', 'latency', 'performance', 'cache', 'ban', 'rate limit', 'token bucket', 'cpu'],
      icon: <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
    },
    {
      id: 'page-audit-log',
      title: 'Immutable SecOps Audit Trail',
      description: 'Cryptographically hashed event log of all admin actions and rule activations',
      category: 'Page',
      path: '/audit-log',
      keywords: ['audit', 'log', 'trail', 'secops', 'history', 'forensics', 'tamper-evident'],
      icon: <FileCode className="w-3.5 h-3.5 text-teal-600 dark:text-iceteal-300" />
    },
    {
      id: 'page-settings',
      title: 'System Settings & Gateway Config',
      description: 'Firewall ports, upstream reverse proxy endpoints, and security thresholds',
      category: 'Page',
      path: '/settings',
      keywords: ['settings', 'config', 'preferences', 'gateway', 'port', 'threshold'],
      icon: <UserIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
    },

    // 20 Attack Shields
    {
      id: 'shield-sqli',
      title: 'SQL Injection (SQLi) Defense',
      description: 'Blocks tautology 1=1, UNION SELECT, blind timing, and stacked SQL queries',
      category: 'Attack Shield',
      path: '/attack-modules',
      keywords: ['sqli', 'sql injection', 'database', 'union select', 'or 1=1', 'blind sql', 'drop table'],
      icon: <Flame className="w-3.5 h-3.5 text-rose-500" />
    },
    {
      id: 'shield-xss',
      title: 'Cross-Site Scripting (XSS) Shield',
      description: 'Filters reflected script tags, stored vectors, DOM event handlers, and SVG onload',
      category: 'Attack Shield',
      path: '/attack-modules',
      keywords: ['xss', 'cross-site scripting', 'script', 'javascript', 'reflected', 'stored', 'alert'],
      icon: <Flame className="w-3.5 h-3.5 text-rose-500" />
    },
    {
      id: 'shield-ssrf',
      title: 'Server-Side Request Forgery (SSRF)',
      description: 'Prohibits loopback 127.0.0.1 and cloud metadata IP 169.254.169.254 access',
      category: 'Attack Shield',
      path: '/attack-modules',
      keywords: ['ssrf', 'metadata', '169.254.169.254', 'aws', 'gcp', 'loopback', 'internal ip'],
      icon: <Flame className="w-3.5 h-3.5 text-rose-500" />
    },
    {
      id: 'shield-lfi',
      title: 'Path Traversal & Local File Inclusion',
      description: 'Detects directory traversal sequences ../ and ..\\ targeting /etc/passwd or system files',
      category: 'Attack Shield',
      path: '/attack-modules',
      keywords: ['lfi', 'path traversal', 'directory traversal', '../', '/etc/passwd', 'file inclusion'],
      icon: <Flame className="w-3.5 h-3.5 text-rose-500" />
    },
    {
      id: 'shield-rce',
      title: 'Command Injection (RCE) Guard',
      description: 'Intercepts piped commands, shell backticks, semicolons, and subshell executions',
      category: 'Attack Shield',
      path: '/attack-modules',
      keywords: ['rce', 'command injection', 'shell', 'bash', 'powershell', 'exec', 'system'],
      icon: <Flame className="w-3.5 h-3.5 text-rose-500" />
    },
    {
      id: 'shield-cve-3400',
      title: 'CVE-2024-3400 PAN-OS Command Injection Rule',
      description: 'Zero-day virtual patch rule blocking Palo Alto GlobalProtect telemetry exploits',
      category: 'CVE Rule',
      path: '/rules',
      keywords: ['cve-2024-3400', 'palo alto', 'pan-os', 'globalprotect', 'zero-day', 'cve'],
      icon: <ShieldAlert className="w-3.5 h-3.5 text-copper-500" />
    },
    {
      id: 'shield-cve-46805',
      title: 'CVE-2023-46805 Ivanti Connect Secure Bypass',
      description: 'Virtual patch denying unauthorized authentication bypass in API endpoints',
      category: 'CVE Rule',
      path: '/rules',
      keywords: ['cve-2023-46805', 'ivanti', 'auth bypass', 'connect secure', 'zero-day'],
      icon: <ShieldAlert className="w-3.5 h-3.5 text-copper-500" />
    },
    {
      id: 'shield-ddos',
      title: 'Rate Limiting & Slowloris DDoS Shield',
      description: 'Sliding-window token bucket (100 req/min) dropping volumetric surges at socket level',
      category: 'Attack Shield',
      path: '/attack-modules',
      keywords: ['ddos', 'rate limit', 'slowloris', 'token bucket', 'flood', 'dos', 'sliding window'],
      icon: <Flame className="w-3.5 h-3.5 text-rose-500" />
    },
    {
      id: 'shield-bot',
      title: 'Scanner & Malicious Bot Neutralizer',
      description: 'Blocks Sqlmap, Nikto, Dirbuster, and vulnerability scraper User-Agents automatically',
      category: 'Attack Shield',
      path: '/attack-modules',
      keywords: ['bot', 'crawler', 'sqlmap', 'nikto', 'dirbuster', 'nmap', 'scanner'],
      icon: <Flame className="w-3.5 h-3.5 text-rose-500" />
    },
    {
      id: 'shield-honeypot',
      title: 'Honeypot Decoy Trap Engine',
      description: 'Exposes simulated vulnerable admin endpoints to fingerprint and auto-ban hostile bots',
      category: 'Attack Shield',
      path: '/attack-modules',
      keywords: ['honeypot', 'decoy', 'trap', 'sink', 'fake admin', 'tarpit'],
      icon: <Flame className="w-3.5 h-3.5 text-rose-500" />
    }
  ], []);

  // Filter Search Results on letter typing
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return searchDatabase.slice(0, 5);
    }
    const query = searchQuery.toLowerCase().trim();
    return searchDatabase.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchDesc = item.description.toLowerCase().includes(query);
      const matchCat = item.category.toLowerCase().includes(query);
      const matchKw = item.keywords.some((kw) => kw.includes(query));
      return matchTitle || matchDesc || matchCat || matchKw;
    }).slice(0, 8);
  }, [searchQuery, searchDatabase]);

  const handleSelectResult = (item: SearchEntry) => {
    navigate(item.path);
    setSearchQuery('');
    setIsSearchOpen(false);
    searchInputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % (filteredResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults.length > 0 && filteredResults[selectedIndex]) {
        handleSelectResult(filteredResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setShowModeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Derive human-readable page title and breadcrumbs from location
  const pathnames = location.pathname.split('/').filter(Boolean);
  const currentPageTitle = (() => {
    if (pathnames.length === 0) return language === 'ta' ? 'கட்டுப்பாட்டு தளம்' : language === 'hi' ? 'नियंत्रण केंद्र' : 'Security Deck & Telemetry';
    const segment = pathnames[0];
    switch (segment) {
      case 'attack-modules': return language === 'ta' ? '20 தாக்குதல் கவசங்கள்' : language === 'hi' ? '20 सुरक्षा कवच' : '20 Attack Defense Modules';
      case 'prove-patch': return 'Prove-then-Patch Verifier';
      case 'demo-lab': return language === 'ta' ? 'நேரலை சோதனை' : language === 'hi' ? 'लाइव परीक्षण' : 'Live Defense Demo Lab';
      case 'traffic': return language === 'ta' ? 'போக்குவரத்து ஸ்ட்ரீம்' : language === 'hi' ? 'ट्रैफ़िक स्ट्रीम' : 'Proxy Streaming Telemetry';
      case 'rules': return 'ReDoS-Proof Virtual Patch Rules';
      case 'sites': return language === 'ta' ? 'இணையதளங்கள்' : language === 'hi' ? 'वेबसाइटें' : 'Protected Sites & Upstreams';
      case 'vulnerabilities': return 'Vulnerability Disclosures & CVEs';
      case 'agent': return 'AI Autonomous Virtual Patch Agent';
      case 'alerts': return language === 'ta' ? 'எச்சரிக்கைகள்' : language === 'hi' ? 'अलर्ट' : 'Real-Time Store Alerts';
      case 'reports': return language === 'ta' ? 'அறிக்கைகள்' : language === 'hi' ? 'रिपोर्ट' : 'Executive Security Reports';
      case 'metrics': return 'Engine Performance & Latency';
      case 'audit-log': return language === 'ta' ? 'தணிக்கை பதிவு' : language === 'hi' ? 'ऑडिट लॉग' : 'Immutable SecOps Audit Trail';
      case 'settings': return language === 'ta' ? 'அமைப்புகள்' : language === 'hi' ? 'सेटिंग्स' : 'System Configuration';
      case 'help': return language === 'ta' ? 'உதவி மையம்' : language === 'hi' ? 'सहायता केंद्र' : 'Documentation & Help';
      default: return segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
    }
  })();

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-obsidian-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-cyanteal-500/20 px-3 sm:px-4 lg:px-6 flex items-center justify-between shadow-xs dark:shadow-2xl transition-colors duration-150">
      {/* Left: Dynamic Breadcrumb & Compact Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-champagne-300 hover:bg-slate-100 dark:hover:bg-deepteal-700/30 transition-colors lg:hidden"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div>
          <div className="flex items-center space-x-1.5 text-[10px] font-medium text-slate-500 dark:text-iceteal-300">
            <Link to="/" className="hover:text-copper-600 dark:hover:text-champagne-300 transition font-semibold">PatchShield</Link>
            <span>/</span>
            <span className="text-slate-400 dark:text-slate-400 font-normal">
              {dashboardMode === 'simple' ? 'Shop' : 'SecOps'}
            </span>
            {pathnames.length > 0 && (
              <>
                <span>/</span>
                <span className="text-slate-900 dark:text-champagne-300 font-semibold truncate max-w-[140px] inline-block">{currentPageTitle}</span>
              </>
            )}
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-champagne-200 tracking-tight leading-none mt-0.5">
            {currentPageTitle}
          </h2>
        </div>
      </div>

      {/* Center: Compact Live Autocomplete Search Bar */}
      <div ref={searchContainerRef} className="hidden md:flex items-center relative w-60 lg:w-80">
        <Search className="w-3.5 h-3.5 text-slate-400 dark:text-iceteal-300/70 absolute left-3 z-10" />
        <input
          ref={searchInputRef}
          id="global-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsSearchOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            language === 'ta' 
              ? 'தேடுங்கள்: SQL, XSS, CVE...' 
              : language === 'hi' 
              ? 'खोजें: SQL, XSS, CVE...' 
              : 'Search SQLi, CVE, telemetry...'
          }
          className="w-full pl-8 pr-14 py-1.5 h-8 rounded-lg bg-slate-100/90 dark:bg-obsidian-900/90 border border-slate-200 dark:border-cyanteal-500/30 text-xs text-slate-900 dark:text-champagne-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-copper-500 dark:focus:ring-iceteal-300 focus:border-copper-500 dark:focus:border-iceteal-300 transition-all font-sans"
        />

        {searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
            className="absolute right-9 text-slate-400 hover:text-slate-600 dark:hover:text-champagne-200 p-0.5 rounded-full"
          >
            <X className="w-3 h-3" />
          </button>
        ) : null}

        <span className="absolute right-2.5 px-1.5 py-0.5 rounded bg-white dark:bg-obsidian-950/90 border border-slate-200 dark:border-cyanteal-500/30 text-[9px] font-mono font-semibold text-slate-500 dark:text-iceteal-300 flex items-center space-x-0.5 pointer-events-none">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </span>

        {/* Real-Time Autocomplete Suggestions Popup */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl glass-panel-elevated py-1.5 z-50 text-xs border border-slate-200 dark:border-cyanteal-500/40 shadow-xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-100">
            <div className="px-3 py-1 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-cyanteal-500/20 pb-1 mb-1">
              <span>{searchQuery ? `"${searchQuery}"` : 'Quick Suggestions'}</span>
              <span className="font-mono text-copper-600 dark:text-copper-400">↑↓ to navigate • ↵ select</span>
            </div>

            {filteredResults.length === 0 ? (
              <div className="px-3 py-4 text-center text-slate-400">
                <p className="font-semibold text-xs">No matching shields or rules found</p>
                <p className="text-[10px] mt-0.5 text-slate-500">Try searching "sql", "xss", "proxy", "cve"</p>
              </div>
            ) : (
              filteredResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-3 py-2 flex items-start space-x-2.5 transition-colors ${
                      isSelected
                        ? 'bg-copper-50 dark:bg-copper-500/20 text-copper-700 dark:text-copper-300 border-l-2 border-copper-600 dark:border-copper-500'
                        : 'text-slate-800 dark:text-champagne-300 hover:bg-slate-50 dark:hover:bg-deepteal-700/25'
                    }`}
                  >
                    <div className="mt-0.5 p-1 rounded bg-slate-100 dark:bg-obsidian-950 border border-slate-200 dark:border-cyanteal-500/30 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate text-slate-900 dark:text-champagne-200">
                          {item.title}
                        </span>
                        <span className={`text-[8px] px-1 py-0.5 rounded font-mono font-semibold ml-2 ${
                          item.category === 'Attack Shield' 
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' 
                            : item.category === 'CVE Rule'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                            : 'bg-teal-50 text-teal-700 dark:bg-deepteal-700/20 dark:text-iceteal-300 border border-teal-200 dark:border-deepteal-700/30'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className={`w-3 h-3 self-center flex-shrink-0 transition-opacity ${isSelected ? 'opacity-100 text-copper-600' : 'opacity-0'}`} />
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Compact Buttons */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Global Security Mode Pill Selector */}
        <div className="hidden xl:flex items-center bg-slate-100 dark:bg-obsidian-950/90 p-0.5 rounded-lg border border-slate-200 dark:border-cyanteal-500/25 text-[11px]">
          <button
            onClick={() => setGlobalMode('MONITOR')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-md font-semibold transition-all ${
              globalMode === 'MONITOR' 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 shadow-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-champagne-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{t('modes.monitor')}</span>
          </button>
          <button
            onClick={() => setGlobalMode('PROTECT')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-md font-semibold transition-all ${
              globalMode === 'PROTECT' 
                ? 'bg-deepteal-700 text-white border border-teal-600 shadow-xs font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-champagne-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-iceteal-200" />
            <span>{t('modes.protect')}</span>
          </button>
          <button
            onClick={() => setGlobalMode('STRICT')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-md font-semibold transition-all ${
              globalMode === 'STRICT' 
                ? 'bg-copper-600 text-white border border-copper-700 shadow-xs font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-champagne-200'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-white" />
            <span>{t('modes.strict')}</span>
          </button>
        </div>

        {/* Clean Mode Indicator linking directly to Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center space-x-1.5 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-cyanteal-500/30 bg-slate-100/90 dark:bg-obsidian-900/90 text-xs font-semibold text-slate-700 dark:text-champagne-300 hover:border-copper-500/40 dark:hover:border-iceteal-300/50 hover:bg-slate-200/80 dark:hover:bg-deepteal-700/30 transition-all shadow-xs"
          title="Manage Dashboard Experience Mode in Settings"
        >
          <span>{dashboardMode === 'simple' ? '🏪 Simple' : '⚡ Advanced'}</span>
        </button>

        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          title={isDark ? "Switch to Light Mode (☀️)" : "Switch to Dark Mode (🌙)"}
          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-cyanteal-500/30 bg-slate-100/90 dark:bg-obsidian-900/90 hover:bg-slate-200 dark:hover:bg-deepteal-700/30 flex items-center justify-center text-slate-700 dark:text-champagne-300 hover:text-copper-600 dark:hover:text-copper-400 transition-colors shadow-xs"
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-700" />
          )}
        </button>

        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center space-x-1 h-8 px-2 rounded-lg border border-slate-200 dark:border-cyanteal-500/30 bg-slate-100/90 dark:bg-obsidian-900/90 text-xs font-semibold text-slate-800 dark:text-champagne-300 hover:border-slate-300 dark:hover:border-iceteal-300/50 transition-colors shadow-xs"
          >
            <Globe2 className="w-3 h-3 text-copper-600 dark:text-iceteal-300" />
            <span className="text-[11px]">{language === 'en' ? 'EN' : language === 'ta' ? 'தமிழ்' : 'हिन्दी'}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-1.5 w-32 rounded-xl glass-panel-elevated py-1 z-50 text-xs border border-slate-200 dark:border-cyanteal-500/40 shadow-xl">
              {[
                { code: 'en', label: 'English' },
                { code: 'ta', label: 'தமிழ்' },
                { code: 'hi', label: 'हिन्दी' }
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code as any);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-deepteal-700/40 font-medium ${
                    language === l.code ? 'text-copper-600 dark:text-copper-400 font-bold bg-copper-50 dark:bg-copper-500/10' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Icon */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View Notifications"
            className="relative w-8 h-8 rounded-lg border border-slate-200 dark:border-cyanteal-500/30 bg-slate-100/90 dark:bg-obsidian-900/90 hover:bg-slate-200 dark:hover:bg-deepteal-700/30 flex items-center justify-center text-slate-700 dark:text-champagne-300 transition-colors shadow-xs"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-copper-500 ring-2 ring-white dark:ring-obsidian-900 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-72 glass-panel-elevated rounded-xl shadow-xl p-3 z-50 text-xs border border-slate-200 dark:border-cyanteal-500/40">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100 dark:border-cyanteal-500/20 font-semibold">
                <span className="text-slate-900 dark:text-champagne-200 font-bold">{t('topbar.notifications')}</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 dark:bg-deepteal-700/60 dark:text-iceteal-200 border border-emerald-200 dark:border-iceteal-300/30 px-1.5 py-0.2 rounded-full font-mono font-bold">
                  Protected
                </span>
              </div>
              <div className="py-2.5 text-slate-500 dark:text-slate-400 text-center text-[10px]">
                {language === 'ta' ? 'புதிய அச்சுறுத்தல்கள் இல்லை.' : language === 'hi' ? 'कोई नया ख़तरा नहीं है।' : 'All systems normal. 0 active incidents.'}
              </div>
            </div>
          )}
        </div>

        {/* Compact User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-lg bg-gradient-to-tr from-copper-500 via-deepteal-700 to-cyanteal-500 p-0.5 shadow-xs border border-white/10 cursor-pointer hover:opacity-95 transition-opacity"
          >
            <div className="w-full h-full rounded-[6px] bg-white dark:bg-obsidian-950 flex items-center justify-center text-copper-600 dark:text-champagne-200 font-bold text-[11px] uppercase">
              {username ? username[0] : 'P'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-44 glass-panel-elevated rounded-xl shadow-xl py-1 z-50 text-xs border border-slate-200 dark:border-cyanteal-500/40">
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-cyanteal-500/20">
                <p className="font-bold text-slate-900 dark:text-champagne-200 text-xs truncate">{username || 'SecOps Lead'}</p>
                <p className="text-[9px] text-teal-700 dark:text-iceteal-300 font-mono">{role || 'ADMIN'}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-deepteal-700/30 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-champagne-200 font-medium transition"
              >
                <UserIcon className="w-3 h-3 text-copper-600 dark:text-iceteal-300" />
                <span>{t('topbar.profile')}</span>
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center space-x-1.5 px-2.5 py-1.5 text-copper-600 dark:text-copper-400 hover:bg-copper-50 dark:hover:bg-copper-500/10 font-medium transition"
              >
                <LogOut className="w-3 h-3" />
                <span>{t('topbar.logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
