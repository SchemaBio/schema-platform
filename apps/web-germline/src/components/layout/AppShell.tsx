'use client';

import * as React from 'react';
import { Header } from '@schema/ui-kit';
import { usePathname } from 'next/navigation';
import { MainNav } from './MainNav';
import { SidebarNav } from './SidebarNav';
import { SearchInput } from './SearchInput';
import { UserMenu } from './UserMenu';
import { useSidebarState } from '@/hooks/useSidebarState';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MobileNav } from './MobileNav';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell provides the main application layout structure.
 * Includes Header, Sidebar, and Main Content area.
 * Handles responsive behavior for different viewport sizes.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarState();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279px)');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Auto-collapse sidebar on tablet
  React.useEffect(() => {
    if (isTablet && !collapsed) {
      setCollapsed(true);
    }
  }, [isTablet, collapsed, setCollapsed]);

  // Determine current section from pathname
  const currentSection = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    return segments[0] || 'samples';
  }, [pathname]);

  // Logo component
  const logo = (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-accent-emphasis rounded-md flex items-center justify-center">
        <span className="text-fg-on-emphasis font-bold text-sm">🧬</span>
      </div>
      <span className="font-semibold text-fg-default hidden sm:inline">
        绳墨生物
      </span>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <Header
          logo={logo}
          userMenu={
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-canvas-subtle"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          }
        />
        {mobileMenuOpen && (
          <MobileNav
            currentSection={currentSection}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      {/* Header */}
      <Header
        logo={logo}
        navigation={<MainNav currentPath={pathname} />}
        search={<SearchInput />}
        userMenu={<UserMenu />}
      />

      {/* Body: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SidebarNav
          section={currentSection as any}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
