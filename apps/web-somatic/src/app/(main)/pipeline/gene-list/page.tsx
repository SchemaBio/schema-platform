'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, Tag } from '@schema/ui-kit';
import { Plus, Search, Pencil, Trash2, X, Upload, FileText, Dna, Copy, GitBranch, Layers } from 'lucide-react';
import * as React from 'react';

type GeneListType = 'snv_indel' | 'cnv' | 'chrom' | 'fusion';

interface GeneList {
  id: string;
  name: string;
  type: GeneListType;
  geneCount: number;
  project: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const TYPE_CONFIG: Record<GeneListType, { label: string; variant: 'info' | 'success' | 'warning' | 'danger'; icon: React.ReactNode }> = {
  snv_indel: { label: 'SNV/InDel', variant: 'info', icon: <Dna className="w-4 h-4" /> },
  cnv: { label: 'CNV', variant: 'success', icon: <Copy className="w-4 h-4" /> },
  chrom: { label: 'Chrom', variant: 'warning', icon: <Layers className="w-4 h-4" /> },
  fusion: { label: 'Fusion', variant: 'danger', icon: <GitBranch className="w-4 h-4" /> },
};

const TYPE_OPTIONS = [
  { value: 'snv_indel', label: 'SNV/InDel 基因列表' },
  { value: 'cnv', label: 'CNV 基因列表' },
  { value: 'chrom', label: 'Chrom 关注列表' },
  { value: 'fusion', label: 'Fusion 基因列表' },
];

const initialGeneLists: GeneList[] = [
  {
    id: '1',
    name: '肺癌168基因_SNV',
    type: 'snv_indel',
    geneCount: 168,
    project: '肺癌168基因检测',
    description: '肺癌168基因Panel SNV/InDel检测基因列表',
    createdAt: '2024-06-15',
    updatedAt: '2024-12-01',
    createdBy: '王工',
  },
  {
    id: '2',
    name: '肺癌168基因_CNV',
    type: 'cnv',
    geneCount: 45,
    project: '肺癌168基因检测',
    description: '肺癌168基因Panel CNV检测基因列表',
    createdAt: '2024-06-15',
    updatedAt: '2024-12-01',
    createdBy: '王工',
  },
  {
    id: '3',
    name: '肺癌168基因_Fusion',
    type: 'fusion',
    geneCount: 23,
    project: '肺癌168基因检测',
    description: '肺癌168基因Panel 融合基因检测列表',
    createdAt: '2024-06-15',
    updatedAt: '2024-12-01',
    createdBy: '王工',
  },
  {
    id: '4',
    name: '实体瘤520基因_SNV',
    type: 'snv_indel',
    geneCount: 520,
    project: '实体瘤520基因检测',
    description: '实体瘤520基因Panel SNV/InDel检测基因列表',
    createdAt: '2024-08-20',
    updatedAt: '2024-11-15',
    createdBy: '李工',
  },
  {
    id: '5',
    name: '实体瘤520基因_CNV',
    type: 'cnv',
    geneCount: 120,
    project: '实体瘤520基因检测',
    description: '实体瘤520基因Panel CNV检测基因列表',
    createdAt: '2024-08-20',
    updatedAt: '2024-11-15',
    createdBy: '李工',
  },
  {
    id: '6',
    name: '实体瘤520基因_Chrom',
    type: 'chrom',
    geneCount: 24,
    project: '实体瘤520基因检测',
    description: '实体瘤520基因Panel 染色体臂关注列表',
    createdAt: '2024-08-20',
    updatedAt: '2024-11-15',
    createdBy: '李工',
  },
  {
    id: '7',
    name: '实体瘤520基因_Fusion',
    type: 'fusion',
    geneCount: 56,
    project: '实体瘤520基因检测',
    description: '实体瘤520基因Panel 融合基因检测列表',
    createdAt: '2024-08-20',
    updatedAt: '2024-11-15',
    createdBy: '李工',
  },
];


// 删除确认弹窗
interface DeleteConfirmModalProps {
  isOpen: boolean;
  listName: string;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({ isOpen, listName, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-center text-gray-900 dark:text-gray-100 mb-2">
            删除基因列表
          </h3>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            确定要删除 "<span className="font-medium text-gray-700 dark:text-gray-300">{listName}</span>" 吗？此操作无法撤销。
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1">
            删除
          </Button>
        </div>
      </div>
    </div>
  );
}

// 基因列表表单数据
interface GeneListFormData {
  name: string;
  type: GeneListType;
  project: string;
  description: string;
  genes: string;
}

// 添加/编辑基因列表弹窗
interface GeneListModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initialData?: GeneListFormData;
  onClose: () => void;
  onSubmit: (data: GeneListFormData) => void;
}

function GeneListModal({ isOpen, mode, initialData, onClose, onSubmit }: GeneListModalProps) {
  const [formData, setFormData] = React.useState<GeneListFormData>({
    name: '',
    type: 'snv_indel',
    project: '',
    description: '',
    genes: '',
  });
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    } else if (isOpen && !initialData) {
      setFormData({
        name: '',
        type: 'snv_indel',
        project: '',
        description: '',
        genes: '',
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (field: keyof GeneListFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFormData(prev => ({ ...prev, genes: content }));
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFormData(prev => ({ ...prev, genes: content }));
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.project || !formData.genes) return;
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'snv_indel',
      project: '',
      description: '',
      genes: '',
    });
    onClose();
  };

