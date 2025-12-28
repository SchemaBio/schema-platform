'use client';

import * as React from 'react';
import { Button, Input, Select, FormItem, Modal, ModalHeader, ModalBody, ModalFooter, DataTable, Tag, Checkbox } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Plus, Pencil, Trash2, Search, Users, Shield } from 'lucide-react';

// 页面/功能权限定义
export const PERMISSIONS = [
  { id: 'samples_view', name: '样本管理-查看', module: '样本管理' },
  { id: 'samples_create', name: '样本管理-新建', module: '样本管理' },
  { id: 'samples_edit', name: '样本管理-编辑', module: '样本管理' },
  { id: 'samples_delete', name: '样本管理-删除', module: '样本管理' },
  { id: 'data_view', name: '数据管理-查看', module: '数据管理' },
  { id: 'data_import', name: '数据管理-导入', module: '数据管理' },
  { id: 'data_export', name: '数据管理-导出', module: '数据管理' },
  { id: 'data_delete', name: '数据管理-删除', module: '数据管理' },
  { id: 'analysis_view', name: '分析中心-查看', module: '分析中心' },
  { id: 'analysis_create', name: '分析中心-新建任务', module: '分析中心' },
  { id: 'analysis_interpret', name: '分析中心-变异解读', module: '分析中心' },
  { id: 'analysis_report', name: '分析中心-生成报告', module: '分析中心' },
  { id: 'analysis_review', name: '分析中心-报告审核', module: '分析中心' },
  { id: 'settings_view', name: '系统设置-查看', module: '系统设置' },
  { id: 'settings_permissions', name: '系统设置-权限管理', module: '系统设置' },
] as const;

export type PermissionId = typeof PERMISSIONS[number]['id'];

// 分组接口
interface Group {
  id: string;
  name: string;
  description: string;
  permissions: PermissionId[];
  createdAt: string;
  isSystem?: boolean; // 系统预设分组不可删除
}

// 用户接口
interface User {
  id: string;
  name: string;
  email: string;
  groupId: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

// 预设分组
const defaultGroups: Group[] = [
  {
    id: 'admin',
    name: '管理员',
    description: '拥有所有权限',
    permissions: PERMISSIONS.map(p => p.id),
    createdAt: '2024-01-01',
    isSystem: true,
  },
  {
    id: 'lab_technician',
    name: '实验员',
    description: '负责样本管理',
    permissions: ['samples_view', 'samples_create', 'samples_edit', 'data_view'],
    createdAt: '2024-01-01',
    isSystem: true,
  },
  {
    id: 'bioinformatics',
    name: '生信工程师',
    description: '负责数据处理和分析',
    permissions: ['samples_view', 'data_view', 'data_import', 'data_export', 'analysis_view', 'analysis_create'],
    createdAt: '2024-01-01',
    isSystem: true,
  },
  {
    id: 'interpreter',
    name: '解读工程师',
    description: '负责变异解读',
    permissions: ['samples_view', 'data_view', 'analysis_view', 'analysis_interpret', 'analysis_report'],
    createdAt: '2024-01-01',
    isSystem: true,
  },
  {
    id: 'reviewer',
    name: '报告审核',
    description: '负责报告审核',
    permissions: ['samples_view', 'data_view', 'analysis_view', 'analysis_review'],
    createdAt: '2024-01-01',
    isSystem: true,
  },
];

// 模拟用户数据
const mockUsers: User[] = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', groupId: 'admin', createdAt: '2024-01-01', status: 'active' },
  { id: '2', name: '李四', email: 'lisi@example.com', groupId: 'lab_technician', createdAt: '2024-02-15', status: 'active' },
  { id: '3', name: '王五', email: 'wangwu@example.com', groupId: 'bioinformatics', createdAt: '2024-03-20', status: 'active' },
  { id: '4', name: '赵六', email: 'zhaoliu@example.com', groupId: 'interpreter', createdAt: '2024-04-10', status: 'inactive' },
  { id: '5', name: '钱七', email: 'qianqi@example.com', groupId: 'reviewer', createdAt: '2024-05-05', status: 'active' },
];

