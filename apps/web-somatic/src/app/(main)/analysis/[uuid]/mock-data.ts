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
    name: 'S2024120001',
    sampleId: 'S2024120001',
    sampleName: '张**',
    pipeline: '单样本分析',
    pipelineVersion: 'v1.2.0',
    status: 'completed',
    createdAt: '2024-12-20 10:30',
    createdBy: '王工',
    completedAt: '2024-12-20 14:25',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    name: 'S2024120001',
    sampleId: 'S2024120001',
    sampleName: '张**',
    pipeline: 'RNA融合分析',
    pipelineVersion: 'v1.2.0',
    status: 'pending_interpretation',
    createdAt: '2024-12-25 09:00',
    createdBy: '李工',
    completedAt: '2024-12-25 13:15',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    name: 'S2024120002',
    sampleId: 'S2024120002',
    sampleName: '李**',
    pipeline: '配对样本分析',
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
    gcRatio: 0.48,
    uniformity: 0.95,
    dedupDepth: 132.4,
    captureEfficiency: 0.72,
    predictedGender: 'Male',
    contaminationRate: 0.005,
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
    gcRatio: 0.52,
    uniformity: 0.92,
    dedupDepth: 123.4,
    captureEfficiency: 0.68,
    predictedGender: 'Male',
    contaminationRate: 0.008,
  },
};

