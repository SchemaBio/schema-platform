'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Tooltip } from '@schema/ui-kit';
import { ChevronLeft } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { mainNavItems, sidebarNavConfig, isNavItemActive, type SidebarNavItem, type NavItem } from '@/config/navigation';

interface SidebarNavProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

// 模拟当前用户 - 实际应从认证上下文获取
const mockCurrentUser = {
  role: 'admin' as const,
};

/**
 * SidebarNav displays main navigation and contextual sub-navigation.
 * Supports collapsed mode with icon-only display and tooltips.
 */
export function SidebarNav({ collapsed, onCollapsedChange }: SidebarNavProps) {
  const pathname = usePathname();
  const isAdmin = mockCurrentUser.role === 'admin';
  
  // Determine current section from pathname
  const currentSection = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    return segments[0] || 'samples';
  }, [pathname]);

  // 获取子导航项，并根据权限过滤
  const subItems = React.useMemo(() => {
    const items = sidebarNavConfig[currentSection as keyof typeof sidebarNavConfig] || [];
    
    // 对于设置页面，非管理员隐藏权限管理和AI设置
    if (currentSection === 'settings' && !isAdmin) {
      return items.filter(item => 
        item.href !== '/settings/permissions' && item.href !== '/settings/ai'
      );
    }
    
    return items;
  }, [currentSection, isAdmin]);

  return (
    <aside
      className={`
        flex flex-col bg-canvas-subtle border-r border-border
        transition-[width] duration-normal ease-default shrink-0
        ${collapsed ? 'w-16' : 'w-60'}
      `}
      data-collapsed={collapsed}
    >
      {/* Logo + Collapse Button */}
      <div className={`
        flex items-center h-12 border-b border-border px-3
        ${collapsed ? 'justify-center' : 'justify-between'}
      `}>
        {collapsed ? (
          <Tooltip content="展开侧边栏" placement="right" variant="nav">
            <button 
              className="flex items-center min-w-0 cursor-pointer"
              onClick={() => onCollapsedChange(false)}
              type="button"
            >
              <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Schema Somatic"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            </button>
          </Tooltip>
        ) : (
          <div className="flex items-center min-w-0">
            <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
              <Image
                src="/logo.png"
                alt="Schema Somatic"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="ml-2 font-semibold text-fg-default truncate">
              Schema Somatic
            </span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => onCollapsedChange(true)}
            className="p-1.5 rounded-md text-fg-muted hover:text-fg-default hover:bg-canvas-inset transition-colors duration-fast shrink-0"
            aria-label="折叠侧边栏"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="py-2 border-b border-border">
        <ul className="space-y-1 px-2">
          {mainNavItems.map((item) => (
            <MainNavItemComponent
              key={item.href}
              item={item}
              collapsed={collapsed}
              currentPath={pathname}
            />
          ))}
        </ul>
      </nav>

      {/* Sub Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {!collapsed && subItems.length > 0 && (
          <div className="px-3 mb-2">
            <span className="text-xs font-medium text-fg-muted uppercase tracking-wider">
              {mainNavItems.find(item => item.href.includes(currentSection))?.label || 
                (currentSection === 'settings' ? '系统设置' : '子菜单')}
            </span>
          </div>
        )}
        <ul className="space-y-1 px-2">
          {subItems.map((item) => (
            <SubNavItemComponent
              key={item.href}
              item={item}
              collapsed={collapsed}
              currentPath={pathname}
            />
          ))}
        </ul>
      </nav>

      {/* Bottom section: User Menu */}
      <div className="border-t border-border p-2 mt-auto flex justify-center">
        <UserMenu collapsed={collapsed} />
      </div>
    </aside>
  );
}

interface MainNavItemComponentProps {
  item: NavItem;
  collapsed: boolean;
  currentPath: string;
}

function MainNavItemComponent({ item, collapsed, currentPath }: MainNavItemComponentProps) {
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
            : 'text-fg-default hover:bg-canvas-inset'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <li>
        <Tooltip content={item.label} placement="right" variant="nav">
          {content}
        </Tooltip>
      </li>
    );
  }

  return <li>{content}</li>;
}

interface SubNavItemComponentProps {
  item: SidebarNavItem;
  collapsed: boolean;
  currentPath: string;
}

function SubNavItemComponent({ item, collapsed, currentPath }: SubNavItemComponentProps) {
  const isActive = item.href === currentPath;
  const Icon = item.icon;

  const content = (
    <Link
      href={item.href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-md text-sm
        transition-colors duration-fast
        ${
          isActive
            ? 'bg-canvas-inset text-fg-default font-medium'
            : 'text-fg-muted hover:text-fg-default hover:bg-canvas-inset'
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
        <Tooltip content={item.label} placement="right" variant="nav">
          {content}
        </Tooltip>
      </li>
    );
  }

  return <li>{content}</li>;
}