type TabType = 'groups' | 'users';

export function PermissionsManagement() {
  const [activeTab, setActiveTab] = React.useState<TabType>('groups');
  const [groups, setGroups] = React.useState<Group[]>(defaultGroups);
  const [users, setUsers] = React.useState<User[]>(mockUsers);

  return (
    <div className="space-y-4">
      {/* Tab 切换 */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('groups')}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium
            border-b-2 -mb-px transition-colors
            ${activeTab === 'groups'
              ? 'border-accent-emphasis text-accent-fg'
              : 'border-transparent text-fg-muted hover:text-fg-default'
            }
          `}
        >
          <Shield className="w-4 h-4" />
          分组管理
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium
            border-b-2 -mb-px transition-colors
            ${activeTab === 'users'
              ? 'border-accent-emphasis text-accent-fg'
              : 'border-transparent text-fg-muted hover:text-fg-default'
            }
          `}
        >
          <Users className="w-4 h-4" />
          用户管理
        </button>
      </div>

      {activeTab === 'groups' && (
        <GroupManagement groups={groups} setGroups={setGroups} />
      )}
      {activeTab === 'users' && (
        <UserManagement users={users} setUsers={setUsers} groups={groups} />
      )}
    </div>
  );
}

// 分组管理组件
interface GroupManagementProps {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
}

