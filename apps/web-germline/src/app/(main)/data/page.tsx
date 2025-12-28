'use client';

import { PageContent } from '@/components/layout';
import { Button } from '@schema/ui-kit';

export default function DataPage() {
  return (
    <PageContent>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-fg-default">数据列表</h2>
        <Button variant="primary" size="medium">
          导入数据
        </Button>
      </div>
      <div className="rounded-lg border border-border bg-canvas-subtle p-8 text-center">
        <p className="text-fg-muted">数据列表将在这里显示</p>
      </div>
    </PageContent>
  );
}
