'use client';

import { useState, useEffect } from 'react';
import { PageContent } from '@/components/layout';
import { Tag } from '@schema/ui-kit';
import {
  Users,
  FlaskConical,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ListTodo,
  History,
  Workflow,
  MessageSquare,
  Send,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

// 格式化时间为中文格式
function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
}

// 统计卡片数据
const statsCards = [
  {
    title: '样本总数',
    value: '2,456',
    change: '+128',
    changeLabel: '本月新增',
    icon: Users,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    valueColor: 'text-blue-700',
    titleColor: 'text-blue-600',
    changeColor: 'text-blue-500',
    href: '/samples',
  },
  {
    title: '待分析任务',
    value: '23',
    change: '5',
    changeLabel: '紧急',
    icon: FlaskConical,
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-500',
    valueColor: 'text-orange-700',
    titleColor: 'text-orange-600',
    changeColor: 'text-orange-500',
    href: '/tasks/pending',
  },
  {
    title: '进行中任务',
    value: '8',
    change: '~2h',
    changeLabel: '预计完成',
    icon: Clock,
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-500',
    valueColor: 'text-purple-700',
    titleColor: 'text-purple-600',
    changeColor: 'text-purple-500',
    href: '/tasks/running',
  },
  {
    title: '已完成任务',
    value: '156',
    change: '+12',
    changeLabel: '本周',
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-500',
    valueColor: 'text-green-700',
    titleColor: 'text-green-600',
    changeColor: 'text-green-500',
    href: '/tasks/completed',
  },
  {
    title: '平均周转',
    value: '3.2天',
    change: '-0.5',
    changeLabel: '优化',
    icon: TrendingUp,
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-500',
    valueColor: 'text-teal-700',
    titleColor: 'text-teal-600',
    changeColor: 'text-teal-500',
    href: '/tasks',
  },
];

// 待分析样本列表
const pendingSamples = [
  {
    id: '1',
    sampleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    internalId: 'INT-001',
    testType: '全外显子组测序',
    priority: 'urgent' as const,
    receivedDate: '2024-12-25',
    waitingDays: 3,
  },
  {
    id: '2',
    sampleId: 'b2c3d4e5-f678-90ab-cdef-123456789012',
    internalId: 'INT-002',
    testType: '遗传性心肌病Panel',
    priority: 'normal' as const,
    receivedDate: '2024-12-26',
    waitingDays: 2,
  },
  {
    id: '3',
    sampleId: 'c3d4e5f6-7890-abcd-ef12-345678901234',
    internalId: 'INT-003',
    testType: '遗传性肿瘤Panel',
    priority: 'urgent' as const,
    receivedDate: '2024-12-26',
    waitingDays: 2,
  },
  {
    id: '4',
    sampleId: 'd4e5f678-90ab-cdef-1234-567890123456',
    internalId: 'INT-004',
    testType: '全外显子组测序',
    priority: 'normal' as const,
    receivedDate: '2024-12-27',
    waitingDays: 1,
  },
  {
    id: '5',
    sampleId: 'e5f67890-abcd-ef12-3456-789012345678',
    internalId: 'INT-005',
    testType: '线粒体基因组测序',
    priority: 'normal' as const,
    receivedDate: '2024-12-27',
    waitingDays: 1,
  },
];

