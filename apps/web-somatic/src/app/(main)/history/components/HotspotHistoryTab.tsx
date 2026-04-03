'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import type { GroupedHotspot, HistoryTableFilterState, PaginatedResult } from '../types';
import { DEFAULT_HISTORY_FILTER_STATE } from '../types';
import { getGroupedHotspots, TIER_CONFIG } from '../mock-data';
import { ExpandableTable } from './ExpandableTable';

interface HotspotHistoryTabProps {
  filterState?: HistoryTableFilterState;
  onFilterChange?: (state: HistoryTableFilterState) => void;
}

export function HotspotHistoryTab({
  filterState: externalFilterState,
  onFilterChange
}: HotspotHistoryTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<HistoryTableFilterState>(DEFAULT_HISTORY_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<GroupedHotspot> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getGroupedHotspots(filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [filterState]);

  const columns = [
    {
      id: 'gene',
      header: '基因',
      width: 100,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedHotspot) => row.gene,
    },
    {
      id: 'mutation',
      header: '突变',
      width: 120,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedHotspot) => row.mutation,
    },
    {
      id: 'transcript',
      header: '转录本',
      width: 130,
      align: 'center' as const,
      accessor: (row: GroupedHotspot) => row.transcript,
    },
    {
      id: 'clinicalSignificance',
      header: '临床意义',
      width: 100,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedHotspot) => {
        const config = TIER_CONFIG[row.clinicalSignificance];
        return <Tag variant={config.variant} className="w-16 justify-center">{config.label}</Tag>;
      },
    },
    {
      id: 'alleleFrequency',
      header: 'VAF',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedHotspot) => `${(row.alleleFrequency * 100).toFixed(1)}%`,
    },
    {
      id: 'detectionCount',
      header: '检出次数',
      width: 80,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedHotspot) => (
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
      accessor: (row: GroupedHotspot) => row.firstDetectedAt,
    },
    {
      id: 'lastDetectedAt',
      header: '最后检出',
      width: 120,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedHotspot) => row.lastDetectedAt,
    },
  ];

  return (
    <ExpandableTable
      data={result}
      loading={loading}
      filterState={filterState}
      onSearch={(query) => setFilterState({ ...filterState, searchQuery: query, page: 1 })}
      onPageChange={(page) => setFilterState({ ...filterState, page })}
      searchPlaceholder="搜索基因、突变..."
      statsLabel="个热点位点"
      columns={columns}
      getGroupId={(row) => row.groupId}
      getRecords={(row) => row.records}
      emptyMessage="暂无Hotspot历史检出位点数据"
    />
  );
}