'use client';

import * as React from 'react';
import { X, ExternalLink, FileText, Database, Dna, Activity, BarChart3 } from 'lucide-react';
import { Tag, DataTable } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';

// 外显子CNV数据
interface ExonCNV {
  exon: string;
  copyNumber: number;
  log2Ratio: number;
}

// 染色体区域CNV数据点
interface CNVDataPoint {
  position: number;
  log2Ratio: number;
  baf: number;
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

// 生成模拟的染色体区域CNV数据
function generateMockCNVData(gene: string, logRatio: number, chromosome: string): { dataPoints: CNVDataPoint[]; geneStart: number; geneEnd: number; regionStart: number; regionEnd: number } {
  // 模拟基因位置
  const genePositions: Record<string, { start: number; end: number }> = {
    'EGFR': { start: 55019017, end: 55211628 },
    'MET': { start: 116672196, end: 116798386 },
    'ERBB2': { start: 39687914, end: 39730426 },
    'CDKN2A': { start: 21967751, end: 21995300 },
    'PTEN': { start: 87863113, end: 87971930 },
    'MYC': { start: 127735434, end: 127742951 },
  };
  
  const genePos = genePositions[gene] || { start: 50000000, end: 50100000 };
  const geneLength = genePos.end - genePos.start;
  const regionPadding = geneLength * 2;
  const regionStart = genePos.start - regionPadding;
  const regionEnd = genePos.end + regionPadding;
  
  const dataPoints: CNVDataPoint[] = [];
  const numPoints = 150;
  const step = (regionEnd - regionStart) / numPoints;
  
  for (let i = 0; i <= numPoints; i++) {
    const position = regionStart + i * step;
    const isInGene = position >= genePos.start && position <= genePos.end;
    
    // 基因区域内显示CNV变化，区域外显示正常
    const baseLog2Ratio = isInGene ? logRatio : 0;
    const noise = (Math.random() - 0.5) * 0.3;
    
    // BAF分布：正常区域在0、0.5、1附近聚集
    // CNV区域会偏离0.5（如0.33、0.67等）
    let baf: number;
    if (isInGene) {
      // CNV区域：偏离0.5的分布
      const rand = Math.random();
      if (logRatio > 0) {
        // 扩增：可能出现0.25, 0.33, 0.67, 0.75等
        if (rand < 0.3) baf = 0.25 + (Math.random() - 0.5) * 0.08;
        else if (rand < 0.6) baf = 0.33 + (Math.random() - 0.5) * 0.08;
        else if (rand < 0.8) baf = 0.67 + (Math.random() - 0.5) * 0.08;
        else baf = 0.75 + (Math.random() - 0.5) * 0.08;
      } else {
        // 缺失：LOH，主要在0和1附近
        if (rand < 0.45) baf = 0 + Math.random() * 0.08;
        else if (rand < 0.9) baf = 1 - Math.random() * 0.08;
        else baf = 0.5 + (Math.random() - 0.5) * 0.1;
      }
    } else {
      // 正常区域：在0、0.5、1附近聚集
      const rand = Math.random();
      if (rand < 0.2) baf = 0 + Math.random() * 0.05;
      else if (rand < 0.8) baf = 0.5 + (Math.random() - 0.5) * 0.08;
      else baf = 1 - Math.random() * 0.05;
    }
    
    dataPoints.push({
      position,
      log2Ratio: baseLog2Ratio + noise,
      baf: Math.max(0, Math.min(1, baf)),
    });
  }
  
  return { dataPoints, geneStart: genePos.start, geneEnd: genePos.end, regionStart, regionEnd };
}

// CNV绘图弹窗组件
function CNVPlotModal({ variant, isOpen, onClose }: { variant: CNVGene; isOpen: boolean; onClose: () => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const { dataPoints, geneStart, geneEnd, regionStart, regionEnd } = React.useMemo(
    () => generateMockCNVData(variant.gene, variant.logRatio, variant.chromosome),
    [variant.gene, variant.logRatio, variant.chromosome]
  );
  
  React.useEffect(() => {
    if (!isOpen) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置canvas尺寸 - 减去padding (p-5 = 20px * 2)
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = container.clientWidth - 40; // 减去左右padding
    canvas.width = containerWidth * dpr;
    canvas.height = 450 * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = '450px';
    ctx.scale(dpr, dpr);
    
    const width = containerWidth;
    const height = 450;
    const padding = { top: 35, right: 25, bottom: 50, left: 60 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = (height - padding.top - padding.bottom) / 2 - 20;
    
    // 清空画布
    ctx.fillStyle = '#f6f8fa';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制Log2Ratio图
    const log2Top = padding.top;
    const log2Bottom = log2Top + plotHeight;
    
    // Y轴范围
    const log2Min = -3;
    const log2Max = 3;
    
    // 绘制Log2Ratio背景和网格
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(padding.left, log2Top, plotWidth, plotHeight);
    ctx.strokeStyle = '#e1e4e8';
    ctx.lineWidth = 1;
    
    // 水平网格线
    for (let y = log2Min; y <= log2Max; y += 1) {
      const yPos = log2Top + plotHeight * (1 - (y - log2Min) / (log2Max - log2Min));
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(padding.left + plotWidth, yPos);
      ctx.stroke();
      
      // Y轴标签
      ctx.fillStyle = '#586069';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(y.toString(), padding.left - 10, yPos + 4);
    }
    
    // 绘制基因区域高亮
    const geneStartX = padding.left + plotWidth * (geneStart - regionStart) / (regionEnd - regionStart);
    const geneEndX = padding.left + plotWidth * (geneEnd - regionStart) / (regionEnd - regionStart);
    ctx.fillStyle = variant.type === 'Amplification' ? 'rgba(207, 34, 46, 0.15)' : 'rgba(9, 105, 218, 0.15)';
    ctx.fillRect(geneStartX, log2Top, geneEndX - geneStartX, plotHeight);
    
    // 绘制0线
    const zeroY = log2Top + plotHeight * (1 - (0 - log2Min) / (log2Max - log2Min));
    ctx.strokeStyle = '#24292f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, zeroY);
    ctx.lineTo(padding.left + plotWidth, zeroY);
    ctx.stroke();
    
    // 绘制Log2Ratio数据点
    ctx.fillStyle = variant.type === 'Amplification' ? '#cf222e' : '#0969da';
    dataPoints.forEach(point => {
      const x = padding.left + plotWidth * (point.position - regionStart) / (regionEnd - regionStart);
      const y = log2Top + plotHeight * (1 - (point.log2Ratio - log2Min) / (log2Max - log2Min));
      ctx.beginPath();
      ctx.arc(x, Math.max(log2Top, Math.min(log2Bottom, y)), 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Log2Ratio标题
    ctx.fillStyle = '#24292f';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Log2 Ratio', padding.left, log2Top - 12);
    
    // 绘制BAF图
    const bafTop = log2Bottom + 40;
    const bafBottom = bafTop + plotHeight;
    
    // BAF背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(padding.left, bafTop, plotWidth, plotHeight);
    
    // BAF网格线
    ctx.strokeStyle = '#e1e4e8';
    ctx.lineWidth = 1;
    for (let y = 0; y <= 1; y += 0.25) {
      const yPos = bafTop + plotHeight * (1 - y);
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(padding.left + plotWidth, yPos);
      ctx.stroke();
      
      ctx.fillStyle = '#586069';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(y.toFixed(2), padding.left - 8, yPos + 4);
    }
    
    // BAF基因区域高亮
    ctx.fillStyle = variant.type === 'Amplification' ? 'rgba(207, 34, 46, 0.15)' : 'rgba(9, 105, 218, 0.15)';
    ctx.fillRect(geneStartX, bafTop, geneEndX - geneStartX, plotHeight);
    
    // 绘制0.5线
    const halfY = bafTop + plotHeight * 0.5;
    ctx.strokeStyle = '#24292f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, halfY);
    ctx.lineTo(padding.left + plotWidth, halfY);
    ctx.stroke();
    
    // 绘制BAF数据点
    ctx.fillStyle = '#8250df';
    dataPoints.forEach(point => {
      const x = padding.left + plotWidth * (point.position - regionStart) / (regionEnd - regionStart);
      const y = bafTop + plotHeight * (1 - point.baf);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // BAF标题
    ctx.fillStyle = '#24292f';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('B-Allele Frequency', padding.left, bafTop - 10);
    
    // X轴标签（染色体位置）
    ctx.fillStyle = '#586069';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    const formatPosition = (pos: number) => {
      if (pos >= 1000000) return `${(pos / 1000000).toFixed(2)}Mb`;
      if (pos >= 1000) return `${(pos / 1000).toFixed(0)}Kb`;
      return pos.toString();
    };
    
    ctx.fillText(formatPosition(regionStart), padding.left, bafBottom + 18);
    ctx.fillText(formatPosition(regionEnd), padding.left + plotWidth, bafBottom + 18);
    
    // 染色体和基因标签
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#24292f';
    ctx.fillText(`${variant.chromosome}: ${variant.gene}`, padding.left + plotWidth / 2, bafBottom + 32);
    
  }, [isOpen, variant, dataPoints, geneStart, geneEnd, regionStart, regionEnd]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] max-w-[calc(100vw-520px)] bg-white dark:bg-[#0d1117] rounded-lg shadow-2xl z-[51]">
      {/* 头部 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-fg-muted" />
          <span className="font-medium text-fg-default">
            {variant.gene} 染色体区域CNV图
          </span>
          <Tag variant={variant.type === 'Amplification' ? 'danger' : 'info'}>
            {variant.type === 'Amplification' ? '扩增' : '缺失'}
          </Tag>
        </div>
      </div>
      
      {/* 绘图区 */}
      <div ref={containerRef} className="p-5 overflow-hidden">
        <canvas ref={canvasRef} className="rounded" style={{ display: 'block', maxWidth: '100%' }} />
      </div>
      
      {/* 图例 */}
      <div className="flex items-center justify-center gap-8 px-5 pb-5 text-sm text-fg-muted">
        <span className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${variant.type === 'Amplification' ? 'bg-danger-fg' : 'bg-accent-fg'}`} />
          Log2 Ratio
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-done-fg" />
          BAF
        </span>
        <span className="flex items-center gap-2">
          <span className={`w-5 h-3 rounded-sm ${variant.type === 'Amplification' ? 'bg-danger-subtle' : 'bg-accent-subtle'}`} />
          基因区域
        </span>
      </div>
    </div>
  );
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

      {/* CNV绘图弹窗 - 随面板一起显示 */}
      <CNVPlotModal 
        variant={variant} 
        isOpen={isOpen} 
        onClose={onClose} 
      />
    </>
  );
}
