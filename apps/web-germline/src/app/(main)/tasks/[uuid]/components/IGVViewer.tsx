'use client';

import * as React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Tooltip } from '@schema/ui-kit';

interface IGVViewerProps {
  chromosome: string;
  position: number;
  isOpen: boolean;
  onClose: () => void;
  /** 可选的参考基因组，默认 hg38 */
  genome?: 'hg38' | 'hg19';
  /** 可选的 BAM 文件路径 */
  bamUrl?: string;
}

/**
 * IGV.js 查看器组件
 * 用于在模态框中显示基因组浏览器，定位到指定变异位置
 */
export function IGVViewer({
  chromosome,
  position,
  isOpen,
  onClose,
  genome = 'hg38',
  bamUrl,
}: IGVViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const igvBrowserRef = React.useRef<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 格式化染色体名称（确保有 chr 前缀）
  const formatChromosome = (chr: string) => {
    if (chr.startsWith('chr')) return chr;
    if (chr === 'MT' || chr === 'M') return 'chrM';
    return `chr${chr}`;
  };

  // 计算显示区域（位置前后各 100bp）
  const locus = React.useMemo(() => {
    const chr = formatChromosome(chromosome);
    const start = Math.max(1, position - 100);
    const end = position + 100;
    return `${chr}:${start}-${end}`;
  }, [chromosome, position]);

  React.useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    let mounted = true;

    async function initIGV() {
      try {
        setLoading(true);
        setError(null);

        // 动态导入 igv.js
        const igv = await import('igv');

        if (!mounted || !containerRef.current) return;

        // 清理之前的实例
        if (igvBrowserRef.current) {
          igv.removeBrowser(igvBrowserRef.current);
          igvBrowserRef.current = null;
        }

        // IGV 配置
        const options: any = {
          genome,
          locus,
          tracks: [],
        };

        // 如果提供了 BAM 文件，添加 alignment track
        if (bamUrl) {
          options.tracks.push({
            type: 'alignment',
            format: 'bam',
            url: bamUrl,
            name: 'Alignments',
            height: 300,
          });
        }

        // 创建 IGV 浏览器
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
  }, [isOpen, locus, genome, bamUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* 模态框 */}
      <div className="relative bg-white dark:bg-[#0d1117] rounded-lg shadow-xl w-[90vw] max-w-6xl max-h-[85vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-fg-default">
              IGV 基因组浏览器
            </h3>
            <span className="px-2 py-0.5 text-sm bg-canvas-subtle rounded text-fg-muted">
              {locus}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://igv.org/app/?locus=${locus}&genome=${genome}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-fg-muted hover:text-fg-default hover:bg-canvas-subtle rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              在 IGV Web 中打开
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

        {/* IGV 容器 */}
        <div className="flex-1 overflow-auto p-4 min-h-[500px]">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-emphasis" />
                <span className="text-sm text-fg-muted">正在加载 IGV...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-danger-fg mb-2">{error}</p>
                <p className="text-sm text-fg-muted">
                  您可以尝试
                  <a
                    href={`https://igv.org/app/?locus=${locus}&genome=${genome}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-fg hover:underline mx-1"
                  >
                    在 IGV Web 中查看
                  </a>
                </p>
              </div>
            </div>
          )}

          <div 
            ref={containerRef} 
            className={loading || error ? 'hidden' : ''}
          />
        </div>
      </div>
    </div>
  );
}

// 位置链接组件，用于在表格中显示可点击的位置
interface PositionLinkProps {
  chromosome: string;
  position: number;
  label?: string;
  onClick: (chromosome: string, position: number) => void;
}

export function PositionLink({ chromosome, position, label, onClick }: PositionLinkProps) {
  const displayLabel = label ?? `${chromosome}:${position}`;
  
  return (
    <Tooltip content="点击在 IGV 中查看" placement="top" variant="nav">
      <button
        onClick={() => onClick(chromosome, position)}
        className="text-accent-fg hover:underline cursor-pointer text-left"
      >
        {displayLabel}
      </button>
    </Tooltip>
  );
}
