'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, ListFilter } from 'lucide-react';
import type { SNVIndel, TableFilterState, PaginatedResult, ACMGClassification } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { getSNVIndels, ACMG_CONFIG, getGeneLists, type GeneListOption } from '../mock-data';
import { IGVViewer, PositionLink } from './IGVViewer';
import { VariantDetailPanel } from './VariantDetailPanel';

interface SNVIndelTabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
}

export function SNVIndelTab({ 
  taskId, 
  filterState: externalFilterState,
  onFilterChange 
}: SNVIndelTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<TableFilterState>(DEFAULT_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<SNVIndel> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [geneLists, setGeneLists] = React.useState<GeneListOption[]>([]);
  
  // IGV 查看器状态
  const [igvState, setIgvState] = React.useState<{
    isOpen: boolean;
    chromosome: string;
    position: number;
  }>({ isOpen: false, chromosome: '', position: 0 });

  // 详情面板状态
  const [selectedVariant, setSelectedVariant] = React.useState<SNVIndel | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = React.useState(false);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  // 打开 IGV 查看器
  const handleOpenIGV = React.useCallback((chromosome: string, position: number) => {
    setIgvState({ isOpen: true, chromosome, position });
  }, []);

  // 关闭 IGV 查看器
  const handleCloseIGV = React.useCallback(() => {
    setIgvState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // 点击行打开详情面板
  const handleRowClick = React.useCallback((variant: SNVIndel) => {
    setSelectedVariant(variant);
    setDetailPanelOpen(true);
  }, []);

  // 关闭详情面板
  const handleCloseDetailPanel = React.useCallback(() => {
    setDetailPanelOpen(false);
  }, []);

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
      const data = await getSNVIndels(taskId, filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [taskId, filterState]);

  // 处理搜索
  const handleSearch = React.useCallback((query: string) => {
    setFilterState({ ...filterState, searchQuery: query, page: 1 });
  }, [filterState, setFilterState]);

  // 处理排序
  const handleSortChange = React.useCallback((column: string, direction: 'asc' | 'desc' | null) => {
    setFilterState({
      ...filterState,
      sortColumn: direction ? column : undefined,
      sortDirection: direction ?? undefined,
    });
  }, [filterState, setFilterState]);

  // 处理ACMG筛选
  const handleACMGFilter = React.useCallback((classification: ACMGClassification | '') => {
    const newFilters = { ...filterState.filters };
    if (classification) {
      newFilters.acmgClassification = classification;
    } else {
      delete newFilters.acmgClassification;
    }
    setFilterState({ ...filterState, filters: newFilters, page: 1 });
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
  const columns: Column<SNVIndel>[] = [
    {
      id: 'gene',
      header: '基因',
      accessor: 'gene',
      width: 100,
      sortable: true,
    },
    {
      id: 'position',
      header: '变异位置',
      accessor: (row) => (
        <PositionLink
          chromosome={row.chromosome}
          position={row.position}
          onClick={handleOpenIGV}
        />
      ),
      width: 150,
      sortable: true,
    },
    {
      id: 'change',
      header: '参考/变异',
      accessor: (row) => `${row.ref}>${row.alt}`,
      width: 100,
    },
    {
      id: 'variantType',
      header: '变异类型',
      accessor: (row) => {
        const typeLabels = { SNV: 'SNV', Insertion: '插入', Deletion: '缺失' };
        return typeLabels[row.variantType];
      },
      width: 80,
    },
    {
      id: 'zygosity',
      header: '杂合性',
      accessor: (row) => {
        const labels = { Heterozygous: '杂合', Homozygous: '纯合', Hemizygous: '半合' };
        return labels[row.zygosity];
      },
      width: 80,
    },
    {
      id: 'alleleFrequency',
      header: '频率',
      accessor: (row) => `${(row.alleleFrequency * 100).toFixed(1)}%`,
      width: 80,
      sortable: true,
    },
    {
      id: 'depth',
      header: '深度',
      accessor: (row) => `${row.depth}X`,
      width: 70,
      sortable: true,
    },
    {
      id: 'acmgClassification',
      header: 'ACMG分类',
      accessor: (row) => {
        const config = ACMG_CONFIG[row.acmgClassification];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 100,
      sortable: true,
    },
    {
      id: 'transcript',
      header: '转录本',
      accessor: 'transcript',
      width: 130,
    },
    {
      id: 'hgvsc',
      header: 'cDNA变化',
      accessor: 'hgvsc',
      width: 150,
    },
    {
      id: 'hgvsp',
      header: '蛋白质变化',
      accessor: 'hgvsp',
      width: 150,
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

          {/* ACMG筛选 */}
          <select
            value={(filterState.filters.acmgClassification as string) || ''}
            onChange={(e) => handleACMGFilter(e.target.value as ACMGClassification | '')}
            className="px-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default"
          >
            <option value="">全部ACMG分类</option>
            {Object.entries(ACMG_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-sm text-fg-muted">
          {selectedGeneList && (
            <span className="text-accent-fg">
              已筛选: {selectedGeneList.name}
            </span>
          )}
          <span>共 {result?.total ?? 0} 条变异</span>
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
            data={result.data}
            columns={columns}
            rowKey="id"
            striped
            density="compact"
            sortColumn={filterState.sortColumn}
            sortDirection={filterState.sortDirection}
            onSortChange={handleSortChange}
            onRowClick={handleRowClick}
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
          暂无SNV/Indel变异数据
        </div>
      )}

      {/* IGV 查看器 */}
      <IGVViewer
        chromosome={igvState.chromosome}
        position={igvState.position}
        isOpen={igvState.isOpen}
        onClose={handleCloseIGV}
      />

      {/* 变异详情面板 */}
      <VariantDetailPanel
        variant={selectedVariant}
        isOpen={detailPanelOpen}
        onClose={handleCloseDetailPanel}
        onOpenIGV={handleOpenIGV}
      />
    </div>
  );
}
