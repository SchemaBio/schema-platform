'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Eye, Download, FileText } from 'lucide-react';
import * as React from 'react';

interface Report {
  id: string;
  sampleId: string;
  patientName: string;
  reportType: string;
  status: 'draft' | 'pending_review' | 'approved' | 'released';
  variantCount: number;
  createdAt: string;
  createdBy: string;
  reviewedBy?: string;
}

const mockReports: Report[] = [
  {
    id: 'RPT-001',
    sampleId: 'S2024120001',
    patientName: '张**',
    reportType: '全外显子遗传病检测',
    status: 'released',
    variantCount: 3,
    createdAt: '2024-12-20',
    createdBy: '李医生',
    reviewedBy: '王主任',
  },
  {
    id: 'RPT-002',
    sampleId: 'S2024120002',
    patientName: '李**',
    reportType: '心血管疾病基因检测',
    status: 'approved',
    variantCount: 1,
    createdAt: '2024-12-22',
    createdBy: '张医生',
    reviewedBy: '王主任',
  },
  {
    id: 'RPT-003',
    sampleId: 'S2024120003',
    patientName: '王**',
    reportType: '全外显子遗传病检测',
    status: 'pending_review',
    variantCount: 5,
    createdAt: '2024-12-25',
    createdBy: '李医生',
  },
  {
    id: 'RPT-004',
    sampleId: 'S2024120004',
    patientName: '赵**',
    reportType: '全外显子遗传病检测',
    status: 'draft',
    variantCount: 2,
    createdAt: '2024-12-27',
    createdBy: '张医生',
  },
];

export default function ReportsListPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredReports = React.useMemo(() => {
    if (!searchQuery) return mockReports;
    const query = searchQuery.toLowerCase();
    return mockReports.filter(
      (r) =>
        r.id.toLowerCase().includes(query) ||
        r.sampleId.toLowerCase().includes(query) ||
        r.patientName.includes(query)
    );
  }, [searchQuery]);

  const getStatusTag = (status: Report['status']) => {
    switch (status) {
      case 'draft':
        return <Tag variant="neutral">草稿</Tag>;
      case 'pending_review':
        return <Tag variant="warning">待审核</Tag>;
      case 'approved':
        return <Tag variant="info">已审核</Tag>;
      case 'released':
        return <Tag variant="success">已发放</Tag>;
    }
  };

  const columns: Column<Report>[] = [
    { id: 'id', header: '报告编号', accessor: 'id', width: 120 },
    { id: 'sampleId', header: '样本编号', accessor: 'sampleId', width: 140 },
    { id: 'patientName', header: '患者', accessor: 'patientName', width: 80 },
    { id: 'reportType', header: '报告类型', accessor: 'reportType', width: 180 },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => getStatusTag(row.status),
      width: 100,
    },
    {
      id: 'variantCount',
      header: '报告变异',
      accessor: (row) => `${row.variantCount} 个`,
      width: 80,
    },
    { id: 'createdAt', header: '创建时间', accessor: 'createdAt', width: 120 },
    { id: 'createdBy', header: '创建者', accessor: 'createdBy', width: 80 },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="small" iconOnly aria-label="查看">
            <Eye className="w-4 h-4" />
          </Button>
          {row.status === 'released' && (
            <Button variant="ghost" size="small" iconOnly aria-label="下载">
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
      width: 100,
    },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">报告列表</h2>

      <div className="flex items-center justify-between mb-4">
        <div className="w-64">
          <Input
            placeholder="搜索报告..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <DataTable
        data={filteredReports}
        columns={columns}
        rowKey="id"
        density="default"
        striped
      />
    </PageContent>
  );
}
