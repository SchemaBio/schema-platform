'use client';

import * as React from 'react';
import {
  Button,
  Input,
  FormItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DataTable,
  Tag,
  type Column,
} from '@schema/ui-kit';
import { Plus, Pencil, Trash2, Users, FolderOutput, FolderInput, Bot, Save, Eye, EyeOff, TestTube2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// 组织账户接口
interface OrganizationAccount {
  id: string;
  username: string;
  displayName: string;
  role: 'admin' | 'analyst' | 'viewer';
  createdAt: string;
}

// 系统配置接口
interface SystemConfig {
  outputBasePath: string;
  rawDataPath: string;
  openaiApiEndpoint: string;
  openaiApiKey: string;
  openaiModel: string;
}

// Mock 数据
const mockAccounts: OrganizationAccount[] = [
  { id: '1', username: 'admin', displayName: '管理员', role: 'admin', createdAt: '2024-01-01' },
  { id: '2', username: 'analyst1', displayName: '分析师张三', role: 'analyst', createdAt: '2024-06-15' },
  { id: '3', username: 'viewer1', displayName: '查看员李四', role: 'viewer', createdAt: '2024-08-20' },
];

const roleOptions = [
  { value: 'admin', label: '管理员' },
  { value: 'analyst', label: '分析师' },
  { value: 'viewer', label: '查看员' },
];

const roleConfig: Record<OrganizationAccount['role'], { label: string; variant: 'success' | 'info' | 'neutral' }> = {
  admin: { label: '管理员', variant: 'success' },
  analyst: { label: '分析师', variant: 'info' },
  viewer: { label: '查看员', variant: 'neutral' },
};

export function StorageManagement() {
  // 账户管理状态
  const [accounts, setAccounts] = React.useState<OrganizationAccount[]>(mockAccounts);
  const [isAccountModalOpen, setIsAccountModalOpen] = React.useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<OrganizationAccount | null>(null);
  const [accountForm, setAccountForm] = React.useState({
    username: '',
    displayName: '',
    role: 'analyst' as OrganizationAccount['role'],
    password: '',
  });

  // 系统配置状态
  const [config, setConfig] = React.useState<SystemConfig>({
    outputBasePath: '/data/results',
    rawDataPath: '/data/raw',
    openaiApiEndpoint: 'https://api.openai.com/v1',
    openaiApiKey: '',
    openaiModel: 'gpt-4',
  });
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [testingApi, setTestingApi] = React.useState(false);
  const [apiTestResult, setApiTestResult] = React.useState<'success' | 'error' | null>(null);
  const [saving, setSaving] = React.useState(false);

  // 账户操作
  const handleAddAccount = () => {
    setEditingAccount(null);
    setAccountForm({ username: '', displayName: '', role: 'analyst', password: '' });
    setIsAccountModalOpen(true);
  };

  const handleEditAccount = (account: OrganizationAccount) => {
    setEditingAccount(account);
    setAccountForm({
      username: account.username,
      displayName: account.displayName,
      role: account.role,
      password: '',
    });
    setIsAccountModalOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('确定要删除此账户吗？')) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleSubmitAccount = () => {
    if (!accountForm.username || !accountForm.displayName) return;

    if (editingAccount) {
      setAccounts(prev => prev.map(a =>
        a.id === editingAccount.id
          ? { ...a, username: accountForm.username, displayName: accountForm.displayName, role: accountForm.role }
          : a
      ));
    } else {
      const newAccount: OrganizationAccount = {
        id: String(Date.now()),
        username: accountForm.username,
        displayName: accountForm.displayName,
        role: accountForm.role,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setAccounts(prev => [...prev, newAccount]);
    }
    setIsAccountModalOpen(false);
  };

  const handleChangePassword = (account: OrganizationAccount) => {
    setEditingAccount(account);
    setAccountForm(prev => ({ ...prev, password: '' }));
    setIsPasswordModalOpen(true);
  };

  const handleSubmitPassword = () => {
    if (!accountForm.password || accountForm.password.length < 6) {
      alert('密码长度至少6位');
      return;
    }
    // 模拟修改密码
    alert(`${editingAccount?.username} 的密码已修改`);
    setIsPasswordModalOpen(false);
    setAccountForm(prev => ({ ...prev, password: '' }));
  };

  // OpenAI API 测试
  const handleTestApi = async () => {
    if (!config.openaiApiEndpoint) return;
    setTestingApi(true);
    setApiTestResult(null);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setApiTestResult(Math.random() > 0.3 ? 'success' : 'error');
    setTestingApi(false);
  };

  // 保存配置
  const handleSaveConfig = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('配置已保存');
  };

  const accountColumns: Column<OrganizationAccount>[] = [
    { id: 'username', header: '用户名', accessor: 'username', width: 120, align: 'center' },
    { id: 'displayName', header: '显示名称', accessor: 'displayName', width: 150, align: 'center' },
    {
      id: 'role',
      header: '角色',
      accessor: (row) => {
        const cfg = roleConfig[row.role];
        return <Tag variant={cfg.variant}>{cfg.label}</Tag>;
      },
      width: 100,
      align: 'center',
    },
    { id: 'createdAt', header: '创建时间', accessor: 'createdAt', width: 120, align: 'center' },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-1">
          <button
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
            title="编辑"
            onClick={() => handleEditAccount(row)}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
            title="修改密码"
            onClick={() => handleChangePassword(row)}
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors"
            title="删除"
            onClick={() => handleDeleteAccount(row.id)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: 120,
      align: 'center',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 组织账户管理 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-medium text-fg-default flex items-center gap-2">
              <Users className="w-5 h-5" />
              组织账户管理
            </h3>
            <p className="text-sm text-fg-muted mt-1">管理组织内的用户账户和权限</p>
          </div>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleAddAccount}>
            添加账户
          </Button>
        </div>
        <DataTable data={accounts} columns={accountColumns} rowKey="id" density="default" striped />
      </section>

      {/* 路径配置 */}
      <section>
        <h3 className="text-base font-medium text-fg-default flex items-center gap-2 mb-4">
          <FolderOutput className="w-5 h-5" />
          路径配置
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <FormItem
            label="结果输出主路径"
            hint="分析结果文件的存储根目录"
          >
            <Input
              value={config.outputBasePath}
              onChange={(e) => setConfig(prev => ({ ...prev, outputBasePath: e.target.value }))}
              placeholder="/data/results"
              leftElement={<FolderOutput className="w-4 h-4" />}
            />
          </FormItem>
          <FormItem
            label="原始数据路径"
            hint="测序原始数据的存储目录"
          >
            <Input
              value={config.rawDataPath}
              onChange={(e) => setConfig(prev => ({ ...prev, rawDataPath: e.target.value }))}
              placeholder="/data/raw"
              leftElement={<FolderInput className="w-4 h-4" />}
            />
          </FormItem>
        </div>
      </section>

      {/* AI 配置 */}
      <section>
        <h3 className="text-base font-medium text-fg-default flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5" />
          OpenAI 兼容 API 配置
        </h3>
        <div className="space-y-4 max-w-2xl">
          <FormItem
            label="API 端点"
            hint="OpenAI 兼容的 API 服务地址"
          >
            <Input
              value={config.openaiApiEndpoint}
              onChange={(e) => setConfig(prev => ({ ...prev, openaiApiEndpoint: e.target.value }))}
              placeholder="https://api.openai.com/v1"
            />
          </FormItem>
          <FormItem
            label="API Key"
            hint="用于认证的 API 密钥"
          >
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={config.openaiApiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-fg-muted hover:text-fg-default"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </FormItem>
          <FormItem
            label="模型名称"
            hint="要使用的模型标识符"
          >
            <Input
              value={config.openaiModel}
              onChange={(e) => setConfig(prev => ({ ...prev, openaiModel: e.target.value }))}
              placeholder="gpt-4"
            />
          </FormItem>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="small"
              leftIcon={testingApi ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube2 className="w-4 h-4" />}
              onClick={handleTestApi}
              disabled={testingApi || !config.openaiApiEndpoint}
            >
              {testingApi ? '测试中...' : '测试连接'}
            </Button>
            {apiTestResult === 'success' && (
              <span className="flex items-center gap-1 text-sm text-success-fg">
                <CheckCircle className="w-4 h-4" />
                连接成功
              </span>
            )}
            {apiTestResult === 'error' && (
              <span className="flex items-center gap-1 text-sm text-danger-fg">
                <XCircle className="w-4 h-4" />
                连接失败
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 保存按钮 */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSaveConfig}
          loading={saving}
        >
          保存配置
        </Button>
      </div>

      {/* 添加/编辑账户弹窗 */}
      <Modal open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen} size="small">
        <ModalHeader>{editingAccount ? '编辑账户' : '添加账户'}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <FormItem label="用户名" required>
              <Input
                value={accountForm.username}
                onChange={(e) => setAccountForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="登录用户名"
              />
            </FormItem>
            <FormItem label="显示名称" required>
              <Input
                value={accountForm.displayName}
                onChange={(e) => setAccountForm(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="用户显示名称"
              />
            </FormItem>
            <FormItem label="角色" required>
              <select
                value={accountForm.role}
                onChange={(e) => setAccountForm(prev => ({ ...prev, role: e.target.value as OrganizationAccount['role'] }))}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-fg-default focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roleOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </FormItem>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsAccountModalOpen(false)}>取消</Button>
          <Button variant="primary" onClick={handleSubmitAccount} disabled={!accountForm.username || !accountForm.displayName}>
            {editingAccount ? '保存' : '添加'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* 修改密码弹窗 */}
      <Modal open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen} size="small">
        <ModalHeader>修改密码</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-fg-muted">
              为用户 <span className="font-medium text-fg-default">{editingAccount?.displayName}</span> 设置新密码
            </p>
            <FormItem label="新密码" required>
              <Input
                type="password"
                value={accountForm.password}
                onChange={(e) => setAccountForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="请输入新密码（至少6位）"
              />
            </FormItem>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsPasswordModalOpen(false)}>取消</Button>
          <Button variant="primary" onClick={handleSubmitPassword} disabled={accountForm.password.length < 6}>
            确认修改
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}