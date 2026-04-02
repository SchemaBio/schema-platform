'use client';

import * as React from 'react';
import { Button, Input, Select, FormItem, Modal, ModalHeader, ModalBody, ModalFooter, DataTable, Tag, Checkbox } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Plus, Pencil, Trash2, Search, Users, Shield } from 'lucide-react';

// 角色定义
export const ROLES = [
  { id: 'admin', name: '管理员', description: '拥有所有权限，可管理用户和系统配置' },
  { id: 'interpreter', name: '解读工程师', description: '可对任务结果进行调整和审核' },
  { id: 'bioinformatics', name: '生信工程师', description: '可对流程中心中的配置进行修改' },
] as const;

export type RoleId = typeof ROLES[number]['id'];

// 按需分配的权限（可单独授予给用户）
export const ASSIGNABLE_PERMISSIONS = [
  { id: 'task_submit', name: '任务投递', category: '任务操作' },
  { id: 'data_upload', name: '数据上传', category: '数据操作' },
  { id: 'data_download', name: '数据下载', category: '数据操作' },
  { id: 'report_generate', name: '生成报告', category: '报告操作' },
] as const;

export type AssignablePermissionId = typeof ASSIGNABLE_PERMISSIONS[number]['id'];

// 用户接口
interface User {
  id: string;
  name: string;
  email: string;
  role: RoleId;
  additionalPermissions: AssignablePermissionId[]; // 按需分配的额外权限
  createdAt: string;
  status: 'active' | 'inactive';
}

// 角色权限说明
const rolePermissionDescriptions: Record<RoleId, string[]> = {
  admin: [
    '所有页面的完整访问权限',
    '用户管理：创建、编辑、删除用户',
    '系统设置：所有配置项的修改权限',
    '流程中心：所有配置的修改权限',
    '任务结果：调整和审核权限',
    '所有按需分配权限默认开启',
  ],
  interpreter: [
    '所有页面的查看权限',
    '任务结果：可进行调整和审核',
    '报告：可生成和审核报告',
    '流程中心：仅查看，不可修改',
  ],
  bioinformatics: [
    '所有页面的查看权限',
    '流程中心：可修改配置',
    '任务结果：仅查看，不可调整和审核',
    '任务投递权限默认开启',
  ],
};

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'admin',
    additionalPermissions: [],
    createdAt: '2024-01-01 09:00:00',
    status: 'active',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    role: 'interpreter',
    additionalPermissions: ['task_submit', 'data_upload'],
    createdAt: '2024-02-15 10:30:00',
    status: 'active',
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    role: 'bioinformatics',
    additionalPermissions: ['data_upload', 'data_download'],
    createdAt: '2024-03-20 14:15:00',
    status: 'active',
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    role: 'interpreter',
    additionalPermissions: [],
    createdAt: '2024-04-10 08:45:00',
    status: 'inactive',
  },
  {
    id: '5',
    name: '钱七',
    email: 'qianqi@example.com',
    role: 'bioinformatics',
    additionalPermissions: ['report_generate'],
    createdAt: '2024-05-05 16:20:00',
    status: 'active',
  },
];

