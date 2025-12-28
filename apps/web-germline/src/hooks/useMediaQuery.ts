'use client';

import * as React from 'react';

/**
 * Hook to detect if a media query matches.
 * SSR-safe: returns false during server-side rendering.
 *
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279px)');
 * const isDesktop = useMediaQuery('(min-width: 1280px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoint hooks for common responsive patterns.
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1279px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1280px)');
}

/**
 * Returns the current responsive mode.
 * SSR-safe: defaults to 'desktop' during server-side rendering.
 */
export type ResponsiveMode = 'mobile' | 'tablet' | 'desktop';

export function useResponsiveMode(): ResponsiveMode {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279px)');

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}
