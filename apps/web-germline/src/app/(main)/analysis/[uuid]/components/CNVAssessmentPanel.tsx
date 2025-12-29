'use client';

import * as React from 'react';
import { X, Calculator, Save, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { Tag } from '@schema/ui-kit';
import type { 
  CNVSegment, 
  CNVExon, 
  CNVAssessment,
  ClinGenClassification,
  SectionScores,
  LossAssessmentCriteria,
  GainAssessmentCriteria,
  Section2LossCriteria,
  Section2GainCriteria,
} from '../types';
import { 
  getClassificationLabel, 
  getClassificationVariant,
  formatScore,
} from '../utils/pathogenicity-classifier';
import { Section1Panel } from './assessment/Section1Panel';
import { Section2Panel } from './assessment/Section2Panel';
import { Section3Panel } from './assessment/Section3Panel';
import { Section4Panel } from './assessment/Section4Panel';
import { Section5Panel } from './assessment/Section5Panel';

interface CNVAssessmentPanelProps {
  /** CNV变异数据 */
  cnv: CNVSegment | CNVExon | null;
  /** 当前评估数据 */
  assessment: CNVAssessment | null;
  /** 是否打开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 保存回调 */
  onSave?: (assessment: CNVAssessment) => void;
  /** 重置回调 */
  onReset?: () => void;
  /** 标准变更回调 */
  onCriteriaChange?: (criteria: LossAssessmentCriteria | GainAssessmentCriteria) => void;
}

/**
 * 分数汇总卡片
 */
function ScoreSummaryCard({
  classification,
  totalScore,
  sectionScores,
  isUserModified,
}: {
  classification: ClinGenClassification;
  totalScore: number;
  sectionScores: SectionScores;
  isUserModified: boolean;
}) {
  const variant = getClassificationVariant(classification);
  const label = getClassificationLabel(classification);

  return (
    <div className="bg-canvas-subtle rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-fg-muted" />
          <span className="text-sm font-medium text-fg-default">评估结果</span>
        </div>
        {isUserModified && (
          <span className="text-xs text-warning-fg">已手动修改</span>
        )}
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <Tag variant={variant} className="text-base px-3 py-1">
          {label}
        </Tag>
        <span className="text-2xl font-bold text-fg-default">
          {formatScore(totalScore)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-fg-muted mb-2">各部分评分</div>
        <ScoreBar label="Section 1" score={sectionScores.section1} />
        <ScoreBar label="Section 2" score={sectionScores.section2} />
        <ScoreBar label="Section 3" score={sectionScores.section3} />
        <ScoreBar label="Section 4" score={sectionScores.section4} />
        <ScoreBar label="Section 5" score={sectionScores.section5} />
      </div>
    </div>
  );
}

/**
 * 单个分数条
 */
function ScoreBar({ label, score }: { label: string; score: number }) {
  const isPositive = score > 0;
  const isNegative = score < 0;
  
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-fg-muted">{label}</span>
      <div className="flex-1 h-2 bg-canvas-inset rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all ${
            isPositive ? 'bg-success-fg' : isNegative ? 'bg-danger-fg' : 'bg-fg-muted'
          }`}
          style={{ 
            width: `${Math.min(Math.abs(score) * 50, 100)}%`,
            marginLeft: isNegative ? 'auto' : 0,
          }}
        />
      </div>
      <span className={`w-12 text-right font-mono ${
        isPositive ? 'text-success-fg' : isNegative ? 'text-danger-fg' : 'text-fg-muted'
      }`}>
        {score >= 0 ? '+' : ''}{formatScore(score)}
      </span>
    </div>
  );
}

/**
 * 可折叠的Section面板
 */
function CollapsibleSection({
  title,
  score,
  defaultOpen = false,
  children,
}: {
  title: string;
  score: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg mb-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-canvas-subtle transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-fg-muted" />
          ) : (
            <ChevronRight className="w-4 h-4 text-fg-muted" />
          )}
          <span className="text-sm font-medium text-fg-default">{title}</span>
        </div>
        <span className={`text-sm font-mono ${
          score > 0 ? 'text-success-fg' : score < 0 ? 'text-danger-fg' : 'text-fg-muted'
        }`}>
          {score >= 0 ? '+' : ''}{formatScore(score)}
        </span>
      </button>
      {isOpen && (
        <div className="p-3 pt-0 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * CNV评估侧边栏主组件
 */
export function CNVAssessmentPanel({
  cnv,
  assessment,
  isOpen,
  onClose,
  onSave,
  onReset,
  onCriteriaChange,
}: CNVAssessmentPanelProps) {
  if (!isOpen || !cnv || !assessment) return null;

  const isLoss = cnv.type === 'Deletion';
  const frameworkType = isLoss ? 'Loss' : 'Gain';
  const criteria = assessment.criteria;

  // 处理Section 1变更
  const handleSection1Change = (newSection1: LossAssessmentCriteria['section1'] | GainAssessmentCriteria['section1']) => {
    if (onCriteriaChange) {
      onCriteriaChange({
        ...criteria,
        section1: newSection1,
      } as LossAssessmentCriteria | GainAssessmentCriteria);
    }
  };

  // 处理Section 2变更
  const handleSection2Change = (newSection2: Section2LossCriteria | Section2GainCriteria) => {
    if (onCriteriaChange) {
      onCriteriaChange({
        ...criteria,
        section2: newSection2,
      } as LossAssessmentCriteria | GainAssessmentCriteria);
    }
  };

  // 处理Section 3变更
  const handleSection3Change = (newSection3: LossAssessmentCriteria['section3']) => {
    if (onCriteriaChange) {
      onCriteriaChange({
        ...criteria,
        section3: newSection3,
      } as LossAssessmentCriteria | GainAssessmentCriteria);
    }
  };

  // 处理Section 4变更
  const handleSection4Change = (newSection4: LossAssessmentCriteria['section4']) => {
    if (onCriteriaChange) {
      onCriteriaChange({
        ...criteria,
        section4: newSection4,
      } as LossAssessmentCriteria | GainAssessmentCriteria);
    }
  };

  // 处理Section 5变更
  const handleSection5Change = (newSection5: LossAssessmentCriteria['section5']) => {
    if (onCriteriaChange) {
      onCriteriaChange({
        ...criteria,
        section5: newSection5,
      } as LossAssessmentCriteria | GainAssessmentCriteria);
    }
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* 侧边面板 */}
      <div className="fixed right-0 top-0 h-full w-[480px] bg-white dark:bg-[#0d1117] border-l border-border shadow-xl z-50 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-canvas-subtle">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-fg-muted" />
            <div>
              <h3 className="text-base font-medium text-fg-default">
                ClinGen CNV {frameworkType} 评估
              </h3>
              <p className="text-xs text-fg-muted">
                {cnv.chromosome}:{cnv.startPosition}-{cnv.endPosition}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-fg-muted hover:text-fg-default hover:bg-canvas-inset rounded transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 分数汇总 */}
          <ScoreSummaryCard
            classification={assessment.classification}
            totalScore={assessment.totalScore}
            sectionScores={assessment.sectionScores}
            isUserModified={assessment.isUserModified}
          />

          {/* Section 面板 */}
          <div className="space-y-2">
            <CollapsibleSection 
              title="Section 1: 基因组内容初始评估" 
              score={assessment.sectionScores.section1}
              defaultOpen
            >
              <Section1Panel
                cnvType={cnv.type}
                criteria={criteria.section1}
                onChange={handleSection1Change}
              />
            </CollapsibleSection>

            <CollapsibleSection 
              title={`Section 2: ${isLoss ? 'HI' : 'TS/HI'}基因/区域重叠`}
              score={assessment.sectionScores.section2}
            >
              <Section2Panel
                cnvType={cnv.type}
                criteria={criteria.section2}
                onChange={handleSection2Change}
              />
            </CollapsibleSection>

            <CollapsibleSection 
              title="Section 3: 基因数量评估" 
              score={assessment.sectionScores.section3}
            >
              <Section3Panel
                cnvType={cnv.type}
                criteria={criteria.section3}
                onChange={handleSection3Change}
              />
            </CollapsibleSection>

            <CollapsibleSection 
              title="Section 4: 文献和数据库证据" 
              score={assessment.sectionScores.section4}
            >
              <Section4Panel
                cnvType={cnv.type}
                criteria={criteria.section4}
                onChange={handleSection4Change}
              />
            </CollapsibleSection>

            <CollapsibleSection 
              title="Section 5: 遗传模式/家族史" 
              score={assessment.sectionScores.section5}
            >
              <Section5Panel
                cnvType={cnv.type}
                criteria={criteria.section5}
                onChange={handleSection5Change}
              />
            </CollapsibleSection>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="border-t border-border p-4 bg-canvas-subtle">
          <div className="flex gap-3">
            {onReset && (
              <button
                onClick={onReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm border border-border rounded-md hover:bg-canvas-inset transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>
            )}
            {onSave && (
              <button
                onClick={() => onSave(assessment)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-accent-emphasis text-white rounded-md hover:bg-accent-fg transition-colors"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
