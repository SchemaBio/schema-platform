'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Upload, Search, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import * as React from 'react';

interface SampleSheet {
  id: string;
  fileName: string;
  runId: string;
  sampleCount: number;
  matchedCount: number;
  unmatchedCount: number;
  uploadedAt: string;
  uploadedBy: string;
  status: 'processing' | 'completed' | 'error';
}

const mockSampleSheets: SampleSheet[] = [
  {
    id: '1',
    fileName: 'SampleSheet_Run001.csv',
    runId: 'RUN-2024120001',
    sampleCount: 48,
    matchedCount: 45,
    unmatchedCount: 3,
    uploadedAt: '2024-12-20 14:30',
    uploadedBy: '张技师',
    status: 'completed',
  },
  {
    id: '2',
    fileName: 'SampleSheet_Run002.csv',
    runId: 'RUN-2024120002',
    sampleCount: 96,
    matchedCount: 96,
    unmatchedCount: 0,
    uploadedAt: '2024-12-25 09:15',
    uploadedBy: '李技师',
    status: 'completed',
  },
  {
    id: '3',
    fileName: 'SampleSheet_Run003.csv',
    runId: 'RUN-2024120003',
    sampleCount: 24,
    matchedCount: 0,
    unmatchedCount: 0,
    uploadedAt: '2024-12-28 10:00',
    uploadedBy: '张技师',
    status: 'processing',
  },
];

export default function SampleSheetPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredSheets = React.useMemo(() => {
    if (!searchQuery) return mockSampleSheets;
    const query = searchQuery.toLowerCase();
    return mockSampleSheets.filter(
      (s) =>
        s.fileName.toLowerCase().includes(query) ||
        s.runId.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const getStatusTag = (sheet: SampleSheet) => {
    switch (sheet.status) {
      case 'processing':
        return <Tag variant="info">处理中</Tag>;
      case 'completed':
        if (sheet.unmatchedCount > 0) {
          return <Tag variant="warning">部分匹配</Tag>;
        }
        return <Tag variant="success">全部匹配</Tag>;
      case 'error':
        return <Tag variant="danger">错误</Tag>;
    }
  };

  const columns: Column<SampleSheet>[] = [
    {
      id: 'fileName',
      header: '文件名',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-fg-muted" />
          <span>{row.fileName}</span>
        </div>
      ),
      width: 250,
    },
    { id: 'runId', header: '测序批次', accessor: 'runId', width: 150 },
    {
      id: 'sampleCount',
      header: '样本数',
      accessor: (row) => `${row.sampleCount} 个`,
      width: 80,
    },
    {
      id: 'matching',
      header: '匹配情况',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-success-fg">{row.matchedCount} 匹配</span>
          {row.unmatchedCount > 0 && (
            <span className="text-warning-fg">{row.unmatchedCount} 未匹配</span>
          )}
        </div>
      ),
      width: 150,
    },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => getStatusTag(row),
      width: 100,
    },
    { id: 'uploadedAt', header: '上传时间', accessor: 'uploadedAt', width: 150 },
    { id: 'uploadedBy', header: '上传者', accessor: 'uploadedBy', width: 80 },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">Sample Sheet 管理</h2>

      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
        <p className="text-sm text-fg-muted">
          上传测序仪生成的 Sample Sheet 文件，系统将自动解析并匹配到已录入的样本。
          支持 Illumina 标准格式的 CSV 文件。
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="w-64">
          <Input
            placeholder="搜索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="primary" leftIcon={<Upload className="w-4 h-4" />}>
          上传 Sample Sheet
        </Button>
      </div>

      <DataTable
        data={filteredSheets}
        columns={columns}
        rowKey="id"
        density="default"
        striped
      />
    </PageContent>
  );
}
