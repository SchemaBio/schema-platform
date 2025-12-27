'use client';

import * as React from 'react';

// Theme types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY_DEFAULT = 'schema-ui-theme';

/**
 * Get the system theme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get the stored theme from localStorage
 */
function getStoredTheme(storageKey: string): Theme | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return null;
  } catch {
    return null;
  }
}


/**
 * Resolve the actual theme based on the theme setting
 */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * ThemeProvider component that manages theme state
 * 
 * Features:
 * - Supports light, dark, and system themes
 * - Persists theme preference to localStorage
 * - Detects system theme preference
 * - Applies theme class to document root
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = STORAGE_KEY_DEFAULT,
}: ThemeProviderProps): JSX.Element {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    // Try to get stored theme, fallback to default
    const stored = getStoredTheme(storageKey);
    return stored ?? defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>(() => {
    const stored = getStoredTheme(storageKey);
    return resolveTheme(stored ?? defaultTheme);
  });

  // Update resolved theme when theme changes
  React.useEffect(() => {
    setResolvedTheme(resolveTheme(theme));
  }, [theme]);

  // Listen for system theme changes when theme is 'system'
  React.useEffect(() => {
    if (theme !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply theme class to document root
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  // Set theme and persist to localStorage
  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch {
      // Ignore localStorage errors (e.g., in private browsing)
    }
  }, [storageKey]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * 
 * @throws Error if used outside of ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
