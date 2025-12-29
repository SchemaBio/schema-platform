/**
 * ClinGen CNV Loss (Deletion) 评分计算器
 * 
 * 基于 ClinGen CNV Loss 评分框架实现
 * 参考: https://cnvcalc.clinicalgenome.org/cnvcalc/cnv-loss
 */

import {
  LossAssessmentCriteria,
  Section1LossCriteria,
  Section2LossCriteria,
  Section3Criteria,
  Section4Criteria,
  Section5Criteria,
  SectionScores,
  ScoreResult,
  ClinGenClassification,
} from '../types';
import { classify } from './pathogenicity-classifier';

// ============ Section 1: 基因组内容初始评估 ============

/**
 * Section 1 Loss 评分常量
 */
const SECTION1_LOSS_SCORES = {
  '1A': 0,      // 包含蛋白编码或其他已知功能重要元素 (继续评估)
  '1B': -0.60,  // 不包含蛋白编码或任何已知功能重要元素
} as const;

/**
 * 计算 Section 1 Loss 评分
 */
export function calculateSection1Loss(criteria: Section1LossCriteria): number {
  if (!criteria.selected) return 0;
  return SECTION1_LOSS_SCORES[criteria.selected];
}

// ============ Section 2: HI 基因/区域重叠 ============

/**
 * Section 2 Loss HI重叠默认评分
 */
const SECTION2_LOSS_HI_DEFAULT_SCORES: Record<string, number> = {
  '2A': 1.0,    // 完全重叠已建立HI基因/区域
  '2B': 0,      // 部分重叠已建立HI区域
  '2C-1': 0.90, // 部分重叠HI基因5'端，涉及编码序列 (range: 0.45-1.00)
  '2C-2': 0,    // 部分重叠HI基因5'端，仅涉及5'UTR (range: 0-0.45)
  '2D-1': 0,    // 部分重叠HI基因3'端，仅涉及3'UTR
  '2D-2': 0.90, // 部分重叠HI基因3'端，仅涉及最后外显子，有已知致病变异 (range: 0.45-0.90)
  '2D-3': 0.30, // 部分重叠HI基因3'端，仅涉及最后外显子，无已知致病变异 (range: 0-0.45)
  '2D-4': 0.90, // 部分重叠HI基因3'端，涉及其他外显子 (range: 0.45-1.00)
  '2E': 0,      // 两个断点在同一基因内 (参考PVS1，需要用户指定)
};

/**
 * Section 2 Loss 良性区域重叠评分
 */
const SECTION2_LOSS_BENIGN_SCORES: Record<string, number> = {
  '2F': -1.0,   // 完全包含在已建立良性CNV区域内
  '2G': 0,      // 重叠良性CNV但包含额外基因组物质
};

/**
 * Section 2 Loss HI预测器评分
 */
const SECTION2_LOSS_HI_PREDICTOR_SCORE = 0.15;

/**
 * 计算 Section 2 Loss 评分
 */
export function calculateSection2Loss(criteria: Section2LossCriteria): number {
  let score = 0;

  // HI重叠评分
  if (criteria.hiOverlap.selected) {
    // 如果用户指定了分数，使用用户指定的分数；否则使用默认分数
    score += criteria.hiOverlap.score !== 0 
      ? criteria.hiOverlap.score 
      : SECTION2_LOSS_HI_DEFAULT_SCORES[criteria.hiOverlap.selected] ?? 0;
  }

  // 良性区域重叠评分
  if (criteria.benignOverlap.selected) {
    score += criteria.benignOverlap.score !== 0
      ? criteria.benignOverlap.score
      : SECTION2_LOSS_BENIGN_SCORES[criteria.benignOverlap.selected] ?? 0;
  }

  // HI预测器评分
  if (criteria.hiPredictor.selected === '2H') {
    score += SECTION2_LOSS_HI_PREDICTOR_SCORE;
  }

  return score;
}

// ============ Section 3: 基因数量评估 ============

/**
 * 根据基因数量计算 Section 3 评分
 * 基于 ClinGen 标准的基因数量评分表
 */
export function calculateSection3(criteria: Section3Criteria): number {
  const { geneCount } = criteria;
  
  if (geneCount === 0) return 0;
  if (geneCount >= 1 && geneCount <= 24) return 0;
  if (geneCount >= 25 && geneCount <= 34) return 0.45;
  if (geneCount >= 35) return 0.90;
  
  return 0;
}

// ============ Section 4: 文献和数据库证据 ============

/**
 * 计算 Section 4 De Novo 证据评分
 */
function calculateSection4DeNovo(criteria: Section4Criteria['deNovo']): number {
  let score = 0;
  const maxTotal = 0.90;

  // 4A: 高度特异且独特的表型
  // Confirmed: 0.45, Assumed: 0.30
  score += criteria['4A'].confirmedCount * 0.45;
  score += criteria['4A'].assumedCount * 0.30;

  // 4B: 高度特异但不独特的表型
  // Confirmed: 0.30, Assumed: 0.15
  score += criteria['4B'].confirmedCount * 0.30;
  score += criteria['4B'].assumedCount * 0.15;

  // 4C: 一致但不高度特异的表型
  // Confirmed: 0.15, Assumed: 0.10
  score += criteria['4C'].confirmedCount * 0.15;
  score += criteria['4C'].assumedCount * 0.10;

  // 4D: 不一致的表型 (负分)
  score += criteria['4D'].score;

  // 限制最大值
  return Math.min(score, maxTotal);
}

