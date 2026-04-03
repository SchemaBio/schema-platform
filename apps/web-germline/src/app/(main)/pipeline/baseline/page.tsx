'use client';

import { Button, Input, Tag } from '@schema/ui-kit';
import { Plus, Search, Trash2, Check, Upload, Play, Square, RotateCcw, Pencil, X } from 'lucide-react';
import * as React from 'react';

interface BaselineFile {
  id: string;
  uuid: string; // 基线UUID，用于配置
  sampleCount: number;
  bedFile: string;
  description: string;
  sampleIds: string[];
  createdAt: string;
  createdBy: string;
  status: 'pending' | 'building' | 'completed' | 'failed';
  progress: number;
}

type BaselineStatus = BaselineFile['status'];

const statusConfig: Record<BaselineStatus, { label: string; variant: 'neutral' | 'info' | 'success' | 'danger' }> = {
  pending: { label: '待构建', variant: 'neutral' },
  building: { label: '构建中', variant: 'info' },
  completed: { label: '已完成', variant: 'success' },
  failed: { label: '失败', variant: 'danger' },
};

const statusDotColors: Record<BaselineStatus, string> = {
  pending: 'bg-neutral-emphasis',
  building: 'bg-accent-emphasis',
  completed: 'bg-success-emphasis',
  failed: 'bg-danger-emphasis',
};

const BED_FILE_OPTIONS = [
  { value: 'Agilent_SureSelect_V7.bed', label: 'Agilent SureSelect V7' },
  { value: 'Agilent_SureSelect_V6.bed', label: 'Agilent SureSelect V6' },
  { value: 'IDT_xGen_Exome_v2.bed', label: 'IDT xGen Exome V2' },
  { value: 'Cardio_Panel_v2.bed', label: '心血管 Panel' },
];

