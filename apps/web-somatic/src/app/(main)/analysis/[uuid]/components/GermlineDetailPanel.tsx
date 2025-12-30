'use client';

import * as React from 'react';
import { X, ExternalLink, FileText, Database, Dna, Activity, Edit2, Check } from 'lucide-react';
import { Tag } from '@schema/ui-kit';
import type { ACMGClassification } from '../types';
import { ACMG_CONFIG } from '../mock-data';

// 突变类型
type VariantType = 'SNV' | 'Insertion' | 'Deletion' | 'Complex';

// 突变后果
type Consequence = 
  | 'Synonymous_substitution'
  | 'Missense_substitution'
  | 'Nonsense_substitution'
  | 'Inframe_insertion'
  | 'Frameshift_insertion'
  | 'Inframe_deletion'
  | 'Frameshift_deletion'
  | 'Complex_mutation'
  | 'Splice_Site_mutation'
  | 'Other';

// 胚系变异
interface GermlineVariant {
  id: string;
  chr: string;
  start: number;
  end: number;
  ref: string;
  alt: string;
  gene: string;
  type: VariantType;
  transcript: string;
  cHGVS: string;
  pHGVS: string;
  consequence: Consequence;
  affectedExon: string;
  vaf: number;
  depth: number;
  zygosity: 'Heterozygous' | 'Homozygous' | 'Hemizygous';
  acmgClassification: ACMGClassification;
  acmgCriteria: string[];
  diseaseAssociation: string;
  inheritanceMode: string;
  rsId?: string;
  clinvarId?: string;
  clinvarSignificance?: string;
  gnomadAF?: number;
  reviewed: boolean;
  reported: boolean;
}

interface GermlineDetailPanelProps {
  variant: GermlineVariant | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenIGV?: (chromosome: string, position: number) => void;
}

