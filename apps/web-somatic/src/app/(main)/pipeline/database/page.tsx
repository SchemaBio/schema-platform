'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, Tag, TextArea } from '@schema/ui-kit';
import { Plus, Search, Pencil, Trash2, Database, X, ExternalLink } from 'lucide-react';
import * as React from 'react';

interface AnnotationDatabase {
  id: string;
  name: string;
  version: string;
  description: string;
  path: string;
  vepParams: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

const initialDatabases: AnnotationDatabase[] = [
  {
    id: '1',
    name: 'gnomAD',
    version: 'v4.0',
    description: '人群等位基因频率数据库',
    path: '/data/vep/gnomad_v4',
    vepParams: '--custom file=/data/vep/gnomad_v4/gnomad.genomes.v4.0.sites.vcf.bgz,short_name=gnomAD,format=vcf,type=exact,coords=0,fields=AF%AC%AN',
    website: 'https://gnomad.broadinstitute.org/',
    createdAt: '2024-11-01',
    updatedAt: '2024-11-01',
  },
  {
    id: '2',
    name: 'ClinVar',
    version: '2024-12',
    description: '临床变异数据库',
    path: '/data/vep/clinvar',
    vepParams: '--custom file=/data/vep/clinvar/clinvar_20241215.vcf.gz,short_name=ClinVar,format=vcf,type=exact,coords=0,fields=CLNSIG%CLNREVSTAT%CLNDN',
    website: 'https://www.ncbi.nlm.nih.gov/clinvar/',
    createdAt: '2024-12-15',
    updatedAt: '2024-12-15',
  },
  {
    id: '3',
    name: 'HGMD',
    version: '2024.3',
    description: '人类基因突变数据库（专业版）',
    path: '/data/vep/hgmd',
    vepParams: '--custom file=/data/vep/hgmd/hgmd_pro_2024.3.vcf.gz,short_name=HGMD,format=vcf,type=exact,coords=0,fields=CLASS%PHEN%GENE',
    website: 'https://www.hgmd.cf.ac.uk/',
    createdAt: '2024-09-01',
    updatedAt: '2024-09-01',
  },
  {
    id: '4',
    name: 'SpliceAI',
    version: 'v1.3',
    description: '剪接位点预测数据库',
    path: '/data/vep/spliceai',
    vepParams: '--plugin SpliceAI,snv=/data/vep/spliceai/spliceai_scores.raw.snv.hg38.vcf.gz,indel=/data/vep/spliceai/spliceai_scores.raw.indel.hg38.vcf.gz',
    website: 'https://github.com/Illumina/SpliceAI',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
  },
  {
    id: '5',
    name: 'dbNSFP',
    version: '4.5a',
    description: '功能预测综合数据库（SIFT, PolyPhen2, CADD 等）',
    path: '/data/vep/dbnsfp',
    vepParams: '--plugin dbNSFP,/data/vep/dbnsfp/dbNSFP4.5a_grch38.gz,SIFT_score,Polyphen2_HDIV_score,CADD_phred,REVEL_score,MutationTaster_pred',
    website: 'https://sites.google.com/site/jpopgen/dbNSFP',
    createdAt: '2024-08-01',
    updatedAt: '2024-08-01',
  },
  {
    id: '6',
    name: 'OMIM',
    version: '2024-12',
    description: '在线人类孟德尔遗传数据库',
    path: '/data/vep/omim',
    vepParams: '--custom file=/data/vep/omim/genemap2.txt,short_name=OMIM,format=tab,type=overlap,coords=1,fields=Phenotypes%Inheritance',
    website: 'https://www.omim.org/',
    createdAt: '2024-12-20',
    updatedAt: '2024-12-20',
  },
];

interface DatabaseFormData {
  name: string;
  version: string;
  description: string;
  path: string;
  vepParams: string;
  website: string;
}


// 删除确认弹窗
interface DeleteConfirmModalProps {
  isOpen: boolean;
  databaseName: string;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({ isOpen, databaseName, onClose, onConfirm }: DeleteConfirmModalProps) {
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
            删除数据库
          </h3>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            确定要删除数据库 "<span className="font-medium text-gray-700 dark:text-gray-300">{databaseName}</span>" 吗？此操作无法撤销。
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

// 添加/编辑数据库弹窗
interface DatabaseModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initialData?: DatabaseFormData;
  onClose: () => void;
  onSubmit: (data: DatabaseFormData) => void;
}

function DatabaseModal({ isOpen, mode, initialData, onClose, onSubmit }: DatabaseModalProps) {
  const [formData, setFormData] = React.useState<DatabaseFormData>({
    name: '',
    version: '',
    description: '',
    path: '',
    vepParams: '',
    website: '',
  });

  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    } else if (isOpen && !initialData) {
      setFormData({
        name: '',
        version: '',
        description: '',
        path: '',
        vepParams: '',
        website: '',
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (field: keyof DatabaseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      version: '',
      description: '',
      path: '',
      vepParams: '',
      website: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {mode === 'add' ? '添加注释数据库' : '编辑注释数据库'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 数据库名称 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">数据库名称 *</label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="如：gnomAD、ClinVar"
              required
            />
          </div>

          {/* 版本 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">版本 *</label>
            <Input
              value={formData.version}
              onChange={(e) => handleChange('version', e.target.value)}
              placeholder="如：v4.0、2024-12"
              required
            />
          </div>

          {/* 描述 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">描述</label>
            <Input
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="数据库用途说明"
            />
          </div>

          {/* 官网链接 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">官网链接</label>
            <Input
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://example.com"
            />
            <p className="text-xs text-fg-muted mt-1">数据库官方网站地址（可选）</p>
          </div>

          {/* 文件路径 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">文件路径 *</label>
            <Input
              value={formData.path}
              onChange={(e) => handleChange('path', e.target.value)}
              placeholder="/data/vep/database_name"
              required
            />
            <p className="text-xs text-fg-muted mt-1">数据库文件在服务器上的存储路径</p>
          </div>

          {/* VEP 参数 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg-default mb-2">VEP 注释参数 *</label>
            <TextArea
              value={formData.vepParams}
              onChange={(e) => handleChange('vepParams', e.target.value)}
              placeholder="--custom file=...,short_name=...,format=vcf,type=exact,coords=0,fields=..."
              rows={3}
              required
            />
            <p className="text-xs text-fg-muted mt-1">VEP 运行时使用的 --custom 或 --plugin 参数</p>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!formData.name || !formData.version || !formData.path || !formData.vepParams}
          >
            {mode === 'add' ? '添加' : '保存'}
          </Button>
        </div>
      </div>
    </div>
  );
}


export default function DatabaseManagementPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [databases, setDatabases] = React.useState<AnnotationDatabase[]>(initialDatabases);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'add' | 'edit'>('add');
  const [editingDatabase, setEditingDatabase] = React.useState<AnnotationDatabase | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AnnotationDatabase | null>(null);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingDatabase(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (db: AnnotationDatabase) => {
    setModalMode('edit');
    setEditingDatabase(db);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDatabase(null);
  };

  const handleSubmit = (data: DatabaseFormData) => {
    if (modalMode === 'add') {
      const newDatabase: AnnotationDatabase = {
        id: String(Date.now()),
        name: data.name,
        version: data.version,
        description: data.description || `${data.name} 注释数据库`,
        path: data.path,
        vepParams: data.vepParams,
        website: data.website || undefined,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setDatabases(prev => [...prev, newDatabase]);
    } else if (editingDatabase) {
      setDatabases(prev => prev.map(db => {
        if (db.id === editingDatabase.id) {
          return {
            ...db,
            name: data.name,
            version: data.version,
            description: data.description || db.description,
            path: data.path,
            vepParams: data.vepParams,
            website: data.website || undefined,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return db;
      }));
    }
  };

  const handleDeleteClick = (db: AnnotationDatabase) => {
    setDeleteTarget(db);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      setDatabases(prev => prev.filter(d => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const filteredDatabases = React.useMemo(() => {
    if (!searchQuery) return databases;
    const query = searchQuery.toLowerCase();
    return databases.filter(
      (db) =>
        db.name.toLowerCase().includes(query) ||
        db.description.toLowerCase().includes(query)
    );
  }, [searchQuery, databases]);

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">数据库管理</h2>

      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
        <p className="text-sm text-fg-muted">
          管理 VEP 变异注释所需的自定义数据库。配置数据库名称、版本、文件路径及对应的 VEP 注释参数。
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="w-64">
          <Input
            placeholder="搜索数据库..."
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
          添加数据库
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredDatabases.map((db) => (
          <div
            key={db.id}
            className="p-4 bg-canvas-default rounded-lg border border-border hover:border-border-muted transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-4 h-4 text-fg-muted shrink-0" />
                  <h3 className="text-base font-medium text-fg-default">{db.name}</h3>
                  <Tag variant="neutral">{db.version}</Tag>
                  {db.website && (
                    <a
                      href={db.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                      title="访问官网"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-sm text-fg-muted mb-3">{db.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-fg-muted shrink-0 w-16">路径:</span>
                    <code className="text-xs bg-canvas-subtle px-1.5 py-0.5 rounded font-mono text-fg-default break-all">
                      {db.path}
                    </code>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-fg-muted shrink-0 w-16">VEP 参数:</span>
                    <code className="text-xs bg-canvas-subtle px-1.5 py-0.5 rounded font-mono text-fg-default break-all">
                      {db.vepParams}
                    </code>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-fg-muted mt-3">
                  <span>创建: {db.createdAt}</span>
                  <span>更新: {db.updatedAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4 shrink-0">
                <button
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  title="编辑"
                  onClick={() => handleOpenEditModal(db)}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors"
                  title="删除"
                  onClick={() => handleDeleteClick(db)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DatabaseModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={editingDatabase ? {
          name: editingDatabase.name,
          version: editingDatabase.version,
          description: editingDatabase.description,
          path: editingDatabase.path,
          vepParams: editingDatabase.vepParams,
          website: editingDatabase.website || '',
        } : undefined}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        databaseName={deleteTarget?.name || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </PageContent>
  );
}
