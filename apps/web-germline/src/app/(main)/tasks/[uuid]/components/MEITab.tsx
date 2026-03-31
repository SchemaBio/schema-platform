'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, ListFilter } from 'lucide-react';
import type { MEIVariant, TableFilterState, PaginatedResult, ACMGClassification } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { getMEIs, ACMG_CONFIG, getGeneLists, type GeneListOption } from '../mock-data';
import { PositionLink } from './IGVViewer';
import { ReviewCheckbox, ReportCheckbox, ReviewColumnHeader, ReportColumnHeader } from './ReviewCheckboxes';

interface MEITabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
}

// MEI 类型标签
const MEI_TYPE_LABELS = {
  LINE1: 'LINE-1',
  Alu: 'Alu',
  SVA: 'SVA',
  Unknown: '未知',
};

// MEI 类型颜色
const MEI_TYPE_COLORS = {
  LINE1: 'bg-purple-100 text-purple-700 border-purple-200',
  Alu: 'bg-blue-100 text-blue-700 border-blue-200',
  SVA: 'bg-orange-100 text-orange-700 border-orange-200',
  Unknown: 'bg-gray-100 text-gray-700 border-gray-200',
};

// 影响类型标签
const IMPACT_LABELS = {
  exonic: '外显子区',
  intronic: '内含子区',
  UTR5: "5'UTR",
  UTR3: "3'UTR",
  intergenic: '基因间区',
};

