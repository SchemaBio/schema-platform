import * as React from 'react';
import { cn } from '../../utils/cn';

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Logo element displayed on the left */
  logo: React.ReactNode;
  /** Main navigation element */
  navigation?: React.ReactNode;
  /** Search element */
  search?: React.ReactNode;
  /** User menu element displayed on the right */
  userMenu?: React.ReactNode;
}

/**
 * Header component with fixed height of 48px.
 * Provides slots for logo, navigation, search, and user menu.
 * Uses semantic HTML with proper ARIA landmarks for accessibility.
 *
 * @example
 * <Header
 *   logo={<Logo />}
 *   navigation={<Nav />}
 *   search={<SearchInput />}
 *   userMenu={<UserMenu />}
 * />
 */
export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ logo, navigation, search, userMenu, className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        role="banner"
        className={cn(
          'h-12 w-full flex items-center justify-between px-4',
          'bg-[var(--color-canvas-default)] border-b border-[var(--color-border-default)]',
          'sticky top-0 z-50',
          className
        )}
        {...props}
      >
        {/* Left section: Logo */}
        <div className="flex items-center shrink-0">{logo}</div>

        {/* Center section: Navigation and Search */}
        <div className="flex items-center flex-1 justify-center gap-4 mx-4">
          {navigation && (
            <nav aria-label="Main navigation" className="flex items-center">
              {navigation}
            </nav>
          )}
          {search && (
            <div role="search" className="flex items-center">
              {search}
            </div>
          )}
        </div>

        {/* Right section: User Menu */}
        <div className="flex items-center shrink-0">{userMenu}</div>
      </header>
    );
  }
);

Header.displayName = 'Header';
