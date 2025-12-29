'use client';

import * as React from 'react';
import { Button, DataTable, Tag, Input, type Column } from '@schema/ui-kit';
import { Search, Plus, FileText, Database } from 'lucide-react';
import { ImportDataModal, DataDetailPanel } from './components';
import { mockDataFiles, formatFileSize, formatReadCount } from './mock-data';
import type { DataFile, ImportFormData } from './types';

const statusConfig: Record<DataFile['status'], { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  pending: { label: '待验证', variant: 'warning' },
  validated: { label: '已验证', variant: 'neutral' },
  matched: { label: '已关联', variant: 'success' },
  error: { label: '错误', variant: 'danger' },
};

const formatConfig: Record<DataFile['format'], { label: string; variant: 'info' | 'neutral' }> = {
  fastq: { label: 'FASTQ', variant: 'info' },
  ubam: { label: 'uBAM', variant: 'neutral' },
};

export default function DataPage() {
  const [dataFiles, setDataFiles] = React.useState<DataFile[]>(mockDataFiles);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [selectedData, setSelectedData] = React.useState<DataFile | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  // 筛选数据
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return dataFiles;
    const query = searchQuery.toLowerCase();
    return dataFiles.filter(
      (d) =>
        d.id.toLowerCase().includes(query) ||
        d.name.toLowerCase().includes(query) ||
        d.sampleId?.toLowerCase().includes(query) ||
        d.sampleName?.toLowerCase().includes(query)
    );
  }, [dataFiles, searchQuery]);

  // 导入数据
  const handleImport = (formData: ImportFormData) => {
    const newData: DataFile = {
      id: `DATA${String(dataFiles.length + 1).padStart(3, '0')}`,
      name: formData.name,
      format: formData.format,
      pairedEnd: formData.pairedEnd,
      r1Path: formData.r1Path,
      r2Path: formData.r2Path,
      size: 0,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setDataFiles((prev) => [newData, ...prev]);
  };

  // 删除数据
  const handleDelete = (dataId: string) => {
    setDataFiles((prev) => prev.filter((d) => d.id !== dataId));
    setSelectedData(null);
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(dataId);
      return next;
    });
  };

  // 重新验证
  const handleRevalidate = (dataId: string) => {
    setDataFiles((prev) =>
      prev.map((d) =>
        d.id === dataId
          ? { ...d, status: 'pending' as const, errorMessage: undefined }
          : d
      )
    );
  };

  // 关联样本
  const handleLinkSample = (dataId: string) => {
    // TODO: 打开样本选择弹窗
    console.log('Link sample to', dataId);
  };

  // 表格列定义
  const columns: Column<DataFile>[] = [
    {
      id: 'name',
      header: '名称',
      accessor: (row) => (
        <div
          className="flex items-center gap-2 cursor-pointer hover:text-accent-fg"
          onClick={() => setSelectedData(row)}
        >
          <FileText className="w-4 h-4 text-fg-muted flex-shrink-0" />
          <span className="truncate">{row.name}</span>
        </div>
      ),
      width: 200,
    },
    {
      id: 'format',
      header: '格式',
      accessor: (row) => {
        const config = formatConfig[row.format];
        return (
          <div className="flex items-center gap-1">
            <Tag variant={config.variant}>{config.label}</Tag>
            <span className="text-xs text-fg-muted">
              {row.pairedEnd === 'paired' ? 'PE' : 'SE'}
            </span>
          </div>
        );
      },
      width: 100,
    },
    {
      id: 'size',
      header: '大小',
      accessor: (row) => formatFileSize(row.size),
      width: 80,
    },
    {
      id: 'readCount',
      header: 'Reads',
      accessor: (row) => formatReadCount(row.readCount),
      width: 80,
    },
    {
      id: 'sample',
      header: '关联样本',
      accessor: (row) =>
        row.sampleId ? (
          <div>
            <div className="text-sm text-fg-default">{row.sampleName}</div>
            <div className="text-xs text-fg-muted">{row.sampleId}</div>
          </div>
        ) : (
          <span className="text-fg-muted">-</span>
        ),
      width: 120,
    },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => {
        const config = statusConfig[row.status];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 80,
    },
    {
      id: 'updatedAt',
      header: '更新时间',
      accessor: (row) => row.updatedAt.slice(0, 10),
      width: 100,
    },
  ];

  return (
    <div className="flex h-full">
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-border-default">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-fg-muted" />
              <h2 className="text-lg font-medium text-fg-default">数据管理</h2>
            </div>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsImportModalOpen(true)}
            >
              导入数据
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-72">
              <Input
                placeholder="搜索名称、ID、样本..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftElement={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-fg-muted">
              <span>共 {filteredData.length} 条数据</span>
              {selectedRows.size > 0 && (
                <span className="text-accent-fg">· 已选 {selectedRows.size} 条</span>
              )}
            </div>
          </div>
        </div>

        {/* 表格 */}
        <div className="flex-1 overflow-auto p-6">
          <DataTable
            data={filteredData}
            columns={columns}
            rowKey="id"
            selectable
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            onRowClick={(row) => setSelectedData(row)}
            striped
            density="default"
          />
        </div>
      </div>

      {/* 右侧详情面板 */}
      {selectedData && (
        <DataDetailPanel
          data={selectedData}
          onClose={() => setSelectedData(null)}
          onLinkSample={handleLinkSample}
          onDelete={handleDelete}
          onRevalidate={handleRevalidate}
        />
      )}

      {/* 导入弹窗 */}
      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={handleImport}
      />
    </div>
  );
}
