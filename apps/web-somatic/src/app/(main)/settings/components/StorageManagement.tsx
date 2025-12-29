'use client';

import * as React from 'react';
import {
  Button,
  Input,
  Select,
  FormItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DataTable,
  Tag,
  type Column,
} from '@schema/ui-kit';
import { Plus, Pencil, Trash2, HardDrive, Cloud, Server, TestTube2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type StorageProtocol = 'webdav' | 's3' | 'smb';
type StorageStatus = 'connected' | 'disconnected' | 'error';

interface StorageSource {
  id: string;
  name: string;
  protocol: StorageProtocol;
  endpoint: string;
  basePath: string;
  username?: string;
  status: StorageStatus;
  createdAt: string;
}

// Mock 数据
const mockStorageSources: StorageSource[] = [
  {
    id: '1',
    name: 'NAS 存储',
    protocol: 'webdav',
    endpoint: 'https://nas.example.com/webdav',
    basePath: '/sequencing',
    username: 'admin',
    status: 'connected',
    createdAt: '2024-12-01',
  },
  {
    id: '2',
    name: 'S3 数据桶',
    protocol: 's3',
    endpoint: 's3://genomics-data',
    basePath: '/raw-data',
    status: 'connected',
    createdAt: '2024-12-10',
  },
  {
    id: '3',
    name: '共享文件夹',
    protocol: 'smb',
    endpoint: '//fileserver/genomics',
    basePath: '/incoming',
    username: 'bioinfo',
    status: 'disconnected',
    createdAt: '2024-12-15',
  },
];

const protocolOptions = [
  { value: 'webdav', label: 'WebDAV' },
  { value: 's3', label: 'Amazon S3 / MinIO' },
  { value: 'smb', label: 'SMB / CIFS (Windows 共享)' },
];

const protocolIcons: Record<StorageProtocol, React.ReactNode> = {
  webdav: <HardDrive className="w-4 h-4" />,
  s3: <Cloud className="w-4 h-4" />,
  smb: <Server className="w-4 h-4" />,
};

const statusConfig: Record<StorageStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  connected: { label: '已连接', variant: 'success' },
  disconnected: { label: '未连接', variant: 'warning' },
  error: { label: '错误', variant: 'danger' },
};

interface FormData {
  name: string;
  protocol: StorageProtocol;
  endpoint: string;
  basePath: string;
  username: string;
  password: string;
  accessKey: string;
  secretKey: string;
  region: string;
}

const initialFormData: FormData = {
  name: '',
  protocol: 'webdav',
  endpoint: '',
  basePath: '/',
  username: '',
  password: '',
  accessKey: '',
  secretKey: '',
  region: '',
};

