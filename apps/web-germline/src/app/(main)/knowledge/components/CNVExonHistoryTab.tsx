'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import type { GroupedCNVExon, KnowledgeTableFilterState, PaginatedResult } from '../types';
import { DEFAULT_KNOWLEDGE_FILTER_STATE } from '../types';
import { getGroupedCNVExons } from '../mock-data';
import { ExpandableTable } from './ExpandableTable';

interface CNVExonHistoryTabProps {
  filterState?: KnowledgeTableFilterState;
  onFilterChange?: (state: KnowledgeTableFilterState) => void;
}

export function CNVExonHistoryTab({
  filterState: externalFilterState,
  onFilterChange
}: CNVExonHistoryTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<KnowledgeTableFilterState>(DEFAULT_KNOWLEDGE_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<GroupedCNVExon> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getGroupedCNVExons(filterState);
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
      accessor: (row: GroupedCNVExon) => row.gene,
    },
    {
      id: 'transcript',
      header: '转录本',
      width: 130,
      align: 'center' as const,
      accessor: (row: GroupedCNVExon) => row.transcript,
    },
    {
      id: 'exon',
      header: '外显子',
      width: 100,
      align: 'center' as const,
      accessor: (row: GroupedCNVExon) => row.exon,
    },
    {
      id: 'chromosome',
      header: '染色体',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedCNVExon) => row.chromosome,
    },
    {
      id: 'type',
      header: '类型',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedCNVExon) => (
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
      accessor: (row: GroupedCNVExon) => row.copyNumber,
    },
    {
      id: 'ratio',
      header: '比值',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedCNVExon) => row.ratio.toFixed(2),
    },
    {
      id: 'confidence',
      header: '置信度',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedCNVExon) => `${(row.confidence * 100).toFixed(0)}%`,
    },
    {
      id: 'detectionCount',
      header: '检出次数',
      width: 80,
      align: 'center' as const,
      accessor: (row: GroupedCNVExon) => (
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
      accessor: (row: GroupedCNVExon) => row.firstDetectedAt,
    },
    {
      id: 'lastDetectedAt',
      header: '最后检出',
      width: 120,
      align: 'center' as const,
      accessor: (row: GroupedCNVExon) => row.lastDetectedAt,
    },
  ];

  return (
    <ExpandableTable
      data={result}
      loading={loading}
      filterState={filterState}
      onSearch={(query) => setFilterState({ ...filterState, searchQuery: query, page: 1 })}
      onPageChange={(page) => setFilterState({ ...filterState, page })}
      searchPlaceholder="搜索基因、外显子..."
      statsLabel="个CNV外显子"
      columns={columns}
      getGroupId={(row) => row.groupId}
      getRecords={(row) => row.records}
      emptyMessage="暂无CNV(Exon)历史检出位点数据"
    />
  );
}