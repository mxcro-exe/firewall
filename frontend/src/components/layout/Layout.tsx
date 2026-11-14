import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-obsidian-900 text-slate-800 dark:text-champagne-300 font-sans flex antialiased overflow-hidden selection:bg-copper-500 selection:text-white transition-colors duration-150">
      {/* 60-30-10 Ambient Flares (Soft in light mode, cinematic in dark) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-20 dark:opacity-100 transition-opacity duration-200">
        <div className="absolute -left-48 top-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-copper-500/15 to-transparent blur-[120px]" />
        <div className="absolute -right-48 top-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-iceteal-300/12 via-cyanteal-500/10 to-transparent blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[600px] rounded-full bg-emeraldink-900/10 dark:bg-emeraldink-900/25 blur-[140px]" />
      </div>

      {/* Fixed Left Navigation Rail */}
      <div className="relative z-20 flex-shrink-0">
        <Sidebar isCollapsed={isSidebarCollapsed} />
      </div>

      {/* Main App Shell */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 min-h-screen">
        <TopBar
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        
        {/* Compact Main Container */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 lg:p-5 space-y-4 max-w-7xl mx-auto w-full">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
