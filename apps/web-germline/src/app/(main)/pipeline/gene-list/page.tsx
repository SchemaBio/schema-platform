'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, Tag } from '@schema/ui-kit';
import { Plus, Search, Pencil, Trash2, X, Upload, Dna } from 'lucide-react';
import * as React from 'react';

interface GeneList {
  id: string;
  name: string;
  geneCount: number;
  disease: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const initialGeneLists: GeneList[] = [
  {
    id: '1',
    name: '心血管疾病Panel',
    geneCount: 168,
    disease: '遗传性心肌病',
    description: '心血管疾病相关基因检测列表，包含HCM、DCM、ARVC等',
    createdAt: '2024-06-15',
    updatedAt: '2024-12-01',
    createdBy: '王工',
  },
  {
    id: '2',
    name: '神经系统疾病Panel',
    geneCount: 256,
    disease: '遗传性神经病',
    description: '神经系统遗传病基因检测列表',
    createdAt: '2024-06-20',
    updatedAt: '2024-11-15',
    createdBy: '李工',
  },
  {
    id: '3',
    name: '眼科遗传病Panel',
    geneCount: 324,
    disease: '遗传性眼病',
    description: '遗传性视网膜病变、青光眼等眼科遗传病基因',
    createdAt: '2024-05-10',
    updatedAt: '2024-11-01',
    createdBy: '张工',
  },
  {
    id: '4',
    name: '耳聋基因Panel',
    geneCount: 189,
    disease: '遗传性耳聋',
    description: '遗传性听力损失相关基因检测列表',
    createdAt: '2024-07-01',
    updatedAt: '2024-10-20',
    createdBy: '李工',
  },
  {
    id: '5',
    name: '肾脏疾病Panel',
    geneCount: 142,
    disease: '遗传性肾病',
    description: '遗传性肾脏疾病相关基因，包含多囊肾、Alport综合征等',
    createdAt: '2024-08-15',
    updatedAt: '2024-11-10',
    createdBy: '王工',
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
      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-center text-gray-900 mb-2">
            删除基因列表
          </h3>
          <p className="text-sm text-center text-gray-500">
            确定要删除 "<span className="font-medium text-gray-700">{listName}</span>" 吗？此操作无法撤销。
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
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
  disease: string;
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
    disease: '',
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
        disease: '',
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
    if (!formData.name || !formData.disease || !formData.genes) return;
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      disease: '',
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

      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {mode === 'add' ? '添加基因列表' : '编辑基因列表'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">列表名称 *</label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="如：心血管疾病Panel"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">关联疾病 *</label>
            <Input
              value={formData.disease}
              onChange={(e) => handleChange('disease', e.target.value)}
              placeholder="如：遗传性心肌病"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">描述</label>
            <Input
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="列表用途说明"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-fg-default">基因列表 *</label>
              {geneCount > 0 && (
                <span className="text-xs text-fg-muted">已识别 {geneCount} 个基因</span>
              )}
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`
                border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors mb-2
                ${dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
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

            <textarea
              value={formData.genes}
              onChange={(e) => handleChange('genes', e.target.value)}
              placeholder="每行一个基因名，或用逗号/空格分隔&#10;例如：&#10;MYH7&#10;MYBPC3&#10;TNNT2"
              rows={6}
              className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-fg-default text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-fg-muted mt-1">
              支持每行一个基因，或用逗号、空格、Tab 分隔
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.disease || !formData.genes}
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
        geneCount,
        disease: data.disease,
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
            geneCount,
            disease: data.disease,
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
    if (!searchQuery) return geneLists;

    const query = searchQuery.toLowerCase();
    return geneLists.filter(
      (l) =>
        l.name.toLowerCase().includes(query) ||
        l.disease.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query)
    );
  }, [searchQuery, geneLists]);

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">基因列表管理</h2>

      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
        <p className="text-sm text-fg-muted">
          管理遗传病分析的疾病Panel基因列表。每个Panel包含特定疾病相关的检测基因。
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="w-64">
          <Input
            placeholder="搜索基因列表..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAddModal}
        >
          添加基因列表
        </Button>
      </div>

      {/* 列表展示 */}
      <div className="bg-canvas-default rounded-lg border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {filteredLists.map(list => (
            <div
              key={list.id}
              className="px-4 py-3 flex items-center justify-between hover:bg-canvas-subtle transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-fg-muted">
                  <Dna className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-fg-default">{list.name}</span>
                    <Tag variant="info">{list.disease}</Tag>
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
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                  title="编辑"
                  onClick={() => handleOpenEditModal(list)}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  title="删除"
                  onClick={() => handleDeleteClick(list)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredLists.length === 0 && (
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
          disease: editingList.disease,
          description: editingList.description,
          genes: '',
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
