'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { TabType, TableFilterState } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';

interface TabStates {
  'snv-indel': TableFilterState;
  'cnv': TableFilterState;
  'str': TableFilterState;
  'mt': TableFilterState;
  'upd': TableFilterState;
}

interface UseTabStateReturn {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  getFilterState: (tab: keyof TabStates) => TableFilterState;
  setFilterState: (tab: keyof TabStates, state: TableFilterState) => void;
}

export function useTabState(uuid: string): UseTabStateReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 从URL获取当前标签页
  const activeTab = (searchParams.get('tab') as TabType) || 'qc';

  // 各标签页的筛选状态（保存在内存中）
  const [tabStates, setTabStates] = React.useState<TabStates>({
    'snv-indel': { ...DEFAULT_FILTER_STATE },
    'cnv': { ...DEFAULT_FILTER_STATE },
    'str': { ...DEFAULT_FILTER_STATE },
    'mt': { ...DEFAULT_FILTER_STATE },
    'upd': { ...DEFAULT_FILTER_STATE },
  });

  // 切换标签页
  const setActiveTab = React.useCallback((tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/analysis/${uuid}?${params.toString()}`);
  }, [router, uuid, searchParams]);

  // 获取指定标签页的筛选状态
  const getFilterState = React.useCallback((tab: keyof TabStates): TableFilterState => {
    return tabStates[tab];
  }, [tabStates]);

  // 设置指定标签页的筛选状态
  const setFilterState = React.useCallback((tab: keyof TabStates, state: TableFilterState) => {
    setTabStates(prev => ({
      ...prev,
      [tab]: state,
    }));
  }, []);

  return {
    activeTab,
    setActiveTab,
    getFilterState,
    setFilterState,
  };
}
