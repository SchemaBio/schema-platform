'use client';

import * as React from 'react';
import { X, ExternalLink, FileText, Database, Dna, BarChart3 } from 'lucide-react';
import { Tag } from '@schema/ui-kit';

// 染色体臂水平CNV类型
interface CNVChrom {
  id: string;
  chromosome: string;
  arm: 'p' | 'q';
  type: 'Gain' | 'Loss' | 'Normal';
  copyNumber: number;
  logRatio: number;
  bafDeviation: number;
  size: number;
  relatedCancers: string[];
  clinicalSignificance: string;
  reviewed: boolean;
  reported: boolean;
}

// 全基因组CNV数据
interface GenomeCNVData {
  chromosome: string;
  arm: 'p' | 'q';
  position: number;
  log2Ratio: number;
  baf: number;
}

interface CNVChromDetailPanelProps {
  variant: CNVChrom | null;
  allVariants: CNVChrom[];
  isOpen: boolean;
  onClose: () => void;
}

// 信息项组件
function InfoItem({ label, value, link }: { label: string; value?: React.ReactNode; link?: string }) {
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
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-accent-fg text-xs hover:underline flex items-center gap-1">
          {value}<ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <span className="text-fg-default text-xs text-right">{value}</span>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2 mt-4 first:mt-0">
      <Icon className="w-3.5 h-3.5 text-fg-muted" />
      <h4 className="text-xs font-medium text-fg-default">{title}</h4>
    </div>
  );
}

const formatSize = (size: number) => {
  if (size >= 1000000) return `${(size / 1000000).toFixed(1)} Mb`;
  if (size >= 1000) return `${(size / 1000).toFixed(1)} kb`;
  return `${size} bp`;
};


// 染色体大小（hg38，单位bp）
const CHROMOSOME_SIZES: Record<string, { p: number; q: number; total: number }> = {
  'chr1': { p: 125000000, q: 123400000, total: 248400000 },
  'chr2': { p: 93300000, q: 149000000, total: 242300000 },
  'chr3': { p: 90900000, q: 107500000, total: 198400000 },
  'chr4': { p: 50000000, q: 140300000, total: 190300000 },
  'chr5': { p: 48800000, q: 132400000, total: 181200000 },
  'chr6': { p: 59800000, q: 111200000, total: 171000000 },
  'chr7': { p: 60100000, q: 99400000, total: 159500000 },
  'chr8': { p: 45200000, q: 101400000, total: 146600000 },
  'chr9': { p: 43000000, q: 95500000, total: 138500000 },
  'chr10': { p: 39800000, q: 93900000, total: 133700000 },
  'chr11': { p: 53400000, q: 81600000, total: 135000000 },
  'chr12': { p: 35500000, q: 97900000, total: 133400000 },
  'chr13': { p: 17700000, q: 96800000, total: 114500000 },
  'chr14': { p: 17200000, q: 90000000, total: 107200000 },
  'chr15': { p: 19000000, q: 83200000, total: 102200000 },
  'chr16': { p: 36800000, q: 53500000, total: 90300000 },
  'chr17': { p: 25100000, q: 58100000, total: 83200000 },
  'chr18': { p: 18500000, q: 62100000, total: 80600000 },
  'chr19': { p: 26200000, q: 32600000, total: 58800000 },
  'chr20': { p: 28100000, q: 36800000, total: 64900000 },
  'chr21': { p: 12000000, q: 34800000, total: 46800000 },
  'chr22': { p: 15000000, q: 35600000, total: 50600000 },
  'chrX': { p: 60600000, q: 95400000, total: 156000000 },
  'chrY': { p: 10400000, q: 47000000, total: 57400000 },
};

