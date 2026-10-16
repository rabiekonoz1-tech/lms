'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import type { TenantUser } from '../types';
import { apiClient } from '../lib/api-client';
import { tokenStore } from '../lib/token-store';
import { login as apiLogin, logout as apiLogout, fetchMe } from '../lib/auth-api';

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface AuthContextType {
  user: TenantUser | null;
  currentRole: UserRole | null;
  token: string | null;
  tenantSlug: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, tenantSlug: string) => Promise<void>;
  supportLogin: (token: string, tenantSlug: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function resolveRole(user: TenantUser): UserRole {
  const firstRole = user.roles?.[0] as unknown;
  const roleName = (typeof firstRole === 'string' ? firstRole : (firstRole as { name?: string })?.name ?? '').toLowerCase();
  if (roleName.includes('admin') || roleName.includes('platform')) return 'admin';
  if (roleName.includes('teacher') || user.type === 'staff') return 'teacher';
  if (roleName.includes('parent') || user.type === 'parent') return 'parent';
  return 'student';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<TenantUser | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount — restore session from localStorage
  useEffect(() => {
    const restore = async () => {
      const storedToken = tokenStore.getToken();
      const storedTenant = tokenStore.getTenant();

      if (!storedToken || !storedTenant) {
        setIsLoading(false);
        return;
      }

      try {
        apiClient.setToken(storedToken);
        apiClient.setTenant(storedTenant);
        const me = await fetchMe();
        setUser(me);
        setToken(storedToken);
        setTenantSlug(storedTenant);
        setCurrentRole(resolveRole(me));
      } catch {
        // Session invalid — clear
        tokenStore.clearAll();
        apiClient.setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    restore();
  }, []);

  const login = useCallback(async (email: string, password: string, slug: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await apiLogin({ email, password, tenantSlug: slug });
      setUser(result.user);
      setToken(result.token);
      setTenantSlug(slug);
      const role = resolveRole(result.user);
      setCurrentRole(role);
      tokenStore.setRole(role);

      // Navigate by role
      if (role === 'admin') router.push('/platform/dashboard');
      else if (role === 'teacher') router.push('/teacher/dashboard');
      else if (role === 'parent') router.push('/parent/dashboard');
      else router.push('/student/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تسجيل الدخول';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const supportLogin = useCallback(async (supportToken: string, slug: string) => {
    setError(null);
    setIsLoading(true);
    try {
      apiClient.setToken(supportToken);
      apiClient.setTenant(slug);
      tokenStore.setToken(supportToken);
      tokenStore.setTenant(slug);

      const me = await fetchMe();
      setUser(me);
      setToken(supportToken);
      setTenantSlug(slug);
      
      const role = resolveRole(me);
      setCurrentRole(role);
      tokenStore.setRole(role);

      // Navigate to platform or teacher dashboard for support
      router.push('/platform/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تسجيل الدخول كدعم فني';
      setError(msg);
      tokenStore.clearAll();
      apiClient.setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await apiLogout();
    setUser(null);
    setToken(null);
    setTenantSlug(null);
    setCurrentRole(null);
    setIsLoading(false);
    router.push('/login');
  }, [router]);

  const switchRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
    tokenStore.setRole(role);
    router.push(`/${role}/dashboard`);
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        token,
        tenantSlug,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        login,
        supportLogin,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
