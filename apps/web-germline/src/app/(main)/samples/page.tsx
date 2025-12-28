'use client';

import { PageHeader, PageContent } from '@/components/layout';
import { Button } from '@schema/ui-kit';

export default function SamplesPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="样本管理"
        description="管理和查看所有样本信息"
        breadcrumbs={[
          { label: '首页', href: '/' },
          { label: '样本管理' },
        ]}
        actions={
          <Button variant="primary" size="medium">
            新建样本
          </Button>
        }
      />
      <PageContent>
        <div className="rounded-lg border border-border bg-canvas-subtle p-8 text-center">
          <p className="text-fg-muted">样本列表将在这里显示</p>
        </div>
      </PageContent>
    </div>
  );
}
