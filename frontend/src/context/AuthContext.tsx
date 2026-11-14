import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  username: string | null;
  role: string | null;
  isFirstRunCompleted: boolean;
  login: (token: string, username: string, role: string, firstRun: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('patchshield_token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('patchshield_user'));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('patchshield_role'));
  const [isFirstRunCompleted, setIsFirstRunCompleted] = useState<boolean>(() => {
    return localStorage.getItem('patchshield_first_run') === 'true';
  });

  const login = (newToken: string, user: string, userRole: string, firstRun: boolean) => {
    setToken(newToken);
    setUsername(user);
    setRole(userRole);
    setIsFirstRunCompleted(firstRun);
    localStorage.setItem('patchshield_token', newToken);
    localStorage.setItem('patchshield_user', user);
    localStorage.setItem('patchshield_role', userRole);
    localStorage.setItem('patchshield_first_run', String(firstRun));
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    setRole(null);
    localStorage.removeItem('patchshield_token');
    localStorage.removeItem('patchshield_user');
    localStorage.removeItem('patchshield_role');
  };

  return (
    <AuthContext.Provider value={{
      token, username, role, isFirstRunCompleted, login, logout,
      isAuthenticated: Boolean(token)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
