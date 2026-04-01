'use client';

import { Button, Input } from '@schema/ui-kit';
import { Plus, Search, Trash2, ChevronDown, ChevronRight, ChevronLeft, X, Upload, Play, Square, RotateCcw, BookOpen, List } from 'lucide-react';
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
  status: 'pending' | 'building' | 'completed' | 'failed';
  progress: number;
}

type BaselineStatus = BaselineFile['status'];

const statusDotColors: Record<BaselineStatus, string> = {
  pending: 'bg-neutral-emphasis',
  building: 'bg-accent-emphasis',
  completed: 'bg-success-emphasis',
  failed: 'bg-danger-emphasis',
};

const mockBaselines: BaselineFile[] = [
  {
    id: '1',
    name: 'WES_V7_CNV_Baseline_100',
    sampleCount: 15,
    bedFile: 'Agilent_SureSelect_V7.bed',
    description: 'WES V7 CNV检测基线（15样本）',
    sampleIds: [
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      'c3d4e5f6-a7b8-9012-cdef-123456789012',
      'd4e5f6a7-b8c9-0123-defa-234567890123',
      'e5f6a7b8-c9d0-1234-efab-345678901234',
      'f6a7b8c9-d0e1-2345-fabc-456789012345',
      'a7b8c9d0-e1f2-3456-abcd-567890123456',
      'b8c9d0e1-f2a3-4567-bcde-678901234567',
      'c9d0e1f2-a3b4-5678-cdef-789012345678',
      'd0e1f2a3-b4c5-6789-defa-890123456789',
      'e1f2a3b4-c5d6-7890-efab-123456789abc',
      'f2a3b4c5-d6e7-8901-fabc-234567890def',
      'a3b4c5d6-e7f8-9012-abcd-345678901efa',
      'b4c5d6e7-f8a9-0123-bcde-456789012fab',
      'c5d6e7f8-a9b0-1234-cdef-567890123abc',
    ],
    createdAt: '2024-10-15',
    createdBy: '王工',
    status: 'completed',
    progress: 100,
  },
  {
    id: '2',
    name: 'WES_V7_CNV_Baseline_200',
    sampleCount: 18,
    bedFile: 'Agilent_SureSelect_V7.bed',
    description: 'WES V7 CNV检测基线（18样本）',
    sampleIds: [
      'f6a7b8c9-d0e1-2345-fabc-456789012345',
      'a7b8c9d0-e1f2-3456-abcd-567890123456',
      'b8c9d0e1-f2a3-4567-bcde-678901234567',
      'c9d0e1f2-a3b4-5678-cdef-789012345678',
      'd0e1f2a3-b4c5-6789-defa-890123456789',
      'e1f2a3b4-c5d6-7890-efab-123456789abc',
      'f2a3b4c5-d6e7-8901-fabc-234567890def',
      'a3b4c5d6-e7f8-9012-abcd-345678901efa',
      'b4c5d6e7-f8a9-0123-bcde-456789012fab',
      'c5d6e7f8-a9b0-1234-cdef-567890123abc',
      'd6e7f8a9-b0c1-2345-defa-678901234bcd',
      'e7f8a9b0-c1d2-3456-efab-789012345cde',
      'f8a9b0c1-d2e3-4567-fabc-890123456def',
      'a9b0c1d2-e3f4-5678-abcd-901234567efa',
      'b0c1d2e3-f4a5-6789-bcde-012345678fab',
      'c1d2e3f4-a5b6-7890-cdef-123456789abc',
      'd2e3f4a5-b6c7-8901-defa-234567890bcd',
      'e3f4a5b6-c7d8-9012-efab-345678901cde',
    ],
    createdAt: '2024-11-01',
    createdBy: '李工',
    status: 'building',
    progress: 65,
  },
  {
    id: '3',
    name: 'IDT_xGen_CNV_Baseline',
    sampleCount: 12,
    bedFile: 'IDT_xGen_Exome_v2.bed',
    description: 'IDT xGen Exome CNV检测基线',
    sampleIds: [
      'c9d0e1f2-a3b4-5678-cdef-789012345678',
      'd0e1f2a3-b4c5-6789-defa-890123456789',
      'e1f2a3b4-c5d6-7890-efab-123456789abc',
      'f2a3b4c5-d6e7-8901-fabc-234567890def',
      'a3b4c5d6-e7f8-9012-abcd-345678901efa',
      'b4c5d6e7-f8a9-0123-bcde-456789012fab',
      'c5d6e7f8-a9b0-1234-cdef-567890123abc',
      'd6e7f8a9-b0c1-2345-defa-678901234bcd',
      'e7f8a9b0-c1d2-3456-efab-789012345cde',
      'f8a9b0c1-d2e3-4567-fabc-890123456def',
      'a9b0c1d2-e3f4-5678-abcd-901234567efa',
      'b0c1d2e3-f4a5-6789-bcde-012345678fab',
    ],
    createdAt: '2024-09-20',
    createdBy: '王工',
    status: 'pending',
    progress: 0,
  },
  {
    id: '4',
    name: 'Cardio_Panel_Baseline',
    sampleCount: 8,
    bedFile: 'Cardio_Panel_v2.bed',
    description: '心血管Panel CNV检测基线',
    sampleIds: [
      'e1f2a3b4-c5d6-7890-efab-123456789abc',
      'f2a3b4c5-d6e7-8901-fabc-234567890def',
      'a3b4c5d6-e7f8-9012-abcd-345678901efa',
      'b4c5d6e7-f8a9-0123-bcde-456789012fab',
      'c5d6e7f8-a9b0-1234-cdef-567890123abc',
      'd6e7f8a9-b0c1-2345-defa-678901234bcd',
      'e7f8a9b0-c1d2-3456-efab-789012345cde',
      'f8a9b0c1-d2e3-4567-fabc-890123456def',
    ],
    createdAt: '2024-12-01',
    createdBy: '张工',
    status: 'failed',
    progress: 30,
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

// 动态按钮组件：根据状态自动切换
// 1. 启动 - 待构建(pending)或失败(failed)状态
// 2. 停止 - 构建中(building)状态
// 3. 查看 - 已完成(completed)状态
function BaselineActionsCell({
  baseline,
  onStart,
  onStop,
  onView,
  onDelete,
}: {
  baseline: BaselineFile;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onView: (baseline: BaselineFile) => void;
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
          label: '查看',
          icon: BookOpen,
          onClick: () => onView(baseline),
          className: 'text-blue-600 hover:bg-blue-50 border-blue-200 hover:border-blue-300',
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

  return (
    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
      {primaryAction && (
        <button
          onClick={primaryAction.onClick}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded transition-colors ${primaryAction.className}`}
        >
          <primaryAction.icon className="w-3.5 h-3.5" />
          {primaryAction.label}
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
    if (!formData.name || parsedSampleIds.length === 0 || parsedSampleIds.length > 20) return;
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
              提示：基线构建需要一定时间，创建后需点击"启动"开始构建。建议使用相同捕获试剂盒、相同测序平台的样本，最多支持 20 个样本。
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!formData.name || parsedSampleIds.length === 0 || parsedSampleIds.length > 20}>
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

// 基线详情面板
function BaselineDetailPanel({ baselineId }: { baselineId: string }) {
  // 模拟数据获取
  const [baseline, setBaseline] = React.useState<BaselineFile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    // 模拟异步获取
    setTimeout(() => {
      const found = mockBaselines.find(b => b.id === baselineId);
      setBaseline(found || null);
      setLoading(false);
    }, 100);
  }, [baselineId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
      </div>
    );
  }

  if (!baseline) {
    return (
      <div className="flex items-center justify-center py-16 text-fg-muted">
        未找到该基线
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 基线信息头部 */}
      <div className="mb-4 pb-3 border-b border-border-default">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-2 h-2 rounded-full ${statusDotColors[baseline.status]}`} />
          <h3 className="text-base font-medium text-fg-default">{baseline.name}</h3>
        </div>

        <div className="flex items-center gap-4 text-xs text-fg-muted mb-2">
          <span>BED: {baseline.bedFile}</span>
          <span>样本数: {baseline.sampleCount}</span>
          <span>创建: {baseline.createdAt}</span>
          <span>创建者: {baseline.createdBy}</span>
        </div>

        <div className="text-xs text-fg-muted">
          {baseline.description}
        </div>

        {/* 进度条 */}
        {baseline.status === 'building' && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-canvas-inset rounded-full overflow-hidden max-w-[200px]">
                <div
                  className="h-full bg-accent-emphasis rounded-full transition-all"
                  style={{ width: `${baseline.progress}%` }}
                />
              </div>
              <span className="text-xs text-fg-muted">{baseline.progress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* 样本列表 */}
      <div className="mb-4">
        <div className="text-sm font-medium text-fg-default mb-2">样本 UUID 列表 ({baseline.sampleIds.length} 个)</div>
        <div className="bg-canvas-subtle rounded-lg p-3 max-h-[300px] overflow-auto">
          <div className="flex flex-wrap gap-2">
            {baseline.sampleIds.map((sampleId) => (
              <SampleIdCell key={sampleId} id={sampleId} />
            ))}
          </div>
        </div>
      </div>

      {/* 构建参数 */}
      <div>
        <div className="text-sm font-medium text-fg-default mb-2">构建参数</div>
        <div className="bg-canvas-subtle rounded-lg p-3 text-xs space-y-1">
          <div className="flex gap-2">
            <span className="text-fg-muted">BED 文件:</span>
            <span className="text-fg-default">{baseline.bedFile}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-fg-muted">样本数量:</span>
            <span className="text-fg-default">{baseline.sampleCount}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-fg-muted">算法版本:</span>
            <span className="text-fg-default">CNVkit v0.9.9</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 标签页接口
interface OpenTab {
  id: string;
  baselineId: string;
  name: string;
}

export default function CNVBaselinePage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [baselines, setBaselines] = React.useState<BaselineFile[]>(mockBaselines);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<BaselineFile | null>(null);
  const [openTabs, setOpenTabs] = React.useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);

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
      status: 'pending',
      progress: 0,
    };
    setBaselines((prev) => [newBaseline, ...prev]);
  };

  const handleDeleteBaseline = (baseline: BaselineFile) => {
    setBaselines((prev) => prev.filter((b) => b.id !== baseline.id));
    // 关闭相关标签页
    setOpenTabs((prev) => prev.filter((t) => t.baselineId !== baseline.id));
    if (activeTabId && openTabs.find((t) => t.id === activeTabId)?.baselineId === baseline.id) {
      const remaining = openTabs.filter((t) => t.baselineId !== baseline.id);
      setActiveTabId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
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

  const handleOpenTab = React.useCallback((baseline: BaselineFile) => {
    const existingTab = openTabs.find((t) => t.baselineId === baseline.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    const newTab: OpenTab = {
      id: `tab-${Date.now()}`,
      baselineId: baseline.id,
      name: baseline.name,
    };
    setOpenTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [openTabs]);

  const handleCloseTab = React.useCallback((tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const filteredFiles = React.useMemo(() => {
    if (!searchQuery) return baselines;
    const query = searchQuery.toLowerCase();
    return baselines.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
    );
  }, [searchQuery, baselines]);

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const hasOpenTabs = openTabs.length > 0;

  return (
    <div className="flex h-full">
      {/* 左侧基线列表 */}
      {hasOpenTabs ? (
        sidebarCollapsed ? (
          // 完全收起状态
          <div className="w-10 flex-shrink-0 border-r border-border-default bg-canvas-subtle flex flex-col items-center py-2">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors"
              title="展开基线列表"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="mt-2 text-xs text-fg-muted writing-mode-vertical">
              基线
            </div>
            <div className="mt-auto mb-2 w-5 h-5 rounded-full bg-accent-emphasis text-white text-xs flex items-center justify-center">
              {openTabs.length}
            </div>
          </div>
        ) : (
          // 展开状态：窄边栏
          <div className="w-56 flex-shrink-0 border-r border-border-default bg-canvas-subtle flex flex-col">
            <div className="px-3 py-2 border-b border-border-default flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-fg-muted" />
                <span className="text-sm font-medium text-fg-default">基线列表</span>
              </div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors"
                title="收起"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 border-b border-border-default">
              <Input
                placeholder="搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftElement={<Search className="w-3.5 h-3.5" />}
                className="text-xs"
              />
            </div>

            <div className="flex-1 overflow-auto">
              {filteredFiles.map((baseline) => {
                const isOpen = openTabs.some((t) => t.baselineId === baseline.id);
                const isActive = activeTab?.baselineId === baseline.id;
                return (
                  <div
                    key={baseline.id}
                    onClick={() => handleOpenTab(baseline)}
                    className={`
                      px-3 py-2 cursor-pointer border-b border-border-muted transition-colors
                      ${isActive
                        ? 'bg-accent-subtle border-l-2 border-l-accent-emphasis'
                        : isOpen
                          ? 'bg-canvas-inset'
                          : 'hover:bg-canvas-inset'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusDotColors[baseline.status]}`} />
                      <span className={`text-sm truncate ${isActive ? 'text-accent-fg font-medium' : 'text-fg-default'}`}>
                        {baseline.name}
                      </span>
                    </div>
                    <div className="text-xs text-fg-muted ml-4">{baseline.sampleCount} 样本</div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        // 展开状态：完整列表
        <div className="flex-1">
          <div className="p-6 h-full overflow-auto">
            <h2 className="text-lg font-medium text-fg-default mb-4">CNV 基线管理</h2>

            <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
              <p className="text-sm text-fg-muted">
                CNV 基线用于拷贝数变异检测，通过对比样本与基线的覆盖度差异识别 CNV。
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
                              <div className={`w-2 h-2 rounded-full ${statusDotColors[baseline.status]}`} />
                              <span className="text-sm font-medium text-fg-default">{baseline.name}</span>
                              <span className="text-xs text-fg-muted">{baseline.sampleCount} 个样本</span>
                            </div>
                            <p className="text-xs text-fg-muted truncate mb-1">{baseline.description}</p>
                            {/* 进度条 */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-canvas-inset rounded-full overflow-hidden max-w-[120px]">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    baseline.status === 'failed' ? 'bg-danger-emphasis' : 'bg-accent-emphasis'
                                  }`}
                                  style={{ width: `${baseline.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-fg-muted">{baseline.progress}%</span>
                            </div>
                          </div>
                          <div className="text-xs text-fg-muted shrink-0">
                            {baseline.createdAt}
                          </div>
                        </div>
                        {/* 动态按钮 */}
                        <div className="ml-4 shrink-0">
                          <BaselineActionsCell
                            baseline={baseline}
                            onStart={handleStartBaseline}
                            onStop={handleStopBaseline}
                            onView={handleOpenTab}
                            onDelete={(b) => setDeleteTarget(b)}
                          />
                        </div>
                      </div>

                      {/* 展开的样本列表 */}
                      {isExpanded && (
                        <div className="px-4 py-3 bg-canvas-subtle border-t border-border">
                          <div className="text-xs text-fg-muted mb-2">
                            关联 BED: {baseline.bedFile} · 创建者: {baseline.createdBy}
                          </div>
                          {/* 进度条 */}
                          {baseline.status === 'building' && (
                            <div className="mb-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-canvas-inset rounded-full overflow-hidden max-w-[200px]">
                                  <div
                                    className="h-full bg-accent-emphasis rounded-full transition-all"
                                    style={{ width: `${baseline.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-fg-muted">{baseline.progress}%</span>
                              </div>
                            </div>
                          )}
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
          </div>
        </div>
      )}

      {/* 右侧详情面板 */}
      {hasOpenTabs && (
        <div className="flex-1 flex flex-col min-w-0">
          {/* 标签栏 */}
          <div className="flex items-center border-b border-border-default bg-canvas-subtle overflow-x-auto flex-shrink-0">
            {openTabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-border-muted
                  text-sm whitespace-nowrap transition-colors
                  ${activeTabId === tab.id
                    ? 'bg-canvas-default text-fg-default border-b-2 border-b-accent-emphasis -mb-px'
                    : 'text-fg-muted hover:bg-canvas-inset hover:text-fg-default'
                  }
                `}
              >
                <span>{tab.name}</span>
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="p-0.5 rounded hover:bg-canvas-inset"
                  aria-label="关闭标签"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* 详情内容 */}
          <div className="flex-1 overflow-auto">
            {activeTab && (
              <BaselineDetailPanel key={activeTab.baselineId} baselineId={activeTab.baselineId} />
            )}
          </div>
        </div>
      )}

      <CreateBaselineModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBaseline}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        baselineName={deleteTarget?.name || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) handleDeleteBaseline(deleteTarget);
        }}
      />
    </div>
  );
}