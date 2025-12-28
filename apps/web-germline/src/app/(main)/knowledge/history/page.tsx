'use client';

import { useState } from 'react';
import { PageContent } from '@/components/layout';
import { Tag, DataTable, type Column } from '@schema/ui-kit';
import { Search, Download, Filter } from 'lucide-react';

interface HistoryVariant {
  id: string;
  sampleId: string;
  patientName: string;
  gene: string;
  chromosome: string;
  position: number;
  refAllele: string;
  altAllele: string;
  hgvsc: string;
  hgvsp: string;
  acmg: 'pathogenic' | 'likely-pathogenic' | 'vus' | 'likely-benign' | 'benign';
  zygosity: '杂合' | '纯合' | '半合子';
  reportDate: string;
  reportId: string;
  detectionCount: number;
}

// Mock data
const mockHistoryVariants: HistoryVariant[] = [
  {
    id: '1',
    sampleId: 'S2024120001',
    patientName: '张**',
    gene: 'BRCA1',
    chromosome: 'chr17',
    position: 43094464,
    refAllele: 'G',
    altAllele: 'GA',
    hgvsc: 'c.5266dupC',
    hgvsp: 'p.Gln1756ProfsTer74',
    acmg: 'pathogenic',
    zygosity: '杂合',
    reportDate: '2024-12-27',
    reportId: 'RPT-2024-0892',
    detectionCount: 3,
  },
  {
    id: '2',
    sampleId: 'S2024120015',
    patientName: '李**',
    gene: 'PKD1',
    chromosome: 'chr16',
    position: 2138710,
    refAllele: 'C',
    altAllele: 'T',
    hgvsc: 'c.12345G>A',
    hgvsp: 'p.Trp4115Ter',
    acmg: 'pathogenic',
    zygosity: '杂合',
    reportDate: '2024-12-26',
    reportId: 'RPT-2024-0891',
    detectionCount: 1,
  },
  {
    id: '3',
    sampleId: 'S2024120022',
    patientName: '王**',
    gene: 'MYH7',
    chromosome: 'chr14',
    position: 23893394,
    refAllele: 'G',
    altAllele: 'A',
    hgvsc: 'c.1208G>A',
    hgvsp: 'p.Arg403Gln',
    acmg: 'likely-pathogenic',
    zygosity: '杂合',
    reportDate: '2024-12-25',
    reportId: 'RPT-2024-0890',
    detectionCount: 5,
  },
  {
    id: '4',
    sampleId: 'S2024120030',
    patientName: '赵**',
    gene: 'SCN5A',
    chromosome: 'chr3',
    position: 38592065,
    refAllele: 'C',
    altAllele: 'T',
    hgvsc: 'c.4850C>T',
    hgvsp: 'p.Thr1617Met',
    acmg: 'vus',
    zygosity: '杂合',
    reportDate: '2024-12-24',
    reportId: 'RPT-2024-0889',
    detectionCount: 2,
  },
  {
    id: '5',
    sampleId: 'S2024120045',
    patientName: '陈**',
    gene: 'LDLR',
    chromosome: 'chr19',
    position: 11224088,
    refAllele: 'G',
    altAllele: 'A',
    hgvsc: 'c.682G>A',
    hgvsp: 'p.Glu228Lys',
    acmg: 'likely-pathogenic',
    zygosity: '杂合',
    reportDate: '2024-12-23',
    reportId: 'RPT-2024-0888',
    detectionCount: 8,
  },
];

const acmgLabels: Record<string, string> = {
  pathogenic: '致病 (P)',
  'likely-pathogenic': '可能致病 (LP)',
  vus: '意义未明 (VUS)',
  'likely-benign': '可能良性 (LB)',
  benign: '良性 (B)',
};

export default function HistoryVariantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [acmgFilter, setAcmgFilter] = useState<string>('all');

  const columns: Column<HistoryVariant>[] = [
    { id: 'gene', header: '基因', accessor: 'gene', width: 100, sortable: true },
    { id: 'hgvsc', header: 'HGVSc', accessor: 'hgvsc', width: 160 },
    { id: 'hgvsp', header: 'HGVSp', accessor: 'hgvsp', width: 180 },
    {
      id: 'acmg',
      header: 'ACMG',
      accessor: (row) => <Tag variant={row.acmg}>{acmgLabels[row.acmg]}</Tag>,
      width: 130,
      sortable: true,
    },
    { id: 'zygosity', header: '杂合性', accessor: 'zygosity', width: 80 },
    { id: 'sampleId', header: '样本编号', accessor: 'sampleId', width: 130 },
    { id: 'patientName', header: '患者', accessor: 'patientName', width: 80 },
    { id: 'reportDate', header: '报告日期', accessor: 'reportDate', width: 110, sortable: true },
    {
      id: 'detectionCount',
      header: '检出次数',
      accessor: (row) => (
        <span className="px-2 py-0.5 bg-accent-subtle text-accent-fg rounded text-xs">
          {row.detectionCount}
        </span>
      ),
      width: 90,
      sortable: true,
    },
    {
      id: 'actions',
      header: '操作',
      accessor: () => (
        <button className="text-sm text-accent-fg hover:underline">详情</button>
      ),
      width: 80,
    },
  ];

  const filteredData = mockHistoryVariants.filter((v) => {
    const matchesSearch =
      searchTerm === '' ||
      v.gene.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.hgvsc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.sampleId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAcmg = acmgFilter === 'all' || v.acmg === acmgFilter;
    return matchesSearch && matchesAcmg;
  });

  return (
    <PageContent>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-fg-default">历史检出位点</h2>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-canvas-subtle border border-border rounded-md hover:bg-canvas-inset transition-colors">
          <Download className="w-4 h-4" />
          导出
        </button>
      </div>

      <p className="text-sm text-fg-muted mb-4">
        记录所有在报告中检出的致病/可能致病/VUS位点，便于追溯和统计分析。
      </p>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
          <input
            type="text"
            placeholder="搜索基因、变异、样本编号..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-fg-muted" />
          <select
            value={acmgFilter}
            onChange={(e) => setAcmgFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
          >
            <option value="all">全部分类</option>
            <option value="pathogenic">致病 (P)</option>
            <option value="likely-pathogenic">可能致病 (LP)</option>
            <option value="vus">意义未明 (VUS)</option>
            <option value="likely-benign">可能良性 (LB)</option>
            <option value="benign">良性 (B)</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-4 text-sm text-fg-muted">
        <span>共 {filteredData.length} 条记录</span>
        <span>
          致病: {filteredData.filter((v) => v.acmg === 'pathogenic').length}
        </span>
        <span>
          可能致病: {filteredData.filter((v) => v.acmg === 'likely-pathogenic').length}
        </span>
        <span>
          VUS: {filteredData.filter((v) => v.acmg === 'vus').length}
        </span>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        rowKey="id"
        density="default"
        striped
        stickyHeader
      />
    </PageContent>
  );
}
