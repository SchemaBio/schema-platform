'use client';

import * as React from 'react';
import { CheckCircle2, FileCheck2 } from 'lucide-react';
import { Tooltip } from '@schema/ui-kit';

interface ReviewCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * 审核勾选框
 */
export function ReviewCheckbox({ checked, onChange, disabled }: ReviewCheckboxProps) {
  return (
    <Tooltip content={checked ? '审核通过' : '点击标记为审核通过'} placement="top" variant="nav">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onChange(!checked);
        }}
        disabled={disabled}
        className={`
          p-1 rounded transition-colors
          ${checked 
            ? 'text-success-fg hover:text-success-emphasis' 
            : 'text-fg-muted hover:text-fg-default hover:bg-canvas-subtle'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={checked ? '审核通过' : '标记为审核通过'}
      >
        <CheckCircle2 className={`w-5 h-5 ${checked ? 'fill-success-subtle' : ''}`} />
      </button>
    </Tooltip>
  );
}

/**
 * 回报勾选框
 */
export function ReportCheckbox({ checked, onChange, disabled }: ReviewCheckboxProps) {
  return (
    <Tooltip content={checked ? '回报' : '点击标记为回报'} placement="top" variant="nav">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onChange(!checked);
        }}
        disabled={disabled}
        className={`
          p-1 rounded transition-colors
          ${checked 
            ? 'text-accent-fg hover:text-accent-emphasis' 
            : 'text-fg-muted hover:text-fg-default hover:bg-canvas-subtle'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={checked ? '回报' : '标记为回报'}
      >
        <FileCheck2 className={`w-5 h-5 ${checked ? 'fill-accent-subtle' : ''}`} />
      </button>
    </Tooltip>
  );
}

/**
 * 审核和回报状态的列头
 */
export function ReviewColumnHeader() {
  return '审核';
}

export function ReportColumnHeader() {
  return '回报';
}
