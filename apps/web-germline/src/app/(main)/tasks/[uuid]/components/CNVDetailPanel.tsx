'use client';

import * as React from 'react';
import { X, ExternalLink, FileText, Database, Dna, MapPin, BarChart3, GripHorizontal } from 'lucide-react';
import { Tag } from '@schema/ui-kit';
import type { CNVSegment, CNVExon } from '../types';

interface CNVDetailPanelProps {
  variant: CNVSegment | CNVExon | null;
  variantType: 'segment' | 'exon';
  isOpen: boolean;
  onClose: () => void;
  allSegments?: CNVSegment[];  // 所有CNV片段数据，用于绘制全基因组图
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

// 拖动 Hook
function useDraggable(initialPosition: { x: number; y: number } = { x: 0, y: 0 }) {
  const [position, setPosition] = React.useState(initialPosition);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartRef = React.useRef({ x: 0, y: 0 });
  const positionRef = React.useRef(position);

  React.useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    };
  }, []);

  React.useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const resetPosition = React.useCallback(() => setPosition({ x: 0, y: 0 }), []);
  return { position, isDragging, handleMouseDown, resetPosition };
}

// 染色体大小（hg38）
const CHROMOSOME_SIZES: Record<string, number> = {
  'chr1': 248956422, 'chr2': 242193529, 'chr3': 198295559, 'chr4': 190214555,
  'chr5': 181538259, 'chr6': 170805979, 'chr7': 159345973, 'chr8': 145138636,
  'chr9': 138394717, 'chr10': 133797422, 'chr11': 135086622, 'chr12': 133275309,
  'chr13': 114364328, 'chr14': 107043718, 'chr15': 101991189, 'chr16': 90338345,
  'chr17': 83257441, 'chr18': 80373285, 'chr19': 58617616, 'chr20': 64444167,
  'chr21': 46709983, 'chr22': 50818468, 'chrX': 156040895, 'chrY': 57227415,
};

// 判断是否为 CNVExon 类型
function isCNVExon(variant: CNVSegment | CNVExon): variant is CNVExon {
  return 'gene' in variant && 'exon' in variant;
}

