'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag, Select } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Plus, Search, Play, Pause, X } from 'lucide-react';
import * as React from 'react';

// 基础流程类型
type BasePipelineType = 
  | 'tissue_single'      // 组织单样本分析
  | 'tissue_paired'      // 组织配对样本分析
  | 'plasma_single'      // 血浆单样本分析
  | 'plasma_paired'      // 血浆配对样本分析
  | 'rna_fusion';        // RNA融合分析

interface Pipeline {
  id: string;
  name: string;
  basePipeline: BasePipelineType;
  version: string;
  description: string;
  bedFile: string;
  referenceGenome: string;
  cnvBaseline?: string;
  msiBaseline?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 基础流程选项
const BASE_PIPELINE_OPTIONS = [
  { value: 'tissue_single', label: '组织单样本分析' },
  { value: 'tissue_paired', label: '组织配对样本分析' },
  { value: 'plasma_single', label: '血浆单样本分析' },
  { value: 'plasma_paired', label: '血浆配对样本分析' },
  { value: 'rna_fusion', label: 'RNA融合分析' },
];

// 参考基因组选项
const REFERENCE_GENOME_OPTIONS = [
  { value: 'hg19', label: 'hg19 (GRCh37)' },
  { value: 'hg38', label: 'hg38 (GRCh38)' },
];

// Mock BED 文件选项
const BED_FILE_OPTIONS = [
  { value: 'Agilent_SureSelect_V7.bed', label: 'Agilent SureSelect V7' },
  { value: 'IDT_xGen_V2.bed', label: 'IDT xGen Exome V2' },
  { value: 'Twist_Exome_V2.bed', label: 'Twist Exome V2' },
  { value: 'ctDNA_Panel_168.bed', label: 'ctDNA 168基因Panel' },
  { value: 'RNA_Fusion_Panel.bed', label: 'RNA Fusion Panel' },
  { value: 'Custom_Panel.bed', label: '自定义Panel' },
];

// Mock CNV 基线选项
const CNV_BASELINE_OPTIONS = [
  { value: 'none', label: '不使用' },
  { value: 'CNV_Baseline_V1.txt', label: 'CNV基线 V1' },
  { value: 'CNV_Baseline_V2.txt', label: 'CNV基线 V2' },
  { value: 'ctDNA_CNV_Baseline.txt', label: 'ctDNA CNV基线' },
];

// Mock MSI 基线选项
const MSI_BASELINE_OPTIONS = [
  { value: 'none', label: '不使用' },
  { value: 'MSI_Baseline_V1.txt', label: 'MSI基线 V1' },
  { value: 'MSI_Baseline_V2.txt', label: 'MSI基线 V2' },
];

const getBasePipelineLabel = (type: BasePipelineType): string => {
  return BASE_PIPELINE_OPTIONS.find(o => o.value === type)?.label || type;
};

const initialPipelines: Pipeline[] = [
  {
    id: '1',
    name: '单样本分析',
    basePipeline: 'tissue_single',
    version: 'v1.2.0',
    description: '单样本体细胞突变分析流程',
    bedFile: 'Agilent_SureSelect_V7.bed',
    referenceGenome: 'hg38',
    cnvBaseline: 'CNV_Baseline_V1.txt',
    msiBaseline: 'MSI_Baseline_V1.txt',
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-01',
  },
  {
    id: '2',
    name: 'RNA融合分析',
    basePipeline: 'rna_fusion',
    version: 'v2.0.1',
    description: 'RNA融合基因检测分析流程',
    bedFile: 'RNA_Fusion_Panel.bed',
    referenceGenome: 'hg38',
    status: 'active',
    createdAt: '2024-03-20',
    updatedAt: '2024-11-15',
  },
  {
    id: '3',
    name: '配对样本分析',
    basePipeline: 'tissue_paired',
    version: 'v1.0.0',
    description: '肿瘤-正常配对样本分析流程',
    bedFile: 'Agilent_SureSelect_V7.bed',
    referenceGenome: 'hg38',
    cnvBaseline: 'CNV_Baseline_V2.txt',
    msiBaseline: 'MSI_Baseline_V2.txt',
    status: 'active',
    createdAt: '2023-06-01',
    updatedAt: '2024-01-15',
  },
  {
    id: '4',
    name: 'ctDNA单样本分析',
    basePipeline: 'plasma_single',
    version: 'v1.0.0',
    description: '循环肿瘤DNA单样本分析流程，适用于液体活检样本',
    bedFile: 'ctDNA_Panel_168.bed',
    referenceGenome: 'hg38',
    cnvBaseline: 'ctDNA_CNV_Baseline.txt',
    status: 'active',
    createdAt: '2024-06-10',
    updatedAt: '2024-12-20',
  },
  {
    id: '5',
    name: 'ctDNA配对样本分析',
    basePipeline: 'plasma_paired',
    version: 'v1.0.0',
    description: 'ctDNA与白细胞配对分析流程，可有效去除克隆性造血突变',
    bedFile: 'ctDNA_Panel_168.bed',
    referenceGenome: 'hg38',
    cnvBaseline: 'ctDNA_CNV_Baseline.txt',
    status: 'active',
    createdAt: '2024-06-15',
    updatedAt: '2024-12-20',
  },
];

interface NewPipelineFormData {
  name: string;
  basePipeline: BasePipelineType;
  description: string;
  bedFile: string;
  referenceGenome: string;
  cnvBaseline: string;
  msiBaseline: string;
}

interface NewPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewPipelineFormData) => void;
}

