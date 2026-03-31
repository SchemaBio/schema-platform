/**
 * Mock数据服务 - 知识中心历史检出位点汇总
 */

import type {
  GroupedSNVIndel,
  SNVIndelDetectionRecord,
  HistoryCNVSegment,
  HistoryCNVExon,
  HistorySTR,
  HistoryMEI,
  HistoryMTVariant,
  HistoryUPDRegion,
  KnowledgeTableFilterState,
  PaginatedResult,
  ACMGClassification,
} from './types';

// ============ ACMG分类配置 ============
export const ACMG_CONFIG: Record<ACMGClassification, { label: string; variant: 'danger' | 'warning' | 'neutral' | 'info' | 'success' }> = {
  Pathogenic: { label: '致病', variant: 'danger' },
  Likely_Pathogenic: { label: '可能致病', variant: 'warning' },
  VUS: { label: '意义未明', variant: 'neutral' },
  Likely_Benign: { label: '可能良性', variant: 'info' },
  Benign: { label: '良性', variant: 'success' },
};

// ============ 原始SNV/Indel检出记录 ============
interface SNVIndelRawRecord {
  recordId: string;
  gene: string;
  hgvsc: string;
  hgvsp: string;
  transcript: string;
  acmgClassification: ACMGClassification;
  consequence: string;
  rsId?: string;
  clinvarId?: string;
  gnomadAF?: number;
  // 来源信息
  taskId: string;
  taskName: string;
  pipeline: string;
  pipelineVersion: string;
  sampleId: string;
  internalId: string;
  reviewedAt: string;
  reviewedBy: string;
}

