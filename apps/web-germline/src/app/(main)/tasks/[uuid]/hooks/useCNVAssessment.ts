'use client';

import { useState, useCallback, useMemo } from 'react';
import type {
  CNVSegment,
  CNVExon,
  CNVAssessment,
  LossAssessmentCriteria,
  GainAssessmentCriteria,
  ScoreResult,
} from '../types';
import {
  createDefaultLossAssessmentCriteria,
  createDefaultGainAssessmentCriteria,
  createDefaultSectionScores,
} from '../types';
import { calculateLossTotal } from '../utils/loss-calculator';
import { calculateGainTotal } from '../utils/gain-calculator';
import { classify } from '../utils/pathogenicity-classifier';

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 根据CNV类型创建默认评估
 */
function createDefaultAssessment(cnv: CNVSegment | CNVExon): CNVAssessment {
  const isLoss = cnv.type === 'Deletion';
  const criteria = isLoss 
    ? createDefaultLossAssessmentCriteria() 
    : createDefaultGainAssessmentCriteria();
  
  // 计算初始评分
  const scoreResult: ScoreResult = isLoss
    ? calculateLossTotal(criteria as LossAssessmentCriteria)
    : calculateGainTotal(criteria as GainAssessmentCriteria);

  return {
    id: generateId(),
    cnvId: cnv.id,
    cnvType: cnv.type,
    criteria,
    sectionScores: scoreResult.sectionScores,
    totalScore: scoreResult.totalScore,
    classification: scoreResult.classification,
    isAutoCalculated: true,
    isUserModified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * CNV评估状态管理Hook
 */
export function useCNVAssessment(cnv: CNVSegment | CNVExon | null) {
  // 评估状态
  const [assessment, setAssessment] = useState<CNVAssessment | null>(() => {
    if (!cnv) return null;
    return createDefaultAssessment(cnv);
  });

  // 原始评估（用于重置）
  const [originalAssessment, setOriginalAssessment] = useState<CNVAssessment | null>(() => {
    if (!cnv) return null;
    return createDefaultAssessment(cnv);
  });

  // 是否为Loss类型
  const isLoss = cnv?.type === 'Deletion';

  /**
   * 更新评估标准并重新计算评分
   */
  const updateCriteria = useCallback((
    newCriteria: LossAssessmentCriteria | GainAssessmentCriteria
  ) => {
    if (!assessment) return;

    // 重新计算评分
    const scoreResult: ScoreResult = isLoss
      ? calculateLossTotal(newCriteria as LossAssessmentCriteria)
      : calculateGainTotal(newCriteria as GainAssessmentCriteria);

    setAssessment({
      ...assessment,
      criteria: newCriteria,
      sectionScores: scoreResult.sectionScores,
      totalScore: scoreResult.totalScore,
      classification: scoreResult.classification,
      isUserModified: true,
      updatedAt: new Date().toISOString(),
    });
  }, [assessment, isLoss]);

  /**
   * 重置评估到默认值
   */
  const resetAssessment = useCallback(() => {
    if (!cnv) return;
    const defaultAssessment = createDefaultAssessment(cnv);
    setAssessment(defaultAssessment);
    setOriginalAssessment(defaultAssessment);
  }, [cnv]);

  /**
   * 保存评估
   */
  const saveAssessment = useCallback((userId?: string): CNVAssessment | null => {
    if (!assessment) return null;

    const savedAssessment: CNVAssessment = {
      ...assessment,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };

    setAssessment(savedAssessment);
    setOriginalAssessment(savedAssessment);

    // TODO: 这里可以添加API调用来持久化到后端
    // await api.saveAssessment(savedAssessment);

    return savedAssessment;
  }, [assessment]);

  /**
   * 加载已保存的评估
   */
  const loadAssessment = useCallback((savedAssessment: CNVAssessment) => {
    setAssessment(savedAssessment);
    setOriginalAssessment(savedAssessment);
  }, []);

  /**
   * 检查是否有未保存的更改
   */
  const hasUnsavedChanges = useMemo(() => {
    if (!assessment || !originalAssessment) return false;
    return assessment.updatedAt !== originalAssessment.updatedAt;
  }, [assessment, originalAssessment]);

  /**
   * 初始化评估（当CNV变化时）
   */
  const initializeAssessment = useCallback((newCnv: CNVSegment | CNVExon) => {
    const defaultAssessment = createDefaultAssessment(newCnv);
    setAssessment(defaultAssessment);
    setOriginalAssessment(defaultAssessment);
  }, []);

  return {
    assessment,
    isLoss,
    updateCriteria,
    resetAssessment,
    saveAssessment,
    loadAssessment,
    hasUnsavedChanges,
    initializeAssessment,
  };
}

/**
 * 序列化评估数据为JSON
 */
export function serializeAssessment(assessment: CNVAssessment): string {
  return JSON.stringify(assessment);
}

/**
 * 从JSON反序列化评估数据
 */
export function deserializeAssessment(json: string): CNVAssessment | null {
  try {
    const parsed = JSON.parse(json);
    // 基本验证
    if (!parsed.id || !parsed.cnvId || !parsed.cnvType || !parsed.criteria) {
      return null;
    }
    return parsed as CNVAssessment;
  } catch {
    return null;
  }
}
