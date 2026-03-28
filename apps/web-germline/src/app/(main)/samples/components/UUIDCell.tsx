'use client';

import * as React from 'react';
import { Copy, Check } from 'lucide-react';
import { Tooltip } from '@schema/ui-kit';

interface UUIDCellProps {
  uuid: string;
  truncateLength?: number;
}

/**
 * UUID展示组件
 *
 * 展示方式：截断显示前8位，hover时tooltip显示完整UUID，点击复制按钮可复制完整UUID
 *
 * 业界常见做法参考：
 * - GitHub commit hash: 前7位
 * - Docker container ID: 前12位
 * - MongoDB ObjectId: 前8位
 */
export function UUIDCell({ uuid, truncateLength = 8 }: UUIDCellProps) {
  const [copied, setCopied] = React.useState(false);

  const truncated = uuid.slice(0, truncateLength);
  const isTruncated = uuid.length > truncateLength;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(uuid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy UUID:', err);
    }
  };

  const content = (
    <div className="flex items-center gap-1.5 group">
      <span className="font-mono text-xs text-accent-fg hover:underline cursor-pointer">
        {isTruncated ? truncated : uuid}
      </span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-all"
        aria-label="复制完整UUID"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
    </div>
  );

  if (isTruncated) {
    return (
      <Tooltip content={uuid} placement="top" variant="default">
        {content}
      </Tooltip>
    );
  }

  return content;
}