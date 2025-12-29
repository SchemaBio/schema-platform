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
  TextArea,
  type Column,
} from '@schema/ui-kit';
import { Plus, Search, Pencil, Trash2, FileText, Link, TestTube2, CheckCircle, XCircle, Loader2, Eye, EyeOff, AlertTriangle, Power, PowerOff } from 'lucide-react';

type TemplateStatus = 'active' | 'draft' | 'archived';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  apiEndpoint: string;
  apiToken?: string;
  status: TemplateStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const mockTemplates: ReportTemplate[] = [
  {
    id: 'TPL001',
    name: 'wes-germline-report',
    description: '全外显子遗传病检测报告模板',
    apiEndpoint: 'https://api.example.com/reports/wes/generate',
    apiToken: 'sk-xxxx****xxxx',
    status: 'active',
    createdBy: '张三',
    createdAt: '2024-06-15',
    updatedAt: '2024-12-01',
  },
  {
    id: 'TPL002',
    name: 'cardio-panel-report',
    description: '心血管疾病基因检测专用报告',
    apiEndpoint: 'https://api.example.com/reports/panel/cardio',
    status: 'active',
    createdBy: '李四',
    createdAt: '2024-08-20',
    updatedAt: '2024-11-15',
  },
  {
    id: 'TPL003',
    name: 'cnv-detection-report',
    description: '拷贝数变异检测报告',
    apiEndpoint: 'https://api.example.com/reports/cnv/generate',
    apiToken: 'token-yyyy****yyyy',
    status: 'active',
    createdBy: '王五',
    createdAt: '2024-10-01',
    updatedAt: '2024-10-01',
  },
  {
    id: 'TPL004',
    name: 'wgs-full-report',
    description: '全基因组测序报告（开发中）',
    apiEndpoint: 'https://api.example.com/reports/wgs',
    status: 'draft',
    createdBy: '张三',
    createdAt: '2024-12-10',
    updatedAt: '2024-12-10',
  },
];

const statusConfig: Record<TemplateStatus, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  active: { label: '启用', variant: 'success' },
  draft: { label: '草稿', variant: 'warning' },
  archived: { label: '归档', variant: 'neutral' },
};

interface FormData {
  name: string;
  description: string;
  apiEndpoint: string;
  apiToken: string;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  apiEndpoint: '',
  apiToken: '',
};

