'use client';

import * as React from 'react';
import { getTaskDetail, getSampleDetailByTaskId } from '../[uuid]/mock-data';
import type { AnalysisTaskDetail, TabType, AnalysisStatus } from '../[uuid]/types';
import type { SampleDetail } from '@/app/(main)/samples/types';
import { TAB_CONFIGS } from '../[uuid]/types';
import { GENDER_CONFIG } from '@/app/(main)/samples/types';
import {
  QCResultTab,
  SNVIndelTab,
  CNVSegmentTab,
  CNVExonTab,
  STRTab,
  MTTab,
  UPDTab,
  SangerTab,
  ReportTab,
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
  const [sample, setSample] = React.useState<SampleDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabType>('qc');

  // 各标签页的筛选状态
  const [tabStates, setTabStates] = React.useState({
    'snv-indel': { searchQuery: '', filters: {}, page: 1, pageSize: 20 },
    'cnv-segment': { searchQuery: '', filters: {}, page: 1, pageSize: 20 },
    'cnv-exon': { searchQuery: '', filters: {}, page: 1, pageSize: 20 },
    'str': { searchQuery: '', filters: {}, page: 1, pageSize: 20 },
    'mt': { searchQuery: '', filters: {}, page: 1, pageSize: 20 },
    'upd': { searchQuery: '', filters: {}, page: 1, pageSize: 20 },
    'sanger': { searchQuery: '', filters: {}, page: 1, pageSize: 20 },
  });

  const getFilterState = (tab: keyof typeof tabStates) => tabStates[tab];
  const setFilterState = (tab: keyof typeof tabStates, state: typeof tabStates[typeof tab]) => {
    setTabStates(prev => ({ ...prev, [tab]: state }));
  };

  React.useEffect(() => {
    async function loadTask() {
      setLoading(true);
      const [taskData, sampleData] = await Promise.all([
        getTaskDetail(taskId),
        getSampleDetailByTaskId(taskId),
      ]);
      setTask(taskData);
      setSample(sampleData);
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
      case 'cnv-segment':
        return (
          <CNVSegmentTab
            taskId={taskId}
            filterState={getFilterState('cnv-segment')}
            onFilterChange={(state) => setFilterState('cnv-segment', state)}
          />
        );
      case 'cnv-exon':
        return (
          <CNVExonTab
            taskId={taskId}
            filterState={getFilterState('cnv-exon')}
            onFilterChange={(state) => setFilterState('cnv-exon', state)}
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
      case 'sanger':
        return (
          <SangerTab
            taskId={taskId}
            filterState={getFilterState('sanger')}
            onFilterChange={(state) => setFilterState('sanger', state)}
          />
        );
      case 'report':
        return <ReportTab taskId={taskId} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      {/* 任务信息头部 */}
      <div className="mb-4 pb-3 border-b border-border-default">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-base font-medium text-fg-default">{task.name}</h3>
          <Tag variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Tag>
        </div>

        {/* 基本信息行 */}
        <div className="flex items-center gap-4 text-xs text-fg-muted mb-2">
          <span>样本: {task.sampleId}</span>
          {sample && (
            <>
              <span>性别: {GENDER_CONFIG[sample.gender].label}</span>
              {sample.age !== undefined && <span>年龄: {sample.age}岁</span>}
            </>
          )}
          <span>流程: {task.pipeline} {task.pipelineVersion}</span>
          <span>创建: {task.createdAt}</span>
        </div>

        {/* 临床信息行 */}
        {sample && (
          <div className="text-xs space-y-1">
            {sample.clinicalDiagnosis?.mainDiagnosis && (
              <div className="flex items-start gap-2">
                <span className="text-fg-muted shrink-0">临床诊断:</span>
                <span className="text-fg-default">{sample.clinicalDiagnosis.mainDiagnosis}</span>
              </div>
            )}
            {sample.clinicalDiagnosis?.symptoms && sample.clinicalDiagnosis.symptoms.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-fg-muted shrink-0">症状:</span>
                <div className="flex flex-wrap gap-1">
                  {sample.clinicalDiagnosis.symptoms.map((s: string, i: number) => (
                    <Tag key={i} variant="neutral" className="text-xs">{s}</Tag>
                  ))}
                </div>
              </div>
            )}
            {sample.clinicalDiagnosis?.hpoTerms && sample.clinicalDiagnosis.hpoTerms.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-fg-muted shrink-0">HPO:</span>
                <div className="flex flex-wrap gap-1">
                  {sample.clinicalDiagnosis.hpoTerms.map((hpo, i) => (
                    <Tag key={i} variant="info" className="text-xs font-mono" title={hpo.name}>
                      {hpo.id}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
            {sample.familyHistory?.hasHistory && (
              <div className="flex items-start gap-2">
                <span className="text-fg-muted shrink-0">家族史:</span>
                <span className="text-fg-default">有</span>
                {sample.familyHistory.affectedMembers && (
                  <div className="flex flex-wrap gap-1">
                    {sample.familyHistory.affectedMembers.map((member, i) => (
                      <Tag key={i} variant="warning" className="text-xs">
                        {member.relation}: {member.condition}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
