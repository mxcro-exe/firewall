import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ModeProvider } from './context/ModeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

import { ProductionDashboardContent } from './components/dashboard/ProductionDashboardLayout';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Sites } from './pages/Sites';
import { Vulnerabilities } from './pages/Vulnerabilities';
import { Rules } from './pages/Rules';
import { ProvePatch } from './pages/ProvePatch';
import { AttackModules } from './pages/AttackModules';
import { AgentTimeline } from './pages/AgentTimeline';
import { Traffic } from './pages/Traffic';
import { Alerts } from './pages/Alerts';
import { Reports } from './pages/Reports';
import { Metrics } from './pages/Metrics';
import { DemoLab } from './pages/DemoLab';
import { AuditLog } from './pages/AuditLog';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { NotFound } from './pages/NotFound';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Master Production Layout for all routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Root Route: Clean Light Bento Grid Dashboard */}
          <Route index element={<ProductionDashboardContent />} />
          <Route path="sites" element={<Sites />} />
          <Route path="vulnerabilities" element={<Vulnerabilities />} />
          <Route path="rules" element={<Rules />} />
          <Route path="prove-patch" element={<ProvePatch />} />
          <Route path="attack-modules" element={<AttackModules />} />
          <Route path="agent" element={<AgentTimeline />} />
          <Route path="traffic" element={<Traffic />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="metrics" element={<Metrics />} />
          <Route path="demo-lab" element={<DemoLab />} />
          <Route path="audit-log" element={<AuditLog />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ModeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ModeProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
