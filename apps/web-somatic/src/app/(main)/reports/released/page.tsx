'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Eye, Download, Send } from 'lucide-react';
import * as React from 'react';

interface ReleasedReport {
  id: string;
  sampleId: string;
  patientName: string;
  reportType: string;
  variantCount: number;
  releasedAt: string;
  releasedBy: string;
  downloadCount: number;
}

const mockReleasedReports: ReleasedReport[] = [
  {
    id: 'RPT-001',
    sampleId: 'S2024120001',
    patientName: '张**',
    reportType: '全外显子遗传病检测',
    variantCount: 3,
    releasedAt: '2024-12-21',
    releasedBy: '王主任',
    downloadCount: 2,
  },
  {
    id: 'RPT-006',
    sampleId: 'S2024110015',
    patientName: '刘**',
    reportType: '全外显子遗传病检测',
    variantCount: 1,
    releasedAt: '2024-12-15',
    releasedBy: '王主任',
    downloadCount: 5,
  },
];

export default function ReportsReleasedPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredReports = React.useMemo(() => {
    if (!searchQuery) return mockReleasedReports;
    const query = searchQuery.toLowerCase();
    return mockReleasedReports.filter(
      (r) =>
        r.id.toLowerCase().includes(query) ||
        r.sampleId.toLowerCase().includes(query) ||
        r.patientName.includes(query)
    );
  }, [searchQuery]);

  const columns: Column<ReleasedReport>[] = [
    { id: 'id', header: '报告编号', accessor: 'id', width: 120 },
    { id: 'sampleId', header: '样本编号', accessor: 'sampleId', width: 140 },
    { id: 'patientName', header: '患者', accessor: 'patientName', width: 80 },
    { id: 'reportType', header: '报告类型', accessor: 'reportType', width: 180 },
    {
      id: 'variantCount',
      header: '报告变异',
      accessor: (row) => `${row.variantCount} 个`,
      width: 80,
    },
    { id: 'releasedAt', header: '发放时间', accessor: 'releasedAt', width: 120 },
    { id: 'releasedBy', header: '审核人', accessor: 'releasedBy', width: 80 },
    {
      id: 'downloadCount',
      header: '下载次数',
      accessor: (row) => `${row.downloadCount} 次`,
      width: 80,
    },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="small" iconOnly aria-label="查看">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="small" iconOnly aria-label="下载">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="small" iconOnly aria-label="发送">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      ),
      width: 120,
    },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">已发放报告</h2>

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
