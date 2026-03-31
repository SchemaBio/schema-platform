'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import type { GroupedMEI, HistoryTableFilterState, PaginatedResult } from '../types';
import { DEFAULT_HISTORY_FILTER_STATE } from '../types';
import { getGroupedMEIs, ACMG_CONFIG, MEI_TYPE_CONFIG } from '../mock-data';
import { ExpandableTable } from './ExpandableTable';

interface MEIHistoryTabProps {
  filterState?: HistoryTableFilterState;
  onFilterChange?: (state: HistoryTableFilterState) => void;
}

export function MEIHistoryTab({
  filterState: externalFilterState,
  onFilterChange
}: MEIHistoryTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<HistoryTableFilterState>(DEFAULT_HISTORY_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<GroupedMEI> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getGroupedMEIs(filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [filterState]);

  const columns = [
    {
      id: 'chromosome',
      header: '染色体',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedMEI) => row.chromosome,
    },
    {
      id: 'position',
      header: '位置',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedMEI) => row.position.toLocaleString(),
    },
    {
      id: 'gene',
      header: '基因',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedMEI) => row.gene,
    },
    {
      id: 'meiType',
      header: 'MEI类型',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedMEI) => {
        const config = MEI_TYPE_CONFIG[row.meiType];
        return <Tag variant={config.variant} className="justify-center">{config.label}</Tag>;
      },
    },
    {
      id: 'strand',
      header: '链',
      width: 50,
      align: 'center' as const,
      accessor: (row: GroupedMEI) => row.strand,
    },
    {
      id: 'length',
      header: '长度',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedMEI) => `${row.length}bp`,
    },
    {
      id: 'impact',
      header: '影响',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedMEI) => row.impact || '-',
    },
    {
      id: 'acmgClassification',
      header: 'ACMG分类',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedMEI) => {
        if (!row.acmgClassification) return '-';
        const config = ACMG_CONFIG[row.acmgClassification];
        return <Tag variant={config.variant} className="w-20 justify-center">{config.label}</Tag>;
      },
    },
    {
      id: 'detectionCount',
      header: '检出次数',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedMEI) => (
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
      accessor: (row: GroupedMEI) => row.firstDetectedAt,
    },
    {
      id: 'lastDetectedAt',
      header: '最后检出',
      width: 120,
      align: 'center' as const,
      accessor: (row: GroupedMEI) => row.lastDetectedAt,
    },
  ];

  return (
    <ExpandableTable
      data={result}
      loading={loading}
      filterState={filterState}
      onSearch={(query) => setFilterState({ ...filterState, searchQuery: query, page: 1 })}
      onPageChange={(page) => setFilterState({ ...filterState, page })}
      searchPlaceholder="搜索基因、染色体..."
      statsLabel="个MEI位点"
      columns={columns}
      getGroupId={(row) => row.groupId}
      getRecords={(row) => row.records}
      emptyMessage="暂无MEI历史检出位点数据"
    />
  );
}