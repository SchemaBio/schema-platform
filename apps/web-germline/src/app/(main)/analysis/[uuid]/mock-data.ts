/**
 * Mock数据服务 - 分析结果详情页
 */

import type {
  AnalysisTaskDetail,
  QCResult,
  SNVIndel,
  CNVSegment,
  CNVExon,
  SampleInfo,
  STR,
  MitochondrialVariant,
  UPDRegion,
  TableFilterState,
  PaginatedResult,
  ACMGClassification,
} from './types';

// ============ Mock任务数据 ============
const mockTasks: AnalysisTaskDetail[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'S2024120001 全外显子分析',
    sampleId: 'S2024120001',
    sampleName: '张**',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    status: 'completed',
    createdAt: '2024-12-20 10:30',
    createdBy: '王工',
    completedAt: '2024-12-20 14:25',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    name: 'S2024120001 重新分析',
    sampleId: 'S2024120001',
    sampleName: '张**',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    status: 'pending_interpretation',
    createdAt: '2024-12-25 09:00',
    createdBy: '李工',
    completedAt: '2024-12-25 13:15',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    name: 'S2024120002 心血管Panel',
    sampleId: 'S2024120002',
    sampleName: '李**',
    pipeline: 'Panel-Cardio',
    pipelineVersion: 'v2.0.1',
    status: 'running',
    createdAt: '2024-12-27 14:00',
    createdBy: '王工',
  },
];

// ============ Mock QC数据 ============
const mockQCResults: Record<string, QCResult> = {
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890': {
    totalReads: 125000000,
    mappedReads: 122500000,
    mappingRate: 0.98,
    averageDepth: 150.5,
    targetCoverage: 0.995,
    duplicateRate: 0.12,
    q30Rate: 0.92,
    insertSize: 180,
  },
  'b2c3d4e5-f6a7-8901-bcde-f12345678901': {
    totalReads: 130000000,
    mappedReads: 126100000,
    mappingRate: 0.97,
    averageDepth: 145.2,
    targetCoverage: 0.988,
    duplicateRate: 0.15,
    q30Rate: 0.89,
    insertSize: 175,
  },
};

// ============ Mock SNV/Indel数据 ============
const mockSNVIndels: SNVIndel[] = [
  {
    id: 'snv-001',
    gene: 'BRCA1',
    chromosome: 'chr17',
    position: 43094464,
    ref: 'G',
    alt: 'A',
    variantType: 'SNV',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.45,
    depth: 120,
    acmgClassification: 'Pathogenic',
    transcript: 'NM_007294.4',
    hgvsc: 'c.5266dupC',
    hgvsp: 'p.Gln1756ProfsTer74',
    consequence: 'frameshift_variant',
  },
  {
    id: 'snv-002',
    gene: 'TP53',
    chromosome: 'chr17',
    position: 7577538,
    ref: 'C',
    alt: 'T',
    variantType: 'SNV',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.48,
    depth: 95,
    acmgClassification: 'Likely_Pathogenic',
    transcript: 'NM_000546.6',
    hgvsc: 'c.743G>A',
    hgvsp: 'p.Arg248Gln',
    consequence: 'missense_variant',
  },
  {
    id: 'snv-003',
    gene: 'CFTR',
    chromosome: 'chr7',
    position: 117559590,
    ref: 'CTT',
    alt: 'C',
    variantType: 'Deletion',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.52,
    depth: 88,
    acmgClassification: 'Pathogenic',
    transcript: 'NM_000492.4',
    hgvsc: 'c.1521_1523delCTT',
    hgvsp: 'p.Phe508del',
    consequence: 'inframe_deletion',
  },
  {
    id: 'snv-004',
    gene: 'MLH1',
    chromosome: 'chr3',
    position: 37053568,
    ref: 'A',
    alt: 'G',
    variantType: 'SNV',
    zygosity: 'Homozygous',
    alleleFrequency: 0.98,
    depth: 110,
    acmgClassification: 'VUS',
    transcript: 'NM_000249.4',
    hgvsc: 'c.655A>G',
    hgvsp: 'p.Ile219Val',
    consequence: 'missense_variant',
  },
  {
    id: 'snv-005',
    gene: 'LDLR',
    chromosome: 'chr19',
    position: 11224088,
    ref: 'G',
    alt: 'A',
    variantType: 'SNV',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.35,
    depth: 75,
    acmgClassification: 'Likely_Benign',
    transcript: 'NM_000527.5',
    hgvsc: 'c.1060+5G>A',
    hgvsp: '-',
    consequence: 'splice_region_variant',
  },
];

