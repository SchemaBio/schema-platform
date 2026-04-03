'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import type { GroupedFusion, HistoryTableFilterState, PaginatedResult } from '../types';
import { DEFAULT_HISTORY_FILTER_STATE } from '../types';
import { getGroupedFusions, TIER_CONFIG } from '../mock-data';
import { ExpandableTable } from './ExpandableTable';

interface FusionHistoryTabProps {
  filterState?: HistoryTableFilterState;
  onFilterChange?: (state: HistoryTableFilterState) => void;
}

export function FusionHistoryTab({
  filterState: externalFilterState,
  onFilterChange
}: FusionHistoryTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<HistoryTableFilterState>(DEFAULT_HISTORY_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<GroupedFusion> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getGroupedFusions(filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [filterState]);

  const columns = [
    {
      id: 'geneA',
      header: '5\'基因',
      width: 100,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedFusion) => row.geneA,
    },
    {
      id: 'geneB',
      header: '3\'基因',
      width: 100,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedFusion) => row.geneB,
    },
    {
      id: 'fusionTranscript',
      header: '融合转录本',
      width: 180,
      align: 'left' as const,
      accessor: (row: GroupedFusion) => row.fusionTranscript,
    },
    {
      id: 'clinicalSignificance',
      header: '临床意义',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedFusion) => {
        const config = TIER_CONFIG[row.clinicalSignificance];
        return <Tag variant={config.variant} className="w-16 justify-center">{config.label}</Tag>;
      },
    },
    {
      id: 'supportingReads',
      header: '支持Reads',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedFusion) => row.supportingReads,
    },
    {
      id: 'detectionCount',
      header: '检出次数',
      width: 80,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedFusion) => (
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
      accessor: (row: GroupedFusion) => row.firstDetectedAt,
    },
    {
      id: 'lastDetectedAt',
      header: '最后检出',
      width: 120,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedFusion) => row.lastDetectedAt,
    },
  ];

  return (
    <ExpandableTable
      data={result}
      loading={loading}
      filterState={filterState}
      onSearch={(query) => setFilterState({ ...filterState, searchQuery: query, page: 1 })}
      onPageChange={(page) => setFilterState({ ...filterState, page })}
      searchPlaceholder="搜索融合基因..."
      statsLabel="个融合位点"
      columns={columns}
      getGroupId={(row) => row.groupId}
      getRecords={(row) => row.records}
      emptyMessage="暂无Fusion历史检出数据"
    />
  );
}