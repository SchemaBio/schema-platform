'use client';

import { useState } from 'react';
import { PageContent } from '@/components/layout';
import { Tag, DataTable, type Column, Input, Button } from '@schema/ui-kit';
import { Search, Plus, Edit2, Trash2, Copy, Download, Upload, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface GeneList {
  id: string;
  name: string;
  description: string;
  geneCount: number;
  category: 'panel' | 'disease' | 'custom';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

// Mock data
const mockGeneLists: GeneList[] = [
  {
    id: 'gl-001',
    name: '心血管疾病基因Panel',
    description: '包含心肌病、心律失常、主动脉病等心血管相关疾病基因',
    geneCount: 156,
    category: 'panel',
    createdBy: '系统',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-20',
    isPublic: true,
  },
  {
    id: 'gl-002',
    name: '遗传性肿瘤基因Panel',
    description: '包含BRCA1/2、Lynch综合征、Li-Fraumeni综合征等遗传性肿瘤相关基因',
    geneCount: 89,
    category: 'panel',
    createdBy: '系统',
    createdAt: '2024-02-10',
    updatedAt: '2024-11-15',
    isPublic: true,
  },
  {
    id: 'gl-003',
    name: '肥厚型心肌病',
    description: 'HCM相关基因列表',
    geneCount: 23,
    category: 'disease',
    createdBy: '王工',
    createdAt: '2024-06-20',
    updatedAt: '2024-12-01',
    isPublic: true,
  },
  {
    id: 'gl-004',
    name: '扩张型心肌病',
    description: 'DCM相关基因列表',
    geneCount: 45,
    category: 'disease',
    createdBy: '王工',
    createdAt: '2024-07-05',
    updatedAt: '2024-11-28',
    isPublic: true,
  },
  {
    id: 'gl-005',
    name: '自定义筛查列表-项目A',
    description: '项目A特定的基因筛查列表',
    geneCount: 32,
    category: 'custom',
    createdBy: '李工',
    createdAt: '2024-10-15',
    updatedAt: '2024-12-18',
    isPublic: false,
  },
  {
    id: 'gl-006',
    name: '神经肌肉疾病基因Panel',
    description: '包含DMD、SMA、CMT等神经肌肉疾病相关基因',
    geneCount: 112,
    category: 'panel',
    createdBy: '系统',
    createdAt: '2024-03-01',
    updatedAt: '2024-10-20',
    isPublic: true,
  },
];

const categoryConfig: Record<string, { label: string; variant: 'info' | 'success' | 'neutral' }> = {
  panel: { label: 'Panel', variant: 'info' },
  disease: { label: '疾病', variant: 'success' },
  custom: { label: '自定义', variant: 'neutral' },
};

export default function GeneListsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const columns: Column<GeneList>[] = [
    {
      id: 'name',
      header: '列表名称',
      accessor: (row) => (
        <Link
          href={`/knowledge/gene-lists/${row.id}`}
          className="text-accent-fg hover:underline font-medium flex items-center gap-1"
        >
          {row.name}
          <ChevronRight className="w-3 h-3" />
        </Link>
      ),
      width: 220,
      sortable: true,
    },
    {
      id: 'description',
      header: '描述',
      accessor: (row) => (
        <span className="text-fg-muted text-sm line-clamp-1">{row.description}</span>
      ),
      width: 280,
    },
    {
      id: 'geneCount',
      header: '基因数',
      accessor: (row) => (
        <span className="font-medium">{row.geneCount}</span>
      ),
      width: 80,
      sortable: true,
    },
    {
      id: 'category',
      header: '类型',
      accessor: (row) => {
        const config = categoryConfig[row.category];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 90,
      sortable: true,
    },
    {
      id: 'isPublic',
      header: '可见性',
      accessor: (row) => (
        <span className={`text-xs ${row.isPublic ? 'text-success-fg' : 'text-fg-muted'}`}>
          {row.isPublic ? '公开' : '私有'}
        </span>
      ),
      width: 70,
    },
    {
      id: 'createdBy',
      header: '创建者',
      accessor: 'createdBy',
      width: 80,
    },
    {
      id: 'updatedAt',
      header: '更新时间',
      accessor: 'updatedAt',
      width: 100,
      sortable: true,
    },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <button
            className="p-1 text-fg-muted hover:text-fg-default hover:bg-canvas-subtle rounded"
            title="编辑"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-fg-muted hover:text-fg-default hover:bg-canvas-subtle rounded"
            title="复制"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-fg-muted hover:text-fg-default hover:bg-canvas-subtle rounded"
            title="导出"
          >
            <Download className="w-4 h-4" />
          </button>
          {row.createdBy !== '系统' && (
            <button
              className="p-1 text-fg-muted hover:text-danger-fg hover:bg-danger-subtle rounded"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
      width: 140,
    },
  ];

  const filteredData = mockGeneLists.filter((list) => {
    const matchesSearch =
      searchTerm === '' ||
      list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || list.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalGenes = filteredData.reduce((sum, list) => sum + list.geneCount, 0);

  return (
    <PageContent>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-fg-default">基因列表管理</h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-canvas-subtle border border-border rounded-md hover:bg-canvas-inset transition-colors">
            <Upload className="w-4 h-4" />
            导入列表
          </button>
          <Link
            href="/knowledge/gene-lists/new"
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent-emphasis text-fg-on-emphasis rounded-md hover:bg-accent-emphasis/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建列表
          </Link>
        </div>
      </div>

      <p className="text-sm text-fg-muted mb-4">
        管理基因列表，可用于分析流程的基因筛选、报告生成等场景。支持按疾病、Panel或自定义方式组织基因。
      </p>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
          <input
            type="text"
            placeholder="搜索列表名称或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
        >
          <option value="all">全部类型</option>
          <option value="panel">Panel</option>
          <option value="disease">疾病</option>
          <option value="custom">自定义</option>
        </select>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-4 text-sm text-fg-muted">
        <span>共 {filteredData.length} 个列表</span>
        <span>包含 {totalGenes.toLocaleString()} 个基因</span>
        <span>Panel: {filteredData.filter((l) => l.category === 'panel').length}</span>
        <span>疾病: {filteredData.filter((l) => l.category === 'disease').length}</span>
        <span>自定义: {filteredData.filter((l) => l.category === 'custom').length}</span>
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
