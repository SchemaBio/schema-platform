'use client';

import * as React from 'react';
import { X, ExternalLink, FileText, Database, Dna, Pill, Target, Activity, Edit2, Check } from 'lucide-react';
import { Tag } from '@schema/ui-kit';
import type { SNVIndel, TierClassification } from '../types';
import { TIER_CONFIG } from '../mock-data';

interface VariantDetailPanelProps {
  variant: SNVIndel | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenIGV?: (chromosome: string, position: number) => void;
  onUpdateTier?: (variantId: string, tier: TierClassification) => void;
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

// Tier 分类编辑器
function TierEditor({
  currentTier,
  onSave,
  onCancel,
}: {
  currentTier: TierClassification;
  onSave: (tier: TierClassification) => void;
  onCancel: () => void;
}) {
  const [tier, setTier] = React.useState<TierClassification>(currentTier);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(TIER_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setTier(key as TierClassification)}
            className={`px-3 py-2 text-xs rounded-md border transition-colors ${
              tier === key
                ? 'border-accent-emphasis bg-accent-subtle text-accent-fg'
                : 'border-border-default bg-canvas-default text-fg-muted hover:bg-canvas-inset'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave(tier)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-accent-emphasis text-fg-on-emphasis rounded-md hover:bg-accent-emphasis/90"
        >
          <Check className="w-3 h-3" />
          保存
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-canvas-inset"
        >
          取消
        </button>
      </div>
    </div>
  );
}

export function VariantDetailPanel({ variant, isOpen, onClose, onOpenIGV, onUpdateTier }: VariantDetailPanelProps) {
  const [isEditingTier, setIsEditingTier] = React.useState(false);
  const [localTier, setLocalTier] = React.useState<TierClassification | null>(null);

  React.useEffect(() => {
    setIsEditingTier(false);
    setLocalTier(null);
  }, [variant?.id]);

  if (!isOpen || !variant) return null;

  const currentTier = localTier ?? variant.clinicalSignificance;
  const tierConfig = TIER_CONFIG[currentTier];
  
  const formatFrequency = (freq?: number) => {
    if (freq === undefined || freq === null) return undefined;
    if (freq === 0) return '0';
    if (freq < 0.0001) return freq.toExponential(2);
    return (freq * 100).toFixed(4) + '%';
  };

  const formatScore = (score?: number, precision = 2) => {
    if (score === undefined || score === null) return undefined;
    return score.toFixed(precision);
  };

  const handleSaveTier = (tier: TierClassification) => {
    setLocalTier(tier);
    setIsEditingTier(false);
    onUpdateTier?.(variant.id, tier);
  };

  // 获取变异类型标签
  const getTypeVariant = (type: string): 'info' | 'warning' | 'danger' | 'success' => {
    switch (type) {
      case 'SNV': return 'info';
      case 'Insertion': return 'success';
      case 'Deletion': return 'danger';
      case 'Complex': return 'warning';
      default: return 'info';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white dark:bg-[#0d1117] border-l border-border shadow-xl z-50 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-canvas-subtle">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-fg-default">{variant.gene}</span>
            <span className="text-sm font-mono text-fg-muted">{variant.hgvsp || variant.hgvsc}</span>
            <Tag variant={tierConfig.variant} className="text-xs">{tierConfig.label}</Tag>
          </div>
          <button onClick={onClose} className="p-1 text-fg-muted hover:text-fg-default rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* 临床意义 - 体细胞突变核心 */}
          <SectionTitle 
            icon={Target} 
            title="临床意义 (Tier分类)"
            action={
              !isEditingTier && (
                <button
                  onClick={() => setIsEditingTier(true)}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-xs text-fg-muted hover:text-fg-default hover:bg-canvas-inset rounded"
                >
                  <Edit2 className="w-3 h-3" />
                  编辑
                </button>
              )
            }
          />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            {isEditingTier ? (
              <TierEditor
                currentTier={currentTier}
                onSave={handleSaveTier}
                onCancel={() => setIsEditingTier(false)}
              />
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Tag variant={tierConfig.variant}>{tierConfig.label}</Tag>
                  <span className="text-xs text-fg-muted">
                    {currentTier === 'Tier I' && '强临床意义 - FDA获批/指南推荐'}
                    {currentTier === 'Tier II' && '潜在临床意义 - 临床试验/小规模研究'}
                    {currentTier === 'Tier III' && '意义未明 - 需进一步研究'}
                    {currentTier === 'Tier IV' && '良性/可能良性'}
                  </span>
                </div>
                <InfoItem label="疾病关联" value={variant.diseaseAssociation} />
              </>
            )}
          </div>

          {/* 靶向药物信息 */}
          <SectionTitle icon={Pill} title="靶向药物" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            {(currentTier === 'Tier I' || currentTier === 'Tier II') ? (
              <>
                <div className="text-xs text-fg-muted mb-2">
                  {variant.gene === 'EGFR' && variant.hgvsp === 'p.L858R' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-success-subtle text-success-fg rounded text-xs">敏感</span>
                        <span>奥希替尼、吉非替尼、厄洛替尼、阿法替尼</span>
                      </div>
                    </div>
                  )}
                  {variant.gene === 'EGFR' && variant.hgvsp === 'p.T790M' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-success-subtle text-success-fg rounded text-xs">敏感</span>
                        <span>奥希替尼</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-danger-subtle text-danger-fg rounded text-xs">耐药</span>
                        <span>吉非替尼、厄洛替尼</span>
                      </div>
                    </div>
                  )}
                  {variant.gene === 'KRAS' && variant.hgvsp === 'p.G12D' && (
                    <div className="text-fg-muted">暂无获批靶向药物</div>
                  )}
                  {variant.gene === 'BRAF' && variant.hgvsp === 'p.V600E' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-success-subtle text-success-fg rounded text-xs">敏感</span>
                        <span>达拉非尼+曲美替尼、维莫非尼</span>
                      </div>
                    </div>
                  )}
                  {variant.gene === 'PIK3CA' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-success-subtle text-success-fg rounded text-xs">敏感</span>
                        <span>阿培利司 (乳腺癌)</span>
                      </div>
                    </div>
                  )}
                  {!['EGFR', 'KRAS', 'BRAF', 'PIK3CA'].includes(variant.gene) && (
                    <div className="text-fg-muted">暂无相关靶向药物信息</div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-xs text-fg-muted">该变异暂无明确靶向药物关联</div>
            )}
          </div>

          {/* 肿瘤数据库 */}
          <SectionTitle icon={Database} title="肿瘤数据库" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem 
              label="OncoKB" 
              value={variant.gene}
              link={`https://www.oncokb.org/gene/${variant.gene}`}
            />
            <InfoItem 
              label="COSMIC" 
              value={variant.gene}
              link={`https://cancer.sanger.ac.uk/cosmic/gene/analysis?ln=${variant.gene}`}
            />
            <InfoItem 
              label="ClinVar" 
              value={variant.clinvarId}
              link={variant.clinvarId ? `https://www.ncbi.nlm.nih.gov/clinvar/variation/${variant.clinvarId.replace('VCV', '')}` : undefined}
            />
            <InfoItem label="ClinVar 意义" value={variant.clinvarSignificance} />
          </div>

          {/* 变异信息 */}
          <SectionTitle icon={Dna} title="变异信息" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="基因" value={variant.gene} />
            <InfoItem label="类型" value={<Tag variant={getTypeVariant(variant.variantType)}>{variant.variantType}</Tag>} />
            <InfoItem label="转录本" value={variant.transcript} mono />
            <InfoItem label="cHGVS" value={variant.hgvsc} mono />
            <InfoItem label="pHGVS" value={variant.hgvsp} mono />
            <InfoItem label="Consequence" value={variant.consequence} />
            <InfoItem label="Affected Exon" value={variant.affectedExon} />
          </div>

          {/* 基因组位置 */}
          <SectionTitle icon={Activity} title="基因组位置" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="Chr" value={variant.chromosome.replace('chr', '')} />
            <InfoItem 
              label="Start" 
              value={
                <button
                  onClick={() => onOpenIGV?.(variant.chromosome.startsWith('chr') ? variant.chromosome : `chr${variant.chromosome}`, variant.start ?? variant.position)}
                  className="text-accent-fg hover:underline font-mono"
                >
                  {variant.start ?? variant.position}
                </button>
              }
            />
            <InfoItem label="End" value={
              variant.variantType === 'Insertion' || (variant.end !== undefined && variant.end < 0) 
                ? '-' 
                : String(variant.end ?? variant.position)
            } />
            <InfoItem label="Ref" value={variant.ref} mono />
            <InfoItem label="Alt" value={variant.alt} mono />
          </div>

          {/* 测序质量 */}
          <SectionTitle icon={FileText} title="测序质量" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="VAF" value={`${(variant.alleleFrequency * 100).toFixed(2)}%`} />
            <InfoItem label="Depth" value={`${variant.depth}X`} />
            <InfoItem label="Alt Reads" value={variant.altReads !== undefined ? String(variant.altReads) : (variant.depth && variant.alleleFrequency ? Math.round(variant.depth * variant.alleleFrequency).toString() : undefined)} />
            <InfoItem label="去重深度" value={variant.dedupDepth !== undefined ? `${variant.dedupDepth}X` : undefined} />
            <InfoItem label="去重Alt Reads" value={variant.dedupAltReads !== undefined ? String(variant.dedupAltReads) : undefined} />
            <InfoItem label="去重VAF" value={variant.dedupVAF !== undefined ? `${(variant.dedupVAF * 100).toFixed(2)}%` : undefined} />
          </div>

          {/* 人群频率 */}
          <SectionTitle icon={Database} title="人群频率" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="gnomAD" value={formatFrequency(variant.gnomadAF)} />
            <InfoItem label="gnomAD EAS" value={formatFrequency(variant.gnomadEasAF)} />
            <InfoItem 
              label="dbSNP" 
              value={variant.rsId}
              link={variant.rsId ? `https://www.ncbi.nlm.nih.gov/snp/${variant.rsId}` : undefined}
            />
          </div>

          {/* 有害性评估 */}
          <SectionTitle icon={Dna} title="有害性评估" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="InterVar" value={variant.intervarClassification} />
            <InfoItem label="AlphaMissense" value={variant.alphaMissenseScore !== undefined ? `${formatScore(variant.alphaMissenseScore)} (${variant.alphaMissensePrediction})` : undefined} />
            <InfoItem label="Maverick" value={variant.maverickScore !== undefined ? `${formatScore(variant.maverickScore)} (${variant.maverickPrediction})` : undefined} />
            <InfoItem label="CADD" value={formatScore(variant.caddScore)} />
            <InfoItem label="REVEL" value={formatScore(variant.revelScore)} />
            <InfoItem label="SpliceAI" value={formatScore(variant.spliceAI)} />
            <InfoItem 
              label="SIFT" 
              value={variant.siftScore !== undefined ? `${formatScore(variant.siftScore)} (${variant.siftPrediction})` : undefined} 
            />
            <InfoItem 
              label="PolyPhen-2" 
              value={variant.polyphenScore !== undefined ? `${formatScore(variant.polyphenScore)} (${variant.polyphenPrediction})` : undefined} 
            />
          </div>

          {/* 文献 */}
          {variant.pubmedIds && variant.pubmedIds.length > 0 && (
            <>
              <SectionTitle icon={FileText} title="相关文献" />
              <div className="bg-canvas-subtle rounded-md p-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {variant.pubmedIds.map((pmid) => (
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
              onClick={() => onOpenIGV?.(variant.chromosome.startsWith('chr') ? variant.chromosome : `chr${variant.chromosome}`, variant.start ?? variant.position)}
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
