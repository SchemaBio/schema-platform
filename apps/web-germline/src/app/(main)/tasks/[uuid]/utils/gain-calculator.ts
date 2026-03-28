/**
 * ClinGen CNV Gain (Amplification) 评分计算器
 * 
 * 基于 ClinGen CNV Gain 评分框架实现
 * 参考: https://cnvcalc.clinicalgenome.org/cnvcalc/cnv-gain
 */

import {
  GainAssessmentCriteria,
  Section1GainCriteria,
  Section2GainCriteria,
  Section3Criteria,
  Section4Criteria,
  Section5Criteria,
  SectionScores,
  ScoreResult,
  ClinGenClassification,
} from '../types';
import { classify } from './pathogenicity-classifier';
import { calculateSection3, calculateSection4, calculateSection5 } from './loss-calculator';

// ============ Section 1: 基因组内容初始评估 ============

/**
 * Section 1 Gain 评分常量
 */
const SECTION1_GAIN_SCORES = {
  '1A': 0,      // 包含蛋白编码或其他已知功能重要元素 (继续评估)
  '1B': -0.60,  // 不包含蛋白编码或任何已知功能重要元素
} as const;

/**
 * 计算 Section 1 Gain 评分
 */
export function calculateSection1Gain(criteria: Section1GainCriteria): number {
  if (!criteria.selected) return 0;
  return SECTION1_GAIN_SCORES[criteria.selected];
}

// ============ Section 2: TS/HI 基因/区域重叠 ============

/**
 * Section 2 Gain TS重叠默认评分
 */
const SECTION2_GAIN_TS_DEFAULT_SCORES: Record<string, number> = {
  '2A': 1.0,    // 完全重叠已建立TS基因/区域
  '2B': 0,      // 部分重叠已建立TS区域
};

/**
 * Section 2 Gain 良性区域重叠默认评分
 */
const SECTION2_GAIN_BENIGN_DEFAULT_SCORES: Record<string, number> = {
  '2C': -1.0,   // 与已建立良性CNV基因内容相同
  '2D': -1.0,   // 小于已建立良性CNV，断点不中断蛋白编码基因
  '2E': 0,      // 小于已建立良性CNV，断点可能中断蛋白编码基因
  '2F': -0.90,  // 大于已建立良性CNV，不包含额外蛋白编码基因 (range: 0 to -1.00)
  '2G': 0,      // 重叠良性CNV但包含额外基因组物质
};

/**
 * Section 2 Gain HI基因重叠默认评分
 */
const SECTION2_GAIN_HI_DEFAULT_SCORES: Record<string, number> = {
  '2H': 0,      // HI基因完全包含在CNV内
  '2I': 0,      // 两个断点在同一基因内 (参考PVS1，需要用户指定)
  '2J': 0,      // 一个断点在已建立HI基因内，表型不一致或未知
  '2K': 0.45,   // 一个断点在已建立HI基因内，表型高度特异且一致
  '2L': 0,      // 断点在无临床意义基因内
};

/**
 * 计算 Section 2 Gain 评分
 */
export function calculateSection2Gain(criteria: Section2GainCriteria): number {
  let score = 0;

  // TS重叠评分
  if (criteria.tsOverlap.selected) {
    score += criteria.tsOverlap.score !== 0
      ? criteria.tsOverlap.score
      : SECTION2_GAIN_TS_DEFAULT_SCORES[criteria.tsOverlap.selected] ?? 0;
  }

  // 良性区域重叠评分
  if (criteria.benignOverlap.selected) {
    score += criteria.benignOverlap.score !== 0
      ? criteria.benignOverlap.score
      : SECTION2_GAIN_BENIGN_DEFAULT_SCORES[criteria.benignOverlap.selected] ?? 0;
  }

  // HI基因重叠评分
  if (criteria.hiOverlap.selected) {
    score += criteria.hiOverlap.score !== 0
      ? criteria.hiOverlap.score
      : SECTION2_GAIN_HI_DEFAULT_SCORES[criteria.hiOverlap.selected] ?? 0;
  }

  return score;
}

// ============ 总评分计算 ============

/**
 * 计算 Gain CNV 的完整评分结果
 */
export function calculateGainTotal(criteria: GainAssessmentCriteria): ScoreResult {
  const sectionScores: SectionScores = {
    section1: calculateSection1Gain(criteria.section1),
    section2: calculateSection2Gain(criteria.section2),
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
 * 获取 Section 2 Gain TS重叠选项的分数范围
 */
export function getSection2GainTSScoreRange(option: string): { min: number; max: number; default: number } {
  const ranges: Record<string, { min: number; max: number; default: number }> = {
    '2A': { min: 1.0, max: 1.0, default: 1.0 },
    '2B': { min: 0, max: 0, default: 0 },
  };
  return ranges[option] ?? { min: 0, max: 0, default: 0 };
}

/**
 * 获取 Section 2 Gain 良性区域重叠选项的分数范围
 */
export function getSection2GainBenignScoreRange(option: string): { min: number; max: number; default: number } {
  const ranges: Record<string, { min: number; max: number; default: number }> = {
    '2C': { min: -1.0, max: -1.0, default: -1.0 },
    '2D': { min: -1.0, max: -1.0, default: -1.0 },
    '2E': { min: 0, max: 0, default: 0 },
    '2F': { min: -1.0, max: 0, default: -0.90 },
    '2G': { min: 0, max: 0, default: 0 },
  };
  return ranges[option] ?? { min: 0, max: 0, default: 0 };
}

/**
 * 获取 Section 2 Gain HI基因重叠选项的分数范围
 */
export function getSection2GainHIScoreRange(option: string): { min: number; max: number; default: number } {
  const ranges: Record<string, { min: number; max: number; default: number }> = {
    '2H': { min: 0, max: 0, default: 0 },
    '2I': { min: 0, max: 0.90, default: 0 },
    '2J': { min: 0, max: 0, default: 0 },
    '2K': { min: 0.45, max: 0.45, default: 0.45 },
    '2L': { min: 0, max: 0, default: 0 },
  };
  return ranges[option] ?? { min: 0, max: 0, default: 0 };
}