// ============ Mock 样本信息数据 ============
const mockSampleInfo: Record<string, SampleInfo> = {
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890': {
    sampleId: 'S2024120001',
    sampleName: '张**',
    gender: 'Male',
    age: 35,
    clinicalDiagnosis: '疑似遗传性心肌病',
    phenotypes: ['心肌肥厚', '心律不齐', '运动后晕厥'],
    familyHistory: '父亲有心脏病史',
    sampleType: '外周血',
    collectionDate: '2024-12-18',
    receivedDate: '2024-12-19',
    reportDate: '2024-12-25',
  },
  'b2c3d4e5-f6a7-8901-bcde-f12345678901': {
    sampleId: 'S2024120001',
    sampleName: '张**',
    gender: 'Male',
    age: 35,
    clinicalDiagnosis: '疑似遗传性心肌病',
    phenotypes: ['心肌肥厚', '心律不齐', '运动后晕厥'],
    familyHistory: '父亲有心脏病史',
    sampleType: '外周血',
    collectionDate: '2024-12-18',
    receivedDate: '2024-12-19',
  },
};

// ============ Mock CNV数据(片段级别) ============
const mockCNVSegments: CNVSegment[] = [
  {
    id: 'cnv-001',
    chromosome: 'chr17',
    startPosition: 43044295,
    endPosition: 43170245,
    length: 125950,
    type: 'Deletion',
    copyNumber: 1,
    genes: ['BRCA1'],
    confidence: 0.95,
  },
  {
    id: 'cnv-002',
    chromosome: 'chr7',
    startPosition: 55086714,
    endPosition: 55279321,
    length: 192607,
    type: 'Amplification',
    copyNumber: 4,
    genes: ['EGFR'],
    confidence: 0.88,
  },
  {
    id: 'cnv-003',
    chromosome: 'chr22',
    startPosition: 18844632,
    endPosition: 21465659,
    length: 2621027,
    type: 'Deletion',
    copyNumber: 1,
    genes: ['TBX1', 'COMT', 'DGCR8'],
    confidence: 0.92,
  },
];

// ============ Mock CNV数据(外显子级别) ============
const mockCNVExons: CNVExon[] = [
  {
    id: 'cnv-exon-001',
    gene: 'BRCA1',
    exon: 'Exon 11-13',
    chromosome: 'chr17',
    startPosition: 43091434,
    endPosition: 43104956,
    type: 'Deletion',
    copyNumber: 1,
    ratio: 0.52,
    confidence: 0.94,
  },
  {
    id: 'cnv-exon-002',
    gene: 'EGFR',
    exon: 'Exon 18-21',
    chromosome: 'chr7',
    startPosition: 55211070,
    endPosition: 55249071,
    type: 'Amplification',
    copyNumber: 5,
    ratio: 2.45,
    confidence: 0.91,
  },
  {
    id: 'cnv-exon-003',
    gene: 'DMD',
    exon: 'Exon 45-50',
    chromosome: 'chrX',
    startPosition: 31792164,
    endPosition: 31838705,
    type: 'Deletion',
    copyNumber: 0,
    ratio: 0.05,
    confidence: 0.98,
  },
  {
    id: 'cnv-exon-004',
    gene: 'SMN1',
    exon: 'Exon 7',
    chromosome: 'chr5',
    startPosition: 70924941,
    endPosition: 70925030,
    type: 'Deletion',
    copyNumber: 1,
    ratio: 0.48,
    confidence: 0.89,
  },
];

// ============ Mock STR数据 ============
const mockSTRs: STR[] = [
  {
    id: 'str-001',
    gene: 'FMR1',
    locus: 'Xq27.3',
    repeatUnit: 'CGG',
    repeatCount: 35,
    normalRangeMin: 5,
    normalRangeMax: 44,
    status: 'Normal',
  },
  {
    id: 'str-002',
    gene: 'HTT',
    locus: '4p16.3',
    repeatUnit: 'CAG',
    repeatCount: 42,
    normalRangeMin: 10,
    normalRangeMax: 35,
    status: 'FullMutation',
  },
  {
    id: 'str-003',
    gene: 'DMPK',
    locus: '19q13.32',
    repeatUnit: 'CTG',
    repeatCount: 65,
    normalRangeMin: 5,
    normalRangeMax: 37,
    status: 'Premutation',
  },
  {
    id: 'str-004',
    gene: 'ATXN1',
    locus: '6p22.3',
    repeatUnit: 'CAG',
    repeatCount: 28,
    normalRangeMin: 6,
    normalRangeMax: 38,
    status: 'Normal',
  },
];

