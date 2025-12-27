import * as React from 'react';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  /** Label text for the breadcrumb item */
  label: string;
  /** Link href (makes the item clickable if provided) */
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Array of breadcrumb items to display */
  items: BreadcrumbItem[];
  /** Custom separator element (default: "/") */
  separator?: React.ReactNode;
}

/**
 * Default separator component for breadcrumb items.
 */
const DefaultSeparator = () => (
  <span
    className="mx-2 text-[var(--color-fg-muted)]"
    aria-hidden="true"
  >
    /
  </span>
);

/**
 * Breadcrumb component for displaying navigation path.
 * All items except the last one are clickable links.
 * Supports custom separators between items.
 *
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Current Page' }
 *   ]}
 * />
 *
 * @example
 * // With custom separator
 * <Breadcrumb
 *   items={items}
 *   separator={<ChevronRightIcon />}
 * />
 */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator, className, ...props }, ref) => {
    if (!items || items.length === 0) {
      return null;
    }

    const renderSeparator = () => {
      if (separator !== undefined) {
        return (
          <span className="mx-2 text-[var(--color-fg-muted)]" aria-hidden="true">
            {separator}
          </span>
        );
      }
      return <DefaultSeparator />;
    };

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('flex items-center text-sm', className)}
        {...props}
      >
        <ol className="flex items-center list-none p-0 m-0">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center">
                {isLast ? (
                  // Last item: non-clickable, current page
                  <span
                    className="text-[var(--color-fg-default)] font-medium"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  // Ancestor items: clickable links
                  <>
                    {item.href ? (
                      <a
                        href={item.href}
                        className={cn(
                          'text-[var(--color-fg-muted)]',
                          'hover:text-[var(--color-accent-fg)] hover:underline',
                          'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-emphasis)] focus:ring-offset-1 rounded-sm',
                          'transition-colors duration-[var(--duration-fast,100ms)]'
                        )}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className="text-[var(--color-fg-muted)]">
                        {item.label}
                      </span>
                    )}
                    {renderSeparator()}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';
