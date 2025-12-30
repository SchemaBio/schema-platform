'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Plus, Search, Download, Trash2, X, Upload, FileText } from 'lucide-react';
import * as React from 'react';

interface MSIBaselineFile {
  id: string;
  name: string;
  sampleCount: number;
  markerCount: number;
  bedFile: string;
  description: string;
  createdAt: string;
  createdBy: string;
}

const initialBaselines: MSIBaselineFile[] = [
  {
    id: '1',
    name: 'MSI_Baseline_V1',
    sampleCount: 50,
    markerCount: 5,
    bedFile: 'Agilent_SureSelect_V7.bed',
    description: 'MSI 检测基线 V1（5个经典位点）',
    createdAt: '2024-08-15',
    createdBy: '王工',
  },
  {
    id: '2',
    name: 'MSI_Baseline_V2',
    sampleCount: 100,
    markerCount: 7,
    bedFile: 'Agilent_SureSelect_V7.bed',
    description: 'MSI 检测基线 V2（7个位点，含 MONO-27）',
    createdAt: '2024-10-20',
    createdBy: '李工',
  },
  {
    id: '3',
    name: 'ctDNA_MSI_Baseline',
    sampleCount: 80,
    markerCount: 5,
    bedFile: 'ctDNA_Panel_168.bed',
    description: 'ctDNA 样本 MSI 检测基线',
    createdAt: '2024-11-10',
    createdBy: '王工',
  },
];

// 删除确认弹窗
interface DeleteConfirmModalProps {
  isOpen: boolean;
  baselineName: string;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({ isOpen, baselineName, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-center text-gray-900 dark:text-gray-100 mb-2">
            删除 MSI 基线
          </h3>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            确定要删除基线 "<span className="font-medium text-gray-700 dark:text-gray-300">{baselineName}</span>" 吗？此操作无法撤销。
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1">
            删除
          </Button>
        </div>
      </div>
    </div>
  );
}


// 创建基线弹窗
interface CreateBaselineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; bedFile: string; description: string; file: File }) => void;
}

function CreateBaselineModal({ isOpen, onClose, onSubmit }: CreateBaselineModalProps) {
  const [name, setName] = React.useState('');
  const [bedFile, setBedFile] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const BED_FILE_OPTIONS = [
    'Agilent_SureSelect_V7.bed',
    'IDT_xGen_Exome_v2.bed',
    'Twist_Exome_V2.bed',
    'ctDNA_Panel_168.bed',
    'Custom_Panel.bed',
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (!name || !bedFile || !selectedFile) return;
    onSubmit({ name, bedFile, description, file: selectedFile });
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setBedFile('');
    setDescription('');
    setSelectedFile(null);
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
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">创建 MSI 基线</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 基线名称 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">基线名称 *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：MSI_Baseline_V3"
            />
          </div>

          {/* 关联 BED 文件 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">关联 BED 文件 *</label>
            <select
              value={bedFile}
              onChange={(e) => setBedFile(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-fg-default focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择 BED 文件</option>
              {BED_FILE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <p className="text-xs text-fg-muted mt-1">选择与样本捕获试剂盒对应的 BED 文件</p>
          </div>

          {/* 描述 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">描述</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="基线用途说明"
            />
          </div>

          {/* 文件上传区域 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">基线文件 *</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
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
                accept=".txt,.tsv"
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
                  <p className="text-sm text-gray-500">点击或拖拽上传 MSI 基线文件</p>
                  <p className="text-xs text-gray-400 mt-1">支持 .txt、.tsv 格式</p>
                </>
              )}
            </div>
            <p className="text-xs text-fg-muted mt-1">
              基线文件应包含正常样本的 MSI 位点信息，用于计算 MSI 状态
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!name || !bedFile || !selectedFile}
          >
            创建
          </Button>
        </div>
      </div>
    </div>
  );
}


export default function MSIBaselinePage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [baselines, setBaselines] = React.useState<MSIBaselineFile[]>(initialBaselines);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<MSIBaselineFile | null>(null);

  const handleCreate = (data: { name: string; bedFile: string; description: string; file: File }) => {
    const newBaseline: MSIBaselineFile = {
      id: String(Date.now()),
      name: data.name,
      sampleCount: Math.floor(Math.random() * 100) + 30, // 模拟样本数
      markerCount: Math.floor(Math.random() * 3) + 5, // 模拟位点数 5-7
      bedFile: data.bedFile,
      description: data.description || `${data.name} MSI 检测基线`,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: '当前用户',
    };
    setBaselines(prev => [...prev, newBaseline]);
  };

  const handleDelete = (baseline: MSIBaselineFile) => {
    setDeleteTarget(baseline);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      setBaselines(prev => prev.filter(b => b.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const filteredFiles = React.useMemo(() => {
    if (!searchQuery) return baselines;
    const query = searchQuery.toLowerCase();
    return baselines.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
    );
  }, [searchQuery, baselines]);

  const columns: Column<MSIBaselineFile>[] = [
    { id: 'name', header: '基线名称', accessor: 'name', width: 220 },
    {
      id: 'sampleCount',
      header: '样本数',
      accessor: (row) => `${row.sampleCount} 个`,
      width: 90,
    },
    {
      id: 'markerCount',
      header: 'MSI 位点数',
      accessor: (row) => (
        <Tag variant="info">{row.markerCount} 个</Tag>
      ),
      width: 100,
    },
    { id: 'bedFile', header: '关联 BED', accessor: 'bedFile', width: 200 },
    { id: 'description', header: '描述', accessor: 'description', width: 220 },
    { id: 'createdAt', header: '创建时间', accessor: 'createdAt', width: 110 },
    { id: 'createdBy', header: '创建者', accessor: 'createdBy', width: 80 },
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
            onClick={() => handleDelete(row)}
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
      <h2 className="text-lg font-medium text-fg-default mb-4">MSI 基线管理</h2>

      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
        <p className="text-sm text-fg-muted">
          MSI（微卫星不稳定性）基线用于判断样本的 MSI 状态。通过对比样本与正常基线的微卫星位点长度分布，
          识别 MSI-H（高度不稳定）或 MSS（稳定）状态。建议使用 ≥30 个正常样本构建基线。
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="w-64">
          <Input
            placeholder="搜索基线..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
        <Button 
          variant="primary" 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          创建基线
        </Button>
      </div>

      <DataTable
        data={filteredFiles}
        columns={columns}
        rowKey="id"
        density="default"
        striped
      />

      <CreateBaselineModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        baselineName={deleteTarget?.name || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </PageContent>
  );
}
