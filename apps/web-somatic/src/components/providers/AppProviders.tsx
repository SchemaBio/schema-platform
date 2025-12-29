'use client';

import * as React from 'react';
import { ThemeProvider } from '@schema/ui-kit';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders wraps the application with all necessary providers.
 * Currently includes ThemeProvider for theme management.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="somatic-theme">
      {children}
    </ThemeProvider>
  );
}
