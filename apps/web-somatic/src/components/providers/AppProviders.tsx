'use client';

import * as React from 'react';
import { ThemeProvider } from '@schema/ui-kit';
import { AuthProvider } from './AuthProvider';
import { AIProvider } from './AIProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders wraps the application with all necessary providers.
 * Currently includes ThemeProvider for theme management, AuthProvider for authentication,
 * and AIProvider for global AI configuration.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="somatic-theme">
      <AuthProvider>
        <AIProvider>
          {children}
        </AIProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