// 全局备注
const globalNotes = [
  {
    id: '1',
    content: '下周一开始系统维护，预计停机2小时，请提前保存工作内容。',
    author: '张医生',
    createdAt: '2024-12-28 14:30',
    avatar: '张',
    isOwner: true, // 当前用户发送的
  },
  {
    id: '2',
    content: '新增心血管Panel检测项目已上线，欢迎大家试用并反馈问题。',
    author: '李工程师',
    createdAt: '2024-12-28 10:15',
    avatar: '李',
    isOwner: false,
  },
  {
    id: '3',
    content: '本周五下午3点召开项目进度会议，请相关人员准时参加。',
    author: '王主任',
    createdAt: '2024-12-27 16:45',
    avatar: '王',
    isOwner: false,
  },
  {
    id: '4',
    content: '提醒：请大家及时更新样本状态，确保流程追踪准确。',
    author: '张医生',
    createdAt: '2024-12-27 09:30',
    avatar: '张',
    isOwner: true,
  },
  {
    id: '5',
    content: '新版本已部署，修复了报告导出的问题。',
    author: '李工程师',
    createdAt: '2024-12-26 15:20',
    avatar: '李',
    isOwner: false,
  },
];

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState(globalNotes);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; author: string } | null>(null);

  // 当前用户是否是管理员（模拟）
  const isAdmin = true;

  useEffect(() => {
    // 初始化时间
    setCurrentTime(formatDateTime(new Date()));

    // 每秒更新时间
    const timer = setInterval(() => {
      setCurrentTime(formatDateTime(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note = {
      id: String(Date.now()),
      content: newNote.trim(),
      author: '张医生',
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(/\//g, '-'),
      avatar: '张',
      isOwner: true,
    };

    setNotes([note, ...notes]);
    setNewNote('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
    setDeleteConfirm(null);
  };

  const canDeleteNote = (note: typeof notes[0]) => {
    return note.isOwner || isAdmin;
  };

  return (
    <PageContent padded={false} className="h-full flex flex-col">
      <div className="p-6 flex flex-col h-full min-h-0">
      {/* 欢迎信息 */}
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-semibold text-fg-default">欢迎回来，张医生</h2>
          <p className="text-sm text-fg-muted mt-1">
            现在是 {currentTime || '加载中...'}
          </p>
        </div>
        {/* 快捷操作 */}
        <div className="flex items-center gap-3">
          <Link
            href="/samples"
            className="px-4 py-2 bg-canvas-default rounded-lg border border-border hover:border-accent-muted hover:shadow-sm transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-fg-muted" />
            <span className="text-sm text-fg-default">样本管理</span>
          </Link>
          <Link
            href="/tasks"
            className="px-4 py-2 bg-canvas-default rounded-lg border border-border hover:border-accent-muted hover:shadow-sm transition-all flex items-center gap-2"
          >
            <ListTodo className="w-4 h-4 text-fg-muted" />
            <span className="text-sm text-fg-default">任务中心</span>
          </Link>
          <Link
            href="/history"
            className="px-4 py-2 bg-canvas-default rounded-lg border border-border hover:border-accent-muted hover:shadow-sm transition-all flex items-center gap-2"
          >
            <History className="w-4 h-4 text-fg-muted" />
            <span className="text-sm text-fg-default">历史检出</span>
          </Link>
          <Link
            href="/pipeline"
            className="px-4 py-2 bg-canvas-default rounded-lg border border-border hover:border-accent-muted hover:shadow-sm transition-all flex items-center gap-2"
          >
            <Workflow className="w-4 h-4 text-fg-muted" />
            <span className="text-sm text-fg-default">流程中心</span>
          </Link>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 shrink-0">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className={`p-4 rounded-lg border border-border hover:shadow-md transition-all ${stat.bgColor}`}
            >
              <div className="flex items-start justify-between">
                <Icon className={`w-8 h-8 ${stat.iconColor}`} />
                <span className={`text-xs ${stat.changeColor}`}>
                  {stat.change} {stat.changeLabel}
                </span>
              </div>
              <div className="mt-3">
                <div className={`text-2xl font-bold ${stat.valueColor}`}>{stat.value}</div>
                <div className={`text-sm ${stat.titleColor}`}>{stat.title}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 全局备注 + 待分析任务 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* 全局备注 */}
        <div className="bg-canvas-default rounded-lg border border-border flex flex-col min-h-0">
          <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
            <h3 className="font-medium text-fg-default flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent-fg" />
              全局备注
            </h3>
            <span className="text-xs text-fg-muted">组织内可见</span>
          </div>

          {/* 发备注输入框 */}
          <div className="p-3 border-b border-border bg-canvas-subtle shrink-0">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-accent-subtle flex items-center justify-center text-xs font-medium text-accent-fg shrink-0">
                张
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 relative flex items-center bg-canvas-default rounded-lg border border-border focus-within:border-accent-muted focus-within:ring-1 focus-within:ring-accent-muted transition-all">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddNote();
                      }
                    }}
                    placeholder="发布备注..."
                    className="flex-1 w-full px-3 py-2 text-sm bg-transparent focus:outline-none"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="shrink-0 w-7 h-7 mr-1 flex items-center justify-center rounded-md bg-accent-emphasis text-white hover:bg-accent-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="发布"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 备注列表 */}
          <div className="divide-y divide-border overflow-y-auto flex-1">
            {notes.map((note) => (
              <div key={note.id} className="p-3 hover:bg-canvas-subtle transition-colors group">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-canvas-inset flex items-center justify-center text-xs font-medium text-fg-muted shrink-0">
                    {note.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-fg-default">{note.author}</span>
                      <span className="text-xs text-fg-muted">{note.createdAt}</span>
                      {canDeleteNote(note) && (
                        <button
                          onClick={() => setDeleteConfirm({ id: note.id, author: note.author })}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-danger-subtle text-fg-muted hover:text-danger-fg transition-all"
                          title="删除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-fg-default">{note.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="p-6 text-center text-fg-muted text-sm">
                暂无备注
              </div>
            )}
          </div>
        </div>

        {/* 待分析任务 */}
        <div className="bg-canvas-default rounded-lg border border-border flex flex-col min-h-0">
          <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
            <h3 className="font-medium text-fg-default flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              待分析任务
            </h3>
            <Link
              href="/tasks/pending"
              className="text-sm text-accent-fg hover:underline flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border overflow-y-auto flex-1">
            {pendingSamples.map((sample) => (
              <div
                key={sample.id}
                className="flex items-center justify-between p-4 hover:bg-canvas-subtle transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-fg-default font-mono text-sm">
                        {sample.sampleId.substring(0, 8)}
                      </span>
                      <span className="text-fg-muted text-sm">({sample.internalId})</span>
                      {sample.priority === 'urgent' && (
                        <Tag variant="danger">紧急</Tag>
                      )}
                    </div>
                    <div className="text-sm text-fg-muted mt-0.5">
                      {sample.testType}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-fg-muted">
                    等待 {sample.waitingDays} 天
                  </div>
                  <div className="text-xs text-fg-subtle">{sample.receivedDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-canvas-default rounded-lg shadow-lg border border-border p-4 w-full max-w-sm mx-4">
            <h4 className="text-base font-medium text-fg-default mb-2">确认删除</h4>
            <p className="text-sm text-fg-muted mb-4">
              确定要删除 {deleteConfirm.author} 的这条备注吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 text-sm text-fg-default border border-border rounded-md hover:bg-canvas-subtle transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteNote(deleteConfirm.id)}
                className="px-3 py-1.5 text-sm bg-danger-emphasis text-white rounded-md hover:bg-danger-muted transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageContent>
  );
}
