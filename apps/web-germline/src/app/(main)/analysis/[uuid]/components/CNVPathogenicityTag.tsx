'use client';

import * as React from 'react';
import { Tag, Tooltip } from '@schema/ui-kit';
import { Pencil } from 'lucide-react';
import type { ClinGenClassification } from '../types';
import { 
  getClassificationLabel, 
  getClassificationVariant,
  getClassificationScoreRange,
  formatScore,
} from '../utils/pathogenicity-classifier';

interface CNVPathogenicityTagProps {
  /** CNV类型 */
  cnvType: 'Amplification' | 'Deletion';
  /** ClinGen致病性分类 */
  classification: ClinGenClassification;
  /** 总评分 */
  score: number;
  /** 是否为用户修改过的评估 */
  isUserModified?: boolean;
  /** 点击事件，用于打开评估侧边栏 */
  onClick?: () => void;
  /** 是否禁用点击 */
  disabled?: boolean;
}

/**
 * CNV致病性标签组件
 * 
 * 显示CNV的ClinGen致病性分类，点击后可打开评估侧边栏
 */
export function CNVPathogenicityTag({
  cnvType,
  classification,
  score,
  isUserModified = false,
  onClick,
  disabled = false,
}: CNVPathogenicityTagProps) {
  const variant = getClassificationVariant(classification);
  const label = getClassificationLabel(classification);
  const scoreRange = getClassificationScoreRange(classification);
  const formattedScore = formatScore(score);
  const frameworkType = cnvType === 'Deletion' ? 'Loss' : 'Gain';

  const tooltipContent = (
    <div className="text-xs space-y-1">
      <div>ClinGen {frameworkType} 评估</div>
      <div>分类: {label}</div>
      <div>评分: {formattedScore}</div>
      <div>阈值范围: {scoreRange}</div>
      {isUserModified && <div className="text-warning-fg">已手动修改</div>}
      {onClick && !disabled && <div className="text-fg-muted mt-1">点击查看详情</div>}
    </div>
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <Tooltip content={tooltipContent} placement="top" variant="nav">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || !onClick}
        className={`
          inline-flex items-center gap-1
          ${onClick && !disabled ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <Tag variant={variant}>
          {label}
        </Tag>
        {isUserModified && (
          <Pencil className="w-3 h-3 text-fg-muted" />
        )}
      </button>
    </Tooltip>
  );
}

/**
 * 简化版致病性标签（仅显示分类，无交互）
 */
export function CNVPathogenicityBadge({
  classification,
}: {
  classification: ClinGenClassification;
}) {
  const variant = getClassificationVariant(classification);
  const label = getClassificationLabel(classification);

  return (
    <Tag variant={variant}>
      {label}
    </Tag>
  );
}
