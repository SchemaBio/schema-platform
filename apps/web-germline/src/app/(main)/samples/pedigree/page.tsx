'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Plus, List, X, UserPlus, GitBranch, Trash2, Pencil, Save, Download, Upload } from 'lucide-react';
import { PedigreeTree, MemberDetailPanel, AddMemberModal, LinkSampleModal, NewPedigreeModal, EditPedigreeModal, ConfirmDialog, EditMemberModal, ContextMenu } from './components';
import type { ContextMenuItem } from './components';
import type { NewPedigreeFormData } from './components/NewPedigreeModal';
import type { EditPedigreeFormData } from './components/EditPedigreeModal';
import { mockPedigreeList, getPedigreeDetail, generatePedigreeUUID, generateMemberUUID } from './mock-data';
import type { PedigreeListItem, Pedigree, PedigreeMember, RelationType } from './types';

interface OpenTab {
  id: string;
  pedigreeId: string;
  name: string;  // 显示名称（使用 internalId）
}

// 格式化日期工具函数
function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export default function PedigreePage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [openTabs, setOpenTabs] = React.useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null);

  // 当前查看的家系详情
  const [currentPedigree, setCurrentPedigree] = React.useState<Pedigree | null>(null);
  const [loading, setLoading] = React.useState(false);

  // 选中的成员
  const [selectedMember, setSelectedMember] = React.useState<PedigreeMember | null>(null);

  // 添加成员弹窗
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);

  // 编辑模式
  const [isEditMode, setIsEditMode] = React.useState(false);

  // 关联样本弹窗
  const [isLinkSampleOpen, setIsLinkSampleOpen] = React.useState(false);
  const [linkingMemberId, setLinkingMemberId] = React.useState<string | null>(null);

  // 新建家系弹窗
  const [isNewPedigreeOpen, setIsNewPedigreeOpen] = React.useState(false);

  // 编辑家系弹窗
  const [isEditPedigreeOpen, setIsEditPedigreeOpen] = React.useState(false);
  const [editingPedigree, setEditingPedigree] = React.useState<PedigreeListItem | null>(null);

  // 删除家系确认弹窗
  const [isDeletePedigreeOpen, setIsDeletePedigreeOpen] = React.useState(false);
  const [deletingPedigreeId, setDeletingPedigreeId] = React.useState<string | null>(null);

  // 删除成员确认弹窗
  const [isDeleteMemberOpen, setIsDeleteMemberOpen] = React.useState(false);
  const [deletingMemberId, setDeletingMemberId] = React.useState<string | null>(null);

  // 编辑成员弹窗
  const [isEditMemberOpen, setIsEditMemberOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<PedigreeMember | null>(null);

  // 上下文菜单
  const [contextMenu, setContextMenu] = React.useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    member: PedigreeMember | null;
  }>({ isOpen: false, position: { x: 0, y: 0 }, member: null });

  // 添加成员预填充提示
  const [addMemberHint, setAddMemberHint] = React.useState<{
    defaultFatherId?: string;
    defaultMotherId?: string;
    defaultRelation?: RelationType;
    defaultSpouseId?: string;
  } | null>(null);

  // 防止重复打开家系
  const processedPedigreeId = React.useRef<string | null>(null);

  // 处理 URL 参数，自动打开对应家系或关闭所有标签
  React.useEffect(() => {
    const pedigreeId = searchParams.get('id');
    const reset = searchParams.get('reset');

    // 如果有 reset 参数，关闭所有标签返回列表视图
    if (reset === '1') {
      setOpenTabs([]);
      setActiveTabId(null);
      setCurrentPedigree(null);
      setSelectedMember(null);
      processedPedigreeId.current = null;
      return;
    }

    // 否则处理打开家系
    if (pedigreeId && pedigreeId !== processedPedigreeId.current) {
      processedPedigreeId.current = pedigreeId;
      const pedigree = mockPedigreeList.find(p => p.id === pedigreeId);
      if (pedigree) {
        handleOpenTabById(pedigreeId, pedigree.internalId);
      }
    }
  }, [searchParams]);

  // 通过 ID 打开家系标签
  const handleOpenTabById = async (pedigreeId: string, name: string) => {
    const existingTab = openTabs.find(t => t.pedigreeId === pedigreeId);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      setLoading(true);
      const detail = await getPedigreeDetail(pedigreeId);
      setCurrentPedigree(detail);
      setLoading(false);
      return;
    }

    const newTab: OpenTab = {
      id: `tab-${Date.now()}`,
      pedigreeId,
      name,
    };
    setOpenTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);

    setLoading(true);
    const detail = await getPedigreeDetail(pedigreeId);
    setCurrentPedigree(detail);
    setLoading(false);
    setSelectedMember(null);
  };

  // 打开家系详情标签
  const handleOpenTab = React.useCallback(async (pedigree: PedigreeListItem) => {
    const existingTab = openTabs.find(t => t.pedigreeId === pedigree.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      // 加载详情
      setLoading(true);
      const detail = await getPedigreeDetail(pedigree.id);
      setCurrentPedigree(detail);
      setLoading(false);
      return;
    }

    const newTab: OpenTab = {
      id: `tab-${Date.now()}`,
      pedigreeId: pedigree.id,
      name: pedigree.internalId,
    };
    setOpenTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    
    // 加载详情
    setLoading(true);
    const detail = await getPedigreeDetail(pedigree.id);
    setCurrentPedigree(detail);
    setLoading(false);
    setSelectedMember(null);
  }, [openTabs]);

  // 切换标签
  const handleSwitchTab = React.useCallback(async (tabId: string) => {
    setActiveTabId(tabId);
    const tab = openTabs.find(t => t.id === tabId);
    if (tab) {
      setLoading(true);
      const detail = await getPedigreeDetail(tab.pedigreeId);
      setCurrentPedigree(detail);
      setLoading(false);
      setSelectedMember(null);
    }
  }, [openTabs]);

  // 关闭标签
  const handleCloseTab = React.useCallback((tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1];
        setActiveTabId(lastTab.id);
        getPedigreeDetail(lastTab.pedigreeId).then(setCurrentPedigree);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
        setCurrentPedigree(null);
      }
      return newTabs;
    });
    setSelectedMember(null);
  }, [activeTabId]);

  // 添加成员
  const handleAddMember = (memberData: Omit<PedigreeMember, 'id' | 'generation' | 'position'>) => {
    if (!currentPedigree) return;

    const newMemberId = `M${Date.now()}`;

    // 计算 generation
    let generation = 0;
    if (memberData.fatherId || memberData.motherId) {
      const parentGen = Math.max(
        memberData.fatherId ? (currentPedigree.members.find(m => m.id === memberData.fatherId)?.generation ?? 0) : -Infinity,
        memberData.motherId ? (currentPedigree.members.find(m => m.id === memberData.motherId)?.generation ?? 0) : -Infinity
      );
      generation = parentGen + 1;
    }

    const newMember: PedigreeMember = {
      ...memberData,
      id: newMemberId,
      generation,
      position: currentPedigree.members.filter(m => m.generation === generation).length,
    };

    setCurrentPedigree(prev => {
      if (!prev) return null;

      let updatedMembers = [...prev.members, newMember];

      // 处理配偶双向关联
      if (memberData.spouseIds && memberData.spouseIds.length > 0) {
        updatedMembers = updatedMembers.map(m => {
          if (memberData.spouseIds!.includes(m.id)) {
            return { ...m, spouseIds: [...(m.spouseIds || []), newMemberId] };
          }
          return m;
        });
      }

      return {
        ...prev,
        members: updatedMembers,
      };
    });

    // 清除预填充提示
    setAddMemberHint(null);
  };

  // 打开关联样本弹窗
  const handleOpenLinkSample = (memberId: string) => {
    setLinkingMemberId(memberId);
    setIsLinkSampleOpen(true);
  };

  // 关联样本到成员
  const handleLinkSample = (sampleId: string) => {
    if (!currentPedigree || !linkingMemberId) return;

    setCurrentPedigree(prev => prev ? {
      ...prev,
      members: prev.members.map(m =>
        m.id === linkingMemberId ? { ...m, sampleId } : m
      ),
    } : null);

    // 更新选中成员
    if (selectedMember?.id === linkingMemberId) {
      setSelectedMember(prev => prev ? { ...prev, sampleId } : null);
    }

    setLinkingMemberId(null);
  };

  // 创建新家系
  const handleCreatePedigree = async (data: NewPedigreeFormData) => {
    const newPedigreeId = generatePedigreeUUID();
    const newMemberId = generateMemberUUID();

    // 从样本列表获取先证者样本信息
    const { mockSamples } = await import('../mock-data');
    const probandSample = mockSamples.find((s: { id: string }) => s.id === data.probandSampleId);

    if (!probandSample) {
      console.error('未找到先证者样本');
      return;
    }

    const now = new Date();
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const newPedigree: Pedigree = {
      id: newPedigreeId,
      internalId: data.internalId,
      probandId: newMemberId,
      probandSampleId: data.probandSampleId,
      clinicalDiagnosis: data.clinicalDiagnosis || undefined,
      batch: data.batch || undefined,
      remark: data.remark || undefined,
      createdAt: formatDate(now),
      updatedAt: formatDate(now),
      members: [
        {
          id: newMemberId,
          sampleId: data.probandSampleId,
          name: '先证者',
          gender: probandSample.gender,
          relation: 'proband',
          affectedStatus: 'affected',
          generation: 0,
          position: 0,
        },
      ],
    };

    // 打开新创建的家系
    const newTab: OpenTab = {
      id: `tab-${Date.now()}`,
      pedigreeId: newPedigreeId,
      name: data.internalId,
    };
    setOpenTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setCurrentPedigree(newPedigree);
    setSelectedMember(null);
    setIsEditMode(true); // 自动进入编辑模式

    console.log('创建新家系:', newPedigree);
  };

  // 打开编辑家系弹窗
  const handleOpenEditPedigree = (pedigree: PedigreeListItem) => {
    setEditingPedigree(pedigree);
    setIsEditPedigreeOpen(true);
  };

  // 编辑家系
  const handleEditPedigree = async (id: string, data: EditPedigreeFormData) => {
    // 1. 更新 currentPedigree（如果匹配）
    if (currentPedigree?.id === id) {
      setCurrentPedigree(prev => prev ? {
        ...prev,
        internalId: data.internalId,
        clinicalDiagnosis: data.clinicalDiagnosis || undefined,
        batch: data.batch || undefined,
        remark: data.remark || undefined,
        updatedAt: formatDate(new Date()),
      } : null);
    }

    // 2. 更新 tab 名称（如果 internalId 变化）
    setOpenTabs(prev => prev.map(tab =>
      tab.pedigreeId === id ? { ...tab, name: data.internalId } : tab
    ));

    // 3. 更新 mockPedigreeList（实际项目中应调用 API）
    const listIndex = mockPedigreeList.findIndex(p => p.id === id);
    if (listIndex !== -1) {
      mockPedigreeList[listIndex] = {
        ...mockPedigreeList[listIndex],
        internalId: data.internalId,
        clinicalDiagnosis: data.clinicalDiagnosis || undefined,
        batch: data.batch || undefined,
        remark: data.remark || undefined,
        updatedAt: formatDate(new Date()),
      };
    }

    // 关闭弹窗
    setIsEditPedigreeOpen(false);
    setEditingPedigree(null);
  };

  // 删除家系
  const handleDeletePedigree = () => {
    if (!deletingPedigreeId) return;

    // 关闭相关标签页
    const tabToClose = openTabs.find(t => t.pedigreeId === deletingPedigreeId);
    if (tabToClose) {
      handleCloseTab(tabToClose.id);
    }

    // 从列表中移除（实际项目中应调用 API）
    console.log('删除家系:', deletingPedigreeId);

    setIsDeletePedigreeOpen(false);
    setDeletingPedigreeId(null);
  };

  // 打开删除家系确认弹窗
  const handleOpenDeletePedigree = (pedigreeId: string) => {
    setDeletingPedigreeId(pedigreeId);
    setIsDeletePedigreeOpen(true);
  };

  // 删除成员（含孤儿引用清理）
  const handleConfirmDeleteMember = () => {
    if (!currentPedigree || !deletingMemberId) return;

    // 检查是否为先证者
    const memberToDelete = currentPedigree.members.find(m => m.id === deletingMemberId);
    if (memberToDelete?.relation === 'proband') {
      alert('无法删除先证者');
      setIsDeleteMemberOpen(false);
      setDeletingMemberId(null);
      return;
    }

    setCurrentPedigree(prev => {
      if (!prev) return null;

      const updatedMembers = prev.members
        // 移除该成员
        .filter(m => m.id !== deletingMemberId)
        // 清理孤儿引用：移除 fatherId/motherId/spouseIds 中对该成员的引用
        .map(m => ({
          ...m,
          fatherId: m.fatherId === deletingMemberId ? undefined : m.fatherId,
          motherId: m.motherId === deletingMemberId ? undefined : m.motherId,
          spouseIds: m.spouseIds?.filter(id => id !== deletingMemberId),
        }));

      return {
        ...prev,
        members: updatedMembers,
      };
    });

    // 如果删除的是当前选中的成员，清除选中状态
    if (selectedMember?.id === deletingMemberId) {
      setSelectedMember(null);
    }

    setIsDeleteMemberOpen(false);
    setDeletingMemberId(null);
  };

  // 编辑成员
  const handleEditMember = (memberId: string, updates: Partial<PedigreeMember>) => {
    if (!currentPedigree) return;

    setCurrentPedigree(prev => {
      if (!prev) return null;
      const oldMember = prev.members.find(m => m.id === memberId);

      let updatedMembers = prev.members.map(m =>
        m.id === memberId ? { ...m, ...updates } : m
      );

      // 处理配偶双向同步
      if (updates.spouseIds && oldMember) {
        const removedSpouses = (oldMember.spouseIds || []).filter(
          id => !(updates.spouseIds || []).includes(id)
        );
        const addedSpouses = (updates.spouseIds || []).filter(
          id => !(oldMember.spouseIds || []).includes(id)
        );

        updatedMembers = updatedMembers.map(m => {
          if (removedSpouses.includes(m.id)) {
            return { ...m, spouseIds: (m.spouseIds || []).filter(id => id !== memberId) };
          }
          if (addedSpouses.includes(m.id)) {
            return { ...m, spouseIds: [...(m.spouseIds || []), memberId] };
          }
          return m;
        });
      }

      return { ...prev, members: updatedMembers, updatedAt: formatDate(new Date()) };
    });

    // 同步选中成员
    if (selectedMember?.id === memberId) {
      setSelectedMember(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  // 上下文菜单处理
  const handleContextMenu = (member: PedigreeMember, position: { x: number; y: number }) => {
    setContextMenu({ isOpen: true, position, member });
    setSelectedMember(member);
  };

  // 双击编辑
  const handleDoubleClick = (member: PedigreeMember) => {
    if (!isEditMode) return;
    setEditingMember(member);
    setIsEditMemberOpen(true);
  };

  // 设为先证者
  const handleSetProband = (memberId: string) => {
    if (!currentPedigree) return;
    setCurrentPedigree(prev => prev ? {
      ...prev,
      probandId: memberId,
      members: prev.members.map(m => {
        if (m.id === memberId) return { ...m, relation: 'proband' as RelationType };
        if (m.id === prev.probandId) return { ...m, relation: 'other' as RelationType };
        return m;
      }),
    } : null);
  };

  // 上下文菜单项
  const contextMenuItems: ContextMenuItem[] = React.useMemo(() => {
    if (!contextMenu.member || !isEditMode) return [];
    const member = contextMenu.member;
    return [
      {
        label: '编辑成员',
        icon: <Pencil className="w-4 h-4" />,
        onClick: () => {
          setEditingMember(member);
          setIsEditMemberOpen(true);
        },
      },
      { separator: true },
      {
        label: '添加子女',
        icon: <UserPlus className="w-4 h-4" />,
        onClick: () => {
          setAddMemberHint({
            defaultFatherId: member.gender === 'male' ? member.id : member.spouseIds?.[0],
            defaultMotherId: member.gender === 'female' ? member.id : member.spouseIds?.[0],
            defaultRelation: 'child' as RelationType,
          });
          setIsAddMemberOpen(true);
        },
      },
      {
        label: '添加兄弟姐妹',
        icon: <UserPlus className="w-4 h-4" />,
        onClick: () => {
          setAddMemberHint({
            defaultFatherId: member.fatherId,
            defaultMotherId: member.motherId,
            defaultRelation: 'sibling' as RelationType,
          });
          setIsAddMemberOpen(true);
        },
      },
      {
        label: '添加配偶',
        icon: <UserPlus className="w-4 h-4" />,
        onClick: () => {
          setAddMemberHint({
            defaultRelation: 'spouse' as RelationType,
            defaultSpouseId: member.id,
          });
          setIsAddMemberOpen(true);
        },
      },
      { separator: true },
      {
        label: '设为先证者',
        icon: <GitBranch className="w-4 h-4" />,
        onClick: () => handleSetProband(member.id),
        disabled: member.id === currentPedigree?.probandId,
      },
      { separator: true },
      {
        label: '删除成员',
        icon: <Trash2 className="w-4 h-4" />,
        onClick: () => {
          setDeletingMemberId(member.id);
          setIsDeleteMemberOpen(true);
        },
        danger: true,
        disabled: member.relation === 'proband',
      },
    ];
  }, [contextMenu.member, isEditMode, currentPedigree]);

  // 筛选家系
  const filteredPedigrees = React.useMemo(() => {
    if (!searchQuery) return mockPedigreeList;
    const query = searchQuery.toLowerCase();
    return mockPedigreeList.filter(
      (p) => p.id.toLowerCase().includes(query) ||
             p.internalId.toLowerCase().includes(query) ||
             p.sampleInternalIds.some(id => id.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // 下载模板
  const handleDownloadTemplate = () => {
    const templateContent = `家系内部编号,批次,样本内部编号1,样本内部编号2,样本内部编号3,临床诊断,备注
FAM-001,BATCH-2024-001,INT-001,INT-002,,遗传性心肌病待查,家系备注
FAM-002,BATCH-2024-002,INT-003,,,智力发育迟缓,`;
    const blob = new Blob(['\ufeff' + templateContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '家系导入模板.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 表格列定义
  const columns: Column<PedigreeListItem>[] = [
    {
      id: 'id',
      header: '家系编号',
      accessor: (row) => (
        <span
          className="font-mono text-sm text-accent-fg hover:underline cursor-pointer"
          onClick={(e) => { e.stopPropagation(); handleOpenTab(row); }}
        >
          {row.id.substring(0, 8)}
        </span>
      ),
      width: 100,
      align: 'center',
    },
    {
      id: 'internalId',
      header: '内部编号',
      accessor: 'internalId',
      width: 90,
      align: 'center',
    },
    {
      id: 'batch',
      header: '批次',
      accessor: (row) => row.batch || '-',
      width: 120,
      align: 'center',
    },
    {
      id: 'sampleIds',
      header: '样本编号',
      accessor: (row) => (
        <div className="text-sm space-y-0.5">
          {row.sampleIds.length > 0 ? (
            row.sampleIds.map((id, index) => (
              <div
                key={id}
                className={`font-mono text-xs ${id === row.probandSampleId ? 'text-blue-600 font-semibold' : 'text-fg-default'}`}
              >
                {id.substring(0, 8)}
              </div>
            ))
          ) : (
            <span className="text-fg-muted">-</span>
          )}
        </div>
      ),
      width: 120,
      align: 'center',
    },
    {
      id: 'sampleInternalIds',
      header: '样本内部编号',
      accessor: (row) => (
        <div className="text-sm space-y-0.5">
          {row.sampleInternalIds.length > 0 ? (
            row.sampleInternalIds.map((id, index) => (
              <div
                key={id}
                className={`text-xs ${row.sampleIds[index] === row.probandSampleId ? 'text-blue-600 font-semibold' : 'text-fg-default'}`}
              >
                {id}
              </div>
            ))
          ) : (
            <span className="text-fg-muted">-</span>
          )}
        </div>
      ),
      width: 100,
      align: 'center',
    },
    {
      id: 'clinicalDiagnosis',
      header: '临床诊断',
      accessor: (row) => row.clinicalDiagnosis || '-',
      width: 140,
    },
    {
      id: 'remark',
      header: '备注',
      accessor: (row) => (
        <span className={row.remark ? 'text-fg-default truncate block max-w-[100px]' : 'text-fg-muted'}>
          {row.remark || '-'}
        </span>
      ),
      width: 100,
    },
    { id: 'updatedAt', header: '更新时间', accessor: 'updatedAt', width: 150 },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            className="p-1.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            onClick={() => handleOpenEditPedigree(row)}
            aria-label="编辑"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            onClick={() => handleOpenDeletePedigree(row.id)}
            aria-label="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: 70,
      align: 'center',
    },
  ];

  const activeTab = openTabs.find(t => t.id === activeTabId);
  const hasOpenTabs = openTabs.length > 0;

  return (
    <div className="flex h-full">
      {/* 左侧家系列表 */}
      {hasOpenTabs ? (
        <div className="w-56 flex-shrink-0 border-r border-border-default bg-canvas-subtle flex flex-col">
            <div className="px-3 py-2 border-b border-border-default flex items-center gap-2">
              <List className="w-4 h-4 text-fg-muted" />
              <span className="text-sm font-medium text-fg-default">家系列表</span>
            </div>
            <div className="p-2 border-b border-border-default">
              <Input placeholder="搜索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftElement={<Search className="w-3.5 h-3.5" />} className="text-xs" />
            </div>
            <div className="flex-1 overflow-auto">
              {filteredPedigrees.map((pedigree) => {
                const isOpen = openTabs.some(t => t.pedigreeId === pedigree.id);
                const isActive = activeTab?.pedigreeId === pedigree.id;
                return (
                  <div key={pedigree.id} onClick={() => handleOpenTab(pedigree)} className={`px-3 py-2 cursor-pointer border-b border-border-muted transition-colors ${isActive ? 'bg-accent-subtle border-l-2 border-l-accent-emphasis' : isOpen ? 'bg-canvas-inset' : 'hover:bg-canvas-inset'}`}>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-3 h-3 text-fg-muted" />
                      <span className={`font-mono text-sm ${isActive ? 'text-accent-fg font-medium' : 'text-fg-default'}`}>{pedigree.id.substring(0, 8)}</span>
                    </div>
                    <div className="text-xs text-fg-muted ml-5 truncate">{pedigree.internalId} · {pedigree.sampleIds.length}样本</div>
                  </div>
                );
              })}
            </div>
          </div>
      ) : (
        <div className="flex-1">
          <div className="p-6 h-full overflow-auto">
            <h2 className="text-lg font-medium text-fg-default mb-4">家系管理</h2>
            <div className="flex items-center justify-between mb-4">
              <div className="w-64">
                <Input placeholder="搜索家系编号、内部编号、样本..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftElement={<Search className="w-4 h-4" />} />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />} onClick={handleDownloadTemplate}>下载模板</Button>
                <Button variant="secondary" leftIcon={<Upload className="w-4 h-4" />}>批量导入</Button>
                <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewPedigreeOpen(true)}>新建家系</Button>
              </div>
            </div>
            <DataTable data={filteredPedigrees} columns={columns} rowKey="id" striped density="compact" />
          </div>
        </div>
      )}

      {/* 中间家系树区域 */}
      {hasOpenTabs && (
        <div className="flex-1 flex flex-col min-w-0">
          {/* 标签栏 */}
          <div className="flex items-center border-b border-border-default bg-canvas-subtle flex-shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-auto">
            {openTabs.map((tab) => (
              <div key={tab.id} onClick={() => handleSwitchTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-border-muted text-sm whitespace-nowrap transition-colors ${activeTabId === tab.id ? 'bg-canvas-default text-fg-default border-b-2 border-b-accent-emphasis -mb-px' : 'text-fg-muted hover:bg-canvas-inset hover:text-fg-default'}`}>
                <span>{tab.name}</span>
                <button onClick={(e) => handleCloseTab(tab.id, e)} className="p-0.5 rounded hover:bg-canvas-inset" aria-label="关闭标签">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* 工具栏 */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border-default bg-canvas-subtle">
            <div className="flex items-center gap-2">
              {currentPedigree && (
                <>
                  <span className="text-sm text-fg-default font-medium">{currentPedigree.internalId}</span>
                  {currentPedigree.clinicalDiagnosis && (
                    <Tag variant="info">{currentPedigree.clinicalDiagnosis}</Tag>
                  )}
                  <span className="text-xs text-fg-muted">{currentPedigree.members.length} 位成员</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Button variant="secondary" size="small" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setIsAddMemberOpen(true)}>
                    添加成员
                  </Button>
                  <Button variant="primary" size="small" leftIcon={<Save className="w-4 h-4" />} onClick={() => setIsEditMode(false)}>
                    完成编辑
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="small" leftIcon={<Pencil className="w-4 h-4" />} onClick={() => setIsEditMode(true)}>
                  编辑
                </Button>
              )}
            </div>
          </div>

          {/* 家系树 */}
          <div className="flex-1 overflow-hidden relative">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
              </div>
            ) : currentPedigree ? (
              <PedigreeTree
                members={currentPedigree.members}
                probandId={currentPedigree.probandId}
                selectedMemberId={selectedMember?.id}
                isEditMode={isEditMode}
                onSelectMember={setSelectedMember}
                onContextMenu={handleContextMenu}
                onDoubleClick={handleDoubleClick}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-fg-muted">
                选择一个家系查看详情
              </div>
            )}
          </div>
        </div>
      )}

      {/* 右侧成员详情面板 */}
      {selectedMember && (
        <MemberDetailPanel
          member={selectedMember}
          isEditMode={isEditMode}
          onClose={() => setSelectedMember(null)}
          onEditMember={(member) => {
            setEditingMember(member);
            setIsEditMemberOpen(true);
          }}
          onLinkSample={handleOpenLinkSample}
          onRemoveMember={(memberId) => {
            setDeletingMemberId(memberId);
            setIsDeleteMemberOpen(true);
          }}
        />
      )}

      {/* 添加成员弹窗 */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false);
          setAddMemberHint(null);
        }}
        onSubmit={handleAddMember}
        existingMembers={currentPedigree?.members || []}
        defaultFatherId={addMemberHint?.defaultFatherId}
        defaultMotherId={addMemberHint?.defaultMotherId}
        defaultRelation={addMemberHint?.defaultRelation}
        defaultSpouseId={addMemberHint?.defaultSpouseId}
      />

      {/* 关联样本弹窗 */}
      <LinkSampleModal
        isOpen={isLinkSampleOpen}
        onClose={() => {
          setIsLinkSampleOpen(false);
          setLinkingMemberId(null);
        }}
        onSelect={handleLinkSample}
        memberName={currentPedigree?.members.find(m => m.id === linkingMemberId)?.name || ''}
      />

      {/* 新建家系弹窗 */}
      <NewPedigreeModal
        isOpen={isNewPedigreeOpen}
        onClose={() => setIsNewPedigreeOpen(false)}
        onSubmit={handleCreatePedigree}
      />

      {/* 编辑家系弹窗 */}
      <EditPedigreeModal
        isOpen={isEditPedigreeOpen}
        onClose={() => {
          setIsEditPedigreeOpen(false);
          setEditingPedigree(null);
        }}
        onSubmit={handleEditPedigree}
        pedigree={editingPedigree}
      />

      {/* 删除家系确认弹窗 */}
      <ConfirmDialog
        isOpen={isDeletePedigreeOpen}
        onClose={() => {
          setIsDeletePedigreeOpen(false);
          setDeletingPedigreeId(null);
        }}
        onConfirm={handleDeletePedigree}
        title="删除家系"
        message={`确定要删除家系 ${deletingPedigreeId ? mockPedigreeList.find(p => p.id === deletingPedigreeId)?.internalId || deletingPedigreeId.substring(0, 8) : ''} 吗？此操作不可撤销。`}
        confirmLabel="删除"
        confirmVariant="danger"
      />

      {/* 删除成员确认弹窗 */}
      <ConfirmDialog
        isOpen={isDeleteMemberOpen}
        onClose={() => {
          setIsDeleteMemberOpen(false);
          setDeletingMemberId(null);
        }}
        onConfirm={handleConfirmDeleteMember}
        title="删除成员"
        message={`确定要删除成员 ${currentPedigree?.members.find(m => m.id === deletingMemberId)?.name || ''} 吗？此操作将同时清理相关的家庭关系引用。`}
        confirmLabel="删除"
        confirmVariant="danger"
      />

      {/* 编辑成员弹窗 */}
      <EditMemberModal
        isOpen={isEditMemberOpen}
        onClose={() => {
          setIsEditMemberOpen(false);
          setEditingMember(null);
        }}
        onSubmit={handleEditMember}
        member={editingMember}
        existingMembers={currentPedigree?.members || []}
      />

      {/* 上下文菜单 */}
      <ContextMenu
        isOpen={contextMenu.isOpen && isEditMode}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        position={contextMenu.position}
        items={contextMenuItems}
      />
    </div>
  );
}
