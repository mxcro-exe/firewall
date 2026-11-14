import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Globe, ShieldAlert, FileCode,
  GitCompare, Flame, Bot, Activity, Bell, FileText,
  BarChart3, History, Settings, HelpCircle, CheckCircle2
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
    { to: '/audit-log', label: t('nav.auditLog'), icon: History },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
    { to: '/help', label: t('nav.help'), icon: HelpCircle },
  ];

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 flex-shrink-0">
          <Shield className="w-6 h-6 text-white" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm tracking-wide text-white truncate">
              {language === 'ta' ? 'பேட்ச்ஷீல்ட்' : 'PatchShield'}
            </h1>
            <p className="text-[10px] text-slate-400 font-mono truncate">
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
                `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-brand-300 border border-slate-700 font-mono">
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
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Gateway Status</span>
              <span className="flex items-center text-emerald-400 text-[10px] font-semibold">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Active (:8000)
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">ML Fallback</span>
              <span className="text-indigo-400 font-mono">23-feat RF Ready</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
