'use client';

import * as React from 'react';
import { X, ExternalLink, FileText, Database, Dna } from 'lucide-react';
import { Tag } from '@schema/ui-kit';
import type { MitochondrialVariant, MitochondrialPathogenicity } from '../types';

// 致病性配置
const PATHOGENICITY_CONFIG: Record<MitochondrialPathogenicity, { label: string; variant: 'danger' | 'warning' | 'neutral' | 'info' | 'success' }> = {
  Pathogenic: { label: '致病', variant: 'danger' },
  Likely_Pathogenic: { label: '可能致病', variant: 'warning' },
  VUS: { label: '意义未明', variant: 'neutral' },
  Likely_Benign: { label: '可能良性', variant: 'info' },
  Benign: { label: '良性', variant: 'success' },
};

interface MTDetailPanelProps {
  variant: MitochondrialVariant | null;
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

export function MTDetailPanel({ variant, isOpen, onClose, onOpenIGV }: MTDetailPanelProps) {
  if (!isOpen || !variant) return null;

  const pathogenicityConfig = PATHOGENICITY_CONFIG[variant.pathogenicity];

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* 侧边面板 */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white dark:bg-[#0d1117] border-l border-border shadow-xl z-50 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-canvas-subtle">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-medium text-fg-default">线粒体变异详情</h3>
            <Tag variant={pathogenicityConfig.variant}>{pathogenicityConfig.label}</Tag>
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
                  onClick={() => onOpenIGV?.('chrM', variant.position)}
                  className="text-accent-fg hover:underline"
                >
                  m.{variant.position}
                </button>
              }
            />
            <InfoItem label="参考/变异" value={`${variant.ref} > ${variant.alt}`} />
            {variant.haplogroup && (
              <InfoItem label="单倍群" value={variant.haplogroup} />
            )}
          </div>

          {/* 异质性 */}
          <SectionTitle icon={FileText} title="异质性分析" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            <InfoItem label="异质性比例" value={`${(variant.heteroplasmy * 100).toFixed(1)}%`} />
            <InfoItem 
              label="异质性水平" 
              value={
                variant.heteroplasmy >= 0.8 ? '高异质性 (≥80%)' :
                variant.heteroplasmy >= 0.4 ? '中等异质性 (40-80%)' :
                '低异质性 (<40%)'
              } 
            />
          </div>

          {/* 致病性评估 */}
          <SectionTitle icon={Database} title="致病性评估" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            <InfoItem 
              label="致病性" 
              value={<Tag variant={pathogenicityConfig.variant}>{pathogenicityConfig.label}</Tag>} 
            />
            <InfoItem label="关联疾病" value={variant.associatedDisease} />
          </div>

          {/* 外部资源 */}
          <SectionTitle icon={ExternalLink} title="外部资源" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            <InfoItem 
              label="MITOMAP" 
              value="查看"
              link={`https://www.mitomap.org/MITOMAP/SearchAllele?position=${variant.position}`}
            />
            <InfoItem 
              label="HmtVar" 
              value="查看"
              link={`https://www.hmtvar.uniba.it/varCard/m.${variant.position}${variant.ref}>${variant.alt}`}
            />
            <InfoItem 
              label="MitoTIP" 
              value="查看"
              link={`https://www.mitomap.org/cgi-bin/search_tRNA?pos=${variant.position}`}
            />
          </div>

          {/* 审核状态 */}
          <SectionTitle icon={FileText} title="审核状态" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            <InfoItem 
              label="审核状态" 
              value={variant.reviewed ? (
                <Tag variant="success">已审核</Tag>
              ) : (
                <Tag variant="neutral">未审核</Tag>
              )} 
            />
            {variant.reviewed && variant.reviewedBy && (
              <>
                <InfoItem label="审核人" value={variant.reviewedBy} />
                <InfoItem label="审核时间" value={variant.reviewedAt} />
              </>
            )}
            <InfoItem 
              label="回报状态" 
              value={variant.reported ? (
                <Tag variant="info">已回报</Tag>
              ) : (
                <Tag variant="neutral">未回报</Tag>
              )} 
            />
            {variant.reported && variant.reportedBy && (
              <>
                <InfoItem label="回报人" value={variant.reportedBy} />
                <InfoItem label="回报时间" value={variant.reportedAt} />
              </>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="border-t border-border p-4 bg-canvas-subtle">
          <div className="flex gap-2">
            <button
              onClick={() => onOpenIGV?.('chrM', variant.position)}
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
