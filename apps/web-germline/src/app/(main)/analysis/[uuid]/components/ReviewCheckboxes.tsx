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
    <Tooltip content={checked ? '已审核' : '点击标记为已审核'} placement="top">
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
        aria-label={checked ? '已审核' : '标记为已审核'}
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
    <Tooltip content={checked ? '已回报' : '点击标记为已回报'} placement="top">
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
        aria-label={checked ? '已回报' : '标记为已回报'}
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
  return (
    <Tooltip content="审核状态" placement="top">
      <div className="flex justify-center">
        <CheckCircle2 className="w-4 h-4 text-fg-muted" />
      </div>
    </Tooltip>
  );
}

export function ReportColumnHeader() {
  return (
    <Tooltip content="回报状态" placement="top">
      <div className="flex justify-center">
        <FileCheck2 className="w-4 h-4 text-fg-muted" />
      </div>
    </Tooltip>
  );
}
