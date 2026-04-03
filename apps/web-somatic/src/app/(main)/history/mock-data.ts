/**
 * Mock数据服务 - 历史检出统计
 */

import type {
  DetectionRecord,
  GroupedSNVIndel,
  GroupedHotspot,
  GroupedCNVGene,
  GroupedCNVExon,
  GroupedCNVChrom,
  GroupedFusion,
  HistoryTableFilterState,
  PaginatedResult,
  TierClassification,
} from './types';

// ============ Tier分类配置 ============
export const TIER_CONFIG: Record<TierClassification, { label: string; variant: 'danger' | 'warning' | 'info' | 'neutral' }> = {
  'Tier I': { label: 'Tier I', variant: 'danger' },
  'Tier II': { label: 'Tier II', variant: 'warning' },
  'Tier III': { label: 'Tier III', variant: 'info' },
  'Tier IV': { label: 'Tier IV', variant: 'neutral' },
  'Unknown': { label: '未知', variant: 'neutral' },
};

// ============ CNV类型配置 ============
export const CNV_TYPE_CONFIG = {
  Amplification: { label: '扩增', variant: 'danger' as const },
  Deletion: { label: '缺失', variant: 'warning' as const },
};

// ============ 通用辅助函数 ============
function createDetectionRecord(
  prefix: string,
  index: number,
  taskId: string,
  pipeline: string,
  pipelineVersion: string,
  sampleId: string,
  internalId: string,
  reviewedAt: string,
  reviewedBy: string
): DetectionRecord {
  return {
    recordId: `${prefix}-${index}`,
    taskId,
    taskName: `${internalId} 分析`,
    pipeline,
    pipelineVersion,
    sampleId,
    internalId,
    reviewedAt,
    reviewedBy,
  };
}

// ============ SNV/InDel Mock数据 ============
export async function getGroupedSNVIndels(
  filterState: HistoryTableFilterState
): Promise<PaginatedResult<GroupedSNVIndel>> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));

  const allRecords: GroupedSNVIndel[] = [
    // EGFR L858R - 检出3次
    {
      groupId: 'snv-egfr-l858r',
      gene: 'EGFR',
      hgvsc: 'c.2573T>G',
      hgvsp: 'p.Leu858Arg',
      transcript: 'NM_005228.5',
      clinicalSignificance: 'Tier I',
      consequence: 'missense_variant',
      alleleFrequency: 0.35,
      rsId: 'rs121434568',
      clinvarId: 'VCV000018195',
      gnomadAF: 0.00001,
      detectionCount: 3,
      firstDetectedAt: '2024-12-01',
      lastDetectedAt: '2024-12-20',
      records: [
        createDetectionRecord('snv', 1, 'task-001', '单样本分析', 'v1.2.0', 'sample-001', 'INT-001', '2024-12-01 10:30', '王工'),
        createDetectionRecord('snv', 2, 'task-002', '配对样本分析', 'v2.0.1', 'sample-002', 'INT-002', '2024-12-10 14:00', '李工'),
        createDetectionRecord('snv', 3, 'task-003', '单样本分析', 'v1.2.0', 'sample-003', 'INT-003', '2024-12-20 09:30', '王工'),
      ],
    },
    // KRAS G12C - 检出2次
    {
      groupId: 'snv-kras-g12c',
      gene: 'KRAS',
      hgvsc: 'c.34G>T',
      hgvsp: 'p.Gly12Cys',
      transcript: 'NM_004985.5',
      clinicalSignificance: 'Tier I',
      consequence: 'missense_variant',
      alleleFrequency: 0.28,
      rsId: 'rs121913529',
      clinvarId: 'VCV000012617',
      gnomadAF: 0.00003,
      detectionCount: 2,
      firstDetectedAt: '2024-12-05',
      lastDetectedAt: '2024-12-15',
      records: [
        createDetectionRecord('snv', 4, 'task-004', '肿瘤Panel分析', 'v1.5.0', 'sample-004', 'INT-004', '2024-12-05 11:00', '李工'),
        createDetectionRecord('snv', 5, 'task-005', '单样本分析', 'v1.2.0', 'sample-005', 'INT-005', '2024-12-15 15:30', '王工'),
      ],
    },
    // TP53 R273H - 检出1次
    {
      groupId: 'snv-tp53-r273h',
      gene: 'TP53',
      hgvsc: 'c.818G>A',
      hgvsp: 'p.Arg273His',
      transcript: 'NM_000546.6',
      clinicalSignificance: 'Tier II',
      consequence: 'missense_variant',
      alleleFrequency: 0.42,
      rsId: 'rs28934578',
      clinvarId: 'VCV000013986',
      gnomadAF: 0.00005,
      detectionCount: 1,
      firstDetectedAt: '2024-12-12',
      lastDetectedAt: '2024-12-12',
      records: [
        createDetectionRecord('snv', 6, 'task-006', '配对样本分析', 'v2.0.1', 'sample-006', 'INT-006', '2024-12-12 10:00', '李工'),
      ],
    },
  ];

  // 应用搜索筛选
  let filtered = allRecords;
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    filtered = allRecords.filter(item =>
      item.gene.toLowerCase().includes(query) ||
      item.hgvsc.toLowerCase().includes(query) ||
      item.hgvsp.toLowerCase().includes(query)
    );
  }

  return {
    data: filtered.slice((filterState.page - 1) * filterState.pageSize, filterState.page * filterState.pageSize),
    total: filtered.length,
    page: filterState.page,
    pageSize: filterState.pageSize,
  };
}