// 原始检出数据（可能有多条相同变异的记录）
const mockSNVIndelRawRecords: SNVIndelRawRecord[] = [
  // BRCA1 c.5266dupC - 检出3次
  {
    recordId: 'rec-snv-001',
    gene: 'BRCA1',
    hgvsc: 'c.5266dupC',
    hgvsp: 'p.Gln1756ProfsTer74',
    transcript: 'NM_007294.4',
    acmgClassification: 'Pathogenic',
    consequence: 'frameshift_variant',
    rsId: 'rs80357906',
    clinvarId: 'VCV000017661',
    gnomadAF: 0.00002,
    taskId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    taskName: 'INT-001 全外显子分析',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    sampleId: 's1a2b3c4-d5e6-7890-abcd-ef1234567890',
    internalId: 'INT-001',
    reviewedAt: '2024-12-20 10:30',
    reviewedBy: '王工',
  },
  {
    recordId: 'rec-snv-002',
    gene: 'BRCA1',
    hgvsc: 'c.5266dupC',
    hgvsp: 'p.Gln1756ProfsTer74',
    transcript: 'NM_007294.4',
    acmgClassification: 'Pathogenic',
    consequence: 'frameshift_variant',
    rsId: 'rs80357906',
    clinvarId: 'VCV000017661',
    gnomadAF: 0.00002,
    taskId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    taskName: 'INT-002 全外显子分析',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    sampleId: 's2b3c4d5-e6f7-8901-bcde-f12345678901',
    internalId: 'INT-002',
    reviewedAt: '2024-12-22 14:00',
    reviewedBy: '李工',
  },
  {
    recordId: 'rec-snv-003',
    gene: 'BRCA1',
    hgvsc: 'c.5266dupC',
    hgvsp: 'p.Gln1756ProfsTer74',
    transcript: 'NM_007294.4',
    acmgClassification: 'Pathogenic',
    consequence: 'frameshift_variant',
    rsId: 'rs80357906',
    clinvarId: 'VCV000017661',
    gnomadAF: 0.00002,
    taskId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    taskName: 'INT-003 全外显子分析',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    sampleId: 's3c4d5e6-f7a8-9012-cdef-123456789012',
    internalId: 'INT-003',
    reviewedAt: '2024-12-25 09:30',
    reviewedBy: '王工',
  },
  // TP53 c.743G>A - 检出2次
  {
    recordId: 'rec-snv-004',
    gene: 'TP53',
    hgvsc: 'c.743G>A',
    hgvsp: 'p.Arg248Gln',
    transcript: 'NM_000546.6',
    acmgClassification: 'Likely_Pathogenic',
    consequence: 'missense_variant',
    rsId: 'rs28934576',
    clinvarId: 'VCV000012356',
    gnomadAF: 0.000008,
    taskId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    taskName: 'INT-001 全外显子分析',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    sampleId: 's1a2b3c4-d5e6-7890-abcd-ef1234567890',
    internalId: 'INT-001',
    reviewedAt: '2024-12-20 11:00',
    reviewedBy: '王工',
  },
  {
    recordId: 'rec-snv-005',
    gene: 'TP53',
    hgvsc: 'c.743G>A',
    hgvsp: 'p.Arg248Gln',
    transcript: 'NM_000546.6',
    acmgClassification: 'Likely_Pathogenic',
    consequence: 'missense_variant',
    rsId: 'rs28934576',
    clinvarId: 'VCV000012356',
    gnomadAF: 0.000008,
    taskId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    taskName: 'INT-004 全外显子分析',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    sampleId: 's4d5e6f7-a8b9-0123-defa-234567890123',
    internalId: 'INT-004',
    reviewedAt: '2024-12-26 15:00',
    reviewedBy: '李工',
  },
  // CFTR c.1521_1523delCTT - 检出1次
  {
    recordId: 'rec-snv-006',
    gene: 'CFTR',
    hgvsc: 'c.1521_1523delCTT',
    hgvsp: 'p.Phe508del',
    transcript: 'NM_000492.4',
    acmgClassification: 'Pathogenic',
    consequence: 'inframe_deletion',
    rsId: 'rs113993960',
    clinvarId: 'VCV000007105',
    gnomadAF: 0.012,
    taskId: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    taskName: 'INT-005 囊性纤维化Panel',
    pipeline: 'Panel-CFTR',
    pipelineVersion: 'v1.0.0',
    sampleId: 's5e6f7a8-b9c0-1234-efab-345678901234',
    internalId: 'INT-005',
    reviewedAt: '2024-12-24 10:00',
    reviewedBy: '王工',
  },
  // MYH7 c.1208G>A - 检出1次
  {
    recordId: 'rec-snv-007',
    gene: 'MYH7',
    hgvsc: 'c.1208G>A',
    hgvsp: 'p.Arg403Gln',
    transcript: 'NM_000260.4',
    acmgClassification: 'Pathogenic',
    consequence: 'missense_variant',
    rsId: 'rs121913603',
    clinvarId: 'VCV000005566',
    gnomadAF: 0.00001,
    taskId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
    taskName: 'INT-006 心血管Panel',
    pipeline: 'Panel-Cardio',
    pipelineVersion: 'v2.0.1',
    sampleId: 's6f7a8b9-c0d1-2345-fabc-456789012345',
    internalId: 'INT-006',
    reviewedAt: '2024-12-27 14:30',
    reviewedBy: '李工',
  },
  // LMNA c.622C>T - 检出2次
  {
    recordId: 'rec-snv-008',
    gene: 'LMNA',
    hgvsc: 'c.622C>T',
    hgvsp: 'p.Arg208Cys',
    transcript: 'NM_170707.4',
    acmgClassification: 'Likely_Pathogenic',
    consequence: 'missense_variant',
    rsId: 'rs137853966',
    clinvarId: 'VCV000002344',
    gnomadAF: 0.00005,
    taskId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
    taskName: 'INT-006 心血管Panel',
    pipeline: 'Panel-Cardio',
    pipelineVersion: 'v2.0.1',
    sampleId: 's6f7a8b9-c0d1-2345-fabc-456789012345',
    internalId: 'INT-006',
    reviewedAt: '2024-12-27 15:00',
    reviewedBy: '王工',
  },
  {
    recordId: 'rec-snv-009',
    gene: 'LMNA',
    hgvsc: 'c.622C>T',
    hgvsp: 'p.Arg208Cys',
    transcript: 'NM_170707.4',
    acmgClassification: 'Likely_Pathogenic',
    consequence: 'missense_variant',
    rsId: 'rs137853966',
    clinvarId: 'VCV000002344',
    gnomadAF: 0.00005,
    taskId: 'a7b8c9d0-e1f2-3456-abcd-567890123456',
    taskName: 'INT-007 心血管Panel',
    pipeline: 'Panel-Cardio',
    pipelineVersion: 'v2.0.1',
    sampleId: 's7a8b9c0-d1e2-3456-abcd-567890123456',
    internalId: 'INT-007',
    reviewedAt: '2024-12-28 10:00',
    reviewedBy: '李工',
  },
];

