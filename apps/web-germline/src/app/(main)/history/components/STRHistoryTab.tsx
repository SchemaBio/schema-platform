'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import type { GroupedSTR, HistoryTableFilterState, PaginatedResult } from '../types';
import { DEFAULT_HISTORY_FILTER_STATE } from '../types';
import { getGroupedSTRs, STR_STATUS_CONFIG } from '../mock-data';
import { ExpandableTable } from './ExpandableTable';

interface STRHistoryTabProps {
  filterState?: HistoryTableFilterState;
  onFilterChange?: (state: HistoryTableFilterState) => void;
}

export function STRHistoryTab({
  filterState: externalFilterState,
  onFilterChange
}: STRHistoryTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<HistoryTableFilterState>(DEFAULT_HISTORY_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<GroupedSTR> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getGroupedSTRs(filterState);
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
      accessor: (row: GroupedSTR) => row.gene,
    },
    {
      id: 'transcript',
      header: '转录本',
      width: 130,
      align: 'center' as const,
      accessor: (row: GroupedSTR) => row.transcript,
    },
    {
      id: 'locus',
      header: '位点',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedSTR) => row.locus,
    },
    {
      id: 'repeatUnit',
      header: '重复单元',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedSTR) => row.repeatUnit,
    },
    {
      id: 'repeatCount',
      header: '重复次数',
      width: 120,
      align: 'center' as const,
      accessor: (row: GroupedSTR) => {
        if (row.minRepeatCount === row.maxRepeatCount) {
          return row.minRepeatCount;
        }
        return `${row.minRepeatCount} - ${row.maxRepeatCount}`;
      },
    },
    {
      id: 'normalRange',
      header: '正常范围',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedSTR) => `${row.normalRangeMin}-${row.normalRangeMax}`,
    },
    {
      id: 'status',
      header: '状态',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedSTR) => {
        const config = STR_STATUS_CONFIG[row.status];
        return <Tag variant={config.variant} className="justify-center">{config.label}</Tag>;
      },
    },
    {
      id: 'detectionCount',
      header: '检出次数',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedSTR) => (
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
      accessor: (row: GroupedSTR) => row.firstDetectedAt,
    },
    {
      id: 'lastDetectedAt',
      header: '最后检出',
      width: 120,
      align: 'center' as const,
      accessor: (row: GroupedSTR) => row.lastDetectedAt,
    },
  ];

  return (
    <ExpandableTable
      data={result}
      loading={loading}
      filterState={filterState}
      onSearch={(query) => setFilterState({ ...filterState, searchQuery: query, page: 1 })}
      onPageChange={(page) => setFilterState({ ...filterState, page })}
      searchPlaceholder="搜索基因、位点..."
      statsLabel="个STR位点"
      columns={columns}
      getGroupId={(row) => row.groupId}
      getRecords={(row) => row.records}
      emptyMessage="暂无动态突变历史检出位点数据"
    />
  );
}