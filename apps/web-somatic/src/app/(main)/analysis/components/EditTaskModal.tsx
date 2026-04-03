'use client';

import * as React from 'react';
import { Button, Input } from '@schema/ui-kit';
import { X } from 'lucide-react';

export interface AnalysisTask {
  id: string;
  sampleId: string;
  internalId: string;
  pipeline: string;
  pipelineVersion: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'pending_interpretation';
  progress: number;
  createdAt: string;
  createdBy: string;
  completedAt?: string;
  remark?: string;
}

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: EditTaskFormData) => void;
  task: AnalysisTask | null;
}

export interface EditTaskFormData {
  internalId: string;
  pipeline: string;
  remark: string;
}

// Somatic 分析流程选项
const pipelineOptions = [
  '单样本分析',
  '配对样本分析',
  'RNA融合分析',
  '肿瘤Panel分析',
];

export function EditTaskModal({ isOpen, onClose, onSubmit, task }: EditTaskModalProps) {
  const [formData, setFormData] = React.useState<EditTaskFormData>({
    internalId: '',
    pipeline: '',
    remark: '',
  });

  // 当 task 变化时更新表单数据
  React.useEffect(() => {
    if (task) {
      setFormData({
        internalId: task.internalId,
        pipeline: task.pipeline,
        remark: task.remark || '',
      });
    }
  }, [task]);

  const handleChange = (field: keyof EditTaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task) {
      onSubmit(task.id, formData);
      onClose();
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 模态框 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <h2 className="text-lg font-medium text-fg-default">编辑任务</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-fg-muted mb-1">样本编号</label>
              <Input
                value={task.sampleId}
                disabled
                className="bg-gray-50 text-fg-muted"
              />
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1">内部编号 *</label>
              <Input
                value={formData.internalId}
                onChange={(e) => handleChange('internalId', e.target.value)}
                placeholder="如：INT-001"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1">分析流程 *</label>
              <select
                value={formData.pipeline}
                onChange={(e) => handleChange('pipeline', e.target.value)}
                className="w-full px-3 py-2 border border-border-default rounded-md text-fg-default bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
                required
              >
                {pipelineOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1">备注</label>
              <Input
                value={formData.remark}
                onChange={(e) => handleChange('remark', e.target.value)}
                placeholder="可选备注信息"
              />
            </div>
          </div>
        </form>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-default bg-canvas-subtle">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" onClick={(e: React.MouseEvent) => handleSubmit(e)}>
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}