// ============ Mock线粒体变异数据 ============
const mockMTVariants: MitochondrialVariant[] = [
  {
    id: 'mt-001',
    position: 3243,
    ref: 'A',
    alt: 'G',
    gene: 'MT-TL1',
    heteroplasmy: 0.35,
    pathogenicity: 'Pathogenic',
    associatedDisease: 'MELAS综合征',
    haplogroup: 'H',
  },
  {
    id: 'mt-002',
    position: 8344,
    ref: 'A',
    alt: 'G',
    gene: 'MT-TK',
    heteroplasmy: 0.72,
    pathogenicity: 'Pathogenic',
    associatedDisease: 'MERRF综合征',
    haplogroup: 'H',
  },
  {
    id: 'mt-003',
    position: 11778,
    ref: 'G',
    alt: 'A',
    gene: 'MT-ND4',
    heteroplasmy: 0.95,
    pathogenicity: 'Pathogenic',
    associatedDisease: 'Leber遗传性视神经病变',
    haplogroup: 'J',
  },
  {
    id: 'mt-004',
    position: 14484,
    ref: 'T',
    alt: 'C',
    gene: 'MT-ND6',
    heteroplasmy: 0.15,
    pathogenicity: 'VUS',
    associatedDisease: '-',
  },
];

// ============ Mock UPD数据 ============
const mockUPDRegions: UPDRegion[] = [
  {
    id: 'upd-001',
    chromosome: 'chr15',
    startPosition: 22770421,
    endPosition: 28526904,
    length: 5756483,
    type: 'Isodisomy',
    genes: ['UBE3A', 'SNRPN', 'NDN'],
    parentOfOrigin: 'Maternal',
  },
  {
    id: 'upd-002',
    chromosome: 'chr11',
    startPosition: 1850000,
    endPosition: 2870000,
    length: 1020000,
    type: 'Heterodisomy',
    genes: ['IGF2', 'H19'],
    parentOfOrigin: 'Paternal',
  },
];

// ============ 数据获取函数 ============

export async function getTaskDetail(uuid: string): Promise<AnalysisTaskDetail | null> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockTasks.find(t => t.id === uuid) ?? null;
}

export async function getQCResult(uuid: string): Promise<QCResult | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockQCResults[uuid] ?? mockQCResults['a1b2c3d4-e5f6-7890-abcd-ef1234567890'];
}

// 通用分页和筛选函数
function applyFilterAndPagination<T extends { id: string }>(
  data: T[],
  filterState: TableFilterState,
  searchFields: (keyof T)[],
  sortableFields: (keyof T)[]
): PaginatedResult<T> {
  let filtered = [...data];

  // 搜索
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    filtered = filtered.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(query);
      })
    );
  }

  // 筛选
  Object.entries(filterState.filters).forEach(([key, value]) => {
    if (value && value.length > 0) {
      filtered = filtered.filter(item => {
        const itemValue = item[key as keyof T];
        if (Array.isArray(value)) {
          return value.includes(String(itemValue));
        }
        return String(itemValue) === value;
      });
    }
  });

  // 排序
  if (filterState.sortColumn && sortableFields.includes(filterState.sortColumn as keyof T)) {
    const sortKey = filterState.sortColumn as keyof T;
    const direction = filterState.sortDirection === 'desc' ? -1 : 1;
    filtered.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * direction;
      }
      return String(aVal).localeCompare(String(bVal)) * direction;
    });
  }

  // 分页
  const total = filtered.length;
  const start = (filterState.page - 1) * filterState.pageSize;
  const paged = filtered.slice(start, start + filterState.pageSize);

  return {
    data: paged,
    total,
    page: filterState.page,
    pageSize: filterState.pageSize,
  };
}

export async function getSNVIndels(
  _uuid: string,
  filterState: TableFilterState
): Promise<PaginatedResult<SNVIndel>> {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  let data = [...mockSNVIndels];
  
  // 基因列表过滤
  if (filterState.geneListId) {
    const geneList = getGeneListById(filterState.geneListId);
    if (geneList) {
      data = data.filter(item => geneList.genes.includes(item.gene));
    }
  }
  
  return applyFilterAndPagination(
    data,
    filterState,
    ['gene', 'chromosome', 'hgvsc', 'hgvsp'],
    ['gene', 'chromosome', 'position', 'alleleFrequency', 'depth', 'acmgClassification']
  );
}

export async function getSampleInfo(uuid: string): Promise<SampleInfo | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockSampleInfo[uuid] ?? mockSampleInfo['a1b2c3d4-e5f6-7890-abcd-ef1234567890'];
}

export async function getCNVSegments(
  _uuid: string,
  filterState: TableFilterState
): Promise<PaginatedResult<CNVSegment>> {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  let data = [...mockCNVSegments];
  
  // 基因列表过滤（涉及基因中任一匹配）
  if (filterState.geneListId) {
    const geneList = getGeneListById(filterState.geneListId);
    if (geneList) {
      data = data.filter(item => 
        item.genes.some(gene => geneList.genes.includes(gene))
      );
    }
  }
  
  return applyFilterAndPagination(
    data,
    filterState,
    ['chromosome'],
    ['chromosome', 'startPosition', 'length', 'type', 'copyNumber', 'confidence']
  );
}

