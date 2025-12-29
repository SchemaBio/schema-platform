'use client';

import * as React from 'react';
import { X, ExternalLink, FileText, Database, Dna, Edit2, Check, Plus, Trash2 } from 'lucide-react';
import { Tag } from '@schema/ui-kit';
import type { SNVIndel, ACMGClassification } from '../types';
import { ACMG_CONFIG } from '../mock-data';

// ACMG 证据项定义
const ACMG_CRITERIA_OPTIONS = {
  pathogenic: {
    veryStrong: ['PVS1'],
    strong: ['PS1', 'PS2', 'PS3', 'PS4'],
    moderate: ['PM1', 'PM2', 'PM3', 'PM4', 'PM5', 'PM6'],
    supporting: ['PP1', 'PP2', 'PP3', 'PP4', 'PP5'],
  },
  benign: {
    standalone: ['BA1'],
    strong: ['BS1', 'BS2', 'BS3', 'BS4'],
    supporting: ['BP1', 'BP2', 'BP3', 'BP4', 'BP5', 'BP6', 'BP7'],
  },
};

interface VariantDetailPanelProps {
  variant: SNVIndel | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenIGV?: (chromosome: string, position: number) => void;
  onUpdateClassification?: (variantId: string, classification: ACMGClassification, criteria: string[]) => void;
}

// 信息项组件
function InfoItem({ label, value, link }: { label: string; value?: React.ReactNode; link?: string }) {
  if (value === undefined || value === null || value === '' || value === '-') {
    return (
      <div className="flex justify-between py-1.5 border-b border-border-subtle last:border-0">
        <span className="text-fg-muted text-sm">{label}</span>
        <span className="text-fg-subtle text-sm">-</span>
      </div>
    );
  }

  return (
    <div className="flex justify-between py-1.5 border-b border-border-subtle last:border-0">
      <span className="text-fg-muted text-sm">{label}</span>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-fg text-sm hover:underline flex items-center gap-1"
        >
          {value}
          <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <span className="text-fg-default text-sm font-medium">{value}</span>
      )}
    </div>
  );
}

// 分组标题组件
function SectionTitle({ icon: Icon, title, action }: { icon: React.ElementType; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-5 first:mt-0">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-fg-muted" />
        <h4 className="text-sm font-medium text-fg-default">{title}</h4>
      </div>
      {action}
    </div>
  );
}

