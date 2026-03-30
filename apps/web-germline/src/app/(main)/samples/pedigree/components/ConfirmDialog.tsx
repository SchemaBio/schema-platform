'use client';

import * as React from 'react';
import { Button } from '@schema/ui-kit';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = '确认',
  confirmVariant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  // Escape key to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-canvas-default rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2">
            {confirmVariant === 'danger' && (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            <h2 className="text-lg font-medium text-fg-default">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-fg-default">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-default bg-canvas-subtle">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button
            variant={confirmVariant === 'danger' ? 'primary' : 'primary'}
            className={confirmVariant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '处理中...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}