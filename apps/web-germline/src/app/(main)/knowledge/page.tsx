'use client';

import * as React from 'react';
import { PageContent } from '@/components/layout';
import type { KnowledgeTabType } from './types';
import { DEFAULT_KNOWLEDGE_FILTER_STATE } from './types';
import {
  KnowledgeTabs,
  SNVIndelHistoryTab,
  CNVSegmentHistoryTab,
  CNVExonHistoryTab,
  STRHistoryTab,
  MEIHistoryTab,
  MTHistoryTab,
  UPDHistoryTab,
} from './components';

export default function KnowledgeHistoryPage() {
  const [activeTab, setActiveTab] = React.useState<KnowledgeTabType>('snv-indel');
  const [filterState, setFilterState] = React.useState(DEFAULT_KNOWLEDGE_FILTER_STATE);

  // 当切换标签页时重置筛选状态
  const handleTabChange = React.useCallback((tab: KnowledgeTabType) => {
    setActiveTab(tab);
    setFilterState(DEFAULT_KNOWLEDGE_FILTER_STATE);
  }, []);

  // 渲染当前标签页内容
  const renderTabContent = React.useCallback(() => {
    switch (activeTab) {
      case 'snv-indel':
        return (
          <SNVIndelHistoryTab
            filterState={filterState}
            onFilterChange={setFilterState}
          />
        );
      case 'cnv-segment':
        return (
          <CNVSegmentHistoryTab
            filterState={filterState}
            onFilterChange={setFilterState}
          />
        );
      case 'cnv-exon':
        return (
          <CNVExonHistoryTab
            filterState={filterState}
            onFilterChange={setFilterState}
          />
        );
      case 'str':
        return (
          <STRHistoryTab
            filterState={filterState}
            onFilterChange={setFilterState}
          />
        );
      case 'mei':
        return (
          <MEIHistoryTab
            filterState={filterState}
            onFilterChange={setFilterState}
          />
        );
      case 'mt':
        return (
          <MTHistoryTab
            filterState={filterState}
            onFilterChange={setFilterState}
          />
        );
      case 'upd':
        return (
          <UPDHistoryTab
            filterState={filterState}
            onFilterChange={setFilterState}
          />
        );
      default:
        return null;
    }
  }, [activeTab, filterState, setFilterState]);

  return (
    <PageContent>
      <div className="mb-4">
        <h2 className="text-lg font-medium text-fg-default">历史检出位点汇总</h2>
        <p className="text-sm text-fg-muted mt-1">
          收录任务中已审核通过的位点，按变异类型分类展示
        </p>
      </div>

      <KnowledgeTabs activeTab={activeTab} onTabChange={handleTabChange}>
        {renderTabContent()}
      </KnowledgeTabs>
    </PageContent>
  );
}