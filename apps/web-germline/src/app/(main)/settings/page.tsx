'use client';

import { PageContent } from '@/components/layout';

export default function SettingsPage() {
  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">系统设置</h2>
      <div className="rounded-lg border border-border bg-canvas-subtle p-8 text-center">
        <p className="text-fg-muted">设置选项将在这里显示</p>
      </div>
    </PageContent>
  );
}