export function PermissionsManagement() {
  const [users, setUsers] = React.useState<User[]>(mockUsers);

  return (
    <div className="space-y-6">
      {/* 权限规则说明 */}
      <div className="bg-canvas-subtle rounded-lg p-4 border border-border">
        <h3 className="text-sm font-medium text-fg-default mb-3">权限规则说明</h3>
        <div className="space-y-2 text-xs text-fg-muted">
          <p><strong className="text-fg-default">基础权限：</strong>所有角色都可以查看所有页面</p>
          <p><strong className="text-fg-default">解读工程师：</strong>可对任务结果进行调整和审核</p>
          <p><strong className="text-fg-default">生信工程师：</strong>可对流程中心中的配置进行修改</p>
          <p><strong className="text-fg-default">按需分配：</strong>任务投递、数据上传等权限可单独授予给用户</p>
        </div>
      </div>

      {/* 角色说明卡片 */}
      <div className="grid grid-cols-3 gap-4">
        {ROLES.map((role) => (
          <div key={role.id} className="bg-canvas-default rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-accent-fg" />
              <h4 className="text-sm font-medium text-fg-default">{role.name}</h4>
            </div>
            <p className="text-xs text-fg-muted mb-3">{role.description}</p>
            <div className="space-y-1">
              {rolePermissionDescriptions[role.id].map((desc, idx) => (
                <div key={idx} className="text-xs text-fg-muted flex items-start gap-1">
                  <span className="text-success-fg mt-0.5">•</span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 用户管理 */}
      <UserManagement users={users} setUsers={setUsers} />
    </div>
  );
}

// 用户管理组件
interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

function UserManagement({ users, setUsers }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const [userForm, setUserForm] = React.useState({
    name: '',
    email: '',
    role: 'interpreter' as RoleId,
    additionalPermissions: [] as AssignablePermissionId[],
    password: '',
  });

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        ROLES.find(r => r.id === user.role)?.name.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      role: 'interpreter',
      additionalPermissions: [],
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      additionalPermissions: [...user.additionalPermissions],
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email || !userForm.role) {
      alert('请填写必填项');
      return;
    }
    if (!editingUser && !userForm.password) {
      alert('请设置初始密码');
      return;
    }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: userForm.name,
                email: userForm.email,
                role: userForm.role,
                additionalPermissions: userForm.additionalPermissions,
              }
            : u
        )
      );
    } else {
      const newUser: User = {
        id: String(Date.now()),
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        additionalPermissions: userForm.additionalPermissions,
        createdAt: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).replace(/\//g, '-'),
        status: 'active',
      };
      setUsers((prev) => [...prev, newUser]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handlePermissionToggle = (permissionId: AssignablePermissionId) => {
    setUserForm((prev) => ({
      ...prev,
      additionalPermissions: prev.additionalPermissions.includes(permissionId)
        ? prev.additionalPermissions.filter((p) => p !== permissionId)
        : [...prev.additionalPermissions, permissionId],
    }));
  };

  const getRoleName = (roleId: RoleId) => {
    return ROLES.find((r) => r.id === roleId)?.name || roleId;
  };

  const columns: Column<User>[] = [
    { id: 'name', header: '姓名', accessor: 'name', width: 100, align: 'center' },
    { id: 'email', header: '邮箱', accessor: 'email', width: 180, align: 'center' },
    {
      id: 'role',
      header: '角色',
      accessor: (row) => {
        const roleConfig = ROLES.find(r => r.id === row.role);
        const variant = row.role === 'admin' ? 'warning' : row.role === 'interpreter' ? 'success' : 'info';
        return <Tag variant={variant}>{roleConfig?.name || row.role}</Tag>;
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
      width: 180,
      align: 'center',
    },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => (
        <Tag variant={row.status === 'active' ? 'success' : 'neutral'}>
          {row.status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
      width: 80,
      align: 'center',
    },
    {
      id: 'createdAt',
      header: '创建时间',
      accessor: 'createdAt',
      width: 160,
      align: 'center',
    },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-1">
          <button
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
            title="编辑"
            onClick={() => handleEditUser(row)}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors"
            title="删除"
            onClick={() => handleDeleteClick(row)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: 80,
      align: 'center',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-64">
          <Input
            placeholder="搜索用户..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleAddUser}>
          新增用户
        </Button>
      </div>

      <DataTable data={filteredUsers} columns={columns} rowKey="id" density="default" striped />

      {/* 新增/编辑用户弹窗 */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen} size="medium">
        <ModalHeader>{editingUser ? '编辑用户' : '新增用户'}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <FormItem label="姓名" required>
              <Input
                value={userForm.name}
                onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="请输入姓名"
              />
            </FormItem>
            <FormItem label="邮箱" required>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="请输入邮箱"
              />
            </FormItem>
            <FormItem label="角色" required hint="角色决定了用户的基础权限范围">
              <Select
                options={ROLES.map((r) => ({ value: r.id, label: r.name }))}
                value={userForm.role}
                onChange={(value) => setUserForm((prev) => ({ ...prev, role: value as RoleId }))}
                placeholder="请选择角色"
              />
            </FormItem>

            {/* 按需分配权限 */}
            {userForm.role !== 'admin' && (
              <FormItem label="附加权限" hint="任务投递、数据上传等按需分配的权限">
                <div className="grid grid-cols-2 gap-2">
                  {ASSIGNABLE_PERMISSIONS.map((permission) => (
                    <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={userForm.additionalPermissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                      />
                      <span className="text-sm text-fg-default">{permission.name}</span>
                    </label>
                  ))}
                </div>
              </FormItem>
            )}

            {/* 管理员自动拥有所有权限 */}
            {userForm.role === 'admin' && (
              <div className="bg-canvas-subtle rounded-md p-3 text-xs text-fg-muted">
                <p>管理员自动拥有所有权限，无需额外配置附加权限</p>
              </div>
            )}

            {!editingUser && (
              <FormItem label="初始密码" required>
                <Input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="请设置初始密码"
                />
              </FormItem>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSaveUser}>
            {editingUser ? '保存' : '创建'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} size="small">
        <ModalHeader>确认删除</ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-danger-subtle flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-danger-fg" />
            </div>
            <p className="text-fg-default mb-2">确定要删除此用户吗？</p>
            {userToDelete && (
              <p className="text-sm text-fg-muted">
                {userToDelete.name} ({getRoleName(userToDelete.role)})
              </p>
            )}
            <p className="text-xs text-fg-muted mt-3">此操作不可撤销</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            删除
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}