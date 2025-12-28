'use client';

import { PageHeader, PageContent } from '@/components/layout';

export default function AnalysisPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="变异分析"
        description="查看和分析基因变异数据"
        breadcrumbs={[
          { label: '首页', href: '/' },
          { label: '变异分析' },
        ]}
      />
      <PageContent>
        <div className="rounded-lg border border-border bg-canvas-subtle p-8 text-center">
          <p className="text-fg-muted">变异列表将在这里显示</p>
        </div>
      </PageContent>
    </div>
  );
}
