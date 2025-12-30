'use client';

import * as React from 'react';
import { X, ExternalLink, FileText, Database, Dna, Activity } from 'lucide-react';
import { Tag, DataTable } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';

// 外显子CNV数据
interface ExonCNV {
  exon: string;
  copyNumber: number;
  log2Ratio: number;
}

// 基因水平CNV类型
interface CNVGene {
  id: string;
  gene: string;
  transcript: string;
  chromosome: string;
  type: 'Amplification' | 'Deletion';
  copyNumber: number;
  logRatio: number;
  bafDeviation: number;
  relatedCancers: string[];
  exonData: ExonCNV[];
  reviewed: boolean;
  reported: boolean;
}

interface CNVGeneDetailPanelProps {
  variant: CNVGene | null;
  isOpen: boolean;
  onClose: () => void;
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

export function CNVGeneDetailPanel({ variant, isOpen, onClose }: CNVGeneDetailPanelProps) {
  if (!isOpen || !variant) return null;

  const isAmplification = variant.type === 'Amplification';

  // 外显子表格列定义
  const exonColumns: Column<ExonCNV>[] = [
    {
      id: 'exon',
      header: '外显子',
      accessor: 'exon',
      width: 80,
    },
    {
      id: 'copyNumber',
      header: '拷贝数',
      accessor: (row) => (
        <span className={row.copyNumber > 2 ? 'text-danger-fg' : row.copyNumber < 2 ? 'text-accent-fg' : ''}>
          {row.copyNumber}
        </span>
      ),
      width: 70,
    },
    {
      id: 'log2Ratio',
      header: 'Log2Ratio',
      accessor: (row) => (
        <span className={row.log2Ratio > 0.3 ? 'text-danger-fg' : row.log2Ratio < -0.3 ? 'text-accent-fg' : ''}>
          {row.log2Ratio.toFixed(2)}
        </span>
      ),
      width: 90,
    },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-[480px] bg-white dark:bg-[#0d1117] border-l border-border shadow-xl z-50 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-canvas-subtle">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-fg-default">{variant.gene}</span>
            <span className="text-sm font-mono text-fg-muted">{variant.transcript}</span>
            <Tag variant={isAmplification ? 'danger' : 'info'}>
              {isAmplification ? '扩增' : '缺失'}
            </Tag>
          </div>
          <button onClick={onClose} className="p-1 text-fg-muted hover:text-fg-default rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* 基本信息 */}
          <SectionTitle icon={Dna} title="基本信息" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="基因" value={variant.gene} />
            <InfoItem label="转录本" value={variant.transcript} mono />
            <InfoItem label="染色体" value={variant.chromosome} />
            <InfoItem label="类型" value={
              <Tag variant={isAmplification ? 'danger' : 'info'}>
                {isAmplification ? '扩增' : '缺失'}
              </Tag>
            } />
          </div>

          {/* CNV特征 */}
          <SectionTitle icon={Activity} title="CNV特征" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="拷贝数" value={variant.copyNumber.toString()} />
            <InfoItem label="Log2 Ratio" value={variant.logRatio.toFixed(2)} />
            <InfoItem label="BAF偏移比例" value={`${(variant.bafDeviation * 100).toFixed(1)}%`} />
          </div>

          {/* 相关癌种 */}
          <SectionTitle icon={FileText} title="相关癌种" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            {variant.relatedCancers.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {variant.relatedCancers.map((cancer, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs bg-canvas-inset rounded">
                    {cancer}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-fg-muted">暂无相关癌种信息</span>
            )}
          </div>

          {/* 外部数据库 */}
          <SectionTitle icon={Database} title="外部数据库" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem 
              label="GeneCards" 
              value={variant.gene}
              link={`https://www.genecards.org/cgi-bin/carddisp.pl?gene=${variant.gene}`}
            />
            <InfoItem 
              label="COSMIC" 
              value="查看"
              link={`https://cancer.sanger.ac.uk/cosmic/gene/analysis?ln=${variant.gene}`}
            />
            <InfoItem 
              label="OncoKB" 
              value="查看"
              link={`https://www.oncokb.org/gene/${variant.gene}`}
            />
          </div>

          {/* 外显子拷贝数详情 */}
          <SectionTitle icon={Dna} title="外显子拷贝数详情" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            {variant.exonData.length > 0 ? (
              <DataTable
                data={variant.exonData}
                columns={exonColumns}
                rowKey="exon"
                density="compact"
                striped
              />
            ) : (
              <span className="text-xs text-fg-muted">暂无外显子数据</span>
            )}
          </div>
        </div>

        {/* 底部 */}
        <div className="border-t border-border p-3 bg-canvas-subtle">
          <button
            onClick={onClose}
            className="w-full px-3 py-1.5 text-xs border border-border rounded-md hover:bg-canvas-inset"
          >
            关闭
          </button>
        </div>
      </div>
    </>
  );
}
