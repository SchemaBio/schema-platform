'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import type { GroupedMTVariant, HistoryTableFilterState, PaginatedResult } from '../types';
import { DEFAULT_HISTORY_FILTER_STATE } from '../types';
import { getGroupedMTVariants, ACMG_CONFIG } from '../mock-data';
import { ExpandableTable } from './ExpandableTable';

interface MTHistoryTabProps {
  filterState?: HistoryTableFilterState;
  onFilterChange?: (state: HistoryTableFilterState) => void;
}

const MT_PATHOGENICITY_CONFIG: Record<string, { label: string; variant: 'danger' | 'warning' | 'neutral' | 'info' | 'success' }> = {
  Pathogenic: { label: '致病', variant: 'danger' },
  Likely_Pathogenic: { label: '可能致病', variant: 'warning' },
  VUS: { label: '意义未明', variant: 'neutral' },
  Likely_Benign: { label: '可能良性', variant: 'info' },
  Benign: { label: '良性', variant: 'success' },
};

export function MTHistoryTab({
  filterState: externalFilterState,
  onFilterChange
}: MTHistoryTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<HistoryTableFilterState>(DEFAULT_HISTORY_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<GroupedMTVariant> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getGroupedMTVariants(filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [filterState]);

  const columns = [
    {
      id: 'position',
      header: '位置',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedMTVariant) => row.position,
    },
    {
      id: 'change',
      header: '变异',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedMTVariant) => `${row.ref}>${row.alt}`,
    },
    {
      id: 'gene',
      header: '基因',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedMTVariant) => row.gene,
    },
    {
      id: 'heteroplasmy',
      header: '异质性',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedMTVariant) => {
        if (row.minHeteroplasmy === row.maxHeteroplasmy) {
          return `${(row.minHeteroplasmy * 100).toFixed(1)}%`;
        }
        return `${(row.minHeteroplasmy * 100).toFixed(1)}% - ${(row.maxHeteroplasmy * 100).toFixed(1)}%`;
      },
    },
    {
      id: 'pathogenicity',
      header: '致病性',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedMTVariant) => {
        const config = MT_PATHOGENICITY_CONFIG[row.pathogenicity];
        return <Tag variant={config.variant} className="w-20 justify-center">{config.label}</Tag>;
      },
    },
    {
      id: 'associatedDisease',
      header: '关联疾病',
      width: 180,
      align: 'center' as const,
      accessor: (row: GroupedMTVariant) => row.associatedDisease,
    },
    {
      id: 'haplogroup',
      header: '单倍群',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedMTVariant) => row.haplogroup || '-',
    },
    {
      id: 'detectionCount',
      header: '检出次数',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedMTVariant) => (
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
      accessor: (row: GroupedMTVariant) => row.firstDetectedAt,
    },
    {
      id: 'lastDetectedAt',
      header: '最后检出',
      width: 120,
      align: 'center' as const,
      accessor: (row: GroupedMTVariant) => row.lastDetectedAt,
    },
  ];

  return (
    <ExpandableTable
      data={result}
      loading={loading}
      filterState={filterState}
      onSearch={(query) => setFilterState({ ...filterState, searchQuery: query, page: 1 })}
      onPageChange={(page) => setFilterState({ ...filterState, page })}
      searchPlaceholder="搜索基因、疾病..."
      statsLabel="个线粒体变异"
      columns={columns}
      getGroupId={(row) => row.groupId}
      getRecords={(row) => row.records}
      emptyMessage="暂无线粒体变异历史检出位点数据"
    />
  );
}