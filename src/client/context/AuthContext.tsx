import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import type { SafeUser } from '../../shared/types.js';

interface AuthContextType {
  user: SafeUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<SafeUser>;
  internalLogin: (email: string, password: string) => Promise<SafeUser>;
  register: (fullName: string, email: string, phone: string, password: string) => Promise<SafeUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  demoLogin: (role: 'CITIZEN' | 'STAFF' | 'ADMIN') => Promise<SafeUser>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<SafeUser> => {
    const res = await api.login({ email, password });
    setUser(res.user);
    return res.user;
  };

  const internalLogin = async (email: string, password: string): Promise<SafeUser> => {
    const res = await api.internalLogin({ email, password });
    setUser(res.user);
    return res.user;
  };

  const register = async (
    fullName: string,
    email: string,
    phone: string,
    password: string
  ): Promise<SafeUser> => {
    const res = await api.register({ fullName, email, phone, password });
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  const demoLogin = async (role: 'CITIZEN' | 'STAFF' | 'ADMIN'): Promise<SafeUser> => {
    const emails = {
      CITIZEN: 'citizen@govqueue.demo',
      STAFF: 'staff@govqueue.demo',
      ADMIN: 'admin@govqueue.demo',
    };
    return login(emails[role], 'Demo@123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        internalLogin,
        register,
        logout,
        refreshUser,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
