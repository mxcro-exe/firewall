import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Zap, ShieldCheck, TrendingDown, Target, Clock, ArrowDownRight, Layers
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export const Metrics: React.FC = () => {
  const { language, t } = useLanguage();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/metrics/');
        setMetrics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading || !metrics) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading benchmark metrics...</div>;
  }

  const { kpis, stats, timeline } = metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t('nav.metrics')} (Nasscom ARB 2.0 PS5 Target KPIs)
        </h2>
        <p className="text-xs text-slate-500">
          Quantifiable evaluation benchmarks for AI-Era Virtual Patching for Indian SMBs.
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* KPI 1: MTTVP */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Mean Time to Virtual Patch (MTTVP)</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-emerald-500">
              {kpis.mean_time_to_virtual_patch}
            </span>
            <span className="text-[11px] text-slate-400 line-through">
              vs {kpis.traditional_patching_delay}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Shrinks the CVE-to-protection window from weeks to minutes.
          </p>
        </div>

        {/* KPI 2: Exposure Window Reduction */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Exposure Window Reduction</span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-500">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-brand-500">
              {kpis.exposure_window_reduction}
            </span>
            <span className="text-[11px] text-emerald-500 font-bold">Reduction</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Eliminates 96%+ of the vulnerable gap before upstream source patches arrive.
          </p>
        </div>

        {/* KPI 3: False-Block Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>False-Block Rate (Production Traffic)</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-emerald-400">
              {kpis.false_block_rate}
            </span>
            <span className="text-[11px] text-emerald-500 font-medium">Verified by Replay</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Zero legitimate shoppers or customers blocked thanks to Stage 2 Replay.
          </p>
        </div>
      </div>

      {/* Secondary Benchmark Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 text-[11px]">Known CVE Coverage:</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{kpis.known_cve_coverage}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 text-[11px]">SMB Onboarding Time:</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{kpis.onboarding_time}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 text-[11px]">Overall Security Health Score:</span>
          <p className="text-lg font-bold text-emerald-500 mt-1">{stats.overall_health_score}/100 (Grade A)</p>
        </div>
      </div>

      {/* Visual Chart: Attacks Blocked vs Legitimate Traffic */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Traffic Telemetry & Blocked Intrusion Trends (24h)
            </h3>
            <p className="text-xs text-slate-500">
              Legitimate customer requests allowed through vs malicious exploits neutralized at the gateway.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-1.5" /> Legitimate Traffic
            </span>
            <span className="flex items-center text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5" /> Attacks Blocked
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="colorLegit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="legitimate_traffic" stroke="#6366f1" fillOpacity={1} fill="url(#colorLegit)" name="Normal Traffic" />
              <Area type="monotone" dataKey="attacks_blocked" stroke="#ef4444" fillOpacity={1} fill="url(#colorAttacks)" name="Blocked Exploits" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
