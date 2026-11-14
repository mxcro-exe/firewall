import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Activity, Bell, Search, Filter, Sliders, ChevronDown,
  ArrowUpRight, ArrowDownRight, Layers, Sparkles, User, Settings,
  CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Terminal,
  Server, Zap, Lock, Eye, BarChart3, Database, Command
} from 'lucide-react';

// =========================================================================
// TYPE DEFINITIONS (Domain-Agnostic & Fully Extensible)
// =========================================================================
export interface KPICardData {
  id: string;
  label: string;
  value: string | number;
  changePercent: number;
  isPositive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  sparklineData: number[]; // Array of normalized points (0-100)
}

export interface ActivityItem {
  id: string;
  title: string;
  category: string;
  timestamp: string;
  tag: string;
  tagType?: 'success' | 'warning' | 'error' | 'info';
  icon: React.ComponentType<{ className?: string }>;
}

export interface ProductionDashboardProps {
  brandName?: string;
  brandTagline?: string;
  pageTitle?: string;
  breadcrumbs?: string[];
  kpiMetrics?: KPICardData[];
  activityFeed?: ActivityItem[];
  onActionTrigger?: (sliderValue: number) => void;
}

// =========================================================================
// MINI SVG SPARKLINE COMPONENT (Smooth Spline with Gradient Fill)
// =========================================================================
const MiniSparkline: React.FC<{ data: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  const width = 100;
  const height = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
  const gradientId = `sparkline-grad-${Math.random().toString(36).substr(2, 9)}`;
  const strokeColor = isPositive ? '#10B981' : '#F43F5E';
  const fillColor = isPositive ? '#10B981' : '#F43F5E';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// =========================================================================
// MASTER PRODUCTION DASHBOARD COMPONENT
// =========================================================================
export const ProductionDashboardLayout: React.FC<ProductionDashboardProps> = ({
  brandName = "PatchShield Enterprise",
  brandTagline = "v2.0 Autonomous WAF",
  pageTitle = "Security Overview & Telemetry",
  breadcrumbs = ["Home", "Gateways", "Live Telemetry"],
  kpiMetrics,
  activityFeed,
  onActionTrigger
}) => {
  // Navigation active state
  const [activeNav, setActiveNav] = useState('overview');

  // Interactive slider & threshold state
  const [sliderValue, setSliderValue] = useState<number>(85);
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Default Mock Data for Domain-Agnostic Preview
  const defaultKPIs: KPICardData[] = [
    {
      id: 'kpi-1',
      label: 'Inspected Requests',
      value: '4.82M',
      changePercent: 14.2,
      isPositive: true,
      icon: Activity,
      sparklineData: [45, 52, 58, 65, 72, 85, 92]
    },
    {
      id: 'kpi-2',
      label: 'Zero-Day Blocks',
      value: '1,429',
      changePercent: 8.4,
      isPositive: true,
      icon: Shield,
      sparklineData: [30, 42, 38, 55, 60, 75, 80]
    },
    {
      id: 'kpi-3',
      label: 'P99 Engine Latency',
      value: '0.84ms',
      changePercent: -18.5,
      isPositive: true,
      icon: Zap,
      sparklineData: [90, 85, 70, 65, 50, 40, 35]
    },
    {
      id: 'kpi-4',
      label: 'System Health Bench',
      value: '99.98%',
      changePercent: 0.2,
      isPositive: true,
      icon: Server,
      sparklineData: [88, 92, 94, 96, 98, 99, 100]
    }
  ];

  const metrics = kpiMetrics || defaultKPIs;

  const defaultActivities: ActivityItem[] = [
    {
      id: 'act-1',
      title: 'SQL Injection Payload Terminated',
      category: 'AST AST Module • Scoped Rule #104',
      timestamp: 'Just now',
      tag: '403 FORBIDDEN',
      tagType: 'error',
      icon: Database
    },
    {
      id: 'act-2',
      title: 'SSRF Cloud Metadata Probe Dropped',
      category: '169.254.169.254 • AWS IMDSv2 Guard',
      timestamp: '2m ago',
      tag: 'TCP_DROP',
      tagType: 'warning',
      icon: Shield
    },
    {
      id: 'act-3',
      title: 'Automated Prove-then-Patch Verifier Pass',
      category: 'Sandbox Replay • SHA256 Integrity Verified',
      timestamp: '8m ago',
      tag: 'RULE_PROVEN',
      tagType: 'success',
      icon: CheckCircle2
    },
    {
      id: 'act-4',
      title: 'Microsecond Rate Limit Enforced',
      category: 'Sliding Window Token Bucket • IP: 198.51.100.42',
      timestamp: '14m ago',
      tag: '429 THROTTLED',
      tagType: 'info',
      icon: Sliders
    }
  ];

  const activities = activityFeed || defaultActivities;

  const handleApplyThreshold = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (onActionTrigger) onActionTrigger(sliderValue);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex antialiased selection:bg-[#2563EB]/10 selection:text-[#2563EB]">
      {/* ========================================================================= */}
      {/* A. LEFT NAVIGATION RAIL (Fixed 260px) */}
      {/* ========================================================================= */}
      <aside className="w-[260px] flex-shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col justify-between hidden lg:flex sticky top-0 h-screen z-30">
        <div>
          {/* Brand section */}
          <div className="h-20 flex items-center px-6 border-b border-[#E2E8F0] space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] flex items-center justify-center text-white shadow-md shadow-[#2563EB]/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-slate-900">{brandName}</h1>
              <p className="text-[11px] font-medium text-slate-400">{brandTagline}</p>
            </div>
          </div>

          {/* Navigation Menu Items */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'overview', label: 'Security Deck', icon: Activity, badge: 'Live' },
              { id: 'modules', label: '20 Attack Shields', icon: Shield, badge: '20 Active' },
              { id: 'prove_patch', label: 'Prove-then-Patch', icon: CheckCircle2, badge: 'PTP' },
              { id: 'telemetry', label: 'Proxy Streaming', icon: BarChart3 },
              { id: 'rules', label: 'ReDoS-Proof Rules', icon: Layers },
              { id: 'audit', label: 'Audit Logs', icon: Terminal }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#EBF3FE] text-[#2563EB] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Slot: User Account Settings */}
        <div className="p-4 border-t border-[#E2E8F0]">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                PS
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">SecOps Lead</p>
                <p className="text-[10px] text-slate-400 truncate">admin@patchshield</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ========================================================================= */}
        {/* B. TOP NAVIGATION BAR */}
        {/* ========================================================================= */}
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          {/* Left: Dynamic Title & Breadcrumb Hierarchy */}
          <div>
            <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-400">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <span className="hover:text-slate-600 cursor-pointer">{crumb}</span>
                  {idx < breadcrumbs.length - 1 && <span>/</span>}
                </React.Fragment>
              ))}
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{pageTitle}</h2>
          </div>

          {/* Center: Quick Search Input with Shortcut Badge */}
          <div className="hidden md:flex items-center relative w-72 lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Search telemetry, CVE rules, IPs..."
              className="w-full pl-9 pr-12 py-2 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
            <span className="absolute right-3 px-1.5 py-0.5 rounded-md bg-white border border-[#E2E8F0] text-[10px] font-mono font-semibold text-slate-400 flex items-center space-x-0.5">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </span>
          </div>

          {/* Right: Action Pills & User Profile */}
          <div className="flex items-center space-x-3">
            {/* Filter / Date-Range Selector Pill */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-[#E2E8F0] text-xs font-semibold">
              {['1h', '24h', '7d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    timeRange === range
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Notification Icon with Alert Dot */}
            <button className="relative w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-white animate-pulse" />
            </button>

            {/* User Avatar Dropdown */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] p-0.5 shadow-sm cursor-pointer hover:opacity-95 transition-opacity">
              <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center text-[#2563EB] font-bold text-xs">
                OP
              </div>
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* C. MAIN RESPONSIVE BENTO GRID CONTENT */}
        {/* ========================================================================= */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* SECTION 1: TOP ROW (4 KPI METRIC CARDS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={kpi.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  whileHover={{ scale: 1.01 }}
                  className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3 transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF3FE] text-[#2563EB] flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      kpi.isPositive
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                        : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                    }`}>
                      {kpi.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      <span>{kpi.changePercent > 0 ? `+${kpi.changePercent}%` : `${kpi.changePercent}%`}</span>
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                    <div className="flex items-baseline justify-between mt-1">
                      <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{kpi.value}</h3>
                      <MiniSparkline data={kpi.sparklineData} isPositive={kpi.isPositive} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* SECTION 2: MIDDLE ROW (8:4 SPLIT GRID) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT (8 COLUMNS) - PRIMARY ANALYTICS VISUALIZER */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="lg:col-span-8 p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Live Traffic & Attack Intercept Stream</h3>
                  <p className="text-xs text-slate-500">Sub-millisecond ingress telemetry via non-blocking chunked proxy.</p>
                </div>

                <div className="flex items-center space-x-4 text-xs font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                    <span className="text-slate-600">Clean Shoppers</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]" />
                    <span className="text-slate-600">Threat Intercepts</span>
                  </div>
                </div>
              </div>

              {/* Dynamic SVG Spline Area Chart */}
              <div className="h-64 w-full relative flex items-end">
                <svg viewBox="0 0 800 240" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="area-blue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="area-teal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.20" />
                      <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Vertical Subtle Grid Lines */}
                  {[100, 250, 400, 550, 700].map((x) => (
                    <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                  ))}

                  {/* Stream 1 (Blue Spline - Clean Shoppers) */}
                  <path
                    d="M 0,180 C 150,140 250,210 400,120 C 550,40 680,110 800,60 L 800,220 L 0,220 Z"
                    fill="url(#area-blue)"
                  />
                  <path
                    d="M 0,180 C 150,140 250,210 400,120 C 550,40 680,110 800,60"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Stream 2 (Teal Spline - Intercepts) */}
                  <path
                    d="M 0,210 C 140,190 280,170 420,195 C 560,210 690,160 800,180 L 800,220 L 0,220 Z"
                    fill="url(#area-teal)"
                  />
                  <path
                    d="M 0,210 C 140,190 280,170 420,195 C 560,210 690,160 800,180"
                    fill="none"
                    stroke="#14B8A6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="4 2"
                  />
                </svg>
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                <span>00:00 UTC</span>
                <span>06:00 UTC</span>
                <span>12:00 UTC</span>
                <span>18:00 UTC</span>
                <span>NOW (LIVE)</span>
              </div>
            </motion.div>

            {/* RIGHT (4 COLUMNS) - FLOATING INTERACTIVE CONTROL CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              whileHover={{ scale: 1.01 }}
              className="lg:col-span-4 p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_0_25px_rgba(20,184,166,0.18)] flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              {/* Top Status Pill Badge */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#14B8A6]/10 text-[#0D9488] border border-[#14B8A6]/30 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse" />
                  <span>AUTONOMOUS ENGINE</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">PTP-VERIFIED</span>
              </div>

              {/* Dynamic Numerical Display Updating on Input */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Mitigation Sensitivity
                </p>
                <div className="flex items-baseline space-x-2">
                  <motion.span
                    key={sliderValue}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-extrabold text-[#2563EB] tracking-tight font-mono"
                  >
                    {sliderValue}%
                  </motion.span>
                  <span className="text-xs font-bold text-slate-400">Strictness Threshold</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pt-1">
                  Adjusting dynamically tunes the AST token matcher sensitivity and token bucket burst ceiling.
                </p>
              </div>

              {/* Interactive Range Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Balanced (50%)</span>
                  <span>Strict (100%)</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                />
              </div>

              {/* Contextual Action Trigger Button */}
              <button
                onClick={handleApplyThreshold}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#14B8A6] hover:from-[#1D4ED8] hover:to-[#0D9488] text-white font-bold text-xs shadow-md shadow-[#2563EB]/25 transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synchronizing Gateways...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Enforce Dynamic Policy ({sliderValue}%)</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* SECTION 3: BOTTOM ROW (DATA FEED / ACTIVITY TABLE) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.5 }}
            className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Live Incident & Packet Intercept Log</h3>
                <p className="text-xs text-slate-500">O(1) in-memory decisions captured at ingress gateway boundary.</p>
              </div>
              <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Filter Incidents</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Security Event</th>
                    <th className="py-2.5 px-3">Diagnostic Scope</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3 text-right">Defense Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {activities.map((act) => {
                    const ActIcon = act.icon;
                    return (
                      <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                            <ActIcon className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900 truncate max-w-md">{act.title}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{act.category}</td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">{act.timestamp}</td>
                        <td className="py-3 px-3 text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold ${
                            act.tagType === 'error'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                              : act.tagType === 'warning'
                              ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                              : act.tagType === 'info'
                              ? 'bg-blue-50 text-blue-600 border border-blue-200/60'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                          }`}>
                            {act.tag}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* SECTION 4: FOOTER HIGHLIGHTS (4 Horizontal Minimalist Feature Pills) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {[
              { label: 'Clean Architecture', desc: 'Modular & Fully Typed', icon: Layers },
              { label: 'Smooth Motion', desc: 'Framer Motion Transitions', icon: Sparkles },
              { label: 'Modern Light Theme', desc: '#F8FAFC & #FFFFFF Cards', icon: Shield },
              { label: 'Responsive Bento Grid', desc: '100% Adaptive Viewports', icon: CheckCircle2 }
            ].map((pill, idx) => {
              const PillIcon = pill.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex items-center space-x-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#EBF3FE] text-[#2563EB] flex items-center justify-center flex-shrink-0">
                    <PillIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">{pill.label}</p>
                    <p className="text-[10px] text-slate-400">{pill.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};