// ============ Mock SNV/Indel数据 (NCCL规范) ============
const mockSNVIndels: SNVIndel[] = [
  {
    id: 'snv-001',
    gene: 'EGFR',
    chromosome: '7',
    position: 55259515,
    start: 55259515,
    end: 55259515,
    ref: 'T',
    alt: 'G',
    variantType: 'SNV',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.35,
    depth: 1250,
    altReads: 438,
    dedupDepth: 1100,
    dedupAltReads: 385,
    dedupVAF: 0.35,
    acmgClassification: 'Pathogenic',
    clinicalSignificance: 'Tier I',
    transcript: 'NM_005228.5',
    hgvsc: 'c.2573T>G',
    hgvsp: 'p.L858R',
    consequence: 'Missense_substitution',
    affectedExon: '21/28',
    rsId: 'rs121434568',
    clinvarId: 'VCV000016610',
    clinvarSignificance: 'Pathogenic',
    gnomadAF: 0.000001,
    caddScore: 29.8,
    revelScore: 0.94,
    intervarClassification: 'Pathogenic',
    alphaMissenseScore: 0.98,
    alphaMissensePrediction: 'Pathogenic',
    maverickScore: 0.92,
    maverickPrediction: 'Deleterious',
    acmgCriteria: ['PS1', 'PM1', 'PM2', 'PP3', 'PP5'],
    pubmedIds: ['15118073', '15329413'],
    diseaseAssociation: '非小细胞肺癌',
    reviewed: true,
    reported: true,
    reviewedBy: '王工',
    reviewedAt: '2024-12-25 10:30',
    reportedBy: '李工',
    reportedAt: '2024-12-25 14:00',
  },
  {
    id: 'snv-002',
    gene: 'EGFR',
    chromosome: '7',
    position: 55249071,
    start: 55249071,
    end: 55249071,
    ref: 'C',
    alt: 'T',
    variantType: 'SNV',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.2312,
    depth: 980,
    acmgClassification: 'Pathogenic',
    clinicalSignificance: 'Tier I',
    transcript: 'NM_005228.5',
    hgvsc: 'c.2369C>T',
    hgvsp: 'p.T790M',
    consequence: 'Missense_substitution',
    affectedExon: '19/28',
    rsId: 'rs121434569',
    clinvarId: 'VCV000016609',
    clinvarSignificance: 'Pathogenic',
    gnomadAF: 0.000001,
    caddScore: 29.5,
    revelScore: 0.92,
    acmgCriteria: ['PS1', 'PM1', 'PM2', 'PP3', 'PP5'],
    pubmedIds: ['15737014', '25923549'],
    diseaseAssociation: '非小细胞肺癌(耐药)',
    reviewed: true,
    reported: false,
    reviewedBy: '王工',
    reviewedAt: '2024-12-25 11:00',
  },
  {
    id: 'snv-003',
    gene: 'EGFR',
    chromosome: '7',
    position: 55242467,
    start: 55242467,
    end: 55242484,
    ref: 'AATTAAGAGAAGCAACAT',
    alt: '-',
    variantType: 'Deletion',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.2312,
    depth: 1100,
    acmgClassification: 'Pathogenic',
    clinicalSignificance: 'Tier I',
    transcript: 'NM_005228.5',
    hgvsc: 'c.2237_2254del18',
    hgvsp: 'p.E746_S752delinsA',
    consequence: 'Inframe_deletion',
    affectedExon: '19/28',
    clinvarId: 'VCV000016608',
    clinvarSignificance: 'Pathogenic',
    gnomadAF: 0.000001,
    caddScore: 28.5,
    acmgCriteria: ['PS1', 'PM1', 'PM2', 'PP5'],
    pubmedIds: ['15118073'],
    diseaseAssociation: '非小细胞肺癌',
    reviewed: false,
    reported: false,
  },
  {
    id: 'snv-004',
    gene: 'EGFR',
    chromosome: '7',
    position: 55249010,
    start: 55249010,
    end: -1,
    ref: '-',
    alt: 'GTT',
    variantType: 'Insertion',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.18,
    depth: 920,
    acmgClassification: 'Pathogenic',
    clinicalSignificance: 'Tier I',
    transcript: 'NM_005228.5',
    hgvsc: 'c.2308_2309insGTT',
    hgvsp: 'p.D770delinsGY',
    consequence: 'Inframe_insertion',
    affectedExon: '20/28',
    clinvarId: 'VCV000376288',
    clinvarSignificance: 'Pathogenic',
    gnomadAF: 0.000001,
    caddScore: 26.8,
    acmgCriteria: ['PS1', 'PM1', 'PM2'],
    pubmedIds: ['23371856'],
    diseaseAssociation: '非小细胞肺癌(耐药)',
    reviewed: false,
    reported: false,
  },
  {
    id: 'snv-005',
    gene: 'KRAS',
    chromosome: '12',
    position: 25398284,
    start: 25398284,
    end: 25398284,
    ref: 'G',
    alt: 'A',
    variantType: 'SNV',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.28,
    depth: 1560,
    acmgClassification: 'Pathogenic',
    clinicalSignificance: 'Tier I',
    transcript: 'NM_004985.5',
    hgvsc: 'c.35G>A',
    hgvsp: 'p.G12D',
    consequence: 'Missense_substitution',
    affectedExon: '2/6',
    rsId: 'rs121913529',
    clinvarId: 'VCV000012582',
    clinvarSignificance: 'Pathogenic',
    gnomadAF: 0.000002,
    caddScore: 27.5,
    revelScore: 0.88,
    acmgCriteria: ['PS1', 'PM1', 'PM2', 'PP3', 'PP5'],
    pubmedIds: ['23288408'],
    diseaseAssociation: '胰腺癌/结直肠癌/非小细胞肺癌',
    reviewed: false,
    reported: false,
  },
  {
    id: 'snv-006',
    gene: 'BRAF',
    chromosome: '7',
    position: 140453136,
    start: 140453136,
    end: 140453136,
    ref: 'A',
    alt: 'T',
    variantType: 'SNV',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.42,
    depth: 890,
    acmgClassification: 'Pathogenic',
    clinicalSignificance: 'Tier I',
    transcript: 'NM_004333.6',
    hgvsc: 'c.1799T>A',
    hgvsp: 'p.V600E',
    consequence: 'Missense_substitution',
    affectedExon: '15/18',
    rsId: 'rs113488022',
    clinvarId: 'VCV000013961',
    clinvarSignificance: 'Pathogenic',
    gnomadAF: 0.000001,
    caddScore: 33.0,
    revelScore: 0.96,
    acmgCriteria: ['PS1', 'PM1', 'PM2', 'PP3', 'PP5'],
    pubmedIds: ['12068308', '20818844'],
    diseaseAssociation: '黑色素瘤/结直肠癌/非小细胞肺癌',
    reviewed: false,
    reported: false,
  },
  {
    id: 'snv-007',
    gene: 'PIK3CA',
    chromosome: '3',
    position: 178952085,
    start: 178952085,
    end: 178952085,
    ref: 'A',
    alt: 'G',
    variantType: 'SNV',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.18,
    depth: 1120,
    acmgClassification: 'Pathogenic',
    clinicalSignificance: 'Tier I',
    transcript: 'NM_006218.4',
    hgvsc: 'c.3140A>G',
    hgvsp: 'p.H1047R',
    consequence: 'Missense_substitution',
    affectedExon: '21/21',
    rsId: 'rs121913279',
    clinvarId: 'VCV000017690',
    clinvarSignificance: 'Pathogenic',
    gnomadAF: 0.000001,
    caddScore: 28.2,
    revelScore: 0.91,
    acmgCriteria: ['PS1', 'PM1', 'PM2', 'PP3', 'PP5'],
    pubmedIds: ['15016963', '31091374'],
    diseaseAssociation: '乳腺癌',
    reviewed: false,
    reported: false,
  },
  {
    id: 'snv-008',
    gene: 'TP53',
    chromosome: '17',
    position: 7577538,
    start: 7577538,
    end: 7577538,
    ref: 'C',
    alt: 'T',
    variantType: 'SNV',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.48,
    depth: 950,
    acmgClassification: 'Pathogenic',
    clinicalSignificance: 'Tier II',
    transcript: 'NM_000546.6',
    hgvsc: 'c.743G>A',
    hgvsp: 'p.R248Q',
    consequence: 'Missense_substitution',
    affectedExon: '7/11',
    rsId: 'rs28934576',
    clinvarId: 'VCV000012356',
    clinvarSignificance: 'Pathogenic',
    gnomadAF: 0.000008,
    caddScore: 32.0,
    revelScore: 0.89,
    acmgCriteria: ['PS1', 'PM1', 'PM2', 'PP3'],
    pubmedIds: ['19454582', '25741868'],
    diseaseAssociation: '多种实体瘤',
    reviewed: false,
    reported: false,
  },
  {
    id: 'snv-009',
    gene: 'PAX5',
    chromosome: '9',
    position: 36923458,
    start: 36923458,
    end: 36923459,
    ref: 'GG',
    alt: 'AT',
    variantType: 'Complex',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.2312,
    depth: 850,
    acmgClassification: 'Likely_Pathogenic',
    clinicalSignificance: 'Tier II',
    transcript: 'NM_016734.3',
    hgvsc: 'c.803_804delinsTA',
    hgvsp: 'p.A268D',
    consequence: 'Missense_substitution',
    affectedExon: '7/10',
    clinvarSignificance: 'Likely pathogenic',
    gnomadAF: 0.000001,
    caddScore: 25.5,
    acmgCriteria: ['PM1', 'PM2', 'PP3'],
    diseaseAssociation: 'B细胞急性淋巴细胞白血病',
    reviewed: false,
    reported: false,
  },
  {
    id: 'snv-010',
    gene: 'ALK',
    chromosome: '2',
    position: 29443695,
    start: 29443695,
    end: 29443695,
    ref: 'G',
    alt: 'A',
    variantType: 'SNV',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.15,
    depth: 780,
    acmgClassification: 'VUS',
    clinicalSignificance: 'Tier III',
    transcript: 'NM_004304.5',
    hgvsc: 'c.3522C>T',
    hgvsp: 'p.F1174L',
    consequence: 'Missense_substitution',
    affectedExon: '23/29',
    gnomadAF: 0.00001,
    caddScore: 24.8,
    revelScore: 0.72,
    acmgCriteria: ['PM2', 'PP3'],
    diseaseAssociation: '神经母细胞瘤/非小细胞肺癌',
    reviewed: false,
    reported: false,
  },
  {
    id: 'snv-011',
    gene: 'BRCA1',
    chromosome: '17',
    position: 43094464,
    start: 43094464,
    end: 43094464,
    ref: 'G',
    alt: 'A',
    variantType: 'SNV',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.32,
    depth: 650,
    acmgClassification: 'VUS',
    clinicalSignificance: 'Tier III',
    transcript: 'NM_007294.4',
    hgvsc: 'c.4357+10G>A',
    hgvsp: '-',
    consequence: 'Splice_region_variant',
    affectedExon: 'Intron 13',
    gnomadAF: 0.0001,
    caddScore: 18.5,
    acmgCriteria: ['PM2', 'BP4'],
    diseaseAssociation: '遗传性乳腺癌/卵巢癌',
    reviewed: false,
    reported: false,
  },
  {
    id: 'snv-012',
    gene: 'TP53',
    chromosome: '17',
    position: 7579312,
    start: 7579312,
    end: 7579312,
    ref: 'C',
    alt: 'T',
    variantType: 'SNV',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.18,
    depth: 520,
    acmgClassification: 'VUS',
    clinicalSignificance: 'Tier III',
    transcript: 'NM_000546.6',
    hgvsc: 'c.-28C>T',
    hgvsp: '-',
    consequence: '5_prime_UTR_variant',
    affectedExon: "5'UTR",
    gnomadAF: 0.00005,
    caddScore: 12.3,
    acmgCriteria: ['PM2'],
    diseaseAssociation: '多种实体瘤',
    reviewed: false,
    reported: false,
  },
  {
    id: 'snv-013',
    gene: 'EGFR',
    chromosome: '7',
    position: 55087058,
    start: 55087058,
    end: 55087058,
    ref: 'A',
    alt: 'G',
    variantType: 'SNV',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.22,
    depth: 480,
    acmgClassification: 'VUS',
    clinicalSignificance: 'Tier III',
    transcript: 'NM_005228.5',
    hgvsc: 'c.*15A>G',
    hgvsp: '-',
    consequence: '3_prime_UTR_variant',
    affectedExon: "3'UTR",
    gnomadAF: 0.0002,
    caddScore: 8.5,
    acmgCriteria: ['BP4'],
    diseaseAssociation: '非小细胞肺癌',
    reviewed: false,
    reported: false,
  },
  {
    id: 'snv-014',
    gene: 'MET',
    chromosome: '7',
    position: 116411990,
    start: 116411990,
    end: 116411990,
    ref: 'G',
    alt: 'C',
    variantType: 'SNV',
    zygosity: 'Heterozygous',
    alleleFrequency: 0.25,
    depth: 720,
    acmgClassification: 'VUS',
    clinicalSignificance: 'Tier III',
    transcript: 'NM_000245.4',
    hgvsc: 'c.-200G>C',
    hgvsp: '-',
    consequence: 'Upstream_gene_variant',
    affectedExon: 'Promoter',
    gnomadAF: 0.0003,
    caddScore: 10.2,
    acmgCriteria: ['BP4'],
    diseaseAssociation: '非小细胞肺癌',
    reviewed: false,
    reported: false,
  },
];

