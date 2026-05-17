'use client';

import * as React from 'react';
import { Button, Input, DataTable, Tag, Tooltip } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Plus, RotateCcw, X, ChevronRight, ChevronLeft, List, Play, Square, Pencil, Trash2, Download, Upload, BookOpen, ChevronDown, Loader2 } from 'lucide-react';
import { AnalysisDetailPanel, NewTaskModal, EditTaskModal } from './components';
import type { NewTaskFormData, EditTaskFormData } from './components';
import type { AnalysisTask } from '@/types/task';
import { tasksApi } from '@/lib/tasks';

// 简化的ID显示组件（点击复制，无复制按钮）
function IdCell({ id }: { id: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Tooltip content={id} placement="top" variant="default">
      <span
        className={`font-mono text-xs cursor-pointer ${copied ? 'text-green-500' : 'text-accent-fg hover:underline'}`}
        onClick={handleClick}
      >
        {id.substring(0, 8)}
      </span>
    </Tooltip>
  );
}

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

// 状态筛选下拉组件
function StatusFilterDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 获取当前选中项的显示
  const getCurrentDisplay = () => {
    if (value === 'all') {
      return <span className="text-sm text-fg-default">全部状态</span>;
    }
    const config = statusConfig[value as AnalysisTask['status']];
    return <Tag variant={config.variant} className="w-14 justify-center">{config.label}</Tag>;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 border border-border-default rounded bg-canvas-default hover:bg-canvas-inset transition-colors"
      >
        {getCurrentDisplay()}
        <ChevronDown className={`w-4 h-4 text-fg-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-30 py-1 min-w-[120px]">
          {/* 全部状态选项 */}
          <button
            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
              value === 'all' ? 'bg-gray-100' : ''
            }`}
            onClick={() => {
              onChange('all');
              setIsOpen(false);
            }}
          >
            <span className="text-fg-default">全部状态</span>
          </button>

          {/* 各状态选项 */}
          {statusFilterOptions.filter(opt => opt.value !== 'all').map((option) => {
            const config = statusConfig[option.value as AnalysisTask['status']];
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                  isSelected ? 'bg-gray-100' : ''
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <Tag variant={config.variant} className="w-14 justify-center">{config.label}</Tag>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  isLoading,
}: {
  task: AnalysisTask;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onEdit: (task: AnalysisTask) => void;
  onDelete: (id: string) => void;
  onView: (task: AnalysisTask) => void;
  isLoading: boolean;
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
          disabled={isLoading}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${primaryAction.className}`}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <primaryAction.icon className="w-3.5 h-3.5" />
          )}
          {isLoading ? '处理中' : primaryAction.label}
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
  const [tasks, setTasks] = React.useState<AnalysisTask[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [openTabs, setOpenTabs] = React.useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<AnalysisTask | null>(null);

  // Fetch tasks on mount and when status filter changes
  const fetchTasks = React.useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: '1', page_size: '100' };
      if (statusFilter !== 'all') params.status = statusFilter;
      const data = await tasksApi.list(params);
      setTasks(data.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取任务列表失败');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Auto-poll when there are running tasks
  React.useEffect(() => {
    const hasRunning = tasks.some(t => t.status === 'running');
    if (!hasRunning) return;
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, [tasks, fetchTasks]);

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

  const handleCreateTask = async (data: NewTaskFormData) => {
    try {
      const newTask = await tasksApi.create({
        sampleId: data.sampleId,
        internalId: data.internalId,
        pipelineId: data.pipelineId,
        pipelineName: data.pipelineName,
        pipelineVersion: data.pipelineVersion,
        remark: data.remark,
      });
      setTasks(prev => [newTask, ...prev]);
    } catch (err) {
      alert(err instanceof Error ? err.message : '创建任务失败');
    }
  };

  const handleEditTask = async (id: string, data: EditTaskFormData) => {
    try {
      const updated = await tasksApi.update(id, {
        internalId: data.internalId,
        pipeline: data.pipeline,
        remark: data.remark,
      });
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) {
      alert(err instanceof Error ? err.message : '更新任务失败');
    }
  };

  const handleStartTask = async (taskId: string) => {
    setActionLoading(taskId);
    try {
      const updated = await tasksApi.start(taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (err) {
      alert(err instanceof Error ? err.message : '启动任务失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopTask = async (taskId: string) => {
    setActionLoading(taskId);
    try {
      await tasksApi.cancel(taskId);
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'queued' as const, progress: 0 } : t
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : '停止任务失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.cancel(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除任务失败');
    }
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
      id: 'taskId',
      header: '任务编号',
      accessor: (row) => <IdCell id={row.id} />,
      width: 100,
      align: 'center',
    },
    {
      id: 'sample',
      header: '样本编号',
      accessor: (row) => (
        <div className="flex flex-col items-center gap-0.5">
          <IdCell id={row.sampleId} />
          <span className="text-xs text-fg-muted">{row.internalId}</span>
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
          isLoading={actionLoading === row.id}
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
                        {task.internalId}
                      </span>
                    </div>
                    <div className="text-xs text-fg-muted ml-4 font-mono">{task.sampleId}</div>
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

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-fg-muted" />
                <span className="ml-2 text-fg-muted">加载中...</span>
              </div>
            )}

            {error && !loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-danger-fg mb-2">{error}</p>
                  <Button variant="secondary" onClick={fetchTasks}>重试</Button>
                </div>
              </div>
            )}

            {!loading && !error && (
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
                  <StatusFilterDropdown
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
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