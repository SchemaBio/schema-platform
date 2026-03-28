'use client';

import * as React from 'react';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Plus, Eye, RotateCcw, X, ChevronRight, ChevronLeft, List } from 'lucide-react';
import { AnalysisDetailPanel, NewTaskModal } from './components';
import type { NewTaskFormData } from './components';

interface AnalysisTask {
  id: string;
  name: string;
  sampleId: string;
  sampleName: string;
  pipeline: string;
  pipelineVersion: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'pending_interpretation';
  progress: number;
  createdAt: string;
  createdBy: string;
  completedAt?: string;
}

// Mock data
const mockTasks: AnalysisTask[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'S2024120001 全外显子分析',
    sampleId: 'S2024120001',
    sampleName: '张**',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    status: 'completed',
    progress: 100,
    createdAt: '2024-12-20 10:30',
    createdBy: '王工',
    completedAt: '2024-12-20 14:25',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    name: 'S2024120001 重新分析',
    sampleId: 'S2024120001',
    sampleName: '张**',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    status: 'pending_interpretation',
    progress: 100,
    createdAt: '2024-12-25 09:00',
    createdBy: '李工',
    completedAt: '2024-12-25 13:15',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    name: 'S2024120002 心血管Panel',
    sampleId: 'S2024120002',
    sampleName: '李**',
    pipeline: 'Panel-Cardio',
    pipelineVersion: 'v2.0.1',
    status: 'running',
    progress: 65,
    createdAt: '2024-12-27 14:00',
    createdBy: '王工',
  },
  {
    id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    name: 'S2024120003 全外显子分析',
    sampleId: 'S2024120003',
    sampleName: '王**',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    status: 'queued',
    progress: 0,
    createdAt: '2024-12-28 09:30',
    createdBy: '李工',
  },
  {
    id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    name: 'S2024120004 全外显子分析',
    sampleId: 'S2024120004',
    sampleName: '赵**',
    pipeline: 'WES-Germline-v1',
    pipelineVersion: 'v1.2.0',
    status: 'failed',
    progress: 45,
    createdAt: '2024-12-26 11:00',
    createdBy: '王工',
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

interface OpenTab {
  id: string;
  taskId: string;
  sampleId: string;
  name: string;
}

export default function AnalysisPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [tasks, setTasks] = React.useState<AnalysisTask[]>(mockTasks);
  const [openTabs, setOpenTabs] = React.useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = React.useState(false);

  const handleCreateTask = (data: NewTaskFormData) => {
    const newTask: AnalysisTask = {
      id: `task-${Date.now()}`,
      name: data.taskName,
      sampleId: data.sampleId,
      sampleName: data.patientName,
      pipeline: data.pipelineName,
      pipelineVersion: data.pipelineVersion,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }).replace(/\//g, '-'),
      createdBy: '当前用户',
    };
    setTasks(prev => [newTask, ...prev]);
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
    if (!searchQuery) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.id.toLowerCase().includes(query) ||
        t.sampleId.toLowerCase().includes(query) ||
        t.name.toLowerCase().includes(query) ||
        t.sampleName.includes(query)
    );
  }, [searchQuery]);

  const columns: Column<AnalysisTask>[] = [
    {
      id: 'sample',
      header: '样本编号',
      accessor: (row) => (
        <div onClick={(e) => { e.stopPropagation(); handleOpenTab(row); }}>
          <span className="text-accent-fg hover:underline cursor-pointer">{row.sampleId}</span>
          <div className="text-xs text-fg-muted">{row.sampleName}</div>
        </div>
      ),
      width: 140,
    },
    { id: 'name', header: '任务名称', accessor: 'name', width: 200 },
    {
      id: 'pipeline',
      header: '分析流程',
      accessor: (row) => (
        <div>
          <div className="text-fg-default">{row.pipeline}</div>
          <div className="text-xs text-fg-muted">{row.pipelineVersion}</div>
        </div>
      ),
      width: 140,
    },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => {
        const config = statusConfig[row.status];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 90,
    },
    {
      id: 'progress',
      header: '进度',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-canvas-inset rounded-full overflow-hidden">
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
    },
    { id: 'createdAt', header: '创建时间', accessor: 'createdAt', width: 130 },
    { id: 'createdBy', header: '创建者', accessor: 'createdBy', width: 70 },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="small" 
            iconOnly 
            aria-label="查看"
            onClick={() => handleOpenTab(row)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {row.status === 'failed' && (
            <Button variant="ghost" size="small" iconOnly aria-label="重试">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
      width: 70,
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
                    <div className="text-xs text-fg-muted ml-4 truncate">{task.name}</div>
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
              <div className="w-64">
                <Input
                  placeholder="搜索样本编号、任务名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftElement={<Search className="w-4 h-4" />}
                />
              </div>
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewTaskModalOpen(true)}>
                新建任务
              </Button>
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
    </div>
  );
}
