'use client';

import * as React from 'react';
import { PageContent } from '@/components/layout';
import {
  Button,
  Input,
  DataTable,
  Tag,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormItem,
  Select,
  TextArea,
  type Column,
} from '@schema/ui-kit';
import { Plus, Search, Pencil, Trash2, Copy, Eye, FileText, Upload, X, Link, TestTube2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type TemplateType = 'wes' | 'wgs' | 'panel' | 'cnv';
type TemplateStatus = 'active' | 'draft' | 'archived';

interface ReportTemplate {
  id: string;
  name: string;
  type: TemplateType;
  description: string;
  version: string;
  status: TemplateStatus;
  templateFile?: string;      // docx 文件名
  apiEndpoint?: string;       // RESTful API 端点
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const mockTemplates: ReportTemplate[] = [
  {
    id: 'TPL001',
    name: '全外显子遗传病报告',
    type: 'wes',
    description: '适用于WES遗传病检测的标准报告模板',
    version: 'v2.1',
    status: 'active',
    templateFile: 'wes_germline_report_v2.docx',
    apiEndpoint: 'https://api.example.com/reports/wes/generate',
    createdBy: '张三',
    createdAt: '2024-06-15',
    updatedAt: '2024-12-01',
  },
  {
    id: 'TPL002',
    name: '心血管Panel报告',
    type: 'panel',
    description: '心血管疾病基因检测专用报告模板',
    version: 'v1.3',
    status: 'active',
    templateFile: 'cardio_panel_report.docx',
    apiEndpoint: 'https://api.example.com/reports/panel/cardio',
    createdBy: '李四',
    createdAt: '2024-08-20',
    updatedAt: '2024-11-15',
  },
  {
    id: 'TPL003',
    name: 'CNV检测报告',
    type: 'cnv',
    description: '拷贝数变异检测报告模板',
    version: 'v1.0',
    status: 'active',
    templateFile: 'cnv_report_template.docx',
    apiEndpoint: 'https://api.example.com/reports/cnv/generate',
    createdBy: '王五',
    createdAt: '2024-10-01',
    updatedAt: '2024-10-01',
  },
  {
    id: 'TPL004',
    name: 'WGS全基因组报告',
    type: 'wgs',
    description: '全基因组测序报告模板（草稿）',
    version: 'v0.1',
    status: 'draft',
    createdBy: '张三',
    createdAt: '2024-12-10',
    updatedAt: '2024-12-10',
  },
  {
    id: 'TPL005',
    name: '旧版WES报告',
    type: 'wes',
    description: '已归档的旧版报告模板',
    version: 'v1.0',
    status: 'archived',
    templateFile: 'wes_report_legacy.docx',
    apiEndpoint: 'https://api.example.com/reports/wes/legacy',
    createdBy: '李四',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
];

const typeOptions = [
  { value: 'wes', label: 'WES (全外显子)' },
  { value: 'wgs', label: 'WGS (全基因组)' },
  { value: 'panel', label: 'Panel (基因包)' },
  { value: 'cnv', label: 'CNV (拷贝数变异)' },
];

const statusOptions = [
  { value: 'active', label: '启用' },
  { value: 'draft', label: '草稿' },
  { value: 'archived', label: '归档' },
];

const typeConfig: Record<TemplateType, { label: string; variant: 'info' | 'success' | 'warning' | 'neutral' }> = {
  wes: { label: 'WES', variant: 'info' },
  wgs: { label: 'WGS', variant: 'success' },
  panel: { label: 'Panel', variant: 'warning' },
  cnv: { label: 'CNV', variant: 'neutral' },
};

const statusConfig: Record<TemplateStatus, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  active: { label: '启用', variant: 'success' },
  draft: { label: '草稿', variant: 'warning' },
  archived: { label: '归档', variant: 'neutral' },
};

interface FormData {
  name: string;
  type: TemplateType;
  description: string;
  status: TemplateStatus;
  templateFile: File | null;
  templateFileName: string;
  apiEndpoint: string;
}

const initialFormData: FormData = {
  name: '',
  type: 'wes',
  description: '',
  status: 'draft',
  templateFile: null,
  templateFileName: '',
  apiEndpoint: '',
};

export default function ReportTemplatesPage() {
  const [templates, setTemplates] = React.useState<ReportTemplate[]>(mockTemplates);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<FormData>(initialFormData);
  const [testingApi, setTestingApi] = React.useState(false);
  const [apiTestResult, setApiTestResult] = React.useState<'success' | 'error' | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredTemplates = React.useMemo(() => {
    if (!searchQuery) return templates;
    const query = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
    );
  }, [templates, searchQuery]);

  const handleAdd = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setApiTestResult(null);
    setIsModalOpen(true);
  };

  const handleEdit = (template: ReportTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      type: template.type,
      description: template.description,
      status: template.status,
      templateFile: null,
      templateFileName: template.templateFile || '',
      apiEndpoint: template.apiEndpoint || '',
    });
    setApiTestResult(null);
    setIsModalOpen(true);
  };

  const handleDuplicate = (template: ReportTemplate) => {
    const newTemplate: ReportTemplate = {
      ...template,
      id: `TPL${String(templates.length + 1).padStart(3, '0')}`,
      name: `${template.name} (副本)`,
      version: 'v0.1',
      status: 'draft',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setTemplates((prev) => [newTemplate, ...prev]);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此报告模板吗？')) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.name.endsWith('.docx')) {
        alert('请上传 .docx 格式的文件');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        templateFile: file,
        templateFileName: file.name,
      }));
    }
    // 重置 input
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      templateFile: null,
      templateFileName: '',
    }));
  };

  const handleTestApi = async () => {
    if (!formData.apiEndpoint) return;
    
    setTestingApi(true);
    setApiTestResult(null);
    
    // 模拟 API 测试
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // 简单验证 URL 格式
    try {
      new URL(formData.apiEndpoint);
      setApiTestResult(Math.random() > 0.2 ? 'success' : 'error');
    } catch {
      setApiTestResult('error');
    }
    
    setTestingApi(false);
  };

  const handleSubmit = () => {
    if (!formData.name) return;
    // 新建时必须上传模板文件
    if (!editingId && !formData.templateFile) {
      alert('请上传报告模板文件');
      return;
    }

    if (editingId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                name: formData.name,
                type: formData.type,
                description: formData.description,
                status: formData.status,
                templateFile: formData.templateFileName || t.templateFile,
                apiEndpoint: formData.apiEndpoint || t.apiEndpoint,
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : t
        )
      );
    } else {
      const newTemplate: ReportTemplate = {
        id: `TPL${String(templates.length + 1).padStart(3, '0')}`,
        name: formData.name,
        type: formData.type,
        description: formData.description,
        version: 'v0.1',
        status: formData.status,
        templateFile: formData.templateFileName,
        apiEndpoint: formData.apiEndpoint,
        createdBy: '当前用户',
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      setTemplates((prev) => [newTemplate, ...prev]);
    }

    setIsModalOpen(false);
  };

  const columns: Column<ReportTemplate>[] = [
    {
      id: 'name',
      header: '模板名称',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-fg-muted" />
          <span className="font-medium text-fg-default">{row.name}</span>
        </div>
      ),
      width: 200,
    },
    {
      id: 'type',
      header: '类型',
      accessor: (row) => {
        const config = typeConfig[row.type];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 80,
    },
    {
      id: 'version',
      header: '版本',
      accessor: 'version',
      width: 70,
    },
    {
      id: 'templateFile',
      header: '模板文件',
      accessor: (row) => (
        <span className="text-sm text-fg-muted font-mono">
          {row.templateFile || '-'}
        </span>
      ),
      width: 180,
    },
    {
      id: 'apiEndpoint',
      header: 'API 端点',
      accessor: (row) => (
        <span className="text-sm text-fg-muted font-mono truncate block max-w-[200px]" title={row.apiEndpoint}>
          {row.apiEndpoint || '-'}
        </span>
      ),
      width: 200,
    },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => {
        const config = statusConfig[row.status];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 80,
    },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="small"
            iconOnly
            aria-label="预览"
            onClick={() => console.log('Preview', row.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="small"
            iconOnly
            aria-label="编辑"
            onClick={() => handleEdit(row)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="small"
            iconOnly
            aria-label="复制"
            onClick={() => handleDuplicate(row)}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="small"
            iconOnly
            aria-label="删除"
            onClick={() => handleDelete(row.id)}
            disabled={row.status === 'active'}
          >
            <Trash2 className="w-4 h-4 text-danger-fg" />
          </Button>
        </div>
      ),
      width: 150,
    },
  ];

  const isFormValid = formData.name && (editingId || formData.templateFile);

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">报告模板管理</h2>

      <div className="flex items-center justify-between mb-4">
        <div className="w-64">
          <Input
            placeholder="搜索模板..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleAdd}>
          新建模板
        </Button>
      </div>

      <DataTable
        data={filteredTemplates}
        columns={columns}
        rowKey="id"
        density="default"
        striped
      />

      {/* 新建/编辑弹窗 */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen} size="medium">
        <ModalHeader>{editingId ? '编辑报告模板' : '新建报告模板'}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <FormItem label="模板名称" required>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="输入模板名称"
              />
            </FormItem>

            <FormItem label="模板类型" required>
              <Select
                value={formData.type}
                onChange={(value) => {
                  if (typeof value === 'string') {
                    setFormData((prev) => ({ ...prev, type: value as TemplateType }));
                  }
                }}
                options={typeOptions}
              />
            </FormItem>

            <FormItem label="描述">
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="输入模板描述"
                rows={2}
              />
            </FormItem>

            {/* 模板文件上传 */}
            <FormItem label="模板文件" required={!editingId} hint="上传 .docx 格式的报告模板文件">
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              {formData.templateFileName ? (
                <div className="flex items-center gap-2 p-2 bg-canvas-subtle rounded-md border border-border-default">
                  <FileText className="w-4 h-4 text-accent-fg" />
                  <span className="flex-1 text-sm text-fg-default truncate">
                    {formData.templateFileName}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border-default rounded-md hover:border-accent-emphasis hover:bg-canvas-subtle transition-colors"
                >
                  <Upload className="w-5 h-5 text-fg-muted" />
                  <span className="text-sm text-fg-muted">点击上传模板文件</span>
                </button>
              )}
            </FormItem>

            {/* API 端点配置 */}
            <FormItem label="报告生成 API" hint="配置生成报告的 RESTful API 端点">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={formData.apiEndpoint}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, apiEndpoint: e.target.value }));
                      setApiTestResult(null);
                    }}
                    placeholder="https://api.example.com/reports/generate"
                    leftElement={<Link className="w-4 h-4" />}
                    className="flex-1"
                  />
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={handleTestApi}
                    disabled={testingApi || !formData.apiEndpoint}
                  >
                    {testingApi ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {apiTestResult && (
                  <div className={`flex items-center gap-1 text-sm ${apiTestResult === 'success' ? 'text-success-fg' : 'text-danger-fg'}`}>
                    {apiTestResult === 'success' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>API 连接成功</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>API 连接失败，请检查地址</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </FormItem>

            <FormItem label="状态">
              <Select
                value={formData.status}
                onChange={(value) => {
                  if (typeof value === 'string') {
                    setFormData((prev) => ({ ...prev, status: value as TemplateStatus }));
                  }
                }}
                options={statusOptions}
              />
            </FormItem>

            <div className="bg-canvas-subtle rounded-md p-3 text-xs text-fg-muted">
              <p className="font-medium text-fg-default mb-1">提示</p>
              <ul className="list-disc list-inside space-y-1">
                <li>模板文件使用 .docx 格式，支持变量占位符</li>
                <li>API 端点用于调用后端服务生成报告</li>
                <li>启用前请确保模板文件和 API 配置正确</li>
              </ul>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isFormValid}>
            {editingId ? '保存' : '创建'}
          </Button>
        </ModalFooter>
      </Modal>
    </PageContent>
  );
}
