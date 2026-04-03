'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserOrganizationInfo, OrgRole } from '@/types/user';
import type { LoginRequest, LoginResponse } from '@/types/auth';
import { authApi } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  organizations: UserOrganizationInfo[];
  currentOrg: UserOrganizationInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchOrganization: (orgId: string) => Promise<void>;
  hasOrgRole: (role: OrgRole) => boolean;
  hasAnyOrgRole: (...roles: OrgRole[]) => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'schema_user',
  TOKENS: 'schema_tokens',
  ORGS: 'schema_organizations',
  CURRENT_ORG: 'schema_current_org',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<UserOrganizationInfo[]>([]);
  const [currentOrg, setCurrentOrg] = useState<UserOrganizationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth state on mount
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedOrgs = localStorage.getItem(STORAGE_KEYS.ORGS);
        const storedCurrentOrg = localStorage.getItem(STORAGE_KEYS.CURRENT_ORG);

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        if (storedOrgs) {
          const orgs = JSON.parse(storedOrgs);
          setOrganizations(orgs);

          if (storedCurrentOrg) {
            setCurrentOrg(JSON.parse(storedCurrentOrg));
          } else if (orgs.length > 0) {
            setCurrentOrg(orgs[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load stored auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response: LoginResponse = await authApi.login({ email, password });

      // Store tokens
      localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt: response.expiresAt,
      }));

      // Store user
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      setUser(response.user);

      // Store organizations
      localStorage.setItem(STORAGE_KEYS.ORGS, JSON.stringify(response.organizations));
      setOrganizations(response.organizations);

      // Set current org
      if (response.currentOrg) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_ORG, JSON.stringify(response.currentOrg));
        setCurrentOrg(response.currentOrg);
      } else if (response.organizations.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_ORG, JSON.stringify(response.organizations[0]));
        setCurrentOrg(response.organizations[0]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
    localStorage.removeItem(STORAGE_KEYS.ORGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ORG);
    setUser(null);
    setOrganizations([]);
    setCurrentOrg(null);
  }, []);

  const switchOrganization = useCallback(async (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ORG, JSON.stringify(org));
      setCurrentOrg(org);

      // Optionally call API to switch on backend
      try {
        await authApi.switchOrganization(orgId);
      } catch (error) {
        console.error('Failed to switch organization on backend:', error);
      }
    }
  }, [organizations]);

  const hasOrgRole = useCallback((role: OrgRole): boolean => {
    if (!currentOrg) return false;

    const roleHierarchy: OrgRole[] = ['OWNER', 'ADMIN', 'DOCTOR', 'ANALYST', 'VIEWER'];
    const currentIndex = roleHierarchy.indexOf(currentOrg.orgRole);
    const requiredIndex = roleHierarchy.indexOf(role);

    return currentIndex <= requiredIndex;
  }, [currentOrg]);

  const hasAnyOrgRole = useCallback((...roles: OrgRole[]): boolean => {
    if (!currentOrg) return false;
    return roles.includes(currentOrg.orgRole);
  }, [currentOrg]);

  const isSuperAdmin = useCallback((): boolean => {
    return user?.systemRole === 'SUPER_ADMIN';
  }, [user]);

  const value: AuthContextType = {
    user,
    organizations,
    currentOrg,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    switchOrganization,
    hasOrgRole,
    hasAnyOrgRole,
    isSuperAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}