// ============ Hotspot Mock数据 ============
export async function getGroupedHotspots(
  filterState: HistoryTableFilterState
): Promise<PaginatedResult<GroupedHotspot>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const allRecords: GroupedHotspot[] = [
    {
      groupId: 'hotspot-egfr-19del',
      gene: 'EGFR',
      mutation: '19-del',
      transcript: 'NM_005228.5',
      clinicalSignificance: 'Tier I',
      alleleFrequency: 0.38,
      detectionCount: 2,
      firstDetectedAt: '2024-12-03',
      lastDetectedAt: '2024-12-18',
      records: [
        createDetectionRecord('hotspot', 1, 'task-007', '单样本分析', 'v1.2.0', 'sample-007', 'INT-007', '2024-12-03 09:00', '王工'),
        createDetectionRecord('hotspot', 2, 'task-008', '肿瘤Panel分析', 'v1.5.0', 'sample-008', 'INT-008', '2024-12-18 14:30', '李工'),
      ],
    },
    {
      groupId: 'hotspot-braf-v600e',
      gene: 'BRAF',
      mutation: 'V600E',
      transcript: 'NM_004333.6',
      clinicalSignificance: 'Tier I',
      alleleFrequency: 0.45,
      detectionCount: 1,
      firstDetectedAt: '2024-12-08',
      lastDetectedAt: '2024-12-08',
      records: [
        createDetectionRecord('hotspot', 3, 'task-009', '单样本分析', 'v1.2.0', 'sample-009', 'INT-009', '2024-12-08 11:00', '王工'),
      ],
    },
  ];

  let filtered = allRecords;
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    filtered = allRecords.filter(item =>
      item.gene.toLowerCase().includes(query) ||
      item.mutation.toLowerCase().includes(query)
    );
  }

  return {
    data: filtered.slice((filterState.page - 1) * filterState.pageSize, filterState.page * filterState.pageSize),
    total: filtered.length,
    page: filterState.page,
    pageSize: filterState.pageSize,
  };
}

// ============ CNV Gene Mock数据 ============
export async function getGroupedCNVGenes(
  filterState: HistoryTableFilterState
): Promise<PaginatedResult<GroupedCNVGene>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const allRecords: GroupedCNVGene[] = [
    {
      groupId: 'cnv-gene-met-amp',
      gene: 'MET',
      type: 'Amplification',
      copyNumber: 12.5,
      confidence: 0.95,
      detectionCount: 2,
      firstDetectedAt: '2024-12-02',
      lastDetectedAt: '2024-12-22',
      records: [
        createDetectionRecord('cnv-gene', 1, 'task-010', '配对样本分析', 'v2.0.1', 'sample-010', 'INT-010', '2024-12-02 10:00', '李工'),
        createDetectionRecord('cnv-gene', 2, 'task-011', '配对样本分析', 'v2.0.1', 'sample-011', 'INT-011', '2024-12-22 15:00', '王工'),
      ],
    },
    {
      groupId: 'cnv-gene-erbb2-amp',
      gene: 'ERBB2',
      type: 'Amplification',
      copyNumber: 8.3,
      confidence: 0.92,
      detectionCount: 1,
      firstDetectedAt: '2024-12-10',
      lastDetectedAt: '2024-12-10',
      records: [
        createDetectionRecord('cnv-gene', 3, 'task-012', '单样本分析', 'v1.2.0', 'sample-012', 'INT-012', '2024-12-10 09:30', '李工'),
      ],
    },
    {
      groupId: 'cnv-gene-cdkn2a-del',
      gene: 'CDKN2A',
      type: 'Deletion',
      copyNumber: 0.8,
      confidence: 0.88,
      detectionCount: 1,
      firstDetectedAt: '2024-12-15',
      lastDetectedAt: '2024-12-15',
      records: [
        createDetectionRecord('cnv-gene', 4, 'task-013', '配对样本分析', 'v2.0.1', 'sample-013', 'INT-013', '2024-12-15 14:00', '王工'),
      ],
    },
  ];

  let filtered = allRecords;
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    filtered = allRecords.filter(item =>
      item.gene.toLowerCase().includes(query)
    );
  }

  return {
    data: filtered.slice((filterState.page - 1) * filterState.pageSize, filterState.page * filterState.pageSize),
    total: filtered.length,
    page: filterState.page,
    pageSize: filterState.pageSize,
  };
}

