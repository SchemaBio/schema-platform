'use client';

import { PageContent } from '@/components/layout';
import { Tag } from '@schema/ui-kit';
import { History, Library, TrendingUp, FileText, Pill, Target, Dna } from 'lucide-react';
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
    title: '靶向药物位点',
    value: '2,156',
    description: '收录的靶向药物相关突变位点',
    icon: <Target className="w-5 h-5" />,
    href: '/knowledge/variants',
    trend: { value: 45, label: '本月新增' },
  },
  {
    title: '靶向药物',
    value: '186',
    description: '已获批或临床试验中的靶向药物',
    icon: <Pill className="w-5 h-5" />,
    href: '/knowledge/variants',
    trend: { value: 8, label: '本月新增' },
  },
  {
    title: '临床证据',
    value: '4,892',
    description: '药物-突变关联的临床证据条目',
    icon: <FileText className="w-5 h-5" />,
    href: '/knowledge/variants',
    trend: { value: 156, label: '本月新增' },
  },
  {
    title: '关联文献',
    value: '8,234',
    description: '靶向治疗相关的参考文献',
    icon: <Library className="w-5 h-5" />,
    href: '/knowledge/variants',
  },
];

// 证据等级统计
const evidenceLevelStats = [
  { label: 'A级 (FDA获批)', count: 156, color: 'bg-green-500' },
  { label: 'B级 (临床指南)', count: 423, color: 'bg-blue-500' },
  { label: 'C级 (临床研究)', count: 892, color: 'bg-yellow-500' },
  { label: 'D级 (病例报告)', count: 456, color: 'bg-orange-500' },
  { label: 'E级 (临床前研究)', count: 229, color: 'bg-gray-400' },
];

// 热门靶点基因
const hotGenes = [
  { gene: 'EGFR', variantCount: 156, drugCount: 12 },
  { gene: 'ALK', variantCount: 45, drugCount: 8 },
  { gene: 'KRAS', variantCount: 89, drugCount: 6 },
  { gene: 'BRAF', variantCount: 67, drugCount: 9 },
  { gene: 'HER2', variantCount: 78, drugCount: 11 },
  { gene: 'ROS1', variantCount: 34, drugCount: 5 },
  { gene: 'MET', variantCount: 56, drugCount: 7 },
  { gene: 'RET', variantCount: 42, drugCount: 4 },
];

// 最近更新的位点
const recentVariants = [
  {
    id: '1',
    gene: 'EGFR',
    variant: 'L858R',
    drugs: ['奥希替尼', '吉非替尼'],
    evidenceLevel: 'A',
    tumorType: '非小细胞肺癌',
    updatedAt: '2024-12-27',
  },
  {
    id: '2',
    gene: 'KRAS',
    variant: 'G12C',
    drugs: ['索托拉西布', '阿达格拉西布'],
    evidenceLevel: 'A',
    tumorType: '非小细胞肺癌',
    updatedAt: '2024-12-26',
  },
  {
    id: '3',
    gene: 'BRAF',
    variant: 'V600E',
    drugs: ['达拉非尼+曲美替尼'],
    evidenceLevel: 'A',
    tumorType: '黑色素瘤',
    updatedAt: '2024-12-25',
  },
  {
    id: '4',
    gene: 'ALK',
    variant: 'EML4-ALK融合',
    drugs: ['阿来替尼', '布格替尼'],
    evidenceLevel: 'A',
    tumorType: '非小细胞肺癌',
    updatedAt: '2024-12-24',
  },
];

const evidenceLevelColors: Record<string, string> = {
  A: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  B: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  C: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  D: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  E: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export default function KnowledgeOverviewPage() {
  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">知识库概览</h2>

      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-6">
        <p className="text-sm text-fg-muted">
          肿瘤靶向药物知识库，收录靶向药物相关的突变位点、药物敏感性/耐药性信息、临床证据等级及相关文献。
          支持基于检出突变快速匹配可用靶向药物及临床试验信息。
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 证据等级分布 */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-4">证据等级分布</h3>
          <div className="space-y-3">
            {evidenceLevelStats.map((item) => {
              const total = evidenceLevelStats.reduce((sum, i) => sum + i.count, 0);
              const percentage = ((item.count / total) * 100).toFixed(1);
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-fg-muted w-28 shrink-0">{item.label}</span>
                  <div className="flex-1">
                    <div className="h-2 bg-canvas-inset rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-fg-muted w-16 text-right">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-fg-subtle mt-4">
            证据等级参考 OncoKB / CIViC 分级标准
          </p>
        </div>

        {/* 热门靶点基因 */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-4">热门靶点基因</h3>
          <div className="space-y-2">
            {hotGenes.map((item) => (
              <div
                key={item.gene}
                className="flex items-center justify-between p-2 rounded-md hover:bg-canvas-subtle transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Dna className="w-4 h-4 text-fg-muted" />
                  <span className="font-medium text-fg-default">{item.gene}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-fg-muted">
                  <span>{item.variantCount} 位点</span>
                  <span>{item.drugCount} 药物</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近更新 */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-4">最近更新</h3>
          <div className="space-y-3">
            {recentVariants.map((v) => (
              <div
                key={v.id}
                className="p-2 rounded-md hover:bg-canvas-subtle transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-fg-default">{v.gene}</span>
                    <span className="text-sm text-fg-muted">{v.variant}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${evidenceLevelColors[v.evidenceLevel]}`}>
                    {v.evidenceLevel}级
                  </span>
                </div>
                <div className="text-xs text-fg-muted">
                  {v.tumorType} · {v.drugs.join(', ')}
                </div>
                <div className="text-xs text-fg-subtle mt-1">{v.updatedAt}</div>
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
