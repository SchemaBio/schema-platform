'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageContent } from '@/components/layout';
import { Tag, DataTable, type Column, Input } from '@schema/ui-kit';
import { 
  ArrowLeft, Search, Plus, Trash2, Download, Edit2, Save, X,
  ExternalLink, Copy
} from 'lucide-react';

interface Gene {
  id: string;
  symbol: string;
  name: string;
  chromosome: string;
  omimId?: string;
  hgncId?: string;
  ensemblId?: string;
  addedAt: string;
  addedBy: string;
}

interface GeneListDetail {
  id: string;
  name: string;
  description: string;
  category: 'panel' | 'disease' | 'custom';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  genes: Gene[];
}

// Mock data
const mockGeneListDetail: Record<string, GeneListDetail> = {
  'gl-001': {
    id: 'gl-001',
    name: '心血管疾病基因Panel',
    description: '包含心肌病、心律失常、主动脉病等心血管相关疾病基因',
    category: 'panel',
    createdBy: '系统',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-20',
    isPublic: true,
    genes: [
      { id: 'g1', symbol: 'MYH7', name: 'myosin heavy chain 7', chromosome: 'chr14', omimId: '160760', hgncId: 'HGNC:7577', ensemblId: 'ENSG00000092054', addedAt: '2024-01-15', addedBy: '系统' },
      { id: 'g2', symbol: 'MYBPC3', name: 'myosin binding protein C3', chromosome: 'chr11', omimId: '600958', hgncId: 'HGNC:7551', ensemblId: 'ENSG00000134571', addedAt: '2024-01-15', addedBy: '系统' },
      { id: 'g3', symbol: 'TNNT2', name: 'troponin T2, cardiac type', chromosome: 'chr1', omimId: '191045', hgncId: 'HGNC:11949', ensemblId: 'ENSG00000118194', addedAt: '2024-01-15', addedBy: '系统' },
      { id: 'g4', symbol: 'TNNI3', name: 'troponin I3, cardiac type', chromosome: 'chr19', omimId: '191044', hgncId: 'HGNC:11947', ensemblId: 'ENSG00000129991', addedAt: '2024-01-15', addedBy: '系统' },
      { id: 'g5', symbol: 'TPM1', name: 'tropomyosin 1', chromosome: 'chr15', omimId: '191010', hgncId: 'HGNC:12010', ensemblId: 'ENSG00000140416', addedAt: '2024-01-15', addedBy: '系统' },
      { id: 'g6', symbol: 'ACTC1', name: 'actin alpha cardiac muscle 1', chromosome: 'chr15', omimId: '102540', hgncId: 'HGNC:143', ensemblId: 'ENSG00000159251', addedAt: '2024-01-15', addedBy: '系统' },
      { id: 'g7', symbol: 'MYL2', name: 'myosin light chain 2', chromosome: 'chr12', omimId: '160781', hgncId: 'HGNC:7583', ensemblId: 'ENSG00000111245', addedAt: '2024-01-15', addedBy: '系统' },
      { id: 'g8', symbol: 'MYL3', name: 'myosin light chain 3', chromosome: 'chr3', omimId: '160790', hgncId: 'HGNC:7584', ensemblId: 'ENSG00000160808', addedAt: '2024-01-15', addedBy: '系统' },
      { id: 'g9', symbol: 'SCN5A', name: 'sodium voltage-gated channel alpha subunit 5', chromosome: 'chr3', omimId: '600163', hgncId: 'HGNC:10593', ensemblId: 'ENSG00000183873', addedAt: '2024-02-10', addedBy: '王工' },
      { id: 'g10', symbol: 'KCNQ1', name: 'potassium voltage-gated channel subfamily Q member 1', chromosome: 'chr11', omimId: '607542', hgncId: 'HGNC:6294', ensemblId: 'ENSG00000053918', addedAt: '2024-02-10', addedBy: '王工' },
      { id: 'g11', symbol: 'KCNH2', name: 'potassium voltage-gated channel subfamily H member 2', chromosome: 'chr7', omimId: '152427', hgncId: 'HGNC:6251', ensemblId: 'ENSG00000055118', addedAt: '2024-02-10', addedBy: '王工' },
      { id: 'g12', symbol: 'LMNA', name: 'lamin A/C', chromosome: 'chr1', omimId: '150330', hgncId: 'HGNC:6636', ensemblId: 'ENSG00000160789', addedAt: '2024-03-05', addedBy: '李工' },
    ],
  },
  'gl-003': {
    id: 'gl-003',
    name: '肥厚型心肌病',
    description: 'HCM相关基因列表',
    category: 'disease',
    createdBy: '王工',
    createdAt: '2024-06-20',
    updatedAt: '2024-12-01',
    isPublic: true,
    genes: [
      { id: 'g1', symbol: 'MYH7', name: 'myosin heavy chain 7', chromosome: 'chr14', omimId: '160760', hgncId: 'HGNC:7577', ensemblId: 'ENSG00000092054', addedAt: '2024-06-20', addedBy: '王工' },
      { id: 'g2', symbol: 'MYBPC3', name: 'myosin binding protein C3', chromosome: 'chr11', omimId: '600958', hgncId: 'HGNC:7551', ensemblId: 'ENSG00000134571', addedAt: '2024-06-20', addedBy: '王工' },
      { id: 'g3', symbol: 'TNNT2', name: 'troponin T2, cardiac type', chromosome: 'chr1', omimId: '191045', hgncId: 'HGNC:11949', ensemblId: 'ENSG00000118194', addedAt: '2024-06-20', addedBy: '王工' },
    ],
  },
};

