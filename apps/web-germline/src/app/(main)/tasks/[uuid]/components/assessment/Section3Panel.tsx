'use client';

import * as React from 'react';
import { Tooltip } from '@schema/ui-kit';
import { HelpCircle } from 'lucide-react';
import type { Section3Criteria } from '../../types';

interface Section3PanelProps {
  cnvType: 'Amplification' | 'Deletion';
  criteria: Section3Criteria;
  onChange: (criteria: Section3Criteria) => void;
}

/**
 * 基因数量对应的评分
 */
const GENE_COUNT_SCORES = [
  { range: '0', min: 0, max: 0, score: 0, description: '无蛋白编码基因' },
  { range: '1-24', min: 1, max: 24, score: 0, description: '1-24个蛋白编码基因' },
  { range: '25-34', min: 25, max: 34, score: 0.45, description: '25-34个蛋白编码基因' },
  { range: '35+', min: 35, max: Infinity, score: 0.90, description: '35个或更多蛋白编码基因' },
] as const;

/**
 * 根据基因数量获取评分
 */
function getScoreForGeneCount(count: number): number {
  if (count === 0) return 0;
  if (count >= 1 && count <= 24) return 0;
  if (count >= 25 && count <= 34) return 0.45;
  if (count >= 35) return 0.90;
  return 0;
}

/**
 * Section 3: 基因数量评估面板
 */
export function Section3Panel({ cnvType, criteria, onChange }: Section3PanelProps) {
  const currentScore = getScoreForGeneCount(criteria.geneCount);

  const handleGeneCountChange = (value: string) => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count >= 0) {
      onChange({ geneCount: count });
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-fg-muted">
        根据CNV中完全或部分包含的蛋白编码RefSeq基因数量进行评分。
      </div>

      {/* 基因数量输入 */}
      <div className="flex items-center gap-4">
        <label htmlFor="gene-count" className="text-sm text-fg-default">
          蛋白编码基因数量
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            id="gene-count"
            min={0}
            value={criteria.geneCount}
            onChange={(e) => handleGeneCountChange(e.target.value)}
            className="w-24 px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
          />
          <Tooltip 
            content="输入CNV区域内完全或部分包含的蛋白编码RefSeq基因数量" 
            placement="right" 
            variant="nav"
          >
            <HelpCircle className="w-4 h-4 text-fg-muted" />
          </Tooltip>
        </div>
      </div>

      {/* 评分表格 */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-canvas-subtle">
            <tr>
              <th className="px-4 py-2 text-left text-fg-muted font-medium">基因数量范围</th>
              <th className="px-4 py-2 text-right text-fg-muted font-medium">评分</th>
            </tr>
          </thead>
          <tbody>
            {GENE_COUNT_SCORES.map((item, index) => {
              const isActive = 
                (item.min === 0 && criteria.geneCount === 0) ||
                (criteria.geneCount >= item.min && criteria.geneCount <= item.max);
              
              return (
                <tr 
                  key={index}
                  className={`
                    border-t border-border
                    ${isActive ? 'bg-accent-subtle' : ''}
                  `}
                >
                  <td className="px-4 py-2 text-fg-default">
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-accent-emphasis" />
                      )}
                      <span>{item.range}</span>
                      <span className="text-xs text-fg-muted">({item.description})</span>
                    </div>
                  </td>
                  <td className={`px-4 py-2 text-right font-mono ${
                    item.score > 0 ? 'text-success-fg' : 'text-fg-muted'
                  }`}>
                    {item.score > 0 ? '+' : ''}{item.score.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 当前评分 */}
      <div className="flex items-center justify-between p-3 bg-canvas-subtle rounded-lg">
        <span className="text-sm text-fg-muted">当前评分</span>
        <span className={`text-lg font-mono font-bold ${
          currentScore > 0 ? 'text-success-fg' : 'text-fg-muted'
        }`}>
          {currentScore > 0 ? '+' : ''}{currentScore.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
