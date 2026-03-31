'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import type { GroupedCNVSegment, HistoryTableFilterState, PaginatedResult } from '../types';
import { DEFAULT_HISTORY_FILTER_STATE } from '../types';
import { getGroupedCNVSegments } from '../mock-data';
import { ExpandableTable } from './ExpandableTable';

interface CNVSegmentHistoryTabProps {
  filterState?: HistoryTableFilterState;
  onFilterChange?: (state: HistoryTableFilterState) => void;
}

export function CNVSegmentHistoryTab({
  filterState: externalFilterState,
  onFilterChange
}: CNVSegmentHistoryTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<HistoryTableFilterState>(DEFAULT_HISTORY_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<GroupedCNVSegment> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getGroupedCNVSegments(filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [filterState]);

  const formatPosition = (pos: number) => {
    if (pos >= 1000000) return `${(pos / 1000000).toFixed(2)}Mb`;
    if (pos >= 1000) return `${(pos / 1000).toFixed(1)}kb`;
    return `${pos}bp`;
  };

  const columns = [
    {
      id: 'chromosome',
      header: '染色体',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedCNVSegment) => row.chromosome,
    },
    {
      id: 'region',
      header: '区域',
      width: 180,
      align: 'center' as const,
      accessor: (row: GroupedCNVSegment) => `${formatPosition(row.startPosition)} - ${formatPosition(row.endPosition)}`,
    },
    {
      id: 'length',
      header: '长度',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedCNVSegment) => formatPosition(row.length),
    },
    {
      id: 'type',
      header: '类型',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedCNVSegment) => (
        <Tag variant={row.type === 'Deletion' ? 'warning' : 'info'} className="justify-center">
          {row.type === 'Deletion' ? '缺失' : '扩增'}
        </Tag>
      ),
    },
    {
      id: 'copyNumber',
      header: '拷贝数',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedCNVSegment) => row.copyNumber,
    },
    {
      id: 'genes',
      header: '涉及基因',
      width: 200,
      align: 'center' as const,
      accessor: (row: GroupedCNVSegment) => row.genes.join(', '),
    },
    {
      id: 'confidence',
      header: '置信度',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedCNVSegment) => `${(row.confidence * 100).toFixed(0)}%`,
    },
    {
      id: 'detectionCount',
      header: '检出次数',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedCNVSegment) => (
        <span className={row.detectionCount > 1 ? 'font-medium text-accent-fg' : ''}>
          {row.detectionCount}
        </span>
      ),
    },
    {
      id: 'firstDetectedAt',
      header: '首次检出',
      width: 120,
      align: 'center' as const,
      accessor: (row: GroupedCNVSegment) => row.firstDetectedAt,
    },
    {
      id: 'lastDetectedAt',
      header: '最后检出',
      width: 120,
      align: 'center' as const,
      accessor: (row: GroupedCNVSegment) => row.lastDetectedAt,
    },
  ];

  return (
    <ExpandableTable
      data={result}
      loading={loading}
      filterState={filterState}
      onSearch={(query) => setFilterState({ ...filterState, searchQuery: query, page: 1 })}
      onPageChange={(page) => setFilterState({ ...filterState, page })}
      searchPlaceholder="搜索染色体、基因..."
      statsLabel="个CNV区域"
      columns={columns}
      getGroupId={(row) => row.groupId}
      getRecords={(row) => row.records}
      emptyMessage="暂无CNV(Region)历史检出位点数据"
    />
  );
}