// 按 基因-HGVSc-HGVSp 分组聚合
function groupSNVIndelRecords(records: SNVIndelRawRecord[]): GroupedSNVIndel[] {
  const groupMap = new Map<string, GroupedSNVIndel>();

  records.forEach(record => {
    const key = `${record.gene}-${record.hgvsc}-${record.hgvsp}`;

    if (!groupMap.has(key)) {
      // 创建新分组
      groupMap.set(key, {
        groupId: key,
        gene: record.gene,
        hgvsc: record.hgvsc,
        hgvsp: record.hgvsp,
        transcript: record.transcript,
        acmgClassification: record.acmgClassification,
        consequence: record.consequence,
        rsId: record.rsId,
        clinvarId: record.clinvarId,
        gnomadAF: record.gnomadAF,
        detectionCount: 0,
        firstDetectedAt: record.reviewedAt,
        lastDetectedAt: record.reviewedAt,
        records: [],
      });
    }

    const group = groupMap.get(key)!;

    // 添加检出记录
    const detectionRecord: SNVIndelDetectionRecord = {
      recordId: record.recordId,
      taskId: record.taskId,
      taskName: record.taskName,
      pipeline: record.pipeline,
      pipelineVersion: record.pipelineVersion,
      sampleId: record.sampleId,
      internalId: record.internalId,
      reviewedAt: record.reviewedAt,
      reviewedBy: record.reviewedBy,
    };
    group.records.push(detectionRecord);
    group.detectionCount++;

    // 更新首次/最后检出时间
    if (record.reviewedAt < group.firstDetectedAt) {
      group.firstDetectedAt = record.reviewedAt;
    }
    if (record.reviewedAt > group.lastDetectedAt) {
      group.lastDetectedAt = record.reviewedAt;
    }
  });

  return Array.from(groupMap.values());
}