// CNV 图弹窗组件
function CNVPlotModal({
  variant,
  allSegments,
  isOpen,
  onClose
}: {
  variant: CNVSegment;
  allSegments: CNVSegment[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { position, isDragging, handleMouseDown, resetPosition } = useDraggable();

  React.useEffect(() => {
    if (!isOpen) resetPosition();
  }, [isOpen, resetPosition]);

  // 生成当前染色体的滑窗数据
  const windowData = React.useMemo(() => {
    // Box-Muller变换生成正态分布随机数
    const gaussianRandom = (mean: number, stdDev: number) => {
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      return z0 * stdDev + mean;
    };

    const data: { pos: number; logRatio: number; inCNV: boolean; cnvType?: string }[] = [];
    const windowSize = 100000; // 100kb滑窗，单染色体可以更精细
    const chr = variant.chromosome;
    const chrSize = CHROMOSOME_SIZES[chr] || 100000000;
    const numWindows = Math.ceil(chrSize / windowSize);

    // 获取当前染色体上的所有CNV区域
    const cnvRegions = allSegments
      .filter(seg => seg.chromosome === chr)
      .map(seg => ({
        start: seg.startPosition,
        end: seg.endPosition,
        type: seg.type,
        copyNumber: seg.copyNumber,
        id: seg.id,
      }));

    for (let i = 0; i < numWindows; i++) {
      const windowStart = i * windowSize;
      const windowMid = windowStart + windowSize / 2;

      // 检查该窗口是否与CNV区域重叠
      const overlappingCNV = cnvRegions.find(
        cnv => windowStart < cnv.end && (windowStart + windowSize) > cnv.start
      );

      let logRatio: number;
      let inCNV = false;
      let cnvType: string | undefined;

      if (overlappingCNV) {
        const theoreticalRatio = Math.log2(overlappingCNV.copyNumber / 2);
        logRatio = theoreticalRatio + gaussianRandom(0, 0.05);
        inCNV = true;
        cnvType = overlappingCNV.type;
      } else {
        logRatio = gaussianRandom(0, 0.08);
      }

      data.push({ pos: windowMid, logRatio, inCNV, cnvType });
    }

    return data;
  }, [variant.chromosome, allSegments]);

  React.useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const containerWidth = container.clientWidth - 40;
    canvas.width = containerWidth * dpr;
    canvas.height = 280 * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = '280px';
    ctx.scale(dpr, dpr);

    const width = containerWidth;
    const height = 280;
    const padding = { top: 30, right: 20, bottom: 40, left: 50 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // 背景
    ctx.fillStyle = '#f6f8fa';
    ctx.fillRect(0, 0, width, height);

    // 绑定区域背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(padding.left, padding.top, plotWidth, plotHeight);

    const chr = variant.chromosome;
    const chrSize = CHROMOSOME_SIZES[chr] || 100000000;

    // 高亮当前选中的CNV区域
    const highlightStart = padding.left + (variant.startPosition / chrSize) * plotWidth;
    const highlightEnd = padding.left + (variant.endPosition / chrSize) * plotWidth;
    ctx.fillStyle = variant.type === 'Amplification' ? 'rgba(207,34,46,0.15)' : 'rgba(9,105,218,0.15)';
    ctx.fillRect(highlightStart, padding.top, Math.max(highlightEnd - highlightStart, 3), plotHeight);

    // Y轴范围和网格线
    const yMin = -2, yMax = 2;
    ctx.strokeStyle = '#e1e4e8';
    ctx.lineWidth = 1;
    for (let y = yMin; y <= yMax; y += 1) {
      const yPos = padding.top + plotHeight * (1 - (y - yMin) / (yMax - yMin));
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(padding.left + plotWidth, yPos);
      ctx.stroke();
      ctx.fillStyle = '#586069';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(y.toString(), padding.left - 8, yPos + 3);
    }

    // 0线加粗
    const zeroY = padding.top + plotHeight * 0.5;
    ctx.strokeStyle = '#24292f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, zeroY);
    ctx.lineTo(padding.left + plotWidth, zeroY);
    ctx.stroke();

    // 绘制滑窗数据点
    windowData.forEach(point => {
      const x = padding.left + (point.pos / chrSize) * plotWidth;
      const y = padding.top + plotHeight * (1 - (point.logRatio - yMin) / (yMax - yMin));

      // 判断是否在选中的CNV区域内
      const isInSelectedCNV = point.pos >= variant.startPosition && point.pos <= variant.endPosition;

      // 根据是否在CNV区域设置颜色
      if (point.inCNV) {
        ctx.fillStyle = point.cnvType === 'Amplification' ? '#cf222e' : '#0969da';
      } else {
        ctx.fillStyle = '#8b949e';
      }

      ctx.globalAlpha = isInSelectedCNV ? 1 : 0.5;
      ctx.beginPath();
      ctx.arc(x, Math.max(padding.top + 2, Math.min(padding.top + plotHeight - 2, y)), isInSelectedCNV ? 2.5 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Y轴标题
    ctx.fillStyle = '#24292f';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Log2 Ratio', padding.left, padding.top - 12);

    // X轴标签 - 显示位置刻度
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#586069';
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      const pos = (chrSize / tickCount) * i;
      const x = padding.left + (pos / chrSize) * plotWidth;
      const label = pos >= 1000000 ? `${(pos / 1000000).toFixed(0)}Mb` : `${(pos / 1000).toFixed(0)}kb`;
      ctx.fillText(label, x, padding.top + plotHeight + 15);
    }

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#24292f';
    ctx.fillText(`${chr} Position`, padding.left + plotWidth / 2, padding.top + plotHeight + 32);

  }, [isOpen, variant, windowData]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed left-1/2 top-1/2 w-[900px] max-w-[calc(100vw-480px)] bg-white rounded-lg shadow-2xl z-[51]"
      style={{
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-border cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <GripHorizontal className="w-4 h-4 text-fg-muted" />
          <BarChart3 className="w-4 h-4 text-fg-muted" />
          <span className="font-medium text-sm text-fg-default">{variant.chromosome} CNV图</span>
          <Tag variant={variant.type === 'Amplification' ? 'danger' : 'info'}>
            {variant.startPosition.toLocaleString()}-{variant.endPosition.toLocaleString()}
          </Tag>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-1 text-fg-muted hover:text-fg-default rounded hover:bg-canvas-inset"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div ref={containerRef} className="p-4">
        <canvas ref={canvasRef} className="rounded" style={{ display: 'block', maxWidth: '100%' }} />
      </div>
      <div className="flex items-center justify-center gap-6 px-4 pb-4 text-xs text-fg-muted">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-danger-fg" />扩增</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent-fg" />缺失</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-2.5 rounded-sm bg-danger-subtle" />选中区域</span>
      </div>
    </div>
  );
}

export function CNVDetailPanel({ variant, variantType, isOpen, onClose, allSegments = [] }: CNVDetailPanelProps) {
  if (!isOpen || !variant) return null;

  const isExon = isCNVExon(variant);
  const isAmplification = variant.type === 'Amplification';
  const showPlot = variantType === 'segment' && allSegments.length > 0;

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
            <InfoItem label="起始位置" value={variant.startPosition} />
            <InfoItem label="终止位置" value={variant.endPosition} />
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

      {/* CNV 图弹窗 */}
      {showPlot && !isExon && (
        <CNVPlotModal
          variant={variant as CNVSegment}
          allSegments={allSegments}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </>
  );
}
