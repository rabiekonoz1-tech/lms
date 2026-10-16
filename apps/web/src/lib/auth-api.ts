/**
 * M15-A — Auth API
 * Real API calls for login/logout/me, wired to the backend.
 */
import { apiClient, ApiError } from './api-client';
import { tokenStore } from './token-store';
import type { TenantUser } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
  tenantSlug: string;
}

export interface LoginResult {
  token: string;
  user: TenantUser;
}

export interface AuthMeResult {
  user: TenantUser;
}

/**
 * Authenticate against the tenant API.
 * Sets token + tenant on the shared apiClient on success.
 */
export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  apiClient.setTenant(credentials.tenantSlug);

  const response = await apiClient.post<{ token: string; user: TenantUser }>(
    '/auth/login',
    {
      identifier: credentials.email,
      email: credentials.email,
      password: credentials.password,
    }
  );

  const { token, user } = response.data;

  // Persist
  tokenStore.setToken(token);
  tokenStore.setTenant(credentials.tenantSlug);

  // Wire client
  apiClient.setToken(token);
  apiClient.setTenant(credentials.tenantSlug);

  return { token, user };
}

/**
 * Fetch the currently authenticated user from the API.
 */
export async function fetchMe(): Promise<TenantUser> {
  const token = tokenStore.getToken();
  const tenant = tokenStore.getTenant();

  if (!token || !tenant) {
    throw new ApiError('Not authenticated', 'UNAUTHENTICATED', 401);
  }

  apiClient.setToken(token);
  apiClient.setTenant(tenant);

  const response = await apiClient.get<{ user: TenantUser }>('/auth/me');
  return response.data.user;
}

/**
 * Log out — revokes server session and clears local state.
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout', {});
  } catch {
    // Server errors on logout are non-fatal — always clear locally
  } finally {
    tokenStore.clearAll();
    apiClient.setToken(null);
  }
}
