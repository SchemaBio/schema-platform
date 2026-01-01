'use client';

import { useState } from 'react';
import { PageContent } from '@/components/layout';
import { Tag, DataTable, type Column } from '@schema/ui-kit';
import { Search, Download, Filter, Plus, ExternalLink, BookOpen, Pencil, X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button, Input } from '@schema/ui-kit';

interface KnowledgeVariant {
  id: string;
  gene: string;
  chromosome: string;
  position: number;
  refAllele: string;
  altAllele: string;
  referenceGenome: 'hg19' | 'hg38';
  hgvsc: string;
  hgvsp: string;
  acmg: 'pathogenic' | 'likely-pathogenic' | 'vus' | 'likely-benign' | 'benign';
  clinvarId?: string;
  rsId?: string;
  disease: string;
  inheritance: string;
  pmids: string[];
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
    referenceGenome: 'hg38',
    hgvsc: 'c.5266dupC',
    hgvsp: 'p.Gln1756ProfsTer74',
    acmg: 'pathogenic',
    clinvarId: 'VCV000017661',
    rsId: 'rs80357906',
    disease: '遗传性乳腺癌-卵巢癌综合征',
    inheritance: 'AD',
    pmids: ['20301425', '22144684', '25741868'],
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
    referenceGenome: 'hg38',
    hgvsc: 'c.5946delT',
    hgvsp: 'p.Ser1982ArgfsTer22',
    acmg: 'pathogenic',
    clinvarId: 'VCV000051065',
    rsId: 'rs80359550',
    disease: '遗传性乳腺癌-卵巢癌综合征',
    inheritance: 'AD',
    pmids: ['20301425', '23108138'],
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
    referenceGenome: 'hg38',
    hgvsc: 'c.12345G>A',
    hgvsp: 'p.Trp4115Ter',
    acmg: 'pathogenic',
    clinvarId: 'VCV000234567',
    disease: '常染色体显性多囊肾病',
    inheritance: 'AD',
    pmids: ['19165177'],
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
    referenceGenome: 'hg38',
    hgvsc: 'c.1208G>A',
    hgvsp: 'p.Arg403Gln',
    acmg: 'likely-pathogenic',
    clinvarId: 'VCV000014094',
    rsId: 'rs121913626',
    disease: '肥厚型心肌病',
    inheritance: 'AD',
    pmids: ['1975517', '20301310', '25637381'],
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
    referenceGenome: 'hg38',
    hgvsc: 'c.4850C>T',
    hgvsp: 'p.Thr1617Met',
    acmg: 'vus',
    rsId: 'rs199473547',
    disease: 'Brugada综合征',
    inheritance: 'AD',
    pmids: ['15851227'],
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
    referenceGenome: 'hg38',
    hgvsc: 'c.682G>A',
    hgvsp: 'p.Glu228Lys',
    acmg: 'likely-pathogenic',
    clinvarId: 'VCV000003456',
    disease: '家族性高胆固醇血症',
    inheritance: 'AD',
    pmids: ['22698793', '25461735'],
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
    referenceGenome: 'hg38',
    hgvsc: 'c.1521_1523delCTT',
    hgvsp: 'p.Phe508del',
    acmg: 'pathogenic',
    clinvarId: 'VCV000007107',
    rsId: 'rs113993960',
    disease: '囊性纤维化',
    inheritance: 'AR',
    pmids: ['2570460', '20301428', '25981246'],
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

// 详情面板组件
function VariantDetailPanel({
  variant,
  onClose,
}: {
  variant: KnowledgeVariant;
  onClose: () => void;
}) {
  return (
    <div className="w-96 border-l border-border bg-canvas-default flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-medium text-fg-default">位点详情</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-canvas-subtle text-fg-muted"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h4 className="text-xs text-fg-muted mb-2">基本信息</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-fg-muted">基因</span>
              <span className="text-fg-default font-medium">{variant.gene}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">基因组位置</span>
              <span className="text-fg-default">{variant.chromosome}:{variant.position}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">REF/ALT</span>
              <span className="text-fg-default">{variant.refAllele} → {variant.altAllele}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs text-fg-muted mb-2">变异命名</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-fg-muted">HGVSc</span>
              <span className="text-fg-default font-mono text-xs">{variant.hgvsc}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">HGVSp</span>
              <span className="text-fg-default font-mono text-xs">{variant.hgvsp}</span>
            </div>
            {variant.rsId && (
              <div className="flex justify-between">
                <span className="text-fg-muted">rsID</span>
                <span className="text-fg-default">{variant.rsId}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs text-fg-muted mb-2">临床意义</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-fg-muted">ACMG分类</span>
              <Tag variant={variant.acmg}>{acmgLabels[variant.acmg]}</Tag>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">相关疾病</span>
              <span className="text-fg-default text-right max-w-[180px]">{variant.disease}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">遗传模式</span>
              <span className="text-fg-default">{variant.inheritance}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs text-fg-muted mb-2">数据来源</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-fg-muted">来源</span>
              <span className={`px-2 py-0.5 rounded text-xs ${sourceColors[variant.source]}`}>
                {variant.source}
              </span>
            </div>
            {variant.clinvarId && (
              <div className="flex justify-between items-center">
                <span className="text-fg-muted">ClinVar</span>
                <a
                  href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${variant.clinvarId.replace('VCV', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-fg hover:underline flex items-center gap-1"
                >
                  {variant.clinvarId}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-fg-muted">PMID</span>
              <div className="text-right">
                {variant.pmids.length > 0 ? (
                  variant.pmids.map((pmid, idx) => (
                    <a
                      key={pmid}
                      href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-fg hover:underline text-xs"
                    >
                      {pmid}{idx < variant.pmids.length - 1 ? ', ' : ''}
                    </a>
                  ))
                ) : (
                  <span className="text-fg-muted">-</span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">最后更新</span>
              <span className="text-fg-default">{variant.lastReviewed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 编辑弹窗组件
function EditVariantModal({
  variant,
  onClose,
  onSave,
}: {
  variant: KnowledgeVariant;
  onClose: () => void;
  onSave: (updated: KnowledgeVariant) => void;
}) {
  const [formData, setFormData] = useState({
    acmg: variant.acmg,
    disease: variant.disease,
    inheritance: variant.inheritance,
  });

  const handleSave = () => {
    onSave({
      ...variant,
      ...formData,
      lastReviewed: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">编辑位点</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">基因 / HGVSc</label>
            <div className="text-sm font-medium text-gray-900">
              {variant.gene} {variant.hgvsc}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ACMG分类 *</label>
            <select
              value={formData.acmg}
              onChange={(e) => setFormData(prev => ({ ...prev, acmg: e.target.value as KnowledgeVariant['acmg'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pathogenic">致病 (P)</option>
              <option value="likely-pathogenic">可能致病 (LP)</option>
              <option value="vus">意义未明 (VUS)</option>
              <option value="likely-benign">可能良性 (LB)</option>
              <option value="benign">良性 (B)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">相关疾病 *</label>
            <Input
              value={formData.disease}
              onChange={(e) => setFormData(prev => ({ ...prev, disease: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">遗传模式</label>
            <select
              value={formData.inheritance}
              onChange={(e) => setFormData(prev => ({ ...prev, inheritance: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AD">AD (常染色体显性)</option>
              <option value="AR">AR (常染色体隐性)</option>
              <option value="XL">XL (X连锁)</option>
              <option value="MT">MT (线粒体)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={handleSave}>保存</Button>
        </div>
      </div>
    </div>
  );
}

export default function VariantsLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [acmgFilter, setAcmgFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [activeGenome, setActiveGenome] = useState<'hg38' | 'hg19'>('hg38');
  const [variants, setVariants] = useState<KnowledgeVariant[]>(mockVariants);
  const [selectedVariant, setSelectedVariant] = useState<KnowledgeVariant | null>(null);
  const [editingVariant, setEditingVariant] = useState<KnowledgeVariant | null>(null);

  const handleSaveVariant = (updated: KnowledgeVariant) => {
    setVariants(prev => prev.map(v => v.id === updated.id ? updated : v));
    if (selectedVariant?.id === updated.id) {
      setSelectedVariant(updated);
    }
  };

  const handleDeleteVariant = (id: string) => {
    if (confirm('确定要删除该位点吗？')) {
      setVariants(prev => prev.filter(v => v.id !== id));
      if (selectedVariant?.id === id) {
        setSelectedVariant(null);
      }
    }
  };

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
      id: 'pmids',
      header: 'PMID',
      accessor: (row) => (
        <span className="text-xs text-fg-muted">
          {row.pmids.length > 0 ? row.pmids.slice(0, 2).join(', ') + (row.pmids.length > 2 ? '...' : '') : '-'}
        </span>
      ),
      width: 120,
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
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded text-gray-400 hover:text-accent-fg hover:bg-accent-subtle transition-colors"
            title="编辑"
            onClick={(e) => {
              e.stopPropagation();
              setEditingVariant(row);
            }}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="删除"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteVariant(row.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: 80,
    },
  ];

  const filteredData = variants.filter((v) => {
    const matchesGenome = v.referenceGenome === activeGenome;
    const matchesSearch =
      searchTerm === '' ||
      v.gene.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.hgvsc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.clinvarId && v.clinvarId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAcmg = acmgFilter === 'all' || v.acmg === acmgFilter;
    const matchesSource = sourceFilter === 'all' || v.source === sourceFilter;
    return matchesGenome && matchesSearch && matchesAcmg && matchesSource;
  });

  return (
    <div className="flex h-full">
      <PageContent className="flex-1 min-w-0">
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

      {/* 基因组版本标签页 */}
      <div className="flex items-center gap-1 mb-4 border-b border-border">
        <button
          onClick={() => setActiveGenome('hg38')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeGenome === 'hg38'
              ? 'border-accent-emphasis text-accent-fg'
              : 'border-transparent text-fg-muted hover:text-fg-default'
          }`}
        >
          GRCh38 / hg38
          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-canvas-subtle">
            {variants.filter(v => v.referenceGenome === 'hg38').length}
          </span>
        </button>
        <button
          onClick={() => setActiveGenome('hg19')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeGenome === 'hg19'
              ? 'border-accent-emphasis text-accent-fg'
              : 'border-transparent text-fg-muted hover:text-fg-default'
          }`}
        >
          GRCh37 / hg19
          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-canvas-subtle">
            {variants.filter(v => v.referenceGenome === 'hg19').length}
          </span>
        </button>
      </div>

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
        onRowClick={(row) => setSelectedVariant(row)}
      />
      </PageContent>

      {/* 详情面板 */}
      {selectedVariant && (
        <VariantDetailPanel
          variant={selectedVariant}
          onClose={() => setSelectedVariant(null)}
        />
      )}

      {/* 编辑弹窗 */}
      {editingVariant && (
        <EditVariantModal
          variant={editingVariant}
          onClose={() => setEditingVariant(null)}
          onSave={handleSaveVariant}
        />
      )}
    </div>
  );
}
