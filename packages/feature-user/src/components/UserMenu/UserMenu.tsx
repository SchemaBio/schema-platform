import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * User menu props
 */
export interface UserMenuProps {
  /** Whether to show team selector */
  showTeamSelector?: boolean;
  /** Callback on logout */
  onLogout?: () => void;
}

/**
 * User menu component showing current user with logout option
 */
export function UserMenu({ showTeamSelector = false, onLogout }: UserMenuProps): JSX.Element {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Handle logout
   */
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onLogout?.();
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  }, [logout, onLogout]);

  /**
   * Toggle menu
   */
  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  if (!isAuthenticated || !user) {
    return <div className="user-menu user-menu--empty" />;
  }

  // Get user initials for avatar
  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="user-menu">
      <button
        type="button"
        className="user-menu__trigger"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="user-menu__avatar">{initials}</span>
        <span className="user-menu__name">{user.name}</span>
      </button>

      {isOpen && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__header">
            <div className="user-menu__user-info">
              <span className="user-menu__user-name">{user.name}</span>
              <span className="user-menu__user-email">{user.email}</span>
              <span className="user-menu__user-role">{user.role}</span>
            </div>
          </div>

          <div className="user-menu__divider" />

          <div className="user-menu__items">
            <button
              type="button"
              className="user-menu__item"
              role="menuitem"
              onClick={() => {
                // Navigate to settings
                setIsOpen(false);
              }}
            >
              Settings
            </button>

            {showTeamSelector && (
              <button
                type="button"
                className="user-menu__item"
                role="menuitem"
                onClick={() => {
                  // Navigate to team management
                  setIsOpen(false);
                }}
              >
                Team
              </button>
            )}
          </div>

          <div className="user-menu__divider" />

          <button
            type="button"
            className="user-menu__item user-menu__item--danger"
            role="menuitem"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
