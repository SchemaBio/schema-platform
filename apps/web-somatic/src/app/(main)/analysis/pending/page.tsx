'use client';

import * as React from 'react';
import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, FlaskConical } from 'lucide-react';

interface PendingTask {
  id: string;
  sampleId: string;
  sampleName: string;
  pipeline: string;
  variantCount: number;
  completedAt: string;
  waitingDays: number;
}

const mockPendingTasks: PendingTask[] = [
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    sampleId: 'S2024120001',
    sampleName: '张**',
    pipeline: '单样本分析',
    variantCount: 15680,
    completedAt: '2024-12-25 13:15',
    waitingDays: 3,
  },
  {
    id: 'f6a7b8c9-d0e1-2345-abcd-567890123456',
    sampleId: 'S2024120005',
    sampleName: '陈**',
    pipeline: 'RNA融合分析',
    variantCount: 14520,
    completedAt: '2024-12-26 16:30',
    waitingDays: 2,
  },
  {
    id: 'a7b8c9d0-e1f2-3456-bcde-678901234567',
    sampleId: 'S2024120007',
    sampleName: '吴**',
    pipeline: '配对样本分析',
    variantCount: 856,
    completedAt: '2024-12-27 10:00',
    waitingDays: 1,
  },
];

export default function PendingAnalysisPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredTasks = React.useMemo(() => {
    if (!searchQuery) return mockPendingTasks;
    const query = searchQuery.toLowerCase();
    return mockPendingTasks.filter(
      (t) =>
        t.id.toLowerCase().includes(query) ||
        t.sampleId.toLowerCase().includes(query) ||
        t.sampleName.includes(query)
    );
  }, [searchQuery]);

  const columns: Column<PendingTask>[] = [
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
      id: 'variantCount',
      header: '变异数量',
      accessor: (row) => `${row.variantCount.toLocaleString()} 个`,
      width: 100,
    },
    { id: 'completedAt', header: '分析完成时间', accessor: 'completedAt', width: 150 },
    {
      id: 'waitingDays',
      header: '等待天数',
      accessor: (row) => (
        <Tag variant={row.waitingDays >= 3 ? 'danger' : row.waitingDays >= 2 ? 'warning' : 'neutral'}>
          {row.waitingDays} 天
        </Tag>
      ),
      width: 100,
    },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <Button variant="primary" size="small" leftIcon={<FlaskConical className="w-3 h-3" />}>
          开始解读
        </Button>
      ),
      width: 120,
    },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">待解读任务</h2>

      {mockPendingTasks.length > 0 && (
        <div className="p-3 bg-warning-subtle border border-warning-emphasis rounded-lg mb-4">
          <p className="text-sm text-warning-fg">
            您有 {mockPendingTasks.length} 个任务待解读，
            其中 {mockPendingTasks.filter((t) => t.waitingDays >= 3).length} 个已等待超过3天
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="w-72">
          <Input
            placeholder="搜索任务ID、样本编号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <DataTable
        data={filteredTasks}
        columns={columns}
        rowKey="id"
        striped
        density="default"
      />
    </PageContent>
  );
}
