'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Plus, Search, Upload, Download, Trash2 } from 'lucide-react';
import * as React from 'react';

interface BedFile {
  id: string;
  name: string;
  targetRegions: number;
  totalSize: string;
  genomeVersion: string;
  description: string;
  uploadedAt: string;
  uploadedBy: string;
}

const mockBedFiles: BedFile[] = [
  {
    id: '1',
    name: 'Agilent_SureSelect_V7.bed',
    targetRegions: 243199,
    totalSize: '67.3 MB',
    genomeVersion: 'hg38',
    description: 'Agilent SureSelect Human All Exon V7',
    uploadedAt: '2024-01-10',
    uploadedBy: '王工',
  },
  {
    id: '2',
    name: 'Cardio_Panel_v2.bed',
    targetRegions: 1856,
    totalSize: '2.1 MB',
    genomeVersion: 'hg38',
    description: '心血管疾病相关基因Panel',
    uploadedAt: '2024-03-15',
    uploadedBy: '李工',
  },
  {
    id: '3',
    name: 'IDT_xGen_Exome_v2.bed',
    targetRegions: 415115,
    totalSize: '89.2 MB',
    genomeVersion: 'hg38',
    description: 'IDT xGen Exome Research Panel v2',
    uploadedAt: '2024-06-20',
    uploadedBy: '王工',
  },
];

export default function BedFilesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredFiles = React.useMemo(() => {
    if (!searchQuery) return mockBedFiles;
    const query = searchQuery.toLowerCase();
    return mockBedFiles.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const columns: Column<BedFile>[] = [
    { id: 'name', header: '文件名', accessor: 'name', width: 250 },
    {
      id: 'targetRegions',
      header: '目标区域数',
      accessor: (row) => row.targetRegions.toLocaleString(),
      width: 120,
    },
    { id: 'totalSize', header: '文件大小', accessor: 'totalSize', width: 100 },
    {
      id: 'genomeVersion',
      header: '参考基因组',
      accessor: (row) => <Tag variant="info">{row.genomeVersion}</Tag>,
      width: 100,
    },
    { id: 'description', header: '描述', accessor: 'description', width: 250 },
    { id: 'uploadedAt', header: '上传时间', accessor: 'uploadedAt', width: 120 },
    { id: 'uploadedBy', header: '上传者', accessor: 'uploadedBy', width: 80 },
    {
      id: 'actions',
      header: '操作',
      accessor: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="small" iconOnly aria-label="下载" leftIcon={<Download className="w-4 h-4" />} />
          <Button variant="ghost" size="small" iconOnly aria-label="删除" leftIcon={<Trash2 className="w-4 h-4 text-danger-fg" />} />
        </div>
      ),
      width: 100,
    },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">BED 文件管理</h2>

      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
        <p className="text-sm text-fg-muted">
          BED 文件定义了目标捕获区域，用于变异检测和质控分析。支持 hg19/hg38 参考基因组。
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="w-64">
          <Input
            placeholder="搜索文件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="primary" leftIcon={<Upload className="w-4 h-4" />}>
          上传 BED 文件
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
