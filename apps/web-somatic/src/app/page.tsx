'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Root page - redirects based on auth status
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  // 显示加载状态
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-subtle">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-emphasis" />
    </div>
  );
}
