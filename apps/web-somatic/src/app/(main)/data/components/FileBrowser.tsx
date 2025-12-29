'use client';

import * as React from 'react';
import { Folder, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { Checkbox, cn } from '@schema/ui-kit';
import type { RemoteFile } from '../types';
import { formatFileSize } from '../mock-data';

interface FileBrowserProps {
  files: RemoteFile[];
  loading: boolean;
  selectedFiles: Set<string>;
  onSelectFile: (path: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onNavigate: (path: string) => void;
}

export function FileBrowser({
  files,
  loading,
  selectedFiles,
  onSelectFile,
  onSelectAll,
  onNavigate,
}: FileBrowserProps) {
  const importableFiles = files.filter((f) => f.type === 'file' && f.isImportable);
  const allImportableSelected =
    importableFiles.length > 0 &&
    importableFiles.every((f) => selectedFiles.has(f.path));
  const someSelected =
    importableFiles.some((f) => selectedFiles.has(f.path)) && !allImportableSelected;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-fg-muted animate-spin" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-fg-muted">
        此目录为空
      </div>
    );
  }

  // 排序：文件夹在前，文件在后
  const sortedFiles = [...files].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="border border-border-default rounded-md overflow-hidden">
      {/* 表头 */}
      <div className="flex items-center px-3 py-2 bg-canvas-subtle border-b border-border-default text-xs font-medium text-fg-muted">
        <div className="w-8 flex-shrink-0">
          {importableFiles.length > 0 && (
            <Checkbox
              checked={allImportableSelected}
              indeterminate={someSelected}
              onCheckedChange={(checked) => onSelectAll(checked === true)}
              aria-label="全选可导入文件"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">名称</div>
        <div className="w-24 text-right">大小</div>
        <div className="w-36 text-right">修改时间</div>
      </div>

      {/* 文件列表 */}
      <div className="max-h-[calc(100vh-320px)] overflow-auto">
        {sortedFiles.map((file) => {
          const isFolder = file.type === 'folder';
          const isSelected = selectedFiles.has(file.path);
          const canSelect = !isFolder && file.isImportable;

          return (
            <div
              key={file.path}
              className={cn(
                'flex items-center px-3 py-2 border-b border-border-muted last:border-b-0',
                'transition-colors',
                isFolder && 'cursor-pointer hover:bg-canvas-subtle',
                isSelected && 'bg-accent-subtle'
              )}
              onClick={() => isFolder && onNavigate(file.path)}
            >
              {/* 复选框 */}
              <div className="w-8 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {canSelect && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelectFile(file.path, checked === true)}
                    aria-label={`选择 ${file.name}`}
                  />
                )}
              </div>

              {/* 文件名 */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                {isFolder ? (
                  <Folder className="w-4 h-4 text-warning-fg flex-shrink-0" />
                ) : (
                  <FileText
                    className={cn(
                      'w-4 h-4 flex-shrink-0',
                      file.isImportable ? 'text-accent-fg' : 'text-fg-muted'
                    )}
                  />
                )}
                <span
                  className={cn(
                    'text-sm truncate',
                    isFolder && 'text-fg-default font-medium',
                    !isFolder && file.isImportable && 'text-fg-default',
                    !isFolder && !file.isImportable && 'text-fg-muted'
                  )}
                >
                  {file.name}
                </span>
                {isFolder && (
                  <ChevronRight className="w-4 h-4 text-fg-muted flex-shrink-0" />
                )}
              </div>

              {/* 大小 */}
              <div className="w-24 text-right text-sm text-fg-muted">
                {formatFileSize(file.size)}
              </div>

              {/* 修改时间 */}
              <div className="w-36 text-right text-sm text-fg-muted">
                {file.modifiedAt || '-'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
