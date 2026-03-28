'use client';

import * as React from 'react';
import { Building2 } from 'lucide-react';
import { Tooltip } from '@schema/ui-kit';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface OrganizationSwitcherProps {
  className?: string;
  collapsed?: boolean;
}

export function OrganizationSwitcher({ className, collapsed = false }: OrganizationSwitcherProps) {
  const { currentOrg } = useAuth();

  // Collapsed mode - show only icon with tooltip
  if (collapsed) {
    return (
      <div className={cn('flex items-center justify-center w-full py-2', className)}>
        <Tooltip content={currentOrg?.name || '组织'} placement="right" variant="nav">
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </Tooltip>
      </div>
    );
  }

  // Expanded mode - show organization name (no switching)
  return (
    <div className={cn('flex items-center gap-2 px-3 py-2', className)}>
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium truncate">
        {currentOrg?.name || '组织'}
      </span>
    </div>
  );
}