// 生成随机UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const mockBaselines: BaselineFile[] = [
  {
    id: '1',
    uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    sampleCount: 15,
    bedFile: 'Agilent_SureSelect_V7.bed',
    description: 'WES V7 CNV检测基线',
    sampleIds: [
      's1a2b3c4-d5e6-f789-0abc-def123456789',
      's2b3c4d5-e6f7-890a-bcde-f12345678901',
      's3c4d5e6-f7a8-901b-cdef-123456789012',
      's4d5e6f7-a8b9-012c-defa-234567890123',
      's5e6f7a8-b9c0-123d-efab-345678901234',
      's6f7a8b9-c0d1-234e-fabc-456789012345',
      's7a8b9c0-d1e2-345f-abcd-567890123456',
      's8b9c0d1-e2f3-456a-bcde-678901234567',
      's9c0d1e2-f3a4-567b-cdef-789012345678',
      's10d1e2f3-a4b5-678c-defa-890123456789',
      's11e2f3a4-b5c6-789d-efab-123456789abc',
      's12f3a4b5-c6d7-890e-fabc-234567890def',
      's13a4b5c6-d7e8-901f-abcd-345678901efa',
      's14b5c6d7-e8f9-012a-bcde-456789012fab',
      's15c6d7e8-f9a0-123b-cdef-567890123abc',
    ],
    createdAt: '2024-10-15 14:30:00',
    createdBy: '王工',
    status: 'completed',
    progress: 100,
  },
  {
    id: '2',
    uuid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    sampleCount: 18,
    bedFile: 'Agilent_SureSelect_V7.bed',
    description: 'WES V7 CNV检测基线（扩展）',
    sampleIds: [
      't1f6a7b8-c9d0-1234-efab-345678901234',
      't2a7b8c9-d0e1-2345-fabc-456789012345',
      't3b8c9d0-e1f2-3456-abcd-567890123456',
      't4c9d0e1-f2a3-4567-bcde-678901234567',
      't5d0e1f2-a3b4-5678-cdef-789012345678',
      't6e1f2a3-b4c5-6789-defa-890123456789',
      't7f2a3b4-c5d6-7890-efab-123456789abc',
      't8a3b4c5-d6e7-8901-fabc-234567890def',
      't9b4c5d6-e7f8-9012-abcd-345678901efa',
      't10c5d6e7-f8a9-0123-bcde-456789012fab',
      't11d6e7f8-a9b0-1234-cdef-567890123abc',
      't12e7f8a9-b0c1-2345-defa-678901234bcd',
      't13f8a9b0-c1d2-3456-efab-789012345cde',
      't14a9b0c1-d2e3-4567-fabc-890123456def',
      't15b0c1d2-e3f4-5678-abcd-901234567efa',
      't16c1d2e3-f4a5-6789-bcde-012345678fab',
      't17d2e3f4-a5b6-7890-cdef-123456789abc',
      't18e3f4a5-b6c7-8901-defa-234567890bcd',
    ],
    createdAt: '2024-11-01 09:15:30',
    createdBy: '李工',
    status: 'building',
    progress: 65,
  },
  {
    id: '3',
    uuid: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    sampleCount: 12,
    bedFile: 'IDT_xGen_Exome_v2.bed',
    description: 'IDT xGen Exome CNV检测基线',
    sampleIds: [
      'u1c9d0e1-f2a3-4567-bcde-678901234567',
      'u2d0e1f2-a3b4-5678-cdef-789012345678',
      'u3e1f2a3-b4c5-6789-defa-890123456789',
      'u4f2a3b4-c5d6-7890-efab-123456789abc',
      'u5a3b4c5-d6e7-8901-fabc-234567890def',
      'u6b4c5d6-e7f8-9012-abcd-345678901efa',
      'u7c5d6e7-f8a9-0123-bcde-456789012fab',
      'u8d6e7f8-a9b0-1234-cdef-567890123abc',
      'u9e7f8a9-b0c1-2345-defa-678901234bcd',
      'u10f8a9b0-c1d2-3456-efab-789012345cde',
      'u11a9b0c1-d2e3-4567-fabc-890123456def',
      'u12b0c1d2-e3f4-5678-abcd-901234567efa',
    ],
    createdAt: '2024-09-20 16:45:12',
    createdBy: '王工',
    status: 'pending',
    progress: 0,
  },
  {
    id: '4',
    uuid: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    sampleCount: 8,
    bedFile: 'Cardio_Panel_v2.bed',
    description: '心血管Panel CNV检测基线',
    sampleIds: [
      'v1e1f2a3-b4c5-6789-defa-890123456789',
      'v2f2a3b4-c5d6-7890-efab-123456789abc',
      'v3a3b4c5-d6e7-8901-fabc-234567890def',
      'v4b4c5d6-e7f8-9012-abcd-345678901efa',
      'v5c5d6e7-f8a9-0123-bcde-456789012fab',
      'v6d6e7f8-a9b0-1234-cdef-567890123abc',
      'v7e7f8a9-b0c1-2345-defa-678901234bcd',
      'v8f8a9b0-c1d2-3456-efab-789012345cde',
    ],
    createdAt: '2024-12-01 11:20:45',
    createdBy: '张工',
    status: 'failed',
    progress: 30,
  },
];

