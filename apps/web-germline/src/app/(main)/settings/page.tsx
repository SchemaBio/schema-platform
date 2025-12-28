'use client';

import { PageHeader, PageContent } from '@/components/layout';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="系统设置"
        description="管理个人设置和系统配置"
        breadcrumbs={[
          { label: '首页', href: '/' },
          { label: '设置' },
        ]}
      />
      <PageContent>
        <div className="rounded-lg border border-border bg-canvas-subtle p-8 text-center">
          <p className="text-fg-muted">设置选项将在这里显示</p>
        </div>
      </PageContent>
    </div>
  );
}