  const geneCount = formData.genes
    ? formData.genes.split(/[\n,\s]+/).filter(g => g.trim()).length
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {mode === 'add' ? '添加基因列表' : '编辑基因列表'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 列表名称 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">列表名称 *</label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="如：肺癌168基因_SNV"
            />
          </div>

          {/* 列表类型 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">列表类型 *</label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-fg-default focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* 关联项目 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">关联项目 *</label>
            <Input
              value={formData.project}
              onChange={(e) => handleChange('project', e.target.value)}
              placeholder="如：肺癌168基因检测"
            />
          </div>

          {/* 描述 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">描述</label>
            <Input
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="列表用途说明"
            />
          </div>

          {/* 基因列表输入 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-fg-default">基因列表 *</label>
              {geneCount > 0 && (
                <span className="text-xs text-fg-muted">已识别 {geneCount} 个基因</span>
              )}
            </div>
            
            {/* 文件上传区域 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`
                border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors mb-2
                ${dragOver 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,.tsv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">点击或拖拽上传基因列表文件</p>
            </div>

            {/* 文本输入区域 */}
            <textarea
              value={formData.genes}
              onChange={(e) => handleChange('genes', e.target.value)}
              placeholder="每行一个基因名，或用逗号/空格分隔&#10;例如：&#10;EGFR&#10;KRAS&#10;ALK"
              rows={6}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-fg-default text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-fg-muted mt-1">
              支持每行一个基因，或用逗号、空格、Tab 分隔
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!formData.name || !formData.project || !formData.genes}
          >
            {mode === 'add' ? '添加' : '保存'}
          </Button>
        </div>
      </div>
    </div>
  );
}


export default function GeneListPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<GeneListType | 'all'>('all');
  const [geneLists, setGeneLists] = React.useState<GeneList[]>(initialGeneLists);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'add' | 'edit'>('add');
  const [editingList, setEditingList] = React.useState<GeneList | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<GeneList | null>(null);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingList(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (list: GeneList) => {
    setModalMode('edit');
    setEditingList(list);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingList(null);
  };

  const handleSubmit = (data: GeneListFormData) => {
    const geneCount = data.genes.split(/[\n,\s]+/).filter(g => g.trim()).length;
    
    if (modalMode === 'add') {
      const newList: GeneList = {
        id: String(Date.now()),
        name: data.name,
        type: data.type,
        geneCount,
        project: data.project,
        description: data.description || `${data.name} 基因列表`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: '当前用户',
      };
      setGeneLists(prev => [...prev, newList]);
    } else if (editingList) {
      setGeneLists(prev => prev.map(list => {
        if (list.id === editingList.id) {
          return {
            ...list,
            name: data.name,
            type: data.type,
            geneCount,
            project: data.project,
            description: data.description || list.description,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return list;
      }));
    }
  };

  const handleDeleteClick = (list: GeneList) => {
    setDeleteTarget(list);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      setGeneLists(prev => prev.filter(l => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const filteredLists = React.useMemo(() => {
    let result = geneLists;
    
    if (filterType !== 'all') {
      result = result.filter(l => l.type === filterType);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          l.project.toLowerCase().includes(query) ||
          l.description.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [searchQuery, filterType, geneLists]);

  // 按项目分组
  const groupedByProject = React.useMemo(() => {
    const groups: Record<string, GeneList[]> = {};
    filteredLists.forEach(list => {
      if (!groups[list.project]) {
        groups[list.project] = [];
      }
      groups[list.project].push(list);
    });
    return groups;
  }, [filteredLists]);

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">基因列表管理</h2>

      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
        <p className="text-sm text-fg-muted">
          管理样本检出结果的基因列表。每个检测项目通常需要配置：SNV/InDel 基因列表、CNV 基因列表、Chrom 关注列表（染色体臂）以及 Fusion 基因列表。
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-64">
            <Input
              placeholder="搜索基因列表..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as GeneListType | 'all')}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-fg-default text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部类型</option>
            {TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <Button 
          variant="primary" 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAddModal}
        >
          添加基因列表
        </Button>
      </div>

      {/* 按项目分组展示 */}
      <div className="space-y-6">
        {Object.entries(groupedByProject).map(([project, lists]) => (
          <div key={project} className="bg-canvas-default rounded-lg border border-border overflow-hidden">
            <div className="px-4 py-3 bg-canvas-subtle border-b border-border">
              <h3 className="text-sm font-medium text-fg-default">{project}</h3>
            </div>
            <div className="divide-y divide-border">
              {lists.map(list => {
                const typeConfig = TYPE_CONFIG[list.type];
                return (
                  <div
                    key={list.id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-canvas-subtle transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-fg-muted">
                        {typeConfig.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-fg-default">{list.name}</span>
                          <Tag variant={typeConfig.variant}>{typeConfig.label}</Tag>
                          <span className="text-xs text-fg-muted">{list.geneCount} 个基因</span>
                        </div>
                        <p className="text-xs text-fg-muted truncate">{list.description}</p>
                      </div>
                      <div className="text-xs text-fg-muted shrink-0">
                        <span>更新: {list.updatedAt}</span>
                        <span className="ml-3">创建者: {list.createdBy}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4 shrink-0">
                      <button
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                        title="编辑"
                        onClick={() => handleOpenEditModal(list)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors"
                        title="删除"
                        onClick={() => handleDeleteClick(list)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(groupedByProject).length === 0 && (
          <div className="text-center py-12 text-fg-muted">
            <Dna className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无基因列表</p>
          </div>
        )}
      </div>

      <GeneListModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={editingList ? {
          name: editingList.name,
          type: editingList.type,
          project: editingList.project,
          description: editingList.description,
          genes: '', // 编辑时不预填基因列表
        } : undefined}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        listName={deleteTarget?.name || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </PageContent>
  );
}
