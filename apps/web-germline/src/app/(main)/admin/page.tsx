'use client';

import * as React from 'react';
import { PageContent } from '@/components/layout';
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
  Checkbox,
  type Column,
} from '@schema/ui-kit';
import { Plus, Pencil, Trash2, Users, FolderOutput, FolderInput, Bot, Save, Eye, EyeOff, TestTube2, CheckCircle, XCircle, Loader2, KeyRound } from 'lucide-react';

// 角色定义
const ROLES = [
  { id: 'admin', name: '管理员', description: '拥有所有权限，可管理用户和系统配置' },
  { id: 'interpreter', name: '解读工程师', description: '可对任务结果进行调整和审核' },
  { id: 'bioinformatics', name: '生信工程师', description: '可对流程中心中的配置进行修改' },
] as const;

type RoleId = typeof ROLES[number]['id'];

// 按需分配的权限
const ASSIGNABLE_PERMISSIONS = [
  { id: 'task_submit', name: '任务投递', category: '任务操作' },
  { id: 'data_upload', name: '数据上传', category: '数据操作' },
  { id: 'data_download', name: '数据下载', category: '数据操作' },
  { id: 'report_generate', name: '生成报告', category: '报告操作' },
] as const;

type AssignablePermissionId = typeof ASSIGNABLE_PERMISSIONS[number]['id'];

// 组织账户接口
interface OrganizationAccount {
  id: string;
  username: string;
  displayName: string;
  role: RoleId;
  additionalPermissions: AssignablePermissionId[];
  createdAt: string;
}

// 系统配置接口
interface SystemConfig {
  outputBasePath: string;
  rawDataPath: string;
  openaiApiEndpoint: string;
  openaiApiKey: string;
  openaiModel: string;
  aiAssistantEnabled: boolean;
}

// Mock 数据
const mockAccounts: OrganizationAccount[] = [
  {
    id: '1',
    username: 'admin',
    displayName: '管理员',
    role: 'admin',
    additionalPermissions: [],
    createdAt: '2024-01-01 09:00:00',
  },
  {
    id: '2',
    username: 'interpreter_zhang',
    displayName: '解读工程师张三',
    role: 'interpreter',
    additionalPermissions: ['task_submit', 'data_upload'],
    createdAt: '2024-06-15 10:30:00',
  },
  {
    id: '3',
    username: 'bioinfo_wang',
    displayName: '生信工程师王五',
    role: 'bioinformatics',
    additionalPermissions: ['data_upload', 'data_download'],
    createdAt: '2024-08-20 14:15:00',
  },
];

const roleConfig: Record<RoleId, { label: string; variant: 'warning' | 'success' | 'info' }> = {
  admin: { label: '管理员', variant: 'warning' },
  interpreter: { label: '解读工程师', variant: 'success' },
  bioinformatics: { label: '生信工程师', variant: 'info' },
};

