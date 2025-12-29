'use client';

import * as React from 'react';

const STORAGE_KEY = 'somatic-sidebar-state';

interface SidebarState {
  collapsed: boolean;
  expandedGroups: string[];
}

const DEFAULT_STATE: SidebarState = {
  collapsed: false,
  expandedGroups: [],
};

/**
 * Get sidebar state from localStorage.
 * Returns default state if localStorage is unavailable or parsing fails.
 */
function getStoredState(): SidebarState {
  if (typeof window === 'undefined') {
    return DEFAULT_STATE;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        collapsed: typeof parsed.collapsed === 'boolean' ? parsed.collapsed : DEFAULT_STATE.collapsed,
        expandedGroups: Array.isArray(parsed.expandedGroups) ? parsed.expandedGroups : DEFAULT_STATE.expandedGroups,
      };
    }
  } catch {
    // Ignore parsing errors
  }

  return DEFAULT_STATE;
}

/**
 * Save sidebar state to localStorage.
 */
function saveState(state: SidebarState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors (e.g., quota exceeded, private browsing)
  }
}

interface UseSidebarStateReturn {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  expandedGroups: string[];
  toggleGroup: (groupId: string) => void;
  isGroupExpanded: (groupId: string) => boolean;
}

/**
 * Hook to manage sidebar state with localStorage persistence.
 *
 * @returns Sidebar state and control functions
 *
 * @example
 * const { collapsed, setCollapsed, toggleCollapsed } = useSidebarState();
 */
export function useSidebarState(): UseSidebarStateReturn {
  const [state, setState] = React.useState<SidebarState>(DEFAULT_STATE);

  // Load state from localStorage on mount
  React.useEffect(() => {
    setState(getStoredState());
  }, []);

  // Save state to localStorage when it changes
  React.useEffect(() => {
    saveState(state);
  }, [state]);

  const setCollapsed = React.useCallback((collapsed: boolean) => {
    setState((prev) => ({ ...prev, collapsed }));
  }, []);

  const toggleCollapsed = React.useCallback(() => {
    setState((prev) => ({ ...prev, collapsed: !prev.collapsed }));
  }, []);

  const toggleGroup = React.useCallback((groupId: string) => {
    setState((prev) => {
      const isExpanded = prev.expandedGroups.includes(groupId);
      return {
        ...prev,
        expandedGroups: isExpanded
          ? prev.expandedGroups.filter((id) => id !== groupId)
          : [...prev.expandedGroups, groupId],
      };
    });
  }, []);

  const isGroupExpanded = React.useCallback(
    (groupId: string) => state.expandedGroups.includes(groupId),
    [state.expandedGroups]
  );

  return {
    collapsed: state.collapsed,
    setCollapsed,
    toggleCollapsed,
    expandedGroups: state.expandedGroups,
    toggleGroup,
    isGroupExpanded,
  };
}
