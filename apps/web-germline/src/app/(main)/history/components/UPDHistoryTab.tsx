'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import type { GroupedUPDRegion, HistoryTableFilterState, PaginatedResult } from '../types';
import { DEFAULT_HISTORY_FILTER_STATE } from '../types';
import { getGroupedUPDRegions, UPD_TYPE_CONFIG } from '../mock-data';
import { ExpandableTable } from './ExpandableTable';

interface UPDHistoryTabProps {
  filterState?: HistoryTableFilterState;
  onFilterChange?: (state: HistoryTableFilterState) => void;
}

const PARENT_CONFIG: Record<string, string> = {
  Maternal: '母源',
  Paternal: '父源',
  Unknown: '未知',
};

export function UPDHistoryTab({
  filterState: externalFilterState,
  onFilterChange
}: UPDHistoryTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<HistoryTableFilterState>(DEFAULT_HISTORY_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<GroupedUPDRegion> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getGroupedUPDRegions(filterState);
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
      accessor: (row: GroupedUPDRegion) => row.chromosome,
    },
    {
      id: 'region',
      header: '区域',
      width: 180,
      align: 'center' as const,
      accessor: (row: GroupedUPDRegion) => `${formatPosition(row.startPosition)} - ${formatPosition(row.endPosition)}`,
    },
    {
      id: 'length',
      header: '长度',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedUPDRegion) => formatPosition(row.length),
    },
    {
      id: 'type',
      header: '类型',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedUPDRegion) => {
        const config = UPD_TYPE_CONFIG[row.type];
        return <Tag variant={config.variant} className="justify-center">{config.label}</Tag>;
      },
    },
    {
      id: 'parentOfOrigin',
      header: '来源亲本',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedUPDRegion) => row.parentOfOrigin ? PARENT_CONFIG[row.parentOfOrigin] : '-',
    },
    {
      id: 'genes',
      header: '涉及基因',
      width: 200,
      align: 'center' as const,
      accessor: (row: GroupedUPDRegion) => row.genes.join(', '),
    },
    {
      id: 'detectionCount',
      header: '检出次数',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedUPDRegion) => (
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
      accessor: (row: GroupedUPDRegion) => row.firstDetectedAt,
    },
    {
      id: 'lastDetectedAt',
      header: '最后检出',
      width: 120,
      align: 'center' as const,
      accessor: (row: GroupedUPDRegion) => row.lastDetectedAt,
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
      statsLabel="个UPD区域"
      columns={columns}
      getGroupId={(row) => row.groupId}
      getRecords={(row) => row.records}
      emptyMessage="暂无UPD历史检出位点数据"
    />
  );
}