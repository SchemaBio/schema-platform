'use client';

import { PageContent } from '@/components/layout';
import { Tag } from '@schema/ui-kit';
import { History, Library, TrendingUp, FileText } from 'lucide-react';
import Link from 'next/link';

interface StatCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  href: string;
  trend?: { value: number; label: string };
}

const stats: StatCard[] = [
  {
    title: '历史检出位点',
    value: '1,256',
    description: '累计在报告中检出的致病/可能致病位点',
    icon: <History className="w-5 h-5" />,
    href: '/knowledge/history',
    trend: { value: 23, label: '本月新增' },
  },
  {
    title: '位点收录库',
    value: '8,432',
    description: '收录的位点及其ACMG评级、文献信息',
    icon: <Library className="w-5 h-5" />,
    href: '/knowledge/variants',
    trend: { value: 156, label: '本月新增' },
  },
  {
    title: '关联文献',
    value: '3,891',
    description: '位点相关的参考文献',
    icon: <FileText className="w-5 h-5" />,
    href: '/knowledge/variants',
  },
  {
    title: '覆盖基因',
    value: '2,156',
    description: '知识库覆盖的基因数量',
    icon: <TrendingUp className="w-5 h-5" />,
    href: '/knowledge/variants',
  },
];

// ACMG 分类统计
const acmgStats = [
  { label: '致病 (P)', count: 892, variant: 'pathogenic' as const },
  { label: '可能致病 (LP)', count: 1456, variant: 'likely-pathogenic' as const },
  { label: '意义未明 (VUS)', count: 4521, variant: 'vus' as const },
  { label: '可能良性 (LB)', count: 987, variant: 'likely-benign' as const },
  { label: '良性 (B)', count: 576, variant: 'benign' as const },
];

// 最近更新的位点
const recentVariants = [
  {
    id: '1',
    gene: 'BRCA1',
    variant: 'c.5266dupC',
    hgvsp: 'p.Gln1756ProfsTer74',
    acmg: 'pathogenic' as const,
    updatedAt: '2024-12-27',
  },
  {
    id: '2',
    gene: 'PKD1',
    variant: 'c.12345G>A',
    hgvsp: 'p.Trp4115Ter',
    acmg: 'pathogenic' as const,
    updatedAt: '2024-12-26',
  },
  {
    id: '3',
    gene: 'MYH7',
    variant: 'c.1208G>A',
    hgvsp: 'p.Arg403Gln',
    acmg: 'likely-pathogenic' as const,
    updatedAt: '2024-12-25',
  },
  {
    id: '4',
    gene: 'SCN5A',
    variant: 'c.4850C>T',
    hgvsp: 'p.Thr1617Met',
    acmg: 'vus' as const,
    updatedAt: '2024-12-24',
  },
];

export default function KnowledgeOverviewPage() {
  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">知识库概览</h2>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="p-4 bg-canvas-default rounded-lg border border-border hover:border-accent-muted transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-accent-subtle rounded-md text-accent-fg">
                {stat.icon}
              </div>
              {stat.trend && (
                <span className="text-xs text-success-fg bg-success-subtle px-2 py-0.5 rounded">
                  +{stat.trend.value} {stat.trend.label}
                </span>
              )}
            </div>
            <div className="text-2xl font-semibold text-fg-default mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-fg-muted">{stat.title}</div>
            <div className="text-xs text-fg-subtle mt-1">{stat.description}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACMG 分类统计 */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-4">ACMG 分类分布</h3>
          <div className="space-y-3">
            {acmgStats.map((item) => {
              const total = acmgStats.reduce((sum, i) => sum + i.count, 0);
              const percentage = ((item.count / total) * 100).toFixed(1);
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <Tag variant={item.variant} className="w-28 justify-center">
                    {item.label}
                  </Tag>
                  <div className="flex-1">
                    <div className="h-2 bg-canvas-inset rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-emphasis rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-fg-muted w-20 text-right">
                    {item.count.toLocaleString()} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 最近更新 */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-4">最近更新的位点</h3>
          <div className="space-y-3">
            {recentVariants.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-canvas-subtle transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-fg-default">{v.gene}</span>
                  <span className="text-sm text-fg-muted font-mono">{v.variant}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag variant={v.acmg}>
                    {v.acmg === 'pathogenic' && 'P'}
                    {v.acmg === 'likely-pathogenic' && 'LP'}
                    {v.acmg === 'vus' && 'VUS'}
                  </Tag>
                  <span className="text-xs text-fg-muted">{v.updatedAt}</span>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/knowledge/variants"
            className="block text-center text-sm text-accent-fg hover:underline mt-4"
          >
            查看全部 →
          </Link>
        </div>
      </div>
    </PageContent>
  );
}
