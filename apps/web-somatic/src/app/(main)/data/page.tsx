'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag, Tooltip } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Link2, Link2Off, RefreshCw } from 'lucide-react';
import * as React from 'react';

interface DataMatching {
  id: string;
  sampleId: string;
  patientName: string;
  sequencingId: string;
  runId: string;
  matchStatus: 'matched' | 'unmatched' | 'manual';
  dataSize: string;
  matchedAt?: string;
}

const mockMatchings: DataMatching[] = [
  {
    id: '1',
    sampleId: 'S2024120001',
    patientName: '张**',
    sequencingId: 'SEQ-001-A01',
    runId: 'RUN-2024120001',
    matchStatus: 'matched',
    dataSize: '12.5 GB',
    matchedAt: '2024-12-20 14:35',
  },
  {
    id: '2',
    sampleId: 'S2024120002',
    patientName: '李**',
    sequencingId: 'SEQ-001-A02',
    runId: 'RUN-2024120001',
    matchStatus: 'matched',
    dataSize: '11.8 GB',
    matchedAt: '2024-12-20 14:35',
  },
  {
    id: '3',
    sampleId: 'S2024120003',
    patientName: '王**',
    sequencingId: 'SEQ-001-A03',
    runId: 'RUN-2024120001',
    matchStatus: 'manual',
    dataSize: '13.2 GB',
    matchedAt: '2024-12-21 09:00',
  },
  {
    id: '4',
    sampleId: 'S2024120004',
    patientName: '赵**',
    sequencingId: '',
    runId: '',
    matchStatus: 'unmatched',
    dataSize: '-',
  },
  {
    id: '5',
    sampleId: 'S2024120005',
    patientName: '陈**',
    sequencingId: 'SEQ-002-B01',
    runId: 'RUN-2024120002',
    matchStatus: 'matched',
    dataSize: '12.1 GB',
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
    { id: 'sampleId', header: '样本编号', accessor: 'sampleId', width: 140 },
    { id: 'patientName', header: '患者', accessor: 'patientName', width: 80 },
    {
      id: 'sequencingId',
      header: '测序编号',
      accessor: (row) => row.sequencingId || <span className="text-fg-muted">-</span>,
      width: 140,
    },
    {
      id: 'runId',
      header: '测序批次',
      accessor: (row) => row.runId || <span className="text-fg-muted">-</span>,
      width: 150,
    },
    {
      id: 'matchStatus',
      header: '匹配状态',
      accessor: (row) => getStatusTag(row.matchStatus),
      width: 100,
    },
    { id: 'dataSize', header: '数据大小', accessor: 'dataSize', width: 100 },
    {
      id: 'matchedAt',
      header: '匹配时间',
      accessor: (row) => row.matchedAt || <span className="text-fg-muted">-</span>,
      width: 150,
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
            <Button variant="ghost" size="small" leftIcon={<Link2Off className="w-3 h-3" />}>
              解除匹配
            </Button>
          )}
        </div>
      ),
      width: 120,
    },
  ];

  const unmatchedCount = mockMatchings.filter((d) => d.matchStatus === 'unmatched').length;

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">数据匹配</h2>

      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
        <p className="text-sm text-fg-muted">
          系统会根据样本编号自动匹配 Sample Sheet 中的测序数据。如果自动匹配失败，可以手动进行匹配。
        </p>
      </div>

      {unmatchedCount > 0 && (
        <div className="p-3 bg-warning-subtle border border-warning-emphasis rounded-lg mb-4">
          <p className="text-sm text-warning-fg">
            有 {unmatchedCount} 个样本尚未匹配到测序数据
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              placeholder="搜索样本编号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
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
        <Tooltip content="仅对未匹配的数据重新进行自动匹配" placement="bottom" variant="nav">
          <Button 
            variant="secondary" 
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            重新匹配
          </Button>
        </Tooltip>
      </div>

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
