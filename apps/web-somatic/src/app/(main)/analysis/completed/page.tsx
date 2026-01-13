'use client';

import * as React from 'react';
import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Eye, FileText, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface CompletedTask {
  id: string;
  sampleId: string;
  sampleName: string;
  pipeline: string;
  variantCount: number;
  completedAt: string;
  duration: string;
  hasReport: boolean;
}

const mockCompletedTasks: CompletedTask[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    sampleId: 'S2024120001',
    sampleName: '张**',
    pipeline: '单样本分析',
    variantCount: 15230,
    completedAt: '2024-12-20 14:25',
    duration: '3小时55分',
    hasReport: true,
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    sampleId: 'S2024120001',
    sampleName: '张**',
    pipeline: 'RNA融合分析',
    variantCount: 12,  // 融合基因数量
    completedAt: '2024-12-28 11:30',
    duration: '4小时10分',
    hasReport: true,
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    sampleId: 'S2024120002',
    sampleName: '李**',
    pipeline: '配对样本分析',
    variantCount: 15680,
    completedAt: '2024-12-27 13:15',
    duration: '4小时15分',
    hasReport: false,
  },
];

export default function CompletedAnalysisPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredTasks = React.useMemo(() => {
    if (!searchQuery) return mockCompletedTasks;
    const query = searchQuery.toLowerCase();
    return mockCompletedTasks.filter(
      (t) =>
        t.id.toLowerCase().includes(query) ||
        t.sampleId.toLowerCase().includes(query) ||
        t.sampleName.includes(query)
    );
  }, [searchQuery]);

  const columns: Column<CompletedTask>[] = [
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
    { id: 'completedAt', header: '完成时间', accessor: 'completedAt', width: 140 },
    { id: 'duration', header: '耗时', accessor: 'duration', width: 100 },
    {
      id: 'report',
      header: '报告',
      accessor: (row) => (
        <Tag variant={row.hasReport ? 'success' : 'neutral'}>
          {row.hasReport ? '已生成' : '未生成'}
        </Tag>
      ),
      width: 80,
    },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Link href={`/analysis/${row.id}`}>
            <Button variant="ghost" size="small" iconOnly aria-label="查看结果">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          {!row.hasReport && (
            <Button variant="ghost" size="small" iconOnly aria-label="生成报告">
              <FileText className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="small" iconOnly aria-label="重新分析">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      ),
      width: 100,
    },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">已完成的任务</h2>

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