/**
 * 计算 Section 4 未知遗传证据评分
 */
function calculateSection4UnknownInheritance(criteria: Section4Criteria['unknownInheritance']): number {
  // 4E: 0.10 per case, max 0.30
  return Math.min(criteria['4E'].count * 0.10, 0.30);
}

/**
 * 计算 Section 4 分离证据评分
 */
function calculateSection4Segregation(criteria: Section4Criteria['segregation']): number {
  let score = 0;
  const maxTotal = 0.45;

  // 4F: 3+ affected, LOD ≥ 2 (0.45 each)
  score += criteria['4F'] * 0.45;

  // 4G: 2 affected (0.30 each)
  score += criteria['4G'] * 0.30;

  // 4H: 1 affected (0.15 each)
  score += criteria['4H'] * 0.15;

  return Math.min(score, maxTotal);
}

/**
 * 计算 Section 4 非分离证据评分
 */
function calculateSection4NonSegregation(criteria: Section4Criteria['nonSegregation']): number {
  let score = 0;

  // 4I: 未在受累家属中发现 (-0.45 per family, max -0.90)
  score += Math.max(criteria['4I'].score, -0.90);

  // 4J: 在未受累家属中发现（特异表型）(-0.30 per family, max -0.90)
  score += Math.max(criteria['4J'].score, -0.90);

  // 4K: 在未受累家属中发现（非特异表型）(-0.15 per family, max -0.30)
  score += Math.max(criteria['4K'].score, -0.30);

  return score;
}

/**
 * 计算 Section 4 病例对照证据评分
 */
function calculateSection4CaseControl(criteria: Section4Criteria['caseControl']): number {
  let score = 0;

  // 4L: 病例中显著增加（特异表型）(0.45 per study, max 0.45)
  score += Math.min(criteria['4L'].score, 0.45);

  // 4M: 病例中显著增加（非特异表型）(0.30 per study, max 0.45)
  score += Math.min(criteria['4M'].score, 0.45);

  // 4N: 病例与对照无显著差异 (-0.90 per study, max -0.90)
  score += Math.max(criteria['4N'].score, -0.90);

  // 4O: 与常见人群变异重叠 (max -1.00)
  score += Math.max(criteria['4O'].score, -1.00);

  return score;
}

/**
 * 计算 Section 4 总评分
 */
export function calculateSection4(criteria: Section4Criteria): number {
  let score = 0;

  score += calculateSection4DeNovo(criteria.deNovo);
  score += calculateSection4UnknownInheritance(criteria.unknownInheritance);
  score += calculateSection4Segregation(criteria.segregation);
  score += calculateSection4NonSegregation(criteria.nonSegregation);
  score += calculateSection4CaseControl(criteria.caseControl);

  return score;
}

// ============ Section 5: 遗传模式/家族史 ============

/**
 * 计算 Section 5 评分
 */
export function calculateSection5(criteria: Section5Criteria): number {
  let score = 0;

  // De Novo (5A) - 使用用户指定的分数
  if (criteria.deNovo.selected === '5A') {
    score += criteria.deNovo.score;
  }

  // Inherited (5B, 5C, 5D)
  if (criteria.inherited.selected) {
    score += criteria.inherited.score;
  }

  // Non-segregation (5E) - 使用用户指定的分数
  if (criteria.nonSegregation.selected === '5E') {
    score += criteria.nonSegregation.score;
  }

  // Other (5F, 5G, 5H)
  if (criteria.other.selected) {
    score += criteria.other.score;
  }

  return score;
}

// ============ 总评分计算 ============

/**
 * 计算 Loss CNV 的完整评分结果
 */
export function calculateLossTotal(criteria: LossAssessmentCriteria): ScoreResult {
  const sectionScores: SectionScores = {
    section1: calculateSection1Loss(criteria.section1),
    section2: calculateSection2Loss(criteria.section2),
    section3: calculateSection3(criteria.section3),
    section4: calculateSection4(criteria.section4),
    section5: calculateSection5(criteria.section5),
  };

  const totalScore = 
    sectionScores.section1 +
    sectionScores.section2 +
    sectionScores.section3 +
    sectionScores.section4 +
    sectionScores.section5;

  const classification: ClinGenClassification = classify(totalScore);

  return {
    sectionScores,
    totalScore,
    classification,
  };
}

/**
 * 获取 Section 2 Loss HI重叠选项的分数范围
 */
export function getSection2LossHIScoreRange(option: string): { min: number; max: number; default: number } {
  const ranges: Record<string, { min: number; max: number; default: number }> = {
    '2A': { min: 1.0, max: 1.0, default: 1.0 },
    '2B': { min: 0, max: 0, default: 0 },
    '2C-1': { min: 0.45, max: 1.00, default: 0.90 },
    '2C-2': { min: 0, max: 0.45, default: 0 },
    '2D-1': { min: 0, max: 0, default: 0 },
    '2D-2': { min: 0.45, max: 0.90, default: 0.90 },
    '2D-3': { min: 0, max: 0.45, default: 0.30 },
    '2D-4': { min: 0.45, max: 1.00, default: 0.90 },
    '2E': { min: 0, max: 0.90, default: 0 },
  };
  return ranges[option] ?? { min: 0, max: 0, default: 0 };
}
