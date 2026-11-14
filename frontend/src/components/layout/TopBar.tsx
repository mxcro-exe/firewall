import React, { useState, useEffect } from 'react';
import { 
  Menu, Search, Bell, Sun, Moon, Monitor, Globe2, 
  User as UserIcon, LogOut, ShieldCheck, ShieldAlert, Eye, Sliders, Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useMode } from '../../context/ModeContext';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { dashboardMode, setDashboardMode, globalMode, setGlobalMode } = useMode();
  const { username, role, logout } = useAuth();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Global Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-obsidian-950/75 backdrop-blur-2xl border-b border-cyanteal-500/20 px-4 flex items-center justify-between">
      {/* Left: Hamburger & Search */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
          className="p-2 rounded-xl text-slate-300 hover:text-cream-300 hover:bg-cyanteal-500/20 transition-all duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden md:block w-72 lg:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-iceteal-300/70" />
          <input
            id="global-search-input"
            type="text"
            placeholder={t('topbar.search')}
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-obsidian-850/90 border border-cyanteal-500/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-iceteal-300 focus:border-iceteal-300 text-cream-200 placeholder:text-slate-500 transition-all duration-200"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono bg-obsidian-950/90 border border-cyanteal-500/30 rounded-md text-iceteal-300">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Middle: Global Security Mode Pill Selector */}
      <div className="hidden xl:flex items-center bg-obsidian-950/80 p-1 rounded-2xl border border-cyanteal-500/25 text-xs">
        <button
          onClick={() => setGlobalMode('MONITOR')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl font-medium transition-all duration-200 ${
            globalMode === 'MONITOR' 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
              : 'text-slate-400 hover:text-cream-200 hover:bg-cyanteal-500/10'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t('modes.monitor')}</span>
        </button>
        <button
          onClick={() => setGlobalMode('PROTECT')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl font-medium transition-all duration-200 ${
            globalMode === 'PROTECT' 
              ? 'bg-gradient-to-r from-deepteal-700 to-cyanteal-500 text-cream-200 border border-iceteal-300/40 shadow-glow-teal font-semibold' 
              : 'text-slate-400 hover:text-cream-200 hover:bg-cyanteal-500/10'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-iceteal-300" />
          <span>{t('modes.protect')}</span>
        </button>
        <button
          onClick={() => setGlobalMode('STRICT')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl font-medium transition-all duration-200 ${
            globalMode === 'STRICT' 
              ? 'bg-copper-500/25 text-copper-300 border border-copper-500/40 shadow-glow-copper font-semibold' 
              : 'text-slate-400 hover:text-cream-200 hover:bg-cyanteal-500/10'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{t('modes.strict')}</span>
        </button>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center space-x-2">
        {/* Simple (Shopkeeper) vs Advanced (SecOps) Dual Segmented Switch */}
        <div className="flex items-center p-0.5 rounded-2xl bg-obsidian-950 border border-cyanteal-500/30 text-xs">
          <button
            onClick={() => setDashboardMode('simple')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-medium transition-all duration-200 ${
              dashboardMode === 'simple'
                ? 'bg-gradient-to-r from-copper-500 to-copper-600 text-cream-100 shadow-glow-copper font-bold'
                : 'text-slate-400 hover:text-cream-200 hover:bg-cyanteal-500/10'
            }`}
            title="Simple Mode for Store Owners / Shopkeepers"
          >
            <span>🏪</span>
            <span className="hidden sm:inline font-sans text-[11px]">
              {language === 'ta' ? 'எளிய முறை (வணிகர்)' : language === 'hi' ? 'सरल मोड (व्यापारी)' : 'Simple (Shopkeeper)'}
            </span>
          </button>
          <button
            onClick={() => setDashboardMode('advanced')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-medium transition-all duration-200 ${
              dashboardMode === 'advanced'
                ? 'bg-gradient-to-r from-deepteal-700 to-cyanteal-500 text-cream-200 border border-iceteal-300/40 shadow-glow-teal font-bold'
                : 'text-slate-400 hover:text-cream-200 hover:bg-cyanteal-500/10'
            }`}
            title="Advanced Mode for Security Engineers / DevOps"
          >
            <Sliders className="w-3 h-3 text-iceteal-300" />
            <span className="hidden sm:inline font-sans text-[11px]">
              {language === 'ta' ? 'மேம்பட்ட முறை (SecOps)' : language === 'hi' ? 'उन्नत मोड (SecOps)' : 'Advanced (SecOps)'}
            </span>
          </button>
        </div>

        {/* Language Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-cyanteal-500/30 bg-obsidian-850/80 text-xs font-semibold text-cream-300 hover:border-iceteal-300/50 transition-all duration-200"
            title="Switch Language / மொழி / भाषा"
          >
            <Globe2 className="w-3.5 h-3.5 text-iceteal-300" />
            <span>{language === 'en' ? 'English' : language === 'ta' ? 'தமிழ்' : 'हिन्दी'}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-36 glass-panel-elevated rounded-2xl shadow-2xl py-1 z-50 text-xs border border-cyanteal-500/40 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-cyanteal-500/20 ${
                  language === 'en' ? 'text-iceteal-300 font-bold bg-deepteal-700/40' : 'text-slate-300'
                }`}
              >
                <span>English</span>
                {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-iceteal-300 shadow-glow-teal" />}
              </button>
              <button
                onClick={() => { setLanguage('ta'); setShowLangMenu(false); }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-cyanteal-500/20 ${
                  language === 'ta' ? 'text-iceteal-300 font-bold bg-deepteal-700/40' : 'text-slate-300'
                }`}
              >
                <span>தமிழ்</span>
                {language === 'ta' && <span className="w-1.5 h-1.5 rounded-full bg-iceteal-300 shadow-glow-teal" />}
              </button>
              <button
                onClick={() => { setLanguage('hi'); setShowLangMenu(false); }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-cyanteal-500/20 ${
                  language === 'hi' ? 'text-iceteal-300 font-bold bg-deepteal-700/40' : 'text-slate-300'
                }`}
              >
                <span>हिन्दी</span>
                {language === 'hi' && <span className="w-1.5 h-1.5 rounded-full bg-iceteal-300 shadow-glow-teal" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View Notifications"
            className="p-2 rounded-xl text-slate-300 hover:text-cream-300 hover:bg-cyanteal-500/20 transition-all duration-200 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel-elevated border border-cyanteal-500/40 rounded-2xl shadow-2xl p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center pb-2 border-b border-cyanteal-500/20 font-semibold">
                <span className="text-cream-300">{t('topbar.notifications')}</span>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  All systems secure
                </span>
              </div>
              <div className="py-3 text-slate-400 text-center font-sans text-[11px]">
                {language === 'ta' ? 'புதிய பாதுகாப்பு சிக்கல்கள் எதுவும் இல்லை' : language === 'hi' ? 'कोई नया सुरक्षा ख़तरा नहीं है' : 'No new urgent security incidents.'}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-cyanteal-500/20 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-copper-500 via-deepteal-700 to-cyanteal-500 text-cream-200 flex items-center justify-center font-bold text-xs uppercase shadow-md border border-white/10 ring-1 ring-copper-500/30">
              {username ? username[0] : 'A'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 glass-panel-elevated border border-cyanteal-500/40 rounded-2xl shadow-2xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-cyanteal-500/20">
                <p className="font-semibold text-cream-200">{username || 'Admin'}</p>
                <p className="text-[10px] text-iceteal-300 font-mono tracking-wider">{role || 'ADMIN'}</p>
              </div>
              <a
                href="/settings"
                className="flex items-center space-x-2 px-3 py-2 hover:bg-cyanteal-500/20 text-slate-300 hover:text-cream-200 transition"
              >
                <UserIcon className="w-3.5 h-3.5 text-iceteal-300" />
                <span>{t('topbar.profile')}</span>
              </a>
              <button
                onClick={logout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-copper-400 hover:bg-copper-500/10 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('topbar.logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
