'use client';

import * as React from 'react';
import { X, ExternalLink, FileText, Database, Dna, MapPin } from 'lucide-react';
import { Tag } from '@schema/ui-kit';
import type { CNVSegment, CNVExon } from '../types';

interface CNVDetailPanelProps {
  variant: CNVSegment | CNVExon | null;
  variantType: 'segment' | 'exon';
  isOpen: boolean;
  onClose: () => void;
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

// 格式化长度显示
function formatLength(length: number): string {
  if (length >= 1000000) return `${(length / 1000000).toFixed(2)} Mb`;
  if (length >= 1000) return `${(length / 1000).toFixed(1)} kb`;
  return `${length} bp`;
}

// 判断是否为 CNVExon 类型
function isCNVExon(variant: CNVSegment | CNVExon): variant is CNVExon {
  return 'gene' in variant && 'exon' in variant;
}

export function CNVDetailPanel({ variant, variantType, isOpen, onClose }: CNVDetailPanelProps) {
  if (!isOpen || !variant) return null;

  const isExon = isCNVExon(variant);
  const isAmplification = variant.type === 'Amplification';

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
            <h3 className="text-base font-medium text-fg-default">
              {variantType === 'exon' ? 'CNV外显子详情' : 'CNV区域详情'}
            </h3>
            <Tag variant={isAmplification ? 'danger' : 'info'}>
              {isAmplification ? '扩增' : '缺失'}
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
            {isExon && (
              <>
                <InfoItem label="基因" value={variant.gene} />
                <InfoItem label="转录本" value={variant.transcript} />
                <InfoItem label="外显子" value={variant.exon} />
              </>
            )}
            <InfoItem label="染色体" value={variant.chromosome} />
            <InfoItem label="起始位置" value={variant.startPosition.toLocaleString()} />
            <InfoItem label="终止位置" value={variant.endPosition.toLocaleString()} />
            {!isExon && (
              <InfoItem label="长度" value={formatLength((variant as CNVSegment).length)} />
            )}
          </div>

          {/* CNV 特征 */}
          <SectionTitle icon={FileText} title="CNV 特征" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            <InfoItem 
              label="类型" 
              value={
                <Tag variant={isAmplification ? 'danger' : 'info'}>
                  {isAmplification ? '扩增' : '缺失'}
                </Tag>
              } 
            />
            <InfoItem label="拷贝数" value={variant.copyNumber} />
            {isExon && (
              <InfoItem label="比值" value={(variant as CNVExon).ratio.toFixed(2)} />
            )}
            <InfoItem label="置信度" value={`${(variant.confidence * 100).toFixed(0)}%`} />
          </div>

          {/* 涉及基因 (仅 Segment) */}
          {!isExon && (variant as CNVSegment).genes.length > 0 && (
            <>
              <SectionTitle icon={Database} title="涉及基因" />
              <div className="bg-canvas-subtle rounded-lg p-3">
                <div className="flex flex-wrap gap-2">
                  {(variant as CNVSegment).genes.map((gene) => (
                    <a
                      key={gene}
                      href={`https://www.genecards.org/cgi-bin/carddisp.pl?gene=${gene}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-canvas-inset text-accent-fg rounded hover:bg-accent-subtle transition-colors"
                    >
                      {gene}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 基因组位置链接 */}
          <SectionTitle icon={MapPin} title="外部资源" />
          <div className="bg-canvas-subtle rounded-lg p-3">
            <InfoItem 
              label="UCSC Genome Browser" 
              value="查看"
              link={`https://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&position=${variant.chromosome}:${variant.startPosition}-${variant.endPosition}`}
            />
            <InfoItem 
              label="Ensembl" 
              value="查看"
              link={`https://www.ensembl.org/Homo_sapiens/Location/View?r=${variant.chromosome.replace('chr', '')}:${variant.startPosition}-${variant.endPosition}`}
            />
            {isExon && (
              <InfoItem 
                label="GeneCards" 
                value={(variant as CNVExon).gene}
                link={`https://www.genecards.org/cgi-bin/carddisp.pl?gene=${(variant as CNVExon).gene}`}
              />
            )}
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
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm border border-border rounded-md hover:bg-canvas-inset transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </>
  );
}
