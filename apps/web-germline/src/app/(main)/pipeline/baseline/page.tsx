'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Plus, Search, Download, Trash2 } from 'lucide-react';
import * as React from 'react';

interface BaselineFile {
  id: string;
  name: string;
  sampleCount: number;
  bedFile: string;
  description: string;
  createdAt: string;
  createdBy: string;
}

const mockBaselines: BaselineFile[] = [
  {
    id: '1',
    name: 'WES_V7_CNV_Baseline_100',
    sampleCount: 100,
    bedFile: 'Agilent_SureSelect_V7.bed',
    description: 'WES V7 CNV检测基线（100样本）',
    createdAt: '2024-10-15',
    createdBy: '王工',
  },
  {
    id: '2',
    name: 'WES_V7_CNV_Baseline_200',
    sampleCount: 200,
    bedFile: 'Agilent_SureSelect_V7.bed',
    description: 'WES V7 CNV检测基线（200样本）',
    createdAt: '2024-11-01',
    createdBy: '李工',
  },
  {
    id: '3',
    name: 'IDT_xGen_CNV_Baseline',
    sampleCount: 80,
    bedFile: 'IDT_xGen_Exome_v2.bed',
    description: 'IDT xGen Exome CNV检测基线',
    createdAt: '2024-09-20',
    createdBy: '王工',
  },
];

export default function CNVBaselinePage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredFiles = React.useMemo(() => {
    if (!searchQuery) return mockBaselines;
    const query = searchQuery.toLowerCase();
    return mockBaselines.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const columns: Column<BaselineFile>[] = [
    { id: 'name', header: '基线名称', accessor: 'name', width: 250 },
    {
      id: 'sampleCount',
      header: '样本数',
      accessor: (row) => `${row.sampleCount} 个`,
      width: 100,
    },
    { id: 'bedFile', header: '关联 BED', accessor: 'bedFile', width: 200 },
    { id: 'description', header: '描述', accessor: 'description', width: 220 },
    { id: 'createdAt', header: '创建时间', accessor: 'createdAt', width: 120 },
    { id: 'createdBy', header: '创建者', accessor: 'createdBy', width: 80 },
    {
      id: 'actions',
      header: '操作',
      accessor: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="small" iconOnly aria-label="下载">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="small" iconOnly aria-label="删除">
            <Trash2 className="w-4 h-4 text-danger-fg" />
          </Button>
        </div>
      ),
      width: 100,
    },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">CNV 基线管理</h2>

      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
        <p className="text-sm text-fg-muted">
          CNV 基线用于拷贝数变异检测，通过对比样本与基线的覆盖度差异识别 CNV。
          建议使用相同捕获试剂盒、相同测序平台的样本构建基线，样本数量越多检测越准确（推荐 ≥50 个样本）。
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="w-64">
          <Input
            placeholder="搜索基线..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          创建基线
        </Button>
      </div>

      <DataTable
        data={filteredFiles}
        columns={columns}
        rowKey="id"
        density="default"
        striped
      />
    </PageContent>
  );
}
