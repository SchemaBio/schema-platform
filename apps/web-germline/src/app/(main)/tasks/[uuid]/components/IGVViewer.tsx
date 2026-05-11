'use client';

import * as React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Tooltip } from '@schema/ui-kit';

export interface IGVViewerProps {
  chromosome: string;
  position: number;
  isOpen: boolean;
  onClose: () => void;
  /** 内置参考基因组名称，默认 hg38。设为 null 则必须提供 reference 配置 */
  genome?: 'hg38' | 'hg19' | null;
  /** 自定义参考基因组配置（用于自建/离线参考） */
  reference?: IGVReferenceConfig;
  /** 显示的轨迹 */
  tracks?: IGVTrackConfig[];
  /** 可视窗口半径 bp，默认 100 */
  flanking?: number;
}

export interface IGVReferenceConfig {
  id: string;
  /** FASTA 文件 URL（需支持 HTTP Range） */
  fastaURL: string;
  /** FASTA 索引 URL */
  indexURL: string;
  /** 染色体条带注释 URL (可选) */
  cytobandURL?: string;
  /** 染色体别名文件 URL，用于映射 chr1 ↔ 1 */
  aliasURL?: string;
}

export interface IGVTrackConfig {
  type: 'alignment' | 'variant' | 'annotation' | 'wig';
  name: string;
  url?: string;
  indexURL?: string;
  format?: 'bam' | 'vcf' | 'cram' | 'gff3' | 'bed' | 'bigwig';
  height?: number;
  /** 颜色配置 */
  color?: string;
}

/**
 * 格式化染色体名称（添加 chr 前缀）
 */
export function formatChromosome(chr: string): string {
  if (chr.startsWith('chr')) return chr;
  if (chr === 'MT' || chr === 'M') return 'chrM';
  return `chr${chr}`;
}

/**
 * IGV.js 基因组浏览器查看器
 * 定位到指定变异位点，显示侧翼序列和可选的 BAM/VCF 轨迹
 */
export function IGVViewer({
  chromosome,
  position,
  isOpen,
  onClose,
  genome = 'hg38',
  reference,
  tracks,
  flanking = 100,
}: IGVViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const igvBrowserRef = React.useRef<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 计算显示区间
  const chr = formatChromosome(chromosome);
  const start = Math.max(1, position - flanking);
  const end = position + flanking;
  const locus = `${chr}:${start}-${end}`;

  React.useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    let mounted = true;

    async function initIGV() {
      try {
        setLoading(true);
        setError(null);

        const igv = await import('igv');

        if (!mounted || !containerRef.current) return;

        if (igvBrowserRef.current) {
          igv.removeBrowser(igvBrowserRef.current);
          igvBrowserRef.current = null;
        }

        const options: Record<string, unknown> = {
          locus,
          tracks: [],
        };

        // 参考基因组配置
        if (reference) {
          options.reference = {
            id: reference.id,
            fastaURL: reference.fastaURL,
            indexURL: reference.indexURL,
            cytobandURL: reference.cytobandURL,
            aliasURL: reference.aliasURL,
          };
        } else if (genome) {
          options.genome = genome;
        }

        // 添加轨迹
        if (tracks && tracks.length > 0) {
          (options.tracks as unknown[]).push(...tracks);
        }

        const browser = await igv.createBrowser(containerRef.current, options);

        if (mounted) {
          igvBrowserRef.current = browser;
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize IGV:', err);
        if (mounted) {
          setError('无法加载 IGV 浏览器');
          setLoading(false);
        }
      }
    }

    initIGV();

    return () => {
      mounted = false;
      if (igvBrowserRef.current) {
        import('igv').then((igv) => {
          igv.removeBrowser(igvBrowserRef.current);
          igvBrowserRef.current = null;
        });
      }
    };
  }, [isOpen, locus, genome, reference, tracks]);

  if (!isOpen) return null;

  const genomeLabel = reference ? reference.id : (genome ?? 'unknown');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white dark:bg-[#0d1117] rounded-lg shadow-xl w-[90vw] max-w-6xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-fg-default">IGV 基因组浏览器</h3>
            <span className="px-2 py-0.5 text-sm bg-canvas-subtle rounded text-fg-muted">{locus}</span>
            <span className="text-xs text-fg-muted">({genomeLabel})</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://igv.org/app/?locus=${locus}&genome=${genome || genomeLabel}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-fg-muted hover:text-fg-default hover:bg-canvas-subtle rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              IGV Web 版
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-fg-muted hover:text-fg-default hover:bg-canvas-subtle rounded transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 min-h-[500px]">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-emphasis" />
                <span className="text-sm text-fg-muted">正在加载参考基因组...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-danger-fg mb-2">{error}</p>
                <p className="text-sm text-fg-muted">
                  请确认网络连接正常（参考基因组文件托管在远程 CDN）
                </p>
              </div>
            </div>
          )}

          <div ref={containerRef} className={loading || error ? 'hidden' : ''} />
        </div>
      </div>
    </div>
  );
}

/** 位置链接组件 */
interface PositionLinkProps {
  chromosome: string;
  position: number;
  label?: string;
  onClick: (chromosome: string, position: number) => void;
}

export function PositionLink({ chromosome, position, label, onClick }: PositionLinkProps) {
  return (
    <Tooltip content="点击在 IGV 中查看" placement="top" variant="nav">
      <button
        onClick={() => onClick(chromosome, position)}
        className="text-accent-fg hover:underline cursor-pointer text-left"
      >
        {label ?? `${chromosome}:${position}`}
      </button>
    </Tooltip>
  );
}
