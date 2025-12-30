'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  avatar: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 检查登录状态
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userData = localStorage.getItem('user');
      
      if (isLoggedIn === 'true' && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // 登出
  const logout = useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
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
