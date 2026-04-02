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
 * Includes ThemeProvider for theme management,
 * AuthProvider for authentication,
 * and AIProvider for AI assistant configuration.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="germline-theme">
      <AuthProvider>
        <AIProvider>
          {children}
        </AIProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}