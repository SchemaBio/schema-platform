'use client';

import * as React from 'react';
import { Tooltip } from '@schema/ui-kit';
import { HelpCircle } from 'lucide-react';
import type { Section1LossCriteria, Section1GainCriteria } from '../../types';

interface Section1PanelProps {
  /** CNV类型 */
  cnvType: 'Amplification' | 'Deletion';
  /** 当前选择的标准 */
  criteria: Section1LossCriteria | Section1GainCriteria;
  /** 标准变更回调 */
  onChange: (criteria: Section1LossCriteria | Section1GainCriteria) => void;
}

/**
 * Section 1 证据选项配置
 */
const SECTION1_OPTIONS = {
  '1A': {
    label: '1A. 包含蛋白编码或其他已知功能重要元素',
    description: '继续评估 - CNV包含蛋白编码基因或其他已知功能重要的基因组元素',
    score: 0,
  },
  '1B': {
    label: '1B. 不包含蛋白编码或任何已知功能重要元素',
    description: 'CNV不包含任何蛋白编码基因或已知功能重要的基因组元素',
    score: -0.60,
  },
} as const;

/**
 * 单选按钮组件
 */
function RadioOption({
  id,
  name,
  label,
  description,
  score,
  checked,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  description: string;
  score: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`
        flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
        ${checked 
          ? 'border-accent-emphasis bg-accent-subtle' 
          : 'border-border hover:border-border-default hover:bg-canvas-subtle'
        }
      `}
    >
      <input
        type="radio"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-1 w-4 h-4 text-accent-fg focus:ring-accent-emphasis"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-fg-default">{label}</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${
              score > 0 ? 'text-success-fg' : score < 0 ? 'text-danger-fg' : 'text-fg-muted'
            }`}>
              {score >= 0 ? '+' : ''}{score.toFixed(2)}
            </span>
            <Tooltip content={description} placement="left" variant="nav">
              <HelpCircle className="w-4 h-4 text-fg-muted" />
            </Tooltip>
          </div>
        </div>
      </div>
    </label>
  );
}

/**
 * Section 1: 基因组内容初始评估面板
 */
export function Section1Panel({
  cnvType,
  criteria,
  onChange,
}: Section1PanelProps) {
  const handleSelect = (option: '1A' | '1B') => {
    onChange({ selected: option });
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-fg-muted mb-2">
        评估CNV是否包含蛋白编码或其他已知功能重要元素。
        {cnvType === 'Deletion' 
          ? '对于基因内变异，请使用Section 2E。'
          : '对于基因内变异，请使用Section 2I。'
        }
      </div>
      
      <div className="space-y-2">
        {(Object.entries(SECTION1_OPTIONS) as [keyof typeof SECTION1_OPTIONS, typeof SECTION1_OPTIONS['1A']][]).map(
          ([key, option]) => (
            <RadioOption
              key={key}
              id={`section1-${key}`}
              name="section1"
              label={option.label}
              description={option.description}
              score={option.score}
              checked={criteria.selected === key}
              onChange={() => handleSelect(key)}
            />
          )
        )}
      </div>

      {!criteria.selected && (
        <div className="text-xs text-warning-fg">
          请选择一个选项
        </div>
      )}
    </div>
  );
}
