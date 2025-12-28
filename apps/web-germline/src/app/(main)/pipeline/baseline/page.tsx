'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Plus, Search, Upload, Download, Trash2 } from 'lucide-react';
import * as React from 'react';

interface BaselineFile {
  id: string;
  name: string;
  type: 'cnv' | 'qc' | 'coverage';
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
    type: 'cnv',
    sampleCount: 100,
    bedFile: 'Agilent_SureSelect_V7.bed',
    description: 'WES V7 CNV检测基线（100样本）',
    createdAt: '2024-10-15',
    createdBy: '王工',
  },
  {
    id: '2',
    name: 'WES_V7_QC_Baseline',
    type: 'qc',
    sampleCount: 200,
    bedFile: 'Agilent_SureSelect_V7.bed',
    description: 'WES V7 质控基线',
    createdAt: '2024-11-01',
    createdBy: '李工',
  },
  {
    id: '3',
    name: 'Cardio_Panel_Coverage',
    type: 'coverage',
    sampleCount: 50,
    bedFile: 'Cardio_Panel_v2.bed',
    description: '心血管Panel覆盖度基线',
    createdAt: '2024-09-20',
    createdBy: '王工',
  },
];

export default function BaselineFilesPage() {
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

  const getTypeTag = (type: BaselineFile['type']) => {
    switch (type) {
      case 'cnv':
        return <Tag variant="info">CNV基线</Tag>;
      case 'qc':
        return <Tag variant="success">质控基线</Tag>;
      case 'coverage':
        return <Tag variant="warning">覆盖度基线</Tag>;
    }
  };

  const columns: Column<BaselineFile>[] = [
    { id: 'name', header: '基线名称', accessor: 'name', width: 250 },
    {
      id: 'type',
      header: '类型',
      accessor: (row) => getTypeTag(row.type),
      width: 100,
    },
    {
      id: 'sampleCount',
      header: '样本数',
      accessor: (row) => `${row.sampleCount} 个`,
      width: 80,
    },
    { id: 'bedFile', header: '关联BED', accessor: 'bedFile', width: 200 },
    { id: 'description', header: '描述', accessor: 'description', width: 200 },
    { id: 'createdAt', header: '创建时间', accessor: 'createdAt', width: 120 },
    { id: 'createdBy', header: '创建者', accessor: 'createdBy', width: 80 },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
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
      <h2 className="text-lg font-medium text-fg-default mb-4">基线文件管理</h2>

      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
        <p className="text-sm text-fg-muted">
          基线文件用于 CNV 检测、质控评估和覆盖度分析。建议使用相同捕获试剂盒的样本构建基线，样本数量越多越准确。
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
