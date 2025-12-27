import * as React from 'react';
import { cn } from '../../utils/cn';
import { useSidebarContext } from './Sidebar';

export interface SidebarItemProps extends React.HTMLAttributes<HTMLElement> {
  /** Icon element displayed on the left */
  icon?: React.ReactNode;
  /** Label text for the item */
  label: string;
  /** Link href (renders as anchor if provided) */
  href?: string;
  /** Whether this item is currently active */
  active?: boolean;
  /** Nested items (for expandable sections) */
  children?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
}

/**
 * SidebarItem component for navigation items within a Sidebar.
 * Supports icons, active state, and nested children.
 * Automatically adapts to collapsed sidebar state.
 *
 * @example
 * <SidebarItem icon={<HomeIcon />} label="Home" href="/" active />
 * <SidebarItem icon={<SettingsIcon />} label="Settings" onClick={handleClick} />
 */
export const SidebarItem = React.forwardRef<HTMLElement, SidebarItemProps>(
  (
    {
      icon,
      label,
      href,
      active = false,
      children,
      onClick,
      className,
      ...props
    },
    ref
  ) => {
    const { collapsed } = useSidebarContext();
    const [expanded, setExpanded] = React.useState(false);
    const hasChildren = React.Children.count(children) > 0;

    const handleClick = (e: React.MouseEvent) => {
      if (hasChildren) {
        e.preventDefault();
        setExpanded(!expanded);
      }
      onClick?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (hasChildren) {
          setExpanded(!expanded);
        }
        onClick?.();
      }
      // Arrow key navigation for expandable items
      if (hasChildren) {
        if (e.key === 'ArrowRight' && !expanded) {
          e.preventDefault();
          setExpanded(true);
        }
        if (e.key === 'ArrowLeft' && expanded) {
          e.preventDefault();
          setExpanded(false);
        }
      }
    };

    const itemClasses = cn(
      'flex items-center gap-3 w-full',
      'h-10 px-3 rounded-[var(--radius-medium,6px)]',
      'text-sm font-medium',
      'transition-colors duration-[var(--duration-fast,100ms)]',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-emphasis)] focus-visible:ring-offset-2',
      active
        ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-fg)]'
        : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-canvas-subtle)] hover:text-[var(--color-fg-default)]',
      collapsed && 'justify-center px-0',
      className
    );

    const content = (
      <>
        {icon && (
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {icon}
          </span>
        )}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{label}</span>
            {hasChildren && (
              <svg
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-transform duration-[var(--duration-fast,100ms)]',
                  expanded && 'rotate-90'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </>
        )}
      </>
    );

    // Render as anchor or button based on href
    const Element = href && !hasChildren ? 'a' : 'button';
    const elementProps = href && !hasChildren ? { href } : { type: 'button' as const };

    return (
      <div className="mb-1">
        <Element
          ref={ref as React.Ref<HTMLAnchorElement & HTMLButtonElement>}
          className={itemClasses}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-current={active ? 'page' : undefined}
          aria-expanded={hasChildren ? expanded : undefined}
          title={collapsed ? label : undefined}
          {...elementProps}
          {...props}
        >
          {content}
        </Element>

        {/* Nested children */}
        {hasChildren && !collapsed && expanded && (
          <div className="ml-4 mt-1 border-l border-[var(--color-border-muted)] pl-2">
            {children}
          </div>
        )}
      </div>
    );
  }
);

SidebarItem.displayName = 'SidebarItem';
