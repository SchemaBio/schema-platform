'use client';

import * as React from 'react';
import { Tag, Button } from '@schema/ui-kit';
import { ArrowLeft, Clock, User } from 'lucide-react';
import type { AnalysisTaskDetail, AnalysisStatus } from '../types';

interface TaskHeaderProps {
  task: AnalysisTaskDetail;
  onBack: () => void;
}

const statusConfig: Record<AnalysisStatus, { label: string; variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }> = {
  queued: { label: '排队中', variant: 'neutral' },
  running: { label: '运行中', variant: 'info' },
  completed: { label: '已完成', variant: 'success' },
  failed: { label: '失败', variant: 'danger' },
  pending_interpretation: { label: '待解读', variant: 'warning' },
};

export function TaskHeader({ task, onBack }: TaskHeaderProps) {
  const statusInfo = statusConfig[task.status];

  return (
    <div className="mb-6">
      {/* 返回链接 */}
      <button
        onClick={onBack}
        className="text-sm text-fg-muted hover:text-fg-default mb-4 flex items-center gap-1 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回任务列表
      </button>

      {/* 任务标题和状态 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-semibold text-fg-default">{task.name}</h1>
            <Tag variant={statusInfo.variant}>{statusInfo.label}</Tag>
          </div>
          
          {/* 任务信息 */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-fg-muted">
            <div className="flex items-center gap-1">
              <span className="font-medium text-fg-default">样本:</span>
              <span>{task.sampleId}</span>
              <span className="text-fg-subtle">({task.sampleName})</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="font-medium text-fg-default">分析流程:</span>
              <span>{task.pipeline}</span>
              <span className="text-fg-subtle">{task.pipelineVersion}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>创建于 {task.createdAt}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>{task.createdBy}</span>
            </div>

            {task.completedAt && (
              <div className="flex items-center gap-1">
                <span className="font-medium text-fg-default">完成于:</span>
                <span>{task.completedAt}</span>
              </div>
            )}
          </div>
        </div>

        {/* 任务ID */}
        <div className="text-right">
          <span className="text-xs text-fg-muted">任务ID</span>
          <div className="font-mono text-xs text-fg-subtle" title={task.id}>
            {task.id.substring(0, 8)}...
          </div>
        </div>
      </div>
    </div>
  );
}
