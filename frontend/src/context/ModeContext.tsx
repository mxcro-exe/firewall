import React, { createContext, useContext, useState } from 'react';

type DashboardMode = 'simple' | 'advanced';
type GlobalSecurityMode = 'MONITOR' | 'PROTECT' | 'STRICT';

interface ModeContextType {
  dashboardMode: DashboardMode;
  setDashboardMode: (mode: DashboardMode) => void;
  globalMode: GlobalSecurityMode;
  setGlobalMode: (mode: GlobalSecurityMode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardMode, setDashboardModeState] = useState<DashboardMode>(() => {
    return (localStorage.getItem('patchshield_ui_mode') as DashboardMode) || 'simple';
  });

  const [globalMode, setGlobalModeState] = useState<GlobalSecurityMode>('PROTECT');

  const setDashboardMode = (mode: DashboardMode) => {
    setDashboardModeState(mode);
    localStorage.setItem('patchshield_ui_mode', mode);
  };

  const setGlobalMode = (mode: GlobalSecurityMode) => {
    setGlobalModeState(mode);
  };

  return (
    <ModeContext.Provider value={{ dashboardMode, setDashboardMode, globalMode, setGlobalMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) throw new Error('useMode must be used within ModeProvider');
  return context;
};