// 信息项组件
function InfoItem({ label, value, link, mono }: { label: string; value?: React.ReactNode; link?: string; mono?: boolean }) {
  if (value === undefined || value === null || value === '' || value === '-') {
    return (
      <div className="flex justify-between py-1.5 border-b border-border-subtle last:border-0">
        <span className="text-fg-muted text-xs">{label}</span>
        <span className="text-fg-subtle text-xs">-</span>
      </div>
    );
  }

  return (
    <div className="flex justify-between py-1.5 border-b border-border-subtle last:border-0 gap-2">
      <span className="text-fg-muted text-xs shrink-0">{label}</span>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-fg text-xs hover:underline flex items-center gap-1 text-right"
        >
          {value}
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      ) : (
        <span className={`text-fg-default text-xs text-right break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
      )}
    </div>
  );
}

// 分组标题组件
function SectionTitle({ icon: Icon, title, action }: { icon: React.ElementType; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2 mt-4 first:mt-0">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-fg-muted" />
        <h4 className="text-xs font-medium text-fg-default">{title}</h4>
      </div>
      {action}
    </div>
  );
}

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

// ACMG 分类编辑器
function ACMGEditor({
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

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-fg-muted mb-1.5">ACMG 分类</label>
        <select
          value={classification}
          onChange={(e) => setClassification(e.target.value as ACMGClassification)}
          className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-canvas-default text-fg-default"
        >
          {Object.entries(ACMG_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-fg-muted mb-1.5">致病性证据</label>
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1">
            {[...ACMG_CRITERIA_OPTIONS.pathogenic.veryStrong, ...ACMG_CRITERIA_OPTIONS.pathogenic.strong].map((c) => (
              <button
                key={c}
                onClick={() => toggleCriteria(c)}
                className={`px-1.5 py-0.5 text-xs rounded ${
                  selectedCriteria.has(c)
                    ? 'bg-danger-subtle text-danger-fg'
                    : 'bg-canvas-inset text-fg-muted hover:bg-canvas-subtle'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {[...ACMG_CRITERIA_OPTIONS.pathogenic.moderate, ...ACMG_CRITERIA_OPTIONS.pathogenic.supporting].map((c) => (
              <button
                key={c}
                onClick={() => toggleCriteria(c)}
                className={`px-1.5 py-0.5 text-xs rounded ${
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

      <div>
        <label className="block text-xs text-fg-muted mb-1.5">良性证据</label>
        <div className="flex flex-wrap gap-1">
          {[...ACMG_CRITERIA_OPTIONS.benign.standalone, ...ACMG_CRITERIA_OPTIONS.benign.strong, ...ACMG_CRITERIA_OPTIONS.benign.supporting].map((c) => (
            <button
              key={c}
              onClick={() => toggleCriteria(c)}
              className={`px-1.5 py-0.5 text-xs rounded ${
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

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(classification, Array.from(selectedCriteria))}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-accent-emphasis text-fg-on-emphasis rounded-md"
        >
          <Check className="w-3 h-3" />
          保存
        </button>
        <button
          onClick={onCancel}
          className="px-2 py-1.5 text-xs border border-border rounded-md hover:bg-canvas-inset"
        >
          取消
        </button>
      </div>
    </div>
  );
}

export function GermlineDetailPanel({ variant, isOpen, onClose, onOpenIGV }: GermlineDetailPanelProps) {
  const [isEditingACMG, setIsEditingACMG] = React.useState(false);
  const [localClassification, setLocalClassification] = React.useState<ACMGClassification | null>(null);
  const [localCriteria, setLocalCriteria] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    setIsEditingACMG(false);
    setLocalClassification(null);
    setLocalCriteria(null);
  }, [variant?.id]);

  if (!isOpen || !variant) return null;

  const currentClassification = localClassification ?? variant.acmgClassification;
  const currentCriteria = localCriteria ?? variant.acmgCriteria ?? [];
  const acmgConfig = ACMG_CONFIG[currentClassification];

  const formatFrequency = (freq?: number) => {
    if (freq === undefined || freq === null) return undefined;
    if (freq === 0) return '0';
    if (freq < 0.0001) return freq.toExponential(2);
    return (freq * 100).toFixed(4) + '%';
  };

  const handleSaveACMG = (classification: ACMGClassification, criteria: string[]) => {
    setLocalClassification(classification);
    setLocalCriteria(criteria);
    setIsEditingACMG(false);
  };

  const getTypeVariant = (type: VariantType): 'info' | 'warning' | 'danger' | 'success' => {
    switch (type) {
      case 'SNV': return 'info';
      case 'Insertion': return 'success';
      case 'Deletion': return 'danger';
      case 'Complex': return 'warning';
      default: return 'info';
    }
  };

  const getConsequenceLabel = (consequence: Consequence): string => {
    const labels: Record<Consequence, string> = {
      'Synonymous_substitution': '同义突变',
      'Missense_substitution': '错义突变',
      'Nonsense_substitution': '无义突变',
      'Inframe_insertion': '框内插入',
      'Frameshift_insertion': '移码插入',
      'Inframe_deletion': '框内删除',
      'Frameshift_deletion': '移码删除',
      'Complex_mutation': '复杂突变',
      'Splice_Site_mutation': '剪接突变',
      'Other': '其他',
    };
    return labels[consequence] || consequence;
  };

  const getInheritanceModeLabel = (mode: string): string => {
    const labels: Record<string, string> = {
      'AD': '常染色体显性',
      'AR': '常染色体隐性',
      'XL': 'X连锁',
      'XLD': 'X连锁显性',
      'XLR': 'X连锁隐性',
    };
    return labels[mode] || mode;
  };

  // Affected Exon 特殊标记
  const renderAffectedExon = (value: string) => {
    const isIntron = /intron|IVS/i.test(value);
    const isPromoter = /promoter|upstream/i.test(value);
    const isUTR = /UTR|5'|3'/i.test(value);
    
    if (isIntron || isPromoter || isUTR) {
      let bgColor = 'bg-neutral-subtle';
      let textColor = 'text-fg-muted';
      
      if (isIntron) {
        bgColor = 'bg-attention-subtle';
        textColor = 'text-attention-fg';
      } else if (isPromoter) {
        bgColor = 'bg-accent-subtle';
        textColor = 'text-accent-fg';
      } else if (isUTR) {
        bgColor = 'bg-done-subtle';
        textColor = 'text-done-fg';
      }
      
      return (
        <span className={`px-1.5 py-0.5 rounded text-xs ${bgColor} ${textColor}`}>
          {value}
        </span>
      );
    }
    
    return value;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white dark:bg-[#0d1117] border-l border-border shadow-xl z-50 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-canvas-subtle">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-fg-default">{variant.gene}</span>
            <span className="text-sm font-mono text-fg-muted">{variant.pHGVS || variant.cHGVS}</span>
            <Tag variant={acmgConfig.variant} className="text-xs">{acmgConfig.label}</Tag>
          </div>
          <button onClick={onClose} className="p-1 text-fg-muted hover:text-fg-default rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* ACMG 分类 */}
          <SectionTitle 
            icon={FileText} 
            title="ACMG 分类"
            action={
              !isEditingACMG && (
                <button
                  onClick={() => setIsEditingACMG(true)}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-xs text-fg-muted hover:text-fg-default hover:bg-canvas-inset rounded"
                >
                  <Edit2 className="w-3 h-3" />
                  编辑
                </button>
              )
            }
          />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            {isEditingACMG ? (
              <ACMGEditor
                currentClassification={currentClassification}
                currentCriteria={currentCriteria}
                onSave={handleSaveACMG}
                onCancel={() => setIsEditingACMG(false)}
              />
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Tag variant={acmgConfig.variant}>{acmgConfig.label}</Tag>
                </div>
                {currentCriteria.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {currentCriteria.map((c) => (
                      <span key={c} className="px-1.5 py-0.5 text-xs bg-canvas-inset rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                <InfoItem label="疾病关联" value={variant.diseaseAssociation} />
                <InfoItem label="遗传模式" value={getInheritanceModeLabel(variant.inheritanceMode)} />
              </>
            )}
          </div>

          {/* 临床数据库 */}
          <SectionTitle icon={Database} title="临床数据库" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
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
          </div>

          {/* 变异信息 */}
          <SectionTitle icon={Dna} title="变异信息" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="基因" value={variant.gene} />
            <InfoItem label="类型" value={<Tag variant={getTypeVariant(variant.type)}>{variant.type}</Tag>} />
            <InfoItem label="转录本" value={variant.transcript} mono />
            <InfoItem label="cHGVS" value={variant.cHGVS} mono />
            <InfoItem label="pHGVS" value={variant.pHGVS} mono />
            <InfoItem label="Consequence" value={getConsequenceLabel(variant.consequence)} />
            <InfoItem label="Affected Exon" value={renderAffectedExon(variant.affectedExon)} />
            <InfoItem label="杂合性" value={
              variant.zygosity === 'Heterozygous' ? '杂合' :
              variant.zygosity === 'Homozygous' ? '纯合' : '半合'
            } />
          </div>

          {/* 基因组位置 */}
          <SectionTitle icon={Activity} title="基因组位置" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="Chr" value={variant.chr} />
            <InfoItem 
              label="Start" 
              value={
                <button
                  onClick={() => onOpenIGV?.(`chr${variant.chr}`, variant.start)}
                  className="text-accent-fg hover:underline font-mono"
                >
                  {variant.start}
                </button>
              }
            />
            <InfoItem label="End" value={variant.type === 'Insertion' || variant.end < 0 ? '-' : String(variant.end)} />
            <InfoItem label="Ref" value={variant.ref} mono />
            <InfoItem label="Alt" value={variant.alt} mono />
          </div>

          {/* 测序质量 */}
          <SectionTitle icon={FileText} title="测序质量" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="VAF" value={`${(variant.vaf * 100).toFixed(2)}%`} />
            <InfoItem label="Depth" value={`${variant.depth}X`} />
            <InfoItem label="Alt Reads" value={Math.round(variant.depth * variant.vaf).toString()} />
          </div>

          {/* 人群频率 */}
          <SectionTitle icon={Database} title="人群频率" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="gnomAD" value={formatFrequency(variant.gnomadAF)} />
          </div>
        </div>

        {/* 底部 */}
        <div className="border-t border-border p-3 bg-canvas-subtle">
          <div className="flex gap-2">
            <button
              onClick={() => onOpenIGV?.(`chr${variant.chr}`, variant.start)}
              className="flex-1 px-3 py-1.5 text-xs bg-accent-emphasis text-fg-on-emphasis rounded-md hover:bg-accent-emphasis/90"
            >
              在 IGV 中查看
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-canvas-inset"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
