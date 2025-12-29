'use client';

import * as React from 'react';
import { Button, Tag } from '@schema/ui-kit';
import { X, FileText, Link2, Trash2, RefreshCw, Copy, Check } from 'lucide-react';
import type { DataFile } from '../types';
import { formatFileSize, formatReadCount } from '../mock-data';

interface DataDetailPanelProps {
  data: DataFile;
  onClose: () => void;
  onLinkSample: (dataId: string) => void;
  onDelete: (dataId: string) => void;
  onRevalidate: (dataId: string) => void;
}

const statusConfig: Record<DataFile['status'], { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  pending: { label: '待验证', variant: 'warning' },
  validated: { label: '已验证', variant: 'neutral' },
  matched: { label: '已关联', variant: 'success' },
  error: { label: '错误', variant: 'danger' },
};

const formatConfig: Record<DataFile['format'], { label: string; color: string }> = {
  fastq: { label: 'FASTQ', color: 'text-blue-600' },
  ubam: { label: 'uBAM', color: 'text-purple-600' },
};

export function DataDetailPanel({ data, onClose, onLinkSample, onDelete, onRevalidate }: DataDetailPanelProps) {
  const [copiedPath, setCopiedPath] = React.useState<string | null>(null);

  const copyToClipboard = async (path: string, key: string) => {
    await navigator.clipboard.writeText(path);
    setCopiedPath(key);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const status = statusConfig[data.status];
  const format = formatConfig[data.format];

  return (
    <div className="w-80 flex-shrink-0 border-l border-border-default bg-canvas-default flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-fg-muted" />
          <span className="text-sm font-medium text-fg-default">数据详情</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* 基本信息 */}
        <div>
          <h4 className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-2">基本信息</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-fg-muted">ID</span>
              <span className="text-sm text-fg-default font-mono">{data.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-fg-muted">名称</span>
              <span className="text-sm text-fg-default">{data.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-fg-muted">格式</span>
              <span className={`text-sm font-medium ${format.color}`}>{format.label}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-fg-muted">类型</span>
              <span className="text-sm text-fg-default">
                {data.pairedEnd === 'paired' ? '双端' : '单端'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-fg-muted">状态</span>
              <Tag variant={status.variant}>{status.label}</Tag>
            </div>
          </div>
        </div>

        {/* 文件路径 */}
        <div>
          <h4 className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-2">文件路径</h4>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-fg-muted">
                  {data.pairedEnd === 'paired' ? 'R1' : '文件'}
                </span>
                <button
                  onClick={() => copyToClipboard(data.r1Path, 'r1')}
                  className="p-1 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors"
                  title="复制路径"
                >
                  {copiedPath === 'r1' ? (
                    <Check className="w-3 h-3 text-success-fg" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="bg-canvas-subtle rounded px-2 py-1.5 text-xs font-mono text-fg-default break-all">
                {data.r1Path}
              </div>
            </div>
            {data.r2Path && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-fg-muted">R2</span>
                  <button
                    onClick={() => copyToClipboard(data.r2Path!, 'r2')}
                    className="p-1 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors"
                    title="复制路径"
                  >
                    {copiedPath === 'r2' ? (
                      <Check className="w-3 h-3 text-success-fg" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <div className="bg-canvas-subtle rounded px-2 py-1.5 text-xs font-mono text-fg-default break-all">
                  {data.r2Path}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 统计信息 */}
        <div>
          <h4 className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-2">统计信息</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-fg-muted">文件大小</span>
              <span className="text-sm text-fg-default">{formatFileSize(data.size)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-fg-muted">Reads 数量</span>
              <span className="text-sm text-fg-default">{formatReadCount(data.readCount)}</span>
            </div>
            {data.qualityScore && (
              <div className="flex justify-between">
                <span className="text-sm text-fg-muted">平均质量分</span>
                <span className="text-sm text-fg-default">Q{data.qualityScore.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 关联样本 */}
        <div>
          <h4 className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-2">关联样本</h4>
          {data.sampleId ? (
            <div className="bg-canvas-subtle rounded-md p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-fg-default">{data.sampleName}</div>
                  <div className="text-xs text-fg-muted">{data.sampleId}</div>
                </div>
                <Button variant="ghost" size="small" onClick={() => onLinkSample(data.id)}>
                  更换
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="small"
              leftIcon={<Link2 className="w-4 h-4" />}
              onClick={() => onLinkSample(data.id)}
              className="w-full"
            >
              关联样本
            </Button>
          )}
        </div>

        {/* 错误信息 */}
        {data.status === 'error' && data.errorMessage && (
          <div>
            <h4 className="text-xs font-medium text-danger-fg uppercase tracking-wide mb-2">错误信息</h4>
            <div className="bg-danger-subtle rounded-md p-3 text-sm text-danger-fg">
              {data.errorMessage}
            </div>
          </div>
        )}

        {/* 时间信息 */}
        <div>
          <h4 className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-2">时间</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-fg-muted">创建时间</span>
              <span className="text-sm text-fg-default">{data.createdAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-fg-muted">更新时间</span>
              <span className="text-sm text-fg-default">{data.updatedAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-border-default space-y-2">
        {data.status === 'error' && (
          <Button
            variant="secondary"
            size="small"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => onRevalidate(data.id)}
            className="w-full"
          >
            重新验证
          </Button>
        )}
        <Button
          variant="danger"
          size="small"
          leftIcon={<Trash2 className="w-4 h-4" />}
          onClick={() => onDelete(data.id)}
          className="w-full"
        >
          删除数据
        </Button>
      </div>
    </div>
  );
}