function NewPipelineModal({ isOpen, onClose, onSubmit }: NewPipelineModalProps) {
  const [formData, setFormData] = React.useState<NewPipelineFormData>({
    name: '',
    basePipeline: 'tissue_single',
    description: '',
    bedFile: 'Agilent_SureSelect_V7.bed',
    referenceGenome: 'hg38',
    cnvBaseline: 'none',
    msiBaseline: 'none',
  });

  const handleChange = (field: keyof NewPipelineFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      basePipeline: 'tissue_single',
      description: '',
      bedFile: 'Agilent_SureSelect_V7.bed',
      referenceGenome: 'hg38',
      cnvBaseline: 'none',
      msiBaseline: 'none',
    });
    onClose();
  };

  const isRnaFusion = formData.basePipeline === 'rna_fusion';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">新建分析流程</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 基础流程 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">基础流程 *</label>
            <Select
              value={formData.basePipeline}
              onChange={(v) => handleChange('basePipeline', Array.isArray(v) ? v[0] : v)}
              options={BASE_PIPELINE_OPTIONS}
            />
            <p className="text-xs text-fg-muted mt-1">选择要基于的分析流程类型</p>
          </div>

          {/* 流程名称 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">流程名称 *</label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="请输入流程名称"
              required
            />
          </div>

          {/* 流程描述 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">流程描述</label>
            <Input
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="请输入流程描述"
            />
          </div>

          {/* 参考基因组 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">参考基因组版本 *</label>
            <Select
              value={formData.referenceGenome}
              onChange={(v) => handleChange('referenceGenome', Array.isArray(v) ? v[0] : v)}
              options={REFERENCE_GENOME_OPTIONS}
            />
          </div>

          {/* BED 文件 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">BED 文件 *</label>
            <Select
              value={formData.bedFile}
              onChange={(v) => handleChange('bedFile', Array.isArray(v) ? v[0] : v)}
              options={BED_FILE_OPTIONS}
              placeholder="请选择 BED 文件"
            />
          </div>

          {/* CNV 基线文件 - RNA融合不需要 */}
          {!isRnaFusion && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-fg-default mb-2">CNV 基线文件</label>
              <Select
                value={formData.cnvBaseline}
                onChange={(v) => handleChange('cnvBaseline', Array.isArray(v) ? v[0] : v)}
                options={CNV_BASELINE_OPTIONS}
              />
              <p className="text-xs text-fg-muted mt-1">用于拷贝数变异分析的基线文件</p>
            </div>
          )}

          {/* MSI 基线文件 - RNA融合不需要 */}
          {!isRnaFusion && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-fg-default mb-2">MSI 基线文件</label>
              <Select
                value={formData.msiBaseline}
                onChange={(v) => handleChange('msiBaseline', Array.isArray(v) ? v[0] : v)}
                options={MSI_BASELINE_OPTIONS}
              />
              <p className="text-xs text-fg-muted mt-1">用于微卫星不稳定性分析的基线文件</p>
            </div>
          )}
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!formData.name}
          >
            创建流程
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PipelineListPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [pipelines, setPipelines] = React.useState<Pipeline[]>(initialPipelines);
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
      msiBaseline: data.msiBaseline !== 'none' ? data.msiBaseline : undefined,
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
    { id: 'name', header: '流程名称', accessor: 'name', width: 160 },
    { 
      id: 'basePipeline', 
      header: '基础流程', 
      accessor: (row) => (
        <Tag variant="info">{getBasePipelineLabel(row.basePipeline)}</Tag>
      ),
      width: 140 
    },
    { id: 'version', header: '版本', accessor: 'version', width: 80 },
    { id: 'bedFile', header: 'BED 文件', accessor: 'bedFile', width: 180 },
    { id: 'referenceGenome', header: '参考基因组', accessor: 'referenceGenome', width: 100 },
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
        <Button
          variant="ghost"
          size="small"
          leftIcon={row.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          onClick={() => handleToggleStatus(row.id)}
        >
          {row.status === 'active' ? '停用' : '启用'}
        </Button>
      ),
      width: 100,
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
        <Button 
          variant="primary" 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsNewModalOpen(true)}
        >
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
