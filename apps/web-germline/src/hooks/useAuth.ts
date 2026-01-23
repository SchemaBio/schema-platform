'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthToken, clearAuthTokens } from '@/lib/api';
import { authApi } from '@/lib/auth';
import type { User } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 检查登录状态
  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          setUser(null);
          clearAuthTokens();
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // 登出
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // 即使 API 调用失败也清除本地状态
      clearAuthTokens();
    }
    setUser(null);
    router.push('/login');
  }, [router]);

  // 检查是否需要重定向
  useEffect(() => {
    if (isLoading) return;

    const publicPaths = ['/login'];
    const isPublicPath = publicPaths.includes(pathname);

    if (!user && !isPublicPath) {
      router.push('/login');
    } else if (user && isPublicPath) {
      router.push('/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