// ============ Mock 样本信息数据 ============
const mockSampleInfo: Record<string, SampleInfo> = {
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890': {
    sampleId: 'S2024120001',
    sampleName: '张**',
    gender: 'Male',
    age: 58,
    clinicalDiagnosis: '肺腺癌',
    phenotypes: ['咳嗽', '胸痛'],
    familyHistory: '无',
    sampleType: 'FFPE',
    collectionDate: '2024-12-18',
    receivedDate: '2024-12-19',
    reportDate: '2024-12-25',
    project: '肺癌靶向用药检测',
    institution: '北京协和医院',
    cancerType: '非小细胞肺癌',
  },
  'b2c3d4e5-f6a7-8901-bcde-f12345678901': {
    sampleId: 'S2024120001',
    sampleName: '张**',
    gender: 'Male',
    age: 58,
    clinicalDiagnosis: '肺腺癌',
    phenotypes: ['咳嗽', '胸痛'],
    familyHistory: '无',
    sampleType: 'FFPE',
    collectionDate: '2024-12-18',
    receivedDate: '2024-12-19',
    project: '肺癌靶向用药检测',
    institution: '北京协和医院',
    cancerType: '非小细胞肺癌',
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
    reviewed: true,
    reported: false,
    reviewedBy: '王工',
    reviewedAt: '2024-12-25 15:00',
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
    reviewed: false,
    reported: false,
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
    reviewed: false,
    reported: false,
  },
];

