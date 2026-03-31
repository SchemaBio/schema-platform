'use client';

import { PageContent } from '@/components/layout';
import { Button, Input } from '@schema/ui-kit';
import { Plus, Search, Trash2, ChevronDown, ChevronRight, X, Upload } from 'lucide-react';
import * as React from 'react';

interface BaselineFile {
  id: string;
  name: string;
  sampleCount: number;
  bedFile: string;
  description: string;
  sampleIds: string[];
  createdAt: string;
  createdBy: string;
}

const mockBaselines: BaselineFile[] = [
  {
    id: '1',
    name: 'WES_V7_CNV_Baseline_100',
    sampleCount: 100,
    bedFile: 'Agilent_SureSelect_V7.bed',
    description: 'WES V7 CNV检测基线（100样本）',
    sampleIds: [
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      'c3d4e5f6-a7b8-9012-cdef-123456789012',
      'd4e5f6a7-b8c9-0123-defa-234567890123',
      'e5f6a7b8-c9d0-1234-efab-345678901234',
    ],
    createdAt: '2024-10-15',
    createdBy: '王工',
  },
  {
    id: '2',
    name: 'WES_V7_CNV_Baseline_200',
    sampleCount: 200,
    bedFile: 'Agilent_SureSelect_V7.bed',
    description: 'WES V7 CNV检测基线（200样本）',
    sampleIds: [
      'f6a7b8c9-d0e1-2345-fabc-456789012345',
      'a7b8c9d0-e1f2-3456-abcd-567890123456',
      'b8c9d0e1-f2a3-4567-bcde-678901234567',
    ],
    createdAt: '2024-11-01',
    createdBy: '李工',
  },
  {
    id: '3',
    name: 'IDT_xGen_CNV_Baseline',
    sampleCount: 80,
    bedFile: 'IDT_xGen_Exome_v2.bed',
    description: 'IDT xGen Exome CNV检测基线',
    sampleIds: [
      'c9d0e1f2-a3b4-5678-cdef-789012345678',
      'd0e1f2a3-b4c5-6789-defa-890123456789',
    ],
    createdAt: '2024-09-20',
    createdBy: '王工',
  },
];

