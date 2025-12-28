'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageContent } from '@/components/layout';
import { getTaskDetail } from './mock-data';
import { useTabState } from './hooks/useTabState';
import type { AnalysisTaskDetail } from './types';
import {
  TaskHeader,
  ResultTabs,
  SampleInfoTab,
  QCResultTab,
  SNVIndelTab,
  CNVSegmentTab,
  CNVExonTab,
  STRTab,
  MTTab,
  UPDTab,
} from './components';

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const uuid = params.uuid as string;
  const [task, setTask] = React.useState<AnalysisTaskDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  // 使用标签页状态管理hook
  const { activeTab, setActiveTab, getFilterState, setFilterState } = useTabState(uuid);

  // 加载任务数据
  React.useEffect(() => {
    async function loadTask() {
      setLoading(true);
      const taskData = await getTaskDetail(uuid);
      if (!taskData) {
        setNotFound(true);
      } else {
        setTask(taskData);
      }
      setLoading(false);
    }
    loadTask();
  }, [uuid]);

  // 返回任务列表
  const handleBack = React.useCallback(() => {
    router.push('/analysis');
  }, [router]);

  // 404页面
  if (notFound) {
    return (
      <PageContent>
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-2xl font-semibold text-fg-default mb-2">404</h2>
          <p className="text-fg-muted mb-4">未找到该分析任务</p>
          <button
            onClick={handleBack}
            className="text-accent-fg hover:underline"
          >
            返回任务列表
          </button>
        </div>
      </PageContent>
    );
  }

  // 加载中
  if (loading) {
    return (
      <PageContent>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-emphasis" />
        </div>
      </PageContent>
    );
  }

  if (!task) {
    return null;
  }

  // 渲染当前标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'sample-info':
        return <SampleInfoTab taskId={uuid} />;
      case 'qc':
        return <QCResultTab taskId={uuid} />;
      case 'snv-indel':
        return (
          <SNVIndelTab
            taskId={uuid}
            filterState={getFilterState('snv-indel')}
            onFilterChange={(state) => setFilterState('snv-indel', state)}
          />
        );
      case 'cnv-segment':
        return (
          <CNVSegmentTab
            taskId={uuid}
            filterState={getFilterState('cnv-segment')}
            onFilterChange={(state) => setFilterState('cnv-segment', state)}
          />
        );
      case 'cnv-exon':
        return (
          <CNVExonTab
            taskId={uuid}
            filterState={getFilterState('cnv-exon')}
            onFilterChange={(state) => setFilterState('cnv-exon', state)}
          />
        );
      case 'str':
        return (
          <STRTab
            taskId={uuid}
            filterState={getFilterState('str')}
            onFilterChange={(state) => setFilterState('str', state)}
          />
        );
      case 'mt':
        return (
          <MTTab
            taskId={uuid}
            filterState={getFilterState('mt')}
            onFilterChange={(state) => setFilterState('mt', state)}
          />
        );
      case 'upd':
        return (
          <UPDTab
            taskId={uuid}
            filterState={getFilterState('upd')}
            onFilterChange={(state) => setFilterState('upd', state)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageContent>
      {/* 任务信息头部 */}
      <TaskHeader task={task} onBack={handleBack} />

      {/* 标签面板和内容 */}
      <ResultTabs activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </ResultTabs>
    </PageContent>
  );
}
