'use client';

import * as React from 'react';
import { X, ExternalLink, FileText, Database, Dna, Pill, Activity, Target } from 'lucide-react';
import { Tag } from '@schema/ui-kit';

// 突变类型 (NCCL规范)
type VariantType = 'SNV' | 'Insertion' | 'Deletion' | 'Complex';

// 突变后果 (NCCL规范)
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

// 热点突变类型 (NCCL规范)
interface Hotspot {
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
  vaf: number;
  depth: number;
  consequence: Consequence;
  affectedExon: string;
  hotspotType: 'Oncogenic' | 'Resistance' | 'Sensitizing';
  clinicalSignificance: 'Tier I' | 'Tier II' | 'Tier III' | 'Unknown';
  drugAssociation: string[];
  cancerType: string[];
  cosmicId?: string;
  oncokbLevel?: string;
  pubmedIds?: string[];
  clinicalTrials?: string[];
  reviewed: boolean;
  reported: boolean;
}

interface HotspotDetailPanelProps {
  hotspot: Hotspot | null;
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
function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2 mt-4 first:mt-0">
      <Icon className="w-3.5 h-3.5 text-fg-muted" />
      <h4 className="text-xs font-medium text-fg-default">{title}</h4>
    </div>
  );
}

export function HotspotDetailPanel({ hotspot, isOpen, onClose, onOpenIGV }: HotspotDetailPanelProps) {
  if (!isOpen || !hotspot) return null;

  const getHotspotTypeVariant = (type: string): 'danger' | 'warning' | 'success' => {
    switch (type) {
      case 'Oncogenic': return 'danger';
      case 'Resistance': return 'warning';
      case 'Sensitizing': return 'success';
      default: return 'warning';
    }
  };

  const getHotspotTypeLabel = (type: string): string => {
    switch (type) {
      case 'Oncogenic': return '致癌突变';
      case 'Resistance': return '耐药突变';
      case 'Sensitizing': return '敏感突变';
      default: return type;
    }
  };

  const getTierVariant = (tier: string): 'danger' | 'warning' | 'info' | 'neutral' => {
    switch (tier) {
      case 'Tier I': return 'danger';
      case 'Tier II': return 'warning';
      case 'Tier III': return 'info';
      default: return 'neutral';
    }
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
            <span className="text-sm font-medium text-fg-default">{hotspot.gene}</span>
            <span className="text-sm font-mono text-fg-muted">{hotspot.pHGVS}</span>
            <Tag variant={getHotspotTypeVariant(hotspot.hotspotType)} className="text-xs">
              {getHotspotTypeLabel(hotspot.hotspotType)}
            </Tag>
          </div>
          <button onClick={onClose} className="p-1 text-fg-muted hover:text-fg-default rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* 临床意义 */}
          <SectionTitle icon={Target} title="临床意义 (Tier分类)" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <div className="flex items-center gap-2 mb-2">
              <Tag variant={getTierVariant(hotspot.clinicalSignificance)}>{hotspot.clinicalSignificance}</Tag>
              <span className="text-xs text-fg-muted">
                {hotspot.clinicalSignificance === 'Tier I' && '强临床意义 - FDA获批/指南推荐'}
                {hotspot.clinicalSignificance === 'Tier II' && '潜在临床意义 - 临床试验/小规模研究'}
                {hotspot.clinicalSignificance === 'Tier III' && '意义未明 - 需进一步研究'}
              </span>
            </div>
            <InfoItem 
              label="热点类型" 
              value={<Tag variant={getHotspotTypeVariant(hotspot.hotspotType)}>{getHotspotTypeLabel(hotspot.hotspotType)}</Tag>} 
            />
            <InfoItem 
              label="OncoKB Level" 
              value={hotspot.oncokbLevel}
              link={hotspot.oncokbLevel ? `https://www.oncokb.org/gene/${hotspot.gene}/${hotspot.pHGVS.replace('p.', '')}` : undefined}
            />
          </div>

          {/* 靶向药物 */}
          <SectionTitle icon={Pill} title="靶向药物" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            {hotspot.drugAssociation.length > 0 ? (
              <div className="space-y-1.5">
                {hotspot.drugAssociation.map((drug) => (
                  <div key={drug} className="flex items-center justify-between py-1 border-b border-border-subtle last:border-0">
                    <div className="flex items-center gap-1.5">
                      {hotspot.hotspotType === 'Sensitizing' && (
                        <span className="px-1.5 py-0.5 bg-success-subtle text-success-fg rounded text-xs">敏感</span>
                      )}
                      {hotspot.hotspotType === 'Resistance' && (
                        <span className="px-1.5 py-0.5 bg-danger-subtle text-danger-fg rounded text-xs">耐药</span>
                      )}
                      <span className="text-xs text-fg-default">{drug}</span>
                    </div>
                    <a
                      href={`https://www.drugbank.com/unearth/q?query=${encodeURIComponent(drug)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-fg text-xs hover:underline flex items-center gap-0.5"
                    >
                      详情
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-fg-muted">暂无相关药物信息</span>
            )}
          </div>

          {/* 肿瘤数据库 */}
          <SectionTitle icon={Database} title="肿瘤数据库" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem 
              label="OncoKB" 
              value={hotspot.gene}
              link={`https://www.oncokb.org/gene/${hotspot.gene}`}
            />
            <InfoItem 
              label="COSMIC" 
              value={hotspot.cosmicId}
              link={hotspot.cosmicId ? `https://cancer.sanger.ac.uk/cosmic/mutation/overview?id=${hotspot.cosmicId.replace('COSM', '')}` : undefined}
            />
            <InfoItem label="相关癌种" value={hotspot.cancerType.join(', ')} />
          </div>

          {/* 变异信息 */}
          <SectionTitle icon={Dna} title="变异信息" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="基因" value={hotspot.gene} />
            <InfoItem label="类型" value={<Tag variant={getTypeVariant(hotspot.type)}>{hotspot.type}</Tag>} />
            <InfoItem label="转录本" value={hotspot.transcript} mono />
            <InfoItem label="cHGVS" value={hotspot.cHGVS} mono />
            <InfoItem label="pHGVS" value={hotspot.pHGVS} mono />
            <InfoItem label="Consequence" value={getConsequenceLabel(hotspot.consequence)} />
            <InfoItem label="Affected Exon" value={renderAffectedExon(hotspot.affectedExon)} />
          </div>

          {/* 基因组位置 */}
          <SectionTitle icon={Activity} title="基因组位置" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="Chr" value={hotspot.chr} />
            <InfoItem 
              label="Start" 
              value={
                <button
                  onClick={() => onOpenIGV?.(`chr${hotspot.chr}`, hotspot.start)}
                  className="text-accent-fg hover:underline font-mono"
                >
                  {hotspot.start}
                </button>
              }
            />
            <InfoItem label="End" value={hotspot.type === 'Insertion' || hotspot.end < 0 ? '-' : String(hotspot.end)} />
            <InfoItem label="Ref" value={hotspot.ref} mono />
            <InfoItem label="Alt" value={hotspot.alt} mono />
          </div>

          {/* 测序质量 */}
          <SectionTitle icon={FileText} title="测序质量" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="VAF" value={`${(hotspot.vaf * 100).toFixed(2)}%`} />
            <InfoItem label="Depth" value={`${hotspot.depth}X`} />
            <InfoItem label="Alt Reads" value={Math.round(hotspot.depth * hotspot.vaf).toString()} />
          </div>

          {/* 临床试验 */}
          {hotspot.clinicalTrials && hotspot.clinicalTrials.length > 0 && (
            <>
              <SectionTitle icon={FileText} title="相关临床试验" />
              <div className="bg-canvas-subtle rounded-md p-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {hotspot.clinicalTrials.map((trial) => (
                    <a
                      key={trial}
                      href={`https://clinicaltrials.gov/study/${trial}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-canvas-inset text-accent-fg rounded hover:bg-accent-subtle"
                    >
                      {trial}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 文献 */}
          {hotspot.pubmedIds && hotspot.pubmedIds.length > 0 && (
            <>
              <SectionTitle icon={FileText} title="相关文献" />
              <div className="bg-canvas-subtle rounded-md p-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {hotspot.pubmedIds.map((pmid) => (
                    <a
                      key={pmid}
                      href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-canvas-inset text-accent-fg rounded hover:bg-accent-subtle"
                    >
                      PMID:{pmid}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 底部 */}
        <div className="border-t border-border p-3 bg-canvas-subtle">
          <div className="flex gap-2">
            <button
              onClick={() => onOpenIGV?.(`chr${hotspot.chr}`, hotspot.start)}
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
