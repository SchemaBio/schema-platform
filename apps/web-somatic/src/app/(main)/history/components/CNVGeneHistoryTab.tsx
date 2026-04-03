'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import type { GroupedCNVGene, HistoryTableFilterState, PaginatedResult } from '../types';
import { DEFAULT_HISTORY_FILTER_STATE } from '../types';
import { getGroupedCNVGenes, CNV_TYPE_CONFIG } from '../mock-data';
import { ExpandableTable } from './ExpandableTable';

interface CNVGeneHistoryTabProps {
  filterState?: HistoryTableFilterState;
  onFilterChange?: (state: HistoryTableFilterState) => void;
}

export function CNVGeneHistoryTab({
  filterState: externalFilterState,
  onFilterChange
}: CNVGeneHistoryTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<HistoryTableFilterState>(DEFAULT_HISTORY_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<GroupedCNVGene> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getGroupedCNVGenes(filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [filterState]);

  const columns = [
    {
      id: 'gene',
      header: '基因',
      width: 120,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedCNVGene) => row.gene,
    },
    {
      id: 'type',
      header: '类型',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedCNVGene) => {
        const config = CNV_TYPE_CONFIG[row.type];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
    },
    {
      id: 'copyNumber',
      header: '拷贝数',
      width: 100,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedCNVGene) => row.copyNumber.toFixed(1),
    },
    {
      id: 'confidence',
      header: '置信度',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedCNVGene) => `${(row.confidence * 100).toFixed(0)}%`,
    },
    {
      id: 'detectionCount',
      header: '检出次数',
      width: 80,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedCNVGene) => (
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
      sortable: true,
      accessor: (row: GroupedCNVGene) => row.firstDetectedAt,
    },
    {
      id: 'lastDetectedAt',
      header: '最后检出',
      width: 120,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedCNVGene) => row.lastDetectedAt,
    },
  ];

  return (
    <ExpandableTable
      data={result}
      loading={loading}
      filterState={filterState}
      onSearch={(query) => setFilterState({ ...filterState, searchQuery: query, page: 1 })}
      onPageChange={(page) => setFilterState({ ...filterState, page })}
      searchPlaceholder="搜索基因..."
      statsLabel="个CNV位点"
      columns={columns}
      getGroupId={(row) => row.groupId}
      getRecords={(row) => row.records}
      emptyMessage="暂无CNV(Gene)历史检出数据"
    />
  );
}