// 删除确认弹窗
function DeleteConfirmModal({
  isOpen,
  baselineUuid,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  baselineUuid: string;
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
            删除基线
          </h3>
          <p className="text-sm text-center text-gray-500 mb-2">
            确定要删除此基线吗？此操作无法撤销。
          </p>
          <p className="text-center font-mono text-xs text-gray-600 break-all">
            {baselineUuid}
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

// 动态按钮组件：根据状态自动切换
function BaselineActionsCell({
  baseline,
  onStart,
  onStop,
  onEdit,
  onDelete,
}: {
  baseline: BaselineFile;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onEdit: (baseline: BaselineFile) => void;
  onDelete: (baseline: BaselineFile) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const deleteConfirmRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deleteConfirmRef.current && !deleteConfirmRef.current.contains(event.target as Node)) {
        setShowDeleteConfirm(false);
      }
    };
    if (showDeleteConfirm) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDeleteConfirm]);

  const getPrimaryAction = () => {
    switch (baseline.status) {
      case 'pending':
        return {
          label: '启动',
          icon: Play,
          onClick: () => onStart(baseline.id),
          className: 'text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300',
        };
      case 'building':
        return {
          label: '停止',
          icon: Square,
          onClick: () => onStop(baseline.id),
          className: 'text-orange-600 hover:bg-orange-50 border-orange-200 hover:border-orange-300',
        };
      case 'completed':
        return {
          label: '完成',
          icon: Check,
          onClick: undefined,
          className: 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed',
        };
      case 'failed':
        return {
          label: '重试',
          icon: RotateCcw,
          onClick: () => onStart(baseline.id),
          className: 'text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300',
        };
      default:
        return null;
    }
  };

  const primaryAction = getPrimaryAction();
  const canDelete = baseline.status !== 'building';
  const canEdit = baseline.status === 'pending' || baseline.status === 'failed';
  const showEdit = true; // 始终显示编辑按钮

  return (
    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
      {primaryAction && (
        <button
          onClick={primaryAction.onClick}
          disabled={baseline.status === 'completed'}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded transition-colors ${primaryAction.className}`}
        >
          {primaryAction.icon && <primaryAction.icon className="w-3.5 h-3.5" />}
          {primaryAction.label}
        </button>
      )}

      {/* 编辑按钮 */}
      {showEdit && (
        <button
          onClick={() => canEdit && onEdit(baseline)}
          className={`p-1.5 rounded transition-colors ${
            canEdit
              ? 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          disabled={!canEdit}
          title={canEdit ? '编辑样本' : '当前状态不可编辑'}
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      <div className="relative" ref={deleteConfirmRef}>
        <button
          className={`p-1.5 rounded transition-colors ${
            canDelete ? 'text-gray-400 hover:text-red-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
          }`}
          onClick={() => {
            if (canDelete) setShowDeleteConfirm(true);
          }}
          disabled={!canDelete}
          aria-label="删除"
          title={canDelete ? '删除' : '构建中不可删除'}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {showDeleteConfirm && (
          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-20 p-2">
            <div className="text-xs text-gray-600 mb-2 text-center">确认删除此基线？</div>
            <div className="flex gap-1">
              <button
                className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </button>
              <button
                className="flex-1 px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                onClick={() => {
                  onDelete(baseline);
                  setShowDeleteConfirm(false);
                }}
              >
                删除
              </button>
            </div>
          </div>
        )}
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
  onSubmit: (data: { bedFile: string; description: string; sampleIds: string[] }) => void;
}) {
  const [formData, setFormData] = React.useState({
    bedFile: 'Agilent_SureSelect_V7.bed',
    description: '',
    sampleIdsText: '',
  });
  const [dragOver, setDragOver] = React.useState(false);

  const parsedSampleIds = React.useMemo(() => {
    return formData.sampleIdsText
      .split(/[\n,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [formData.sampleIdsText]);

  const handleSubmit = () => {
    if (parsedSampleIds.length === 0 || parsedSampleIds.length > 20) return;
    onSubmit({
      bedFile: formData.bedFile,
      description: formData.description,
      sampleIds: parsedSampleIds,
    });
    setFormData({ bedFile: 'Agilent_SureSelect_V7.bed', description: '', sampleIdsText: '' });
    onClose();
  };

  const handleClose = () => {
    setFormData({ bedFile: 'Agilent_SureSelect_V7.bed', description: '', sampleIdsText: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">创建基线</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="block text-sm font-medium text-fg-default mb-2">关联 BED 文件 *</label>
            <select
              value={formData.bedFile}
              onChange={(e) => setFormData((prev) => ({ ...prev, bedFile: e.target.value }))}
              className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-fg-default text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {BED_FILE_OPTIONS.map((opt) => (
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
                <span className={`text-xs ${parsedSampleIds.length > 20 ? 'text-danger-fg' : 'text-fg-muted'}`}>
                  已输入 {parsedSampleIds.length} 个样本{parsedSampleIds.length > 20 ? '（超出限制）' : ''}
                </span>
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
              提示：基线构建会生成 CNV 基线，创建后需点击"启动"开始构建。
              建议使用相同捕获试剂盒、相同测序平台的样本，最多支持 20 个样本。
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!formData.bedFile || parsedSampleIds.length === 0 || parsedSampleIds.length > 50}>
            创建
          </Button>
        </div>
      </div>
    </div>
  );
}

// 编辑基线弹窗
function EditBaselineModal({
  isOpen,
  baseline,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  baseline: BaselineFile | null;
  onClose: () => void;
  onSubmit: (sampleIds: string[]) => void;
}) {
  const [sampleIdsText, setSampleIdsText] = React.useState('');
  const [dragOver, setDragOver] = React.useState(false);

  React.useEffect(() => {
    if (baseline) {
      setSampleIdsText(baseline.sampleIds.join('\n'));
    }
  }, [baseline]);

  const parsedSampleIds = React.useMemo(() => {
    return sampleIdsText
      .split(/[\n,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [sampleIdsText]);

  const handleSubmit = () => {
    if (parsedSampleIds.length === 0 || parsedSampleIds.length > 20) return;
    onSubmit(parsedSampleIds);
    onClose();
  };

  const handleClose = () => {
    setSampleIdsText('');
    onClose();
  };

  if (!isOpen || !baseline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">编辑基线样本</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-3 bg-canvas-subtle rounded-lg text-xs">
            <div className="text-fg-muted mb-1">基线 UUID</div>
            <div className="font-mono text-fg-default">{baseline.uuid}</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-fg-default">样本UUID列表 *</label>
              <span className={`text-xs ${parsedSampleIds.length > 20 ? 'text-danger-fg' : 'text-fg-muted'}`}>
                当前 {parsedSampleIds.length} 个样本{parsedSampleIds.length > 20 ? '（超出限制）' : ''}
              </span>
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
              value={sampleIdsText}
              onChange={(e) => setSampleIdsText(e.target.value)}
              placeholder="每行一个样本UUID，或用逗号/空格分隔"
              rows={10}
              className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-fg-default text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-fg-muted mt-1">
              支持每行一个UUID，或用逗号、空格分隔，最多支持 20 个样本
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600">
              提示：修改样本列表后，系统将重新构建基线。请确保样本数据完整。
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={parsedSampleIds.length === 0 || parsedSampleIds.length > 20}>
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}

// UUID显示组件（点击复制）
function UuidCell({ uuid }: { uuid: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span
      className={`font-mono text-sm cursor-pointer transition-colors ${copied ? 'text-green-500' : 'text-accent-fg hover:underline'}`}
      onClick={handleClick}
      title={copied ? '已复制' : '点击复制'}
    >
      {uuid}
    </span>
  );
}

// 样本UUID显示组件（短格式）
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
      title={copied ? '已复制' : id}
    >
      {copied ? '已复制' : id.substring(0, 8)}
    </span>
  );
}

export default function BaselineManagementPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [baselines, setBaselines] = React.useState<BaselineFile[]>(mockBaselines);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<BaselineFile | null>(null);
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

  const handleCreateBaseline = (data: { bedFile: string; description: string; sampleIds: string[] }) => {
    const newBaseline: BaselineFile = {
      id: String(Date.now()),
      uuid: generateUUID(),
      sampleCount: data.sampleIds.length,
      bedFile: data.bedFile,
      description: data.description || `检测基线`,
      sampleIds: data.sampleIds,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).replace(/\//g, '-'),
      createdBy: '当前用户',
      status: 'pending',
      progress: 0,
    };
    setBaselines((prev) => [newBaseline, ...prev]);
  };

  const handleDeleteBaseline = (baseline: BaselineFile) => {
    setBaselines((prev) => prev.filter((b) => b.id !== baseline.id));
  };

  const handleStartBaseline = (baselineId: string) => {
    setBaselines((prev) => prev.map((b) => {
      if (b.id !== baselineId) return b;
      return { ...b, status: 'building', progress: 0 };
    }));
  };

  const handleStopBaseline = (baselineId: string) => {
    setBaselines((prev) => prev.map((b) => {
      if (b.id !== baselineId) return b;
      return { ...b, status: 'pending', progress: 0 };
    }));
  };

  const handleEditBaseline = (sampleIds: string[]) => {
    if (!editTarget) return;
    setBaselines((prev) => prev.map((b) => {
      if (b.id !== editTarget.id) return b;
      return {
        ...b,
        sampleIds: sampleIds,
        sampleCount: sampleIds.length,
        status: 'building',
        progress: 0,
      };
    }));
    setEditTarget(null);
  };

  const filteredFiles = React.useMemo(() => {
    if (!searchQuery) return baselines;
    const query = searchQuery.toLowerCase();
    return baselines.filter(
      (f) =>
        f.uuid.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        f.bedFile.toLowerCase().includes(query)
    );
  }, [searchQuery, baselines]);

  return (
    <div className="h-full overflow-auto">
      <div className="p-6">
        <h2 className="text-lg font-medium text-fg-default mb-4">基线管理</h2>

        <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
          <p className="text-sm text-fg-muted">
            基线用于 CNV（拷贝数变异）检测。通过对比样本与基线的覆盖度差异识别 CNV。
            建议使用相同捕获试剂盒、相同测序平台的样本构建基线，最多支持 20 个样本。
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
              const statusInfo = statusConfig[baseline.status];

              return (
                <div key={baseline.id}>
                  {/* 主行 */}
                  <div
                    className="px-4 py-3 flex items-center justify-between hover:bg-canvas-subtle transition-colors cursor-pointer"
                    onClick={() => toggleExpand(baseline.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${statusDotColors[baseline.status]}`} />
                          <UuidCell uuid={baseline.uuid} />
                          <Tag variant={statusInfo.variant}>{statusInfo.label}</Tag>
                          <span className="text-xs text-fg-muted">{baseline.sampleCount} 个样本</span>
                          <span className="text-xs text-fg-muted">·</span>
                          <span className="text-xs text-fg-muted">{baseline.bedFile}</span>
                        </div>
                        {/* 进度条 - 所有状态都显示 */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-32 h-1.5 bg-canvas-inset rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                baseline.status === 'failed' ? 'bg-danger-emphasis' : 'bg-accent-emphasis'
                              }`}
                              style={{ width: `${baseline.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-fg-muted">{baseline.progress}%</span>
                        </div>
                        <p className="text-xs text-fg-muted truncate">{baseline.description}</p>
                      </div>
                      <div className="text-xs text-fg-muted shrink-0">
                        {baseline.createdAt}
                      </div>
                    </div>
                    {/* 动态按钮 */}
                    <div className="ml-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <BaselineActionsCell
                        baseline={baseline}
                        onStart={handleStartBaseline}
                        onStop={handleStopBaseline}
                        onEdit={(b) => setEditTarget(b)}
                        onDelete={(b) => setDeleteTarget(b)}
                      />
                    </div>
                  </div>

                  {/* 展开的样本列表 */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-canvas-subtle border-t border-border">
                      <div className="text-xs text-fg-muted mb-2">
                        创建者: {baseline.createdBy}
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
              暂无基线
            </div>
          )}
        </div>
      </div>

      <CreateBaselineModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBaseline}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        baselineUuid={deleteTarget?.uuid || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) handleDeleteBaseline(deleteTarget);
        }}
      />

      <EditBaselineModal
        isOpen={editTarget !== null}
        baseline={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditBaseline}
      />
    </div>
  );
}