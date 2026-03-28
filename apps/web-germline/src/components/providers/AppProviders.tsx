'use client';

import * as React from 'react';
import { ThemeProvider } from '@schema/ui-kit';
import { AuthProvider } from './AuthProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders wraps the application with all necessary providers.
 * Includes ThemeProvider for theme management and AuthProvider for authentication.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="germline-theme">
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}