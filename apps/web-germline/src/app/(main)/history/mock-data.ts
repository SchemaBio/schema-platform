/**
 * Mock数据服务 - 历史检出统计
 */

import type {
  DetectionRecord,
  GroupedSNVIndel,
  GroupedCNVSegment,
  GroupedCNVExon,
  GroupedSTR,
  GroupedMEI,
  GroupedMTVariant,
  GroupedUPDRegion,
  HistoryTableFilterState,
  PaginatedResult,
  ACMGClassification,
  STRStatus,
  MEIType,
  MitochondrialPathogenicity,
  UPDType,
  ParentOfOrigin,
} from './types';

// ============ ACMG分类配置 ============
export const ACMG_CONFIG: Record<ACMGClassification, { label: string; variant: 'danger' | 'warning' | 'neutral' | 'info' | 'success' }> = {
  Pathogenic: { label: '致病', variant: 'danger' },
  Likely_Pathogenic: { label: '可能致病', variant: 'warning' },
  VUS: { label: '意义未明', variant: 'neutral' },
  Likely_Benign: { label: '可能良性', variant: 'info' },
  Benign: { label: '良性', variant: 'success' },
};

// ============ STR状态配置 ============
export const STR_STATUS_CONFIG: Record<STRStatus, { label: string; variant: 'danger' | 'warning' | 'success' }> = {
  FullMutation: { label: '全突变', variant: 'danger' },
  Premutation: { label: '前突变', variant: 'warning' },
  Normal: { label: '正常', variant: 'success' },
};

// ============ MEI类型配置 ============
export const MEI_TYPE_CONFIG: Record<MEIType, { label: string; variant: 'info' | 'warning' | 'neutral' }> = {
  LINE1: { label: 'LINE1', variant: 'info' },
  Alu: { label: 'Alu', variant: 'warning' },
  SVA: { label: 'SVA', variant: 'neutral' },
  Unknown: { label: '未知', variant: 'neutral' },
};

// ============ UPD类型配置 ============
export const UPD_TYPE_CONFIG: Record<UPDType, { label: string; variant: 'info' | 'warning' }> = {
  Isodisomy: { label: '同二体', variant: 'warning' },
  Heterodisomy: { label: '异二体', variant: 'info' },
};

// ============ 通用辅助函数 ============
function createDetectionRecord(
  prefix: string,
  index: number,
  taskId: string,
  taskName: string,
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
    taskName,
    pipeline,
    pipelineVersion,
    sampleId,
    internalId,
    reviewedAt,
    reviewedBy,
  };
}

// ============ SNP/InDel原始数据 ============
interface SNVIndelRawRecord {
  gene: string;
  hgvsc: string;
  hgvsp: string;
  transcript: string;
  acmgClassification: ACMGClassification;
  consequence: string;
  rsId?: string;
  clinvarId?: string;
  gnomadAF?: number;
  record: DetectionRecord;
}

