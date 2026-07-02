'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/types';
import { tokenStore } from '@/lib/token-store';
import { authApi } from '@/lib/auth-api';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (tenantSlug: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider — hydrates auth state from localStorage on mount (client
 * component, so this only runs in the browser) and exposes login/logout
 * to the rest of the app. Deliberately simple (no server-side session) —
 * this frontend is a thin client over the NestJS API, which owns all
 * authorization decisions; the frontend only reflects them in the UI.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = tokenStore.getUser<AuthUser>();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (tenantSlug: string, email: string, password: string) => {
    const res = await authApi.login(tenantSlug, email, password);
    tokenStore.setSession(res.accessToken, res.refreshToken, res.user);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    router.push('/login');
  }, [router]);

  const hasRole = useCallback((...roles: string[]) => !!user && roles.some((r) => user.roles.includes(r)), [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
