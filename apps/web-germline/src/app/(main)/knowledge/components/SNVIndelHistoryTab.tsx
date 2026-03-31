'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import type { GroupedSNVIndel, KnowledgeTableFilterState, PaginatedResult } from '../types';
import { DEFAULT_KNOWLEDGE_FILTER_STATE } from '../types';
import { getGroupedSNVIndels, ACMG_CONFIG } from '../mock-data';

interface SNVIndelHistoryTabProps {
  filterState?: KnowledgeTableFilterState;
  onFilterChange?: (state: KnowledgeTableFilterState) => void;
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
  const [internalFilterState, setInternalFilterState] = React.useState<KnowledgeTableFilterState>(DEFAULT_KNOWLEDGE_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<GroupedSNVIndel> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  // 加载数据
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getGroupedSNVIndels(filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [filterState]);

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

  // 切换行展开状态
  const toggleRowExpand = React.useCallback((groupId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  // 列定义
  const columns: Column<GroupedSNVIndel>[] = [
    {
      id: 'expand',
      header: '',
      accessor: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleRowExpand(row.groupId);
          }}
          className="p-1 hover:bg-canvas-inset rounded"
        >
          {expandedRows.has(row.groupId) ? (
            <ChevronDown className="w-4 h-4 text-fg-muted" />
          ) : (
            <ChevronRight className="w-4 h-4 text-fg-muted" />
          )}
        </button>
      ),
      width: 40,
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
      id: 'hgvsc',
      header: 'HGVSc',
      accessor: 'hgvsc',
      width: 180,
      align: 'left',
      sortable: true,
    },
    {
      id: 'hgvsp',
      header: 'HGVSp',
      accessor: 'hgvsp',
      width: 180,
      align: 'left',
      sortable: true,
    },
    {
      id: 'transcript',
      header: '转录本',
      accessor: 'transcript',
      width: 130,
      align: 'center',
    },
    {
      id: 'acmgClassification',
      header: 'ACMG分类',
      accessor: (row) => {
        const config = ACMG_CONFIG[row.acmgClassification];
        return <Tag variant={config.variant} className="w-20 justify-center">{config.label}</Tag>;
      },
      width: 100,
      align: 'center',
      sortable: true,
    },
    {
      id: 'consequence',
      header: '变异后果',
      accessor: (row) => CONSEQUENCE_LABELS[row.consequence] || row.consequence,
      width: 100,
      align: 'center',
    },
    {
      id: 'gnomadAF',
      header: 'gnomAD频率',
      accessor: (row) => row.gnomadAF !== undefined ? `${(row.gnomadAF * 100).toFixed(4)}%` : '-',
      width: 100,
      align: 'center',
    },
    {
      id: 'clinvarId',
      header: 'ClinVar',
      accessor: (row) => row.clinvarId || '-',
      width: 120,
      align: 'center',
    },
    {
      id: 'detectionCount',
      header: '检出次数',
      accessor: (row) => (
        <span className={row.detectionCount > 1 ? 'font-medium text-accent-fg' : ''}>
          {row.detectionCount}
        </span>
      ),
      width: 80,
      align: 'center',
      sortable: true,
    },
    {
      id: 'firstDetectedAt',
      header: '首次检出',
      accessor: 'firstDetectedAt',
      width: 120,
      align: 'center',
      sortable: true,
    },
    {
      id: 'lastDetectedAt',
      header: '最后检出',
      accessor: 'lastDetectedAt',
      width: 120,
      align: 'center',
      sortable: true,
    },
  ];

  // 分页信息
  const totalPages = result ? Math.ceil(result.total / result.pageSize) : 0;

  // 渲染展开的详情行
  const renderExpandedRow = (row: GroupedSNVIndel) => {
    if (!expandedRows.has(row.groupId)) return null;

    return (
      <tr key={`${row.groupId}-detail`} className="bg-canvas-subtle">
        <td colSpan={columns.length} className="p-0">
          <div className="p-4 border-t border-border-default">
            <div className="text-sm font-medium text-fg-default mb-3">检出记录详情</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-default">
                    <th className="px-3 py-2 text-left text-fg-muted font-medium">任务ID</th>
                    <th className="px-3 py-2 text-left text-fg-muted font-medium">样本编号</th>
                    <th className="px-3 py-2 text-left text-fg-muted font-medium">流程名称</th>
                    <th className="px-3 py-2 text-left text-fg-muted font-medium">审核人</th>
                    <th className="px-3 py-2 text-left text-fg-muted font-medium">审核时间</th>
                  </tr>
                </thead>
                <tbody>
                  {row.records.map((record, index) => (
                    <tr
                      key={record.recordId}
                      className={index < row.records.length - 1 ? 'border-b border-border-subtle' : ''}
                    >
                      <td className="px-3 py-2 font-mono text-xs">{record.taskId.slice(0, 8)}</td>
                      <td className="px-3 py-2">{record.internalId}</td>
                      <td className="px-3 py-2">{record.pipeline} {record.pipelineVersion}</td>
                      <td className="px-3 py-2">{record.reviewedBy}</td>
                      <td className="px-3 py-2">{record.reviewedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="w-64">
            <Input
              placeholder="搜索基因、HGVSc、样本..."
              value={filterState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-sm text-fg-muted">
          <span>共 {result?.total ?? 0} 个独特位点</span>
          {result && result.data.length > 0 && (
            <span>
              （总检出 {result.data.reduce((sum, item) => sum + item.detectionCount, 0)} 次）
            </span>
          )}
        </div>
      </div>

      {/* 数据表格 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
        </div>
      ) : result && result.data.length > 0 ? (
        <>
          <div className="border border-border-default rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-canvas-subtle">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className={`px-3 py-2.5 text-sm font-medium text-fg-muted ${
                        col.sortable ? 'cursor-pointer hover:bg-canvas-inset' : ''
                      }`}
                      style={{ width: col.width, textAlign: col.align }}
                      onClick={() => {
                        if (col.sortable) {
                          const newDirection =
                            filterState.sortColumn === col.id && filterState.sortDirection === 'asc'
                              ? 'desc'
                              : 'asc';
                          handleSortChange(col.id, newDirection);
                        }
                      }}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {col.header}
                        {col.sortable && filterState.sortColumn === col.id && (
                          <span className="text-xs">
                            {filterState.sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((row) => (
                  <React.Fragment key={row.groupId}>
                    <tr
                      className="border-b border-border-default hover:bg-canvas-subtle cursor-pointer"
                      onClick={() => toggleRowExpand(row.groupId)}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.id}
                          className="px-3 py-2 text-sm"
                          style={{ textAlign: col.align }}
                        >
                          {typeof col.accessor === 'function'
                            ? col.accessor(row)
                            : String(row[col.accessor as keyof GroupedSNVIndel] ?? '')}
                        </td>
                      ))}
                    </tr>
                    {renderExpandedRow(row)}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

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
          暂无SNP/InDel历史检出位点数据
        </div>
      )}
    </div>
  );
}