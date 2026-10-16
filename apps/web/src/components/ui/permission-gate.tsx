'use client';

import React from 'react';
import { useAuth } from '../../context/auth-context';

export interface PermissionGateProps {
  permission?: string;
  role?: 'student' | 'teacher' | 'parent' | 'admin';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  role,
  fallback = null,
  children,
}) => {
  const { user, currentRole } = useAuth();

  // If role is specified, check role
  if (role && currentRole !== role && currentRole !== 'admin') {
    return <>{fallback}</>;
  }

  // If specific permission is specified, check user's roles' permissions
  if (permission && user) {
    // Admin has all permissions
    if (currentRole === 'admin') {
      return <>{children}</>;
    }

    const userPermissions = (user.roles || []).flatMap((r) =>
      (r.permissions || []).map((p) => p.name)
    );

    const hasPermission = userPermissions.includes(permission);
    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
