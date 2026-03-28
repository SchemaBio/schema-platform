/**
 * ClinGen CNV 致病性分类器
 * 
 * 基于 ACMG/ClinGen CNV 解读技术标准的分类阈值：
 * - Pathogenic: ≥ 0.99
 * - Likely Pathogenic: 0.90 ~ 0.98
 * - VUS: -0.89 ~ 0.89
 * - Likely Benign: -0.90 ~ -0.98
 * - Benign: ≤ -0.99
 */

import { ClinGenClassification, CLINGEN_THRESHOLDS } from '../types';

/**
 * 根据总分计算 ClinGen 致病性分类
 * 
 * @param totalScore - 所有证据部分的总分
 * @returns ClinGen 致病性分类
 */
export function classify(totalScore: number): ClinGenClassification {
  // 处理 NaN 或无效值
  if (Number.isNaN(totalScore) || !Number.isFinite(totalScore)) {
    return 'VUS';
  }

  if (totalScore >= CLINGEN_THRESHOLDS.PATHOGENIC) {
    return 'Pathogenic';
  }
  
  if (totalScore >= CLINGEN_THRESHOLDS.LIKELY_PATHOGENIC) {
    return 'Likely_Pathogenic';
  }
  
  if (totalScore <= CLINGEN_THRESHOLDS.BENIGN) {
    return 'Benign';
  }
  
  if (totalScore <= CLINGEN_THRESHOLDS.LIKELY_BENIGN) {
    return 'Likely_Benign';
  }
  
  return 'VUS';
}

/**
 * 获取分类对应的中文标签
 */
export function getClassificationLabel(classification: ClinGenClassification): string {
  const labels: Record<ClinGenClassification, string> = {
    'Pathogenic': '致病',
    'Likely_Pathogenic': '可能致病',
    'VUS': '意义未明',
    'Likely_Benign': '可能良性',
    'Benign': '良性',
  };
  return labels[classification];
}

/**
 * 获取分类对应的颜色变体（用于 Tag 组件）
 */
export function getClassificationVariant(
  classification: ClinGenClassification
): 'danger' | 'warning' | 'neutral' | 'success' | 'info' {
  const variants: Record<ClinGenClassification, 'danger' | 'warning' | 'neutral' | 'success' | 'info'> = {
    'Pathogenic': 'danger',
    'Likely_Pathogenic': 'warning',
    'VUS': 'neutral',
    'Likely_Benign': 'info',
    'Benign': 'success',
  };
  return variants[classification];
}

/**
 * 获取分类的分数范围描述
 */
export function getClassificationScoreRange(classification: ClinGenClassification): string {
  const ranges: Record<ClinGenClassification, string> = {
    'Pathogenic': '≥ 0.99',
    'Likely_Pathogenic': '0.90 ~ 0.98',
    'VUS': '-0.89 ~ 0.89',
    'Likely_Benign': '-0.90 ~ -0.98',
    'Benign': '≤ -0.99',
  };
  return ranges[classification];
}

/**
 * 验证分数是否在有效范围内
 * ClinGen 理论上分数范围大约在 -3 到 +3 之间
 */
export function isScoreInValidRange(score: number): boolean {
  return Number.isFinite(score) && score >= -5 && score <= 5;
}

/**
 * 格式化分数显示
 */
export function formatScore(score: number): string {
  if (Number.isNaN(score) || !Number.isFinite(score)) {
    return '-';
  }
  return score.toFixed(2);
}