// ============ Mock CNV片段历史检出数据 ============
const mockHistoryCNVSegments: HistoryCNVSegment[] = [
  {
    historyId: 'hist-cnv-seg-001',
    taskId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    taskName: 'INT-001 全外显子分析',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    sampleId: 's1a2b3c4-d5e6-7890-abcd-ef1234567890',
    internalId: 'INT-001',
    reviewedAt: '2024-12-25 15:00',
    reviewedBy: '王工',
    firstDetectedAt: '2024-12-20 14:25',
    lastDetectedAt: '2024-12-25 15:00',
    detectionCount: 1,
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
    historyId: 'hist-cnv-seg-002',
    taskId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    taskName: 'INT-004 全外显子分析',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    sampleId: 's4d5e6f7-a8b9-0123-defa-234567890123',
    internalId: 'INT-004',
    reviewedAt: '2024-12-28 10:00',
    reviewedBy: '李工',
    firstDetectedAt: '2024-12-26 08:30',
    lastDetectedAt: '2024-12-28 10:00',
    detectionCount: 1,
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

// ============ Mock CNV外显子历史检出数据 ============
const mockHistoryCNVExons: HistoryCNVExon[] = [
  {
    historyId: 'hist-cnv-exon-001',
    taskId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    taskName: 'INT-001 全外显子分析',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    sampleId: 's1a2b3c4-d5e6-7890-abcd-ef1234567890',
    internalId: 'INT-001',
    reviewedAt: '2024-12-25 10:30',
    reviewedBy: '王工',
    firstDetectedAt: '2024-12-20 14:25',
    lastDetectedAt: '2024-12-25 10:30',
    detectionCount: 1,
    gene: 'BRCA1',
    transcript: 'NM_007294.4',
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
    historyId: 'hist-cnv-exon-002',
    taskId: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    taskName: 'INT-005 DMD分析',
    pipeline: 'Panel-DMD',
    pipelineVersion: 'v1.0.0',
    sampleId: 's5e6f7a8-b9c0-1234-efab-345678901234',
    internalId: 'INT-005',
    reviewedAt: '2024-12-28 12:00',
    reviewedBy: '王工',
    firstDetectedAt: '2024-12-25 15:00',
    lastDetectedAt: '2024-12-28 12:00',
    detectionCount: 1,
    gene: 'DMD',
    transcript: 'NM_004006.3',
    exon: 'Exon 45-50',
    chromosome: 'chrX',
    startPosition: 31792164,
    endPosition: 31838705,
    type: 'Deletion',
    copyNumber: 0,
    ratio: 0.05,
    confidence: 0.98,
  },
];

// ============ Mock STR历史检出数据 ============
const mockHistorySTRs: HistorySTR[] = [
  {
    historyId: 'hist-str-001',
    taskId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
    taskName: 'INT-006 STR分析',
    pipeline: 'STR-Analysis',
    pipelineVersion: 'v1.0.0',
    sampleId: 's6f7a8b9-c0d1-2345-fabc-456789012345',
    internalId: 'INT-006',
    reviewedAt: '2024-12-26 10:30',
    reviewedBy: '王工',
    firstDetectedAt: '2024-12-23 11:00',
    lastDetectedAt: '2024-12-26 10:30',
    detectionCount: 1,
    gene: 'HTT',
    transcript: 'NM_002111.8',
    locus: '4p16.3',
    repeatUnit: 'CAG',
    repeatCount: 42,
    normalRangeMin: 10,
    normalRangeMax: 35,
    status: 'FullMutation',
  },
  {
    historyId: 'hist-str-002',
    taskId: 'a7b8c9d0-e1f2-3456-abcd-567890123456',
    taskName: 'INT-007 强直性肌营养不良分析',
    pipeline: 'STR-Analysis',
    pipelineVersion: 'v1.0.0',
    sampleId: 's7a8b9c0-d1e2-3456-abcd-567890123456',
    internalId: 'INT-007',
    reviewedAt: '2024-12-27 09:00',
    reviewedBy: '李工',
    firstDetectedAt: '2024-12-24 14:30',
    lastDetectedAt: '2024-12-27 09:00',
    detectionCount: 1,
    gene: 'DMPK',
    transcript: 'NM_001081563.2',
    locus: '19q13.32',
    repeatUnit: 'CTG',
    repeatCount: 65,
    normalRangeMin: 5,
    normalRangeMax: 37,
    status: 'Premutation',
  },
];

// ============ Mock MEI历史检出数据 ============
const mockHistoryMEIs: HistoryMEI[] = [
  {
    historyId: 'hist-mei-001',
    taskId: 'b8c9d0e1-f2a3-4567-bcde-678901234567',
    taskName: 'INT-008 全外显子分析',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    sampleId: 's8b9c0d1-e2f3-4567-bcde-678901234567',
    internalId: 'INT-008',
    reviewedAt: '2024-12-25 10:30',
    reviewedBy: '王工',
    firstDetectedAt: '2024-12-21 16:00',
    lastDetectedAt: '2024-12-25 10:30',
    detectionCount: 1,
    chromosome: 'chr11',
    position: 47623456,
    meiType: 'Alu',
    insertionType: 'insertion',
    strand: '-',
    length: 312,
    gene: 'LDLR',
    transcript: 'NM_000527.5',
    impact: 'exonic',
    zygosity: 'Heterozygous',
    supportingReads: 28,
    totalReads: 85,
    frequency: undefined,
    acmgClassification: 'Likely_Pathogenic',
  },
  {
    historyId: 'hist-mei-002',
    taskId: 'c9d0e1f2-a3b4-5678-cdef-789012345678',
    taskName: 'INT-009 DMD分析',
    pipeline: 'Panel-DMD',
    pipelineVersion: 'v1.0.0',
    sampleId: 's9c0d1e2-f3a4-5678-cdef-789012345678',
    internalId: 'INT-009',
    reviewedAt: '2024-12-26 11:00',
    reviewedBy: '李工',
    firstDetectedAt: '2024-12-22 12:30',
    lastDetectedAt: '2024-12-26 11:00',
    detectionCount: 1,
    chromosome: 'chrX',
    position: 153789012,
    meiType: 'SVA',
    insertionType: 'insertion',
    strand: '+',
    length: 1850,
    gene: 'DMD',
    transcript: 'NM_004006.3',
    impact: 'exonic',
    zygosity: 'Hemizygous',
    supportingReads: 42,
    totalReads: 95,
    acmgClassification: 'Pathogenic',
  },
];

// ============ Mock 线粒体变异历史检出数据 ============
const mockHistoryMTVariants: HistoryMTVariant[] = [
  {
    historyId: 'hist-mt-001',
    taskId: 'd0e1f2a3-b4c5-6789-defa-890123456789',
    taskName: 'INT-010 线粒体全基因组分析',
    pipeline: 'MT-Genome',
    pipelineVersion: 'v1.0.0',
    sampleId: 's0d1e2f3-a4b5-6789-defa-890123456789',
    internalId: 'INT-010',
    reviewedAt: '2024-12-25 10:30',
    reviewedBy: '王工',
    firstDetectedAt: '2024-12-20 09:00',
    lastDetectedAt: '2024-12-25 10:30',
    detectionCount: 1,
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
    historyId: 'hist-mt-002',
    taskId: 'd0e1f2a3-b4c5-6789-defa-890123456789',
    taskName: 'INT-010 线粒体全基因组分析',
    pipeline: 'MT-Genome',
    pipelineVersion: 'v1.0.0',
    sampleId: 's0d1e2f3-a4b5-6789-defa-890123456789',
    internalId: 'INT-010',
    reviewedAt: '2024-12-25 11:00',
    reviewedBy: '李工',
    firstDetectedAt: '2024-12-20 09:00',
    lastDetectedAt: '2024-12-25 11:00',
    detectionCount: 1,
    position: 8344,
    ref: 'A',
    alt: 'G',
    gene: 'MT-TK',
    heteroplasmy: 0.72,
    pathogenicity: 'Pathogenic',
    associatedDisease: 'MERRF综合征',
    haplogroup: 'H',
  },
];

// ============ Mock UPD历史检出数据 ============
const mockHistoryUPDRegions: HistoryUPDRegion[] = [
  {
    historyId: 'hist-upd-001',
    taskId: 'e1f2a3b4-c5d6-7890-efab-901234567890',
    taskName: 'INT-011 全外显子分析',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    sampleId: 's1e2f3a4-b5c6-7890-efab-901234567890',
    internalId: 'INT-011',
    reviewedAt: '2024-12-25 10:30',
    reviewedBy: '王工',
    firstDetectedAt: '2024-12-21 15:00',
    lastDetectedAt: '2024-12-25 10:30',
    detectionCount: 1,
    chromosome: 'chr15',
    startPosition: 22770421,
    endPosition: 28526904,
    length: 5756483,
    type: 'Isodisomy',
    genes: ['UBE3A', 'SNRPN', 'NDN'],
    parentOfOrigin: 'Maternal',
  },
];

// ============ 通用分页和筛选函数 ============
function applyFilterAndPagination<T extends { historyId: string }>(
  data: T[],
  filterState: KnowledgeTableFilterState,
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
        if (value === undefined || value === null) return false;
        if (Array.isArray(value)) {
          return value.some(v => String(v).toLowerCase().includes(query));
        }
        return String(value).toLowerCase().includes(query);
      })
    );
  }

  // 筛选
  Object.entries(filterState.filters).forEach(([key, value]) => {
    if (value && value.length > 0) {
      filtered = filtered.filter(item => {
        const itemValue = item[key as keyof T];
        if (itemValue === undefined || itemValue === null) return false;
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
      if (aVal instanceof Date && bVal instanceof Date) {
        return (aVal.getTime() - bVal.getTime()) * direction;
      }
      return String(aVal ?? '').localeCompare(String(bVal ?? '')) * direction;
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

// ============ 数据获取函数 ============

export async function getGroupedSNVIndels(
  filterState: KnowledgeTableFilterState
): Promise<PaginatedResult<GroupedSNVIndel>> {
  await new Promise(resolve => setTimeout(resolve, 150));

  // 先分组聚合
  let groupedData = groupSNVIndelRecords(mockSNVIndelRawRecords);

  // 搜索过滤
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    groupedData = groupedData.filter(item =>
      item.gene.toLowerCase().includes(query) ||
      item.hgvsc.toLowerCase().includes(query) ||
      item.hgvsp.toLowerCase().includes(query) ||
      item.records.some(r =>
        r.internalId.toLowerCase().includes(query) ||
        r.taskName.toLowerCase().includes(query)
      )
    );
  }

  // 排序
  if (filterState.sortColumn) {
    const direction = filterState.sortDirection === 'desc' ? -1 : 1;
    groupedData.sort((a, b) => {
      let cmp = 0;
      switch (filterState.sortColumn) {
        case 'gene':
          cmp = a.gene.localeCompare(b.gene);
          break;
        case 'hgvsc':
          cmp = a.hgvsc.localeCompare(b.hgvsc);
          break;
        case 'acmgClassification':
          cmp = a.acmgClassification.localeCompare(b.acmgClassification);
          break;
        case 'detectionCount':
          cmp = a.detectionCount - b.detectionCount;
          break;
        case 'firstDetectedAt':
          cmp = a.firstDetectedAt.localeCompare(b.firstDetectedAt);
          break;
        case 'lastDetectedAt':
          cmp = a.lastDetectedAt.localeCompare(b.lastDetectedAt);
          break;
        default:
          break;
      }
      return cmp * direction;
    });
  }

  // 分页
  const total = groupedData.length;
  const start = (filterState.page - 1) * filterState.pageSize;
  const paged = groupedData.slice(start, start + filterState.pageSize);

  return {
    data: paged,
    total,
    page: filterState.page,
    pageSize: filterState.pageSize,
  };
}

export async function getHistoryCNVSegments(
  filterState: KnowledgeTableFilterState
): Promise<PaginatedResult<HistoryCNVSegment>> {
  await new Promise(resolve => setTimeout(resolve, 150));
  return applyFilterAndPagination(
    mockHistoryCNVSegments,
    filterState,
    ['chromosome', 'genes', 'taskId', 'internalId', 'pipeline'],
    ['chromosome', 'startPosition', 'length', 'type', 'copyNumber', 'confidence', 'reviewedAt']
  );
}

export async function getHistoryCNVExons(
  filterState: KnowledgeTableFilterState
): Promise<PaginatedResult<HistoryCNVExon>> {
  await new Promise(resolve => setTimeout(resolve, 150));
  return applyFilterAndPagination(
    mockHistoryCNVExons,
    filterState,
    ['gene', 'exon', 'chromosome', 'taskId', 'internalId', 'pipeline'],
    ['gene', 'chromosome', 'startPosition', 'type', 'copyNumber', 'ratio', 'confidence', 'reviewedAt']
  );
}

export async function getHistorySTRs(
  filterState: KnowledgeTableFilterState
): Promise<PaginatedResult<HistorySTR>> {
  await new Promise(resolve => setTimeout(resolve, 150));
  return applyFilterAndPagination(
    mockHistorySTRs,
    filterState,
    ['gene', 'locus', 'taskId', 'internalId', 'pipeline'],
    ['gene', 'locus', 'repeatCount', 'status', 'reviewedAt']
  );
}

export async function getHistoryMEIs(
  filterState: KnowledgeTableFilterState
): Promise<PaginatedResult<HistoryMEI>> {
  await new Promise(resolve => setTimeout(resolve, 150));
  return applyFilterAndPagination(
    mockHistoryMEIs,
    filterState,
    ['gene', 'chromosome', 'meiType', 'taskId', 'internalId', 'pipeline'],
    ['gene', 'chromosome', 'position', 'meiType', 'length', 'zygosity', 'reviewedAt']
  );
}

export async function getHistoryMTVariants(
  filterState: KnowledgeTableFilterState
): Promise<PaginatedResult<HistoryMTVariant>> {
  await new Promise(resolve => setTimeout(resolve, 150));
  return applyFilterAndPagination(
    mockHistoryMTVariants,
    filterState,
    ['gene', 'associatedDisease', 'taskId', 'internalId', 'pipeline'],
    ['position', 'gene', 'heteroplasmy', 'pathogenicity', 'reviewedAt']
  );
}

export async function getHistoryUPDRegions(
  filterState: KnowledgeTableFilterState
): Promise<PaginatedResult<HistoryUPDRegion>> {
  await new Promise(resolve => setTimeout(resolve, 150));
  return applyFilterAndPagination(
    mockHistoryUPDRegions,
    filterState,
    ['chromosome', 'genes', 'taskId', 'internalId', 'pipeline'],
    ['chromosome', 'startPosition', 'length', 'type', 'reviewedAt']
  );
}