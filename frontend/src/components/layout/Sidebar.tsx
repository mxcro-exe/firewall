import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Globe, ShieldAlert, FileCode,
  GitCompare, Flame, Bot, Activity, Bell, FileText,
  BarChart3, History, Settings, HelpCircle, Sparkles,
  ChevronDown, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useMode } from '../../context/ModeContext';

interface SidebarProps {
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const { language, t } = useLanguage();
  const { dashboardMode } = useMode();
  const navigate = useNavigate();
  const [showAdvancedInSimple, setShowAdvancedInSimple] = useState(false);

  // Shopkeeper simple navigation items
  const shopkeeperNav = [
    { to: '/', label: language === 'ta' ? 'கடை பாதுகாப்பு' : language === 'hi' ? 'दुकान सुरक्षा' : 'Store Protection', icon: LayoutDashboard, exact: true },
    { to: '/sites', label: language === 'ta' ? 'இணையதளங்கள்' : language === 'hi' ? 'वेबसाइटें' : 'My Websites', icon: Globe },
    { to: '/demo-lab', label: language === 'ta' ? 'பாதுகாப்பு சோதனை' : language === 'hi' ? 'सुरक्षा परीक्षण' : 'Security Testing Lab', icon: Sparkles, badge: 'LAB' },
    { to: '/alerts', label: language === 'ta' ? 'எச்சரிக்கைகள்' : language === 'hi' ? 'सूचनाएं' : 'Store Alerts', icon: Bell },
    { to: '/reports', label: language === 'ta' ? 'அறிக்கைகள் (PDF)' : language === 'hi' ? 'रिपोर्ट (PDF)' : 'Safety Reports', icon: FileText, badge: 'PDF' },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
    { to: '/help', label: t('nav.help'), icon: HelpCircle },
  ];

  // Advanced SecOps items
  const advancedNav = [
    { to: '/attack-modules', label: language === 'ta' ? '20 தாக்குதல் கவசங்கள்' : language === 'hi' ? '20 सुरक्षा कवच' : '20 Attack Shields', icon: Flame, badge: '20 Def' },
    { to: '/prove-patch', label: 'Prove-then-Patch', icon: GitCompare, badge: 'PTP' },
    { to: '/rules', label: 'ReDoS Rules', icon: FileCode },
    { to: '/traffic', label: language === 'ta' ? 'போக்குவரத்து' : language === 'hi' ? 'ट्रैफ़िक' : 'Proxy Streaming', icon: Activity },
    { to: '/vulnerabilities', label: t('nav.vulnerabilities'), icon: ShieldAlert },
    { to: '/agent', label: t('nav.agent'), icon: Bot, badge: 'AI' },
    { to: '/metrics', label: t('nav.metrics'), icon: BarChart3, badge: 'PS5' },
    { to: '/audit-log', label: t('nav.auditLog'), icon: History },
  ];

  // Full SecOps list for advanced mode
  const fullSecOpsNav = [
    { to: '/', label: language === 'ta' ? 'கட்டுப்பாட்டு தளம்' : language === 'hi' ? 'सुरक्षा नियंत्रण' : 'Security Deck', icon: LayoutDashboard, exact: true },
    { to: '/attack-modules', label: language === 'ta' ? '20 தாக்குதல் கவசங்கள்' : language === 'hi' ? '20 सुरक्षा कवच' : '20 Attack Shields', icon: Flame, badge: '20 Def' },
    { to: '/prove-patch', label: 'Prove-then-Patch', icon: GitCompare, badge: 'PTP' },
    { to: '/demo-lab', label: language === 'ta' ? 'பாதுகாப்பு சோதனை' : language === 'hi' ? 'लाइव परीक्षण' : 'Security Testing Lab', icon: Sparkles, badge: 'LAB' },
    { to: '/traffic', label: language === 'ta' ? 'போக்குவரத்து' : language === 'hi' ? 'लाइव ट्रैफ़िक' : 'Proxy Streaming', icon: Activity },
    { to: '/rules', label: 'ReDoS Rules', icon: FileCode },
    { to: '/sites', label: t('nav.sites'), icon: Globe },
    { to: '/vulnerabilities', label: t('nav.vulnerabilities'), icon: ShieldAlert },
    { to: '/agent', label: t('nav.agent'), icon: Bot, badge: 'AI' },
    { to: '/alerts', label: t('nav.alerts'), icon: Bell },
    { to: '/reports', label: t('nav.reports'), icon: FileText },
    { to: '/metrics', label: t('nav.metrics'), icon: BarChart3, badge: 'PS5' },
    { to: '/audit-log', label: t('nav.auditLog'), icon: History },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
    { to: '/help', label: t('nav.help'), icon: HelpCircle },
  ];

  return (
    <aside
      className={`h-screen flex flex-col justify-between bg-white dark:bg-obsidian-950 border-r border-slate-200 dark:border-cyanteal-500/25 shadow-sm dark:shadow-2xl transition-all duration-200 ease-in-out shrink-0 z-40 overflow-hidden ${
        isCollapsed ? 'w-16' : 'w-[245px]'
      }`}
    >
      {/* 1. Brand Header - LOCKED AT TOP */}
      <div 
        onClick={() => navigate('/')}
        className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-cyanteal-500/20 space-x-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-deepteal-700/20 transition-colors shrink-0"
      >
        {/* Brand Squircle */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-copper-500 via-deepteal-700 to-emeraldink-900 flex items-center justify-center text-white shadow-xs border border-copper-400/30 shrink-0">
          <Shield className="w-4 h-4 text-champagne-300" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-xs tracking-tight text-slate-900 dark:text-champagne-300 truncate">
              PatchShield
            </h1>
            <p className="text-[10px] font-mono text-teal-700 dark:text-iceteal-300 font-semibold truncate">
              v2.0 WAF Gateway
            </p>
          </div>
        )}
      </div>