export async function getCNVExons(
  _uuid: string,
  filterState: TableFilterState
): Promise<PaginatedResult<CNVExon>> {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  let data = [...mockCNVExons];
  
  // 基因列表过滤（单基因匹配）
  if (filterState.geneListId) {
    const geneList = getGeneListById(filterState.geneListId);
    if (geneList) {
      data = data.filter(item => geneList.genes.includes(item.gene));
    }
  }
  
  return applyFilterAndPagination(
    data,
    filterState,
    ['gene', 'exon', 'chromosome'],
    ['gene', 'chromosome', 'startPosition', 'type', 'copyNumber', 'ratio', 'confidence']
  );
}

export async function getSTRs(
  _uuid: string,
  filterState: TableFilterState
): Promise<PaginatedResult<STR>> {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  let data = [...mockSTRs];
  
  // 基因列表过滤（单基因匹配）
  if (filterState.geneListId) {
    const geneList = getGeneListById(filterState.geneListId);
    if (geneList) {
      data = data.filter(item => geneList.genes.includes(item.gene));
    }
  }
  
  return applyFilterAndPagination(
    data,
    filterState,
    ['gene', 'locus'],
    ['gene', 'locus', 'repeatCount', 'status']
  );
}

export async function getMitochondrialVariants(
  _uuid: string,
  filterState: TableFilterState
): Promise<PaginatedResult<MitochondrialVariant>> {
  await new Promise(resolve => setTimeout(resolve, 150));
  return applyFilterAndPagination(
    mockMTVariants,
    filterState,
    ['gene', 'associatedDisease'],
    ['position', 'gene', 'heteroplasmy', 'pathogenicity']
  );
}

export async function getUPDRegions(
  _uuid: string,
  filterState: TableFilterState
): Promise<PaginatedResult<UPDRegion>> {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  let data = [...mockUPDRegions];
  
  // 基因列表过滤（涉及基因中任一匹配）
  if (filterState.geneListId) {
    const geneList = getGeneListById(filterState.geneListId);
    if (geneList) {
      data = data.filter(item => 
        item.genes.some(gene => geneList.genes.includes(gene))
      );
    }
  }
  
  return applyFilterAndPagination(
    data,
    filterState,
    ['chromosome'],
    ['chromosome', 'startPosition', 'length', 'type']
  );
}

// ACMG分类配置
export const ACMG_CONFIG: Record<ACMGClassification, { label: string; variant: 'danger' | 'warning' | 'neutral' | 'info' | 'success' }> = {
  Pathogenic: { label: '致病', variant: 'danger' },
  Likely_Pathogenic: { label: '可能致病', variant: 'warning' },
  VUS: { label: '意义未明', variant: 'neutral' },
  Likely_Benign: { label: '可能良性', variant: 'info' },
  Benign: { label: '良性', variant: 'success' },
};

// ============ 基因列表数据 ============
export interface GeneListOption {
  id: string;
  name: string;
  geneCount: number;
  genes: string[];
}

const mockGeneLists: GeneListOption[] = [
  {
    id: 'gl-001',
    name: '心血管疾病基因Panel',
    geneCount: 156,
    genes: ['BRCA1', 'TP53', 'MLH1', 'LDLR', 'MYH7', 'MYBPC3', 'TNNT2', 'LMNA'],
  },
  {
    id: 'gl-002',
    name: '遗传性肿瘤基因Panel',
    geneCount: 89,
    genes: ['BRCA1', 'BRCA2', 'TP53', 'MLH1', 'MSH2', 'APC', 'PTEN'],
  },
  {
    id: 'gl-003',
    name: '肥厚型心肌病',
    geneCount: 23,
    genes: ['MYH7', 'MYBPC3', 'TNNT2', 'TNNI3', 'TPM1', 'MYL2', 'MYL3', 'ACTC1'],
  },
  {
    id: 'gl-004',
    name: '扩张型心肌病',
    geneCount: 45,
    genes: ['LMNA', 'TTN', 'MYH7', 'TNNT2', 'SCN5A', 'PLN', 'RBM20', 'BAG3'],
  },
  {
    id: 'gl-005',
    name: '囊性纤维化',
    geneCount: 1,
    genes: ['CFTR'],
  },
];

export async function getGeneLists(): Promise<GeneListOption[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockGeneLists;
}

export function getGeneListById(id: string): GeneListOption | undefined {
  return mockGeneLists.find(list => list.id === id);
}
