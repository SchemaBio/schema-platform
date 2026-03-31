'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import type { GroupedSNVIndel, HistoryTableFilterState, PaginatedResult } from '../types';
import { DEFAULT_HISTORY_FILTER_STATE } from '../types';
import { getGroupedSNVIndels, ACMG_CONFIG } from '../mock-data';
import { ExpandableTable } from './ExpandableTable';

interface SNVIndelHistoryTabProps {
  filterState?: HistoryTableFilterState;
  onFilterChange?: (state: HistoryTableFilterState) => void;
}

// 变异后果中文映射
const CONSEQUENCE_LABELS: Record<string, string> = {
  'frameshift_variant': '移码变异',
  'missense_variant': '错义变异',
  'inframe_deletion': '框内缺失',
  'inframe_insertion': '框内插入',
  'stop_gained': '获得终止密码子',
  'splice_acceptor_variant': '剪接受体变异',
  'splice_donor_variant': '剪接供体变异',
  'synonymous_variant': '同义变异',
};

export function SNVIndelHistoryTab({
  filterState: externalFilterState,
  onFilterChange
}: SNVIndelHistoryTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<HistoryTableFilterState>(DEFAULT_HISTORY_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<GroupedSNVIndel> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getGroupedSNVIndels(filterState);
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
      accessor: (row: GroupedSNVIndel) => row.gene,
    },
    {
      id: 'hgvsc',
      header: 'HGVSc',
      width: 180,
      align: 'left' as const,
      sortable: true,
      accessor: (row: GroupedSNVIndel) => row.hgvsc,
    },
    {
      id: 'hgvsp',
      header: 'HGVSp',
      width: 180,
      align: 'left' as const,
      sortable: true,
      accessor: (row: GroupedSNVIndel) => row.hgvsp,
    },
    {
      id: 'transcript',
      header: '转录本',
      width: 130,
      align: 'center' as const,
      accessor: (row: GroupedSNVIndel) => row.transcript,
    },
    {
      id: 'acmgClassification',
      header: 'ACMG分类',
      width: 100,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedSNVIndel) => {
        const config = ACMG_CONFIG[row.acmgClassification];
        return <Tag variant={config.variant} className="w-20 justify-center">{config.label}</Tag>;
      },
    },
    {
      id: 'consequence',
      header: '变异后果',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedSNVIndel) => CONSEQUENCE_LABELS[row.consequence] || row.consequence,
    },
    {
      id: 'gnomadAF',
      header: 'gnomAD频率',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedSNVIndel) => row.gnomadAF !== undefined ? `${(row.gnomadAF * 100).toFixed(4)}%` : '-',
    },
    {
      id: 'clinvarId',
      header: 'ClinVar',
      width: 120,
      align: 'center' as const,
      accessor: (row: GroupedSNVIndel) => row.clinvarId || '-',
    },
    {
      id: 'detectionCount',
      header: '检出次数',
      width: 80,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedSNVIndel) => (
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
      accessor: (row: GroupedSNVIndel) => row.firstDetectedAt,
    },
    {
      id: 'lastDetectedAt',
      header: '最后检出',
      width: 120,
      align: 'center' as const,
      sortable: true,
      accessor: (row: GroupedSNVIndel) => row.lastDetectedAt,
    },
  ];

  return (
    <ExpandableTable
      data={result}
      loading={loading}
      filterState={filterState}
      onSearch={(query) => setFilterState({ ...filterState, searchQuery: query, page: 1 })}
      onPageChange={(page) => setFilterState({ ...filterState, page })}
      searchPlaceholder="搜索基因、HGVSc、样本..."
      statsLabel="个独特位点"
      columns={columns}
      getGroupId={(row) => row.groupId}
      getRecords={(row) => row.records}
      emptyMessage="暂无SNP/InDel历史检出位点数据"
    />
  );
}