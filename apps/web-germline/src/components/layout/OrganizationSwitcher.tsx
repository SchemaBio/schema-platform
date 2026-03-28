'use client';

import * as React from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface OrganizationSwitcherProps {
  className?: string;
}

export function OrganizationSwitcher({ className }: OrganizationSwitcherProps) {
  const { organizations, currentOrg, switchOrganization } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't render if there are no organizations or only one
  if (!organizations.length || organizations.length <= 1) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-2', className)}>
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium truncate">
          {currentOrg?.name || 'No Organization'}
        </span>
      </div>
    );
  }

  const handleSelect = async (orgId: string) => {
    if (orgId !== currentOrg?.id) {
      await switchOrganization(orgId);
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
      >
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-left font-medium truncate">
          {currentOrg?.name || 'Select Organization'}
        </span>
        <ChevronDown className={cn(
          'h-4 w-4 text-muted-foreground transition-transform',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-1">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Organizations
            </div>
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleSelect(org.id)}
                className={cn(
                  'flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent transition-colors',
                  currentOrg?.id === org.id && 'bg-accent'
                )}
              >
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-left truncate">{org.name}</span>
                {currentOrg?.id === org.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}