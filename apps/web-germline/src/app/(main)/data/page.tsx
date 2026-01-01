'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag, Tooltip } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Link2, Link2Off, RefreshCw, Upload } from 'lucide-react';
import * as React from 'react';

interface DataMatching {
  id: string;
  sampleId: string;
  patientName: string;
  sequencingId: string;
  runId: string;
  matchStatus: 'matched' | 'unmatched' | 'manual';
  dataSize: string;
  fileCount: number;
  matchedAt?: string;
}

const mockMatchings: DataMatching[] = [
  {
    id: '1',
    sampleId: 'S2024120001',
    patientName: '张三',
    sequencingId: 'SEQ-001-A01',
    runId: 'RUN-2024120001',
    matchStatus: 'matched',
    dataSize: '15.2 GB',
    fileCount: 4,
    matchedAt: '2024-12-20 14:35',
  },
  {
    id: '2',
    sampleId: 'S2024120002',
    patientName: '李四',
    sequencingId: 'SEQ-001-A02',
    runId: 'RUN-2024120001',
    matchStatus: 'matched',
    dataSize: '14.8 GB',
    fileCount: 4,
    matchedAt: '2024-12-20 14:35',
  },
  {
    id: '3',
    sampleId: 'S2024120003',
    patientName: '王五',
    sequencingId: 'SEQ-001-A03',
    runId: 'RUN-2024120001',
    matchStatus: 'manual',
    dataSize: '16.1 GB',
    fileCount: 4,
    matchedAt: '2024-12-21 09:00',
  },
  {
    id: '4',
    sampleId: 'S2024120004',
    patientName: '赵六',
    sequencingId: '',
    runId: '',
    matchStatus: 'unmatched',
    dataSize: '-',
    fileCount: 0,
  },
  {
    id: '5',
    sampleId: 'S2024120005',
    patientName: '孙七',
    sequencingId: 'SEQ-002-B01',
    runId: 'RUN-2024120002',
    matchStatus: 'matched',
    dataSize: '13.9 GB',
    fileCount: 4,
    matchedAt: '2024-12-25 09:20',
  },
];

export default function DataMatchingPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'matched' | 'unmatched'>('all');

  const filteredData = React.useMemo(() => {
    let data = mockMatchings;

    if (filterStatus !== 'all') {
      data = data.filter((d) =>
        filterStatus === 'matched'
          ? d.matchStatus === 'matched' || d.matchStatus === 'manual'
          : d.matchStatus === 'unmatched'
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(
        (d) =>
          d.sampleId.toLowerCase().includes(query) ||
          d.patientName.includes(query) ||
          d.sequencingId.toLowerCase().includes(query)
      );
    }

    return data;
  }, [searchQuery, filterStatus]);

  const getStatusTag = (status: DataMatching['matchStatus']) => {
    switch (status) {
      case 'matched':
        return <Tag variant="success">自动匹配</Tag>;
      case 'manual':
        return <Tag variant="info">手动匹配</Tag>;
      case 'unmatched':
        return <Tag variant="danger">未匹配</Tag>;
    }
  };

  const columns: Column<DataMatching>[] = [
    { id: 'sampleId', header: '样本编号', accessor: 'sampleId', width: 130 },
    { id: 'patientName', header: '患者', accessor: 'patientName', width: 80 },
    {
      id: 'sequencingId',
      header: '测序编号',
      accessor: (row) => row.sequencingId || <span className="text-fg-muted">-</span>,
      width: 130,
    },
    {
      id: 'runId',
      header: '测序批次',
      accessor: (row) => row.runId || <span className="text-fg-muted">-</span>,
      width: 140,
    },
    {
      id: 'matchStatus',
      header: '匹配状态',
      accessor: (row) => getStatusTag(row.matchStatus),
      width: 100,
    },
    {
      id: 'fileCount',
      header: '文件数',
      accessor: (row) => row.fileCount > 0 ? `${row.fileCount} 个` : '-',
      width: 80,
    },
    { id: 'dataSize', header: '数据大小', accessor: 'dataSize', width: 100 },
    {
      id: 'matchedAt',
      header: '匹配时间',
      accessor: (row) => row.matchedAt || <span className="text-fg-muted">-</span>,
      width: 140,
    },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          {row.matchStatus === 'unmatched' ? (
            <Button variant="primary" size="small" leftIcon={<Link2 className="w-3 h-3" />}>
              手动匹配
            </Button>
          ) : (
            <button
              className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="解除匹配"
            >
              <Link2Off className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
      width: 100,
    },
  ];

  const unmatchedCount = mockMatchings.filter((d) => d.matchStatus === 'unmatched').length;
  const matchedCount = mockMatchings.filter((d) => d.matchStatus !== 'unmatched').length;

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">数据匹配</h2>

      {/* 说明卡片 */}
      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
        <p className="text-sm text-fg-muted">
          系统会根据样本编号自动匹配测序数据。如果自动匹配失败，可以手动进行匹配。
          遗传病分析通常需要 FASTQ 或 uBAM 格式的测序数据。
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <div className="text-2xl font-semibold text-fg-default">{mockMatchings.length}</div>
          <div className="text-sm text-fg-muted">总样本数</div>
        </div>
        <div className="p-4 bg-success-subtle rounded-lg border border-success-emphasis">
          <div className="text-2xl font-semibold text-success-fg">{matchedCount}</div>
          <div className="text-sm text-success-fg">已匹配</div>
        </div>
        <div className="p-4 bg-danger-subtle rounded-lg border border-danger-emphasis">
          <div className="text-2xl font-semibold text-danger-fg">{unmatchedCount}</div>
          <div className="text-sm text-danger-fg">未匹配</div>
        </div>
      </div>

      {/* 警告提示 */}
      {unmatchedCount > 0 && (
        <div className="p-3 bg-warning-subtle border border-warning-emphasis rounded-lg mb-4">
          <p className="text-sm text-warning-fg">
            有 {unmatchedCount} 个样本尚未匹配到测序数据，请手动匹配或上传数据
          </p>
        </div>
      )}

      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              placeholder="搜索样本编号、患者..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filterStatus === 'all'
                  ? 'bg-accent-subtle text-accent-fg'
                  : 'text-fg-muted hover:bg-canvas-subtle'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterStatus('matched')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filterStatus === 'matched'
                  ? 'bg-accent-subtle text-accent-fg'
                  : 'text-fg-muted hover:bg-canvas-subtle'
              }`}
            >
              已匹配
            </button>
            <button
              onClick={() => setFilterStatus('unmatched')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filterStatus === 'unmatched'
                  ? 'bg-accent-subtle text-accent-fg'
                  : 'text-fg-muted hover:bg-canvas-subtle'
              }`}
            >
              未匹配
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" leftIcon={<Upload className="w-4 h-4" />}>
            上传数据
          </Button>
          <Tooltip content="对未匹配的样本重新进行自动匹配" placement="bottom" variant="nav">
            <Button variant="secondary" leftIcon={<RefreshCw className="w-4 h-4" />}>
              重新匹配
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* 数据表格 */}
      <DataTable
        data={filteredData}
        columns={columns}
        rowKey="id"
        density="default"
        striped
      />
    </PageContent>
  );
}
