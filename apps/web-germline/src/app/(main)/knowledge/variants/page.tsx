'use client';

import { useState } from 'react';
import { PageContent } from '@/components/layout';
import { Tag, DataTable, type Column } from '@schema/ui-kit';
import { Search, Download, Filter, Plus, ExternalLink, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface KnowledgeVariant {
  id: string;
  gene: string;
  chromosome: string;
  position: number;
  refAllele: string;
  altAllele: string;
  hgvsc: string;
  hgvsp: string;
  acmg: 'pathogenic' | 'likely-pathogenic' | 'vus' | 'likely-benign' | 'benign';
  clinvarId?: string;
  rsId?: string;
  disease: string;
  inheritance: string;
  literatureCount: number;
  lastReviewed: string;
  source: 'ClinVar' | '内部收录' | '文献';
}

// Mock data - ClinVar-like format
const mockVariants: KnowledgeVariant[] = [
  {
    id: '1',
    gene: 'BRCA1',
    chromosome: 'chr17',
    position: 43094464,
    refAllele: 'G',
    altAllele: 'GA',
    hgvsc: 'c.5266dupC',
    hgvsp: 'p.Gln1756ProfsTer74',
    acmg: 'pathogenic',
    clinvarId: 'VCV000017661',
    rsId: 'rs80357906',
    disease: '遗传性乳腺癌-卵巢癌综合征',
    inheritance: 'AD',
    literatureCount: 156,
    lastReviewed: '2024-12-15',
    source: 'ClinVar',
  },
  {
    id: '2',
    gene: 'BRCA2',
    chromosome: 'chr13',
    position: 32914438,
    refAllele: 'GT',
    altAllele: 'G',
    hgvsc: 'c.5946delT',
    hgvsp: 'p.Ser1982ArgfsTer22',
    acmg: 'pathogenic',
    clinvarId: 'VCV000051065',
    rsId: 'rs80359550',
    disease: '遗传性乳腺癌-卵巢癌综合征',
    inheritance: 'AD',
    literatureCount: 89,
    lastReviewed: '2024-11-20',
    source: 'ClinVar',
  },
  {
    id: '3',
    gene: 'PKD1',
    chromosome: 'chr16',
    position: 2138710,
    refAllele: 'C',
    altAllele: 'T',
    hgvsc: 'c.12345G>A',
    hgvsp: 'p.Trp4115Ter',
    acmg: 'pathogenic',
    clinvarId: 'VCV000234567',
    disease: '常染色体显性多囊肾病',
    inheritance: 'AD',
    literatureCount: 23,
    lastReviewed: '2024-10-08',
    source: 'ClinVar',
  },
  {
    id: '4',
    gene: 'MYH7',
    chromosome: 'chr14',
    position: 23893394,
    refAllele: 'G',
    altAllele: 'A',
    hgvsc: 'c.1208G>A',
    hgvsp: 'p.Arg403Gln',
    acmg: 'likely-pathogenic',
    clinvarId: 'VCV000014094',
    rsId: 'rs121913626',
    disease: '肥厚型心肌病',
    inheritance: 'AD',
    literatureCount: 245,
    lastReviewed: '2024-12-01',
    source: 'ClinVar',
  },
  {
    id: '5',
    gene: 'SCN5A',
    chromosome: 'chr3',
    position: 38592065,
    refAllele: 'C',
    altAllele: 'T',
    hgvsc: 'c.4850C>T',
    hgvsp: 'p.Thr1617Met',
    acmg: 'vus',
    rsId: 'rs199473547',
    disease: 'Brugada综合征',
    inheritance: 'AD',
    literatureCount: 12,
    lastReviewed: '2024-09-15',
    source: '内部收录',
  },
  {
    id: '6',
    gene: 'LDLR',
    chromosome: 'chr19',
    position: 11224088,
    refAllele: 'G',
    altAllele: 'A',
    hgvsc: 'c.682G>A',
    hgvsp: 'p.Glu228Lys',
    acmg: 'likely-pathogenic',
    clinvarId: 'VCV000003456',
    disease: '家族性高胆固醇血症',
    inheritance: 'AD',
    literatureCount: 67,
    lastReviewed: '2024-11-10',
    source: 'ClinVar',
  },
  {
    id: '7',
    gene: 'CFTR',
    chromosome: 'chr7',
    position: 117559593,
    refAllele: 'CTT',
    altAllele: 'C',
    hgvsc: 'c.1521_1523delCTT',
    hgvsp: 'p.Phe508del',
    acmg: 'pathogenic',
    clinvarId: 'VCV000007107',
    rsId: 'rs113993960',
    disease: '囊性纤维化',
    inheritance: 'AR',
    literatureCount: 892,
    lastReviewed: '2024-12-20',
    source: 'ClinVar',
  },
];

const acmgLabels: Record<string, string> = {
  pathogenic: '致病 (P)',
  'likely-pathogenic': '可能致病 (LP)',
  vus: '意义未明 (VUS)',
  'likely-benign': '可能良性 (LB)',
  benign: '良性 (B)',
};

const sourceColors: Record<string, string> = {
  ClinVar: 'bg-blue-100 text-blue-700',
  '内部收录': 'bg-green-100 text-green-700',
  '文献': 'bg-purple-100 text-purple-700',
};

export default function VariantsLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [acmgFilter, setAcmgFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const columns: Column<KnowledgeVariant>[] = [
    { id: 'gene', header: '基因', accessor: 'gene', width: 90, sortable: true },
    { id: 'hgvsc', header: 'HGVSc', accessor: 'hgvsc', width: 160 },
    { id: 'hgvsp', header: 'HGVSp', accessor: 'hgvsp', width: 180 },
    {
      id: 'acmg',
      header: 'ACMG',
      accessor: (row) => <Tag variant={row.acmg}>{acmgLabels[row.acmg]}</Tag>,
      width: 130,
      sortable: true,
    },
    {
      id: 'disease',
      header: '相关疾病',
      accessor: 'disease',
      width: 200,
    },
    {
      id: 'inheritance',
      header: '遗传模式',
      accessor: 'inheritance',
      width: 80,
    },
    {
      id: 'clinvarId',
      header: 'ClinVar',
      accessor: (row) =>
        row.clinvarId ? (
          <a
            href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${row.clinvarId.replace('VCV', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-fg hover:underline flex items-center gap-1"
          >
            {row.clinvarId}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-fg-muted">-</span>
        ),
      width: 140,
    },
    {
      id: 'literatureCount',
      header: '文献',
      accessor: (row) => (
        <span className="flex items-center gap-1 text-fg-muted">
          <BookOpen className="w-3 h-3" />
          {row.literatureCount}
        </span>
      ),
      width: 70,
      sortable: true,
    },
    {
      id: 'source',
      header: '来源',
      accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs ${sourceColors[row.source]}`}>
          {row.source}
        </span>
      ),
      width: 90,
    },
    {
      id: 'lastReviewed',
      header: '更新日期',
      accessor: 'lastReviewed',
      width: 100,
      sortable: true,
    },
    {
      id: 'actions',
      header: '操作',
      accessor: () => (
        <div className="flex items-center gap-2">
          <button className="text-sm text-accent-fg hover:underline">详情</button>
          <button className="text-sm text-accent-fg hover:underline">编辑</button>
        </div>
      ),
      width: 100,
    },
  ];

  const filteredData = mockVariants.filter((v) => {
    const matchesSearch =
      searchTerm === '' ||
      v.gene.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.hgvsc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.clinvarId && v.clinvarId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAcmg = acmgFilter === 'all' || v.acmg === acmgFilter;
    const matchesSource = sourceFilter === 'all' || v.source === sourceFilter;
    return matchesSearch && matchesAcmg && matchesSource;
  });

  return (
    <PageContent>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-fg-default">位点收录库</h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-canvas-subtle border border-border rounded-md hover:bg-canvas-inset transition-colors">
            <Download className="w-4 h-4" />
            导出
          </button>
          <Link
            href="/knowledge/new"
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent-emphasis text-fg-on-emphasis rounded-md hover:bg-accent-emphasis/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新增位点
          </Link>
        </div>
      </div>

      <p className="text-sm text-fg-muted mb-4">
        收录已知致病位点及其ACMG评级、相关文献、ClinVar信息等，类似ClinVar格式的本地知识库。
      </p>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
          <input
            type="text"
            placeholder="搜索基因、变异、疾病、ClinVar ID..."
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
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
          >
            <option value="all">全部来源</option>
            <option value="ClinVar">ClinVar</option>
            <option value="内部收录">内部收录</option>
            <option value="文献">文献</option>
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
