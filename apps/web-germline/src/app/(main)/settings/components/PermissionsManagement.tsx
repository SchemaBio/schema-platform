'use client';

import * as React from 'react';
import { Button, Input, Select, FormItem, Modal, ModalHeader, ModalBody, ModalFooter, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

// 预设角色
export const ROLES = [
  { value: 'admin', label: '管理员' },
  { value: 'lab_technician', label: '实验员' },
  { value: 'bioinformatics_engineer', label: '生信工程师' },
  { value: 'interpretation_engineer', label: '解读工程师' },
  { value: 'report_reviewer', label: '报告审核' },
] as const;

export type RoleValue = typeof ROLES[number]['value'];

// 角色对应的可操作页面
export const ROLE_PERMISSIONS: Record<RoleValue, string[]> = {
  admin: ['samples', 'data', 'analysis', 'settings', 'permissions'],
  lab_technician: ['samples'],
  bioinformatics_engineer: ['data', 'analysis'],
  interpretation_engineer: ['analysis'],
  report_reviewer: ['analysis'],
};

// 角色标签颜色
const ROLE_COLORS: Record<RoleValue, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
  admin: 'danger',
  lab_technician: 'info',
  bioinformatics_engineer: 'success',
  interpretation_engineer: 'warning',
  report_reviewer: 'neutral',
};

interface User {
  id: string;
  name: string;
  email: string;
  role: RoleValue;
  createdAt: string;
  status: 'active' | 'inactive';
}

// 模拟用户数据
const mockUsers: User[] = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', role: 'admin', createdAt: '2024-01-01', status: 'active' },
  { id: '2', name: '李四', email: 'lisi@example.com', role: 'lab_technician', createdAt: '2024-02-15', status: 'active' },
  { id: '3', name: '王五', email: 'wangwu@example.com', role: 'bioinformatics_engineer', createdAt: '2024-03-20', status: 'active' },
  { id: '4', name: '赵六', email: 'zhaoliu@example.com', role: 'interpretation_engineer', createdAt: '2024-04-10', status: 'inactive' },
  { id: '5', name: '钱七', email: 'qianqi@example.com', role: 'report_reviewer', createdAt: '2024-05-05', status: 'active' },
];

export function PermissionsManagement() {
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isUserModalOpen, setIsUserModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const [userForm, setUserForm] = React.useState({
    name: '',
    email: '',
    role: 'lab_technician' as RoleValue,
    password: '',
  });

  // 过滤用户
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // 打开新增用户弹窗
  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', role: 'lab_technician', password: '' });
    setIsUserModalOpen(true);
  };

  // 打开编辑用户弹窗
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, role: user.role, password: '' });
    setIsUserModalOpen(true);
  };

  // 打开删除确认弹窗
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // 保存用户
  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email) {
      alert('请填写必填项');
      return;
    }
    if (!editingUser && !userForm.password) {
      alert('请设置初始密码');
      return;
    }

    if (editingUser) {
      // 编辑用户
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, name: userForm.name, email: userForm.email, role: userForm.role }
            : u
        )
      );
    } else {
      // 新增用户
      const newUser: User = {
        id: String(Date.now()),
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active',
      };
      setUsers((prev) => [...prev, newUser]);
    }

    setIsUserModalOpen(false);
  };

  // 删除用户
  const handleDeleteUser = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  // 表格列定义
  const columns: Column<User>[] = [
    { id: 'name', header: '姓名', accessor: 'name', width: 120 },
    { id: 'email', header: '邮箱', accessor: 'email', width: 200 },
    {
      id: 'role',
      header: '角色',
      accessor: (row) => {
        const roleLabel = ROLES.find((r) => r.value === row.role)?.label || row.role;
        return <Tag variant={ROLE_COLORS[row.role]}>{roleLabel}</Tag>;
      },
      width: 120,
    },
    {
      id: 'permissions',
      header: '可操作页面',
      accessor: (row) => {
        const permissions = ROLE_PERMISSIONS[row.role];
        const pageNames: Record<string, string> = {
          samples: '样本管理',
          data: '数据管理',
          analysis: '分析中心',
          settings: '系统设置',
          permissions: '权限管理',
        };
        return (
          <span className="text-fg-muted text-xs">
            {permissions.map((p) => pageNames[p] || p).join('、')}
          </span>
        );
      },
      width: 250,
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
    },
    { id: 'createdAt', header: '创建时间', accessor: 'createdAt', width: 120 },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="small"
            iconOnly
            onClick={(e) => {
              e.stopPropagation();
              handleEditUser(row);
            }}
            aria-label="编辑"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="small"
            iconOnly
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            aria-label="删除"
          >
            <Trash2 className="w-4 h-4 text-danger-fg" />
          </Button>
        </div>
      ),
      width: 100,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
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

      {/* 角色说明 */}
      <div className="p-4 bg-canvas-subtle rounded-lg border border-border">
        <h4 className="text-sm font-medium text-fg-default mb-2">角色权限说明</h4>
        <p className="text-xs text-fg-muted mb-2">所有角色都可以查看所有页面，但只能操作对应权限的页面：</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {ROLES.map((role) => (
            <div key={role.value} className="text-xs">
              <Tag variant={ROLE_COLORS[role.value]} className="mb-1">{role.label}</Tag>
              <p className="text-fg-muted">
                {ROLE_PERMISSIONS[role.value].map((p) => {
                  const names: Record<string, string> = {
                    samples: '样本',
                    data: '数据',
                    analysis: '分析',
                    settings: '设置',
                    permissions: '权限',
                  };
                  return names[p] || p;
                }).join('、')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 用户列表 */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        rowKey="id"
        density="default"
        striped
      />

      {/* 新增/编辑用户弹窗 */}
      <Modal open={isUserModalOpen} onOpenChange={setIsUserModalOpen} size="small">
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
            <FormItem label="角色" required>
              <Select
                options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
                value={userForm.role}
                onChange={(value) => setUserForm((prev) => ({ ...prev, role: value as RoleValue }))}
                placeholder="请选择角色"
              />
            </FormItem>
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
          <Button variant="secondary" onClick={() => setIsUserModalOpen(false)}>
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
          <p>确定要删除用户 <strong>{userToDelete?.name}</strong> 吗？此操作不可撤销。</p>
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
