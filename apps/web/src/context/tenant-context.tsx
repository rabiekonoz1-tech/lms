'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '../types';
import { apiClient } from '../lib/api-client';
import { platformApi } from '../lib/platform-api';

interface TenantContextType {
  currentTenant: Tenant | null;
  setTenantSlug: (slug: string) => void;
  updateCurrentTenantBranding: (branding: Partial<Tenant>) => Promise<void>;
  availableTenants: Tenant[];
  loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply White-Label dynamic branding to CSS variables whenever currentTenant changes
  useEffect(() => {
    if (typeof window !== 'undefined' && currentTenant) {
      const primary = currentTenant.primary_color || '#04c3c9';
      const secondary = currentTenant.secondary_color || '#0284c7';
      document.documentElement.style.setProperty('--brand-primary', primary);
      document.documentElement.style.setProperty('--brand-secondary', secondary);
      if (currentTenant.name) {
        document.title = `${currentTenant.name} — مدار للتعليم`;
      }
    }
  }, [currentTenant]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const tenants = await platformApi.getTenants();
        setAvailableTenants(tenants);
        if (tenants.length > 0) {
            setCurrentTenant(tenants[0]);
            apiClient.setTenant(tenants[0].slug);
        }
      } catch {
        // Fallback or handle error
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const setTenantSlug = (slug: string) => {
    const found = availableTenants.find((t) => t.slug === slug);
    if (found) {
      setCurrentTenant(found);
      apiClient.setTenant(found.slug);
    } else {
        // fallback if manually typing a slug that isn't loaded
        apiClient.setTenant(slug);
    }
  };

  const updateCurrentTenantBranding = async (branding: Partial<Tenant>) => {
    if (!currentTenant) return;
    try {
      const updated = await platformApi.updateTenant(currentTenant.id, branding);
      setCurrentTenant(updated);
      setAvailableTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch (e) {
      // Optimistic fallback
      setCurrentTenant(prev => prev ? { ...prev, ...branding } : null);
    }
  };

  return (
    <TenantContext.Provider value={{ currentTenant, setTenantSlug, updateCurrentTenantBranding, availableTenants, loading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
