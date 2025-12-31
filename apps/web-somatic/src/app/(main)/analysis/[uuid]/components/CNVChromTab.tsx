'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search } from 'lucide-react';
import type { TableFilterState, PaginatedResult } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { ReviewCheckbox, ReportCheckbox, ReviewColumnHeader, ReportColumnHeader } from './ReviewCheckboxes';
import { CNVChromDetailPanel } from './CNVChromDetailPanel';

// 染色体臂水平CNV类型
interface CNVChrom {
  id: string;
  chromosome: string;
  arm: 'p' | 'q';
  type: 'Gain' | 'Loss' | 'Normal';
  copyNumber: number;
  logRatio: number;
  bafDeviation: number;
  size: number;
  relatedCancers: string[];
  clinicalSignificance: string;
  reviewed: boolean;
  reported: boolean;
}

interface CNVChromTabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
  gender?: 'Male' | 'Female' | 'Unknown';
}

// 染色体大小（hg38）
const CHROMOSOME_SIZES: Record<string, { p: number; q: number }> = {
  'chr1': { p: 125000000, q: 123400000 }, 'chr2': { p: 93300000, q: 149000000 },
  'chr3': { p: 90900000, q: 107500000 }, 'chr4': { p: 50000000, q: 140300000 },
  'chr5': { p: 48800000, q: 132400000 }, 'chr6': { p: 59800000, q: 111200000 },
  'chr7': { p: 60100000, q: 99400000 }, 'chr8': { p: 45200000, q: 101400000 },
  'chr9': { p: 43000000, q: 95500000 }, 'chr10': { p: 39800000, q: 93900000 },
  'chr11': { p: 53400000, q: 81600000 }, 'chr12': { p: 35500000, q: 97900000 },
  'chr13': { p: 17700000, q: 96800000 }, 'chr14': { p: 17200000, q: 90000000 },
  'chr15': { p: 19000000, q: 83200000 }, 'chr16': { p: 36800000, q: 53500000 },
  'chr17': { p: 25100000, q: 58100000 }, 'chr18': { p: 18500000, q: 62100000 },
  'chr19': { p: 26200000, q: 32600000 }, 'chr20': { p: 28100000, q: 36800000 },
  'chr21': { p: 12000000, q: 34800000 }, 'chr22': { p: 15000000, q: 35600000 },
  'chrX': { p: 60600000, q: 95400000 }, 'chrY': { p: 10400000, q: 47000000 },
};

// 相关癌种映射
const CANCER_ASSOCIATIONS: Record<string, string[]> = {
  'chr1q': ['乳腺癌', '肝细胞癌', '神经母细胞瘤'],
  'chr7p': ['非小细胞肺癌', '胶质母细胞瘤'],
  'chr7q': ['非小细胞肺癌', '结直肠癌'],
  'chr8q': ['前列腺癌', '乳腺癌', '肝细胞癌'],
  'chr9p': ['黑色素瘤', '胶质母细胞瘤', '膀胱癌'],
  'chr17p': ['结直肠癌', '乳腺癌', '卵巢癌'],
  'chr17q': ['乳腺癌', '卵巢癌'],
  'chr20q': ['结直肠癌', '胃癌'],
};

