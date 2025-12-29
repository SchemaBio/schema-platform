'use client';

import * as React from 'react';
import { Tooltip } from '@schema/ui-kit';
import { HelpCircle } from 'lucide-react';
import type { 
  Section2LossCriteria, 
  Section2GainCriteria,
  Section2LossHIOption,
  Section2LossBenignOption,
  Section2GainTSOption,
  Section2GainBenignOption,
  Section2GainHIOption,
} from '../../types';

interface Section2PanelProps {
  cnvType: 'Amplification' | 'Deletion';
  criteria: Section2LossCriteria | Section2GainCriteria;
  onChange: (criteria: Section2LossCriteria | Section2GainCriteria) => void;
}

// Loss HI重叠选项
const LOSS_HI_OPTIONS: Record<Section2LossHIOption, { label: string; description: string; defaultScore: number; range?: { min: number; max: number } }> = {
  '2A': { label: '2A. 完全重叠已建立HI基因/区域', description: '完全重叠一个已建立的单倍剂量不足(HI)基因或基因组区域', defaultScore: 1.0 },
  '2B': { label: '2B. 部分重叠已建立HI区域', description: 'CNV不包含已知致病基因或关键区域', defaultScore: 0 },
  '2C-1': { label: '2C-1. 部分重叠HI基因5\'端，涉及编码序列', description: '部分重叠已建立HI基因的5\'端，涉及编码序列', defaultScore: 0.90, range: { min: 0.45, max: 1.00 } },
  '2C-2': { label: '2C-2. 部分重叠HI基因5\'端，仅涉及5\'UTR', description: '部分重叠已建立HI基因的5\'端，仅涉及5\'UTR', defaultScore: 0, range: { min: 0, max: 0.45 } },
  '2D-1': { label: '2D-1. 部分重叠HI基因3\'端，仅涉及3\'UTR', description: '部分重叠已建立HI基因的3\'端，仅涉及3\'UTR', defaultScore: 0 },
  '2D-2': { label: '2D-2. 部分重叠HI基因3\'端，仅涉及最后外显子（有已知致病变异）', description: '仅涉及最后外显子，该外显子有其他已建立的致病变异', defaultScore: 0.90, range: { min: 0.45, max: 0.90 } },
  '2D-3': { label: '2D-3. 部分重叠HI基因3\'端，仅涉及最后外显子（无已知致病变异）', description: '仅涉及最后外显子，该外显子无其他已建立的致病变异', defaultScore: 0.30, range: { min: 0, max: 0.45 } },
  '2D-4': { label: '2D-4. 部分重叠HI基因3\'端，涉及其他外显子', description: '涉及最后外显子以外的其他外显子，预期发生无义介导的mRNA降解', defaultScore: 0.90, range: { min: 0.45, max: 1.00 } },
  '2E': { label: '2E. 两个断点在同一基因内', description: '基因水平序列变异，参考ClinGen SVI工作组PVS1规范', defaultScore: 0, range: { min: 0, max: 0.90 } },
};

// Loss 良性区域选项
const LOSS_BENIGN_OPTIONS: Record<Section2LossBenignOption, { label: string; description: string; defaultScore: number }> = {
  '2F': { label: '2F. 完全包含在已建立良性CNV区域内', description: 'CNV完全包含在一个已建立的良性CNV区域内', defaultScore: -1.0 },
  '2G': { label: '2G. 重叠良性CNV但包含额外基因组物质', description: '重叠一个已建立的良性CNV，但包含额外的基因组物质', defaultScore: 0 },
};

// Gain TS重叠选项
const GAIN_TS_OPTIONS: Record<Section2GainTSOption, { label: string; description: string; defaultScore: number }> = {
  '2A': { label: '2A. 完全重叠已建立TS基因/区域', description: '完全重叠一个已建立的三倍剂量敏感(TS)基因或基因组区域', defaultScore: 1.0 },
  '2B': { label: '2B. 部分重叠已建立TS区域', description: 'CNV不包含已知致病基因或关键区域', defaultScore: 0 },
};

