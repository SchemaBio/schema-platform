'use client';

import * as React from 'react';
import { Tooltip } from '@schema/ui-kit';
import { HelpCircle, Plus, Minus } from 'lucide-react';
import type { Section4Criteria } from '../../types';

interface Section4PanelProps {
  cnvType: 'Amplification' | 'Deletion';
  criteria: Section4Criteria;
  onChange: (criteria: Section4Criteria) => void;
}

/**
 * 计数器组件
 */
function Counter({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  tooltip,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-fg-default">{label}</span>
        {tooltip && (
          <Tooltip content={tooltip} placement="right" variant="nav">
            <HelpCircle className="w-3 h-3 text-fg-muted" />
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="p-1 rounded border border-border hover:bg-canvas-subtle disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-mono text-sm">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="p-1 rounded border border-border hover:bg-canvas-subtle disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * 分数滑块组件
 */
function ScoreSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.05,
  tooltip,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  tooltip?: string;
}) {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-fg-default">{label}</span>
          {tooltip && (
            <Tooltip content={tooltip} placement="right" variant="nav">
              <HelpCircle className="w-3 h-3 text-fg-muted" />
            </Tooltip>
          )}
        </div>
        <span className={`text-sm font-mono ${
          value > 0 ? 'text-success-fg' : value < 0 ? 'text-danger-fg' : 'text-fg-muted'
        }`}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-canvas-inset rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-fg-muted mt-1">
        <span>{min.toFixed(2)}</span>
        <span>{max.toFixed(2)}</span>
      </div>
    </div>
  );
}

/**
 * Section 4: 文献和数据库证据评估面板
 */
export function Section4Panel({ cnvType, criteria, onChange }: Section4PanelProps) {
  const updateDeNovo = (key: '4A' | '4B' | '4C', field: 'confirmedCount' | 'assumedCount', value: number) => {
    onChange({
      ...criteria,
      deNovo: {
        ...criteria.deNovo,
        [key]: {
          ...criteria.deNovo[key],
          [field]: value,
        },
      },
    });
  };

  const updateDeNovo4D = (count: number, score: number) => {
    onChange({
      ...criteria,
      deNovo: {
        ...criteria.deNovo,
        '4D': { count, score },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* De Novo 证据 */}
      <div>
        <h4 className="text-sm font-medium text-fg-default mb-3">个案证据 - De Novo</h4>
        <div className="space-y-4 pl-2 border-l-2 border-border">
          {/* 4A */}
          <div className="bg-canvas-subtle rounded-lg p-3">
            <div className="text-sm text-fg-default mb-2">
              4A. 高度特异且独特的表型
              <span className="text-xs text-fg-muted ml-2">(确认: +0.45, 假定: +0.30)</span>
            </div>
            <Counter
              label="确认的de novo"
              value={criteria.deNovo['4A'].confirmedCount}
              onChange={(v) => updateDeNovo('4A', 'confirmedCount', v)}
              tooltip="经父母验证确认的de novo变异"
            />
            <Counter
              label="假定的de novo"
              value={criteria.deNovo['4A'].assumedCount}
              onChange={(v) => updateDeNovo('4A', 'assumedCount', v)}
              tooltip="未经父母验证但假定为de novo的变异"
            />
          </div>

          {/* 4B */}
          <div className="bg-canvas-subtle rounded-lg p-3">
            <div className="text-sm text-fg-default mb-2">
              4B. 高度特异但不独特的表型
              <span className="text-xs text-fg-muted ml-2">(确认: +0.30, 假定: +0.15)</span>
            </div>
            <Counter
              label="确认的de novo"
              value={criteria.deNovo['4B'].confirmedCount}
              onChange={(v) => updateDeNovo('4B', 'confirmedCount', v)}
            />
            <Counter
              label="假定的de novo"
              value={criteria.deNovo['4B'].assumedCount}
              onChange={(v) => updateDeNovo('4B', 'assumedCount', v)}
            />
          </div>

          {/* 4C */}
          <div className="bg-canvas-subtle rounded-lg p-3">
            <div className="text-sm text-fg-default mb-2">
              4C. 一致但不高度特异的表型
              <span className="text-xs text-fg-muted ml-2">(确认: +0.15, 假定: +0.10)</span>
            </div>
            <Counter
              label="确认的de novo"
              value={criteria.deNovo['4C'].confirmedCount}
              onChange={(v) => updateDeNovo('4C', 'confirmedCount', v)}
            />
            <Counter
              label="假定的de novo"
              value={criteria.deNovo['4C'].assumedCount}
              onChange={(v) => updateDeNovo('4C', 'assumedCount', v)}
            />
          </div>

          {/* 4D */}
          <div className="bg-canvas-subtle rounded-lg p-3">
            <div className="text-sm text-fg-default mb-2">
              4D. 不一致的表型
              <span className="text-xs text-fg-muted ml-2">(范围: 0 到 -0.30)</span>
            </div>
            <Counter
              label="病例数"
              value={criteria.deNovo['4D'].count}
              onChange={(v) => updateDeNovo4D(v, criteria.deNovo['4D'].score)}
            />
            <ScoreSlider
              label="评分"
              value={criteria.deNovo['4D'].score}
              onChange={(v) => updateDeNovo4D(criteria.deNovo['4D'].count, v)}
              min={-0.30}
              max={0}
            />
          </div>
        </div>
      </div>

      {/* 未知遗传证据 */}
      <div>
        <h4 className="text-sm font-medium text-fg-default mb-3">个案证据 - 未知遗传</h4>
        <div className="bg-canvas-subtle rounded-lg p-3">
          <div className="text-sm text-fg-default mb-2">
            4E. 高度特异表型，遗传未知
            <span className="text-xs text-fg-muted ml-2">(每例 +0.10, 最大 +0.30)</span>
          </div>
          <Counter
            label="病例数"
            value={criteria.unknownInheritance['4E'].count}
            onChange={(v) => onChange({
              ...criteria,
              unknownInheritance: { '4E': { count: v } },
            })}
          />
        </div>
      </div>

      {/* 分离证据 */}
      <div>
        <h4 className="text-sm font-medium text-fg-default mb-3">个案证据 - 家系分离</h4>
        <div className="space-y-2">
          <div className="bg-canvas-subtle rounded-lg p-3">
            <Counter
              label="4F. 3+受累家属, LOD ≥ 2"
              value={criteria.segregation['4F']}
              onChange={(v) => onChange({
                ...criteria,
                segregation: { ...criteria.segregation, '4F': v },
              })}
              tooltip="每次 +0.45, 最大 +0.45"
            />
          </div>
          <div className="bg-canvas-subtle rounded-lg p-3">
            <Counter
              label="4G. 2个受累家属"
              value={criteria.segregation['4G']}
              onChange={(v) => onChange({
                ...criteria,
                segregation: { ...criteria.segregation, '4G': v },
              })}
              tooltip="每次 +0.30"
            />
          </div>
          <div className="bg-canvas-subtle rounded-lg p-3">
            <Counter
              label="4H. 1个受累家属"
              value={criteria.segregation['4H']}
              onChange={(v) => onChange({
                ...criteria,
                segregation: { ...criteria.segregation, '4H': v },
              })}
              tooltip="每次 +0.15"
            />
          </div>
        </div>
      </div>

      {/* 非分离证据 */}
      <div>
        <h4 className="text-sm font-medium text-fg-default mb-3">个案证据 - 非分离</h4>
        <div className="space-y-2">
          <div className="bg-canvas-subtle rounded-lg p-3">
            <div className="text-sm text-fg-default mb-2">4I. 未在受累家属中发现</div>
            <Counter
              label="家系数"
              value={criteria.nonSegregation['4I'].familyCount}
              onChange={(v) => onChange({
                ...criteria,
                nonSegregation: {
                  ...criteria.nonSegregation,
                  '4I': { familyCount: v, score: Math.max(-0.45 * v, -0.90) },
                },
              })}
            />
          </div>
          <div className="bg-canvas-subtle rounded-lg p-3">
            <div className="text-sm text-fg-default mb-2">4J. 在未受累家属中发现（特异表型）</div>
            <Counter
              label="家系数"
              value={criteria.nonSegregation['4J'].familyCount}
              onChange={(v) => onChange({
                ...criteria,
                nonSegregation: {
                  ...criteria.nonSegregation,
                  '4J': { familyCount: v, score: Math.max(-0.30 * v, -0.90) },
                },
              })}
            />
          </div>
          <div className="bg-canvas-subtle rounded-lg p-3">
            <div className="text-sm text-fg-default mb-2">4K. 在未受累家属中发现（非特异表型）</div>
            <Counter
              label="家系数"
              value={criteria.nonSegregation['4K'].familyCount}
              onChange={(v) => onChange({
                ...criteria,
                nonSegregation: {
                  ...criteria.nonSegregation,
                  '4K': { familyCount: v, score: Math.max(-0.15 * v, -0.30) },
                },
              })}
            />
          </div>
        </div>
      </div>

      {/* 病例对照证据 */}
      <div>
        <h4 className="text-sm font-medium text-fg-default mb-3">病例对照和人群证据</h4>
        <div className="space-y-2">
          <div className="bg-canvas-subtle rounded-lg p-3">
            <ScoreSlider
              label="4L. 病例中显著增加（特异表型）"
              value={criteria.caseControl['4L'].score}
              onChange={(v) => onChange({
                ...criteria,
                caseControl: { ...criteria.caseControl, '4L': { studyCount: 1, score: v } },
              })}
              min={0}
              max={0.45}
              tooltip="每项研究 0 到 +0.45"
            />
          </div>
          <div className="bg-canvas-subtle rounded-lg p-3">
            <ScoreSlider
              label="4M. 病例中显著增加（非特异表型）"
              value={criteria.caseControl['4M'].score}
              onChange={(v) => onChange({
                ...criteria,
                caseControl: { ...criteria.caseControl, '4M': { studyCount: 1, score: v } },
              })}
              min={0}
              max={0.45}
            />
          </div>
          <div className="bg-canvas-subtle rounded-lg p-3">
            <ScoreSlider
              label="4N. 病例与对照无显著差异"
              value={criteria.caseControl['4N'].score}
              onChange={(v) => onChange({
                ...criteria,
                caseControl: { ...criteria.caseControl, '4N': { studyCount: 1, score: v } },
              })}
              min={-0.90}
              max={0}
            />
          </div>
          <div className="bg-canvas-subtle rounded-lg p-3">
            <ScoreSlider
              label="4O. 与常见人群变异重叠"
              value={criteria.caseControl['4O'].score}
              onChange={(v) => onChange({
                ...criteria,
                caseControl: { ...criteria.caseControl, '4O': { score: v } },
              })}
              min={-1.00}
              max={0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