// ACMG 分类编辑器组件
function ACMGClassificationEditor({
  currentClassification,
  currentCriteria,
  onSave,
  onCancel,
}: {
  currentClassification: ACMGClassification;
  currentCriteria: string[];
  onSave: (classification: ACMGClassification, criteria: string[]) => void;
  onCancel: () => void;
}) {
  const [classification, setClassification] = React.useState<ACMGClassification>(currentClassification);
  const [selectedCriteria, setSelectedCriteria] = React.useState<Set<string>>(new Set(currentCriteria));

  const toggleCriteria = (criterion: string) => {
    const newSet = new Set(selectedCriteria);
    if (newSet.has(criterion)) {
      newSet.delete(criterion);
    } else {
      newSet.add(criterion);
    }
    setSelectedCriteria(newSet);
  };

  const handleSave = () => {
    onSave(classification, Array.from(selectedCriteria));
  };

  return (
    <div className="space-y-4">
      {/* 分类选择 */}
      <div>
        <label className="block text-sm text-fg-muted mb-2">ACMG 分类</label>
        <select
          value={classification}
          onChange={(e) => setClassification(e.target.value as ACMGClassification)}
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default text-fg-default"
        >
          {Object.entries(ACMG_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* 致病性证据 */}
      <div>
        <label className="block text-sm text-fg-muted mb-2">致病性证据</label>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-fg-subtle">非常强 (PVS)</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {ACMG_CRITERIA_OPTIONS.pathogenic.veryStrong.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCriteria(c)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedCriteria.has(c)
                      ? 'bg-danger-emphasis text-fg-on-emphasis'
                      : 'bg-canvas-inset text-fg-muted hover:bg-canvas-subtle'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-fg-subtle">强 (PS)</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {ACMG_CRITERIA_OPTIONS.pathogenic.strong.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCriteria(c)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedCriteria.has(c)
                      ? 'bg-danger-subtle text-danger-fg'
                      : 'bg-canvas-inset text-fg-muted hover:bg-canvas-subtle'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-fg-subtle">中等 (PM)</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {ACMG_CRITERIA_OPTIONS.pathogenic.moderate.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCriteria(c)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedCriteria.has(c)
                      ? 'bg-warning-subtle text-warning-fg'
                      : 'bg-canvas-inset text-fg-muted hover:bg-canvas-subtle'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-fg-subtle">支持 (PP)</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {ACMG_CRITERIA_OPTIONS.pathogenic.supporting.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCriteria(c)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedCriteria.has(c)
                      ? 'bg-warning-subtle text-warning-fg'
                      : 'bg-canvas-inset text-fg-muted hover:bg-canvas-subtle'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 良性证据 */}
      <div>
        <label className="block text-sm text-fg-muted mb-2">良性证据</label>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-fg-subtle">独立 (BA)</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {ACMG_CRITERIA_OPTIONS.benign.standalone.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCriteria(c)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedCriteria.has(c)
                      ? 'bg-success-emphasis text-fg-on-emphasis'
                      : 'bg-canvas-inset text-fg-muted hover:bg-canvas-subtle'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-fg-subtle">强 (BS)</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {ACMG_CRITERIA_OPTIONS.benign.strong.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCriteria(c)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedCriteria.has(c)
                      ? 'bg-success-subtle text-success-fg'
                      : 'bg-canvas-inset text-fg-muted hover:bg-canvas-subtle'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-fg-subtle">支持 (BP)</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {ACMG_CRITERIA_OPTIONS.benign.supporting.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCriteria(c)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedCriteria.has(c)
                      ? 'bg-success-subtle text-success-fg'
                      : 'bg-canvas-inset text-fg-muted hover:bg-canvas-subtle'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-accent-emphasis text-fg-on-emphasis rounded-md hover:bg-accent-emphasis/90 transition-colors"
        >
          <Check className="w-4 h-4" />
          保存
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 text-sm border border-border rounded-md hover:bg-canvas-inset transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
}

export function VariantDetailPanel({ variant, isOpen, onClose, onOpenIGV, onUpdateClassification }: VariantDetailPanelProps) {
  const [isEditingACMG, setIsEditingACMG] = React.useState(false);
  const [localClassification, setLocalClassification] = React.useState<ACMGClassification | null>(null);
  const [localCriteria, setLocalCriteria] = React.useState<string[] | null>(null);

  // 当 variant 变化时重置编辑状态
  React.useEffect(() => {
    setIsEditingACMG(false);
    setLocalClassification(null);
    setLocalCriteria(null);
  }, [variant?.id]);

  if (!isOpen || !variant) return null;

  const currentClassification = localClassification ?? variant.acmgClassification;
  const currentCriteria = localCriteria ?? variant.acmgCriteria ?? [];
  const acmgConfig = ACMG_CONFIG[currentClassification];
  
  // 格式化频率显示
  const formatFrequency = (freq?: number) => {
    if (freq === undefined || freq === null) return undefined;
    if (freq === 0) return '0';
    if (freq < 0.0001) return freq.toExponential(2);
    return (freq * 100).toFixed(4) + '%';
  };

  // 格式化评分显示
  const formatScore = (score?: number, precision = 2) => {
    if (score === undefined || score === null) return undefined;
    return score.toFixed(precision);
  };

  // 保存 ACMG 分类
  const handleSaveACMG = (classification: ACMGClassification, criteria: string[]) => {
    setLocalClassification(classification);
    setLocalCriteria(criteria);
    setIsEditingACMG(false);
    onUpdateClassification?.(variant.id, classification, criteria);
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
            <h3 className="text-base font-medium text-fg-default">变异详情</h3>
            <Tag variant={acmgConfig.variant}>{acmgConfig.label}</Tag>
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
          {/* 基本信息 */}
          <SectionTitle icon={Dna} title="基本信息" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            <InfoItem label="基因" value={variant.gene} />
            <InfoItem 
              label="位置" 
              value={
                <button
                  onClick={() => onOpenIGV?.(variant.chromosome, variant.position)}
                  className="text-accent-fg hover:underline"
                >
                  {variant.chromosome}:{variant.position.toLocaleString()}
                </button>
              }
            />
            <InfoItem label="参考/变异" value={`${variant.ref} > ${variant.alt}`} />
            <InfoItem label="变异类型" value={variant.variantType} />
            <InfoItem label="杂合性" value={
              variant.zygosity === 'Heterozygous' ? '杂合' :
              variant.zygosity === 'Homozygous' ? '纯合' : '半合'
            } />
            <InfoItem label="转录本" value={variant.transcript} />
            <InfoItem label="cDNA变化" value={variant.hgvsc} />
            <InfoItem label="蛋白质变化" value={variant.hgvsp} />
            <InfoItem label="变异后果" value={variant.consequence} />
          </div>

          {/* 测序质量 */}
          <SectionTitle icon={FileText} title="测序质量" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            <InfoItem label="等位基因频率" value={`${(variant.alleleFrequency * 100).toFixed(1)}%`} />
            <InfoItem label="覆盖深度" value={`${variant.depth}X`} />
          </div>

          {/* 人群频率 */}
          <SectionTitle icon={Database} title="人群频率" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            <InfoItem label="gnomAD 总体" value={formatFrequency(variant.gnomadAF)} />
            <InfoItem label="gnomAD 东亚" value={formatFrequency(variant.gnomadEasAF)} />
            <InfoItem label="ExAC" value={formatFrequency(variant.exacAF)} />
          </div>

          {/* 功能预测 */}
          <SectionTitle icon={Dna} title="功能预测" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            <InfoItem 
              label="SIFT" 
              value={variant.siftScore !== undefined ? 
                `${formatScore(variant.siftScore)} (${variant.siftPrediction})` : undefined
              } 
            />
            <InfoItem 
              label="PolyPhen-2" 
              value={variant.polyphenScore !== undefined ? 
                `${formatScore(variant.polyphenScore)} (${variant.polyphenPrediction})` : undefined
              } 
            />
            <InfoItem label="CADD" value={formatScore(variant.caddScore)} />
            <InfoItem label="REVEL" value={formatScore(variant.revelScore)} />
            <InfoItem label="SpliceAI" value={formatScore(variant.spliceAI)} />
          </div>

          {/* ACMG 分类 */}
          <SectionTitle 
            icon={FileText} 
            title="ACMG 分类" 
            action={
              !isEditingACMG && (
                <button
                  onClick={() => setIsEditingACMG(true)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-fg-muted hover:text-fg-default hover:bg-canvas-inset rounded transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  编辑
                </button>
              )
            }
          />
          <div className="bg-canvas-subtle rounded-lg p-3">
            {isEditingACMG ? (
              <ACMGClassificationEditor
                currentClassification={currentClassification}
                currentCriteria={currentCriteria}
                onSave={handleSaveACMG}
                onCancel={() => setIsEditingACMG(false)}
              />
            ) : (
              <>
                <InfoItem label="分类" value={<Tag variant={acmgConfig.variant}>{acmgConfig.label}</Tag>} />
                <InfoItem 
                  label="证据项" 
                  value={currentCriteria.length ? (
                    <div className="flex flex-wrap gap-1">
                      {currentCriteria.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 text-xs bg-canvas-inset rounded">
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : undefined}
                />
              </>
            )}
          </div>

          {/* 临床意义 */}
          <SectionTitle icon={Database} title="临床意义" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            <InfoItem 
              label="ClinVar" 
              value={variant.clinvarId}
              link={variant.clinvarId ? `https://www.ncbi.nlm.nih.gov/clinvar/variation/${variant.clinvarId.replace('VCV', '')}` : undefined}
            />
            <InfoItem label="ClinVar 意义" value={variant.clinvarSignificance} />
            <InfoItem 
              label="dbSNP" 
              value={variant.rsId}
              link={variant.rsId ? `https://www.ncbi.nlm.nih.gov/snp/${variant.rsId}` : undefined}
            />
            <InfoItem 
              label="OMIM" 
              value={variant.omimId}
              link={variant.omimId ? `https://omim.org/entry/${variant.omimId}` : undefined}
            />
            <InfoItem label="疾病关联" value={variant.diseaseAssociation} />
            <InfoItem label="遗传模式" value={
              variant.inheritanceMode === 'AD' ? '常染色体显性' :
              variant.inheritanceMode === 'AR' ? '常染色体隐性' :
              variant.inheritanceMode === 'XL' ? 'X连锁' :
              variant.inheritanceMode === 'XLD' ? 'X连锁显性' :
              variant.inheritanceMode === 'XLR' ? 'X连锁隐性' :
              variant.inheritanceMode
            } />
          </div>

          {/* 文献 */}
          {variant.pubmedIds && variant.pubmedIds.length > 0 && (
            <>
              <SectionTitle icon={FileText} title="相关文献" />
              <div className="bg-canvas-subtle rounded-lg p-3">
                <div className="flex flex-wrap gap-2">
                  {variant.pubmedIds.map((pmid) => (
                    <a
                      key={pmid}
                      href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-canvas-inset text-accent-fg rounded hover:bg-accent-subtle transition-colors"
                    >
                      PMID:{pmid}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="border-t border-border p-4 bg-canvas-subtle">
          <div className="flex gap-2">
            <button
              onClick={() => onOpenIGV?.(variant.chromosome, variant.position)}
              className="flex-1 px-4 py-2 text-sm bg-accent-emphasis text-fg-on-emphasis rounded-md hover:bg-accent-emphasis/90 transition-colors"
            >
              在 IGV 中查看
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-canvas-inset transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
