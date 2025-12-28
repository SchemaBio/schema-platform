'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip } from '@schema/ui-kit';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sidebarNavConfig, isNavItemActive, type SidebarNavItem } from '@/config/navigation';

interface SidebarNavProps {
  section: keyof typeof sidebarNavConfig;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

/**
 * SidebarNav displays contextual navigation for the current section.
 * Supports collapsed mode with icon-only display and tooltips.
 */
export function SidebarNav({ section, collapsed, onCollapsedChange }: SidebarNavProps) {
  const pathname = usePathname();
  const items = sidebarNavConfig[section] || [];

  return (
    <aside
      className={`
        flex flex-col h-full bg-canvas border-r border-border
        transition-[width] duration-normal ease-default
        ${collapsed ? 'w-16' : 'w-60'}
      `}
      data-collapsed={collapsed}
    >
      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        <ul className="space-y-1 px-2">
          {items.map((item) => (
            <SidebarNavItemComponent
              key={item.href}
              item={item}
              collapsed={collapsed}
              currentPath={pathname}
            />
          ))}
        </ul>
      </nav>

      {/* Collapse toggle button */}
      <div className="border-t border-border p-2">
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className={`
            flex items-center justify-center w-full h-9 rounded-md
            text-fg-muted hover:text-fg-default hover:bg-canvas-subtle
            transition-colors duration-fast
          `}
          aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-sm">折叠</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

interface SidebarNavItemComponentProps {
  item: SidebarNavItem;
  collapsed: boolean;
  currentPath: string;
}

function SidebarNavItemComponent({ item, collapsed, currentPath }: SidebarNavItemComponentProps) {
  const isActive = isNavItemActive(item.href, currentPath);
  const Icon = item.icon;

  const content = (
    <Link
      href={item.href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-md text-sm
        transition-colors duration-fast
        ${
          isActive
            ? 'bg-accent-subtle text-accent-fg font-medium'
            : 'text-fg-muted hover:text-fg-default hover:bg-canvas-subtle'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-accent-subtle text-accent-fg">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <li>
        <Tooltip content={item.label} placement="right">
          {content}
        </Tooltip>
      </li>
    );
  }

  return <li>{content}</li>;
}
