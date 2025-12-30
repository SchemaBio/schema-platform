'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag, Select } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Upload, Download, Trash2, X, FileText } from 'lucide-react';
import * as React from 'react';

interface BedFile {
  id: string;
  name: string;
  targetRegions: number;
  totalSize: string;
  genomeVersion: string;
  description: string;
  uploadedAt: string;
  uploadedBy: string;
}

const initialBedFiles: BedFile[] = [
  {
    id: '1',
    name: 'Agilent_SureSelect_V7.bed',
    targetRegions: 243199,
    totalSize: '67.3 MB',
    genomeVersion: 'hg38',
    description: 'Agilent SureSelect Human All Exon V7',
    uploadedAt: '2024-01-10',
    uploadedBy: '王工',
  },
  {
    id: '2',
    name: 'Cardio_Panel_v2.bed',
    targetRegions: 1856,
    totalSize: '2.1 MB',
    genomeVersion: 'hg38',
    description: '心血管疾病相关基因Panel',
    uploadedAt: '2024-03-15',
    uploadedBy: '李工',
  },
  {
    id: '3',
    name: 'IDT_xGen_Exome_v2.bed',
    targetRegions: 415115,
    totalSize: '89.2 MB',
    genomeVersion: 'hg38',
    description: 'IDT xGen Exome Research Panel v2',
    uploadedAt: '2024-06-20',
    uploadedBy: '王工',
  },
];

const GENOME_VERSION_OPTIONS = [
  { value: 'hg19', label: 'hg19 (GRCh37)' },
  { value: 'hg38', label: 'hg38 (GRCh38)' },
];

interface UploadBedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { file: File; genomeVersion: string; description: string }) => void;
}

function UploadBedModal({ isOpen, onClose, onSubmit }: UploadBedModalProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [genomeVersion, setGenomeVersion] = React.useState('hg38');
  const [description, setDescription] = React.useState('');
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.bed')) {
      setSelectedFile(file);
    } else {
      alert('请选择 .bed 格式的文件');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.bed')) {
      setSelectedFile(file);
    } else {
      alert('请选择 .bed 格式的文件');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    onSubmit({ file: selectedFile, genomeVersion, description });
    setSelectedFile(null);
    setGenomeVersion('hg38');
    setDescription('');
    onClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setGenomeVersion('hg38');
    setDescription('');
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">上传 BED 文件</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* 文件上传区域 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">选择文件 *</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${dragOver 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".bed"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-fg-default">{selectedFile.name}</p>
                    <p className="text-xs text-fg-muted">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">点击或拖拽上传 BED 文件</p>
                  <p className="text-xs text-gray-400 mt-1">仅支持 .bed 格式</p>
                </>
              )}
            </div>
          </div>

          {/* 参考基因组版本 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">参考基因组版本 *</label>
            <Select
              value={genomeVersion}
              onChange={(v) => setGenomeVersion(Array.isArray(v) ? v[0] : v)}
              options={GENOME_VERSION_OPTIONS}
            />
          </div>

          {/* 描述 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">描述</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入文件描述（可选）"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!selectedFile}
          >
            上传
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BedFilesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [bedFiles, setBedFiles] = React.useState<BedFile[]>(initialBedFiles);
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);

  const handleUpload = (data: { file: File; genomeVersion: string; description: string }) => {
    // 模拟上传，生成随机的目标区域数
    const newFile: BedFile = {
      id: String(Date.now()),
      name: data.file.name,
      targetRegions: Math.floor(Math.random() * 100000) + 1000,
      totalSize: data.file.size < 1024 * 1024 
        ? `${(data.file.size / 1024).toFixed(1)} KB`
        : `${(data.file.size / (1024 * 1024)).toFixed(1)} MB`,
      genomeVersion: data.genomeVersion,
      description: data.description || data.file.name.replace('.bed', ''),
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: '当前用户',
    };
    setBedFiles(prev => [...prev, newFile]);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该 BED 文件吗？')) {
      setBedFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const filteredFiles = React.useMemo(() => {
    if (!searchQuery) return bedFiles;
    const query = searchQuery.toLowerCase();
    return bedFiles.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
    );
  }, [searchQuery, bedFiles]);

  const columns: Column<BedFile>[] = [
    { id: 'name', header: '文件名', accessor: 'name', width: 250 },
    {
      id: 'targetRegions',
      header: '目标区域数',
      accessor: (row) => row.targetRegions.toLocaleString(),
      width: 120,
    },
    { id: 'totalSize', header: '文件大小', accessor: 'totalSize', width: 100 },
    {
      id: 'genomeVersion',
      header: '参考基因组',
      accessor: (row) => <Tag variant="info">{row.genomeVersion}</Tag>,
      width: 100,
    },
    { id: 'description', header: '描述', accessor: 'description', width: 250 },
    { id: 'uploadedAt', header: '上传时间', accessor: 'uploadedAt', width: 120 },
    { id: 'uploadedBy', header: '上传者', accessor: 'uploadedBy', width: 80 },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
            title="下载"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors"
            title="删除"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: 100,
    },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">BED 文件管理</h2>

      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
        <p className="text-sm text-fg-muted">
          BED 文件定义了目标捕获区域，用于变异检测和质控分析。支持 hg19/hg38 参考基因组。
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="w-64">
          <Input
            placeholder="搜索文件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
        <Button 
          variant="primary" 
          leftIcon={<Upload className="w-4 h-4" />}
          onClick={() => setIsUploadModalOpen(true)}
        >
          上传 BED 文件
        </Button>
      </div>

      <DataTable
        data={filteredFiles}
        columns={columns}
        rowKey="id"
        density="default"
        striped
      />

      <UploadBedModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUpload}
      />
    </PageContent>
  );
}