// 删除确认弹窗
function DeleteConfirmModal({
  isOpen,
  baselineName,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  baselineName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-center text-gray-900 mb-2">
            删除基线文件
          </h3>
          <p className="text-sm text-center text-gray-500">
            确定要删除 "{baselineName}" 吗？此操作无法撤销。
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
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
function CreateBaselineModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; bedFile: string; description: string; sampleIds: string[] }) => void;
}) {
  const [formData, setFormData] = React.useState({
    name: '',
    bedFile: 'Agilent_SureSelect_V7.bed',
    description: '',
    sampleIdsText: '',
  });
  const [dragOver, setDragOver] = React.useState(false);

  const bedFileOptions = [
    { value: 'Agilent_SureSelect_V7.bed', label: 'Agilent SureSelect V7' },
    { value: 'Agilent_SureSelect_V6.bed', label: 'Agilent SureSelect V6' },
    { value: 'IDT_xGen_Exome_v2.bed', label: 'IDT xGen Exome V2' },
    { value: 'Cardio_Panel_v2.bed', label: '心血管Panel' },
  ];

  const parsedSampleIds = React.useMemo(() => {
    return formData.sampleIdsText
      .split(/[\n,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [formData.sampleIdsText]);

  const handleSubmit = () => {
    if (!formData.name || parsedSampleIds.length === 0) return;
    onSubmit({
      name: formData.name,
      bedFile: formData.bedFile,
      description: formData.description,
      sampleIds: parsedSampleIds,
    });
    setFormData({ name: '', bedFile: 'Agilent_SureSelect_V7.bed', description: '', sampleIdsText: '' });
    onClose();
  };

  const handleClose = () => {
    setFormData({ name: '', bedFile: 'Agilent_SureSelect_V7.bed', description: '', sampleIdsText: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">创建 CNV 基线</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="block text-sm font-medium text-fg-default mb-2">基线名称 *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="如：WES_V7_CNV_Baseline_100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-default mb-2">关联 BED 文件 *</label>
            <select
              value={formData.bedFile}
              onChange={(e) => setFormData((prev) => ({ ...prev, bedFile: e.target.value }))}
              className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-fg-default text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {bedFileOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-default mb-2">描述</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="基线用途说明"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-fg-default">样本UUID列表 *</label>
              {parsedSampleIds.length > 0 && (
                <span className="text-xs text-fg-muted">已输入 {parsedSampleIds.length} 个样本</span>
              )}
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`
                border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors mb-2
                ${dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
                }
              `}
            >
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">拖拽上传样本列表文件</p>
            </div>
            <textarea
              value={formData.sampleIdsText}
              onChange={(e) => setFormData((prev) => ({ ...prev, sampleIdsText: e.target.value }))}
              placeholder="每行一个样本UUID，或用逗号/空格分隔"
              rows={6}
              className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-fg-default text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-fg-muted mt-1">
              支持每行一个UUID，或用逗号、空格分隔
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600">
              提示：基线构建需要一定时间，创建后需点击"启动"开始构建。建议使用相同捕获试剂盒、相同测序平台的样本，样本数量建议 ≥50 个。
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!formData.name || parsedSampleIds.length === 0}>
            创建
          </Button>
        </div>
      </div>
    </div>
  );
}

// 样本UUID显示组件
function SampleIdCell({ id }: { id: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span
      className={`font-mono text-xs cursor-pointer ${copied ? 'text-green-500' : 'text-accent-fg hover:underline'}`}
      onClick={handleClick}
      title={id}
    >
      {id.substring(0, 8)}
    </span>
  );
}

export default function CNVBaselinePage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [baselines, setBaselines] = React.useState<BaselineFile[]>(mockBaselines);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<BaselineFile | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateBaseline = (data: { name: string; bedFile: string; description: string; sampleIds: string[] }) => {
    const newBaseline: BaselineFile = {
      id: String(Date.now()),
      name: data.name,
      sampleCount: data.sampleIds.length,
      bedFile: data.bedFile,
      description: data.description || `${data.name} CNV基线`,
      sampleIds: data.sampleIds,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: '当前用户',
    };
    setBaselines((prev) => [newBaseline, ...prev]);
  };

  const handleDeleteBaseline = () => {
    if (deleteTarget) {
      setBaselines((prev) => prev.filter((b) => b.id !== deleteTarget.id));
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

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">CNV 基线管理</h2>

      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
        <p className="text-sm text-fg-muted">
          CNV 基线用于拷贝数变异检测，通过对比样本与基线的覆盖度差异识别 CNV。
          建议使用相同捕获试剂盒、相同测序平台的样本构建基线，样本数量越多检测越准确（推荐 ≥50 个样本）。
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
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>
          创建基线
        </Button>
      </div>

      {/* 列表展示 */}
      <div className="bg-canvas-default rounded-lg border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {filteredFiles.map((baseline) => {
            const isExpanded = expandedIds.has(baseline.id);

            return (
              <div key={baseline.id}>
                {/* 主行 */}
                <div
                  className="px-4 py-3 flex items-center justify-between hover:bg-canvas-subtle transition-colors cursor-pointer"
                  onClick={() => toggleExpand(baseline.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button className="p-0.5 text-fg-muted">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-fg-default">{baseline.name}</span>
                        <span className="text-xs text-fg-muted">{baseline.sampleCount} 个样本</span>
                      </div>
                      <p className="text-xs text-fg-muted truncate">{baseline.description}</p>
                    </div>
                    <div className="text-xs text-fg-muted shrink-0">
                      {baseline.createdAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* 删除按钮 */}
                    <button
                      className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="删除"
                      onClick={() => setDeleteTarget(baseline)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 展开的样本列表 */}
                {isExpanded && (
                  <div className="px-4 py-3 bg-canvas-subtle border-t border-border">
                    <div className="text-xs text-fg-muted mb-2">
                      关联 BED: {baseline.bedFile} · 创建者: {baseline.createdBy}
                    </div>
                    <div className="text-xs font-medium text-fg-default mb-2">样本 UUID 列表 ({baseline.sampleIds.length} 个)</div>
                    <div className="flex flex-wrap gap-2">
                      {baseline.sampleIds.map((sampleId) => (
                        <SampleIdCell key={sampleId} id={sampleId} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredFiles.length === 0 && (
          <div className="text-center py-12 text-fg-muted">
            暂无基线文件
          </div>
        )}
      </div>

      <CreateBaselineModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBaseline}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        baselineName={deleteTarget?.name || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteBaseline}
      />
    </PageContent>
  );
}