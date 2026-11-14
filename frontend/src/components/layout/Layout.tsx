import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';

export const Layout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-obsidian-900 text-slate-100 selection:bg-iceteal-300 selection:text-obsidian-950">
      {/* Ambient Cyber Flares (Matches User's Palette Reference) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Warm Sunset Copper Glow on Left */}
        <div className="absolute -left-48 top-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-copper-500/15 to-transparent blur-[120px]" />
        {/* Cool Ice Teal Glow on Right */}
        <div className="absolute -right-48 top-1/3 h-[550px] w-[550px] rounded-full bg-gradient-to-bl from-iceteal-300/15 via-cyanteal-500/10 to-transparent blur-[120px]" />
        {/* Deep bottom subtle flare */}
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[600px] rounded-full bg-deepteal-700/20 blur-[140px]" />
      </div>

      {/* Main App Layout */}
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4">
              <Breadcrumbs />
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
