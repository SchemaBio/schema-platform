import * as React from 'react';
import { cn } from '../../utils/cn';

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Sidebar content (typically SidebarItem components) */
  children: React.ReactNode;
  /** Whether the sidebar is collapsed */
  collapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Width of the sidebar when expanded (default: 240px) */
  width?: number;
  /** Width of the sidebar when collapsed (default: 64px) */
  collapsedWidth?: number;
  /** Accessible label for the sidebar navigation */
  'aria-label'?: string;
}

const RESPONSIVE_BREAKPOINT = 1280;

/**
 * Sidebar component with collapsible mode and responsive behavior.
 * Default width is 240px, automatically collapses below 1280px viewport.
 * Supports keyboard navigation and WCAG 2.1 AA accessibility requirements.
 *
 * @example
 * <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
 *   <SidebarItem icon={<HomeIcon />} label="Home" href="/" active />
 *   <SidebarItem icon={<SettingsIcon />} label="Settings" href="/settings" />
 * </Sidebar>
 */
export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      children,
      collapsed: controlledCollapsed,
      onCollapsedChange,
      width = 240,
      collapsedWidth = 64,
      className,
      'aria-label': ariaLabel = 'Sidebar navigation',
      ...props
    },
    ref
  ) => {
    const [internalCollapsed, setInternalCollapsed] = React.useState(false);
    
    // Use controlled or uncontrolled collapsed state
    const isControlled = controlledCollapsed !== undefined;
    const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

    // Handle responsive auto-collapse
    React.useEffect(() => {
      const handleResize = () => {
        const shouldCollapse = window.innerWidth < RESPONSIVE_BREAKPOINT;
        
        if (isControlled) {
          // In controlled mode, notify parent of responsive collapse
          if (shouldCollapse !== collapsed) {
            onCollapsedChange?.(shouldCollapse);
          }
        } else {
          // In uncontrolled mode, manage state internally
          setInternalCollapsed(shouldCollapse);
        }
      };

      // Check initial viewport size
      handleResize();

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [isControlled, collapsed, onCollapsedChange]);

    const handleToggle = () => {
      const newCollapsed = !collapsed;
      if (isControlled) {
        onCollapsedChange?.(newCollapsed);
      } else {
        setInternalCollapsed(newCollapsed);
      }
    };

    // Handle keyboard shortcut for toggle
    const handleKeyDown = (event: React.KeyboardEvent) => {
      // Toggle sidebar with [ key (common convention)
      if (event.key === '[' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        handleToggle();
      }
    };

    const currentWidth = collapsed ? collapsedWidth : width;

    return (
      <aside
        ref={ref}
        role="complementary"
        aria-label={ariaLabel}
        className={cn(
          'h-full flex flex-col',
          'bg-[var(--color-canvas-default)] border-r border-[var(--color-border-default)]',
          'transition-[width] duration-[var(--duration-normal,200ms)] ease-[var(--ease-default,ease)]',
          className
        )}
        style={{ width: currentWidth }}
        data-collapsed={collapsed}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Toggle button */}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'flex items-center justify-center',
            'h-10 mx-2 mt-2 mb-1',
            'rounded-[var(--radius-medium,6px)]',
            'text-[var(--color-fg-muted)]',
            'hover:bg-[var(--color-canvas-subtle)] hover:text-[var(--color-fg-default)]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-emphasis)] focus-visible:ring-offset-2',
            'transition-colors duration-[var(--duration-fast,100ms)]'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          aria-controls="sidebar-nav"
        >
          <svg
            className={cn(
              'w-5 h-5 transition-transform duration-[var(--duration-normal,200ms)]',
              collapsed && 'rotate-180'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Navigation items */}
        <nav 
          id="sidebar-nav"
          aria-label="Sidebar"
          className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1"
        >
          <SidebarContext.Provider value={{ collapsed }}>
            {children}
          </SidebarContext.Provider>
        </nav>
      </aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';

// Context for sharing collapsed state with SidebarItem
interface SidebarContextValue {
  collapsed: boolean;
}

const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
});

export const useSidebarContext = () => React.useContext(SidebarContext);
