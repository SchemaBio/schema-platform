'use client';

import { useState } from 'react';
import { PageContent } from '@/components/layout';
import { Tag, DataTable, type Column } from '@schema/ui-kit';
import { Search, Download, Filter, Plus, ExternalLink, Pill, Target } from 'lucide-react';
import Link from 'next/link';

type EvidenceLevel = 'A' | 'B' | 'C' | 'D' | 'E';
type DrugResponse = 'sensitive' | 'resistant' | 'unknown';

interface TargetedVariant {
  id: string;
  gene: string;
  variant: string;
  variantType: 'SNV' | 'Fusion' | 'CNV' | 'Insertion' | 'Deletion';
  drugs: string[];
  drugResponse: DrugResponse;
  evidenceLevel: EvidenceLevel;
  tumorTypes: string[];
  oncokbId?: string;
  civicId?: string;
  literatureCount: number;
  lastReviewed: string;
  source: 'OncoKB' | 'CIViC' | '内部收录' | 'FDA';
}

const mockVariants: TargetedVariant[] = [
  {
    id: '1',
    gene: 'EGFR',
    variant: 'L858R',
    variantType: 'SNV',
    drugs: ['奥希替尼', '吉非替尼', '厄洛替尼', '阿法替尼'],
    drugResponse: 'sensitive',
    evidenceLevel: 'A',
    tumorTypes: ['非小细胞肺癌'],
    oncokbId: 'EGFR L858R',
    literatureCount: 892,
    lastReviewed: '2024-12-20',
    source: 'OncoKB',
  },
  {
    id: '2',
    gene: 'EGFR',
    variant: 'Exon 19 del',
    variantType: 'Deletion',
    drugs: ['奥希替尼', '吉非替尼', '厄洛替尼'],
    drugResponse: 'sensitive',
    evidenceLevel: 'A',
    tumorTypes: ['非小细胞肺癌'],
    oncokbId: 'EGFR Exon 19 del',
    literatureCount: 756,
    lastReviewed: '2024-12-18',
    source: 'OncoKB',
  },
  {
    id: '3',
    gene: 'EGFR',
    variant: 'T790M',
    variantType: 'SNV',
    drugs: ['奥希替尼'],
    drugResponse: 'sensitive',
    evidenceLevel: 'A',
    tumorTypes: ['非小细胞肺癌'],
    oncokbId: 'EGFR T790M',
    literatureCount: 534,
    lastReviewed: '2024-12-15',
    source: 'OncoKB',
  },
  {
    id: '4',
    gene: 'EGFR',
    variant: 'C797S',
    variantType: 'SNV',
    drugs: ['奥希替尼'],
    drugResponse: 'resistant',
    evidenceLevel: 'A',
    tumorTypes: ['非小细胞肺癌'],
    literatureCount: 234,
    lastReviewed: '2024-12-10',
    source: 'CIViC',
  },
  {
    id: '5',
    gene: 'KRAS',
    variant: 'G12C',
    variantType: 'SNV',
    drugs: ['索托拉西布', '阿达格拉西布'],
    drugResponse: 'sensitive',
    evidenceLevel: 'A',
    tumorTypes: ['非小细胞肺癌', '结直肠癌'],
    oncokbId: 'KRAS G12C',
    literatureCount: 456,
    lastReviewed: '2024-12-22',
    source: 'FDA',
  },
  {
    id: '6',
    gene: 'BRAF',
    variant: 'V600E',
    variantType: 'SNV',
    drugs: ['达拉非尼', '维莫非尼', '康奈非尼'],
    drugResponse: 'sensitive',
    evidenceLevel: 'A',
    tumorTypes: ['黑色素瘤', '非小细胞肺癌', '结直肠癌'],
    oncokbId: 'BRAF V600E',
    literatureCount: 1234,
    lastReviewed: '2024-12-25',
    source: 'OncoKB',
  },
  {
    id: '7',
    gene: 'ALK',
    variant: 'EML4-ALK融合',
    variantType: 'Fusion',
    drugs: ['阿来替尼', '布格替尼', '克唑替尼', '洛拉替尼'],
    drugResponse: 'sensitive',
    evidenceLevel: 'A',
    tumorTypes: ['非小细胞肺癌'],
    oncokbId: 'ALK Fusion',
    literatureCount: 678,
    lastReviewed: '2024-12-20',
    source: 'OncoKB',
  },
  {
    id: '8',
    gene: 'ALK',
    variant: 'G1202R',
    variantType: 'SNV',
    drugs: ['洛拉替尼'],
    drugResponse: 'sensitive',
    evidenceLevel: 'B',
    tumorTypes: ['非小细胞肺癌'],
    literatureCount: 89,
    lastReviewed: '2024-12-15',
    source: 'CIViC',
  },
  {
    id: '9',
    gene: 'HER2',
    variant: '扩增',
    variantType: 'CNV',
    drugs: ['曲妥珠单抗', '帕妥珠单抗', 'T-DM1', 'T-DXd'],
    drugResponse: 'sensitive',
    evidenceLevel: 'A',
    tumorTypes: ['乳腺癌', '胃癌'],
    oncokbId: 'ERBB2 Amplification',
    literatureCount: 2345,
    lastReviewed: '2024-12-28',
    source: 'FDA',
  },
  {
    id: '10',
    gene: 'ROS1',
    variant: 'CD74-ROS1融合',
    variantType: 'Fusion',
    drugs: ['克唑替尼', '恩曲替尼'],
    drugResponse: 'sensitive',
    evidenceLevel: 'A',
    tumorTypes: ['非小细胞肺癌'],
    oncokbId: 'ROS1 Fusion',
    literatureCount: 234,
    lastReviewed: '2024-12-18',
    source: 'OncoKB',
  },
  {
    id: '11',
    gene: 'MET',
    variant: 'Exon 14 skipping',
    variantType: 'Deletion',
    drugs: ['卡马替尼', '特泊替尼'],
    drugResponse: 'sensitive',
    evidenceLevel: 'A',
    tumorTypes: ['非小细胞肺癌'],
    oncokbId: 'MET Exon 14',
    literatureCount: 178,
    lastReviewed: '2024-12-16',
    source: 'FDA',
  },
  {
    id: '12',
    gene: 'RET',
    variant: 'KIF5B-RET融合',
    variantType: 'Fusion',
    drugs: ['塞尔帕替尼', '普拉替尼'],
    drugResponse: 'sensitive',
    evidenceLevel: 'A',
    tumorTypes: ['非小细胞肺癌', '甲状腺癌'],
    oncokbId: 'RET Fusion',
    literatureCount: 156,
    lastReviewed: '2024-12-14',
    source: 'OncoKB',
  },
];