const categoryConfig: Record<string, { label: string; variant: 'info' | 'success' | 'neutral' }> = {
  panel: { label: 'Panel', variant: 'info' },
  disease: { label: '疾病', variant: 'success' },
  custom: { label: '自定义', variant: 'neutral' },
};

export default function GeneListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGenes, setSelectedGenes] = useState<string[]>([]);

  // Get list data (in real app, fetch from API)
  const listData = mockGeneListDetail[id] || mockGeneListDetail['gl-001'];

  const columns: Column<Gene>[] = [
    {
      id: 'symbol',
      header: '基因符号',
      accessor: (row) => (
        <span className="font-medium text-fg-default">{row.symbol}</span>
      ),
      width: 100,
      sortable: true,
    },
    {
      id: 'name',
      header: '基因名称',
      accessor: (row) => (
        <span className="text-fg-muted text-sm">{row.name}</span>
      ),
      width: 280,
    },
    {
      id: 'chromosome',
      header: '染色体',
      accessor: 'chromosome',
      width: 80,
      sortable: true,
    },
    {
      id: 'omimId',
      header: 'OMIM',
      accessor: (row) =>
        row.omimId ? (
          <a
            href={`https://omim.org/entry/${row.omimId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-fg hover:underline flex items-center gap-1 text-sm"
          >
            {row.omimId}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-fg-muted">-</span>
        ),
      width: 100,
    },
    {
      id: 'hgncId',
      header: 'HGNC',
      accessor: (row) =>
        row.hgncId ? (
          <a
            href={`https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${row.hgncId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-fg hover:underline flex items-center gap-1 text-sm"
          >
            {row.hgncId}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-fg-muted">-</span>
        ),
      width: 120,
    },
    {
      id: 'addedBy',
      header: '添加者',
      accessor: 'addedBy',
      width: 80,
    },
    {
      id: 'addedAt',
      header: '添加时间',
      accessor: 'addedAt',
      width: 100,
      sortable: true,
    },
  ];

  if (isEditing) {
    columns.push({
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <button
          onClick={() => handleRemoveGene(row.id)}
          className="p-1 text-fg-muted hover:text-danger-fg hover:bg-danger-subtle rounded"
          title="移除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
      width: 60,
    });
  }

  const filteredGenes = listData.genes.filter((gene) => {
    return (
      searchTerm === '' ||
      gene.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gene.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gene.chromosome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleRemoveGene = (geneId: string) => {
    // In real app, call API to remove gene
    console.log('Remove gene:', geneId);
  };

  const handleExport = () => {
    // Export gene list as TSV
    const header = 'Symbol\tName\tChromosome\tOMIM\tHGNC\tEnsembl';
    const rows = listData.genes.map(g => 
      `${g.symbol}\t${g.name}\t${g.chromosome}\t${g.omimId || ''}\t${g.hgncId || ''}\t${g.ensemblId || ''}`
    );
    const content = [header, ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${listData.name}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyGenes = () => {
    const geneSymbols = listData.genes.map(g => g.symbol).join('\n');
    navigator.clipboard.writeText(geneSymbols);
  };

  const config = categoryConfig[listData.category];

  return (
    <PageContent>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.push('/knowledge/gene-lists')}
          className="p-1 text-fg-muted hover:text-fg-default hover:bg-canvas-subtle rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium text-fg-default">{listData.name}</h2>
            <Tag variant={config.variant}>{config.label}</Tag>
            <span className={`text-xs ${listData.isPublic ? 'text-success-fg' : 'text-fg-muted'}`}>
              {listData.isPublic ? '公开' : '私有'}
            </span>
          </div>
          <p className="text-sm text-fg-muted mt-1">{listData.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-canvas-subtle transition-colors"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent-emphasis text-fg-on-emphasis rounded-md hover:bg-accent-emphasis/90 transition-colors"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCopyGenes}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-canvas-subtle border border-border rounded-md hover:bg-canvas-inset transition-colors"
                title="复制基因列表"
              >
                <Copy className="w-4 h-4" />
                复制
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-canvas-subtle border border-border rounded-md hover:bg-canvas-inset transition-colors"
              >
                <Download className="w-4 h-4" />
                导出
              </button>
              {listData.createdBy !== '系统' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent-emphasis text-fg-on-emphasis rounded-md hover:bg-accent-emphasis/90 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  编辑
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-6 mb-4 text-sm text-fg-muted border-b border-border pb-4">
        <span>创建者: {listData.createdBy}</span>
        <span>创建时间: {listData.createdAt}</span>
        <span>更新时间: {listData.updatedAt}</span>
        <span className="font-medium text-fg-default">共 {listData.genes.length} 个基因</span>
      </div>

      {/* Search and actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
          <input
            type="text"
            placeholder="搜索基因符号、名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
          />
        </div>
        {isEditing && (
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-success-emphasis text-fg-on-emphasis rounded-md hover:bg-success-emphasis/90 transition-colors">
            <Plus className="w-4 h-4" />
            添加基因
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-4 text-sm text-fg-muted">
        <span>显示 {filteredGenes.length} / {listData.genes.length} 个基因</span>
      </div>

      <DataTable
        data={filteredGenes}
        columns={columns}
        rowKey="id"
        density="default"
        striped
        stickyHeader
      />
    </PageContent>
  );
}
