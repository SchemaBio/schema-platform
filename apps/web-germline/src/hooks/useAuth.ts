'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

/**
 * useAuthNavigation - A hook that handles auth-based navigation redirects.
 * Uses the AuthProvider context for authentication state.
 */
export function useAuthNavigation() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const publicPaths = ['/login'];
    const isPublicPath = publicPaths.includes(pathname);

    if (!isAuthenticated && !isPublicPath) {
      router.push('/login');
    } else if (isAuthenticated && isPublicPath) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}

// Re-export useAuth for backward compatibility
export { useAuth };