export function StorageManagement() {
  const [sources, setSources] = React.useState<StorageSource[]>(mockStorageSources);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<FormData>(initialFormData);
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<'success' | 'error' | null>(null);

  const handleAdd = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setTestResult(null);
    setIsModalOpen(true);
  };

  const handleEdit = (source: StorageSource) => {
    setEditingId(source.id);
    setFormData({
      name: source.name,
      protocol: source.protocol,
      endpoint: source.endpoint,
      basePath: source.basePath,
      username: source.username || '',
      password: '',
      accessKey: '',
      secretKey: '',
      region: '',
    });
    setTestResult(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此存储源吗？')) {
      setSources((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    // 模拟测试连接
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTestResult(Math.random() > 0.3 ? 'success' : 'error');
    setTesting(false);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.endpoint) return;

    if (editingId) {
      setSources((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: formData.name,
                protocol: formData.protocol,
                endpoint: formData.endpoint,
                basePath: formData.basePath,
                username: formData.username || undefined,
              }
            : s
        )
      );
    } else {
      const newSource: StorageSource = {
        id: String(Date.now()),
        name: formData.name,
        protocol: formData.protocol,
        endpoint: formData.endpoint,
        basePath: formData.basePath,
        username: formData.username || undefined,
        status: 'disconnected',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setSources((prev) => [...prev, newSource]);
    }

    setIsModalOpen(false);
  };

  const columns: Column<StorageSource>[] = [
    {
      id: 'name',
      header: '名称',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-fg-muted">{protocolIcons[row.protocol]}</span>
          <span className="font-medium text-fg-default">{row.name}</span>
        </div>
      ),
      width: 180,
    },
    {
      id: 'protocol',
      header: '协议',
      accessor: (row) => protocolOptions.find((p) => p.value === row.protocol)?.label || row.protocol,
      width: 120,
    },
    {
      id: 'endpoint',
      header: '连接地址',
      accessor: (row) => (
        <span className="font-mono text-sm text-fg-muted">{row.endpoint}</span>
      ),
      width: 250,
    },
    {
      id: 'basePath',
      header: '基础路径',
      accessor: (row) => (
        <span className="font-mono text-sm text-fg-muted">{row.basePath}</span>
      ),
      width: 120,
    },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => {
        const config = statusConfig[row.status];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 100,
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
            aria-label="编辑"
            onClick={() => handleEdit(row)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="small"
            iconOnly
            aria-label="删除"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="w-4 h-4 text-danger-fg" />
          </Button>
        </div>
      ),
      width: 100,
    },
  ];

  // 根据协议显示不同的认证字段
  const renderAuthFields = () => {
    if (formData.protocol === 's3') {
      return (
        <>
          <FormItem label="Access Key">
            <Input
              value={formData.accessKey}
              onChange={(e) => setFormData((prev) => ({ ...prev, accessKey: e.target.value }))}
              placeholder="AWS Access Key ID"
            />
          </FormItem>
          <FormItem label="Secret Key">
            <Input
              type="password"
              value={formData.secretKey}
              onChange={(e) => setFormData((prev) => ({ ...prev, secretKey: e.target.value }))}
              placeholder="AWS Secret Access Key"
            />
          </FormItem>
          <FormItem label="Region">
            <Input
              value={formData.region}
              onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
              placeholder="如 us-east-1（可选）"
            />
          </FormItem>
        </>
      );
    }

    return (
      <>
        <FormItem label="用户名">
          <Input
            value={formData.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="连接用户名（可选）"
          />
        </FormItem>
        <FormItem label="密码">
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="连接密码（可选）"
          />
        </FormItem>
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">
          配置数据存储源，用于在数据管理中浏览和导入测序数据文件。
        </p>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleAdd}>
          添加存储源
        </Button>
      </div>

      <DataTable data={sources} columns={columns} rowKey="id" density="default" />

      {/* 添加/编辑弹窗 */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen} size="medium">
        <ModalHeader>{editingId ? '编辑存储源' : '添加存储源'}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <FormItem label="名称" required>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="存储源显示名称"
              />
            </FormItem>

            <FormItem label="协议类型" required>
              <Select
                value={formData.protocol}
                onChange={(value) => {
                  if (typeof value === 'string') {
                    setFormData((prev) => ({ ...prev, protocol: value as StorageProtocol }));
                  }
                }}
                options={protocolOptions}
              />
            </FormItem>

            <FormItem
              label="连接地址"
              required
              hint={
                formData.protocol === 'webdav'
                  ? '如 https://nas.example.com/webdav'
                  : formData.protocol === 's3'
                  ? '如 s3://bucket-name 或 https://minio.example.com'
                  : '如 //server/share'
              }
            >
              <Input
                value={formData.endpoint}
                onChange={(e) => setFormData((prev) => ({ ...prev, endpoint: e.target.value }))}
                placeholder="输入连接地址"
              />
            </FormItem>

            <FormItem label="基础路径" hint="浏览时的起始目录">
              <Input
                value={formData.basePath}
                onChange={(e) => setFormData((prev) => ({ ...prev, basePath: e.target.value }))}
                placeholder="/"
              />
            </FormItem>

            <div className="border-t border-border-default pt-4">
              <h4 className="text-sm font-medium text-fg-default mb-3">认证信息</h4>
              {renderAuthFields()}
            </div>

            {/* 测试连接 */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="small"
                leftIcon={testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube2 className="w-4 h-4" />}
                onClick={handleTestConnection}
                disabled={testing || !formData.endpoint}
              >
                {testing ? '测试中...' : '测试连接'}
              </Button>
              {testResult === 'success' && (
                <span className="flex items-center gap-1 text-sm text-success-fg">
                  <CheckCircle className="w-4 h-4" />
                  连接成功
                </span>
              )}
              {testResult === 'error' && (
                <span className="flex items-center gap-1 text-sm text-danger-fg">
                  <XCircle className="w-4 h-4" />
                  连接失败
                </span>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.endpoint}
          >
            {editingId ? '保存' : '添加'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
