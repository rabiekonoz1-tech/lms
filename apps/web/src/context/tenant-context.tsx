'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '../types';
import { apiClient } from '../lib/api-client';

export const DEMO_TENANTS: Tenant[] = [
  {
    id: '01a0e000-0000-7000-8000-000000000001',
    name: 'أكاديمية المستقبل التعليمية (Al-Mustaqbal Academy)',
    slug: 'almustaqbal',
    type: 'educational_center',
    status: 'active',
    primary_color: '#059669',
  },
  {
    id: '01a0e000-0000-7000-8000-000000000002',
    name: 'مركز الأمل للتدريب (Al-Amal Center)',
    slug: 'al-amal',
    type: 'school',
    status: 'active',
    primary_color: '#4f46e5',
  },
];

interface TenantContextType {
  currentTenant: Tenant;
  setTenantSlug: (slug: string) => void;
  availableTenants: Tenant[];
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant>(DEMO_TENANTS[0]);

  useEffect(() => {
    // Initial sync
    apiClient.setTenant(currentTenant.slug);
  }, [currentTenant]);

  const setTenantSlug = (slug: string) => {
    const found = DEMO_TENANTS.find((t) => t.slug === slug);
    if (found) {
      setCurrentTenant(found);
      apiClient.setTenant(found.slug);
    }
  };

  return (
    <TenantContext.Provider value={{ currentTenant, setTenantSlug, availableTenants: DEMO_TENANTS }}>
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
