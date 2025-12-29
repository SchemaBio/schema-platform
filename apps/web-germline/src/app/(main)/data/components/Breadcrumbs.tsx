'use client';

import * as React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@schema/ui-kit';

interface BreadcrumbsProps {
  items: { name: string; path: string }[];
  onNavigate: (path: string) => void;
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-sm" aria-label="面包屑导航">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <React.Fragment key={item.path}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-fg-muted flex-shrink-0" />
            )}
            <button
              onClick={() => !isLast && onNavigate(item.path)}
              disabled={isLast}
              className={cn(
                'flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors',
                isLast
                  ? 'text-fg-default font-medium cursor-default'
                  : 'text-fg-muted hover:text-fg-default hover:bg-canvas-subtle'
              )}
            >
              {isFirst && <Home className="w-3.5 h-3.5" />}
              <span className="max-w-32 truncate">{item.name}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
