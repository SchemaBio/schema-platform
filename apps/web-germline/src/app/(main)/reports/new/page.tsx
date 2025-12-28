'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, Select, FormItem } from '@schema/ui-kit';
import { FileText, Search } from 'lucide-react';
import * as React from 'react';

export default function NewReportPage() {
  const [selectedSample, setSelectedSample] = React.useState('');
  const [reportType, setReportType] = React.useState('wes');

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">生成报告</h2>

      <div className="max-w-2xl space-y-6">
        <div className="p-4 bg-canvas-subtle rounded-lg border border-border">
          <p className="text-sm text-fg-muted">
            选择已完成分析的样本，生成检测报告。报告生成后需经审核方可发放。
          </p>
        </div>

        <FormItem label="选择样本" required>
          <Select
            options={[
              { value: 'S2024120004', label: 'S2024120004 - 赵** (分析完成)' },
              { value: 'S2024120005', label: 'S2024120005 - 陈** (分析完成)' },
              { value: 'S2024120006', label: 'S2024120006 - 周** (分析完成)' },
            ]}
            value={selectedSample}
            onChange={(v) => setSelectedSample(v as string)}
            placeholder="请选择样本"
            searchable
          />
        </FormItem>

        <FormItem label="报告类型" required>
          <Select
            options={[
              { value: 'wes', label: '全外显子遗传病检测报告' },
              { value: 'panel', label: '基因Panel检测报告' },
              { value: 'carrier', label: '携带者筛查报告' },
            ]}
            value={reportType}
            onChange={(v) => setReportType(v as string)}
          />
        </FormItem>

        {selectedSample && (
          <div className="p-4 bg-canvas-subtle rounded-lg border border-border">
            <h4 className="text-sm font-medium text-fg-default mb-2">样本信息</h4>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-fg-muted">样本编号</dt>
                <dd className="text-fg-default">{selectedSample}</dd>
              </div>
              <div>
                <dt className="text-fg-muted">患者姓名</dt>
                <dd className="text-fg-default">赵**</dd>
              </div>
              <div>
                <dt className="text-fg-muted">检测项目</dt>
                <dd className="text-fg-default">全外显子测序</dd>
              </div>
              <div>
                <dt className="text-fg-muted">候选变异</dt>
                <dd className="text-fg-default">12 个</dd>
              </div>
            </dl>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <Button
            variant="primary"
            leftIcon={<FileText className="w-4 h-4" />}
            disabled={!selectedSample}
          >
            生成报告
          </Button>
        </div>
      </div>
    </PageContent>
  );
}
