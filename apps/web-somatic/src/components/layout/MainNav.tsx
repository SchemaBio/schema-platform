'use client';

import * as React from 'react';
import Link from 'next/link';
import { mainNavItems, isNavItemActive } from '@/config/navigation';

interface MainNavProps {
  currentPath: string;
}

/**
 * MainNav displays the primary navigation links in the header.
 * Highlights the active section based on the current path.
 */
export function MainNav({ currentPath }: MainNavProps) {
  return (
    <nav className="flex items-center gap-1">
      {mainNavItems.map((item) => {
        const isActive = isNavItemActive(item.href, currentPath);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
              transition-colors duration-fast
              ${
                isActive
                  ? 'bg-accent-subtle text-accent-fg'
                  : 'text-fg-muted hover:text-fg-default hover:bg-canvas-subtle'
              }
            `}
            aria-current={isActive ? 'page' : undefined}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span className="hidden lg:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
