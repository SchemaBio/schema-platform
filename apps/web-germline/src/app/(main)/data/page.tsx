'use client';

import * as React from 'react';
import { PageContent } from '@/components/layout';
import { Button, DataTable, Tag, type Column } from '@schema/ui-kit';

interface DataFile {
  id: string;
  filename: string;
  fileType: string;
  size: string;
  sampleId: string | null;
  status: 'unmatched' | 'matched' | 'error';
  uploadedAt: string;
}

// Mock data
const mockDataFiles: DataFile[] = [
  { id: 'D001', filename: 'S001_R1.fastq.gz', fileType: 'FASTQ', size: '2.3 GB', sampleId: 'S001', status: 'matched', uploadedAt: '2024-12-20' },
  { id: 'D002', filename: 'S001_R2.fastq.gz', fileType: 'FASTQ', size: '2.3 GB', sampleId: 'S001', status: 'matched', uploadedAt: '2024-12-20' },
  { id: 'D003', filename: 'S002_R1.fastq.gz', fileType: 'FASTQ', size: '1.8 GB', sampleId: 'S002', status: 'matched', uploadedAt: '2024-12-21' },
  { id: 'D004', filename: 'unknown_sample.fastq.gz', fileType: 'FASTQ', size: '2.1 GB', sampleId: null, status: 'unmatched', uploadedAt: '2024-12-22' },
  { id: 'D005', filename: 'corrupted_file.fastq.gz', fileType: 'FASTQ', size: '0 B', sampleId: null, status: 'error', uploadedAt: '2024-12-23' },
];

const statusConfig: Record<DataFile['status'], { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  unmatched: { label: '未匹配', variant: 'default' },
  matched: { label: '已匹配', variant: 'success' },
  error: { label: '错误', variant: 'danger' },
};

const columns: Column<DataFile>[] = [
  { id: 'filename', header: '文件名', accessor: 'filename', width: 250 },
  { id: 'fileType', header: '类型', accessor: 'fileType', width: 80 },
  { id: 'size', header: '大小', accessor: 'size', width: 100 },
  { id: 'sampleId', header: '关联样本', accessor: (row) => row.sampleId || '-', width: 100 },
  { 
    id: 'status', 
    header: '状态', 
    accessor: (row) => {
      const config = statusConfig[row.status];
      return <Tag variant={config.variant}>{config.label}</Tag>;
    },
    width: 100 
  },
  { id: 'uploadedAt', header: '上传时间', accessor: 'uploadedAt', width: 120 },
];

export default function DataPage() {
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());

  return (
    <PageContent>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-fg-default">数据列表</h2>
        <Button variant="primary" size="medium">
          导入数据
        </Button>
      </div>
      <DataTable
        data={mockDataFiles}
        columns={columns}
        rowKey="id"
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        striped
        density="default"
      />
    </PageContent>
  );
}
