'use client';

import * as React from 'react';

export interface ContextMenuItem {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  items: ContextMenuItem[];
}

export function ContextMenu({ isOpen, onClose, position, items }: ContextMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  // 点击外部关闭
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // 计算位置（防止溢出视口）
  const adjustedPosition = React.useMemo(() => {
    if (!isOpen) return { x: 0, y: 0 };

    const menuWidth = 180;
    const menuHeight = items.filter(i => !i.separator).length * 36 + items.filter(i => i.separator).length * 9;
    const padding = 8;

    let x = position.x;
    let y = position.y;

    // 防止右侧溢出
    if (x + menuWidth + padding > window.innerWidth) {
      x = window.innerWidth - menuWidth - padding;
    }

    // 防止底部溢出
    if (y + menuHeight + padding > window.innerHeight) {
      y = window.innerHeight - menuHeight - padding;
    }

    // 防止顶部溢出
    if (y < padding) {
      y = padding;
    }

    // 防止左侧溢出
    if (x < padding) {
      x = padding;
    }

    return { x, y };
  }, [isOpen, position, items]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-canvas-default border border-border-default rounded-lg shadow-lg py-1 min-w-[160px]"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            <div
              key={`separator-${index}`}
              className="h-px bg-border-muted my-1"
            />
          );
        }

        return (
          <button
            key={item.label || `item-${index}`}
            className={`w-full px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
              item.disabled
                ? 'text-fg-muted cursor-not-allowed'
                : item.danger
                  ? 'text-danger-fg hover:bg-danger-subtle cursor-pointer'
                  : 'text-fg-default hover:bg-canvas-inset cursor-pointer'
            }`}
            onClick={() => {
              if (!item.disabled && item.onClick) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
          >
            {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}