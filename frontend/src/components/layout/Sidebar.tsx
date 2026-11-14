import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Globe, ShieldAlert, FileCode,
  GitCompare, Flame, Bot, Activity, Bell, FileText,
  BarChart3, History, Settings, HelpCircle, CheckCircle2, Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { language, t } = useLanguage();

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/sites', label: t('nav.sites'), icon: Globe },
    { to: '/vulnerabilities', label: t('nav.vulnerabilities'), icon: ShieldAlert },
    { to: '/rules', label: t('nav.rules'), icon: FileCode },
    { to: '/prove-patch', label: t('nav.provePatch'), icon: GitCompare, badge: 'PTP' },
    { to: '/attack-modules', label: t('nav.attackModules'), icon: Flame, badge: '7 Def' },
    { to: '/agent', label: t('nav.agent'), icon: Bot, badge: 'AI' },
    { to: '/traffic', label: t('nav.traffic'), icon: Activity },
    { to: '/alerts', label: t('nav.alerts'), icon: Bell },
    { to: '/reports', label: t('nav.reports'), icon: FileText },
    { to: '/metrics', label: t('nav.metrics'), icon: BarChart3, badge: 'PS5' },
    { to: '/demo-lab', label: t('nav.demoLab'), icon: Sparkles, badge: 'DEMO' },
    { to: '/audit-log', label: t('nav.auditLog'), icon: History },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
    { to: '/help', label: t('nav.help'), icon: HelpCircle },
  ];

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-obsidian-950/85 backdrop-blur-2xl border-r border-cyanteal-500/20 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-cyanteal-500/20 space-x-3 bg-obsidian-900/40">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-copper-500 via-deepteal-700 to-cyanteal-500 flex items-center justify-center shadow-lg shadow-copper-500/20 flex-shrink-0 border border-white/10">
          <Shield className="w-5 h-5 text-cream-300" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm tracking-wide text-cream-300 truncate">
              {language === 'ta' ? 'பேட்ச்ஷீல்ட்' : language === 'hi' ? 'पैचशील्ड' : 'PatchShield'}
            </h1>
            <p className="text-[10px] text-iceteal-300 font-mono truncate">
              v1.0 Virtual Patching
            </p>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-deepteal-700/80 to-cyanteal-500/60 text-cream-200 shadow-md shadow-cyanteal-500/20 border border-iceteal-300/30'
                    : 'text-slate-400 hover:text-cream-300 hover:bg-cyanteal-500/10'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-obsidian-850 text-iceteal-300 border border-cyanteal-500/30 font-mono">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Gateway Engine Status */}
      {!isCollapsed && (
        <div className="p-3 border-t border-cyanteal-500/20 bg-obsidian-950/60">
          <div className="p-2.5 rounded-2xl glass-panel text-[11px] text-slate-300 space-y-1.5 border border-cyanteal-500/25">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Gateway Status</span>
              <span className="flex items-center text-iceteal-300 text-[10px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                Active (:8000)
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">ML Fallback</span>
              <span className="text-cream-300 font-mono">23-feat RF Ready</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