export function MEITab({
  taskId,
  filterState: externalFilterState,
  onFilterChange
}: MEITabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<TableFilterState>(DEFAULT_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<MEIVariant> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [geneLists, setGeneLists] = React.useState<GeneListOption[]>([]);
  const [reviewStatus, setReviewStatus] = React.useState<Record<string, { reviewed: boolean; reported: boolean }>>({});

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  // 处理审核状态变更
  const handleReviewChange = React.useCallback((id: string, checked: boolean) => {
    setReviewStatus(prev => ({
      ...prev,
      [id]: { ...prev[id], reviewed: checked, reported: prev[id]?.reported ?? false }
    }));
  }, []);

  // 处理回报状态变更
  const handleReportChange = React.useCallback((id: string, checked: boolean) => {
    setReviewStatus(prev => ({
      ...prev,
      [id]: { reviewed: prev[id]?.reviewed ?? false, reported: checked }
    }));
  }, []);

  // 获取变异的审核状态
  const getReviewState = React.useCallback((variant: MEIVariant) => {
    return reviewStatus[variant.id] ?? { reviewed: variant.reviewed, reported: variant.reported };
  }, [reviewStatus]);

  // 按审核/回报状态排序的数据
  const sortedData = React.useMemo(() => {
    if (!result?.data) return [];
    return [...result.data].sort((a, b) => {
      const stateA = getReviewState(a);
      const stateB = getReviewState(b);
      if (stateA.reported !== stateB.reported) {
        return stateA.reported ? -1 : 1;
      }
      if (stateA.reviewed !== stateB.reviewed) {
        return stateA.reviewed ? -1 : 1;
      }
      return 0;
    });
  }, [result?.data, getReviewState]);

  // 加载基因列表
  React.useEffect(() => {
    async function loadGeneLists() {
      const lists = await getGeneLists();
      setGeneLists(lists);
    }
    loadGeneLists();
  }, []);

  // 加载数据
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getMEIs(taskId, filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [taskId, filterState]);

  // 处理搜索
  const handleSearch = React.useCallback((query: string) => {
    setFilterState({ ...filterState, searchQuery: query, page: 1 });
  }, [filterState, setFilterState]);

  // 处理基因列表筛选
  const handleGeneListFilter = React.useCallback((geneListId: string) => {
    setFilterState({
      ...filterState,
      geneListId: geneListId || undefined,
      page: 1
    });
  }, [filterState, setFilterState]);

  // 获取当前选中的基因列表信息
  const selectedGeneList = React.useMemo(() => {
    if (!filterState.geneListId) return null;
    return geneLists.find(list => list.id === filterState.geneListId);
  }, [filterState.geneListId, geneLists]);

  // 列定义
  const columns: Column<MEIVariant>[] = [
    {
      id: 'reviewed',
      header: <ReviewColumnHeader />,
      accessor: (row) => {
        const state = getReviewState(row);
        return (
          <ReviewCheckbox
            checked={state.reviewed}
            onChange={(checked) => handleReviewChange(row.id, checked)}
          />
        );
      },
      width: 60,
      align: 'center',
    },
    {
      id: 'reported',
      header: <ReportColumnHeader />,
      accessor: (row) => {
        const state = getReviewState(row);
        return (
          <ReportCheckbox
            checked={state.reported}
            onChange={(checked) => handleReportChange(row.id, checked)}
          />
        );
      },
      width: 60,
      align: 'center',
    },
    {
      id: 'gene',
      header: '基因',
      accessor: 'gene',
      width: 100,
      align: 'center',
      sortable: true,
    },
    {
      id: 'position',
      header: '插入位置',
      accessor: (row) => (
        <PositionLink
          chromosome={row.chromosome}
          position={row.position}
          onClick={() => {}}
        />
      ),
      width: 150,
      align: 'center',
      sortable: true,
    },
    {
      id: 'meiType',
      header: 'MEI类型',
      accessor: (row) => (
        <span className={`px-2 py-0.5 text-xs rounded border ${MEI_TYPE_COLORS[row.meiType]}`}>
          {MEI_TYPE_LABELS[row.meiType]}
        </span>
      ),
      width: 80,
      align: 'center',
    },
    {
      id: 'insertionType',
      header: '插入类型',
      accessor: (row) => {
        const labels = { insertion: '插入', deletion: '缺失', complex: '复杂' };
        return labels[row.insertionType];
      },
      width: 80,
      align: 'center',
    },
    {
      id: 'strand',
      header: '链',
      accessor: 'strand',
      width: 50,
      align: 'center',
    },
    {
      id: 'length',
      header: '长度',
      accessor: (row) => `${row.length} bp`,
      width: 90,
      align: 'center',
      sortable: true,
    },
    {
      id: 'impact',
      header: '影响区域',
      accessor: (row) => row.impact ? IMPACT_LABELS[row.impact as keyof typeof IMPACT_LABELS] || row.impact : '-',
      width: 90,
      align: 'center',
    },
    {
      id: 'zygosity',
      header: '杂合性',
      accessor: (row) => {
        const labels = { Heterozygous: '杂合', Homozygous: '纯合', Hemizygous: '半合' };
        return labels[row.zygosity];
      },
      width: 80,
      align: 'center',
    },
    {
      id: 'supportingReads',
      header: '支持读数',
      accessor: (row) => `${row.supportingReads}/${row.totalReads}`,
      width: 90,
      align: 'center',
      sortable: true,
    },
    {
      id: 'frequency',
      header: '人群频率',
      accessor: (row) => row.frequency !== undefined ? `${(row.frequency * 100).toFixed(4)}%` : '-',
      width: 90,
      align: 'center',
      sortable: true,
    },
    {
      id: 'acmgClassification',
      header: 'ACMG分类',
      accessor: (row) => {
        if (!row.acmgClassification) return '-';
        const config = ACMG_CONFIG[row.acmgClassification];
        return <Tag variant={config.variant} className="w-20 justify-center">{config.label}</Tag>;
      },
      width: 100,
      align: 'center',
      sortable: true,
    },
  ];

  // 分页信息
  const totalPages = result ? Math.ceil(result.total / result.pageSize) : 0;

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="w-64">
            <Input
              placeholder="搜索基因、位置..."
              value={filterState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>

          {/* 基因列表筛选 */}
          <div className="relative">
            <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none" />
            <select
              value={filterState.geneListId || ''}
              onChange={(e) => handleGeneListFilter(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default min-w-[180px] appearance-none cursor-pointer"
            >
              <option value="">全部基因</option>
              {geneLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.geneCount})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-sm text-fg-muted">
          {selectedGeneList && (
            <span className="text-accent-fg">
              已筛选: {selectedGeneList.name}
            </span>
          )}
          <span>共 {result?.total ?? 0} 条 MEI 变异</span>
        </div>
      </div>

      {/* 数据表格 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
        </div>
      ) : result && result.data.length > 0 ? (
        <>
          <DataTable
            data={sortedData}
            columns={columns}
            rowKey="id"
            striped
            density="compact"
            sortColumn={filterState.sortColumn}
            sortDirection={filterState.sortDirection}
            onSortChange={(column, direction) => {
              setFilterState({
                ...filterState,
                sortColumn: direction ? column : undefined,
                sortDirection: direction ?? undefined,
              });
            }}
          />

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-fg-muted">
                第 {filterState.page} / {totalPages} 页
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterState({ ...filterState, page: filterState.page - 1 })}
                  disabled={filterState.page <= 1}
                  className="px-3 py-1 text-sm border border-border-default rounded hover:bg-canvas-subtle disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() => setFilterState({ ...filterState, page: filterState.page + 1 })}
                  disabled={filterState.page >= totalPages}
                  className="px-3 py-1 text-sm border border-border-default rounded hover:bg-canvas-subtle disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-fg-muted">
          暂无 MEI 变异数据
        </div>
      )}
    </div>
  );
}