'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag, Select } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Plus, Search, Play, Pause, X } from 'lucide-react';
import * as React from 'react';

// 基础流程类型
type BasePipelineType =
  | 'wes_single'    // WES单样本分析
  | 'wes_family';   // WES家系分析

interface Pipeline {
  id: string;
  name: string;
  basePipeline: BasePipelineType;
  version: string;
  description: string;
  bedFile: string;
  referenceGenome: string;
  cnvBaseline?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 基础流程选项
const BASE_PIPELINE_OPTIONS = [
  { value: 'wes_single', label: 'WES单样本分析' },
  { value: 'wes_family', label: 'WES家系分析' },
];

// 参考基因组选项
const REFERENCE_GENOME_OPTIONS = [
  { value: 'hg19', label: 'hg19 (GRCh37)' },
  { value: 'hg38', label: 'hg38 (GRCh38)' },
];

// BED 文件选项
const BED_FILE_OPTIONS = [
  { value: 'Agilent_SureSelect_V7.bed', label: 'Agilent SureSelect V7' },
  { value: 'Agilent_SureSelect_V6.bed', label: 'Agilent SureSelect V6' },
  { value: 'IDT_xGen_V2.bed', label: 'IDT xGen Exome V2' },
  { value: 'Twist_Exome_V2.bed', label: 'Twist Exome V2' },
  { value: 'Cardio_Panel_v2.bed', label: '心血管疾病Panel' },
  { value: 'Neuro_Panel_v1.bed', label: '神经系统疾病Panel' },
  { value: 'Custom_Panel.bed', label: '自定义Panel' },
];

// CNV 基线选项
const CNV_BASELINE_OPTIONS = [
  { value: 'none', label: '不使用' },
  { value: 'CNV_Baseline_WES_V1.txt', label: 'WES CNV基线 V1' },
  { value: 'CNV_Baseline_WES_V2.txt', label: 'WES CNV基线 V2' },
];

const getBasePipelineLabel = (type: BasePipelineType): string => {
  return BASE_PIPELINE_OPTIONS.find(o => o.value === type)?.label || type;
};

const mockPipelines: Pipeline[] = [
  {
    id: '1',
    name: 'WES单样本分析-标准版',
    basePipeline: 'wes_single',
    version: 'v1.2.0',
    description: '全外显子单样本遗传病分析流程',
    bedFile: 'Agilent_SureSelect_V7.bed',
    referenceGenome: 'hg38',
    cnvBaseline: 'CNV_Baseline_WES_V1.txt',
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-01',
  },
  {
    id: '2',
    name: 'WES家系分析-标准版',
    basePipeline: 'wes_family',
    version: 'v1.1.0',
    description: '全外显子家系联合分析流程，支持Trio分析',
    bedFile: 'Agilent_SureSelect_V7.bed',
    referenceGenome: 'hg38',
    cnvBaseline: 'CNV_Baseline_WES_V1.txt',
    status: 'active',
    createdAt: '2024-02-20',
    updatedAt: '2024-11-15',
  },
  {
    id: '3',
    name: '心血管Panel分析',
    basePipeline: 'wes_single',
    version: 'v2.0.1',
    description: '心血管疾病基因Panel分析流程',
    bedFile: 'Cardio_Panel_v2.bed',
    referenceGenome: 'hg38',
    status: 'active',
    createdAt: '2024-03-20',
    updatedAt: '2024-11-15',
  },
  {
    id: '4',
    name: 'WES单样本分析-旧版',
    basePipeline: 'wes_single',
    version: 'v1.0.0',
    description: '旧版全外显子分析流程（已停用）',
    bedFile: 'Agilent_SureSelect_V6.bed',
    referenceGenome: 'hg19',
    status: 'inactive',
    createdAt: '2023-06-01',
    updatedAt: '2024-01-15',
  },
];

// 新建流程表单数据
interface NewPipelineFormData {
  name: string;
  basePipeline: BasePipelineType;
  description: string;
  bedFile: string;
  referenceGenome: string;
  cnvBaseline: string;
}

// 新建流程弹窗
function NewPipelineModal({
  isOpen,
  onClose,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewPipelineFormData) => void;
}) {
  const [formData, setFormData] = React.useState<NewPipelineFormData>({
    name: '',
    basePipeline: 'wes_single',
    description: '',
    bedFile: 'Agilent_SureSelect_V7.bed',
    referenceGenome: 'hg38',
    cnvBaseline: 'none',
  });

  const handleChange = (field: keyof NewPipelineFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      basePipeline: 'wes_single',
      description: '',
      bedFile: 'Agilent_SureSelect_V7.bed',
      referenceGenome: 'hg38',
      cnvBaseline: 'none',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">新建分析流程</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">基础流程 *</label>
            <Select
              value={formData.basePipeline}
              onChange={(v) => handleChange('basePipeline', Array.isArray(v) ? v[0] : v)}
              options={BASE_PIPELINE_OPTIONS}
            />
            <p className="text-xs text-gray-500 mt-1">选择要基于的分析流程类型</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">流程名称 *</label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="请输入流程名称"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">流程描述</label>
            <Input
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="请输入流程描述"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">参考基因组版本 *</label>
            <Select
              value={formData.referenceGenome}
              onChange={(v) => handleChange('referenceGenome', Array.isArray(v) ? v[0] : v)}
              options={REFERENCE_GENOME_OPTIONS}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">BED 文件 *</label>
            <Select
              value={formData.bedFile}
              onChange={(v) => handleChange('bedFile', Array.isArray(v) ? v[0] : v)}
              options={BED_FILE_OPTIONS}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CNV 基线文件</label>
            <Select
              value={formData.cnvBaseline}
              onChange={(v) => handleChange('cnvBaseline', Array.isArray(v) ? v[0] : v)}
              options={CNV_BASELINE_OPTIONS}
            />
            <p className="text-xs text-gray-500 mt-1">用于拷贝数变异分析的基线文件</p>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!formData.name}>
            创建流程
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PipelineListPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [pipelines, setPipelines] = React.useState<Pipeline[]>(mockPipelines);
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);

  const handleToggleStatus = (id: string) => {
    setPipelines(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: p.status === 'active' ? 'inactive' : 'active',
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }
      return p;
    }));
  };

  const handleCreatePipeline = (data: NewPipelineFormData) => {
    const newPipeline: Pipeline = {
      id: String(Date.now()),
      name: data.name,
      basePipeline: data.basePipeline,
      version: 'v1.0.0',
      description: data.description || `基于${getBasePipelineLabel(data.basePipeline)}的自定义流程`,
      bedFile: data.bedFile,
      referenceGenome: data.referenceGenome,
      cnvBaseline: data.cnvBaseline !== 'none' ? data.cnvBaseline : undefined,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setPipelines(prev => [...prev, newPipeline]);
  };

  const filteredPipelines = React.useMemo(() => {
    if (!searchQuery) return pipelines;
    const query = searchQuery.toLowerCase();
    return pipelines.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }, [searchQuery, pipelines]);

  const columns: Column<Pipeline>[] = [
    { id: 'name', header: '流程名称', accessor: 'name', width: 180 },
    {
      id: 'basePipeline',
      header: '基础流程',
      accessor: (row) => (
        <Tag variant="info">{getBasePipelineLabel(row.basePipeline)}</Tag>
      ),
      width: 130,
    },
    { id: 'version', header: '版本', accessor: 'version', width: 80 },
    { id: 'referenceGenome', header: '参考基因组', accessor: 'referenceGenome', width: 100 },
    { id: 'bedFile', header: 'BED 文件', accessor: 'bedFile', width: 180 },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => (
        <Tag variant={row.status === 'active' ? 'success' : 'neutral'}>
          {row.status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
      width: 80,
    },
    { id: 'updatedAt', header: '更新时间', accessor: 'updatedAt', width: 110 },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <button
          onClick={() => handleToggleStatus(row.id)}
          className="p-1.5 rounded text-gray-400 hover:text-accent-fg hover:bg-accent-subtle transition-colors"
          title={row.status === 'active' ? '停用' : '启用'}
        >
          {row.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      ),
      width: 70,
    },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">流程列表</h2>

      <div className="flex items-center justify-between mb-4">
        <div className="w-64">
          <Input
            placeholder="搜索流程..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewModalOpen(true)}>
          新建流程
        </Button>
      </div>

      <DataTable
        data={filteredPipelines}
        columns={columns}
        rowKey="id"
        density="default"
        striped
      />

      <NewPipelineModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreatePipeline}
      />
    </PageContent>
  );
}
