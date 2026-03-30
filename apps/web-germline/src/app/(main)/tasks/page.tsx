'use client';

import * as React from 'react';
import { Button, Input, DataTable, Tag, Select } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Plus, RotateCcw, X, ChevronRight, ChevronLeft, List, Play, Square, Pencil, Trash2, Download, Upload, BookOpen } from 'lucide-react';
import { AnalysisDetailPanel, NewTaskModal, EditTaskModal } from './components';
import type { NewTaskFormData, EditTaskFormData, AnalysisTask } from './components';

// Mock data
const mockTasks: AnalysisTask[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    sampleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    internalId: 'INT-001',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    status: 'completed',
    progress: 100,
    createdAt: '2024-12-20 10:30:45',
    createdBy: '王工',
    completedAt: '2024-12-20 14:25:30',
    remark: '初次分析',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    sampleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    internalId: 'INT-001',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    status: 'pending_interpretation',
    progress: 100,
    createdAt: '2024-12-25 09:00:12',
    createdBy: '李工',
    completedAt: '2024-12-25 13:15:45',
    remark: '重新分析',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    sampleId: 'b2c3d4e5-f678-90ab-cdef-123456789012',
    internalId: 'INT-002',
    pipeline: 'Panel-Cardio',
    pipelineVersion: 'v2.0.1',
    status: 'running',
    progress: 65,
    createdAt: '2024-12-27 14:00:33',
    createdBy: '王工',
    remark: '心血管Panel',
  },
  {
    id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    sampleId: 'c3d4e5f6-7890-abcd-ef12-345678901234',
    internalId: 'INT-003',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    status: 'queued',
    progress: 0,
    createdAt: '2024-12-28 09:30:00',
    createdBy: '李工',
  },
  {
    id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    sampleId: 'd4e5f678-90ab-cdef-1234-567890123456',
    internalId: 'INT-004',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    status: 'failed',
    progress: 45,
    createdAt: '2024-12-26 11:00:22',
    createdBy: '王工',
    remark: '数据质量问题',
  },
];

const statusConfig: Record<AnalysisTask['status'], { label: string; variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }> = {
  queued: { label: '排队中', variant: 'neutral' },
  running: { label: '运行中', variant: 'info' },
  completed: { label: '已完成', variant: 'success' },
  failed: { label: '失败', variant: 'danger' },
  pending_interpretation: { label: '待解读', variant: 'warning' },
};

const statusDotColors: Record<AnalysisTask['status'], string> = {
  queued: 'bg-neutral-emphasis',
  running: 'bg-accent-emphasis',
  completed: 'bg-success-emphasis',
  failed: 'bg-danger-emphasis',
  pending_interpretation: 'bg-attention-emphasis',
};

const statusFilterOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'queued', label: '排队中' },
  { value: 'running', label: '运行中' },
  { value: 'pending_interpretation', label: '待解读' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' },
];

interface OpenTab {
  id: string;
  taskId: string;
  sampleId: string;
  name: string;
}