// 生成所有染色体臂的Mock数据
function generateAllChromosomeArms(predictedGender: 'Male' | 'Female' | 'Unknown' = 'Male'): CNVChrom[] {
  const chromosomes = ['chr1','chr2','chr3','chr4','chr5','chr6','chr7','chr8','chr9','chr10','chr11','chr12','chr13','chr14','chr15','chr16','chr17','chr18','chr19','chr20','chr21','chr22','chrX','chrY'];
  const arms: ('p' | 'q')[] = ['p', 'q'];
  const result: CNVChrom[] = [];
  
  const abnormals: Record<string, { type: 'Gain' | 'Loss'; cn: number; lr: number }> = {
    'chr1q': { type: 'Gain', cn: 3, lr: 0.58 },
    'chr7p': { type: 'Gain', cn: 4, lr: 1.0 },
    'chr7q': { type: 'Gain', cn: 3, lr: 0.58 },
    'chr8q': { type: 'Gain', cn: 3, lr: 0.58 },
    'chr9p': { type: 'Loss', cn: 1, lr: -1.0 },
    'chr17p': { type: 'Loss', cn: 1, lr: -1.0 },
    'chr17q': { type: 'Gain', cn: 4, lr: 1.0 },
    'chr20q': { type: 'Gain', cn: 3, lr: 0.58 },
  };
  
  let id = 1;
  chromosomes.forEach(chr => {
    // 根据性别决定是否包含Y染色体
    if (chr === 'chrY' && predictedGender === 'Female') {
      // 女性Y染色体拷贝数为0是正常的
      arms.forEach(arm => {
        const sizes = CHROMOSOME_SIZES[chr] || { p: 50000000, q: 50000000 };
        const size = arm === 'p' ? sizes.p : sizes.q;
        result.push({
          id: String(id++),
          chromosome: chr,
          arm,
          type: 'Normal',
          copyNumber: 0,
          logRatio: -3,
          bafDeviation: 0,
          size,
          relatedCancers: [],
          clinicalSignificance: '正常（女性无Y染色体）',
          reviewed: false,
          reported: false,
        });
      });
      return;
    }
    
    arms.forEach(arm => {
      const key = `${chr}${arm}`;
      const sizes = CHROMOSOME_SIZES[chr] || { p: 50000000, q: 50000000 };
      const size = arm === 'p' ? sizes.p : sizes.q;
      const abnormal = abnormals[key];
      
      // 判断性染色体的正常拷贝数
      let normalCopyNumber = 2;
      if (chr === 'chrX') {
        normalCopyNumber = predictedGender === 'Male' ? 1 : 2;
      } else if (chr === 'chrY') {
        normalCopyNumber = predictedGender === 'Male' ? 1 : 0;
      }
      
      // 判断是否异常
      let type: 'Gain' | 'Loss' | 'Normal' = 'Normal';
      let copyNumber = normalCopyNumber;
      let logRatio = 0;
      
      if (abnormal) {
        type = abnormal.type;
        copyNumber = abnormal.cn;
        logRatio = abnormal.lr;
      } else if (chr === 'chrX' || chr === 'chrY') {
        // 性染色体使用正常值
        copyNumber = normalCopyNumber;
        logRatio = predictedGender === 'Male' ? -1 : 0; // 男性X/Y为1拷贝，log2(1/2)=-1
        if (chr === 'chrY' && predictedGender === 'Male') {
          logRatio = -1;
        }
      }
      
      result.push({
        id: String(id++),
        chromosome: chr,
        arm,
        type,
        copyNumber,
        logRatio,
        bafDeviation: abnormal ? (abnormal.type === 'Gain' ? 0.15 + Math.random() * 0.1 : 0.25 + Math.random() * 0.15) : Math.random() * 0.05,
        size,
        relatedCancers: CANCER_ASSOCIATIONS[key] || [],
        clinicalSignificance: abnormal ? (abnormal.type === 'Gain' ? '染色体臂获得' : '染色体臂丢失') : '正常',
        reviewed: false,
        reported: false,
      });
    });
  });
  
  return result;
}

async function getCNVChroms(allData: CNVChrom[], filterState: TableFilterState): Promise<PaginatedResult<CNVChrom>> {
  await new Promise(resolve => setTimeout(resolve, 300));
  let data = [...allData];
  
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item => item.chromosome.toLowerCase().includes(query));
  }
  
  if (filterState.filters.type) {
    data = data.filter(item => item.type === filterState.filters.type);
  }
  
  // 排序：异常的放在前面，然后按染色体顺序
  data.sort((a, b) => {
    // 先按是否异常排序
    const aIsAbnormal = a.type !== 'Normal' ? 0 : 1;
    const bIsAbnormal = b.type !== 'Normal' ? 0 : 1;
    if (aIsAbnormal !== bIsAbnormal) return aIsAbnormal - bIsAbnormal;
    
    // 再按染色体编号排序
    const chrOrder = (chr: string) => {
      const num = chr.replace('chr', '');
      if (num === 'X') return 23;
      if (num === 'Y') return 24;
      return parseInt(num, 10);
    };
    const chrDiff = chrOrder(a.chromosome) - chrOrder(b.chromosome);
    if (chrDiff !== 0) return chrDiff;
    
    // 最后按臂排序 (p在前)
    return a.arm === 'p' ? -1 : 1;
  });
  
  return { data, total: data.length, page: filterState.page, pageSize: filterState.pageSize };
}

