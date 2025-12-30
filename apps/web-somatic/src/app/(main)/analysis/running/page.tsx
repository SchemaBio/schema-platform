'use client';

import * as React from 'react';
import { PageContent } from '@/components/layout';
import { Button, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Eye, StopCircle } from 'lucide-react';

interface RunningTask {
  id: string;
  sampleId: string;
  sampleName: string;
  pipeline: string;
  currentStep: string;
  progress: number;
  startedAt: string;
  estimatedTime: string;
}

const mockRunningTasks: RunningTask[] = [
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    sampleId: 'S2024120002',
    sampleName: '李**',
    pipeline: '配对样本分析',
    currentStep: '变异注释',
    progress: 65,
    startedAt: '2024-12-27 14:00',
    estimatedTime: '约30分钟',
  },
  {
    id: 'h8i9j0k1-l2m3-4567-nopq-890123456789',
    sampleId: 'S2024120008',
    sampleName: '郑**',
    pipeline: '单样本分析',
    currentStep: '序列比对',
    progress: 25,
    startedAt: '2024-12-28 10:30',
    estimatedTime: '约2小时',
  },
];

export default function RunningAnalysisPage() {
  const columns: Column<RunningTask>[] = [
    {
      id: 'id',
      header: '任务ID',
      accessor: (row) => (
        <span className="font-mono text-xs" title={row.id}>
          {row.id.substring(0, 8)}...
        </span>
      ),
      width: 100,
    },
    {
      id: 'sample',
      header: '样本',
      accessor: (row) => (
        <div>
          <div className="text-fg-default">{row.sampleId}</div>
          <div className="text-xs text-fg-muted">{row.sampleName}</div>
        </div>
      ),
      width: 140,
    },
    { id: 'pipeline', header: '分析流程', accessor: 'pipeline', width: 150 },
    {
      id: 'currentStep',
      header: '当前步骤',
      accessor: (row) => <Tag variant="info">{row.currentStep}</Tag>,
      width: 120,
    },
    {
      id: 'progress',
      header: '进度',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-canvas-inset rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-emphasis rounded-full transition-all animate-pulse"
              style={{ width: `${row.progress}%` }}
            />
          </div>
          <span className="text-xs text-fg-muted w-10">{row.progress}%</span>
        </div>
      ),
      width: 150,
    },
    { id: 'startedAt', header: '开始时间', accessor: 'startedAt', width: 140 },
    { id: 'estimatedTime', header: '预计剩余', accessor: 'estimatedTime', width: 100 },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="small" iconOnly aria-label="查看日志">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="small" iconOnly aria-label="停止">
            <StopCircle className="w-4 h-4 text-danger-fg" />
          </Button>
        </div>
      ),
      width: 80,
    },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">进行中的任务</h2>

      {mockRunningTasks.length === 0 ? (
        <div className="rounded-lg border border-border bg-canvas-subtle p-8 text-center">
          <p className="text-fg-muted">当前没有正在运行的任务</p>
        </div>
      ) : (
        <>
          <div className="p-3 bg-info-subtle border border-accent-emphasis rounded-lg mb-4">
            <p className="text-sm text-accent-fg">
              当前有 {mockRunningTasks.length} 个任务正在运行
            </p>
          </div>
          <DataTable
            data={mockRunningTasks}
            columns={columns}
            rowKey="id"
            striped
            density="default"
          />
        </>
      )}
    </PageContent>
  );
}