// 操作单元格组件
function TaskActionsCell({
  task,
  onStart,
  onStop,
  onEdit,
  onDelete,
  onView,
}: {
  task: AnalysisTask;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onEdit: (task: AnalysisTask) => void;
  onDelete: (id: string) => void;
  onView: (task: AnalysisTask) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const deleteConfirmRef = React.useRef<HTMLDivElement>(null);

  // 点击外部关闭删除确认弹窗
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

  // 动态按钮配置：根据状态和进度自动切换
  // 1. 启动 - 排队中(queued)状态
  // 2. 停止 - 运行中(running)状态
  // 3. 解读 - 待解读(pending_interpretation)或已完成(completed)状态
  // 4. 重试 - 失败(failed)状态
  const getPrimaryAction = () => {
    switch (task.status) {
      case 'queued':
        return {
          label: '启动',
          icon: Play,
          onClick: () => onStart(task.id),
          className: 'text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300',
        };
      case 'running':
        return {
          label: '停止',
          icon: Square,
          onClick: () => onStop(task.id),
          className: 'text-orange-600 hover:bg-orange-50 border-orange-200 hover:border-orange-300',
        };
      case 'pending_interpretation':
      case 'completed':
        return {
          label: '解读',
          icon: BookOpen,
          onClick: () => onView(task),
          className: 'text-blue-600 hover:bg-blue-50 border-blue-200 hover:border-blue-300',
        };
      case 'failed':
        return {
          label: '重试',
          icon: RotateCcw,
          onClick: () => onStart(task.id),
          className: 'text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300',
        };
      default:
        return null;
    }
  };

  const primaryAction = getPrimaryAction();
  const canEdit = task.status !== 'running';
  const canDelete = task.status !== 'running';

  return (
    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
      {/* 状态转换按钮（主要操作） */}
      {primaryAction && (
        <button
          onClick={primaryAction.onClick}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded transition-colors ${primaryAction.className}`}
        >
          <primaryAction.icon className="w-3.5 h-3.5" />
          {primaryAction.label}
        </button>
      )}

      {/* 编辑按钮 */}
      <button
        className={`p-1.5 rounded transition-colors ${
          canEdit ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
        }`}
        onClick={() => {
          if (canEdit) onEdit(task);
        }}
        disabled={!canEdit}
        aria-label="编辑"
        title={canEdit ? '编辑' : '运行中不可编辑'}
      >
        <Pencil className="w-4 h-4" />
      </button>

      {/* 删除按钮 */}
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
          title={canDelete ? '删除' : '运行中不可删除'}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* 删除确认弹窗 */}
        {showDeleteConfirm && (
          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-20 p-2">
            <div className="text-xs text-gray-600 mb-2 text-center">确认删除此任务？</div>
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
                  onDelete(task.id);
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

export default function AnalysisPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [tasks, setTasks] = React.useState<AnalysisTask[]>(mockTasks);
  const [openTabs, setOpenTabs] = React.useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<AnalysisTask | null>(null);

  const handleDownloadTemplate = () => {
    const templateContent = `样本编号,内部编号,分析流程,流程版本
a1b2c3d4-e5f6-7890-abcd-ef1234567890,INT-001,WES-Germline-v1,v1.2.0`;
    const blob = new Blob(['\ufeff' + templateContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '任务导入模板.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateTask = (data: NewTaskFormData) => {
    const newTask: AnalysisTask = {
      id: `task-${Date.now()}`,
      sampleId: data.sampleId,
      internalId: data.internalId,
      pipeline: data.pipelineName,
      pipelineVersion: data.pipelineVersion,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).replace(/\//g, '-'),
      createdBy: '当前用户',
      remark: data.remark,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleEditTask = (id: string, data: EditTaskFormData) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        internalId: data.internalId,
        pipeline: data.pipeline,
      };
    }));
  };

  const handleStartTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, status: 'running', progress: 0 };
    }));
  };

  const handleStopTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, status: 'queued', progress: 0 };
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleOpenTab = React.useCallback((task: AnalysisTask) => {
    const existingTab = openTabs.find(t => t.taskId === task.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    const newTab: OpenTab = {
      id: `tab-${Date.now()}`,
      taskId: task.id,
      sampleId: task.sampleId,
      name: task.sampleId,
    };
    setOpenTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [openTabs]);

  const handleCloseTab = React.useCallback((tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const filteredTasks = React.useMemo(() => {
    let result = tasks;
    // 先按状态筛选
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }
    // 再按搜索词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(query) ||
          t.sampleId.toLowerCase().includes(query) ||
          t.internalId.toLowerCase().includes(query)
      );
    }
    return result;
  }, [searchQuery, statusFilter, tasks]);

  const columns: Column<AnalysisTask>[] = [
    {
      id: 'sample',
      header: '样本编号',
      accessor: (row) => (
        <div onClick={(e) => { e.stopPropagation(); handleOpenTab(row); }} className="text-center">
          <span className="font-mono text-xs text-accent-fg hover:underline cursor-pointer">{row.sampleId.substring(0, 8)}</span>
          <div className="text-xs text-fg-muted">{row.internalId}</div>
        </div>
      ),
      width: 140,
      align: 'center',
    },
    {
      id: 'pipeline',
      header: '分析流程',
      accessor: (row) => (
        <div className="text-center">
          <div className="text-fg-default">{row.pipeline}</div>
          <div className="text-xs text-fg-muted">{row.pipelineVersion}</div>
        </div>
      ),
      width: 140,
      align: 'center',
    },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => {
        const config = statusConfig[row.status];
        return <Tag variant={config.variant} className="w-14 justify-center">{config.label}</Tag>;
      },
      width: 90,
      align: 'center',
    },
    {
      id: 'progress',
      header: '进度',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <div className="flex-1 h-2 bg-canvas-inset rounded-full overflow-hidden max-w-[60px]">
            <div
              className={`h-full rounded-full transition-all ${
                row.status === 'failed' ? 'bg-danger-emphasis' : 'bg-accent-emphasis'
              }`}
              style={{ width: `${row.progress}%` }}
            />
          </div>
          <span className="text-xs text-fg-muted w-8">{row.progress}%</span>
        </div>
      ),
      width: 120,
      align: 'center',
    },
    { id: 'createdAt', header: '创建时间', accessor: 'createdAt', width: 150, align: 'center' },
    { id: 'createdBy', header: '创建者', accessor: 'createdBy', width: 70, align: 'center' },
    {
      id: 'remark',
      header: '备注',
      accessor: (row) => (
        <span className={row.remark ? 'text-fg-default truncate block max-w-[100px] text-center' : 'text-fg-muted text-center'}>
          {row.remark || '-'}
        </span>
      ),
      width: 100,
      align: 'center',
    },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <TaskActionsCell
          task={row}
          onStart={handleStartTask}
          onStop={handleStopTask}
          onEdit={setEditingTask}
          onDelete={handleDeleteTask}
          onView={handleOpenTab}
        />
      ),
      width: 130,
      align: 'center',
    },
  ];

  const activeTab = openTabs.find(t => t.id === activeTabId);
  const hasOpenTabs = openTabs.length > 0;

  return (
    <div className="flex h-full">
      {/* 左侧任务列表 */}
      {hasOpenTabs ? (
        // 收起/展开状态
        sidebarCollapsed ? (
          // 完全收起：只显示展开按钮
          <div className="w-10 flex-shrink-0 border-r border-border-default bg-canvas-subtle flex flex-col items-center py-2">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors"
              title="展开任务列表"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="mt-2 text-xs text-fg-muted writing-mode-vertical">
              任务
            </div>
            {/* 显示打开的任务数量 */}
            <div className="mt-auto mb-2 w-5 h-5 rounded-full bg-accent-emphasis text-white text-xs flex items-center justify-center">
              {openTabs.length}
            </div>
          </div>
        ) : (
          // 展开状态：窄边栏显示样本列表
          <div className="w-56 flex-shrink-0 border-r border-border-default bg-canvas-subtle flex flex-col">
            {/* 标题栏 */}
            <div className="px-3 py-2 border-b border-border-default flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-fg-muted" />
                <span className="text-sm font-medium text-fg-default">任务列表</span>
              </div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors"
                title="收起"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* 搜索框 */}
            <div className="p-2 border-b border-border-default">
              <Input
                placeholder="搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftElement={<Search className="w-3.5 h-3.5" />}
                className="text-xs"
              />
            </div>

            {/* 任务列表 */}
            <div className="flex-1 overflow-auto">
              {filteredTasks.map((task) => {
                const isOpen = openTabs.some(t => t.taskId === task.id);
                const isActive = activeTab?.taskId === task.id;
                return (
                  <div
                    key={task.id}
                    onClick={() => handleOpenTab(task)}
                    className={`
                      px-3 py-2 cursor-pointer border-b border-border-muted
                      transition-colors
                      ${isActive
                        ? 'bg-accent-subtle border-l-2 border-l-accent-emphasis'
                        : isOpen
                          ? 'bg-canvas-inset'
                          : 'hover:bg-canvas-inset'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusDotColors[task.status]}`} />
                      <span className={`text-sm ${isActive ? 'text-accent-fg font-medium' : 'text-fg-default'}`}>
                        {task.sampleId}
                      </span>
                    </div>
                    <div className="text-xs text-fg-muted ml-4">{task.internalId}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        // 展开状态：完整表格
        <div className="flex-1">
          <div className="p-6 h-full overflow-auto">
            <h2 className="text-lg font-medium text-fg-default mb-4">任务列表</h2>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-64">
                  <Input
                    placeholder="搜索样本编号..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftElement={<Search className="w-4 h-4" />}
                  />
                </div>
                <div className="w-36">
                  <Select
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(Array.isArray(value) ? value[0] : value)}
                    options={statusFilterOptions}
                    placeholder="选择状态"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />} onClick={handleDownloadTemplate}>
                  下载模板
                </Button>
                <Button variant="secondary" leftIcon={<Upload className="w-4 h-4" />}>
                  批量导入
                </Button>
                <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewTaskModalOpen(true)}>
                  新建任务
                </Button>
              </div>
            </div>

            <DataTable
              data={filteredTasks}
              columns={columns}
              rowKey="id"
              striped
              density="compact"
            />
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
              <AnalysisDetailPanel
                key={activeTab.taskId}
                taskId={activeTab.taskId}
              />
            )}
          </div>
        </div>
      )}

      {/* 新建任务弹窗 */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* 编辑任务弹窗 */}
      <EditTaskModal
        isOpen={editingTask !== null}
        onClose={() => setEditingTask(null)}
        onSubmit={handleEditTask}
        task={editingTask}
      />
    </div>
  );
}