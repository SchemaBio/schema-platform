'use client';

import * as React from 'react';

interface PageContentProps {
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether to apply default padding (default: true) */
  padded?: boolean;
}

/**
 * PageContent provides a scrollable content container with consistent padding.
 * Used as the main content wrapper within pages.
 */
export function PageContent({ children, className = '', padded = true }: PageContentProps) {
  return (
    <div
      className={`
        flex-1 overflow-auto
        ${padded ? 'p-6' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
