'use client';

import * as React from 'react';
import { getTaskDetail } from '../[uuid]/mock-data';
import { useTabState } from '../[uuid]/hooks/useTabState';
import type { AnalysisTaskDetail, TabType, AnalysisStatus } from '../[uuid]/types';
import { TAB_CONFIGS } from '../[uuid]/types';
import {
  QCResultTab,
  SNVIndelTab,
  CNVTab,
  STRTab,
  MTTab,
  UPDTab,
} from '../[uuid]/components';
import { Tag } from '@schema/ui-kit';

interface AnalysisDetailPanelProps {
  taskId: string;
}

const statusConfig: Record<AnalysisStatus, { label: string; variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }> = {
  queued: { label: '排队中', variant: 'neutral' },
  running: { label: '运行中', variant: 'info' },
  completed: { label: '已完成', variant: 'success' },
  failed: { label: '失败', variant: 'danger' },
  pending_interpretation: { label: '待解读', variant: 'warning' },
};

export function AnalysisDetailPanel({ taskId }: AnalysisDetailPanelProps) {
  const [task, setTask] = React.useState<AnalysisTaskDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabType>('qc');

  // 各标签页的筛选状态
  const [tabStates, setTabStates] = React.useState({
    'snv-indel': { searchQuery: '', filters: {}, page: 1, pageSize: 20 },
    'cnv': { searchQuery: '', filters: {}, page: 1, pageSize: 20 },
    'str': { searchQuery: '', filters: {}, page: 1, pageSize: 20 },
    'mt': { searchQuery: '', filters: {}, page: 1, pageSize: 20 },
    'upd': { searchQuery: '', filters: {}, page: 1, pageSize: 20 },
  });

  const getFilterState = (tab: keyof typeof tabStates) => tabStates[tab];
  const setFilterState = (tab: keyof typeof tabStates, state: typeof tabStates[typeof tab]) => {
    setTabStates(prev => ({ ...prev, [tab]: state }));
  };

  React.useEffect(() => {
    async function loadTask() {
      setLoading(true);
      const taskData = await getTaskDetail(taskId);
      setTask(taskData);
      setLoading(false);
    }
    loadTask();
  }, [taskId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center py-16 text-fg-muted">
        未找到该任务
      </div>
    );
  }

  const statusInfo = statusConfig[task.status];

  // 渲染当前标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'qc':
        return <QCResultTab taskId={taskId} />;
      case 'snv-indel':
        return (
          <SNVIndelTab
            taskId={taskId}
            filterState={getFilterState('snv-indel')}
            onFilterChange={(state) => setFilterState('snv-indel', state)}
          />
        );
      case 'cnv':
        return (
          <CNVTab
            taskId={taskId}
            filterState={getFilterState('cnv')}
            onFilterChange={(state) => setFilterState('cnv', state)}
          />
        );
      case 'str':
        return (
          <STRTab
            taskId={taskId}
            filterState={getFilterState('str')}
            onFilterChange={(state) => setFilterState('str', state)}
          />
        );
      case 'mt':
        return (
          <MTTab
            taskId={taskId}
            filterState={getFilterState('mt')}
            onFilterChange={(state) => setFilterState('mt', state)}
          />
        );
      case 'upd':
        return (
          <UPDTab
            taskId={taskId}
            filterState={getFilterState('upd')}
            onFilterChange={(state) => setFilterState('upd', state)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      {/* 任务信息头部 - 紧凑版 */}
      <div className="mb-4 pb-3 border-b border-border-default">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-base font-medium text-fg-default">{task.name}</h3>
          <Tag variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Tag>
        </div>
        <div className="flex items-center gap-4 text-xs text-fg-muted">
          <span>样本: {task.sampleId}</span>
          <span>流程: {task.pipeline} {task.pipelineVersion}</span>
          <span>创建: {task.createdAt}</span>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-border-default mb-4">
        <nav className="flex gap-1" role="tablist">
          {TAB_CONFIGS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors
                  ${isActive
                    ? 'border-accent-emphasis text-accent-fg'
                    : 'border-transparent text-fg-muted hover:text-fg-default'
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 标签页内容 */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
}
