'use client';

import * as React from 'react';
import { X, ExternalLink, FileText, Database, Dna, Pill, Activity } from 'lucide-react';
import { Tag } from '@schema/ui-kit';

// 热点突变类型
interface Hotspot {
  id: string;
  gene: string;
  mutation: string;
  chromosome: string;
  position: number;
  ref: string;
  alt: string;
  transcript: string;
  hgvsc: string;
  hgvsp: string;
  vaf: number;
  depth: number;
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
function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-5 first:mt-0">
      <Icon className="w-4 h-4 text-fg-muted" />
      <h4 className="text-sm font-medium text-fg-default">{title}</h4>
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

  const getTierVariant = (tier: string): 'danger' | 'warning' | 'info' => {
    switch (tier) {
      case 'Tier I': return 'danger';
      case 'Tier II': return 'warning';
      default: return 'info';
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
            <h3 className="text-base font-medium text-fg-default">热点突变详情</h3>
            <Tag variant={getHotspotTypeVariant(hotspot.hotspotType)}>
              {getHotspotTypeLabel(hotspot.hotspotType)}
            </Tag>
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
            <InfoItem label="基因" value={hotspot.gene} />
            <InfoItem label="突变" value={<span className="font-medium">{hotspot.mutation}</span>} />
            <InfoItem 
              label="位置" 
              value={
                <button
                  onClick={() => onOpenIGV?.(hotspot.chromosome, hotspot.position)}
                  className="text-accent-fg hover:underline"
                >
                  {hotspot.chromosome}:{hotspot.position.toLocaleString()}
                </button>
              }
            />
            <InfoItem label="碱基变化" value={`${hotspot.ref} > ${hotspot.alt}`} />
            <InfoItem label="转录本" value={hotspot.transcript} />
            <InfoItem label="cDNA变化" value={hotspot.hgvsc} />
            <InfoItem label="蛋白质变化" value={hotspot.hgvsp} />
          </div>

          {/* 测序质量 */}
          <SectionTitle icon={Activity} title="测序质量" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            <InfoItem label="VAF" value={`${(hotspot.vaf * 100).toFixed(1)}%`} />
            <InfoItem label="覆盖深度" value={`${hotspot.depth}X`} />
          </div>

          {/* 临床意义 */}
          <SectionTitle icon={FileText} title="临床意义" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            <InfoItem 
              label="热点类型" 
              value={
                <Tag variant={getHotspotTypeVariant(hotspot.hotspotType)}>
                  {getHotspotTypeLabel(hotspot.hotspotType)}
                </Tag>
              } 
            />
            <InfoItem 
              label="临床等级" 
              value={
                <Tag variant={getTierVariant(hotspot.clinicalSignificance)}>
                  {hotspot.clinicalSignificance}
                </Tag>
              } 
            />
            <InfoItem 
              label="OncoKB Level" 
              value={hotspot.oncokbLevel}
              link={hotspot.oncokbLevel ? `https://www.oncokb.org/gene/${hotspot.gene}/${hotspot.mutation}` : undefined}
            />
            <InfoItem 
              label="COSMIC ID" 
              value={hotspot.cosmicId}
              link={hotspot.cosmicId ? `https://cancer.sanger.ac.uk/cosmic/mutation/overview?id=${hotspot.cosmicId.replace('COSM', '')}` : undefined}
            />
          </div>

          {/* 相关肿瘤类型 */}
          <SectionTitle icon={Database} title="相关肿瘤类型" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            {hotspot.cancerType.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {hotspot.cancerType.map((cancer) => (
                  <span 
                    key={cancer} 
                    className="px-2 py-1 text-xs bg-canvas-inset text-fg-default rounded"
                  >
                    {cancer}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-fg-muted text-sm">-</span>
            )}
          </div>

          {/* 药物关联 */}
          <SectionTitle icon={Pill} title="药物关联" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            {hotspot.drugAssociation.length > 0 ? (
              <div className="space-y-2">
                {hotspot.drugAssociation.map((drug) => (
                  <div 
                    key={drug} 
                    className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-0"
                  >
                    <span className="text-fg-default text-sm">{drug}</span>
                    <a
                      href={`https://www.drugbank.com/unearth/q?query=${encodeURIComponent(drug)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-fg text-xs hover:underline flex items-center gap-1"
                    >
                      查看详情
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-fg-muted text-sm">暂无相关药物信息</span>
            )}
          </div>

          {/* 临床试验 */}
          {hotspot.clinicalTrials && hotspot.clinicalTrials.length > 0 && (
            <>
              <SectionTitle icon={FileText} title="相关临床试验" />
              <div className="bg-canvas-subtle rounded-lg p-3">
                <div className="flex flex-wrap gap-2">
                  {hotspot.clinicalTrials.map((trial) => (
                    <a
                      key={trial}
                      href={`https://clinicaltrials.gov/study/${trial}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-canvas-inset text-accent-fg rounded hover:bg-accent-subtle transition-colors"
                    >
                      {trial}
                      <ExternalLink className="w-3 h-3" />
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
              <div className="bg-canvas-subtle rounded-lg p-3">
                <div className="flex flex-wrap gap-2">
                  {hotspot.pubmedIds.map((pmid) => (
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
              onClick={() => onOpenIGV?.(hotspot.chromosome, hotspot.position)}
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
