'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { Breadcrumb, type BreadcrumbItem } from '@schema/ui-kit';
import { SidebarNav } from './SidebarNav';
import { SearchInput } from './SearchInput';
import { UserMenu } from './UserMenu';
import { useSidebarState } from '@/hooks/useSidebarState';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MobileNav } from './MobileNav';
import { mainNavItems } from '@/config/navigation';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Generate breadcrumbs from pathname
 */
function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [];

  const items: BreadcrumbItem[] = [];
  let currentPath = '';

  for (const segment of segments) {
    currentPath += `/${segment}`;
    // Find label from navigation config
    const navItem = mainNavItems.find(item => item.href === `/${segment}`);
    const label = navItem?.label || segment;
    items.push({ label, href: currentPath });
  }

  // Last item should not have href (current page)
  if (items.length > 0) {
    delete items[items.length - 1].href;
  }

  return items;
}

/**
 * AppShell provides the main application layout structure.
 * Includes Sidebar with navigation and Main Content area.
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

  // Generate breadcrumbs from pathname
  const breadcrumbs = React.useMemo(() => getBreadcrumbs(pathname), [pathname]);

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        {/* Mobile Header */}
        <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-canvas-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-emphasis rounded-md flex items-center justify-center">
              <span className="text-fg-on-emphasis font-bold text-sm">🧬</span>
            </div>
            <span className="font-semibold text-fg-default">绳墨生物</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-canvas-inset"
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
        </header>
        {mobileMenuOpen && (
          <MobileNav
            currentSection={currentSection}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-canvas">
      {/* Sidebar */}
      <SidebarNav
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-canvas shrink-0">
          {/* Left: Breadcrumbs */}
          <div className="flex-1 min-w-0">
            {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}
          </div>

          {/* Right: Search + Settings + User */}
          <div className="flex items-center gap-2 shrink-0">
            <SearchInput />
            <Link
              href="/settings"
              className="p-2 rounded-md text-fg-muted hover:text-fg-default hover:bg-canvas-inset transition-colors"
              aria-label="系统设置"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <UserMenu />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
