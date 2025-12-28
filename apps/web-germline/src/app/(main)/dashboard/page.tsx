'use client';

import { PageContent } from '@/components/layout';
import { Tag } from '@schema/ui-kit';
import {
  Users,
  FlaskConical,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

// 统计卡片数据
const statsCards = [
  {
    title: '样本总数',
    value: '2,456',
    change: '+128',
    changeLabel: '本月新增',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    href: '/samples',
  },
  {
    title: '待分析任务',
    value: '23',
    change: '5',
    changeLabel: '紧急',
    icon: FlaskConical,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    href: '/analysis/pending',
  },
  {
    title: '进行中任务',
    value: '8',
    change: '~2h',
    changeLabel: '预计完成',
    icon: Clock,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    href: '/analysis/running',
  },
  {
    title: '待审核报告',
    value: '15',
    change: '3',
    changeLabel: '超过3天',
    icon: FileText,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    href: '/reports/review',
  },
];

// 待分析样本列表
const pendingSamples = [
  {
    id: '1',
    sampleId: 'S2024120089',
    patientName: '张**',
    testType: '全外显子组测序',
    priority: 'urgent' as const,
    receivedDate: '2024-12-25',
    waitingDays: 3,
  },
  {
    id: '2',
    sampleId: 'S2024120088',
    patientName: '李**',
    testType: '遗传性心肌病Panel',
    priority: 'normal' as const,
    receivedDate: '2024-12-26',
    waitingDays: 2,
  },
  {
    id: '3',
    sampleId: 'S2024120087',
    patientName: '王**',
    testType: '遗传性肿瘤Panel',
    priority: 'urgent' as const,
    receivedDate: '2024-12-26',
    waitingDays: 2,
  },
  {
    id: '4',
    sampleId: 'S2024120086',
    patientName: '赵**',
    testType: '全外显子组测序',
    priority: 'normal' as const,
    receivedDate: '2024-12-27',
    waitingDays: 1,
  },
  {
    id: '5',
    sampleId: 'S2024120085',
    patientName: '陈**',
    testType: '线粒体基因组测序',
    priority: 'normal' as const,
    receivedDate: '2024-12-27',
    waitingDays: 1,
  },
];

// 最近完成的任务
const recentCompletedTasks = [
  {
    id: '1',
    taskId: 'TSK-a1b2c3d4',
    sampleId: 'S2024120080',
    patientName: '刘**',
    completedAt: '2024-12-28 10:30',
    variantsFound: 3,
    status: 'pending_interpretation' as const,
  },
  {
    id: '2',
    taskId: 'TSK-e5f6g7h8',
    sampleId: 'S2024120079',
    patientName: '孙**',
    completedAt: '2024-12-28 09:15',
    variantsFound: 1,
    status: 'completed' as const,
  },
  {
    id: '3',
    taskId: 'TSK-i9j0k1l2',
    sampleId: 'S2024120078',
    patientName: '周**',
    completedAt: '2024-12-27 18:45',
    variantsFound: 5,
    status: 'completed' as const,
  },
];

// 本周统计
const weeklyStats = {
  samplesReceived: 45,
  tasksCompleted: 38,
  reportsReleased: 32,
  avgTurnaroundDays: 3.2,
};

export default function DashboardPage() {
  return (
    <PageContent>
      {/* 欢迎信息 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-fg-default">欢迎回来，张医生</h2>
        <p className="text-sm text-fg-muted mt-1">
          今天是 2024年12月28日，以下是系统概览
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="p-4 bg-canvas-default rounded-lg border border-border hover:border-accent-muted hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs text-fg-muted">
                  {stat.change} {stat.changeLabel}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-fg-default">{stat.value}</div>
                <div className="text-sm text-fg-muted">{stat.title}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 待分析样本 */}
        <div className="lg:col-span-2 bg-canvas-default rounded-lg border border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-medium text-fg-default flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              待分析样本
            </h3>
            <Link
              href="/analysis/pending"
              className="text-sm text-accent-fg hover:underline flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {pendingSamples.map((sample) => (
              <div
                key={sample.id}
                className="flex items-center justify-between p-4 hover:bg-canvas-subtle transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-fg-default">
                        {sample.sampleId}
                      </span>
                      {sample.priority === 'urgent' && (
                        <Tag variant="danger">紧急</Tag>
                      )}
                    </div>
                    <div className="text-sm text-fg-muted mt-0.5">
                      {sample.patientName} · {sample.testType}
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

        {/* 本周统计 */}
        <div className="bg-canvas-default rounded-lg border border-border">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-fg-default flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              本周统计
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">收样数量</span>
              <span className="font-medium text-fg-default">
                {weeklyStats.samplesReceived}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">完成任务</span>
              <span className="font-medium text-fg-default">
                {weeklyStats.tasksCompleted}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">发放报告</span>
              <span className="font-medium text-fg-default">
                {weeklyStats.reportsReleased}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm text-fg-muted">平均周转时间</span>
              <span className="font-medium text-accent-fg">
                {weeklyStats.avgTurnaroundDays} 天
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 最近完成的任务 */}
      <div className="mt-6 bg-canvas-default rounded-lg border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-medium text-fg-default flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            最近完成的任务
          </h3>
          <Link
            href="/analysis/completed"
            className="text-sm text-accent-fg hover:underline flex items-center gap-1"
          >
            查看全部 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-canvas-subtle text-left text-sm text-fg-muted">
                <th className="px-4 py-3 font-medium">任务ID</th>
                <th className="px-4 py-3 font-medium">样本编号</th>
                <th className="px-4 py-3 font-medium">患者</th>
                <th className="px-4 py-3 font-medium">完成时间</th>
                <th className="px-4 py-3 font-medium">检出变异</th>
                <th className="px-4 py-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentCompletedTasks.map((task) => (
                <tr key={task.id} className="hover:bg-canvas-subtle transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-fg-default">
                    {task.taskId.slice(0, 12)}...
                  </td>
                  <td className="px-4 py-3 text-sm text-fg-default">{task.sampleId}</td>
                  <td className="px-4 py-3 text-sm text-fg-default">{task.patientName}</td>
                  <td className="px-4 py-3 text-sm text-fg-muted">{task.completedAt}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-0.5 bg-accent-subtle text-accent-fg rounded">
                      {task.variantsFound} 个
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {task.status === 'pending_interpretation' ? (
                      <Tag variant="warning">待解读</Tag>
                    ) : (
                      <Tag variant="success">已完成</Tag>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/samples/new"
          className="p-4 bg-canvas-default rounded-lg border border-border hover:border-accent-muted hover:shadow-sm transition-all text-center"
        >
          <Users className="w-6 h-6 mx-auto text-fg-muted mb-2" />
          <span className="text-sm text-fg-default">新建样本</span>
        </Link>
        <Link
          href="/analysis/new"
          className="p-4 bg-canvas-default rounded-lg border border-border hover:border-accent-muted hover:shadow-sm transition-all text-center"
        >
          <FlaskConical className="w-6 h-6 mx-auto text-fg-muted mb-2" />
          <span className="text-sm text-fg-default">新建任务</span>
        </Link>
        <Link
          href="/reports/new"
          className="p-4 bg-canvas-default rounded-lg border border-border hover:border-accent-muted hover:shadow-sm transition-all text-center"
        >
          <FileText className="w-6 h-6 mx-auto text-fg-muted mb-2" />
          <span className="text-sm text-fg-default">生成报告</span>
        </Link>
        <Link
          href="/data/samplesheet"
          className="p-4 bg-canvas-default rounded-lg border border-border hover:border-accent-muted hover:shadow-sm transition-all text-center"
        >
          <Calendar className="w-6 h-6 mx-auto text-fg-muted mb-2" />
          <span className="text-sm text-fg-default">导入数据</span>
        </Link>
      </div>
    </PageContent>
  );
}
