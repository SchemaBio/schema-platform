import * as React from 'react';
import { cn } from '../../utils/cn';

export interface BottomNavItem {
  /** Unique identifier for the item */
  id: string;
  /** Icon element displayed above the label */
  icon: React.ReactNode;
  /** Label text for the item */
  label: string;
  /** Link href (renders as anchor if provided) */
  href?: string;
  /** Whether this item is currently active */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Navigation items to display */
  items: BottomNavItem[];
  /** Maximum number of items to display (default: 5) */
  maxItems?: number;
}

const MOBILE_BREAKPOINT = 768;

/**
 * BottomNav component for mobile navigation (< 768px viewport).
 * Displays a fixed bottom navigation bar with icon and label for each item.
 * Automatically hides on larger viewports.
 *
 * @example
 * <BottomNav
 *   items={[
 *     { id: 'home', icon: <HomeIcon />, label: 'Home', href: '/', active: true },
 *     { id: 'search', icon: <SearchIcon />, label: 'Search', href: '/search' },
 *     { id: 'profile', icon: <UserIcon />, label: 'Profile', href: '/profile' },
 *   ]}
 * />
 */
export const BottomNav = React.forwardRef<HTMLElement, BottomNavProps>(
  ({ items, maxItems = 5, className, ...props }, ref) => {
    const [isMobile, setIsMobile] = React.useState(false);

    // Handle responsive visibility
    React.useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      };

      // Check initial viewport size
      checkMobile();

      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Don't render on larger viewports
    if (!isMobile) {
      return null;
    }

    // Limit items to maxItems
    const displayItems = items.slice(0, maxItems);

    return (
      <nav
        ref={ref}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'h-16 flex items-center justify-around',
          'bg-[var(--color-canvas-default)] border-t border-[var(--color-border-default)]',
          'safe-area-inset-bottom',
          className
        )}
        role="navigation"
        aria-label="Bottom navigation"
        {...props}
      >
        {displayItems.map((item) => (
          <BottomNavItemComponent key={item.id} item={item} />
        ))}
      </nav>
    );
  }
);

BottomNav.displayName = 'BottomNav';

/**
 * Internal component for rendering individual bottom nav items.
 */
interface BottomNavItemComponentProps {
  item: BottomNavItem;
}

const BottomNavItemComponent: React.FC<BottomNavItemComponentProps> = ({ item }) => {
  const { icon, label, href, active, onClick } = item;

  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const itemClasses = cn(
    'flex flex-col items-center justify-center',
    'flex-1 h-full px-2 py-1',
    'text-xs font-medium',
    'transition-colors duration-[var(--duration-fast,100ms)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emphasis)] focus:ring-inset',
    active
      ? 'text-[var(--color-accent-fg)]'
      : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)]'
  );

  const content = (
    <>
      <span
        className={cn(
          'w-6 h-6 flex items-center justify-center mb-1',
          active && 'text-[var(--color-accent-fg)]'
        )}
      >
        {icon}
      </span>
      <span className="truncate max-w-full">{label}</span>
    </>
  );

  // Render as anchor or button based on href
  if (href) {
    return (
      <a
        href={href}
        className={itemClasses}
        onClick={handleClick}
        aria-current={active ? 'page' : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={itemClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-current={active ? 'page' : undefined}
    >
      {content}
    </button>
  );
};