// 生成全基因组CNV数据
function generateGenomeCNVData(allVariants: CNVChrom[]): GenomeCNVData[] {
  const dataPoints: GenomeCNVData[] = [];
  const chromosomes = ['chr1','chr2','chr3','chr4','chr5','chr6','chr7','chr8','chr9','chr10','chr11','chr12','chr13','chr14','chr15','chr16','chr17','chr18','chr19','chr20','chr21','chr22','chrX'];
  
  // 创建变异查找表
  const variantMap = new Map<string, CNVChrom>();
  allVariants.forEach(v => {
    variantMap.set(`${v.chromosome}${v.arm}`, v);
  });
  
  chromosomes.forEach(chr => {
    const sizes = CHROMOSOME_SIZES[chr] || { p: 50000000, q: 50000000, total: 100000000 };
    
    // p臂
    const pVariant = variantMap.get(`${chr}p`);
    const pLogRatio = pVariant ? pVariant.logRatio : 0;
    const numPPoints = 15;
    for (let i = 0; i < numPPoints; i++) {
      const pos = (sizes.p / numPPoints) * i;
      const noise = (Math.random() - 0.5) * 0.25;
      let baf: number;
      if (pVariant && pVariant.type !== 'Normal') {
        const rand = Math.random();
        if (pVariant.type === 'Gain') {
          baf = rand < 0.4 ? 0.33 + (Math.random()-0.5)*0.06 : rand < 0.8 ? 0.67 + (Math.random()-0.5)*0.06 : 0.5 + (Math.random()-0.5)*0.08;
        } else {
          baf = rand < 0.45 ? Math.random()*0.06 : rand < 0.9 ? 1-Math.random()*0.06 : 0.5+(Math.random()-0.5)*0.1;
        }
      } else {
        const rand = Math.random();
        baf = rand < 0.15 ? Math.random()*0.04 : rand < 0.85 ? 0.5+(Math.random()-0.5)*0.06 : 1-Math.random()*0.04;
      }
      dataPoints.push({ chromosome: chr, arm: 'p', position: pos, log2Ratio: pLogRatio + noise, baf });
    }
    
    // q臂
    const qVariant = variantMap.get(`${chr}q`);
    const qLogRatio = qVariant ? qVariant.logRatio : 0;
    const numQPoints = 15;
    for (let i = 0; i < numQPoints; i++) {
      const pos = sizes.p + (sizes.q / numQPoints) * i;
      const noise = (Math.random() - 0.5) * 0.25;
      let baf: number;
      if (qVariant && qVariant.type !== 'Normal') {
        const rand = Math.random();
        if (qVariant.type === 'Gain') {
          baf = rand < 0.4 ? 0.33 + (Math.random()-0.5)*0.06 : rand < 0.8 ? 0.67 + (Math.random()-0.5)*0.06 : 0.5 + (Math.random()-0.5)*0.08;
        } else {
          baf = rand < 0.45 ? Math.random()*0.06 : rand < 0.9 ? 1-Math.random()*0.06 : 0.5+(Math.random()-0.5)*0.1;
        }
      } else {
        const rand = Math.random();
        baf = rand < 0.15 ? Math.random()*0.04 : rand < 0.85 ? 0.5+(Math.random()-0.5)*0.06 : 1-Math.random()*0.04;
      }
      dataPoints.push({ chromosome: chr, arm: 'q', position: pos, log2Ratio: qLogRatio + noise, baf });
    }
  });
  
  return dataPoints;
}


