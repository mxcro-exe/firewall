import React, { useState, useEffect } from 'react';
import { 
  Menu, Search, Bell, Sun, Moon, Monitor, Globe2, 
  User as UserIcon, LogOut, ShieldCheck, ShieldAlert, Eye, Sliders
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
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
      {/* Left: Hamburger & Search */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden md:block w-72 lg:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder={t('topbar.search')}
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200 transition"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-500 dark:text-slate-300">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Middle: Global Security Mode Pill Selector */}
      <div className="hidden xl:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
        <button
          onClick={() => setGlobalMode('MONITOR')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-medium transition ${
            globalMode === 'MONITOR' 
              ? 'bg-amber-500 text-white shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t('modes.monitor')}</span>
        </button>
        <button
          onClick={() => setGlobalMode('PROTECT')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-medium transition ${
            globalMode === 'PROTECT' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('modes.protect')}</span>
        </button>
        <button
          onClick={() => setGlobalMode('STRICT')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-medium transition ${
            globalMode === 'STRICT' 
              ? 'bg-rose-600 text-white shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{t('modes.strict')}</span>
        </button>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center space-x-2">
        {/* Simple vs Advanced Toggle */}
        <button
          onClick={() => setDashboardMode(dashboardMode === 'simple' ? 'advanced' : 'simple')}
          className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          title="Toggle Simple / Advanced Mode"
        >
          <Sliders className="w-3.5 h-3.5 text-brand-500" />
          <span>{dashboardMode === 'simple' ? 'Simple' : 'Advanced'}</span>
        </button>

        {/* Language Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title="Switch Language / மொழி / भाषा"
          >
            <Globe2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>{language === 'en' ? 'English' : language === 'ta' ? 'தமிழ்' : 'हिन्दी'}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs">
              <button
                onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 ${
                  language === 'en' ? 'text-brand-600 dark:text-brand-400 font-bold bg-slate-50 dark:bg-slate-800/80' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>English</span>
                {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
              </button>
              <button
                onClick={() => { setLanguage('ta'); setShowLangMenu(false); }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 ${
                  language === 'ta' ? 'text-brand-600 dark:text-brand-400 font-bold bg-slate-50 dark:bg-slate-800/80' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>தமிழ்</span>
                {language === 'ta' && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
              </button>
              <button
                onClick={() => { setLanguage('hi'); setShowLangMenu(false); }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 ${
                  language === 'hi' ? 'text-brand-600 dark:text-brand-400 font-bold bg-slate-50 dark:bg-slate-800/80' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>हिन्दी</span>
                {language === 'hi' && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle Color Theme"
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View Notifications"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 z-50 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700 font-semibold">
                <span>{t('topbar.notifications')}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded">All systems secure</span>
              </div>
              <div className="py-3 text-slate-500 text-center">
                {language === 'ta' ? 'புதிய பாதுகாப்பு சிக்கல்கள் எதுவும் இல்லை' : 'No new urgent security incidents.'}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {username ? username[0] : 'A'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="font-semibold text-slate-900 dark:text-white">{username || 'Admin'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{role || 'ADMIN'}</p>
              </div>
              <a
                href="/settings"
                className="flex items-center space-x-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('topbar.profile')}</span>
              </a>
              <button
                onClick={logout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
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

