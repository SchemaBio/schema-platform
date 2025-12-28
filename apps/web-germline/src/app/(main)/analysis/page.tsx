'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Plus, Eye, RotateCcw } from 'lucide-react';

interface AnalysisTask {
  id: string; // UUID
  name: string;
  sampleId: string;
  sampleName: string;
  pipeline: string;
  pipelineVersion: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'pending_interpretation';
  progress: number;
  createdAt: string;
  createdBy: string;
  completedAt?: string;
}

// Mock data - 注意同一个样本可以有多个任务
const mockTasks: AnalysisTask[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'S2024120001 全外显子分析',
    sampleId: 'S2024120001',
    sampleName: '张**',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    status: 'completed',
    progress: 100,
    createdAt: '2024-12-20 10:30',
    createdBy: '王工',
    completedAt: '2024-12-20 14:25',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    name: 'S2024120001 重新分析',
    sampleId: 'S2024120001', // 同一样本的第二次分析
    sampleName: '张**',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    status: 'pending_interpretation',
    progress: 100,
    createdAt: '2024-12-25 09:00',
    createdBy: '李工',
    completedAt: '2024-12-25 13:15',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    name: 'S2024120002 心血管Panel',
    sampleId: 'S2024120002',
    sampleName: '李**',
    pipeline: 'Panel-Cardio',
    pipelineVersion: 'v2.0.1',
    status: 'running',
    progress: 65,
    createdAt: '2024-12-27 14:00',
    createdBy: '王工',
  },
  {
    id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    name: 'S2024120003 全外显子分析',
    sampleId: 'S2024120003',
    sampleName: '王**',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    status: 'queued',
    progress: 0,
    createdAt: '2024-12-28 09:30',
    createdBy: '李工',
  },
  {
    id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    name: 'S2024120004 全外显子分析',
    sampleId: 'S2024120004',
    sampleName: '赵**',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    status: 'failed',
    progress: 45,
    createdAt: '2024-12-26 11:00',
    createdBy: '王工',
  },
];

const statusConfig: Record<AnalysisTask['status'], { label: string; variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }> = {
  queued: { label: '排队中', variant: 'neutral' },
  running: { label: '运行中', variant: 'info' },
  completed: { label: '已完成', variant: 'success' },
  failed: { label: '失败', variant: 'danger' },
  pending_interpretation: { label: '待解读', variant: 'warning' },
};

export default function AnalysisPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  // 导航到任务详情页
  const handleTaskClick = React.useCallback((task: AnalysisTask) => {
    router.push(`/analysis/${task.id}`);
  }, [router]);

  const filteredTasks = React.useMemo(() => {
    if (!searchQuery) return mockTasks;
    const query = searchQuery.toLowerCase();
    return mockTasks.filter(
      (t) =>
        t.id.toLowerCase().includes(query) ||
        t.sampleId.toLowerCase().includes(query) ||
        t.name.toLowerCase().includes(query) ||
        t.sampleName.includes(query)
    );
  }, [searchQuery]);

  const columns: Column<AnalysisTask>[] = [
    {
      id: 'sample',
      header: '样本编号',
      accessor: (row) => (
        <div>
          <span className="text-accent-fg hover:underline cursor-pointer">{row.sampleId}</span>
          <div className="text-xs text-fg-muted">{row.sampleName}</div>
        </div>
      ),
      width: 140,
    },
    { id: 'name', header: '任务名称', accessor: 'name', width: 220 },
    {
      id: 'pipeline',
      header: '分析流程',
      accessor: (row) => (
        <div>
          <div className="text-fg-default">{row.pipeline}</div>
          <div className="text-xs text-fg-muted">{row.pipelineVersion}</div>
        </div>
      ),
      width: 150,
    },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => {
        const config = statusConfig[row.status];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 100,
    },
    {
      id: 'progress',
      header: '进度',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-canvas-inset rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                row.status === 'failed' ? 'bg-danger-emphasis' : 'bg-accent-emphasis'
              }`}
              style={{ width: `${row.progress}%` }}
            />
          </div>
          <span className="text-xs text-fg-muted w-10">{row.progress}%</span>
        </div>
      ),
      width: 150,
    },
    { id: 'createdAt', header: '创建时间', accessor: 'createdAt', width: 140 },
    { id: 'createdBy', header: '创建者', accessor: 'createdBy', width: 80 },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="small" 
            iconOnly 
            aria-label="查看"
            onClick={() => handleTaskClick(row)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {row.status === 'failed' && (
            <Button variant="ghost" size="small" iconOnly aria-label="重试">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
      width: 80,
    },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">任务列表</h2>

      <div className="flex items-center justify-between mb-4">
        <div className="w-72">
          <Input
            placeholder="搜索任务ID、样本编号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          新建任务
        </Button>
      </div>

      <DataTable
        data={filteredTasks}
        columns={columns}
        rowKey="id"
        striped
        density="default"
        onRowClick={handleTaskClick}
        className="cursor-pointer"
      />
    </PageContent>
  );
}