const mockSNVIndelRawRecords: SNVIndelRawRecord[] = [
  // BRCA1 c.5266dupC - 检出3次
  { gene: 'BRCA1', hgvsc: 'c.5266dupC', hgvsp: 'p.Gln1756ProfsTer74', transcript: 'NM_007294.4', acmgClassification: 'Pathogenic', consequence: 'frameshift_variant', rsId: 'rs80357906', clinvarId: 'VCV000017661', gnomadAF: 0.00002, record: createDetectionRecord('snv', 1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INT-001 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's1a2b3c4-d5e6-7890-abcd-ef1234567890', 'INT-001', '2024-12-20 10:30', '王工') },
  { gene: 'BRCA1', hgvsc: 'c.5266dupC', hgvsp: 'p.Gln1756ProfsTer74', transcript: 'NM_007294.4', acmgClassification: 'Pathogenic', consequence: 'frameshift_variant', rsId: 'rs80357906', clinvarId: 'VCV000017661', gnomadAF: 0.00002, record: createDetectionRecord('snv', 2, 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'INT-002 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's2b3c4d5-e6f7-8901-bcde-f12345678901', 'INT-002', '2024-12-22 14:00', '李工') },
  { gene: 'BRCA1', hgvsc: 'c.5266dupC', hgvsp: 'p.Gln1756ProfsTer74', transcript: 'NM_007294.4', acmgClassification: 'Pathogenic', consequence: 'frameshift_variant', rsId: 'rs80357906', clinvarId: 'VCV000017661', gnomadAF: 0.00002, record: createDetectionRecord('snv', 3, 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'INT-003 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's3c4d5e6-f7a8-9012-cdef-123456789012', 'INT-003', '2024-12-25 09:30', '王工') },
  // TP53 c.743G>A - 检出2次
  { gene: 'TP53', hgvsc: 'c.743G>A', hgvsp: 'p.Arg248Gln', transcript: 'NM_000546.6', acmgClassification: 'Likely_Pathogenic', consequence: 'missense_variant', rsId: 'rs28934576', clinvarId: 'VCV000012356', gnomadAF: 0.000008, record: createDetectionRecord('snv', 4, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INT-001 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's1a2b3c4-d5e6-7890-abcd-ef1234567890', 'INT-001', '2024-12-20 11:00', '王工') },
  { gene: 'TP53', hgvsc: 'c.743G>A', hgvsp: 'p.Arg248Gln', transcript: 'NM_000546.6', acmgClassification: 'Likely_Pathogenic', consequence: 'missense_variant', rsId: 'rs28934576', clinvarId: 'VCV000012356', gnomadAF: 0.000008, record: createDetectionRecord('snv', 5, 'd4e5f6a7-b8c9-0123-defa-234567890123', 'INT-004 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's4d5e6f7-a8b9-0123-defa-234567890123', 'INT-004', '2024-12-26 15:00', '李工') },
  // CFTR c.1521_1523delCTT - 检出1次
  { gene: 'CFTR', hgvsc: 'c.1521_1523delCTT', hgvsp: 'p.Phe508del', transcript: 'NM_000492.4', acmgClassification: 'Pathogenic', consequence: 'inframe_deletion', rsId: 'rs113993960', clinvarId: 'VCV000007105', gnomadAF: 0.012, record: createDetectionRecord('snv', 6, 'e5f6a7b8-c9d0-1234-efab-345678901234', 'INT-005 囊性纤维化Panel', 'Panel-CFTR', 'v1.0.0', 's5e6f7a8-b9c0-1234-efab-345678901234', 'INT-005', '2024-12-24 10:00', '王工') },
  // MYH7 c.1208G>A - 检出1次
  { gene: 'MYH7', hgvsc: 'c.1208G>A', hgvsp: 'p.Arg403Gln', transcript: 'NM_000260.4', acmgClassification: 'Pathogenic', consequence: 'missense_variant', rsId: 'rs121913603', clinvarId: 'VCV000005566', gnomadAF: 0.00001, record: createDetectionRecord('snv', 7, 'f6a7b8c9-d0e1-2345-fabc-456789012345', 'INT-006 心血管Panel', 'Panel-Cardio', 'v2.0.1', 's6f7a8b9-c0d1-2345-fabc-456789012345', 'INT-006', '2024-12-27 14:30', '李工') },
  // LMNA c.622C>T - 检出2次
  { gene: 'LMNA', hgvsc: 'c.622C>T', hgvsp: 'p.Arg208Cys', transcript: 'NM_170707.4', acmgClassification: 'Likely_Pathogenic', consequence: 'missense_variant', rsId: 'rs137853966', clinvarId: 'VCV000002344', gnomadAF: 0.00005, record: createDetectionRecord('snv', 8, 'f6a7b8c9-d0e1-2345-fabc-456789012345', 'INT-006 心血管Panel', 'Panel-Cardio', 'v2.0.1', 's6f7a8b9-c0d1-2345-fabc-456789012345', 'INT-006', '2024-12-27 15:00', '王工') },
  { gene: 'LMNA', hgvsc: 'c.622C>T', hgvsp: 'p.Arg208Cys', transcript: 'NM_170707.4', acmgClassification: 'Likely_Pathogenic', consequence: 'missense_variant', rsId: 'rs137853966', clinvarId: 'VCV000002344', gnomadAF: 0.00005, record: createDetectionRecord('snv', 9, 'a7b8c9d0-e1f2-3456-abcd-567890123456', 'INT-007 心血管Panel', 'Panel-Cardio', 'v2.0.1', 's7a8b9c0-d1e2-3456-abcd-567890123456', 'INT-007', '2024-12-28 10:00', '李工') },
];

// ============ CNV片段原始数据 ============
interface CNVSegmentRawRecord {
  chromosome: string;
  startPosition: number;
  endPosition: number;
  length: number;
  type: 'Amplification' | 'Deletion';
  copyNumber: number;
  genes: string[];
  confidence: number;
  record: DetectionRecord;
}

const mockCNVSegmentRawRecords: CNVSegmentRawRecord[] = [
  // chr17 BRCA1缺失 - 检出2次
  { chromosome: 'chr17', startPosition: 43044295, endPosition: 43170245, length: 125950, type: 'Deletion', copyNumber: 1, genes: ['BRCA1'], confidence: 0.95, record: createDetectionRecord('cnvseg', 1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INT-001 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's1a2b3c4-d5e6-7890-abcd-ef1234567890', 'INT-001', '2024-12-20 15:00', '王工') },
  { chromosome: 'chr17', startPosition: 43044295, endPosition: 43170245, length: 125950, type: 'Deletion', copyNumber: 1, genes: ['BRCA1'], confidence: 0.95, record: createDetectionRecord('cnvseg', 2, 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'INT-002 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's2b3c4d5-e6f7-8901-bcde-f12345678901', 'INT-002', '2024-12-22 16:00', '李工') },
  // chr22 缺失 - 检出1次
  { chromosome: 'chr22', startPosition: 18844632, endPosition: 21465659, length: 2621027, type: 'Deletion', copyNumber: 1, genes: ['TBX1', 'COMT', 'DGCR8'], confidence: 0.92, record: createDetectionRecord('cnvseg', 3, 'd4e5f6a7-b8c9-0123-defa-234567890123', 'INT-004 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's4d5e6f7-a8b9-0123-defa-234567890123', 'INT-004', '2024-12-26 10:00', '王工') },
];

// ============ CNV外显子原始数据 ============
interface CNVExonRawRecord {
  gene: string;
  transcript: string;
  exon: string;
  chromosome: string;
  startPosition: number;
  endPosition: number;
  type: 'Amplification' | 'Deletion';
  copyNumber: number;
  ratio: number;
  confidence: number;
  record: DetectionRecord;
}

const mockCNVExonRawRecords: CNVExonRawRecord[] = [
  // BRCA1 Exon 11-13缺失 - 检出2次
  { gene: 'BRCA1', transcript: 'NM_007294.4', exon: 'Exon 11-13', chromosome: 'chr17', startPosition: 43091434, endPosition: 43104956, type: 'Deletion', copyNumber: 1, ratio: 0.52, confidence: 0.94, record: createDetectionRecord('cnvex', 1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INT-001 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's1a2b3c4-d5e6-7890-abcd-ef1234567890', 'INT-001', '2024-12-20 10:30', '王工') },
  { gene: 'BRCA1', transcript: 'NM_007294.4', exon: 'Exon 11-13', chromosome: 'chr17', startPosition: 43091434, endPosition: 43104956, type: 'Deletion', copyNumber: 1, ratio: 0.48, confidence: 0.92, record: createDetectionRecord('cnvex', 2, 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'INT-003 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's3c4d5e6-f7a8-9012-cdef-123456789012', 'INT-003', '2024-12-25 11:00', '李工') },
  // DMD Exon 45-50缺失 - 检出1次
  { gene: 'DMD', transcript: 'NM_004006.3', exon: 'Exon 45-50', chromosome: 'chrX', startPosition: 31792164, endPosition: 31838705, type: 'Deletion', copyNumber: 0, ratio: 0.05, confidence: 0.98, record: createDetectionRecord('cnvex', 3, 'e5f6a7b8-c9d0-1234-efab-345678901234', 'INT-005 DMD分析', 'Panel-DMD', 'v1.0.0', 's5e6f7a8-b9c0-1234-efab-345678901234', 'INT-005', '2024-12-28 12:00', '王工') },
  // EGFR Exon 18-21扩增 - 检出1次
  { gene: 'EGFR', transcript: 'NM_005228.5', exon: 'Exon 18-21', chromosome: 'chr7', startPosition: 55211070, endPosition: 55249071, type: 'Amplification', copyNumber: 5, ratio: 2.45, confidence: 0.91, record: createDetectionRecord('cnvex', 4, 'f6a7b8c9-d0e1-2345-fabc-456789012345', 'INT-006 肺癌Panel', 'Panel-Lung', 'v1.0.0', 's6f7a8b9-c0d1-2345-fabc-456789012345', 'INT-006', '2024-12-27 14:00', '李工') },
];

// ============ STR原始数据 ============
interface STRRawRecord {
  gene: string;
  transcript: string;
  locus: string;
  repeatUnit: string;
  repeatCount: number;
  normalRangeMin: number;
  normalRangeMax: number;
  status: STRStatus;
  record: DetectionRecord;
}

const mockSTRRawRecords: STRRawRecord[] = [
  // HTT CAG重复 - 检出2次
  { gene: 'HTT', transcript: 'NM_002111.8', locus: '4p16.3', repeatUnit: 'CAG', repeatCount: 42, normalRangeMin: 10, normalRangeMax: 35, status: 'FullMutation', record: createDetectionRecord('str', 1, 'f6a7b8c9-d0e1-2345-fabc-456789012345', 'INT-006 STR分析', 'STR-Analysis', 'v1.0.0', 's6f7a8b9-c0d1-2345-fabc-456789012345', 'INT-006', '2024-12-26 10:30', '王工') },
  { gene: 'HTT', transcript: 'NM_002111.8', locus: '4p16.3', repeatUnit: 'CAG', repeatCount: 45, normalRangeMin: 10, normalRangeMax: 35, status: 'FullMutation', record: createDetectionRecord('str', 2, 'a7b8c9d0-e1f2-3456-abcd-567890123456', 'INT-007 STR分析', 'STR-Analysis', 'v1.0.0', 's7a8b9c0-d1e2-3456-abcd-567890123456', 'INT-007', '2024-12-27 09:00', '李工') },
  // DMPK CTG重复 - 检出1次
  { gene: 'DMPK', transcript: 'NM_001081563.2', locus: '19q13.32', repeatUnit: 'CTG', repeatCount: 65, normalRangeMin: 5, normalRangeMax: 37, status: 'Premutation', record: createDetectionRecord('str', 3, 'b8c9d0e1-f2a3-4567-bcde-678901234567', 'INT-008 强直性肌营养不良分析', 'STR-Analysis', 'v1.0.0', 's8b9c0d1-e2f3-4567-bcde-678901234567', 'INT-008', '2024-12-24 14:30', '王工') },
  // FMR1 CGG重复 - 检出1次
  { gene: 'FMR1', transcript: 'NM_002024.6', locus: 'Xq27.3', repeatUnit: 'CGG', repeatCount: 85, normalRangeMin: 5, normalRangeMax: 44, status: 'Premutation', record: createDetectionRecord('str', 4, 'c9d0e1f2-a3b4-5678-cdef-789012345678', 'INT-009 脆性X综合征分析', 'STR-Analysis', 'v1.0.0', 's9c0d1e2-f3a4-5678-cdef-789012345678', 'INT-009', '2024-12-28 11:00', '李工') },
];

// ============ MEI原始数据 ============
interface MEIRawRecord {
  chromosome: string;
  position: number;
  gene: string;
  meiType: MEIType;
  strand: '+' | '-';
  length: number;
  impact?: string;
  acmgClassification?: ACMGClassification;
  record: DetectionRecord;
}

const mockMEIRawRecords: MEIRawRecord[] = [
  // LDLR Alu插入 - 检出2次
  { chromosome: 'chr11', position: 47623456, gene: 'LDLR', meiType: 'Alu', strand: '-', length: 312, impact: 'exonic', acmgClassification: 'Likely_Pathogenic', record: createDetectionRecord('mei', 1, 'd0e1f2a3-b4c5-6789-defa-890123456789', 'INT-010 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's0d1e2f3-a4b5-6789-defa-890123456789', 'INT-010', '2024-12-25 10:30', '王工') },
  { chromosome: 'chr11', position: 47623456, gene: 'LDLR', meiType: 'Alu', strand: '-', length: 312, impact: 'exonic', acmgClassification: 'Likely_Pathogenic', record: createDetectionRecord('mei', 2, 'e1f2a3b4-c5d6-7890-efab-901234567890', 'INT-011 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's1e2f3a4-b5c6-7890-efab-901234567890', 'INT-011', '2024-12-27 15:00', '李工') },
  // DMD SVA插入 - 检出1次
  { chromosome: 'chrX', position: 153789012, gene: 'DMD', meiType: 'SVA', strand: '+', length: 1850, impact: 'exonic', acmgClassification: 'Pathogenic', record: createDetectionRecord('mei', 3, 'f2a3b4c5-d6e7-8901-fabc-012345678901', 'INT-012 DMD分析', 'Panel-DMD', 'v1.0.0', 's2f3a4b5-c6d7-8901-fabc-012345678901', 'INT-012', '2024-12-26 11:00', '王工') },
  // TTN LINE1插入 - 检出1次
  { chromosome: 'chr2', position: 179623456, gene: 'TTN', meiType: 'LINE1', strand: '+', length: 6025, impact: 'intronic', acmgClassification: 'VUS', record: createDetectionRecord('mei', 4, 'a3b4c5d6-e7f8-9012-abcd-123456789012', 'INT-013 心肌病Panel', 'Panel-Cardio', 'v2.0.1', 's3a4b5c6-d7e8-9012-abcd-123456789012', 'INT-013', '2024-12-28 09:30', '李工') },
];

// ============ 线粒体变异原始数据 ============
interface MTRawRecord {
  position: number;
  ref: string;
  alt: string;
  gene: string;
  heteroplasmy: number;
  pathogenicity: MitochondrialPathogenicity;
  associatedDisease: string;
  haplogroup?: string;
  record: DetectionRecord;
}

const mockMTRawRecords: MTRawRecord[] = [
  // m.3243A>G - 检出2次
  { position: 3243, ref: 'A', alt: 'G', gene: 'MT-TL1', heteroplasmy: 0.35, pathogenicity: 'Pathogenic', associatedDisease: 'MELAS综合征', haplogroup: 'H', record: createDetectionRecord('mt', 1, 'b4c5d6e7-f8a9-0123-bcde-234567890123', 'INT-014 线粒体全基因组分析', 'MT-Genome', 'v1.0.0', 's4b5c6d7-e8f9-0123-bcde-234567890123', 'INT-014', '2024-12-25 10:30', '王工') },
  { position: 3243, ref: 'A', alt: 'G', gene: 'MT-TL1', heteroplasmy: 0.72, pathogenicity: 'Pathogenic', associatedDisease: 'MELAS综合征', haplogroup: 'H', record: createDetectionRecord('mt', 2, 'c5d6e7f8-a9b0-1234-cdef-345678901234', 'INT-015 线粒体全基因组分析', 'MT-Genome', 'v1.0.0', 's5c6d7e8-f9a0-1234-cdef-345678901234', 'INT-015', '2024-12-27 11:00', '李工') },
  // m.8344A>G - 检出1次
  { position: 8344, ref: 'A', alt: 'G', gene: 'MT-TK', heteroplasmy: 0.58, pathogenicity: 'Pathogenic', associatedDisease: 'MERRF综合征', haplogroup: 'H', record: createDetectionRecord('mt', 3, 'd6e7f8a9-b0c1-2345-defa-456789012345', 'INT-016 线粒体全基因组分析', 'MT-Genome', 'v1.0.0', 's6d7e8f9-a0b1-2345-defa-456789012345', 'INT-016', '2024-12-26 14:00', '王工') },
  // m.11778G>A - 检出1次
  { position: 11778, ref: 'G', alt: 'A', gene: 'MT-ND4', heteroplasmy: 0.95, pathogenicity: 'Pathogenic', associatedDisease: 'Leber遗传性视神经病变', haplogroup: 'J', record: createDetectionRecord('mt', 4, 'e7f8a9b0-c1d2-3456-efab-567890123456', 'INT-017 线粒体全基因组分析', 'MT-Genome', 'v1.0.0', 's7e8f9a0-b1c2-3456-efab-567890123456', 'INT-017', '2024-12-28 10:00', '李工') },
];

// ============ UPD原始数据 ============
interface UPDRawRecord {
  chromosome: string;
  startPosition: number;
  endPosition: number;
  length: number;
  type: UPDType;
  genes: string[];
  parentOfOrigin?: ParentOfOrigin;
  record: DetectionRecord;
}

const mockUPDRawRecords: UPDRawRecord[] = [
  // chr15 母源同二体 - 检出2次
  { chromosome: 'chr15', startPosition: 22770421, endPosition: 28526904, length: 5756483, type: 'Isodisomy', genes: ['UBE3A', 'SNRPN', 'NDN'], parentOfOrigin: 'Maternal', record: createDetectionRecord('upd', 1, 'f8a9b0c1-d2e3-4567-fabc-678901234567', 'INT-018 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's8f9a0b1-c2d3-4567-fabc-678901234567', 'INT-018', '2024-12-25 10:30', '王工') },
  { chromosome: 'chr15', startPosition: 22770421, endPosition: 28526904, length: 5756483, type: 'Isodisomy', genes: ['UBE3A', 'SNRPN', 'NDN'], parentOfOrigin: 'Maternal', record: createDetectionRecord('upd', 2, 'a9b0c1d2-e3f4-5678-abcd-789012345678', 'INT-019 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's9a0b1c2-d3e4-5678-abcd-789012345678', 'INT-019', '2024-12-27 14:00', '李工') },
  // chr11 父源异二体 - 检出1次
  { chromosome: 'chr11', startPosition: 1850000, endPosition: 2870000, length: 1020000, type: 'Heterodisomy', genes: ['IGF2', 'H19'], parentOfOrigin: 'Paternal', record: createDetectionRecord('upd', 3, 'b0c1d2e3-f4a5-6789-bcde-890123456789', 'INT-020 全外显子分析', 'WES-Germline-v1', 'v1.2.0', 's0b1c2d3-e4f5-6789-bcde-890123456789', 'INT-020', '2024-12-26 09:00', '王工') },
];

// ============ 分组聚合函数 ============
function groupRecords<T, G extends { groupId: string }>(
  records: T[],
  getKey: (record: T) => string,
  getRecord: (record: T) => DetectionRecord,
  mergeGroup: (group: Partial<G>, record: T) => void
): Map<string, { records: DetectionRecord[]; firstDetectedAt: string; lastDetectedAt: string; data: Partial<G> }> {
  const groups = new Map<string, { records: DetectionRecord[]; firstDetectedAt: string; lastDetectedAt: string; data: Partial<G> }>();

  records.forEach(record => {
    const key = getKey(record);
    const detectionRecord = getRecord(record);

    if (!groups.has(key)) {
      groups.set(key, {
        records: [],
        firstDetectedAt: detectionRecord.reviewedAt,
        lastDetectedAt: detectionRecord.reviewedAt,
        data: { groupId: key } as Partial<G>,
      });
    }

    const group = groups.get(key)!;
    group.records.push(detectionRecord);

    if (detectionRecord.reviewedAt < group.firstDetectedAt) {
      group.firstDetectedAt = detectionRecord.reviewedAt;
    }
    if (detectionRecord.reviewedAt > group.lastDetectedAt) {
      group.lastDetectedAt = detectionRecord.reviewedAt;
    }

    mergeGroup(group.data, record);
  });

  return groups;
}

// ============ 数据获取函数 ============

export async function getGroupedSNVIndels(
  filterState: HistoryTableFilterState
): Promise<PaginatedResult<GroupedSNVIndel>> {
  await new Promise(resolve => setTimeout(resolve, 150));

  const groups = groupRecords<SNVIndelRawRecord, GroupedSNVIndel>(
    mockSNVIndelRawRecords,
    (r) => `${r.gene}-${r.hgvsc}-${r.hgvsp}`,
    (r) => r.record,
    (group, r) => {
      group.gene = r.gene;
      group.hgvsc = r.hgvsc;
      group.hgvsp = r.hgvsp;
      group.transcript = r.transcript;
      group.acmgClassification = r.acmgClassification;
      group.consequence = r.consequence;
      group.rsId = r.rsId;
      group.clinvarId = r.clinvarId;
      group.gnomadAF = r.gnomadAF;
    }
  );

  let data = Array.from(groups.values()).map(g => ({
    ...g.data,
    detectionCount: g.records.length,
    firstDetectedAt: g.firstDetectedAt,
    lastDetectedAt: g.lastDetectedAt,
    records: g.records,
  } as GroupedSNVIndel));

  // 搜索过滤
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item =>
      item.gene.toLowerCase().includes(query) ||
      item.hgvsc.toLowerCase().includes(query) ||
      item.hgvsp.toLowerCase().includes(query) ||
      item.records.some(r => r.internalId.toLowerCase().includes(query))
    );
  }

  // 排序
  if (filterState.sortColumn) {
    const direction = filterState.sortDirection === 'desc' ? -1 : 1;
    data.sort((a, b) => {
      let cmp = 0;
      switch (filterState.sortColumn) {
        case 'gene': cmp = a.gene.localeCompare(b.gene); break;
        case 'hgvsc': cmp = a.hgvsc.localeCompare(b.hgvsc); break;
        case 'detectionCount': cmp = a.detectionCount - b.detectionCount; break;
        case 'firstDetectedAt': cmp = a.firstDetectedAt.localeCompare(b.firstDetectedAt); break;
        case 'lastDetectedAt': cmp = a.lastDetectedAt.localeCompare(b.lastDetectedAt); break;
      }
      return cmp * direction;
    });
  }

  const total = data.length;
  const start = (filterState.page - 1) * filterState.pageSize;
  const paged = data.slice(start, start + filterState.pageSize);

  return { data: paged, total, page: filterState.page, pageSize: filterState.pageSize };
}

export async function getGroupedCNVSegments(
  filterState: HistoryTableFilterState
): Promise<PaginatedResult<GroupedCNVSegment>> {
  await new Promise(resolve => setTimeout(resolve, 150));

  const groups = groupRecords<CNVSegmentRawRecord, GroupedCNVSegment>(
    mockCNVSegmentRawRecords,
    (r) => `${r.chromosome}-${r.startPosition}-${r.endPosition}-${r.type}`,
    (r) => r.record,
    (group, r) => {
      group.chromosome = r.chromosome;
      group.startPosition = r.startPosition;
      group.endPosition = r.endPosition;
      group.length = r.length;
      group.type = r.type;
      group.copyNumber = r.copyNumber;
      group.genes = r.genes;
      group.confidence = r.confidence;
    }
  );

  let data = Array.from(groups.values()).map(g => ({
    ...g.data,
    detectionCount: g.records.length,
    firstDetectedAt: g.firstDetectedAt,
    lastDetectedAt: g.lastDetectedAt,
    records: g.records,
  } as GroupedCNVSegment));

  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item =>
      item.chromosome.toLowerCase().includes(query) ||
      item.genes.some(g => g.toLowerCase().includes(query))
    );
  }

  const total = data.length;
  const start = (filterState.page - 1) * filterState.pageSize;
  const paged = data.slice(start, start + filterState.pageSize);

  return { data: paged, total, page: filterState.page, pageSize: filterState.pageSize };
}

export async function getGroupedCNVExons(
  filterState: HistoryTableFilterState
): Promise<PaginatedResult<GroupedCNVExon>> {
  await new Promise(resolve => setTimeout(resolve, 150));

  const groups = groupRecords<CNVExonRawRecord, GroupedCNVExon>(
    mockCNVExonRawRecords,
    (r) => `${r.gene}-${r.transcript}-${r.exon}-${r.type}`,
    (r) => r.record,
    (group, r) => {
      group.gene = r.gene;
      group.transcript = r.transcript;
      group.exon = r.exon;
      group.chromosome = r.chromosome;
      group.startPosition = r.startPosition;
      group.endPosition = r.endPosition;
      group.type = r.type;
      group.copyNumber = r.copyNumber;
      group.ratio = r.ratio;
      group.confidence = r.confidence;
    }
  );

  let data = Array.from(groups.values()).map(g => ({
    ...g.data,
    detectionCount: g.records.length,
    firstDetectedAt: g.firstDetectedAt,
    lastDetectedAt: g.lastDetectedAt,
    records: g.records,
  } as GroupedCNVExon));

  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item =>
      item.gene.toLowerCase().includes(query) ||
      item.exon.toLowerCase().includes(query)
    );
  }

  const total = data.length;
  const start = (filterState.page - 1) * filterState.pageSize;
  const paged = data.slice(start, start + filterState.pageSize);

  return { data: paged, total, page: filterState.page, pageSize: filterState.pageSize };
}

export async function getGroupedSTRs(
  filterState: HistoryTableFilterState
): Promise<PaginatedResult<GroupedSTR>> {
  await new Promise(resolve => setTimeout(resolve, 150));

  const groups = new Map<string, { records: DetectionRecord[]; firstDetectedAt: string; lastDetectedAt: string; minRepeatCount: number; maxRepeatCount: number; data: Partial<GroupedSTR> }>();

  mockSTRRawRecords.forEach(r => {
    const key = `${r.gene}-${r.locus}`;
    const detectionRecord = r.record;

    if (!groups.has(key)) {
      groups.set(key, {
        records: [],
        firstDetectedAt: detectionRecord.reviewedAt,
        lastDetectedAt: detectionRecord.reviewedAt,
        minRepeatCount: r.repeatCount,
        maxRepeatCount: r.repeatCount,
        data: {
          groupId: key,
          gene: r.gene,
          transcript: r.transcript,
          locus: r.locus,
          repeatUnit: r.repeatUnit,
          normalRangeMin: r.normalRangeMin,
          normalRangeMax: r.normalRangeMax,
          status: r.status,
        },
      });
    }

    const group = groups.get(key)!;
    group.records.push(detectionRecord);
    if (detectionRecord.reviewedAt < group.firstDetectedAt) group.firstDetectedAt = detectionRecord.reviewedAt;
    if (detectionRecord.reviewedAt > group.lastDetectedAt) group.lastDetectedAt = detectionRecord.reviewedAt;
    if (r.repeatCount < group.minRepeatCount) group.minRepeatCount = r.repeatCount;
    if (r.repeatCount > group.maxRepeatCount) group.maxRepeatCount = r.repeatCount;
  });

  let data = Array.from(groups.values()).map(g => ({
    ...g.data,
    minRepeatCount: g.minRepeatCount,
    maxRepeatCount: g.maxRepeatCount,
    detectionCount: g.records.length,
    firstDetectedAt: g.firstDetectedAt,
    lastDetectedAt: g.lastDetectedAt,
    records: g.records,
  } as GroupedSTR));

  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item =>
      item.gene.toLowerCase().includes(query) ||
      item.locus.toLowerCase().includes(query)
    );
  }

  const total = data.length;
  const start = (filterState.page - 1) * filterState.pageSize;
  const paged = data.slice(start, start + filterState.pageSize);

  return { data: paged, total, page: filterState.page, pageSize: filterState.pageSize };
}

export async function getGroupedMEIs(
  filterState: HistoryTableFilterState
): Promise<PaginatedResult<GroupedMEI>> {
  await new Promise(resolve => setTimeout(resolve, 150));

  const groups = groupRecords<MEIRawRecord, GroupedMEI>(
    mockMEIRawRecords,
    (r) => `${r.chromosome}-${r.position}-${r.gene}-${r.meiType}`,
    (r) => r.record,
    (group, r) => {
      group.chromosome = r.chromosome;
      group.position = r.position;
      group.gene = r.gene;
      group.meiType = r.meiType;
      group.strand = r.strand;
      group.length = r.length;
      group.impact = r.impact;
      group.acmgClassification = r.acmgClassification;
    }
  );

  let data = Array.from(groups.values()).map(g => ({
    ...g.data,
    detectionCount: g.records.length,
    firstDetectedAt: g.firstDetectedAt,
    lastDetectedAt: g.lastDetectedAt,
    records: g.records,
  } as GroupedMEI));

  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item =>
      item.gene.toLowerCase().includes(query) ||
      item.chromosome.toLowerCase().includes(query)
    );
  }

  const total = data.length;
  const start = (filterState.page - 1) * filterState.pageSize;
  const paged = data.slice(start, start + filterState.pageSize);

  return { data: paged, total, page: filterState.page, pageSize: filterState.pageSize };
}

export async function getGroupedMTVariants(
  filterState: HistoryTableFilterState
): Promise<PaginatedResult<GroupedMTVariant>> {
  await new Promise(resolve => setTimeout(resolve, 150));

  const groups = new Map<string, { records: DetectionRecord[]; firstDetectedAt: string; lastDetectedAt: string; minHeteroplasmy: number; maxHeteroplasmy: number; data: Partial<GroupedMTVariant> }>();

  mockMTRawRecords.forEach(r => {
    const key = `${r.position}-${r.ref}-${r.alt}`;
    const detectionRecord = r.record;

    if (!groups.has(key)) {
      groups.set(key, {
        records: [],
        firstDetectedAt: detectionRecord.reviewedAt,
        lastDetectedAt: detectionRecord.reviewedAt,
        minHeteroplasmy: r.heteroplasmy,
        maxHeteroplasmy: r.heteroplasmy,
        data: {
          groupId: key,
          position: r.position,
          ref: r.ref,
          alt: r.alt,
          gene: r.gene,
          pathogenicity: r.pathogenicity,
          associatedDisease: r.associatedDisease,
          haplogroup: r.haplogroup,
        },
      });
    }

    const group = groups.get(key)!;
    group.records.push(detectionRecord);
    if (detectionRecord.reviewedAt < group.firstDetectedAt) group.firstDetectedAt = detectionRecord.reviewedAt;
    if (detectionRecord.reviewedAt > group.lastDetectedAt) group.lastDetectedAt = detectionRecord.reviewedAt;
    if (r.heteroplasmy < group.minHeteroplasmy) group.minHeteroplasmy = r.heteroplasmy;
    if (r.heteroplasmy > group.maxHeteroplasmy) group.maxHeteroplasmy = r.heteroplasmy;
  });

  let data = Array.from(groups.values()).map(g => ({
    ...g.data,
    minHeteroplasmy: g.minHeteroplasmy,
    maxHeteroplasmy: g.maxHeteroplasmy,
    detectionCount: g.records.length,
    firstDetectedAt: g.firstDetectedAt,
    lastDetectedAt: g.lastDetectedAt,
    records: g.records,
  } as GroupedMTVariant));

  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item =>
      item.gene.toLowerCase().includes(query) ||
      item.associatedDisease.toLowerCase().includes(query)
    );
  }

  const total = data.length;
  const start = (filterState.page - 1) * filterState.pageSize;
  const paged = data.slice(start, start + filterState.pageSize);

  return { data: paged, total, page: filterState.page, pageSize: filterState.pageSize };
}

export async function getGroupedUPDRegions(
  filterState: HistoryTableFilterState
): Promise<PaginatedResult<GroupedUPDRegion>> {
  await new Promise(resolve => setTimeout(resolve, 150));

  const groups = groupRecords<UPDRawRecord, GroupedUPDRegion>(
    mockUPDRawRecords,
    (r) => `${r.chromosome}-${r.type}-${r.startPosition}-${r.endPosition}`,
    (r) => r.record,
    (group, r) => {
      group.chromosome = r.chromosome;
      group.startPosition = r.startPosition;
      group.endPosition = r.endPosition;
      group.length = r.length;
      group.type = r.type;
      group.genes = r.genes;
      group.parentOfOrigin = r.parentOfOrigin;
    }
  );

  let data = Array.from(groups.values()).map(g => ({
    ...g.data,
    detectionCount: g.records.length,
    firstDetectedAt: g.firstDetectedAt,
    lastDetectedAt: g.lastDetectedAt,
    records: g.records,
  } as GroupedUPDRegion));

  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item =>
      item.chromosome.toLowerCase().includes(query) ||
      item.genes.some(g => g.toLowerCase().includes(query))
    );
  }

  const total = data.length;
  const start = (filterState.page - 1) * filterState.pageSize;
  const paged = data.slice(start, start + filterState.pageSize);

  return { data: paged, total, page: filterState.page, pageSize: filterState.pageSize };
}