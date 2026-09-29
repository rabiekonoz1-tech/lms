'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TenantUser } from '../types';
import { apiClient } from '../lib/api-client';

export type UserRole = 'student' | 'teacher' | 'parent';

export const DEMO_USERS: Record<UserRole, TenantUser> = {
  student: {
    id: 'usr-student-001',
    name: 'عمر الأحمد (Omar Al-Ahmad)',
    email: 'omar@almustaqbal.edu.sa',
    type: 'student',
    status: 'active',
    student: {
      id: 'stu-001',
      user_id: 'usr-student-001',
      student_code: 'STU-2026-001',
      grade_level: 'الصف الثالث الثانوي',
      status: 'active',
    },
    roles: [
      {
        id: 'rol-stu',
        name: 'student',
        label: 'طالب (Student)',
      },
    ],
  },
  teacher: {
    id: 'usr-teacher-001',
    name: 'د. طارق منصور (Dr. Tariq Mansour)',
    email: 'tariq@almustaqbal.edu.sa',
    type: 'staff',
    status: 'active',
    staff: {
      id: 'stf-001',
      user_id: 'usr-teacher-001',
      staff_type: 'teacher',
      status: 'active',
    },
    roles: [
      {
        id: 'rol-tch',
        name: 'teacher',
        label: 'معلم أول (Senior Teacher)',
      },
    ],
  },
  parent: {
    id: 'usr-parent-001',
    name: 'أبو عمر الأحمد (Abu Omar)',
    email: 'parent@almustaqbal.edu.sa',
    type: 'parent',
    status: 'active',
    parent: {
      id: 'par-001',
      user_id: 'usr-parent-001',
      status: 'active',
    },
    roles: [
      {
        id: 'rol-par',
        name: 'parent',
        label: 'ولي أمر (Parent)',
      },
    ],
  },
};

interface AuthContextType {
  user: TenantUser;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [token, setToken] = useState<string | null>('demo_bearer_token_2026_xyz');

  const user = DEMO_USERS[currentRole];

  useEffect(() => {
    apiClient.setToken(token);
  }, [token]);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const mockToken = `demo_token_${role}_${Date.now()}`;
    setToken(mockToken);
    apiClient.setToken(mockToken);
  };

  const logout = () => {
    setToken(null);
    apiClient.setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        switchRole,
        token,
        isAuthenticated: !!token,
        logout,
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