const evidenceLevelLabels: Record<EvidenceLevel, string> = {
  A: 'A级 (FDA获批)',
  B: 'B级 (临床指南)',
  C: 'C级 (临床研究)',
  D: 'D级 (病例报告)',
  E: 'E级 (临床前)',
};

const evidenceLevelColors: Record<EvidenceLevel, string> = {
  A: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  B: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  C: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  D: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  E: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

const drugResponseLabels: Record<DrugResponse, { label: string; color: string }> = {
  sensitive: { label: '敏感', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  resistant: { label: '耐药', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  unknown: { label: '未知', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
};

const sourceColors: Record<string, string> = {
  OncoKB: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  CIViC: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  FDA: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '内部收录': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};


export default function VariantsLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('all');
  const [responseFilter, setResponseFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const columns: Column<TargetedVariant>[] = [
    { id: 'gene', header: '基因', accessor: 'gene', width: 80, sortable: true },
    { 
      id: 'variant', 
      header: '变异', 
      accessor: (row) => (
        <div>
          <span className="font-mono text-sm">{row.variant}</span>
          <span className="ml-2 text-xs text-fg-muted">({row.variantType})</span>
        </div>
      ),
      width: 180 
    },
    {
      id: 'drugResponse',
      header: '药物反应',
      accessor: (row) => {
        const response = drugResponseLabels[row.drugResponse];
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${response.color}`}>
            {response.label}
          </span>
        );
      },
      width: 80,
    },
    {
      id: 'drugs',
      header: '相关药物',
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.drugs.slice(0, 2).map((drug, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-canvas-subtle rounded text-xs text-fg-default">
              {drug}
            </span>
          ))}
          {row.drugs.length > 2 && (
            <span className="px-1.5 py-0.5 text-xs text-fg-muted">
              +{row.drugs.length - 2}
            </span>
          )}
        </div>
      ),
      width: 200,
    },
    {
      id: 'evidenceLevel',
      header: '证据等级',
      accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${evidenceLevelColors[row.evidenceLevel]}`}>
          {row.evidenceLevel}级
        </span>
      ),
      width: 80,
      sortable: true,
    },
    {
      id: 'tumorTypes',
      header: '适应瘤种',
      accessor: (row) => (
        <span className="text-sm text-fg-muted">{row.tumorTypes.join(', ')}</span>
      ),
      width: 180,
    },
    {
      id: 'oncokbId',
      header: 'OncoKB',
      accessor: (row) =>
        row.oncokbId ? (
          <a
            href={`https://www.oncokb.org/gene/${row.gene}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-fg hover:underline flex items-center gap-1 text-xs"
          >
            查看
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-fg-muted text-xs">-</span>
        ),
      width: 70,
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
          <button className="text-xs text-accent-fg hover:underline">详情</button>
          <button className="text-xs text-accent-fg hover:underline">编辑</button>
        </div>
      ),
      width: 90,
    },
  ];

  const filteredData = mockVariants.filter((v) => {
    const matchesSearch =
      searchTerm === '' ||
      v.gene.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.variant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.drugs.some(d => d.toLowerCase().includes(searchTerm.toLowerCase())) ||
      v.tumorTypes.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEvidence = evidenceFilter === 'all' || v.evidenceLevel === evidenceFilter;
    const matchesResponse = responseFilter === 'all' || v.drugResponse === responseFilter;
    const matchesSource = sourceFilter === 'all' || v.source === sourceFilter;
    return matchesSearch && matchesEvidence && matchesResponse && matchesSource;
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
        收录肿瘤靶向药物相关的突变位点，包括药物敏感性/耐药性信息、证据等级、适应瘤种等。
        数据来源包括 OncoKB、CIViC、FDA 获批信息及内部收录。
      </p>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
          <input
            type="text"
            placeholder="搜索基因、变异、药物、瘤种..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-fg-muted" />
          <select
            value={evidenceFilter}
            onChange={(e) => setEvidenceFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
          >
            <option value="all">全部证据等级</option>
            <option value="A">A级 (FDA获批)</option>
            <option value="B">B级 (临床指南)</option>
            <option value="C">C级 (临床研究)</option>
            <option value="D">D级 (病例报告)</option>
            <option value="E">E级 (临床前)</option>
          </select>
          <select
            value={responseFilter}
            onChange={(e) => setResponseFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
          >
            <option value="all">全部药物反应</option>
            <option value="sensitive">敏感</option>
            <option value="resistant">耐药</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
          >
            <option value="all">全部来源</option>
            <option value="OncoKB">OncoKB</option>
            <option value="CIViC">CIViC</option>
            <option value="FDA">FDA</option>
            <option value="内部收录">内部收录</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-4 text-sm text-fg-muted">
        <span>共 {filteredData.length} 条记录</span>
        <span className="flex items-center gap-1">
          <Target className="w-3.5 h-3.5" />
          敏感: {filteredData.filter((v) => v.drugResponse === 'sensitive').length}
        </span>
        <span className="flex items-center gap-1">
          耐药: {filteredData.filter((v) => v.drugResponse === 'resistant').length}
        </span>
        <span className="flex items-center gap-1">
          <Pill className="w-3.5 h-3.5" />
          A级证据: {filteredData.filter((v) => v.evidenceLevel === 'A').length}
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