function GroupManagement({ groups, setGroups }: GroupManagementProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [editingGroup, setEditingGroup] = React.useState<Group | null>(null);
  const [groupToDelete, setGroupToDelete] = React.useState<Group | null>(null);
  const [groupForm, setGroupForm] = React.useState({
    name: '',
    description: '',
    permissions: [] as PermissionId[],
  });

  const handleAddGroup = () => {
    setEditingGroup(null);
    setGroupForm({ name: '', description: '', permissions: [] });
    setIsModalOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description,
      permissions: [...group.permissions],
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (group: Group) => {
    setGroupToDelete(group);
    setIsDeleteModalOpen(true);
  };

  const handleSaveGroup = () => {
    if (!groupForm.name) {
      alert('请填写分组名称');
      return;
    }

    if (editingGroup) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === editingGroup.id
            ? { ...g, name: groupForm.name, description: groupForm.description, permissions: groupForm.permissions }
            : g
        )
      );
    } else {
      const newGroup: Group = {
        id: String(Date.now()),
        name: groupForm.name,
        description: groupForm.description,
        permissions: groupForm.permissions,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setGroups((prev) => [...prev, newGroup]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteGroup = () => {
    if (groupToDelete) {
      setGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
      setIsDeleteModalOpen(false);
      setGroupToDelete(null);
    }
  };

  const handlePermissionToggle = (permissionId: PermissionId) => {
    setGroupForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleModuleToggle = (module: string) => {
    const modulePermissions = PERMISSIONS.filter((p) => p.module === module).map((p) => p.id);
    const allSelected = modulePermissions.every((p) => groupForm.permissions.includes(p));

    setGroupForm((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !modulePermissions.includes(p))
        : Array.from(new Set([...prev.permissions, ...modulePermissions])),
    }));
  };

  // 按模块分组权限
  const permissionsByModule = React.useMemo(() => {
    const modules: Record<string, typeof PERMISSIONS[number][]> = {};
    PERMISSIONS.forEach((p) => {
      if (!modules[p.module]) modules[p.module] = [];
      modules[p.module].push(p);
    });
    return modules;
  }, []);

  const columns: Column<Group>[] = [
    { id: 'name', header: '分组名称', accessor: 'name', width: 120 },
    { id: 'description', header: '描述', accessor: 'description', width: 200 },
    {
      id: 'permissions',
      header: '权限数量',
      accessor: (row) => (
        <Tag variant="info">{row.permissions.length} 项权限</Tag>
      ),
      width: 100,
    },
    {
      id: 'isSystem',
      header: '类型',
      accessor: (row) => (
        <Tag variant={row.isSystem ? 'warning' : 'neutral'}>
          {row.isSystem ? '系统预设' : '自定义'}
        </Tag>
      ),
      width: 100,
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
              handleEditGroup(row);
            }}
            aria-label="编辑"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          {!row.isSystem && (
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
          )}
        </div>
      ),
      width: 100,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">管理用户分组及其权限配置</p>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleAddGroup}>
          新增分组
        </Button>
      </div>

      <DataTable data={groups} columns={columns} rowKey="id" density="default" striped />

      {/* 新增/编辑分组弹窗 */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen} size="large">
        <ModalHeader>{editingGroup ? '编辑分组' : '新增分组'}</ModalHeader>
        <ModalBody className="max-h-[70vh]">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormItem label="分组名称" required>
                <Input
                  value={groupForm.name}
                  onChange={(e) => setGroupForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入分组名称"
                  disabled={editingGroup?.isSystem}
                />
              </FormItem>
              <FormItem label="描述">
                <Input
                  value={groupForm.description}
                  onChange={(e) => setGroupForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="请输入分组描述"
                />
              </FormItem>
            </div>

            {/* 权限勾选表 */}
            <div>
              <h4 className="text-sm font-medium text-fg-default mb-3">权限配置</h4>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-canvas-subtle">
                      <th className="px-4 py-2 text-left text-sm font-medium text-fg-default border-b border-border w-40">
                        功能模块
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-fg-default border-b border-border">
                        权限项
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(permissionsByModule).map(([module, permissions]) => {
                      const modulePermissionIds = permissions.map((p) => p.id);
                      const allSelected = modulePermissionIds.every((p) => groupForm.permissions.includes(p));
                      const someSelected = modulePermissionIds.some((p) => groupForm.permissions.includes(p));

                      return (
                        <tr key={module} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3 align-top">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected && !allSelected}
                                onChange={() => handleModuleToggle(module)}
                              />
                              <span className="text-sm font-medium text-fg-default">{module}</span>
                            </label>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                              {permissions.map((permission) => (
                                <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                                  <Checkbox
                                    checked={groupForm.permissions.includes(permission.id)}
                                    onChange={() => handlePermissionToggle(permission.id)}
                                  />
                                  <span className="text-sm text-fg-default">
                                    {permission.name.split('-')[1]}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSaveGroup}>
            {editingGroup ? '保存' : '创建'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} size="small">
        <ModalHeader>确认删除</ModalHeader>
        <ModalBody>
          <p>确定要删除分组 <strong>{groupToDelete?.name}</strong> 吗？此操作不可撤销。</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDeleteGroup}>
            删除
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// 用户管理组件
interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  groups: Group[];
}

function UserManagement({ users, setUsers, groups }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const [userForm, setUserForm] = React.useState({
    name: '',
    email: '',
    groupId: '',
    password: '',
  });

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', groupId: groups[0]?.id || '', password: '' });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, groupId: user.groupId, password: '' });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email || !userForm.groupId) {
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
            ? { ...u, name: userForm.name, email: userForm.email, groupId: userForm.groupId }
            : u
        )
      );
    } else {
      const newUser: User = {
        id: String(Date.now()),
        name: userForm.name,
        email: userForm.email,
        groupId: userForm.groupId,
        createdAt: new Date().toISOString().split('T')[0],
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

  const getGroupName = (groupId: string) => {
    return groups.find((g) => g.id === groupId)?.name || groupId;
  };

  const columns: Column<User>[] = [
    { id: 'name', header: '姓名', accessor: 'name', width: 120 },
    { id: 'email', header: '邮箱', accessor: 'email', width: 200 },
    {
      id: 'group',
      header: '所属分组',
      accessor: (row) => <Tag variant="info">{getGroupName(row.groupId)}</Tag>,
      width: 120,
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
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen} size="small">
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
            <FormItem label="所属分组" required>
              <Select
                options={groups.map((g) => ({ value: g.id, label: g.name }))}
                value={userForm.groupId}
                onChange={(value) => setUserForm((prev) => ({ ...prev, groupId: value as string }))}
                placeholder="请选择分组"
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
