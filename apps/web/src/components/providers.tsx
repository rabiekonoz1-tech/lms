'use client';

import React from 'react';
import { TenantProvider } from '../context/tenant-context';
import { AuthProvider } from '../context/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <AuthProvider>{children}</AuthProvider>
    </TenantProvider>
  );
}
