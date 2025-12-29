'use client';

import { PageContent } from '@/components/layout';
import { Button, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import * as React from 'react';

interface PendingReport {
  id: string;
  sampleId: string;
  patientName: string;
  reportType: string;
  variantCount: number;
  createdAt: string;
  createdBy: string;
  urgency: 'normal' | 'urgent';
}

const mockPendingReports: PendingReport[] = [
  {
    id: 'RPT-003',
    sampleId: 'S2024120003',
    patientName: '王**',
    reportType: '全外显子遗传病检测',
    variantCount: 5,
    createdAt: '2024-12-25',
    createdBy: '李医生',
    urgency: 'urgent',
  },
  {
    id: 'RPT-005',
    sampleId: 'S2024120005',
    patientName: '陈**',
    reportType: '心血管疾病基因检测',
    variantCount: 2,
    createdAt: '2024-12-26',
    createdBy: '张医生',
    urgency: 'normal',
  },
];

export default function ReportsReviewPage() {
  const columns: Column<PendingReport>[] = [
    { id: 'id', header: '报告编号', accessor: 'id', width: 120 },
    { id: 'sampleId', header: '样本编号', accessor: 'sampleId', width: 140 },
    { id: 'patientName', header: '患者', accessor: 'patientName', width: 80 },
    { id: 'reportType', header: '报告类型', accessor: 'reportType', width: 180 },
    {
      id: 'urgency',
      header: '紧急程度',
      accessor: (row) => (
        <Tag variant={row.urgency === 'urgent' ? 'danger' : 'neutral'}>
          {row.urgency === 'urgent' ? '加急' : '普通'}
        </Tag>
      ),
      width: 80,
    },
    {
      id: 'variantCount',
      header: '报告变异',
      accessor: (row) => `${row.variantCount} 个`,
      width: 80,
    },
    { id: 'createdAt', header: '提交时间', accessor: 'createdAt', width: 120 },
    { id: 'createdBy', header: '提交者', accessor: 'createdBy', width: 80 },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="small" iconOnly aria-label="查看">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="small" iconOnly aria-label="通过">
            <CheckCircle className="w-4 h-4 text-success-fg" />
          </Button>
          <Button variant="ghost" size="small" iconOnly aria-label="退回">
            <XCircle className="w-4 h-4 text-danger-fg" />
          </Button>
        </div>
      ),
      width: 120,
    },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">待审核报告</h2>

      {mockPendingReports.length === 0 ? (
        <div className="rounded-lg border border-border bg-canvas-subtle p-8 text-center">
          <p className="text-fg-muted">暂无待审核的报告</p>
        </div>
      ) : (
        <>
          <div className="p-3 bg-warning-subtle border border-warning-emphasis rounded-lg mb-4">
            <p className="text-sm text-warning-fg">
              您有 {mockPendingReports.length} 份报告待审核，其中 {mockPendingReports.filter(r => r.urgency === 'urgent').length} 份为加急报告
            </p>
          </div>
          <DataTable
            data={mockPendingReports}
            columns={columns}
            rowKey="id"
            density="default"
            striped
          />
        </>
      )}
    </PageContent>
  );
}
