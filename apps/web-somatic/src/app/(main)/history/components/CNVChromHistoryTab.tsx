'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import type { GroupedCNVChrom, HistoryTableFilterState, PaginatedResult } from '../types';
import { DEFAULT_HISTORY_FILTER_STATE } from '../types';
import { getGroupedCNVChroms, CNV_TYPE_CONFIG } from '../mock-data';
import { ExpandableTable } from './ExpandableTable';

interface CNVChromHistoryTabProps {
  filterState?: HistoryTableFilterState;
  onFilterChange?: (state: HistoryTableFilterState) => void;
}

export function CNVChromHistoryTab({
  filterState: externalFilterState,
  onFilterChange
}: CNVChromHistoryTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<HistoryTableFilterState>(DEFAULT_HISTORY_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<GroupedCNVChrom> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getGroupedCNVChroms(filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [filterState]);

  const formatPosition = (pos: number) => {
    return `${(pos / 1000000).toFixed(1)}Mb`;
  };

  const columns = [
    {
      id: 'chromosome',
      header: '染色体',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedCNVChrom) => `chr${row.chromosome}`,
    },
    {
      id: 'startPosition',
      header: '起始位置',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedCNVChrom) => formatPosition(row.startPosition),
    },
    {
      id: 'endPosition',
      header: '终止位置',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedCNVChrom) => formatPosition(row.endPosition),
    },
    {
      id: 'length',
      header: '长度',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedCNVChrom) => formatPosition(row.length),
    },
    {
      id: 'type',
      header: '类型',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedCNVChrom) => {
        const config = CNV_TYPE_CONFIG[row.type];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
    },
    {
      id: 'genes',
      header: '涉及基因',
      width: 150,
      align: 'center' as const,
      accessor: (row: GroupedCNVChrom) => row.genes.slice(0, 3).join(', ') + (row.genes.length > 3 ? '...' : ''),
    },
    {
      id: 'confidence',
      header: '置信度',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedCNVChrom) => `${(row.confidence * 100).toFixed(0)}%`,
    },
    {
      id: 'detectionCount',
      header: '检出次数',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedCNVChrom) => row.detectionCount,
    },
    {
      id: 'firstDetectedAt',
      header: '首次检出',
      width: 120,
      align: 'center' as const,
      accessor: (row: GroupedCNVChrom) => row.firstDetectedAt,
    },
    {
      id: 'lastDetectedAt',
      header: '最后检出',
      width: 120,
      align: 'center' as const,
      accessor: (row: GroupedCNVChrom) => row.lastDetectedAt,
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
      statsLabel="个CNV片段"
      columns={columns}
      getGroupId={(row) => row.groupId}
      getRecords={(row) => row.records}
      emptyMessage="暂无CNV(Chrom)历史检出数据"
    />
  );
}