// ============ Mock CNV数据(外显子级别) ============
const mockCNVExons: CNVExon[] = [
  {
    id: 'cnv-exon-001',
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
    reviewed: true,
    reported: true,
    reviewedBy: '王工',
    reviewedAt: '2024-12-25 10:30',
    reportedBy: '李工',
    reportedAt: '2024-12-25 14:00',
  },
  {
    id: 'cnv-exon-002',
    gene: 'EGFR',
    transcript: 'NM_005228.5',
    exon: 'Exon 18-21',
    chromosome: 'chr7',
    startPosition: 55211070,
    endPosition: 55249071,
    type: 'Amplification',
    copyNumber: 5,
    ratio: 2.45,
    confidence: 0.91,
    reviewed: false,
    reported: false,
  },
  {
    id: 'cnv-exon-003',
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
    reviewed: true,
    reported: false,
    reviewedBy: '王工',
    reviewedAt: '2024-12-25 11:00',
  },
  {
    id: 'cnv-exon-004',
    gene: 'SMN1',
    transcript: 'NM_000344.4',
    exon: 'Exon 7',
    chromosome: 'chr5',
    startPosition: 70924941,
    endPosition: 70925030,
    type: 'Deletion',
    copyNumber: 1,
    ratio: 0.48,
    confidence: 0.89,
    reviewed: false,
    reported: false,
  },
];