export function CNVChromTab({ 
  taskId, 
  filterState: externalFilterState, 
  onFilterChange,
  gender = 'Male'
}: CNVChromTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<TableFilterState>(DEFAULT_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<CNVChrom> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [reviewStatus, setReviewStatus] = React.useState<Record<string, { reviewed: boolean; reported: boolean }>>({});

  // 根据性别生成数据
  const mockCNVChroms = React.useMemo(() => generateAllChromosomeArms(gender), [gender]);

  // 详情面板状态
  const [selectedVariant, setSelectedVariant] = React.useState<CNVChrom | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = React.useState(false);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  // 点击行打开详情面板
  const handleRowClick = React.useCallback((variant: CNVChrom) => {
    setSelectedVariant(variant);
    setDetailPanelOpen(true);
  }, []);

  // 关闭详情面板
  const handleCloseDetailPanel = React.useCallback(() => {
    setDetailPanelOpen(false);
  }, []);

  // 加载数据
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getCNVChroms(mockCNVChroms, filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [mockCNVChroms, filterState]);

  const handleSearch = React.useCallback((query: string) => {
    setFilterState({ ...filterState, searchQuery: query, page: 1 });
  }, [filterState, setFilterState]);

  const handleTypeFilter = React.useCallback((type: string) => {
    const newFilters = { ...filterState.filters };
    if (type) {
      newFilters.type = type;
    } else {
      delete newFilters.type;
    }
    setFilterState({ ...filterState, filters: newFilters, page: 1 });
  }, [filterState, setFilterState]);

  const handleReviewChange = React.useCallback((id: string, checked: boolean) => {
    setReviewStatus(prev => ({
      ...prev,
      [id]: { ...prev[id], reviewed: checked, reported: prev[id]?.reported ?? false }
    }));
  }, []);

  const handleReportChange = React.useCallback((id: string, checked: boolean) => {
    setReviewStatus(prev => ({
      ...prev,
      [id]: { reviewed: prev[id]?.reviewed ?? false, reported: checked }
    }));
  }, []);

  const getReviewState = React.useCallback((variant: CNVChrom) => {
    return reviewStatus[variant.id] ?? { reviewed: variant.reviewed, reported: variant.reported };
  }, [reviewStatus]);

  const formatSize = (size: number) => {
    if (size >= 1000000) return `${(size / 1000000).toFixed(1)} Mb`;
    if (size >= 1000) return `${(size / 1000).toFixed(1)} kb`;
    return `${size} bp`;
  };

  // 列定义
  const columns: Column<CNVChrom>[] = [
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
    },
    {
      id: 'chromosome',
      header: 'Chrom',
      accessor: (row) => row.chromosome.replace('chr', ''),
      width: 60,
    },
    {
      id: 'region',
      header: '臂',
      accessor: (row) => `${row.chromosome.replace('chr', '')}${row.arm}`,
      width: 60,
      sortable: true,
    },
    {
      id: 'type',
      header: '类型',
      accessor: (row) => (
        <Tag variant={row.type === 'Gain' ? 'danger' : row.type === 'Loss' ? 'info' : 'neutral'}>
          {row.type === 'Gain' ? '获得' : row.type === 'Loss' ? '丢失' : '正常'}
        </Tag>
      ),
      width: 80,
    },
    {
      id: 'copyNumber',
      header: '拷贝数',
      accessor: (row) => row.copyNumber,
      width: 70,
      sortable: true,
    },
    {
      id: 'logRatio',
      header: 'Log2 Ratio',
      accessor: (row) => row.logRatio.toFixed(2),
      width: 90,
      sortable: true,
    },
    {
      id: 'bafDeviation',
      header: 'BAF偏移',
      accessor: (row) => `${(row.bafDeviation * 100).toFixed(1)}%`,
      width: 80,
    },
    {
      id: 'size',
      header: '大小',
      accessor: (row) => formatSize(row.size),
      width: 90,
      sortable: true,
    },
    {
      id: 'relatedCancers',
      header: '相关癌种',
      accessor: (row) => (
        <span className="text-xs">
          {row.relatedCancers.length > 0 ? row.relatedCancers.slice(0, 2).join('、') + (row.relatedCancers.length > 2 ? '...' : '') : '-'}
        </span>
      ),
      width: 140,
    },
  ];

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="w-64">
            <Input
              placeholder="搜索染色体..."
              value={filterState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>

          {/* 类型筛选 */}
          <select
            value={(filterState.filters.type as string) || ''}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default"
          >
            <option value="">全部类型</option>
            <option value="Gain">获得</option>
            <option value="Loss">丢失</option>
          </select>
        </div>

        {/* 统计信息 */}
        <div className="text-sm text-fg-muted">
          共 {result?.total ?? 0} 个染色体臂CNV
        </div>
      </div>

      {/* 数据表格 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
        </div>
      ) : result && result.data.length > 0 ? (
        <DataTable
          data={result.data}
          columns={columns}
          rowKey="id"
          striped
          density="compact"
          onRowClick={handleRowClick}
        />
      ) : (
        <div className="text-center py-12 text-fg-muted">
          暂无染色体臂水平CNV数据
        </div>
      )}

      {/* CNV详情面板 */}
      <CNVChromDetailPanel
        variant={selectedVariant}
        allVariants={mockCNVChroms}
        isOpen={detailPanelOpen}
        onClose={handleCloseDetailPanel}
      />
    </div>
  );
}
