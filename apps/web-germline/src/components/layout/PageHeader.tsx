'use client';

import * as React from 'react';
import { Breadcrumb, type BreadcrumbItem } from '@schema/ui-kit';

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Optional action buttons on the right */
  actions?: React.ReactNode;
  /** Breadcrumb items */
  breadcrumbs?: BreadcrumbItem[];
}

/**
 * PageHeader displays the page title, description, breadcrumbs, and action buttons.
 * Used at the top of each page within the main content area.
 */
export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-canvas px-6 py-4">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-3">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-fg-default truncate">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-fg-muted">{description}</p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