      {/* 2. Middle Navigation List - SPACIOUS, PROFESSIONAL & INDEPENDENTLY SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {dashboardMode === 'simple' ? (
          <>
            {!isCollapsed && (
              <div className="px-2 pt-1 pb-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-copper-400">
                  {language === 'ta' ? '🏪 எளிய மெனு' : language === 'hi' ? '🏪 सरल मेनू' : '🏪 Shopkeeper'}
                </span>
                <span className="text-[8px] px-2 py-0.5 rounded-full font-mono bg-copper-50 dark:bg-copper-500/20 text-copper-700 dark:text-copper-300 font-bold border border-copper-200 dark:border-copper-500/30">
                  SIMPLE
                </span>
              </div>
            )}

            {shopkeeperNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-copper-600 text-white shadow-sm font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-champagne-200 hover:bg-slate-100 dark:hover:bg-deepteal-700/25'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-iceteal-300'}`} />
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between truncate">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className={`ml-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                              isActive 
                                ? 'bg-black/25 text-white' 
                                : 'bg-slate-100 dark:bg-obsidian-850 text-slate-600 dark:text-iceteal-300 border border-slate-200 dark:border-cyanteal-500/30'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* Advanced Accordion in Simple Mode */}
            {!isCollapsed && (
              <div className="pt-2 mt-2 border-t border-slate-200/80 dark:border-cyanteal-500/20">
                <button
                  onClick={() => setShowAdvancedInSimple(!showAdvancedInSimple)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-iceteal-300 hover:text-slate-900 dark:hover:text-champagne-200 hover:bg-slate-100 dark:hover:bg-deepteal-700/25 transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <span>⚡</span>
                    <span>{language === 'ta' ? 'செக்ஆப்ஸ் கருவிகள்' : language === 'hi' ? 'सेकोप्स टूल्स' : 'SecOps Tools'}</span>
                  </span>
                  {showAdvancedInSimple ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {showAdvancedInSimple && (
                  <div className="mt-1 space-y-1 pl-2">
                    {advancedNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            `flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                              isActive
                                ? 'bg-teal-50 dark:bg-deepteal-700/60 text-teal-800 dark:text-champagne-200 font-bold border border-teal-200 dark:border-iceteal-300/30'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-champagne-300 hover:bg-slate-100 dark:hover:bg-deepteal-700/20'
                            }`
                          }
                        >
                          <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-iceteal-300" />
                          <span className="truncate">{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {!isCollapsed && (
              <div className="px-2 pt-1 pb-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-copper-400">
                  {language === 'ta' ? '⚡ செக்ஆப்ஸ் மெனு' : language === 'hi' ? '⚡ सेकोप्स मेनू' : '⚡ SecOps Command'}
                </span>
                <span className="text-[8px] px-2 py-0.5 rounded-full font-mono bg-teal-50 dark:bg-deepteal-700 text-teal-800 dark:text-iceteal-200 font-bold border border-teal-200 dark:border-iceteal-300/30">
                  ADVANCED
                </span>
              </div>
            )}

            {fullSecOpsNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-copper-600 text-white shadow-sm font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-champagne-200 hover:bg-slate-100 dark:hover:bg-deepteal-700/25'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-iceteal-300'}`} />
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between truncate">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className={`ml-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                              isActive 
                                ? 'bg-black/25 text-white' 
                                : 'bg-slate-100 dark:bg-obsidian-850 text-slate-600 dark:text-iceteal-300 border border-slate-200 dark:border-cyanteal-500/30'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </>
        )}
      </div>

      {/* 3. Bottom User Account Profile Card - 100% LOCKED & PINNED AT BOTTOM */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-slate-200 dark:border-cyanteal-500/20 shrink-0 bg-white/95 dark:bg-obsidian-950/95">
          <div 
            onClick={() => navigate('/settings')}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-900/90 hover:bg-slate-100 dark:hover:bg-deepteal-700/30 border border-slate-200 dark:border-cyanteal-500/25 flex items-center justify-between cursor-pointer transition-all shadow-xs"
          >
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-copper-500 to-deepteal-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs">
                PS
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 dark:text-champagne-300 truncate leading-snug">SecOps Lead</p>
                <p className="text-[10px] text-slate-500 dark:text-iceteal-300/80 truncate">admin@patchshield</p>
              </div>
            </div>
            <Settings className="w-4 h-4 text-slate-400 dark:text-iceteal-300 hover:text-copper-600 shrink-0 transition-colors" />
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-slate-200 dark:border-cyanteal-500/20 shrink-0 flex justify-center bg-white/95 dark:bg-obsidian-950/95">
          <button 
            onClick={() => navigate('/settings')} 
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-obsidian-900 hover:bg-slate-200 dark:hover:bg-deepteal-700/30 flex items-center justify-center text-slate-600 dark:text-iceteal-300 hover:text-copper-600 transition-colors shadow-xs"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