export default function AdminPage() {
  // 账户管理状态
  const [accounts, setAccounts] = React.useState<OrganizationAccount[]>(mockAccounts);
  const [isAccountModalOpen, setIsAccountModalOpen] = React.useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<OrganizationAccount | null>(null);
  const [accountForm, setAccountForm] = React.useState({
    username: '',
    displayName: '',
    role: 'interpreter' as RoleId,
    additionalPermissions: [] as AssignablePermissionId[],
    password: '',
  });

  // 系统配置状态
  const [config, setConfig] = React.useState<SystemConfig>({
    outputBasePath: '/data/results',
    rawDataPath: '/data/raw',
    openaiApiEndpoint: 'https://api.openai.com/v1',
    openaiApiKey: '',
    openaiModel: 'gpt-4',
    aiAssistantEnabled: true,
  });
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [testingApi, setTestingApi] = React.useState(false);
  const [apiTestResult, setApiTestResult] = React.useState<'success' | 'error' | null>(null);
  const [saving, setSaving] = React.useState(false);

  // 账户操作
  const handleAddAccount = () => {
    setEditingAccount(null);
    setAccountForm({ username: '', displayName: '', role: 'interpreter', additionalPermissions: [], password: '' });
    setIsAccountModalOpen(true);
  };

  const handleEditAccount = (account: OrganizationAccount) => {
    setEditingAccount(account);
    setAccountForm({
      username: account.username,
      displayName: account.displayName,
      role: account.role,
      additionalPermissions: [...account.additionalPermissions],
      password: '',
    });
    setIsAccountModalOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('确定要删除此账户吗？')) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  const handlePermissionToggle = (permissionId: AssignablePermissionId) => {
    setAccountForm((prev) => ({
      ...prev,
      additionalPermissions: prev.additionalPermissions.includes(permissionId)
        ? prev.additionalPermissions.filter((p) => p !== permissionId)
        : [...prev.additionalPermissions, permissionId],
    }));
  };

  const handleSubmitAccount = () => {
    if (!accountForm.username || !accountForm.displayName) return;
    if (!editingAccount && !accountForm.password) {
      alert('请设置初始密码');
      return;
    }

    if (editingAccount) {
      setAccounts(prev => prev.map(a =>
        a.id === editingAccount.id
          ? {
              ...a,
              username: accountForm.username,
              displayName: accountForm.displayName,
              role: accountForm.role,
              additionalPermissions: accountForm.additionalPermissions,
            }
          : a
      ));
    } else {
      const newAccount: OrganizationAccount = {
        id: String(Date.now()),
        username: accountForm.username,
        displayName: accountForm.displayName,
        role: accountForm.role,
        additionalPermissions: accountForm.additionalPermissions,
        createdAt: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).replace(/\//g, '-'),
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
    { id: 'username', header: '用户名', accessor: 'username', width: 140, align: 'center' },
    { id: 'displayName', header: '显示名称', accessor: 'displayName', width: 150, align: 'center' },
    {
      id: 'role',
      header: '角色',
      accessor: (row) => {
        const cfg = roleConfig[row.role];
        return <Tag variant={cfg.variant}>{cfg.label}</Tag>;
      },
      width: 120,
      align: 'center',
    },
    {
      id: 'additionalPermissions',
      header: '附加权限',
      accessor: (row) => {
        if (row.role === 'admin') {
          return <span className="text-xs text-fg-muted">全部权限</span>;
        }
        if (row.additionalPermissions.length === 0) {
          return <span className="text-xs text-fg-muted">无</span>;
        }
        return (
          <div className="flex flex-wrap gap-1 justify-center">
            {row.additionalPermissions.map((p) => {
              const perm = ASSIGNABLE_PERMISSIONS.find(ap => ap.id === p);
              return (
                <Tag key={p} variant="neutral" className="text-xs">
                  {perm?.name || p}
                </Tag>
              );
            })}
          </div>
        );
      },
      width: 150,
      align: 'center',
    },
    { id: 'createdAt', header: '创建时间', accessor: 'createdAt', width: 160, align: 'center' },
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
            <KeyRound className="w-4 h-4" />
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
      width: 100,
      align: 'center',
    },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">管理中心</h2>
      <p className="text-sm text-fg-muted mb-6">
        管理组织账户、系统路径配置和 AI 服务配置。
      </p>

      <div className="space-y-8">
        {/* 权限规则说明 */}
        <div className="bg-canvas-subtle rounded-lg p-4 border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-3">权限规则说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-fg-muted">
            <div>
              <p className="font-medium text-fg-default mb-1">基础权限</p>
              <p>所有角色都可以查看所有页面</p>
            </div>
            <div>
              <p className="font-medium text-fg-default mb-1">解读工程师</p>
              <p>可对任务结果进行调整和审核</p>
            </div>
            <div>
              <p className="font-medium text-fg-default mb-1">生信工程师</p>
              <p>可对流程中心中的配置进行修改</p>
            </div>
            <div>
              <p className="font-medium text-fg-default mb-1">按需分配</p>
              <p>任务投递、数据上传等权限可单独授予</p>
            </div>
          </div>
        </div>

        {/* 组织账户管理 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-medium text-fg-default flex items-center gap-2">
                <Users className="w-5 h-5" />
                组织账户管理
              </h3>
              <p className="text-sm text-fg-muted mt-1">管理组织内的用户账户和权限角色</p>
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
          <div className="bg-canvas-default rounded-lg border border-border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg-default mb-1.5">结果输出主路径</label>
                <Input
                  value={config.outputBasePath}
                  onChange={(e) => setConfig(prev => ({ ...prev, outputBasePath: e.target.value }))}
                  placeholder="/data/results"
                  leftElement={<FolderOutput className="w-4 h-4" />}
                  className="w-full"
                />
                <p className="text-xs text-fg-muted mt-1">分析结果文件的存储根目录</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-default mb-1.5">原始数据路径</label>
                <Input
                  value={config.rawDataPath}
                  onChange={(e) => setConfig(prev => ({ ...prev, rawDataPath: e.target.value }))}
                  placeholder="/data/raw"
                  leftElement={<FolderInput className="w-4 h-4" />}
                  className="w-full"
                />
                <p className="text-xs text-fg-muted mt-1">测序原始数据的存储目录</p>
              </div>
            </div>
          </div>
        </section>

        {/* AI 配置 */}
        <section>
          <h3 className="text-base font-medium text-fg-default flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5" />
            OpenAI 兼容 API 配置
          </h3>
          <div className="bg-canvas-default rounded-lg border border-border p-4">
            {/* AI 助手开关 */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <div>
                <label className="text-sm font-medium text-fg-default">AI 助手</label>
                <p className="text-xs text-fg-muted mt-0.5">启用后可在任务详情中使用 AI 辅助解读功能</p>
              </div>
              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, aiAssistantEnabled: !prev.aiAssistantEnabled }))}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-emphasis focus:ring-offset-2
                  ${config.aiAssistantEnabled ? 'bg-accent-emphasis' : 'bg-neutral-emphasis'}
                `}
                role="switch"
                aria-checked={config.aiAssistantEnabled}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                    transition duration-200 ease-in-out
                    ${config.aiAssistantEnabled ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg-default mb-1.5">API 端点</label>
                <Input
                  value={config.openaiApiEndpoint}
                  onChange={(e) => setConfig(prev => ({ ...prev, openaiApiEndpoint: e.target.value }))}
                  placeholder="https://api.openai.com/v1"
                  className="w-full"
                  disabled={!config.aiAssistantEnabled}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-default mb-1.5">API Key</label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.openaiApiKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                    placeholder="sk-..."
                    className="w-full"
                    disabled={!config.aiAssistantEnabled}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-fg-muted hover:text-fg-default"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-default mb-1.5">模型名称</label>
                <Input
                  value={config.openaiModel}
                  onChange={(e) => setConfig(prev => ({ ...prev, openaiModel: e.target.value }))}
                  placeholder="gpt-4"
                  className="w-full"
                  disabled={!config.aiAssistantEnabled}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
              <Button
                variant="secondary"
                size="small"
                leftIcon={testingApi ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube2 className="w-4 h-4" />}
                onClick={handleTestApi}
                disabled={testingApi || !config.openaiApiEndpoint || !config.aiAssistantEnabled}
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
        <Modal open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen} size="medium">
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
              <FormItem label="角色" required hint="角色决定了用户的基础权限范围">
                <select
                  value={accountForm.role}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, role: e.target.value as RoleId }))}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-fg-default focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLES.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </FormItem>

              {/* 按需分配权限 */}
              {accountForm.role !== 'admin' && (
                <FormItem label="附加权限" hint="任务投递、数据上传等按需分配的权限">
                  <div className="grid grid-cols-2 gap-2">
                    {ASSIGNABLE_PERMISSIONS.map((permission) => (
                      <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={accountForm.additionalPermissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                        />
                        <span className="text-sm text-fg-default">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </FormItem>
              )}

              {accountForm.role === 'admin' && (
                <div className="bg-canvas-subtle rounded-md p-3 text-xs text-fg-muted">
                  <p>管理员自动拥有所有权限，无需额外配置附加权限</p>
                </div>
              )}

              {!editingAccount && (
                <FormItem label="初始密码" required>
                  <Input
                    type="password"
                    value={accountForm.password}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="请设置初始密码（至少6位）"
                  />
                </FormItem>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setIsAccountModalOpen(false)}>取消</Button>
            <Button variant="primary" onClick={handleSubmitAccount} disabled={!accountForm.username || !accountForm.displayName || (!editingAccount && accountForm.password.length < 6)}>
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
    </PageContent>
  );
}