// ============ CNV Exon Mock数据 ============
export async function getGroupedCNVExons(
  filterState: HistoryTableFilterState
): Promise<PaginatedResult<GroupedCNVExon>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const allRecords: GroupedCNVExon[] = [
    {
      groupId: 'cnv-exon-met-ex14',
      gene: 'MET',
      transcript: 'NM_001127208.3',
      exon: '14',
      type: 'Deletion',
      copyNumber: 1.2,
      ratio: 0.35,
      confidence: 0.90,
      detectionCount: 1,
      firstDetectedAt: '2024-12-05',
      lastDetectedAt: '2024-12-05',
      records: [
        createDetectionRecord('cnv-exon', 1, 'task-014', '配对样本分析', 'v2.0.1', 'sample-014', 'INT-014', '2024-12-05 11:00', '李工'),
      ],
    },
  ];

  let filtered = allRecords;
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    filtered = allRecords.filter(item =>
      item.gene.toLowerCase().includes(query)
    );
  }

  return {
    data: filtered.slice((filterState.page - 1) * filterState.pageSize, filterState.page * filterState.pageSize),
    total: filtered.length,
    page: filterState.page,
    pageSize: filterState.pageSize,
  };
}

// ============ CNV Chromosome Mock数据 ============
export async function getGroupedCNVChroms(
  filterState: HistoryTableFilterState
): Promise<PaginatedResult<GroupedCNVChrom>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const allRecords: GroupedCNVChrom[] = [
    {
      groupId: 'cnv-chrom-7p11-amp',
      chromosome: '7',
      startPosition: 55000000,
      endPosition: 56000000,
      length: 1000000,
      type: 'Amplification',
      genes: ['EGFR'],
      confidence: 0.95,
      detectionCount: 1,
      firstDetectedAt: '2024-12-08',
      lastDetectedAt: '2024-12-08',
      records: [
        createDetectionRecord('cnv-chrom', 1, 'task-015', '配对样本分析', 'v2.0.1', 'sample-015', 'INT-015', '2024-12-08 10:30', '王工'),
      ],
    },
  ];

  let filtered = allRecords;
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    filtered = allRecords.filter(item =>
      item.chromosome.includes(query) ||
      item.genes.some(g => g.toLowerCase().includes(query))
    );
  }

  return {
    data: filtered.slice((filterState.page - 1) * filterState.pageSize, filterState.page * filterState.pageSize),
    total: filtered.length,
    page: filterState.page,
    pageSize: filterState.pageSize,
  };
}

// ============ Fusion Mock数据 ============
export async function getGroupedFusions(
  filterState: HistoryTableFilterState
): Promise<PaginatedResult<GroupedFusion>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const allRecords: GroupedFusion[] = [
    {
      groupId: 'fusion-alk-eml4',
      geneA: 'EML4',
      geneB: 'ALK',
      fusionTranscript: 'EML4-ALK E13:A20',
      clinicalSignificance: 'Tier I',
      supportingReads: 156,
      detectionCount: 2,
      firstDetectedAt: '2024-12-01',
      lastDetectedAt: '2024-12-20',
      records: [
        createDetectionRecord('fusion', 1, 'task-016', 'RNA融合分析', 'v1.2.0', 'sample-016', 'INT-016', '2024-12-01 14:00', '李工'),
        createDetectionRecord('fusion', 2, 'task-017', 'RNA融合分析', 'v1.2.0', 'sample-017', 'INT-017', '2024-12-20 09:00', '王工'),
      ],
    },
    {
      groupId: 'fusion-ros1-sdc4',
      geneA: 'SDC4',
      geneB: 'ROS1',
      fusionTranscript: 'SDC4-ROS1',
      clinicalSignificance: 'Tier I',
      supportingReads: 89,
      detectionCount: 1,
      firstDetectedAt: '2024-12-12',
      lastDetectedAt: '2024-12-12',
      records: [
        createDetectionRecord('fusion', 3, 'task-018', 'RNA融合分析', 'v1.2.0', 'sample-018', 'INT-018', '2024-12-12 15:30', '李工'),
      ],
    },
  ];

  let filtered = allRecords;
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    filtered = allRecords.filter(item =>
      item.geneA.toLowerCase().includes(query) ||
      item.geneB.toLowerCase().includes(query) ||
      item.fusionTranscript.toLowerCase().includes(query)
    );
  }

  return {
    data: filtered.slice((filterState.page - 1) * filterState.pageSize, filterState.page * filterState.pageSize),
    total: filtered.length,
    page: filterState.page,
    pageSize: filterState.pageSize,
  };
}