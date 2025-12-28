'use client';

import { PageHeader, PageContent } from '@/components/layout';

export default function KnowledgePage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="知识库"
        description="基因-疾病关联和解读资源"
        breadcrumbs={[
          { label: '首页', href: '/' },
          { label: '知识库' },
        ]}
      />
      <PageContent>
        <div className="rounded-lg border border-border bg-canvas-subtle p-8 text-center">
          <p className="text-fg-muted">知识库内容将在这里显示</p>
        </div>
      </PageContent>
    </div>
  );
}
