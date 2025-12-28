'use client';

import * as React from 'react';
import { Search } from 'lucide-react';

/**
 * SearchInput provides a global search input in the header.
 * Currently a placeholder UI - search functionality to be implemented.
 */
export function SearchInput() {
  const [query, setQuery] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search:', query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索样本、基因、变异..."
          className={`
            w-64 h-8 pl-9 pr-3 rounded-md text-sm
            bg-canvas-subtle border border-border
            text-fg-default placeholder:text-fg-muted
            focus:outline-none focus:ring-2 focus:ring-accent-emphasis focus:border-transparent
            transition-colors duration-fast
          `}
          aria-label="全局搜索"
        />
      </div>
    </form>
  );
}
