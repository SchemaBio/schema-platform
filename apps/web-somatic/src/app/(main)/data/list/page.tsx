'use client';

import * as React from 'react';
import { Button } from '@schema/ui-kit';
import { Database, FolderInput, RefreshCw } from 'lucide-react';
import {
  StorageSourceSelector,
  FileBrowser,
  Breadcrumbs,
  ImportDialog,
} from '../components';
import {
  storageSources,
  fetchDirectoryContents,
  parseBreadcrumbs,
} from '../mock-data';
import type { StorageSource, RemoteFile } from '../types';

export default function DataListPage() {
  // 当前选中的存储源
  const [selectedSource, setSelectedSource] = React.useState<StorageSource | null>(
    storageSources[0] || null
  );
  // 当前路径
  const [currentPath, setCurrentPath] = React.useState('/');
  // 目录内容
  const [files, setFiles] = React.useState<RemoteFile[]>([]);
  // 加载状态
  const [loading, setLoading] = React.useState(false);
  // 选中的文件路径
  const [selectedFiles, setSelectedFiles] = React.useState<Set<string>>(new Set());
  // 导入弹窗
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);

  // 加载目录内容
  const loadDirectory = React.useCallback(
    async (sourceId: string, path: string) => {
      setLoading(true);
      try {
        const contents = await fetchDirectoryContents(sourceId, path);
        setFiles(contents);
      } catch (error) {
        console.error('Failed to load directory:', error);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 切换存储源
  const handleSelectSource = (source: StorageSource) => {
    setSelectedSource(source);
    setCurrentPath('/');
    setSelectedFiles(new Set());
    loadDirectory(source.id, '/');
  };

  // 导航到目录
  const handleNavigate = (path: string) => {
    if (!selectedSource) return;
    setCurrentPath(path);
    setSelectedFiles(new Set());
    loadDirectory(selectedSource.id, path);
  };

  // 刷新当前目录
  const handleRefresh = () => {
    if (!selectedSource) return;
    loadDirectory(selectedSource.id, currentPath);
  };

  // 选择/取消选择文件
  const handleSelectFile = (path: string, selected: boolean) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(path);
      } else {
        next.delete(path);
      }
      return next;
    });
  };

  // 全选/取消全选可导入文件
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const importablePaths = files
        .filter((f) => f.type === 'file' && f.isImportable)
        .map((f) => f.path);
      setSelectedFiles(new Set(importablePaths));
    } else {
      setSelectedFiles(new Set());
    }
  };

  // 获取选中的文件对象
  const selectedFileObjects = React.useMemo(() => {
    return files.filter((f) => selectedFiles.has(f.path));
  }, [files, selectedFiles]);

  // 确认导入
  const handleConfirmImport = (targetFolder: string) => {
    console.log('Import files to:', targetFolder, selectedFileObjects);
    // TODO: 调用后端 API 执行导入
    setSelectedFiles(new Set());
  };

  // 初始加载
  React.useEffect(() => {
    if (selectedSource) {
      loadDirectory(selectedSource.id, '/');
    }
  }, []);

  const breadcrumbs = parseBreadcrumbs(currentPath);

  return (
    <div className="flex h-full">
      {/* 左侧存储源列表 */}
      <div className="w-56 flex-shrink-0 border-r border-border-default bg-canvas-subtle">
        <div className="px-4 py-3 border-b border-border-default">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-fg-muted" />
            <span className="text-sm font-medium text-fg-default">存储源</span>
          </div>
        </div>
        <div className="p-2">
          <StorageSourceSelector
            sources={storageSources}
            selectedId={selectedSource?.id || null}
            onSelect={handleSelectSource}
          />
        </div>
      </div>

      {/* 右侧文件浏览器 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 工具栏 */}
        <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded hover:bg-canvas-subtle text-fg-muted hover:text-fg-default transition-colors"
              title="刷新"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            {selectedFiles.size > 0 && (
              <span className="text-sm text-fg-muted">
                已选 {selectedFiles.size} 个文件
              </span>
            )}
            <Button
              variant="primary"
              leftIcon={<FolderInput className="w-4 h-4" />}
              onClick={() => setImportDialogOpen(true)}
              disabled={selectedFiles.size === 0}
            >
              导入数据
            </Button>
          </div>
        </div>

        {/* 文件列表 */}
        <div className="flex-1 overflow-auto p-4">
          {selectedSource ? (
            <FileBrowser
              files={files}
              loading={loading}
              selectedFiles={selectedFiles}
              onSelectFile={handleSelectFile}
              onSelectAll={handleSelectAll}
              onNavigate={handleNavigate}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-fg-muted">
              请选择一个存储源
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="px-4 py-2 border-t border-border-default bg-canvas-subtle">
          <p className="text-xs text-fg-muted">
            支持导入的格式：FASTQ (.fastq, .fastq.gz, .fq, .fq.gz)、uBAM (.ubam, .bam)
          </p>
        </div>
      </div>

      {/* 导入确认弹窗 */}
      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        selectedFiles={selectedFileObjects}
        onConfirm={handleConfirmImport}
      />
    </div>
  );
}
