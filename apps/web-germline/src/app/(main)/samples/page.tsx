'use client';

import * as React from 'react';
import { PageContent } from '@/components/layout';
import { Button, DataTable, Tag, Avatar, type Column } from '@schema/ui-kit';

interface Sample {
  id: string;
  name: string;
  sampleType: string;
  pedigree: string;
  dataCount: number;
  status: 'pending' | 'matched' | 'analyzing' | 'completed';
  createdAt: string;
}

// Mock data
const mockSamples: Sample[] = [
  { id: 'S001', name: '张三', sampleType: '全血', pedigree: 'FAM001', dataCount: 2, status: 'completed', createdAt: '2024-12-20' },
  { id: 'S002', name: '李四', sampleType: '唾液', pedigree: 'FAM001', dataCount: 1, status: 'analyzing', createdAt: '2024-12-21' },
  { id: 'S003', name: '王五', sampleType: '全血', pedigree: 'FAM002', dataCount: 0, status: 'pending', createdAt: '2024-12-22' },
  { id: 'S004', name: '赵六', sampleType: 'DNA', pedigree: '-', dataCount: 3, status: 'matched', createdAt: '2024-12-23' },
];

const statusConfig: Record<Sample['status'], { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  pending: { label: '待匹配', variant: 'default' },
  matched: { label: '已匹配', variant: 'warning' },
  analyzing: { label: '分析中', variant: 'warning' },
  completed: { label: '已完成', variant: 'success' },
};

const columns: Column<Sample>[] = [
  { id: 'id', header: '样本编号', accessor: 'id', width: 100 },
  { 
    id: 'name', 
    header: '姓名', 
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <Avatar name={row.name} size="small" />
        <span>{row.name}</span>
      </div>
    ),
    width: 150 
  },
  { id: 'sampleType', header: '样本类型', accessor: 'sampleType', width: 100 },
  { id: 'pedigree', header: '家系', accessor: 'pedigree', width: 100 },
  { id: 'dataCount', header: '关联数据', accessor: (row) => `${row.dataCount} 个`, width: 100 },
  { 
    id: 'status', 
    header: '状态', 
    accessor: (row) => {
      const config = statusConfig[row.status];
      return <Tag variant={config.variant}>{config.label}</Tag>;
    },
    width: 100 
  },
  { id: 'createdAt', header: '创建时间', accessor: 'createdAt', width: 120 },
];

export default function SamplesPage() {
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());

  return (
    <PageContent>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-fg-default">样本列表</h2>
        <Button variant="primary" size="medium">
          新建样本
        </Button>
      </div>
      <DataTable
        data={mockSamples}
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