// ============ Mock STR数据 ============
const mockSTRs: STR[] = [
  {
    id: 'str-001',
    gene: 'FMR1',
    transcript: 'NM_002024.6',
    locus: 'Xq27.3',
    repeatUnit: 'CGG',
    repeatCount: 35,
    normalRangeMin: 5,
    normalRangeMax: 44,
    status: 'Normal',
    reviewed: false,
    reported: false,
  },
  {
    id: 'str-002',
    gene: 'HTT',
    transcript: 'NM_002111.8',
    locus: '4p16.3',
    repeatUnit: 'CAG',
    repeatCount: 42,
    normalRangeMin: 10,
    normalRangeMax: 35,
    status: 'FullMutation',
    reviewed: true,
    reported: true,
    reviewedBy: '王工',
    reviewedAt: '2024-12-25 10:30',
    reportedBy: '李工',
    reportedAt: '2024-12-25 14:00',
  },
  {
    id: 'str-003',
    gene: 'DMPK',
    transcript: 'NM_001081563.2',
    locus: '19q13.32',
    repeatUnit: 'CTG',
    repeatCount: 65,
    normalRangeMin: 5,
    normalRangeMax: 37,
    status: 'Premutation',
    reviewed: true,
    reported: false,
    reviewedBy: '王工',
    reviewedAt: '2024-12-25 11:00',
  },
  {
    id: 'str-004',
    gene: 'ATXN1',
    transcript: 'NM_000332.4',
    locus: '6p22.3',
    repeatUnit: 'CAG',
    repeatCount: 28,
    normalRangeMin: 6,
    normalRangeMax: 38,
    status: 'Normal',
    reviewed: false,
    reported: false,
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
    reviewed: true,
    reported: true,
    reviewedBy: '王工',
    reviewedAt: '2024-12-25 10:30',
    reportedBy: '李工',
    reportedAt: '2024-12-25 14:00',
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
    reviewed: true,
    reported: false,
    reviewedBy: '王工',
    reviewedAt: '2024-12-25 11:00',
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
    reviewed: false,
    reported: false,
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
    reviewed: false,
    reported: false,
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
    reviewed: true,
    reported: true,
    reviewedBy: '王工',
    reviewedAt: '2024-12-25 10:30',
    reportedBy: '李工',
    reportedAt: '2024-12-25 14:00',
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
    reviewed: false,
    reported: false,
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

// Tier临床意义分类配置
export const TIER_CONFIG: Record<string, { label: string; variant: 'danger' | 'warning' | 'info' | 'neutral' }> = {
  'Tier I': { label: 'Tier I', variant: 'danger' },
  'Tier II': { label: 'Tier II', variant: 'warning' },
  'Tier III': { label: 'Tier III', variant: 'info' },
  'Tier IV': { label: 'Tier IV', variant: 'neutral' },
  'Unknown': { label: 'Unknown', variant: 'neutral' },
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
