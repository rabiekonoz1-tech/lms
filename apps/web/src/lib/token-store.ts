/**
 * M15-A — Token Store
 * Manages auth token persistence in localStorage with SSR safety.
 */

const TOKEN_KEY = 'lms_auth_token';
const TENANT_KEY = 'lms_tenant_slug';
const ROLE_KEY   = 'lms_user_role';

export const tokenStore = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },
  getTenant: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TENANT_KEY);
  },
  setTenant: (slug: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TENANT_KEY, slug);
  },
  getRole: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ROLE_KEY);
  },
  setRole: (role: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ROLE_KEY, role);
  },
  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TENANT_KEY);
    localStorage.removeItem(ROLE_KEY);
  },
};
