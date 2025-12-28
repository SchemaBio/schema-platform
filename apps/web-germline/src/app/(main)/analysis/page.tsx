'use client';

import * as React from 'react';
import { PageContent } from '@/components/layout';
import { Button, DataTable, Tag, type Column } from '@schema/ui-kit';

interface AnalysisTask {
  id: string;
  name: string;
  sampleIds: string[];
  pipeline: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
}

// Mock data
const mockTasks: AnalysisTask[] = [
  { id: 'T001', name: 'FAM001 全外显子分析', sampleIds: ['S001', 'S002'], pipeline: 'WES', status: 'completed', progress: 100, createdAt: '2024-12-20' },
  { id: 'T002', name: 'S003 单样本分析', sampleIds: ['S003'], pipeline: 'WGS', status: 'running', progress: 65, createdAt: '2024-12-22' },
  { id: 'T003', name: 'S004 Panel分析', sampleIds: ['S004'], pipeline: 'Panel', status: 'queued', progress: 0, createdAt: '2024-12-23' },
  { id: 'T004', name: '测试任务', sampleIds: ['S001'], pipeline: 'WES', status: 'failed', progress: 30, createdAt: '2024-12-23' },
];

const statusConfig: Record<AnalysisTask['status'], { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  queued: { label: '排队中', variant: 'default' },
  running: { label: '运行中', variant: 'warning' },
  completed: { label: '已完成', variant: 'success' },
  failed: { label: '失败', variant: 'danger' },
};

const columns: Column<AnalysisTask>[] = [
  { id: 'id', header: '任务ID', accessor: 'id', width: 80 },
  { id: 'name', header: '任务名称', accessor: 'name', width: 200 },
  { id: 'sampleIds', header: '样本', accessor: (row) => row.sampleIds.join(', '), width: 120 },
  { id: 'pipeline', header: '流程', accessor: 'pipeline', width: 80 },
  { 
    id: 'status', 
    header: '状态', 
    accessor: (row) => {
      const config = statusConfig[row.status];
      return <Tag variant={config.variant}>{config.label}</Tag>;
    },
    width: 100 
  },
  { 
    id: 'progress', 
    header: '进度', 
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-canvas-inset rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent-emphasis rounded-full transition-all"
            style={{ width: `${row.progress}%` }}
          />
        </div>
        <span className="text-xs text-fg-muted w-10">{row.progress}%</span>
      </div>
    ),
    width: 150 
  },
  { id: 'createdAt', header: '创建时间', accessor: 'createdAt', width: 120 },
];

export default function AnalysisPage() {
  return (
    <PageContent>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-fg-default">任务列表</h2>
        <Button variant="primary" size="medium">
          新建任务
        </Button>
      </div>
      <DataTable
        data={mockTasks}
        columns={columns}
        rowKey="id"
        striped
        density="default"
        onRowClick={(row) => {
          // TODO: Open task detail in new tab
          console.log('Open task:', row.id);
        }}
      />
    </PageContent>
  );
}