export default function ReportTemplatesPage() {
  const [templates, setTemplates] = React.useState<ReportTemplate[]>(mockTemplates);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<FormData>(initialFormData);
  const [testingApi, setTestingApi] = React.useState(false);
  const [apiTestResult, setApiTestResult] = React.useState<'success' | 'error' | null>(null);
  const [showToken, setShowToken] = React.useState(false);
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ReportTemplate | null>(null);

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

  // 检查名称是否唯一
  const validateName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('请输入模板名称');
      return false;
    }
    const exists = templates.some(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase() && t.id !== editingId
    );
    if (exists) {
      setNameError('模板名称已存在');
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setApiTestResult(null);
    setShowToken(false);
    setNameError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (template: ReportTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      description: template.description,
      apiEndpoint: template.apiEndpoint,
      apiToken: template.apiToken || '',
    });
    setApiTestResult(null);
    setShowToken(false);
    setNameError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (template: ReportTemplate) => {
    setDeleteTarget(template);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const handleToggleStatus = (template: ReportTemplate) => {
    const newStatus: TemplateStatus = template.status === 'active' ? 'archived' : 'active';
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === template.id
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString().slice(0, 10) }
          : t
      )
    );
  };

  const handleTestApi = async () => {
    if (!formData.apiEndpoint) return;

    setTestingApi(true);
    setApiTestResult(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      new URL(formData.apiEndpoint);
      setApiTestResult(Math.random() > 0.2 ? 'success' : 'error');
    } catch {
      setApiTestResult('error');
    }

    setTestingApi(false);
  };

  const handleSubmit = () => {
    if (!validateName(formData.name)) return;
    if (!formData.apiEndpoint) return;

    if (editingId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                name: formData.name.trim(),
                description: formData.description,
                apiEndpoint: formData.apiEndpoint,
                apiToken: formData.apiToken || undefined,
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : t
        )
      );
    } else {
      const newTemplate: ReportTemplate = {
        id: `TPL${String(templates.length + 1).padStart(3, '0')}`,
        name: formData.name.trim(),
        description: formData.description,
        apiEndpoint: formData.apiEndpoint,
        apiToken: formData.apiToken || undefined,
        status: 'draft',
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
          <span className="font-medium font-mono text-fg-default">{row.name}</span>
        </div>
      ),
      width: 200,
    },
    {
      id: 'description',
      header: '描述',
      accessor: (row) => (
        <span className="text-fg-muted text-sm">{row.description || '-'}</span>
      ),
      width: 250,
    },
    {
      id: 'apiEndpoint',
      header: 'API 端点',
      accessor: (row) => (
        <span className="text-sm text-fg-muted font-mono truncate block max-w-[250px]" title={row.apiEndpoint}>
          {row.apiEndpoint}
        </span>
      ),
      width: 260,
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
      id: 'updatedAt',
      header: '更新时间',
      accessor: 'updatedAt',
      width: 100,
    },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="small"
            iconOnly
            aria-label="编辑"
            onClick={() => handleEdit(row)}
            leftIcon={<Pencil className="w-4 h-4" />}
          />
          <Button
            variant="danger"
            size="small"
            iconOnly
            aria-label="删除"
            onClick={() => handleDelete(row)}
            disabled={row.status === 'active'}
            leftIcon={<Trash2 className="w-4 h-4" />}
          />
          <Button
            variant={row.status === 'active' ? 'secondary' : 'primary'}
            size="small"
            iconOnly
            aria-label={row.status === 'active' ? '停用' : '启用'}
            onClick={() => handleToggleStatus(row)}
            leftIcon={row.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          />
        </div>
      ),
      width: 130,
    },
  ];

  const isFormValid = formData.name.trim() && formData.apiEndpoint && !nameError;

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
            <FormItem
              label="模板名称"
              required
              hint="唯一标识符，建议使用英文和连字符"
              error={nameError || undefined}
            >
              <Input
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (nameError) validateName(e.target.value);
                }}
                onBlur={() => validateName(formData.name)}
                placeholder="如 wes-germline-report"
                error={!!nameError}
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

            <FormItem label="API 端点" required hint="报告生成服务的 RESTful API 地址">
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
                <div className={`flex items-center gap-1 text-sm mt-1 ${apiTestResult === 'success' ? 'text-success-fg' : 'text-danger-fg'}`}>
                  {apiTestResult === 'success' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>连接成功</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>连接失败</span>
                    </>
                  )}
                </div>
              )}
            </FormItem>

            <FormItem label="API Token" hint="访问令牌，不加密传输时可留空">
              <div className="relative">
                <Input
                  type={showToken ? 'text' : 'password'}
                  value={formData.apiToken}
                  onChange={(e) => setFormData((prev) => ({ ...prev, apiToken: e.target.value }))}
                  placeholder="可选，用于 API 认证"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-fg-muted hover:text-fg-default"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormItem>

            <div className="bg-canvas-subtle rounded-md p-3 text-xs text-fg-muted">
              <p className="font-medium text-fg-default mb-1">说明</p>
              <ul className="list-disc list-inside space-y-1">
                <li>模板名称必须唯一，用于系统内部标识</li>
                <li>API 端点需要实现报告生成接口规范</li>
                <li>新建模板默认为草稿状态，测试通过后可启用</li>
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

      {/* 删除确认弹窗 */}
      <Modal open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} size="small">
        <ModalHeader>删除确认</ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-danger-subtle flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-danger-fg" />
            </div>
            <p className="text-fg-default mb-2">确定要删除此报告模板吗？</p>
            {deleteTarget && (
              <p className="text-sm text-fg-muted font-mono bg-canvas-subtle px-2 py-1 rounded">
                {deleteTarget.name}
              </p>
            )}
            <p className="text-xs text-fg-muted mt-3">此操作不可撤销</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            取消
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            确认删除
          </Button>
        </ModalFooter>
      </Modal>
    </PageContent>
  );
}