// Gain 良性区域选项
const GAIN_BENIGN_OPTIONS: Record<Section2GainBenignOption, { label: string; description: string; defaultScore: number; range?: { min: number; max: number } }> = {
  '2C': { label: '2C. 与已建立良性CNV基因内容相同', description: '与已建立的良性拷贝数增加基因内容相同', defaultScore: -1.0 },
  '2D': { label: '2D. 小于已建立良性CNV，断点不中断蛋白编码基因', description: '小于已建立的良性拷贝数增加，断点不中断蛋白编码基因', defaultScore: -1.0 },
  '2E': { label: '2E. 小于已建立良性CNV，断点可能中断蛋白编码基因', description: '小于已建立的良性拷贝数增加，断点可能中断蛋白编码基因', defaultScore: 0 },
  '2F': { label: '2F. 大于已建立良性CNV，不包含额外蛋白编码基因', description: '大于已建立的良性拷贝数增加，不包含额外的蛋白编码基因', defaultScore: -0.90, range: { min: -1.0, max: 0 } },
  '2G': { label: '2G. 重叠良性CNV但包含额外基因组物质', description: '重叠一个已建立的良性CNV，但包含额外的基因组物质', defaultScore: 0 },
};

// Gain HI基因重叠选项
const GAIN_HI_OPTIONS: Record<Section2GainHIOption, { label: string; description: string; defaultScore: number; range?: { min: number; max: number } }> = {
  '2H': { label: '2H. HI基因完全包含在CNV内', description: '已建立的HI基因完全包含在观察到的拷贝数增加内', defaultScore: 0 },
  '2I': { label: '2I. 两个断点在同一基因内', description: '基因水平序列变异，可能导致功能丧失(LOF)', defaultScore: 0, range: { min: 0, max: 0.90 } },
  '2J': { label: '2J. 一个断点在已建立HI基因内，表型不一致或未知', description: '一个断点在已建立HI基因内，患者表型与该基因LOF预期不一致或未知', defaultScore: 0 },
  '2K': { label: '2K. 一个断点在已建立HI基因内，表型高度特异且一致', description: '一个断点在已建立HI基因内，患者表型高度特异且与该基因LOF预期一致', defaultScore: 0.45 },
  '2L': { label: '2L. 断点在无临床意义基因内', description: '一个或两个断点在无已建立临床意义的基因内', defaultScore: 0 },
};

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
  hasRange,
  onScoreChange,
  range,
}: {
  id: string;
  name: string;
  label: string;
  description: string;
  score: number;
  checked: boolean;
  onChange: () => void;
  hasRange?: boolean;
  onScoreChange?: (score: number) => void;
  range?: { min: number; max: number };
}) {
  return (
    <div
      className={`
        p-3 rounded-lg border transition-colors
        ${checked 
          ? 'border-accent-emphasis bg-accent-subtle' 
          : 'border-border hover:border-border-default'
        }
      `}
    >
      <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
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
            <span className="text-sm text-fg-default">{label}</span>
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
      
      {/* 分数滑块 */}
      {checked && hasRange && range && onScoreChange && (
        <div className="mt-3 ml-7">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={range.min}
              max={range.max}
              step={0.05}
              value={score}
              onChange={(e) => onScoreChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-canvas-inset rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono w-12 text-right">
              {score >= 0 ? '+' : ''}{score.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-fg-muted mt-1">
            <span>{range.min.toFixed(2)}</span>
            <span>{range.max.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Section 2: HI/TS基因/区域重叠评估面板
 */
export function Section2Panel({ cnvType, criteria, onChange }: Section2PanelProps) {
  const isLoss = cnvType === 'Deletion';

  if (isLoss) {
    const lossCriteria = criteria as Section2LossCriteria;
    
    return (
      <div className="space-y-4">
        {/* HI重叠 */}
        <div>
          <h4 className="text-sm font-medium text-fg-default mb-2">与已建立HI基因/区域的重叠</h4>
          <div className="space-y-2">
            {(Object.entries(LOSS_HI_OPTIONS) as [Section2LossHIOption, typeof LOSS_HI_OPTIONS['2A']][]).map(
              ([key, option]) => (
                <RadioOption
                  key={key}
                  id={`section2-hi-${key}`}
                  name="section2-hi"
                  label={option.label}
                  description={option.description}
                  score={lossCriteria.hiOverlap.selected === key ? lossCriteria.hiOverlap.score : option.defaultScore}
                  checked={lossCriteria.hiOverlap.selected === key}
                  onChange={() => onChange({
                    ...lossCriteria,
                    hiOverlap: { selected: key, score: option.defaultScore },
                  })}
                  hasRange={!!option.range}
                  range={option.range}
                  onScoreChange={(score) => onChange({
                    ...lossCriteria,
                    hiOverlap: { selected: key, score },
                  })}
                />
              )
            )}
          </div>
        </div>

        {/* 良性区域重叠 */}
        <div>
          <h4 className="text-sm font-medium text-fg-default mb-2">与已建立良性区域的重叠</h4>
          <div className="space-y-2">
            {(Object.entries(LOSS_BENIGN_OPTIONS) as [Section2LossBenignOption, typeof LOSS_BENIGN_OPTIONS['2F']][]).map(
              ([key, option]) => (
                <RadioOption
                  key={key}
                  id={`section2-benign-${key}`}
                  name="section2-benign"
                  label={option.label}
                  description={option.description}
                  score={option.defaultScore}
                  checked={lossCriteria.benignOverlap.selected === key}
                  onChange={() => onChange({
                    ...lossCriteria,
                    benignOverlap: { selected: key, score: option.defaultScore },
                  })}
                />
              )
            )}
          </div>
        </div>

        {/* HI预测器 */}
        <div>
          <h4 className="text-sm font-medium text-fg-default mb-2">HI预测器</h4>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-canvas-subtle cursor-pointer">
            <input
              type="checkbox"
              checked={lossCriteria.hiPredictor.selected === '2H'}
              onChange={(e) => onChange({
                ...lossCriteria,
                hiPredictor: { selected: e.target.checked ? '2H' : null },
              })}
              className="w-4 h-4 text-accent-fg focus:ring-accent-emphasis"
            />
            <div className="flex-1 flex items-center justify-between">
              <span className="text-sm text-fg-default">2H. 多个HI预测器建议至少一个基因是HI</span>
              <span className="text-xs font-mono text-success-fg">+0.15</span>
            </div>
          </label>
        </div>
      </div>
    );
  }

  // Gain
  const gainCriteria = criteria as Section2GainCriteria;
  
  return (
    <div className="space-y-4">
      {/* TS重叠 */}
      <div>
        <h4 className="text-sm font-medium text-fg-default mb-2">与已建立TS基因/区域的重叠</h4>
        <div className="space-y-2">
          {(Object.entries(GAIN_TS_OPTIONS) as [Section2GainTSOption, typeof GAIN_TS_OPTIONS['2A']][]).map(
            ([key, option]) => (
              <RadioOption
                key={key}
                id={`section2-ts-${key}`}
                name="section2-ts"
                label={option.label}
                description={option.description}
                score={option.defaultScore}
                checked={gainCriteria.tsOverlap.selected === key}
                onChange={() => onChange({
                  ...gainCriteria,
                  tsOverlap: { selected: key, score: option.defaultScore },
                })}
              />
            )
          )}
        </div>
      </div>

      {/* 良性区域重叠 */}
      <div>
        <h4 className="text-sm font-medium text-fg-default mb-2">与已建立良性区域的重叠</h4>
        <div className="space-y-2">
          {(Object.entries(GAIN_BENIGN_OPTIONS) as [Section2GainBenignOption, typeof GAIN_BENIGN_OPTIONS['2C']][]).map(
            ([key, option]) => (
              <RadioOption
                key={key}
                id={`section2-benign-${key}`}
                name="section2-benign"
                label={option.label}
                description={option.description}
                score={gainCriteria.benignOverlap.selected === key ? gainCriteria.benignOverlap.score : option.defaultScore}
                checked={gainCriteria.benignOverlap.selected === key}
                onChange={() => onChange({
                  ...gainCriteria,
                  benignOverlap: { selected: key, score: option.defaultScore },
                })}
                hasRange={!!option.range}
                range={option.range}
                onScoreChange={(score) => onChange({
                  ...gainCriteria,
                  benignOverlap: { selected: key, score },
                })}
              />
            )
          )}
        </div>
      </div>

      {/* HI基因重叠 */}
      <div>
        <h4 className="text-sm font-medium text-fg-default mb-2">与已建立HI基因的重叠</h4>
        <div className="space-y-2">
          {(Object.entries(GAIN_HI_OPTIONS) as [Section2GainHIOption, typeof GAIN_HI_OPTIONS['2H']][]).map(
            ([key, option]) => (
              <RadioOption
                key={key}
                id={`section2-hi-${key}`}
                name="section2-hi"
                label={option.label}
                description={option.description}
                score={gainCriteria.hiOverlap.selected === key ? gainCriteria.hiOverlap.score : option.defaultScore}
                checked={gainCriteria.hiOverlap.selected === key}
                onChange={() => onChange({
                  ...gainCriteria,
                  hiOverlap: { selected: key, score: option.defaultScore },
                })}
                hasRange={!!option.range}
                range={option.range}
                onScoreChange={(score) => onChange({
                  ...gainCriteria,
                  hiOverlap: { selected: key, score },
                })}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
