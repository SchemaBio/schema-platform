'use client';

import { PageHeader, PageContent } from '@/components/layout';
import { Button } from '@schema/ui-kit';

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="报告中心"
        description="管理和生成分析报告"
        breadcrumbs={[
          { label: '首页', href: '/' },
          { label: '报告中心' },
        ]}
        actions={
          <Button variant="primary" size="medium">
            新建报告
          </Button>
        }
      />
      <PageContent>
        <div className="rounded-lg border border-border bg-canvas-subtle p-8 text-center">
          <p className="text-fg-muted">报告列表将在这里显示</p>
        </div>
      </PageContent>
    </div>
  );
}