// 全基因组CNV绘图弹窗
function GenomeCNVPlotModal({ variant, allVariants, isOpen }: { variant: CNVChrom; allVariants: CNVChrom[]; isOpen: boolean }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const dataPoints = React.useMemo(() => generateGenomeCNVData(allVariants), [allVariants]);
  
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
    canvas.height = 500 * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = '500px';
    ctx.scale(dpr, dpr);
    
    const width = containerWidth;
    const height = 500;
    const padding = { top: 35, right: 25, bottom: 60, left: 55 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = (height - padding.top - padding.bottom) / 2 - 25;
    
    ctx.fillStyle = '#f6f8fa';
    ctx.fillRect(0, 0, width, height);
    
    const chromosomes = ['chr1','chr2','chr3','chr4','chr5','chr6','chr7','chr8','chr9','chr10','chr11','chr12','chr13','chr14','chr15','chr16','chr17','chr18','chr19','chr20','chr21','chr22','chrX'];
    let totalGenomeSize = 0;
    chromosomes.forEach(chr => { totalGenomeSize += CHROMOSOME_SIZES[chr]?.total || 100000000; });
    
    // 计算每个染色体的X位置
    const chromPositions: { chr: string; startX: number; endX: number; centromereX: number }[] = [];
    let cumSize = 0;
    chromosomes.forEach(chr => {
      const sizes = CHROMOSOME_SIZES[chr] || { p: 50000000, q: 50000000, total: 100000000 };
      const startX = padding.left + (cumSize / totalGenomeSize) * plotWidth;
      const centromereX = padding.left + ((cumSize + sizes.p) / totalGenomeSize) * plotWidth;
      cumSize += sizes.total;
      const endX = padding.left + (cumSize / totalGenomeSize) * plotWidth;
      chromPositions.push({ chr, startX, endX, centromereX });
    });
    
    // Log2Ratio图
    const log2Top = padding.top;
    const log2Bottom = log2Top + plotHeight;
    const log2Min = -3, log2Max = 3;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(padding.left, log2Top, plotWidth, plotHeight);
    
    // 染色体背景交替色
    chromPositions.forEach((cp, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#f8f9fa' : '#ffffff';
      ctx.fillRect(cp.startX, log2Top, cp.endX - cp.startX, plotHeight);
    });
    
    // 高亮当前选中的染色体臂
    const selectedCp = chromPositions.find(cp => cp.chr === variant.chromosome);
    if (selectedCp) {
      const highlightStart = variant.arm === 'p' ? selectedCp.startX : selectedCp.centromereX;
      const highlightEnd = variant.arm === 'p' ? selectedCp.centromereX : selectedCp.endX;
      ctx.fillStyle = variant.type === 'Gain' ? 'rgba(207,34,46,0.2)' : variant.type === 'Loss' ? 'rgba(9,105,218,0.2)' : 'rgba(128,128,128,0.1)';
      ctx.fillRect(highlightStart, log2Top, highlightEnd - highlightStart, plotHeight);
    }
    
    // 网格线
    ctx.strokeStyle = '#e1e4e8';
    ctx.lineWidth = 1;
    for (let y = log2Min; y <= log2Max; y += 1) {
      const yPos = log2Top + plotHeight * (1 - (y - log2Min) / (log2Max - log2Min));
      ctx.beginPath(); ctx.moveTo(padding.left, yPos); ctx.lineTo(padding.left + plotWidth, yPos); ctx.stroke();
      ctx.fillStyle = '#586069'; ctx.font = '11px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(y.toString(), padding.left - 8, yPos + 4);
    }
    
    // 0线
    const zeroY = log2Top + plotHeight * 0.5;
    ctx.strokeStyle = '#24292f'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(padding.left, zeroY); ctx.lineTo(padding.left + plotWidth, zeroY); ctx.stroke();
    
    // 数据点
    cumSize = 0;
    dataPoints.forEach(point => {
      const chrIdx = chromosomes.indexOf(point.chromosome);
      if (chrIdx < 0) return;
      let prevSize = 0;
      for (let i = 0; i < chrIdx; i++) prevSize += CHROMOSOME_SIZES[chromosomes[i]]?.total || 100000000;
      const x = padding.left + ((prevSize + point.position) / totalGenomeSize) * plotWidth;
      const y = log2Top + plotHeight * (1 - (point.log2Ratio - log2Min) / (log2Max - log2Min));
      const isSelected = point.chromosome === variant.chromosome && point.arm === variant.arm;
      ctx.fillStyle = point.log2Ratio > 0.3 ? '#cf222e' : point.log2Ratio < -0.3 ? '#0969da' : '#6e7781';
      ctx.globalAlpha = isSelected ? 1 : 0.6;
      ctx.beginPath(); ctx.arc(x, Math.max(log2Top, Math.min(log2Bottom, y)), isSelected ? 4 : 3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = '#24292f'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('Log2 Ratio', padding.left, log2Top - 12);
    
    // BAF图
    const bafTop = log2Bottom + 50;
    const bafBottom = bafTop + plotHeight;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(padding.left, bafTop, plotWidth, plotHeight);
    
    chromPositions.forEach((cp, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#f8f9fa' : '#ffffff';
      ctx.fillRect(cp.startX, bafTop, cp.endX - cp.startX, plotHeight);
    });
    
    if (selectedCp) {
      const highlightStart = variant.arm === 'p' ? selectedCp.startX : selectedCp.centromereX;
      const highlightEnd = variant.arm === 'p' ? selectedCp.centromereX : selectedCp.endX;
      ctx.fillStyle = variant.type === 'Gain' ? 'rgba(207,34,46,0.2)' : variant.type === 'Loss' ? 'rgba(9,105,218,0.2)' : 'rgba(128,128,128,0.1)';
      ctx.fillRect(highlightStart, bafTop, highlightEnd - highlightStart, plotHeight);
    }
    
    ctx.strokeStyle = '#e1e4e8'; ctx.lineWidth = 1;
    for (let y = 0; y <= 1; y += 0.25) {
      const yPos = bafTop + plotHeight * (1 - y);
      ctx.beginPath(); ctx.moveTo(padding.left, yPos); ctx.lineTo(padding.left + plotWidth, yPos); ctx.stroke();
      ctx.fillStyle = '#586069'; ctx.font = '11px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(y.toFixed(2), padding.left - 8, yPos + 4);
    }
    
    const halfY = bafTop + plotHeight * 0.5;
    ctx.strokeStyle = '#24292f'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(padding.left, halfY); ctx.lineTo(padding.left + plotWidth, halfY); ctx.stroke();
    
    cumSize = 0;
    dataPoints.forEach(point => {
      const chrIdx = chromosomes.indexOf(point.chromosome);
      if (chrIdx < 0) return;
      let prevSize = 0;
      for (let i = 0; i < chrIdx; i++) prevSize += CHROMOSOME_SIZES[chromosomes[i]]?.total || 100000000;
      const x = padding.left + ((prevSize + point.position) / totalGenomeSize) * plotWidth;
      const y = bafTop + plotHeight * (1 - point.baf);
      const isSelected = point.chromosome === variant.chromosome && point.arm === variant.arm;
      ctx.fillStyle = '#8250df';
      ctx.globalAlpha = isSelected ? 1 : 0.6;
      ctx.beginPath(); ctx.arc(x, y, isSelected ? 4 : 3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = '#24292f'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('B-Allele Frequency', padding.left, bafTop - 12);
    
    // X轴染色体标签
    ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#586069';
    chromPositions.forEach(cp => {
      const label = cp.chr.replace('chr', '');
      ctx.fillText(label, (cp.startX + cp.endX) / 2, bafBottom + 18);
    });
    
    ctx.font = 'bold 12px sans-serif'; ctx.fillStyle = '#24292f';
    ctx.fillText('Chromosome', padding.left + plotWidth / 2, bafBottom + 38);
    
  }, [isOpen, variant, allVariants, dataPoints]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] max-w-[calc(100vw-520px)] bg-white dark:bg-[#0d1117] rounded-lg shadow-2xl z-[51]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-fg-muted" />
          <span className="font-medium text-fg-default">全基因组CNV图</span>
          <Tag variant={variant.type === 'Gain' ? 'danger' : variant.type === 'Loss' ? 'info' : 'neutral'}>
            {variant.chromosome}{variant.arm} {variant.type === 'Gain' ? '获得' : variant.type === 'Loss' ? '丢失' : '正常'}
          </Tag>
        </div>
      </div>
      <div ref={containerRef} className="p-5 overflow-hidden">
        <canvas ref={canvasRef} className="rounded" style={{ display: 'block', maxWidth: '100%' }} />
      </div>
      <div className="flex items-center justify-center gap-8 px-5 pb-5 text-sm text-fg-muted">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-danger-fg" />Gain</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-accent-fg" />Loss</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-done-fg" />BAF</span>
        <span className="flex items-center gap-2"><span className="w-5 h-3 rounded-sm bg-danger-subtle" />选中区域</span>
      </div>
    </div>
  );
}


export function CNVChromDetailPanel({ variant, allVariants, isOpen, onClose }: CNVChromDetailPanelProps) {
  if (!isOpen || !variant) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white dark:bg-[#0d1117] border-l border-border shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-canvas-subtle">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-fg-default">{variant.chromosome}{variant.arm}</span>
            <Tag variant={variant.type === 'Gain' ? 'danger' : variant.type === 'Loss' ? 'info' : 'neutral'}>
              {variant.type === 'Gain' ? '获得' : variant.type === 'Loss' ? '丢失' : '正常'}
            </Tag>
          </div>
          <button onClick={onClose} className="p-1 text-fg-muted hover:text-fg-default rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <SectionTitle icon={Dna} title="基本信息" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="染色体臂" value={`${variant.chromosome}${variant.arm}`} />
            <InfoItem label="类型" value={
              <Tag variant={variant.type === 'Gain' ? 'danger' : variant.type === 'Loss' ? 'info' : 'neutral'}>
                {variant.type === 'Gain' ? '获得' : variant.type === 'Loss' ? '丢失' : '正常'}
              </Tag>
            } />
            <InfoItem label="拷贝数" value={variant.copyNumber.toString()} />
            <InfoItem label="Log2 Ratio" value={variant.logRatio.toFixed(2)} />
            <InfoItem label="BAF偏移" value={`${(variant.bafDeviation * 100).toFixed(1)}%`} />
            <InfoItem label="大小" value={formatSize(variant.size)} />
          </div>

          <SectionTitle icon={FileText} title="临床意义" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="临床意义" value={variant.clinicalSignificance} />
          </div>

          <SectionTitle icon={FileText} title="相关癌种" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            {variant.relatedCancers.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {variant.relatedCancers.map((cancer, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs bg-canvas-inset rounded">{cancer}</span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-fg-muted">暂无相关癌种信息</span>
            )}
          </div>

          <SectionTitle icon={Database} title="外部数据库" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="UCSC" value="查看" link={`https://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&position=${variant.chromosome}`} />
            <InfoItem label="Ensembl" value="查看" link={`https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=${variant.chromosome.replace('chr','')}`} />
          </div>
        </div>

        <div className="border-t border-border p-3 bg-canvas-subtle">
          <button onClick={onClose} className="w-full px-3 py-1.5 text-xs border border-border rounded-md hover:bg-canvas-inset">关闭</button>
        </div>
      </div>

      <GenomeCNVPlotModal variant={variant} allVariants={allVariants} isOpen={isOpen} />
    </>
  );
}
