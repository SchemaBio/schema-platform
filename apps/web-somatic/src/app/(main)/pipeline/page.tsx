'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Plus, Search, Play, Pause } from 'lucide-react';
import * as React from 'react';

interface Pipeline {
  id: string;
  name: string;
  version: string;
  description: string;
  bedFile: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const mockPipelines: Pipeline[] = [
  {
    id: '1',
    name: '单样本分析',
    version: 'v1.2.0',
    description: '单样本体细胞突变分析流程',
    bedFile: 'Agilent_SureSelect_V7.bed',
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-01',
  },
  {
    id: '2',
    name: 'RNA融合分析',
    version: 'v2.0.1',
    description: 'RNA融合基因检测分析流程',
    bedFile: 'RNA_Fusion_Panel.bed',
    status: 'active',
    createdAt: '2024-03-20',
    updatedAt: '2024-11-15',
  },
  {
    id: '3',
    name: '配对样本分析',
    version: 'v1.0.0',
    description: '肿瘤-正常配对样本分析流程',
    bedFile: 'Paired_Sample_Panel.bed',
    status: 'active',
    createdAt: '2023-06-01',
    updatedAt: '2024-01-15',
  },
];

export default function PipelineListPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredPipelines = React.useMemo(() => {
    if (!searchQuery) return mockPipelines;
    const query = searchQuery.toLowerCase();
    return mockPipelines.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const columns: Column<Pipeline>[] = [
    { id: 'name', header: '流程名称', accessor: 'name', width: 180 },
    { id: 'version', header: '版本', accessor: 'version', width: 100 },
    { id: 'description', header: '描述', accessor: 'description', width: 250 },
    { id: 'bedFile', header: 'BED 文件', accessor: 'bedFile', width: 200 },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => (
        <Tag variant={row.status === 'active' ? 'success' : 'neutral'}>
          {row.status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
      width: 80,
    },
    { id: 'updatedAt', header: '更新时间', accessor: 'updatedAt', width: 120 },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <Button
          variant="ghost"
          size="small"
          leftIcon={row.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        >
          {row.status === 'active' ? '停用' : '启用'}
        </Button>
      ),
      width: 100,
    },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">流程列表</h2>

      <div className="flex items-center justify-between mb-4">
        <div className="w-64">
          <Input
            placeholder="搜索流程..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          新建流程
        </Button>
      </div>

      <DataTable
        data={filteredPipelines}
        columns={columns}
        rowKey="id"
        density="default"
        striped
      />
    </PageContent>
  );
}
