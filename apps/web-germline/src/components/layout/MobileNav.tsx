'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { mainNavItems, sidebarNavConfig, isNavItemActive, getSectionFromPath } from '@/config/navigation';

interface MobileNavProps {
  currentSection: string;
  onClose: () => void;
}

/**
 * MobileNav provides a full-screen navigation drawer for mobile devices.
 */
export function MobileNav({ currentSection, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const section = getSectionFromPath(pathname);
  const sidebarItems = sidebarNavConfig[section] || [];

  return (
    <div className="fixed inset-0 z-50 bg-canvas">
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-border">
        <span className="font-semibold text-fg-default">导航</span>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-canvas-subtle"
          aria-label="关闭导航"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation content */}
      <div className="overflow-y-auto h-[calc(100vh-48px)]">
        {/* Main navigation */}
        <nav className="p-4 border-b border-border">
          <p className="text-xs text-fg-muted mb-2 uppercase tracking-wider">主导航</p>
          <ul className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = isNavItemActive(item.href, pathname);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-md text-sm
                      transition-colors duration-fast
                      ${
                        isActive
                          ? 'bg-accent-subtle text-accent-fg font-medium'
                          : 'text-fg-muted hover:text-fg-default hover:bg-canvas-subtle'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Section navigation */}
        <nav className="p-4">
          <p className="text-xs text-fg-muted mb-2 uppercase tracking-wider">
            {mainNavItems.find((item) => item.href.includes(section))?.label || '子导航'}
          </p>
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = isNavItemActive(item.href, pathname);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-md text-sm
                      transition-colors duration-fast
                      ${
                        isActive
                          ? 'bg-accent-subtle text-accent-fg font-medium'
                          : 'text-fg-muted hover:text-fg-default hover:bg-canvas-subtle'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
